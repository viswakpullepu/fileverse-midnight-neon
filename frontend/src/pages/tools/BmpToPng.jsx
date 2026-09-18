import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function BmpToPng() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const canvasRef = useRef(null);

  // Hydrate staged file
  useEffect(() => {
    const stagedFile = sharedFile || location.state?.autoLoadedFile;
    if (stagedFile) {
      setFile(stagedFile);
      setProcessedImageUrl(null);
      clearFile();
    }
  }, [sharedFile, location.state, clearFile]);

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

  const convertBmp = () => {
    if (!file) return;
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Export strictly as PNG
        const url = canvas.toDataURL('image/png');
        setProcessedImageUrl(url);
        setIsProcessing(false);
      };
      
      img.onerror = () => {
        alert("Failed to read BMP file. It may be corrupt or an unsupported format.");
        setIsProcessing(false);
      }
      
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>BMP/TGA to PNG</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Convert old uncompressed Bitmap files into lightweight, transparent PNGs inside your browser.
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
            <p style={{ fontSize: '1.5rem' }}>{file ? file.name : 'Select BMP File'}</p>
            <span style={{ fontSize: '1rem', color: '#888', display: 'block', marginTop: '1rem' }}>
              {file ? 'Click to change file' : 'or drop BMP here'}
            </span>
            <input 
              id="file-upload" 
              type="file" 
              accept=".bmp,image/bmp,.tga" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </div>

          {file && (
            <div style={{ marginTop: '2rem', textAlign: 'left', padding: '2rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <button 
                className="btn" 
                onClick={convertBmp}
                disabled={isProcessing}
                style={{ width: '100%' }}
              >
                {isProcessing ? 'Converting...' : 'Convert to PNG'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '3rem', border: '1px solid #e0e0e0', borderRadius: '12px', marginTop: '2rem', textAlign: 'center' }}>
          <h2>Converted Successfully!</h2>
          
          <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <img 
              src={processedImageUrl} 
              alt="Generated PNG preview" 
              style={{ maxWidth: '100%', maxHeight: '300px', border: '1px solid #ddd', background: '#f5f5f5' }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a 
              href={processedImageUrl} 
              download={`converted_${file.name.split('.')[0]}.png`} 
              className="btn"
            >
              Download PNG
            </a>
            <button 
              className="btn" 
              style={{ backgroundColor: '#666' }}
              onClick={() => {
                setProcessedImageUrl(null);
                setFile(null);
              }}
            >
              Convert Another File
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
