import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { useFileContext } from '../../context/FileContext';

export default function BcryptGenerator() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [saltRounds, setSaltRounds] = useState(10);
  const [hash, setHash] = useState('');
  const [isHashing, setIsHashing] = useState(false);

  // Hydrate staged file
  useEffect(() => {
    const stagedFile = sharedFile || location.state?.autoLoadedFile;
    if (stagedFile) {
      if (typeof stagedFile.text === 'function') {
        stagedFile.text().then((content) => {
          setPassword(content.trim());
          clearFile();
        }).catch((err) => {
          console.error(err);
          clearFile();
        });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPassword((e.target?.result || '').trim());
          clearFile();
        };
        reader.readAsText(stagedFile);
      }
    }
  }, [sharedFile, location.state, clearFile]);

  // Checker State
  const [checkPassword, setCheckPassword] = useState('');
  const [checkHash, setCheckHash] = useState('');
  const [checkResult, setCheckResult] = useState(null);

  const generateHash = () => {
    if (!password) return;
    setIsHashing(true);
    // Use setTimeout to allow UI to update to 'Hashing...' before thread blocks
    setTimeout(() => {
      try {
        const salt = bcrypt.genSaltSync(saltRounds);
        const generatedHash = bcrypt.hashSync(password, salt);
        setHash(generatedHash);
      } catch (err) {
        setHash(`Error: ${err.message}`);
      }
      setIsHashing(false);
    }, 50);
  };

  const verifyHash = () => {
    if (!checkPassword || !checkHash) return;
    try {
      const match = bcrypt.compareSync(checkPassword, checkHash);
      setCheckResult(match);
    } catch (err) {
      setCheckResult(false);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1>Bcrypt Generator & Checker</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Generate and verify Bcrypt password hashes securely. Your password never leaves the browser.
      </p>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        {/* Generator Section */}
        <div style={{ flex: '1 1 400px', padding: '2rem', backgroundColor: '#f9f9f9', border: '1px solid #eaeaea', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Generate Hash</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>String to hash:</label>
            <input 
              type="text" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="my_super_secret_password"
              style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Salt Rounds: {saltRounds}</label>
            <input 
              type="range" 
              min="4" 
              max="15" 
              value={saltRounds}
              onChange={(e) => setSaltRounds(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
            <small style={{ color: '#888' }}>Higher is more secure but much slower to compute.</small>
          </div>
          <button 
            className="btn" 
            onClick={generateHash}
            disabled={!password || isHashing}
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
          >
            {isHashing ? 'Hashing...' : 'Bcrypt Hash'}
          </button>

          {hash && (
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Resulting Hash:</label>
              <textarea 
                readOnly
                value={hash}
                style={{ width: '100%', padding: '1rem', fontFamily: 'monospace', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', resize: 'none', height: '80px' }}
              />
            </div>
          )}
        </div>

        {/* Checker Section */}
        <div style={{ flex: '1 1 400px', padding: '2rem', backgroundColor: '#f9f9f9', border: '1px solid #eaeaea', borderRadius: '8px' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Verify Hash</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>String to check:</label>
            <input 
              type="text" 
              value={checkPassword}
              onChange={(e) => setCheckPassword(e.target.value)}
              placeholder="my_super_secret_password"
              style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Hash to test against:</label>
            <input 
              type="text" 
              value={checkHash}
              onChange={(e) => setCheckHash(e.target.value)}
              placeholder="$2a$10$..."
              style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'monospace' }}
            />
          </div>
          <button 
            className="btn" 
            onClick={verifyHash}
            disabled={!checkPassword || !checkHash}
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', backgroundColor: '#315ea5' }}
          >
            Check Match
          </button>

          {checkResult !== null && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '4px', textAlign: 'center', backgroundColor: checkResult ? '#d4edda' : '#f8d7da', color: checkResult ? '#155724' : '#721c24', border: `1px solid ${checkResult ? '#c3e6cb' : '#f5c6cb'}` }}>
              <h3 style={{ margin: 0 }}>
                {checkResult ? '✅ Match!' : '❌ Does Not Match'}
              </h3>
            </div>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
