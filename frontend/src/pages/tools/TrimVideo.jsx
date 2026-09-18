import React, { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function TrimVideo() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [startTime, setStartTime] = useState('00:00:00');
  const [duration, setDuration] = useState('10');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
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

  const trimVideo = async () => {
    if (!file || !isLoaded) return;
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));
      
      // Trim video: -ss for start time, -t for duration. -c copy to avoid re-encoding if possible, but for precise cutting we'll let it re-encode
      await ffmpeg.exec(['-ss', startTime, '-i', 'input.mp4', '-t', duration, '-c', 'copy', 'output.mp4']);
      
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      
      setProcessedVideoUrl(url);
    } catch (error) {
      console.error('Error trimming video:', error);
      alert('Failed to trim video. Ensure timestamps are valid.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Trim Video</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Cut out the best part of your video instantly. Powered locally by WebAssembly.
      </p>

      {!isLoaded && (
        <div style={{ padding: '2rem', background: '#fff3cd', color: '#856404', borderRadius: '8px', marginTop: '2rem' }}>
          Loading Video Trimmer Engine... Please wait.
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
            <p style={{ fontSize: '1.5rem' }}>{file ? file.name : 'Select Video File'}</p>
            <span style={{ fontSize: '1rem', color: '#888', display: 'block', marginTop: '1rem' }}>
              {file ? 'Click to change file' : 'or drop Video here (MP4)'}
            </span>
            <input 
              id="file-upload" 
              type="file" 
              accept="video/mp4,video/webm" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
              disabled={!isLoaded}
            />
          </div>

          {file && (
            <div style={{ marginTop: '2rem', textAlign: 'left', padding: '2rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Start Time (HH:MM:SS):
                  </label>
                  <input 
                    type="text" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="00:00:00"
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Duration (seconds):
                  </label>
                  <input 
                    type="text" 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="10"
                    style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>
              
              <button 
                className="btn" 
                onClick={trimVideo}
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
                  {isProcessing ? `Trimming Video... ${progress}%` : 'Trim Video'}
                </span>
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '3rem', border: '1px solid #e0e0e0', borderRadius: '12px', marginTop: '2rem', textAlign: 'center' }}>
          <h2>Video Trimmed Successfully!</h2>
          
          <div style={{ marginTop: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
            <video controls src={processedVideoUrl} style={{ width: '100%', maxWidth: '600px', borderRadius: '8px' }}></video>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a 
              href={processedVideoUrl} 
              download={`trimmed_${file.name}`} 
              className="btn"
            >
              Download Trimmed Video
            </a>
            <button 
              className="btn" 
              style={{ backgroundColor: '#666' }}
              onClick={() => {
                setProcessedVideoUrl(null);
                setFile(null);
              }}
            >
              Trim Another Video
            </button>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to fileverze Dashboard</Link>
      </div>
    </div>
  );
}
