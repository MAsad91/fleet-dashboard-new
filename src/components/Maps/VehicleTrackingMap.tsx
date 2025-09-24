"use client";

import { GoogleMapWrapper } from "./GoogleMapWrapper";
import { useState, useEffect } from "react";
import { MapPin, Navigation, Car, AlertCircle } from "lucide-react";

interface Vehicle {
  id: string;
  name: string;
  license_plate: string;
  driver: string;
  status: "in_progress" | "completed" | "cancelled" | "scheduled";
  location: {
    lat: number;
    lng: number;
  };
  last_updated: string;
  speed?: number;
  battery_level?: number;
}

interface VehicleTrackingMapProps {
  vehicles?: Vehicle[];
  className?: string;
  onVehicleClick?: (vehicle: Vehicle) => void;
  selectedVehicleId?: string;
}

// Mock vehicle data for demonstration
const mockVehicles: Vehicle[] = [
  {
    id: "1",
    name: "EV-001",
    license_plate: "ABC-123",
    driver: "John Doe",
    status: "in_progress",
    location: { lat: 40.7128, lng: -74.0060 },
    last_updated: new Date().toISOString(),
    speed: 45,
    battery_level: 85,
  },
  {
    id: "2",
    name: "EV-002",
    license_plate: "XYZ-789",
    driver: "Jane Smith",
    status: "in_progress",
    location: { lat: 40.7589, lng: -73.9851 },
    last_updated: new Date().toISOString(),
    speed: 32,
    battery_level: 92,
  },
  {
    id: "3",
    name: "EV-003",
    license_plate: "DEF-456",
    driver: "Mike Johnson",
    status: "completed",
    location: { lat: 40.6892, lng: -74.0445 },
    last_updated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    speed: 0,
    battery_level: 78,
  },
];

export function VehicleTrackingMap({
  vehicles = mockVehicles,
  className = "h-96 w-full",
  onVehicleClick,
  selectedVehicleId,
}: VehicleTrackingMapProps) {
  const [map, setMap] = useState<any | null>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [infoWindows, setInfoWindows] = useState<any[]>([]);

  // Calculate map center based on vehicle locations
  const getMapCenter = () => {
    if (vehicles.length === 0) {
      return { lat: 40.7128, lng: -74.0060 }; // Default to New York
    }

    const avgLat = vehicles.reduce((sum, vehicle) => sum + vehicle.location.lat, 0) / vehicles.length;
    const avgLng = vehicles.reduce((sum, vehicle) => sum + vehicle.location.lng, 0) / vehicles.length;
    
    return { lat: avgLat, lng: avgLng };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "#10B981"; // Green
      case "completed":
        return "#3B82F6"; // Blue
      case "cancelled":
        return "#EF4444"; // Red
      case "scheduled":
        return "#F59E0B"; // Yellow
      default:
        return "#6B7280"; // Gray
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress":
        return "🚗";
      case "completed":
        return "✅";
      case "cancelled":
        return "❌";
      case "scheduled":
        return "⏰";
      default:
        return "🚗";
    }
  };

  const createCustomMarker = (vehicle: Vehicle) => {
    const color = getStatusColor(vehicle.status);
    const icon = getStatusIcon(vehicle.status);
    
    return {
      path: 'CIRCLE' as any,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
      scale: 12,
      label: {
        text: icon,
        fontSize: "12px",
        fontWeight: "bold",
      },
    };
  };

  const createInfoWindowContent = (vehicle: Vehicle) => {
    return `
      <div class="p-3 min-w-[200px]">
        <div class="flex items-center mb-2">
          <span class="text-lg mr-2">${getStatusIcon(vehicle.status)}</span>
          <h3 class="font-semibold text-gray-900">${vehicle.name}</h3>
        </div>
        <div class="space-y-1 text-sm text-gray-600">
          <p><strong>License:</strong> ${vehicle.license_plate}</p>
          <p><strong>Driver:</strong> ${vehicle.driver}</p>
          <p><strong>Status:</strong> <span class="capitalize">${vehicle.status.replace('_', ' ')}</span></p>
          ${vehicle.speed ? `<p><strong>Speed:</strong> ${vehicle.speed} km/h</p>` : ''}
          ${vehicle.battery_level ? `<p><strong>Battery:</strong> ${vehicle.battery_level}%</p>` : ''}
          <p><strong>Last Updated:</strong> ${new Date(vehicle.last_updated).toLocaleTimeString()}</p>
        </div>
        <div class="mt-2">
          <button 
            onclick="window.selectVehicle('${vehicle.id}')"
            class="w-full bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
          >
            View Details
          </button>
        </div>
      </div>
    `;
  };

  // Set up markers when map loads
  useEffect(() => {
    if (!map || vehicles.length === 0) return;

    // Clear existing markers and info windows
    markers.forEach(marker => marker.setMap(null));
    infoWindows.forEach(infoWindow => infoWindow.close());
    
    const newMarkers: any[] = [];
    const newInfoWindows: any[] = [];

    vehicles.forEach((vehicle) => {
      const marker = new window.google.maps.Marker({
        position: vehicle.location,
        map: map,
        title: vehicle.name,
        icon: createCustomMarker(vehicle),
        animation: vehicle.status === "in_progress" ? 'BOUNCE' as any : undefined,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: createInfoWindowContent(vehicle),
      });

      marker.addListener("click", () => {
        // Close all other info windows
        newInfoWindows.forEach(iw => iw.close());
        infoWindow.open(map, marker);
        onVehicleClick?.(vehicle);
      });

      newMarkers.push(marker);
      newInfoWindows.push(infoWindow);
    });

    setMarkers(newMarkers);
    setInfoWindows(newInfoWindows);

    // Add global function for info window buttons
    (window as any).selectVehicle = (vehicleId: string) => {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        onVehicleClick?.(vehicle);
      }
    };

    return () => {
      // Cleanup
      newMarkers.forEach(marker => marker.setMap(null));
      newInfoWindows.forEach(infoWindow => infoWindow.close());
      delete (window as any).selectVehicle;
    };
  }, [map, vehicles, onVehicleClick]);

  // Update map center when vehicles change
  useEffect(() => {
    if (map && vehicles.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      vehicles.forEach(vehicle => {
        bounds.extend(vehicle.location);
      });
      map.fitBounds(bounds);
    }
  }, [map, vehicles]);

  const handleMapLoad = (mapInstance: any) => {
    setMap(mapInstance);
  };

  const handleMapClick = (event: any) => {
    // Close all info windows when clicking on map
    infoWindows.forEach(infoWindow => infoWindow.close());
  };

  return (
    <div className={className}>
      <GoogleMapWrapper
        center={getMapCenter()}
        zoom={vehicles.length > 1 ? 10 : 12}
        onMapLoad={handleMapLoad}
        onMapClick={handleMapClick}
        className="h-full w-full"
      />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 space-y-2">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Legend
        </div>
        <div className="space-y-1">
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>Cancelled</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span>Scheduled</span>
          </div>
        </div>
      </div>

      {/* Vehicle Stats */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Fleet Status
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-gray-600 dark:text-gray-400">Total Vehicles</div>
            <div className="font-semibold">{vehicles.length}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Active</div>
            <div className="font-semibold text-green-600">
              {vehicles.filter(v => v.status === "in_progress").length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
