"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import { useGetAlertByIdQuery, useUpdateAlertMutation } from "@/store/api/fleetApi";
import { AlertTriangle, Loader2 } from "lucide-react";

interface AlertEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertId: number | null;
}

export function AlertEditModal({ isOpen, onClose, alertId }: AlertEditModalProps) {
  const { data: alert, isLoading, error } = useGetAlertByIdQuery(alertId!, {
    skip: !alertId,
  });
  
  const [updateAlert, { isLoading: isUpdating }] = useUpdateAlertMutation();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "",
    status: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when alert data loads
  useEffect(() => {
    if (alert) {
      setFormData({
        title: alert.title || "",
        description: alert.description || "",
        severity: alert.severity || "",
        status: alert.status || "",
      });
    }
  }, [alert]);

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
    if (!formData.severity) {
      newErrors.severity = "Severity is required";
    }
    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !alertId) {
      return;
    }

    try {
      await updateAlert({
        id: alertId,
        body: formData
      }).unwrap();
      
      onClose();
    } catch (error) {
      console.error("Failed to update alert:", error);
      setErrors({ submit: "Failed to update alert. Please try again." });
    }
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Alert" size="lg">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </Modal>
    );
  }

  if (error || !alert) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Alert" size="lg">
        <div className="text-center text-red-600 py-8">
          Error loading alert details
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Alert" size="lg">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alert Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter alert title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                placeholder="Enter alert description..."
              />
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
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.status ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select status</option>
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
                <option value="ignored">Ignored</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Additional Information
          </h3>
          
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            label="Cancel"
            variant="outlineDark"
            onClick={isUpdating ? undefined : onClose}
            className={isUpdating ? "opacity-50 cursor-not-allowed" : ""}
          />
          <Button
            label={isUpdating ? "Updating..." : "Update Alert"}
            variant="primary"
            className={isUpdating ? "opacity-50 cursor-not-allowed" : ""}
            icon={isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
          />
        </div>
      </form>
    </Modal>
  );
}
