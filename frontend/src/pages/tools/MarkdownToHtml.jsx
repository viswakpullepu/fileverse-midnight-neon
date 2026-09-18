import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { marked } from 'marked';
import { useFileContext } from '../../context/FileContext';

export default function MarkdownToHtml() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [markdown, setMarkdown] = useState('# Hello World\n\nWrite your **markdown** here!');
  const [html, setHtml] = useState('');

  // 1. Hydrate staged file from Universal Dropzone
  useEffect(() => {
    const stagedFile = sharedFile || location.state?.autoLoadedFile;
    if (stagedFile) {
      if (typeof stagedFile.text === 'function') {
        stagedFile.text().then((content) => {
          setMarkdown(content);
          clearFile();
        }).catch((err) => {
          console.error('Failed reading staged file:', err);
        });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setMarkdown(e.target?.result || '');
          clearFile();
        };
        reader.readAsText(stagedFile);
      }
    }
  }, [sharedFile, location.state, clearFile]);

  // Robust zero-dependency client-side sanitizer to prevent XSS
  const sanitizeHtml = (dirtyHtml) => {
    if (!dirtyHtml) return '';
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(dirtyHtml, 'text/html');

      // 1. Strip executable elements & embedded containers
      const blockedTags = ['script', 'iframe', 'object', 'embed', 'form', 'base', 'meta', 'link', 'style', 'template', 'applet'];
      blockedTags.forEach((tag) => {
        doc.querySelectorAll(tag).forEach((el) => el.remove());
      });

      // 2. Strip event handlers (onload, onerror, onclick...) and dangerous schemes (javascript:, etc.)
      const allNodes = doc.querySelectorAll('*');
      allNodes.forEach((el) => {
        const attrs = Array.from(el.attributes);
        for (const attr of attrs) {
          const name = attr.name.toLowerCase();
          const val = attr.value.trim().toLowerCase();

          if (name.startsWith('on')) {
            el.removeAttribute(attr.name);
          }
          if (['href', 'src', 'data', 'action', 'formaction', 'xlink:href'].includes(name)) {
            if (
              val.startsWith('javascript:') ||
              val.startsWith('vbscript:') ||
              val.startsWith('data:text/html') ||
              val.startsWith('data:application/xhtml')
            ) {
              el.removeAttribute(attr.name);
            }
          }
        }
      });

      return doc.body.innerHTML;
    } catch (err) {
      console.error('Sanitization error:', err);
      return '';
    }
  };

  useEffect(() => {
    try {
      const rawHtml = marked.parse(markdown);
      setHtml(sanitizeHtml(rawHtml));
    } catch (e) {
      setHtml('<p style="color:red;">Error parsing markdown</p>');
    }
  }, [markdown]);

  const copyHtml = () => {
    navigator.clipboard.writeText(html);
    alert('HTML copied to clipboard!');
  };

  return (
    <div className="tool-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1>Markdown to HTML Converter</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Write Markdown on the left and see the HTML output instantly on the right.
      </p>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>Markdown Input:</label>
            <button className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#dc3545' }} onClick={() => setMarkdown('')}>
              Clear
            </button>
          </div>
          <textarea 
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            style={{ width: '100%', height: '500px', padding: '1rem', fontFamily: 'monospace', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
          />
        </div>

        <div style={{ flex: '1 1 400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>HTML Output:</label>
            <button className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={copyHtml}>
              Copy HTML
            </button>
          </div>
          <textarea 
            readOnly
            value={html}
            style={{ width: '100%', height: '500px', padding: '1rem', fontFamily: 'monospace', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', resize: 'vertical' }}
          />
        </div>
      </div>
      
      <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#fff', border: '1px solid #eaeaea', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '1rem' }}>Live Preview</h2>
        <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: html }} style={{ padding: '1rem', border: '1px dashed #ccc', minHeight: '100px' }} />
      </div>
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
