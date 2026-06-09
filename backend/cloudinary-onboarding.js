#!/usr/bin/env node
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: 'dqwozzjb7',
  api_key: '232197833779359',
  api_secret: '-p65SEbPUptqfkHrcqkNDhGTqZk'
});

const SAMPLE_IMAGE_URL = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

async function main() {
  console.log('Uploading sample image from Cloudinary demo...\n');

  const uploadResult = await cloudinary.uploader.upload(SAMPLE_IMAGE_URL);
  console.log('Secure URL:', uploadResult.secure_url);
  console.log('Public ID:', uploadResult.public_id);
  console.log('');

  console.log('Fetching image metadata...\n');
  const details = await cloudinary.api.resource(uploadResult.public_id);
  console.log('Width:', details.width);
  console.log('Height:', details.height);
  console.log('Format:', details.format);
  console.log('Bytes:', details.bytes);
  console.log('');

  // f_auto — Cloudinary picks the best image format for the visitor's browser (e.g. WebP).
  // q_auto — Cloudinary automatically balances quality and file size.
  const transformedUrl = cloudinary.url(uploadResult.public_id, {
    secure: true,
    transformation: [{ fetch_format: 'auto', quality: 'auto' }]
  });

  console.log('Done! Click link below to see optimized version of the image. Check the size and the format.');
  console.log(transformedUrl);
}

main().catch((error) => {
  console.error('Cloudinary onboarding failed:', error.message || error);
  process.exit(1);
});
