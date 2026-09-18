import React, { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Link, useLocation } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';
import { loadResilientFFmpeg } from '../../utils/ffmpegLoader';
import { createTrackedObjectURL, cleanupComponentMemory, flushFFmpegMemFS } from '../../utils/memoryManager';
import { getSafeMemoryLimits } from '../../utils/platformDetector';

export default function VideoToGif() {
  const { sharedFile, clearFile } = useFileContext();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedGifUrl, setProcessedGifUrl] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [platformWarning, setPlatformWarning] = useState(null);
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef(null);

  // Hydrate staged file & cleanup on unmount
  useEffect(() => {
    const stagedFile = sharedFile || location.state?.autoLoadedFile;
    if (stagedFile) {
      setFile(stagedFile);
      setProcessedGifUrl(null);
      clearFile();

      const limits = getSafeMemoryLimits('video');
      if (limits.isRestricted && stagedFile.size > limits.maxSafeSizeMB * 1024 * 1024) {
        setPlatformWarning(limits.warning);
      }
    }

    return () => {
      cleanupComponentMemory('video-to-gif');
    };
  }, [sharedFile, location.state, clearFile]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const ffmpeg = ffmpegRef.current;
    
    ffmpeg.on('progress', ({ progress, time }) => {
      setProgress(Math.round(progress * 100));
    });

    try {
      await loadResilientFFmpeg(ffmpeg);
      setIsLoaded(true);
    } catch (e) {
      console.error("Error loading FFmpeg:", e);
      if (messageRef.current) {
        messageRef.current.innerText = e.message || 'Failed to load video engine.';
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setProcessedGifUrl(null);
      cleanupComponentMemory('video-to-gif');

      const limits = getSafeMemoryLimits('video');
      if (limits.isRestricted && selected.size > limits.maxSafeSizeMB * 1024 * 1024) {
        setPlatformWarning(limits.warning);
      } else {
        setPlatformWarning(null);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const convertToGif = async () => {
    if (!file || !isLoaded) return;
    setIsProcessing(true);
    setProgress(0);
    cleanupComponentMemory('video-to-gif');
    
    const ffmpeg = ffmpegRef.current;
    const inputName = 'input.mp4';
    const outputName = 'output.gif';

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      
      // High quality palettegen GIF conversion
      await ffmpeg.exec([
        '-i', inputName,
        '-t', '10', // limit to first 10s by default to prevent browser lockup
        '-vf', 'fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
        '-loop', '0',
        outputName
      ]);
      
      const data = await ffmpeg.readFile(outputName);
      const gifBlob = new Blob([data.buffer], { type: 'image/gif' });
      const url = createTrackedObjectURL(gifBlob, 'video-to-gif');
      setProcessedGifUrl(url);
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("Error converting video to GIF. Please check format or try a smaller video.");
    } finally {
      // Flush MEMFS to prevent heap bloat
      await flushFFmpegMemFS(ffmpeg, [inputName, outputName]);
      setIsProcessing(false);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Video to GIF Converter</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Convert your MP4, WebM, or MOV videos into animated GIFs entirely in your browser using client-side WebAssembly.
      </p>

      {platformWarning && (
        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.85rem 1rem', borderRadius: '8px', color: '#92400e', fontSize: '0.88rem', marginTop: '1.25rem' }}>
          📱 <strong>Mobile Safeguard:</strong> {platformWarning}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <div 
          className="dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload').click()}
          style={{ padding: '3rem 2rem', cursor: 'pointer' }}
        >
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            {file ? file.name : 'Select Video File'}
          </p>
          <span style={{ fontSize: '0.9rem', color: '#888', display: 'block', marginTop: '1rem' }}>
            {file ? 'Click to change file' : 'or drop MP4/WebM here'}
          </span>
          <input 
            id="file-upload" 
            type="file" 
            accept="video/*" 
            style={{ display: 'none' }} 
            onClick={(e) => { e.target.value = ''; }}
            onChange={handleFileChange}
          />
        </div>

        <p ref={messageRef} style={{ color: 'red', marginTop: '0.5rem' }}></p>

        <button 
          className="btn" 
          onClick={convertToGif} 
          disabled={!file || isProcessing || !isLoaded}
          style={{ marginTop: '2rem', width: '100%' }}
        >
          {!isLoaded ? 'Loading Video Engine...' : isProcessing ? `Converting... (${progress}%)` : 'Convert to GIF'}
        </button>
      </div>

      {processedGifUrl && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h3>Generated GIF:</h3>
          <img 
            src={processedGifUrl} 
            alt="Generated GIF" 
            style={{ maxWidth: '100%', maxHeight: '400px', margin: '1rem 0', borderRadius: '8px', border: '1px solid #ccc' }} 
          />
          <br/>
          <a 
            href={processedGifUrl} 
            download="converted.gif" 
            className="btn"
            style={{ display: 'inline-block', marginTop: '1rem' }}
          >
            Download GIF
          </a>
        </div>
      )}

      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
