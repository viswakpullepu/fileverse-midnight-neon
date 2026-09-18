import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ColorConverter() {
  const [color, setColor] = useState('#e5322d'); // Default fileverze Red
  const [rgb, setRgb] = useState('');
  const [hsl, setHsl] = useState('');

  // Conversion utilities
  const hexToRgb = (hex) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return { r, g, b };
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  useEffect(() => {
    try {
      const rgbVal = hexToRgb(color);
      setRgb(`rgb(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b})`);
      const hslVal = rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b);
      setHsl(`hsl(${hslVal.h}, ${hslVal.s}%, ${hslVal.l}%)`);
    } catch (e) {
      // Ignore invalid hex
    }
  }, [color]);

  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied ${text} to clipboard!`);
  };

  return (
    <div className="tool-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1>Color Picker & Converter</h1>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Pick a color to instantly convert it between HEX, RGB, and HSL formats.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ flex: '1 1 300px', padding: '2rem', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Choose a Color</h2>
          <input 
            type="color" 
            value={color} 
            onChange={handleColorChange}
            style={{ width: '150px', height: '150px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent' }}
          />
          <div style={{ marginTop: '1.5rem', width: '100%' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', color: '#666', marginBottom: '0.3rem' }}>HEX Value</label>
            <input 
              type="text" 
              value={color}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9A-F]{0,6}$/i.test(val)) {
                  setColor(val);
                }
              }}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'monospace', fontSize: '1.1rem', textTransform: 'uppercase' }}
            />
          </div>
        </div>

        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1.5rem', backgroundColor: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem' }}>HEX</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold' }}>{color.toUpperCase()}</span>
              <button className="btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => copyToClipboard(color.toUpperCase())}>Copy</button>
            </div>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem' }}>RGB</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold' }}>{rgb}</span>
              <button className="btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => copyToClipboard(rgb)}>Copy</button>
            </div>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem' }}>HSL</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold' }}>{hsl}</span>
              <button className="btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => copyToClipboard(hsl)}>Copy</button>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '3rem' }}>
        <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
