"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Cpu, Activity, Clock, Car, Wifi, WifiOff, Edit, Trash2, Save, Signal } from "lucide-react";

export default function OBDDeviceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const deviceId = params.id as string;

  // Mock data since API hooks don't exist yet
  const deviceData = {
    id: parseInt(deviceId),
    device_id: "OBD-T2-2024-001",
    model: "TelemX T2",
    serial_number: "SN-0001",
    can_baud_rate: 500000,
    report_interval_sec: 60,
    vehicle: {
      id: 5,
      license_plate: "EV-123",
      make: "Tesla",
      model: "Model 3"
    },
    fleet_operator: {
      id: 1,
      name: "FleetOps Inc"
    },
    installed_at: "2024-01-15T10:30:00Z",
    is_active: true,
    last_communication_at: "2025-01-12T10:02:00Z",
    firmware_version: "1.2.3",
    sim_card: {
      id: 123,
      sim_id: "SIM-001",
      iccid: "8988247000001234567",
      status: "active",
      plan_name: "Business Plan",
      plan_data_limit_gb: 50,
      plan_cost: 25.99,
      current_data_used_gb: 12.5,
      current_cycle_start: "2025-01-01T00:00:00Z",
      overage_threshold: 45,
      last_activity: "2025-01-12T09:45:00Z",
      signal_strength: -75,
      created_at: "2024-01-15T10:30:00Z"
    }
  };

  const [formData, setFormData] = useState(deviceData);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isLoading = false;
  const error = null;

  useEffect(() => {
    setFormData(deviceData);
  }, [deviceId, deviceData]);

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !deviceData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="text-center text-red-600">
          <p>Failed to load OBD device details. Please try again.</p>
          <Button 
            onClick={() => router.back()} 
            variant="primary" 
            label="Back to OBD Devices"
            className="mt-4"
          />
        </div>
      </ProtectedRoute>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSave = () => {
    console.log('Saving OBD device:', formData);
    // TODO: Implement save API call
    setIsEditing(false);
  };

  const handleDelete = () => {
    console.log('Deleting OBD device:', deviceId);
    // TODO: Implement delete API call
    router.back();
  };

  const handleUpdateCommunication = () => {
    console.log('Updating communication for device:', deviceId);
    // TODO: Implement POST /api/fleet/obd-devices/{id}/update-communication/
  };

  const handleViewVehicle = () => {
    router.push(`/vehicles/${formData.vehicle.id}`);
  };

  const isOnline = formData.last_communication_at && 
    new Date(formData.last_communication_at) > new Date(Date.now() - 5 * 60 * 1000);

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
                {/* Left Side - Device Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <Cpu className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        OBD Device — Detail (#{deviceId})
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {formData.device_id} • {formData.model} • {formData.is_active ? 'Active' : 'Inactive'} • {isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formData.is_active ? "✅" : "❌"}
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Comm</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formData.last_communication_at 
                          ? new Date(formData.last_communication_at).toLocaleString()
                          : 'Never'
                        }
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Vehicle</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formData.vehicle?.license_plate || 'Unassigned'}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Firmware</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formData.firmware_version}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Action Buttons */}
                <div className="flex flex-col space-y-2 ml-6">
                  <div className="flex space-x-2">
                    <Button
                      label="Edit"
                      variant="primary"
                      size="small"
                      icon={<Edit className="h-3 w-3" />}
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-3 py-2 text-xs"
                    />
                    <Button
                      label="Delete"
                      variant="outlineDark"
                      size="small"
                      icon={<Trash2 className="h-3 w-3" />}
                      onClick={handleDelete}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formData.is_active ? "✅" : "❌"}
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formData.last_communication_at 
                    ? new Date(formData.last_communication_at).toLocaleString()
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formData.vehicle?.license_plate || 'Unassigned'}
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formData.firmware_version}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Cpu className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Info (Left) */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Info</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Device ID</label>
                <input
                  type="text"
                  name="device_id"
                  value={formData.device_id}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Serial</label>
                <input
                  type="text"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CAN Baud Rate</label>
                <input
                  type="number"
                  name="can_baud_rate"
                  value={formData.can_baud_rate}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Interval Sec</label>
                <input
                  type="number"
                  name="report_interval_sec"
                  value={formData.report_interval_sec}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status (Active)</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, is_active: e.target.checked }))}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Firmware</label>
                <input
                  type="text"
                  name="firmware_version"
                  value={formData.firmware_version}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Installed At (timestamp)</label>
                <input
                  type="text"
                  value={formData.installed_at ? new Date(formData.installed_at).toLocaleString() : 'N/A'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fleet Operator</label>
                <input
                  type="text"
                  value={formData.fleet_operator?.name || 'N/A'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vehicle (id)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={formData.vehicle ? `${formData.vehicle.license_plate} (${formData.vehicle.id})` : 'Unassigned'}
                    disabled
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                  <Button
                    label="View Vehicle"
                    variant="outlineDark"
                    size="small"
                    onClick={handleViewVehicle}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Connectivity (Right) */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Connectivity</h3>
            <div className="space-y-4">
              <div>
                <Button
                  label="Update Communication"
                  variant="primary"
                  icon={<Activity className="h-4 w-4" />}
                  onClick={handleUpdateCommunication}
                  className="w-full mb-4"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  POST /api/fleet/obd-devices/{deviceId}/update-communication/
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Comm (timestamp)</label>
                <input
                  type="text"
                  value={formData.last_communication_at ? new Date(formData.last_communication_at).toLocaleString() : 'Never'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Online (≤5m) badge</label>
                <div className="flex items-center space-x-2">
                  {isOnline ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Wifi className="h-3 w-3 mr-1" />
                      Online
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Offline
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SIM: shown if present (read-only)</label>
                {formData.sim_card ? (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div>SIM ID: {formData.sim_card.sim_id}</div>
                      <div>ICCID: {formData.sim_card.iccid}</div>
                      <div>Status: {formData.sim_card.status}</div>
                      <div>Plan: {formData.sim_card.plan_name}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">No SIM card assigned</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SIM CARD DETAILS */}
        {formData.sim_card && (
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">SIM CARD DETAILS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">sim_id</label>
                <div className="text-sm text-gray-900 dark:text-white">{formData.sim_card.sim_id}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">iccid</label>
                <div className="text-sm text-gray-900 dark:text-white">{formData.sim_card.iccid}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">status</label>
                <div className="text-sm text-gray-900 dark:text-white">{formData.sim_card.status}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">plan_name</label>
                <div className="text-sm text-gray-900 dark:text-white">{formData.sim_card.plan_name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">plan_data_limit_gb</label>
                <div className="text-sm text-gray-900 dark:text-white">{formData.sim_card.plan_data_limit_gb} GB</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">plan_cost</label>
                <div className="text-sm text-gray-900 dark:text-white">${formData.sim_card.plan_cost}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">current_data_used_gb</label>
                <div className="text-sm text-gray-900 dark:text-white">{formData.sim_card.current_data_used_gb} GB</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">current_cycle_start</label>
                <div className="text-sm text-gray-900 dark:text-white">{new Date(formData.sim_card.current_cycle_start).toLocaleDateString()}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">overage_threshold</label>
                <div className="text-sm text-gray-900 dark:text-white">{formData.sim_card.overage_threshold} GB</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">last_activity</label>
                <div className="text-sm text-gray-900 dark:text-white">{new Date(formData.sim_card.last_activity).toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">signal_strength</label>
                <div className="text-sm text-gray-900 dark:text-white flex items-center">
                  <Signal className="h-4 w-4 mr-1" />
                  {formData.sim_card.signal_strength} dBm
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">created_at</label>
                <div className="text-sm text-gray-900 dark:text-white">{new Date(formData.sim_card.created_at).toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIONS (Admin) */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">ACTIONS (Admin)</h3>
          <div className="flex items-center space-x-4">
            <Button
              label="Update Communication"
              variant="primary"
              icon={<Activity className="h-4 w-4" />}
              onClick={handleUpdateCommunication}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              → POST /api/fleet/obd-devices/{deviceId}/update-communication/
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}