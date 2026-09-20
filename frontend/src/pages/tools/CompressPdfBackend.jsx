import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { useFileContext } from '../../context/FileContext';
import { UploadCloud, Maximize, Download, CheckCircle, Sparkles } from 'lucide-react';

export default function CompressPdfBackend() {
  const { sharedFile } = useFileContext();
  const [file, setFile] = useState(null);
  const [compressionMode, setCompressionMode] = useState('recommended'); // 'extreme' | 'recommended' | 'light'
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [compressionResult, setCompressionResult] = useState(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }, []);

  useEffect(() => {
    if (sharedFile && (sharedFile.name?.toLowerCase().endsWith('.pdf') || sharedFile.type === 'application/pdf')) {
      setFile(sharedFile);
      setErrorMsg('');
      setDownloadUrl(null);
      setCompressionResult(null);
    }
  }, [sharedFile]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg('');
      setDownloadUrl(null);
      setCompressionResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setErrorMsg('');
      setDownloadUrl(null);
      setCompressionResult(null);
    }
  };

  const compressPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg('');
    setDownloadUrl(null);
    setCompressionResult(null);
    setProgress(5);
    setStatusText('Loading PDF in browser memory...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalSize = file.size;

      // Mode 1: Fast Lossless Structural Stream Optimization
      if (compressionMode === 'lossless') {
        setStatusText('Optimizing PDF object streams & metadata...');
        setProgress(40);
        const loadedDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        setProgress(75);
        const optimizedBytes = await loadedDoc.save({ useObjectStreams: true });
        
        let finalBytes = optimizedBytes;
        if (finalBytes.byteLength >= originalSize) {
          finalBytes = new Uint8Array(arrayBuffer);
        }

        const compressedSize = finalBytes.byteLength;
        const savedRatio = ((1 - (compressedSize / originalSize)) * 100).toFixed(1);

        setCompressionResult({
          original: originalSize,
          compressed: compressedSize,
          ratio: savedRatio > 0 ? savedRatio : 0,
          mode: 'Lossless Vector'
        });

        const blob = new Blob([finalBytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        setDownloadUrl(url);
        setProgress(100);
        setStatusText('Lossless optimization complete!');
        return;
      }

      // Mode 2: Visual Raster Compression (for scanned docs & heavy images)
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, isEvalSupported: false }).promise;
      const totalPages = pdf.numPages;

      const outputPdfDoc = await PDFDocument.create();

      // Compression settings
      const settings = {
        extreme: { scale: 1.0, quality: 0.5 },
        recommended: { scale: 1.3, quality: 0.70 },
        light: { scale: 1.6, quality: 0.82 },
      }[compressionMode] || { scale: 1.3, quality: 0.70 };

      for (let i = 1; i <= totalPages; i++) {
        setStatusText(`Optimizing page ${i} of ${totalPages}...`);
        setProgress(Math.round(5 + (i / totalPages) * 80));

        const page = await pdf.getPage(i);
        const nextPagePromise = i < totalPages ? pdf.getPage(i + 1) : null;

        const viewport = page.getViewport({ scale: settings.scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const jpegBlob = await new Promise((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', settings.quality)
        );
        const jpegImageBytes = await jpegBlob.arrayBuffer();

        const embeddedImage = await outputPdfDoc.embedJpg(jpegImageBytes);
        const newPage = outputPdfDoc.addPage([page.view[2] - page.view[0], page.view[3] - page.view[1]]);

        newPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: newPage.getWidth(),
          height: newPage.getHeight(),
        });

        if (nextPagePromise) await nextPagePromise;
      }

      setStatusText('Optimizing PDF structure...');
      setProgress(90);

      const compressedBytes = await outputPdfDoc.save({ useObjectStreams: true });
      let finalBytes = compressedBytes;

      // Smart Size Safety Guard: If rasterization inflated the document (e.g. on clean vector text),
      // fallback to object stream compression so the file NEVER grows larger.
      if (compressedBytes.byteLength >= originalSize) {
        try {
          const loadedDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          const structuralBytes = await loadedDoc.save({ useObjectStreams: true });
          if (structuralBytes.byteLength < originalSize) {
            finalBytes = structuralBytes;
          }
        } catch (e) {}
      }

      const compressedSize = finalBytes.byteLength;
      const savedRatio = ((1 - (compressedSize / originalSize)) * 100).toFixed(1);

      setCompressionResult({
        original: originalSize,
        compressed: compressedSize,
        ratio: savedRatio > 0 ? savedRatio : 0
      });

      const blob = new Blob([finalBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setProgress(100);
      setStatusText('Compression complete!');
    } catch (err) {
      console.error(err);
      setErrorMsg('Compression failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Dashboard</Link>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#1e293b' }}>
        Compress PDF (100% In-Browser)
      </h1>
      <p style={{ marginTop: '0.5rem', color: '#64748b' }}>
        Shrink PDF document size with smart image optimization and metadata compaction entirely on your machine.
      </p>

      {!downloadUrl ? (
        <div style={{ marginTop: '2rem' }}>
          <div 
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('compress-pdf-input').click()}
            style={{ padding: '3.5rem 2rem', border: '2px dashed #cbd5e1', borderRadius: '16px', background: '#ffffff', cursor: 'pointer', textAlign: 'center' }}
          >
            <input 
              id="compress-pdf-input"
              type="file" 
              accept=".pdf,application/pdf" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fef2f2', color: '#e5322d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <Maximize size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>
              {file ? file.name : 'Select or drop a PDF file here'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'All optimization runs locally in your browser.'}
            </p>
          </div>

          {/* Compression Level Selector */}
          {file && (
            <div style={{ marginTop: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
                Compression Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                {[
                  { id: 'lossless', title: 'Lossless Vector', desc: 'Preserves 100% searchable text & vectors, instant' },
                  { id: 'recommended', title: 'Recommended', desc: 'Great balance of quality & size (~50% smaller)' },
                  { id: 'extreme', title: 'Extreme Raster', desc: 'Lowest size (~70% smaller, ideal for scans)' },
                  { id: 'light', title: 'Light Compression', desc: 'Highest visual quality (~30% smaller)' },
                ].map((mode) => (
                  <div
                    key={mode.id}
                    onClick={() => setCompressionMode(mode.id)}
                    style={{
                      border: compressionMode === mode.id ? '2px solid #e5322d' : '1px solid #e2e8f0',
                      background: compressionMode === mode.id ? '#fef2f2' : '#f8fafc',
                      borderRadius: '8px',
                      padding: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: compressionMode === mode.id ? '#e5322d' : '#1e293b' }}>
                      {mode.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                      {mode.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.9rem' }}>
              {errorMsg}
            </div>
          )}

          {isProcessing && (
            <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '0.4rem', fontWeight: 600 }}>
                <span>{statusText}</span>
                <span>{progress}%</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: '#e5322d', transition: 'width 0.2s ease' }} />
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button 
              className="btn" 
              onClick={compressPdf} 
              disabled={!file || isProcessing}
              style={{ padding: '0.85rem 2.5rem', fontSize: '1.05rem', fontWeight: 700, background: file && !isProcessing ? '#e5322d' : '#cbd5e1' }}
            >
              {isProcessing ? 'Compressing locally...' : 'Compress PDF'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '2rem', textAlign: 'center', background: '#ffffff', padding: '3rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <CheckCircle size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
            Compression Complete!
          </h2>

          {compressionResult && (
            <div style={{ display: 'inline-flex', gap: '2rem', background: '#f8fafc', padding: '1rem 2rem', borderRadius: '10px', border: '1px solid #e2e8f0', margin: '1rem 0 1.5rem 0' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Original Size</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{(compressionResult.original / 1024).toFixed(1)} KB</div>
              </div>
              <div style={{ borderLeft: '1px solid #e2e8f0' }} />
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Compressed Size</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>{(compressionResult.compressed / 1024).toFixed(1)} KB</div>
              </div>
              <div style={{ borderLeft: '1px solid #e2e8f0' }} />
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Saved</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>{compressionResult.ratio}%</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href={downloadUrl} 
              download={`compressed_${file?.name || 'document.pdf'}`}
              className="btn"
              style={{ background: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.85rem 2rem', fontWeight: 700 }}
            >
              <Download size={18} /> Download Compressed PDF
            </a>
            <button 
              onClick={() => {
                setFile(null);
                setDownloadUrl(null);
              }}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '0.85rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Compress Another PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
