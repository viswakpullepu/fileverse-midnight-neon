import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function RotateImage() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [rotation, setRotation] = useState(0);
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
      setRotation(0);
      
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

  const applyRotation = (angle) => {
    if (!file) return;
    setIsProcessing(true);
    
    // We update the rotation state
    const newRotation = (rotation + angle) % 360;
    setRotation(newRotation);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const img = imgRef.current;
    
    // Swap dimensions if rotated 90 or 270 degrees
    if (Math.abs(newRotation) === 90 || Math.abs(newRotation) === 270) {
      canvas.width = img.height;
      canvas.height = img.width;
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Translate to center, rotate, translate back
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((newRotation * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setProcessedImageUrl(url);
      setIsProcessing(false);
    }, file.type, 1.0);
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Rotate Image</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Fix sideways photos or turn your images upside down instantly, directly in the browser.
      </p>

      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {!file ? (
        <div 
          className="dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload').click()}
          style={{ padding: '4rem 2rem', marginTop: '2rem' }}
        >
          <p style={{ fontSize: '1.5rem' }}>Select Image File</p>
          <span style={{ fontSize: '1rem', color: '#888', display: 'block', marginTop: '1rem' }}>
            or drop Image here (JPG, PNG, WebP)
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
        <div style={{ marginTop: '2rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
            <button 
              className="btn" 
              onClick={() => applyRotation(-90)}
              disabled={isProcessing}
            >
              Rotate Left -90°
            </button>
            <button 
              className="btn" 
              onClick={() => applyRotation(90)}
              disabled={isProcessing}
            >
              Rotate Right +90°
            </button>
          </div>

          <div style={{ 
            maxWidth: '100%', 
            padding: '20px',
            background: '#f8f9fa', 
            border: '1px solid #e2e8f0', 
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px'
          }}>
            <img 
              src={processedImageUrl || imgRef.current.src} 
              alt="Rotated preview" 
              style={{ maxWidth: '100%', maxHeight: '500px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <a 
              href={processedImageUrl || imgRef.current.src} 
              download={`rotated_${file.name}`} 
              className="btn"
              style={{ padding: '0.75rem 2rem' }}
            >
              Download Image
            </a>
            <button 
              className="btn" 
              style={{ backgroundColor: '#666' }}
              onClick={() => {
                setProcessedImageUrl(null);
                setFile(null);
                setRotation(0);
              }}
            >
              Start Over
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
