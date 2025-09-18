import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://oem.platform-api-test.joulepoint.com';

export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE');
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

async function handleRequest(request: NextRequest, method: string) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // Remove 'api' and 'proxy' from the path segments
    // Original: /api/proxy/users/login_with_password/
    // We want: /api/users/login_with_password/
    let apiPath = pathSegments.slice(2).join('/');
    
    // Ensure we have the /api prefix for Django
    if (!apiPath.startsWith('api/')) {
      apiPath = 'api/' + apiPath;
    }
    
    // Preserve trailing slashes - they are critical for Django
    const originalPath = url.pathname;
    const hasTrailingSlash = originalPath.endsWith('/') && originalPath.length > 1;
    if (hasTrailingSlash && !apiPath.endsWith('/')) {
      apiPath = apiPath + '/';
    }
    
    console.log(`🔐 API Route: ${method} request to /${apiPath}`);
    console.log(`🔐 Original path: ${originalPath}`);
    console.log(`🔐 Processed path: ${apiPath}`);
    
    // Build the full URL with query parameters
    const fullUrl = new URL(`${API_BASE_URL}/${apiPath}`);
    
    // Copy query parameters from the original request
    url.searchParams.forEach((value, key) => {
      fullUrl.searchParams.set(key, value);
    });
    
    console.log(`🔐 Full URL: ${fullUrl.toString()}`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log(`🔐 Auth header: ${authHeader.substring(0, 20)}...`);
    } else {
      console.log('❌ No auth header found');
    }
    
    let body = undefined;
    if (method !== 'GET') {
      try {
        body = await request.text();
        console.log(`🔐 Request body: ${body}`);
      } catch (error) {
        console.log('No body in request');
      }
    }
    
    const response = await fetch(fullUrl.toString(), {
      method,
      headers,
      body,
    });
    
    console.log(`🔐 API Route: External API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ API Route: External API error:`, errorData);
      return NextResponse.json(
        { error: 'API request failed', details: errorData },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log(`✅ API Route: ${method} request successful`);
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('❌ API Route: Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
