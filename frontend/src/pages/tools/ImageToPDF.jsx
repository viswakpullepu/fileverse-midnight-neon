import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function ImageToPDF() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedPdfUrl, setProcessedPdfUrl] = useState(null);

  // Hydrate staged file
  useEffect(() => {
    const stagedFile = sharedFile || location.state?.autoLoadedFile;
    if (stagedFile) {
      setFiles([stagedFile]);
      setProcessedPdfUrl(null);
      clearFile();
    }
  }, [sharedFile, location.state, clearFile]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles([...files, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const convertToPdf = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    
    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        let image;
        
        if (file.type === 'image/jpeg') {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          // Skip unsupported for now, or convert WebP to PNG via canvas first (simplified here)
          continue;
        }

        const { width, height } = image.scale(1);
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setProcessedPdfUrl(url);
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('Failed to create PDF. Please ensure all images are JPG or PNG.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Image to PDF</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Convert JPG and PNG images to a single PDF file. Processed entirely in your browser.
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
            <p style={{ fontSize: '1.5rem' }}>Select Image files</p>
            <span style={{ fontSize: '1rem', color: '#888', display: 'block', marginTop: '1rem' }}>
              or drop images here
            </span>
            <input 
              id="file-upload" 
              type="file" 
              accept="image/jpeg,image/png" 
              multiple
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </div>

          {files.length > 0 && (
            <div style={{ marginTop: '2rem', textAlign: 'left', padding: '2rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <h3>Selected Images ({files.length})</h3>
              <ul style={{ margin: '1rem 0', paddingLeft: '1.5rem' }}>
                {files.map((f, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>
                    {f.name} <button onClick={() => removeFile(i)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px' }}>Remove</button>
                  </li>
                ))}
              </ul>
              
              <button 
                className="btn" 
                onClick={convertToPdf}
                disabled={isProcessing}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {isProcessing ? 'Creating PDF...' : 'Convert to PDF'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '3rem', border: '1px solid #e0e0e0', borderRadius: '12px', marginTop: '2rem', textAlign: 'center' }}>
          <h2>PDF Created Successfully!</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <a 
              href={processedPdfUrl} 
              download="images.pdf" 
              className="btn"
            >
              Download PDF
            </a>
            <button 
              className="btn" 
              style={{ backgroundColor: '#666' }}
              onClick={() => {
                setProcessedPdfUrl(null);
                setFiles([]);
              }}
            >
              Convert More Images
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
