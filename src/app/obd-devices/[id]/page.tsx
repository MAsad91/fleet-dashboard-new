"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetObdDeviceByIdQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Wifi, WifiOff, Video, Copy, Check, Battery, Clock, Activity, Car, Cpu } from "lucide-react";

export default function ObdDeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.id as string;

  const { data: deviceData, isLoading, error } = useGetObdDeviceByIdQuery(deviceId);

  // Debug logging
  useEffect(() => {
    console.log('📱 OBD Device Detail Page:', { deviceId, deviceData, isLoading, error });
    if (deviceData) {
      console.log('📱 OBD Device Data Structure:', JSON.stringify(deviceData, null, 2));
    }
  }, [deviceId, deviceData, isLoading, error]);
  const [copiedApiKey, setCopiedApiKey] = useState<string | null>(null);

  const getStatusBadge = (isActive: boolean) => {
    const config = isActive 
      ? { className: "bg-green-100 text-green-800", label: "Active" }
      : { className: "bg-red-100 text-red-800", label: "Inactive" };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getOnlineBadge = (lastCommunication: string) => {
    const isOnline = lastCommunication && new Date(lastCommunication) > new Date(Date.now() - 5 * 60 * 1000);
    const config = isOnline
      ? { className: "bg-green-100 text-green-800", label: "Online", icon: Wifi }
      : { className: "bg-red-100 text-red-800", label: "Offline", icon: WifiOff };
    
    const Icon = config.icon;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${config.className}`}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  const getModelBadge = (model: string) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-purple-100 text-purple-800', 'bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 'bg-pink-100 text-pink-800'];
    const colorIndex = model ? model.length % colors.length : 0;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[colorIndex]}`}>
        {model || 'Unknown'}
      </span>
    );
  };

  const handleCopyApiKey = async (apiKey: string) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedApiKey(apiKey);
      alert("API key copied to clipboard");
      setTimeout(() => setCopiedApiKey(null), 2000);
    } catch (error) {
      console.error("Failed to copy API key:", error);
      alert("Failed to copy API key");
    }
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
                  Loading Device...
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
                  Error Loading Device
                </h1>
              </div>
            </div>
          </div>
          <div className="text-center text-red-600">
            <p>Failed to load device details. Please try again.</p>
            <Button 
              onClick={() => router.back()} 
              variant="primary" 
              label="Back to OBD Devices"
              className="mt-4"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!deviceData) {
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
                  Device Not Found
                </h1>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Extract the actual device data from the nested structure
  const device = (deviceData as any)?.device || deviceData;

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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {device.is_active ? '✅' : '❌'}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Comm</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {device.last_communication_at 
                    ? new Date(device.last_communication_at).toLocaleString()
                    : 'Never'
                  }
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vehicle</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {device.vehicle?.license_plate || 'Unassigned'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Car className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Firmware</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {device.firmware_version || 'Unknown'}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Cpu className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Info (Left) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Info</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Device ID</span>
                <span className="font-semibold text-gray-900 dark:text-white">{device.device_id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Model</span>
                <span className="font-semibold text-gray-900 dark:text-white">{device.model || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Serial</span>
                <span className="font-semibold text-gray-900 dark:text-white font-mono text-sm">{device.serial_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">CAN Baud Rate</span>
                <span className="font-semibold text-gray-900 dark:text-white">{device.can_baud_rate || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Report Interval Sec</span>
                <span className="font-semibold text-gray-900 dark:text-white">{device.report_interval_sec || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status (Active)</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {getStatusBadge(device.is_active)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Firmware</span>
                <span className="font-semibold text-gray-900 dark:text-white">{device.firmware_version || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Installed At</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {device.installed_at ? new Date(device.installed_at).toLocaleString() : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fleet Operator</span>
                <span className="font-semibold text-gray-900 dark:text-white">{device.fleet_operator || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Vehicle (id)</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{device.vehicle?.id || 'Unassigned'}</span>
                  {device.vehicle?.id && (
                    <Button
                      label="View Vehicle"
                      variant="outlineDark"
                      size="small"
                      onClick={() => router.push(`/vehicles/${device.vehicle.id}/view`)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Connectivity (Right) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Connectivity</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Update Communication</span>
                <Button
                  label="Update Comm"
                  variant="primary"
                  size="small"
                  onClick={() => {
                    // TODO: Implement update communication API call
                    alert('Update Communication feature coming soon');
                  }}
                />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Last Comm</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {device.last_communication_at 
                    ? new Date(device.last_communication_at).toLocaleString()
                    : 'Never'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Online (≤5m)</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {getOnlineBadge(device.last_communication_at)}
                </span>
              </div>
            </div>
          </div>
        </div>


        {/* SIM Card Details Section */}
        {device.sim_card && (
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <Wifi className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">SIM Card Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">sim_id</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{device.sim_card.sim_id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">iccid</span>
                    <span className="font-semibold text-gray-900 dark:text-white font-mono text-sm">{device.sim_card.iccid || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      device.sim_card.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : device.sim_card.status === 'suspended'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {device.sim_card.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">plan_name</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{device.sim_card.plan_name || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">plan_data_limit_gb</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{device.sim_card.plan_data_limit_gb || 0} GB</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">plan_cost</span>
                    <span className="font-semibold text-gray-900 dark:text-white">${device.sim_card.plan_cost || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">current_data_used_gb</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{device.sim_card.current_data_used_gb || 0} GB</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">current_cycle_start</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {device.sim_card.current_cycle_start 
                        ? new Date(device.sim_card.current_cycle_start).toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">overage_threshold</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{Math.round((device.sim_card.overage_threshold || 0) * 100)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">last_activity</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {device.sim_card.last_activity 
                        ? new Date(device.sim_card.last_activity).toLocaleString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">signal_strength</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{device.sim_card.signal_strength || 'N/A'} dBm</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">created_at</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {device.sim_card.created_at 
                        ? new Date(device.sim_card.created_at).toLocaleString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Data Usage Progress Bar */}
              {device.sim_card.plan_data_limit_gb && device.sim_card.current_data_used_gb && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Data Usage</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {device.sim_card.current_data_used_gb} / {device.sim_card.plan_data_limit_gb} GB
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (device.sim_card.current_data_used_gb / device.sim_card.plan_data_limit_gb) >= (device.sim_card.overage_threshold || 0.9)
                          ? 'bg-red-600'
                          : (device.sim_card.current_data_used_gb / device.sim_card.plan_data_limit_gb) >= 0.7
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{ 
                        width: `${Math.min((device.sim_card.current_data_used_gb / device.sim_card.plan_data_limit_gb) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions (Admin) */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Actions (Admin)</h3>
            <div className="flex space-x-4">
              <Button
                label="Update Communication"
                variant="primary"
                icon={<Wifi className="h-4 w-4" />}
                onClick={() => {
                  // TODO: Implement update communication API call
                  alert('Update Communication feature coming soon');
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
