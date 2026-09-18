import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileContext } from '../context/FileContext';
import BatchPhotoStudio from './BatchPhotoStudio';
import {
  UploadCloud, FileText, Image as ImageIcon, Video, Music,
  Database, Code, Box, BookOpen, Type, MessageSquare, Map,
  Sparkles, ArrowRight, CheckCircle, RefreshCw, X, AlertCircle,
  FileCheck, Lock, Unlock, Shield, ShieldCheck, Layers, HelpCircle, Terminal,
  Plus, Trash2, Images
} from 'lucide-react';

// Format bytes into readable format
function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Truncate file name if longer than maxLen (default 25)
function truncateFileName(name, maxLen = 25) {
  if (!name || name.length <= maxLen) return name;
  const ext = name.split('.').pop();
  const base = name.substring(0, name.lastIndexOf('.'));
  const keep = maxLen - (ext ? ext.length + 4 : 3);
  return `${base.substring(0, Math.max(keep, 6))}...${ext ? '.' + ext : ''}`;
}

// Dynamic Client-side Dictionary Mapping MIME types & file extensions to FileVerze tools
const TOOL_ROUTING_MAP = {
  // 1. PDF
  pdf: {
    category: 'PDF Document',
    mimePattern: 'application/pdf',
    icon: FileText,
    badgeColor: '#111827',
    tools: [
      { id: 'merge_pdf', title: 'Merge PDF', desc: 'Combine multiple PDFs into a single file', path: '/merge_pdf', badge: 'Organize', targetExt: 'PDF' },
      { id: 'split_pdf', title: 'Split PDF', desc: 'Separate pages or extract page ranges', path: '/split_pdf', badge: 'Organize', targetExt: 'PDF' },
      { id: 'pdf_to_image', title: 'PDF to Image (JPG)', desc: 'Convert every page of PDF to high-res JPG', path: '/pdf_to_image', badge: 'Convert', targetExt: 'JPG' },
      { id: 'pdf_to_word', title: 'PDF to Word (.docx)', desc: 'Convert PDF into an editable Word document', path: '/pdf_to_word', badge: 'Convert', targetExt: 'DOCX' },
      { id: 'compress_pdf', title: 'Compress PDF', desc: 'Reduce file size while preserving quality', path: '/compress_pdf', badge: 'Optimize', targetExt: 'PDF' },
      { id: 'extract_pages', title: 'Extract Pages', desc: 'Get a new document with only selected pages', path: '/extract_pages', badge: 'Organize', targetExt: 'PDF' },
      { id: 'remove_pages', title: 'Remove Pages', desc: 'Delete specific unwanted pages from your PDF', path: '/remove_pages', badge: 'Organize', targetExt: 'PDF' },
      { id: 'rotate_pdf', title: 'Rotate PDF', desc: 'Rotate portrait and landscape pages permanently', path: '/rotate_pdf', badge: 'Edit', targetExt: 'PDF' },
      { id: 'add_watermark', title: 'Add Watermark', desc: 'Stamp custom text or image overlays onto pages', path: '/add_watermark', badge: 'Security', targetExt: 'PDF' },
      { id: 'add_page_numbers', title: 'Add Page Numbers', desc: 'Stamp customizable header/footer page numbers', path: '/add_page_numbers', badge: 'Edit', targetExt: 'PDF' },
      { id: 'protect_pdf', title: 'Protect PDF', desc: 'Encrypt document with user password security', path: '/protect_pdf', badge: 'Security', targetExt: 'PDF' },
      { id: 'unlock_pdf', title: 'Unlock PDF', desc: 'Remove password protection and permissions', path: '/unlock_pdf', badge: 'Security', targetExt: 'PDF' },
      { id: 'cyber_forensics', title: 'Cyber Forensics Investigator', desc: 'Inspect PDF streams, exploit objects, metadata & hashes', path: '/cyber_forensics', badge: 'Forensics', targetExt: 'REPORT' },
    ]
  },

  // 2. Images
  image: {
    category: 'Raster & Vector Image',
    mimePattern: '^image\\/(png|jpeg|jpg|webp|svg\\+xml|bmp|x-icon|gif|avif)$',
    extensions: ['png', 'jpg', 'jpeg', 'webp', 'svg', 'bmp', 'ico', 'gif', 'avif'],
    icon: ImageIcon,
    badgeColor: '#111827',
    getTools: (ext) => {
      const isSvg = ext === 'svg';
      const isBmp = ext === 'bmp';
      return [
        { id: 'compress_image', title: 'Compress Image', desc: 'Shrink file size while retaining visual fidelity', path: '/compress_image', badge: 'Optimize', targetExt: ext.toUpperCase() },
        { id: 'convert_image', title: 'Convert Format', desc: 'Convert between PNG, JPG, and modern WEBP', path: '/convert_image', badge: 'Convert', targetExt: 'WEBP' },
        { id: 'ocr_extractor', title: 'OCR Text Extractor', desc: 'Extract editable text using in-browser neural AI', path: '/ocr_extractor', badge: 'AI Tool', targetExt: 'TXT' },
        { id: 'gemini_watermark_remover', title: 'Gemini Watermark Remover', desc: 'Cleanly remove AI watermarks natively', path: '/gemini_watermark_remover', badge: 'AI Tool', targetExt: 'PNG' },
        { id: 'remove_background', title: 'Remove Background', desc: 'Isolate subject with transparent background', path: '/remove_background', badge: 'AI Tool', targetExt: 'PNG' },
        { id: 'resize_image', title: 'Resize Image', desc: 'Scale dimensions by pixels or percentage', path: '/resize_image', badge: 'Edit', targetExt: ext.toUpperCase() },
        { id: 'image_to_pdf', title: 'Image to PDF', desc: 'Embed photo into a clean PDF document', path: '/image_to_pdf', badge: 'Convert', targetExt: 'PDF' },
        { id: 'image_to_ico', title: 'Image to Favicon (.ico)', desc: 'Generate website favicons in standard ICO format', path: '/image_to_ico', badge: 'Convert', targetExt: 'ICO' },
        { id: 'rotate_image', title: 'Rotate Image', desc: 'Rotate orientation by 90°, 180°, or custom angle', path: '/rotate_image', badge: 'Edit', targetExt: ext.toUpperCase() },
        { id: 'grayscale_image', title: 'Grayscale Filter', desc: 'Apply clean black-and-white tonal mapping', path: '/grayscale_image', badge: 'Filter', targetExt: ext.toUpperCase() },
        { id: 'image_blur', title: 'Blur & Obscure', desc: 'Apply Gaussian blur to sensitive details', path: '/image_blur', badge: 'Filter', targetExt: ext.toUpperCase() },
        { id: 'cyber_forensics', title: 'Cyber Forensics Investigator', desc: 'Inspect EXIF, GPS coordinates, camera model & tampering', path: '/cyber_forensics', badge: 'Forensics', targetExt: 'REPORT' },
        ...(isSvg ? [{ id: 'svg_to_png', title: 'SVG to PNG', desc: 'Rasterize vector graphics into high-res PNG', path: '/svg_to_png', badge: 'Convert', targetExt: 'PNG' }] : []),
        ...(isBmp ? [{ id: 'bmp_to_png', title: 'BMP to PNG', desc: 'Modernize uncompressed bitmap into web PNG', path: '/bmp_to_png', badge: 'Convert', targetExt: 'PNG' }] : []),
      ];
    }
  },

  // 3. Video
  video: {
    category: 'Video Clip & Stream',
    mimePattern: '^video\\/(mp4|webm|quicktime|x-matroska|x-msvideo|hevc)$',
    extensions: ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', 'hevc', 'flv'],
    icon: Video,
    badgeColor: '#111827',
    getTools: (ext) => [
      { id: 'video_to_gif', title: 'Video to Animated GIF', desc: 'Convert video clips into shareable animated GIFs', path: '/video_to_gif', badge: 'Convert', targetExt: 'GIF' },
      { id: 'video_to_audio', title: 'Extract Audio Track', desc: 'Export MP3 / WAV audio directly from video', path: '/video_to_audio', badge: 'Extract', targetExt: 'MP3' },
      { id: 'trim_video', title: 'Trim & Cut Video', desc: 'Slice unwanted start/end segments in browser', path: '/trim_video', badge: 'Edit', targetExt: 'MP4' },
      { id: 'mute_video', title: 'Mute Audio Track', desc: 'Strip audio tracks completely from video file', path: '/mute_video', badge: 'Edit', targetExt: 'MP4' },
      { id: 'change_video_speed', title: 'Change Video Speed', desc: 'Speed up or slow down playback frame rate', path: '/change_video_speed', badge: 'Edit', targetExt: 'MP4' },
      { id: 'extract_video_frames', title: 'Extract Video Frames', desc: 'Export full sequence of video frames as JPGs', path: '/extract_video_frames', badge: 'Extract', targetExt: 'ZIP' },
      { id: 'reverse_video', title: 'Reverse Video', desc: 'Play video backwards from finish to start', path: '/reverse_video', badge: 'Effect', targetExt: 'MP4' },
      { id: 'webm_to_mp4', title: 'Convert to MP4', desc: 'Ensure universal player compatibility with MP4', path: ext === 'webm' ? '/webm_to_mp4' : (ext === 'hevc' ? '/hevc_to_mp4' : '/video_to_gif'), badge: 'Convert', targetExt: 'MP4' },
    ]
  },

  // 4. Subtitles
  subtitles: {
    category: 'Subtitle & Closed Captions',
    mimePattern: 'text/vtt|application/x-subrip',
    extensions: ['srt', 'vtt', 'ass', 'sub', 'sbv'],
    icon: MessageSquare,
    badgeColor: '#111827',
    tools: [
      { id: 'sub_vtt', title: 'Convert to WebVTT (.vtt)', desc: 'Standard subtitle format for HTML5 and web video', path: '/subtitle_converter', badge: 'Convert', targetExt: 'VTT' },
      { id: 'sub_srt', title: 'Convert to SubRip (.srt)', desc: 'Universal format for desktop players and VLC', path: '/subtitle_converter', badge: 'Convert', targetExt: 'SRT' },
      { id: 'sub_ass', title: 'Convert to SSA/ASS', desc: 'Advanced SubStation Alpha formatted script', path: '/subtitle_converter', badge: 'Convert', targetExt: 'ASS' },
      { id: 'sub_sync', title: 'Shift Timestamps (Sync Offset)', desc: 'Adjust audio/video timing sync by ±milliseconds', path: '/subtitle_converter', badge: 'Edit', targetExt: 'SRT' },
      { id: 'sub_txt', title: 'Extract Plain Script (.txt)', desc: 'Strip all cue timestamps into clean dialogue text', path: '/subtitle_converter', badge: 'Extract', targetExt: 'TXT' },
    ]
  },

  // 5. Data & Structured
  data: {
    category: 'Data & Tabular File',
    mimePattern: 'text/csv|application/json|text/xml|application/xml',
    extensions: ['csv', 'tsv', 'json', 'xml', 'yaml', 'yml'],
    icon: Database,
    badgeColor: '#111827',
    getTools: (ext) => {
      const isCsv = ['csv', 'tsv'].includes(ext);
      const isJson = ext === 'json';
      const isXml = ext === 'xml';
      return [
        ...(isCsv ? [
          { id: 'csv_to_json', title: 'CSV to JSON Array', desc: 'Parse spreadsheet rows into formatted JSON objects', path: '/csv_to_json', badge: 'Convert', targetExt: 'JSON' },
          { id: 'csv_to_geo', title: 'CSV Coordinates to GeoJSON', desc: 'Convert Lat/Lon coordinates to spatial map features', path: '/gis_converter', badge: 'GIS', targetExt: 'GEOJSON' },
        ] : []),
        ...(isJson ? [
          { id: 'json_to_csv', title: 'JSON to CSV Spreadsheet', desc: 'Export JSON data arrays into table CSV format', path: '/json_to_csv', badge: 'Convert', targetExt: 'CSV' },
          { id: 'json_formatter', title: 'JSON Formatter & Minifier', desc: 'Validate, beautify indentation, or compress JSON', path: '/json_formatter', badge: 'Format', targetExt: 'JSON' },
          { id: 'json_to_xml', title: 'JSON to XML Tags', desc: 'Convert structured JSON trees into XML elements', path: '/xml_to_json', badge: 'Convert', targetExt: 'XML' },
        ] : []),
        ...(isXml ? [
          { id: 'xml_to_json', title: 'XML to JSON Structure', desc: 'Parse XML tags into native JSON object models', path: '/xml_to_json', badge: 'Convert', targetExt: 'JSON' },
        ] : []),
        { id: 'base64', title: 'Base64 Encoder/Decoder', desc: 'Translate raw payload bytes to/from Base64', path: '/base64_encode_decode', badge: 'Dev Tool', targetExt: 'TXT' },
        { id: 'word_count', title: 'Word & Character Metrics', desc: 'Calculate lines, characters, words, and memory size', path: '/word_character_counter', badge: 'Analytics', targetExt: 'TXT' },
      ];
    }
  },

  // 6. Geospatial / Maps
  gis: {
    category: 'Geospatial & Map Data',
    mimePattern: 'application/geo\\+json|application/vnd\\.google-earth\\.kml\\+xml',
    extensions: ['geojson', 'kml', 'gpx'],
    icon: Map,
    badgeColor: '#111827',
    tools: [
      { id: 'geo_to_kml', title: 'GeoJSON to Google Earth KML', desc: 'Convert GeoJSON features into KML Placemarks', path: '/gis_converter', badge: 'GIS', targetExt: 'KML' },
      { id: 'kml_to_geo', title: 'KML to GeoJSON', desc: 'Extract Placemarks & LinearRings into GeoJSON', path: '/gis_converter', badge: 'GIS', targetExt: 'GEOJSON' },
      { id: 'gis_validate', title: 'Spatial Geometry Inspector', desc: 'Validate point, line, and polygon coordinates', path: '/gis_converter', badge: 'Inspect', targetExt: 'GEOJSON' },
    ]
  },

  // 7. 3D & CAD
  threed: {
    category: '3D Geometry & CAD',
    mimePattern: 'model/stl|model/gltf-binary|model/gltf\\+json',
    extensions: ['stl', 'obj', 'gltf', 'glb', '3ds', 'dae'],
    icon: Box,
    badgeColor: '#111827',
    tools: [
      { id: 'threed_view', title: 'Interactive 3D Viewport', desc: 'Inspect mesh in WebGL with wireframe & orbit controls', path: '/threed_converter', badge: 'Viewer', targetExt: '3D' },
      { id: 'threed_poly', title: 'Polycount & Vertex Inspector', desc: 'Calculate triangles, face normals, and bounds', path: '/threed_converter', badge: 'Inspect', targetExt: 'INFO' },
      { id: 'threed_stl', title: 'Export Clean STL Mesh', desc: 'Download standardized binary STL geometry', path: '/threed_converter', badge: 'Export', targetExt: 'STL' },
    ]
  },

  // 8. Fonts
  fonts: {
    category: 'Typography & Web Font',
    mimePattern: 'font/ttf|font/otf|font/woff|font/woff2',
    extensions: ['ttf', 'otf', 'woff', 'woff2'],
    icon: Type,
    badgeColor: '#111827',
    tools: [
      { id: 'font_glyphs', title: 'Inspect Glyph Vectors', desc: 'Inspect glyph count, units per EM, and tables', path: '/font_converter', badge: 'Inspect', targetExt: 'GLYPHS' },
      { id: 'font_test', title: 'Interactive Typography Tester', desc: 'Type custom strings in font with dynamic size slider', path: '/font_converter', badge: 'Test', targetExt: 'PREVIEW' },
      { id: 'font_css', title: 'Generate @font-face CSS', desc: 'Get copy-ready web font CSS declarations', path: '/font_converter', badge: 'Dev Tool', targetExt: 'CSS' },
      { id: 'font_export', title: 'Export Standard TTF', desc: 'Export clean TrueType font file binary', path: '/font_converter', badge: 'Export', targetExt: 'TTF' },
    ]
  },

  // 9. E-Books
  ebooks: {
    category: 'Digital E-Book Publication',
    mimePattern: 'application/epub\\+zip',
    extensions: ['epub', 'mobi', 'azw3'],
    icon: BookOpen,
    badgeColor: '#111827',
    tools: [
      { id: 'ebook_extract', title: 'Extract Chapters & Text', desc: 'Unpack EPUB chapters into readable document text', path: '/ebook_converter', badge: 'Extract', targetExt: 'TXT' },
      { id: 'ebook_reader', title: 'EPUB Reader & Inspector', desc: 'View book metadata, table of contents, and OPF manifest', path: '/ebook_converter', badge: 'Reader', targetExt: 'EPUB' },
      { id: 'ebook_build', title: 'Create / Rebuild EPUB', desc: 'Build new standard EPUB 3 digital books', path: '/ebook_converter', badge: 'Build', targetExt: 'EPUB' },
    ]
  },

  // 10. Documents & Office
  documents: {
    category: 'Document & Office Suite',
    mimePattern: 'text/markdown|text/html|application/vnd\\.openxmlformats-officedocument|application/msword',
    extensions: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md', 'html', 'htm', 'css', 'js'],
    icon: Code,
    badgeColor: '#111827',
    getTools: (ext) => {
      const isWord = ['doc', 'docx'].includes(ext);
      const isExcel = ['xls', 'xlsx'].includes(ext);
      const isPpt = ['ppt', 'pptx'].includes(ext);
      const isMd = ext === 'md';
      const isHtml = ['html', 'htm'].includes(ext);
      const isCss = ext === 'css';
      return [
        ...(isWord ? [{ id: 'word_pdf', title: 'Word to PDF', desc: 'Convert Word document to PDF vector pages', path: '/word_to_pdf', badge: 'Convert', targetExt: 'PDF' }] : []),
        ...(isExcel ? [{ id: 'excel_pdf', title: 'Excel to PDF', desc: 'Convert spreadsheet tables to PDF grid pages', path: '/excel_to_pdf', badge: 'Convert', targetExt: 'PDF' }] : []),
        ...(isPpt ? [{ id: 'ppt_pdf', title: 'PowerPoint to PDF', desc: 'Convert presentation slides to 16:9 PDF format', path: '/powerpoint_to_pdf', badge: 'Convert', targetExt: 'PDF' }] : []),
        ...(isMd ? [
          { id: 'md_html', title: 'Markdown to HTML', desc: 'Compile Markdown into clean HTML markup', path: '/markdown_to_html', badge: 'Convert', targetExt: 'HTML' },
          { id: 'md_epub', title: 'Build EPUB from Markdown', desc: 'Compile chapters into standard digital e-book', path: '/ebook_converter', badge: 'E-Book', targetExt: 'EPUB' }
        ] : []),
        ...(isHtml ? [
          { id: 'html_md', title: 'HTML to Markdown', desc: 'Convert HTML elements to clean Markdown syntax', path: '/html_to_markdown', badge: 'Convert', targetExt: 'MD' },
          { id: 'html_format', title: 'HTML Formatter & Minifier', desc: 'Beautify or minify HTML markup trees', path: '/html_formatter', badge: 'Format', targetExt: 'HTML' }
        ] : []),
        ...(isCss ? [{ id: 'css_format', title: 'CSS Formatter & Minifier', desc: 'Organize stylesheets or compress for production', path: '/css_formatter', badge: 'Format', targetExt: 'CSS' }] : []),
        { id: 'word_counter', title: 'Word & Character Metrics', desc: 'Count words, sentences, and calculate reading duration', path: '/word_character_counter', badge: 'Analyze', targetExt: 'TXT' },
        { id: 'hash_gen', title: 'Cryptographic Hash (SHA-256)', desc: 'Compute checksum integrity hash', path: '/hash_generator', badge: 'Security', targetExt: 'HASH' },
      ];
    }
  }
};

// Resolver matching file against routing dictionary
function resolveFileTools(file) {
  if (!file) return null;

  const fileName = file.name || '';
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const mime = file.type || '';
  const size = formatBytes(file.size);

  // Check 1: PDF
  if (ext === 'pdf' || mime.includes('pdf')) {
    return {
      category: TOOL_ROUTING_MAP.pdf.category,
      ext: 'PDF',
      mime: mime || 'application/pdf',
      color: TOOL_ROUTING_MAP.pdf.badgeColor,
      icon: TOOL_ROUTING_MAP.pdf.icon,
      size,
      tools: TOOL_ROUTING_MAP.pdf.tools,
      isSupported: true,
    };
  }

  // Check 2: Image
  if (TOOL_ROUTING_MAP.image.extensions.includes(ext) || mime.startsWith('image/')) {
    return {
      category: TOOL_ROUTING_MAP.image.category,
      ext: ext.toUpperCase() || 'IMAGE',
      mime: mime || `image/${ext}`,
      color: TOOL_ROUTING_MAP.image.badgeColor,
      icon: TOOL_ROUTING_MAP.image.icon,
      size,
      tools: TOOL_ROUTING_MAP.image.getTools(ext),
      isSupported: true,
    };
  }

  // Check 3: Video
  if (TOOL_ROUTING_MAP.video.extensions.includes(ext) || mime.startsWith('video/')) {
    return {
      category: TOOL_ROUTING_MAP.video.category,
      ext: ext.toUpperCase() || 'VIDEO',
      mime: mime || `video/${ext}`,
      color: TOOL_ROUTING_MAP.video.badgeColor,
      icon: TOOL_ROUTING_MAP.video.icon,
      size,
      tools: TOOL_ROUTING_MAP.video.getTools(ext),
      isSupported: true,
    };
  }

  // Check 4: Subtitles
  if (TOOL_ROUTING_MAP.subtitles.extensions.includes(ext)) {
    return {
      category: TOOL_ROUTING_MAP.subtitles.category,
      ext: ext.toUpperCase(),
      mime: mime || 'text/vtt',
      color: TOOL_ROUTING_MAP.subtitles.badgeColor,
      icon: TOOL_ROUTING_MAP.subtitles.icon,
      size,
      tools: TOOL_ROUTING_MAP.subtitles.tools,
      isSupported: true,
    };
  }

  // Check 5: Data
  if (TOOL_ROUTING_MAP.data.extensions.includes(ext) || mime.includes('json') || mime.includes('csv') || mime.includes('xml')) {
    return {
      category: TOOL_ROUTING_MAP.data.category,
      ext: ext.toUpperCase(),
      mime: mime || `text/${ext}`,
      color: TOOL_ROUTING_MAP.data.badgeColor,
      icon: TOOL_ROUTING_MAP.data.icon,
      size,
      tools: TOOL_ROUTING_MAP.data.getTools(ext),
      isSupported: true,
    };
  }

  // Check 6: GIS
  if (TOOL_ROUTING_MAP.gis.extensions.includes(ext)) {
    return {
      category: TOOL_ROUTING_MAP.gis.category,
      ext: ext.toUpperCase(),
      mime: mime || 'application/geo+json',
      color: TOOL_ROUTING_MAP.gis.badgeColor,
      icon: TOOL_ROUTING_MAP.gis.icon,
      size,
      tools: TOOL_ROUTING_MAP.gis.tools,
      isSupported: true,
    };
  }

  // Check 7: 3D
  if (TOOL_ROUTING_MAP.threed.extensions.includes(ext)) {
    return {
      category: TOOL_ROUTING_MAP.threed.category,
      ext: ext.toUpperCase(),
      mime: mime || 'model/stl',
      color: TOOL_ROUTING_MAP.threed.badgeColor,
      icon: TOOL_ROUTING_MAP.threed.icon,
      size,
      tools: TOOL_ROUTING_MAP.threed.tools,
      isSupported: true,
    };
  }

  // Check 8: Fonts
  if (TOOL_ROUTING_MAP.fonts.extensions.includes(ext)) {
    return {
      category: TOOL_ROUTING_MAP.fonts.category,
      ext: ext.toUpperCase(),
      mime: mime || 'font/ttf',
      color: TOOL_ROUTING_MAP.fonts.badgeColor,
      icon: TOOL_ROUTING_MAP.fonts.icon,
      size,
      tools: TOOL_ROUTING_MAP.fonts.tools,
      isSupported: true,
    };
  }

  // Check 9: Ebooks
  if (TOOL_ROUTING_MAP.ebooks.extensions.includes(ext)) {
    return {
      category: TOOL_ROUTING_MAP.ebooks.category,
      ext: ext.toUpperCase(),
      mime: mime || 'application/epub+zip',
      color: TOOL_ROUTING_MAP.ebooks.badgeColor,
      icon: TOOL_ROUTING_MAP.ebooks.icon,
      size,
      tools: TOOL_ROUTING_MAP.ebooks.tools,
      isSupported: true,
    };
  }

  // Check 10: Documents
  if (TOOL_ROUTING_MAP.documents.extensions.includes(ext)) {
    return {
      category: TOOL_ROUTING_MAP.documents.category,
      ext: ext.toUpperCase(),
      mime: mime || 'text/plain',
      color: TOOL_ROUTING_MAP.documents.badgeColor,
      icon: TOOL_ROUTING_MAP.documents.icon,
      size,
      tools: TOOL_ROUTING_MAP.documents.getTools(ext),
      isSupported: true,
    };
  }

  // Fallback: Generic unsupported type
  return {
    category: 'Universal File',
    ext: ext ? ext.toUpperCase() : 'UNKNOWN',
    mime: mime || 'application/octet-stream',
    color: '#64748b',
    icon: HelpCircle,
    size,
    tools: [
      { id: 'cyber_forensics', title: 'Cyber Forensics Investigator', desc: 'Inspect magic bytes, Shannon entropy, hashes & carved strings', path: '/cyber_forensics', badge: 'Forensics', targetExt: 'REPORT' },
      { id: 'hash_gen', title: 'Cryptographic Hash (SHA-256)', desc: 'Generate file integrity checksum hashes', path: '/hash_generator', badge: 'Security', targetExt: 'HASH' },
      { id: 'base64', title: 'Base64 Encoder/Decoder', desc: 'Translate raw bytes into safe base64 strings', path: '/base64_encode_decode', badge: 'Dev Tool', targetExt: 'TXT' },
      { id: 'bcrypt', title: 'Bcrypt Hash Generator', desc: 'Generate secure salted password hashes', path: '/bcrypt_generator', badge: 'Security', targetExt: 'HASH' },
      { id: 'word_count', title: 'Word & Character Metrics', desc: 'Count words and analyze text metrics', path: '/word_character_counter', badge: 'Analytics', targetExt: 'TXT' },
    ],
    isSupported: false,
  };
}

export default function UniversalDropzone() {
  const { sharedFile, sharedFiles, setFile, setFiles, addFiles, removeFile, clearFiles, clearFile } = useFileContext();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [isLockFaded, setIsLockFaded] = useState(false);
  const [isProcessingModal, setIsProcessingModal] = useState(false);
  const [processingTool, setProcessingTool] = useState(null);
  const [terminalStream, setTerminalStream] = useState('');
  const fileInputRef = useRef(null);
  const fileInputModeRef = useRef('replace');
  const navigate = useNavigate();

  const currentFiles = (sharedFiles && sharedFiles.length > 0)
    ? sharedFiles
    : (sharedFile ? [sharedFile] : []);
  const activeFile = currentFiles[0] || null;
  const isMultiFile = currentFiles.length > 1;
  const isPhotoGroup = currentFiles.length > 1 && currentFiles.every(f =>
    f.type?.startsWith('image/') || /\.(jpe?g|png|webp|bmp|gif|avif|tiff?)$/i.test(f.name)
  );
  const totalBytes = currentFiles.reduce((acc, f) => acc + (f.size || 0), 0);
  const intelligence = activeFile ? resolveFileTools(activeFile) : null;

  // Continuous scrolling terminal background simulation for active computation
  useEffect(() => {
    if (!isProcessingModal) return;

    const hexChars = '0123456789ABCDEF';
    const interval = setInterval(() => {
      let line = '0x';
      for (let i = 0; i < 8; i++) line += hexChars[Math.floor(Math.random() * 16)];
      line += ` [WORKER] Processing chunk at 0x7FFF${Math.floor(1000 + Math.random() * 9000)} ... Vector transform [OK]\n`;

      setTerminalStream(prev => {
        const lines = (prev + line).split('\n');
        return lines.slice(-25).join('\n');
      });
    }, 90);

    return () => clearInterval(interval);
  }, [isProcessingModal]);

  const triggerLockAnimation = (files) => {
    const fileList = Array.isArray(files) ? files : [files];
    if (fileInputModeRef.current === 'append') {
      addFiles(fileList);
    } else {
      setFiles(fileList);
    }
    fileInputModeRef.current = 'replace';
    setIsLocking(true);
    setIsLockFaded(false);

    setTimeout(() => {
      setIsLockFaded(true);
    }, 150);

    setTimeout(() => {
      setIsLocking(false);
    }, 450);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = Array.from(e.dataTransfer.files);
      if (currentFiles.length > 0) {
        addFiles(dropped);
        setIsLocking(true);
        setTimeout(() => setIsLocking(false), 400);
      } else {
        triggerLockAnimation(dropped);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleSelectTool = (tool) => {
    // Show high-craft icon morphing transition & terminal background
    setProcessingTool(tool);
    setIsProcessingModal(true);

    setTimeout(() => {
      setIsProcessingModal(false);
      navigate(tool.path, { state: { autoLoadedFile: activeFile } });
    }, 750);
  };

  return (
    <div className="universal-hero-container" style={{ width: '100%', maxWidth: '1040px', margin: '0 auto', position: 'relative' }}>
      <style>{`
        /* 06 Midnight Neon Theme & Spring Transition Styles */
        .universal-dropzone-box {
          border: 2px dashed #A78BFA;
          background: #ffffff;
          border-radius: 16px;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                      border-color 0.2s ease,
                      background-color 0.2s ease,
                      box-shadow 0.3s ease-out,
                      padding 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.05);
        }

        .universal-dropzone-box.drag-over {
          border-color: #22D3EE !important;
          background: #F8FAFC !important;
          box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.25), 0 12px 30px -4px rgba(15, 23, 42, 0.12) !important;
          transform: scale(1.01);
        }

        .universal-dropzone-box.pulse-locked {
          animation: pulseLockGlow 0.35s ease-out forwards;
        }

        @keyframes pulseLockGlow {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.4), 0 4px 16px rgba(15, 23, 42, 0.06);
            border-color: #22D3EE;
          }
          50% {
            box-shadow: 0 0 0 6px rgba(34, 211, 238, 0.2), 0 8px 24px rgba(15, 23, 42, 0.1);
            border-color: #22D3EE;
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 211, 238, 0), 0 4px 16px rgba(15, 23, 42, 0.06);
            border-color: #A78BFA;
          }
        }

        .universal-dropzone-box.has-file {
          padding: 1.25rem 1.5rem !important;
          border-style: solid;
          border-color: #A78BFA;
          background: #ffffff;
          transform: translateY(-20px) scale(0.95);
        }

        /* Padlock snap shackle keyframes */
        .lock-shackle-animated {
          animation: snapLockShackle 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: 50% 80%;
        }

        @keyframes snapLockShackle {
          0% {
            transform: translateY(-4px) rotate(-14deg);
          }
          70% {
            transform: translateY(1px) rotate(2deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }

        /* Target Panel Spring Slide-Down */
        .spring-revealed-panel {
          animation: targetPanelSlideDown 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: top center;
        }

        @keyframes targetPanelSlideDown {
          0% {
            opacity: 0;
            transform: translateY(-40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Strict Hover Inversion Card Styling (<= 150ms) */
        .action-tool-card-invert {
          background: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 1.15rem 1.25rem;
          cursor: pointer;
          transition: background-color 130ms ease,
                      color 130ms ease,
                      border-color 130ms ease,
                      transform 130ms ease,
                      box-shadow 130ms ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-decoration: none;
          color: #0F172A;
          position: relative;
        }

        .action-tool-card-invert:hover {
          background: #0F172A !important;
          color: #ffffff !important;
          border-color: #0F172A !important;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px -4px rgba(15, 23, 42, 0.25);
        }

        .action-tool-card-invert:hover .tool-card-title {
          color: #ffffff !important;
        }

        .action-tool-card-invert:hover .tool-card-desc {
          color: #CBD5E1 !important;
        }

        .action-tool-card-invert:hover .tool-card-badge {
          background: #7C3AED !important;
          color: #ffffff !important;
          border-color: #A78BFA !important;
        }

        .action-tool-card-invert:hover .card-arrow-indicator {
          transform: translateX(4px);
          color: #22D3EE !important;
        }

        .card-arrow-indicator {
          transition: transform 130ms ease, color 130ms ease;
        }

        /* Morphing Icon Animation Keyframes */
        @keyframes morphSourceToTarget {
          0% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
          40% {
            opacity: 0.2;
            transform: scale(0.7) rotate(90deg);
          }
          60% {
            opacity: 0.2;
            transform: scale(0.7) rotate(90deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        .icon-morph-container {
          animation: morphSourceToTarget 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) infinite alternate;
        }
      `}</style>

      {/* 1. THE DROPZONE CONTAINER */}
      <div
        className={`universal-dropzone-box ${isDragOver ? 'drag-over' : ''} ${currentFiles.length > 0 ? 'has-file' : ''} ${isLocking ? 'pulse-locked' : ''}`}
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => currentFiles.length === 0 && fileInputRef.current?.click()}
        style={{
          padding: currentFiles.length > 0 ? '1.25rem 1.5rem' : '2.25rem 1.5rem',
          textAlign: 'center',
          cursor: currentFiles.length > 0 ? 'default' : 'pointer',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onClick={(e) => { e.target.value = ''; }}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              triggerLockAnimation(Array.from(e.target.files));
            }
          }}
        />

        {/* INITIAL STATE: Centralized Dropzone */}
        {currentFiles.length === 0 ? (
          <div style={{ pointerEvents: 'auto' }}>
            <div style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              background: '#EDE9FE',
              border: '1.5px solid #A78BFA',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.9rem auto',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.15)'
            }}>
              <UploadCloud size={28} strokeWidth={2} />
            </div>

            <h2 style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.4px',
              marginBottom: '0.35rem'
            }}>
              Drop your files here, or browse
            </h2>

            <p style={{
              color: '#475569',
              fontSize: '0.9rem',
              maxWidth: '520px',
              margin: '0 auto 1.1rem auto',
              lineHeight: 1.45
            }}>
              Batch photos, documents, videos, or cyber forensics. 100% private in-browser RAM execution.
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputModeRef.current = 'replace';
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                  fileInputRef.current.click();
                }
              }}
              style={{
                background: '#0F172A',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '10px',
                fontWeight: 650,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#7C3AED';
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#0F172A';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(15, 23, 42, 0.25)';
              }}
            >
              <UploadCloud size={17} />
              <span>Browse Computer</span>
            </button>

            {/* Quick format indicators */}
            <div style={{
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              flexWrap: 'wrap'
            }}>
              {['Batch Photos', 'PDF', 'PNG', 'JPG', 'WEBP', 'MP4', 'GIF', 'Cyber Forensics', '50+ Formats'].map((fmt) => (
                <span
                  key={fmt}
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    background: '#EDE9FE',
                    color: '#0F172A',
                    border: '1px solid #C4B5FD',
                    letterSpacing: '0.02em'
                  }}
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        ) : isMultiFile ? (
          /* MULTI-FILE REVEALED STATE HEADER */
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                background: '#000000',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
              }}>
                <Images size={22} className="lock-shackle-animated" />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
                    Batch of {currentFiles.length} {isPhotoGroup ? 'Photos' : 'Files'}
                  </span>
                  <span style={{
                    background: '#000000',
                    color: '#ffffff',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px'
                  }}>
                    {isPhotoGroup ? 'PHOTO BATCH' : 'MULTI-FILE'}
                  </span>
                  <span style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 600
                  }}>
                    {formatBytes(totalBytes)}
                  </span>
                </div>

                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  color: '#64748b',
                  marginTop: '0.2rem',
                  opacity: isLockFaded ? 1 : 0,
                  transition: 'opacity 0.4s ease'
                }}>
                  🔒 Secured locally in RAM. Zero bytes sent to any server.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  fileInputModeRef.current = 'append';
                  fileInputRef.current?.click();
                }}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#111827',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'border-color 0.15s'
                }}
              >
                <Plus size={13} /> Add More Files
              </button>

              <button
                onClick={() => {
                  fileInputModeRef.current = 'replace';
                  fileInputRef.current?.click();
                }}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#111827',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'border-color 0.15s'
                }}
              >
                <RefreshCw size={13} /> Replace All
              </button>

              <button
                onClick={clearFiles}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <X size={14} /> Clear All
              </button>
            </div>
          </div>
        ) : (
          /* SINGLE FILE REVEALED STATE HEADER */
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                background: '#000000',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
              }}>
                <Lock size={22} className="lock-shackle-animated" />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
                    {truncateFileName(activeFile.name, 25)}
                  </span>
                  <span style={{
                    background: '#000000',
                    color: '#ffffff',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px'
                  }}>
                    {intelligence?.ext}
                  </span>
                </div>

                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  color: '#64748b',
                  marginTop: '0.2rem',
                  opacity: isLockFaded ? 1 : 0,
                  transition: 'opacity 0.4s ease'
                }}>
                  🔒 Secured locally. Zero bytes sent to the internet.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  fileInputModeRef.current = 'append';
                  fileInputRef.current?.click();
                }}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#111827',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'border-color 0.15s'
                }}
              >
                <Plus size={13} /> Add More Files
              </button>

              <button
                onClick={() => {
                  fileInputModeRef.current = 'replace';
                  fileInputRef.current?.click();
                }}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#111827',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'border-color 0.15s'
                }}
              >
                <RefreshCw size={13} /> Replace File
              </button>

              <button
                onClick={clearFiles}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <X size={14} /> Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. THE SLIDE-DOWN TARGET PANEL (Framer Motion Physics: initial y: -40 to animate y: 0) */}
      {currentFiles.length > 0 && (
        <div className="spring-revealed-panel" style={{ marginTop: '1rem' }}>
          {isPhotoGroup ? (
            <BatchPhotoStudio
              files={currentFiles}
              onRemoveFile={removeFile}
              onAddMore={() => {
                fileInputModeRef.current = 'append';
                fileInputRef.current?.click();
              }}
              onClearAll={clearFiles}
            />
          ) : isMultiFile ? (
            /* Multi-file list for non-photo or mixed files */
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 16px -2px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Selected Files ({currentFiles.length})
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                    Total: {formatBytes(totalBytes)} • Stored purely in browser RAM
                  </p>
                </div>
                <button
                  onClick={() => {
                    fileInputModeRef.current = 'append';
                    fileInputRef.current?.click();
                  }}
                  style={{
                    background: '#111827',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Plus size={14} /> Add More Files
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {currentFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.name}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                        {formatBytes(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {currentFiles.every(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#166534' }}>
                      Ready to Merge {currentFiles.length} PDFs
                    </h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#15803d' }}>
                      Combine these PDF documents sequentially into a single unified file.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/merge_pdf', { state: { autoLoadedFiles: currentFiles, autoLoadedFile: currentFiles[0] } })}
                    style={{
                      background: '#166534',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.6rem 1.25rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>Launch Merge PDF</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Single file target panel */
            <>
              {/* Panel Top Metadata Row */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.85rem 1.25rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <div style={{ fontSize: '0.88rem', color: '#111827', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#111827' }}>{truncateFileName(activeFile.name, 25)}</span>
                  <span style={{ color: '#94a3b8' }}>•</span>
                  <span style={{ color: '#4b5563' }}>{intelligence?.size}</span>
                  <span style={{ color: '#94a3b8' }}>•</span>
                  <span style={{ color: '#4b5563', fontFamily: 'monospace', fontSize: '0.82rem' }}>{intelligence?.mime}</span>
                </div>

                {/* "Data Saved" Local Guarantee Badge */}
                <div style={{
                  background: '#000000',
                  color: '#ffffff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>{((activeFile.size || 0) / (1024 * 1024)).toFixed(2)} MB processed locally. 0 bytes sent to the internet.</span>
                </div>
              </div>

              {/* If single image, friendly hint for batch photos */}
              {(activeFile.type?.startsWith('image/') || /\.(jpe?g|png|webp|bmp|gif|avif)$/i.test(activeFile.name)) && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.65rem 1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  fontSize: '0.8rem',
                  color: '#475569'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={15} color="#0f172a" />
                    <span>Want to edit a <strong>group of photos</strong>? Drop more photos or click "Add More Files" to activate the <strong>Batch Photo Studio</strong>.</span>
                  </div>
                  <button
                    onClick={() => {
                      fileInputModeRef.current = 'append';
                      fileInputRef.current?.click();
                    }}
                    style={{
                      background: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.3rem 0.7rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    + Add More
                  </button>
                </div>
              )}

              {/* Panel Bottom: Dynamic Tool Grid */}
              {intelligence?.isSupported ? (
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.85rem',
                    padding: '0 0.25rem'
                  }}>
                    <h3 style={{
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      color: '#111827',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px'
                    }}>
                      Compatible Tools ({intelligence.tools.length})
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Select an action to launch instantly with your file preloaded
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1rem'
                  }}>
                    {intelligence.tools.map((tool) => (
                      <div
                        key={tool.id}
                        className="action-tool-card-invert"
                        onClick={() => handleSelectTool(tool)}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                            <span className="tool-card-title" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>
                              {tool.title}
                            </span>
                            <span className="tool-card-badge" style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              color: '#475569',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.3px'
                            }}>
                              {tool.badge}
                            </span>
                          </div>
                          <p className="tool-card-desc" style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                            {tool.desc}
                          </p>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          marginTop: '0.85rem'
                        }}>
                          <span>Launch Tool</span>
                          <ArrowRight size={13} className="card-arrow-indicator" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Fallback Graceful State */
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '2.5rem 2rem',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto'
                  }}>
                    <AlertCircle size={24} />
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginBottom: '0.4rem' }}>
                    No specific tools available for this file format yet
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
                    We detected a <strong>.{intelligence?.ext}</strong> file ({intelligence?.size}, {intelligence?.mime}). You can still analyze or hash its payload using universal utilities:
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '0.75rem',
                    textAlign: 'left',
                    marginBottom: '1.5rem'
                  }}>
                    {intelligence?.tools.map((tool) => (
                      <div
                        key={tool.id}
                        className="action-tool-card-invert"
                        onClick={() => handleSelectTool(tool)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="tool-card-title" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{tool.title}</span>
                          <ArrowRight size={13} className="card-arrow-indicator" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={clearFiles}
                    style={{
                      background: '#000000',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.65rem 1.75rem',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Clear Upload
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 4. THE PROCESSING STATE: ICON MORPHING & TERMINAL BACKGROUND MODAL */}
      {isProcessingModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {/* Scrolling Terminal Monospace Visualizer (z-index: 0, opacity: 0.04) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            opacity: 0.045,
            overflow: 'hidden',
            pointerEvents: 'none',
            fontFamily: 'monospace',
            fontSize: '11px',
            lineHeight: '16px',
            color: '#000000',
            whiteSpace: 'pre',
            padding: '1.5rem',
            userSelect: 'none'
          }}>
            {terminalStream}
          </div>

          {/* Morphing SVG Graphic */}
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div className="icon-morph-container" style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: '#000000',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
              <Sparkles size={36} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '0.4rem', letterSpacing: '-0.3px' }}>
              Initializing {processingTool?.title}...
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Loading Web Worker & local pipeline in browser memory
            </p>

            {/* "Data Saved" Pill Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#000000',
              color: '#ffffff',
              padding: '0.35rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              <ShieldCheck size={14} />
              <span>{((activeFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB processed locally. 0 bytes sent to the internet.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
