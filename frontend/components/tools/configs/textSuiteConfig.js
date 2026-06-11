import * as tp from '../../../lib/textProcessors';

export const TEXT_SUITE_CONFIGS = [
  {
    slug: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, sentences, paragraphs, and reading time.',
    mode: 'live-stats',
    statsFn: (input) => {
      const s = tp.countTextStats(input);
      return {
        Words: s.words,
        Characters: s.characters,
        Sentences: s.sentences,
        Paragraphs: s.paragraphs,
        'Reading time (min)': s.readingTime,
        'Speaking time (min)': s.speakingTime
      };
    },
    process: async ({ input }) => tp.countTextStats(input)
  },
  {
    slug: 'character-counter',
    name: 'Character Counter',
    description: 'Count characters with and without spaces.',
    mode: 'live-stats',
    statsFn: (input) => {
      const s = tp.countTextStats(input);
      return {
        Characters: s.characters,
        'No spaces': s.charactersNoSpaces,
        Words: s.words
      };
    },
    process: async ({ input }) => tp.countTextStats(input)
  },
  {
    slug: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text to UPPERCASE, lowercase, Title Case, and more.',
    options: [
      { value: 'upper', label: 'UPPERCASE' },
      { value: 'lower', label: 'lowercase' },
      { value: 'title', label: 'Title Case' },
      { value: 'sentence', label: 'Sentence case' },
      { value: 'toggle', label: 'tOGGLE cASE' }
    ],
    process: async ({ input, option }) => tp.convertCase(input, option)
  },
  {
    slug: 'text-sorter',
    name: 'Text Sorter',
    description: 'Sort lines alphabetically, by length, or reverse order.',
    options: [
      { value: 'alpha', label: 'Alphabetical' },
      { value: 'reverse', label: 'Reverse' },
      { value: 'length', label: 'By length' }
    ],
    process: async ({ input, option }) => tp.sortLines(input, option)
  },
  {
    slug: 'duplicate-line-remover',
    name: 'Duplicate Line Remover',
    description: 'Remove duplicate lines from text instantly.',
    process: async ({ input }) => tp.removeDuplicateLines(input)
  },
  {
    slug: 'line-break-remover',
    name: 'Line Break Remover',
    description: 'Remove line breaks and merge text into one paragraph.',
    process: async ({ input }) => tp.removeLineBreaks(input)
  },
  {
    slug: 'whitespace-remover',
    name: 'Whitespace Remover',
    description: 'Remove all whitespace characters from text.',
    process: async ({ input }) => tp.removeWhitespace(input)
  },
  {
    slug: 'text-reverser',
    name: 'Text Reverser',
    description: 'Reverse characters in your text.',
    process: async ({ input }) => tp.reverseText(input)
  },
  {
    slug: 'text-cleaner',
    name: 'Text Cleaner',
    description: 'Clean messy text by normalizing spaces and line breaks.',
    process: async ({ input }) => tp.cleanText(input)
  },
  {
    slug: 'random-text-generator',
    name: 'Random Text Generator',
    description: 'Generate random placeholder text for mockups.',
    hideInput: true,
    buttonLabel: 'Generate text',
    numberField: true,
    numberLabel: 'Word count',
    defaultNumber: 50,
    process: async ({ numberOpt }) => tp.generateRandomText(numberOpt)
  },
  {
    slug: 'lorem-ipsum-generator',
    name: 'Lorem Ipsum Generator',
    description: 'Generate Lorem Ipsum placeholder paragraphs.',
    hideInput: true,
    buttonLabel: 'Generate lorem ipsum',
    numberField: true,
    numberLabel: 'Paragraphs',
    defaultNumber: 3,
    process: async ({ numberOpt }) => tp.generateLoremIpsum(numberOpt)
  },
  {
    slug: 'keyword-density-checker',
    name: 'Keyword Density Checker',
    description: 'Analyze keyword frequency and density for SEO.',
    process: async ({ input }) => {
      const rows = tp.keywordDensity(input);
      return rows.map((r) => `${r.word}: ${r.count} (${r.density}%)`).join('\n');
    }
  },
  {
    slug: 'readability-checker',
    name: 'Readability Checker',
    description: 'Estimate readability score using Flesch Reading Ease.',
    process: async ({ input }) => {
      const r = tp.readabilityScore(input);
      return `Score: ${r.score}\nLevel: ${r.level}\nWords: ${r.words}\nSentences: ${r.sentences}`;
    }
  },
  {
    slug: 'text-compare-tool',
    name: 'Text Compare Tool',
    description: 'Compare two texts line by line and see differences.',
    mode: 'compare',
    dualInput: true,
    inputBLabel: 'Text B',
    process: async ({ input, inputB }) => tp.compareTexts(input, inputB)
  },
  {
    slug: 'find-and-replace',
    name: 'Find and Replace Tool',
    description: 'Find and replace text patterns in bulk.',
    secondOption: true,
    secondOptionLabel: 'Find',
    replaceOption: true,
    process: async ({ input, option, optionB }) => tp.findAndReplace(input, option, optionB)
  },
  {
    slug: 'markdown-editor',
    name: 'Markdown Editor',
    description: 'Convert Markdown to HTML preview.',
    process: async ({ input }) => tp.markdownToHtml(input),
    downloadFilename: 'output.html'
  },
  {
    slug: 'text-to-html',
    name: 'Text to HTML',
    description: 'Convert plain text to safe HTML.',
    process: async ({ input }) => tp.textToHtml(input),
    downloadFilename: 'output.html'
  },
  {
    slug: 'url-encoder',
    name: 'URL Encoder',
    description: 'Encode text for safe use in URLs.',
    process: async ({ input }) => tp.encodeUrl(input)
  },
  {
    slug: 'url-decoder',
    name: 'URL Decoder',
    description: 'Decode URL-encoded strings.',
    process: async ({ input }) => tp.decodeUrl(input)
  },
  {
    slug: 'base64-encoder',
    name: 'Base64 Encoder',
    description: 'Encode text to Base64 format.',
    process: async ({ input }) => tp.encodeBase64(input)
  },
  {
    slug: 'base64-decoder',
    name: 'Base64 Decoder',
    description: 'Decode Base64 strings to plain text.',
    process: async ({ input }) => tp.decodeBase64(input)
  },
  {
    slug: 'json-minifier',
    name: 'JSON Minifier',
    description: 'Minify JSON by removing whitespace.',
    process: async ({ input }) => tp.minifyJson(input),
    validate: ({ input }) => { try { JSON.parse(input); return true; } catch { return false; } },
    validateMessage: 'Invalid JSON input.'
  },
  {
    slug: 'xml-formatter',
    name: 'XML Formatter',
    description: 'Beautify and format XML documents.',
    process: async ({ input }) => tp.formatXml(input),
    downloadFilename: 'formatted.xml'
  },
  {
    slug: 'xml-minifier',
    name: 'XML Minifier',
    description: 'Minify XML by removing extra whitespace.',
    process: async ({ input }) => tp.minifyXml(input)
  },
  {
    slug: 'csv-to-json',
    name: 'CSV to JSON',
    description: 'Convert CSV data to JSON format.',
    process: async ({ input }) => tp.csvToJson(input),
    downloadFilename: 'data.json'
  },
  {
    slug: 'json-to-csv',
    name: 'JSON to CSV',
    description: 'Convert JSON arrays to CSV format.',
    process: async ({ input }) => tp.jsonToCsv(input),
    downloadFilename: 'data.csv'
  },
  {
    slug: 'text-encryptor',
    name: 'Text Encryptor',
    description: 'Encrypt text with a password using AES-GCM.',
    passwordField: true,
    process: async ({ input, password }) => {
      if (!password) throw new Error('Password is required.');
      return tp.encryptText(input, password);
    }
  },
  {
    slug: 'text-decryptor',
    name: 'Text Decryptor',
    description: 'Decrypt AES-GCM encrypted text with your password.',
    passwordField: true,
    process: async ({ input, password }) => {
      if (!password) throw new Error('Password is required.');
      return tp.decryptText(input, password);
    }
  },
  {
    slug: 'slug-generator',
    name: 'Slug Generator',
    description: 'Generate URL-friendly slugs from any text.',
    process: async ({ input }) => tp.generateSlug(input)
  },
  {
    slug: 'fancy-text-generator',
    name: 'Fancy Text Generator',
    description: 'Convert text to stylized Unicode characters.',
    process: async ({ input }) => tp.fancyText(input)
  },
  {
    slug: 'text-capitalizer',
    name: 'Text Capitalizer',
    description: 'Capitalize every word in your text.',
    process: async ({ input }) => tp.capitalizeText(input)
  },
  {
    slug: 'remove-empty-lines',
    name: 'Remove Empty Lines',
    description: 'Remove blank lines from text.',
    process: async ({ input }) => tp.removeEmptyLines(input)
  },
  {
    slug: 'text-merger',
    name: 'Text Merger',
    description: 'Merge two text blocks with a custom separator.',
    dualInput: true,
    inputBLabel: 'Second text block',
    process: async ({ input, inputB }) => tp.mergeTexts([input, inputB], '\n\n')
  },
  {
    slug: 'text-splitter',
    name: 'Text Splitter',
    description: 'Split text by delimiter into sections.',
    secondOption: true,
    secondOptionLabel: 'Delimiter',
    defaultOption: '\n',
    process: async ({ input, option }) => tp.splitText(input, option)
  },
  {
    slug: 'email-extractor',
    name: 'Email Extractor',
    description: 'Extract all email addresses from text.',
    process: async ({ input }) => tp.extractEmails(input)
  },
  {
    slug: 'url-extractor',
    name: 'URL Extractor',
    description: 'Extract all URLs from text content.',
    process: async ({ input }) => tp.extractUrls(input)
  },
  {
    slug: 'text-hashtag-generator',
    name: 'Hashtag Generator',
    description: 'Generate hashtags from your text content.',
    numberField: true,
    numberLabel: 'Max hashtags',
    defaultNumber: 10,
    process: async ({ input, numberOpt }) => tp.generateHashtags(input, numberOpt)
  },
  {
    slug: 'text-password-generator',
    name: 'Password Generator',
    description: 'Generate strong random passwords in your browser.',
    hideInput: true,
    buttonLabel: 'Generate password',
    numberField: true,
    numberLabel: 'Length',
    defaultNumber: 16,
    process: async ({ numberOpt }) => tp.generatePassword(numberOpt, true)
  }
];
