import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export function middleware(request: NextRequest) {
  // Get the hostname of the request
  const hostname = request.headers.get('host') || 'localhost';
  const { pathname } = request.nextUrl;

  // Handle WebSocket upgrade requests
  if (pathname.startsWith('/ws/')) {
    const backendUrl = new URL(`http://localhost:8000${pathname}`);
    return NextResponse.rewrite(backendUrl);
  }

  // Handle API requests
  if (pathname.startsWith('/api/')) {
    const backendUrl = new URL(`http://localhost:8000${pathname}`);
    return NextResponse.rewrite(backendUrl);
  }

  // Continue normal processing for non-API requests
  return NextResponse.next();
}

// Configure the middleware to only run for API routes
export const config = {
  matcher: [
    '/api/:path*',
    '/ws/:path*',
  ],
}; 