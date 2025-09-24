"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetInsurancePoliciesQuery, useCreateInsurancePolicyMutation, useUpdateInsurancePolicyMutation, useDeleteInsurancePolicyMutation, useListVehiclesQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Plus, Eye, Edit, Trash2, Shield, Calendar, DollarSign, FileText } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";
import { ViewModal } from "@/components/Modals/ViewModal";

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

  const { data: insuranceData, isLoading, error, refetch } = useGetInsurancePoliciesQuery();
  const { data: vehiclesData } = useListVehiclesQuery({ page: 1 });
  const [createInsurancePolicy] = useCreateInsurancePolicyMutation();
  const [updateInsurancePolicy] = useUpdateInsurancePolicyMutation();
  const [deleteInsurancePolicy] = useDeleteInsurancePolicyMutation();

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
    setIsViewModalOpen(true);
  };

  const handleEditPolicy = (policyId: number) => {
    setSelectedPolicyId(policyId);
    setIsEditModalOpen(true);
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

        {/* Insurance Policies Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: '1200px' }}>
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
                            label=""
                            variant="outlineDark"
                            size="small"
                            icon={<Eye className="h-4 w-4" />}
                            onClick={() => handleViewPolicy(policy.id)}
                          />
                          <Button
                            label=""
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
