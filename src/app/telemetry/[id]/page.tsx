"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useGetObdTelemetryQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Activity, Database, Car, Battery, Thermometer, MapPin, Gauge, AlertTriangle } from "lucide-react";

export default function TelemetryDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  // Mock data since API hook doesn't exist yet
  const record = null;
  const isLoading = false;
  const error = null;

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="text-center text-red-600">
          <p>Error loading telemetry data</p>
        </div>
      </ProtectedRoute>
    );
  }

  // For now, show a placeholder since we need to implement the API endpoint
  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => window.history.back()}
                  variant="outlineDark"
                  label="Back to List"
                  icon={<ArrowLeft className="h-4 w-4" />}
                  className="px-4 py-2 rounded-lg"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Telemetry — Detail (#{id})
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {(record as any)?.timestamp ? new Date((record as any).timestamp).toLocaleString() : 'Telemetry Record Details'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                {(record as any)?.trip && (
                  <Button
                    label="Open Trip"
                    variant="primary"
                    icon={<Activity className="h-4 w-4" />}
                    onClick={() => window.open(`/trips/${(record as any)?.trip}`, '_blank')}
                  />
                )}
                {(record as any)?.vehicle_id && (
                  <Button
                    label="Open Vehicle"
                    variant="outlineDark"
                    icon={<Car className="h-4 w-4" />}
                    onClick={() => window.open(`/vehicles/${(record as any)?.vehicle_id}`, '_blank')}
                  />
                )}
              </div>
            </div>
          </div>


          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Speed (kph)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(record as any)?.speed_kph || 'N/A'}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Battery Level (%)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(record as any)?.battery_level_percent ? `${(record as any)?.battery_level_percent}%` : 'N/A'}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Motor Temp (°C)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(record as any)?.motor_temp_c ? `${(record as any)?.motor_temp_c}°C` : 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Thermometer className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Range (km)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(() => {
                      if (!record) return 'N/A';
                      
                      // Check all possible range field variations
                      const rangeFields = [
                        'range_km', 'estimated_range_km', 'range_estimate_km', 
                        'estimated_range', 'range_estimate', 'range',
                        'remaining_range_km', 'battery_range_km', 'range_remaining_km',
                        'estimated_range_remaining_km', 'battery_estimated_range_km'
                      ];
                      
                      for (const field of rangeFields) {
                        if (record[field] !== undefined && record[field] !== null && record[field] !== '') {
                          return `${record[field]} km`;
                        }
                      }
                      
                      // If no range data found, show a calculated estimate based on battery
                      if ((record as any)?.battery_level_percent && (record as any)?.battery_level_percent > 0) {
                        const estimatedRange = Math.round(((record as any)?.battery_level_percent / 100) * 400);
                        return `~${estimatedRange} km`;
                      }
                      
                      return 'N/A';
                    })()}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Location Section */}
          {(record as any)?.coordinates && (
            <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
              <div className="p-6 border-b border-stroke dark:border-dark-3">
                <h3 className="text-lg font-semibold">Location</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  GPS coordinates and map data
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Latitude</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{(record as any)?.latitude || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Longitude</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{(record as any)?.longitude || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Coordinates (GeoJSON)</h4>
                    <pre className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {JSON.stringify((record as any)?.coordinates, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Telemetry Details */}
          <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
            <div className="p-6 border-b border-stroke dark:border-dark-3">
              <h3 className="text-lg font-semibold">Telemetry Record Details</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Record ID: {id}
              </p>
            </div>
            <div className="p-6">
              {record ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Metrics */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Speed (kph)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{(record as any)?.speed_kph || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Battery Level (%)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{(record as any)?.battery_level_percent ? `${(record as any)?.battery_level_percent}%` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Motor Temp (°C)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{(record as any)?.motor_temp_c ? `${(record as any)?.motor_temp_c}°C` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Battery Voltage</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{(record as any)?.battery_voltage || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Odometer (km)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{(record as any)?.odometer_km || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Range (km)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {(record as any)?.range_km ? `${(record as any)?.range_km} km` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Battery Power (kW)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{(record as any)?.battery_power_kw || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tire Pressure (kPa)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{(record as any)?.tire_pressure_kpa || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Torque (Nm)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{(record as any)?.torque_nm || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Charge Limit (%)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{(record as any)?.charge_limit_percent ? `${(record as any)?.charge_limit_percent}%` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Error Codes</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {(record as any)?.error_codes && (record as any)?.error_codes.length > 0 
                            ? (record as any)?.error_codes.join(', ')
                            : 'None'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Context */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Context</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Trip ID</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{(record as any)?.trip || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle ID (derived)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{(record as any)?.vehicle_id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Device ID (derived)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{(record as any)?.device_id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {(record as any)?.timestamp ? new Date((record as any)?.timestamp).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Latitude</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{(record as any)?.latitude || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Longitude</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{(record as any)?.longitude || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Record Not Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    The telemetry record with ID {id} could not be found.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
