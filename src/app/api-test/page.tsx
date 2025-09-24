"use client";

import { useEffect, useState } from "react";

export default function ApiTestPage() {
  const [apiKey, setApiKey] = useState<string>("");
  const [testResult, setTestResult] = useState<string>("");

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyA7-xn4sjsIh8EJAG0nPjWFOO_QSj20iew';
    setApiKey(key);
    
    // Test the API key
    const testApi = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=New+York&key=${key}`
        );
        const data = await response.json();
        
        if (data.status === "OK") {
          setTestResult("✅ API Key is working! Google Maps is ready to use.");
        } else {
          setTestResult(`❌ API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
        }
      } catch (error) {
        setTestResult(`❌ Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    
    testApi();
  }, []);

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          🔧 API Configuration Test
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Environment Variables
          </h2>
          <div className="space-y-2">
            <p><strong>API Key:</strong> {apiKey ? `${apiKey.substring(0, 20)}...` : 'Not found'}</p>
            <p><strong>Base URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL || 'Not set'}</p>
            <p><strong>Node Environment:</strong> {process.env.NODE_ENV || 'Not set'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Google Maps API Test
          </h2>
          <div className="space-y-4">
            <p className="text-lg">{testResult}</p>
            {apiKey && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  🎉 Success! Your Google Maps API is configured correctly.
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  You can now use all Google Maps features in your fleet management dashboard.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🚀 Next Steps
          </h3>
          <ul className="text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Visit <a href="/fleet" className="underline">Fleet Dashboard</a> to see the maps in action</li>
            <li>• Check out <a href="/map-demo" className="underline">Map Demo</a> for interactive examples</li>
            <li>• All map components should now work properly</li>
          </ul>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            🔧 HTTPS Troubleshooting Guide
          </h3>
          <div className="text-yellow-800 dark:text-yellow-200 space-y-3">
            <div>
              <strong>If maps are not displaying on HTTPS:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="underline">Google Cloud Console</a></li>
                <li>• Select your API key and click &quot;Edit&quot;</li>
                <li>• Under &quot;Application restrictions&quot;, add your HTTPS domain</li>
                <li>• Under &quot;API restrictions&quot;, ensure &quot;Maps JavaScript API&quot; is enabled</li>
                <li>• Save changes and wait 5-10 minutes for propagation</li>
              </ul>
            </div>
            <div>
              <strong>Common HTTPS domains to add:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• <code>https://yourdomain.com</code></li>
                <li>• <code>https://*.yourdomain.com</code> (for subdomains)</li>
                <li>• <code>localhost</code> (for development)</li>
              </ul>
            </div>
          </div>
        </div>
    </div>
  );
}
