import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import opentype from 'opentype.js';
import { useFileContext } from '../../context/FileContext';
import { Type, Download, Eye, Sparkles, Copy, Check } from 'lucide-react';

export default function FontConverter() {
  const { sharedFile } = useFileContext();
  const [font, setFont] = useState(null);
  const [fontInfo, setFontInfo] = useState({ name: 'System Default', glyphCount: 0, unitsPerEm: 1000 });
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog! 1234567890');
  const [fontSize, setFontSize] = useState(36);
  const [fontUrl, setFontUrl] = useState('');
  const [copiedCss, setCopiedCss] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (sharedFile && (sharedFile.name?.match(/\.(ttf|otf|woff|woff2)$/i) || sharedFile.type?.includes('font'))) {
      loadFontFile(sharedFile);
    }
  }, [sharedFile]);

  const loadFontFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result;
        const parsedFont = opentype.parse(buffer);
        setFont(parsedFont);

        const url = URL.createObjectURL(file);
        setFontUrl(url);

        // Load custom font into document fonts for direct live preview
        const fontFace = new FontFace(parsedFont.names.fontFamily.en || 'CustomFont', buffer);
        fontFace.load().then(loadedFace => {
          document.fonts.add(loadedFace);
        });

        setFontInfo({
          name: parsedFont.names.fontFamily?.en || parsedFont.names.fullName?.en || file.name,
          style: parsedFont.names.fontSubfamily?.en || 'Regular',
          glyphCount: parsedFont.glyphs.length,
          unitsPerEm: parsedFont.unitsPerEm,
        });
      } catch (err) {
        alert('Could not parse font file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) loadFontFile(file);
  };

  const getCssSnippet = () => {
    const family = fontInfo.name.replace(/\s+/g, '-');
    return `@font-face {\n  font-family: '${family}';\n  src: url('${family}.woff2') format('woff2'),\n       url('${family}.woff') format('woff'),\n       url('${family}.ttf') format('truetype');\n  font-weight: normal;\n  font-style: normal;\n  font-display: swap;\n}`;
  };

  const handleCopyCss = () => {
    navigator.clipboard.writeText(getCssSnippet());
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  const handleDownloadFont = () => {
    if (!font) return;
    try {
      const buffer = font.toArrayBuffer();
      const blob = new Blob([buffer], { type: 'font/ttf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fontInfo.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ttf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Download error: ' + e.message);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Dashboard</Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#1e293b' }}>
          Font Converter & Glyph Inspector
        </h1>
        <p style={{ color: '#64748b' }}>
          Inspect TTF, OTF, and WOFF fonts, preview glyph curves, test typography, and generate CSS @font-face rules.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Upload & Info */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>Upload Font File</h3>
          <input
            type="file"
            accept=".ttf,.otf,.woff"
            onChange={handleFileUpload}
            style={{ width: '100%', padding: '0.75rem', border: '1px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc', marginBottom: '1rem' }}
          />

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Font Details</h4>
            <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div><strong>Family Name:</strong> {fontInfo.name}</div>
              <div><strong>Glyphs Count:</strong> {fontInfo.glyphCount.toLocaleString()}</div>
              <div><strong>Units Per Em:</strong> {fontInfo.unitsPerEm}</div>
            </div>
          </div>

          <button
            onClick={handleDownloadFont}
            disabled={!font}
            style={{ width: '100%', background: font ? '#10b981' : '#94a3b8', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: font ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Download size={18} /> Export Clean TTF Font
          </button>
        </div>

        {/* Live Typography Previewer */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Live Interactive Preview</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{fontSize}px</span>
              <input
                type="range"
                min="14"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
              />
            </div>
          </div>

          <textarea
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            style={{
              width: '100%',
              height: '140px',
              padding: '0.75rem',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: `${fontSize}px`,
              fontFamily: font ? `'${fontInfo.name}', sans-serif` : 'inherit',
              lineHeight: 1.3,
              marginBottom: '1rem',
              resize: 'vertical'
            }}
          />

          {/* CSS @font-face Box */}
          <div style={{ background: '#1e293b', color: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontFamily: 'monospace', position: 'relative' }}>
            <button
              onClick={handleCopyCss}
              style={{ position: 'absolute', top: '8px', right: '8px', background: '#334155', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {copiedCss ? <Check size={12} color="#10b981" /> : <Copy size={12} />} {copiedCss ? 'Copied!' : 'Copy CSS'}
            </button>
            <pre style={{ margin: 0, overflowX: 'auto' }}>{getCssSnippet()}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
