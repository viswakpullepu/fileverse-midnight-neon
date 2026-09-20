import { toBlobURL } from '@ffmpeg/util';
import { isCrossOriginIsolated, isIOSWebKit } from './platformDetector';

const CACHE_NAME = 'fileverze-ffmpeg-wasm-v1';
const BASE_URL_ST = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
const BASE_URL_MT = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/umd';

/**
 * Fetch a URL with Cache API fallback — downloads once, then serves instantly from cache.
 * @param {string} url
 * @param {string} mimeType
 * @returns {Promise<string>} Blob URL
 */
async function cachedBlobURL(url, mimeType) {
  // Try browser Cache API first (instant on repeat visits)
  if ('caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(url);
      if (cached) {
        const blob = await cached.blob();
        return URL.createObjectURL(blob);
      }
      // Not cached — fetch, store, and return
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response.clone());
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
    } catch (cacheErr) {
      console.warn('[FFmpeg Cache] Cache API unavailable, falling back to toBlobURL:', cacheErr);
    }
  }
  // Fallback: standard toBlobURL (no caching)
  return toBlobURL(url, mimeType);
}

/**
 * Resiliently loads FFmpeg.wasm with:
 * 1. Cache API persistence — only downloads 32MB WASM once, instant on repeat visits
 * 2. Multi-threaded core (core-mt) when SharedArrayBuffer is available — 2-8x faster encoding
 * 3. Single-thread fallback for iOS/Safari and non-isolated environments
 * @param {object} ffmpegInstance - Instance of FFmpeg
 * @param {function} [onProgressCallback] - Optional download progress callback
 * @returns {Promise<{ isMultiThreaded: boolean }>}
 */
export async function loadResilientFFmpeg(ffmpegInstance, onProgressCallback) {
  if (!ffmpegInstance) throw new Error('FFmpeg instance is required');

  const isolated = isCrossOriginIsolated();
  const ios = isIOSWebKit();
  const useMultiThread = isolated && !ios;

  const baseURL = useMultiThread ? BASE_URL_MT : BASE_URL_ST;

  try {
    const coreURL = await cachedBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
    const wasmURL = await cachedBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');

    const loadOptions = { coreURL, wasmURL };
    if (useMultiThread) {
      // Multi-thread build requires the worker script too
      loadOptions.workerURL = await cachedBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript');
    }

    await ffmpegInstance.load(loadOptions);
    return { isMultiThreaded: useMultiThread };
  } catch (error) {
    console.warn('FFmpeg multi-thread load failed, retrying single-thread:', error);

    // Fallback to single-thread core
    try {
      const coreURL = await cachedBlobURL(`${BASE_URL_ST}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await cachedBlobURL(`${BASE_URL_ST}/ffmpeg-core.wasm`, 'application/wasm');
      await ffmpegInstance.load({ coreURL, wasmURL });
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
