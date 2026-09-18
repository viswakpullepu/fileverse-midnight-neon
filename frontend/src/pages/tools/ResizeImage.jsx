import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function ResizeImage() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1);
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
        imgRef.current.onload = () => {
          setWidth(imgRef.current.width);
          setHeight(imgRef.current.height);
          setOriginalAspectRatio(imgRef.current.width / imgRef.current.height);
        };
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

  const handleWidthChange = (e) => {
    const newWidth = e.target.value;
    setWidth(newWidth);
    if (maintainRatio && newWidth) {
      setHeight(Math.round(newWidth / originalAspectRatio));
    }
  };

  const handleHeightChange = (e) => {
    const newHeight = e.target.value;
    setHeight(newHeight);
    if (maintainRatio && newHeight) {
      setWidth(Math.round(newHeight * originalAspectRatio));
    }
  };

  const resizeImage = () => {
    if (!file || !width || !height) return;
    setIsProcessing(true);
    
    const canvas = canvasRef.current;
    canvas.width = parseInt(width, 10);
    canvas.height = parseInt(height, 10);
    const ctx = canvas.getContext('2d');
    
    // Smooth scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setProcessedImageUrl(url);
      setIsProcessing(false);
    }, file.type, 0.95); // match original type if possible, or fallback to high-quality jpeg/png depending on browser defaults
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Resize Image</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Change the dimensions of your image instantly in the browser. Perfect for social media requirements.
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
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Width (px):</label>
                  <input 
                    type="number" 
                    value={width}
                    onChange={handleWidthChange}
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Height (px):</label>
                  <input 
                    type="number" 
                    value={height}
                    onChange={handleHeightChange}
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    checked={maintainRatio}
                    onChange={(e) => setMaintainRatio(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Maintain Aspect Ratio</span>
                </label>
              </div>

              <button 
                className="btn" 
                onClick={resizeImage}
                disabled={isProcessing}
                style={{ width: '100%' }}
              >
                {isProcessing ? 'Resizing...' : 'Resize Image'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '3rem', border: '1px solid #e0e0e0', borderRadius: '12px', marginTop: '2rem', textAlign: 'center' }}>
          <h2>Image Resized Successfully!</h2>
          
          <div style={{ margin: '2rem 0' }}>
            <p style={{ color: '#666', marginBottom: '1rem' }}>New Dimensions: {width} x {height} px</p>
            <div style={{ maxWidth: '100%', overflow: 'hidden', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
              <img 
                src={processedImageUrl} 
                alt="Resized preview" 
                style={{ maxWidth: '100%', maxHeight: '400px' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a 
              href={processedImageUrl} 
              download={`resized_${file.name}`} 
              className="btn"
            >
              Download Resized Image
            </a>
            <button 
              className="btn" 
              style={{ backgroundColor: '#666' }}
              onClick={() => {
                setProcessedImageUrl(null);
                setFile(null);
              }}
            >
              Resize Another
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
