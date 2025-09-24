"use client";

import { useState } from "react";
import { useCreateVehicleMutation, useListVehicleTypesQuery } from "@/store/api/fleetApi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Car, Loader2 } from "lucide-react";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  fleetOperator?: number;
}

export function AddVehicleModal({ isOpen, onClose, onSuccess, fleetOperator }: AddVehicleModalProps) {
  const [createVehicle, { isLoading }] = useCreateVehicleMutation();
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
    // Required fields from API
    fleet_operator: fleetOperator || 1, // Use provided fleet operator or default to 1
    battery_capacity_kwh: "",
    current_battery_level: "",
    alerts_enabled: true,
    ota_enabled: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

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
        fleet_operator: fleetOperator || formData.fleet_operator,
        battery_capacity_kwh: parseFloat(formData.battery_capacity_kwh) || 0,
        current_battery_level: parseFloat(formData.current_battery_level) || 0,
        alerts_enabled: formData.alerts_enabled,
        ota_enabled: formData.ota_enabled,
      };

      const result = await createVehicle(apiData).unwrap();
      console.log('Vehicle created successfully:', result);
      
      // Call success callback to refresh the vehicles list
      onSuccess?.();
      
      // Reset form and close modal
      setFormData({
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
        fleet_operator: fleetOperator || 1,
        battery_capacity_kwh: "",
        current_battery_level: "",
        alerts_enabled: true,
        ota_enabled: false,
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Failed to create vehicle:", error);
      setErrors({ submit: "Failed to create vehicle. Please try again." });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Vehicle"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Car className="h-5 w-5" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="License Plate *"
              type="text"
              name="license_plate"
              value={formData.license_plate}
              handleChange={handleInputChange}
              placeholder="Enter license plate"
              className={errors.license_plate ? "border-red-500" : ""}
            />
            
            <InputGroup
              label="VIN *"
              type="text"
              name="vin"
              value={formData.vin}
              handleChange={handleInputChange}
              placeholder="Enter VIN number"
              className={errors.vin ? "border-red-500" : ""}
            />
            
            <InputGroup
              label="Battery Capacity (kWh) *"
              type="number"
              name="battery_capacity_kwh"
              value={formData.battery_capacity_kwh}
              handleChange={handleInputChange}
              placeholder="Enter battery capacity"
              className={errors.battery_capacity_kwh ? "border-red-500" : ""}
            />
            
            <InputGroup
              label="Current Battery Level (%) *"
              type="number"
              name="current_battery_level"
              value={formData.current_battery_level}
              handleChange={handleInputChange}
              placeholder="Enter current battery level"
              className={errors.current_battery_level ? "border-red-500" : ""}
            />
            
            <InputGroup
              label="Make *"
              type="text"
              name="make"
              value={formData.make}
              handleChange={handleInputChange}
              placeholder="e.g., Toyota"
              className={errors.make ? "border-red-500" : ""}
            />
            
            <InputGroup
              label="Model *"
              type="text"
              name="model"
              value={formData.model}
              handleChange={handleInputChange}
              placeholder="e.g., Camry"
              className={errors.model ? "border-red-500" : ""}
            />
            
            <InputGroup
              label="Year *"
              type="number"
              name="year"
              value={formData.year}
              handleChange={handleInputChange}
              placeholder="e.g., 2023"
              className={errors.year ? "border-red-500" : ""}
            />
            
            <InputGroup
              label="Color"
              type="text"
              name="color"
              value={formData.color}
              handleChange={handleInputChange}
              placeholder="e.g., White"
            />
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Vehicle Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-red-500 text-sm mt-1">{errors.vehicle_type}</p>
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
                <p className="text-red-500 text-sm mt-1">{errors.fuel_type}</p>
              )}
            </div>
            
            <InputGroup
              label="Mileage (km)"
              type="number"
              name="mileage_km"
              value={formData.mileage_km}
              handleChange={handleInputChange}
              placeholder="Enter current mileage"
            />
            
            <InputGroup
              label="Seating Capacity"
              type="number"
              name="seating_capacity"
              value={formData.seating_capacity}
              handleChange={handleInputChange}
              placeholder="Enter seating capacity"
            />
            
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
            
            <InputGroup
              label="Efficiency (km/kWh)"
              type="number"
              name="efficiency_km_per_kwh"
              value={formData.efficiency_km_per_kwh}
              handleChange={handleInputChange}
              placeholder="Enter efficiency"
            />
          </div>
        </div>

        {/* System Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            System Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="alerts_enabled"
                name="alerts_enabled"
                checked={formData.alerts_enabled}
                onChange={(e) => setFormData(prev => ({ ...prev, alerts_enabled: e.target.checked }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, ota_enabled: e.target.checked }))}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="ota_enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                OTA Updates Enabled
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            label="Cancel"
            variant="outlineDark"
            onClick={isLoading ? undefined : onClose}
            className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
          />
          <Button
            label={isLoading ? "Creating..." : "Create Vehicle"}
            variant="primary"
            onClick={isLoading ? undefined : undefined}
            className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
            icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
          />
        </div>
      </form>
    </Modal>
  );
}
