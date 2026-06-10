const CATEGORY_PROFILES = {
  'PDF Tools': {
    audience: 'students, freelancers, small businesses, and office teams',
    context: 'document workflows, contracts, reports, and scanned paperwork',
    privacy: 'Files are processed securely and are not stored permanently after your session.',
    keywords: ['pdf tool', 'online pdf', 'free pdf', 'document converter']
  },
  'Image Tools': {
    audience: 'designers, marketers, bloggers, and ecommerce sellers',
    context: 'web performance, social media assets, and product photography',
    privacy: 'Your images are handled server-side for processing and removed after download.',
    keywords: ['image tool', 'online image editor', 'photo utility', 'free image converter']
  },
  'Video/Audio Tools': {
    audience: 'content creators, podcasters, educators, and video editors',
    context: 'media production, sharing clips, and optimizing file sizes',
    privacy: 'Media files are processed on the server and cleaned up after delivery.',
    keywords: ['video tool', 'audio converter', 'mp3 extractor', 'media utility']
  },
  'Text Tools': {
    audience: 'writers, students, marketers, and content teams',
    context: 'editing, rewriting, originality checks, and AI-assisted drafting',
    privacy: 'Text is sent to processing APIs only when required and is not archived.',
    keywords: ['writing tool', 'text utility', 'grammar check', 'ai writing assistant']
  },
  'Developer Tools': {
    audience: 'frontend developers, backend engineers, and technical writers',
    context: 'debugging payloads, cleaning code, and preparing documentation',
    privacy: 'Snippets are processed in memory and not persisted on the server.',
    keywords: ['developer tool', 'code formatter', 'json utility', 'web dev helper']
  },
  'Social Media Tools': {
    audience: 'social media managers, influencers, and growth marketers',
    context: 'content repurposing, thumbnails, hashtags, and campaign planning',
    privacy: 'Only public URLs you provide are accessed — no account login required.',
    keywords: ['social media tool', 'hashtag generator', 'thumbnail downloader']
  },
  'Security Tools': {
    audience: 'IT teams, privacy-conscious users, and everyday internet users',
    context: 'password hygiene, credential strength, and data integrity checks',
    privacy: 'Passwords and hashes are processed without being stored or logged.',
    keywords: ['security tool', 'password generator', 'hash utility', 'online security']
  },
  'Utility Tools': {
    audience: 'students, travelers, shoppers, and professionals',
    context: 'everyday calculations, conversions, and quick decision support',
    privacy: 'Inputs are used only to compute your result in real time.',
    keywords: ['utility tool', 'online calculator', 'unit converter', 'free converter']
  }
};

export function getCategoryProfile(category) {
  return CATEGORY_PROFILES[category] || CATEGORY_PROFILES['Utility Tools'];
}

export default CATEGORY_PROFILES;
