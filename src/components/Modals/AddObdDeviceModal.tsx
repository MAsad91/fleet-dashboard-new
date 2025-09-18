"use client";

import { useState } from "react";
import { useCreateObdDeviceMutation } from "@/store/api/fleetApi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Activity, Loader2 } from "lucide-react";

interface AddObdDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddObdDeviceModal({ isOpen, onClose }: AddObdDeviceModalProps) {
  const [createObdDevice, { isLoading }] = useCreateObdDeviceMutation();
  
  const [formData, setFormData] = useState({
    device_id: "",
    model: "",
    device_type: "",
    serial_number: "",
    firmware_version: "",
    vehicle_id: "",
    status: "active",
    battery_level: "",
    last_seen: "",
    installation_date: "",
    notes: "",
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

    if (!formData.device_id.trim()) {
      newErrors.device_id = "Device ID is required";
    }
    if (!formData.model.trim()) {
      newErrors.model = "Model is required";
    }
    if (!formData.device_type) {
      newErrors.device_type = "Device type is required";
    }
    if (!formData.serial_number.trim()) {
      newErrors.serial_number = "Serial number is required";
    }
    if (!formData.vehicle_id.trim()) {
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
      const deviceData = {
        ...formData,
        battery_level: formData.battery_level ? parseInt(formData.battery_level) : null,
      };

      await createObdDevice(deviceData).unwrap();
      
      // Reset form and close modal
      setFormData({
        device_id: "",
        model: "",
        device_type: "",
        serial_number: "",
        firmware_version: "",
        vehicle_id: "",
        status: "active",
        battery_level: "",
        last_seen: "",
        installation_date: "",
        notes: "",
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Failed to create OBD device:", error);
      setErrors({ submit: "Failed to create OBD device. Please try again." });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New OBD Device"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Device Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Device Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Device ID *"
              type="text"
              name="device_id"
              value={formData.device_id}
              handleChange={handleInputChange}
              placeholder="Enter device ID"
              className={errors.device_id ? "border-red-500" : ""}
            />
            
            <InputGroup
              label="Model *"
              type="text"
              name="model"
              value={formData.model}
              handleChange={handleInputChange}
              placeholder="Enter device model"
              className={errors.model ? "border-red-500" : ""}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Device Type *
              </label>
              <select
                name="device_type"
                value={formData.device_type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.device_type ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select device type</option>
                <option value="elm327">ELM327</option>
                <option value="obd2">OBD2</option>
                <option value="canbus">CAN Bus</option>
                <option value="bluetooth">Bluetooth</option>
                <option value="wifi">WiFi</option>
                <option value="usb">USB</option>
              </select>
              {errors.device_type && (
                <p className="text-red-500 text-sm mt-1">{errors.device_type}</p>
              )}
            </div>
            
            <InputGroup
              label="Serial Number *"
              type="text"
              name="serial_number"
              value={formData.serial_number}
              handleChange={handleInputChange}
              placeholder="Enter serial number"
              className={errors.serial_number ? "border-red-500" : ""}
            />
            
            <InputGroup
              label="Firmware Version"
              type="text"
              name="firmware_version"
              value={formData.firmware_version}
              handleChange={handleInputChange}
              placeholder="Enter firmware version"
            />
            
            <InputGroup
              label="Battery Level (%)"
              type="number"
              name="battery_level"
              value={formData.battery_level}
              handleChange={handleInputChange}
              placeholder="Enter battery level"
            />
          </div>
        </div>

        {/* Vehicle Assignment */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Vehicle Assignment
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
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Installation Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Installation Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Installation Date"
              type="date"
              name="installation_date"
              value={formData.installation_date}
              handleChange={handleInputChange}
              placeholder=""
            />
            
            <InputGroup
              label="Last Seen"
              type="datetime-local"
              name="last_seen"
              value={formData.last_seen}
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
            label={isLoading ? "Creating..." : "Create OBD Device"}
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
