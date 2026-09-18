import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFileContext } from '../context/FileContext';
import { UploadCloud, ShieldCheck, Sparkles, Lock } from 'lucide-react';

export default function GlobalDropOverlay() {
  const [isDraggingGlobally, setIsDraggingGlobally] = useState(false);
  const dragCounter = useRef(0);
  const { setFile, addFiles } = useFileContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isFileDrag = (e) => {
      if (!e.dataTransfer || !e.dataTransfer.types) return false;
      return Array.from(e.dataTransfer.types).includes('Files');
    };

    const handleDragEnter = (e) => {
      e.preventDefault();
      if (!isFileDrag(e)) return;

      dragCounter.current += 1;
      if (dragCounter.current === 1) {
        setIsDraggingGlobally(true);
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      if (isFileDrag(e)) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      if (!isFileDrag(e)) return;

      dragCounter.current = Math.max(0, dragCounter.current - 1);
      if (dragCounter.current === 0) {
        setIsDraggingGlobally(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDraggingGlobally(false);

      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const filesArr = Array.from(e.dataTransfer.files);
        if (addFiles) {
          addFiles(filesArr);
        } else {
          setFile(filesArr[0]);
        }

        if (location.pathname !== '/' && location.pathname !== '/app' && location.pathname !== '/tools') {
          navigate('/');
        }
      }
    };

    const handleWindowBlur = () => {
      dragCounter.current = 0;
      setIsDraggingGlobally(false);
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [setFile, location.pathname, navigate]);

  if (!isDraggingGlobally) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        userSelect: 'none',
        pointerEvents: 'auto',
        animation: 'globalOverlayFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      <style>{`
        @keyframes globalOverlayFadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes marchAnts {
          0% {
            background-position: 0% 0%, 100% 100%, 0% 100%, 100% 0%;
          }
          100% {
            background-position: 100% 0%, 0% 100%, 0% 0%, 100% 100%;
          }
        }

        @keyframes floatPulse {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.02);
          }
        }
      `}</style>

      {/* Massive 80% Viewport Dashed Bounding Canvas */}
      <div
        style={{
          width: '90%',
          maxWidth: '1100px',
          height: '80vh',
          maxHeight: '700px',
          border: '3px dashed rgba(255, 255, 255, 0.65)',
          borderRadius: '28px',
          background: 'radial-gradient(circle at center, rgba(30, 58, 138, 0.28) 0%, rgba(15, 23, 42, 0.4) 100%)',
          boxShadow: '0 0 50px rgba(59, 130, 246, 0.25), inset 0 0 40px rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          pointerEvents: 'none', // Crucial: prevents child flicker on mouse movement
          padding: '2rem'
        }}
      >
        {/* Animated Icon Plinth */}
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.75rem',
            boxShadow: '0 12px 35px rgba(37, 99, 235, 0.45)',
            animation: 'floatPulse 2s ease-in-out infinite'
          }}
        >
          <UploadCloud size={52} strokeWidth={2} />
        </div>

        {/* Primary Headline */}
        <h2
          style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            margin: '0 0 0.75rem 0',
            textShadow: '0 4px 20px rgba(0,0,0,0.4)'
          }}
        >
          Drop anywhere to upload
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
            color: '#E2E8F0',
            maxWidth: '560px',
            margin: '0 0 2rem 0',
            lineHeight: 1.5,
            fontWeight: 500
          }}
        >
          Release your file to instantly process, convert, or compress.
        </p>

        {/* Security & Privacy Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.5rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '9999px',
            color: '#A7F3D0',
            fontSize: '0.88rem',
            fontWeight: 700,
            backdropFilter: 'blur(8px)'
          }}
        >
          <ShieldCheck size={18} color="#34D399" />
          <span>100% In-Browser Privacy • Zero Bytes Uploaded to Server</span>
        </div>
      </div>
    </div>
  );
}
