"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateAlertMutation } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";

export default function AddAlertPage() {
  const router = useRouter();
  const [createAlert, { isLoading }] = useCreateAlertMutation();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    message: "",
    severity: "",
    priority: "",
    system: "",
    alert_type: "",
    vehicle_id: "",
    status: "active",
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

    if (!formData.title.trim()) {
      newErrors.title = "Alert title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }
    if (!formData.severity) {
      newErrors.severity = "Severity is required";
    }
    if (!formData.system) {
      newErrors.system = "System is required";
    }
    if (!formData.alert_type) {
      newErrors.alert_type = "Alert type is required";
    }
    if (!formData.vehicle_id) {
      newErrors.vehicle_id = "Vehicle ID is required";
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
      const alertData = {
        title: formData.title,
        description: formData.description,
        message: formData.message,
        severity: formData.severity,
        priority: formData.priority || null,
        system: formData.system,
        alert_type: formData.alert_type,
        vehicle_id: parseInt(formData.vehicle_id),
        status: formData.status,
        notes: formData.notes || null,
      };

      await createAlert(alertData).unwrap();
      
      // Redirect to alerts list
      router.push('/alerts');
    } catch (error) {
      console.error("Failed to create alert:", error);
      setErrors({ submit: "Failed to create alert. Please try again." });
    }
  };

  const handleCancel = () => {
    router.push('/alerts');
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
                Create New Alert
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create a new alert for fleet management
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

            {/* Alert Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
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
                    onChange={handleInputChange}
                    placeholder="Enter alert description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter alert message..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Alert Classification */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select severity</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  {errors.severity && (
                    <p className="mt-1 text-sm text-red-600">{errors.severity}</p>
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
                    <option value="medium">Medium</option>
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select system</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="driver">Driver</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="telemetry">Telemetry</option>
                    <option value="obd">OBD Device</option>
                    <option value="sim">SIM Card</option>
                  </select>
                  {errors.system && (
                    <p className="mt-1 text-sm text-red-600">{errors.system}</p>
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select alert type</option>
                    <option value="engine">Engine</option>
                    <option value="battery">Battery</option>
                    <option value="fuel">Fuel</option>
                    <option value="speed">Speed</option>
                    <option value="location">Location</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="safety">Safety</option>
                    <option value="performance">Performance</option>
                  </select>
                  {errors.alert_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.alert_type}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
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
                label={isLoading ? "Creating..." : "Create Alert"}
                variant="primary"
                icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
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