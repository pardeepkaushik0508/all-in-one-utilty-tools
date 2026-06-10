export const toolCategories = [
  'PDF Tools',
  'Image Tools',
  'Video/Audio Tools',
  'Text Tools',
  'Developer Tools',
  'Social Media Tools',
  'Security Tools',
  'Utility Tools'
];

export const tools = [
  { name: 'Merge PDF', slug: 'merge-pdf', category: 'PDF Tools', description: 'Combine multiple PDF files into one.' },
  { name: 'Split PDF', slug: 'split-pdf', category: 'PDF Tools', description: 'Extract selected pages from PDF.' },
  { name: 'Compress PDF', slug: 'compress-pdf', category: 'PDF Tools', description: 'Reduce PDF file size.' },
  { name: 'Create PDF', slug: 'create-pdf', category: 'PDF Tools', description: 'Create PDF from images, text, or mixed files — reorder, rotate, compress, and download.' },
  { name: 'Edit PDF', slug: 'edit-pdf', category: 'PDF Tools', description: 'Full PDF editor: text, signatures, images, shapes, highlights, draw, undo/redo.' },
  { name: 'Delete PDF Pages', slug: 'delete-pdf-pages', category: 'PDF Tools', description: 'Delete, extract, reorder, and rotate PDF pages with live thumbnails.' },
  { name: 'Scan to PDF', slug: 'scan-to-pdf', category: 'PDF Tools', description: 'Camera scan or upload documents — enhance, reorder, and export to PDF.' },

  { name: 'Compress Image', slug: 'compress-image', category: 'Image Tools', description: 'Optimize image size while retaining quality.' },
  { name: 'Resize Image', slug: 'resize-image', category: 'Image Tools', description: 'Resize images by width and height.' },
  { name: 'Convert JPG PNG', slug: 'convert-jpg-png', category: 'Image Tools', description: 'Convert JPG to PNG and vice versa.' },
  { name: 'Image To Text OCR', slug: 'image-to-text', category: 'Image Tools', description: 'Extract text from image using OCR.' },
  { name: 'AI Image Generator', slug: 'ai-image-generator', category: 'Image Tools', description: 'Create images from text prompts using Google Gemini AI.' },

  { name: 'Video To MP3', slug: 'video-to-mp3', category: 'Video/Audio Tools', description: 'Extract mp3 audio from video.' },
  { name: 'Video Compression', slug: 'video-compression', category: 'Video/Audio Tools', description: 'Compress large video files.' },
  { name: 'Audio Cutter', slug: 'audio-cutter', category: 'Video/Audio Tools', description: 'Trim audio clips quickly.' },
  { name: 'Video Downloader', slug: 'video-downloader', category: 'Video/Audio Tools', description: 'Download YouTube videos or direct MP4/WebM links.' },

  { name: 'Grammar Checker', slug: 'grammar-checker', category: 'Text Tools', description: 'Check writing using LanguageTool API.' },
  { name: 'Paraphrasing Tool', slug: 'paraphrasing-tool', category: 'Text Tools', description: 'Rephrase content with AI APIs.' },
  { name: 'Plagiarism Checker', slug: 'plagiarism-checker', category: 'Text Tools', description: 'Basic duplicate-content detection.' },
  { name: 'AI Content Generator', slug: 'ai-content-generator', category: 'Text Tools', description: 'Generate content with Gemini AI — optional image upload.' },

  { name: 'JSON Formatter', slug: 'json-formatter', category: 'Developer Tools', description: 'Format and validate JSON.' },
  { name: 'Code Minifier', slug: 'code-minifier', category: 'Developer Tools', description: 'Minify JS, CSS, HTML snippets.' },
  { name: 'HTML To Text', slug: 'html-to-text', category: 'Developer Tools', description: 'Extract readable plain text from HTML.' },
  { name: 'CSS Beautifier', slug: 'css-beautifier', category: 'Developer Tools', description: 'Beautify minified CSS.' },

  { name: 'Instagram Downloader', slug: 'instagram-downloader', category: 'Social Media Tools', description: 'Download public media links.' },
  { name: 'Thumbnail Downloader', slug: 'thumbnail-downloader', category: 'Social Media Tools', description: 'Fetch video thumbnail images.' },
  { name: 'Hashtag Generator', slug: 'hashtag-generator', category: 'Social Media Tools', description: 'Generate hashtag sets for posts.' },

  { name: 'Password Generator', slug: 'password-generator', category: 'Security Tools', description: 'Create strong random passwords.' },
  { name: 'Password Strength Checker', slug: 'password-strength-checker', category: 'Security Tools', description: 'Measure password complexity score.' },
  { name: 'Hash Generator', slug: 'hash-generator', category: 'Security Tools', description: 'Create MD5 and SHA256 hashes.' },

  { name: 'Unit Converter', slug: 'unit-converter', category: 'Utility Tools', description: 'Convert length, mass and temperature.' },
  { name: 'Age Calculator', slug: 'age-calculator', category: 'Utility Tools', description: 'Calculate age from date of birth.' },
  { name: 'EMI Calculator', slug: 'emi-calculator', category: 'Utility Tools', description: 'Compute loan installments.' },
  { name: 'Currency Converter', slug: 'currency-converter', category: 'Utility Tools', description: 'Live rates via external API.' }
];

export const findToolBySlug = (slug) => tools.find((tool) => tool.slug === slug);
