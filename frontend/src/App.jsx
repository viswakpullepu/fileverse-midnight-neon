import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ChevronDown, Grid, Menu, X } from 'lucide-react';
import Lenis from 'lenis';
import SEO from './components/SEO';
import GlobalDropOverlay from './components/GlobalDropOverlay';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import UniversalConverter from './pages/UniversalConverter';

// Lazy-loaded tools for instant initial page loading & granular browser caching
const MergePDF = lazy(() => import('./pages/tools/MergePDF'));
const GeminiWatermarkRemover = lazy(() => import('./pages/tools/GeminiWatermarkRemover'));
const SplitPDF = lazy(() => import('./pages/tools/SplitPDF'));
const ExtractPages = lazy(() => import('./pages/tools/ExtractPages'));
const RemovePages = lazy(() => import('./pages/tools/RemovePages'));
const RotatePDF = lazy(() => import('./pages/tools/RotatePDF'));
const AddPageNumbers = lazy(() => import('./pages/tools/AddPageNumbers'));
const ConvertImage = lazy(() => import('./pages/tools/ConvertImage'));
const CompressImage = lazy(() => import('./pages/tools/CompressImage'));
const VideoToGif = lazy(() => import('./pages/tools/VideoToGif'));
const VideoToAudio = lazy(() => import('./pages/tools/VideoToAudio'));
const ImageToPDF = lazy(() => import('./pages/tools/ImageToPDF'));
const PdfToImage = lazy(() => import('./pages/tools/PdfToImage'));
const PdfToWord = lazy(() => import('./pages/tools/PdfToWord'));
const WordToPdf = lazy(() => import('./pages/tools/WordToPdf'));
const ExcelToPdf = lazy(() => import('./pages/tools/ExcelToPdf'));
const PowerpointToPdf = lazy(() => import('./pages/tools/PowerpointToPdf'));
const CompressPdfBackend = lazy(() => import('./pages/tools/CompressPdfBackend'));
const ProtectPDF = lazy(() => import('./pages/tools/ProtectPDF'));
const UnlockPDF = lazy(() => import('./pages/tools/UnlockPDF'));
const SignPDF = lazy(() => import('./pages/tools/SignPDF'));
const ExifStripper = lazy(() => import('./pages/tools/ExifStripper'));
const TrimVideo = lazy(() => import('./pages/tools/TrimVideo'));
const AddWatermark = lazy(() => import('./pages/tools/AddWatermark'));
const HashGenerator = lazy(() => import('./pages/tools/HashGenerator'));
const JsonToCsv = lazy(() => import('./pages/tools/JsonToCsv'));
const GifToMp4 = lazy(() => import('./pages/tools/GifToMp4'));
const SvgToPng = lazy(() => import('./pages/tools/SvgToPng'));
const ImageToIco = lazy(() => import('./pages/tools/ImageToIco'));
const ResizeImage = lazy(() => import('./pages/tools/ResizeImage'));
const RotateImage = lazy(() => import('./pages/tools/RotateImage'));
const GrayscaleImage = lazy(() => import('./pages/tools/GrayscaleImage'));
const ImageBlur = lazy(() => import('./pages/tools/ImageBlur'));
const BmpToPng = lazy(() => import('./pages/tools/BmpToPng'));
const WebmToMp4 = lazy(() => import('./pages/tools/WebmToMp4'));
const MuteVideo = lazy(() => import('./pages/tools/MuteVideo'));
const ChangeVideoSpeed = lazy(() => import('./pages/tools/ChangeVideoSpeed'));
const ExtractVideoFrames = lazy(() => import('./pages/tools/ExtractVideoFrames'));
const ReverseVideo = lazy(() => import('./pages/tools/ReverseVideo'));
const RemoveBackground = lazy(() => import('./pages/tools/RemoveBackground'));
const CsvToJson = lazy(() => import('./pages/tools/CsvToJson'));
const Base64EncodeDecode = lazy(() => import('./pages/tools/Base64EncodeDecode'));
const UrlEncodeDecode = lazy(() => import('./pages/tools/UrlEncodeDecode'));
const TextCaseConverter = lazy(() => import('./pages/tools/TextCaseConverter'));
const WordCharacterCounter = lazy(() => import('./pages/tools/WordCharacterCounter'));
const UuidGenerator = lazy(() => import('./pages/tools/UuidGenerator'));
const HtmlFormatter = lazy(() => import('./pages/tools/HtmlFormatter'));
const CssFormatter = lazy(() => import('./pages/tools/CssFormatter'));
const JsonFormatter = lazy(() => import('./pages/tools/JsonFormatter'));
const QrCodeGenerator = lazy(() => import('./pages/tools/QrCodeGenerator'));
const ColorConverter = lazy(() => import('./pages/tools/ColorConverter'));
const LoremIpsumGenerator = lazy(() => import('./pages/tools/LoremIpsumGenerator'));
const JwtDecoder = lazy(() => import('./pages/tools/JwtDecoder'));
const MarkdownToHtml = lazy(() => import('./pages/tools/MarkdownToHtml'));
const HtmlToMarkdown = lazy(() => import('./pages/tools/HtmlToMarkdown'));
const RegexTester = lazy(() => import('./pages/tools/RegexTester'));
const BcryptGenerator = lazy(() => import('./pages/tools/BcryptGenerator'));
const XmlToJson = lazy(() => import('./pages/tools/XmlToJson'));
const HevcToMp4 = lazy(() => import('./pages/tools/HevcToMp4'));
const SubtitleConverter = lazy(() => import('./pages/tools/SubtitleConverter'));
const GisConverter = lazy(() => import('./pages/tools/GisConverter'));
const ThreeDConverter = lazy(() => import('./pages/tools/ThreeDConverter'));
const EbookConverter = lazy(() => import('./pages/tools/EbookConverter'));
const FontConverter = lazy(() => import('./pages/tools/FontConverter'));
const OcrExtractor = lazy(() => import('./pages/tools/OcrExtractor'));
const CyberForensicsInvestigator = lazy(() => import('./pages/tools/CyberForensicsInvestigator'));
const FaqPage = lazy(() => import('./pages/FaqPage'));

function App() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const imageTools = [
    { title: 'Remove Background', icon: '✂️', description: 'Instantly remove backgrounds from images.', path: '/remove_bg' },
    { title: 'Gemini Watermark Remover', icon: '✨', description: 'Remove the visible Google Gemini watermark from images.', path: '/gemini_watermark_remover' },
    { title: 'Resize Image', icon: '📏', description: 'Change dimensions of any image.', path: '#' },
    { title: 'Compress Image', icon: '🗜️', description: 'Reduce file size without losing quality.', path: '#' },
    { title: 'Convert to WebP', icon: '🖼️', description: 'Optimize images for the web.', path: '#' },
  ];
  const headerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Initialize Lenis smooth inertia scrolling
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.8,
      infinite: false,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
    
    // Track recently visited tools
    if (location.pathname !== '/' && !location.pathname.startsWith('/convert/')) {
      try {
        const recent = JSON.parse(localStorage.getItem('recentTools') || '[]');
        // Add new path, remove duplicates, keep top 4
        const updated = [location.pathname, ...recent.filter(p => p !== location.pathname)].slice(0, 4);
        localStorage.setItem('recentTools', JSON.stringify(updated));
        localStorage.setItem('hasVisited', 'true');
      } catch (e) {
        console.error('Local storage error:', e);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const closeDropdown = () => setActiveDropdown(null);

  return (
    <div className="app-container">
      {/* Universal Full-Screen Drop Overlay */}
      <GlobalDropOverlay />

      {/* Dynamic SEO Meta & Title Manager */}
      <SEO />

      <header className="header" ref={headerRef}>
        <div className="header-left">
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} color="#111" /> : <Menu size={24} color="#111" />}
          </button>
          
          <Link to="/" className="logo" onClick={closeDropdown} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="chrome" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="25%" stopColor="#94a3b8" />
                  <stop offset="50%" stopColor="#f8fafc" />
                  <stop offset="75%" stopColor="#64748b" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
                <linearGradient id="glass" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.7)" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              {/* Back folder tab */}
              <path d="M4 12 C 4 6, 8 6, 10 8 L 13 11 L 26 11 C 28 11, 28 13, 28 15" 
                    stroke="url(#chrome)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              {/* Infinity loop front */}
              <path d="M 4 20 C 4 12, 14 12, 16 20 C 18 28, 28 28, 28 20 C 28 12, 18 12, 16 20 C 14 28, 4 28, 4 20 Z" 
                    fill="url(#glass)" stroke="url(#chrome)" strokeWidth="2" filter="url(#glow)"/>
            </svg>
            <span style={{ 
              fontWeight: 800, 
              fontSize: '1.4rem',
              letterSpacing: '-0.5px', 
              background: 'linear-gradient(135deg, #0F172A 0%, #7C3AED 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              fontFamily: "'Inter', sans-serif"
            }}>
              FileVerze
            </span>
          </Link>
          
          <nav className={`nav-main ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {/* DOCUMENT TOOLS */}
            <div className="nav-item dropdown" onClick={() => toggleDropdown('docs')}>
              DOCUMENT TOOLS <ChevronDown size={14} />
              {activeDropdown === 'docs' && (
                <div className="dropdown-menu">
                  <Link to="/merge_pdf" className="dropdown-item" onClick={closeDropdown}>Merge PDF</Link>
                  <Link to="/split_pdf" className="dropdown-item" onClick={closeDropdown}>Split PDF</Link>
                  <Link to="/image_to_pdf" className="dropdown-item" onClick={closeDropdown}>Image to PDF</Link>
                  <Link to="/gemini_watermark_remover" className="dropdown-item" onClick={closeDropdown}>Gemini Watermark Remover</Link>
                </div>
              )}
            </div>

            {/* IMAGE TOOLS MEGA MENU */}
            <div className="nav-item dropdown mega" onClick={() => toggleDropdown('images')}>
              IMAGE TOOLS <ChevronDown size={14} />
              {activeDropdown === 'images' && (
                <div className="mega-menu" onClick={(e) => e.stopPropagation()}>
                  <div className="mega-column">
                    <div className="mega-column-title">WEB & OPTIMIZATION</div>
                    <Link to="/compress_image" className="mega-item" onClick={closeDropdown}>Compress Image</Link>
                    <Link to="/resize_image" className="mega-item" onClick={closeDropdown}>Resize Image</Link>
                    <Link to="/convert_image" className="mega-item" onClick={closeDropdown}>PNG to JPG</Link>
                    <Link to="/convert_image" className="mega-item" onClick={closeDropdown}>JPG to PNG</Link>
                    <Link to="/convert_image" className="mega-item" onClick={closeDropdown}>Image to WebP</Link>
                    <Link to="/rotate_image" className="mega-item" onClick={closeDropdown}>Rotate Image</Link>
                    <Link to="/grayscale_image" className="mega-item" onClick={closeDropdown}>Grayscale Image</Link>
                    <Link to="/image_blur" className="mega-item" onClick={closeDropdown}>Blur Image</Link>
                    <Link to="/exif_stripper" className="mega-item" onClick={closeDropdown}>EXIF & Metadata Stripper</Link>
                  </div>
                  <div className="mega-column">
                    <div className="mega-column-title">MOBILE & CAMERA</div>
                    <Link to="/convert/images" className="mega-item" onClick={closeDropdown}>HEIC to JPG</Link>
                    <Link to="/convert/images" className="mega-item" onClick={closeDropdown}>RAW to JPG</Link>
                    <Link to="/convert/images" className="mega-item" onClick={closeDropdown}>TIFF to JPG</Link>
                    <Link to="/bmp_to_png" className="mega-item" onClick={closeDropdown}>BMP/TGA to PNG</Link>
                  </div>
                  <div className="mega-column">
                    <div className="mega-column-title">UI & ICON DESIGN</div>
                    <Link to="/svg_to_png" className="mega-item" onClick={closeDropdown}>SVG to PNG</Link>
                    <Link to="/convert/images" className="mega-item" onClick={closeDropdown}>PNG to SVG</Link>
                    <Link to="/image_to_ico" className="mega-item" onClick={closeDropdown}>Image to ICO</Link>
                    <Link to="/convert/images" className="mega-item" onClick={closeDropdown}>Image to ICNS</Link>
                  </div>
                  <div className="mega-column">
                    <div className="mega-column-title">ANIMATION</div>
                    <Link to="/gif_to_mp4" className="mega-item" onClick={closeDropdown}>GIF to MP4</Link>
                    <Link to="/video_to_gif" className="mega-item" onClick={closeDropdown}>MP4 to GIF</Link>
                    <Link to="/convert/images" className="mega-item" onClick={closeDropdown}>GIF to APNG</Link>
                  </div>
                  <div className="mega-column">
                    <div className="mega-column-title">DOCUMENT BRIDGING</div>
                    <Link to="/image_to_pdf" className="mega-item" onClick={closeDropdown}>Image to PDF</Link>
                    <Link to="/pdf_to_image" className="mega-item" onClick={closeDropdown}>PDF to Image</Link>
                  </div>
                </div>
              )}
            </div>

            {/* PDF TOOLS MEGA MENU */}
            <div className="nav-item dropdown mega" onClick={() => toggleDropdown('pdf')}>
              PDF TOOLS <ChevronDown size={14} />
              {activeDropdown === 'pdf' && (
                <div className="mega-menu" onClick={(e) => e.stopPropagation()}>
                  <div className="mega-column">
                    <div className="mega-column-title">ORGANIZE PDF</div>
                    <Link to="/merge_pdf" className="mega-item" onClick={closeDropdown}>Merge PDF</Link>
                    <Link to="/split_pdf" className="mega-item" onClick={closeDropdown}>Split PDF</Link>
                    <Link to="/remove_pages" className="mega-item" onClick={closeDropdown}>Remove pages</Link>
                    <Link to="/extract_pages" className="mega-item" onClick={closeDropdown}>Extract pages</Link>
                    <Link to="/convert/pdf" className="mega-item" onClick={closeDropdown}>Organize PDF</Link>
                    <Link to="/convert/pdf" className="mega-item" onClick={closeDropdown}>Scan to PDF</Link>
                  </div>
                  <div className="mega-column">
                    <div className="mega-column-title">OPTIMIZE PDF</div>
                    <Link to="/compress_pdf" className="mega-item" onClick={closeDropdown}>Compress PDF</Link>
                    <Link to="/convert/pdf" className="mega-item" onClick={closeDropdown}>Repair PDF</Link>
                    <Link to="/convert/pdf" className="mega-item" onClick={closeDropdown}>OCR PDF</Link>
                  </div>
                  <div className="mega-column">
                    <div className="mega-column-title">CONVERT TO PDF</div>
                    <Link to="/image_to_pdf" className="mega-item" onClick={closeDropdown}>JPG to PDF</Link>
                    <Link to="/convert/pdf" className="mega-item" onClick={closeDropdown}>HTML to PDF</Link>
                  </div>
                  <div className="mega-column">
                    <div className="mega-column-title">CONVERT FROM PDF</div>
                    <Link to="/pdf_to_image" className="mega-item" onClick={closeDropdown}>PDF to JPG</Link>
                    <Link to="/pdf_to_word" className="mega-item" onClick={closeDropdown}>PDF to WORD</Link>
                    <Link to="/convert/pdf" className="mega-item" onClick={closeDropdown}>PDF to POWERPOINT</Link>
                    <Link to="/convert/pdf" className="mega-item" onClick={closeDropdown}>PDF to EXCEL</Link>
                    <Link to="/convert/pdf" className="mega-item" onClick={closeDropdown}>PDF to PDF/A</Link>
                  </div>
                  <div className="mega-column">
                    <div className="mega-column-title">EDIT IMAGE</div>
                    <Link to="/rotate_image" className="mega-item" onClick={closeDropdown}>Rotate Image</Link>
                    <Link to="/image_blur" className="mega-item" onClick={closeDropdown}>Image Blur</Link>
                    <Link to="/grayscale_image" className="mega-item" onClick={closeDropdown}>Grayscale Image</Link>
                  </div>
                  <div className="mega-column">
                    <div className="mega-column-title">EDIT PDF</div>
                    <Link to="/rotate_pdf" className="mega-item" onClick={closeDropdown}>Rotate PDF</Link>
                    <Link to="/add_page_numbers" className="mega-item" onClick={closeDropdown}>Add page numbers</Link>
                    <Link to="/add_watermark" className="mega-item" onClick={closeDropdown}>Add watermark</Link>
                    <Link to="/convert/pdf" className="mega-item" onClick={closeDropdown}>Crop PDF</Link>
                    <Link to="/convert/pdf" className="mega-item" onClick={closeDropdown}>Edit PDF</Link>
                    <Link to="/convert/pdf" className="mega-item" onClick={closeDropdown}>PDF Forms</Link>
                  </div>
                  <div className="mega-column">
                    <div className="mega-column-title">PDF SECURITY</div>
                    <Link to="/unlock_pdf" className="mega-item" onClick={closeDropdown}>Unlock PDF</Link>
                    <Link to="/protect_pdf" className="mega-item" onClick={closeDropdown}>Protect PDF</Link>
                    <Link to="/sign_pdf" className="mega-item" onClick={closeDropdown}>Sign PDF</Link>
                    <Link to="/convert/pdf" className="mega-item" onClick={closeDropdown}>Redact PDF</Link>
                    <Link to="/convert/pdf" className="mega-item" onClick={closeDropdown}>Compare PDF</Link>
                  </div>
                  <div className="mega-column">
                    <div className="mega-column-title">PDF INTELLIGENCE</div>
                    <Link to="/convert/pdf" className="mega-item" onClick={closeDropdown}>AI Summarizer</Link>
                    <Link to="/convert/pdf" className="mega-item" onClick={closeDropdown}>Translate PDF</Link>
                  </div>
                </div>
              )}
            </div>

            {/* VIDEO TOOLS */}
            <div className="nav-item dropdown" onClick={() => toggleDropdown('video')}>
              VIDEO TOOLS <ChevronDown size={14} />
              {activeDropdown === 'video' && (
                <div className="dropdown-menu">
                  <Link to="/hevc_to_mp4" className="dropdown-item" onClick={closeDropdown}>HEVC to MP4</Link>
                  <Link to="/video_to_gif" className="dropdown-item" onClick={closeDropdown}>MP4 to GIF</Link>
                  <Link to="/webm_to_mp4" className="dropdown-item" onClick={closeDropdown}>WEBM to MP4</Link>
                  <Link to="/mute_video" className="dropdown-item" onClick={closeDropdown}>Mute Video</Link>
                  <Link to="/change_video_speed" className="dropdown-item" onClick={closeDropdown}>Change Speed</Link>
                  <Link to="/extract_video_frames" className="dropdown-item" onClick={closeDropdown}>Extract Frames</Link>
                  <Link to="/reverse_video" className="dropdown-item" onClick={closeDropdown}>Reverse Video</Link>
                  <Link to="/trim_video" className="dropdown-item" onClick={closeDropdown}>Trim Video</Link>
                  <Link to="/video_to_audio" className="dropdown-item" onClick={closeDropdown}>Extract Audio</Link>
                </div>
              )}
            </div>

            {/* DATA & DEV */}
            <div className="nav-item dropdown" onClick={() => toggleDropdown('data')}>
              DATA & DEV <ChevronDown size={14} />
              {activeDropdown === 'data' && (
                <div className="dropdown-menu dropdown-menu-right">
                  <Link to="/json_to_csv" className="dropdown-item" onClick={closeDropdown}>JSON to CSV</Link>
                  <Link to="/csv_to_json" className="dropdown-item" onClick={closeDropdown}>CSV to JSON</Link>
                  <Link to="/json_formatter" className="dropdown-item" onClick={closeDropdown}>JSON Formatter</Link>
                  <Link to="/xml_to_json" className="dropdown-item" onClick={closeDropdown}>XML to JSON</Link>
                  <Link to="/base64_encode_decode" className="dropdown-item" onClick={closeDropdown}>Base64 Encoder/Decoder</Link>
                  <Link to="/url_encode_decode" className="dropdown-item" onClick={closeDropdown}>URL Encoder/Decoder</Link>
                  <Link to="/text_case_converter" className="dropdown-item" onClick={closeDropdown}>Text Case Converter</Link>
                  <Link to="/word_character_counter" className="dropdown-item" onClick={closeDropdown}>Word/Char Counter</Link>
                  <Link to="/uuid_generator" className="dropdown-item" onClick={closeDropdown}>UUID Generator</Link>
                  <Link to="/html_formatter" className="dropdown-item" onClick={closeDropdown}>HTML Formatter</Link>
                  <Link to="/css_formatter" className="dropdown-item" onClick={closeDropdown}>CSS Formatter</Link>
                  <Link to="/markdown_to_html" className="dropdown-item" onClick={closeDropdown}>Markdown to HTML</Link>
                  <Link to="/html_to_markdown" className="dropdown-item" onClick={closeDropdown}>HTML to Markdown</Link>
                  <Link to="/regex_tester" className="dropdown-item" onClick={closeDropdown}>Regex Tester</Link>
                  <Link to="/hash_generator" className="dropdown-item" onClick={closeDropdown}>Hash Generator</Link>
                  <Link to="/bcrypt_generator" className="dropdown-item" onClick={closeDropdown}>Bcrypt Generator</Link>
                  <Link to="/jwt_decoder" className="dropdown-item" onClick={closeDropdown}>JWT Decoder</Link>
                  <Link to="/qrcode_generator" className="dropdown-item" onClick={closeDropdown}>QR Code Generator</Link>
                  <Link to="/color_converter" className="dropdown-item" onClick={closeDropdown}>Color Converter</Link>
                  <Link to="/cyber_forensics" className="dropdown-item" onClick={closeDropdown} style={{ fontWeight: 700, color: '#0284c7' }}>🛡️ Cyber Forensics Lab</Link>
                  <Link to="/lorem_ipsum" className="dropdown-item" onClick={closeDropdown}>Lorem Ipsum Generator</Link>
                </div>
              )}
            </div>

            {/* ALL TOOLS */}
            <div className="nav-item dropdown" onClick={() => toggleDropdown('all')}>
              ALL TOOLS <ChevronDown size={14} />
              {activeDropdown === 'all' && (
                <div className="dropdown-menu">
                  <Link to="/cyber_forensics" className="dropdown-item" onClick={closeDropdown} style={{ fontWeight: 700, color: '#0284c7' }}>Cyber Forensics Investigator</Link>
                  <Link to="/app" className="dropdown-item" onClick={closeDropdown}>All Tools Workspace</Link>
                  <Link to="/faq" className="dropdown-item" onClick={closeDropdown}>FAQ & Knowledge Base</Link>
                  <Link to="/json_to_csv" className="dropdown-item" onClick={closeDropdown}>JSON to CSV</Link>
                  <Link to="/convert/3d" className="dropdown-item" onClick={closeDropdown}>3D & CAD</Link>
                  <Link to="/hash_generator" className="dropdown-item" onClick={closeDropdown}>Hash Generator (SHA256)</Link>
                </div>
              )}
            </div>

            {/* DIRECT NAV LINKS */}
            <Link to="/cyber_forensics" className="nav-item" style={{ textDecoration: 'none', color: '#7C3AED', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              FORENSICS
            </Link>
            <Link to="/app" className="nav-item" style={{ textDecoration: 'none', color: '#0F172A', fontWeight: 600 }}>
              TOOLS STUDIO
            </Link>
            <Link to="/faq" className="nav-item" style={{ textDecoration: 'none', color: '#0F172A', fontWeight: 600 }}>
              FAQ
            </Link>
          </nav>
        </div>

        <div className="header-right">
          <Link to="/app" style={{ textDecoration: 'none', color: '#ffffff', fontSize: '0.85rem', fontWeight: 700, padding: '0.45rem 1rem', borderRadius: '6px', background: '#0F172A', marginRight: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.25)' }}>
            Open Studio →
          </Link>
          <button className="btn-grid"><Grid size={24} color="#475569" /></button>
        </div>
      </header>

      <main className="main-content">
        <Suspense fallback={
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '55vh',
            gap: '14px',
            color: '#475569'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              border: '2.5px solid #EDE9FE',
              borderTopColor: '#7C3AED',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite'
            }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.02em' }}>
              Loading tool module...
            </span>
          </div>
        }>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<Dashboard />} />
            <Route path="/tools" element={<Dashboard />} />
            <Route path="/all_tools" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/convert/:categoryId" element={<UniversalConverter />} />
            <Route path="/merge_pdf" element={<MergePDF />} />
            <Route path="/gemini_watermark_remover" element={<GeminiWatermarkRemover />} />
            <Route path="/split_pdf" element={<SplitPDF />} />
            <Route path="/extract_pages" element={<ExtractPages />} />
            <Route path="/remove_pages" element={<RemovePages />} />
            <Route path="/rotate_pdf" element={<RotatePDF />} />
            <Route path="/add_page_numbers" element={<AddPageNumbers />} />
            <Route path="/convert_image" element={<ConvertImage />} />
            <Route path="/compress_image" element={<CompressImage />} />
            <Route path="/video_to_gif" element={<VideoToGif />} />
            <Route path="/video_to_audio" element={<VideoToAudio />} />
            <Route path="/image_to_pdf" element={<ImageToPDF />} />
            <Route path="/pdf_to_image" element={<PdfToImage />} />
            <Route path="/word_to_pdf" element={<WordToPdf />} />
            <Route path="/pdf_to_word" element={<PdfToWord />} />
            <Route path="/excel_to_pdf" element={<ExcelToPdf />} />
            <Route path="/powerpoint_to_pdf" element={<PowerpointToPdf />} />
            <Route path="/compress_pdf" element={<CompressPdfBackend />} />
            <Route path="/remove_background" element={<RemoveBackground />} />
            <Route path="/protect_pdf" element={<ProtectPDF />} />
            <Route path="/unlock_pdf" element={<UnlockPDF />} />
            <Route path="/sign_pdf" element={<SignPDF />} />
            <Route path="/exif_stripper" element={<ExifStripper />} />
            <Route path="/trim_video" element={<TrimVideo />} />
            <Route path="/add_watermark" element={<AddWatermark />} />
            <Route path="/hash_generator" element={<HashGenerator />} />
            <Route path="/json_to_csv" element={<JsonToCsv />} />
            <Route path="/gif_to_mp4" element={<GifToMp4 />} />
            <Route path="/svg_to_png" element={<SvgToPng />} />
            <Route path="/image_to_ico" element={<ImageToIco />} />
            <Route path="/resize_image" element={<ResizeImage />} />
            <Route path="/rotate_image" element={<RotateImage />} />
            <Route path="/grayscale_image" element={<GrayscaleImage />} />
            <Route path="/image_blur" element={<ImageBlur />} />
            <Route path="/bmp_to_png" element={<BmpToPng />} />
            <Route path="/webm_to_mp4" element={<WebmToMp4 />} />
            <Route path="/hevc_to_mp4" element={<HevcToMp4 />} />
            <Route path="/mute_video" element={<MuteVideo />} />
            <Route path="/change_video_speed" element={<ChangeVideoSpeed />} />
            <Route path="/extract_video_frames" element={<ExtractVideoFrames />} />
            <Route path="/reverse_video" element={<ReverseVideo />} />
            <Route path="/csv_to_json" element={<CsvToJson />} />
            <Route path="/base64_encode_decode" element={<Base64EncodeDecode />} />
            <Route path="/url_encode_decode" element={<UrlEncodeDecode />} />
            <Route path="/text_case_converter" element={<TextCaseConverter />} />
            <Route path="/word_character_counter" element={<WordCharacterCounter />} />
            <Route path="/uuid_generator" element={<UuidGenerator />} />
            <Route path="/html_formatter" element={<HtmlFormatter />} />
            <Route path="/css_formatter" element={<CssFormatter />} />
            <Route path="/json_formatter" element={<JsonFormatter />} />
            <Route path="/qrcode_generator" element={<QrCodeGenerator />} />
            <Route path="/color_converter" element={<ColorConverter />} />
            <Route path="/lorem_ipsum" element={<LoremIpsumGenerator />} />
            <Route path="/jwt_decoder" element={<JwtDecoder />} />
            <Route path="/markdown_to_html" element={<MarkdownToHtml />} />
            <Route path="/html_to_markdown" element={<HtmlToMarkdown />} />
            <Route path="/regex_tester" element={<RegexTester />} />
            <Route path="/bcrypt_generator" element={<BcryptGenerator />} />
            <Route path="/xml_to_json" element={<XmlToJson />} />
            <Route path="/subtitle_converter" element={<SubtitleConverter />} />
            <Route path="/convert/subtitles" element={<SubtitleConverter />} />
            <Route path="/gis_converter" element={<GisConverter />} />
            <Route path="/convert/gis" element={<GisConverter />} />
            <Route path="/threed_converter" element={<ThreeDConverter />} />
            <Route path="/convert/3d" element={<ThreeDConverter />} />
            <Route path="/ebook_converter" element={<EbookConverter />} />
            <Route path="/convert/ebooks" element={<EbookConverter />} />
            <Route path="/font_converter" element={<FontConverter />} />
            <Route path="/convert/fonts" element={<FontConverter />} />
            <Route path="/ocr_extractor" element={<OcrExtractor />} />
            <Route path="/convert/ai" element={<OcrExtractor />} />
            <Route path="/cyber_forensics" element={<CyberForensicsInvestigator />} />
            <Route path="/forensics" element={<CyberForensicsInvestigator />} />
          </Routes>
        </Suspense>
      </main>
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} FileVerze. Made with love by <a href="https://vishwak.tech" target="_blank" rel="noopener noreferrer">Vishwak Naidu</a></p>
      </footer>
    </div>
  );
}

export default App;
