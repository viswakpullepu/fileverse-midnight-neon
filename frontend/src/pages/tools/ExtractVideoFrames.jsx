import React, { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function ExtractVideoFrames() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [frameCount, setFrameCount] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedFrames, setExtractedFrames] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());

  // Hydrate staged file
  useEffect(() => {
    const stagedFile = sharedFile || location.state?.autoLoadedFile;
    if (stagedFile) {
      setFile(stagedFile);
      setExtractedFrames([]);
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

    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setIsLoaded(true);
    } catch (e) {
      console.error("Error loading FFmpeg:", e);
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

  const extractFrames = async () => {
    if (!file || !isLoaded) return;
    setIsProcessing(true);
    setProgress(0);
    setExtractedFrames([]);
    
    try {
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));
      
      // Determine video duration (approximate) or just extract N frames evenly.
      // -vf "fps=1" extracts 1 frame per second. 
      // Let's extract exactly N frames. We can use the 'select' filter or just fps.
      // For simplicity in a browser webassembly environment without ffprobe, 
      // we'll just extract N frames using vframes if we want the first N frames, 
      // or 1 frame per second. Let's do 1 frame per second up to max 10 to not crash the browser.
      const maxFrames = Math.min(parseInt(frameCount), 20);
      
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', 'fps=1', 
        '-vframes', maxFrames.toString(),
        'frame-%03d.jpg'
      ]);
      
      // Read out the frames
      const frames = [];
      for (let i = 1; i <= maxFrames; i++) {
        const frameName = `frame-${i.toString().padStart(3, '0')}.jpg`;
        try {
          const data = await ffmpeg.readFile(frameName);
          const blob = new Blob([data.buffer], { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          frames.push(url);
        } catch (e) {
          // Break if file doesn't exist (video shorter than N seconds)
          break;
        }
      }
      
      setExtractedFrames(frames);
    } catch (error) {
      console.error('Error extracting frames:', error);
      alert('Failed to process video.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Extract Video Frames</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Extract still JPG images from your video (1 frame per second). 100% locally.
      </p>

      {!isLoaded && (
        <div style={{ padding: '2rem', background: '#fff3cd', color: '#856404', borderRadius: '8px', marginTop: '2rem' }}>
          Loading Engine... Please wait.
        </div>
      )}

      {extractedFrames.length === 0 ? (
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
            <p style={{ fontSize: '1.5rem' }}>{file ? file.name : 'Select Video File'}</p>
            <span style={{ fontSize: '1rem', color: '#888', display: 'block', marginTop: '1rem' }}>
              {file ? 'Click to change file' : 'or drop Video here'}
            </span>
            <input 
              id="file-upload" 
              type="file" 
              accept="video/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
              disabled={!isLoaded}
            />
          </div>

          {file && (
            <div style={{ marginTop: '2rem', textAlign: 'left', padding: '2rem', border: '1px solid #eee', borderRadius: '8px' }}>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Max frames to extract: {frameCount}
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={frameCount}
                  onChange={(e) => setFrameCount(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <button 
                className="btn" 
                onClick={extractFrames}
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
                  {isProcessing ? `Extracting... ${progress}%` : 'Extract Frames'}
                </span>
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '2rem', border: '1px solid #e0e0e0', borderRadius: '12px', marginTop: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Extracted {extractedFrames.length} Frames!</h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {extractedFrames.map((url, i) => (
              <div key={i} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', background: '#f5f5f5' }}>
                <img src={url} alt={`Frame ${i+1}`} style={{ width: '100%', display: 'block' }} />
                <div style={{ padding: '0.5rem', textAlign: 'center' }}>
                  <a href={url} download={`frame_${i+1}.jpg`} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: '100%' }}>
                    Save
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              className="btn" 
              style={{ backgroundColor: '#666' }}
              onClick={() => {
                setExtractedFrames([]);
                setFile(null);
              }}
            >
              Extract Another Video
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
