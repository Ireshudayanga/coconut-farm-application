import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const ownerToken = request.cookies.get('owner_token')?.value;
  const farmerToken = request.cookies.get('farmer_token')?.value;

  // 1. Redirect if already authenticated
  if (pathname === '/owner-login' && ownerToken === 'valid') {
    return NextResponse.redirect(new URL('/owner/dashboard', request.url));
  }
  if (pathname === '/login' && farmerToken === '1') {
    return NextResponse.redirect(new URL('/farmer', request.url));
  }

  // 2. Owner pages protection
  if (pathname.startsWith('/owner')) {
    if (pathname === '/owner-login') {
      return NextResponse.next();
    }
    if (ownerToken !== 'valid') {
      const loginUrl = new URL('/owner-login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Farmer pages protection
  const farmerRoutes = ['/farmer', '/daily-update', '/qr-scan', '/tree'];
  const matchesFarmerRoute = farmerRoutes.some((route) => pathname.startsWith(route));
  
  if (matchesFarmerRoute) {
    if (farmerToken !== '1') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/owner/:path*',
    '/owner-login',
    '/login',
    '/farmer/:path*',
    '/farmer',
    '/daily-update/:path*',
    '/daily-update',
    '/qr-scan/:path*',
    '/qr-scan',
    '/tree/:path*',
  ],
};
