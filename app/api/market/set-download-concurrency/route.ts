import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Get the concurrency from the query parameter
    const searchParams = request.nextUrl.searchParams;
    const concurrency = searchParams.get('concurrency');
    
    if (!concurrency) {
      return NextResponse.json(
        { error: 'Missing concurrency parameter' },
        { status: 400 }
      );
    }
    
    console.log(`Setting concurrency to: ${concurrency}`);
    
    // Call the backend API with the query parameter
    const response = await fetch(`${API_BASE_URL}/api/market/set-download-concurrency?concurrency=${concurrency}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`Backend response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error (${response.status}): ${errorText}`);
      return NextResponse.json(
        { error: `Backend returned ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Backend response data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error setting concurrency:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to set concurrency' },
      { status: 500 }
    );
  }
} 