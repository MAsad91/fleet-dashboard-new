"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateVehicleTypeMutation } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Save, X } from "lucide-react";

export default function VehicleTypeAddPage() {
  const router = useRouter();
  const [createVehicleType, { isLoading: isCreating }] = useCreateVehicleTypeMutation();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    drivetrain: '',
    battery_capacity_kwh: '',
    motor_power_kw: '',
    wltp_range_km: '',
    status: 'active',
    description: '',
  });

  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.code?.trim()) newErrors.code = 'Code is required';
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.category?.trim()) newErrors.category = 'Category is required';
    if (!formData.drivetrain?.trim()) newErrors.drivetrain = 'Drivetrain is required';
    if (!formData.battery_capacity_kwh?.trim()) newErrors.battery_capacity_kwh = 'Battery capacity is required';
    if (!formData.motor_power_kw?.trim()) newErrors.motor_power_kw = 'Motor power is required';
    if (!formData.wltp_range_km?.trim()) newErrors.wltp_range_km = 'WLTP range is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveVehicleType = async () => {
    if (!validateForm()) return;

    try {
      const apiData = {
        code: formData.code,
        name: formData.name,
        category: formData.category,
        drivetrain: formData.drivetrain,
        battery_capacity_kwh: parseFloat(formData.battery_capacity_kwh),
        motor_power_kw: parseFloat(formData.motor_power_kw),
        wltp_range_km: parseFloat(formData.wltp_range_km),
        status: formData.status,
        description: formData.description || null,
      };

      const result = await createVehicleType(apiData).unwrap();
      router.push('/vehicle-types');
    } catch (error: any) {
      console.error('Error creating vehicle type:', error);
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

  const handleCancel = () => {
    router.push('/vehicle-types');
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'FLEET_USER']}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            label=""
            variant="outlineDark"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.back()}
            className="p-2"
          />
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.code ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="e.g., VTY-ESPR-2024"
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
              )}
            </div>

            {/* Name */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="e.g., eSprinter Van"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Category */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.category ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select Category</option>
                <option value="Car">Car</option>
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
                <option value="SUV">SUV</option>
                <option value="4W">4W</option>
                <option value="2W">2W</option>
                <option value="3W">3W</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Drivetrain */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Drivetrain *
              </label>
              <select
                name="drivetrain"
                value={formData.drivetrain}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.drivetrain ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select Drivetrain</option>
                <option value="FWD">Front Wheel Drive (FWD)</option>
                <option value="RWD">Rear Wheel Drive (RWD)</option>
                <option value="AWD">All Wheel Drive (AWD)</option>
                <option value="4WD">Four Wheel Drive (4WD)</option>
              </select>
              {errors.drivetrain && (
                <p className="mt-1 text-sm text-red-600">{errors.drivetrain}</p>
              )}
            </div>

            {/* Battery Capacity */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Battery Capacity (kWh) *
              </label>
              <input
                type="number"
                name="battery_capacity_kwh"
                value={formData.battery_capacity_kwh}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.battery_capacity_kwh ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="e.g., 113.0"
                step="0.1"
              />
              {errors.battery_capacity_kwh && (
                <p className="mt-1 text-sm text-red-600">{errors.battery_capacity_kwh}</p>
              )}
            </div>

            {/* Motor Power */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Motor Power (kW) *
              </label>
              <input
                type="number"
                name="motor_power_kw"
                value={formData.motor_power_kw}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.motor_power_kw ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="e.g., 150.0"
                step="0.1"
              />
              {errors.motor_power_kw && (
                <p className="mt-1 text-sm text-red-600">{errors.motor_power_kw}</p>
              )}
            </div>

            {/* WLTP Range */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                WLTP Range (km) *
              </label>
              <input
                type="number"
                name="wltp_range_km"
                value={formData.wltp_range_km}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.wltp_range_km ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="e.g., 440.0"
                step="0.1"
              />
              {errors.wltp_range_km && (
                <p className="mt-1 text-sm text-red-600">{errors.wltp_range_km}</p>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                placeholder="Enter a description for this vehicle type..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              label="Cancel"
              variant="outlineDark"
              icon={<X className="h-4 w-4" />}
              onClick={handleCancel}
            />
            <Button
              label={isCreating ? "Creating..." : "Save Vehicle Type"}
              variant="primary"
              icon={<Save className="h-4 w-4" />}
              onClick={isCreating ? undefined : handleSaveVehicleType}
              className={isCreating ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
