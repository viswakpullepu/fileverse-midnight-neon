import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import { useFileContext } from '../../context/FileContext';
import { UploadCloud, Presentation, Download, CheckCircle } from 'lucide-react';

export default function PowerpointToPdf() {
  const { sharedFile } = useFileContext();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (sharedFile && (sharedFile.name?.toLowerCase().endsWith('.pptx') || sharedFile.name?.toLowerCase().endsWith('.ppt') || sharedFile.type?.includes('presentation'))) {
      setFile(sharedFile);
      setFileName(sharedFile.name.replace(/\.(pptx|ppt)$/i, ''));
      setErrorMsg('');
      setDownloadUrl(null);
    }
  }, [sharedFile]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setFileName(selected.name.replace(/\.(pptx|ppt)$/i, ''));
      setErrorMsg('');
      setDownloadUrl(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      setFileName(dropped.name.replace(/\.(pptx|ppt)$/i, ''));
      setErrorMsg('');
      setDownloadUrl(null);
    }
  };

  // 100% Client-side PowerPoint (.pptx) to PDF conversion
  const convertToPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg('');
    setDownloadUrl(null);
    setProgress(10);
    setStatusText('Unpacking PowerPoint OpenXML presentation...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      // Find all slide XML files
      const slideFiles = Object.keys(zip.files)
        .filter(name => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
        .sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)[0], 10);
          const numB = parseInt(b.match(/\d+/)[0], 10);
          return numA - numB;
        });

      if (slideFiles.length === 0) {
        throw new Error('No slides found in PowerPoint presentation. Please use standard .pptx format.');
      }

      setStatusText(`Found ${slideFiles.length} slides. Parsing slide contents...`);
      setProgress(30);

      const parsedSlides = [];
      const parser = new DOMParser();

      for (let i = 0; i < slideFiles.length; i++) {
        const slideXml = await zip.file(slideFiles[i]).async('text');
        const slideDoc = parser.parseFromString(slideXml, 'text/xml');
        const textNodes = slideDoc.getElementsByTagName('a:t');

        const slideTexts = [];
        for (let j = 0; j < textNodes.length; j++) {
          const t = textNodes[j].textContent.trim();
          if (t) slideTexts.push(t);
        }

        parsedSlides.push({
          slideNumber: i + 1,
          title: slideTexts[0] || `Slide ${i + 1}`,
          content: slideTexts.slice(1)
        });
      }

      setStatusText('Generating landscape PDF presentation...');
      setProgress(65);

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = 841.89; // 16:9 / A4 landscape width
      const pageHeight = 595.28;
      const margin = 50;

      for (let i = 0; i < parsedSlides.length; i++) {
        const slide = parsedSlides[i];
        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Slide Background Card
        page.drawRectangle({
          x: 20,
          y: 20,
          width: pageWidth - 40,
          height: pageHeight - 40,
          color: rgb(0.98, 0.99, 1),
          borderColor: rgb(0.9, 0.92, 0.95),
          borderWidth: 1,
        });

        // Top Accent Bar
        page.drawRectangle({
          x: 20,
          y: pageHeight - 26,
          width: pageWidth - 40,
          height: 6,
          color: rgb(0.9, 0.2, 0.18),
        });

        // Slide Title
        page.drawText(slide.title, {
          x: margin,
          y: pageHeight - 80,
          size: 22,
          font: fontBold,
          color: rgb(0.1, 0.15, 0.25),
        });

        // Slide Subtitle / Content lines
        let currentY = pageHeight - 130;
        for (const line of slide.content) {
          if (currentY < 70) break;
          page.drawText(`•  ${line}`, {
            x: margin + 15,
            y: currentY,
            size: 13,
            font: font,
            color: rgb(0.25, 0.3, 0.35),
          });
          currentY -= 28;
        }

        // Slide Number Footer
        page.drawText(`${slide.slideNumber} / ${parsedSlides.length}`, {
          x: pageWidth - margin - 40,
          y: 35,
          size: 10,
          font: font,
          color: rgb(0.6, 0.65, 0.7),
        });
      }

      setStatusText('Finalizing PDF bytes...');
      setProgress(95);

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);

      setDownloadUrl(url);
      setProgress(100);
      setStatusText('Complete!');
    } catch (err) {
      console.error(err);
      setErrorMsg('PowerPoint to PDF error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Dashboard</Link>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#1e293b' }}>
        PowerPoint to PDF Converter
      </h1>
      <p style={{ marginTop: '0.5rem', color: '#64748b' }}>
        Convert PowerPoint presentations (.pptx, .ppt) to clean landscape slide PDFs 100% locally in your browser.
      </p>

      {!downloadUrl ? (
        <div style={{ marginTop: '2rem' }}>
          <div 
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('ppt-input').click()}
            style={{ padding: '3.5rem 2rem', border: '2px dashed #cbd5e1', borderRadius: '16px', background: '#ffffff', cursor: 'pointer', textAlign: 'center' }}
          >
            <input 
              id="ppt-input"
              type="file" 
              accept=".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fff1f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <Presentation size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>
              {file ? file.name : 'Select or drop a PowerPoint presentation here'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : '100% in-browser offline conversion. Slides rendered to landscape PDF.'}
            </p>
          </div>

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
                <div style={{ height: '100%', width: `${progress}%`, background: '#e11d48', transition: 'width 0.2s ease' }} />
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button 
              className="btn" 
              onClick={convertToPdf} 
              disabled={!file || isProcessing}
              style={{ padding: '0.85rem 2.5rem', fontSize: '1.05rem', fontWeight: 700, background: file && !isProcessing ? '#e11d48' : '#cbd5e1' }}
            >
              {isProcessing ? 'Converting locally...' : 'Convert to Slide PDF'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '2rem', textAlign: 'center', background: '#ffffff', padding: '3rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <CheckCircle size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
            PDF Presentation Ready!
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Your slides have been compiled into a high-quality landscape PDF document.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href={downloadUrl} 
              download={`${fileName || 'presentation'}.pdf`}
              className="btn"
              style={{ background: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.85rem 2rem', fontWeight: 700 }}
            >
              <Download size={18} /> Download Slide PDF
            </a>
            <button 
              onClick={() => {
                setFile(null);
                setDownloadUrl(null);
              }}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '0.85rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Convert Another Presentation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
