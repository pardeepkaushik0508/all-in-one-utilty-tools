import * as dp from '../../../lib/developerProcessors';
import * as tp from '../../../lib/textProcessors';
import { apiRequestTest, httpHeaderCheck } from '../../../services/api';

const fmt = (data) => JSON.stringify(data, null, 2);

export const DEVELOPER_NETWORK_CONFIGS = [
  {
    slug: 'api-request-tester',
    name: 'API Request Tester',
    description: 'Send HTTP requests and inspect responses.',
    inputLabel: 'URL',
    placeholder: 'https://api.example.com/data',
    dualInput: true,
    inputBLabel: 'Request body (JSON, optional)',
    apiCall: ({ input, inputB }) => apiRequestTest(input, 'GET', inputB),
    formatResult: (r) => fmt(r.result),
    buttonLabel: 'Send request'
  },
  {
    slug: 'http-header-checker',
    name: 'HTTP Header Checker',
    description: 'Fetch and display HTTP response headers.',
    inputLabel: 'URL',
    placeholder: 'https://example.com',
    apiCall: ({ input }) => httpHeaderCheck(input),
    formatResult: (r) => fmt(r.result)
  }
];

export const DEVELOPER_SUITE_CONFIGS = [
  { slug: 'dev-json-validator', name: 'JSON Validator', description: 'Validate JSON syntax and structure.', process: async ({ input }) => dp.validateJson(input) },
  { slug: 'json-to-xml', name: 'JSON to XML Converter', description: 'Convert JSON objects to XML format.', process: async ({ input }) => dp.jsonToXml(input) },
  { slug: 'xml-to-json', name: 'XML to JSON Converter', description: 'Convert XML documents to JSON.', process: async ({ input }) => dp.xmlToJson(input) },
  { slug: 'html-formatter', name: 'HTML Formatter', description: 'Beautify and format HTML markup.', process: async ({ input }) => dp.formatHtml(input) },
  { slug: 'css-formatter', name: 'CSS Formatter', description: 'Format CSS stylesheets for readability.', process: async ({ input }) => dp.formatCss(input) },
  { slug: 'javascript-formatter', name: 'JavaScript Formatter', description: 'Format JavaScript code with proper line breaks.', process: async ({ input }) => dp.formatJs(input) },
  { slug: 'sql-formatter', name: 'SQL Formatter', description: 'Format SQL queries for readability.', process: async ({ input }) => dp.formatSql(input) },
  { slug: 'jwt-decoder', name: 'JWT Decoder', description: 'Decode JWT header and payload.', process: async ({ input }) => JSON.stringify(dp.decodeJwt(input), null, 2) },
  { slug: 'jwt-generator', name: 'JWT Generator', description: 'Generate demo JWT tokens.', dualInput: false, passwordField: true, process: async ({ input, password }) => dp.generateJwt('{"alg":"HS256","typ":"JWT"}', input || '{}', password || 'secret') },
  { slug: 'regex-tester', name: 'Regex Tester', description: 'Test regular expressions against text.', secondOption: true, secondOptionLabel: 'Regex pattern', replaceOption: true, process: async ({ input, option, optionB }) => dp.testRegex(option, optionB || 'g', input) },
  { slug: 'regex-generator', name: 'Regex Generator', description: 'Generate common regex patterns.', process: async ({ input }) => dp.generateRegex(input) },
  { slug: 'uuid-generator', name: 'UUID Generator', description: 'Generate random UUID v4 identifiers.', hideInput: true, autoRun: true, buttonLabel: 'Generate another', process: async () => dp.generateUuid() },
  { slug: 'uuid-validator', name: 'UUID Validator', description: 'Validate UUID format.', process: async ({ input }) => dp.validateUuid(input.trim()) },
  { slug: 'dev-hash-generator', name: 'Hash Generator', description: 'Generate SHA-1, SHA-256, and SHA-512 hashes.', process: async ({ input }) => { const h = await dp.hashAll(input); return Object.entries(h).map(([k, v]) => `${k}: ${v}`).join('\n'); } },
  { slug: 'html-encoder', name: 'HTML Encoder', description: 'Encode special characters to HTML entities.', process: async ({ input }) => dp.encodeHtml(input) },
  { slug: 'html-decoder', name: 'HTML Decoder', description: 'Decode HTML entities to plain text.', process: async ({ input }) => dp.decodeHtml(input) },
  { slug: 'hex-to-rgb', name: 'HEX to RGB Converter', description: 'Convert HEX color codes to RGB.', process: async ({ input }) => dp.hexToRgb(input.trim()) },
  { slug: 'rgb-to-hex', name: 'RGB to HEX Converter', description: 'Convert RGB values to HEX color codes.', process: async ({ input }) => dp.rgbToHex(input) },
  { slug: 'js-minifier', name: 'JS Minifier', description: 'Minify JavaScript code.', process: async ({ input }) => input.replace(/\s+/g, ' ').replace(/;\s*/g, ';').trim() },
  { slug: 'js-beautifier', name: 'JS Beautifier', description: 'Beautify JavaScript code.', process: async ({ input }) => dp.formatJs(input) },
  { slug: 'html-minifier', name: 'HTML Minifier', description: 'Minify HTML markup.', process: async ({ input }) => input.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim() },
  { slug: 'html-beautifier', name: 'HTML Beautifier', description: 'Beautify HTML markup.', process: async ({ input }) => dp.formatHtml(input) },
  { slug: 'unix-timestamp-converter', name: 'Unix Timestamp Converter', description: 'Convert Unix timestamps to dates and back.', options: [{ value: 'to-date', label: 'Timestamp to date' }, { value: 'to-ts', label: 'Date to timestamp' }], process: async ({ input, option }) => dp.unixTimestampConvert(input, option) },
  { slug: 'cron-expression-generator', name: 'Cron Expression Generator', description: 'Generate common cron expressions.', hideInput: true, buttonLabel: 'Generate cron', options: [{ value: 'hourly', label: 'Every hour' }, { value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }], process: async ({ option }) => dp.generateCron(option) },
  { slug: 'user-agent-parser', name: 'User Agent Parser', description: 'Parse browser user agent strings.', process: async ({ input }) => dp.parseUserAgent(input || (typeof navigator !== 'undefined' ? navigator.userAgent : '')) },
  { slug: 'dev-diff-checker', name: 'Diff Checker', description: 'Compare two code or text blocks.', dualInput: true, inputBLabel: 'Text B', process: async ({ input, inputB }) => dp.diffText(input, inputB) },
  { slug: 'dev-base64-encoder', name: 'Base64 Encoder', description: 'Encode text to Base64.', process: async ({ input }) => tp.encodeBase64(input) },
  { slug: 'dev-base64-decoder', name: 'Base64 Decoder', description: 'Decode Base64 strings.', process: async ({ input }) => tp.decodeBase64(input) },
  { slug: 'dev-url-encoder', name: 'URL Encoder', description: 'URL-encode strings.', process: async ({ input }) => tp.encodeUrl(input) },
  { slug: 'dev-url-decoder', name: 'URL Decoder', description: 'URL-decode strings.', process: async ({ input }) => tp.decodeUrl(input) },
  { slug: 'dev-case-converter', name: 'Case Converter', description: 'Convert text case formats.', options: [{ value: 'upper', label: 'UPPERCASE' }, { value: 'lower', label: 'lowercase' }, { value: 'title', label: 'Title Case' }], process: async ({ input, option }) => tp.convertCase(input, option) },
  { slug: 'dev-lorem-ipsum', name: 'Lorem Ipsum Generator', description: 'Generate placeholder text.', hideInput: true, buttonLabel: 'Generate lorem ipsum', numberField: true, defaultNumber: 3, process: async ({ numberOpt }) => tp.generateLoremIpsum(numberOpt) },
  { slug: 'dev-xml-formatter', name: 'XML Formatter', description: 'Beautify and format XML documents.', process: async ({ input }) => tp.formatXml(input) },
  { slug: 'css-minifier', name: 'CSS Minifier', description: 'Minify CSS stylesheets.', process: async ({ input }) => input.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,])\s*/g, '$1').trim() },
  { slug: 'dev-color-picker', name: 'Color Picker', description: 'Convert and preview HEX colors.', process: async ({ input }) => dp.hexToRgb(input.trim()) }
];

