"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetVehicleByIdQuery, useGetAlertsQuery, useGetObdTelemetryQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Edit, Trash2, Car, Wrench, Fuel, MapPin, Calendar, Settings, Battery, Gauge, History, Activity, AlertTriangle, Wifi, Smartphone, Camera, FileText, Eye } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function VehicleViewPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;
  
  const { data: vehicleData, isLoading, error } = useGetVehicleByIdQuery(vehicleId);
  const { data: alertsData } = useGetAlertsQuery({ vehicle: vehicleId, status: 'active', limit: 5 });
  const { data: telemetryData } = useGetObdTelemetryQuery({ vehicle_id: vehicleId });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", label: "Available" },
      in_service: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", label: "In Service" },
      maintenance: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", label: "Maintenance" },
      retired: { className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", label: "Retired" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      className: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400", 
      label: status || "Unknown"
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getHealthBadge = (health: string) => {
    const healthConfig = {
      Good: { className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", label: "Good" },
      Warning: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", label: "Warning" },
      Critical: { className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", label: "Critical" },
    };
    
    const config = healthConfig[health as keyof typeof healthConfig] || { 
      className: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400", 
      label: health || "Unknown"
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

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

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="space-y-6">
        {/* HEADER: Back Button + Amazing Title Card */}
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

          {/* Amazing Title Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-lg border border-blue-200 dark:border-gray-600 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 dark:bg-gray-600 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200 dark:bg-gray-600 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                {/* Left Side - Vehicle Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <Car className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {vehicle.make} / {vehicle.model}
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {vehicle.year} • Vehicle Detail
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">VIN</span>
                      </div>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {vehicle.vin ? `${vehicle.vin.substring(0, 12)}...` : 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Plate</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {vehicle.license_plate || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${vehicle.online_status ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {vehicle.status?.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center text-xs ${vehicle.online_status ? 'text-green-600' : 'text-gray-400'}`}>
                          {vehicle.online_status ? '● Online' : '● Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Action Buttons */}
                <div className="flex flex-col space-y-2 ml-6">
                  <div className="flex space-x-2">
                    <Button
                      label="Edit"
                      variant="outlineDark"
                      size="small"
                      icon={<Edit className="h-3 w-3" />}
                      onClick={() => router.push(`/vehicles/${vehicleId}/edit`)}
                      className="px-3 py-2 text-xs"
                    />
                    <Button
                      label="Maint."
                      variant="outlineDark"
                      size="small"
                      icon={<Wrench className="h-3 w-3" />}
                      onClick={() => {}} // TODO: Add maintenance action
                      className="px-3 py-2 text-xs"
                    />
                    <Button
                      label="Retire"
                      variant="outlineDark"
                      size="small"
                      icon={<Trash2 className="h-3 w-3" />}
                      onClick={() => {}} // TODO: Add retire action
                      className="px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      label="Delete"
                      variant="outlineDark"
                      size="small"
                      icon={<Trash2 className="h-3 w-3" />}
                      onClick={() => {}} // TODO: Add delete action
                      className="px-3 py-2 text-xs"
                    />
                    <Button
                      label="History"
                      variant="outlineDark"
                      size="small"
                      icon={<History className="h-3 w-3" />}
                      onClick={() => router.push(`/vehicles/${vehicleId}/history`)}
                      className="px-3 py-2 text-xs"
                    />
                    <Button
                      label="Telemetry"
                      variant="outlineDark"
                      size="small"
                      icon={<Activity className="h-3 w-3" />}
                      onClick={() => router.push(`/telemetry?vehicle=${vehicleId}`)}
                      className="px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Battery %</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {vehicle.current_battery_level || 0}%
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Battery className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status/Online</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {vehicle.status?.replace('_', ' ')}/{vehicle.online_status ? 'on' : 'off'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Gauge className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Health</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {vehicle.health_status || 'Unknown'}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Wrench className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mileage (km)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {vehicle.mileage_km?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Fuel className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* TWO COLUMNS: Info (Left) + Connectivity (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Info (Left) */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Vehicle Type:</span>
                <span className="text-gray-900 dark:text-white">
                  {vehicle.vehicle_type} ({vehicle.vehicle_type_id}) 
                  <Button
                    label="View Type"
                    variant="outlineDark"
                    size="small"
                    className="ml-2"
                    onClick={() => router.push(`/vehicle-types/${vehicle.vehicle_type_id}`)}
                  />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">VIN:</span>
                <span className="text-gray-900 dark:text-white font-mono">{vehicle.vin || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">License Plate:</span>
                <span className="text-gray-900 dark:text-white">{vehicle.license_plate || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Make/Model/Year:</span>
                <span className="text-gray-900 dark:text-white">{vehicle.make} / {vehicle.model} ({vehicle.year})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span>{getStatusBadge(vehicle.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Health:</span>
                <span>{getHealthBadge(vehicle.health_status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Online:</span>
                <span className={vehicle.online_status ? 'text-green-600' : 'text-gray-400'}>
                  {vehicle.online_status ? 'Online' : 'Offline'}
                </span>
              </div>
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
                <span className="text-gray-900 dark:text-white">{vehicle.transmission_type || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Battery Capacity (kWh):</span>
                <span className="text-gray-900 dark:text-white">{vehicle.battery_capacity_kwh || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Efficiency (km/kWh):</span>
                <span className="text-gray-900 dark:text-white">{vehicle.efficiency_km_per_kwh || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Warranty Expiry:</span>
                <span className="text-gray-900 dark:text-white">
                  {vehicle.warranty_expiry_date ? new Date(vehicle.warranty_expiry_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Alerts Enabled:</span>
                <span className="text-gray-900 dark:text-white">{vehicle.alerts_enabled ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">OTA Enabled:</span>
                <span className="text-gray-900 dark:text-white">{vehicle.ota_enabled ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Connectivity (Right) */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Connectivity</h3>
            <div className="space-y-4">
              {/* OBD Device */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-center mb-2">
                  <Wifi className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="font-medium">OBD:</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div>Device ID: {vehicle.obd_device?.device_id || 'N/A'}</div>
                  <div>Model: {vehicle.obd_device?.model || 'N/A'}</div>
                  <div>Serial: {vehicle.obd_device?.serial_number || 'N/A'}</div>
                  <div>Firmware: {vehicle.obd_device?.firmware_version || 'N/A'}</div>
                  <div>Baud: {vehicle.obd_device?.can_baud_rate || 'N/A'}</div>
                  <div>Report Interval: {vehicle.obd_device?.report_interval_sec || 'N/A'}s</div>
                  <div>Active: {vehicle.obd_device?.is_active ? 'Yes' : 'No'}</div>
                  <div>Last Comm: {vehicle.obd_device?.last_communication_at ? formatTimeAgo(vehicle.obd_device.last_communication_at) : 'N/A'}</div>
                  <Button
                    label="View OBD Device"
                    variant="outlineDark"
                    size="small"
                    className="mt-2"
                    onClick={() => router.push(`/obd-devices/${vehicle.obd_device?.id}`)}
                  />
                </div>
              </div>

              {/* SIM Card */}
              {vehicle.obd_device?.sim_card && (
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex items-center mb-2">
                    <Smartphone className="h-4 w-4 text-green-600 mr-2" />
                    <span className="font-medium">SIM:</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>ICCID: {vehicle.obd_device.sim_card.iccid || 'N/A'}</div>
                    <div>Plan: {vehicle.obd_device.sim_card.plan_name || 'N/A'}</div>
                    <div>Status: {vehicle.obd_device.sim_card.status || 'N/A'}</div>
                    <div>Used/Limit: {vehicle.obd_device.sim_card.current_data_used_gb || 0}/{vehicle.obd_device.sim_card.plan_data_limit_gb || 0} GB</div>
                    <div>Threshold: {vehicle.obd_device.sim_card.overage_threshold || 'N/A'}</div>
                    <div>Last Activity: {vehicle.obd_device.sim_card.last_activity ? formatTimeAgo(vehicle.obd_device.sim_card.last_activity) : 'N/A'}</div>
                    <div>Signal: {vehicle.obd_device.sim_card.signal_strength || 'N/A'}</div>
                    <Button
                      label="View SIM Card"
                      variant="outlineDark"
                      size="small"
                      className="mt-2"
                      onClick={() => router.push(`/sim-cards/${vehicle.obd_device.sim_card.id}`)}
                    />
                  </div>
                </div>
              )}

              {/* Dashcam */}
              <div>
                <div className="flex items-center mb-2">
                  <Camera className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="font-medium">Dashcam:</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div>Device ID: N/A</div>
                  <div>Firmware: N/A</div>
                  <div>Active: N/A</div>
                  <div>Last Stream: N/A</div>
                  <div className="flex space-x-2 mt-2">
                    <Button
                      label="View Dashcam"
                      variant="outlineDark"
                      size="small"
                      onClick={() => {}} // TODO: Add dashcam functionality
                    />
                    <Button
                      label="Videos"
                      variant="outlineDark"
                      size="small"
                      onClick={() => router.push(`/dashcams?vehicle=${vehicleId}`)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LOCATION MAP */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Location Map
          </h3>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <MapPin className="h-12 w-12 mx-auto mb-2" />
              <p>Map integration coming soon</p>
              <p className="text-sm">
                Lat: {vehicle.last_known_location?.coordinates?.[1] || vehicle.latitude || 'N/A'}, 
                Lng: {vehicle.last_known_location?.coordinates?.[0] || vehicle.longitude || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* LIVE SNAPSHOT */}
        {latestObd && (
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Live Snapshot</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {latestObd.speed_kph || 0} kph
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Speed</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {latestObd.battery_level_percent || 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Battery</div>
              </div>
              {latestObd.range_km && (
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {latestObd.range_km} km
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Range</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RECENT ALERTS */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Recent Alerts (5)
          </h3>
          {recentAlerts.length > 0 ? (
            <div className="space-y-3">
              {recentAlerts.slice(0, 5).map((alert: any) => (
                <div key={alert.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <AlertTriangle className={`h-4 w-4 ${
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'high' ? 'text-orange-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            alert.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                            alert.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                            alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          }`}>
                            {alert.severity?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                          {alert.title || alert.alert_title || 'Untitled Alert'}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {alert.description || alert.message || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(alert.created_at || alert.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>No recent alerts</p>
            </div>
          )}
        </div>

        {/* CHARTS */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Charts</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Telemetry */}
            <div>
              <h4 className="text-md font-medium mb-3">Recent (20 pts)</h4>
              <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p>Speed timeline • Battery timeline • Path coordinates</p>
                  <p className="text-sm">Chart integration coming soon</p>
                </div>
              </div>
            </div>

            {/* Trends */}
            <div>
              <h4 className="text-md font-medium mb-3">Trends (Today | 10d | 30d | 90d)</h4>
              <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p>Speed • Battery % • Motor Temp • Power • Range</p>
                  <p className="text-sm">Chart integration coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Error Codes */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Top Error Codes</h3>
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>Error codes panel coming soon</p>
              </div>
            </div>
          </div>

          {/* Vehicle Type Insights */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Vehicle Type Insights</h3>
            <div className="space-y-3">
              <Button
                label="Alert Breakdown"
                variant="outlineDark"
                size="small"
                onClick={() => router.push(`/vehicle-types/${vehicle.vehicle_type_id}/alert-thresholds`)}
              />
              <Button
                label="Firmware Lineage"
                variant="outlineDark"
                size="small"
                onClick={() => router.push(`/vehicle-types/${vehicle.vehicle_type_id}/firmware-lineage`)}
              />
              <Button
                label="Type Documents"
                variant="outlineDark"
                size="small"
                onClick={() => router.push(`/vehicle-types/${vehicle.vehicle_type_id}/documents`)}
              />
              <Button
                label="Active Vehicles"
                variant="outlineDark"
                size="small"
                onClick={() => router.push(`/vehicle-types/${vehicle.vehicle_type_id}/active-vehicles`)}
              />
            </div>
          </div>
        </div>

        {/* DOCUMENTS */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Documents
          </h3>
          <Button
            label="Open Vehicle Documents"
            variant="outlineDark"
            icon={<Eye className="h-4 w-4" />}
            onClick={() => router.push(`/vehicle-documents?vehicle=${vehicleId}`)}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}