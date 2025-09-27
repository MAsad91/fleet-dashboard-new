"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetInsurancePoliciesQuery, useCreateInsurancePolicyMutation, useUpdateInsurancePolicyMutation, useDeleteInsurancePolicyMutation, useListVehiclesQuery, useGetInsurancePolicyByIdQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Plus, Eye, Edit, Trash2, Shield, Calendar, DollarSign, FileText, ArrowLeft, Save, X, Car } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";
import { ViewModal } from "@/components/Modals/ViewModal";
import { cn } from "@/lib/utils";

export default function InsurancePage() {
  const router = useRouter();
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Full-page view states
  const [currentView, setCurrentView] = useState<'list' | 'view' | 'edit'>('list');
  const [policyData, setPolicyData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: insuranceData, isLoading, error, refetch } = useGetInsurancePoliciesQuery();
  const { data: vehiclesData } = useListVehiclesQuery({ page: 1 });
  const [createInsurancePolicy] = useCreateInsurancePolicyMutation();
  const [updateInsurancePolicy] = useUpdateInsurancePolicyMutation();
  const [deleteInsurancePolicy] = useDeleteInsurancePolicyMutation();

  // API hook for full-page views
  const { 
    data: policyDetails, 
    isLoading: policyLoading, 
    error: policyError 
  } = useGetInsurancePolicyByIdQuery(selectedPolicyId?.toString() || '', {
    skip: !selectedPolicyId
  });

  // Update policy data when API response changes
  useEffect(() => {
    if (policyDetails) {
      setPolicyData(policyDetails);
      setFormData(policyDetails);
    }
  }, [policyDetails]);

  const insurancePolicies = insuranceData?.results || [];

  // Calculate KPI metrics
  const totalPolicies = insurancePolicies.length;
  const activePolicies = insurancePolicies.filter((policy: any) => {
    const today = new Date();
    const startDate = new Date(policy.start_date);
    const endDate = new Date(policy.end_date);
    return today >= startDate && today <= endDate;
  }).length;
  
  const expiringSoonPolicies = insurancePolicies.filter((policy: any) => {
    const today = new Date();
    const endDate = new Date(policy.end_date);
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  }).length;

  const filteredPolicies = insurancePolicies.filter((policy: any) => {
    const matchesVehicle = !vehicleFilter || policy.vehicle?.toString() === vehicleFilter;
    const matchesProvider = !providerFilter || policy.provider?.toLowerCase().includes(providerFilter.toLowerCase());
    
    // Active filter logic
    let matchesActive = true;
    if (activeFilter === "active") {
      const today = new Date();
      const startDate = new Date(policy.start_date);
      const endDate = new Date(policy.end_date);
      matchesActive = today >= startDate && today <= endDate;
    } else if (activeFilter === "expired") {
      const today = new Date();
      const endDate = new Date(policy.end_date);
      matchesActive = today > endDate;
    }
    
    // Date range filter
    const matchesStartDate = !startDateFilter || new Date(policy.start_date) >= new Date(startDateFilter);
    const matchesEndDate = !endDateFilter || new Date(policy.end_date) <= new Date(endDateFilter);
    
    return matchesVehicle && matchesProvider && matchesActive && matchesStartDate && matchesEndDate;
  });

  const handleAddPolicy = () => {
    setIsAddModalOpen(true);
  };

  const handleViewPolicy = (policyId: number) => {
    setSelectedPolicyId(policyId);
    setCurrentView('view');
  };

  const handleEditPolicy = (policyId: number) => {
    setSelectedPolicyId(policyId);
    setCurrentView('edit');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedPolicyId(null);
    setPolicyData(null);
    setFormData({});
    setErrors({});
  };

  const handleDeletePolicy = (policyId: number) => {
    setSelectedPolicyId(policyId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedPolicyId) {
      try {
        await deleteInsurancePolicy(selectedPolicyId.toString()).unwrap();
        await refetch();
        setIsDeleteModalOpen(false);
        setSelectedPolicyId(null);
      } catch (error) {
        console.error('Failed to delete insurance policy:', error);
      }
    }
  };

  const handleSuccess = () => {
    refetch();
  };

  const getSelectedPolicyData = () => {
    return insurancePolicies.find((policy: any) => policy.id === selectedPolicyId);
  };

  // Form handling for edit view
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.policy_number?.trim()) {
      newErrors.policy_number = 'Policy number is required';
    }
    if (!formData.provider?.trim()) {
      newErrors.provider = 'Provider is required';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    if (!formData.coverage_amount) {
      newErrors.coverage_amount = 'Coverage amount is required';
    }
    if (!formData.premium_amount) {
      newErrors.premium_amount = 'Premium amount is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePolicy = async () => {
    if (!validateForm()) return;
    
    try {
      await updateInsurancePolicy({
        id: selectedPolicyId?.toString() || '',
        body: formData
      }).unwrap();
      
      console.log('Policy updated successfully');
      handleBackToList();
    } catch (error) {
      console.error('Failed to update policy:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { className: "bg-green-100 text-green-800", label: "Active" },
      expired: { className: "bg-red-100 text-red-800", label: "Expired" },
      pending: { className: "bg-yellow-100 text-yellow-800", label: "Pending" },
      cancelled: { className: "bg-gray-100 text-gray-800", label: "Cancelled" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      label: status || "Unknown"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="text-center text-red-600">
          <p>Error loading insurance policies</p>
        </div>
      </ProtectedRoute>
    );
  }

  // Show loading state when switching policies
  if ((currentView === 'view' || currentView === 'edit') && selectedPolicyId && !policyData && policyLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleBackToList} 
                variant="outlineDark"
                label="Back"
                icon={<ArrowLeft className="h-4 w-4" />}
                className="px-4 py-2 rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Loading Policy...
                </h1>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show error state when API fails
  if ((currentView === 'view' || currentView === 'edit') && selectedPolicyId && policyError) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleBackToList} 
                variant="outlineDark"
                label="Back"
                icon={<ArrowLeft className="h-4 w-4" />}
                className="px-4 py-2 rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Error Loading Policy
                </h1>
              </div>
            </div>
          </div>
          <div className="text-center text-red-600">
            <p>Failed to load policy details. Please try again.</p>
            <Button 
              onClick={handleBackToList} 
              variant="primary" 
              label="Back to Insurance"
              className="mt-4"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Render different views based on currentView state
  if (currentView === 'view' && policyData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div key={`view-${selectedPolicyId}`} className="p-6">
          {/* Header with Back Button and Action Buttons */}
          <div className="flex justify-between items-center mb-8">
            <Button 
              onClick={handleBackToList} 
              variant="outlineDark"
              label="Back"
              icon={<ArrowLeft className="h-4 w-4" />}
              className="px-4 py-2 rounded-lg"
            />
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Insurance — Detail/Edit
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                label="Save"
                variant="primary"
                icon={<Save className="h-4 w-4" />}
                onClick={() => setCurrentView('edit')}
              />
              <Button
                label="Delete"
                variant="outlineDark"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => handleDeletePolicy(selectedPolicyId!)}
              />
            </div>
          </div>

          {/* KPI Cards for Detail View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                  <div className="mt-2">
                    {(() => {
                      const today = new Date();
                      const startDate = new Date(policyData.start_date);
                      const endDate = new Date(policyData.end_date);
                      const isActive = today >= startDate && today <= endDate;
                      return (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isActive ? 'Active' : 'Expired'}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Coverage Amount</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ${policyData.coverage_amount ? policyData.coverage_amount.toLocaleString() : 'Not Set'}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Premium Amount (annual)</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ${policyData.premium_amount ? policyData.premium_amount.toLocaleString() : 'Not Set'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout as per Documentation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Policy (Left Column) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Policy</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {policyData.vehicle ? `${policyData.vehicle.license_plate}` : 'Not Assigned'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Policy Number</span>
                  <span className="font-semibold text-gray-900 dark:text-white font-mono">{policyData.policy_number}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Provider</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{policyData.provider}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {policyData.start_date ? new Date(policyData.start_date).toLocaleDateString() : 'Not Set'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {policyData.end_date ? new Date(policyData.end_date).toLocaleDateString() : 'Not Set'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Coverage Amount</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${policyData.coverage_amount ? policyData.coverage_amount.toLocaleString() : 'Not Set'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Premium Amount</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${policyData.premium_amount ? policyData.premium_amount.toLocaleString() : 'Not Set'}
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle (Right Column) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Vehicle</h3>
              </div>
              <div className="text-center">
                <Button
                  label="Open Vehicle"
                  variant="primary"
                  icon={<Car className="h-4 w-4" />}
                  onClick={() => {
                    if (policyData.vehicle?.id) {
                      router.push(`/vehicles/${policyData.vehicle.id}`);
                    }
                  }}
                />
                {policyData.vehicle && (
                  <div className="mt-6 space-y-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {policyData.vehicle.make} {policyData.vehicle.model}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        License Plate: {policyData.vehicle.license_plate}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (currentView === 'edit' && policyData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div key={`edit-${selectedPolicyId}`} className="p-6">
          {/* Header with Back Button */}
          <div className="mb-8">
            <Button 
              onClick={handleBackToList} 
              variant="outlineDark"
              label="Back"
              icon={<ArrowLeft className="h-4 w-4" />}
              className="px-4 py-2 rounded-lg"
            />
          </div>

          {/* Edit Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    name="policy_number"
                    value={formData.policy_number || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.policy_number ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.policy_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.policy_number}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Provider
                  </label>
                  <input
                    type="text"
                    name="provider"
                    value={formData.provider || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.provider ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.provider && (
                    <p className="mt-1 text-sm text-red-600">{errors.provider}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date ? formData.start_date.split('T')[0] : ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.start_date ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date ? formData.end_date.split('T')[0] : ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.end_date ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.end_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                  )}
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Coverage Amount ($)
                  </label>
                  <input
                    type="number"
                    name="coverage_amount"
                    value={formData.coverage_amount || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.coverage_amount ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.coverage_amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.coverage_amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Premium Amount ($)
                  </label>
                  <input
                    type="number"
                    name="premium_amount"
                    value={formData.premium_amount || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.premium_amount ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.premium_amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.premium_amount}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button 
                onClick={handleBackToList} 
                variant="outlineDark"
                label="Cancel"
                icon={<X className="h-4 w-4" />}
                className="px-4 py-2 rounded-lg"
              />
              <Button 
                onClick={handleSavePolicy}
                variant="primary"
                label="Save Changes"
                icon={<Save className="h-4 w-4" />}
                className="px-6 py-2 rounded-lg"
              />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Insurance Policies</h1>
            <p className="text-muted-foreground">
              Manage vehicle insurance policies and coverage
            </p>
          </div>
          <Button
            label="Add Policy"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => router.push('/insurance/add')}
          />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Policies</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalPolicies}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activePolicies}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Soon (≤30 days)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {expiringSoonPolicies}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Vehicle"
              items={[
                { value: "", label: "All Vehicles" },
                ...(vehiclesData?.results?.map((vehicle: any) => ({
                  value: vehicle.id.toString(),
                  label: `${vehicle.license_plate} - ${vehicle.make} ${vehicle.model}`
                })) || [])
              ]}
              defaultValue={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
            />

            <InputGroup
              type="text"
              label="Provider"
              placeholder="Search by provider..."
              value={providerFilter}
              handleChange={(e) => setProviderFilter(e.target.value)}
              icon={<Shield className="h-4 w-4" />}
            />

            <Select
              label="Active"
              items={[
                { value: "", label: "All" },
                { value: "active", label: "Active" },
                { value: "expired", label: "Expired" },
              ]}
              defaultValue={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            />

            <div className="flex space-x-2">
              <InputGroup
                label="Start Date"
                type="date"
                placeholder="Start date"
                value={startDateFilter}
                handleChange={(e) => setStartDateFilter(e.target.value)}
              />
              <InputGroup
                label="End Date"
                type="date"
                placeholder="End date"
                value={endDateFilter}
                handleChange={(e) => setEndDateFilter(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button
              label="Apply"
              variant="primary"
              size="small"
              onClick={() => {}}
            />
          </div>
        </div>

        {/* Insurance Policies Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Policy #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Coverage Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Premium Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPolicies.map((policy: any) => {
                  // Calculate if policy is active
                  const today = new Date();
                  const startDate = new Date(policy.start_date);
                  const endDate = new Date(policy.end_date);
                  const isActive = today >= startDate && today <= endDate;
                  
                  return (
                    <tr key={policy.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {policy.vehicle?.license_plate || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {policy.vehicle ? `${policy.vehicle.make} ${policy.vehicle.model}` : "No Vehicle"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                        {policy.policy_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {policy.provider || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {policy.start_date ? new Date(policy.start_date).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {policy.end_date ? new Date(policy.end_date).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>{policy.coverage_amount ? `$${policy.coverage_amount.toLocaleString()}` : "Not Set"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>{policy.premium_amount ? `$${policy.premium_amount.toLocaleString()}` : "Not Set"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isActive ? '✓' : '✗'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            label="Edit"
                            variant="outlineDark"
                            size="small"
                            icon={<Edit className="h-4 w-4" />}
                            onClick={() => handleEditPolicy(policy.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredPolicies.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No insurance policies found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {vehicleFilter || providerFilter || activeFilter || startDateFilter || endDateFilter
                  ? "Try adjusting your search criteria"
                  : "Get started by adding a new insurance policy"
                }
              </p>
            </div>
          )}
        </div>

        {/* Modals */}
        <ViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Insurance Policy Details"
          data={getSelectedPolicyData()}
          fields={[
            { label: "Policy Number", key: "policy_number" },
            { label: "Insurance Company", key: "insurance_company" },
            { label: "Vehicle", key: "vehicle.license_plate" },
            { label: "Premium Amount", key: "premium_amount", type: "currency" },
            { label: "Status", key: "status", type: "badge" },
            { label: "Start Date", key: "start_date", type: "date" },
            { label: "End Date", key: "end_date", type: "date" },
          ]}
        />

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Insurance Policy"
          message="Are you sure you want to delete this insurance policy? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </ProtectedRoute>
  );
}
