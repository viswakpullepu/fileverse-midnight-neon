/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 · genre: modern-tactile
 * theme: obsidian-emerald · tokens: locked · contrast: WCAG AAA
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import UniversalDropzone from '../components/UniversalDropzone';
import ExperimentalSpatialCanvas from '../components/experimental/ExperimentalSpatialCanvas';
import { 
  InteractiveBeforeAfterSlider, 
  ArchitectureComparisonWidget 
} from '../components/experimental/ExperimentalInteractiveWidgets';
import '../styles/experimental-tokens.css';
import { 
  ShieldCheck, Zap, Lock, Cpu, Sparkles, 
  ArrowRight, Check, FileText, Layers, 
  Box, Terminal, Globe, Sliders, ExternalLink,
  ChevronRight, Database, Code, Compass, BookOpen
} from 'lucide-react';

export default function ExperimentalLandingPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const toolsList = [
    { title: 'Merge PDF', path: '/merge_pdf', cat: 'pdf', desc: 'Combine multiple PDF files into one clean document.' },
    { title: 'PDF to Word (.docx)', path: '/pdf_to_word', cat: 'pdf', desc: 'Convert PDF pages into editable OpenXML docx documents.' },
    { title: 'Word to PDF', path: '/word_to_pdf', cat: 'pdf', desc: 'Compile Word documents into vector PDFs in memory.' },
    { title: 'Split PDF', path: '/split_pdf', cat: 'pdf', desc: 'Extract individual pages or ranges into separate files.' },
    { title: 'Protect PDF', path: '/protect_pdf', cat: 'pdf', desc: 'Add 128/256-bit encryption password client-side.' },
    { title: 'Remove Background', path: '/remove_bg', cat: 'image', desc: 'Euclidean color isolation with transparent alpha channel.' },
    { title: 'Gemini Watermark Remover', path: '/gemini_watermark_remover', cat: 'image', desc: 'Seamlessly clean visible AI watermarks from photos.' },
    { title: 'Compress Image', path: '/compress_image', cat: 'image', desc: 'Lossless & lossy Canvas re-encoding with instant preview.' },
    { title: 'Convert Image Format', path: '/convert_image', cat: 'image', desc: 'Cross-convert between PNG, JPG, WebP, SVG, and ICO.' },
    { title: 'OCR Text Extractor', path: '/ocr_extractor', cat: 'ai', desc: 'Extract editable text from scanned images via Tesseract WASM.' },
    { title: '3D STL Viewport', path: '/threed_converter', cat: 'spatial', desc: 'Interactive Three.js 3D mesh renderer and format hub.' },
    { title: 'GIS Map Converter', path: '/gis_converter', cat: 'spatial', desc: 'Convert between GeoJSON, Google Earth KML, and CSV coords.' },
    { title: 'Typography Font Inspector', path: '/font_converter', cat: 'spatial', desc: 'Inspect glyphs and export @font-face rules (TTF, OTF, WOFF).' },
    { title: 'E-Book Reader & Builder', path: '/ebook_converter', cat: 'spatial', desc: 'Parse and compile standard digital EPUB publications.' },
    { title: 'Subtitle Converter', path: '/subtitle_converter', cat: 'spatial', desc: 'Convert SRT, WebVTT, and ASS with millisecond time shift.' },
    { title: 'JSON Formatter', path: '/json_formatter', cat: 'dev', desc: 'Format, validate, and beautify arbitrary JSON trees.' },
    { title: 'CSV ↔ JSON', path: '/csv_to_json', cat: 'dev', desc: 'Bidirectional tabular data conversion in browser RAM.' },
    { title: 'Cryptographic Hashes', path: '/hash_generator', cat: 'dev', desc: 'Generate SHA-256, MD5, and salted Bcrypt hashes.' },
    { title: 'Markdown to HTML', path: '/markdown_to_html', cat: 'dev', desc: 'Real-time Markdown compiler with live HTML preview.' },
  ];

  const filteredTools = activeCategory === 'all' 
    ? toolsList 
    : toolsList.filter(t => t.cat === activeCategory);

  return (
    <div className="fv-experimental-container fv-grid-texture">
      <SEO 
        title="FileVerze (Experimental) — 100% Client-Side Private File Processing"
        description="Experience the experimental next-gen interface for FileVerze. Zero cloud uploads, WebAssembly execution, and interactive 3D spatial tools."
      />

      {/* Experimental Sub-Header Banner */}
      <div style={{
        background: '#020617',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0.5rem 1rem',
        fontSize: '0.8rem',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
          <strong style={{ color: '#f8fafc' }}>EXPERIMENTAL V2</strong>
          <span>— Hallmark Anti-Slop Layout & Spatial Architecture</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Classic Home
          </Link>
          <a href="https://github.com/viswakpullepu/FileVerse" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            GitHub <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* =====================================================================
          1. HERO SECTION (Asymmetric split with 3D Spatial Viewport)
          ===================================================================== */}
      <header className="fv-content-wrapper" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
        }}>
          {/* Left Column: Authentic Copy + Dropzone */}
          <div>
            {/* Status Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--fv-color-emerald-50)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--fv-color-emerald-700)',
              marginBottom: '1.25rem',
            }}>
              <ShieldCheck size={16} />
              <span>100% Client-Side · 0 Bytes Sent Over Network</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              color: 'var(--fv-text-primary)',
              margin: '0 0 1.25rem 0',
            }}>
              Every file tool.<br />
              <span style={{ color: 'var(--fv-brand-accent)' }}>Zero cloud uploads.</span>
            </h1>

            <p style={{
              fontSize: '1.12rem',
              lineHeight: 1.6,
              color: 'var(--fv-text-secondary)',
              margin: '0 0 2rem 0',
              maxWidth: '540px',
            }}>
              Convert, compress, isolate backgrounds, and inspect 3D models directly in your browser RAM. Powered by compiled WebAssembly and Web Workers.
            </p>

            {/* Embedded Universal Dropzone */}
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--fv-border-medium)',
              borderRadius: 'var(--fv-radius-lg)',
              padding: '1.5rem',
              boxShadow: 'var(--fv-shadow-md)',
            }}>
              <UniversalDropzone />
            </div>
          </div>

          {/* Right Column: 3D Spatial Canvas Viewport */}
          <div className="fv-dark-card" style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: '460px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <ExperimentalSpatialCanvas />
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. HARDWARE RUNTIME & ARCHITECTURE COMPARISON
          ===================================================================== */}
      <section className="fv-content-wrapper" style={{ paddingBottom: '5rem' }}>
        <ArchitectureComparisonWidget />
      </section>

      {/* =====================================================================
          3. INTERACTIVE CANVAS PLAYGROUND (Background Removal Demo)
          ===================================================================== */}
      <section className="fv-content-wrapper" style={{ paddingBottom: '5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--fv-color-emerald-700)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              <Sparkles size={15} />
              <span>Zero-API Client Algorithms</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 850, letterSpacing: '-0.03em', margin: '0 0 1rem 0' }}>
              Native computer vision running on your device.
            </h2>
            <p style={{ fontSize: '1.02rem', lineHeight: 1.6, color: 'var(--fv-text-secondary)', marginBottom: '1.5rem' }}>
              Traditional background removal tools pass your photos into cloud vision APIs, saving copies on remote servers. FileVerze performs Euclidean color-distance segmentation and alpha feathering entirely inside your browser's GPU-accelerated HTML5 Canvas.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/remove_bg" className="fv-btn-tactile fv-btn-primary">
                <span>Open Background Remover</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/gemini_watermark_remover" className="fv-btn-tactile fv-btn-secondary">
                <span>Watermark Cleaner</span>
              </Link>
            </div>
          </div>

          <div>
            <InteractiveBeforeAfterSlider />
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. FORMAT MATRIX & INSTANT LAUNCH DIRECTORY
          ===================================================================== */}
      <section className="fv-content-wrapper" style={{ paddingBottom: '6rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 850, letterSpacing: '-0.03em', margin: '0 0 0.5rem 0' }}>
            50+ Specialized In-Browser Tools
          </h2>
          <p style={{ color: 'var(--fv-text-secondary)', fontSize: '1rem', lineHeight: 1.5, margin: 0 }}>
            Every tool is completely free, runs client-side with no file size throttles, and requires no account.
          </p>

          {/* Category Filter Chips */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '1.5rem',
          }}>
            {[
              { id: 'all', label: 'All Tools' },
              { id: 'pdf', label: 'PDF Documents' },
              { id: 'image', label: 'Image & Vision' },
              { id: 'spatial', label: '3D, GIS & Fonts' },
              { id: 'dev', label: 'Data & Developer' },
              { id: 'ai', label: 'OCR & AI' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  background: activeCategory === cat.id ? '#090d16' : '#ffffff',
                  color: activeCategory === cat.id ? '#ffffff' : 'var(--fv-text-primary)',
                  border: '1px solid ' + (activeCategory === cat.id ? '#090d16' : 'var(--fv-border-medium)'),
                  borderRadius: '9999px',
                  padding: '6px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {filteredTools.map((tool) => (
            <Link
              key={tool.title}
              to={tool.path}
              className="fv-tactile-card"
              style={{
                padding: '1.5rem',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: 'var(--fv-text-primary)' }}>
                  {tool.title}
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--fv-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {tool.desc}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--fv-brand-accent)', fontSize: '0.82rem', fontWeight: 700, marginTop: '1.25rem' }}>
                <span>Launch Tool</span>
                <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =====================================================================
          5. MACHINE-READABLE ENDPOINTS & TRANSPARENCY BAR
          ===================================================================== */}
      <section style={{ background: '#ffffff', borderTop: '1px solid var(--fv-border-subtle)', padding: '3.5rem 0' }}>
        <div className="fv-content-wrapper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--fv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                <Terminal size={14} />
                <span>Open Documentation & Spec</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Machine-Readable & AI-Discoverable (GEO)
              </h3>
              <p style={{ color: 'var(--fv-text-secondary)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                FileVerze publishes official LLM endpoints according to the emerging AI documentation standard.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a href="/llms.txt" target="_blank" rel="noreferrer" className="fv-btn-tactile fv-btn-secondary" style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}>
                <FileText size={15} />
                <span>/llms.txt</span>
              </a>
              <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="fv-btn-tactile fv-btn-secondary" style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}>
                <Compass size={15} />
                <span>sitemap.xml</span>
              </a>
              <a href="https://github.com/viswakpullepu/FileVerse" target="_blank" rel="noreferrer" className="fv-btn-tactile fv-btn-secondary" style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}>
                <Code size={15} />
                <span>MIT Open Source</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Accessible Footer */}
      <footer style={{ background: '#020617', borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '2.5rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>
        <div className="fv-content-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ margin: 0, color: '#f8fafc', fontWeight: 700 }}>FileVerze Engine · 100% In-Browser Privacy</p>
            <p style={{ margin: '4px 0 0 0' }}>No server uploads. No logs. No tracking cookies. Zero telemetry egress.</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/" style={{ color: '#38bdf8', textDecoration: 'none' }}>Classic Mode</Link>
            <Link to="/faq" style={{ color: '#cbd5e1', textDecoration: 'none' }}>FAQ</Link>
            <a href="https://vishwak.tech" target="_blank" rel="noreferrer" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Vishwak Naidu</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

