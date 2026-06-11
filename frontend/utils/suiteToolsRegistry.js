import { TEXT_SUITE_CONFIGS } from '../components/tools/configs/textSuiteConfig';
import { IMAGE_SUITE_CONFIGS } from '../components/tools/configs/imageSuiteConfig';
import { DEVELOPER_SUITE_CONFIGS, DEVELOPER_NETWORK_CONFIGS } from '../components/tools/configs/developerSuiteConfig';
import { SECURITY_TEXT_CONFIGS, SECURITY_NETWORK_CONFIGS } from '../components/tools/configs/securitySuiteConfig';
import { UTILITY_TEXT_CONFIGS, UTILITY_INTERACTIVE_CONFIGS } from '../components/tools/configs/utilitySuiteConfig';
import { SOCIAL_SUITE_CONFIGS } from '../components/tools/configs/socialSuiteConfig';

const CATEGORY_LINKS = {
  'Text Tools': [
    { slug: 'json-formatter', name: 'JSON Formatter', description: 'Format and validate JSON.' },
    { slug: 'html-to-text', name: 'HTML to Text', description: 'Extract readable plain text from HTML.' },
    { slug: 'hashtag-generator', name: 'Hashtag Generator', description: 'Generate hashtag sets for posts.' },
    { slug: 'password-generator', name: 'Password Generator', description: 'Create strong random passwords.' }
  ],
  'Developer Tools': [
    { slug: 'json-formatter', name: 'JSON Formatter', description: 'Format and validate JSON.' },
    { slug: 'xml-formatter', name: 'XML Formatter', description: 'Beautify and format XML documents.' },
    { slug: 'code-minifier', name: 'Code Minifier', description: 'Minify JS, CSS, and HTML.' },
    { slug: 'css-beautifier', name: 'CSS Beautifier', description: 'Beautify minified CSS.' },
    { slug: 'html-to-text', name: 'HTML to Text', description: 'Extract plain text from HTML.' },
    { slug: 'base64-encoder', name: 'Base64 Encoder', description: 'Encode text to Base64.' },
    { slug: 'url-encoder', name: 'URL Encoder', description: 'URL-encode strings.' },
    { slug: 'text-compare-tool', name: 'Text Compare Tool', description: 'Compare two text blocks.' }
  ],
  'Security Tools': [
    { slug: 'password-generator', name: 'Password Generator', description: 'Create strong random passwords.' },
    { slug: 'password-strength-checker', name: 'Password Strength Checker', description: 'Measure password complexity.' },
    { slug: 'hash-generator', name: 'Hash Generator', description: 'Create MD5 and SHA256 hashes.' },
    { slug: 'jwt-decoder', name: 'JWT Decoder', description: 'Decode JWT header and payload.' }
  ],
  'Utility Tools': [
    { slug: 'unit-converter', name: 'Unit Converter', description: 'Convert length, mass, and temperature.' },
    { slug: 'age-calculator', name: 'Age Calculator', description: 'Calculate age from date of birth.' },
    { slug: 'emi-calculator', name: 'EMI Calculator', description: 'Compute loan installments.' },
    { slug: 'currency-converter', name: 'Currency Converter', description: 'Live currency conversion.' },
    { slug: 'word-counter', name: 'Word Counter', description: 'Count words and characters.' },
    { slug: 'character-counter', name: 'Character Counter', description: 'Count characters with and without spaces.' }
  ],
  'Social Media Tools': [
    { slug: 'hashtag-generator', name: 'Hashtag Generator', description: 'Generate hashtag sets for posts.' },
    { slug: 'thumbnail-downloader', name: 'YouTube Thumbnail Downloader', description: 'Download video thumbnail images.' },
    { slug: 'instagram-downloader', name: 'Instagram Downloader', description: 'Download public media links.' },
    { slug: 'fancy-text-generator', name: 'Fancy Text Generator', description: 'Convert text to fancy Unicode styles.' }
  ]
};

const SUITE_GROUPS = [
  { configs: TEXT_SUITE_CONFIGS, category: 'Text Tools' },
  { configs: IMAGE_SUITE_CONFIGS, category: 'Image Tools' },
  { configs: [...DEVELOPER_SUITE_CONFIGS, ...DEVELOPER_NETWORK_CONFIGS], category: 'Developer Tools' },
  { configs: [...SECURITY_TEXT_CONFIGS, ...SECURITY_NETWORK_CONFIGS], category: 'Security Tools' },
  { configs: [...UTILITY_TEXT_CONFIGS, ...UTILITY_INTERACTIVE_CONFIGS], category: 'Utility Tools' },
  { configs: SOCIAL_SUITE_CONFIGS, category: 'Social Media Tools' }
];

export function buildSuiteToolEntries(existingSlugs) {
  return SUITE_GROUPS.flatMap(({ configs, category }) =>
    configs.map((config) => ({
      name: config.name,
      slug: config.slug,
      category,
      description: config.description
    }))
  ).filter((tool) => !existingSlugs.has(tool.slug));
}

export function getCategoryTools(category, allTools) {
  const slugSet = new Set(allTools.filter((t) => t.category === category).map((t) => t.slug));
  const linked = (CATEGORY_LINKS[category] || []).filter((t) => !slugSet.has(t.slug));
  return [
    ...allTools.filter((t) => t.category === category),
    ...linked.map((t) => ({ ...t, category, linked: true }))
  ];
}

export const CATEGORY_SLUGS = {
  'PDF Tools': 'pdf-tools',
  'Image Tools': 'image-tools',
  'Video/Audio Tools': 'video-audio-tools',
  'Text Tools': 'text-tools',
  'Developer Tools': 'developer-tools',
  'Social Media Tools': 'social-media-tools',
  'Security Tools': 'security-tools',
  'Utility Tools': 'utility-tools'
};
