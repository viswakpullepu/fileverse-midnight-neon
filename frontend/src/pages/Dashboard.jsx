import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import UniversalDropzone from '../components/UniversalDropzone';
import { 
  FileText, Image as ImageIcon, Video, Music, 
  Database, Code, Archive, Box, BookOpen, 
  Type, MessageSquare, Map, Scissors, Terminal, 
  Lock, Sparkles, FilePlus, FileMinus, FileUp, 
  RotateCw, Hash, Droplets, ImagePlus, Shield, 
  ShieldOff, Maximize, Replace, Settings2, 
  MonitorPlay, FastForward, Film, Wand2, Key,
  Braces, Link as LinkIcon, FileJson, 
  CaseSensitive, Type as TypeIcon, ShieldCheck,
  QrCode, Palette, AlignLeft, Unlock, FileCode,
  Regex, FileDiff
} from 'lucide-react';

const pdfTools = [
  { path: '/merge_pdf', title: 'Merge PDF', desc: 'Combine PDFs in the order you want with the easiest PDF merger available.', icon: FilePlus, color: '#7C3AED' },
  { path: '/split_pdf', title: 'Split PDF', desc: 'Separate one page or a whole set for easy conversion into independent PDF files.', icon: Scissors, color: '#7C3AED' },
  { path: '/pdf_to_word', title: 'PDF to Word', desc: 'Convert PDF files into editable Microsoft Word (.docx) documents in your browser.', icon: FileText, color: '#7C3AED' },
  { path: '/word_to_pdf', title: 'Word to PDF', desc: 'Convert Word DOCX documents directly into clean vector PDF files locally.', icon: FileText, color: '#0F172A' },
  { path: '/compress_pdf', title: 'Compress PDF', desc: 'Shrink PDF file sizes with smart canvas and structure compression.', icon: Maximize, color: '#7C3AED' },
  { path: '/excel_to_pdf', title: 'Excel to PDF', desc: 'Convert spreadsheets (.xlsx, .xls) into clean formatted PDF tables.', icon: Database, color: '#0F172A' },
  { path: '/powerpoint_to_pdf', title: 'PowerPoint to PDF', desc: 'Convert slide presentations (.pptx, .ppt) into landscape slide PDFs.', icon: Film, color: '#7C3AED' },
  { path: '/pdf_to_image', title: 'PDF to Image', desc: 'Convert every page of a PDF document into a high-quality JPG image instantly.', icon: ImageIcon, color: '#22D3EE' },
  { path: '/image_to_pdf', title: 'Image to PDF', desc: 'Convert JPG, PNG, and more to PDF in seconds. Easily adjust orientation and margins.', icon: ImagePlus, color: '#22D3EE' },
  { path: '/remove_pages', title: 'Remove pages', desc: 'Remove pages from a PDF document in a flash.', icon: FileMinus, color: '#7C3AED' },
  { path: '/extract_pages', title: 'Extract pages', desc: 'Get a new document containing only the desired pages.', icon: FileUp, color: '#7C3AED' },
  { path: '/rotate_pdf', title: 'Rotate PDF', desc: 'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!', icon: RotateCw, color: '#7C3AED' },
  { path: '/add_page_numbers', title: 'Add page numbers', desc: 'Add page numbers into PDFs with ease. Choose your positions, dimensions, typography.', icon: Hash, color: '#7C3AED' },
  { path: '/add_watermark', title: 'Add watermark', desc: 'Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position.', icon: Droplets, color: '#7C3AED' },
  { path: '/unlock_pdf', title: 'Unlock PDF', desc: 'Remove PDF password security, giving you the freedom to use your PDFs as you want.', icon: ShieldOff, color: '#0F172A' },
  { path: '/protect_pdf', title: 'Protect PDF', desc: 'Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.', icon: Shield, color: '#0F172A' },
];

const imageTools = [
  { path: '/remove_background', title: 'Remove Background', desc: 'Isolate subjects and export transparent PNGs directly in your browser.', icon: Wand2, color: '#3b82f6' },
  { path: '/compress_image', title: 'Compress Image', desc: 'Compress JPG, PNG, SVG, and GIFs while saving space and maintaining quality.', icon: Maximize, color: '#f7c324' },
  { path: '/gemini_watermark_remover', title: 'Gemini Watermark Remover', desc: 'Remove the visible Google Gemini watermark from images natively.', icon: Sparkles, color: '#f7c324' },
  { path: '/resize_image', title: 'Resize Image', desc: 'Define your dimensions, by percent or pixel, and resize your JPG, PNG, and GIF images.', icon: Maximize, color: '#f7c324' },
  { path: '/convert_image', title: 'Convert Image', desc: 'Convert PNG to JPG, JPG to PNG, or to WEBP for the web.', icon: Replace, color: '#f7c324' },
  { path: '/rotate_image', title: 'Rotate Image', desc: 'Rotate many images at once. Choose to rotate only landscape or portrait images.', icon: RotateCw, color: '#f7c324' },
  { path: '/grayscale_image', title: 'Grayscale Image', desc: 'Apply a black-and-white filter to your images instantly.', icon: ImageIcon, color: '#f7c324' },
  { path: '/image_blur', title: 'Image Blur', desc: 'Obscure private information or create a background blur effect.', icon: Droplets, color: '#f7c324' },
  { path: '/bmp_to_png', title: 'BMP to PNG', desc: 'Modernize old, uncompressed formats into optimized PNGs.', icon: Replace, color: '#f7c324' },
  { path: '/svg_to_png', title: 'SVG to PNG', desc: 'Convert vector SVG graphics into raster PNG images.', icon: Replace, color: '#f7c324' },
  { path: '/image_to_ico', title: 'Image to ICO', desc: 'Generate favicons for your websites instantly.', icon: ImageIcon, color: '#f7c324' },
];

const videoTools = [
  { path: '/video_to_gif', title: 'Video to GIF', desc: 'Convert MP4, MOV, or WEBM videos into animated GIFs.', icon: Film, color: '#315ea5' },
  { path: '/gif_to_mp4', title: 'GIF to MP4', desc: 'Convert animated GIFs into MP4 videos for better compression.', icon: Film, color: '#315ea5' },
  { path: '/webm_to_mp4', title: 'WEBM to MP4', desc: 'Make web videos compatible with all players by converting to MP4.', icon: Replace, color: '#315ea5' },
  { path: '/trim_video', title: 'Trim Video', desc: 'Cut out unwanted parts of a video locally in your browser.', icon: Scissors, color: '#315ea5' },
  { path: '/video_to_audio', title: 'Extract Audio', desc: 'Extract the MP3/WAV audio track from any video file.', icon: Music, color: '#315ea5' },
  { path: '/mute_video', title: 'Mute Video', desc: 'Strip audio tracks from any video natively.', icon: Music, color: '#315ea5' },
  { path: '/change_video_speed', title: 'Change Video Speed', desc: 'Speed up or slow down videos locally without losing quality.', icon: FastForward, color: '#315ea5' },
  { path: '/extract_video_frames', title: 'Extract Video Frames', desc: 'Turn video files into a sequence of JPG images.', icon: ImageIcon, color: '#315ea5' },
  { path: '/reverse_video', title: 'Reverse Video', desc: 'Play videos completely backwards!', icon: RotateCw, color: '#315ea5' },
];

const devTools = [
  { path: '/csv_to_json', title: 'CSV to JSON', desc: 'Parse and convert spreadsheet data into JSON arrays.', icon: FileJson, color: '#2a7433' },
  { path: '/json_to_csv', title: 'JSON to CSV', desc: 'Convert JSON arrays back into spreadsheet CSV format.', icon: Database, color: '#2a7433' },
  { path: '/xml_to_json', title: 'XML to JSON', desc: 'Convert XML data to formatted JSON instantly.', icon: FileCode, color: '#2a7433' },
  { path: '/json_formatter', title: 'JSON Formatter & Minifier', desc: 'Validate, format, and minify JSON strings securely.', icon: Braces, color: '#2a7433' },
  { path: '/markdown_to_html', title: 'Markdown to HTML', desc: 'Write Markdown and see the HTML output instantly.', icon: FileDiff, color: '#333333' },
  { path: '/html_to_markdown', title: 'HTML to Markdown', desc: 'Convert HTML documents into clean Markdown syntax.', icon: FileDiff, color: '#333333' },
  { path: '/regex_tester', title: 'Regex Tester', desc: 'Test and debug your Regular Expressions instantly.', icon: Regex, color: '#BE5CA9' },
  { path: '/base64_encode_decode', title: 'Base64 Encoder/Decoder', desc: 'Securely translate text into encoded bytes.', icon: Braces, color: '#333333' },
  { path: '/url_encode_decode', title: 'URL Encoder/Decoder', desc: 'Safely parse complicated or broken URLs.', icon: LinkIcon, color: '#333333' },
  { path: '/hash_generator', title: 'Hash Generator', desc: 'Calculate SHA-256, SHA-1, and MD5 hashes locally.', icon: Key, color: '#315ea5' },
  { path: '/bcrypt_generator', title: 'Bcrypt Generator', desc: 'Generate and verify Bcrypt hashes securely.', icon: Key, color: '#315ea5' },
  { path: '/jwt_decoder', title: 'JWT Decoder', desc: 'Decode JSON Web Tokens instantly to view their header and payload.', icon: Unlock, color: '#315ea5' },
  { path: '/qrcode_generator', title: 'QR Code Generator', desc: 'Instantly turn links or text into scannable QR codes.', icon: QrCode, color: '#333333' },
  { path: '/color_converter', title: 'Color Converter', desc: 'Pick a color to instantly convert it between HEX, RGB, and HSL.', icon: Palette, color: '#f7c324' },
  { path: '/lorem_ipsum', title: 'Lorem Ipsum Generator', desc: 'Generate placeholder text instantly for your designs.', icon: AlignLeft, color: '#333333' },
  { path: '/text_case_converter', title: 'Text Case Converter', desc: 'Instantly switch between camelCase, PascalCase, snake_case, UPPERCASE, and more.', icon: CaseSensitive, color: '#333333' },
  { path: '/word_character_counter', title: 'Word & Character Counter', desc: 'Count words, characters, sentences, paragraphs, and reading time.', icon: TypeIcon, color: '#333333' },
  { path: '/uuid_generator', title: 'UUID v4 Generator', desc: 'Quickly create cryptographically secure UUIDs.', icon: ShieldCheck, color: '#315ea5' },
  { path: '/html_formatter', title: 'HTML Formatter & Minifier', desc: 'Beautify messy HTML or compress it to save space.', icon: Code, color: '#333333' },
  { path: '/css_formatter', title: 'CSS Formatter & Minifier', desc: 'Organize CSS stylesheets or crunch them down for production.', icon: Code, color: '#333333' }
];

const phase2Tools = [
  { path: '/cyber_forensics', title: 'Cyber Forensics Lab', desc: 'Inspect EXIF, GPS, hashes, magic bytes, entropy, and detect file masquerading.', icon: Terminal, color: '#0284c7' },
  { path: '/subtitle_converter', title: 'Subtitle & Captions', desc: 'Convert SRT, VTT, ASS, TXT and shift sync offsets in real-time.', icon: MessageSquare, color: '#0ea5e9' },
  { path: '/ocr_extractor', title: 'OCR AI Text Extractor', desc: 'Extract text from scanned images, screenshots, and receipts via browser AI.', icon: Sparkles, color: '#8b5cf6' },
  { path: '/threed_converter', title: '3D & CAD Studio', desc: 'Interactive 3D geometry viewer, polycount inspector, and STL exporter.', icon: Box, color: '#f59e0b' },
  { path: '/gis_converter', title: 'GIS & Spatial Data', desc: 'Convert GeoJSON, Google Earth KML, and CSV coordinates natively.', icon: Map, color: '#10b981' },
  { path: '/ebook_converter', title: 'E-Book & EPUB Studio', desc: 'Build standard EPUB books from text or extract and read existing EPUBs.', icon: BookOpen, color: '#ec4899' },
  { path: '/font_converter', title: 'Font Studio & Inspector', desc: 'Inspect glyphs, test typography, and generate CSS @font-face rules.', icon: Type, color: '#6366f1' },
];

import HeroSection from '../components/HeroSection';

const allTools = [...phase2Tools, ...pdfTools, ...imageTools, ...videoTools, ...devTools];

const SkeletonCard = () => (
  <div className="tool-card skeleton" style={{
    padding: '1.5rem', height: '140px', border: '1px solid #eaeaea', borderRadius: '8px', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
      <div className="skeleton-icon" style={{ width: '32px', height: '32px', borderRadius: '4px', backgroundColor: '#e0e0e0', marginRight: '1rem' }}></div>
      <div className="skeleton-title" style={{ height: '20px', width: '60%', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
    </div>
    <div className="skeleton-text" style={{ height: '14px', width: '100%', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
    <div className="skeleton-text" style={{ height: '14px', width: '80%', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
  </div>
);

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [recentTools, setRecentTools] = useState([]);
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    // Check local storage for user history
    try {
      const history = JSON.parse(localStorage.getItem('recentTools') || '[]');
      if (history.length > 0) {
        setIsReturningUser(true);
        // Map paths back to full tool objects
        const resolvedTools = history.map(path => {
          return allTools.find(t => t.path === path);
        }).filter(Boolean).slice(0, 4); // Show top 4
        setRecentTools(resolvedTools);
      }
    } catch (e) {
      console.error('Failed to load recent tools', e);
    }

    // Simulate short network fetch for skeletal loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* STUDIO WORKSPACE HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.35rem 0.9rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '9999px', color: '#475569', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          <span>100% In-Browser Studio • 50+ Tools</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 850, letterSpacing: '-0.03em', color: '#111827', margin: 0 }}>
          {isReturningUser ? 'Welcome Back to Your Workspace' : 'File Tools Studio'}
        </h1>
        <p style={{ fontSize: '1rem', color: '#64748b', maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
          Drop any file below or select a dedicated tool. Everything processes locally in your browser memory.
        </p>
      </div>

      {/* UNIVERSAL SMART DROPZONE */}
      <UniversalDropzone />

      <div style={{ marginTop: '3rem' }} id="all-tools-grid">
        {/* RECENTLY USED SECTION */}
      {!isLoading && recentTools.length > 0 && (
        <>
          <div className="section-header">
            <h2 className="section-title">
              <Clock size={24} className="section-icon" /> Recently Used
            </h2>
          </div>
          <div className="tools-grid">
            {recentTools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Link to={tool.path} key={`recent-${index}`} className="tool-card fade-in">
                  <div className="tool-card-header">
                    <div className="tool-icon-wrapper" style={{ color: tool.color }}>
                      <Icon size={32} strokeWidth={1.5} />
                    </div>
                    <h3 className="tool-title">{tool.title}</h3>
                  </div>
                  <p className="tool-desc">{tool.desc}</p>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* PHASE 2 & POWER TOOLS SECTION */}
      <div className="section-header">
        <h2 className="section-title">⭐ Phase 2 & Next-Gen Tools</h2>
      </div>
      <div className="tools-grid">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          phase2Tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Link to={tool.path} key={index} className="tool-card fade-in">
                <div className="tool-card-header">
                  <div className="tool-icon-wrapper" style={{ color: tool.color }}>
                    <Icon size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="tool-title">{tool.title}</h3>
                </div>
                <p className="tool-desc">{tool.desc}</p>
              </Link>
            );
          })
        )}
      </div>

      {/* PDF TOOLS SECTION */}
      <div className="section-header">
        <h2 className="section-title">PDF Tools</h2>
      </div>
      <div className="tools-grid">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          pdfTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Link to={tool.path} key={index} className="tool-card fade-in">
                <div className="tool-card-header">
                  <div className="tool-icon-wrapper" style={{ color: tool.color }}>
                    <Icon size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="tool-title">{tool.title}</h3>
                </div>
                <p className="tool-desc">{tool.desc}</p>
              </Link>
            );
          })
        )}
      </div>

      {/* IMAGE TOOLS SECTION */}
      <div className="section-header">
        <h2 className="section-title">Image Tools</h2>
      </div>
      <div className="tools-grid">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          imageTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Link to={tool.path} key={index} className="tool-card fade-in">
                <div className="tool-card-header">
                  <div className="tool-icon-wrapper" style={{ color: tool.color }}>
                    <Icon size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="tool-title">{tool.title}</h3>
                </div>
                <p className="tool-desc">{tool.desc}</p>
              </Link>
            );
          })
        )}
      </div>

      {/* VIDEO TOOLS SECTION */}
      <div className="section-header">
        <h2 className="section-title">Video Tools</h2>
      </div>
      <div className="tools-grid">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          videoTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Link to={tool.path} key={index} className="tool-card fade-in">
                <div className="tool-card-header">
                  <div className="tool-icon-wrapper" style={{ color: tool.color }}>
                    <Icon size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="tool-title">{tool.title}</h3>
                </div>
                <p className="tool-desc">{tool.desc}</p>
              </Link>
            );
          })
        )}
      </div>

      {/* DEV TOOLS SECTION */}
      <div className="section-header">
        <h2 className="section-title">Data & Dev Tools</h2>
      </div>
      <div className="tools-grid">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          devTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Link to={tool.path} key={index} className="tool-card fade-in">
                <div className="tool-card-header">
                  <div className="tool-icon-wrapper" style={{ color: tool.color }}>
                    <Icon size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="tool-title">{tool.title}</h3>
                </div>
                <p className="tool-desc">{tool.desc}</p>
              </Link>
            );
          })
        )}
      </div>
      
      {/* Privacy & Zero-Server Guarantee Section */}
      <div className="coming-soon-section" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', margin: '4rem 2rem 2rem 2rem', padding: '3rem 2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', color: '#059669', padding: '0.35rem 1rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '1rem' }}>
          <span>🔒 100% Client-Side & Private</span>
        </div>
        <h2 className="coming-soon-title" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>
          Zero Server Uploads • Everything Runs in Your Browser
        </h2>
        <p className="coming-soon-desc" style={{ maxWidth: '680px', margin: '0.5rem auto 1.5rem auto', color: '#64748b' }}>
          All 50+ tools in FileVerze process documents, media, spreadsheets, 3D models, subtitles, and code directly on your local device CPU/GPU. Your files never leave your computer.
        </p>
      </div>

      {/* SEO & GEO Semantic Knowledge & FAQ Section */}
      <section className="faq-section" style={{ maxWidth: '960px', margin: '0 auto 4rem auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Learn how FileVerze provides private, browser-native file conversions with zero server uploads.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
          {[
            {
              q: 'How does 100% in-browser conversion work?',
              a: 'FileVerze uses WebAssembly (WASM), WebGL, HTML5 Canvas, and modern Web APIs. Conversions are calculated locally in your browser memory (RAM) and CPU threads—no files are ever uploaded across the internet.'
            },
            {
              q: 'Is FileVerze free with unlimited conversions?',
              a: 'Yes, FileVerze is completely free. There are no subscriptions, no file size throttles, no account registrations, and no watermarks placed on your converted files.'
            },
            {
              q: 'Can I use FileVerze for confidential or legal files?',
              a: 'Absolutely. Because files are processed entirely on your local machine and never leave your web browser, FileVerze satisfies strict confidentiality, GDPR, and enterprise NDA security requirements.'
            },
            {
              q: 'Does FileVerze work offline without internet?',
              a: 'Yes. FileVerze is built as a Progressive Web App (PWA). Once loaded in your browser, all tool scripts and workers are cached locally, allowing you to convert files even with zero network connection.'
            },
            {
              q: 'How do I convert Word (.docx) or Excel (.xlsx) to PDF?',
              a: 'Drop your file into the Universal Dropzone or navigate to Word to PDF / Excel to PDF. FileVerze parses the OpenXML package in memory and renders crisp vector PDF tables and pages instantly.'
            },
            {
              q: 'What 3D and GIS formats can I inspect and convert?',
              a: 'FileVerze includes a WebGL 3D viewport for binary STL meshes and an interactive geospatial engine for bidirectional conversion between GeoJSON, Google Earth KML, and CSV coordinate tables.'
            }
          ].map((item, idx) => (
            <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
                {item.q}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}
