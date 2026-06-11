export const IMAGE_SUITE_CONFIGS = [
  {
    slug: 'image-cropper',
    name: 'Image Cropper',
    description: 'Crop images to custom dimensions.',
    clientOp: 'crop',
    fields: [
      { key: 'x', label: 'X offset', type: 'number', default: 0 },
      { key: 'y', label: 'Y offset', type: 'number', default: 0 },
      { key: 'width', label: 'Width', type: 'number', default: 400 },
      { key: 'height', label: 'Height', type: 'number', default: 400 }
    ],
    downloadFilename: 'cropped.png'
  },
  {
    slug: 'image-rotator',
    name: 'Image Rotator',
    description: 'Rotate images by 90, 180, or 270 degrees.',
    clientOp: 'rotate',
    fields: [{ key: 'degrees', label: 'Degrees', type: 'number', default: 90 }],
    downloadFilename: 'rotated.png'
  },
  {
    slug: 'image-flipper',
    name: 'Image Flipper',
    description: 'Flip images horizontally or vertically.',
    clientOp: 'flip',
    fields: [{
      key: 'direction',
      label: 'Direction',
      type: 'select',
      default: 'horizontal',
      options: [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' }
      ]
    }],
    downloadFilename: 'flipped.png'
  },
  {
    slug: 'background-remover',
    name: 'Background Remover',
    description: 'Remove backgrounds from portraits, products, logos, and more with smart edge detection.',
    clientOp: 'bg-remove',
    buttonLabel: 'Remove Background',
    fields: [{ key: 'tolerance', label: 'Edge sensitivity', type: 'number', default: 40, min: 10, max: 120 }],
    downloadFilename: 'no-bg.png'
  },
  {
    slug: 'ai-background-remover',
    name: 'AI Background Remover',
    description: 'High-quality AI background removal with transparent PNG output.',
    serverOp: 'bg-remove',
    buttonLabel: 'Remove Background',
    mode: 'server',
    downloadFilename: 'ai-no-bg.png'
  },
  {
    slug: 'image-upscaler',
    name: 'Image Upscaler',
    description: 'Upscale images 2x using high-quality resampling.',
    clientOp: 'upscale',
    fields: [{ key: 'scale', label: 'Scale factor', type: 'number', default: 2, min: 2, max: 4 }],
    downloadFilename: 'upscaled.png'
  },
  {
    slug: 'image-watermark',
    name: 'Image Watermark',
    description: 'Add a text watermark to your image.',
    clientOp: 'watermark',
    fields: [{ key: 'text', label: 'Watermark text', type: 'text', default: 'UtilityTools' }],
    downloadFilename: 'watermarked.png'
  },
  {
    slug: 'blur-image',
    name: 'Blur Image',
    description: 'Apply blur effect to images.',
    clientOp: 'blur',
    fields: [{ key: 'amount', label: 'Blur amount (px)', type: 'number', default: 4, min: 1, max: 20 }],
    downloadFilename: 'blurred.png'
  },
  {
    slug: 'sharpen-image',
    name: 'Sharpen Image',
    description: 'Sharpen image details for clearer output.',
    clientOp: 'sharpen',
    downloadFilename: 'sharpened.png'
  },
  {
    slug: 'brightness-adjuster',
    name: 'Brightness Adjuster',
    description: 'Adjust image brightness levels.',
    clientOp: 'brightness',
    fields: [{ key: 'value', label: 'Brightness %', type: 'number', default: 120, min: 0, max: 200 }],
    downloadFilename: 'brightness.png'
  },
  {
    slug: 'contrast-adjuster',
    name: 'Contrast Adjuster',
    description: 'Adjust image contrast levels.',
    clientOp: 'contrast',
    fields: [{ key: 'value', label: 'Contrast %', type: 'number', default: 120, min: 0, max: 200 }],
    downloadFilename: 'contrast.png'
  },
  {
    slug: 'saturation-adjuster',
    name: 'Saturation Adjuster',
    description: 'Adjust color saturation in images.',
    clientOp: 'saturation',
    fields: [{ key: 'value', label: 'Saturation %', type: 'number', default: 120, min: 0, max: 200 }],
    downloadFilename: 'saturation.png'
  },
  {
    slug: 'grayscale-converter',
    name: 'Grayscale Converter',
    description: 'Convert images to grayscale.',
    clientOp: 'grayscale',
    downloadFilename: 'grayscale.png'
  },
  {
    slug: 'black-white-converter',
    name: 'Black & White Converter',
    description: 'Convert images to high-contrast black and white.',
    clientOp: 'blackwhite',
    downloadFilename: 'black-white.png'
  },
  {
    slug: 'image-color-picker',
    name: 'Image Color Picker',
    description: 'Pick colors from any point in your image.',
    mode: 'color-picker',
    buttonLabel: 'Click image to pick color'
  },
  {
    slug: 'image-metadata-viewer',
    name: 'Image Metadata Viewer',
    description: 'View file name, type, size, and modified date.',
    mode: 'metadata',
    buttonLabel: 'View Metadata'
  },
  {
    slug: 'exif-data-viewer',
    name: 'EXIF Data Viewer',
    description: 'View basic image file metadata and properties.',
    mode: 'metadata',
    buttonLabel: 'View EXIF / Metadata'
  },
  {
    slug: 'jpg-to-png',
    name: 'JPG to PNG',
    description: 'Convert JPG/JPEG images to PNG format.',
    serverOp: 'convert',
    mode: 'server',
    defaultFormat: 'png',
    downloadFilename: 'converted.png'
  },
  {
    slug: 'png-to-jpg',
    name: 'PNG to JPG',
    description: 'Convert PNG images to JPG format.',
    serverOp: 'convert',
    mode: 'server',
    defaultFormat: 'jpg',
    downloadFilename: 'converted.jpg'
  },
  {
    slug: 'webp-to-jpg',
    name: 'WEBP to JPG',
    description: 'Convert WEBP images to JPG format.',
    serverOp: 'convert',
    mode: 'server',
    defaultFormat: 'jpg',
    downloadFilename: 'converted.jpg'
  },
  {
    slug: 'jpg-to-webp',
    name: 'JPG to WEBP',
    description: 'Convert JPG images to WEBP format.',
    serverOp: 'convert',
    mode: 'server',
    defaultFormat: 'webp',
    downloadFilename: 'converted.webp'
  },
  {
    slug: 'png-to-webp',
    name: 'PNG to WEBP',
    description: 'Convert PNG images to WEBP format.',
    serverOp: 'convert',
    mode: 'server',
    defaultFormat: 'webp',
    downloadFilename: 'converted.webp'
  },
  {
    slug: 'webp-to-png',
    name: 'WEBP to PNG',
    description: 'Convert WEBP images to PNG format.',
    serverOp: 'convert',
    mode: 'server',
    defaultFormat: 'png',
    downloadFilename: 'converted.png'
  },
  {
    slug: 'gif-to-jpg',
    name: 'GIF to JPG',
    description: 'Convert GIF images to JPG format.',
    serverOp: 'convert',
    mode: 'server',
    defaultFormat: 'jpg',
    downloadFilename: 'converted.jpg'
  },
  {
    slug: 'gif-to-png',
    name: 'GIF to PNG',
    description: 'Convert GIF images to PNG format.',
    serverOp: 'convert',
    mode: 'server',
    defaultFormat: 'png',
    downloadFilename: 'converted.png'
  },
  {
    slug: 'svg-to-png',
    name: 'SVG to PNG',
    description: 'Convert SVG vector images to PNG raster.',
    serverOp: 'convert',
    mode: 'server',
    defaultFormat: 'png',
    downloadFilename: 'converted.png'
  },
  {
    slug: 'svg-to-jpg',
    name: 'SVG to JPG',
    description: 'Convert SVG vector images to JPG raster.',
    serverOp: 'convert',
    mode: 'server',
    defaultFormat: 'jpg',
    downloadFilename: 'converted.jpg'
  },
  {
    slug: 'image-format-converter',
    name: 'Image Format Converter',
    description: 'Convert images between JPG, PNG, and WEBP.',
    serverOp: 'convert',
    mode: 'server',
    fields: [{
      key: 'format',
      label: 'Output format',
      type: 'select',
      default: 'png',
      options: [
        { value: 'png', label: 'PNG' },
        { value: 'jpg', label: 'JPG' },
        { value: 'webp', label: 'WEBP' }
      ]
    }],
    downloadFilename: 'converted.png'
  },
  {
    slug: 'passport-photo-maker',
    name: 'Passport Photo Maker',
    description: 'Create standard 600×600 passport-style photos.',
    clientOp: 'social',
    defaultPreset: 'passport',
    downloadFilename: 'passport-photo.png'
  },
  {
    slug: 'meme-generator',
    name: 'Meme Generator',
    description: 'Add top and bottom meme text to images.',
    clientOp: 'meme',
    fields: [
      { key: 'topText', label: 'Top text', type: 'text', default: 'TOP TEXT' },
      { key: 'bottomText', label: 'Bottom text', type: 'text', default: 'BOTTOM TEXT' }
    ],
    downloadFilename: 'meme.png'
  },
  {
    slug: 'thumbnail-generator',
    name: 'Thumbnail Generator',
    description: 'Generate 300px thumbnails from any image.',
    serverOp: 'resize',
    mode: 'server',
    fields: [{ key: 'width', label: 'Width', type: 'number', default: 300 }],
    downloadFilename: 'thumbnail.png'
  },
  {
    slug: 'social-media-image-resizer',
    name: 'Social Media Image Resizer',
    description: 'Resize images for popular social media platforms.',
    clientOp: 'social',
    presetOptions: true,
    downloadFilename: 'social-image.png'
  },
  {
    slug: 'instagram-post-resizer',
    name: 'Instagram Post Resizer',
    description: 'Resize images to 1080×1080 for Instagram posts.',
    clientOp: 'social',
    defaultPreset: 'instagram-post',
    downloadFilename: 'instagram-post.png'
  },
  {
    slug: 'youtube-thumbnail-creator',
    name: 'YouTube Thumbnail Creator',
    description: 'Create 1280×720 YouTube thumbnail images.',
    clientOp: 'social',
    defaultPreset: 'youtube-thumbnail',
    downloadFilename: 'youtube-thumbnail.png'
  },
  {
    slug: 'facebook-cover-creator',
    name: 'Facebook Cover Creator',
    description: 'Create 820×312 Facebook cover images.',
    clientOp: 'social',
    defaultPreset: 'facebook-cover',
    downloadFilename: 'facebook-cover.png'
  },
  {
    slug: 'image-collage-maker',
    name: 'Image Collage Maker',
    description: 'Combine multiple images into a collage grid.',
    mode: 'collage',
    multiple: true,
    fields: [{ key: 'columns', label: 'Columns', type: 'number', default: 2, min: 1, max: 4 }],
    downloadFilename: 'collage.png'
  },
  {
    slug: 'image-grid-maker',
    name: 'Image Grid Maker',
    description: 'Create a grid layout from multiple images.',
    mode: 'collage',
    multiple: true,
    fields: [{ key: 'columns', label: 'Grid columns', type: 'number', default: 3, min: 2, max: 4 }],
    downloadFilename: 'grid.png'
  },
  {
    slug: 'screenshot-to-image',
    name: 'Screenshot to Image Converter',
    description: 'Convert and optimize screenshot uploads to PNG or JPG.',
    serverOp: 'convert',
    mode: 'server',
    defaultFormat: 'png',
    useCamera: true,
    downloadFilename: 'screenshot.png'
  }
];
