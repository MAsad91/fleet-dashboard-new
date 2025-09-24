"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Loader2 } from "lucide-react";

interface EditVehicleTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  typeId: number | null;
  typeData?: any;
}

export function EditVehicleTypeModal({ isOpen, onClose, onSuccess, typeId, typeData }: EditVehicleTypeModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    max_speed: "",
    max_weight: "",
    fuel_capacity: "",
    battery_capacity: "",
    seating_capacity: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Populate form when type data is provided
  useEffect(() => {
    if (typeData) {
      setFormData({
        name: typeData.name || "",
        description: typeData.description || "",
        category: typeData.category || "",
        max_speed: typeData.max_speed || "",
        max_weight: typeData.max_weight || "",
        fuel_capacity: typeData.fuel_capacity || "",
        battery_capacity: typeData.battery_capacity || "",
        seating_capacity: typeData.seating_capacity || "",
      });
    }
  }, [typeData]);

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

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call when backend endpoint is available
      console.log('Updating vehicle type:', typeId, formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call success callback
      onSuccess?.();
      
      // Close modal
      onClose();
    } catch (error) {
      console.error("Failed to update vehicle type:", error);
      setErrors({ submit: "Failed to update vehicle type. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { value: "sedan", label: "Sedan" },
    { value: "suv", label: "SUV" },
    { value: "truck", label: "Truck" },
    { value: "van", label: "Van" },
    { value: "motorcycle", label: "Motorcycle" },
    { value: "bus", label: "Bus" },
    { value: "electric", label: "Electric Vehicle" },
    { value: "hybrid", label: "Hybrid Vehicle" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Vehicle Type"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup
            label="Name *"
            type="text"
            name="name"
            value={formData.name}
            handleChange={handleInputChange}
            placeholder="Enter vehicle type name"
            className={errors.name ? "border-red-500" : ""}
          />
          
          <div>
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
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter vehicle type description"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            />
          </div>

          <InputGroup
            label="Max Speed (km/h)"
            type="number"
            name="max_speed"
            value={formData.max_speed}
            handleChange={handleInputChange}
            placeholder="Enter maximum speed"
          />

          <InputGroup
            label="Max Weight (kg)"
            type="number"
            name="max_weight"
            value={formData.max_weight}
            handleChange={handleInputChange}
            placeholder="Enter maximum weight"
          />

          <InputGroup
            label="Fuel Capacity (L)"
            type="number"
            name="fuel_capacity"
            value={formData.fuel_capacity}
            handleChange={handleInputChange}
            placeholder="Enter fuel capacity"
          />

          <InputGroup
            label="Battery Capacity (kWh)"
            type="number"
            name="battery_capacity"
            value={formData.battery_capacity}
            handleChange={handleInputChange}
            placeholder="Enter battery capacity"
          />

          <InputGroup
            label="Seating Capacity"
            type="number"
            name="seating_capacity"
            value={formData.seating_capacity}
            handleChange={handleInputChange}
            placeholder="Enter seating capacity"
          />
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
            label={isLoading ? "Updating..." : "Update Vehicle Type"}
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
