import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function HashGenerator() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [hashResult, setHashResult] = useState({
    md5: '',
    sha1: '',
    sha256: '',
    sha512: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState('text'); // 'text' or 'file'

  // Hydrate staged file
  useEffect(() => {
    const stagedFile = sharedFile || location.state?.autoLoadedFile;
    if (stagedFile) {
      setFile(stagedFile);
      setMode('file');
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        await generateHash(event.target.result);
        setIsProcessing(false);
        clearFile();
      };
      reader.readAsArrayBuffer(stagedFile);
    }
  }, [sharedFile, location.state, clearFile]);

  // Using Web Crypto API for secure hashing
  const generateHash = async (buffer) => {
    try {
      const sha1Buffer = await crypto.subtle.digest('SHA-1', buffer);
      const sha256Buffer = await crypto.subtle.digest('SHA-256', buffer);
      const sha512Buffer = await crypto.subtle.digest('SHA-512', buffer);
      
      // Convert buffers to hex strings
      const toHex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Note: Web Crypto doesn't support MD5 natively because it's insecure.
      // We will provide a simple mock or leave it blank since SHA-256+ is standard now.
      
      setHashResult({
        md5: 'Not supported natively by Web Crypto API (Insecure)',
        sha1: toHex(sha1Buffer),
        sha256: toHex(sha256Buffer),
        sha512: toHex(sha512Buffer)
      });
    } catch (e) {
      console.error(e);
      alert('Error generating hash');
    }
  };

  const handleTextChange = async (e) => {
    const text = e.target.value;
    setInputText(text);
    if (!text) {
      setHashResult({ md5: '', sha1: '', sha256: '', sha512: '' });
      return;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    await generateHash(data);
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsProcessing(true);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        await generateHash(event.target.result);
        setIsProcessing(false);
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // simulate event for handleFileChange
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Hash Generator</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Generate cryptographic hashes (SHA-1, SHA-256, SHA-512) for text or files. 100% Client-side.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', marginBottom: '1rem' }}>
        <button 
          className="btn" 
          style={{ flex: 1, backgroundColor: mode === 'text' ? 'var(--primary)' : '#eee', color: mode === 'text' ? 'white' : '#333' }}
          onClick={() => { setMode('text'); setFile(null); setHashResult({md5:'',sha1:'',sha256:'',sha512:''}); }}
        >
          Text Input
        </button>
        <button 
          className="btn" 
          style={{ flex: 1, backgroundColor: mode === 'file' ? 'var(--primary)' : '#eee', color: mode === 'file' ? 'white' : '#333' }}
          onClick={() => { setMode('file'); setInputText(''); setHashResult({md5:'',sha1:'',sha256:'',sha512:''}); }}
        >
          File Input
        </button>
      </div>

      {mode === 'text' ? (
        <textarea 
          value={inputText}
          onChange={handleTextChange}
          placeholder="Type or paste text here to generate hashes instantly..."
          style={{ width: '100%', height: '150px', padding: '1rem', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
        />
      ) : (
        <div 
          className="dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload').click()}
          style={{ padding: '3rem 2rem' }}
        >
          <p style={{ fontSize: '1.2rem' }}>{file ? file.name : 'Select a File'}</p>
          <span style={{ fontSize: '0.9rem', color: '#888', display: 'block', marginTop: '1rem' }}>
            {file ? 'Click to change file' : 'or drop file here'}
          </span>
          <input 
            id="file-upload" 
            type="file" 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
        </div>
      )}

      {isProcessing && <p style={{ marginTop: '1rem', color: 'var(--primary)' }}>Calculating file hash...</p>}

      {(hashResult.sha256 || hashResult.sha1) && (
        <div style={{ marginTop: '2rem', textAlign: 'left' }}>
          <h3>Computed Hashes</h3>
          
          <div style={{ marginTop: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#666', marginBottom: '0.25rem' }}>SHA-256</label>
            <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '1.1rem' }}>{hashResult.sha256}</div>
          </div>
          
          <div style={{ marginTop: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#666', marginBottom: '0.25rem' }}>SHA-512</label>
            <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '1.1rem' }}>{hashResult.sha512}</div>
          </div>

          <div style={{ marginTop: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#666', marginBottom: '0.25rem' }}>SHA-1</label>
            <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '1.1rem' }}>{hashResult.sha1}</div>
          </div>
          
          <div style={{ marginTop: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', opacity: 0.7 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#666', marginBottom: '0.25rem' }}>MD5</label>
            <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '1.1rem', color: '#888' }}>{hashResult.md5}</div>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to fileverze Dashboard</Link>
      </div>
    </div>
  );
}
