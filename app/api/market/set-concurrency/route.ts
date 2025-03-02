import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const concurrency = body.concurrency;
    
    // This is the correct endpoint with the concurrency as a query parameter
    const endpoint = `/api/market/set-download-concurrency?concurrency=${concurrency}`;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // No body needed as it's a query parameter
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
    console.error('Error setting concurrency:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to set concurrency' },
      { status: 500 }
    );
  }
} 