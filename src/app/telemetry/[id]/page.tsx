"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Gauge, Battery, Thermometer, MapPin, Car, User, Clock, Activity, AlertTriangle } from "lucide-react";

export default function TelemetryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const telemetryId = params.id as string;

  // Mock data since API hooks don't exist yet
  const telemetryData = {
    id: parseInt(telemetryId),
    trip: 712,
    timestamp: new Date().toISOString(),
    coordinates: {
      type: "Point",
      coordinates: [78.47, 17.41]
    },
    latitude: 17.41,
    longitude: 78.47,
    speed_kph: 58,
    battery_level_percent: 76,
    motor_temp_c: 36,
    battery_voltage: 380.5,
    odometer_km: 12500.5,
    range_km: 372,
    battery_power_kw: 45.2,
    tire_pressure_kpa: 220,
    torque_nm: 180,
    charge_limit_percent: 80,
    error_codes: ["P0A1", "U012"],
    vehicle_id: 123,
    device_id: "DEV-456"
  };

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

  if (error || !telemetryData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="text-center text-red-600">
          <p>Failed to load telemetry details. Please try again.</p>
          <Button 
            onClick={() => router.back()} 
            variant="primary" 
            label="Back to Telemetry"
            className="mt-4"
          />
        </div>
      </ProtectedRoute>
    );
  }

  const handleOpenVehicle = () => {
    router.push(`/vehicles/${telemetryData.vehicle_id}`);
  };

  const handleOpenTrip = () => {
    router.push(`/trips/${telemetryData.trip}`);
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="space-y-6">
        {/* HEADER: Back Button + Beautiful Title Card */}
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

          {/* Beautiful Title Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-lg border border-blue-200 dark:border-gray-600 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 dark:bg-gray-600 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200 dark:bg-gray-600 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                {/* Left Side - Telemetry Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <Activity className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Telemetry — Detail (#{telemetryData.id})
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        Vehicle ID: {telemetryData.vehicle_id} • Device ID: {telemetryData.device_id} • {new Date(telemetryData.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Speed</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {telemetryData.speed_kph || 'N/A'} kph
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Battery</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {telemetryData.battery_level_percent || 'N/A'}%
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Motor Temp</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {telemetryData.motor_temp_c || 'N/A'}°C
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Action Buttons */}
                <div className="flex flex-col space-y-2 ml-6">
                  <div className="flex space-x-2">
                    <Button
                      label="Open Vehicle"
                      variant="outlineDark"
                      size="small"
                      icon={<Car className="h-3 w-3" />}
                      onClick={handleOpenVehicle}
                      className="px-3 py-2 text-xs"
                    />
                    <Button
                      label="Open Trip"
                      variant="outlineDark"
                      size="small"
                      icon={<User className="h-3 w-3" />}
                      onClick={handleOpenTrip}
                      className="px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Speed (kph)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {telemetryData.speed_kph || 'N/A'}
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
                  {telemetryData.battery_level_percent || 'N/A'}
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
                  {telemetryData.motor_temp_c || 'N/A'}
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
                  {telemetryData.range_km || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Actions</h3>
          <div className="flex space-x-4">
            <Button
              label="Open Vehicle"
              variant="primary"
              icon={<Car className="h-4 w-4" />}
              onClick={handleOpenVehicle}
            />
            <Button
              label="Open Trip"
              variant="primary"
              icon={<User className="h-4 w-4" />}
              onClick={handleOpenTrip}
            />
          </div>
        </div>

        {/* Location */}
        {telemetryData.coordinates && (
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Map</h4>
                <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400">Map placeholder</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Latitude:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{telemetryData.latitude || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Longitude:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{telemetryData.longitude || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Metrics (Left) */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">speed_kph:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{telemetryData.speed_kph || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">battery_level_percent:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{telemetryData.battery_level_percent || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">motor_temp_c:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{telemetryData.motor_temp_c || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">battery_voltage:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{telemetryData.battery_voltage || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">odometer_km:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{telemetryData.odometer_km || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">range_km:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{telemetryData.range_km || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">battery_power_kw:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{telemetryData.battery_power_kw || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">tire_pressure_kpa:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{telemetryData.tire_pressure_kpa || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">torque_nm:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{telemetryData.torque_nm || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">charge_limit_percent:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{telemetryData.charge_limit_percent || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">error_codes:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {telemetryData.error_codes && Array.isArray(telemetryData.error_codes) 
                    ? telemetryData.error_codes.join(', ') 
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Context (Right) */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Context</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">trip (id):</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{telemetryData.trip || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">vehicle_id (derived):</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{telemetryData.vehicle_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">device_id (derived):</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{telemetryData.device_id || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}