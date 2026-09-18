import React from 'react';
import { useParams, Link } from 'react-router-dom';
import UniversalDropzone from '../components/UniversalDropzone';
import { Layers, ArrowLeft } from 'lucide-react';

export default function UniversalConverter() {
  const { categoryId = 'all' } = useParams();

  const formattedCategory = categoryId.replace(/[-_]/g, ' ');

  return (
    <div className="tool-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to All Tools
        </Link>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1e293b', textTransform: 'capitalize' }}>
          {categoryId === 'all' ? 'Universal File Converter' : `${formattedCategory} Intelligence & Converter`}
        </h1>
        <p style={{ color: '#64748b', maxWidth: '600px', margin: '0.5rem auto 1.5rem auto' }}>
          Drop any document, image, audio, video, 3D model, subtitle, or data file below. The local engine will identify the format and present all available conversion and editing actions.
        </p>
      </div>

      <UniversalDropzone />
    </div>
  );
}
