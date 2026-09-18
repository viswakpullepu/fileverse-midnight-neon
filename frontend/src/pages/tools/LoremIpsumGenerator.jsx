import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LoremIpsumGenerator() {
  const [count, setCount] = useState(3);
  const [type, setType] = useState('paragraphs'); // 'paragraphs', 'sentences', 'words'
  const [outputText, setOutputText] = useState('');

  const generateLoremIpsum = () => {
    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    const words = lorem.split(' ');
    let result = '';

    if (type === 'words') {
      let resultWords = [];
      for (let i = 0; i < count; i++) {
        resultWords.push(words[i % words.length].replace(/[.,]/g, ''));
      }
      result = resultWords.join(' ');
      result = result.charAt(0).toUpperCase() + result.slice(1) + '.';
    } else if (type === 'sentences') {
      const sentences = lorem.split('. ');
      let resultSentences = [];
      for (let i = 0; i < count; i++) {
        let sentence = sentences[i % sentences.length];
        if (!sentence.endsWith('.')) sentence += '.';
        resultSentences.push(sentence);
      }
      result = resultSentences.join(' ');
    } else { // paragraphs
      let resultParagraphs = [];
      for (let i = 0; i < count; i++) {
        // Randomize paragraph length slightly by repeating lorem
        let p = lorem;
        if (i % 2 === 0) p += " " + lorem.split('. ').slice(0, 2).join('. ') + ".";
        resultParagraphs.push(p);
      }
      result = resultParagraphs.join('\n\n');
    }

    setOutputText(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    alert('Copied to clipboard!');
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Lorem Ipsum Generator</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Generate placeholder text instantly for your designs, mockups, and prototypes.
      </p>

      <div style={{ marginTop: '2rem', padding: '2rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fafafa' }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Amount:</label>
            <input 
              type="number" 
              min="1" 
              max="100" 
              value={count} 
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Type:</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', backgroundColor: 'white' }}
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>

        </div>

        <button 
          className="btn" 
          onClick={generateLoremIpsum}
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
        >
          Generate Text
        </button>
      </div>
      
      {outputText && (
        <div style={{ marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>Generated Output:</label>
            <button className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }} onClick={copyToClipboard}>
              Copy Text
            </button>
          </div>
          <textarea 
            readOnly
            value={outputText}
            style={{ width: '100%', height: '300px', padding: '1.5rem', fontFamily: 'inherit', fontSize: '1.1rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#fff', resize: 'vertical', lineHeight: '1.6' }}
          />
        </div>
      )}
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
