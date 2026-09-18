/**
 * platformDetector.js
 * Hardware, OS, and WebKit Memory Constraint Heuristics.
 * Safeguards iOS Safari from Out-Of-Memory crashes.
 */

/**
 * Detects if the current client is running iOS Safari, iPadOS, or WebKit.
 * @returns {boolean}
 */
export function isIOSWebKit() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isIPadOS = navigator.maxTouchPoints > 1 && /Macintosh/.test(ua);
  const isWebKit = /WebKit/.test(ua) && !/Chrome|CriOS/.test(ua);

  return isIOS || isIPadOS || (isWebKit && 'ontouchend' in document);
}

/**
 * Checks if Cross-Origin Isolation is active and SharedArrayBuffer is available.
 * @returns {boolean}
 */
export function isCrossOriginIsolated() {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.crossOriginIsolated && 
    typeof SharedArrayBuffer !== 'undefined'
  );
}

/**
 * Estimates safe file size limit in megabytes based on client platform.
 * @param {'video' | 'pdf' | 'image' | 'general'} type
 * @returns {{ maxSafeSizeMB: number, isRestricted: boolean, warning: string | null }}
 */
export function getSafeMemoryLimits(type = 'general') {
  const isMobile = isIOSWebKit();

  if (isMobile) {
    switch (type) {
      case 'video':
        return {
          maxSafeSizeMB: 50,
          isRestricted: true,
          warning: 'iOS Safari memory limit detected. Videos above 50MB may cause browser tab refresh due to WebKit memory caps.'
        };
      case 'pdf':
        return {
          maxSafeSizeMB: 100,
          isRestricted: true,
          warning: 'Large PDF detected on mobile. Pages will be lazily loaded to preserve memory.'
        };
      default:
        return {
          maxSafeSizeMB: 75,
          isRestricted: true,
          warning: null
        };
    }
  }

  // Desktop limits
  return {
    maxSafeSizeMB: type === 'video' ? 1000 : 2000,
    isRestricted: false,
    warning: null
  };
}
