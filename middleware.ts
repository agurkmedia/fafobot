import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only intercept API requests to our market endpoint
  if (pathname.startsWith('/api/market/')) {
    // Extract the path after /api/market/
    const apiPath = pathname.replace('/api/market/', '');
    
    // Get the query string
    const searchParams = request.nextUrl.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';
    
    // Create the target URL
    const targetUrl = `${API_BASE_URL}/api/market/${apiPath}${queryString}`;
    
    try {
      // Handle different HTTP methods
      const options: RequestInit = {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      // Add body for POST, PUT, PATCH requests
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const body = await request.text();
        if (body) {
          options.body = body;
        }
      }
      
      // Forward the request to the API
      const response = await fetch(targetUrl, options);
      
      // Get the response data
      const data = await response.json();
      
      // Return the response
      return NextResponse.json(data, { status: response.status });
    } catch (error) {
      console.error(`Error proxying ${request.method} request to ${targetUrl}:`, error);
      return NextResponse.json(
        { error: 'Failed to communicate with API' },
        { status: 500 }
      );
    }
  }
  
  // Continue normal processing for non-API requests
  return NextResponse.next();
}

// Configure the middleware to only run for API routes
export const config = {
  matcher: '/api/market/:path*',
}; 