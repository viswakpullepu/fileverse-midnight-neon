import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function JsonToCsv() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [csvResult, setCsvResult] = useState('');
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

  const convertJsonToCsv = (jsonString) => {
    try {
      let data = JSON.parse(jsonString);
      
      // Handle case where JSON is a single object rather than an array
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = [data];
      }

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("JSON must be an array of objects.");
      }

      // Extract headers
      const headers = Object.keys(data[0]);
      
      // Map rows
      const csvRows = data.map(row => {
        return headers.map(header => {
          let cell = row[header] === null || row[header] === undefined ? '' : row[header];
          // Escape quotes and wrap in quotes if necessary
          if (typeof cell === 'object') {
            cell = JSON.stringify(cell);
          }
          cell = String(cell).replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(',');
      });

      // Combine headers and rows
      const csvString = [headers.join(','), ...csvRows].join('\n');
      return csvString;
      
    } catch (err) {
      throw new Error("Invalid JSON format. Please ensure it is a valid JSON array.");
    }
  };

  const handleConvertText = () => {
    if (!inputText) return;
    setErrorMsg('');
    try {
      const csv = convertJsonToCsv(inputText);
      setCsvResult(csv);
    } catch (err) {
      setErrorMsg(err.message);
      setCsvResult('');
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
        const csv = convertJsonToCsv(event.target.result);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        setProcessedFileUrl(url);
      } catch (err) {
        setErrorMsg("Failed to parse the JSON file. Ensure it contains a valid array of objects.");
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
      <h1>JSON to CSV</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Instantly convert JSON arrays into comma-separated values (CSV) for Excel or databases. 100% locally.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', marginBottom: '1rem' }}>
        <button 
          className="btn" 
          style={{ flex: 1, backgroundColor: mode === 'text' ? 'var(--primary)' : '#eee', color: mode === 'text' ? 'white' : '#333' }}
          onClick={() => { setMode('text'); setFile(null); setCsvResult(''); setErrorMsg(''); setProcessedFileUrl(null); }}
        >
          Text Input
        </button>
        <button 
          className="btn" 
          style={{ flex: 1, backgroundColor: mode === 'file' ? 'var(--primary)' : '#eee', color: mode === 'file' ? 'white' : '#333' }}
          onClick={() => { setMode('file'); setInputText(''); setCsvResult(''); setErrorMsg(''); setProcessedFileUrl(null); }}
        >
          File Input
        </button>
      </div>

      {mode === 'text' ? (
        <>
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={'[\n  { "name": "John", "age": 30 },\n  { "name": "Jane", "age": 25 }\n]'}
            style={{ width: '100%', height: '200px', padding: '1rem', fontFamily: 'monospace', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }}
          />
          {errorMsg && <div style={{ color: 'red', marginTop: '1rem' }}>{errorMsg}</div>}
          <button 
            className="btn" 
            onClick={handleConvertText}
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={!inputText}
          >
            Convert to CSV
          </button>
          
          {csvResult && (
            <div style={{ marginTop: '2rem' }}>
              <h3>CSV Result:</h3>
              <textarea 
                readOnly
                value={csvResult}
                style={{ width: '100%', height: '150px', padding: '1rem', fontFamily: 'monospace', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc', marginTop: '1rem', backgroundColor: '#f9f9f9', resize: 'vertical' }}
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
                <p style={{ fontSize: '1.2rem' }}>{file ? file.name : 'Select a JSON File'}</p>
                <span style={{ fontSize: '0.9rem', color: '#888', display: 'block', marginTop: '1rem' }}>
                  {file ? 'Click to change file' : 'or drop file here'}
                </span>
                <input 
                  id="file-upload" 
                  type="file" 
                  accept=".json,application/json"
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
                  {isProcessing ? 'Converting...' : 'Convert to CSV File'}
                </button>
              )}
            </>
          ) : (
            <div style={{ padding: '3rem', border: '1px solid #e0e0e0', borderRadius: '12px', marginTop: '2rem', textAlign: 'center' }}>
              <h2>JSON Converted Successfully!</h2>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <a 
                  href={processedFileUrl} 
                  download={`${file.name.replace('.json', '')}.csv`} 
                  className="btn"
                >
                  Download CSV
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
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to fileverze Dashboard</Link>
      </div>
    </div>
  );
}
