"use client";

import { useState, useEffect } from "react";
import { useCreateDriverMutation } from "@/store/api/driversApi";
import { useListFleetOperatorsQuery } from "@/store/api/fleetApi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { User, Loader2 } from "lucide-react";

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddDriverModal({ isOpen, onClose, onSuccess }: AddDriverModalProps) {
  const [createDriver, { isLoading }] = useCreateDriverMutation();
  const { data: fleetOperatorsData } = useListFleetOperatorsQuery();
  
  const [formData, setFormData] = useState({
    // User fields (nested user object as per API)
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    // Driver fields
    phone_number: "", // Required field from API
    license_number: "",
    experience_years: "",
    address: "",
    date_of_birth: "",
    emergency_contact: "",
    // Required fields from API
    fleet_operator: "", // Will be set from fleet operators data
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set default fleet operator when data loads
  useEffect(() => {
    if (fleetOperatorsData?.results && fleetOperatorsData.results.length > 0 && !formData.fleet_operator) {
      setFormData(prev => ({
        ...prev,
        fleet_operator: fleetOperatorsData.results[0].id.toString()
      }));
    }
  }, [fleetOperatorsData, formData.fleet_operator]);

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

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    }
    if (!formData.license_number.trim()) {
      newErrors.license_number = "License number is required";
    }
    if (!formData.fleet_operator) {
      newErrors.fleet_operator = "Fleet operator is required";
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
      // Transform the form data to match API expectations (nested user object)
      const apiData = {
        user: {
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
        },
        fleet_operator: parseInt(formData.fleet_operator),
        phone_number: formData.phone_number,
        license_number: formData.license_number,
        experience_years: parseInt(formData.experience_years) || 0,
        address: formData.address,
        date_of_birth: formData.date_of_birth,
        emergency_contact: formData.emergency_contact,
      };
      
      await createDriver(apiData).unwrap();
      
      // Call success callback to refresh the drivers list
      onSuccess?.();
      
      // Reset form and close modal
      setFormData({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        license_number: "",
        experience_years: "",
        address: "",
        date_of_birth: "",
        emergency_contact: "",
        fleet_operator: "",
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Failed to create driver:", error);
      setErrors({ submit: "Failed to create driver. Please try again." });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Driver"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Username *"
              type="text"
              name="username"
              value={formData.username}
              handleChange={handleInputChange}
              placeholder="Enter username"
              className={errors.username ? "border-red-500" : ""}
            />
            
            <InputGroup
              label="First Name *"
              type="text"
              name="first_name"
              value={formData.first_name}
              handleChange={handleInputChange}
              placeholder="Enter first name"
              className={errors.first_name ? "border-red-500" : ""}
            />
            
            <InputGroup
              label="Last Name *"
              type="text"
              name="last_name"
              value={formData.last_name}
              handleChange={handleInputChange}
              placeholder="Enter last name"
              className={errors.last_name ? "border-red-500" : ""}
            />
            
            <InputGroup
              label="Email *"
              type="email"
              name="email"
              value={formData.email}
              handleChange={handleInputChange}
              placeholder="Enter email address"
              className={errors.email ? "border-red-500" : ""}
            />
            
            <InputGroup
              label="Phone Number *"
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              handleChange={handleInputChange}
              placeholder="Enter phone number"
              className={errors.phone_number ? "border-red-500" : ""}
            />
            
            <InputGroup
              label="Date of Birth"
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              handleChange={handleInputChange}
              placeholder=""
            />
            
            <InputGroup
              label="Experience Years"
              type="number"
              name="experience_years"
              value={formData.experience_years}
              handleChange={handleInputChange}
              placeholder="Enter years of experience"
            />
          </div>
        </div>

        {/* License Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            License Information
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <InputGroup
              label="License Number *"
              type="text"
              name="license_number"
              value={formData.license_number}
              handleChange={handleInputChange}
              placeholder="Enter license number"
              className={errors.license_number ? "border-red-500" : ""}
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Additional Information
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <InputGroup
              label="Address"
              type="text"
              name="address"
              value={formData.address}
              handleChange={handleInputChange}
              placeholder="Enter street address"
            />
            
            <InputGroup
              label="Emergency Contact"
              type="text"
              name="emergency_contact"
              value={formData.emergency_contact}
              handleChange={handleInputChange}
              placeholder="Enter emergency contact name and phone"
            />
          </div>
        </div>

        {/* Fleet Operator Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Fleet Assignment
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <Select
              label="Fleet Operator *"
              defaultValue={formData.fleet_operator}
              onChange={(e) => handleInputChange({ target: { name: 'fleet_operator', value: e.target.value } } as any)}
              items={fleetOperatorsData?.results?.map((operator: any) => ({
                value: operator.id.toString(),
                label: operator.name
              })) || []}
              placeholder="Select fleet operator"
              className={errors.fleet_operator ? "border-red-500" : ""}
            />
            {errors.fleet_operator && (
              <p className="text-sm text-red-600">{errors.fleet_operator}</p>
            )}
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
            label={isLoading ? "Creating..." : "Create Driver"}
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
