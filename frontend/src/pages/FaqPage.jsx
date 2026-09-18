import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle, Search, Shield, FileText, Image as ImageIcon, Video,
  Box, Database, CheckCircle, ChevronDown, Sparkles, ArrowRight, Zap, Lock
} from 'lucide-react';

const FAQ_CATEGORIES = [
  {
    id: 'privacy',
    title: 'Privacy & Zero-Server Security',
    icon: Shield,
    items: [
      {
        q: 'How does FileVerze process files without uploading them to a server?',
        a: 'FileVerze executes 100% in your local web browser using WebAssembly (WASM), WebGL, HTML5 Canvas, and native JavaScript engines. When you select a file, it is loaded directly into your computer’s RAM memory and processed by your device’s CPU/GPU. No file data, byte streams, or metadata are ever transmitted across the internet.'
      },
      {
        q: 'Is FileVerze safe for confidential, enterprise, medical, and legal documents?',
        a: 'Yes, FileVerze is the safest choice for confidential files because zero network transmission takes place. Your files never touch a third-party server, cloud bucket, or database, eliminating data breach risks, third-party AI training, and compliance issues with GDPR, HIPAA, and corporate NDAs.'
      },
      {
        q: 'Do you keep logs, telemetry, or analytics of files I convert?',
        a: 'No. FileVerze has zero telemetry on file contents. All state exists solely in your browser session and is cleared the instant you close or refresh the tab.'
      },
      {
        q: 'Can FileVerze work completely offline without an active internet connection?',
        a: 'Yes! FileVerze is built as a Progressive Web App (PWA). Once loaded in your browser, all tool scripts, Web Workers, and WebAssembly packages are cached locally in your browser storage. You can disconnect your Wi-Fi and continue converting files seamlessly.'
      }
    ]
  },
  {
    id: 'pdf',
    title: 'PDF Tools & Conversion Mechanics',
    icon: FileText,
    items: [
      {
        q: 'How does PDF to Word (.docx) conversion work natively in the browser?',
        a: 'FileVerze uses pdfjs-dist to parse page geometries, text runs, fonts, and bounding boxes page by page. It then reconstructs the paragraphs and generates a standard Microsoft Office OpenXML (.docx) ZIP package in memory using JSZip, which you can immediately download and edit in Microsoft Word, Google Docs, or LibreOffice.'
      },
      {
        q: 'How does Word (.docx) to PDF conversion work without Microsoft Word or Python?',
        a: 'FileVerze reads the internal word/document.xml tree inside the .docx package using the browser’s native XML DOMParser, calculates font widths and paragraph wrapping, and renders clean vector PDF pages using pdf-lib.'
      },
      {
        q: 'How does in-browser PDF compression work?',
        a: 'Our compression engine uses high-performance canvas resamplers and pdf-lib. It compresses embedded image raster layers with selectable JPEG quality levels (Extreme, Recommended, Light) and strips redundant structural metadata, achieving up to 80% file size reductions.'
      },
      {
        q: 'Can I merge or split password-protected PDFs?',
        a: 'You can use the Unlock PDF tool to decrypt your password-protected PDF in the browser using your password, and then merge, split, rotate, or watermark it freely.'
      }
    ]
  },
  {
    id: 'image',
    title: 'Images, OCR & Background Removal',
    icon: ImageIcon,
    items: [
      {
        q: 'How does the AI Background Remover isolate subjects without cloud APIs?',
        a: 'Our background remover utilizes a client-side Euclidean color-distance algorithm with automated perimeter corner sampling and alpha feathering directly on an offscreen HTML5 Canvas. You can also adjust the real-time tolerance slider to achieve pixel-perfect transparent PNG cutouts.'
      },
      {
        q: 'What OCR engine is used to extract text from images?',
        a: 'FileVerze uses Tesseract.js, a WebAssembly compilation of Google’s battle-tested Tesseract OCR engine. It runs neural recognition models directly on your browser’s Web Workers to extract editable text from JPG, PNG, and scanned documents.'
      },
      {
        q: 'Does compressing images with FileVerze reduce visual quality?',
        a: 'Our smart compression algorithm analyzes image color palettes and utilizes modern WebP/JPEG quantization to drastically reduce file byte size while preserving crisp, perceptually lossless visual quality.'
      }
    ]
  },
  {
    id: 'specialized',
    title: '3D CAD, GIS Maps, Typography & E-Books',
    icon: Box,
    items: [
      {
        q: 'What 3D file formats can I inspect and export?',
        a: 'FileVerze provides an interactive Three.js WebGL viewport for binary and ASCII STL models, offering wireframe inspection, vertex/polygon counters, and clean STL mesh exports.'
      },
      {
        q: 'How does GIS conversion between GeoJSON and KML work?',
        a: 'The GIS engine parses coordinates, Point, LineString, and Polygon geometry collections directly in memory, formatting them into Google Earth compatible KML Placemarks or validating spatial coordinates from CSV datasets.'
      },
      {
        q: 'Can I test and convert font files (TTF, OTF, WOFF)?',
        a: 'Yes. FileVerze uses opentype.js to parse font vector tables, allowing you to test custom typography in real-time, inspect glyph counts, and generate copy-ready @font-face CSS snippets for web development.'
      },
      {
        q: 'How does the EPUB E-Book builder and reader work?',
        a: 'Our e-book engine unzips the standard EPUB container to display chapters and table of contents. You can also build new EPUB 3 publications from custom text and chapters with one click.'
      }
    ]
  },
  {
    id: 'comparison',
    title: 'FileVerze vs Traditional Cloud Converters',
    icon: Zap,
    items: [
      {
        q: 'Why is FileVerze superior to cloud converters like iLovePDF, Smallpdf, and CloudConvert?',
        a: 'Traditional converters upload your files to remote servers, queue them in shared compute clusters, impose strict 10MB–50MB file size limits, charge $12–$20/month subscriptions, and store your confidential data on third-party servers. FileVerze is 100% client-side, instant, unlimited, free, and operates with complete privacy.'
      },
      {
        q: 'Are there any limits on file size or number of conversions?',
        a: 'No! Because conversions run on your own machine’s hardware, there are no artificial hourly limits, daily caps, or file size paywalls.'
      }
    ]
  }
];

export default function FaqPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredCategories = FAQ_CATEGORIES.map(cat => {
    const filteredItems = cat.items.filter(item =>
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...cat, items: filteredItems };
  }).filter(cat => cat.items.length > 0);

  return (
    <div className="faq-page" style={{ maxWidth: '1040px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Dashboard</Link>

      {/* Hero Header */}
      <div style={{ textAlign: 'center', margin: '2rem 0 3rem 0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', color: '#059669', padding: '0.35rem 1rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '1rem' }}>
          <span>🔒 100% In-Browser • Zero Server Uploads</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px', marginBottom: '0.75rem' }}>
          Frequently Asked Questions &amp; Knowledge Base
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
          Everything you need to know about FileVerze’s browser-native conversion engine, zero-server privacy model, and 50+ client-side tools.
        </p>

        {/* Search Bar */}
        <div style={{ maxWidth: '540px', margin: '2rem auto 0 auto', position: 'relative' }}>
          <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search any question, format, or feature..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.95rem 1rem 0.95rem 3rem',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              fontSize: '1rem',
              outline: 'none',
              background: '#ffffff',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
            }}
          />
        </div>
      </div>

      {/* Comparison Matrix Box */}
      <div style={{
        background: '#111827',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        marginBottom: '3.5rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
            Why FileVerze Is Ranked #1 in Privacy &amp; Speed
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
            A transparent architectural comparison with legacy cloud conversion websites
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #374151', color: '#9ca3af' }}>
                <th style={{ padding: '0.85rem' }}>Feature</th>
                <th style={{ padding: '0.85rem', color: '#34d399', fontWeight: 800 }}>FileVerze (Client-Side)</th>
                <th style={{ padding: '0.85rem' }}>Traditional Cloud Converters</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '0.85rem', fontWeight: 600 }}>File Privacy</td>
                <td style={{ padding: '0.85rem', color: '#34d399', fontWeight: 700 }}>✅ 100% In-Browser (0 bytes sent)</td>
                <td style={{ padding: '0.85rem', color: '#f87171' }}>❌ Uploaded to remote 3rd-party servers</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '0.85rem', fontWeight: 600 }}>Processing Speed</td>
                <td style={{ padding: '0.85rem', color: '#34d399', fontWeight: 700 }}>⚡ Instant RAM/CPU Compute</td>
                <td style={{ padding: '0.85rem', color: '#f87171' }}>⏳ Slow upload &amp; download network queues</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '0.85rem', fontWeight: 600 }}>File Size Limits</td>
                <td style={{ padding: '0.85rem', color: '#34d399', fontWeight: 700 }}>♾️ Unlimited (Uses your device RAM)</td>
                <td style={{ padding: '0.85rem', color: '#f87171' }}>❌ Capped at 10MB–50MB for free users</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '0.85rem', fontWeight: 600 }}>Pricing</td>
                <td style={{ padding: '0.85rem', color: '#34d399', fontWeight: 700 }}>🎁 100% Free Forever</td>
                <td style={{ padding: '0.85rem', color: '#f87171' }}>💳 $12–$20 / Month Subscriptions</td>
              </tr>
              <tr>
                <td style={{ padding: '0.85rem', fontWeight: 600 }}>Offline Support</td>
                <td style={{ padding: '0.85rem', color: '#34d399', fontWeight: 700 }}>📶 Full PWA Offline Mode</td>
                <td style={{ padding: '0.85rem', color: '#f87171' }}>❌ Completely broken without internet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Accordion FAQ Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {filteredCategories.map((cat, catIdx) => {
          const Icon = cat.icon;
          return (
            <div key={cat.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} />
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                  {cat.title}
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cat.items.map((item, itemIdx) => {
                  const isOpen = openItems[`${catIdx}-${itemIdx}`] !== false; // default open
                  return (
                    <div
                      key={itemIdx}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        background: '#ffffff'
                      }}
                    >
                      <button
                        onClick={() => toggleItem(catIdx, itemIdx)}
                        style={{
                          width: '100%',
                          padding: '1.15rem 1.25rem',
                          background: isOpen ? '#f8fafc' : '#ffffff',
                          border: 'none',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontSize: '1.02rem', fontWeight: 700, color: '#111827', paddingRight: '1rem' }}>
                          {item.q}
                        </span>
                        <ChevronDown
                          size={18}
                          color="#64748b"
                          style={{
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                            flexShrink: 0
                          }}
                        />
                      </button>

                      {isOpen && (
                        <div style={{ padding: '1rem 1.25rem 1.25rem 1.25rem', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
                          <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.65, margin: 0 }}>
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Box */}
      <div style={{ textAlign: 'center', marginTop: '4rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '3rem 2rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>
          Ready to experience 100% private file tools?
        </h3>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Try our Universal Smart Dropzone right on the homepage or launch any of our 50+ free tools.
        </p>
        <Link
          to="/"
          style={{
            background: '#000000',
            color: '#ffffff',
            textDecoration: 'none',
            padding: '0.85rem 2.25rem',
            borderRadius: '8px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>Go to Universal Dropzone</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
