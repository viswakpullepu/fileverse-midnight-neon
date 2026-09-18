import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Comprehensive, High-Intent 2026 Keyword Catalog for all routes on FileVerze
const ROUTE_SEO_MAP = {
  '/': {
    title: 'FileVerze — Best Free Online File Converter (No Sign Up, 100% In-Browser Privacy)',
    description: 'Convert, compress, and edit PDFs, images, videos, 3D STL models, fonts, subtitles, and spreadsheets 100% locally in your browser. Free, no sign up, zero cloud upload.',
    keywords: 'best free online file converter, free online file converter no sign up, pdf to word converter free, compress pdf online, remove background from image online free, 100% private file converter, in-browser file tools, batch file converter'
  },
  '/all_tools': {
    title: 'All Free File Tools & Converters (50+ In-Browser Utilities) — FileVerze',
    description: 'Browse all 50+ free in-browser file conversion, optimization, dev, and media tools with zero cloud uploads.',
    keywords: 'all file tools, free online converters, pdf tools, image tools, dev tools, video tools, 3d tools'
  },
  '/universal_converter': {
    title: 'Universal File Converter Online (Auto Format Detection, No Upload) — FileVerze',
    description: 'Drop any document, image, video, 3D model, or spreadsheet to instantly detect formats and convert locally in browser memory.',
    keywords: 'universal file converter, smart dropzone, auto file detector, universal converter online free'
  },
  '/faq': {
    title: 'Frequently Asked Questions & Security Architecture — FileVerze',
    description: 'Learn how FileVerze processes PDFs, images, videos, 3D models, and office documents 100% locally in your browser with zero server uploads.',
    keywords: 'fileverze faq, private file converter faq, zero upload conversion, client side file tools questions, gdpr compliant file converter'
  },

  // PDF Tools
  '/merge_pdf': {
    title: 'Merge PDF Online Free (No Sign Up, Unlimited Files) — FileVerze',
    description: 'Combine multiple PDF files into one single document locally in your browser. 100% free, private, and instant with zero file size limits.',
    keywords: 'merge pdf online free, combine pdf no sign up, join pdf files free, unlimited pdf merger'
  },
  '/split_pdf': {
    title: 'Split PDF Online Free (Extract Pages & Ranges) — FileVerze',
    description: 'Separate pages or extract page ranges from PDF files with instant local processing and no cloud uploads.',
    keywords: 'split pdf online free, extract pdf pages, separate pdf pages, free pdf splitter'
  },
  '/pdf_to_word': {
    title: 'PDF to Word Converter Free No Sign Up (Convert PDF to DOCX Online) — FileVerze',
    description: 'Convert PDF documents into editable Microsoft Word (.docx) files locally in your browser. Preserves layouts, tables, and text formatting.',
    keywords: 'pdf to word converter free, convert pdf to docx online, pdf to word no sign up, editable word document from pdf, scanned pdf to word'
  },
  '/word_to_pdf': {
    title: 'Word to PDF Converter Online Free (.docx to PDF Vector) — FileVerze',
    description: 'Convert Word DOCX documents into clean, paginated vector PDF files with zero server uploads and 100% privacy.',
    keywords: 'word to pdf converter free, convert docx to pdf online, word to pdf no sign up, doc to pdf converter'
  },
  '/compress_pdf': {
    title: 'Compress PDF Online Free (Reduce PDF Size Without Quality Loss) — FileVerze',
    description: 'Shrink PDF file sizes by up to 80% with smart canvas image optimization and metadata compaction entirely in-browser.',
    keywords: 'compress pdf online free, reduce pdf size without quality loss, shrink pdf file, optimize pdf online'
  },
  '/excel_to_pdf': {
    title: 'Excel to PDF Converter Online Free (.xlsx to PDF Table) — FileVerze',
    description: 'Convert Excel spreadsheets (.xlsx, .xls) into clean formatted landscape PDF tables natively in browser memory.',
    keywords: 'excel to pdf converter, xlsx to pdf table, convert spreadsheet to pdf online free'
  },
  '/powerpoint_to_pdf': {
    title: 'PowerPoint to PDF Converter Online Free (.pptx to Slide PDF) — FileVerze',
    description: 'Convert PowerPoint slide presentations into clean 16:9 landscape PDF documents directly in your browser.',
    keywords: 'powerpoint to pdf online, pptx to pdf converter free, convert presentation to pdf'
  },
  '/pdf_to_image': {
    title: 'PDF to JPG Converter Online Free (High Resolution PDF to Image) — FileVerze',
    description: 'Convert every page of a PDF document into crisp, high-resolution JPG images instantly in your browser.',
    keywords: 'pdf to jpg converter free, pdf to image online, convert pdf pages to photos'
  },
  '/image_to_pdf': {
    title: 'Image to PDF Converter Free (JPG, PNG, WebP to PDF) — FileVerze',
    description: 'Convert and combine JPG, PNG, and WebP images into a single clean PDF document in seconds.',
    keywords: 'image to pdf converter, jpg to pdf free, png to pdf online'
  },
  '/remove_pages': {
    title: 'Remove PDF Pages Online Free (Delete Unwanted Pages) — FileVerze',
    description: 'Delete specific unwanted pages from your PDF documents instantly.',
    keywords: 'remove pdf pages free, delete pages from pdf online'
  },
  '/extract_pages': {
    title: 'Extract PDF Pages Online Free — FileVerze',
    description: 'Extract select pages into a new independent PDF document.',
    keywords: 'extract pdf pages online, split select pages pdf'
  },
  '/rotate_pdf': {
    title: 'Rotate PDF Online Free (Permanent 90°/180°/270° Flip) — FileVerze',
    description: 'Rotate individual pages or entire PDF documents permanently with instant download.',
    keywords: 'rotate pdf online free, flip pdf orientation, save rotated pdf'
  },
  '/add_page_numbers': {
    title: 'Add Page Numbers to PDF Online Free — FileVerze',
    description: 'Stamp custom page numbering into headers and footers of PDF documents.',
    keywords: 'add page numbers to pdf, stamp page numbers online'
  },
  '/add_watermark': {
    title: 'Add Watermark to PDF Online Free — FileVerze',
    description: 'Stamp custom text or image watermarks onto PDF pages with transparency controls.',
    keywords: 'add watermark to pdf free, watermark pdf online'
  },
  '/unlock_pdf': {
    title: 'Unlock PDF Online Free (Remove Password & Restrictions) — FileVerze',
    description: 'Remove restrictions and passwords from encrypted PDF files with zero cloud uploads.',
    keywords: 'unlock pdf online free, remove pdf password, decrypt pdf'
  },
  '/protect_pdf': {
    title: 'Protect PDF Online Free (Password Encrypt PDF) — FileVerze',
    description: 'Encrypt and password-protect your confidential PDF documents with strong encryption.',
    keywords: 'protect pdf online free, password protect pdf, encrypt pdf file'
  },

  // Image & AI Tools
  '/remove_background': {
    title: 'Remove Background from Image Online Free (HD Transparent PNG) — FileVerze',
    description: 'Isolate subjects and export transparent PNGs directly in your browser with real-time tolerance tuning. Fast, private, and 100% offline.',
    keywords: 'remove background from image online free, transparent png cutout, image background remover free no sign up, remove bg hd'
  },
  '/compress_image': {
    title: 'Image Compressor Online Free (Compress JPG, PNG, WebP) — FileVerze',
    description: 'Reduce image file size significantly while preserving high visual quality and custom resolution.',
    keywords: 'image compressor online free, reduce image size, compress jpg, compress png, optimize image'
  },
  '/ocr_extractor': {
    title: 'OCR Text Extractor Online Free (Scanned Image to Text & Word) — FileVerze',
    description: 'Extract text from scanned images and documents using in-browser neural AI (Tesseract.js WASM) with zero server uploads.',
    keywords: 'ocr text extractor online, image to text free, scanned pdf to word with ocr, extract text from photo'
  },
  '/gemini_watermark_remover': {
    title: 'Gemini Watermark Remover Online Free — FileVerze',
    description: 'Cleanly remove visible Google Gemini AI watermarks from images natively in your browser.',
    keywords: 'gemini watermark remover, remove ai watermark free, clean image watermark'
  },
  '/convert_image': {
    title: 'Image Format Converter Online (PNG, JPG, WebP, SVG, BMP) — FileVerze',
    description: 'Convert between PNG, JPG, WebP, SVG, BMP, and ICO formats instantly in your browser.',
    keywords: 'convert image format, png to jpg, jpg to png, convert to webp free'
  },
  '/resize_image': {
    title: 'Resize Image Dimensions Online Free — FileVerze',
    description: 'Resize image dimensions by exact pixels or percentage scale.',
    keywords: 'resize image online, scale photo dimensions, change image resolution'
  },
  '/rotate_image': {
    title: 'Rotate Image Online Free — FileVerze',
    description: 'Rotate images 90, 180, or 270 degrees instantly.',
    keywords: 'rotate image online, flip photo'
  },
  '/grayscale_image': {
    title: 'Grayscale Image Filter Online Free — FileVerze',
    description: 'Convert color photos into clean black-and-white tonal pictures.',
    keywords: 'grayscale image filter, black and white photo converter'
  },
  '/image_blur': {
    title: 'Image Blur & Redaction Tool Online Free — FileVerze',
    description: 'Apply Gaussian blur to redact sensitive details in photos.',
    keywords: 'blur image online, redact sensitive photo details'
  },
  '/bmp_to_png': {
    title: 'BMP to PNG Converter Online Free — FileVerze',
    description: 'Convert legacy uncompressed BMP files into optimized web PNGs.',
    keywords: 'bmp to png converter, convert bitmap to png'
  },
  '/svg_to_png': {
    title: 'SVG to PNG Converter Online Free (High Resolution Rasterizer) — FileVerze',
    description: 'Rasterize vector SVG files into high-resolution PNG images.',
    keywords: 'svg to png converter free, rasterize svg vector'
  },
  '/image_to_ico': {
    title: 'Favicon Generator (Image to ICO Online Free) — FileVerze',
    description: 'Convert images to multi-size Windows icon (.ico) favicons for websites.',
    keywords: 'image to ico converter, favicon generator online free, create ico file'
  },

  // Video Tools
  '/video_to_gif': {
    title: 'Video to GIF Converter Online Free (MP4, WebM to Animated GIF) — FileVerze',
    description: 'Convert video clips into lightweight, shareable animated GIFs with custom frame rate and sizing.',
    keywords: 'video to gif converter online free, mp4 to gif, webm to gif, create animated gif from video'
  },
  '/video_to_audio': {
    title: 'Extract Audio from Video Online Free (Video to MP3/WAV) — FileVerze',
    description: 'Extract audio soundtracks directly from video files without cloud uploads.',
    keywords: 'video to audio converter, extract mp3 from video free, video to wav'
  },
  '/trim_video': {
    title: 'Trim Video Online Free (Cut Video in Browser) — FileVerze',
    description: 'Cut and trim video segments right inside your browser with millisecond precision.',
    keywords: 'trim video online free, cut video in browser, slice video clips'
  },
  '/mute_video': {
    title: 'Mute Video Online Free (Remove Audio Track) — FileVerze',
    description: 'Strip audio tracks completely from video clips.',
    keywords: 'mute video online free, remove sound from video'
  },
  '/change_video_speed': {
    title: 'Change Video Speed Online Free (Slow Motion & Fast Forward) — FileVerze',
    description: 'Speed up or slow down video playback frame rates in browser memory.',
    keywords: 'change video speed online free, slow motion video, speed up video'
  },
  '/extract_video_frames': {
    title: 'Extract Video Frames Online Free (Video to JPG Sequence) — FileVerze',
    description: 'Export all video frames as a sequence of high-resolution JPG images.',
    keywords: 'extract video frames, video to images sequence'
  },
  '/reverse_video': {
    title: 'Reverse Video Online Free (Play Video Backwards) — FileVerze',
    description: 'Play video clips backwards from end to start.',
    keywords: 'reverse video online free, play video backwards'
  },
  '/webm_to_mp4': {
    title: 'WebM to MP4 Converter Online Free — FileVerze',
    description: 'Convert WebM video clips into universally compatible MP4 format.',
    keywords: 'webm to mp4 converter free, convert webm video'
  },

  // 3D, GIS, Font & E-Book Tools
  '/threed_converter': {
    title: '3D STL Viewer & Mesh Inspector Online Free (WebGL) — FileVerze',
    description: 'Inspect 3D STL geometry in an interactive WebGL viewport with wireframe, lighting, and polycount analysis.',
    keywords: '3d stl viewer online, webgl 3d model inspector, stl viewer free, inspect 3d mesh'
  },
  '/gis_converter': {
    title: 'GIS Map Converter Online Free (GeoJSON ↔ Google Earth KML) — FileVerze',
    description: 'Convert between GeoJSON, Google Earth KML, and CSV map coordinates in your browser with zero server uploads.',
    keywords: 'gis map converter, geojson to kml, kml to geojson, csv coordinates to geojson'
  },
  '/font_converter': {
    title: 'Font Inspector & @font-face CSS Generator (TTF, OTF, WOFF) — FileVerze',
    description: 'Inspect typography glyphs, test custom strings in real-time, and generate copy-ready @font-face CSS declarations.',
    keywords: 'font inspector online, ttf to woff converter, opentype glyph viewer, font face css generator'
  },
  '/ebook_converter': {
    title: 'EPUB E-Book Reader & Builder Online Free — FileVerze',
    description: 'Extract EPUB chapters, read books in your browser, and compile standard digital EPUB 3 publications.',
    keywords: 'epub reader online free, epub builder, ebook converter, extract epub chapters'
  },
  '/subtitle_converter': {
    title: 'Subtitle Converter Online Free (SRT ↔ VTT ↔ ASS with Sync Shift) — FileVerze',
    description: 'Convert subtitle files between SubRip (.srt), WebVTT (.vtt), and ASS formats with millisecond timing offset sync.',
    keywords: 'subtitle converter online free, srt to vtt, vtt to srt, subtitle timing sync offset'
  },

  // Dev & Data Tools
  '/json_formatter': {
    title: 'JSON Formatter & Validator Online Free — FileVerze',
    description: 'Beautify, validate, format, and minify JSON data structures.',
    keywords: 'json formatter online free, beautify json, minify json, json validator'
  },
  '/csv_to_json': {
    title: 'CSV to JSON Converter Online Free — FileVerze',
    description: 'Convert spreadsheet CSV tables into structured JSON arrays and objects.',
    keywords: 'csv to json converter free, spreadsheet to json online'
  },
  '/json_to_csv': {
    title: 'JSON to CSV Converter Online Free — FileVerze',
    description: 'Export JSON arrays into tabular CSV spreadsheet format.',
    keywords: 'json to csv converter free, json to spreadsheet online'
  },
  '/xml_to_json': {
    title: 'XML to JSON Converter Online Free — FileVerze',
    description: 'Parse XML markup trees into native structured JSON models.',
    keywords: 'xml to json converter, parse xml online'
  },
  '/base64_encode_decode': {
    title: 'Base64 Encoder & Decoder Online Free — FileVerze',
    description: 'Encode text and files to Base64 or decode Base64 strings to original data.',
    keywords: 'base64 encode decode online free, base64 converter'
  },
  '/hash_generator': {
    title: 'Cryptographic Hash Generator (SHA-256, MD5, SHA-512) — FileVerze',
    description: 'Compute checksum cryptographic hashes for text and file verification.',
    keywords: 'hash generator online, sha256 hash generator, md5 hash, file checksum'
  },
  '/bcrypt_generator': {
    title: 'Bcrypt Hash Generator & Verifier Online Free — FileVerze',
    description: 'Generate salted bcrypt password hashes with configurable work factor.',
    keywords: 'bcrypt generator online, bcrypt password hash'
  },
  '/word_character_counter': {
    title: 'Word, Character & Reading Time Counter Online Free — FileVerze',
    description: 'Analyze word counts, character lengths, sentence density, and reading duration.',
    keywords: 'word counter online free, character counter, reading time calculator'
  },
  '/markdown_to_html': {
    title: 'Markdown to HTML Converter Online Free — FileVerze',
    description: 'Compile Markdown syntax into semantic HTML markup in real-time.',
    keywords: 'markdown to html converter online, convert md to html'
  },
  '/html_to_markdown': {
    title: 'HTML to Markdown Converter Online Free — FileVerze',
    description: 'Convert HTML markup trees into clean Markdown syntax.',
    keywords: 'html to markdown converter, convert html to md'
  },
  '/css_formatter': {
    title: 'CSS Formatter & Minifier Online Free — FileVerze',
    description: 'Format, beautify, and compress CSS stylesheets.',
    keywords: 'css formatter online, minify css, beautify css'
  },
  '/html_formatter': {
    title: 'HTML Formatter & Minifier Online Free — FileVerze',
    description: 'Format, indent, and compress HTML documents.',
    keywords: 'html formatter online, format html code, minify html'
  }
};

export default function SEO() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const meta = ROUTE_SEO_MAP[path] || ROUTE_SEO_MAP['/'];

    // Update document title
    document.title = meta.title;

    // Update or create Meta Description
    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', meta.description);

    // Update or create Meta Keywords
    let kwTag = document.querySelector('meta[name="keywords"]');
    if (!kwTag) {
      kwTag = document.createElement('meta');
      kwTag.setAttribute('name', 'keywords');
      document.head.appendChild(kwTag);
    }
    kwTag.setAttribute('content', meta.keywords);

    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', meta.title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', meta.description);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', `https://fileverze.com${path}`);

    // Update Canonical tag
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://fileverze.com${path}`);

  }, [location.pathname]);

  return null;
}
