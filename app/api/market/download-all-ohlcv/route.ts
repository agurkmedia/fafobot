import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const concurrency = body.concurrency || 10;
    
    // Build the request URL with query parameters
    const url = `${API_BASE_URL}/api/market/download-all-ohlcv?concurrency=${concurrency}`;
    
    console.log('Starting download with URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error (${response.status}): ${errorText}`);
      return NextResponse.json(
        { error: `Backend returned ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error starting download:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start download' },
      { status: 500 }
    );
  }
} 