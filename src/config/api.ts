// API Configuration
export const API_CONFIG = {
  // Base URL for the external API (fallback)
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://oem.platform-api-test.joulepoint.com',
  
  // Local proxy endpoint (used by RTK Query and API client)
  PROXY_URL: '/api/proxy',
  
  // Timeout for API requests
  TIMEOUT: 10000,
} as const;

// Helper function to generate dynamic company-based API URL
export const getCompanyApiUrl = (companyName: string): string => {
  if (!companyName || companyName.trim() === '') {
    throw new Error('Company name is required');
  }
  
  // Sanitize company name (remove spaces, special characters, convert to lowercase)
  const sanitizedCompanyName = companyName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (!sanitizedCompanyName) {
    throw new Error('Invalid company name provided');
  }
  
  return `https://${sanitizedCompanyName}.platform-api-test.joulepoint.com`;
};

// Helper function to get the full API URL
export const getApiUrl = (endpoint: string, companyName?: string): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Use company-specific URL if company name is provided
  const baseUrl = companyName ? getCompanyApiUrl(companyName) : API_CONFIG.BASE_URL;
  
  return `${baseUrl}/${cleanEndpoint}`;
};

// Helper function to get the proxy URL
export const getProxyUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.PROXY_URL}/${cleanEndpoint}`;
};
