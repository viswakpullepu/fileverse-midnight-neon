import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function RegexTester() {
  const [regexStr, setRegexStr] = useState('[A-Z]\\w+');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('Hello World, this is a Regex Test. John Doe.');
  const [matches, setMatches] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    try {
      if (!regexStr) {
        setMatches([]);
        setErrorMsg('');
        return;
      }
      
      const regex = new RegExp(regexStr, flags);
      const newMatches = [];
      
      if (flags.includes('g')) {
        let match;
        while ((match = regex.exec(testString)) !== null) {
          newMatches.push({
            value: match[0],
            index: match.index
          });
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          newMatches.push({
            value: match[0],
            index: match.index
          });
        }
      }
      
      setMatches(newMatches);
      setErrorMsg('');
    } catch (e) {
      setErrorMsg(`Invalid Regular Expression: ${e.message}`);
      setMatches([]);
    }
  }, [regexStr, flags, testString]);

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Regex Tester</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Test and debug your Regular Expressions instantly in the browser.
      </p>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#888' }}>/</span>
        <input 
          type="text" 
          value={regexStr}
          onChange={(e) => setRegexStr(e.target.value)}
          placeholder="[A-Z]\w+"
          style={{ flex: 1, padding: '1rem', fontSize: '1.2rem', fontFamily: 'monospace', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#888' }}>/</span>
        <input 
          type="text" 
          value={flags}
          onChange={(e) => setFlags(e.target.value)}
          placeholder="g, i, m..."
          style={{ width: '100px', padding: '1rem', fontSize: '1.2rem', fontFamily: 'monospace', borderRadius: '8px', border: '1px solid #ccc' }}
        />
      </div>
      
      {errorMsg && <div style={{ color: 'red', marginTop: '1rem', fontWeight: 'bold' }}>{errorMsg}</div>}

      <div style={{ marginTop: '2rem' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Test String:</label>
        <textarea 
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          style={{ width: '100%', height: '200px', padding: '1rem', fontFamily: 'monospace', fontSize: '1.1rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
        />
      </div>

      <div style={{ marginTop: '2rem', padding: '2rem', backgroundColor: '#f9f9f9', border: '1px solid #eaeaea', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Results ({matches.length} matches)</h2>
        {matches.length === 0 ? (
          <p style={{ color: '#888' }}>No matches found.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {matches.map((m, i) => (
              <li key={i} style={{ padding: '0.8rem', borderBottom: '1px solid #ddd', fontFamily: 'monospace', fontSize: '1.1rem', backgroundColor: '#fff', marginBottom: '0.5rem', borderRadius: '4px' }}>
                <strong style={{ color: 'var(--primary)' }}>Match {i + 1}:</strong> "{m.value}" <span style={{ color: '#888', fontSize: '0.9rem', marginLeft: '1rem' }}>(Index: {m.index})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
