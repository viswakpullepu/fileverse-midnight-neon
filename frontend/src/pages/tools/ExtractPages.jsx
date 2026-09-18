import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function ExtractPages() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [pageInput, setPageInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedPdfUrl, setExtractedPdfUrl] = useState(null);

  // Hydrate staged file
  useEffect(() => {
    const stagedFile = sharedFile || location.state?.autoLoadedFile;
    if (stagedFile) {
      setFile(stagedFile);
      setExtractedPdfUrl(null);
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

  const extractPages = async () => {
    if (!file || !pageInput) return;
    setIsExtracting(true);
    
    try {
      // Parse input like "1,3,5-7"
      const pagesToExtract = new Set();
      const parts = pageInput.split(',').map(p => p.trim());
      
      for (const part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(Number);
          if (!isNaN(start) && !isNaN(end) && start <= end) {
            for (let i = start; i <= end; i++) {
              pagesToExtract.add(i - 1); // 0-indexed
            }
          }
        } else {
          const pageNum = Number(part);
          if (!isNaN(pageNum)) {
            pagesToExtract.add(pageNum - 1);
          }
        }
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();
      
      const validPages = Array.from(pagesToExtract)
        .filter(p => p >= 0 && p < totalPages)
        .sort((a, b) => a - b);

      if (validPages.length === 0) {
        alert("No valid pages selected.");
        setIsExtracting(false);
        return;
      }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, validPages);
      
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setExtractedPdfUrl(url);
    } catch (error) {
      console.error('Error extracting pages:', error);
      alert('Failed to extract pages.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Extract Pages</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Extract specific pages from your PDF file. Processed locally in your browser.
      </p>

      {!extractedPdfUrl ? (
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
                Pages to Extract (e.g., 1,3,5-7):
              </label>
              <input 
                type="text" 
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder="1, 3, 5-7"
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1.5rem' }}
              />
              
              <button 
                className="btn" 
                onClick={extractPages}
                disabled={isExtracting || !pageInput}
                style={{ width: '100%' }}
              >
                {isExtracting ? 'Extracting...' : 'Extract Pages'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '3rem', border: '1px solid #e0e0e0', borderRadius: '12px', marginTop: '2rem', textAlign: 'center' }}>
          <h2>Extraction Successful!</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <a 
              href={extractedPdfUrl} 
              download={`extracted_${file.name}`} 
              className="btn"
            >
              Download PDF
            </a>
            <button 
              className="btn" 
              style={{ backgroundColor: '#666' }}
              onClick={() => {
                setExtractedPdfUrl(null);
                setFile(null);
                setPageInput('');
              }}
            >
              Extract More
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
