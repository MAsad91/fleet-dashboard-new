"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetVehicleByIdQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Car, Calendar, Wrench, Battery, Shield, Gauge } from "lucide-react";

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;

  const { data: vehicleData, isLoading, error } = useGetVehicleByIdQuery(vehicleId);

  // Debug logging
  useEffect(() => {
    console.log('🚗 Vehicle Detail Page:', { vehicleId, vehicleData, isLoading, error });
    if (vehicleData) {
      console.log('🚗 Vehicle Data Structure:', JSON.stringify(vehicleData, null, 2));
    }
  }, [vehicleId, vehicleData, isLoading, error]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { className: "bg-green-100 text-green-800", label: "Available" },
      in_service: { className: "bg-blue-100 text-blue-800", label: "In Service" },
      maintenance: { className: "bg-yellow-100 text-yellow-800", label: "Maintenance" },
      retired: { className: "bg-red-100 text-red-800", label: "Retired" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      label: status || "Unknown"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getHealthBadge = (health: string) => {
    const healthConfig = {
      excellent: { className: "bg-green-100 text-green-800", label: "Excellent" },
      good: { className: "bg-blue-100 text-blue-800", label: "Good" },
      fair: { className: "bg-yellow-100 text-yellow-800", label: "Fair" },
      poor: { className: "bg-red-100 text-red-800", label: "Poor" },
    };
    
    const config = healthConfig[health as keyof typeof healthConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      label: health || "Unknown"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => router.back()} 
                variant="outlineDark"
                label="Back"
                icon={<ArrowLeft className="h-4 w-4" />}
                className="px-4 py-2 rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Loading Vehicle...
                </h1>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => router.back()} 
                variant="outlineDark"
                label="Back"
                icon={<ArrowLeft className="h-4 w-4" />}
                className="px-4 py-2 rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Error Loading Vehicle
                </h1>
              </div>
            </div>
          </div>
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

  if (!vehicleData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => router.back()} 
                variant="outlineDark"
                label="Back"
                icon={<ArrowLeft className="h-4 w-4" />}
                className="px-4 py-2 rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Vehicle Not Found
                </h1>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Extract the actual vehicle data from the nested structure
  const vehicle = (vehicleData as any)?.vehicle || vehicleData;

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="p-6">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Button 
            onClick={() => router.back()} 
            variant="outlineDark"
            label="Back"
            icon={<ArrowLeft className="h-4 w-4" />}
            className="px-4 py-2 rounded-lg"
          />
        </div>

        {/* Vehicle Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h3>
            </div>
            <div className="space-y-4">
                       <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                         <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Make</span>
                         <span className="font-semibold text-gray-900 dark:text-white text-lg">{vehicle.make}</span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                         <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Model</span>
                         <span className="font-semibold text-gray-900 dark:text-white">{vehicle.model}</span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                         <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Year</span>
                         <span className="font-semibold text-gray-900 dark:text-white">{vehicle.year}</span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                         <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">License Plate</span>
                         <span className="font-semibold text-gray-900 dark:text-white font-mono text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                           {vehicle.license_plate}
                         </span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                         <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">VIN</span>
                         <span className="font-semibold text-gray-900 dark:text-white font-mono text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                           {vehicle.vin}
                         </span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                         <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</span>
                         <span className="font-semibold text-gray-900 dark:text-white">
                           {getStatusBadge(vehicle.status)}
                         </span>
                       </div>
            </div>
          </div>

          {/* Technical Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Technical Details</h3>
            </div>
            <div className="space-y-4">
                       <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                         <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Vehicle Type</span>
                         <span className="font-semibold text-gray-900 dark:text-white">{vehicle.vehicle_type}</span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                         <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Mileage</span>
                         <span className="font-semibold text-gray-900 dark:text-white">{vehicle.mileage_km?.toLocaleString()} km</span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                         <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Battery Level</span>
                         <div className="flex items-center space-x-2">
                           <div className="w-20 bg-gray-200 rounded-full h-2">
                             <div 
                               className="bg-blue-600 h-2 rounded-full" 
                               style={{ width: `${vehicle.current_battery_level || 0}%` }}
                             ></div>
                           </div>
                           <span className="font-semibold text-gray-900 dark:text-white">{vehicle.current_battery_level || 0}%</span>
                         </div>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                         <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Health Status</span>
                         <span className="font-semibold text-gray-900 dark:text-white">
                           {getHealthBadge(vehicle.health_status)}
                         </span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                         <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Warranty Expiry</span>
                         <span className="font-semibold text-gray-900 dark:text-white">
                           {vehicle.warranty_expiry_date 
                             ? new Date(vehicle.warranty_expiry_date).toLocaleDateString()
                             : 'N/A'
                           }
                         </span>
                       </div>
            </div>
          </div>
        </div>

        {/* Additional Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Performance Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <Gauge className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Performance</h3>
            </div>
            <div className="space-y-4">
                       <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                         <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Efficiency</span>
                         <span className="font-semibold text-gray-900 dark:text-white">
                           {vehicle.efficiency_km_per_kwh || 'N/A'} km/kWh
                         </span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                         <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Seating Capacity</span>
                         <span className="font-semibold text-gray-900 dark:text-white">{vehicle.seating_capacity || 'N/A'}</span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                         <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Transmission</span>
                         <span className="font-semibold text-gray-900 dark:text-white">{vehicle.transmission_type || 'N/A'}</span>
                       </div>
            </div>
          </div>

          {/* System Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">System Status</h3>
            </div>
            <div className="space-y-4">
                       <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                         <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Alerts Enabled</span>
                         <span className="font-semibold text-gray-900 dark:text-white">
                           {vehicle.alerts_enabled ? 'Yes' : 'No'}
                         </span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                         <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">OTA Enabled</span>
                         <span className="font-semibold text-gray-900 dark:text-white">
                           {vehicle.ota_enabled ? 'Yes' : 'No'}
                         </span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                         <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Online Status</span>
                         <span className="font-semibold text-gray-900 dark:text-white">
                           {vehicle.online_status ? 'Online' : 'Offline'}
                         </span>
                       </div>
                       <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                         <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created At</span>
                         <span className="font-semibold text-gray-900 dark:text-white">
                           {vehicle.created_at ? new Date(vehicle.created_at).toLocaleString() : 'Unknown'}
                         </span>
                       </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
