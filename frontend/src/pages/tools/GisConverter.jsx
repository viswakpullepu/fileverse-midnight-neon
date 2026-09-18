import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';
import { Map, Download, Code, ArrowRightLeft, FileText, CheckCircle2 } from 'lucide-react';

// Client-side GeoJSON to KML converter
function geojsonToKml(geojson) {
  let kml = `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n  <Document>\n    <name>FileVerse Export</name>\n`;

  const features = geojson.type === 'FeatureCollection' ? geojson.features : [geojson];

  features.forEach((feature, index) => {
    const geom = feature.geometry || feature;
    const props = feature.properties || {};
    const name = props.name || props.title || `Feature ${index + 1}`;
    const desc = props.description || Object.entries(props).map(([k, v]) => `${k}: ${v}`).join(', ');

    kml += `    <Placemark>\n      <name>${escapeXml(String(name))}</name>\n      <description>${escapeXml(String(desc))}</description>\n`;

    if (geom.type === 'Point') {
      const [lon, lat, alt = 0] = geom.coordinates;
      kml += `      <Point>\n        <coordinates>${lon},${lat},${alt}</coordinates>\n      </Point>\n`;
    } else if (geom.type === 'LineString') {
      const coords = geom.coordinates.map(c => `${c[0]},${c[1]},${c[2] || 0}`).join(' ');
      kml += `      <LineString>\n        <coordinates>${coords}</coordinates>\n      </LineString>\n`;
    } else if (geom.type === 'Polygon') {
      const outerRing = geom.coordinates[0]?.map(c => `${c[0]},${c[1]},${c[2] || 0}`).join(' ') || '';
      kml += `      <Polygon>\n        <outerBoundaryIs>\n          <LinearRing>\n            <coordinates>${outerRing}</coordinates>\n          </LinearRing>\n        </outerBoundaryIs>\n      </Polygon>\n`;
    }

    kml += `    </Placemark>\n`;
  });

  kml += `  </Document>\n</kml>`;
  return kml;
}

// Client-side KML to GeoJSON converter
function kmlToGeojson(kmlString) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(kmlString, 'text/xml');
  const placemarks = xml.querySelectorAll('Placemark');
  const features = [];

  placemarks.forEach((pm, idx) => {
    const name = pm.querySelector('name')?.textContent || `Placemark ${idx + 1}`;
    const desc = pm.querySelector('description')?.textContent || '';
    
    // Check Point
    const point = pm.querySelector('Point coordinates');
    if (point) {
      const [lon, lat, alt] = point.textContent.trim().split(',').map(Number);
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lon, lat, alt || 0] },
        properties: { name, description: desc }
      });
      return;
    }

    // Check LineString
    const line = pm.querySelector('LineString coordinates');
    if (line) {
      const coords = line.textContent.trim().split(/\s+/).map(str => str.split(',').map(Number));
      features.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: { name, description: desc }
      });
      return;
    }

    // Check Polygon
    const poly = pm.querySelector('Polygon coordinates');
    if (poly) {
      const coords = poly.textContent.trim().split(/\s+/).map(str => str.split(',').map(Number));
      features.push({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [coords] },
        properties: { name, description: desc }
      });
    }
  });

  return {
    type: 'FeatureCollection',
    features
  };
}

// CSV Lat/Long to GeoJSON
function csvToGeojson(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return { type: 'FeatureCollection', features: [] };
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const latIdx = headers.findIndex(h => h.includes('lat') || h === 'y');
  const lonIdx = headers.findIndex(h => h.includes('lon') || h.includes('lng') || h === 'x');
  const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('title') || h.includes('label'));

  const features = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(c => c.trim());
    if (row.length <= Math.max(latIdx, lonIdx)) continue;
    const lat = parseFloat(row[latIdx]);
    const lon = parseFloat(row[lonIdx]);
    if (!isNaN(lat) && !isNaN(lon)) {
      const props = {};
      headers.forEach((h, idx) => {
        props[h] = row[idx] || '';
      });
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lon, lat] },
        properties: props
      });
    }
  }

  return { type: 'FeatureCollection', features };
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export default function GisConverter() {
  const { sharedFile } = useFileContext();
  const [inputText, setInputText] = useState(`{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [-74.006, 40.7128] },
      "properties": { "name": "New York City", "category": "Metro" }
    },
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [-0.1278, 51.5074] },
      "properties": { "name": "London", "category": "Capital" }
    },
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [139.6917, 35.6895] },
      "properties": { "name": "Tokyo", "category": "Megacity" }
    }
  ]
}`);
  const [outputText, setOutputText] = useState('');
  const [conversionType, setConversionType] = useState('geojson-to-kml');
  const [stats, setStats] = useState({ featureCount: 3 });

  useEffect(() => {
    if (sharedFile && (sharedFile.name?.match(/\.(geojson|json|kml|csv)$/i) || sharedFile.type?.includes('json') || sharedFile.type?.includes('kml') || sharedFile.type?.includes('csv'))) {
      loadGisFile(sharedFile);
    }
  }, [sharedFile]);

  const loadGisFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setInputText(content);
        if (file.name.endsWith('.kml')) {
          setConversionType('kml-to-geojson');
        } else if (file.name.endsWith('.csv')) {
          setConversionType('csv-to-geojson');
        } else {
          setConversionType('geojson-to-kml');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConvert = () => {
    try {
      if (conversionType === 'geojson-to-kml') {
        const geojson = JSON.parse(inputText);
        const kml = geojsonToKml(geojson);
        setOutputText(kml);
        setStats({ featureCount: (geojson.features || [geojson]).length });
      } else if (conversionType === 'kml-to-geojson') {
        const geojson = kmlToGeojson(inputText);
        setOutputText(JSON.stringify(geojson, null, 2));
        setStats({ featureCount: geojson.features.length });
      } else if (conversionType === 'csv-to-geojson') {
        const geojson = csvToGeojson(inputText);
        setOutputText(JSON.stringify(geojson, null, 2));
        setStats({ featureCount: geojson.features.length });
      }
    } catch (err) {
      alert('Conversion Error: ' + err.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setInputText(content);
        if (file.name.endsWith('.kml')) {
          setConversionType('kml-to-geojson');
        } else if (file.name.endsWith('.csv')) {
          setConversionType('csv-to-geojson');
        } else {
          setConversionType('geojson-to-kml');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    const ext = conversionType === 'geojson-to-kml' ? 'kml' : 'geojson';
    const mime = ext === 'kml' ? 'application/vnd.google-earth.kml+xml' : 'application/geo+json';
    const blob = new Blob([outputText], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spatial_data.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tool-page" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Dashboard</Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#1e293b' }}>
          GIS & Geospatial Data Converter
        </h1>
        <p style={{ color: '#64748b' }}>
          Convert GeoJSON, Google Earth KML, and CSV coordinates natively in your browser.
        </p>
      </div>

      {/* Control Bar */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={conversionType}
            onChange={(e) => setConversionType(e.target.value)}
            style={{ padding: '0.6rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, color: '#1e293b' }}
          >
            <option value="geojson-to-kml">GeoJSON → KML (Google Earth)</option>
            <option value="kml-to-geojson">KML → GeoJSON</option>
            <option value="csv-to-geojson">CSV Coordinates → GeoJSON</option>
          </select>
          <input
            type="file"
            accept=".geojson,.json,.kml,.csv,.txt"
            onChange={handleFileUpload}
            style={{ fontSize: '0.85rem' }}
          />
        </div>
        <button
          onClick={handleConvert}
          style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
        >
          Run Conversion
        </button>
      </div>

      {/* Dual Column Editor */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>Input Data</span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ width: '100%', height: '380px', fontFamily: 'monospace', fontSize: '0.85rem', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', resize: 'vertical' }}
            placeholder="Paste GeoJSON, KML XML, or CSV rows here..."
          />
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>Output Result</span>
            {outputText && (
              <button
                onClick={handleDownload}
                style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Download size={14} /> Download File
              </button>
            )}
          </div>
          <textarea
            value={outputText}
            readOnly
            style={{ width: '100%', height: '380px', fontFamily: 'monospace', fontSize: '0.85rem', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', resize: 'vertical' }}
            placeholder="Converted output will appear here..."
          />
        </div>
      </div>
    </div>
  );
}
