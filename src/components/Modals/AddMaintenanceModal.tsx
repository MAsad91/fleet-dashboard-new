"use client";

import { useState } from "react";
import { useCreateScheduledMaintenanceMutation } from "@/store/api/maintenanceApi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Wrench, Loader2 } from "lucide-react";

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddMaintenanceModal({ isOpen, onClose }: AddMaintenanceModalProps) {
  const [createMaintenance, { isLoading }] = useCreateScheduledMaintenanceMutation();
  
  const [formData, setFormData] = useState({
    vehicle: "", // Changed from vehicle_id to vehicle (API requirement)
    maintenance_type: "",
    title: "",
    description: "",
    scheduled_date: "",
    due_date: "",
    priority: "",
    status: "scheduled",
    assigned_technician: "",
    estimated_cost: "",
    parts_required: "",
    notes: "",
    // Required fields from API
    fleet_operator: 1, // Default fleet operator ID
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

    if (!formData.vehicle.trim()) {
      newErrors.vehicle = "Vehicle is required";
    }
    if (!formData.maintenance_type) {
      newErrors.maintenance_type = "Maintenance type is required";
    }
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.scheduled_date) {
      newErrors.scheduled_date = "Scheduled date is required";
    }
    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
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
      const maintenanceData = {
        ...formData,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : 0,
      };

      await createMaintenance(maintenanceData).unwrap();
      
      // Reset form and close modal
      setFormData({
        vehicle: "",
        maintenance_type: "",
        title: "",
        description: "",
        scheduled_date: "",
        due_date: "",
        priority: "",
        status: "scheduled",
        assigned_technician: "",
        estimated_cost: "",
        parts_required: "",
        notes: "",
        fleet_operator: 1,
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Failed to create maintenance:", error);
      setErrors({ submit: "Failed to create maintenance. Please try again." });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule New Maintenance"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Maintenance Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Vehicle *"
              type="text"
              name="vehicle"
              value={formData.vehicle}
              handleChange={handleInputChange}
              placeholder="Enter vehicle ID"
              className={errors.vehicle ? "border-red-500" : ""}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maintenance Type *
              </label>
              <select
                name="maintenance_type"
                value={formData.maintenance_type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.maintenance_type ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select maintenance type</option>
                <option value="routine">Routine Maintenance</option>
                <option value="preventive">Preventive Maintenance</option>
                <option value="corrective">Corrective Maintenance</option>
                <option value="emergency">Emergency Repair</option>
                <option value="inspection">Inspection</option>
                <option value="oil_change">Oil Change</option>
                <option value="tire_rotation">Tire Rotation</option>
                <option value="brake_service">Brake Service</option>
                <option value="engine_service">Engine Service</option>
                <option value="transmission">Transmission Service</option>
                <option value="electrical">Electrical Service</option>
              </select>
              {errors.maintenance_type && (
                <p className="text-red-500 text-sm mt-1">{errors.maintenance_type}</p>
              )}
            </div>
            
            <InputGroup
              label="Title *"
              type="text"
              name="title"
              value={formData.title}
              handleChange={handleInputChange}
              placeholder="Enter maintenance title"
              className={errors.title ? "border-red-500" : ""}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Enter maintenance description..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Scheduling Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Scheduling Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Scheduled Date *"
              type="date"
              name="scheduled_date"
              value={formData.scheduled_date}
              handleChange={handleInputChange}
              className={errors.scheduled_date ? "border-red-500" : ""}
              placeholder=""
            />
            
            <InputGroup
              label="Due Date *"
              type="date"
              name="due_date"
              value={formData.due_date}
              handleChange={handleInputChange}
              className={errors.due_date ? "border-red-500" : ""}
              placeholder=""
            />
          </div>
        </div>

        {/* Assignment Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Assignment Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Assigned Technician"
              type="text"
              name="assigned_technician"
              value={formData.assigned_technician}
              handleChange={handleInputChange}
              placeholder="Enter technician name"
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
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cost and Parts Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Cost and Parts Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Estimated Cost"
              type="number"
              name="estimated_cost"
              value={formData.estimated_cost}
              handleChange={handleInputChange}
              placeholder="Enter estimated cost"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Parts Required
              </label>
              <textarea
                name="parts_required"
                value={formData.parts_required}
                onChange={(e) => setFormData(prev => ({ ...prev, parts_required: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                placeholder="List required parts..."
              />
            </div>
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
            label={isLoading ? "Creating..." : "Schedule Maintenance"}
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
