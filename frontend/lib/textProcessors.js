export function countTextStats(text) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const sentences = trimmed ? (trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).filter((s) => s.trim()).length : 0;
  const paragraphs = trimmed ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  const speakingTime = Math.max(1, Math.ceil(words / 130));

  return { words, characters, charactersNoSpaces, sentences, paragraphs, readingTime, speakingTime };
}

export function convertCase(text, mode) {
  switch (mode) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'title':
      return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    case 'sentence':
      return text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
    case 'toggle':
      return text
        .split('')
        .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
        .join('');
    default:
      return text;
  }
}

export function sortLines(text, mode) {
  const lines = text.split('\n');
  if (mode === 'alpha') return [...lines].sort((a, b) => a.localeCompare(b)).join('\n');
  if (mode === 'reverse') return [...lines].reverse().join('\n');
  if (mode === 'length') return [...lines].sort((a, b) => a.length - b.length).join('\n');
  return text;
}

export function removeDuplicateLines(text) {
  const seen = new Set();
  return text
    .split('\n')
    .filter((line) => {
      const key = line.trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join('\n');
}

export function removeLineBreaks(text) {
  return text.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
}

export function removeWhitespace(text) {
  return text.replace(/\s+/g, '');
}

export function reverseText(text) {
  return text.split('').reverse().join('');
}

export function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function removeEmptyLines(text) {
  return text
    .split('\n')
    .filter((line) => line.trim())
    .join('\n');
}

export function generateRandomText(wordCount = 50) {
  const words = [
    'cloud', 'design', 'modern', 'utility', 'stream', 'digital', 'creative', 'workflow',
    'simple', 'fast', 'secure', 'browser', 'online', 'product', 'content', 'mobile',
    'editor', 'format', 'convert', 'analyze', 'generate', 'optimize', 'publish', 'share'
  ];
  const result = [];
  for (let i = 0; i < wordCount; i += 1) {
    result.push(words[Math.floor(Math.random() * words.length)]);
  }
  return result.join(' ');
}

export function generateLoremIpsum(paragraphs = 3) {
  const sentence =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
  return Array.from({ length: paragraphs }, () => `${sentence} Ut enim ad minim veniam.`).join('\n\n');
}

export function keywordDensity(text) {
  const words = text.toLowerCase().match(/\b[a-z0-9']+\b/g) || [];
  const total = words.length || 1;
  const freq = {};
  words.forEach((w) => {
    if (w.length < 3) return;
    freq[w] = (freq[w] || 0) + 1;
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count, density: ((count / total) * 100).toFixed(2) }));
}

export function readabilityScore(text) {
  const sentences = Math.max(1, (text.match(/[.!?]+/g) || []).length);
  const words = Math.max(1, (text.match(/\b\w+\b/g) || []).length);
  const syllables = Math.max(1, (text.match(/[aeiouy]+/gi) || []).length);
  const score = Math.round(206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words));
  let level = 'Difficult';
  if (score >= 90) level = 'Very Easy';
  else if (score >= 80) level = 'Easy';
  else if (score >= 70) level = 'Fairly Easy';
  else if (score >= 60) level = 'Standard';
  else if (score >= 50) level = 'Fairly Difficult';
  return { score, level, words, sentences };
}

export function compareTexts(a, b) {
  const linesA = a.split('\n');
  const linesB = b.split('\n');
  const max = Math.max(linesA.length, linesB.length);
  const diff = [];
  for (let i = 0; i < max; i += 1) {
    const left = linesA[i] ?? '';
    const right = linesB[i] ?? '';
    diff.push({ line: i + 1, left, right, changed: left !== right });
  }
  const similarity = Math.round(
    (diff.filter((d) => !d.changed).length / Math.max(1, max)) * 100
  );
  return { diff, similarity };
}

export function findAndReplace(text, find, replace, useRegex = false) {
  if (!find) return text;
  if (useRegex) {
    try {
      return text.replace(new RegExp(find, 'g'), replace);
    } catch {
      return text;
    }
  }
  return text.split(find).join(replace);
}

export function markdownToHtml(md) {
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/\n/gim, '<br />');
}

export function textToHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br />');
}

export function encodeUrl(text) {
  return encodeURIComponent(text);
}

export function decodeUrl(text) {
  try {
    return decodeURIComponent(text);
  } catch {
    return 'Invalid URL-encoded string.';
  }
}

export function encodeBase64(text) {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    return '';
  }
}

export function decodeBase64(text) {
  try {
    return decodeURIComponent(escape(atob(text)));
  } catch {
    return 'Invalid Base64 string.';
  }
}

export function minifyJson(text) {
  return JSON.stringify(JSON.parse(text));
}

export function formatJson(text) {
  return JSON.stringify(JSON.parse(text), null, 2);
}

export function formatXml(text) {
  const pad = '  ';
  let formatted = '';
  let indent = 0;
  text.replace(/>\s*</g, '><').split(/(?=<)|(?<=>)/).forEach((node) => {
    if (!node.trim()) return;
    if (node.match(/^<\/\w/)) indent -= 1;
    formatted += `${pad.repeat(Math.max(0, indent))}${node}\n`;
    if (node.match(/^<\w[^>]*[^/]>$/)) indent += 1;
  });
  return formatted.trim();
}

export function minifyXml(text) {
  return text.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
}

export function csvToJson(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    return headers.reduce((obj, header, i) => ({ ...obj, [header]: values[i] ?? '' }), {});
  });
  return JSON.stringify(rows, null, 2);
}

export function jsonToCsv(json) {
  const data = JSON.parse(json);
  if (!Array.isArray(data) || !data.length) return '';
  const headers = Object.keys(data[0]);
  const lines = [headers.join(',')];
  data.forEach((row) => {
    lines.push(headers.map((h) => JSON.stringify(row[h] ?? '')).join(','));
  });
  return lines.join('\n');
}

export async function encryptText(text, password) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text));
  const payload = {
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv)),
    data: btoa(String.fromCharCode(...new Uint8Array(cipher)))
  };
  return btoa(JSON.stringify(payload));
}

export async function decryptText(encoded, password) {
  const payload = JSON.parse(atob(encoded));
  const salt = Uint8Array.from(atob(payload.salt), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(payload.iv), (c) => c.charCodeAt(0));
  const data = Uint8Array.from(atob(payload.data), (c) => c.charCodeAt(0));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(plain);
}

export function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const FANCY_MAP = {
  a: '𝓪', b: '𝓫', c: '𝓬', d: '𝓭', e: '𝓮', f: '𝓯', g: '𝓰', h: '𝓱', i: '𝓲', j: '𝓳',
  k: '𝓴', l: '𝓵', m: '𝓶', n: '𝓷', o: '𝓸', p: '𝓹', q: '𝓺', r: '𝓻', s: '𝓼', t: '𝓽',
  u: '𝓾', v: '𝓿', w: '𝔀', x: '𝔁', y: '𝔂', z: '𝔃'
};

export function fancyText(text) {
  return text
    .split('')
    .map((c) => FANCY_MAP[c.toLowerCase()] || c)
    .join('');
}

export function capitalizeText(text) {
  return text.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function mergeTexts(texts, separator = '\n') {
  return texts.filter(Boolean).join(separator);
}

export function splitText(text, delimiter) {
  return text.split(delimiter || '\n').join('\n---\n');
}

export function extractEmails(text) {
  const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  return [...new Set(matches)].join('\n');
}

export function extractUrls(text) {
  const matches = text.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/g) || [];
  return [...new Set(matches)].join('\n');
}

export function generateHashtags(text, count = 10) {
  const words = (text.match(/\b[a-z]{4,}\b/gi) || []).map((w) => w.toLowerCase());
  const unique = [...new Set(words)].slice(0, count);
  return unique.map((w) => `#${w}`).join(' ');
}

export function generatePassword(length = 16, useSymbols = true) {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  const symbols = '!@#$%^&*()-_=+';
  let chars = lower + upper + nums;
  if (useSymbols) chars += symbols;
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => chars[n % chars.length]).join('');
}
