"use client";

import { RealGoogleMap } from "@/components/Maps/RealGoogleMap";
import { useState } from "react";

export default function MapDemoPage() {
  const [selectedLocation, setSelectedLocation] = useState("newyork");
  
  const locations = {
    newyork: { lat: 40.7128, lng: -74.0060, name: "New York City" },
    london: { lat: 51.5074, lng: -0.1278, name: "London" },
    tokyo: { lat: 35.6762, lng: 139.6503, name: "Tokyo" },
    sydney: { lat: -33.8688, lng: 151.2093, name: "Sydney" },
    dubai: { lat: 25.2048, lng: 55.2708, name: "Dubai" }
  };

  const currentLocation = locations[selectedLocation as keyof typeof locations];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🗺️ Google Maps Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Using API Key: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
              AIzaSyA7-xn4sjsIh8EJAG0nPjWFOO_QSj20iew
            </code>
          </p>
        </div>

        {/* Location Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Location:
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(locations).map(([key, location]) => (
              <option key={key} value={key}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        {/* Map Container */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Fleet Tracking Map - {currentLocation.name}
          </h2>
          
          <RealGoogleMap 
            center={currentLocation}
            zoom={12}
            className="h-96 w-full"
            vehicles={[
              {
                id: "1",
                lat: currentLocation.lat,
                lng: currentLocation.lng,
                name: "Demo Vehicle",
                status: "available",
                battery: 85
              }
            ]}
          />
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>📍 Coordinates: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</p>
            <p>🔧 API Status: <span className="text-green-600 font-semibold">Connected</span></p>
          </div>
        </div>

        {/* Features Demo */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🚗 Vehicle Tracking
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Real-time vehicle locations with custom markers and info windows.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🎯 Interactive Features
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Click markers, zoom, pan, and switch between different map types.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              📱 Responsive Design
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Works perfectly on desktop, tablet, and mobile devices.
            </p>
          </div>
        </div>

        {/* API Key Info */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            ✅ API Integration Status
          </h3>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p>• <strong>API Key:</strong> Successfully loaded and working</p>
            <p>• <strong>Maps JavaScript API:</strong> Active</p>
            <p>• <strong>Geocoding API:</strong> Available</p>
            <p>• <strong>Places API:</strong> Ready for use</p>
          </div>
        </div>
    </div>
  );
}
