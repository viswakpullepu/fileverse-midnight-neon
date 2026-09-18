import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function CompressImage() {
  const { sharedFile } = useFileContext();
  const [file, setFile] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState(0.7);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [newSize, setNewSize] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (sharedFile && sharedFile.type?.startsWith('image/')) {
      setFile(sharedFile);
      setOriginalSize(sharedFile.size);
      setProcessedImageUrl(null);
    }
  }, [sharedFile]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setOriginalSize(e.target.files[0].size);
      setProcessedImageUrl(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setOriginalSize(e.dataTransfer.files[0].size);
      setProcessedImageUrl(null);
    }
  };

  const compressImage = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
      // Hardware-accelerated async image decoding (3x-5x faster than Image DOM)
      const bitmap = await createImageBitmap(file);
      const canvas = canvasRef.current;
      const scale = compressionLevel < 0.5 ? 0.8 : 1;
      const targetWidth = Math.round(bitmap.width * scale);
      const targetHeight = Math.round(bitmap.height * scale);

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
      ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
      bitmap.close();

      canvas.toBlob((blob) => {
        if (blob) {
          setNewSize(blob.size);
          const url = URL.createObjectURL(blob);
          setProcessedImageUrl(url);
        }
        setIsProcessing(false);
      }, 'image/jpeg', compressionLevel);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const scale = compressionLevel < 0.5 ? 0.8 : 1;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              setNewSize(blob.size);
              setProcessedImageUrl(URL.createObjectURL(blob));
            }
            setIsProcessing(false);
          }, 'image/jpeg', compressionLevel);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Compress Image</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Reduce image file size instantly while maintaining the best possible quality. Processed locally.
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
              {file ? formatBytes(originalSize) : 'or drop Image here (JPG, PNG)'}
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
                Compression Level:
              </label>
              <select 
                value={compressionLevel} 
                onChange={(e) => setCompressionLevel(Number(e.target.value))}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1.5rem' }}
              >
                <option value={0.9}>Light Compression (Best Quality)</option>
                <option value={0.7}>Recommended Compression (Good Balance)</option>
                <option value={0.4}>Extreme Compression (Smallest Size)</option>
              </select>
              
              <button 
                className="btn" 
                onClick={compressImage}
                disabled={isProcessing}
                style={{ width: '100%' }}
              >
                {isProcessing ? 'Compressing...' : 'Compress Image'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '3rem', border: '1px solid #e0e0e0', borderRadius: '12px', marginTop: '2rem', textAlign: 'center' }}>
          <h2>Image Compressed Successfully!</h2>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '2rem 0' }}>
            <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Original Size</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>{formatBytes(originalSize)}</div>
            </div>
            <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: '8px', border: '1px solid #81c784' }}>
              <div style={{ fontSize: '0.8rem', color: '#2e7d32', textTransform: 'uppercase' }}>New Size</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2e7d32' }}>{formatBytes(newSize)}</div>
              <div style={{ fontSize: '0.8rem', color: '#2e7d32', marginTop: '4px' }}>
                {Math.round((1 - (newSize / originalSize)) * 100)}% smaller
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <a 
              href={processedImageUrl} 
              download={`compressed_${file.name.split('.')[0]}.jpg`} 
              className="btn"
            >
              Download Compressed Image
            </a>
            <button 
              className="btn" 
              style={{ backgroundColor: '#666' }}
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
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to fileverze Dashboard</Link>
      </div>
    </div>
  );
}
