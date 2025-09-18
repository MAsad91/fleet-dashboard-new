"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { 
  useGetVehicleByIdQuery, 
  useUpdateVehicleMutation 
} from "@/store/api/fleetApi";
import { 
  Save, 
  X, 
  Car
} from "lucide-react";

interface VehicleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number | null;
}

export function VehicleEditModal({ isOpen, onClose, vehicleId }: VehicleEditModalProps) {
  const [formData, setFormData] = useState({
    license_plate: "",
    make: "",
    model: "",
    year: "",
    vehicle_type: "",
    fuel_type: "",
    color: "",
    vin: "",
    mileage: "",
    status: "available",
    fleet_operator: 1,
    battery_capacity_kwh: "",
    current_battery_level: "",
    seating_capacity: "",
    transmission_type: "",
    efficiency_km_per_kwh: "",
    warranty_expiry_date: "",
    alerts_enabled: true,
    ota_enabled: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // API hooks
  const { data: vehicle, isLoading, error } = useGetVehicleByIdQuery(vehicleId?.toString() || "", {
    skip: !vehicleId || !isOpen
  });
  const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation();

  // Update form data when vehicle data loads
  useEffect(() => {
    if (vehicle) {
      // The API returns vehicle data nested under 'vehicle' property
      const vehicleData = vehicle.vehicle || vehicle;
      setFormData({
        license_plate: vehicleData.license_plate || "",
        make: vehicleData.make || "",
        model: vehicleData.model || "",
        year: vehicleData.year?.toString() || "",
        vehicle_type: vehicleData.vehicle_type_id?.toString() || vehicleData.vehicle_type || "",
        fuel_type: vehicleData.fuel_type || "",
        color: vehicleData.color || "",
        vin: vehicleData.vin || "",
        mileage: vehicleData.mileage_km?.toString() || "",
        status: vehicleData.status || "available",
        fleet_operator: vehicleData.fleet_operator || 1,
        battery_capacity_kwh: vehicleData.battery_capacity_kwh?.toString() || "",
        current_battery_level: vehicleData.current_battery_level?.toString() || "",
        seating_capacity: vehicleData.seating_capacity?.toString() || "",
        transmission_type: vehicleData.transmission_type || "",
        efficiency_km_per_kwh: vehicleData.efficiency_km_per_kwh?.toString() || "",
        warranty_expiry_date: vehicleData.warranty_expiry_date || "",
        alerts_enabled: vehicleData.alerts_enabled ?? true,
        ota_enabled: vehicleData.ota_enabled ?? false,
      });
    }
  }, [vehicle]);

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

  const handleSave = async () => {
    if (!validateForm() || !vehicleId) return;

    try {
      // Transform the form data to match API expectations
      const { vehicle_type, mileage, seating_capacity, efficiency_km_per_kwh, warranty_expiry_date, transmission_type, ...restFormData } = formData;
      const apiData = {
        ...restFormData,
        vehicle_type_id: parseInt(vehicle_type) || null,
        mileage_km: parseFloat(mileage) || 0,
        battery_capacity_kwh: parseFloat(formData.battery_capacity_kwh) || 0,
        current_battery_level: parseFloat(formData.current_battery_level) || 0,
        year: parseInt(formData.year) || null,
        seating_capacity: parseInt(seating_capacity) || null,
        efficiency_km_per_kwh: parseFloat(efficiency_km_per_kwh) || null,
        warranty_expiry_date: warranty_expiry_date || null, // Convert empty string to null
        transmission_type: transmission_type || null, // Convert empty string to null
      };

      console.log('Sending vehicle update data:', apiData);

      await updateVehicle({
        id: vehicleId.toString(),
        body: apiData
      }).unwrap();
      
      onClose();
    } catch (error) {
      console.error("Failed to update vehicle:", error);
      setErrors({ submit: "Failed to update vehicle. Please try again." });
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen || !vehicleId) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Vehicle"
      size="xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load vehicle details</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit {formData.license_plate || "Vehicle"}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Update vehicle information
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                label="Cancel"
                variant="outlineDark"
                icon={<X className="h-4 w-4" />}
                onClick={handleClose}
              />
              <Button
                label="Save Changes"
                variant="primary"
                icon={<Save className="h-4 w-4" />}
                onClick={handleSave}
                className={isUpdating ? "opacity-50 cursor-not-allowed" : ""}
              />
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Information
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
                placeholder="e.g., 2024"
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

          {/* Vehicle Type and Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Car className="h-5 w-5" />
              Type & Status
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                >
                  <option value="available">Available</option>
                  <option value="in_service">In Service</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              
              <InputGroup
                label="Mileage"
                type="number"
                name="mileage"
                value={formData.mileage}
                handleChange={handleInputChange}
                placeholder="Enter mileage"
              />
            </div>
          </div>

          {/* Battery Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Car className="h-5 w-5" />
              Battery Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>

          {/* Vehicle Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Specifications
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup
                label="Seating Capacity"
                type="number"
                name="seating_capacity"
                value={formData.seating_capacity}
                handleChange={handleInputChange}
                placeholder="Enter seating capacity"
              />
              
              <InputGroup
                label="Transmission Type"
                type="text"
                name="transmission_type"
                value={formData.transmission_type}
                handleChange={handleInputChange}
                placeholder="e.g., Automatic, Manual"
              />
              
              <InputGroup
                label="Efficiency (km/kWh)"
                type="number"
                name="efficiency_km_per_kwh"
                value={formData.efficiency_km_per_kwh}
                handleChange={handleInputChange}
                placeholder="Enter efficiency"
              />
              
              <InputGroup
                label="Warranty Expiry Date"
                type="date"
                name="warranty_expiry_date"
                value={formData.warranty_expiry_date}
                handleChange={handleInputChange}
                placeholder=""
              />
            </div>
          </div>

          {/* Vehicle Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Settings
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

          {/* Error Messages */}
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
