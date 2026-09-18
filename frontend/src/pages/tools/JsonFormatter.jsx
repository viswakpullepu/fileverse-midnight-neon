import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function JsonFormatter() {
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

  const processJson = () => {
    setErrorMsg('');
    try {
      if (!inputText.trim()) {
        setOutputText('');
        return;
      }
      
      const parsed = JSON.parse(inputText);
      
      if (mode === 'format') {
        setOutputText(JSON.stringify(parsed, null, 2));
      } else {
        setOutputText(JSON.stringify(parsed));
      }
    } catch (err) {
      setErrorMsg(`Invalid JSON: ${err.message}`);
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
    setErrorMsg('');
  };

  return (
    <div className="tool-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1>JSON Formatter & Minifier</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Validate, format, and minify JSON strings securely in your browser.
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
            <label style={{ fontWeight: 'bold' }}>Input JSON:</label>
            <button className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#dc3545' }} onClick={clearText}>
              Clear
            </button>
          </div>
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='{"key": "value"}'
            style={{ width: '100%', height: '300px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
          />
        </div>

        <button 
          className="btn" 
          onClick={processJson}
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
          disabled={!inputText}
        >
          {mode === 'format' ? 'Format JSON' : 'Minify JSON'}
        </button>
        
        {errorMsg && <div style={{ color: 'red', marginTop: '0.5rem', fontWeight: 'bold' }}>{errorMsg}</div>}

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>Output JSON:</label>
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
