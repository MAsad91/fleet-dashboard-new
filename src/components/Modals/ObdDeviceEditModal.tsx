"use client";

import { useState, useEffect } from "react";
import { useGetObdDeviceByIdQuery, useUpdateObdDeviceMutation } from "@/store/api/fleetApi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Activity, Save, X } from "lucide-react";

interface ObdDeviceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string | null;
}

export function ObdDeviceEditModal({ isOpen, onClose, deviceId }: ObdDeviceEditModalProps) {
  const { data: device, isLoading } = useGetObdDeviceByIdQuery(deviceId || "", {
    skip: !deviceId || !isOpen,
  });
  
  const [updateDevice, { isLoading: isUpdating }] = useUpdateObdDeviceMutation();
  
  const [formData, setFormData] = useState({
    device_id: "",
    model: "",
    serial_number: "",
    firmware_version: "",
    device_type: "",
    report_interval_sec: "",
    can_baud_rate: "",
    is_active: true,
  });

  useEffect(() => {
    if (device) {
      setFormData({
        device_id: device.device_id || "",
        model: device.model || "",
        serial_number: device.serial_number || "",
        firmware_version: device.firmware_version || "",
        device_type: device.device_type || "",
        report_interval_sec: device.report_interval_sec?.toString() || "",
        can_baud_rate: device.can_baud_rate?.toString() || "",
        is_active: device.is_active ?? true,
      });
    }
  }, [device]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateDevice({
        id: deviceId!,
        body: {
          ...formData,
          report_interval_sec: formData.report_interval_sec ? parseInt(formData.report_interval_sec) : null,
          can_baud_rate: formData.can_baud_rate ? parseInt(formData.can_baud_rate) : null,
        }
      }).unwrap();
      
      onClose();
    } catch (error) {
      console.error("Failed to update device:", error);
      alert("Failed to update device. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit OBD Device">
      <form onSubmit={handleSubmit} className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Device Header */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Edit Device
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Update device information and settings
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup
                label="Device ID"
                type="text"
                name="device_id"
                value={formData.device_id}
                handleChange={handleChange}
                placeholder="Enter device ID"
                required
              />

              <InputGroup
                label="Model"
                type="text"
                name="model"
                value={formData.model}
                handleChange={handleChange}
                placeholder="Enter device model"
              />

              <InputGroup
                label="Serial Number"
                type="text"
                name="serial_number"
                value={formData.serial_number}
                handleChange={handleChange}
                placeholder="Enter serial number"
              />

              <InputGroup
                label="Firmware Version"
                type="text"
                name="firmware_version"
                value={formData.firmware_version}
                handleChange={handleChange}
                placeholder="Enter firmware version"
              />

              <Select
                label="Device Type"
                items={[
                  { value: "elm327", label: "ELM327" },
                  { value: "obd2", label: "OBD2" },
                  { value: "canbus", label: "CAN Bus" },
                  { value: "bluetooth", label: "Bluetooth" },
                  { value: "wifi", label: "WiFi" },
                  { value: "cellular", label: "Cellular" },
                ]}
                defaultValue={formData.device_type}
                onChange={handleChange}
                placeholder="Select device type"
              />

              <InputGroup
                label="Report Interval (seconds)"
                type="number"
                name="report_interval_sec"
                value={formData.report_interval_sec}
                handleChange={handleChange}
                placeholder="Enter report interval"
              />

              <InputGroup
                label="CAN Baud Rate"
                type="number"
                name="can_baud_rate"
                value={formData.can_baud_rate}
                handleChange={handleChange}
                placeholder="Enter CAN baud rate"
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Device is active
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                label="Cancel"
                variant="outlineDark"
                icon={<X className="h-4 w-4" />}
                onClick={onClose}
              />
              <Button
                label={isUpdating ? "Saving..." : "Save Changes"}
                variant="primary"
                icon={<Save className="h-4 w-4" />}
                onClick={handleSubmit}
                className={isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
              />
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
