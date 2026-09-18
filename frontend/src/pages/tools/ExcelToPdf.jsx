import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import { useFileContext } from '../../context/FileContext';
import { UploadCloud, FileSpreadsheet, Download, CheckCircle, Database } from 'lucide-react';

export default function ExcelToPdf() {
  const { sharedFile } = useFileContext();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (sharedFile && (sharedFile.name?.toLowerCase().endsWith('.xlsx') || sharedFile.name?.toLowerCase().endsWith('.xls') || sharedFile.type?.includes('spreadsheet'))) {
      setFile(sharedFile);
      setFileName(sharedFile.name.replace(/\.(xlsx|xls)$/i, ''));
      setErrorMsg('');
      setDownloadUrl(null);
    }
  }, [sharedFile]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setFileName(selected.name.replace(/\.(xlsx|xls)$/i, ''));
      setErrorMsg('');
      setDownloadUrl(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      setFileName(dropped.name.replace(/\.(xlsx|xls)$/i, ''));
      setErrorMsg('');
      setDownloadUrl(null);
    }
  };

  // 100% Client-side Excel (.xlsx) to PDF conversion
  const convertToPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg('');
    setDownloadUrl(null);
    setProgress(10);
    setStatusText('Unpacking Excel OpenXML spreadsheet...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      // 1. Parse shared strings if present
      const sharedStrings = [];
      const sharedStringsFile = zip.file('xl/sharedStrings.xml');
      if (sharedStringsFile) {
        const sharedXml = await sharedStringsFile.async('text');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(sharedXml, 'text/xml');
        const siNodes = xmlDoc.getElementsByTagName('si');
        for (let i = 0; i < siNodes.length; i++) {
          const tNodes = siNodes[i].getElementsByTagName('t');
          let text = '';
          for (let j = 0; j < tNodes.length; j++) {
            text += tNodes[j].textContent;
          }
          sharedStrings.push(text);
        }
      }

      setStatusText('Reading sheet rows and cells...');
      setProgress(35);

      // 2. Parse sheet1.xml
      const sheetFile = zip.file('xl/worksheets/sheet1.xml') || Object.values(zip.files).find(f => f.name.startsWith('xl/worksheets/'));
      if (!sheetFile) {
        throw new Error('Could not find worksheet in Excel file. Please use a standard .xlsx format.');
      }

      const sheetXml = await sheetFile.async('text');
      const parser = new DOMParser();
      const sheetDoc = parser.parseFromString(sheetXml, 'text/xml');
      const rowNodes = sheetDoc.getElementsByTagName('row');

      const rowsData = [];
      let maxCols = 0;

      for (let i = 0; i < rowNodes.length; i++) {
        const rNode = rowNodes[i];
        const cNodes = rNode.getElementsByTagName('c');
        const rowCells = [];

        for (let j = 0; j < cNodes.length; j++) {
          const cNode = cNodes[j];
          const type = cNode.getAttribute('t');
          const vNode = cNode.getElementsByTagName('v')[0];
          let val = vNode ? vNode.textContent : '';

          if (type === 's' && sharedStrings[parseInt(val)]) {
            val = sharedStrings[parseInt(val)];
          } else if (type === 'b') {
            val = val === '1' ? 'TRUE' : 'FALSE';
          }

          rowCells.push(val);
        }

        if (rowCells.some(c => c !== '')) {
          rowsData.push(rowCells);
          if (rowCells.length > maxCols) maxCols = rowCells.length;
        }
      }

      if (rowsData.length === 0) {
        throw new Error('Worksheet appears to be empty.');
      }

      setStatusText('Generating PDF table document...');
      setProgress(65);

      // 3. Render Table to PDF using pdf-lib in landscape format
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = 841.89; // Landscape A4 width in pt
      const pageHeight = 595.28; // Landscape A4 height in pt
      const margin = 40;
      const usableWidth = pageWidth - margin * 2;

      const colCount = Math.max(1, maxCols);
      const colWidth = usableWidth / colCount;
      const rowHeight = 22;

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      // Draw Title
      currentPage.drawText(`${fileName || 'Spreadsheet'} - Table Export`, {
        x: margin,
        y: currentY,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.15, 0.25),
      });
      currentY -= 30;

      for (let rIdx = 0; rIdx < rowsData.length; rIdx++) {
        if (currentY - rowHeight < margin) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin - 20;
        }

        const isHeader = rIdx === 0;
        const rowCells = rowsData[rIdx];

        // Draw Row Background
        if (isHeader) {
          currentPage.drawRectangle({
            x: margin,
            y: currentY - rowHeight + 4,
            width: usableWidth,
            height: rowHeight,
            color: rgb(0.92, 0.95, 0.98),
          });
        } else if (rIdx % 2 === 1) {
          currentPage.drawRectangle({
            x: margin,
            y: currentY - rowHeight + 4,
            width: usableWidth,
            height: rowHeight,
            color: rgb(0.98, 0.98, 0.99),
          });
        }

        // Draw Cells
        for (let cIdx = 0; cIdx < colCount; cIdx++) {
          const cellText = String(rowCells[cIdx] || '');
          const cellX = margin + cIdx * colWidth;

          // Truncate cell text if too wide for column
          let displayText = cellText;
          while (font.widthOfTextAtSize(displayText, isHeader ? 9 : 8.5) > colWidth - 8 && displayText.length > 3) {
            displayText = displayText.slice(0, -2) + '…';
          }

          currentPage.drawText(displayText, {
            x: cellX + 4,
            y: currentY - 10,
            size: isHeader ? 9 : 8.5,
            font: isHeader ? fontBold : font,
            color: isHeader ? rgb(0.1, 0.2, 0.4) : rgb(0.2, 0.2, 0.2),
          });
        }

        // Draw Row Border
        currentPage.drawLine({
          start: { x: margin, y: currentY - rowHeight + 4 },
          end: { x: margin + usableWidth, y: currentY - rowHeight + 4 },
          thickness: 0.5,
          color: rgb(0.85, 0.88, 0.92),
        });

        currentY -= rowHeight;
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
      setErrorMsg('Excel to PDF error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Dashboard</Link>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#1e293b' }}>
        Excel to PDF Converter
      </h1>
      <p style={{ marginTop: '0.5rem', color: '#64748b' }}>
        Convert Excel spreadsheets (.xlsx, .xls) to formatted PDF tables 100% locally in your browser.
      </p>

      {!downloadUrl ? (
        <div style={{ marginTop: '2rem' }}>
          <div 
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('excel-input').click()}
            style={{ padding: '3.5rem 2rem', border: '2px dashed #cbd5e1', borderRadius: '16px', background: '#ffffff', cursor: 'pointer', textAlign: 'center' }}
          >
            <input 
              id="excel-input"
              type="file" 
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <FileSpreadsheet size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>
              {file ? file.name : 'Select or drop an Excel spreadsheet here'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Zero server upload. Spreadsheet data never leaves your device.'}
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
                <div style={{ height: '100%', width: `${progress}%`, background: '#059669', transition: 'width 0.2s ease' }} />
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button 
              className="btn" 
              onClick={convertToPdf} 
              disabled={!file || isProcessing}
              style={{ padding: '0.85rem 2.5rem', fontSize: '1.05rem', fontWeight: 700, background: file && !isProcessing ? '#059669' : '#cbd5e1' }}
            >
              {isProcessing ? 'Converting locally...' : 'Convert to PDF Table'}
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
            Your spreadsheet has been converted to a clean PDF table.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href={downloadUrl} 
              download={`${fileName || 'spreadsheet'}.pdf`}
              className="btn"
              style={{ background: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.85rem 2rem', fontWeight: 700 }}
            >
              <Download size={18} /> Download PDF Table
            </a>
            <button 
              onClick={() => {
                setFile(null);
                setDownloadUrl(null);
              }}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '0.85rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Convert Another Spreadsheet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
