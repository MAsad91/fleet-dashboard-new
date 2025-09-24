"use client";

import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { useCallback, useEffect, useRef, useState } from "react";

// Type declarations for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

interface GoogleMapWrapperProps {
  center: { lat: number; lng: number };
  zoom: number;
  onMapLoad?: (map: google.maps.Map) => void;
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
  className?: string;
  children?: React.ReactNode;
}

const MapComponent = ({
  center,
  zoom,
  onMapLoad,
  onMapClick,
  className,
  children,
}: GoogleMapWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (ref.current && !map) {
      const mapInstance = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeId: 'roadmap' as any,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: "cooperative",
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      setMap(mapInstance);
      onMapLoad?.(mapInstance);

      // Add click listener
      if (onMapClick) {
        mapInstance.addListener("click", onMapClick);
      }
    }
  }, [ref, map, center, zoom, onMapLoad, onMapClick]);

  // Update map center and zoom when props change
  useEffect(() => {
    if (map) {
      map.setCenter(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

const render = (status: Status) => {
  console.log('Google Maps Status:', status);
  
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
          </div>
        </div>
      );
    case Status.FAILURE:
      console.error('Google Maps failed to load. Check API key and console for details.');
      return (
        <div className="flex items-center justify-center h-full bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-2">🗺️</div>
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to load Google Maps
            </p>
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
              Check console for details. Verify API key permissions.
            </p>
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
              API Key: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing'}
            </p>
          </div>
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
          </div>
        </div>
      );
  }
};

export function GoogleMapWrapper(props: GoogleMapWrapperProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Debug logging
  console.log('Google Maps API Key:', apiKey ? 'Present' : 'Missing');

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <div className="text-center">
          <div className="text-yellow-500 text-4xl mb-2">⚠️</div>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Google Maps API key not configured
          </p>
          <p className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">
            Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables
          </p>
        </div>
      </div>
    );
  }

  return (
    <Wrapper
      apiKey={apiKey}
      render={render}
      libraries={["places", "geometry"]}
      version="weekly"
    >
      <MapComponent {...props} />
    </Wrapper>
  );
}
