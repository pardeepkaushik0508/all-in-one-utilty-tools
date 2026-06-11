import * as dp from '../../../lib/developerProcessors';
import {
  checkPasswordStrength,
  dnsLookup,
  generateHash,
  generatePassword,
  hashVerify,
  ipLookup,
  portScan,
  robotsTxtCheck,
  securityHeadersCheck,
  sslCertificateCheck,
  urlSafetyCheck
} from '../../../services/api';

const fmt = (data) => JSON.stringify(data, null, 2);

export const SECURITY_TEXT_CONFIGS = [
  {
    slug: 'jwt-inspector',
    name: 'JWT Inspector',
    description: 'Inspect JWT header, payload, and signature details.',
    process: async ({ input }) => fmt(dp.decodeJwt(input))
  },
  {
    slug: 'sec-hash-verifier',
    name: 'Hash Verifier',
    description: 'Verify text against MD5 or SHA hashes.',
    dualInput: true,
    inputBLabel: 'Expected hash',
    options: [
      { value: 'sha256', label: 'SHA-256' },
      { value: 'sha1', label: 'SHA-1' },
      { value: 'md5', label: 'MD5' }
    ],
    process: async ({ input, inputB, option }) => {
      const data = await hashVerify(input, inputB, option);
      return data.match ? `Match: yes\nComputed: ${data.computed}` : `Match: no\nComputed: ${data.computed}`;
    }
  },
  {
    slug: 'sec-password-generator',
    name: 'Random Password Generator',
    description: 'Generate cryptographically strong passwords.',
    hideInput: true,
    buttonLabel: 'Generate password',
    numberField: true,
    defaultNumber: 16,
    process: async ({ numberOpt }) => {
      const data = await generatePassword(numberOpt, true);
      return data.password;
    }
  },
  {
    slug: 'sec-password-strength',
    name: 'Password Strength Analyzer',
    description: 'Analyze password complexity and strength score.',
    process: async ({ input }) => {
      const data = await checkPasswordStrength(input);
      return `Score: ${data.score}/5\nStrength: ${data.label}`;
    }
  },
  {
    slug: 'sec-hash-generator',
    name: 'Security Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes.',
    process: async ({ input }) => {
      const data = await generateHash(input);
      return Object.entries(data)
        .filter(([k]) => k !== 'error')
        .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
        .join('\n');
    }
  },
  {
    slug: 'email-header-analyzer',
    name: 'Email Header Analyzer',
    description: 'Parse email headers for SPF, DKIM, and routing info.',
    process: async ({ input }) => {
      const lines = input.split('\n').filter(Boolean);
      const parsed = lines.map((line) => {
        const idx = line.indexOf(':');
        return idx > -1 ? `${line.slice(0, idx).trim()}: ${line.slice(idx + 1).trim()}` : line;
      });
      const flags = [];
      if (/spf=pass/i.test(input)) flags.push('SPF: pass');
      if (/dkim=pass/i.test(input)) flags.push('DKIM: pass');
      return `${parsed.join('\n')}\n\n---\n${flags.length ? flags.join('\n') : 'No SPF/DKIM pass flags detected.'}`;
    }
  },
  {
    slug: 'csp-header-checker',
    name: 'CSP Header Checker',
    description: 'Analyze Content-Security-Policy directives from pasted headers.',
    process: async ({ input }) => {
      const match = input.match(/content-security-policy:\s*(.+)/i);
      if (!match) return 'No Content-Security-Policy header found in input.';
      const directives = match[1].split(';').map((d) => d.trim()).filter(Boolean);
      return directives.map((d, i) => `${i + 1}. ${d}`).join('\n');
    }
  },
  {
    slug: 'subdomain-finder',
    name: 'Subdomain Finder',
    description: 'Suggest common subdomains for a domain (educational lookup).',
    process: async ({ input }) => {
      const host = input.replace(/^https?:\/\//, '').split('/')[0];
      const subs = ['www', 'mail', 'api', 'dev', 'staging', 'blog', 'cdn', 'app'];
      return subs.map((s) => `${s}.${host}`).join('\n');
    }
  },
  {
    slug: 'malware-url-scanner',
    name: 'Malware URL Scanner',
    description: 'Basic heuristic scan for suspicious URL patterns.',
    process: async ({ input }) => {
      const data = await urlSafetyCheck(input);
      return `URL: ${data.url}\nRisk: ${data.risk}\n${data.message}`;
    }
  },
  {
    slug: 'website-technology-detector',
    name: 'Website Technology Detector',
    description: 'Detect technologies from pasted HTTP response headers.',
    process: async ({ input }) => {
      const tech = [];
      if (/x-powered-by:\s*php/i.test(input)) tech.push('PHP');
      if (/server:\s*nginx/i.test(input)) tech.push('Nginx');
      if (/server:\s*apache/i.test(input)) tech.push('Apache');
      if (/x-aspnet/i.test(input)) tech.push('ASP.NET');
      if (/wordpress/i.test(input)) tech.push('WordPress');
      if (/cloudflare/i.test(input)) tech.push('Cloudflare');
      return tech.length ? tech.join('\n') : 'No common technologies detected in headers.';
    }
  }
];

export const SECURITY_NETWORK_CONFIGS = [
  {
    slug: 'ssl-certificate-checker',
    name: 'SSL Certificate Checker',
    description: 'Check SSL/TLS certificate validity and expiration.',
    inputLabel: 'Domain',
    placeholder: 'example.com',
    apiCall: ({ input }) => sslCertificateCheck(input),
    formatResult: (r) => fmt(r.result)
  },
  {
    slug: 'dns-lookup',
    name: 'DNS Lookup',
    description: 'Resolve A, AAAA, MX, TXT, and NS records.',
    inputLabel: 'Domain',
    placeholder: 'example.com',
    apiCall: ({ input }) => dnsLookup(input),
    formatResult: (r) => fmt(r.result)
  },
  {
    slug: 'ip-lookup',
    name: 'IP Lookup',
    description: 'Resolve domain to IP addresses.',
    inputLabel: 'Domain or host',
    placeholder: 'example.com',
    apiCall: ({ input }) => ipLookup(input),
    formatResult: (r) => fmt(r.result)
  },
  {
    slug: 'ip-geolocation-checker',
    name: 'IP Geolocation Checker',
    description: 'Lookup IP address details (via DNS resolution).',
    inputLabel: 'Domain or IP',
    placeholder: '8.8.8.8',
    apiCall: ({ input }) => ipLookup(input),
    formatResult: (r) => fmt(r.result)
  },
  {
    slug: 'security-headers-checker',
    name: 'Security Headers Checker',
    description: 'Check HSTS, CSP, X-Frame-Options, and more.',
    inputLabel: 'Website URL',
    placeholder: 'https://example.com',
    apiCall: ({ input }) => securityHeadersCheck(input),
    formatResult: (r) => fmt(r.result)
  },
  {
    slug: 'http-headers-analyzer',
    name: 'HTTP Headers Analyzer',
    description: 'Fetch and analyze HTTP response headers.',
    inputLabel: 'Website URL',
    placeholder: 'https://example.com',
    apiCall: ({ input }) => securityHeadersCheck(input),
    formatResult: (r) => fmt(r.result)
  },
  {
    slug: 'robots-txt-checker',
    name: 'Robots.txt Checker',
    description: 'Fetch and display robots.txt for a website.',
    inputLabel: 'Website URL',
    placeholder: 'https://example.com',
    apiCall: ({ input }) => robotsTxtCheck(input),
    formatResult: (r) => `Status: ${r.result.status}\n\n${r.result.content || '(empty)'}`
  },
  {
    slug: 'port-scanner',
    name: 'Port Scanner',
    description: 'Safe port check limited to ports 80 and 443.',
    inputLabel: 'Domain',
    placeholder: 'example.com',
    apiCall: ({ input }) => portScan(input),
    formatResult: (r) => fmt(r.result),
    disclaimer: 'Educational use only. Scans only ports 80 and 443 on the target domain.'
  },
  {
    slug: 'domain-whois-lookup',
    name: 'Domain WHOIS Lookup',
    description: 'Basic domain registration info via DNS NS records.',
    inputLabel: 'Domain',
    placeholder: 'example.com',
    apiCall: ({ input }) => dnsLookup(input),
    formatResult: (r) => {
      const ns = r.result?.NS || [];
      return ns.length
        ? `Name servers for ${r.result.domain}:\n${ns.join('\n')}\n\n(For full WHOIS, use your registrar.)`
        : 'No NS records found.';
    }
  },
  {
    slug: 'url-safety-checker',
    name: 'URL Safety Checker',
    description: 'Check URLs for suspicious patterns.',
    inputLabel: 'URL',
    placeholder: 'https://example.com',
    apiCall: ({ input }) => urlSafetyCheck(input),
    formatResult: (r) => `Risk: ${r.risk}\n${r.message}`
  }
];
