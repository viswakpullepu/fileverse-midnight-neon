import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Link } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function SplitPDF() {
  const { sharedFile } = useFileContext();
  const [file, setFile] = useState(null);
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitFiles, setSplitFiles] = useState([]);

  useEffect(() => {
    if (sharedFile && (sharedFile.name?.toLowerCase().endsWith('.pdf') || sharedFile.type === 'application/pdf')) {
      setFile(sharedFile);
    }
  }, [sharedFile]);

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

  const splitPdf = async () => {
    if (!file) return;
    setIsSplitting(true);
    setSplitFiles([]);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const numberOfPages = pdfDoc.getPageCount();
      
      const newFiles = [];

      for (let i = 0; i < numberOfPages; i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        newFiles.push({
          name: `${file.name.replace('.pdf', '')}_page_${i + 1}.pdf`,
          url
        });
      }

      setSplitFiles(newFiles);
    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('Failed to split PDF.');
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Split PDF</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Separate one page or a whole set for easy conversion into independent PDF files. Processed locally.
      </p>

      {!file ? (
        <div 
          className="dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload').click()}
          style={{ padding: '6rem 2rem', marginTop: '2rem' }}
        >
          <p style={{ fontSize: '1.5rem' }}>Select PDF file</p>
          <span style={{ fontSize: '1rem', color: '#888', display: 'block', marginTop: '1rem' }}>
            or drop PDF here
          </span>
          <input 
            id="file-upload" 
            type="file" 
            accept=".pdf" 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div style={{ padding: '3rem', border: '1px solid #e0e0e0', borderRadius: '12px', marginTop: '2rem' }}>
          {splitFiles.length === 0 ? (
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ marginBottom: '1rem' }}>Ready to Split</h2>
              <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px', marginBottom: '2rem' }}>
                <strong>Selected File:</strong> {file.name}
              </div>
              <button 
                className="btn" 
                onClick={splitPdf}
                disabled={isSplitting}
                style={{ width: '100%', padding: '1rem', fontSize: '1.2rem' }}
              >
                {isSplitting ? 'Splitting into individual pages...' : 'Split PDF'}
              </button>
            </div>
          ) : (
            <div>
              <h2>PDF Split Successfully!</h2>
              <p style={{ marginBottom: '2rem' }}>Your PDF was split into {splitFiles.length} individual pages.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {splitFiles.map((sf, idx) => (
                  <div key={idx} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', marginBottom: '1rem', wordBreak: 'break-all' }}>{sf.name}</p>
                    <a href={sf.url} download={sf.name} className="btn" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                      Download
                    </a>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '3rem' }}>
                <button 
                  className="btn" 
                  style={{ backgroundColor: '#666' }}
                  onClick={() => {
                    setSplitFiles([]);
                    setFile(null);
                  }}
                >
                  Split another PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to fileverze Dashboard</Link>
      </div>
    </div>
  );
}
