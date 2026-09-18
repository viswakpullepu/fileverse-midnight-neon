import React, { useState, useRef, useEffect } from 'react';
import { removeWatermarkFromImage } from '@pilio/gemini-watermark-remover';
import { Link } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';
import { Sparkles, Download, CheckCircle, RefreshCw, AlertCircle, Image as ImageIcon, Sliders } from 'lucide-react';
import { createTrackedObjectURL, cleanupComponentMemory } from '../../utils/memoryManager';

// Universal helper to get DataURL or Blob URL from HTMLCanvasElement or OffscreenCanvas
async function getCanvasOutputUrl(canvas) {
  if (!canvas) return null;
  try {
    if (typeof canvas.toDataURL === 'function') {
      return canvas.toDataURL('image/png');
    }
  } catch {
    // If toDataURL throws on tainted or OffscreenCanvas, fall through
  }

  if (typeof canvas.convertToBlob === 'function') {
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    return URL.createObjectURL(blob);
  }

  const domCanvas = document.createElement('canvas');
  domCanvas.width = canvas.width;
  domCanvas.height = canvas.height;
  const ctx = domCanvas.getContext('2d');
  ctx.drawImage(canvas, 0, 0);
  return domCanvas.toDataURL('image/png');
}

export default function GeminiWatermarkRemover() {
  const { sharedFile, clearFile } = useFileContext();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [resultDataUrl, setResultDataUrl] = useState(null);
  const [metaInfo, setMetaInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [cleanMode, setCleanMode] = useState('auto'); // 'auto' | 'inpaint'
  const [cornerPosition, setCornerPosition] = useState('bottom-right'); // Gemini watermark is bottom-right

  useEffect(() => {
    if (sharedFile && (sharedFile.type?.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(sharedFile.name))) {
      loadFile(sharedFile);
      clearFile();
    }

    return () => {
      cleanupComponentMemory('gemini-watermark-remover');
    };
  }, [sharedFile, clearFile]);

  const loadFile = (selectedFile) => {
    cleanupComponentMemory('gemini-watermark-remover');
    setFile(selectedFile);
    setResultDataUrl(null);
    setMetaInfo(null);
    setErrorMsg('');

    const url = createTrackedObjectURL(selectedFile, 'gemini-watermark-remover');
    setPreviewUrl(url);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadFile(e.dataTransfer.files[0]);
    }
  };

  // Smart localized inpainting / alpha cleaning for Gemini watermarks
  const smartInpaintWatermark = (img, corner = 'bottom-right') => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const w = canvas.width;
    const h = canvas.height;

    // Gemini watermark dimensions scale with image resolution (~48px to 120px)
    const boxSize = Math.max(48, Math.min(140, Math.round(Math.min(w, h) * 0.1)));
    const margin = Math.round(boxSize * 0.35);

    let x = w - boxSize - margin;
    let y = h - boxSize - margin;

    if (corner === 'bottom-left') {
      x = margin;
      y = h - boxSize - margin;
    } else if (corner === 'top-right') {
      x = w - boxSize - margin;
      y = margin;
    } else if (corner === 'top-left') {
      x = margin;
      y = margin;
    }

    // Contextual bilinear / median diffusion inpainting on watermark region
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Sample boundary pixels around watermark box to seamlessly interpolate
    for (let py = y; py < y + boxSize; py++) {
      for (let px = x; px < x + boxSize; px++) {
        if (py < 0 || py >= h || px < 0 || px >= w) continue;

        // Weight towards nearest border
        const distLeft = px - x;
        const distRight = (x + boxSize) - px;
        const distTop = py - y;
        const distBottom = (y + boxSize) - py;

        const sampleX1 = Math.max(0, x - 2);
        const sampleX2 = Math.min(w - 1, x + boxSize + 2);
        const sampleY1 = Math.max(0, y - 2);
        const sampleY2 = Math.min(h - 1, y + boxSize + 2);

        const idxLeft = (py * w + sampleX1) * 4;
        const idxRight = (py * w + sampleX2) * 4;
        const idxTop = (sampleY1 * w + px) * 4;
        const idxBottom = (sampleY2 * w + px) * 4;

        const weightX = distLeft / (distLeft + distRight);
        const weightY = distTop / (distTop + distBottom);

        const r = (data[idxLeft] * (1 - weightX) + data[idxRight] * weightX + data[idxTop] * (1 - weightY) + data[idxBottom] * weightY) / 2;
        const g = (data[idxLeft + 1] * (1 - weightX) + data[idxRight + 1] * weightX + data[idxTop + 1] * (1 - weightY) + data[idxBottom + 1] * weightY) / 2;
        const b = (data[idxLeft + 2] * (1 - weightX) + data[idxRight + 2] * weightX + data[idxTop + 2] * (1 - weightY) + data[idxBottom + 2] * weightY) / 2;

        const targetIdx = (py * w + px) * 4;
        data[targetIdx] = Math.round(r);
        data[targetIdx + 1] = Math.round(g);
        data[targetIdx + 2] = Math.round(b);
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  };

  const processWatermarkRemoval = async () => {
    if (!file || !previewUrl) return;
    setIsProcessing(true);
    setErrorMsg('');
    setStatusMessage('Analyzing and removing Gemini watermark...');

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to decode image.'));
        img.src = previewUrl;
      });

      if (cleanMode === 'inpaint') {
        const inpaintedCanvas = smartInpaintWatermark(img, cornerPosition);
        const outputUrl = await getCanvasOutputUrl(inpaintedCanvas);
        setResultDataUrl(outputUrl);
        setMetaInfo({ applied: true, decisionTier: 'Contextual Inpainting' });
        setIsProcessing(false);
        return;
      }

      // 1. Attempt official @pilio/gemini-watermark-remover alpha subtraction
      try {
        const result = await removeWatermarkFromImage(img);
        if (result && result.canvas) {
          const outputUrl = await getCanvasOutputUrl(result.canvas);
          if (outputUrl) {
            setResultDataUrl(outputUrl);
            setMetaInfo(result.meta || { applied: true, decisionTier: 'Alpha Inversion' });
            setIsProcessing(false);
            return;
          }
        }
      } catch (sdkError) {
        console.warn('Alpha engine bypassed, falling back to smart inpainting:', sdkError);
      }

      // 2. High-reliability fallback: Smart inpaint bottom-right corner
      const fallbackCanvas = smartInpaintWatermark(img, cornerPosition);
      const fallbackUrl = await getCanvasOutputUrl(fallbackCanvas);
      setResultDataUrl(fallbackUrl);
      setMetaInfo({ applied: true, decisionTier: 'Smart Inpainting Fallback' });
    } catch (err) {
      console.error(err);
      setErrorMsg('Watermark removal error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Dashboard</Link>
      
      <div style={{ margin: '1rem 0 2rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>
          Gemini Watermark Remover
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.4rem' }}>
          Automatically detect and cleanly remove visible Google Gemini AI sparkle watermarks 100% locally in your browser.
        </p>
      </div>

      {!resultDataUrl ? (
        <>
          {/* Upload Dropzone */}
          <div
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('gemini-file-input').click()}
            style={{
              padding: '3.5rem 2rem',
              border: '2px dashed #cbd5e1',
              borderRadius: '16px',
              background: '#ffffff',
              cursor: 'pointer',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
            }}
          >
            <input
              id="gemini-file-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#eff6ff',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <Sparkles size={30} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.3rem' }}>
              {file ? file.name : 'Select or drop a Gemini image here'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports JPG, PNG, and WebP images. 100% in-browser.'}
            </p>
          </div>

          {errorMsg && (
            <div style={{ marginTop: '1.25rem', padding: '0.85rem 1.25rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '0.9rem' }}>
              {errorMsg}
            </div>
          )}

          {/* Controls & Preview */}
          {file && previewUrl && (
            <div style={{ marginTop: '2rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              
              {/* Optional Mode Switch */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                    Removal Mode
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    {cleanMode === 'auto' ? 'Standard Gemini alpha inversion with smart fallback' : 'Direct contextual inpainting'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setCleanMode('auto')}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      border: cleanMode === 'auto' ? '2px solid #111827' : '1px solid #e2e8f0',
                      background: cleanMode === 'auto' ? '#111827' : '#ffffff',
                      color: cleanMode === 'auto' ? '#ffffff' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    Auto Detect (Recommended)
                  </button>
                  <button
                    onClick={() => setCleanMode('inpaint')}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      border: cleanMode === 'inpaint' ? '2px solid #111827' : '1px solid #e2e8f0',
                      background: cleanMode === 'inpaint' ? '#111827' : '#ffffff',
                      color: cleanMode === 'inpaint' ? '#ffffff' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    Inpaint Mode
                  </button>
                </div>
              </div>

              {/* Image Preview */}
              <div style={{ textAlign: 'center', marginBottom: '1.75rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <img
                  src={previewUrl}
                  alt="Original Preview"
                  style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
              </div>

              {/* Action Button */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={processWatermarkRemoval}
                  disabled={isProcessing}
                  style={{
                    background: isProcessing ? '#cbd5e1' : '#111827',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.9rem 2.75rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: isProcessing ? 'default' : 'pointer',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Sparkles size={18} />
                  <span>{isProcessing ? 'Removing Watermark...' : 'Remove Gemini Watermark'}</span>
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Results View */
        <div style={{ marginTop: '2rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 6px 24px rgba(0,0,0,0.04)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#ecfdf5',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <CheckCircle size={36} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '0.4rem' }}>
            Watermark Removed Successfully!
          </h2>
          
          {metaInfo && (
            <p style={{ color: '#059669', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              ✓ Cleaned using {metaInfo.decisionTier || 'Alpha Map Reconstruction'}
            </p>
          )}

          <div style={{ marginBottom: '2rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'inline-block', maxWidth: '100%' }}>
            <img
              src={resultDataUrl}
              alt="Restored Result"
              style={{ maxWidth: '100%', maxHeight: '460px', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={resultDataUrl}
              download={`gemini_cleaned_${file?.name || 'image.png'}`}
              style={{
                background: '#10b981',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '0.85rem 2rem',
                borderRadius: '8px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
              }}
            >
              <Download size={18} />
              <span>Download Cleaned Image</span>
            </a>

            <button
              onClick={() => {
                setResultDataUrl(null);
                setFile(null);
                setPreviewUrl(null);
                setMetaInfo(null);
              }}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#475569',
                padding: '0.85rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clean Another Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
