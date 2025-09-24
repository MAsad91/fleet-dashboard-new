"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateScheduledMaintenanceMutation } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Wrench, Loader2 } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";

export default function AddMaintenancePage() {
  const router = useRouter();
  const [createMaintenance, { isLoading }] = useCreateScheduledMaintenanceMutation();
  
  const [formData, setFormData] = useState({
    vehicle: "",
    maintenance_type: "",
    title: "",
    priority: "",
    description: "",
    scheduled_date: "",
    due_date: "",
    assigned_technician: "",
    status: "scheduled",
    estimated_cost: "",
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

    if (!formData.vehicle.trim()) {
      newErrors.vehicle = "Vehicle is required";
    }
    if (!formData.maintenance_type.trim()) {
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
        vehicle: parseInt(formData.vehicle),
        maintenance_type: formData.maintenance_type,
        title: formData.title,
        priority: formData.priority || null,
        description: formData.description,
        scheduled_date: formData.scheduled_date,
        due_date: formData.due_date,
        assigned_technician: formData.assigned_technician || null,
        status: formData.status,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
        notes: formData.notes || null,
      };

      await createMaintenance(maintenanceData).unwrap();
      
      // Redirect to maintenance list
      router.push('/maintenance');
    } catch (error) {
      console.error("Failed to create maintenance:", error);
      setErrors({ submit: "Failed to create maintenance. Please try again." });
    }
  };

  const handleCancel = () => {
    router.push('/maintenance');
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
                Schedule New Maintenance
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Schedule maintenance for fleet vehicles
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

            {/* Maintenance Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Wrench className="h-5 w-5 mr-2" />
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select maintenance type</option>
                    <option value="routine">Routine</option>
                    <option value="preventive">Preventive</option>
                    <option value="corrective">Corrective</option>
                    <option value="emergency">Emergency</option>
                    <option value="inspection">Inspection</option>
                    <option value="repair">Repair</option>
                    <option value="replacement">Replacement</option>
                  </select>
                  {errors.maintenance_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.maintenance_type}</p>
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

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter maintenance description..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Scheduling Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Scheduling Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup
                  label="Scheduled Date *"
                  type="date"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  handleChange={handleInputChange}
                  placeholder="Select scheduled date"
                  className={errors.scheduled_date ? "border-red-500" : ""}
                />

                <InputGroup
                  label="Due Date *"
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  handleChange={handleInputChange}
                  placeholder="Select due date"
                  className={errors.due_date ? "border-red-500" : ""}
                />
              </div>
            </div>

            {/* Assignment Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
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

                <InputGroup
                  label="Estimated Cost"
                  type="number"
                  name="estimated_cost"
                  value={formData.estimated_cost}
                  handleChange={handleInputChange}
                  placeholder="Enter estimated cost"
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
                    placeholder="Enter additional notes..."
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
                label={isLoading ? "Creating..." : "Schedule Maintenance"}
                variant="primary"
                icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
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