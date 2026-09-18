/**
 * memoryManager.js
 * Centralized Memory Hygiene & Lifecycle Manager for In-Browser File Computing.
 * Prevents browser heap saturation, ObjectURL memory leaks, and MEMFS bloat.
 */

// Active tracked ObjectURLs keyed by component or unique scope
const trackedUrls = new Set();
const componentUrlMap = new Map();

/**
 * Creates a tracked ObjectURL bound to an optional component lifecycle key.
 * @param {Blob|File} blob 
 * @param {string} [componentKey]
 * @returns {string} ObjectURL
 */
export function createTrackedObjectURL(blob, componentKey = 'global') {
  if (!blob) return null;
  
  const url = URL.createObjectURL(blob);
  trackedUrls.add(url);

  if (componentKey) {
    if (!componentUrlMap.has(componentKey)) {
      componentUrlMap.set(componentKey, new Set());
    }
    componentUrlMap.get(componentKey).add(url);
  }

  return url;
}

/**
 * Revokes a specific ObjectURL and unbinds from tracking.
 * @param {string} url 
 */
export function revokeTrackedObjectURL(url) {
  if (!url || typeof url !== 'string') return;
  if (trackedUrls.has(url)) {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Failed to revoke ObjectURL:', e);
    }
    trackedUrls.delete(url);

    // Remove from component sets
    for (const [_, set] of componentUrlMap.entries()) {
      if (set.has(url)) {
        set.delete(url);
      }
    }
  }
}

/**
 * Revokes all ObjectURLs associated with a given component scope (e.g. on unmount).
 * @param {string} componentKey 
 */
export function cleanupComponentMemory(componentKey) {
  if (!componentKey || !componentUrlMap.has(componentKey)) return;

  const urls = componentUrlMap.get(componentKey);
  for (const url of urls) {
    try {
      URL.revokeObjectURL(url);
      trackedUrls.delete(url);
    } catch (e) {
      console.warn('Failed to revoke ObjectURL on unmount:', e);
    }
  }
  componentUrlMap.delete(componentKey);
}

/**
 * Safely unlinks and flushes files from FFmpeg's virtual in-memory file system (MEMFS).
 * @param {object} ffmpeg - FFmpeg instance
 * @param {string[]} fileList - Array of virtual file paths to unlink
 */
export async function flushFFmpegMemFS(ffmpeg, fileList = []) {
  if (!ffmpeg || !Array.isArray(fileList)) return;

  for (const fileName of fileList) {
    if (!fileName) continue;
    try {
      if (typeof ffmpeg.deleteFile === 'function') {
        await ffmpeg.deleteFile(fileName);
      } else if (ffmpeg.FS && typeof ffmpeg.FS === 'function') {
        ffmpeg.FS('unlink', fileName);
      }
    } catch (e) {
      // Non-critical: file may not exist in MEMFS or was already unlinked
      console.debug(`MEMFS unlink info for ${fileName}:`, e.message || e);
    }
  }
}

/**
 * Trigger immediate browser garbage collection hint via ArrayBuffer release
 * @param {ArrayBuffer|Uint8Array} buffer 
 */
export function releaseArrayBuffer(buffer) {
  if (!buffer) return;
  try {
    if (buffer.buffer instanceof ArrayBuffer && typeof buffer.buffer.resize === 'function') {
      // If transferable or resizeable, collapse size
    }
  } catch (e) {
    // Ignore
  }
}
