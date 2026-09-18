import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ToolPlaceholder() {
  const { toolId } = useParams();

  // Create a nice display name from the id
  const displayName = toolId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="tool-page">
      <h1>{displayName}</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        This powerful tool is currently being built! Our local Python backend and WASM processors are being wired up to handle this exact functionality offline.
      </p>
      
      <div className="dropzone">
        <p>Drag and drop your files here (Coming Soon)</p>
        <span style={{ fontSize: '0.9rem', color: '#888', display: 'block', marginTop: '1rem' }}>
          We are currently implementing the local core for Merge PDF. Check that out first!
        </span>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link to="/" className="btn">Back to Dashboard</Link>
      </div>
    </div>
  );
}
