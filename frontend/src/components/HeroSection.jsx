import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { ArrowRight, ShieldCheck, Zap, Lock, Sparkles, ChevronDown } from 'lucide-react';
import UniversalDropzone from './UniversalDropzone';
import MagneticButton from './MagneticButton';

export default function HeroSection() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const isVisibleRef = useRef(true);

  // -------------------------------------------------------------
  // 1. High-Performance 60FPS Three.js Spatial Canvas
  // -------------------------------------------------------------
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    camera.position.z = 7.0;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    // Optimized Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xe2e8f0, 0.8);
    dirLight2.position.set(-5, -5, -2);
    scene.add(dirLight2);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Central Multi-Faceted Crystal File Core (Vibrant Sunset Palette)
    const coreGeometry = new THREE.IcosahedronGeometry(1.85, 0);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f3ff,
      roughness: 0.18,
      metalness: 0.15,
      flatShading: true
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    rootGroup.add(coreMesh);

    // Outer Precision Hairline Wireframe (Cyber Cyan #22D3EE)
    const wireGeometry = new THREE.IcosahedronGeometry(1.88, 0);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.70
    });
    const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
    rootGroup.add(wireMesh);

    // 4 Lightweight Orbiting Format Satellites (06 Midnight Neon Tokens)
    const satellites = [];
    const satGeometries = [
      new THREE.BoxGeometry(0.32, 0.44, 0.06), // Document
      new THREE.OctahedronGeometry(0.24, 0),    // 3D Model
      new THREE.TetrahedronGeometry(0.26, 0),   // Spatial Token
      new THREE.BoxGeometry(0.3, 0.3, 0.06)     // Media
    ];

    const satMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.25, metalness: 0.2 }), // Midnight Slate
      new THREE.MeshStandardMaterial({ color: 0x7C3AED, roughness: 0.2, metalness: 0.25 }), // Electric Violet
      new THREE.MeshStandardMaterial({ color: 0x22D3EE, roughness: 0.15, metalness: 0.3 }), // Cyber Cyan
      new THREE.MeshStandardMaterial({ color: 0xA78BFA, roughness: 0.35, metalness: 0.1 })   // Soft Purple
    ];

    for (let i = 0; i < 4; i++) {
      const satMesh = new THREE.Mesh(satGeometries[i], satMaterials[i]);
      const angle = (i / 4) * Math.PI * 2;
      const radius = 2.85;
      satMesh.position.set(
        Math.cos(angle) * radius,
        (Math.sin(i * 1.5) * 0.6),
        Math.sin(angle) * radius
      );
      satMesh.userData = {
        angle,
        radius,
        speed: 0.006 + (i * 0.002),
        initialY: satMesh.position.y
      };
      rootGroup.add(satMesh);
      satellites.push(satMesh);
    }

    // Visibility Observer to pause rendering when scrolled out of view
    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);

    // 60FPS Animation Loop with Delta Time
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Only render when visible to guarantee 100% CPU/GPU smoothness for scrolling
      if (!isVisibleRef.current) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse spring interpolation (Lerp factor 0.08)
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;

      rootGroup.rotation.x = currentRotation.current.x + Math.sin(elapsedTime * 0.5) * 0.06;
      rootGroup.rotation.y = currentRotation.current.y + elapsedTime * 0.2;

      // Animate orbiting satellites
      satellites.forEach((sat, idx) => {
        sat.userData.angle += sat.userData.speed;
        sat.position.x = Math.cos(sat.userData.angle) * sat.userData.radius;
        sat.position.z = Math.sin(sat.userData.angle) * sat.userData.radius;
        sat.position.y = sat.userData.initialY + Math.sin(elapsedTime * 1.8 + idx) * 0.2;
        sat.rotation.x += 0.01;
        sat.rotation.y += 0.015;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Debounced Resize Handler
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!canvasRef.current) return;
        const width = canvasRef.current.clientWidth;
        const height = canvasRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      renderer.dispose();
    };
  }, []);

  // RAF-Throttled Mouse Parallax
  const rafId = useRef(null);
  const handleMouseMove = (e) => {
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

        targetRotation.current = {
          x: -y * 0.4,
          y: x * 0.55
        };
      }
      rafId.current = null;
    });
  };

  const handleMouseLeave = () => {
    targetRotation.current = { x: 0, y: 0 };
  };

  const scrollToTools = () => {
    const el = document.getElementById('bento-features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '78vh',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #EDE9FE 55%, #F8FAFC 100%)',
        overflow: 'hidden',
        padding: '1.75rem 1.25rem 2.25rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        willChange: 'transform'
      }}
    >
      {/* Background 3D Spatial Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.85,
          zIndex: 1
        }}
      />

      {/* Main Content Container */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '980px', width: '100%', textAlign: 'center', margin: '0 auto' }}>
        
        {/* Privacy Trust Badge (06 Midnight Neon #EDE9FE & #22D3EE) */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0.35rem 0.95rem',
          background: 'rgba(237, 233, 254, 0.85)',
          border: '1px solid #A78BFA',
          borderRadius: '9999px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
          marginBottom: '0.85rem'
        }}>
          <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#22D3EE', boxShadow: '0 0 8px rgba(34, 211, 238, 0.8)' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 650, color: '#0F172A' }}>
            100% In-Browser Privacy • Zero Server Uploads
          </span>
        </div>

        {/* Master Headline */}
        <h1 style={{
          fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
          fontWeight: 850,
          color: '#0F172A',
          lineHeight: 1.15,
          letterSpacing: '-0.035em',
          margin: '0 auto 0.6rem auto',
          maxWidth: '820px'
        }}>
          Convert, Compress & Edit Any File.{' '}
          <span style={{ 
            background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block' 
          }}>
            Directly in your browser.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)',
          color: '#475569',
          maxWidth: '640px',
          margin: '0 auto 1.5rem auto',
          lineHeight: 1.5,
          fontWeight: 450
        }}>
          Drop any document, image, video, or data file below for instant client-side processing. 
          Zero cloud uploads, unlimited file sizes, and absolute data privacy.
        </p>

        {/* Embedded Universal Smart Dropzone (Immediate Primary Focal Point) */}
        <div style={{
          position: 'relative',
          maxWidth: '880px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '0.4rem',
          boxShadow: '0 16px 40px -8px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(124, 58, 237, 0.15)',
        }}>
          <UniversalDropzone />
        </div>

        {/* Quick Popular Tool Shortcuts Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          marginTop: '1.25rem',
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 650, color: '#475569', marginRight: '4px' }}>Quick Tools:</span>
          {[
            { label: 'Merge PDF', path: '/merge_pdf' },
            { label: 'Sign PDF', path: '/sign_pdf' },
            { label: 'Remove BG', path: '/remove_bg' },
            { label: 'Gemini Watermark', path: '/gemini_watermark_remover' },
            { label: 'Compress Image', path: '/compress_image' },
            { label: 'PDF to Word', path: '/pdf_to_word' },
            { label: 'Cyber Forensics', path: '/cyber_forensics' },
            { label: 'Video to GIF', path: '/video_to_gif' },
            { label: 'Studio (50+ Tools) →', path: '/app', highlight: true },
          ].map(tool => (
            <Link
              key={tool.label}
              to={tool.path}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.35rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 650,
                textDecoration: 'none',
                background: tool.highlight ? '#0F172A' : 'rgba(255, 255, 255, 0.95)',
                color: tool.highlight ? '#ffffff' : '#0F172A',
                border: '1px solid ' + (tool.highlight ? '#0F172A' : 'rgba(15, 23, 42, 0.12)'),
                boxShadow: tool.highlight ? '0 2px 8px rgba(15, 23, 42, 0.25)' : '0 1px 3px rgba(15, 23, 42, 0.04)',
                transition: 'all 150ms ease',
              }}
            >
              {tool.label}
            </Link>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div 
          onClick={scrollToTools}
          style={{
            marginTop: '2rem',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: '#94A3B8',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: 0.85,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.85'}
        >
          <span>Explore architecture & all features</span>
          <ChevronDown size={16} style={{ animation: 'bounceSlow 2s infinite' }} />
        </div>

      </div>

      <style>{`
        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(6px);
          }
        }
      `}</style>
    </section>
  );
}
