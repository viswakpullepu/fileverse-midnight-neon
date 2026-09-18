import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';
import { useFileContext } from '../../context/FileContext';
import { BookOpen, Download, FileUp, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export default function EbookConverter() {
  const { sharedFile } = useFileContext();
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'extract'
  const [bookTitle, setBookTitle] = useState('My Digital E-Book');
  const [bookAuthor, setBookAuthor] = useState('Anonymous Author');
  const [chapters, setChapters] = useState([
    { title: 'Chapter 1: The Beginning', content: 'It was a bright cold day in April, and the clocks were striking thirteen...\n\nWelcome to your custom digital book compiled cleanly using FileVerse.' }
  ]);
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (sharedFile && sharedFile.name?.toLowerCase().endsWith('.epub')) {
      setActiveTab('extract');
      readEpubFile(sharedFile);
    }
  }, [sharedFile]);

  const readEpubFile = async (file) => {
    setIsProcessing(true);
    try {
      const zip = await JSZip.loadAsync(file);
      let title = file.name.replace(/\.epub$/i, '');
      let fullText = '';

      const htmlFiles = Object.keys(zip.files).filter(name => name.endsWith('.xhtml') || name.endsWith('.html') || name.endsWith('.htm'));
      for (const fileName of htmlFiles) {
        const text = await zip.file(fileName).async('text');
        const doc = new DOMParser().parseFromString(text, 'text/html');
        fullText += `\n\n=== ${fileName} ===\n\n` + (doc.body?.innerText || doc.body?.textContent || '');
      }

      setExtractedData({
        title,
        fileCount: htmlFiles.length,
        text: fullText.trim()
      });
    } catch (err) {
      alert('Failed to read EPUB file: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate standard EPUB package using JSZip
  const handleGenerateEpub = async () => {
    setIsProcessing(true);
    try {
      const zip = new JSZip();

      // 1. mimetype (MUST be first and uncompressed)
      zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

      // 2. META-INF/container.xml
      zip.folder('META-INF').file('container.xml', `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

      // 3. OEBPS folder
      const oebps = zip.folder('OEBPS');

      // Chapters XHTML
      let manifestItems = '';
      let spineItems = '';

      chapters.forEach((chap, i) => {
        const id = `chap_${i + 1}`;
        const fileName = `${id}.xhtml`;
        manifestItems += `    <item id="${id}" href="${fileName}" media-type="application/xhtml+xml"/>\n`;
        spineItems += `    <itemref idref="${id}"/>\n`;

        const paragraphs = chap.content.split('\n\n').map(p => `<p>${escapeXml(p)}</p>`).join('\n');
        oebps.file(fileName, `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${escapeXml(chap.title)}</title>
  <style>
    body { font-family: serif; line-height: 1.6; margin: 5%; }
    h1 { color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
    p { margin-bottom: 1rem; text-indent: 1.5em; }
  </style>
</head>
<body>
  <h1>${escapeXml(chap.title)}</h1>
  ${paragraphs}
</body>
</html>`);
      });

      // content.opf
      oebps.file('content.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${escapeXml(bookTitle)}</dc:title>
    <dc:creator>${escapeXml(bookAuthor)}</dc:creator>
    <dc:language>en</dc:language>
    <dc:identifier id="BookID">urn:uuid:${Math.random().toString(36).substring(2)}</dc:identifier>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
${manifestItems}  </manifest>
  <spine toc="ncx">
${spineItems}  </spine>
</package>`);

      // toc.ncx
      let navPoints = '';
      chapters.forEach((chap, i) => {
        navPoints += `    <navPoint id="nav_${i+1}" playOrder="${i+1}">
      <navLabel><text>${escapeXml(chap.title)}</text></navLabel>
      <content src="chap_${i+1}.xhtml"/>
    </navPoint>\n`;
      });

      oebps.file('toc.ncx', `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="fileverse-epub"/>
  </head>
  <docTitle><text>${escapeXml(bookTitle)}</text></docTitle>
  <navMap>
${navPoints}  </navMap>
</ncx>`);

      const content = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${bookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.epub`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Error creating EPUB: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Extract chapters and text from an uploaded EPUB
  const handleExtractEpub = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const zip = await JSZip.loadAsync(file);
      let title = file.name.replace(/\.epub$/i, '');
      let fullText = '';

      // Find all html/xhtml files
      const htmlFiles = Object.keys(zip.files).filter(name => name.endsWith('.xhtml') || name.endsWith('.html') || name.endsWith('.htm'));
      
      for (const fileName of htmlFiles) {
        const text = await zip.file(fileName).async('text');
        const doc = new DOMParser().parseFromString(text, 'text/html');
        fullText += `\n\n=== ${fileName} ===\n\n` + (doc.body?.innerText || doc.body?.textContent || '');
      }

      setExtractedData({
        title,
        fileCount: htmlFiles.length,
        text: fullText.trim()
      });
    } catch (err) {
      alert('Failed to read EPUB file: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  function escapeXml(unsafe) {
    return (unsafe || '').replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  return (
    <div className="tool-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Dashboard</Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#1e293b' }}>
          E-Book Studio & EPUB Converter
        </h1>
        <p style={{ color: '#64748b' }}>
          Build compliant EPUB 3 books from text/markdown or extract and read existing EPUBs in your browser.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('create')}
          style={{ background: 'none', border: 'none', padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'create' ? '2px solid #0284c7' : 'none', color: activeTab === 'create' ? '#0284c7' : '#64748b' }}
        >
          Create / Build EPUB
        </button>
        <button
          onClick={() => setActiveTab('extract')}
          style={{ background: 'none', border: 'none', padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', borderBottom: activeTab === 'extract' ? '2px solid #0284c7' : 'none', color: activeTab === 'extract' ? '#0284c7' : '#64748b' }}
        >
          Extract & Read EPUB
        </button>
      </div>

      {activeTab === 'create' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Metadata & Actions */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>E-Book Metadata</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Book Title</label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Author</label>
              <input
                type="text"
                value={bookAuthor}
                onChange={(e) => setBookAuthor(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
            </div>

            <button
              onClick={handleGenerateEpub}
              disabled={isProcessing}
              style={{ width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '0.85rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Download size={18} /> {isProcessing ? 'Generating...' : 'Build & Download .EPUB'}
            </button>
          </div>

          {/* Chapters Editor */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Chapters ({chapters.length})</h3>
              <button
                onClick={() => setChapters([...chapters, { title: `Chapter ${chapters.length + 1}`, content: 'Enter chapter content here...' }])}
                style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                + Add Chapter
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
              {chapters.map((chap, i) => (
                <div key={i} style={{ border: '1px solid #f1f5f9', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                  <input
                    type="text"
                    value={chap.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setChapters(prev => prev.map((c, idx) => idx === i ? { ...c, title: val } : c));
                    }}
                    style={{ width: '100%', padding: '0.4rem', fontWeight: 700, border: '1px solid #cbd5e1', borderRadius: '4px', marginBottom: '0.5rem' }}
                  />
                  <textarea
                    value={chap.content}
                    onChange={(e) => {
                      const val = e.target.value;
                      setChapters(prev => prev.map((c, idx) => idx === i ? { ...c, content: val } : c));
                    }}
                    rows={4}
                    style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>Upload an EPUB File</h3>
          <input
            type="file"
            accept=".epub"
            onChange={handleExtractEpub}
            style={{ width: '100%', padding: '0.75rem', border: '1px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc', marginBottom: '1.5rem' }}
          />

          {extractedData && (
            <div>
              <h4 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                Extracted: {extractedData.title} ({extractedData.fileCount} chapters)
              </h4>
              <textarea
                value={extractedData.text}
                readOnly
                style={{ width: '100%', height: '350px', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', fontSize: '0.85rem' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
