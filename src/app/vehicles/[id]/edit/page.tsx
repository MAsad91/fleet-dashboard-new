"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetVehicleByIdQuery, useUpdateVehicleMutation, useListVehicleTypesQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Save, X, Car, Loader2 } from "lucide-react";

export default function VehicleEditPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;
  
  const { data: vehicleData, isLoading: vehicleLoading, error: vehicleError } = useGetVehicleByIdQuery(vehicleId);
  const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation();
  const { data: vehicleTypesData, isLoading: vehicleTypesLoading } = useListVehicleTypesQuery();
  
  const [formData, setFormData] = useState({
    license_plate: "",
    make: "",
    model: "",
    year: "",
    vehicle_type: "",
    fuel_type: "",
    color: "",
    vin: "",
    mileage_km: "",
    status: "available",
    warranty_expiry_date: "",
    seating_capacity: "",
    transmission_type: "",
    efficiency_km_per_kwh: "",
    fleet_operator: 1,
    battery_capacity_kwh: "",
    current_battery_level: "",
    alerts_enabled: true,
    ota_enabled: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when vehicle data loads
  useEffect(() => {
    if (vehicleData) {
      const vehicle = vehicleData.vehicle || vehicleData;
      setFormData({
        license_plate: vehicle.license_plate || "",
        make: vehicle.make || "",
        model: vehicle.model || "",
        year: vehicle.year?.toString() || "",
        vehicle_type: vehicle.vehicle_type_id?.toString() || vehicle.vehicle_type?.toString() || "",
        fuel_type: vehicle.fuel_type || "",
        color: vehicle.color || "",
        vin: vehicle.vin || "",
        mileage_km: vehicle.mileage_km?.toString() || "",
        status: vehicle.status || "available",
        warranty_expiry_date: vehicle.warranty_expiry_date ? vehicle.warranty_expiry_date.split('T')[0] : "",
        seating_capacity: vehicle.seating_capacity?.toString() || "",
        transmission_type: vehicle.transmission_type || "",
        efficiency_km_per_kwh: vehicle.efficiency_km_per_kwh?.toString() || "",
        fleet_operator: vehicle.fleet_operator || 1,
        battery_capacity_kwh: vehicle.battery_capacity_kwh?.toString() || "",
        current_battery_level: vehicle.current_battery_level?.toString() || "",
        alerts_enabled: vehicle.alerts_enabled || false,
        ota_enabled: vehicle.ota_enabled || false,
      });
    }
  }, [vehicleData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.license_plate.trim()) {
      newErrors.license_plate = "License plate is required";
    }
    if (!formData.make.trim()) {
      newErrors.make = "Make is required";
    }
    if (!formData.model.trim()) {
      newErrors.model = "Model is required";
    }
    if (!formData.year) {
      newErrors.year = "Year is required";
    }
    if (!formData.vehicle_type) {
      newErrors.vehicle_type = "Vehicle type is required";
    }
    if (!formData.fuel_type) {
      newErrors.fuel_type = "Fuel type is required";
    }
    if (!formData.vin.trim()) {
      newErrors.vin = "VIN is required";
    }
    if (!formData.battery_capacity_kwh) {
      newErrors.battery_capacity_kwh = "Battery capacity is required";
    }
    if (!formData.current_battery_level) {
      newErrors.current_battery_level = "Current battery level is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveVehicle = async () => {
    if (!validateForm()) return;

    try {
      // Transform the form data to match API expectations
      const apiData = {
        license_plate: formData.license_plate,
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        vehicle_type: parseInt(formData.vehicle_type),
        fuel_type: formData.fuel_type,
        color: formData.color,
        vin: formData.vin,
        mileage_km: parseFloat(formData.mileage_km) || 0,
        status: formData.status,
        warranty_expiry_date: formData.warranty_expiry_date || null,
        seating_capacity: parseInt(formData.seating_capacity) || null,
        transmission_type: formData.transmission_type || null,
        efficiency_km_per_kwh: parseFloat(formData.efficiency_km_per_kwh) || null,
        fleet_operator: formData.fleet_operator,
        battery_capacity_kwh: parseFloat(formData.battery_capacity_kwh) || 0,
        current_battery_level: parseFloat(formData.current_battery_level) || 0,
        alerts_enabled: formData.alerts_enabled,
        ota_enabled: formData.ota_enabled,
      };

      const result = await updateVehicle({ id: vehicleId, body: apiData }).unwrap();
      console.log('Vehicle updated successfully:', result);
      router.push(`/vehicles/${vehicleId}/view`);
    } catch (error: any) {
      console.error("Failed to update vehicle:", error);
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

  if (vehicleLoading) {
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

  if (vehicleError || !vehicleData) {
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

        {/* Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">

          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Car className="h-5 w-5" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  License Plate *
                </label>
                <input
                  type="text"
                  name="license_plate"
                  value={formData.license_plate}
                  onChange={handleInputChange}
                  placeholder="Enter license plate"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                    errors.license_plate ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.license_plate && (
                  <p className="mt-1 text-sm text-red-600">{errors.license_plate}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  VIN *
                </label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleInputChange}
                  placeholder="Enter VIN number"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                    errors.vin ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.vin && (
                  <p className="mt-1 text-sm text-red-600">{errors.vin}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Battery Capacity (kWh) *
                </label>
                <input
                  type="number"
                  name="battery_capacity_kwh"
                  value={formData.battery_capacity_kwh}
                  onChange={handleInputChange}
                  placeholder="Enter battery capacity"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                    errors.battery_capacity_kwh ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.battery_capacity_kwh && (
                  <p className="mt-1 text-sm text-red-600">{errors.battery_capacity_kwh}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Battery Level (%) *
                </label>
                <input
                  type="number"
                  name="current_battery_level"
                  value={formData.current_battery_level}
                  onChange={handleInputChange}
                  placeholder="Enter current battery level"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                    errors.current_battery_level ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.current_battery_level && (
                  <p className="mt-1 text-sm text-red-600">{errors.current_battery_level}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Make *
                </label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  placeholder="e.g., Toyota"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                    errors.make ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.make && (
                  <p className="mt-1 text-sm text-red-600">{errors.make}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="e.g., Camry"
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
                  Year *
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  placeholder="e.g., 2023"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                    errors.year ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="e.g., White"
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="space-y-6 mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Vehicle Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vehicle Type *
                </label>
                <select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleInputChange}
                  disabled={vehicleTypesLoading}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                    errors.vehicle_type ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } ${vehicleTypesLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">
                    {vehicleTypesLoading ? "Loading vehicle types..." : "Select vehicle type"}
                  </option>
                  {vehicleTypesData?.results?.map((type: any) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.category})
                    </option>
                  ))}
                </select>
                {errors.vehicle_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.vehicle_type}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fuel Type *
                </label>
                <select
                  name="fuel_type"
                  value={formData.fuel_type}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                    errors.fuel_type ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <option value="">Select fuel type</option>
                  <option value="gasoline">Gasoline</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="lpg">LPG</option>
                  <option value="cng">CNG</option>
                </select>
                {errors.fuel_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.fuel_type}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mileage (km)
                </label>
                <input
                  type="number"
                  name="mileage_km"
                  value={formData.mileage_km}
                  onChange={handleInputChange}
                  placeholder="Enter current mileage"
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seating Capacity
                </label>
                <input
                  type="number"
                  name="seating_capacity"
                  value={formData.seating_capacity}
                  onChange={handleInputChange}
                  placeholder="Enter seating capacity"
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transmission Type
                </label>
                <select
                  name="transmission_type"
                  value={formData.transmission_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select transmission type</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                  <option value="CVT">CVT</option>
                  <option value="Semi-Automatic">Semi-Automatic</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Efficiency (km/kWh)
                </label>
                <input
                  type="number"
                  name="efficiency_km_per_kwh"
                  value={formData.efficiency_km_per_kwh}
                  onChange={handleInputChange}
                  placeholder="Enter efficiency"
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Warranty Expiry Date
                </label>
                <input
                  type="date"
                  name="warranty_expiry_date"
                  value={formData.warranty_expiry_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                >
                  <option value="available">Available</option>
                  <option value="in_service">In Service</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="space-y-6 mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              System Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="alerts_enabled"
                  name="alerts_enabled"
                  checked={formData.alerts_enabled}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="alerts_enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Alerts Enabled
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="ota_enabled"
                  name="ota_enabled"
                  checked={formData.ota_enabled}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="ota_enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  OTA Updates Enabled
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
              onClick={handleSaveVehicle} 
              variant="primary" 
              label={isUpdating ? 'Saving...' : 'Save Changes'}
              icon={isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              className="px-6 py-2 rounded-lg"
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}