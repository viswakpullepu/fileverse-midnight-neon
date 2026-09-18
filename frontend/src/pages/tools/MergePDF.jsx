import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Link } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function MergePDF() {
  const { sharedFile } = useFileContext();
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);

  useEffect(() => {
    if (sharedFile && (sharedFile.name?.toLowerCase().endsWith('.pdf') || sharedFile.type === 'application/pdf')) {
      setFiles([sharedFile]);
    }
  }, [sharedFile]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const mergePdfs = async () => {
    if (files.length < 2) return;
    setIsMerging(true);
    
    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Failed to merge PDFs. Please try again.');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="tool-page">
      <h1>Merge PDF</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Combine PDFs in the order you want. This happens entirely locally in your browser!
      </p>

      {!mergedPdfUrl ? (
        <>
          <div 
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload').click()}
          >
            <p>Select PDF files</p>
            <span style={{ fontSize: '0.9rem', color: '#888', display: 'block', marginTop: '1rem' }}>
              or drop PDFs here
            </span>
            <input 
              id="file-upload" 
              type="file" 
              multiple 
              accept=".pdf" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </div>

          {files.length > 0 && (
            <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h3>Files to merge ({files.length}):</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {files.map((file, index) => (
                  <li key={index} style={{ 
                    padding: '0.5rem', 
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{file.name}</span>
                    <button 
                      onClick={() => removeFile(index)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'red', 
                        cursor: 'pointer' 
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              
              <button 
                className="btn" 
                onClick={mergePdfs}
                disabled={files.length < 2 || isMerging}
                style={{ width: '100%', marginTop: '1rem', opacity: files.length < 2 ? 0.6 : 1, cursor: files.length < 2 ? 'not-allowed' : 'pointer' }}
              >
                {isMerging ? 'Merging...' : 'Merge PDFs'}
              </button>
              {files.length === 1 && (
                <p style={{ color: '#d97706', fontSize: '0.88rem', marginTop: '0.75rem', fontWeight: 600, textAlign: 'center' }}>
                  ⚠️ Please add at least one more PDF file to enable merging.
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '3rem', border: '1px solid #e0e0e0', borderRadius: '12px', marginTop: '2rem' }}>
          <h2>PDFs Merged Successfully!</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <a 
              href={mergedPdfUrl} 
              download="merged.pdf" 
              className="btn"
            >
              Download Merged PDF
            </a>
            <button 
              className="btn" 
              style={{ backgroundColor: '#666' }}
              onClick={() => {
                setMergedPdfUrl(null);
                setFiles([]);
              }}
            >
              Merge More
            </button>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '2rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
