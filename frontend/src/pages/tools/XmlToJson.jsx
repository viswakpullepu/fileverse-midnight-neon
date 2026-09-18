import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as xmlJs from 'xml-js';
import { useFileContext } from '../../context/FileContext';

export default function XmlToJson() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [xml, setXml] = useState('<?xml version="1.0" encoding="utf-8"?>\n<note>\n  <to>Tove</to>\n  <from>Jani</from>\n  <heading>Reminder</heading>\n  <body>Don\'t forget me this weekend!</body>\n</note>');
  const [json, setJson] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Hydrate staged file
  useEffect(() => {
    const stagedFile = sharedFile || location.state?.autoLoadedFile;
    if (stagedFile) {
      if (typeof stagedFile.text === 'function') {
        stagedFile.text().then((content) => {
          setXml(content);
          clearFile();
        }).catch((err) => {
          console.error(err);
          clearFile();
        });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setXml(e.target?.result || '');
          clearFile();
        };
        reader.readAsText(stagedFile);
      }
    }
  }, [sharedFile, location.state, clearFile]);

  useEffect(() => {
    try {
      if (!xml.trim()) {
        setJson('');
        setErrorMsg('');
        return;
      }
      const result = xmlJs.xml2json(xml, { compact: true, spaces: 2 });
      setJson(result);
      setErrorMsg('');
    } catch (e) {
      setErrorMsg(`Error parsing XML: ${e.message}`);
    }
  }, [xml]);

  const copyJson = () => {
    navigator.clipboard.writeText(json);
    alert('JSON copied to clipboard!');
  };

  return (
    <div className="tool-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1>XML to JSON Converter</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Paste your XML data on the left to instantly convert it to a formatted JSON object.
      </p>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>XML Input:</label>
            <button className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#dc3545' }} onClick={() => setXml('')}>
              Clear
            </button>
          </div>
          <textarea 
            value={xml}
            onChange={(e) => setXml(e.target.value)}
            style={{ width: '100%', height: '500px', padding: '1rem', fontFamily: 'monospace', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
          />
        </div>

        <div style={{ flex: '1 1 400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>JSON Output:</label>
            <button className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={copyJson} disabled={!json}>
              Copy JSON
            </button>
          </div>
          <textarea 
            readOnly
            value={json}
            style={{ width: '100%', height: '500px', padding: '1rem', fontFamily: 'monospace', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', resize: 'vertical' }}
          />
        </div>
      </div>
      
      {errorMsg && <div style={{ color: 'red', marginTop: '1rem', fontWeight: 'bold' }}>{errorMsg}</div>}
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
