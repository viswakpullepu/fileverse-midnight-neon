import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function CsvToJson() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [jsonResult, setJsonResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState('text'); // 'text' or 'file'
  const [errorMsg, setErrorMsg] = useState('');
  const [processedFileUrl, setProcessedFileUrl] = useState(null);

  // Hydrate staged file
  useEffect(() => {
    const stagedFile = sharedFile || location.state?.autoLoadedFile;
    if (stagedFile) {
      setFile(stagedFile);
      setMode('file');
      if (typeof stagedFile.text === 'function') {
        stagedFile.text().then((content) => {
          setInputText(content);
          clearFile();
        }).catch((err) => {
          console.error(err);
          clearFile();
        });
      } else {
        clearFile();
      }
    }
  }, [sharedFile, location.state, clearFile]);

  const convertCsvToJson = (csvString) => {
    try {
      const lines = csvString.trim().split('\n');
      if (lines.length < 2) {
        throw new Error("CSV must contain at least a header row and one data row.");
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const result = [];

      for (let i = 1; i < lines.length; i++) {
        // Handle commas inside quotes
        const currentLine = lines[i];
        if (!currentLine.trim()) continue;
        
        let inQuotes = false;
        let value = '';
        const rowValues = [];
        
        for (let char of currentLine) {
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            rowValues.push(value);
            value = '';
          } else {
            value += char;
          }
        }
        rowValues.push(value); // push the last value

        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let val = rowValues[j] ? rowValues[j].trim() : '';
          // Remove wrapping quotes if they exist
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
          }
          // Try to parse numbers
          if (!isNaN(val) && val !== '') {
            val = Number(val);
          } else if (val.toLowerCase() === 'true') {
            val = true;
          } else if (val.toLowerCase() === 'false') {
            val = false;
          }
          
          obj[headers[j]] = val;
        }
        result.push(obj);
      }
      return JSON.stringify(result, null, 2);
    } catch (err) {
      throw new Error("Invalid CSV format. " + err.message);
    }
  };

  const handleConvertText = () => {
    if (!inputText) return;
    setErrorMsg('');
    try {
      const json = convertCsvToJson(inputText);
      setJsonResult(json);
    } catch (err) {
      setErrorMsg(err.message);
      setJsonResult('');
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setErrorMsg('');
      setProcessedFileUrl(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const processFile = () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg('');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = convertCsvToJson(event.target.result);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        setProcessedFileUrl(url);
      } catch (err) {
        setErrorMsg("Failed to parse the CSV file. Ensure it is formatted correctly.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setErrorMsg("Failed to read the file.");
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>CSV to JSON</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Convert comma-separated values (CSV) files into structured JSON arrays instantly. 100% locally.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', marginBottom: '1rem' }}>
        <button 
          className="btn" 
          style={{ flex: 1, backgroundColor: mode === 'text' ? 'var(--primary)' : '#eee', color: mode === 'text' ? 'white' : '#333' }}
          onClick={() => { setMode('text'); setFile(null); setJsonResult(''); setErrorMsg(''); setProcessedFileUrl(null); }}
        >
          Text Input
        </button>
        <button 
          className="btn" 
          style={{ flex: 1, backgroundColor: mode === 'file' ? 'var(--primary)' : '#eee', color: mode === 'file' ? 'white' : '#333' }}
          onClick={() => { setMode('file'); setInputText(''); setJsonResult(''); setErrorMsg(''); setProcessedFileUrl(null); }}
        >
          File Input
        </button>
      </div>

      {mode === 'text' ? (
        <>
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={'name,age,city\nJohn,30,New York\nJane,25,London'}
            style={{ width: '100%', height: '200px', padding: '1rem', fontFamily: 'monospace', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
          />
          {errorMsg && <div style={{ color: 'red', marginTop: '1rem' }}>{errorMsg}</div>}
          <button 
            className="btn" 
            onClick={handleConvertText}
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={!inputText}
          >
            Convert to JSON
          </button>
          
          {jsonResult && (
            <div style={{ marginTop: '2rem' }}>
              <h3>JSON Result:</h3>
              <textarea 
                readOnly
                value={jsonResult}
                style={{ width: '100%', height: '250px', padding: '1rem', fontFamily: 'monospace', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc', marginTop: '1rem', backgroundColor: '#f9f9f9', resize: 'vertical' }}
              />
            </div>
          )}
        </>
      ) : (
        <>
          {!processedFileUrl ? (
            <>
              <div 
                className="dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
                style={{ padding: '3rem 2rem' }}
              >
                <p style={{ fontSize: '1.2rem' }}>{file ? file.name : 'Select a CSV File'}</p>
                <span style={{ fontSize: '0.9rem', color: '#888', display: 'block', marginTop: '1rem' }}>
                  {file ? 'Click to change file' : 'or drop file here'}
                </span>
                <input 
                  id="file-upload" 
                  type="file" 
                  accept=".csv,text/csv"
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                />
              </div>

              {errorMsg && <div style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>{errorMsg}</div>}

              {file && (
                <button 
                  className="btn" 
                  onClick={processFile}
                  disabled={isProcessing}
                  style={{ width: '100%', marginTop: '2rem' }}
                >
                  {isProcessing ? 'Converting...' : 'Convert to JSON File'}
                </button>
              )}
            </>
          ) : (
            <div style={{ padding: '3rem', border: '1px solid #e0e0e0', borderRadius: '12px', marginTop: '2rem', textAlign: 'center' }}>
              <h2>CSV Converted Successfully!</h2>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <a 
                  href={processedFileUrl} 
                  download={`${file.name.replace('.csv', '')}.json`} 
                  className="btn"
                >
                  Download JSON
                </a>
                <button 
                  className="btn" 
                  style={{ backgroundColor: '#666' }}
                  onClick={() => {
                    setProcessedFileUrl(null);
                    setFile(null);
                  }}
                >
                  Convert Another File
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
