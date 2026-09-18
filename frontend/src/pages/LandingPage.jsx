import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import MagneticButton from '../components/MagneticButton';
import { 
  ShieldCheck, Zap, Lock, Cpu, Sparkles, 
  ArrowRight, Check, CheckCircle, FileText, 
  Layers, Database, Wand2, Box, Globe, ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('privacy');

  return (
    <div className="landing-page" style={{ background: '#F8FAFC', color: '#0F172A', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* 1. HERO SECTION (Phase 2 Masterpiece with 3D Spatial Canvas) */}
      <HeroSection />

      {/* 2. VALUE PROPOSITION: ASYMMETRIC BENTO GRID */}
      <section id="bento-features" style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 1.5rem 4rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.35rem 0.9rem', background: '#EDE9FE', border: '1px solid #A78BFA', borderRadius: '9999px', color: '#0F172A', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
            <Sparkles size={15} color="#7C3AED" />
            <span>Architectural Superiority</span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 850, letterSpacing: '-0.03em', color: '#0F172A', margin: 0 }}>
            Built for extreme privacy and instant speed.
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#475569', maxWidth: '640px', margin: '0.75rem auto 0 auto', lineHeight: 1.6 }}>
            Traditional conversion services send your documents across the open web to unknown servers. FileVerze keeps 100% of bytes inside your computer RAM.
          </p>
        </div>

        {/* Bento Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Bento Card 1: 0-Cloud Privacy Engine (Double Width) */}
          <div style={{
            gridColumn: 'span 2',
            background: '#ffffff',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Lock size={24} color="#7C3AED" />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
                Zero-Server WebAssembly Architecture
              </h3>
              <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.65, maxWidth: '520px' }}>
                Every tool runs compiled WebAssembly (WASM), WebGL, and HTML5 Canvas engines compiled into your browser runtime. Your files never touch a network socket, cloud database, or third-party queue.
              </p>
            </div>

            {/* Visual Micro-Terminal Diagram (06 Midnight Neon Forensics Aesthetic) */}
            <div style={{
              marginTop: '2rem',
              background: '#0B0F19',
              border: '1px solid rgba(34, 211, 238, 0.25)',
              borderRadius: '12px',
              padding: '1.25rem',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '0.82rem',
              color: '#A78BFA'
            }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '0.75rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#7C3AED' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22D3EE' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EDE9FE' }} />
              </div>
              <p style={{ margin: '0 0 4px 0', color: '#EDE9FE' }}>&gt; Initializing Client Memory Sandbox...</p>
              <p style={{ margin: '0 0 4px 0', color: '#22D3EE' }}>&gt; WebAssembly SIMD Vector Pipeline: ACTIVE</p>
              <p style={{ margin: 0, color: '#A78BFA' }}>&gt; Outbound Network Traffic: 0.00 KB (Hardware Isolated)</p>
            </div>
          </div>

          {/* Bento Card 2: 50+ Formats */}
          <div style={{
            background: '#ffffff',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Layers size={24} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
                50+ Specialized Formats
              </h3>
              <p style={{ fontSize: '0.98rem', color: '#475569', lineHeight: 1.65 }}>
                PDFs, DOCX, XLSX, PPTX, 3D STL meshes, GIS GeoJSON/KML, EPUB e-books, typography fonts, and subtitles handled with precision.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '1.5rem' }}>
              {['PDF', 'DOCX', 'XLSX', 'PPTX', 'PNG', 'WEBP', 'STL', 'GeoJSON', 'KML', 'EPUB', 'TTF', 'SRT'].map(tag => (
                <span key={tag} style={{ background: '#EDE9FE', color: '#0F172A', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bento Card 3: Infinite File Sizes */}
          <div style={{
            background: '#ffffff',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFEFF', color: '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
              Unlimited File Sizes
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.65 }}>
              No arbitrary 10MB or 50MB paywalls. Because conversions use your computer's RAM, process 1GB+ files seamlessly.
            </p>
          </div>

          {/* Bento Card 4: 100% Offline PWA */}
          <div style={{
            background: '#ffffff',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Globe size={24} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
              Works 100% Offline
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.65 }}>
              Install FileVerze as a Progressive Web App (PWA) and convert files on planes, trains, or off-grid without an active internet connection.
            </p>
          </div>

          {/* Bento Card 5: Enterprise-Grade Cleanliness */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFEFF', color: '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
              GDPR & HIPAA Compliant
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.65 }}>
              Zero telemetry, zero server-side logs, and zero retention. Ideal for confidential legal, financial, and medical documents.
            </p>
          </div>
        </div>
      </section>

      {/* 4. COMPARISON MATRIX: FILEVERZE VS LEGACY CONVERTERS */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '6rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 850, letterSpacing: '-0.03em', color: '#0F172A', margin: 0 }}>
            Why Professionals Switch to FileVerze
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#475569', maxWidth: '580px', margin: '0.75rem auto 0 auto', lineHeight: 1.6 }}>
            A transparent breakdown comparing modern browser-native processing against legacy cloud services.
          </p>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid rgba(15, 23, 42, 0.08)', borderRadius: '16px', overflowX: 'auto', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#EDE9FE', borderBottom: '1px solid rgba(15, 23, 42, 0.10)' }}>
                <th style={{ padding: '1.25rem 1.5rem', color: '#0F172A', fontSize: '0.9rem', fontWeight: 700 }}>Feature Comparison</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#0F172A', fontSize: '1rem', fontWeight: 850 }}>🌐 FileVerze (In-Browser)</th>
                <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 700 }}>☁️ Legacy Cloud Converters</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Privacy & Security', fileverze: '100% In-Browser (0 bytes sent to internet)', legacy: 'Uploaded to 3rd-party remote servers' },
                { feature: 'Processing Speed', fileverze: 'Instant CPU/RAM computation', legacy: 'Queue wait times + slow network upload' },
                { feature: 'File Size Limits', fileverze: 'Unlimited (uses device hardware)', legacy: '10MB–50MB paywall caps' },
                { feature: 'Pricing', fileverze: '100% Free Forever', legacy: '$12 – $20 / month subscriptions' },
                { feature: 'Offline Support', fileverze: 'Full PWA Offline Mode', legacy: 'Completely broken offline' },
                { feature: 'Account Required', fileverze: 'None (Zero friction)', legacy: 'Mandatory email registrations' }
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: idx < 5 ? '1px solid rgba(15, 23, 42, 0.06)' : 'none' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>{row.feature}</td>
                  <td style={{ padding: '1.25rem 1.5rem', color: '#0F172A', fontWeight: 700, fontSize: '0.95rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={18} color="#06B6D4" />
                      <span>{row.fileverze}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', color: '#475569', fontSize: '0.9rem' }}>{row.legacy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. MAGNETIC CALL TO ACTION (LAUNCHPAD) */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 6rem auto', padding: '0 1.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
          borderRadius: '24px',
          padding: '4.5rem 2rem',
          textAlign: 'center',
          color: '#ffffff',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.35)',
          border: '1px solid rgba(124, 58, 237, 0.3)'
        }}>
          <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.25rem)', fontWeight: 850, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Ready to convert files with absolute privacy?
          </h2>
          <p style={{ fontSize: '1.15rem', color: '#EDE9FE', maxWidth: '600px', margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>
            No installation, no accounts, and no data leaks. Launch the studio to access all 50+ tools in seconds.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <MagneticButton
              to="/app"
              variant="secondary"
              icon={ArrowRight}
              style={{
                background: '#7C3AED',
                color: '#ffffff',
                padding: '1.05rem 2.5rem',
                border: 'none',
                boxShadow: '0 4px 16px rgba(124, 58, 237, 0.45)'
              }}
            >
              Launch Studio & Browse All Tools
            </MagneticButton>

            <MagneticButton
              to="/faq"
              variant="glass"
              style={{
                background: 'rgba(237, 233, 254, 0.12)',
                color: '#ffffff',
                border: '1px solid #A78BFA',
                padding: '1.05rem 2.2rem'
              }}
            >
              Read Security FAQ
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* 6. MINIMALIST FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(15, 23, 42, 0.08)', background: '#ffffff', padding: '4rem 1.5rem 3rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.5px', color: '#0F172A' }}>
              File<span style={{ color: '#7C3AED' }}>Verze</span>
            </span>
            <p style={{ color: '#475569', fontSize: '0.88rem', margin: '0.4rem 0 0 0' }}>
              100% In-Browser File Utility & Conversion Powerhouse • Midnight Neon Edition.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.9rem', fontWeight: 600 }}>
            <Link to="/all_tools" style={{ color: '#0F172A', textDecoration: 'none' }}>All Tools</Link>
            <Link to="/faq" style={{ color: '#0F172A', textDecoration: 'none' }}>FAQ & Knowledge Base</Link>
            <a href="https://github.com/viswakpullepu/fileverse-midnight-neon" target="_blank" rel="noopener noreferrer" style={{ color: '#0F172A', textDecoration: 'none' }}>GitHub</a>
            <a href="https://vishwak.tech" target="_blank" rel="noopener noreferrer" style={{ color: '#0F172A', textDecoration: 'none' }}>Developer</a>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '2rem auto 0 auto', borderTop: '1px solid rgba(15, 23, 42, 0.08)', paddingTop: '1.5rem', textAlign: 'center', color: '#64748B', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} FileVerze (Midnight Neon Edition). Zero server uploads. Built with React, WebAssembly & Three.js.
        </div>
      </footer>

    </div>
  );
}
