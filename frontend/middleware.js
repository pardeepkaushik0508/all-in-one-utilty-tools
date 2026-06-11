import { NextResponse } from 'next/server';

const WWW_HOST = 'www.utilitytools.in';
const CANONICAL_HOST = 'utilitytools.in';

export function middleware(request) {
  const host = request.headers.get('host')?.split(':')[0];

  if (host === WWW_HOST) {
    const url = request.nextUrl.clone();
    url.hostname = CANONICAL_HOST;
    url.protocol = 'https:';
    url.port = '';
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image).*)'
};
