const dns = require('dns').promises;
const https = require('https');
const http = require('http');
const net = require('net');
const tls = require('tls');
const { URL } = require('url');

function normalizeUrl(input) {
  const trimmed = String(input || '').trim();
  if (!trimmed) throw new Error('URL or domain is required.');
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function normalizeDomain(input) {
  const value = String(input || '').trim().replace(/^https?:\/\//, '').split('/')[0];
  if (!value) throw new Error('Domain is required.');
  return value;
}

async function dnsLookup(domain) {
  const host = normalizeDomain(domain);
  const [a, aaaa, mx, txt, ns] = await Promise.allSettled([
    dns.resolve4(host),
    dns.resolve6(host),
    dns.resolveMx(host),
    dns.resolveTxt(host),
    dns.resolveNs(host)
  ]);
  return {
    domain: host,
    A: a.status === 'fulfilled' ? a.value : [],
    AAAA: aaaa.status === 'fulfilled' ? aaaa.value : [],
    MX: mx.status === 'fulfilled' ? mx.value : [],
    TXT: txt.status === 'fulfilled' ? txt.value.map((r) => r.join('')) : [],
    NS: ns.status === 'fulfilled' ? ns.value : []
  };
}

function fetchHeaders(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'http:' ? http : https;
    const req = lib.request(url, { method: 'HEAD', timeout: 10000 }, (res) => {
      resolve({ status: res.statusCode, headers: res.headers, url });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out.'));
    });
    req.end();
  });
}

async function securityHeadersCheck(input) {
  const url = normalizeUrl(input);
  const { status, headers } = await fetchHeaders(url);
  const security = {
    'strict-transport-security': headers['strict-transport-security'] || 'Missing',
    'content-security-policy': headers['content-security-policy'] || 'Missing',
    'x-frame-options': headers['x-frame-options'] || 'Missing',
    'x-content-type-options': headers['x-content-type-options'] || 'Missing',
    'referrer-policy': headers['referrer-policy'] || 'Missing',
    'permissions-policy': headers['permissions-policy'] || 'Missing'
  };
  return { status, security, server: headers.server || 'Unknown' };
}

async function sslCertificateCheck(input) {
  const host = normalizeDomain(input);
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host, port: 443, servername: host, timeout: 10000 }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      resolve({
        subject: cert.subject,
        issuer: cert.issuer,
        valid_from: cert.valid_from,
        valid_to: cert.valid_to,
        daysRemaining: cert.valid_to ? Math.ceil((new Date(cert.valid_to) - Date.now()) / 86400000) : null
      });
    });
    socket.on('error', reject);
  });
}

async function robotsTxtCheck(input) {
  const base = normalizeUrl(input);
  const url = `${base.replace(/\/$/, '')}/robots.txt`;
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, content: data.slice(0, 5000) }));
    }).on('error', reject);
  });
}

function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port, timeout: 5000 }, () => {
      socket.end();
      resolve({ port, open: true });
    });
    socket.on('error', () => resolve({ port, open: false }));
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ port, open: false });
    });
  });
}

async function safePortScan(domain) {
  const host = normalizeDomain(domain);
  const ports = await Promise.all([80, 443].map((port) => checkPort(host, port)));
  return { host, ports };
}

async function ipLookup(input) {
  const host = normalizeDomain(input);
  const records = await dns.lookup(host, { all: true });
  return { host, records };
}

module.exports = {
  dnsLookup,
  securityHeadersCheck,
  sslCertificateCheck,
  robotsTxtCheck,
  safePortScan,
  ipLookup,
  fetchHeaders,
  normalizeUrl
};
