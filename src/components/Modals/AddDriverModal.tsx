"use client";

import { useState } from "react";
import { useCreateDriverMutation } from "@/store/api/driversApi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { User, Loader2 } from "lucide-react";

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddDriverModal({ isOpen, onClose }: AddDriverModalProps) {
  const [createDriver, { isLoading }] = useCreateDriverMutation();
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    phone_number: "", // Required field from API
    license_number: "",
    license_type: "",
    license_expiry: "",
    date_of_birth: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    hire_date: "",
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
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    }
    if (!formData.license_number.trim()) {
      newErrors.license_number = "License number is required";
    }
    if (!formData.license_type) {
      newErrors.license_type = "License type is required";
    }
    if (!formData.license_expiry) {
      newErrors.license_expiry = "License expiry date is required";
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
      await createDriver(formData).unwrap();
      
      // Reset form and close modal
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        phone_number: "",
        license_number: "",
        license_type: "",
        license_expiry: "",
        date_of_birth: "",
        address: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        hire_date: "",
        status: "active",
        notes: "",
        fleet_operator: 1,
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
              label="Phone *"
              type="tel"
              name="phone"
              value={formData.phone}
              handleChange={handleInputChange}
              placeholder="Enter phone number"
              className={errors.phone ? "border-red-500" : ""}
            />
            
            <InputGroup
              label="Phone Number (API) *"
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              handleChange={handleInputChange}
              placeholder="Enter phone number for API"
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
              label="Hire Date"
              type="date"
              name="hire_date"
              value={formData.hire_date}
              handleChange={handleInputChange}
              placeholder=""
            />
          </div>
        </div>

        {/* License Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            License Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="License Number *"
              type="text"
              name="license_number"
              value={formData.license_number}
              handleChange={handleInputChange}
              placeholder="Enter license number"
              className={errors.license_number ? "border-red-500" : ""}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                License Type *
              </label>
              <select
                name="license_type"
                value={formData.license_type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.license_type ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select license type</option>
                <option value="class_a">Class A</option>
                <option value="class_b">Class B</option>
                <option value="class_c">Class C</option>
                <option value="class_d">Class D</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="commercial">Commercial</option>
              </select>
              {errors.license_type && (
                <p className="text-red-500 text-sm mt-1">{errors.license_type}</p>
              )}
            </div>
            
            <InputGroup
              label="License Expiry *"
              type="date"
              name="license_expiry"
              value={formData.license_expiry}
              handleChange={handleInputChange}
              className={errors.license_expiry ? "border-red-500" : ""}
              placeholder=""
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Address Information
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputGroup
                label="City"
                type="text"
                name="city"
                value={formData.city}
                handleChange={handleInputChange}
                placeholder="Enter city"
              />
              
              <InputGroup
                label="State"
                type="text"
                name="state"
                value={formData.state}
                handleChange={handleInputChange}
                placeholder="Enter state"
              />
              
              <InputGroup
                label="Postal Code"
                type="text"
                name="postal_code"
                value={formData.postal_code}
                handleChange={handleInputChange}
                placeholder="Enter postal code"
              />
            </div>
            
            <InputGroup
              label="Country"
              type="text"
              name="country"
              value={formData.country}
              handleChange={handleInputChange}
              placeholder="Enter country"
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Emergency Contact
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Emergency Contact Name"
              type="text"
              name="emergency_contact_name"
              value={formData.emergency_contact_name}
              handleChange={handleInputChange}
              placeholder="Enter emergency contact name"
            />
            
            <InputGroup
              label="Emergency Contact Phone"
              type="tel"
              name="emergency_contact_phone"
              value={formData.emergency_contact_phone}
              handleChange={handleInputChange}
              placeholder="Enter emergency contact phone"
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
