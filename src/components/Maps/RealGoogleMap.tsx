"use client";

import { useEffect, useRef, useState } from "react";
import { FallbackMapComponent } from "./FallbackMapComponent";

interface RealGoogleMapProps {
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

export function RealGoogleMap({ 
  center = { lat: 40.7128, lng: -74.0060 },
  zoom = 12,
  className = "h-96 w-full",
  vehicles = []
}: RealGoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<any | null>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  // Use environment variable or fallback API key
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_MAP_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dgsW6T9bWqJ1zI';
  

  useEffect(() => {
    // Define global callback for Google Maps
    (window as any).initMap = () => {
      console.log('🎯 Google Maps callback triggered');
      initializeMap();
    };

    const loadGoogleMaps = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          console.log('✅ Google Maps already loaded');
          initializeMap();
          return;
        }

        // Check if we're on HTTPS and provide specific guidance
        if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
          console.log('🔒 HTTPS detected - ensuring API key allows HTTPS domains');
        }

        // Check if script is already loading
        if (document.getElementById('google-maps-script')) {
          console.log('🔄 Google Maps script already loading, waiting...');
          // Wait for it to load
          const checkLoaded = setInterval(() => {
            if (window.google && window.google.maps) {
              clearInterval(checkLoaded);
              console.log('✅ Google Maps loaded from existing script');
              initializeMap();
            }
          }, 100);
          return;
        }

        console.log('🌍 Loading Google Maps API...');
        
        // Load Google Maps API with proper HTTPS handling
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap&v=3.55`;
        script.async = true;
        script.defer = true;
        script.id = 'google-maps-script';
        script.crossOrigin = 'anonymous';

        // Set a timeout for loading
        const timeout = setTimeout(() => {
          if (!mapLoaded) {
            console.warn('⚠️ Google Maps loading timeout - likely HTTPS API key issue');
            console.error('🔍 HTTPS API Key Troubleshooting:');
            console.error('• Check if your domain is added to API key restrictions');
            console.error('• Ensure "Maps JavaScript API" is enabled');
            console.error('• Verify API key works on HTTP (for testing)');
            setError('Google Maps loading timeout - likely HTTPS API key configuration issue. Check console for troubleshooting steps.');
          }
        }, 15000); // 15 second timeout

        script.onload = () => {
          clearTimeout(timeout);
          console.log('✅ Google Maps API script loaded successfully');
          // The callback will handle initialization
        };

        script.onerror = (error) => {
          clearTimeout(timeout);
          console.error('❌ Failed to load Google Maps API:', error);
          console.error('🔍 HTTPS Issue Detected!');
          console.error('📋 Troubleshooting Steps:');
          console.error('1. Go to https://console.cloud.google.com/apis/credentials');
          console.error('2. Select your API key and click "Edit"');
          console.error('3. Under "Application restrictions", add your HTTPS domain');
          console.error('4. Under "API restrictions", ensure "Maps JavaScript API" is enabled');
          console.error('5. Save and wait 5-10 minutes for changes to propagate');
          setError('Failed to load Google Maps on HTTPS. Check console for detailed troubleshooting steps.');
        };

        document.head.appendChild(script);

      } catch (err) {
        console.error('❌ Error loading Google Maps:', err);
        setError('Error loading Google Maps');
      }
    };

            const initializeMap = () => {
              const tryInitialize = () => {
                if (!mapRef.current) {
                  console.error('❌ Map ref not available - this usually means Google Maps API failed to load on HTTPS');
                  setError('Map container not found. Check API key HTTPS settings.');
                  return;
                }
                
                // Check if the element has dimensions (is visible)
                const rect = mapRef.current.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) {
                  console.log('🔄 Map container not ready, retrying...');
                  setTimeout(tryInitialize, 100);
                  return;
                }
                
                if (!window.google || !window.google.maps) {
                  console.error('❌ Google Maps API not loaded');
                  setError('Google Maps API failed to load');
                  return;
                }

                try {
                  console.log('🗺️ Initializing Google Map...');
                  
                  const map = new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: zoom,
          mapTypeId: 'roadmap' as any,
          mapTypeControl: true,
          mapTypeControlOptions: {
            position: 'BOTTOM_LEFT' as any,
            style: 'HORIZONTAL_BAR' as any,
            mapTypeIds: [
              'roadmap' as any,
              'satellite' as any
            ]
          },
          streetViewControl: true,
          streetViewControlOptions: {
            position: 'RIGHT_BOTTOM' as any
          },
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: 'RIGHT_TOP' as any
          },
          zoomControl: true,
          zoomControlOptions: {
            position: 'RIGHT_TOP' as any
          },
          gestureHandling: "cooperative",
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "on" }],
            },
            {
              featureType: "transit",
              elementType: "labels",
              stylers: [{ visibility: "on" }],
            },
          ],
        });

        setMapInstance(map);
        setMapLoaded(true);
        setError(null);

        // Add vehicle markers
        addVehicleMarkers(map);

                  console.log('✅ Real Google Map initialized successfully');
                } catch (err) {
                  console.error('❌ Error initializing map:', err);
                  setError('Failed to initialize map');
                }
              };
              
              // Start trying to initialize
              tryInitialize();
            };

    const addVehicleMarkers = (map: any) => {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null));

      const newMarkers: any[] = [];

      vehicles.forEach((vehicle) => {
        const marker = new window.google.maps.Marker({
          position: { lat: vehicle.lat, lng: vehicle.lng },
          map: map,
          title: vehicle.name,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="${getStatusColor(vehicle.status)}" stroke="#FFFFFF" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">🚗</text>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16),
          },
          animation: 'DROP' as any,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #1F2937; font-size: 16px;">${vehicle.name}</h3>
              <div style="display: flex; align-items: center; margin: 4px 0;">
                <div style="width: 12px; height: 12px; background: ${getStatusColor(vehicle.status)}; border-radius: 50%; margin-right: 8px;"></div>
                <span style="color: #6B7280; font-size: 14px; text-transform: capitalize;">${vehicle.status}</span>
              </div>
              ${vehicle.battery ? `<p style="margin: 4px 0; color: #6B7280; font-size: 14px;">Battery: ${vehicle.battery}%</p>` : ''}
              <p style="margin: 4px 0; color: #9CA3AF; font-size: 12px;">${vehicle.lat.toFixed(4)}, ${vehicle.lng.toFixed(4)}</p>
            </div>
          `,
        });

        marker.addListener('click', () => {
          // Close all other info windows
          newMarkers.forEach(m => {
            if (m !== marker) {
              (m as any).infoWindow?.close();
            }
          });
          
          infoWindow.open(map, marker);
          (marker as any).infoWindow = infoWindow;
        });

        newMarkers.push(marker);
      });

      setMarkers(newMarkers);
    };

    loadGoogleMaps();

        return () => {
          // Cleanup markers
          markers.forEach(marker => marker.setMap(null));
          // Cleanup global callback
          delete (window as any).initMap;
        };
  }, [center, zoom, vehicles]);

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

  if (error) {
    return (
      <FallbackMapComponent
        center={center}
        zoom={zoom}
        className={className}
        vehicles={vehicles}
      />
    );
  }

  if (!mapLoaded) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading real-time map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
}
