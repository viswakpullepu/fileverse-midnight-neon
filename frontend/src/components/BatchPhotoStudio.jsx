import React, { useState } from 'react';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import {
  Sparkles, Download, Layers, CheckCircle2,
  RefreshCw, Sliders, Image, X, AlertCircle
} from 'lucide-react';

function formatBytes(bytes) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function BatchPhotoStudio({ files = [], onRemoveFile, onAddMore, onClearAll }) {
  const [activeTab, setActiveTab] = useState('compress'); // 'compress' | 'convert' | 'resize' | 'exif' | 'pdf'
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [resultData, setResultData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Settings
  const [compressQuality, setCompressQuality] = useState(0.72);
  const [targetFormat, setTargetFormat] = useState('image/webp');
  const [resizeScale, setResizeScale] = useState(0.5);

  const totalOriginalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);

  const runBatchProcess = async () => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setErrorMsg('');
    setResultData(null);

    try {
      if (activeTab === 'pdf') {
        setStatusText('Initializing PDF document in browser memory...');
        const pdfDoc = await PDFDocument.create();
        const CONCURRENCY = 4;
        let completedCount = 0;

        // Helper to prepare an image for PDF embedding with downscaling for large camera shots
        const prepareImageForPdf = async (file) => {
          try {
            const bitmap = await createImageBitmap(file);
            const MAX_DIM = 2048; // Max resolution for PDF page to maintain top print quality without memory bloat
            let width = bitmap.width;
            let height = bitmap.height;

            if (width > MAX_DIM || height > MAX_DIM) {
              const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(bitmap, 0, 0, width, height);
            bitmap.close();

            const jpgBlob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.88));
            const jpgBytes = await jpgBlob.arrayBuffer();
            return { jpgBytes, width, height, success: true };
          } catch (err) {
            console.warn(`Failed to process ${file.name} for PDF:`, err);
            return { success: false, fileName: file.name };
          }
        };

        // Process images in concurrent batches of 4
        const preparedImages = [];
        for (let batchStart = 0; batchStart < files.length; batchStart += CONCURRENCY) {
          const batch = files.slice(batchStart, batchStart + CONCURRENCY);
          const batchResults = await Promise.all(batch.map(prepareImageForPdf));
          preparedImages.push(...batchResults);
          completedCount += batch.length;
          setProgress(Math.round((completedCount / files.length) * 80));
          setStatusText(`Prepared ${completedCount} of ${files.length} photos for PDF...`);
        }

        // Embed prepared images into PDF sequentially into pages
        setStatusText('Assembling PDF document pages...');
        for (let i = 0; i < preparedImages.length; i++) {
          const item = preparedImages[i];
          if (!item.success) continue;
          const embeddedImage = await pdfDoc.embedJpg(item.jpgBytes);
          const page = pdfDoc.addPage([item.width, item.height]);
          page.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: item.width,
            height: item.height,
          });
          setProgress(80 + Math.round(((i + 1) / preparedImages.length) * 15));
        }

        setStatusText('Optimizing & finalizing PDF document...');
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);

        setProgress(100);
        setStatusText('PDF Compilation complete!');
        setResultData({
          url,
          filename: `FileVerze-Photo-Batch-${files.length}-pages.pdf`,
          originalSize: totalOriginalSize,
          outputSize: pdfBlob.size,
          type: 'pdf',
        });
      } else {
        const zip = new JSZip();
        let processedBytesTotal = 0;
        let completedCount = 0;

        // Concurrency pool: process up to 4 images simultaneously
        const CONCURRENCY = 4;

        const processOneImage = async (file) => {
          try {
            const bitmap = await createImageBitmap(file);

            let outWidth = bitmap.width;
            let outHeight = bitmap.height;
            let outMime = targetFormat;
            let outQuality = compressQuality;
            let outExt = 'webp';

            if (activeTab === 'compress') {
              outMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
              if (outMime === 'image/png' && compressQuality < 0.7) {
                outMime = 'image/webp';
              }
              outExt = outMime === 'image/webp' ? 'webp' : (outMime === 'image/png' ? 'png' : 'jpg');
            } else if (activeTab === 'convert') {
              outMime = targetFormat;
              outExt = targetFormat === 'image/webp' ? 'webp' : (targetFormat === 'image/jpeg' ? 'jpg' : 'png');
              outQuality = 0.92;
            } else if (activeTab === 'resize') {
              outWidth = Math.max(1, Math.round(bitmap.width * resizeScale));
              outHeight = Math.max(1, Math.round(bitmap.height * resizeScale));
              outMime = file.type || 'image/jpeg';
              outExt = outMime.includes('png') ? 'png' : (outMime.includes('webp') ? 'webp' : 'jpg');
              outQuality = 0.90;
            } else if (activeTab === 'exif') {
              outMime = file.type || 'image/jpeg';
              outExt = outMime.includes('png') ? 'png' : (outMime.includes('webp') ? 'webp' : 'jpg');
              outQuality = 0.95;
            }

            const canvas = document.createElement('canvas');
            canvas.width = outWidth;
            canvas.height = outHeight;
            const ctx = canvas.getContext('2d', { alpha: outMime !== 'image/jpeg', desynchronized: true });

            if (outMime === 'image/jpeg') {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, outWidth, outHeight);
            }

            ctx.drawImage(bitmap, 0, 0, outWidth, outHeight);
            bitmap.close();

            const blob = await new Promise((res) => canvas.toBlob(res, outMime, outQuality));
            return { file, blob, outExt, success: true };
          } catch (err) {
            console.warn(`Error processing ${file.name}:`, err);
            return { file, success: false };
          }
        };

        // Process files in concurrent batches of CONCURRENCY
        for (let batchStart = 0; batchStart < files.length; batchStart += CONCURRENCY) {
          const batch = files.slice(batchStart, batchStart + CONCURRENCY);
          const results = await Promise.all(batch.map(processOneImage));

          for (const { file, blob, outExt, success } of results) {
            if (success && blob) {
              processedBytesTotal += blob.size;
              const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
              zip.file(`${baseName}_edited.${outExt}`, blob);
            }
            completedCount++;
            setProgress(Math.round((completedCount / files.length) * 90));
            setStatusText(`Processed ${completedCount} of ${files.length} photos...`);
          }
        }

        setStatusText('Building compressed ZIP package in client memory...');
        setProgress(95);

        const zipBlob = await zip.generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        });

        const url = URL.createObjectURL(zipBlob);
        setProgress(100);
        setStatusText('Batch processing completed!');
        setResultData({
          url,
          filename: `FileVerze-Batch-Photos-${files.length}.zip`,
          originalSize: totalOriginalSize,
          outputSize: processedBytesTotal,
          zipSize: zipBlob.size,
          type: 'zip',
        });
      }
    } catch (err) {
      console.error('Batch processing error:', err);
      setErrorMsg('An error occurred during batch processing: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '1.5rem',
      marginTop: '1.25rem',
      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
      textAlign: 'left',
    }}>
      {/* 1. Header Bar with Privacy Guarantee */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: '#059669',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Batch Photo Studio ({files.length} Photos)
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Total: {formatBytes(totalOriginalSize)} • 100% In-Browser Memory Sandbox
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onAddMore}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 650,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            + Add More Photos
          </button>
          <button
            onClick={onClearAll}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#dc2626',
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 650,
              cursor: 'pointer'
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* 2. Photo Grid / Strip of Selected Files */}
      <div style={{
        margin: '1rem 0',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        scrollbarWidth: 'thin'
      }}>
        {files.map((file, idx) => (
          <div
            key={`${file.name}_${idx}`}
            style={{
              flex: '0 0 auto',
              width: '120px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.5rem',
              position: 'relative',
              textAlign: 'center'
            }}
          >
            <button
              onClick={() => onRemoveFile(idx)}
              title="Remove photo"
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.65)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              ✕
            </button>
            <div style={{
              width: '100%',
              height: '65px',
              borderRadius: '6px',
              background: '#e2e8f0',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.35rem'
            }}>
              {file.type?.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                />
              ) : (
                <Image size={24} color="#64748b" />
              )}
            </div>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#1e293b',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {file.name}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
              {formatBytes(file.size)}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Action Mode Selector Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
        background: '#f1f5f9',
        padding: '4px',
        borderRadius: '10px',
        marginBottom: '1.25rem'
      }}>
        {[
          { id: 'compress', label: '🗜️ Batch Compress' },
          { id: 'convert', label: '🔄 Batch Convert' },
          { id: 'resize', label: '📏 Batch Resize' },
          { id: 'exif', label: '🛡️ Strip EXIF' },
          { id: 'pdf', label: '📄 Merge to PDF' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setResultData(null);
            }}
            style={{
              flex: '1 1 auto',
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: activeTab === tab.id ? 750 : 600,
              border: 'none',
              background: activeTab === tab.id ? '#0f172a' : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: activeTab === tab.id ? '0 2px 6px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Active Tab Controls Panel */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem'
      }}>
        {activeTab === 'compress' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                Compression Quality Preset:
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#059669' }}>
                {Math.round(compressQuality * 100)}% Quality
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              {[
                { label: '85% (High Quality)', val: 0.85 },
                { label: '72% (Recommended)', val: 0.72 },
                { label: '50% (High Compression)', val: 0.50 },
                { label: '35% (Ultra Small)', val: 0.35 },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => setCompressQuality(p.val)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 650,
                    border: '1px solid ' + (compressQuality === p.val ? '#059669' : '#cbd5e1'),
                    background: compressQuality === p.val ? '#ecfdf5' : '#ffffff',
                    color: compressQuality === p.val ? '#059669' : '#334155',
                    cursor: 'pointer'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'convert' && (
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>
              Select Output Format for all {files.length} Photos:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'image/webp', label: 'WebP', note: 'Modern, 30% lighter' },
                { id: 'image/jpeg', label: 'JPG / JPEG', note: 'Universal compatibility' },
                { id: 'image/png', label: 'PNG', note: 'Lossless quality' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setTargetFormat(fmt.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    border: '1px solid ' + (targetFormat === fmt.id ? '#0f172a' : '#cbd5e1'),
                    background: targetFormat === fmt.id ? '#0f172a' : '#ffffff',
                    color: targetFormat === fmt.id ? '#ffffff' : '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                >
                  <span>{fmt.label}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 500 }}>{fmt.note}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'resize' && (
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>
              Uniform Scaling Ratio:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { label: '75% Scale', val: 0.75 },
                { label: '50% (Half Size)', val: 0.50 },
                { label: '25% (Thumbnail)', val: 0.25 },
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => setResizeScale(s.val)}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: '1px solid ' + (resizeScale === s.val ? '#0f172a' : '#cbd5e1'),
                    background: resizeScale === s.val ? '#0f172a' : '#ffffff',
                    color: resizeScale === s.val ? '#ffffff' : '#334155',
                    cursor: 'pointer'
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'exif' && (
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '0.25rem' }}>
              🛡️ Complete Privacy Scrub:
            </span>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.45 }}>
              Removes embedded GPS latitude/longitude coordinates, camera make and serial number, lens parameters, and date timestamps from all {files.length} photos before sharing.
            </p>
          </div>
        )}

        {activeTab === 'pdf' && (
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '0.25rem' }}>
              📄 Compile into Multi-Page PDF:
            </span>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.45 }}>
              Embeds all {files.length} photos into a single PDF document in client memory (1 photo per page, dimensions preserved).
            </p>
          </div>
        )}
      </div>

      {/* 5. Progress Indicator & Status */}
      {isProcessing && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 650, color: '#334155', marginBottom: '0.35rem' }}>
            <span>{statusText}</span>
            <span>{progress}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
              transition: 'width 0.2s ease'
            }} />
          </div>
        </div>
      )}

      {/* 6. Success Output Card */}
      {resultData && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '12px',
          padding: '1.15rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#10b981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#065f46' }}>
                Batch Edit Completed Successfully!
              </div>
              <div style={{ fontSize: '0.78rem', color: '#047857' }}>
                Original: {formatBytes(resultData.originalSize)} → Output: {formatBytes(resultData.outputSize)}
                {resultData.originalSize > resultData.outputSize && (
                  <span style={{ fontWeight: 700, marginLeft: '6px' }}>
                    (-{(((resultData.originalSize - resultData.outputSize) / resultData.originalSize) * 100).toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          </div>

          <a
            href={resultData.url}
            download={resultData.filename}
            style={{
              background: '#059669',
              color: '#ffffff',
              padding: '0.65rem 1.4rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 750,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
            }}
          >
            <Download size={16} />
            <span>Download {resultData.type === 'pdf' ? 'PDF Document' : `ZIP (${files.length} Photos)`}</span>
          </a>
        </div>
      )}

      {errorMsg && (
        <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 7. Primary Action Button */}
      {!resultData && (
        <button
          onClick={runBatchProcess}
          disabled={isProcessing || files.length === 0}
          style={{
            width: '100%',
            background: isProcessing ? '#94a3b8' : '#0f172a',
            color: '#ffffff',
            border: 'none',
            padding: '0.85rem 1.5rem',
            borderRadius: '10px',
            fontSize: '0.95rem',
            fontWeight: 750,
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
            transition: 'all 0.15s ease'
          }}
        >
          {isProcessing ? (
            <>
              <RefreshCw size={18} className="spin-fast" />
              <span>Processing in In-Browser Memory...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} color="#34d399" />
              <span>
                Run {activeTab === 'compress' ? 'Batch Compression' : activeTab === 'convert' ? 'Batch Conversion' : activeTab === 'resize' ? 'Batch Resize' : activeTab === 'exif' ? 'EXIF Strip' : 'PDF Merge'} on {files.length} Photos
              </span>
            </>
          )}
        </button>
      )}

      <style>{`
        @keyframes spinFast {
          100% { transform: rotate(360deg); }
        }
        .spin-fast {
          animation: spinFast 0.6s linear infinite;
        }
      `}</style>
    </div>
  );
}
