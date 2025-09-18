"use client";

import { useState } from "react";
import { useCreateTripMutation } from "@/store/api/fleetApi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { MapPin, Loader2 } from "lucide-react";

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTripModal({ isOpen, onClose }: AddTripModalProps) {
  const [createTrip, { isLoading }] = useCreateTripMutation();
  
  const [formData, setFormData] = useState({
    trip_id: "",
    driver_id: "",
    vehicle_id: "",
    start_location: "",
    end_location: "",
    start_time: "",
    end_time: "",
    purpose: "",
    notes: "",
    status: "scheduled",
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

    if (!formData.trip_id.trim()) {
      newErrors.trip_id = "Trip ID is required";
    }
    if (!formData.driver_id.trim()) {
      newErrors.driver_id = "Driver is required";
    }
    if (!formData.vehicle_id.trim()) {
      newErrors.vehicle_id = "Vehicle is required";
    }
    if (!formData.start_location.trim()) {
      newErrors.start_location = "Start location is required";
    }
    if (!formData.end_location.trim()) {
      newErrors.end_location = "End location is required";
    }
    if (!formData.start_time) {
      newErrors.start_time = "Start time is required";
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
      await createTrip(formData).unwrap();
      
      // Reset form and close modal
      setFormData({
        trip_id: "",
        driver_id: "",
        vehicle_id: "",
        start_location: "",
        end_location: "",
        start_time: "",
        end_time: "",
        purpose: "",
        notes: "",
        status: "scheduled",
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Failed to create trip:", error);
      setErrors({ submit: "Failed to create trip. Please try again." });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Trip"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Trip Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Trip Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Trip ID *"
              type="text"
              name="trip_id"
              value={formData.trip_id}
              handleChange={handleInputChange}
              placeholder="Enter trip ID"
              className={errors.trip_id ? "border-red-500" : ""}
            />
            
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
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assignment */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Assignment
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Driver ID *"
              type="text"
              name="driver_id"
              value={formData.driver_id}
              handleChange={handleInputChange}
              placeholder="Enter driver ID"
              className={errors.driver_id ? "border-red-500" : ""}
            />
            
            <InputGroup
              label="Vehicle ID *"
              type="text"
              name="vehicle_id"
              value={formData.vehicle_id}
              handleChange={handleInputChange}
              placeholder="Enter vehicle ID"
              className={errors.vehicle_id ? "border-red-500" : ""}
            />
          </div>
        </div>

        {/* Location Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Location Information
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <InputGroup
              label="Start Location *"
              type="text"
              name="start_location"
              value={formData.start_location}
              handleChange={handleInputChange}
              placeholder="Enter start location"
              className={errors.start_location ? "border-red-500" : ""}
            />
            
            <InputGroup
              label="End Location *"
              type="text"
              name="end_location"
              value={formData.end_location}
              handleChange={handleInputChange}
              placeholder="Enter end location"
              className={errors.end_location ? "border-red-500" : ""}
            />
          </div>
        </div>

        {/* Time Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Time Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Start Time *"
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              handleChange={handleInputChange}
              className={errors.start_time ? "border-red-500" : ""}
              placeholder=""
            />
            
            <InputGroup
              label="End Time"
              type="datetime-local"
              name="end_time"
              value={formData.end_time}
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
          
          <div className="grid grid-cols-1 gap-4">
            <InputGroup
              label="Purpose"
              type="text"
              name="purpose"
              value={formData.purpose}
              handleChange={handleInputChange}
              placeholder="Enter trip purpose"
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
                placeholder="Enter any additional notes..."
              />
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
            label={isLoading ? "Creating..." : "Create Trip"}
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
