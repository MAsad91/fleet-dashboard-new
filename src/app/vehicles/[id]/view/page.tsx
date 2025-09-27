"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetVehicleByIdQuery, useGetAlertsQuery, useGetObdTelemetryQuery, useGetVehicleHistoryQuery, useGetTripsQuery, useListObdDevicesQuery, useGetSimCardsQuery, useListDashcamsQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { TabbedInterface } from "@/components/ui/TabbedInterface";
import { ArrowLeft, Edit, Trash2, Car, Wrench, Fuel, MapPin, Calendar, Settings, Battery, Gauge, History, Activity, AlertTriangle, Wifi, Smartphone, Camera, FileText, Eye } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function VehicleViewPage() {
  const router = useRouter();
  const params = useParams();
  
  // Extract vehicle ID from URL path
  const getVehicleId = () => {
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const vehicleIndex = pathParts.indexOf('vehicles');
      if (vehicleIndex !== -1 && pathParts[vehicleIndex + 1]) {
        return pathParts[vehicleIndex + 1];
      }
    }
    return params.id as string;
  };
  
  const vehicleId = getVehicleId();
  
  // Debug: Log the vehicleId and check if it's available
  console.log('Vehicle ID:', vehicleId);
  console.log('Params:', params);
  console.log('Window location:', typeof window !== 'undefined' ? window.location.pathname : 'SSR');
  
  const { data: vehicleData, isLoading, error } = useGetVehicleByIdQuery(vehicleId, { skip: !vehicleId });
  const { data: alertsData } = useGetAlertsQuery({ vehicle: vehicleId, status: 'active', limit: 5 }, { skip: !vehicleId });
  const { data: historyData } = useGetVehicleHistoryQuery({ vehicle_id: vehicleId }, { skip: !vehicleId });
  const { data: tripsData } = useGetTripsQuery({ vehicle: vehicleId, status: 'completed' }, { skip: !vehicleId });
  // NOTE: APIs for OBD devices, SIM cards, and dashcams are missing from Postman collection
  // Using mock data until proper APIs are implemented
  // TODO: Implement these APIs in the backend:
  // - GET /api/fleet/obd-devices/?vehicle={id}&brief=true
  // - GET /api/fleet/sim-cards/?device={obd_device_id}&brief=true  
  // - GET /api/fleet/dashcams/?vehicle={id}&brief=true
  const { data: obdDevicesData } = useListObdDevicesQuery({}, { skip: !vehicleId });
  const { data: simCardsData } = useGetSimCardsQuery({ device: vehicleId }, { skip: !vehicleId });
  const { data: dashcamsData } = useListDashcamsQuery({ vehicle_id: vehicleId }, { skip: !vehicleId });

  // Debug: Log API responses
  console.log('Vehicle Data:', vehicleData);
  console.log('OBD Devices Data:', obdDevicesData);
  console.log('SIM Cards Data:', simCardsData);
  console.log('Dashcams Data:', dashcamsData);
  console.log('History Data:', historyData);
  console.log('Trips Data:', tripsData);
  

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Don't render if vehicleId is not available
  if (!vehicleId) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="text-center text-red-600">
            <p>Invalid vehicle ID. Please check the URL.</p>
            <Button 
              onClick={() => router.back()} 
              variant="primary" 
              label="Back to Vehicles"
              className="mt-4"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !vehicleData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="text-center text-red-600">
            <p>Failed to load vehicle details. Please try again.</p>
            <Button 
              onClick={() => router.back()} 
              variant="primary" 
              label="Back to Vehicles"
              className="mt-4"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const vehicle = vehicleData.vehicle || vehicleData;
  const latestObd = vehicleData.latest_obd;
  const recentAlerts = vehicleData.recent_alerts || alertsData?.results || [];

  // Tab content components
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Vehicle Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">VEHICLE INFORMATION</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Vehicle Type:</span>
              <span className="text-gray-900 dark:text-white">{vehicle.vehicle_type || vehicle.vehicle_type_name || 'N/A'} (ID: {vehicle.vehicle_type_id || 'N/A'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">VIN:</span>
              <span className="text-gray-900 dark:text-white">{vehicle.vin || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">License Plate:</span>
              <span className="text-gray-900 dark:text-white">{vehicle.license_plate || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Make:</span>
              <span className="text-gray-900 dark:text-white">{vehicle.make || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Model:</span>
              <span className="text-gray-900 dark:text-white">{vehicle.model || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Year:</span>
              <span className="text-gray-900 dark:text-white">{vehicle.year || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="text-gray-900 dark:text-white">{vehicle.status || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Health:</span>
              <span className="text-gray-900 dark:text-white">{vehicle.health_status || 'N/A'}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Color:</span>
              <span className="text-gray-900 dark:text-white">{vehicle.color || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Seating Capacity:</span>
              <span className="text-gray-900 dark:text-white">{vehicle.seating_capacity || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Fuel Type:</span>
              <span className="text-gray-900 dark:text-white">{vehicle.fuel_type || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Transmission:</span>
              <span className="text-gray-900 dark:text-white">{vehicle.transmission_type || vehicle.transmission || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Battery Capacity:</span>
              <span className="text-gray-900 dark:text-white">{vehicle.battery_capacity_kwh || 'N/A'} kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Efficiency:</span>
              <span className="text-gray-900 dark:text-white">{vehicle.efficiency_km_per_kwh || 'N/A'} km/kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Warranty Expiry:</span>
              <span className="text-gray-900 dark:text-white">{vehicle.warranty_expiry_date || vehicle.warranty_expiry || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Map */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">LOCATION MAP</h3>
        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <MapPin className="h-12 w-12 mx-auto mb-2" />
            <p>Map View</p>
            <p className="text-sm">Lat: {vehicle.latitude || 'N/A'}, Lng: {vehicle.longitude || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">RECENT ALERTS</h3>
        <div className="space-y-3">
          {recentAlerts.length > 0 ? (
            recentAlerts.slice(0, 3).map((alert: any) => (
              <div key={alert.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  alert.severity === 'high' ? 'bg-red-500' : 
                  alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {alert.severity === 'high' ? 'High' : alert.severity === 'medium' ? 'Medium' : 'Low'}: {alert.title || alert.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(alert.created_at)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent alerts</p>
          )}
        </div>
        {recentAlerts.length > 3 && (
          <div className="mt-4 text-center">
            <Button
              variant="outlineDark"
              label="View All"
              className="px-4 py-2"
            />
          </div>
        )}
      </div>
    </div>
  );

  const TelemetryTab = () => (
    <div className="space-y-6">
      {/* NOTE: Telemetry data API is missing from Postman collection
          TODO: Implement GET /api/fleet/vehicles/{id}/telemetry_data/ with brief=true parameter
          This should return recent telemetry data for charts and current readings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            VEHICLE TELEMETRY - {vehicle.make} {vehicle.model} ({vehicle.license_plate})
          </h3>
          <Button
            variant="outlineDark"
            label="View Full Telemetry →"
            className="px-4 py-2"
            onClick={() => {
              // NOTE: This should navigate to telemetry explorer with vehicle filter pre-applied
              // TODO: Implement navigation to /telemetry?vehicle={vehicleId}
              console.log('Navigate to telemetry explorer for vehicle:', vehicleId);
            }}
          />
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-900 dark:text-white">CURRENT READINGS</h4>
            <span className="text-sm text-gray-500 dark:text-gray-400">Last updated: 5m ago</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {latestObd?.speed_kph || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Speed</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">kph</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {latestObd?.battery_level_percent || vehicle.current_battery_level || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Battery %</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {latestObd?.range_km || latestObd?.estimated_range_km || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Range</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">km</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {latestObd?.motor_temp_c || latestObd?.temperature_c || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Motor Temp</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">°C</div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">QUICK CHART (Last Hour)</h4>
            <div className="flex space-x-2">
              <select className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800">
                <option>Speed</option>
                <option>Battery</option>
              </select>
              <select className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800">
                <option>Battery</option>
                <option>Speed</option>
              </select>
            </div>
          </div>
          <div className="h-32 bg-white dark:bg-gray-800 rounded flex items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400 text-center">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Chart visualization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const HistoryTab = () => (
    <div className="space-y-6">
      {/* Vehicle History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">VEHICLE HISTORY</h3>
        <div className="space-y-4">
          {historyData?.results?.length > 0 ? (
            historyData.results.slice(0, 10).map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {entry.event_type || entry.action || 'Vehicle Event'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {entry.description || entry.message || 'No description available'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatTimeAgo(entry.created_at || entry.timestamp)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.user || entry.created_by || 'System'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No history data available</p>
          )}
        </div>
      </div>

      {/* Recent Trips */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">RECENT TRIPS</h3>
        <div className="space-y-3">
          {tripsData?.results && tripsData.results.length > 0 ? (
            tripsData.results.slice(0, 5).map((trip: any) => (
              <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Car className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Trip #{trip.id}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {trip.start_location} → {trip.end_location}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {trip.distance_km || 0} km
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(trip.start_time)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent trips</p>
          )}
        </div>
      </div>
    </div>
  );

  const OBDDeviceTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">OBD DEVICE INFORMATION</h3>
        <div className="space-y-4">
          {(obdDevicesData?.results && obdDevicesData.results.length > 0 ? obdDevicesData.results : []).map((device: any) => (
            <div key={device.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Device ID:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{device.device_id || device.id || device.serial_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`text-sm font-medium ${(device.status === 'active' || device.is_active) ? 'text-green-600' : 'text-red-600'}`}>
                      {device.status || device.connection_status || device.state || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Seen:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {device.last_seen ? formatTimeAgo(device.last_seen) : device.last_updated ? formatTimeAgo(device.last_updated) : device.updated_at ? formatTimeAgo(device.updated_at) : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Firmware:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{device.firmware_version || device.firmware || device.version || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Signal Strength:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{device.signal_strength || device.signal || device.rssi || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Battery Level:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{device.battery_level || device.battery || device.battery_percentage || 'N/A'}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SIMCardTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SIM CARD INFORMATION</h3>
        <div className="space-y-4">
          {(simCardsData?.results?.length > 0 ? simCardsData.results : []).map((sim: any) => (
            <div key={sim.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">SIM ID:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{sim.sim_id || sim.id || sim.iccid || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`text-sm font-medium ${(sim.status === 'active' || sim.is_active) ? 'text-green-600' : 'text-red-600'}`}>
                      {sim.status || sim.connection_status || sim.state || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Phone Number:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{sim.phone_number || sim.phone || sim.msisdn || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Carrier:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{sim.carrier || sim.provider || sim.operator || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Data Usage:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{sim.data_usage_mb || sim.data_usage || sim.usage_mb || 0} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Plan:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{sim.plan_name || sim.plan || sim.plan_type || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const DashcamTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">DASHCAM INFORMATION</h3>
        <div className="space-y-4">
          {(dashcamsData?.results && dashcamsData.results.length > 0 ? dashcamsData.results : []).map((dashcam: any) => (
            <div key={dashcam.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Device ID:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{dashcam.device_id || dashcam.id || dashcam.serial_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Model:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{dashcam.model || dashcam.device_model || dashcam.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`text-sm font-medium ${(dashcam.status === 'active' || dashcam.is_active) ? 'text-green-600' : 'text-red-600'}`}>
                      {dashcam.status || dashcam.connection_status || dashcam.state || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Resolution:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{dashcam.resolution || dashcam.video_resolution || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Storage:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{dashcam.storage_capacity_gb || dashcam.storage_capacity || dashcam.capacity_gb || 'N/A'} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Recording:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {dashcam.last_recording ? formatTimeAgo(dashcam.last_recording) : dashcam.last_updated ? formatTimeAgo(dashcam.last_updated) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', content: <OverviewTab /> },
    { id: 'telemetry', label: 'Telemetry', content: <TelemetryTab /> },
    { id: 'history', label: 'History', content: <HistoryTab /> },
    { id: 'obd-device', label: 'OBD Device', content: <OBDDeviceTab /> },
    { id: 'sim-card', label: 'SIM Card', content: <SIMCardTab /> },
    { id: 'dashcam', label: 'Dashcam', content: <DashcamTab /> },
  ];

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="space-y-6">
        {/* HEADER: Back Button + Compact Header */}
        <div className="relative">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              onClick={() => router.back()}
              variant="outlineDark"
              label="Back"
              icon={<ArrowLeft className="h-4 w-4" />}
              className="px-4 py-2 rounded-lg"
            />
          </div>

          {/* Compact Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">VIN:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{vehicle.vin || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Plate:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{vehicle.license_plate || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{vehicle.status || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outlineDark"
                  label="Edit"
                  className="px-3 py-1 text-sm"
                />
                <Button
                  variant="outlineDark"
                  label="Maintenance"
                  className="px-3 py-1 text-sm"
                />
                <Button
                  variant="outlineDark"
                  label="Retire"
                  className="px-3 py-1 text-sm"
                />
                <Button
                  variant="outlineDark"
                  label="Delete"
                  className="px-3 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{vehicle.status || 'N/A'}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Online</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white flex justify-center items-center">
              <div className="mt-2">
                {(vehicle.online_status === 'online' || vehicle.is_online === true || vehicle.online === true) ? (
                  <span className="inline-block w-5 h-5 bg-green-500 rounded-full">●</span>
                ) : vehicle.online_status === 'offline' || vehicle.is_online === false || vehicle.online === false ? (
                  <span className="inline-block w-5 h-5 border-3 border-gray-400 rounded-full">○</span>
                ) : (
                  <span className="text-gray-400">--</span>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Battery %</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{vehicle.current_battery_level || latestObd?.battery_level_percent || 'N/A'}%</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Health</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{vehicle.health_status || 'N/A'}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Miles</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{vehicle.mileage_km || 'N/A'}</div>
          </div>
        </div>

        {/* TABBED INTERFACE */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <TabbedInterface tabs={tabs} defaultTab="overview" />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}