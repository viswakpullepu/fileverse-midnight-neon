import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { useFileContext } from '../../context/FileContext';
import { 
  FileText, PenTool, Type, Upload, Download, 
  Trash2, CheckCircle, ChevronLeft, ChevronRight,
  ShieldCheck, AlertCircle, RefreshCw, Move
} from 'lucide-react';

export default function SignPDF() {
  const { sharedFile, clearFile } = useFileContext();
  const [file, setFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageScale, setPageScale] = useState(1.0);
  const [pageSize, setPageSize] = useState({ width: 600, height: 800 });

  // Signature creation mode: 'draw' | 'type' | 'upload'
  const [signatureMode, setSignatureMode] = useState('draw');
  const [signatureColor, setSignatureColor] = useState('#0f172a');
  const [typedName, setTypedName] = useState('John Doe');
  const [signatureImage, setSignatureImage] = useState(null);

  // Placement state on active page
  const [signaturePos, setSignaturePos] = useState({ x: 50, y: 50 });
  const [signatureDimensions, setSignatureDimensions] = useState({ width: 160, height: 60 });
  const [isPlaced, setIsPlaced] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Processing & result
  const [isProcessing, setIsProcessing] = useState(false);
  const [signedPdfUrl, setSignedPdfUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Refs
  const pageCanvasRef = useRef(null);
  const signCanvasRef = useRef(null);
  const pdfContainerRef = useRef(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }, []);

  useEffect(() => {
    if (sharedFile && (sharedFile.name?.toLowerCase().endsWith('.pdf') || sharedFile.type === 'application/pdf')) {
      loadFile(sharedFile);
      clearFile();
    }
  }, [sharedFile, clearFile]);

  // Load PDF file
  const loadFile = async (selectedFile) => {
    setFile(selectedFile);
    setSignedPdfUrl(null);
    setErrorMsg('');
    setCurrentPage(1);
    setIsPlaced(false);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, isEvalSupported: false });
      const doc = await loadingTask.promise;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load PDF. Please make sure the file is not password protected.');
    }
  };

  // Render current PDF page on canvas
  useEffect(() => {
    if (!pdfDoc || !pageCanvasRef.current) return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale: 1.25 });
        const canvas = pageCanvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        setPageSize({ width: viewport.width, height: viewport.height });

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Error rendering page:', err);
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage]);

  // Drawing Canvas setup
  useEffect(() => {
    if (signatureMode === 'draw' && signCanvasRef.current) {
      const canvas = signCanvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = signatureColor;
    }
  }, [signatureMode, signatureColor]);

  // Drawing mouse handlers
  const startDrawing = (e) => {
    const canvas = signCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    isDrawingRef.current = true;
    ctx.strokeStyle = signatureColor;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = signCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    generateSignatureFromCanvas();
  };

  const clearDrawing = () => {
    const canvas = signCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureImage(null);
    setIsPlaced(false);
  };

  const generateSignatureFromCanvas = () => {
    const canvas = signCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureImage(dataUrl);
    setIsPlaced(true);
  };

  // Generate typed signature canvas
  const generateTypedSignature = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');

    ctx.font = 'italic 44px "Brush Script MT", "Segoe Script", "Dancing Script", cursive';
    ctx.fillStyle = signatureColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName || 'Sign Here', 180, 60);

    const dataUrl = canvas.toDataURL('image/png');
    setSignatureImage(dataUrl);
    setIsPlaced(true);
  };

  // Handle uploaded image signature
  const handleSignatureUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const imgFile = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setSignatureImage(event.target.result);
        setIsPlaced(true);
      };
      reader.readAsDataURL(imgFile);
    }
  };

  // Draggable signature handling on PDF Page
  const handleMouseDownOnSignature = (e) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMoveOnContainer = (e) => {
    if (!isDragging || !pdfContainerRef.current) return;
    const containerRect = pdfContainerRef.current.getBoundingClientRect();
    
    let newX = e.clientX - containerRect.left - dragOffset.x;
    let newY = e.clientY - containerRect.top - dragOffset.y;

    // Constrain within page bounds
    newX = Math.max(0, Math.min(newX, pageSize.width - signatureDimensions.width));
    newY = Math.max(0, Math.min(newY, pageSize.height - signatureDimensions.height));

    setSignaturePos({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Apply signature and download
  const signAndExportPdf = async () => {
    if (!file || !signatureImage) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      // Fetch signature PNG bytes
      const signatureBytes = await fetch(signatureImage).then((res) => res.arrayBuffer());
      const embeddedSignature = await pdf.embedPng(signatureBytes);

      // Target page (1-indexed in UI, 0-indexed in pdf-lib)
      const pageIndex = currentPage - 1;
      const targetPage = pdf.getPage(pageIndex);
      const { width: pdfPageWidth, height: pdfPageHeight } = targetPage.getSize();

      // Convert rendered canvas coordinates to PDF vector coordinates
      const scaleFactorX = pdfPageWidth / pageSize.width;
      const scaleFactorY = pdfPageHeight / pageSize.height;

      const pdfX = signaturePos.x * scaleFactorX;
      const pdfWidth = signatureDimensions.width * scaleFactorX;
      const pdfHeight = signatureDimensions.height * scaleFactorY;
      // In PDF coordinates, Y starts from the bottom
      const pdfY = pdfPageHeight - (signaturePos.y * scaleFactorY) - pdfHeight;

      targetPage.drawImage(embeddedSignature, {
        x: pdfX,
        y: pdfY,
        width: pdfWidth,
        height: pdfHeight,
      });

      const signedBytes = await pdf.save();
      const blob = new Blob([signedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setSignedPdfUrl(url);
    } catch (err) {
      console.error('Signing failed:', err);
      setErrorMsg('Failed to sign document: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#047857', padding: '0.35rem 0.9rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          <ShieldCheck size={16} />
          <span>100% Client-Side Digital Signing</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 850, letterSpacing: '-0.03em', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
          Sign PDF Document
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
          Draw, type, or upload your signature, place it on any page with millimeter precision, and download your signed PDF. Zero cloud uploads.
        </p>
      </div>

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 1: Upload PDF */}
      {!file ? (
        <div style={{
          background: '#ffffff',
          border: '2px dashed #cbd5e1',
          borderRadius: '20px',
          padding: '4rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
        }}>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => e.target.files && loadFile(e.target.files[0])}
            style={{ display: 'none' }}
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" style={{ cursor: 'pointer' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <FileText size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 750, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Select or Drop PDF to Sign
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
              Files remain 100% in your browser RAM with hardware isolation.
            </p>
          </label>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          
          {/* Left Column: Signature Creator Panel */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#0f172a' }}>
              1. Create Signature
            </h3>

            {/* Mode Switcher Tabs */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', marginBottom: '1.25rem', gap: '4px' }}>
              {[
                { id: 'draw', label: 'Draw', icon: PenTool },
                { id: 'type', label: 'Type', icon: Type },
                { id: 'upload', label: 'Upload', icon: Upload }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setSignatureMode(tab.id);
                      if (tab.id === 'type') generateTypedSignature();
                    }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: signatureMode === tab.id ? '#ffffff' : 'transparent',
                      color: signatureMode === tab.id ? '#0f172a' : '#64748b',
                      boxShadow: signatureMode === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Color Palette */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Ink Color:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['#0f172a', '#1e40af', '#991b1b', '#065f46'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setSignatureColor(color);
                      if (signatureMode === 'type') generateTypedSignature();
                    }}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: color,
                      border: signatureColor === color ? '2px solid #10b981' : '1px solid rgba(0,0,0,0.1)',
                      boxShadow: signatureColor === color ? '0 0 0 2px rgba(16,185,129,0.3)' : 'none',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Mode 1: Drawing Canvas */}
            {signatureMode === 'draw' && (
              <div>
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', background: '#fafafa', overflow: 'hidden' }}>
                  <canvas
                    ref={signCanvasRef}
                    width={340}
                    height={140}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    style={{ display: 'block', width: '100%', height: '140px', cursor: 'crosshair', touchAction: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={clearDrawing}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={14} /> Clear Canvas
                  </button>
                  <button
                    type="button"
                    onClick={generateSignatureFromCanvas}
                    style={{ background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '4px 12px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Use Signature
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2: Type Signature */}
            {signatureMode === 'type' && (
              <div>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => {
                    setTypedName(e.target.value);
                  }}
                  onBlur={generateTypedSignature}
                  placeholder="Type your name"
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box', marginBottom: '0.75rem' }}
                />
                <button
                  type="button"
                  onClick={generateTypedSignature}
                  style={{ width: '100%', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.6rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Generate Signature
                </button>
              </div>
            )}

            {/* Mode 3: Upload Signature */}
            {signatureMode === 'upload' && (
              <div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleSignatureUpload}
                  id="sig-upload"
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="sig-upload"
                  style={{ display: 'block', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}
                >
                  <Upload size={24} style={{ color: '#64748b', marginBottom: '6px' }} />
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Upload Signature Image</p>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PNG with transparent background recommended</span>
                </label>
              </div>
            )}

            {/* Step 2: Signature Sizing */}
            <div style={{ marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#0f172a' }}>
                2. Signature Size
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Width:</span>
                <input
                  type="range"
                  min="80"
                  max="320"
                  value={signatureDimensions.width}
                  onChange={(e) => {
                    const w = Number(e.target.value);
                    setSignatureDimensions({ width: w, height: Math.round(w * 0.375) });
                  }}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', minWidth: '45px' }}>
                  {signatureDimensions.width}px
                </span>
              </div>
            </div>

            {/* Export Actions */}
            <div style={{ marginTop: '2.5rem' }}>
              <button
                type="button"
                onClick={signAndExportPdf}
                disabled={!signatureImage || isProcessing}
                style={{
                  width: '100%',
                  background: signatureImage && !isProcessing ? '#10b981' : '#cbd5e1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  fontSize: '0.98rem',
                  fontWeight: 750,
                  cursor: signatureImage && !isProcessing ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: signatureImage ? '0 4px 14px rgba(16,185,129,0.3)' : 'none',
                  transition: 'all 150ms ease',
                }}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Signing PDF Document...</span>
                  </>
                ) : (
                  <>
                    <PenTool size={18} />
                    <span>Sign Page {currentPage} & Export</span>
                  </>
                )}
              </button>

              {signedPdfUrl && (
                <div style={{ marginTop: '1.25rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#047857', fontWeight: 700, marginBottom: '0.75rem' }}>
                    <CheckCircle size={18} />
                    <span>PDF Signed Successfully!</span>
                  </div>
                  <a
                    href={signedPdfUrl}
                    download={`signed_${file.name}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#047857',
                      color: '#ffffff',
                      textDecoration: 'none',
                      padding: '0.65rem 1.4rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  >
                    <Download size={16} /> Download Signed PDF
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: PDF Interactive Preview Stage */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Interactive Page Preview
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Drag the signature box onto the desired signing area
                </span>
              </div>

              {/* Page Navigator */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    style={{ background: 'transparent', border: 'none', cursor: currentPage > 1 ? 'pointer' : 'default', opacity: currentPage > 1 ? 1 : 0.4 }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    style={{ background: 'transparent', border: 'none', cursor: currentPage < totalPages ? 'pointer' : 'default', opacity: currentPage < totalPages ? 1 : 0.4 }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* PDF Canvas Container */}
            <div
              ref={pdfContainerRef}
              onMouseMove={handleMouseMoveOnContainer}
              onMouseUp={handleMouseUp}
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: '#475569',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '480px',
                userSelect: 'none',
              }}
            >
              <canvas ref={pageCanvasRef} style={{ display: 'block', maxWidth: '100%', height: 'auto', background: '#ffffff' }} />

              {/* Draggable Signature Overlay Box */}
              {signatureImage && isPlaced && (
                <div
                  onMouseDown={handleMouseDownOnSignature}
                  style={{
                    position: 'absolute',
                    left: `${signaturePos.x}px`,
                    top: `${signaturePos.y}px`,
                    width: `${signatureDimensions.width}px`,
                    height: `${signatureDimensions.height}px`,
                    border: '2px dashed #10b981',
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: '6px',
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                  }}
                >
                  <img
                    src={signatureImage}
                    alt="Signature"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '-12px',
                    background: '#10b981',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}>
                    <Move size={12} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Active Document: <strong>{file.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setFile(null)}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Change Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
