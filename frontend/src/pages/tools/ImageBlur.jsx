import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function ImageBlur() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [blurAmount, setBlurAmount] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(new Image());

  // Hydrate staged file
  useEffect(() => {
    const stagedFile = sharedFile || location.state?.autoLoadedFile;
    if (stagedFile) {
      handleFileChange({ target: { files: [stagedFile] } });
      clearFile();
    }
  }, [sharedFile, location.state, clearFile]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setProcessedImageUrl(null);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        imgRef.current.src = event.target.result;
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const applyBlur = () => {
    if (!file) return;
    setIsProcessing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const img = imgRef.current;
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Apply blur using CSS filter equivalent on canvas
    ctx.filter = `blur(${blurAmount}px)`;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // Reset filter
    ctx.filter = 'none';
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setProcessedImageUrl(url);
      setIsProcessing(false);
    }, file.type, 0.95);
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Blur Image</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Obscure sensitive information or add a cinematic blur to your images. 100% local processing.
      </p>

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
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Blur Intensity: {blurAmount}px
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={blurAmount}
                  onChange={(e) => setBlurAmount(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <button 
                className="btn" 
                onClick={applyBlur}
                disabled={isProcessing}
                style={{ width: '100%' }}
              >
                {isProcessing ? 'Applying Blur...' : 'Apply Blur Effect'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '3rem', border: '1px solid #e0e0e0', borderRadius: '12px', marginTop: '2rem', textAlign: 'center' }}>
          <h2>Image Blurred!</h2>
          
          <div style={{ margin: '2rem 0' }}>
            <div style={{ maxWidth: '100%', overflow: 'hidden', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
              <img 
                src={processedImageUrl} 
                alt="Blurred preview" 
                style={{ maxWidth: '100%', maxHeight: '400px' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a 
              href={processedImageUrl} 
              download={`blurred_${file.name}`} 
              className="btn"
            >
              Download Blurred Image
            </a>
            <button 
              className="btn" 
              style={{ backgroundColor: '#666' }}
              onClick={() => {
                setProcessedImageUrl(null);
                setFile(null);
              }}
            >
              Blur Another
            </button>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
