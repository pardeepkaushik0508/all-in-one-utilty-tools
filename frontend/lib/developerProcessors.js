/* Client-side developer tool processors */

export function validateJson(text) {
  JSON.parse(text);
  return 'Valid JSON';
}

export function jsonToXml(obj) {
  const data = typeof obj === 'string' ? JSON.parse(obj) : obj;
  const toXml = (key, value) => {
    if (Array.isArray(value)) {
      return value.map((item) => toXml(key, item)).join('');
    }
    if (value && typeof value === 'object') {
      return `<${key}>${Object.entries(value).map(([k, v]) => toXml(k, v)).join('')}</${key}>`;
    }
    return `<${key}>${String(value ?? '')}</${key}>`;
  };
  if (typeof data === 'object' && !Array.isArray(data)) {
    return `<?xml version="1.0" encoding="UTF-8"?>\n${Object.entries(data).map(([k, v]) => toXml(k, v)).join('\n')}`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n${toXml('root', data)}`;
}

export function xmlToJson(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  if (doc.querySelector('parsererror')) throw new Error('Invalid XML');
  const nodeToObj = (node) => {
    if (node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) {
      return node.textContent?.trim() ?? '';
    }
    const obj = {};
    [...node.children].forEach((child) => {
      const val = nodeToObj(child);
      if (obj[child.tagName]) {
        obj[child.tagName] = Array.isArray(obj[child.tagName]) ? [...obj[child.tagName], val] : [obj[child.tagName], val];
      } else {
        obj[child.tagName] = val;
      }
    });
    return obj;
  };
  return JSON.stringify(nodeToObj(doc.documentElement), null, 2);
}

export function formatHtml(html) {
  let formatted = '';
  let indent = 0;
  const tokens = html.replace(/>\s*</g, '><').split(/(<[^>]+>)/g).filter(Boolean);
  tokens.forEach((token) => {
    if (token.startsWith('</')) indent = Math.max(0, indent - 1);
    if (token.startsWith('<') && !token.startsWith('</') && !token.endsWith('/>')) {
      formatted += `${'  '.repeat(indent)}${token}\n`;
      if (!token.includes('/>')) indent += 1;
    } else if (token.startsWith('</')) {
      formatted += `${'  '.repeat(indent)}${token}\n`;
    } else if (token.trim()) {
      formatted += `${'  '.repeat(indent)}${token.trim()}\n`;
    }
  });
  return formatted.trim();
}

export function formatCss(css) {
  return css
    .replace(/\{/g, ' {\n  ')
    .replace(/\}/g, '\n}\n')
    .replace(/;/g, ';\n  ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

export function formatJs(js) {
  return js
    .replace(/;/g, ';\n')
    .replace(/\{/g, ' {\n')
    .replace(/\}/g, '\n}\n')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

export function formatSql(sql) {
  return sql
    .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|GROUP BY|ORDER BY|HAVING|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM)\b/gi, '\n$1')
    .replace(/,/g, ',\n  ')
    .trim();
}

export function decodeJwt(token) {
  const parts = token.split('.');
  if (parts.length < 2) throw new Error('Invalid JWT format');
  const decode = (part) => JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
  return { header: decode(parts[0]), payload: decode(parts[1]) };
}

export function generateJwt(header, payload, secret) {
  const encode = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const headerPart = encode(typeof header === 'string' ? JSON.parse(header) : header);
  const payloadPart = encode(typeof payload === 'string' ? JSON.parse(payload) : payload);
  const data = `${headerPart}.${payloadPart}`;
  // HS256-like demo signature (browser-safe placeholder using btoa)
  const signature = btoa(`${data}.${secret}`).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${data}.${signature}`;
}

export function testRegex(pattern, flags, text) {
  const regex = new RegExp(pattern, flags);
  const matches = [...text.matchAll(new RegExp(pattern, `${flags}g`))];
  return matches.map((m) => m[0]).join('\n') || 'No matches found';
}

export function generateRegex(description) {
  const map = {
    email: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    url: 'https?:\\/\\/[\\w.-]+(?:\\.[\\w.-]+)+[\\w._~:/?#[\\]@!$&\'()*+,;=%-]*',
    phone: '\\+?[0-9]{10,15}',
    number: '\\d+',
    date: '\\d{4}-\\d{2}-\\d{2}'
  };
  const key = Object.keys(map).find((k) => description.toLowerCase().includes(k));
  return key ? map[key] : '\\w+';
}

export function generateUuid() {
  return crypto.randomUUID();
}

export function validateUuid(value) {
  const valid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  return valid ? 'Valid UUID v4' : 'Invalid UUID';
}

export async function hashText(text, algorithm = 'SHA-256') {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashAll(text) {
  const algos = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'].filter((a) => a !== 'MD5');
  const results = {};
  if (typeof window !== 'undefined') {
    results['SHA-1'] = await hashText(text, 'SHA-1');
    results['SHA-256'] = await hashText(text, 'SHA-256');
    results['SHA-512'] = await hashText(text, 'SHA-512');
  }
  return results;
}

export function encodeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function decodeHtml(text) {
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

export function rgbToHex(rgb) {
  const m = rgb.match(/\d+/g);
  if (!m || m.length < 3) throw new Error('Invalid RGB format');
  return `#${m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`;
}

export function unixTimestampConvert(value, mode) {
  if (mode === 'to-date') {
    const ms = String(value).length <= 10 ? Number(value) * 1000 : Number(value);
    return new Date(ms).toISOString();
  }
  return String(Math.floor(new Date(value).getTime() / 1000));
}

export function generateCron(expression) {
  const presets = {
    hourly: '0 * * * *',
    daily: '0 0 * * *',
    weekly: '0 0 * * 0',
    monthly: '0 0 1 * *'
  };
  return presets[expression] || expression || '0 0 * * *';
}

export function parseUserAgent(ua) {
  const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : 'Unknown';
  const os = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Linux') ? 'Linux' : ua.includes('Android') ? 'Android' : 'Unknown';
  return `Browser: ${browser}\nOS: ${os}\nRaw: ${ua}`;
}

export function diffText(a, b) {
  const linesA = a.split('\n');
  const linesB = b.split('\n');
  const max = Math.max(linesA.length, linesB.length);
  const out = [];
  for (let i = 0; i < max; i += 1) {
    const left = linesA[i] ?? '';
    const right = linesB[i] ?? '';
    if (left !== right) out.push(`- ${left}\n+ ${right}`);
  }
  return out.length ? out.join('\n') : 'No differences found.';
}
