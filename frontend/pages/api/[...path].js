import http from 'http';
import https from 'https';
import { URL } from 'url';

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://aio-tools-backend-production.up.railway.app';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
    responseLimit: false
  }
};

function getBackendBase() {
  return BACKEND_URL.replace(/\/$/, '');
}

export default function handler(req, res) {
  const segments = req.query.path;
  const pathPart = Array.isArray(segments) ? segments.join('/') : segments || '';
  const queryIndex = req.url.indexOf('?');
  const query = queryIndex >= 0 ? req.url.slice(queryIndex) : '';

  let targetUrl;
  try {
    targetUrl = new URL(`/api/${pathPart}${query}`, getBackendBase());
  } catch (error) {
    res.status(500).json({ error: 'Invalid backend URL configuration.' });
    return;
  }

  const transport = targetUrl.protocol === 'https:' ? https : http;
  const headers = { ...req.headers, host: targetUrl.host };

  const proxyReq = transport.request(
    targetUrl,
    { method: req.method, headers },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (error) => {
    if (!res.headersSent) {
      res.status(502).json({
        error: 'Cannot reach the backend API. Check that the backend service is running.',
        detail: error.message
      });
      return;
    }
    res.end();
  });

  req.pipe(proxyReq);
}
