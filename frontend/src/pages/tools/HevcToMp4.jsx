import React, { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function HevcToMp4() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [engineDownloadProgress, setEngineDownloadProgress] = useState(0);
  const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const ffmpegRef = useRef(new FFmpeg());

  // Hydrate staged file
  useEffect(() => {
    const stagedFile = sharedFile || location.state?.autoLoadedFile;
    if (stagedFile) {
      setFile(stagedFile);
      setProcessedVideoUrl(null);
      clearFile();
    }
  }, [sharedFile, location.state, clearFile]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = ffmpegRef.current;
    
    ffmpeg.on('progress', ({ progress }) => {
      setProgress(Math.round(progress * 100));
    });

    const downloadWithProgress = async (url, setProgressCallback) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${url}`);
      
      const contentLength = response.headers.get('content-length');
      if (!contentLength) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
      
      const total = parseInt(contentLength, 10);
      let loaded = 0;
      
      const reader = response.body.getReader();
      const chunks = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.byteLength;
        setProgressCallback(Math.round((loaded / total) * 100));
      }
      
      const blob = new Blob(chunks, { type: response.headers.get('content-type') });
      return URL.createObjectURL(blob);
    };

    try {
      // ffmpeg-core.wasm is the large file (approx 30MB), so we track it for the progress bar.
      const coreURL = await downloadWithProgress(`${baseURL}/ffmpeg-core.js`, () => {});
      const wasmURL = await downloadWithProgress(`${baseURL}/ffmpeg-core.wasm`, (p) => setEngineDownloadProgress(p));
      
      await ffmpeg.load({
        coreURL,
        wasmURL,
      });
      setIsLoaded(true);
    } catch (e) {
      console.error("Error loading FFmpeg:", e);
      setLoadError("Failed to load the conversion engine. Please disable adblockers or try refreshing the page.");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const convertToMp4 = async () => {
    if (!file || !isLoaded) return;
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile('input_hevc_video', await fetchFile(file));
      
      // Convert HEVC/H265 to standard H264 MP4 with ultrafast preset for browser WebAssembly speed
      await ffmpeg.exec([
        '-i', 'input_hevc_video',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '26',
        '-c:a', 'aac',
        'output.mp4'
      ]);
      
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      
      setProcessedVideoUrl(url);
    } catch (error) {
      console.error('Error converting HEVC to MP4:', error);
      alert('Failed to convert video. Ensure the file is valid HEVC/H.265.');
    } finally {
      try {
        const ffmpeg = ffmpegRef.current;
        if (typeof ffmpeg.deleteFile === 'function') {
          await ffmpeg.deleteFile('input_hevc_video');
          await ffmpeg.deleteFile('output.mp4');
        }
      } catch (e) {}
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>HEVC to MP4</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Convert High Efficiency Video Coding (HEVC / H.265 / MOV) videos from iPhones or cameras to universally compatible H.264 MP4 format, directly in your browser.
      </p>

      {!isLoaded && !loadError && (
        <div style={{ padding: '2rem', background: '#fff3cd', color: '#856404', borderRadius: '8px', marginTop: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            Loading Conversion Engine ({engineDownloadProgress}%)... Please wait, this is a one-time 30MB download.
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(133, 100, 4, 0.2)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${engineDownloadProgress}%`, height: '100%', backgroundColor: '#856404', transition: 'width 0.2s ease-out' }}></div>
          </div>
        </div>
      )}

      {loadError && (
        <div style={{ padding: '2rem', background: '#f8d7da', color: '#721c24', borderRadius: '8px', marginTop: '2rem' }}>
          <strong>Error:</strong> {loadError}
        </div>
      )}

      {!processedVideoUrl ? (
        <>
          <div 
            className={`dropzone ${!isLoaded ? 'disabled' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => isLoaded && document.getElementById('file-upload').click()}
            style={{ 
              padding: '4rem 2rem', 
              marginTop: '2rem',
              opacity: isLoaded ? 1 : 0.5,
              cursor: isLoaded ? 'pointer' : 'not-allowed'
            }}
          >
            <p style={{ fontSize: '1.5rem' }}>{file ? file.name : 'Select HEVC/MOV File'}</p>
            <span style={{ fontSize: '1rem', color: '#888', display: 'block', marginTop: '1rem' }}>
              {file ? 'Click to change file' : 'or drop video here'}
            </span>
            <input 
              id="file-upload" 
              type="file" 
              accept="video/*,.hevc,.h265,.mov" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
              disabled={!isLoaded}
            />
          </div>

          {file && (
            <div style={{ marginTop: '2rem', textAlign: 'left', padding: '2rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <button 
                className="btn" 
                onClick={convertToMp4}
                disabled={isProcessing || !isLoaded}
                style={{ width: '100%', position: 'relative', overflow: 'hidden' }}
              >
                {isProcessing && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${progress}%`,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    transition: 'width 0.2s'
                  }}></div>
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {isProcessing ? `Converting to H.264 MP4... ${progress}%` : 'Convert to MP4'}
                </span>
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '3rem', border: '1px solid #e0e0e0', borderRadius: '12px', marginTop: '2rem', textAlign: 'center' }}>
          <h2>MP4 Created Successfully!</h2>
          
          <div style={{ marginTop: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
            <video controls src={processedVideoUrl} style={{ width: '100%', maxWidth: '600px', borderRadius: '8px' }}></video>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a 
              href={processedVideoUrl} 
              download={`converted_${file.name.split('.')[0]}.mp4`} 
              className="btn"
            >
              Download MP4
            </a>
            <button 
              className="btn" 
              style={{ backgroundColor: '#666' }}
              onClick={() => {
                setProcessedVideoUrl(null);
                setFile(null);
              }}
            >
              Convert Another Video
            </button>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
