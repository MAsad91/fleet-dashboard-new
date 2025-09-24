"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateVehicleMutation, useListVehicleTypesQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Car, Loader2 } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";

export default function AddVehiclePage() {
  const router = useRouter();
  const [createVehicle, { isLoading }] = useCreateVehicleMutation();
  const { data: vehicleTypesData } = useListVehicleTypesQuery();
  
  const [formData, setFormData] = useState({
    license_plate: "",
    make: "",
    model: "",
    year: "",
    color: "",
    vin: "",
    vehicle_type: "",
    fuel_type: "gasoline",
    status: "active",
    purchase_date: "",
    purchase_price: "",
    odometer_reading: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    if (!formData.year.trim()) {
      newErrors.year = "Year is required";
    }
    if (!formData.vin.trim()) {
      newErrors.vin = "VIN is required";
    }
    if (!formData.vehicle_type) {
      newErrors.vehicle_type = "Vehicle type is required";
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
        license_plate: formData.license_plate,
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        color: formData.color || null,
        vin: formData.vin,
        vehicle_type: parseInt(formData.vehicle_type),
        fuel_type: formData.fuel_type,
        status: formData.status,
        purchase_date: formData.purchase_date || null,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
        odometer_reading: formData.odometer_reading ? parseInt(formData.odometer_reading) : null,
        notes: formData.notes || null,
      };

      await createVehicle(vehicleData).unwrap();
      
      // Redirect to vehicles list
      router.push('/vehicles');
    } catch (error) {
      console.error("Failed to create vehicle:", error);
      setErrors({ submit: "Failed to create vehicle. Please try again." });
    }
  };

  const handleCancel = () => {
    router.push('/vehicles');
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleCancel}
              variant="outlineDark"
              label="Back"
              icon={<ArrowLeft className="h-4 w-4" />}
              className="px-4 py-2 rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Add New Vehicle
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Add a new vehicle to the fleet
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {errors.submit}
              </div>
            )}

            {/* Vehicle Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Car className="h-5 w-5 mr-2" />
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
                  placeholder="Enter VIN"
                  className={errors.vin ? "border-red-500" : ""}
                />

                <InputGroup
                  label="Make *"
                  type="text"
                  name="make"
                  value={formData.make}
                  handleChange={handleInputChange}
                  placeholder="Enter make"
                  className={errors.make ? "border-red-500" : ""}
                />

                <InputGroup
                  label="Model *"
                  type="text"
                  name="model"
                  value={formData.model}
                  handleChange={handleInputChange}
                  placeholder="Enter model"
                  className={errors.model ? "border-red-500" : ""}
                />

                <InputGroup
                  label="Year *"
                  type="number"
                  name="year"
                  value={formData.year}
                  handleChange={handleInputChange}
                  placeholder="Enter year"
                  className={errors.year ? "border-red-500" : ""}
                />

                <InputGroup
                  label="Color"
                  type="text"
                  name="color"
                  value={formData.color}
                  handleChange={handleInputChange}
                  placeholder="Enter color"
                />
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Vehicle Type</option>
                    {vehicleTypesData?.results?.map((type: any) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {errors.vehicle_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.vehicle_type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fuel Type
                  </label>
                  <select
                    name="fuel_type"
                    value={formData.fuel_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  >
                    <option value="gasoline">Gasoline</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="cng">CNG</option>
                  </select>
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Purchase Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Purchase Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup
                  label="Purchase Date"
                  type="date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  handleChange={handleInputChange}
                  placeholder="Select purchase date"
                />

                <InputGroup
                  label="Purchase Price"
                  type="number"
                  name="purchase_price"
                  value={formData.purchase_price}
                  handleChange={handleInputChange}
                  placeholder="Enter purchase price"
                />

                <InputGroup
                  label="Odometer Reading"
                  type="number"
                  name="odometer_reading"
                  value={formData.odometer_reading}
                  handleChange={handleInputChange}
                  placeholder="Enter odometer reading"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Enter vehicle notes..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                label="Cancel"
                variant="outlineDark"
                onClick={handleCancel}
                className="px-6 py-3"
              />
              <Button
                label={isLoading ? "Creating..." : "Create Vehicle"}
                variant="primary"
                icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Car className="h-4 w-4" />}
                className="px-6 py-3"
                onClick={isLoading ? undefined : handleSubmit}
              />
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}