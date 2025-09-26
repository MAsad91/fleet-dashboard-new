"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateUserMutation } from "@/store/api/usersApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, User, Loader2 } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";

export default function AddUserPage() {
  const router = useRouter();
  const [createUser, { isLoading }] = useCreateUserMutation();
  
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    role: "FLEET_USER",
    is_active: true,
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
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
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
      await createUser(formData).unwrap();
      router.push('/users');
    } catch (error: any) {
      console.error('Error creating user:', error);
      // Handle API errors
      if (error?.data?.errors) {
        setErrors(error.data.errors);
      }
    }
  };

  const handleCancel = () => {
    router.push('/users');
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New User</h1>
            <p className="text-gray-600 dark:text-gray-400">Create a new user account</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup
                label="Username"
                type="text"
                placeholder="Enter username"
                value={formData.username}
                handleChange={(e) => handleInputChange('username', e.target.value)}
                error={errors.username}
                required
              />
              
              <InputGroup
                label="Email"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                handleChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                required
              />
              
              <InputGroup
                label="First Name"
                type="text"
                placeholder="Enter first name"
                value={formData.first_name}
                handleChange={(e) => handleInputChange('first_name', e.target.value)}
                error={errors.first_name}
                required
              />
              
              <InputGroup
                label="Last Name"
                type="text"
                placeholder="Enter last name"
                value={formData.last_name}
                handleChange={(e) => handleInputChange('last_name', e.target.value)}
                error={errors.last_name}
                required
              />
              
              <InputGroup
                label="Phone Number"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone_number}
                handleChange={(e) => handleInputChange('phone_number', e.target.value)}
                error={errors.phone_number}
              />
              
              <Select
                label="Role"
                defaultValue={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                items={[
                  { value: 'FLEET_USER', label: 'Fleet User' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'manager', label: 'Manager' },
                  { value: 'operator', label: 'Operator' },
                  { value: 'viewer', label: 'Viewer' },
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
                icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
                label={isLoading ? 'Creating...' : 'Create User'}
              />
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
