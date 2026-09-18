import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function ImageToIco() {
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

  // Basic implementation to construct a valid .ico file format holding a 256x256 PNG
  const createIcoFromPngBuffer = (pngBuffer) => {
    const icoHeader = new Uint8Array([
      0, 0, // Reserved
      1, 0, // Type (1 = ICO)
      1, 0  // Image count
    ]);
    
    // Directory entry
    const pngSize = pngBuffer.byteLength;
    const icoDirectory = new Uint8Array([
      0, // Width (0 means 256)
      0, // Height (0 means 256)
      0, // Color count
      0, // Reserved
      1, 0, // Color planes
      32, 0, // Bits per pixel
      pngSize & 0xff, (pngSize >> 8) & 0xff, (pngSize >> 16) & 0xff, (pngSize >> 24) & 0xff, // Size
      22, 0, 0, 0 // Offset (header 6 + directory 16)
    ]);
    
    const icoFile = new Uint8Array(icoHeader.length + icoDirectory.length + pngSize);
    icoFile.set(icoHeader, 0);
    icoFile.set(icoDirectory, icoHeader.length);
    icoFile.set(new Uint8Array(pngBuffer), icoHeader.length + icoDirectory.length);
    
    return icoFile;
  };

  const convertToIco = () => {
    if (!file) return;
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        // Standard high-res ICO size
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Draw image centered and scaled
        const size = Math.min(img.width, img.height);
        const xOffset = (img.width - size) / 2;
        const yOffset = (img.height - size) / 2;
        
        ctx.drawImage(img, xOffset, yOffset, size, size, 0, 0, 256, 256);
        
        // We get the PNG as a blob
        canvas.toBlob(async (blob) => {
          const arrayBuffer = await blob.arrayBuffer();
          const icoBuffer = createIcoFromPngBuffer(arrayBuffer);
          
          const icoBlob = new Blob([icoBuffer], { type: 'image/x-icon' });
          const url = URL.createObjectURL(icoBlob);
          setProcessedImageUrl(url);
          setIsProcessing(false);
        }, 'image/png');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Image to ICO</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Convert images (JPG, PNG, WebP) directly into perfectly sized .ico files for website favicons.
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
              {file ? 'Click to change file' : 'or drop Image here'}
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
              <button 
                className="btn" 
                onClick={convertToIco}
                disabled={isProcessing}
                style={{ width: '100%' }}
              >
                {isProcessing ? 'Converting...' : 'Generate 256x256 ICO'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '3rem', border: '1px solid #e0e0e0', borderRadius: '12px', marginTop: '2rem', textAlign: 'center' }}>
          <h2>ICO File Created!</h2>
          
          <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <div style={{ width: '128px', height: '128px', margin: '0 auto', border: '1px solid #ccc', borderRadius: '8px', padding: '10px', background: '#f5f5f5' }}>
              <img 
                src={processedImageUrl} 
                alt="ICO preview" 
                style={{ maxWidth: '100%', maxHeight: '100%' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a 
              href={processedImageUrl} 
              download={`favicon.ico`} 
              className="btn"
            >
              Download .ICO
            </a>
            <button 
              className="btn" 
              style={{ backgroundColor: '#666' }}
              onClick={() => {
                setProcessedImageUrl(null);
                setFile(null);
              }}
            >
              Convert Another
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
