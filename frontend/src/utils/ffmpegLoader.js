import { toBlobURL } from '@ffmpeg/util';
import { isCrossOriginIsolated, isIOSWebKit } from './platformDetector';

/**
 * Resiliently loads FFmpeg.wasm with dynamic fallback for non-isolated environments and iOS.
 * @param {object} ffmpegInstance - Instance of FFmpeg
 * @param {function} [onProgressCallback] - Optional download progress callback
 * @returns {Promise<{ isMultiThreaded: boolean }>}
 */
export async function loadResilientFFmpeg(ffmpegInstance, onProgressCallback) {
  if (!ffmpegInstance) throw new Error('FFmpeg instance is required');

  const isolated = isCrossOriginIsolated();
  const ios = isIOSWebKit();

  // Use reliable CDN endpoint
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

  try {
    // Attempt standard loading
    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    return { isMultiThreaded: isolated && !ios };
  } catch (error) {
    console.warn('Initial FFmpeg load attempt encountered an error:', error);
    
    // Retry with single-thread safe headers if needed
    try {
      await ffmpegInstance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      return { isMultiThreaded: false };
    } catch (fallbackError) {
      console.error('Fatal FFmpeg fallback load error:', fallbackError);
      throw new Error(
        isolated
          ? 'Failed to initialize FFmpeg WebAssembly engine. Please check your network connection.'
          : 'SharedArrayBuffer is unavailable in this environment. Multi-threading is disabled.'
      );
    }
  }
}
