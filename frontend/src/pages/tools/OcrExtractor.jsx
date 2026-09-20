import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Tesseract from 'tesseract.js';
import { useFileContext } from '../../context/FileContext';
import { FileText, Sparkles, Copy, Check, Download, Image as ImageIcon } from 'lucide-react';

export default function OcrExtractor() {
  const { sharedFile } = useFileContext();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [language, setLanguage] = useState('eng');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (sharedFile && (sharedFile.type?.startsWith('image/') || /\.(png|jpe?g|webp|svg|bmp|gif)$/i.test(sharedFile.name))) {
      setImage(sharedFile);
      setImagePreview(URL.createObjectURL(sharedFile));
      setExtractedText('');
    }
  }, [sharedFile]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setExtractedText('');
  };

  const handleRunOCR = async () => {
    if (!image) return;
    setIsProcessing(true);
    setProgress(0);
    setStatus('Initializing OCR engine...');

    try {
      let ocrTarget = image;

      // Smart OCR pre-processing: Downscale photos exceeding 2048px to accelerate neural inference 4-5x
      try {
        const bitmap = await createImageBitmap(image);
        const MAX_DIM = 2048;
        if (bitmap.width > MAX_DIM || bitmap.height > MAX_DIM) {
          setStatus('Optimizing resolution for neural OCR...');
          const ratio = Math.min(MAX_DIM / bitmap.width, MAX_DIM / bitmap.height);
          const w = Math.round(bitmap.width * ratio);
          const h = Math.round(bitmap.height * ratio);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(bitmap, 0, 0, w, h);
          bitmap.close();
          const optimizedBlob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.92));
          if (optimizedBlob) ocrTarget = optimizedBlob;
        } else {
          bitmap.close();
        }
      } catch (e) {
        // Fallback to original image
      }

      const result = await Tesseract.recognize(ocrTarget, language, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setStatus('Extracting text with AI...');
            setProgress(Math.round(m.progress * 100));
          } else {
            setStatus(m.status);
          }
        },
      });

      setExtractedText(result.data.text);
    } catch (err) {
      alert('OCR Error: ' + err.message);
    } finally {
      setIsProcessing(false);
      setStatus('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tool-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Dashboard</Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#1e293b' }}>
          OCR Text Extractor (Client-Side AI)
        </h1>
        <p style={{ color: '#64748b' }}>
          Extract text from scanned documents, receipts, screenshots, and images with neural OCR running natively in your browser.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Upload & Controls */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>Upload Image</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ width: '100%', padding: '0.75rem', border: '1px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc', marginBottom: '1rem' }}
          />

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
              Document Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            >
              <option value="eng">English</option>
              <option value="spa">Spanish (Español)</option>
              <option value="fra">French (Français)</option>
              <option value="deu">German (Deutsch)</option>
              <option value="ita">Italian (Italiano)</option>
              <option value="por">Portuguese (Português)</option>
              <option value="hin">Hindi (हिन्दी)</option>
            </select>
          </div>

          {imagePreview && (
            <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
              <img
                src={imagePreview}
                alt="Upload preview"
                style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'contain' }}
              />
            </div>
          )}

          {isProcessing && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.3rem' }}>
                <span>{status}</span>
                <span>{progress}%</span>
              </div>
              <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: '#3b82f6', transition: 'width 0.2s' }} />
              </div>
            </div>
          )}

          <button
            onClick={handleRunOCR}
            disabled={!image || isProcessing}
            style={{ width: '100%', background: image && !isProcessing ? '#0284c7' : '#94a3b8', color: '#fff', border: 'none', padding: '0.85rem', borderRadius: '8px', fontWeight: 700, cursor: image && !isProcessing ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Sparkles size={18} /> {isProcessing ? 'Processing OCR...' : 'Extract Text from Image'}
          </button>
        </div>

        {/* Extracted Output */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Extracted Text</h3>
            {extractedText && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleCopy}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleDownloadTxt}
                  style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Download size={14} /> Save .txt
                </button>
              </div>
            )}
          </div>

          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            placeholder="Extracted text will appear here. You can edit it directly once OCR finishes."
            style={{ width: '100%', flex: 1, minHeight: '300px', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.5', resize: 'vertical' }}
          />
        </div>
      </div>
    </div>
  );
}
