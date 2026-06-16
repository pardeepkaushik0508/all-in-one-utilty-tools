export const CANONICAL_SITE_URL = 'https://utilitytools.in';

export function getSiteUrl(request) {
  const host = request?.headers?.host?.split(':')[0];
  if (host === 'utilitytools.in' || host === 'www.utilitytools.in') {
    return CANONICAL_SITE_URL;
  }

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }

  return CANONICAL_SITE_URL;
}
