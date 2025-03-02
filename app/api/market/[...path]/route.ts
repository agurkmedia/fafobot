import { NextRequest, NextResponse } from 'next/server';

// The base URL of your backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Helper function to safely access params
async function getPathSegments(params: any): Promise<string[]> {
  // This forces the params to be awaited
  return Promise.resolve().then(() => {
    return Array.isArray(params.path) ? params.path : [params.path];
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Use the helper function to get path segments
  const pathSegments = await getPathSegments(params);
  const path = pathSegments.join('/');
  
  const searchParams = request.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/market/${path}${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error proxying GET request to /api/market/${path}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch data from API' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Use the helper function to get path segments
  const pathSegments = await getPathSegments(params);
  const path = pathSegments.join('/');
  
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/api/market/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error proxying POST request to /api/market/${path}:`, error);
    return NextResponse.json(
      { error: 'Failed to send data to API' },
      { status: 500 }
    );
  }
} 