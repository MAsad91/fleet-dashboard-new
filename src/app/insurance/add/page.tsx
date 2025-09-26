"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateInsurancePolicyMutation, useListVehiclesQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";

export default function AddInsurancePage() {
  const router = useRouter();
  const [createInsurancePolicy, { isLoading }] = useCreateInsurancePolicyMutation();
  const { data: vehiclesData } = useListVehiclesQuery({ page: 1 });
  
  const [formData, setFormData] = useState({
    vehicle: "",
    policy_number: "",
    provider: "",
    coverage_type: "",
    premium_amount: "",
    start_date: "",
    end_date: "",
    status: "active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.vehicle) {
      newErrors.vehicle = "Vehicle is required";
    }
    
    if (!formData.policy_number.trim()) {
      newErrors.policy_number = "Policy number is required";
    }
    
    if (!formData.provider.trim()) {
      newErrors.provider = "Provider is required";
    }
    
    if (!formData.coverage_type.trim()) {
      newErrors.coverage_type = "Coverage type is required";
    }
    
    if (!formData.premium_amount.trim()) {
      newErrors.premium_amount = "Premium amount is required";
    }
    
    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }
    
    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
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
      await createInsurancePolicy(formData).unwrap();
      router.push('/insurance');
    } catch (error: any) {
      console.error('Error creating insurance policy:', error);
      // Handle API errors
      if (error?.data?.errors) {
        setErrors(error.data.errors);
      }
    }
  };

  const handleCancel = () => {
    router.push('/insurance');
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleCancel}
            variant="outlinePrimary"
            label="Back"
            icon={<ArrowLeft className="h-4 w-4" />}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Insurance Policy</h1>
            <p className="text-gray-600 dark:text-gray-400">Create a new insurance policy</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Vehicle"
                defaultValue={formData.vehicle}
                onChange={(e) => handleInputChange('vehicle', e.target.value)}
                items={vehiclesData?.results?.map(vehicle => ({
                  value: vehicle.id.toString(),
                  label: `${vehicle.license_plate} - ${vehicle.make} ${vehicle.model}`
                })) || []}
              />
              
              <InputGroup
                label="Policy Number"
                type="text"
                placeholder="Enter policy number"
                value={formData.policy_number}
                handleChange={(e) => handleInputChange('policy_number', e.target.value)}
                error={errors.policy_number}
                required
              />
              
              <InputGroup
                label="Provider"
                type="text"
                placeholder="Enter provider name"
                value={formData.provider}
                handleChange={(e) => handleInputChange('provider', e.target.value)}
                error={errors.provider}
                required
              />
              
              <InputGroup
                label="Coverage Type"
                type="text"
                placeholder="Enter coverage type"
                value={formData.coverage_type}
                handleChange={(e) => handleInputChange('coverage_type', e.target.value)}
                error={errors.coverage_type}
                required
              />
              
              <InputGroup
                label="Premium Amount"
                type="number"
                placeholder="Enter premium amount"
                value={formData.premium_amount}
                handleChange={(e) => handleInputChange('premium_amount', e.target.value)}
                error={errors.premium_amount}
                required
              />
              
              <InputGroup
                label="Start Date"
                type="date"
                placeholder="Select start date"
                value={formData.start_date}
                handleChange={(e) => handleInputChange('start_date', e.target.value)}
                error={errors.start_date}
                required
              />
              
              <InputGroup
                label="End Date"
                type="date"
                placeholder="Select end date"
                value={formData.end_date}
                handleChange={(e) => handleInputChange('end_date', e.target.value)}
                error={errors.end_date}
                required
              />
              
              <Select
                label="Status"
                defaultValue={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                items={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'expired', label: 'Expired' },
                ]}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outlinePrimary"
                onClick={handleCancel}
                label="Cancel"
              />
              <Button
                variant="primary"
                icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                label={isLoading ? 'Creating...' : 'Create Policy'}
              />
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
