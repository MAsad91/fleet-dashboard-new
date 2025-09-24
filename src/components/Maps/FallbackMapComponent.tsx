"use client";

import { useState } from "react";

interface FallbackMapComponentProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  vehicles?: Array<{
    id: string;
    lat: number;
    lng: number;
    name: string;
    status: string;
    battery?: number;
  }>;
}

export function FallbackMapComponent({ 
  center = { lat: 40.7128, lng: -74.0060 },
  zoom = 12,
  className = "h-96 w-full",
  vehicles = []
}: FallbackMapComponentProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return '#10B981';
      case 'in use': return '#3B82F6';
      case 'in_progress': return '#3B82F6';
      case 'maintenance': return '#F59E0B';
      case 'offline': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return '🟢';
      case 'in use': return '🔵';
      case 'in_progress': return '🔵';
      case 'maintenance': return '🟡';
      case 'offline': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className={className}>
      <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Status Banner */}
        <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-20">
          🗺️ Fallback Map Mode
        </div>
        
        {/* HTTPS Warning */}
        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-20 max-w-xs">
          ⚠️ Check API Key HTTPS Settings
        </div>

        {/* Center Marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <div className="w-6 h-6 bg-blue-500 border-3 border-white rounded-full shadow-lg"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-blue-500 opacity-30 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Vehicle Markers */}
        {vehicles.map((vehicle) => {
          const offsetX = (vehicle.lng - center.lng) * 200;
          const offsetY = (vehicle.lat - center.lat) * 200;
          
          return (
            <div
              key={vehicle.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
              style={{
                left: `calc(50% + ${offsetX}px)`,
                top: `calc(50% + ${offsetY}px)`,
              }}
              onClick={() => setSelectedVehicle(selectedVehicle === vehicle.id ? null : vehicle.id)}
            >
              <div 
                className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: getStatusColor(vehicle.status) }}
                title={`${vehicle.name} - ${vehicle.status}`}
              >
                🚗
              </div>
              
              {/* Vehicle Info Popup */}
              {selectedVehicle === vehicle.id && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 min-w-[200px] z-30">
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">
                      {vehicle.name}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{getStatusIcon(vehicle.status)}</span>
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {vehicle.status}
                      </span>
                    </div>
                    {vehicle.battery && (
                      <div className="text-gray-600 dark:text-gray-400">
                        Battery: {vehicle.battery}%
                      </div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}
                    </div>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div>
                </div>
              )}
            </div>
          );
        })}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          <button 
            className="w-8 h-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => console.log('Zoom in')}
          >
            +
          </button>
          <button 
            className="w-8 h-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => console.log('Zoom out')}
          >
            −
          </button>
        </div>

        {/* Map Type Selector */}
        <div className="absolute bottom-4 left-4 flex gap-1 z-20">
          <button 
            className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => console.log('Map view')}
          >
            Map
          </button>
          <button 
            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            onClick={() => console.log('Satellite view')}
          >
            Satellite
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 text-xs z-20">
          <div className="font-semibold text-gray-900 dark:text-white mb-2">Vehicle Status</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-600 dark:text-gray-400">In Use</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Offline</span>
            </div>
          </div>
        </div>

        {/* Coordinates Display */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 z-20">
          📍 {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
        </div>

        {/* HTTPS Troubleshooting Info */}
        <div className="absolute bottom-16 left-4 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-lg border border-red-200 dark:border-red-800 p-3 text-xs max-w-sm z-20">
          <div className="font-semibold text-red-800 dark:text-red-200 mb-2">🔧 HTTPS Troubleshooting</div>
          <div className="text-red-700 dark:text-red-300 space-y-1">
            <div>• Ensure API key allows HTTPS domains</div>
            <div>• Check Google Cloud Console settings</div>
            <div>• Verify domain restrictions</div>
            <div>• Test at <a href="/api-test" className="underline">/api-test</a></div>
          </div>
        </div>
      </div>
    </div>
  );
}
