import React, { useState, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function AddPageNumbers() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [position, setPosition] = useState('bottom-center');
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

  const addPageNumbers = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      
      pages.forEach((page, idx) => {
        const { width, height } = page.getSize();
        const text = `${idx + 1}`;
        const fontSize = 12;
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        
        let x, y;
        
        switch (position) {
          case 'top-left':
            x = 30;
            y = height - 30;
            break;
          case 'top-center':
            x = (width / 2) - (textWidth / 2);
            y = height - 30;
            break;
          case 'top-right':
            x = width - 30 - textWidth;
            y = height - 30;
            break;
          case 'bottom-left':
            x = 30;
            y = 30;
            break;
          case 'bottom-right':
            x = width - 30 - textWidth;
            y = 30;
            break;
          case 'bottom-center':
          default:
            x = (width / 2) - (textWidth / 2);
            y = 30;
            break;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0)
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setProcessedPdfUrl(url);
    } catch (error) {
      console.error('Error adding page numbers:', error);
      alert('Failed to add page numbers.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Add Page Numbers</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Add page numbers into PDFs with ease. Choose your positions and dimensions. Processed locally.
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
                Position:
              </label>
              <select 
                value={position} 
                onChange={(e) => setPosition(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1.5rem' }}
              >
                <option value="top-left">Top Left</option>
                <option value="top-center">Top Center</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
              
              <button 
                className="btn" 
                onClick={addPageNumbers}
                disabled={isProcessing}
                style={{ width: '100%' }}
              >
                {isProcessing ? 'Adding numbers...' : 'Add Page Numbers'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '3rem', border: '1px solid #e0e0e0', borderRadius: '12px', marginTop: '2rem', textAlign: 'center' }}>
          <h2>Page Numbers Added!</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <a 
              href={processedPdfUrl} 
              download={`numbered_${file.name}`} 
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
              Process Another PDF
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
