import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function CompressImage() {
  const { sharedFile } = useFileContext();
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(75); // 10% - 100%
  const [scalePercent, setScalePercent] = useState(100); // 25% - 100%
  const [outputFormat, setOutputFormat] = useState('auto'); // 'auto' | 'image/webp' | 'image/jpeg' | 'image/png'
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [newSize, setNewSize] = useState(0);
  const [previewDimensions, setPreviewDimensions] = useState({ width: 0, height: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const canvasRef = useRef(null);

  useEffect(() => {
    if (sharedFile && sharedFile.type?.startsWith('image/')) {
      handleLoadFile(sharedFile);
    }
  }, [sharedFile]);

  const handleLoadFile = async (selectedFile) => {
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setProcessedImageUrl(null);

    try {
      const bitmap = await createImageBitmap(selectedFile);
      setOriginalDimensions({ width: bitmap.width, height: bitmap.height });
      bitmap.close();
    } catch (e) {
      console.warn('Could not read dimensions:', e);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleLoadFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLoadFile(e.dataTransfer.files[0]);
    }
  };

  const determineTargetMime = () => {
    if (outputFormat !== 'auto') return outputFormat;
    // Auto: If PNG with potential transparency, use modern WebP for best compression with alpha preservation
    if (file?.type === 'image/png') {
      return 'image/webp';
    }
    return 'image/jpeg';
  };

  const compressImage = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const bitmap = await createImageBitmap(file);
      const canvas = canvasRef.current;
      const scale = scalePercent / 100;
      const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
      const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const targetMime = determineTargetMime();
      const hasAlpha = targetMime !== 'image/jpeg';
      const ctx = canvas.getContext('2d', { alpha: hasAlpha, desynchronized: true });

      if (!hasAlpha) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      } else {
        ctx.clearRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
      bitmap.close();

      const qualityDecimal = quality / 100;

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, targetMime, qualityDecimal);
      });

      if (blob) {
        setNewSize(blob.size);
        setPreviewDimensions({ width: targetWidth, height: targetHeight });
        if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);
        const url = URL.createObjectURL(blob);
        setProcessedImageUrl(url);
      }
    } catch (err) {
      console.error('Compression error:', err);
      alert('Failed to compress image: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTargetExtension = () => {
    const mime = determineTargetMime();
    if (mime === 'image/webp') return 'webp';
    if (mime === 'image/png') return 'png';
    return 'jpg';
  };

  return (
    <div className="tool-page" style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1>Smart Image Compressor</h1>
      <p style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '1rem' }}>
        Hardware-accelerated client-side image compression. Reduces file size up to 90% while preserving alpha transparency and sharpness.
      </p>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {!file ? (
        <div 
          className="dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload').click()}
          style={{ padding: '4rem 2rem', marginTop: '2rem', border: '2px dashed #cbd5e1', borderRadius: '16px', background: '#ffffff', cursor: 'pointer', textAlign: 'center' }}
        >
          <p style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1e293b' }}>Select or drop an image file</p>
          <span style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'block', marginTop: '0.75rem' }}>
            Supports JPG, PNG, WEBP, AVIF, and BMP • 100% In-Browser Privacy
          </span>
          <input 
            id="file-upload" 
            type="file" 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* File summary pill */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <div>
              <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{file.name}</strong>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                Original: {formatBytes(originalSize)}
                {originalDimensions.width > 0 && ` • ${originalDimensions.width} × ${originalDimensions.height} px`}
              </div>
            </div>
            <button 
              onClick={() => { setFile(null); setProcessedImageUrl(null); }}
              style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer' }}
            >
              Change File
            </button>
          </div>

          {/* Controls Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {/* Quality Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
                    Compression Quality:
                  </label>
                  <span style={{ fontWeight: 800, color: 'var(--primary, #7c3aed)' }}>{quality}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  step="1"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  <span>Smallest File (10%)</span>
                  <span>Balanced (75%)</span>
                  <span>Lossless-like (100%)</span>
                </div>
              </div>

              {/* Resolution Scale */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
                    Dimension Scaling:
                  </label>
                  <span style={{ fontWeight: 800, color: 'var(--primary, #7c3aed)' }}>{scalePercent}%</span>
                </div>
                <input 
                  type="range" 
                  min="25" 
                  max="100" 
                  step="5"
                  value={scalePercent}
                  onChange={(e) => setScalePercent(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  <span>Quarter (25%)</span>
                  <span>Half (50%)</span>
                  <span>Full Dimensions (100%)</span>
                </div>
              </div>

              {/* Output Format */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                  Output Format:
                </label>
                <select 
                  value={outputFormat} 
                  onChange={(e) => setOutputFormat(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.95rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                >
                  <option value="auto">Auto (Preserves Transparency as WebP)</option>
                  <option value="image/webp">WEBP (Modern, High Compression)</option>
                  <option value="image/jpeg">JPEG (Universal Compatibility)</option>
                  <option value="image/png">PNG (Lossless / Graphic Art)</option>
                </select>
              </div>
            </div>

            <button 
              className="btn" 
              onClick={compressImage}
              disabled={isProcessing}
              style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem', fontSize: '1.05rem', fontWeight: 700 }}
            >
              {isProcessing ? 'Optimizing Image...' : 'Compress Image'}
            </button>
          </div>

          {/* Results Display */}
          {processedImageUrl && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '2rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '1.25rem' }}>Compression Complete!</h2>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', margin: '1rem 0 1.5rem 0' }}>
                <div style={{ padding: '0.85rem 1.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Original Size</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#334155' }}>{formatBytes(originalSize)}</div>
                </div>
                <div style={{ padding: '0.85rem 1.5rem', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#15803d', textTransform: 'uppercase', fontWeight: 600 }}>Compressed Size</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16a34a' }}>{formatBytes(newSize)}</div>
                  <div style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '2px', fontWeight: 600 }}>
                    {newSize < originalSize 
                      ? `${Math.round((1 - (newSize / originalSize)) * 100)}% smaller`
                      : 'Size maintained'}
                  </div>
                </div>
                {previewDimensions.width > 0 && (
                  <div style={{ padding: '0.85rem 1.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Dimensions</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#334155' }}>{previewDimensions.width} × {previewDimensions.height}</div>
                  </div>
                )}
              </div>

              {/* Visual Preview */}
              <div style={{ margin: '1.5rem 0', padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: 600 }}>Visual Quality Preview</div>
                <img 
                  src={processedImageUrl} 
                  alt="Compressed Preview" 
                  style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a 
                  href={processedImageUrl} 
                  download={`compressed_${file.name.substring(0, file.name.lastIndexOf('.')) || file.name}.${getTargetExtension()}`} 
                  className="btn"
                  style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}
                >
                  Download Compressed Image
                </a>
                <button 
                  className="btn" 
                  style={{ backgroundColor: '#64748b', padding: '0.8rem 1.5rem' }}
                  onClick={() => {
                    setProcessedImageUrl(null);
                    setFile(null);
                  }}
                >
                  Compress Another
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary, #7c3aed)', fontWeight: 600, textDecoration: 'none' }}>&larr; Back to fileverze Dashboard</Link>
      </div>
    </div>
  );
}
