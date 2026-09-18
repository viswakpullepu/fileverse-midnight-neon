import React, { useState, useEffect } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function RotatePDF() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [rotation, setRotation] = useState(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedPdfUrl, setProcessedPdfUrl] = useState(null);

  // Hydrate staged file
  useEffect(() => {
    const stagedFile = sharedFile || location.state?.autoLoadedFile;
    if (stagedFile) {
      setFile(stagedFile);
      setProcessedPdfUrl(null);
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

  const rotatePdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      pages.forEach(page => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotation));
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setProcessedPdfUrl(url);
    } catch (error) {
      console.error('Error rotating PDF:', error);
      alert('Failed to rotate PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Rotate PDF</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!
      </p>

      {!processedPdfUrl ? (
        <>
          <div 
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload').click()}
            style={{ padding: '4rem 2rem', marginTop: '2rem' }}
          >
            <p style={{ fontSize: '1.5rem' }}>{file ? file.name : 'Select PDF file'}</p>
            <span style={{ fontSize: '1rem', color: '#888', display: 'block', marginTop: '1rem' }}>
              {file ? 'Click to change file' : 'or drop PDF here'}
            </span>
            <input 
              id="file-upload" 
              type="file" 
              accept=".pdf" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </div>

          {file && (
            <div style={{ marginTop: '2rem', textAlign: 'left', padding: '2rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Rotation Angle:
              </label>
              <select 
                value={rotation} 
                onChange={(e) => setRotation(Number(e.target.value))}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1.5rem' }}
              >
                <option value={90}>Rotate Right (90°)</option>
                <option value={-90}>Rotate Left (-90°)</option>
                <option value={180}>Upside Down (180°)</option>
              </select>
              
              <button 
                className="btn" 
                onClick={rotatePdf}
                disabled={isProcessing}
                style={{ width: '100%' }}
              >
                {isProcessing ? 'Rotating...' : 'Rotate PDF'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '3rem', border: '1px solid #e0e0e0', borderRadius: '12px', marginTop: '2rem', textAlign: 'center' }}>
          <h2>PDF Rotated Successfully!</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <a 
              href={processedPdfUrl} 
              download={`rotated_${file.name}`} 
              className="btn"
            >
              Download PDF
            </a>
            <button 
              className="btn" 
              style={{ backgroundColor: '#666' }}
              onClick={() => {
                setProcessedPdfUrl(null);
                setFile(null);
              }}
            >
              Rotate Another PDF
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
