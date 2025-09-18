"use client";

import { useState } from "react";
import { useCreateVehicleMutation } from "@/store/api/fleetApi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Car, Loader2 } from "lucide-react";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddVehicleModal({ isOpen, onClose }: AddVehicleModalProps) {
  const [createVehicle, { isLoading }] = useCreateVehicleMutation();
  
  const [formData, setFormData] = useState({
    license_plate: "",
    make: "",
    model: "",
    year: "",
    vehicle_type: "",
    fuel_type: "",
    color: "",
    vin: "",
    engine_number: "",
    mileage: "",
    status: "available", // Changed from "active" to "available" (valid choice)
    purchase_date: "",
    purchase_price: "",
    insurance_expiry: "",
    registration_expiry: "",
    notes: "",
    // Required fields from API
    fleet_operator: 1, // Default fleet operator ID
    battery_capacity_kwh: "",
    current_battery_level: "",
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
      const vehicleData = {
        ...formData,
        year: parseInt(formData.year),
        mileage: formData.mileage ? parseInt(formData.mileage) : 0,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : 0,
      };

      await createVehicle(vehicleData).unwrap();
      
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
        engine_number: "",
        mileage: "",
        status: "available",
        purchase_date: "",
        purchase_price: "",
        insurance_expiry: "",
        registration_expiry: "",
        notes: "",
        fleet_operator: 1,
        battery_capacity_kwh: "",
        current_battery_level: "",
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.vehicle_type ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select vehicle type</option>
                <option value="1">Sedan</option>
                <option value="2">SUV</option>
                <option value="3">Truck</option>
                <option value="4">Van</option>
                <option value="5">Motorcycle</option>
                <option value="6">Bus</option>
                <option value="7">Electric Vehicle</option>
                <option value="8">Hybrid Vehicle</option>
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
              label="Engine Number"
              type="text"
              name="engine_number"
              value={formData.engine_number}
              handleChange={handleInputChange}
              placeholder="Enter engine number"
            />
            
            <InputGroup
              label="Mileage (km)"
              type="number"
              name="mileage"
              value={formData.mileage}
              handleChange={handleInputChange}
              placeholder="Enter current mileage"
            />
          </div>
        </div>

        {/* Purchase Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Purchase Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Purchase Date"
              type="date"
              name="purchase_date"
              value={formData.purchase_date}
              handleChange={handleInputChange}
              placeholder=""
            />
            
            <InputGroup
              label="Purchase Price"
              type="number"
              name="purchase_price"
              value={formData.purchase_price}
              handleChange={handleInputChange}
              placeholder="Enter purchase price"
            />
          </div>
        </div>

        {/* Legal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Legal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Insurance Expiry"
              type="date"
              name="insurance_expiry"
              value={formData.insurance_expiry}
              handleChange={handleInputChange}
              placeholder=""
            />
            
            <InputGroup
              label="Registration Expiry"
              type="date"
              name="registration_expiry"
              value={formData.registration_expiry}
              handleChange={handleInputChange}
              placeholder=""
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Additional Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              placeholder="Enter any additional notes..."
            />
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
