import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG, getCompanyApiUrl } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

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
    // Original: /api/proxy/fleet/vehicles/
    // We want: /api/fleet/vehicles/
    let apiPath = pathSegments.slice(2).join('/');
    
    // Ensure we have the /api prefix for Django
    if (!apiPath.startsWith('api/')) {
      apiPath = 'api/' + apiPath;
    }
    
    // Preserve trailing slashes - they are critical for Django
    const originalPath = url.pathname;
    const hasTrailingSlash = originalPath.endsWith('/') && originalPath.length > 1;
    
    // For Django REST framework, most endpoints expect trailing slashes
    // Add trailing slash if not present and the path doesn't end with a query parameter
    if (!apiPath.endsWith('/') && !apiPath.includes('?')) {
      apiPath = apiPath + '/';
    }
    
    console.log(`🔐 API Route: ${method} request to /${apiPath}`);
    console.log(`🔐 Original path: ${originalPath}`);
    console.log(`🔐 Processed path: ${apiPath}`);
    
    // Check if we have a company name in the request headers or query params
    let baseUrl = API_BASE_URL;
    const companyName = request.headers.get('x-company-name') || url.searchParams.get('company');
    
    if (companyName && companyName.trim()) {
      try {
        baseUrl = getCompanyApiUrl(companyName);
        console.log(`🔐 Using company-specific URL: ${baseUrl} for company: ${companyName}`);
      } catch (error) {
        console.error(`❌ Invalid company name: ${companyName}`, error);
        return NextResponse.json(
          { error: 'Invalid company name provided' },
          { status: 400 }
        );
      }
    }
    
    // Build the full URL with query parameters
    const fullUrl = new URL(`${baseUrl.replace(/\/$/, '')}/${apiPath}`);
    
    // Copy query parameters from the original request (except company)
    url.searchParams.forEach((value, key) => {
      if (key !== 'company') {
        fullUrl.searchParams.set(key, value);
      }
    });
    
    console.log(`🔐 Full URL: ${fullUrl.toString()}`);
    
    const headers: Record<string, string> = {};
    
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log(`🔐 Auth header: ${authHeader.substring(0, 20)}...`);
    } else {
      console.log('❌ No auth header found');
    }
    
    let body = undefined;
    if (method !== 'GET') {
      const contentType = request.headers.get('content-type');
      console.log(`🔐 Content-Type: ${contentType}`);
      
      if (contentType && contentType.includes('multipart/form-data')) {
        // For form data, pass the body as-is and preserve the content-type
        headers['Content-Type'] = contentType; // ← This is crucial!
        body = await request.arrayBuffer();
        console.log(`🔐 Form data body size: ${body.byteLength} bytes`);
        console.log(`🔐 Preserved Content-Type: ${contentType}`);
      } else {
        // For JSON and other content types
        headers['Content-Type'] = contentType || 'application/json';
        try {
          body = await request.text();
          console.log(`🔐 Request body: ${body}`);
        } catch (error) {
          console.log('No body in request');
        }
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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Company-Name',
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
