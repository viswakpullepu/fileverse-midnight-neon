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

  const [statusText, setStatusText] = useState('');
  const [outputStats, setOutputStats] = useState(null);

  const formatBytes = (bytes) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= files.length) return;
    setFiles(prev => {
      const updated = [...prev];
      const [item] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, item);
      return updated;
    });
  };

  const mergePdfs = async () => {
    if (files.length < 2) return;
    setIsMerging(true);
    setStatusText('Preparing PDF builder in memory...');
    
    try {
      const mergedPdf = await PDFDocument.create();
      let totalPageCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setStatusText(`Merging ${i + 1} of ${files.length}: ${file.name}...`);
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pageIndices = pdf.getPageIndices();
        totalPageCount += pageIndices.length;
        const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      setStatusText('Optimizing & assembling combined document...');
      const mergedPdfBytes = await mergedPdf.save({ useObjectStreams: true });
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputStats({
        totalPages: totalPageCount,
        outputSize: blob.size,
      });
      setMergedPdfUrl(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Failed to merge PDFs. One of the documents may be password protected or corrupted.');
    } finally {
      setIsMerging(false);
      setStatusText('');
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '850px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1>Merge PDF Documents</h1>
      <p style={{ marginTop: '0.5rem', color: '#64748b' }}>
        Combine multiple PDF documents into a single file in any custom order. 100% Client-Side In-Browser.
      </p>

      {!mergedPdfUrl ? (
        <>
          <div 
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload').click()}
            style={{ padding: '3.5rem 2rem', marginTop: '1.5rem', border: '2px dashed #cbd5e1', borderRadius: '16px', background: '#ffffff', cursor: 'pointer', textAlign: 'center' }}
          >
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Select or drop PDF files here</p>
            <span style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'block', marginTop: '0.5rem' }}>
              Add 2 or more PDFs to combine • Drag to reorder below
            </span>
            <input 
              id="file-upload" 
              type="file" 
              multiple 
              accept=".pdf,application/pdf" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </div>

          {files.length > 0 && (
            <div style={{ textAlign: 'left', marginTop: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>Files to Merge ({files.length})</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Total: {formatBytes(files.reduce((acc, f) => acc + (f.size || 0), 0))}
                </span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {files.map((file, index) => (
                  <li key={index} style={{ 
                    padding: '0.75rem 1rem', 
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                      <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', color: '#475569', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {index + 1}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{formatBytes(file.size)}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        onClick={() => moveFile(index, index - 1)}
                        disabled={index === 0}
                        title="Move Up"
                        style={{ padding: '0.3rem 0.6rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.4 : 1 }}
                      >
                        ▲
                      </button>
                      <button 
                        onClick={() => moveFile(index, index + 1)}
                        disabled={index === files.length - 1}
                        title="Move Down"
                        style={{ padding: '0.3rem 0.6rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: index === files.length - 1 ? 'not-allowed' : 'pointer', opacity: index === files.length - 1 ? 0.4 : 1 }}
                      >
                        ▼
                      </button>
                      <button 
                        onClick={() => removeFile(index)}
                        style={{ 
                          padding: '0.3rem 0.6rem',
                          background: '#fee2e2', 
                          border: '1px solid #fca5a5', 
                          color: '#dc2626', 
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.8rem'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              
              {statusText && (
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#eff6ff', borderRadius: '8px', color: '#1d4ed8', fontSize: '0.9rem', fontWeight: 600 }}>
                  ⏳ {statusText}
                </div>
              )}

              <button 
                className="btn" 
                onClick={mergePdfs}
                disabled={files.length < 2 || isMerging}
                style={{ width: '100%', marginTop: '1.25rem', padding: '0.85rem', fontSize: '1.05rem', fontWeight: 700, opacity: files.length < 2 ? 0.6 : 1, cursor: files.length < 2 ? 'not-allowed' : 'pointer' }}
              >
                {isMerging ? 'Merging Documents...' : `Merge ${files.length} PDFs`}
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
        <div style={{ padding: '3rem 2rem', border: '1px solid #e2e8f0', borderRadius: '14px', marginTop: '2rem', background: '#ffffff', textAlign: 'center' }}>
          <h2 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>PDFs Merged Successfully!</h2>
          {outputStats && (
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Created <strong>{outputStats.totalPages} pages</strong> document • Size: <strong>{formatBytes(outputStats.outputSize)}</strong>
            </p>
          )}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href={mergedPdfUrl} 
              download="merged_document.pdf" 
              className="btn"
              style={{ padding: '0.8rem 1.8rem' }}
            >
              Download Merged PDF
            </a>
            <button 
              className="btn" 
              style={{ backgroundColor: '#64748b', padding: '0.8rem 1.5rem' }}
              onClick={() => {
                setMergedPdfUrl(null);
                setFiles([]);
                setOutputStats(null);
              }}
            >
              Merge More Files
            </button>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '2rem' }}>
        <Link to="/" style={{ color: 'var(--primary, #7c3aed)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
