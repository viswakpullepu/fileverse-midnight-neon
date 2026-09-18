import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';
import { UploadCloud, Image as ImageIcon, Download, Wand2, CheckCircle, Sliders, RefreshCw } from 'lucide-react';

export default function RemoveBackground() {
  const { sharedFile } = useFileContext();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [tolerance, setTolerance] = useState(30);
  const [feather, setFeather] = useState(1);
  const [targetColor, setTargetColor] = useState('#ffffff');
  const [autoDetect, setAutoDetect] = useState(true);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (sharedFile && (sharedFile.type?.startsWith('image/') || /\.(png|jpe?g|webp|bmp|gif)$/i.test(sharedFile.name))) {
      loadFile(sharedFile);
    }
  }, [sharedFile]);

  const loadFile = (selectedFile) => {
    setFile(selectedFile);
    setErrorMsg('');
    setDownloadUrl(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalPreview(e.target.result);
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        processImage(img, tolerance, targetColor, autoDetect);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(selectedFile);
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

  // 100% In-Browser Smart Background Removal Algorithm
  const processImage = (img, tol, customHex, isAuto) => {
    if (!img) return;
    setIsProcessing(true);

    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const width = canvas.width;
      const height = canvas.height;

      // Sample background color (corner averages if auto, else customHex)
      let bgR = 255, bgG = 255, bgB = 255;

      if (isAuto) {
        // Sample 4 corners
        const cornerIndices = [
          0, // top-left
          (width - 1) * 4, // top-right
          ((height - 1) * width) * 4, // bottom-left
          ((height - 1) * width + (width - 1)) * 4 // bottom-right
        ];

        let sumR = 0, sumG = 0, sumB = 0;
        cornerIndices.forEach(idx => {
          sumR += data[idx];
          sumG += data[idx + 1];
          sumB += data[idx + 2];
        });
        bgR = Math.round(sumR / 4);
        bgG = Math.round(sumG / 4);
        bgB = Math.round(sumB / 4);
      } else {
        const hex = customHex.replace('#', '');
        bgR = parseInt(hex.substring(0, 2), 16) || 255;
        bgG = parseInt(hex.substring(2, 4), 16) || 255;
        bgB = parseInt(hex.substring(4, 6), 16) || 255;
      }

      const threshold = (tol / 100) * 441.67; // Max Euclidean distance in RGB is sqrt(255^2*3) = 441.67
      const softEdge = 20;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean color distance from background
        const dist = Math.sqrt(
          (r - bgR) * (r - bgR) +
          (g - bgG) * (g - bgG) +
          (b - bgB) * (b - bgB)
        );

        if (dist <= threshold) {
          data[i + 3] = 0; // Completely transparent
        } else if (dist < threshold + softEdge) {
          // Smooth alpha feathering
          const alphaFactor = (dist - threshold) / softEdge;
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }
      }

      ctx.putImageData(imgData, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setDownloadUrl(url);
        }
        setIsProcessing(false);
      }, 'image/png');
    } catch (err) {
      console.error(err);
      setErrorMsg('Client processing error: ' + err.message);
      setIsProcessing(false);
    }
  };

  const handleSliderChange = (newTolerance) => {
    setTolerance(newTolerance);
    if (imgRef.current) {
      processImage(imgRef.current, newTolerance, targetColor, autoDetect);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Dashboard</Link>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#1e293b' }}>
        Background Remover (100% In-Browser)
      </h1>
      <p style={{ marginTop: '0.5rem', color: '#64748b' }}>
        Remove backgrounds and export transparent PNGs directly in your browser. Fast, private, and offline.
      </p>

      {!file ? (
        <div style={{ marginTop: '2rem' }}>
          <div 
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('bg-input').click()}
            style={{ padding: '4rem 2rem', border: '2px dashed #cbd5e1', borderRadius: '16px', background: '#ffffff', cursor: 'pointer', textAlign: 'center' }}
          >
            <input 
              id="bg-input"
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <ImageIcon size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>
              Select or drop an image here
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Supports PNG, JPG, WEBP, and BMP. Processed locally in memory.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          {/* Controls Bar */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '240px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>
                Tolerance: {tolerance}%
              </label>
              <input
                type="range"
                min="5"
                max="80"
                value={tolerance}
                onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                style={{ flex: 1 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={autoDetect}
                  onChange={(e) => {
                    setAutoDetect(e.target.checked);
                    if (imgRef.current) processImage(imgRef.current, tolerance, targetColor, e.target.checked);
                  }}
                />
                Auto-Detect Background Color
              </label>

              {!autoDetect && (
                <input
                  type="color"
                  value={targetColor}
                  onChange={(e) => {
                    setTargetColor(e.target.value);
                    if (imgRef.current) processImage(imgRef.current, tolerance, e.target.value, false);
                  }}
                  style={{ width: '36px', height: '36px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                />
              )}

              <button
                onClick={() => {
                  setFile(null);
                  setDownloadUrl(null);
                }}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', padding: '0.45rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Change Image
              </button>
            </div>
          </div>

          {/* Dual Image Comparison Preview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Original */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '0.75rem' }}>Original Image</h4>
              {originalPreview && (
                <img 
                  src={originalPreview} 
                  alt="Original" 
                  style={{ maxWidth: '100%', maxHeight: '340px', objectFit: 'contain', borderRadius: '8px' }} 
                />
              )}
            </div>

            {/* Transparent Output */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: '0.75rem' }}>
                Transparent Result (PNG)
              </h4>
              <div style={{
                minHeight: '260px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                borderRadius: '8px',
                padding: '1rem',
                border: '1px solid #f1f5f9'
              }}>
                {downloadUrl && (
                  <img 
                    src={downloadUrl} 
                    alt="Removed Background" 
                    style={{ maxWidth: '100%', maxHeight: '340px', objectFit: 'contain' }} 
                  />
                )}
              </div>

              {downloadUrl && (
                <div style={{ marginTop: '1.25rem' }}>
                  <a 
                    href={downloadUrl} 
                    download={`transparent_${file?.name?.replace(/\.[^/.]+$/, '') || 'image'}.png`}
                    className="btn"
                    style={{ background: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.75rem 2rem', fontWeight: 700 }}
                  >
                    <Download size={18} /> Download Transparent PNG
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
