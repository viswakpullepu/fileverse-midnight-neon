import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function WordCharacterCounter() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [inputText, setInputText] = useState('');

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

  const getStats = () => {
    const text = inputText;
    const charCount = text.length;
    const charCountNoSpaces = text.replace(/\s/g, '').length;
    
    // Split by whitespace to get words
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    const wordCount = words.length;

    // Sentences (split by period, exclamation, question mark)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;

    // Paragraphs (split by double newline)
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const paragraphCount = paragraphs.length;

    // Reading time (average 238 words per minute)
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 238));

    return { charCount, charCountNoSpaces, wordCount, sentenceCount, paragraphCount, readingTimeMinutes };
  };

  const stats = getStats();

  const clearText = () => {
    setInputText('');
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Word & Character Counter</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Count words, characters, sentences, and estimate reading time instantly.
      </p>

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        
        <div style={{ backgroundColor: '#f0f4f8', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.wordCount}</div>
          <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.5rem', fontWeight: '600' }}>WORDS</div>
        </div>

        <div style={{ backgroundColor: '#f0f4f8', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.charCount}</div>
          <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.5rem', fontWeight: '600' }}>CHARACTERS</div>
        </div>

        <div style={{ backgroundColor: '#f0f4f8', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.charCountNoSpaces}</div>
          <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.5rem', fontWeight: '600' }}>CHARS (NO SPACES)</div>
        </div>

        <div style={{ backgroundColor: '#f0f4f8', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.sentenceCount}</div>
          <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.5rem', fontWeight: '600' }}>SENTENCES</div>
        </div>
        
        <div style={{ backgroundColor: '#f0f4f8', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.paragraphCount}</div>
          <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.5rem', fontWeight: '600' }}>PARAGRAPHS</div>
        </div>

        <div style={{ backgroundColor: '#f0f4f8', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>~{stats.readingTimeMinutes}m</div>
          <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.5rem', fontWeight: '600' }}>READING TIME</div>
        </div>

      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
        <label style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Input Text</label>
        <button className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', backgroundColor: '#dc3545' }} onClick={clearText} disabled={!inputText}>
          Clear Text
        </button>
      </div>

      <textarea 
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Start typing or paste your document here..."
        style={{ 
          width: '100%', 
          height: '350px', 
          padding: '1.5rem', 
          fontSize: '1.1rem', 
          borderRadius: '12px', 
          border: '2px solid #e2e8f0', 
          resize: 'vertical',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
          lineHeight: '1.6'
        }}
      />
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
