import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const protectedPaths = ['/owner'];

export function middleware(req) {
  const url = req.nextUrl;
  const isProtected = protectedPaths.some((path) =>
    url.pathname.startsWith(path)
  );

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get('owner_token')?.value;

  // Replace this with real token/session validation
  const isLoggedIn = !!token;

  if (!isLoggedIn) {
    const loginUrl = new URL('/owner-login', req.url);
    loginUrl.searchParams.set('redirect', url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/owner/:path*'],
};
