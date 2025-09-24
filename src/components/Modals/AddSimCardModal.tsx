"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { CreditCard, Loader2 } from "lucide-react";
import { useCreateSimCardMutation } from "@/store/api/fleetApi";

interface AddSimCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddSimCardModal({ isOpen, onClose, onSuccess }: AddSimCardModalProps) {
  const [createSimCard] = useCreateSimCardMutation();
  const [formData, setFormData] = useState({
    sim_id: "",
    iccid: "",
    status: "inactive",
    plan_name: "",
    plan_data_limit_gb: "",
    plan_cost: "",
    current_data_used_gb: "",
    current_cycle_start: "",
    overage_threshold: "0.9",
    device: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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

    if (!formData.sim_id.trim()) {
      newErrors.sim_id = "SIM ID is required";
    }
    if (!formData.iccid.trim()) {
      newErrors.iccid = "ICCID is required";
    }
    if (!formData.plan_name.trim()) {
      newErrors.plan_name = "Plan name is required";
    }
    if (!formData.plan_data_limit_gb || parseFloat(formData.plan_data_limit_gb) <= 0) {
      newErrors.plan_data_limit_gb = "Plan data limit must be greater than 0";
    }
    if (!formData.plan_cost || parseFloat(formData.plan_cost) <= 0) {
      newErrors.plan_cost = "Plan cost must be greater than 0";
    }
    if (!formData.current_cycle_start) {
      newErrors.current_cycle_start = "Current cycle start date is required";
    }
    if (parseFloat(formData.overage_threshold) < 0 || parseFloat(formData.overage_threshold) > 1) {
      newErrors.overage_threshold = "Overage threshold must be between 0 and 1";
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
      // Convert form data to API format
      const apiData = {
        sim_id: formData.sim_id,
        iccid: formData.iccid,
        status: formData.status,
        plan_name: formData.plan_name,
        plan_data_limit_gb: parseFloat(formData.plan_data_limit_gb),
        plan_cost: parseFloat(formData.plan_cost),
        current_data_used_gb: parseFloat(formData.current_data_used_gb) || 0,
        current_cycle_start: formData.current_cycle_start,
        overage_threshold: parseFloat(formData.overage_threshold),
        device: formData.device ? parseInt(formData.device) : null,
      };
      
      await createSimCard(apiData).unwrap();
      
      // Call success callback
      onSuccess?.();
      
      // Reset form and close modal
      setFormData({
        sim_id: "",
        iccid: "",
        status: "inactive",
        plan_name: "",
        plan_data_limit_gb: "",
        plan_cost: "",
        current_data_used_gb: "",
        current_cycle_start: "",
        overage_threshold: "0.9",
        device: "",
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Failed to create SIM card:", error);
      setErrors({ submit: "Failed to create SIM card. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New SIM Card"
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
            label="SIM ID *"
            type="text"
            name="sim_id"
            value={formData.sim_id}
            handleChange={handleInputChange}
            placeholder="Enter SIM ID"
            className={errors.sim_id ? "border-red-500" : ""}
          />
          
          <InputGroup
            label="ICCID *"
            type="text"
            name="iccid"
            value={formData.iccid}
            handleChange={handleInputChange}
            placeholder="Enter ICCID"
            className={errors.iccid ? "border-red-500" : ""}
          />

          <InputGroup
            label="Plan Name *"
            type="text"
            name="plan_name"
            value={formData.plan_name}
            handleChange={handleInputChange}
            placeholder="Enter plan name"
            className={errors.plan_name ? "border-red-500" : ""}
          />

          <InputGroup
            label="Plan Data Limit (GB) *"
            type="number"
            name="plan_data_limit_gb"
            value={formData.plan_data_limit_gb}
            handleChange={handleInputChange}
            placeholder="Enter data limit"
            className={errors.plan_data_limit_gb ? "border-red-500" : ""}
          />

          <InputGroup
            label="Plan Cost ($) *"
            type="number"
            name="plan_cost"
            value={formData.plan_cost}
            handleChange={handleInputChange}
            placeholder="Enter plan cost"
            className={errors.plan_cost ? "border-red-500" : ""}
          />

          <InputGroup
            label="Current Data Used (GB)"
            type="number"
            name="current_data_used_gb"
            value={formData.current_data_used_gb}
            handleChange={handleInputChange}
            placeholder="Enter current usage"
          />

          <InputGroup
            label="Current Cycle Start *"
            type="date"
            name="current_cycle_start"
            value={formData.current_cycle_start}
            handleChange={handleInputChange}
            className={errors.current_cycle_start ? "border-red-500" : ""}
            placeholder="Select cycle start date"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="inactive">Inactive</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <InputGroup
            label="Overage Threshold (0-1)"
            type="number"
            name="overage_threshold"
            value={formData.overage_threshold}
            handleChange={handleInputChange}
            placeholder="Enter threshold (0.9)"
            className={errors.overage_threshold ? "border-red-500" : ""}
          />

          <InputGroup
            label="Device (OBD ID)"
            type="text"
            name="device"
            value={formData.device}
            handleChange={handleInputChange}
            placeholder="Enter OBD device ID (optional)"
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
            label={isLoading ? "Creating..." : "Create SIM Card"}
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
