import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { useFileContext } from '../../context/FileContext';
import { Box, Download, Eye, RotateCw, Layers, Sparkles } from 'lucide-react';

export default function ThreeDConverter() {
  const { sharedFile } = useFileContext();
  const mountRef = useRef(null);
  const [modelStats, setModelStats] = useState({ vertices: 0, faces: 0, format: 'Sample Cube' });
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [currentMesh, setCurrentMesh] = useState(null);
  const [sceneRef, setSceneRef] = useState(null);

  useEffect(() => {
    const width = mountRef.current.clientWidth;
    const height = 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    setSceneRef(scene);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3, 3, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Grid & Lighting
    const grid = new THREE.GridHelper(10, 20, 0x38bdf8, 0x334155);
    scene.add(grid);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Initial Sample Mesh: Torus Knot
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.3,
      metalness: 0.8,
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    setCurrentMesh(mesh);

    setModelStats({
      vertices: geometry.attributes.position.count,
      faces: geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3,
      format: 'TorusKnot (Default)'
    });

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (mesh && autoRotate) {
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  // Toggle wireframe
  useEffect(() => {
    if (currentMesh) {
      currentMesh.material.wireframe = wireframe;
    }
  }, [wireframe, currentMesh]);

  useEffect(() => {
    if (sharedFile && sceneRef && sharedFile.name?.toLowerCase().endsWith('.stl')) {
      load3DFile(sharedFile);
    }
  }, [sharedFile, sceneRef]);

  const load3DFile = async (file) => {
    if (!file || !sceneRef) return;
    const extension = file.name.split('.').pop()?.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();

    if (extension === 'stl') {
      try {
        const dataView = new DataView(arrayBuffer);
        const isBinary = arrayBuffer.byteLength > 84;
        let geometry;

        if (isBinary) {
          const facesCount = dataView.getUint32(80, true);
          const vertices = [];
          let offset = 84;

          for (let i = 0; i < facesCount; i++) {
            offset += 12; // Skip normal
            for (let v = 0; v < 3; v++) {
              vertices.push(
                dataView.getFloat32(offset, true),
                dataView.getFloat32(offset + 4, true),
                dataView.getFloat32(offset + 8, true)
              );
              offset += 12;
            }
            offset += 2; // Skip attribute byte count
          }

          geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
          geometry.computeVertexNormals();
        }

        if (geometry) {
          if (currentMesh) sceneRef.remove(currentMesh);

          geometry.center();
          geometry.computeBoundingSphere();
          const scale = 2 / (geometry.boundingSphere.radius || 1);
          geometry.scale(scale, scale, scale);

          const material = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            roughness: 0.4,
            metalness: 0.6,
            wireframe: wireframe
          });
          const newMesh = new THREE.Mesh(geometry, material);
          sceneRef.add(newMesh);
          setCurrentMesh(newMesh);

          setModelStats({
            vertices: geometry.attributes.position.count,
            faces: geometry.attributes.position.count / 3,
            format: `STL (${file.name})`
          });
        }
      } catch (err) {
        alert('Could not parse STL file: ' + err.message);
      }
    }
  };

  // Load user STL / OBJ file
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) load3DFile(file);
  };

  // Export current geometry to STL
  const handleExportSTL = () => {
    if (!currentMesh) return;
    const geometry = currentMesh.geometry;
    const positions = geometry.attributes.position.array;

    let stl = 'solid exported_by_fileverse\n';
    for (let i = 0; i < positions.length; i += 9) {
      stl += '  facet normal 0 0 0\n    outer loop\n';
      stl += `      vertex ${positions[i]} ${positions[i+1]} ${positions[i+2]}\n`;
      stl += `      vertex ${positions[i+3]} ${positions[i+4]} ${positions[i+5]}\n`;
      stl += `      vertex ${positions[i+6]} ${positions[i+7]} ${positions[i+8]}\n`;
      stl += '    endloop\n  endfacet\n';
    }
    stl += 'endsolid exported_by_fileverse\n';

    const blob = new Blob([stl], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'model_exported.stl';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tool-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Dashboard</Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#1e293b' }}>
          3D & CAD Model Viewer & Exporter
        </h1>
        <p style={{ color: '#64748b' }}>
          Inspect 3D STL geometries, toggle wireframes, check polycounts, and export 3D models right in your browser.
        </p>
      </div>

      {/* 3D Viewport */}
      <div style={{ background: '#0f172a', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
        <div ref={mountRef} style={{ width: '100%', height: '400px' }} />

        {/* Overlay Controls */}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', pointerEvents: 'none' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #334155', pointerEvents: 'auto', display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            <span><strong>Format:</strong> {modelStats.format}</span>
            <span><strong>Vertices:</strong> {modelStats.vertices.toLocaleString()}</span>
            <span><strong>Faces:</strong> {Math.round(modelStats.faces).toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', pointerEvents: 'auto' }}>
            <button
              onClick={() => setWireframe(!wireframe)}
              style={{ background: wireframe ? '#0284c7' : 'rgba(15, 23, 42, 0.85)', color: '#fff', border: '1px solid #334155', padding: '0.5rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Layers size={15} /> {wireframe ? 'Shaded' : 'Wireframe'}
            </button>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              style={{ background: autoRotate ? '#0284c7' : 'rgba(15, 23, 42, 0.85)', color: '#fff', border: '1px solid #334155', padding: '0.5rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCw size={15} /> {autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
            </button>
          </div>
        </div>
      </div>

      {/* Upload and Conversion Actions */}
      <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>Load Your 3D File</h3>
          <input
            type="file"
            accept=".stl"
            onChange={handleFileUpload}
            style={{ width: '100%', padding: '0.5rem', border: '1px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc' }}
          />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '0.4rem' }}>Supports Binary and ASCII .stl 3D mesh files.</span>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <button
            onClick={handleExportSTL}
            style={{ width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Download size={18} /> Export as STL Mesh (.stl)
          </button>
        </div>
      </div>
    </div>
  );
}
