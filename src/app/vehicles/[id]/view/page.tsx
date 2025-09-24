"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetVehicleByIdQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Edit, Trash2, Car, Wrench, Fuel, MapPin, Calendar, Settings, Battery, Gauge } from "lucide-react";

export default function VehicleViewPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;
  
  const { data: vehicleData, isLoading, error } = useGetVehicleByIdQuery(vehicleId);

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

  if (error || !vehicleData) {
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

  const vehicle = vehicleData.vehicle || vehicleData;

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="p-6">
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


        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
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

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
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

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
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

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
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

        {/* Vehicle Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Vehicle Information</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Make</span>
                <span className="font-semibold text-gray-900 dark:text-white">{vehicle.make || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Model</span>
                <span className="font-semibold text-gray-900 dark:text-white">{vehicle.model || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Year</span>
                <span className="font-semibold text-gray-900 dark:text-white">{vehicle.year || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">VIN</span>
                <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{vehicle.vin || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">License Plate</span>
                <span className="font-semibold text-gray-900 dark:text-white">{vehicle.license_plate || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Color</span>
                <span className="font-semibold text-gray-900 dark:text-white">{vehicle.color || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fuel Type</span>
                <span className="font-semibold text-gray-900 dark:text-white">{vehicle.fuel_type || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Transmission</span>
                <span className="font-semibold text-gray-900 dark:text-white">{vehicle.transmission_type || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Seating Capacity</span>
                <span className="font-semibold text-gray-900 dark:text-white">{vehicle.seating_capacity || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Connectivity Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
                <Settings className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Connectivity</h3>
            </div>
            <div className="space-y-4">
              {/* OBD Device Information */}
              {vehicle.obd_device && (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">OBD Device ID</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{vehicle.obd_device.device_id || vehicle.obd_device.id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Model</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{vehicle.obd_device.model || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Serial Number</span>
                    <span className="font-semibold text-gray-900 dark:text-white font-mono text-sm">{vehicle.obd_device.serial_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Firmware</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{vehicle.obd_device.firmware_version || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Active</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.obd_device.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.obd_device.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Last Communication</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {vehicle.obd_device.last_communication_at 
                        ? new Date(vehicle.obd_device.last_communication_at).toLocaleString()
                        : 'Never'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">OBD Device</span>
                    <Button
                      label="View OBD Device"
                      variant="primary"
                      size="small"
                      onClick={() => router.push(`/obd-devices/${vehicle.obd_device.id || vehicle.obd_device}`)}
                    />
                  </div>
                </>
              )}
              
              {/* SIM Card Information */}
              {vehicle.obd_device?.sim_card && (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">SIM ICCID</span>
                    <span className="font-semibold text-gray-900 dark:text-white font-mono text-sm">{vehicle.obd_device.sim_card.iccid || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Plan</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{vehicle.obd_device.sim_card.plan_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.obd_device.sim_card.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : vehicle.obd_device.sim_card.status === 'suspended'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.obd_device.sim_card.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Data Usage</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {vehicle.obd_device.sim_card.current_data_used_gb || 0} / {vehicle.obd_device.sim_card.plan_data_limit_gb || 0} GB
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Threshold</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{Math.round((vehicle.obd_device.sim_card.overage_threshold || 0) * 100)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Last Activity</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {vehicle.obd_device.sim_card.last_activity 
                        ? new Date(vehicle.obd_device.sim_card.last_activity).toLocaleString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Signal Strength</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{vehicle.obd_device.sim_card.signal_strength || 'N/A'} dBm</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* OBD Device and SIM Card Information */}
        {vehicle.obd_device && (
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-primary/10 rounded-lg mr-3">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">OBD Device & SIM Card</h3>
                </div>
                <Button
                  label="View OBD Device Details"
                  variant="primary"
                  size="small"
                  onClick={() => router.push(`/obd-devices/${vehicle.obd_device.id || vehicle.obd_device}`)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Device ID</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {vehicle.obd_device.device_id || vehicle.obd_device.id || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Model</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {vehicle.obd_device.model || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.obd_device.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.obd_device.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">SIM Card</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {vehicle.obd_device.sim_card ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vehicle.obd_device.sim_card.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : vehicle.obd_device.sim_card.status === 'suspended'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {vehicle.obd_device.sim_card.sim_id || vehicle.obd_device.sim_card.iccid || 'Connected'}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No SIM Card
                        </span>
                      )}
                    </span>
                  </div>
                  {vehicle.obd_device.sim_card && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Data Plan</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {vehicle.obd_device.sim_card.plan_name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Data Usage</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {vehicle.obd_device.sim_card.current_data_used_gb || 0} / {vehicle.obd_device.sim_card.plan_data_limit_gb || 0} GB
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Data Usage Progress Bar for SIM Card */}
              {vehicle.obd_device.sim_card && vehicle.obd_device.sim_card.plan_data_limit_gb && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">SIM Card Data Usage</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {Math.round(((vehicle.obd_device.sim_card.current_data_used_gb || 0) / vehicle.obd_device.sim_card.plan_data_limit_gb) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        ((vehicle.obd_device.sim_card.current_data_used_gb || 0) / vehicle.obd_device.sim_card.plan_data_limit_gb) >= (vehicle.obd_device.sim_card.overage_threshold || 0.9)
                          ? 'bg-red-600'
                          : ((vehicle.obd_device.sim_card.current_data_used_gb || 0) / vehicle.obd_device.sim_card.plan_data_limit_gb) >= 0.7
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{ 
                        width: `${Math.min(((vehicle.obd_device.sim_card.current_data_used_gb || 0) / vehicle.obd_device.sim_card.plan_data_limit_gb) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location Information */}
        {vehicle.last_known_location && (
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-3">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Last Known Location</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Latitude</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{vehicle.latitude || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Longitude</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{vehicle.longitude || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
