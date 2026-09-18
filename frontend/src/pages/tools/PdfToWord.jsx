import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { useFileContext } from '../../context/FileContext';
import { UploadCloud, FileText, Download, CheckCircle, Sparkles } from 'lucide-react';

export default function PdfToWord() {
  const { sharedFile } = useFileContext();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    // Set pdfjs worker src
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }, []);

  useEffect(() => {
    if (sharedFile && (sharedFile.name?.toLowerCase().endsWith('.pdf') || sharedFile.type === 'application/pdf')) {
      setFile(sharedFile);
      setFileName(sharedFile.name.replace(/\.pdf$/i, ''));
      setErrorMsg('');
      setDownloadUrl(null);
    }
  }, [sharedFile]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setFileName(selected.name.replace(/\.pdf$/i, ''));
      setErrorMsg('');
      setDownloadUrl(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      setFileName(dropped.name.replace(/\.pdf$/i, ''));
      setErrorMsg('');
      setDownloadUrl(null);
    }
  };

  function escapeXml(unsafe) {
    return (unsafe || '').replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  // 100% Client-Side PDF to Word (.docx) generator
  const convertToWord = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg('');
    setDownloadUrl(null);
    setProgress(10);
    setStatusText('Reading PDF document...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, isEvalSupported: false }).promise;
      const totalPages = pdf.numPages;
      const paragraphs = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setStatusText(`Extracting page ${pageNum} of ${totalPages}...`);
        setProgress(Math.round(10 + (pageNum / totalPages) * 70));

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        let currentLineY = null;
        let currentLineText = '';

        textContent.items.forEach(item => {
          const itemY = Math.round(item.transform[5]);
          if (currentLineY === null || Math.abs(itemY - currentLineY) < 6) {
            currentLineText += (currentLineText ? ' ' : '') + item.str;
            currentLineY = itemY;
          } else {
            if (currentLineText.trim()) {
              paragraphs.push(currentLineText.trim());
            }
            currentLineText = item.str;
            currentLineY = itemY;
          }
        });

        if (currentLineText.trim()) {
          paragraphs.push(currentLineText.trim());
        }

        // Add page divider paragraph between pages
        if (pageNum < totalPages) {
          paragraphs.push('--- Page Break ---');
        }
      }

      setStatusText('Assembling Microsoft Word (.docx) document...');
      setProgress(85);

      // Build Office Open XML (DOCX) package using JSZip
      const zip = new JSZip();

      // 1. [Content_Types].xml
      zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

      // 2. _rels/.rels
      zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

      // 3. word/document.xml
      let docXmlBody = '';
      paragraphs.forEach(pText => {
        if (pText === '--- Page Break ---') {
          docXmlBody += `    <w:p><w:r><w:br w:type="page"/></w:r></w:p>\n`;
        } else {
          docXmlBody += `    <w:p><w:r><w:t xml:space="preserve">${escapeXml(pText)}</w:t></w:r></w:p>\n`;
        }
      });

      zip.folder('word').file('document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
${docXmlBody}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`);

      setStatusText('Generating .docx file...');
      setProgress(95);

      const docxBlob = await zip.generateAsync({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      const url = window.URL.createObjectURL(docxBlob);
      setDownloadUrl(url);
      setProgress(100);
      setStatusText('Done!');
    } catch (err) {
      console.error(err);
      setErrorMsg('Client-side conversion error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Dashboard</Link>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#1e293b' }}>
        PDF to Word (.docx) Converter
      </h1>
      <p style={{ marginTop: '0.5rem', color: '#64748b' }}>
        Convert PDF documents to editable Microsoft Word files 100% locally and privately in your browser.
      </p>

      {!downloadUrl ? (
        <div style={{ marginTop: '2rem' }}>
          <div 
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('pdf-input').click()}
            style={{ padding: '3.5rem 2rem', border: '2px dashed #cbd5e1', borderRadius: '16px', background: '#ffffff', cursor: 'pointer', textAlign: 'center' }}
          >
            <input 
              id="pdf-input"
              type="file" 
              accept=".pdf,application/pdf" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fef2f2', color: '#e5322d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <FileText size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>
              {file ? file.name : 'Select or drop a PDF file here'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports multi-page PDF documents. Zero server upload.'}
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
                <div style={{ height: '100%', width: `${progress}%`, background: '#e5322d', transition: 'width 0.2s ease' }} />
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button 
              className="btn" 
              onClick={convertToWord} 
              disabled={!file || isProcessing}
              style={{ padding: '0.85rem 2.5rem', fontSize: '1.05rem', fontWeight: 700, background: file && !isProcessing ? '#e5322d' : '#cbd5e1' }}
            >
              {isProcessing ? 'Converting locally...' : 'Convert to Word (.docx)'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '2rem', textAlign: 'center', background: '#ffffff', padding: '3rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <CheckCircle size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
            Conversion Complete!
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Your editable Word document is ready to download.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href={downloadUrl} 
              download={`${fileName || 'converted'}.docx`}
              className="btn"
              style={{ background: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.85rem 2rem', fontWeight: 700 }}
            >
              <Download size={18} /> Download Word Document (.docx)
            </a>
            <button 
              onClick={() => {
                setFile(null);
                setDownloadUrl(null);
              }}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '0.85rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Convert Another PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
