const http = require('http');
const https = require('https');
const { URL } = require('url');
const { fetchHeaders, normalizeUrl } = require('./securityNetworkService');

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'http:' ? http : https;
    const started = Date.now();
    const req = lib.request(url, { method: options.method || 'GET', timeout: 15000, headers: options.headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          durationMs: Date.now() - started,
          headers: res.headers,
          body: data.slice(0, 8000)
        });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out.'));
    });
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function apiRequestTest(input, method = 'GET', body = '') {
  const url = normalizeUrl(input);
  return fetchUrl(url, {
    method: method || 'GET',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'UtilityTools-API-Tester/1.0' },
    body: method !== 'GET' && body ? body : undefined
  });
}

async function httpHeaderCheck(input) {
  const result = await fetchHeaders(normalizeUrl(input));
  return result;
}

module.exports = { apiRequestTest, httpHeaderCheck };
