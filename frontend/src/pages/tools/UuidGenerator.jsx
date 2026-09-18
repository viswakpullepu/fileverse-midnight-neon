import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function UuidGenerator() {
  const [uuids, setUuids] = useState([]);
  const [count, setCount] = useState(5);

  const generateUUIDv4 = () => {
    // Standard crypto.randomUUID for modern browsers, fallback if needed
    if (crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleGenerate = () => {
    const newUuids = [];
    for (let i = 0; i < count; i++) {
      newUuids.push(generateUUIDv4());
    }
    setUuids(newUuids);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    alert('Copied to clipboard!');
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>UUID v4 Generator</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Generate cryptographically secure version 4 universally unique identifiers (UUIDs) locally.
      </p>

      <div style={{ marginTop: '2rem', padding: '2rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fafafa' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold' }}>Number of UUIDs to generate:</label>
          <input 
            type="number" 
            min="1" 
            max="1000" 
            value={count} 
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            style={{ padding: '0.5rem', width: '100px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <button 
          className="btn" 
          onClick={handleGenerate}
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
        >
          Generate UUIDs
        </button>
      </div>
      
      {uuids.length > 0 && (
        <div style={{ marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>Generated UUIDs ({uuids.length}):</label>
            <button className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }} onClick={copyToClipboard}>
              Copy All
            </button>
          </div>
          <textarea 
            readOnly
            value={uuids.join('\n')}
            style={{ width: '100%', height: '300px', padding: '1rem', fontFamily: 'monospace', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', resize: 'vertical', lineHeight: '1.5' }}
          />
        </div>
      )}
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
