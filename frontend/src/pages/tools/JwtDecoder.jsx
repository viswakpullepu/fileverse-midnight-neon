import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function JwtDecoder() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [jwt, setJwt] = useState('');
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Hydrate staged file
  useEffect(() => {
    const stagedFile = sharedFile || location.state?.autoLoadedFile;
    if (stagedFile) {
      if (typeof stagedFile.text === 'function') {
        stagedFile.text().then((content) => {
          setJwt(content.trim());
          clearFile();
        }).catch((err) => {
          console.error(err);
          clearFile();
        });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setJwt((e.target?.result || '').trim());
          clearFile();
        };
        reader.readAsText(stagedFile);
      }
    }
  }, [sharedFile, location.state, clearFile]);

  const decodeJWT = (token) => {
    setErrorMsg('');
    setHeader('');
    setPayload('');

    if (!token.trim()) return;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('JWT must have exactly 3 parts separated by dots.');
      }

      // Base64Url decode function
      const decodeBase64Url = (str) => {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        // Pad to multiple of 4
        while (str.length % 4) {
          str += '=';
        }
        return decodeURIComponent(atob(str).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
      };

      const decodedHeader = JSON.parse(decodeBase64Url(parts[0]));
      const decodedPayload = JSON.parse(decodeBase64Url(parts[1]));

      setHeader(JSON.stringify(decodedHeader, null, 2));
      setPayload(JSON.stringify(decodedPayload, null, 2));
    } catch (err) {
      setErrorMsg(`Invalid JWT: ${err.message}`);
    }
  };

  useEffect(() => {
    decodeJWT(jwt);
  }, [jwt]);

  const clearText = () => {
    setJwt('');
  };

  return (
    <div className="tool-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1>JWT Decoder</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Decode JSON Web Tokens instantly to view their header and payload details without sending your token to any server.
      </p>

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label style={{ fontWeight: 'bold' }}>Encoded JWT:</label>
          <button className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#dc3545' }} onClick={clearText}>
            Clear
          </button>
        </div>
        <textarea 
          value={jwt}
          onChange={(e) => setJwt(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
          style={{ width: '100%', height: '150px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.95rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
        />
        {errorMsg && <div style={{ color: 'red', marginTop: '0.5rem', fontWeight: 'bold' }}>{errorMsg}</div>}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ flex: '1 1 300px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#e5322d' }}>Header (Algorithm & Type):</label>
          <textarea 
            readOnly
            value={header}
            style={{ width: '100%', height: '150px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', resize: 'vertical' }}
          />
        </div>

        <div style={{ flex: '1 1 400px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#6e4dc4' }}>Payload (Data):</label>
          <textarea 
            readOnly
            value={payload}
            style={{ width: '100%', height: '350px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', resize: 'vertical' }}
          />
        </div>
      </div>
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
