"use client";

import { useState, useEffect } from "react";
import { useGetScheduledMaintenanceByIdQuery, useUpdateScheduledMaintenanceMutation } from "@/store/api/fleetApi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Wrench, Save, X } from "lucide-react";

interface MaintenanceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceId: string | null;
}

export function MaintenanceEditModal({ isOpen, onClose, maintenanceId }: MaintenanceEditModalProps) {
  const { data: maintenance, isLoading } = useGetScheduledMaintenanceByIdQuery(maintenanceId || "", {
    skip: !maintenanceId || !isOpen,
  });
  
  const [updateMaintenance, { isLoading: isUpdating }] = useUpdateScheduledMaintenanceMutation();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    maintenance_type: "",
    priority: "",
    status: "",
    estimated_cost: "",
    estimated_duration: "",
    scheduled_date: "",
    due_date: "",
    notes: "",
  });

  useEffect(() => {
    if (maintenance) {
      setFormData({
        title: maintenance.title || "",
        description: maintenance.description || "",
        maintenance_type: maintenance.maintenance_type || "",
        priority: maintenance.priority || "",
        status: maintenance.status || "",
        estimated_cost: maintenance.estimated_cost?.toString() || "",
        estimated_duration: maintenance.estimated_duration?.toString() || "",
        scheduled_date: maintenance.scheduled_date ? new Date(maintenance.scheduled_date).toISOString().split('T')[0] : "",
        due_date: maintenance.due_date ? new Date(maintenance.due_date).toISOString().split('T')[0] : "",
        notes: maintenance.notes || "",
      });
    }
  }, [maintenance]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateMaintenance({
        id: maintenanceId!,
        body: {
          ...formData,
          estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
          estimated_duration: formData.estimated_duration ? parseFloat(formData.estimated_duration) : null,
        }
      }).unwrap();
      
      onClose();
    } catch (error) {
      console.error("Failed to update maintenance:", error);
      alert("Failed to update maintenance. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Maintenance">
      <form onSubmit={handleSubmit} className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Maintenance Header */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Wrench className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Edit Maintenance
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Update maintenance task information
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <InputGroup
                label="Title"
                type="text"
                name="title"
                value={formData.title}
                handleChange={handleChange}
                placeholder="Enter maintenance title"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter maintenance description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Maintenance Type"
                  name="maintenance_type"
                  items={[
                    { value: "routine", label: "Routine" },
                    { value: "preventive", label: "Preventive" },
                    { value: "corrective", label: "Corrective" },
                    { value: "emergency", label: "Emergency" },
                    { value: "inspection", label: "Inspection" },
                  ]}
                  value={formData.maintenance_type}
                  onChange={handleChange}
                  placeholder="Select maintenance type"
                />

                <Select
                  label="Priority"
                  name="priority"
                  items={[
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                    { value: "critical", label: "Critical" },
                  ]}
                  value={formData.priority}
                  onChange={handleChange}
                  placeholder="Select priority"
                />

                <Select
                  label="Status"
                  name="status"
                  items={[
                    { value: "scheduled", label: "Scheduled" },
                    { value: "in_progress", label: "In Progress" },
                    { value: "completed", label: "Completed" },
                    { value: "overdue", label: "Overdue" },
                    { value: "cancelled", label: "Cancelled" },
                  ]}
                  value={formData.status}
                  onChange={handleChange}
                  placeholder="Select status"
                />

                <InputGroup
                  label="Estimated Cost ($)"
                  type="number"
                  name="estimated_cost"
                  value={formData.estimated_cost}
                  handleChange={handleChange}
                  placeholder="Enter estimated cost"
                  step="0.01"
                />

                <InputGroup
                  label="Estimated Duration (hours)"
                  type="number"
                  name="estimated_duration"
                  value={formData.estimated_duration}
                  handleChange={handleChange}
                  placeholder="Enter estimated duration"
                  step="0.1"
                />

                <InputGroup
                  label="Scheduled Date"
                  type="date"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  handleChange={handleChange}
                  placeholder="Select scheduled date"
                />

                <InputGroup
                  label="Due Date"
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  handleChange={handleChange}
                  placeholder="Select due date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Enter additional notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                label="Cancel"
                variant="outlineDark"
                icon={<X className="h-4 w-4" />}
                onClick={onClose}
              />
              <Button
                type="submit"
                label={isUpdating ? "Saving..." : "Save Changes"}
                variant="primary"
                icon={<Save className="h-4 w-4" />}
                disabled={isUpdating}
              />
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
