import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import { useFileContext } from '../../context/FileContext';
import { UploadCloud, FileText, Download, CheckCircle } from 'lucide-react';

export default function WordToPdf() {
  const { sharedFile } = useFileContext();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (sharedFile && (sharedFile.name?.toLowerCase().endsWith('.docx') || sharedFile.name?.toLowerCase().endsWith('.doc'))) {
      setFile(sharedFile);
      setFileName(sharedFile.name.replace(/\.(docx|doc)$/i, ''));
      setErrorMsg('');
      setDownloadUrl(null);
    }
  }, [sharedFile]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setFileName(selected.name.replace(/\.(docx|doc)$/i, ''));
      setErrorMsg('');
      setDownloadUrl(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      setFileName(dropped.name.replace(/\.(docx|doc)$/i, ''));
      setErrorMsg('');
      setDownloadUrl(null);
    }
  };

  // 100% Client-Side Word (.docx) to PDF conversion
  const convertToPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg('');
    setDownloadUrl(null);
    setProgress(15);
    setStatusText('Unpacking Word document XML...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      const docXmlFile = zip.file('word/document.xml');
      if (!docXmlFile) {
        throw new Error('Invalid or legacy Word file. Please provide a standard .docx file.');
      }

      const docXmlText = await docXmlFile.async('text');
      setStatusText('Parsing document structure & paragraphs...');
      setProgress(40);

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(docXmlText, 'text/xml');
      const paragraphNodes = xmlDoc.getElementsByTagName('w:p');

      const extractedParagraphs = [];
      for (let i = 0; i < paragraphNodes.length; i++) {
        const pNode = paragraphNodes[i];
        const textNodes = pNode.getElementsByTagName('w:t');
        let paragraphText = '';
        for (let j = 0; j < textNodes.length; j++) {
          paragraphText += textNodes[j].textContent;
        }
        
        // Detect heading style if present
        const styleNode = pNode.getElementsByTagName('w:pStyle')[0];
        const styleVal = styleNode ? styleNode.getAttribute('w:val') : '';
        const isHeading = styleVal && styleVal.toLowerCase().includes('heading');

        if (paragraphText.trim() || isHeading) {
          extractedParagraphs.push({
            text: paragraphText.trim(),
            isHeading: !!isHeading
          });
        }
      }

      setStatusText('Rendering PDF document...');
      setProgress(70);

      const pdfDoc = await PDFDocument.create();
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = 595.28; // Standard A4 width in pt
      const pageHeight = 841.89; // Standard A4 height in pt
      const margin = 54; // 0.75 inch margin
      const usableWidth = pageWidth - margin * 2;

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      // Word wrapping helper
      const wrapText = (text, font, size, maxWidth) => {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const width = font.widthOfTextAtSize(testLine, size);
          if (width <= maxWidth) {
            currentLine = testLine;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
      };

      for (const p of extractedParagraphs) {
        const fontSize = p.isHeading ? 15 : 10.5;
        const lineHeight = p.isHeading ? 20 : 15;
        const font = p.isHeading ? fontBold : fontRegular;
        const color = p.isHeading ? rgb(0.12, 0.16, 0.23) : rgb(0.2, 0.2, 0.2);

        const lines = wrapText(p.text, font, fontSize, usableWidth);

        for (const line of lines) {
          if (currentY - lineHeight < margin) {
            currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }

          currentPage.drawText(line, {
            x: margin,
            y: currentY,
            size: fontSize,
            font,
            color,
          });

          currentY -= lineHeight;
        }

        // Add paragraph gap
        currentY -= p.isHeading ? 8 : 6;
      }

      setStatusText('Finalizing PDF bytes...');
      setProgress(90);

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);

      setDownloadUrl(url);
      setProgress(100);
      setStatusText('Complete!');
    } catch (err) {
      console.error(err);
      setErrorMsg('Word to PDF error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Dashboard</Link>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#1e293b' }}>
        Word to PDF Converter
      </h1>
      <p style={{ marginTop: '0.5rem', color: '#64748b' }}>
        Convert DOCX Word documents to clean vector PDF files 100% locally in your browser.
      </p>

      {!downloadUrl ? (
        <div style={{ marginTop: '2rem' }}>
          <div 
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('word-input').click()}
            style={{ padding: '3.5rem 2rem', border: '2px dashed #cbd5e1', borderRadius: '16px', background: '#ffffff', cursor: 'pointer', textAlign: 'center' }}
          >
            <input 
              id="word-input"
              type="file" 
              accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <FileText size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>
              {file ? file.name : 'Select or drop a Word (.docx) file here'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : '100% client-side offline conversion. No server upload.'}
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
                <div style={{ height: '100%', width: `${progress}%`, background: '#2563eb', transition: 'width 0.2s ease' }} />
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button 
              className="btn" 
              onClick={convertToPdf} 
              disabled={!file || isProcessing}
              style={{ padding: '0.85rem 2.5rem', fontSize: '1.05rem', fontWeight: 700, background: file && !isProcessing ? '#2563eb' : '#cbd5e1' }}
            >
              {isProcessing ? 'Converting locally...' : 'Convert to PDF'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '2rem', textAlign: 'center', background: '#ffffff', padding: '3rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <CheckCircle size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
            PDF Ready!
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Your Word document has been converted to a clean vector PDF.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href={downloadUrl} 
              download={`${fileName || 'document'}.pdf`}
              className="btn"
              style={{ background: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.85rem 2rem', fontWeight: 700 }}
            >
              <Download size={18} /> Download PDF Document
            </a>
            <button 
              onClick={() => {
                setFile(null);
                setDownloadUrl(null);
              }}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '0.85rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Convert Another Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
