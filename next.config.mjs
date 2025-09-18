/** @type {import("next").NextConfig} */
const nextConfig = {
  // Disable automatic trailing slash handling
  trailingSlash: false,
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: ""
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: ""
      },
      {
        protocol: "https",
        hostname: "pub-b7fd9c30cdbf439183b75041f5f71b92.r2.dev",
        port: ""
      }
    ]
  },
  
  // Render deployment configuration
  output: 'standalone',
  
  // API Proxy Configuration - Using API routes instead of rewrites
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/proxy/:path*',
  //       destination: 'https://oem.platform-api-test.joulepoint.com/api/:path*',
  //     },
  //   ];
  // },
  
  // Headers for CORS and API handling
  async headers() {
    return [
      {
        source: '/api/proxy/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
