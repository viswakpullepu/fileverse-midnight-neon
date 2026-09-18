import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, RotateCw, Sparkles, Layers, Box, Cpu } from 'lucide-react';

export default function ExperimentalSpatialCanvas({ onSelectFormat }) {
  const mountRef = useRef(null);
  const [isWireframe, setIsWireframe] = useState(false);
  const [activeFormat, setActiveFormat] = useState('PDF Engine');
  const [isRotating, setIsRotating] = useState(true);
  const wireframeRef = useRef(isWireframe);
  const isRotatingRef = useRef(isRotating);

  useEffect(() => {
    wireframeRef.current = isWireframe;
  }, [isWireframe]);

  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene Setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x10b981, 2.5); // Emerald accent
    mainLight.position.set(5, 5, 4);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x6366f1, 1.5); // Indigo accent
    fillLight.position.set(-5, -4, 2);
    scene.add(fillLight);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Core Crystal (Icosahedron representing client-side WASM RAM core)
    const coreGeo = new THREE.IcosahedronGeometry(1.65, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.2,
      metalness: 0.8,
      flatShading: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    rootGroup.add(coreMesh);

    // Outer Wireframe Lattice
    const latticeGeo = new THREE.IcosahedronGeometry(1.72, 1);
    const latticeMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const latticeMesh = new THREE.Mesh(latticeGeo, latticeMat);
    rootGroup.add(latticeMesh);

    // Satellite Formats
    const satelliteData = [
      { name: 'PDF Vector Engine', color: 0xef4444, geo: new THREE.BoxGeometry(0.36, 0.48, 0.08) },
      { name: 'WASM Image Matrix', color: 0x10b981, geo: new THREE.OctahedronGeometry(0.28, 0) },
      { name: '3D STL / Mesh Hub', color: 0x3b82f6, geo: new THREE.DodecahedronGeometry(0.26, 0) },
      { name: 'GIS & Data Parser', color: 0xf59e0b, geo: new THREE.TetrahedronGeometry(0.3, 0) },
    ];

    const satellites = satelliteData.map((data, idx) => {
      const mat = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.3,
        metalness: 0.5,
        wireframe: false,
      });
      const mesh = new THREE.Mesh(data.geo, mat);
      mesh.userData = { name: data.name, index: idx };
      rootGroup.add(mesh);
      return { mesh, ...data };
    });

    // Cursor Follow Lerp
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.45;
      targetY = y * 0.45;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop with Visibility Observation
    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(container);

    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();

      // Smooth camera / root tilt
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      rootGroup.rotation.y = mouseX;
      rootGroup.rotation.x = -mouseY;

      // Rotate core
      if (isRotatingRef.current) {
        coreMesh.rotation.y += 0.008;
        coreMesh.rotation.x += 0.005;
        latticeMesh.rotation.y -= 0.004;
      }

      // Update wireframe state
      coreMat.wireframe = wireframeRef.current;

      // Orbit satellites
      satellites.forEach((sat, i) => {
        const speed = 0.6;
        const offset = (i * Math.PI) / 2;
        const angle = elapsed * speed + offset;
        const radius = 2.85;

        sat.mesh.position.x = Math.cos(angle) * radius;
        sat.mesh.position.z = Math.sin(angle) * radius;
        sat.mesh.position.y = Math.sin(elapsed * 1.5 + i) * 0.35;

        sat.mesh.rotation.x += 0.015;
        sat.mesh.rotation.y += 0.02;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      latticeGeo.dispose();
      latticeMat.dispose();
      satellites.forEach(s => {
        s.geo.dispose();
        s.mesh.material.dispose();
      });
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '440px' }}>
      {/* 3D Viewport mount */}
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '440px',
          cursor: 'grab',
          position: 'relative' 
        }} 
      />

      {/* Floating HUD Controls */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        right: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none',
      }}>
        {/* Active Node Indicator */}
        <div style={{
          pointerEvents: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(9, 13, 22, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '9999px',
          padding: '6px 14px',
          color: '#f8fafc',
          fontSize: '0.8rem',
          fontWeight: 600,
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span>RAM Sandbox Matrix Active</span>
        </div>

        {/* Tactile control toggles */}
        <div style={{
          pointerEvents: 'auto',
          display: 'flex',
          gap: '8px',
        }}>
          <button
            type="button"
            onClick={() => setIsWireframe(!isWireframe)}
            title="Toggle Wireframe Architecture"
            style={{
              background: isWireframe ? '#10b981' : 'rgba(9, 13, 22, 0.85)',
              color: isWireframe ? '#090d16' : '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 150ms ease',
            }}
          >
            <Box size={14} />
            <span>{isWireframe ? 'Solid' : 'Wireframe'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            title="Toggle Continuous Rotation"
            style={{
              background: 'rgba(9, 13, 22, 0.85)',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 150ms ease',
            }}
          >
            <RotateCw size={14} style={{ transform: isRotating ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 200ms ease' }} />
            <span>{isRotating ? 'Pause' : 'Play'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
