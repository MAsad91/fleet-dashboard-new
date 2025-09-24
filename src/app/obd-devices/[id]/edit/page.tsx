"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetObdDeviceByIdQuery, useUpdateObdDeviceMutation } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Save, X } from "lucide-react";

export default function ObdDeviceEditPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.id as string;

  const { data: deviceData, isLoading, error } = useGetObdDeviceByIdQuery(deviceId);
  const [updateDevice, { isLoading: isUpdating }] = useUpdateObdDeviceMutation();

  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  // Update formData when deviceData changes
  useEffect(() => {
    if (deviceData) {
      setFormData({
        device_id: deviceData.device_id || '',
        model: deviceData.model || '',
        firmware_version: deviceData.firmware_version || '',
        is_active: deviceData.is_active || false,
        battery_level: deviceData.battery_level?.toString() || '',
        signal_strength: deviceData.signal_strength?.toString() || '',
        serial_number: deviceData.serial_number || '',
        mac_address: deviceData.mac_address || '',
      });
    }
  }, [deviceData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.device_id?.trim()) newErrors.device_id = 'Device ID is required';
    if (!formData.model?.trim()) newErrors.model = 'Model is required';
    if (!formData.firmware_version?.trim()) newErrors.firmware_version = 'Firmware version is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDevice = async () => {
    if (!validateForm()) return;

    try {
      const apiData = {
        device_id: formData.device_id,
        model: formData.model,
        firmware_version: formData.firmware_version,
        is_active: formData.is_active,
        battery_level: parseFloat(formData.battery_level) || 0,
        signal_strength: parseFloat(formData.signal_strength) || 0,
        serial_number: formData.serial_number || null,
        mac_address: formData.mac_address || null,
      };

      await updateDevice({ id: deviceId, body: apiData }).unwrap();
      router.push(`/obd-devices/${deviceId}`);
    } catch (error: any) {
      console.error('Error updating device:', error);
      // Handle validation errors from API
      if (error.data && typeof error.data === 'object') {
        const apiErrors: Record<string, string> = {};
        Object.keys(error.data).forEach(key => {
          if (Array.isArray(error.data[key])) {
            apiErrors[key] = error.data[key][0];
          } else {
            apiErrors[key] = error.data[key];
          }
        });
        setErrors(apiErrors);
      }
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

        {/* Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Device Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Device ID *
                </label>
                <input
                  type="text"
                  name="device_id"
                  value={formData.device_id || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                    errors.device_id ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.device_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.device_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                    errors.model ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.model && (
                  <p className="mt-1 text-sm text-red-600">{errors.model}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Firmware Version *
                </label>
                <input
                  type="text"
                  name="firmware_version"
                  value={formData.firmware_version || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                    errors.firmware_version ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.firmware_version && (
                  <p className="mt-1 text-sm text-red-600">{errors.firmware_version}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Serial Number
                </label>
                <input
                  type="text"
                  name="serial_number"
                  value={formData.serial_number || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  MAC Address
                </label>
                <input
                  type="text"
                  name="mac_address"
                  value={formData.mac_address || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Technical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Technical Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Battery Level (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  name="battery_level"
                  value={formData.battery_level || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Signal Strength (dBm)
                </label>
                <input
                  type="number"
                  name="signal_strength"
                  value={formData.signal_strength || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active || false}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Device Active</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button 
              onClick={() => router.back()} 
              variant="outlineDark"
              label="Cancel"
              icon={<X className="h-4 w-4" />}
              className="px-4 py-2 rounded-lg"
            />
            <Button 
              onClick={handleSaveDevice} 
              variant="primary" 
              label={isUpdating ? 'Saving...' : 'Save Changes'}
              icon={<Save className="h-4 w-4" />}
              className="px-6 py-2 rounded-lg"
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
