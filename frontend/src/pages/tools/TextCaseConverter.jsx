import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function TextCaseConverter() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedCase, setSelectedCase] = useState('lowercase');

  // Hydrate staged file
  useEffect(() => {
    const stagedFile = sharedFile || location.state?.autoLoadedFile;
    if (stagedFile) {
      if (typeof stagedFile.text === 'function') {
        stagedFile.text().then((content) => {
          setInputText(content);
          setOutputText(processText(content, selectedCase));
          clearFile();
        }).catch((err) => {
          console.error(err);
          clearFile();
        });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result || '';
          setInputText(content);
          setOutputText(processText(content, selectedCase));
          clearFile();
        };
        reader.readAsText(stagedFile);
      }
    }
  }, [sharedFile, location.state, clearFile]);

  const processText = (text, caseType) => {
    switch (caseType) {
      case 'lowercase':
        return text.toLowerCase();
      case 'uppercase':
        return text.toUpperCase();
      case 'titlecase':
        return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      case 'sentencecase':
        return text.replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => c.toUpperCase());
      case 'camelcase':
        return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
          return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
      case 'snakecase':
        return text.replace(/\W+/g, " ")
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toLowerCase())
          .join('_');
      case 'kebabcase':
        return text.replace(/\W+/g, " ")
          .split(/ |\B(?=[A-Z])/)
          .map(word => word.toLowerCase())
          .join('-');
      case 'pascalcase':
        return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
          return word.toUpperCase();
        }).replace(/\s+/g, '');
      default:
        return text;
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setInputText(newText);
    setOutputText(processText(newText, selectedCase));
  };

  const handleCaseChange = (caseType) => {
    setSelectedCase(caseType);
    setOutputText(processText(inputText, caseType));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    alert('Copied to clipboard!');
  };

  const clearText = () => {
    setInputText('');
    setOutputText('');
  };

  const caseOptions = [
    { id: 'lowercase', label: 'lower case' },
    { id: 'uppercase', label: 'UPPER CASE' },
    { id: 'titlecase', label: 'Title Case' },
    { id: 'sentencecase', label: 'Sentence case' },
    { id: 'camelcase', label: 'camelCase' },
    { id: 'pascalcase', label: 'PascalCase' },
    { id: 'snakecase', label: 'snake_case' },
    { id: 'kebabcase', label: 'kebab-case' },
  ];

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Text Case Converter</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Instantly convert text to any case format. Useful for programming and editing.
      </p>

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {caseOptions.map(option => (
            <button
              key={option.id}
              className="btn"
              style={{
                backgroundColor: selectedCase === option.id ? 'var(--primary)' : '#eee',
                color: selectedCase === option.id ? 'white' : '#333',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem'
              }}
              onClick={() => handleCaseChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
          <label style={{ fontWeight: 'bold' }}>Input Text:</label>
          <button className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#dc3545' }} onClick={clearText}>
            Clear
          </button>
        </div>
        <textarea 
          value={inputText}
          onChange={handleTextChange}
          placeholder="Enter your text here..."
          style={{ width: '100%', height: '150px', padding: '1rem', fontFamily: 'inherit', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
        />
      </div>
      
      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
          <label style={{ fontWeight: 'bold' }}>Converted Text ({caseOptions.find(o => o.id === selectedCase)?.label}):</label>
          <button className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }} onClick={copyToClipboard} disabled={!outputText}>
            Copy Result
          </button>
        </div>
        <textarea 
          readOnly
          value={outputText}
          style={{ width: '100%', height: '150px', padding: '1rem', fontFamily: 'inherit', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', resize: 'vertical' }}
        />
      </div>
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
