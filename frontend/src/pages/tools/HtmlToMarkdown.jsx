import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import TurndownService from 'turndown';
import { useFileContext } from '../../context/FileContext';

export default function HtmlToMarkdown() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [html, setHtml] = useState('<h1>Hello World</h1>\n<p>Write your <strong>HTML</strong> here!</p>');
  const [markdown, setMarkdown] = useState('');

  // Hydrate staged file
  useEffect(() => {
    const stagedFile = sharedFile || location.state?.autoLoadedFile;
    if (stagedFile) {
      if (typeof stagedFile.text === 'function') {
        stagedFile.text().then((content) => {
          setHtml(content);
          clearFile();
        }).catch((err) => {
          console.error('Failed reading staged file:', err);
        });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setHtml(e.target?.result || '');
          clearFile();
        };
        reader.readAsText(stagedFile);
      }
    }
  }, [sharedFile, location.state, clearFile]);

  useEffect(() => {
    try {
      const turndownService = new TurndownService();
      setMarkdown(turndownService.turndown(html));
    } catch (e) {
      setMarkdown('Error converting HTML');
    }
  }, [html]);

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    alert('Markdown copied to clipboard!');
  };

  return (
    <div className="tool-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1>HTML to Markdown Converter</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Write HTML on the left and see the Markdown output instantly on the right.
      </p>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>HTML Input:</label>
            <button className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#dc3545' }} onClick={() => setHtml('')}>
              Clear
            </button>
          </div>
          <textarea 
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            style={{ width: '100%', height: '500px', padding: '1rem', fontFamily: 'monospace', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
          />
        </div>

        <div style={{ flex: '1 1 400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>Markdown Output:</label>
            <button className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={copyMarkdown}>
              Copy Markdown
            </button>
          </div>
          <textarea 
            readOnly
            value={markdown}
            style={{ width: '100%', height: '500px', padding: '1rem', fontFamily: 'monospace', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', resize: 'vertical' }}
          />
        </div>
      </div>
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
