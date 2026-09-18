import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import { useFileContext } from '../../context/FileContext';
import { createTrackedObjectURL, cleanupComponentMemory } from '../../utils/memoryManager';
import { getSafeMemoryLimits, isIOSWebKit } from '../../utils/platformDetector';

export default function PdfToImage() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [images, setImages] = useState([]);
  const [platformWarning, setPlatformWarning] = useState(null);

  // Hydrate staged file & lifecycle memory cleanup
  useEffect(() => {
    const stagedFile = sharedFile || location.state?.autoLoadedFile;
    if (stagedFile) {
      setFile(stagedFile);
      setErrorMsg('');
      setImages([]);
      clearFile();

      // Check mobile limits
      const limits = getSafeMemoryLimits('pdf');
      if (limits.isRestricted && stagedFile.size > limits.maxSafeSizeMB * 1024 * 1024) {
        setPlatformWarning(limits.warning);
      }
    }

    return () => {
      cleanupComponentMemory('pdf-to-image');
    };
  }, [sharedFile, location.state, clearFile]);

  useEffect(() => {
    // Set worker src
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setErrorMsg('');
      setImages([]);
      cleanupComponentMemory('pdf-to-image');

      const limits = getSafeMemoryLimits('pdf');
      if (limits.isRestricted && selected.size > limits.maxSafeSizeMB * 1024 * 1024) {
        setPlatformWarning(limits.warning);
      } else {
        setPlatformWarning(null);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const convertToImages = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg('');
    setImages([]);
    cleanupComponentMemory('pdf-to-image');

    const isMobile = isIOSWebKit();
    // Use conservative scale factor on iOS Safari to prevent WebKit heap exhaustion
    const scaleFactor = isMobile ? 1.4 : 2.0;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, isEvalSupported: false }).promise;
      const numPages = pdf.numPages;
      const extractedImages = [];

      // Reusable single canvas to prevent allocating hundreds of DOM canvases in RAM
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });

      for (let i = 1; i <= numPages; i++) {
        setProgressText(`Rendering page ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: scaleFactor });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext).promise;

        // Convert to Blob instead of massive DataURL strings to prevent V8/WebKit heap bloat
        const blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, 'image/jpeg', 0.88);
        });

        if (blob) {
          const trackedUrl = createTrackedObjectURL(blob, 'pdf-to-image');
          extractedImages.push({
            pageNumber: i,
            url: trackedUrl
          });
        }

        // Release PDF page memory immediately
        if (typeof page.cleanup === 'function') {
          page.cleanup();
        }
      }

      setImages(extractedImages);
      setIsProcessing(false);
      setProgressText('');
    } catch (err) {
      console.error('PDF Conversion error:', err);
      setErrorMsg('Failed to process the PDF document. Please ensure it is not password protected or corrupted.');
      setIsProcessing(false);
      setProgressText('');
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>PDF to Image Converter</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Convert every page of a PDF document into a high-quality JPG image instantly and securely in your browser.
      </p>

      {platformWarning && (
        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.85rem 1rem', borderRadius: '8px', color: '#92400e', fontSize: '0.88rem', marginTop: '1.25rem' }}>
          📱 <strong>Mobile Safeguard:</strong> {platformWarning}
        </div>
      )}

      {!images.length ? (
        <div style={{ marginTop: '2rem' }}>
          <div 
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload').click()}
            style={{ padding: '3rem 2rem', cursor: 'pointer' }}
          >
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{file ? file.name : 'Select PDF File'}</p>
            <span style={{ fontSize: '0.9rem', color: '#888', display: 'block', marginTop: '1rem' }}>
              {file ? 'Click to change file' : 'or drop file here'}
            </span>
            <input 
              id="file-upload" 
              type="file" 
              accept=".pdf" 
              style={{ display: 'none' }} 
              onClick={(e) => { e.target.value = ''; }}
              onChange={handleFileChange}
            />
          </div>

          {errorMsg && <p style={{ color: 'red', marginTop: '1rem' }}>{errorMsg}</p>}

          <button 
            className="btn" 
            onClick={convertToImages} 
            disabled={!file || isProcessing}
            style={{ marginTop: '2rem', width: '100%' }}
          >
            {isProcessing ? (progressText || 'Converting Pages...') : 'Convert to Images'}
          </button>
        </div>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2>Extracted Images ({images.length} pages)</h2>
            <button 
              className="btn" 
              style={{ backgroundColor: '#6c757d' }}
              onClick={() => {
                setImages([]);
                setFile(null);
                cleanupComponentMemory('pdf-to-image');
              }}
            >
              Convert Another PDF
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {images.map((img) => (
              <div key={img.pageNumber} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                <img 
                  src={img.url} 
                  alt={`Page ${img.pageNumber}`} 
                  style={{ width: '100%', height: 'auto', borderRadius: '4px', border: '1px solid #eee', objectFit: 'contain', maxHeight: '250px' }} 
                />
                <p style={{ margin: '0.5rem 0', fontWeight: 'bold' }}>Page {img.pageNumber}</p>
                <a 
                  href={img.url} 
                  download={`page-${img.pageNumber}.jpg`} 
                  className="btn"
                  style={{ display: 'block', padding: '0.4rem', fontSize: '0.85rem' }}
                >
                  Download JPG
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
