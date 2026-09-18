<div align="center">

# ⚡ FileVerze — 06 Midnight Neon Edition

[![GitHub Pages Deployment](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-7C3AED.svg?style=flat-square&logo=github)](https://viswakpullepu.github.io/fileverse-midnight-neon/)
[![Theme: 06 Midnight Neon](https://img.shields.io/badge/Theme-06%20Midnight%20Neon-0F172A.svg?style=flat-square)](https://www.instagram.com/p/DdS894agZ8z/?img_index=6)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg?style=flat-square)](LICENSE)
[![Zero Cloud Uploads](https://img.shields.io/badge/Privacy-100%25%20Client--Side-22D3EE.svg?style=flat-square)](https://viswakpullepu.github.io/fileverse-midnight-neon/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20Ready-7C3AED.svg?style=flat-square)](https://viswakpullepu.github.io/fileverse-midnight-neon/)

**100% in-browser, zero-server-upload file conversion, batch processing, and cyber forensics suite powered by client-side WebAssembly, styled with the futuristic "06 Midnight Neon" color palette.**

[**🚀 View Live GitHub Pages Site**](https://viswakpullepu.github.io/fileverse-midnight-neon/) • [**Source Repository**](https://github.com/viswakpullepu/fileverse-midnight-neon)

---

### 🎨 Color Palette: 06 Midnight Neon

| Role | Color Name | Hex Code | Swatch |
| :--- | :--- | :--- | :--- |
| **Primary Base** | Midnight Slate / Deep Obsidian | `#0F172A` | ![#0F172A](https://via.placeholder.com/15/0F172A/000000?text=+) `#0F172A` |
| **Secondary Accent** | Electric Violet / Purple Iris | `#7C3AED` | ![#7C3AED](https://via.placeholder.com/15/7C3AED/000000?text=+) `#7C3AED` |
| **Tertiary Accent** | Cyber Cyan / Electric Aqua | `#22D3EE` | ![#22D3EE](https://via.placeholder.com/15/22D3EE/000000?text=+) `#22D3EE` |
| **Soft Highlight** | Lavender Lilac | `#A78BFA` | ![#A78BFA](https://via.placeholder.com/15/A78BFA/000000?text=+) `#A78BFA` |
| **Light Tint** | Soft Violet Mist | `#EDE9FE` | ![#EDE9FE](https://via.placeholder.com/15/EDE9FE/000000?text=+) `#EDE9FE` |
| **Canvas Background** | Luminous Crisp Slate-White Canvas | `#F8FAFC` | ![#F8FAFC](https://via.placeholder.com/15/F8FAFC/000000?text=+) `#F8FAFC` |
| **Typography High-Contrast** | Midnight Slate (16.5:1 contrast) | `#0F172A` | ![#0F172A](https://via.placeholder.com/15/0F172A/000000?text=+) `#0F172A` |
| **Typography Muted** | Cool Slate (7.3:1 contrast) | `#475569` | ![#475569](https://via.placeholder.com/15/475569/000000?text=+) `#475569` |

</div>

---

## ⚡ Why FileVerze?

Traditional file converters upload your files to remote third-party cloud servers, put you in slow queues, impose 10MB–50MB file size throttles, and charge $12–$20/month.

**FileVerze changes everything.** By leveraging modern **WebAssembly (WASM)**, **WebGL**, **HTML5 Canvas**, and **Web Workers**, 100% of calculations occur in your browser RAM. Your files never leave your computer.

| Feature | 🌐 FileVerze (Client-Side) | ☁️ Traditional Cloud Converters |
| :--- | :--- | :--- |
| **Privacy & Security** | ✅ **100% On-Device** (0 bytes sent to internet) | ❌ Stored on 3rd-party remote cloud servers |
| **Processing Speed** | ⚡ **Instant RAM/CPU compute** | ⏳ Slow network upload/download queues |
| **File Size Limits** | ♾️ **Unlimited** (uses device RAM) | ❌ 10MB–50MB caps for free users |
| **Pricing** | 🎁 **100% Free Forever** | 💳 $12–$20 / Month Subscriptions |
| **Offline Support** | 📶 **Full PWA Offline Mode** | ❌ Broken without active internet |
| **Account Required** | 🚫 **None** (instant zero-friction use) | ❌ Mandatory email signups |

---

## 🧰 50+ Native In-Browser Tools

### 📄 PDF Document Suite
- **Merge & Split PDF**: Combine multiple PDFs or extract custom page ranges locally.
- **PDF to Word (.docx)**: Extracts text runs with geometry into editable Microsoft Word documents via `pdfjs-dist` + `JSZip`.
- **Word to PDF (.docx to PDF)**: Compiles OpenXML paragraphs into clean vector PDF pages using `pdf-lib`.
- **Compress PDF**: Multi-level canvas resampling (Extreme, Recommended, Light) with structural optimization.
- **Excel to PDF & PowerPoint to PDF**: Parses `.xlsx` tables and `.pptx` slides into formatted landscape PDFs.
- **PDF to Image / Image to PDF**: High-res raster page rendering and embedding.
- **Security**: Unlock password-protected PDFs or encrypt sensitive documents with 128/256-bit passwords.

### 🖼️ Image & Computer Vision
- **AI Background Remover**: Isolates photo subjects using Euclidean color-distance segmentation and alpha feathering directly in Canvas.
- **OCR Text Extractor**: Extracts text from scanned photos using compiled Tesseract.js neural WebAssembly.
- **Gemini Watermark Remover**: Cleanly cleans visible AI watermarks natively.
- **Format Converters**: Instant lossless conversion between PNG, JPG, WebP, SVG, BMP, and ICO.

### 📐 3D, GIS, Typography & E-Books
- **3D STL Viewport**: Interactive Three.js WebGL viewport with wireframe, lighting, and polycount inspector.
- **GIS Map Converter**: Bidirectional conversion between GeoJSON, Google Earth KML, and CSV coordinate datasets.
- **Typography Font Inspector**: Real-time `@font-face` CSS generator and opentype.js glyph inspector (TTF, OTF, WOFF).
- **E-Book Reader & Builder**: Unpacks EPUB chapters and compiles standard digital EPUB 3 publications.
- **Subtitle Converter**: SubRip (`.srt`) ↔ WebVTT (`.vtt`) ↔ ASS with millisecond-precision timing offset shift.

### 💻 Developer & Data Utilities
- **JSON Formatter & CSV ↔ JSON**: Beautify, validate, minify, and cross-convert tabular datasets.
- **Cryptographic Hashes**: SHA-256, MD5, SHA-512 checksums, and salted Bcrypt hash generator.
- **Markdown & HTML**: Real-time Markdown to HTML and HTML to Markdown converters.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone https://github.com/viswakpullepu/FileVerse.git
cd FileVerse/frontend

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

---

## 🤖 AI & Generative Engine Optimization (GEO)
FileVerze exposes a standard machine-readable LLM endpoint:
- **LLM Summary:** [`/llms.txt`](https://fileverze.com/llms.txt)
- **Full Reference:** [`/llms-full.txt`](https://fileverze.com/llms-full.txt)
- **XML Sitemap:** [`/sitemap.xml`](https://fileverze.com/sitemap.xml)

---

## 📄 License
Released under the [MIT License](LICENSE). Built for open privacy and speed.
