/**
 * Cyber Forensics Utilities
 * 100% Client-Side in-browser binary analysis, hashing, and metadata extraction.
 * No data leaves the user's browser.
 */

// Pure JS MD5 implementation (RFC 1321) for educational and legacy identification purposes
export function md5(buffer) {
  const bytes = new Uint8Array(buffer);
  function safeAdd(x, y) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRotateLeft(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q, a, b, x, s, t) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a, b, c, d, x, s, t) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a, b, c, d, x, s, t) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a, b, c, d, x, s, t) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a, b, c, d, x, s, t) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const words = [];
  const n = bytes.length;
  for (let i = 0; i < n; i++) {
    words[i >> 2] |= bytes[i] << ((i % 4) * 8);
  }
  words[n >> 2] |= 0x80 << ((n % 4) * 8);
  words[(((n + 8) >> 6) << 4) + 14] = n * 8;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < words.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = md5ff(a, b, c, d, words[i + 0] || 0, 7, -680876936);
    d = md5ff(d, a, b, c, words[i + 1] || 0, 12, -389564586);
    c = md5ff(c, d, a, b, words[i + 2] || 0, 17, 606105819);
    b = md5ff(b, c, d, a, words[i + 3] || 0, 22, -1044525330);
    a = md5ff(a, b, c, d, words[i + 4] || 0, 7, -176418897);
    d = md5ff(d, a, b, c, words[i + 5] || 0, 12, 1200080426);
    c = md5ff(c, d, a, b, words[i + 6] || 0, 17, -1473231341);
    b = md5ff(b, c, d, a, words[i + 7] || 0, 22, -45705983);
    a = md5ff(a, b, c, d, words[i + 8] || 0, 7, 1770035416);
    d = md5ff(d, a, b, c, words[i + 9] || 0, 12, -1958414417);
    c = md5ff(c, d, a, b, words[i + 10] || 0, 17, -42063);
    b = md5ff(b, c, d, a, words[i + 11] || 0, 22, -1990404162);
    a = md5ff(a, b, c, d, words[i + 12] || 0, 7, 1804603682);
    d = md5ff(d, a, b, c, words[i + 13] || 0, 12, -40341101);
    c = md5ff(c, d, a, b, words[i + 14] || 0, 17, -1502002290);
    b = md5ff(b, c, d, a, words[i + 15] || 0, 22, 1236535329);

    a = md5gg(a, b, c, d, words[i + 1] || 0, 5, -165796510);
    d = md5gg(d, a, b, c, words[i + 6] || 0, 9, -1069501632);
    c = md5gg(c, d, a, b, words[i + 11] || 0, 14, 643717713);
    b = md5gg(b, c, d, a, words[i + 0] || 0, 20, -373897302);
    a = md5gg(a, b, c, d, words[i + 5] || 0, 5, -701558691);
    d = md5gg(d, a, b, c, words[i + 10] || 0, 9, 38016083);
    c = md5gg(c, d, a, b, words[i + 15] || 0, 14, -660478335);
    b = md5gg(b, c, d, a, words[i + 4] || 0, 20, -405537848);
    a = md5gg(a, b, c, d, words[i + 9] || 0, 5, 568446438);
    d = md5gg(d, a, b, c, words[i + 14] || 0, 9, -1019803690);
    c = md5gg(c, d, a, b, words[i + 3] || 0, 14, -187363961);
    b = md5gg(b, c, d, a, words[i + 8] || 0, 20, 1163531501);
    a = md5gg(a, b, c, d, words[i + 13] || 0, 5, -1444681467);
    d = md5gg(d, a, b, c, words[i + 2] || 0, 9, -51403784);
    c = md5gg(c, d, a, b, words[i + 7] || 0, 14, 1735328473);
    b = md5gg(b, c, d, a, words[i + 12] || 0, 20, -1926607734);

    a = md5hh(a, b, c, d, words[i + 5] || 0, 4, -378558);
    d = md5hh(d, a, b, c, words[i + 8] || 0, 11, -2022574463);
    c = md5hh(c, d, a, b, words[i + 11] || 0, 16, 1839030562);
    b = md5hh(b, c, d, a, words[i + 14] || 0, 23, -35309556);
    a = md5hh(a, b, c, d, words[i + 1] || 0, 4, -1530992060);
    d = md5hh(d, a, b, c, words[i + 4] || 0, 11, 1272893353);
    c = md5hh(c, d, a, b, words[i + 7] || 0, 16, -155497632);
    b = md5hh(b, c, d, a, words[i + 10] || 0, 23, -1094730640);
    a = md5hh(a, b, c, d, words[i + 13] || 0, 4, 681279174);
    d = md5hh(d, a, b, c, words[i + 0] || 0, 11, -358537222);
    c = md5hh(c, d, a, b, words[i + 3] || 0, 16, -722521979);
    b = md5hh(b, c, d, a, words[i + 6] || 0, 23, 76029189);
    a = md5hh(a, b, c, d, words[i + 9] || 0, 4, -640364487);
    d = md5hh(d, a, b, c, words[i + 12] || 0, 11, -421815835);
    c = md5hh(c, d, a, b, words[i + 15] || 0, 16, 530742520);
    b = md5hh(b, c, d, a, words[i + 2] || 0, 23, -995338651);

    a = md5ii(a, b, c, d, words[i + 0] || 0, 6, -198630844);
    d = md5ii(d, a, b, c, words[i + 7] || 0, 10, 1126891415);
    c = md5ii(c, d, a, b, words[i + 14] || 0, 15, -1416354905);
    b = md5ii(b, c, d, a, words[i + 5] || 0, 21, -57434055);
    a = md5ii(a, b, c, d, words[i + 12] || 0, 6, 1700485571);
    d = md5ii(d, a, b, c, words[i + 3] || 0, 10, -1894986606);
    c = md5ii(c, d, a, b, words[i + 10] || 0, 15, -1051523);
    b = md5ii(b, c, d, a, words[i + 1] || 0, 21, -2054922799);
    a = md5ii(a, b, c, d, words[i + 8] || 0, 6, 1873313359);
    d = md5ii(d, a, b, c, words[i + 15] || 0, 10, -30611744);
    c = md5ii(c, d, a, b, words[i + 6] || 0, 15, -1560198380);
    b = md5ii(b, c, d, a, words[i + 13] || 0, 21, 1309151649);
    a = md5ii(a, b, c, d, words[i + 4] || 0, 6, -145523070);
    d = md5ii(d, a, b, c, words[i + 11] || 0, 10, -1120210379);
    c = md5ii(c, d, a, b, words[i + 2] || 0, 15, 718787259);
    b = md5ii(b, c, d, a, words[i + 9] || 0, 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  const hexChars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 4; i++) {
    const val = [a, b, c, d][i];
    for (let j = 0; j < 4; j++) {
      const byte = (val >>> (j * 8)) & 0xff;
      result += hexChars.charAt((byte >>> 4) & 0x0f) + hexChars.charAt(byte & 0x0f);
    }
  }
  return result;
}

/**
 * Compute cryptographic hash algorithms simultaneously using Web Crypto & pure MD5
 */
export async function computeFileHashes(arrayBuffer) {
  // Web Crypto SHA algorithms
  const [sha1Buffer, sha256Buffer, sha512Buffer] = await Promise.all([
    crypto.subtle.digest('SHA-1', arrayBuffer),
    crypto.subtle.digest('SHA-256', arrayBuffer),
    crypto.subtle.digest('SHA-512', arrayBuffer),
  ]);

  const bufToHex = (buf) =>
    Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  return {
    md5: md5(arrayBuffer),
    sha1: bufToHex(sha1Buffer),
    sha256: bufToHex(sha256Buffer),
    sha512: bufToHex(sha512Buffer),
  };
}

/**
 * Calculate Shannon Entropy: H(X) = -sum(p * log2(p))
 * Max theoretical entropy is 8.0 bits per byte.
 */
export function computeShannonEntropy(uint8Array) {
  if (!uint8Array || uint8Array.length === 0) return 0;

  const frequencies = new Uint32Array(256);
  const total = uint8Array.length;

  for (let i = 0; i < total; i++) {
    frequencies[uint8Array[i]]++;
  }

  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    if (frequencies[i] > 0) {
      const p = frequencies[i] / total;
      entropy -= p * Math.log2(p);
    }
  }

  return parseFloat(entropy.toFixed(4));
}

/**
 * Comprehensive File Magic Bytes / Signature Table
 */
export const MAGIC_SIGNATURES = [
  { magic: [0xFF, 0xD8, 0xFF], ext: ['jpg', 'jpeg'], mime: 'image/jpeg', name: 'JPEG Image' },
  { magic: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], ext: ['png'], mime: 'image/png', name: 'Portable Network Graphics (PNG)' },
  { magic: [0x47, 0x49, 0x46, 0x38], ext: ['gif'], mime: 'image/gif', name: 'Graphics Interchange Format (GIF)' },
  { magic: [0x52, 0x49, 0x46, 0x46], ext: ['webp', 'wav', 'avi'], mime: 'image/webp | audio/wav', name: 'Resource Interchange File Format (RIFF / WebP / WAV / AVI)' },
  { magic: [0x25, 0x50, 0x44, 0x46], ext: ['pdf'], mime: 'application/pdf', name: 'Adobe Portable Document Format (PDF)' },
  { magic: [0x50, 0x4B, 0x03, 0x04], ext: ['zip', 'docx', 'xlsx', 'pptx', 'apk', 'jar', 'epub'], mime: 'application/zip | office-openxml', name: 'ZIP Archive / Office OpenXML Document' },
  { magic: [0x50, 0x4B, 0x05, 0x06], ext: ['zip'], mime: 'application/zip', name: 'Empty ZIP Archive' },
  { magic: [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C], ext: ['7z'], mime: 'application/x-7z-compressed', name: '7-Zip Archive' },
  { magic: [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07], ext: ['rar'], mime: 'application/x-rar-compressed', name: 'RAR Archive v4' },
  { magic: [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x01, 0x00], ext: ['rar'], mime: 'application/x-rar-compressed', name: 'RAR Archive v5' },
  { magic: [0x1F, 0x8B], ext: ['gz', 'tar.gz'], mime: 'application/gzip', name: 'GZIP Compressed File' },
  { magic: [0x42, 0x5A, 0x68], ext: ['bz2'], mime: 'application/x-bzip2', name: 'BZIP2 Compressed File' },
  { magic: [0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00], ext: ['xz'], mime: 'application/x-xz', name: 'XZ Compression' },
  { magic: [0x4D, 0x5A], ext: ['exe', 'dll', 'sys', 'scr'], mime: 'application/x-dosexec', name: 'Windows PE Executable / DLL (MZ Header)' },
  { magic: [0x7F, 0x45, 0x4C, 0x46], ext: ['elf', 'bin', 'so'], mime: 'application/x-executable', name: 'Linux Executable and Linkable Format (ELF)' },
  { magic: [0xCF, 0xFA, 0xED, 0xFE], ext: ['macho', 'dylib'], mime: 'application/x-mach-binary', name: 'macOS Mach-O 64-bit Binary' },
  { magic: [0xCA, 0xFE, 0xBA, 0xBE], ext: ['class', 'macho'], mime: 'application/java-vm', name: 'Java Bytecode / Mach-O Fat Binary' },
  { magic: [0x53, 0x51, 0x4C, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6F, 0x72, 0x6D, 0x61, 0x74, 0x20, 0x33, 0x00], ext: ['sqlite', 'db', 'sqlite3'], mime: 'application/x-sqlite3', name: 'SQLite 3 Database File' },
  { magic: [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], ext: ['mp4'], mime: 'video/mp4', name: 'ISO Base Media / MP4 Video' },
  { magic: [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70], ext: ['mp4', 'm4v'], mime: 'video/mp4', name: 'M4V / MP4 Video' },
  { magic: [0x1A, 0x45, 0xDF, 0xA3], ext: ['mkv', 'webm'], mime: 'video/webm', name: 'Matroska Media (MKV / WebM)' },
  { magic: [0x49, 0x44, 0x33], ext: ['mp3'], mime: 'audio/mpeg', name: 'MP3 Audio (ID3v2 Container)' },
  { magic: [0xFF, 0xFB], ext: ['mp3'], mime: 'audio/mpeg', name: 'MPEG-1 Layer 3 Audio Stream' },
  { magic: [0x4F, 0x67, 0x67, 0x53], ext: ['ogg', 'oga', 'ogv'], mime: 'audio/ogg', name: 'Ogg Vorbis / Multimedia Container' },
  { magic: [0x42, 0x4D], ext: ['bmp'], mime: 'image/bmp', name: 'Windows Bitmap Image (BMP)' },
  { magic: [0x00, 0x00, 0x01, 0x00], ext: ['ico'], mime: 'image/x-icon', name: 'Windows Icon File (ICO)' },
  { magic: [0x77, 0x4F, 0x46, 0x46], ext: ['woff'], mime: 'font/woff', name: 'Web Open Font Format 1.0 (WOFF)' },
  { magic: [0x77, 0x4F, 0x46, 0x32], ext: ['woff2'], mime: 'font/woff2', name: 'Web Open Font Format 2.0 (WOFF2)' },
  { magic: [0x00, 0x01, 0x00, 0x00], ext: ['ttf'], mime: 'font/ttf', name: 'TrueType Font (TTF)' },
  { magic: [0x4F, 0x54, 0x54, 0x4F], ext: ['otf'], mime: 'font/otf', name: 'OpenType Font (OTF)' },
  { magic: [0x7B, 0x5C, 0x72, 0x74, 0x66], ext: ['rtf'], mime: 'application/rtf', name: 'Rich Text Format (RTF)' },
  { magic: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], ext: ['doc', 'xls', 'ppt', 'msg'], mime: 'application/x-ole-storage', name: 'Microsoft Compound OLE File (Legacy Office DOC/XLS/PPT)' },
];

/**
 * Identify magic bytes and detect file masquerading (Anti-Forensics / Extension Spoofing)
 */
export function identifyMagicBytes(uint8Array, declaredFileName = '') {
  const declaredExt = declaredFileName.split('.').pop()?.toLowerCase() || '';
  const first16 = Array.from(uint8Array.slice(0, 16));
  const hexSignature = first16.map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
  const asciiSignature = first16.map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '·')).join('');

  let detectedMatch = null;

  for (const item of MAGIC_SIGNATURES) {
    let matches = true;
    for (let i = 0; i < item.magic.length; i++) {
      if (uint8Array[i] !== item.magic[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      detectedMatch = item;
      break;
    }
  }

  // Check for plain text (JSON / XML / Scripts / HTML)
  let isPlainText = false;
  if (!detectedMatch) {
    let printableCount = 0;
    const sampleSize = Math.min(uint8Array.length, 256);
    for (let i = 0; i < sampleSize; i++) {
      const byte = uint8Array[i];
      if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) {
        printableCount++;
      }
    }
    if (sampleSize > 0 && printableCount / sampleSize > 0.95) {
      isPlainText = true;
      const textSample = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array.slice(0, 80)).trim();
      detectedMatch = {
        magic: [],
        ext: ['txt', 'json', 'csv', 'html', 'xml', 'md', 'js', 'py', 'sh', 'bat', 'ps1'],
        mime: 'text/plain',
        name: textSample.startsWith('{') || textSample.startsWith('[')
          ? 'JSON Structured Text'
          : textSample.startsWith('<?xml') || textSample.startsWith('<')
          ? 'XML / HTML Markup'
          : 'ASCII / UTF-8 Plain Text Document'
      };
    }
  }

  // Detect Extension Spoofing / File Masquerading (Malware tactic)
  let isSpoofed = false;
  let spoofWarning = null;

  if (detectedMatch && declaredExt) {
    const isDeclaredMatching = detectedMatch.ext.includes(declaredExt);
    if (!isDeclaredMatching) {
      isSpoofed = true;
      spoofWarning = `⚠️ CRITICAL EXTENSION MISMATCH: File is named with extension .${declaredExt.toUpperCase()}, but binary signature identifies it as ${detectedMatch.name} (typical extensions: ${detectedMatch.ext.join(', ')}). This technique is frequently used in phishing and malware obfuscation.`;
    }
  }

  return {
    hexSignature,
    asciiSignature,
    detectedMatch: detectedMatch || { name: 'Unknown / Custom Binary Format', ext: [], mime: 'application/octet-stream' },
    isSpoofed,
    spoofWarning,
    isPlainText
  };
}

/**
 * Image Deep Forensic Parser (EXIF, IPTC, GPS Geolocation, Camera Software)
 */
export function extractExifMetadata(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const metadata = {
    cameraMake: null,
    cameraModel: null,
    software: null,
    dateTimeOriginal: null,
    dateTimeDigitized: null,
    exposureTime: null,
    fNumber: null,
    isoSpeed: null,
    focalLength: null,
    lensModel: null,
    orientation: null,
    gps: null,
    rawTags: [],
  };

  if (view.byteLength < 16) return metadata;

  // Verify JPEG SOI marker (0xFFD8)
  if (view.getUint16(0, false) !== 0xFFD8) {
    return metadata;
  }

  let offset = 2;
  while (offset < view.byteLength) {
    if (view.getUint8(offset) !== 0xFF) break;
    const marker = view.getUint8(offset + 1);

    // APP1 Marker (0xFFE1) contains EXIF
    if (marker === 0xE1) {
      const length = view.getUint16(offset + 2, false);
      const exifHeader = String.fromCharCode(
        view.getUint8(offset + 4),
        view.getUint8(offset + 5),
        view.getUint8(offset + 6),
        view.getUint8(offset + 7)
      );

      if (exifHeader === 'Exif') {
        parseTiffHeader(view, offset + 10, metadata);
      }
      break;
    } else {
      if (marker === 0xDA || marker === 0xD9) break; // SOS or EOI
      offset += 2 + view.getUint16(offset + 2, false);
    }
  }

  return metadata;
}

function parseTiffHeader(view, tiffOffset, metadata) {
  if (tiffOffset + 8 >= view.byteLength) return;

  const byteOrder = view.getUint16(tiffOffset, false);
  const littleEndian = byteOrder === 0x4949; // 'II' = Little Endian, 'MM' = Big Endian

  if (byteOrder !== 0x4949 && byteOrder !== 0x4D4D) return;

  const firstIFDOffset = view.getUint32(tiffOffset + 4, littleEndian);
  if (tiffOffset + firstIFDOffset >= view.byteLength) return;

  parseIFD(view, tiffOffset, tiffOffset + firstIFDOffset, littleEndian, metadata, 'IFD0');
}

function parseIFD(view, tiffOffset, ifdOffset, littleEndian, metadata, ifdName) {
  if (ifdOffset + 2 >= view.byteLength) return;

  const numEntries = view.getUint16(ifdOffset, littleEndian);
  let curOffset = ifdOffset + 2;

  let exifSubIFDOffset = null;
  let gpsSubIFDOffset = null;

  for (let i = 0; i < numEntries; i++) {
    if (curOffset + 12 > view.byteLength) break;
    const tag = view.getUint16(curOffset, littleEndian);
    const type = view.getUint16(curOffset + 2, littleEndian);
    const count = view.getUint32(curOffset + 4, littleEndian);
    const valueOffset = curOffset + 8;

    const readVal = () => readTagValue(view, tiffOffset, valueOffset, type, count, littleEndian);

    // Common Tag mappings
    if (tag === 0x010F) metadata.cameraMake = readVal();
    else if (tag === 0x0110) metadata.cameraModel = readVal();
    else if (tag === 0x0131) metadata.software = readVal();
    else if (tag === 0x0132) metadata.dateTime = readVal();
    else if (tag === 0x0112) metadata.orientation = readVal();
    else if (tag === 0x8769) exifSubIFDOffset = view.getUint32(valueOffset, littleEndian);
    else if (tag === 0x8825) gpsSubIFDOffset = view.getUint32(valueOffset, littleEndian);
    else if (tag === 0x9003) metadata.dateTimeOriginal = readVal();
    else if (tag === 0x9004) metadata.dateTimeDigitized = readVal();
    else if (tag === 0x829A) metadata.exposureTime = readVal();
    else if (tag === 0x829D) metadata.fNumber = readVal();
    else if (tag === 0x8827) metadata.isoSpeed = readVal();
    else if (tag === 0x920A) metadata.focalLength = readVal();
    else if (tag === 0xA434) metadata.lensModel = readVal();

    metadata.rawTags.push({
      tagId: '0x' + tag.toString(16).toUpperCase().padStart(4, '0'),
      ifd: ifdName,
      type,
      count,
      value: String(readVal() ?? '')
    });

    curOffset += 12;
  }

  // Parse Exif SubIFD
  if (exifSubIFDOffset && tiffOffset + exifSubIFDOffset < view.byteLength) {
    parseIFD(view, tiffOffset, tiffOffset + exifSubIFDOffset, littleEndian, metadata, 'ExifSubIFD');
  }

  // Parse GPS SubIFD
  if (gpsSubIFDOffset && tiffOffset + gpsSubIFDOffset < view.byteLength) {
    parseGPSIFD(view, tiffOffset, tiffOffset + gpsSubIFDOffset, littleEndian, metadata);
  }
}

function parseGPSIFD(view, tiffOffset, gpsOffset, littleEndian, metadata) {
  if (gpsOffset + 2 >= view.byteLength) return;

  const numEntries = view.getUint16(gpsOffset, littleEndian);
  let curOffset = gpsOffset + 2;

  let latRef = null;
  let lat = null;
  let lonRef = null;
  let lon = null;
  let alt = null;

  for (let i = 0; i < numEntries; i++) {
    if (curOffset + 12 > view.byteLength) break;
    const tag = view.getUint16(curOffset, littleEndian);
    const type = view.getUint16(curOffset + 2, littleEndian);
    const count = view.getUint32(curOffset + 4, littleEndian);
    const valueOffset = curOffset + 8;

    const readVal = () => readTagValue(view, tiffOffset, valueOffset, type, count, littleEndian);

    if (tag === 0x0001) latRef = readVal();
    else if (tag === 0x0002) lat = readVal();
    else if (tag === 0x0003) lonRef = readVal();
    else if (tag === 0x0004) lon = readVal();
    else if (tag === 0x0006) alt = readVal();

    curOffset += 12;
  }

  if (lat && lon && Array.isArray(lat) && Array.isArray(lon)) {
    const latDecimal = (lat[0] + lat[1] / 60 + lat[2] / 3600) * (latRef === 'S' ? -1 : 1);
    const lonDecimal = (lon[0] + lon[1] / 60 + lon[2] / 3600) * (lonRef === 'W' ? -1 : 1);

    metadata.gps = {
      latitude: latDecimal.toFixed(6),
      longitude: lonDecimal.toFixed(6),
      altitude: alt ? (typeof alt === 'number' ? alt.toFixed(1) + ' m' : String(alt)) : 'Unknown',
      latDMS: `${lat[0]}° ${lat[1]}' ${lat[2]?.toFixed?.(2) ?? lat[2]}" ${latRef || 'N'}`,
      lonDMS: `${lon[0]}° ${lon[1]}' ${lon[2]?.toFixed?.(2) ?? lon[2]}" ${lonRef || 'E'}`,
      mapsUrl: `https://www.google.com/maps?q=${latDecimal},${lonDecimal}`,
      osmUrl: `https://www.openstreetmap.org/?mlat=${latDecimal}&mlon=${lonDecimal}#map=16/${latDecimal}/${lonDecimal}`
    };
  }
}

function readTagValue(view, tiffOffset, valueOffset, type, count, littleEndian) {
  try {
    let actualOffset = valueOffset;
    const byteSize = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8][type] || 1;
    const totalBytes = byteSize * count;

    if (totalBytes > 4) {
      const relOffset = view.getUint32(valueOffset, littleEndian);
      actualOffset = tiffOffset + relOffset;
    }

    if (actualOffset + totalBytes > view.byteLength) return null;

    if (type === 2) {
      // ASCII String
      let str = '';
      for (let i = 0; i < count - 1; i++) {
        const charCode = view.getUint8(actualOffset + i);
        if (charCode === 0) break;
        str += String.fromCharCode(charCode);
      }
      return str.trim();
    } else if (type === 3) {
      // SHORT (uint16)
      if (count === 1) return view.getUint16(actualOffset, littleEndian);
      const arr = [];
      for (let i = 0; i < count; i++) arr.push(view.getUint16(actualOffset + i * 2, littleEndian));
      return arr;
    } else if (type === 4) {
      // LONG (uint32)
      if (count === 1) return view.getUint32(actualOffset, littleEndian);
      const arr = [];
      for (let i = 0; i < count; i++) arr.push(view.getUint32(actualOffset + i * 4, littleEndian));
      return arr;
    } else if (type === 5) {
      // RATIONAL (numerator/denominator)
      const parseRational = (off) => {
        const num = view.getUint32(off, littleEndian);
        const den = view.getUint32(off + 4, littleEndian);
        return den !== 0 ? num / den : 0;
      };
      if (count === 1) return parseRational(actualOffset);
      const arr = [];
      for (let i = 0; i < count; i++) arr.push(parseRational(actualOffset + i * 8));
      return arr;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * PDF Forensic Inspector (Version, creation tools, and weaponized object detection)
 */
export function extractPdfForensics(arrayBuffer) {
  const text = new TextDecoder('latin1').decode(arrayBuffer);
  const forensics = {
    isPdf: text.startsWith('%PDF-'),
    version: null,
    isLinearized: false,
    suspiciousStreams: [],
    metadata: {},
    pageCountEstimate: (text.match(/\/Type\s*\/Page\b/g) || []).length,
    objectCount: (text.match(/\b\d+\s+0\s+obj\b/g) || []).length
  };

  if (!forensics.isPdf) return forensics;

  // Extract version (e.g. %PDF-1.7)
  const versionMatch = text.match(/%PDF-(\d+\.\d+)/);
  if (versionMatch) forensics.version = versionMatch[1];

  // Linearization check
  if (text.includes('/Linearized')) forensics.isLinearized = true;

  // Suspicious streams commonly used in exploits / malware delivery
  const dangerousTokens = [
    { token: '/JavaScript', desc: 'Embedded JavaScript Engine Hook' },
    { token: '/JS', desc: 'Direct JavaScript Execution Payload' },
    { token: '/Launch', desc: 'Process Launch Directive (Remote Command Execution vector)' },
    { token: '/OpenAction', desc: 'Automated Action triggered on document open' },
    { token: '/AA', desc: 'Additional Actions (Triggered by mouse movements or scrolling)' },
    { token: '/EmbeddedFiles', desc: 'Embedded binary payloads attached inside document' },
    { token: '/SubmitForm', desc: 'Automated Form Submission / Data Exfiltration directive' },
    { token: '/RichMedia', desc: 'Flash / 3D Multimedia payload vector' },
  ];

  dangerousTokens.forEach(({ token, desc }) => {
    const regex = new RegExp(token, 'g');
    const matches = (text.match(regex) || []).length;
    if (matches > 0) {
      forensics.suspiciousStreams.push({
        token,
        count: matches,
        desc,
        severity: token === '/Launch' || token === '/JavaScript' || token === '/JS' ? 'HIGH' : 'MEDIUM'
      });
    }
  });

  // Extract Metadata dictionary (Creator, Producer, Title, Author)
  const extractPdfField = (key) => {
    const reg = new RegExp(`\\/${key}\\s*\\(([^)]+)\\)`);
    const match = text.match(reg);
    return match ? match[1] : null;
  };

  forensics.metadata.creator = extractPdfField('Creator');
  forensics.metadata.producer = extractPdfField('Producer');
  forensics.metadata.title = extractPdfField('Title');
  forensics.metadata.author = extractPdfField('Author');
  forensics.metadata.creationDate = extractPdfField('CreationDate');
  forensics.metadata.modDate = extractPdfField('ModDate');

  return forensics;
}

/**
 * Strings Hunter (Carves printable ASCII & Unicode strings >= minLength)
 * Categorizes URLs, IPs, system paths, and suspicious command keywords.
 */
export function extractPrintableStrings(uint8Array, minLen = 4, maxCount = 200) {
  const strings = [];
  let currentAscii = '';
  const len = Math.min(uint8Array.length, 512 * 1024); // Scan up to 512KB for UI responsiveness

  for (let i = 0; i < len; i++) {
    const b = uint8Array[i];
    if (b >= 32 && b <= 126) {
      currentAscii += String.fromCharCode(b);
    } else {
      if (currentAscii.length >= minLen) {
        strings.push(currentAscii);
        if (strings.length >= maxCount) break;
      }
      currentAscii = '';
    }
  }

  if (currentAscii.length >= minLen && strings.length < maxCount) {
    strings.push(currentAscii);
  }

  // Categorize strings for security triage
  const urlRegex = /https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]+/i;
  const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
  const pathRegex = /(?:[A-Za-z]:\\[^/:*?"<>|\r\n]+)|(?:\/(?:bin|etc|tmp|var|usr|home|Windows|Users|System32)\/[^\s]+)/i;
  const suspiciousRegex = /\b(powershell|cmd\.exe|wscript|cscript|certutil|rundll32|regsvr32|base64|eval|exec|shell|token|password|api_key|admin)\b/i;

  return strings.map((str) => {
    let category = 'GENERAL';
    if (urlRegex.test(str)) category = 'URL';
    else if (ipRegex.test(str)) category = 'IP';
    else if (pathRegex.test(str)) category = 'PATH';
    else if (suspiciousRegex.test(str)) category = 'SUSPICIOUS';

    return { text: str, category };
  });
}

/**
 * Format raw bytes into 16-byte aligned Hex dump
 */
export function formatHexDump(uint8Array, maxBytes = 512, offsetStart = 0) {
  const slice = uint8Array.slice(offsetStart, offsetStart + maxBytes);
  const rows = [];

  for (let i = 0; i < slice.length; i += 16) {
    const chunk = slice.slice(i, i + 16);
    const offsetHex = (offsetStart + i).toString(16).padStart(8, '0');

    let hexPart = '';
    let asciiPart = '';

    for (let j = 0; j < 16; j++) {
      if (j < chunk.length) {
        const byte = chunk[j];
        hexPart += byte.toString(16).padStart(2, '0').toUpperCase() + ' ';
        asciiPart += byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '·';
      } else {
        hexPart += '   ';
      }
      if (j === 7) hexPart += ' ';
    }

    rows.push({
      offset: offsetHex,
      hex: hexPart.trim(),
      ascii: asciiPart
    });
  }

  return rows;
}
