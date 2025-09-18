"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { AlertTriangle, Loader2 } from "lucide-react";

interface AddAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAlertModal({ isOpen, onClose }: AddAlertModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    message: "", // Required field from API
    severity: "",
    vehicle_id: "",
    system: "",
    alert_type: "",
    priority: "",
    status: "active",
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

    if (!formData.title.trim()) {
      newErrors.title = "Alert title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Alert description is required";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Alert message is required";
    }
    if (!formData.severity) {
      newErrors.severity = "Severity is required";
    }
    if (!formData.vehicle_id.trim()) {
      newErrors.vehicle_id = "Vehicle ID is required";
    }
    if (!formData.system) {
      newErrors.system = "System is required";
    }
    if (!formData.alert_type) {
      newErrors.alert_type = "Alert type is required";
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
      // Note: This would need to be connected to an actual create alert endpoint
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and close modal
      setFormData({
        title: "",
        description: "",
        message: "",
        severity: "",
        vehicle_id: "",
        system: "",
        alert_type: "",
        priority: "",
        status: "active",
        notes: "",
        fleet_operator: 1,
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Failed to create alert:", error);
      setErrors({ submit: "Failed to create alert. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Alert"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Alert Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alert Information
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <InputGroup
              label="Alert Title *"
              type="text"
              name="title"
              value={formData.title}
              handleChange={handleInputChange}
              placeholder="Enter alert title"
              className={errors.title ? "border-red-500" : ""}
            />
            
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
                placeholder="Enter alert description..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.message ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter alert message..."
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Alert Classification */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Alert Classification
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity *
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.severity ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select severity</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              {errors.severity && (
                <p className="text-red-500 text-sm mt-1">{errors.severity}</p>
              )}
            </div>
            
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
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                System *
              </label>
              <select
                name="system"
                value={formData.system}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.system ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select system</option>
                <option value="engine">Engine</option>
                <option value="brakes">Brakes</option>
                <option value="transmission">Transmission</option>
                <option value="electrical">Electrical</option>
                <option value="fuel">Fuel System</option>
                <option value="tire">Tire</option>
                <option value="battery">Battery</option>
                <option value="navigation">Navigation</option>
                <option value="safety">Safety</option>
                <option value="other">Other</option>
              </select>
              {errors.system && (
                <p className="text-red-500 text-sm mt-1">{errors.system}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alert Type *
              </label>
              <select
                name="alert_type"
                value={formData.alert_type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.alert_type ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select alert type</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
                <option value="info">Information</option>
                <option value="system">System Alert</option>
              </select>
              {errors.alert_type && (
                <p className="text-red-500 text-sm mt-1">{errors.alert_type}</p>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Vehicle Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Vehicle ID *"
              type="text"
              name="vehicle_id"
              value={formData.vehicle_id}
              handleChange={handleInputChange}
              placeholder="Enter vehicle ID"
              className={errors.vehicle_id ? "border-red-500" : ""}
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
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
                <option value="ignored">Ignored</option>
              </select>
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
            label={isLoading ? "Creating..." : "Create Alert"}
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
