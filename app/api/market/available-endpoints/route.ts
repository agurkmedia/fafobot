import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // Try to get the OpenAPI schema which lists all endpoints
    const response = await fetch(`${API_BASE_URL}/openapi.json`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to get API schema: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract the paths (endpoints) from the OpenAPI schema
    const paths = Object.keys(data.paths || {});
    
    return NextResponse.json({
      endpoints: paths
    });
  } catch (error) {
    console.error('Error getting available endpoints:', error);
    return NextResponse.json(
      { error: 'Failed to get available endpoints' },
      { status: 500 }
    );
  }
} 