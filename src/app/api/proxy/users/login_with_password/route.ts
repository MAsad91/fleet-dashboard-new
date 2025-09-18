import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://oem.platform-api-test.joulepoint.com';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Direct login route called');
    
    const fullUrl = `${API_BASE_URL}/api/users/login_with_password/`;
    console.log(`🔐 Proxying to: ${fullUrl}`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log(`🔐 Auth header: ${authHeader.substring(0, 20)}...`);
    }
    
    const body = await request.text();
    console.log(`🔐 Request body: ${body}`);
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body,
    });
    
    console.log(`🔐 Backend response: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ Backend error:`, errorData);
      return NextResponse.json(
        { error: 'API request failed', details: errorData },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log(`✅ Login successful`);
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('❌ Login route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

