import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFileContext } from '../../context/FileContext';
import { FileText, Download, Clock, ArrowRightLeft, Sparkles, Plus, Trash2 } from 'lucide-react';

// Helper to convert time string to milliseconds
function timeToMs(timeStr) {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().replace(',', '.');
  const parts = cleaned.split(':');
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]) || 0;
    const mins = parseFloat(parts[1]) || 0;
    const secs = parseFloat(parts[2]) || 0;
    return Math.round((hours * 3600 + mins * 60 + secs) * 1000);
  } else if (parts.length === 2) {
    const mins = parseFloat(parts[0]) || 0;
    const secs = parseFloat(parts[1]) || 0;
    return Math.round((mins * 60 + secs) * 1000);
  }
  return 0;
}

// Helper to convert milliseconds to SRT format (hh:mm:ss,ms)
function msToSrtTime(ms) {
  const safeMs = Math.max(0, ms);
  const totalSecs = Math.floor(safeMs / 1000);
  const milliseconds = safeMs % 1000;
  const seconds = totalSecs % 60;
  const minutes = Math.floor(totalSecs / 60) % 60;
  const hours = Math.floor(totalSecs / 3600);

  const pad = (n, width = 2) => String(n).padStart(width, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(milliseconds, 3)}`;
}

// Helper to convert milliseconds to VTT format (hh:mm:ss.ms)
function msToVttTime(ms) {
  return msToSrtTime(ms).replace(',', '.');
}

// Parse SRT content
function parseSrt(content) {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.trim().split(/\n\s*\n/);
  const entries = [];

  blocks.forEach((block, idx) => {
    const lines = block.split('\n');
    if (lines.length >= 2) {
      let timeLineIdx = 0;
      if (!lines[0].includes('-->') && lines.length > 1) {
        timeLineIdx = 1;
      }
      const timeLine = lines[timeLineIdx];
      if (timeLine && timeLine.includes('-->')) {
        const [startStr, endStr] = timeLine.split('-->').map(s => s.trim());
        const text = lines.slice(timeLineIdx + 1).join('\n');
        entries.push({
          id: idx + 1,
          startMs: timeToMs(startStr),
          endMs: timeToMs(endStr),
          text: text.trim()
        });
      }
    }
  });
  return entries;
}

// Parse VTT content
function parseVtt(content) {
  const cleanContent = content.replace(/^WEBVTT.*?\n/i, '');
  return parseSrt(cleanContent);
}

export default function SubtitleConverter() {
  const { sharedFile } = useFileContext();
  const [subtitles, setSubtitles] = useState([]);
  const [fileName, setFileName] = useState('');
  const [targetFormat, setTargetFormat] = useState('vtt');
  const [offsetMs, setOffsetMs] = useState(0);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (sharedFile && (sharedFile.name?.match(/\.(srt|vtt|ass|txt)$/i) || sharedFile.type?.includes('subrip') || sharedFile.type?.includes('vtt'))) {
      loadFile(sharedFile);
    }
  }, [sharedFile]);

  const loadFile = (file) => {
    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setInputText(text);
        if (file.name.endsWith('.vtt') || text.startsWith('WEBVTT')) {
          setSubtitles(parseVtt(text));
        } else {
          setSubtitles(parseSrt(text));
        }
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadFile(file);
  };

  const handleApplyOffset = () => {
    if (offsetMs === 0) return;
    setSubtitles(prev => prev.map(sub => ({
      ...sub,
      startMs: Math.max(0, sub.startMs + offsetMs),
      endMs: Math.max(0, sub.endMs + offsetMs)
    })));
  };

  const generateOutput = (format) => {
    if (format === 'vtt') {
      let output = 'WEBVTT\n\n';
      subtitles.forEach((s, idx) => {
        output += `${idx + 1}\n${msToVttTime(s.startMs)} --> ${msToVttTime(s.endMs)}\n${s.text}\n\n`;
      });
      return output;
    } else if (format === 'srt') {
      let output = '';
      subtitles.forEach((s, idx) => {
        output += `${idx + 1}\n${msToSrtTime(s.startMs)} --> ${msToSrtTime(s.endMs)}\n${s.text}\n\n`;
      });
      return output;
    } else if (format === 'txt') {
      return subtitles.map(s => s.text).join('\n\n');
    } else if (format === 'ass') {
      let output = `[Script Info]\nTitle: Converted by FileVerse\nScriptType: v4.00+\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
      subtitles.forEach(s => {
        const formatAssTime = (ms) => {
          const srt = msToSrtTime(ms).slice(1, 10);
          return srt.replace(',', '.');
        };
        output += `Dialogue: 0,${formatAssTime(s.startMs)},${formatAssTime(s.endMs)},Default,,0,0,0,,${s.text.replace(/\n/g, '\\N')}\n`;
      });
      return output;
    }
    return '';
  };

  const handleDownload = () => {
    const text = generateOutput(targetFormat);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName || 'subtitles'}.${targetFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tool-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Dashboard</Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#1e293b' }}>
          Subtitle & Caption Converter
        </h1>
        <p style={{ color: '#64748b' }}>
          Convert SRT, VTT, ASS, and TXT subtitles, adjust timing sync offsets, and edit cues right in your browser.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Upload & Controls */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>Upload or Paste Subtitles</h3>
          <input
            type="file"
            accept=".srt,.vtt,.ass,.txt"
            onChange={handleFileUpload}
            style={{ width: '100%', padding: '0.75rem', border: '1px dashed #cbd5e1', borderRadius: '8px', marginBottom: '1rem', background: '#f8fafc' }}
          />

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
              Time Shift / Sync Offset (± ms)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                value={offsetMs}
                onChange={(e) => setOffsetMs(parseInt(e.target.value) || 0)}
                placeholder="e.g. 1500 or -500"
                style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
              <button
                onClick={handleApplyOffset}
                style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Apply Offset
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Use +1000 to delay subtitles by 1 sec, or -1000 to advance them.</span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
              Target Export Format
            </label>
            <select
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '1.25rem' }}
            >
              <option value="vtt">WebVTT (.vtt) - Best for HTML5 Video & Web</option>
              <option value="srt">SubRip (.srt) - Universal media player format</option>
              <option value="ass">Advanced SubStation Alpha (.ass)</option>
              <option value="txt">Plain Text (.txt) - Strip all timestamps</option>
            </select>

            <button
              onClick={handleDownload}
              disabled={subtitles.length === 0}
              style={{
                width: '100%',
                background: subtitles.length > 0 ? '#10b981' : '#94a3b8',
                color: '#fff',
                border: 'none',
                padding: '0.85rem',
                borderRadius: '8px',
                cursor: subtitles.length > 0 ? 'pointer' : 'not-allowed',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Download size={18} /> Download {targetFormat.toUpperCase()} ({subtitles.length} cues)
            </button>
          </div>
        </div>

        {/* Live Cue Editor */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', maxHeight: '500px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>
              Live Cues Editor ({subtitles.length})
            </h3>
            {subtitles.length > 0 && (
              <button
                onClick={() => setSubtitles([])}
                style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Clear All
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {subtitles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                <Clock size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <p>Upload a .srt or .vtt file to view and edit timestamps.</p>
              </div>
            ) : (
              subtitles.map((sub, i) => (
                <div key={i} style={{ border: '1px solid #f1f5f9', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem' }}>
                    <span>#{i + 1}</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0284c7' }}>
                      {msToVttTime(sub.startMs)} → {msToVttTime(sub.endMs)}
                    </span>
                    <button
                      onClick={() => setSubtitles(prev => prev.filter((_, idx) => idx !== i))}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <textarea
                    value={sub.text}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSubtitles(prev => prev.map((s, idx) => idx === i ? { ...s, text: val } : s));
                    }}
                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.4rem', fontSize: '0.85rem', resize: 'vertical' }}
                    rows={2}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
