// API Configuration
export const API_CONFIG = {
  // Base URL for the external API
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://oem.platform-api-test.joulepoint.com',
  
  // Local proxy endpoint (used by RTK Query and API client)
  PROXY_URL: '/api/proxy',
  
  // Timeout for API requests
  TIMEOUT: 10000,
} as const;

// Helper function to get the full API URL
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
};

// Helper function to get the proxy URL
export const getProxyUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.PROXY_URL}/${cleanEndpoint}`;
};
