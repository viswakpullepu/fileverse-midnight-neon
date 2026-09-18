import React, { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';

export default function ChangeVideoSpeed() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [speed, setSpeed] = useState('2.0'); // multiplier
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

  const changeSpeed = async () => {
    if (!file || !isLoaded) return;
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));
      
      const speedNum = parseFloat(speed);
      const videoPts = 1 / speedNum;
      
      // FFmpeg filter to change speed. Note: atempo only works from 0.5 to 2.0 per filter, 
      // but we will keep it simple and assume standard speeds for this web tool.
      const audioFilter = speedNum > 2.0 ? 'atempo=2.0,atempo='+(speedNum/2.0) : 
                          speedNum < 0.5 ? 'atempo=0.5,atempo='+(speedNum*2.0) : 
                          `atempo=${speedNum}`;
      
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-filter_complex', `[0:v]setpts=${videoPts}*PTS[v];[0:a]${audioFilter}[a]`,
        '-map', '[v]',
        '-map', '[a]',
        'output.mp4'
      ]);
      
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      
      setProcessedVideoUrl(url);
    } catch (error) {
      console.error('Error changing video speed:', error);
      // Fallback if audio fails (some videos have no audio)
      try {
        const ffmpeg = ffmpegRef.current;
        const videoPts = 1 / parseFloat(speed);
        await ffmpeg.exec(['-i', 'input.mp4', '-filter:v', `setpts=${videoPts}*PTS`, '-an', 'output.mp4']);
        const data = await ffmpeg.readFile('output.mp4');
        const blob = new Blob([data.buffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        setProcessedVideoUrl(url);
      } catch (fallbackError) {
        alert('Failed to process video.');
      }
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Change Video Speed</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Speed up or slow down your videos instantly, directly inside your browser.
      </p>

      {!isLoaded && (
        <div style={{ padding: '2rem', background: '#fff3cd', color: '#856404', borderRadius: '8px', marginTop: '2rem' }}>
          Loading Engine... Please wait.
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
              accept="video/mp4,video/webm,video/quicktime" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
              disabled={!isLoaded}
            />
          </div>

          {file && (
            <div style={{ marginTop: '2rem', textAlign: 'left', padding: '2rem', border: '1px solid #eee', borderRadius: '8px' }}>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Speed Multiplier: {speed}x
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['0.25', '0.5', '1.25', '1.5', '2.0', '3.0', '4.0'].map(val => (
                    <button 
                      key={val}
                      className="btn"
                      style={{ 
                        flex: '1', 
                        minWidth: '60px',
                        backgroundColor: speed === val ? 'var(--primary)' : '#eee',
                        color: speed === val ? 'white' : '#333'
                      }}
                      onClick={() => setSpeed(val)}
                    >
                      {val}x
                    </button>
                  ))}
                </div>
              </div>

              <button 
                className="btn" 
                onClick={changeSpeed}
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
                  {isProcessing ? `Processing... ${progress}%` : 'Apply Speed Change'}
                </span>
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '3rem', border: '1px solid #e0e0e0', borderRadius: '12px', marginTop: '2rem', textAlign: 'center' }}>
          <h2>Video Speed Changed!</h2>
          
          <div style={{ marginTop: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
            <video controls src={processedVideoUrl} style={{ width: '100%', maxWidth: '600px', borderRadius: '8px' }}></video>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a 
              href={processedVideoUrl} 
              download={`speed_${speed}x_${file.name.split('.')[0]}.mp4`} 
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
              Convert Another
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
