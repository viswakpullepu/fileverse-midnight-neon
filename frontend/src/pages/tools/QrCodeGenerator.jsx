import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';

export default function QrCodeGenerator() {
  const [inputText, setInputText] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const generateQR = async () => {
    setErrorMsg('');
    try {
      if (!inputText.trim()) {
        setQrCodeUrl('');
        return;
      }
      
      const url = await QRCode.toDataURL(inputText, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(url);
    } catch (err) {
      setErrorMsg('Failed to generate QR code.');
      setQrCodeUrl('');
    }
  };

  const clearText = () => {
    setInputText('');
    setQrCodeUrl('');
    setErrorMsg('');
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>QR Code Generator</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Instantly turn links, text, or contact information into scannable QR codes.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>Input Data (URL or Text):</label>
            <button className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#dc3545' }} onClick={clearText}>
              Clear
            </button>
          </div>
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="https://example.com"
            style={{ width: '100%', height: '150px', padding: '1rem', fontFamily: 'inherit', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
          />
        </div>

        <button 
          className="btn" 
          onClick={generateQR}
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
          disabled={!inputText}
        >
          Generate QR Code
        </button>
        
        {errorMsg && <div style={{ color: 'red', marginTop: '0.5rem', fontWeight: 'bold' }}>{errorMsg}</div>}

        {qrCodeUrl && (
          <div style={{ marginTop: '2rem', textAlign: 'center', padding: '2rem', border: '1px solid #eaeaea', borderRadius: '12px', backgroundColor: '#fafafa' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Your QR Code</h2>
            <img 
              src={qrCodeUrl} 
              alt="Generated QR Code" 
              style={{ width: '250px', height: '250px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white', padding: '0.5rem' }} 
            />
            <div style={{ marginTop: '2rem' }}>
              <a 
                href={qrCodeUrl} 
                download="qrcode.png" 
                className="btn"
                style={{ display: 'inline-block', padding: '0.8rem 2rem', fontSize: '1.1rem' }}
              >
                Download PNG
              </a>
            </div>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
