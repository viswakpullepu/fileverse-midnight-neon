import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function CssFormatter() {
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

  // A simple browser-side CSS formatter/minifier
  const formatCSS = (css) => {
    let formatted = '';
    let indentLevel = 0;
    const tab = '  ';

    // Remove comments and extra whitespace
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    css = css.replace(/\s+/g, ' ');

    // Naive formatting logic
    for (let i = 0; i < css.length; i++) {
      const char = css[i];
      if (char === '{') {
        formatted += ' {\n';
        indentLevel++;
        formatted += tab.repeat(indentLevel);
      } else if (char === '}') {
        indentLevel--;
        formatted += '\n' + tab.repeat(indentLevel) + '}\n\n' + tab.repeat(indentLevel);
      } else if (char === ';') {
        formatted += ';\n' + tab.repeat(indentLevel);
      } else if (char === ',') {
        // Only format comma if not inside a value like rgba()
        if (i < css.length - 1 && css[i+1] === ' ') {
          formatted += ',';
        } else {
          formatted += ', ';
        }
      } else {
        formatted += char;
      }
    }

    // Clean up empty lines and extra spaces
    return formatted.replace(/^\s*[\r\n]/gm, '').trim();
  };

  const minifyCSS = (css) => {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\n|\r/g, '') // Remove newlines
      .replace(/\s*([\{\}\:\;\,])\s*/g, '$1') // Remove spaces around delimiters
      .replace(/\s+/g, ' ') // Collapse multiple spaces
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
        setOutputText(formatCSS(inputText));
      } else {
        setOutputText(minifyCSS(inputText));
      }
    } catch (err) {
      setErrorMsg(`Failed to ${mode} CSS. Make sure the input is relatively valid.`);
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
      <h1>CSS Formatter & Minifier</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Beautify your stylesheets or minify them to reduce file sizes instantly in the browser.
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
            <label style={{ fontWeight: 'bold' }}>Input CSS:</label>
            <button className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#dc3545' }} onClick={clearText}>
              Clear
            </button>
          </div>
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="body { margin: 0; padding: 0; }"
            style={{ width: '100%', height: '300px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
          />
        </div>

        <button 
          className="btn" 
          onClick={processText}
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
          disabled={!inputText}
        >
          {mode === 'format' ? 'Format CSS' : 'Minify CSS'}
        </button>
        
        {errorMsg && <div style={{ color: 'red', marginTop: '0.5rem' }}>{errorMsg}</div>}

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>Output CSS:</label>
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
