import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function ConvertImage() {
  const { sharedFile } = useFileContext();
  const [file, setFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('image/png');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (sharedFile && (sharedFile.type?.startsWith('image/') || /\.(png|jpe?g|webp|svg|bmp|ico|gif)$/i.test(sharedFile.name))) {
      setFile(sharedFile);
    }
  }, [sharedFile]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const convertImage = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = canvasRef.current;
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d', { alpha: targetFormat !== 'image/jpeg', desynchronized: true });
      
      // Fill with white background in case of transparent PNG to JPG
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setProcessedImageUrl(url);
        }
        setIsProcessing(false);
      }, targetFormat, 0.92);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          
          if (targetFormat === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              setProcessedImageUrl(URL.createObjectURL(blob));
            }
            setIsProcessing(false);
          }, targetFormat, 0.92);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const getExtension = (mimeType) => {
    switch(mimeType) {
      case 'image/png': return '.png';
      case 'image/jpeg': return '.jpg';
      case 'image/webp': return '.webp';
      default: return '.png';
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Convert Image</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Instantly convert between JPG, PNG, and WebP natively in your browser. No server uploads required.
      </p>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {!processedImageUrl ? (
        <>
          <div 
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload').click()}
            style={{ padding: '4rem 2rem', marginTop: '2rem' }}
          >
            <p style={{ fontSize: '1.5rem' }}>{file ? file.name : 'Select Image File'}</p>
            <span style={{ fontSize: '1rem', color: '#888', display: 'block', marginTop: '1rem' }}>
              {file ? 'Click to change file' : 'or drop Image here (JPG, PNG, WebP)'}
            </span>
            <input 
              id="file-upload" 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </div>

          {file && (
            <div style={{ marginTop: '2rem', textAlign: 'left', padding: '2rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Convert to:
              </label>
              <select 
                value={targetFormat} 
                onChange={(e) => setTargetFormat(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1.5rem' }}
              >
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPG</option>
                <option value="image/webp">WebP</option>
              </select>
              
              <button 
                className="btn" 
                onClick={convertImage}
                disabled={isProcessing}
                style={{ width: '100%' }}
              >
                {isProcessing ? 'Converting...' : 'Convert Image'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '3rem', border: '1px solid #e0e0e0', borderRadius: '12px', marginTop: '2rem', textAlign: 'center' }}>
          <h2>Image Converted Successfully!</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <a 
              href={processedImageUrl} 
              download={`converted${getExtension(targetFormat)}`} 
              className="btn"
            >
              Download Image
            </a>
            <button 
              className="btn" 
              style={{ backgroundColor: '#666' }}
              onClick={() => {
                setProcessedImageUrl(null);
                setFile(null);
              }}
            >
              Convert Another Image
            </button>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to fileverze Dashboard</Link>
      </div>
    </div>
  );
}
