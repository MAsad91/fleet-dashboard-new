"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { 
  useGetVehicleByIdQuery, 
  useUpdateVehicleMutation, 
  useDeleteVehicleMutation 
} from "@/store/api/fleetApi";
import { ConfirmationModal } from "./ConfirmationModal";
import { 
  Car, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Calendar,
  Fuel,
  Battery,
  Gauge,
  Wrench
} from "lucide-react";

interface VehicleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number | null;
}

type ViewMode = "view" | "edit";

export function VehicleDetailModal({ isOpen, onClose, vehicleId }: VehicleDetailModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("view");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  // API hooks
  const { data: vehicle, isLoading, error } = useGetVehicleByIdQuery(vehicleId?.toString() || "", {
    skip: !vehicleId || !isOpen
  });
  const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation();
  const [deleteVehicle, { isLoading: isDeleting }] = useDeleteVehicleMutation();

  // Update form data when vehicle data loads
  useEffect(() => {
    if (vehicle) {
      setFormData({
        license_plate: vehicle.license_plate || "",
        make: vehicle.make || "",
        model: vehicle.model || "",
        year: vehicle.year?.toString() || "",
        vehicle_type: vehicle.vehicle_type?.toString() || "",
        fuel_type: vehicle.fuel_type || "",
        color: vehicle.color || "",
        vin: vehicle.vin || "",
        engine_number: vehicle.engine_number || "",
        mileage: vehicle.mileage?.toString() || "",
        status: vehicle.status || "available",
        purchase_date: vehicle.purchase_date || "",
        purchase_price: vehicle.purchase_price?.toString() || "",
        insurance_expiry: vehicle.insurance_expiry || "",
        registration_expiry: vehicle.registration_expiry || "",
        notes: vehicle.notes || "",
        fleet_operator: vehicle.fleet_operator || 1,
        battery_capacity_kwh: vehicle.battery_capacity_kwh?.toString() || "",
        current_battery_level: vehicle.current_battery_level?.toString() || "",
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
      await updateVehicle({
        id: vehicleId.toString(),
        body: formData
      }).unwrap();
      
      setViewMode("view");
      setErrors({});
    } catch (error) {
      console.error("Failed to update vehicle:", error);
      setErrors({ submit: "Failed to update vehicle. Please try again." });
    }
  };

  const handleDelete = async () => {
    if (!vehicleId) return;

    try {
      await deleteVehicle(vehicleId.toString()).unwrap();
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
    }
  };

  const handleClose = () => {
    setViewMode("view");
    setErrors({});
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen || !vehicleId) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={viewMode === "view" ? "Vehicle Details" : "Edit Vehicle"}
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
                  {formData.license_plate || "Vehicle"}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {formData.make} {formData.model} ({formData.year})
                </p>
              </div>
              
              {viewMode === "view" && (
                <div className="flex gap-2">
                  <Button
                    label="Edit"
                    variant="outlineDark"
                    icon={<Edit className="h-4 w-4" />}
                    onClick={() => setViewMode("edit")}
                  />
                  <Button
                    label="Delete"
                    variant="dark"
                    icon={<Trash2 className="h-4 w-4" />}
                    onClick={() => setShowDeleteConfirm(true)}
                  />
                </div>
              )}
              
              {viewMode === "edit" && (
                <div className="flex gap-2">
                  <Button
                    label="Cancel"
                    variant="outlineDark"
                    icon={<X className="h-4 w-4" />}
                    onClick={() => setViewMode("view")}
                  />
                  <Button
                    label="Save"
                    variant="primary"
                    icon={<Save className="h-4 w-4" />}
                    onClick={handleSave}
                    className={isUpdating ? "opacity-50 cursor-not-allowed" : ""}
                  />
                </div>
              )}
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
                  disabled={viewMode === "view"}
                />
                
                <InputGroup
                  label="VIN *"
                  type="text"
                  name="vin"
                  value={formData.vin}
                  handleChange={handleInputChange}
                  placeholder="Enter VIN number"
                  className={errors.vin ? "border-red-500" : ""}
                  disabled={viewMode === "view"}
                />
                
                <InputGroup
                  label="Make *"
                  type="text"
                  name="make"
                  value={formData.make}
                  handleChange={handleInputChange}
                  placeholder="e.g., Toyota"
                  className={errors.make ? "border-red-500" : ""}
                  disabled={viewMode === "view"}
                />
                
                <InputGroup
                  label="Model *"
                  type="text"
                  name="model"
                  value={formData.model}
                  handleChange={handleInputChange}
                  placeholder="e.g., Camry"
                  className={errors.model ? "border-red-500" : ""}
                  disabled={viewMode === "view"}
                />
                
                <InputGroup
                  label="Year *"
                  type="number"
                  name="year"
                  value={formData.year}
                  handleChange={handleInputChange}
                  placeholder="e.g., 2024"
                  className={errors.year ? "border-red-500" : ""}
                  disabled={viewMode === "view"}
                />
                
                <InputGroup
                  label="Color"
                  type="text"
                  name="color"
                  value={formData.color}
                  handleChange={handleInputChange}
                  placeholder="e.g., White"
                  disabled={viewMode === "view"}
                />
              </div>
            </div>

            {/* Vehicle Type and Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Gauge className="h-5 w-5" />
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
                    disabled={viewMode === "view"}
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
                    disabled={viewMode === "view"}
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
                    disabled={viewMode === "view"}
                  >
                    <option value="available">Available</option>
                    <option value="in_use">In Use</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="out_of_service">Out of Service</option>
                  </select>
                </div>
                
                <InputGroup
                  label="Mileage"
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  handleChange={handleInputChange}
                  placeholder="Enter mileage"
                  disabled={viewMode === "view"}
                />
              </div>
            </div>

            {/* Battery Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Battery className="h-5 w-5" />
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
                  disabled={viewMode === "view"}
                />
                
                <InputGroup
                  label="Current Battery Level (%) *"
                  type="number"
                  name="current_battery_level"
                  value={formData.current_battery_level}
                  handleChange={handleInputChange}
                  placeholder="Enter current battery level"
                  className={errors.current_battery_level ? "border-red-500" : ""}
                  disabled={viewMode === "view"}
                />
              </div>
            </div>

            {/* Purchase Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
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
                  disabled={viewMode === "view"}
                />
                
                <InputGroup
                  label="Purchase Price"
                  type="number"
                  name="purchase_price"
                  value={formData.purchase_price}
                  handleChange={handleInputChange}
                  placeholder="Enter purchase price"
                  disabled={viewMode === "view"}
                />
                
                <InputGroup
                  label="Insurance Expiry"
                  type="date"
                  name="insurance_expiry"
                  value={formData.insurance_expiry}
                  handleChange={handleInputChange}
                  placeholder=""
                  disabled={viewMode === "view"}
                />
                
                <InputGroup
                  label="Registration Expiry"
                  type="date"
                  name="registration_expiry"
                  value={formData.registration_expiry}
                  handleChange={handleInputChange}
                  placeholder=""
                  disabled={viewMode === "view"}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Additional Information
              </h3>
              
              <div className="space-y-4">
                <InputGroup
                  label="Engine Number"
                  type="text"
                  name="engine_number"
                  value={formData.engine_number}
                  handleChange={handleInputChange}
                  placeholder="Enter engine number"
                  disabled={viewMode === "view"}
                />
                
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
                    placeholder="Enter additional notes..."
                    disabled={viewMode === "view"}
                  />
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Vehicle"
        message={`Are you sure you want to delete vehicle "${formData.license_plate}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
