import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function HtmlFormatter() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('format'); // 'format' or 'minify'
  const [errorMsg, setErrorMsg] = useState('');

  // Hydrate staged file
  useEffect(() => {
    const stagedFile = sharedFile || location.state?.autoLoadedFile;
    if (stagedFile) {
      if (typeof stagedFile.text === 'function') {
        stagedFile.text().then((content) => {
          setInputText(content);
          clearFile();
        }).catch((err) => {
          console.error(err);
          clearFile();
        });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setInputText(e.target?.result || '');
          clearFile();
        };
        reader.readAsText(stagedFile);
      }
    }
  }, [sharedFile, location.state, clearFile]);

  // A simple HTML formatter/minifier that runs purely in the browser without massive AST dependencies
  const formatHTML = (html) => {
    let formatted = '';
    let indent = 0;
    const tab = '  ';
    
    // Remove all newlines and multiple spaces
    const cleanHtml = html.replace(/\r?\n|\r/g, '').replace(/\s+/g, ' ').trim();
    
    // Naive regex based formatting
    const tokens = cleanHtml.match(/<[^>]+>|[^<]+/g) || [];
    
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i].trim();
      if (!token) continue;

      if (token.match(/^<\/[^>]+>$/)) {
        // Closing tag
        indent = Math.max(0, indent - 1);
        formatted += '\n' + tab.repeat(indent) + token;
      } else if (token.match(/^<[^!/?][^>]*[^/]>$/)) {
        // Opening tag
        formatted += (formatted ? '\n' : '') + tab.repeat(indent) + token;
        // Do not indent if it's a void element
        if (!token.match(/^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/i)) {
          indent++;
        }
      } else if (token.match(/^<[^>]+\/>$/) || token.match(/^<!--.*-->$/) || token.match(/^<!.*>$/)) {
        // Self-closing tag or comment or DOCTYPE
        formatted += (formatted ? '\n' : '') + tab.repeat(indent) + token;
      } else {
        // Text node
        formatted += '\n' + tab.repeat(indent) + token;
      }
    }
    
    return formatted.trim();
  };

  const minifyHTML = (html) => {
    return html
      .replace(/<!--[\s\S]*?-->/g, '') // remove comments
      .replace(/\r?\n|\r/g, '') // remove newlines
      .replace(/\s+/g, ' ') // replace multiple spaces with single space
      .replace(/>\s+</g, '><') // remove spaces between tags
      .trim();
  };

  const processText = () => {
    setErrorMsg('');
    try {
      if (!inputText.trim()) {
        setOutputText('');
        return;
      }
      
      if (mode === 'format') {
        setOutputText(formatHTML(inputText));
      } else {
        setOutputText(minifyHTML(inputText));
      }
    } catch (err) {
      setErrorMsg(`Failed to ${mode} HTML. Make sure the input is relatively valid.`);
      setOutputText('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    alert('Copied to clipboard!');
  };

  const clearText = () => {
    setInputText('');
    setOutputText('');
  };

  return (
    <div className="tool-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1>HTML Formatter & Minifier</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Prettify messy HTML code into readable formats, or compress it to save space. 100% locally.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', marginBottom: '1rem' }}>
        <button 
          className="btn" 
          style={{ flex: 1, backgroundColor: mode === 'format' ? 'var(--primary)' : '#eee', color: mode === 'format' ? 'white' : '#333' }}
          onClick={() => { setMode('format'); setOutputText(''); setErrorMsg(''); }}
        >
          Format (Beautify)
        </button>
        <button 
          className="btn" 
          style={{ flex: 1, backgroundColor: mode === 'minify' ? 'var(--primary)' : '#eee', color: mode === 'minify' ? 'white' : '#333' }}
          onClick={() => { setMode('minify'); setOutputText(''); setErrorMsg(''); }}
        >
          Minify (Compress)
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>Input HTML:</label>
            <button className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#dc3545' }} onClick={clearText}>
              Clear
            </button>
          </div>
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your HTML code here..."
            style={{ width: '100%', height: '300px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
          />
        </div>

        <button 
          className="btn" 
          onClick={processText}
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
          disabled={!inputText}
        >
          {mode === 'format' ? 'Format HTML' : 'Minify HTML'}
        </button>
        
        {errorMsg && <div style={{ color: 'red', marginTop: '0.5rem' }}>{errorMsg}</div>}

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>Output HTML:</label>
            <button className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }} onClick={copyToClipboard} disabled={!outputText}>
              Copy Code
            </button>
          </div>
          <textarea 
            readOnly
            value={outputText}
            style={{ width: '100%', height: '300px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', resize: 'vertical', whiteSpace: mode === 'minify' ? 'pre-wrap' : 'pre' }}
          />
        </div>
      </div>
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
