"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateDriverMutation } from "@/store/api/driversApi";
import { useListFleetOperatorsQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, User, Loader2 } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";

export default function AddDriverPage() {
  const router = useRouter();
  const [createDriver, { isLoading }] = useCreateDriverMutation();
  const { data: fleetOperatorsData } = useListFleetOperatorsQuery();
  
  const [formData, setFormData] = useState({
    // User fields (nested user object as per API)
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    // Driver fields
    phone_number: "",
    license_number: "",
    experience_years: "",
    address: "",
    date_of_birth: "",
    emergency_contact: "",
    // Required fields from API
    fleet_operator: "",
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

    // Required user fields
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

    // Required driver fields
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
      // Create the driver with nested user object as per API structure
      const driverData = {
        user: {
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
        },
        phone_number: formData.phone_number,
        license_number: formData.license_number,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        address: formData.address || null,
        date_of_birth: formData.date_of_birth || null,
        emergency_contact: formData.emergency_contact || null,
        fleet_operator: parseInt(formData.fleet_operator),
      };

      await createDriver(driverData).unwrap();
      
      // Redirect to drivers list
      router.push('/drivers');
    } catch (error) {
      console.error("Failed to create driver:", error);
      setErrors({ submit: "Failed to create driver. Please try again." });
    }
  };

  const handleCancel = () => {
    router.push('/drivers');
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
                Add New Driver
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create a new driver account for fleet management
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

            {/* Personal Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
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
                  type="text"
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
                  placeholder="mm/dd/yyyy"
                />

                <InputGroup
                  label="Experience Years"
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  handleChange={handleInputChange}
                  placeholder="Enter years of experience"
                />

                <InputGroup
                  label="Emergency Contact"
                  type="text"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  handleChange={handleInputChange}
                  placeholder="Enter emergency contact"
                />
              </div>
            </div>

            {/* License Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
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
              </div>
            </div>

            {/* Additional Information */}
            <div className="pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <InputGroup
                    label="Address"
                    type="text"
                    name="address"
                    value={formData.address}
                    handleChange={handleInputChange}
                    placeholder="Enter address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fleet Operator *
                  </label>
                  <select
                    name="fleet_operator"
                    value={formData.fleet_operator}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Fleet Operator</option>
                    {fleetOperatorsData?.results?.map((operator: any) => (
                      <option key={operator.id} value={operator.id}>
                        {operator.name}
                      </option>
                    ))}
                  </select>
                  {errors.fleet_operator && (
                    <p className="mt-1 text-sm text-red-600">{errors.fleet_operator}</p>
                  )}
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
                label={isLoading ? "Creating..." : "Create Driver"}
                variant="primary"
                icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
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