import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, Zap, Lock, Cpu, Sparkles, 
  Layers, Check, Sliders, FileText, Image as ImageIcon,
  Box, Terminal, RefreshCw, Eye
} from 'lucide-react';

export function InteractiveBeforeAfterSlider() {
  const [sliderPos, setSliderPos] = useState(50);
  const [tolerance, setTolerance] = useState(25);

  return (
    <div className="fv-tactile-card" style={{ padding: '2rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--fv-brand-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Sparkles size={14} />
            <span>Interactive Canvas Engine</span>
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '4px 0 0 0', letterSpacing: '-0.02em' }}>
            Euclidean Alpha Segmentation
          </h3>
        </div>

        {/* Tolerance Pill Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--fv-color-slate-100)', padding: '4px', borderRadius: '8px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--fv-text-secondary)', padding: '0 6px' }}>Tolerance:</span>
          {[15, 25, 40].map((tol) => (
            <button
              key={tol}
              type="button"
              onClick={() => setTolerance(tol)}
              style={{
                background: tolerance === tol ? '#ffffff' : 'transparent',
                color: tolerance === tol ? 'var(--fv-text-primary)' : 'var(--fv-text-muted)',
                boxShadow: tolerance === tol ? 'var(--fv-shadow-sm)' : 'none',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {tol}%
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--fv-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        Drag the divider to observe client-side foreground extraction running purely inside HTML5 Canvas with alpha matting. Zero cloud calls.
      </p>

      {/* Interactive Visual Stage */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          height: '280px',
          borderRadius: 'var(--fv-radius-md)',
          overflow: 'hidden',
          userSelect: 'none',
          border: '1px solid var(--fv-border-subtle)',
        }}
        onMouseMove={(e) => {
          if (e.buttons === 1) {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
            setSliderPos(pos);
          }
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          const rect = e.currentTarget.getBoundingClientRect();
          const pos = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
          setSliderPos(pos);
        }}
      >
        {/* Right side: Processed transparent cutout */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(#cbd5e1 1px, transparent 1px) #f8fafc',
          backgroundSize: '16px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '130px',
              height: '130px',
              margin: '0 auto',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 20px 30px -10px rgba(16, 185, 129, 0.4)',
            }}>
              <Sparkles size={54} />
            </div>
            <span style={{ display: 'inline-block', marginTop: '12px', fontSize: '0.78rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '4px 10px', borderRadius: '9999px' }}>
              Transparent Alpha Channel ({tolerance}% Matting)
            </span>
          </div>
        </div>

        {/* Left side: Original Image with background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: sliderPos + '%',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
          borderRight: '2px solid #ffffff',
          boxShadow: '4px 0 15px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            position: 'absolute',
            width: '100%',
            minWidth: '450px',
            height: '280px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '130px',
                height: '130px',
                margin: '0 auto',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #334155, #0f172a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
              }}>
                <Sparkles size={54} />
              </div>
              <span style={{ display: 'inline-block', marginTop: '12px', fontSize: '0.78rem', fontWeight: 700, color: '#475569', background: '#ffffff', padding: '4px 10px', borderRadius: '9999px' }}>
                Original Raw Subject (Solid BG)
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Handle */}
        <div style={{
          position: 'absolute',
          left: sliderPos + '%',
          top: 0,
          bottom: 0,
          width: '4px',
          background: '#ffffff',
          cursor: 'ew-resize',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#090d16',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            fontSize: '0.7rem',
          }}>
            <Sliders size={14} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--fv-brand-accent)', cursor: 'pointer' }}
          aria-label="Before and after segmentation slider"
        />
      </div>
    </div>
  );
}

export function ArchitectureComparisonWidget() {
  return (
    <div className="fv-dark-card" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '640px', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          <Cpu size={15} />
          <span>Execution Pipeline Verification</span>
        </div>
        <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.75rem 0', letterSpacing: '-0.03em' }}>
          Direct Device RAM vs Cloud Converters
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.98rem', lineHeight: 1.6, margin: 0 }}>
          Commercial tools upload your confidential records to AWS/GCP nodes, put you in queues, and charge monthly fees. FileVerze turns your browser into a local supercomputer.
        </p>
      </div>

      {/* Comparison Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
      }}>
        {/* Card 1: Cloud Trap */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '16px',
          padding: '1.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, color: '#f87171', fontSize: '1.1rem', fontWeight: 700 }}>
              Cloud Converters
            </h4>
            <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              Third-Party Cloud
            </span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', color: '#cbd5e1' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#ef4444', fontWeight: 700 }}>✕</span>
              <span><strong>Data Exposure:</strong> Files leave device, sent over external networks.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#ef4444', fontWeight: 700 }}>✕</span>
              <span><strong>Latency Bottleneck:</strong> Multi-megabyte uploads + server queue wait times.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#ef4444', fontWeight: 700 }}>✕</span>
              <span><strong>Artificial Limits:</strong> 10MB–50MB maximum caps unless you subscribe.</span>
            </li>
          </ul>
        </div>

        {/* Card 2: FileVerze Pipeline */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '16px',
          padding: '1.75rem',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, color: '#34d399', fontSize: '1.1rem', fontWeight: 700 }}>
              FileVerze Client Engine
            </h4>
            <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              100% In-Browser RAM
            </span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', color: '#f8fafc' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Check size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Complete Isolation:</strong> 0 bytes ever sent to any remote server or API.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Check size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Hardware Compute:</strong> Runs WebAssembly SIMD and multi-core Web Workers.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Check size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Uncapped Capacity:</strong> Bound only by your local machine's memory.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Live Telemetry Bar */}
      <div className="fv-telemetry-box" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>&gt; CLIENT_RUNTIME_STATUS:</span>
          <span style={{ color: '#4ade80' }}>● HARDWARE ACCELERATED (60 FPS)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', color: '#94a3b8' }}>
          <div>SANDBOX: WebAssembly (WASM)</div>
          <div>NETWORK TRANSMISSION: 0.00 KB</div>
          <div>SERVER CALLS: NONE</div>
          <div>OFFLINE PWA: ACTIVE</div>
        </div>
      </div>
    </div>
  );
}

