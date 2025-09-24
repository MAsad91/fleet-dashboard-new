"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetSimCardsQuery, useCreateSimCardMutation, useUpdateSimCardMutation, useDeleteSimCardMutation, useListObdDevicesQuery, useGetSimCardsSummaryQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Plus, Eye, Edit, Trash2, CreditCard, Phone, Wifi, AlertCircle } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";
import { ViewModal } from "@/components/Modals/ViewModal";

export default function SimCardsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [selectedSimId, setSelectedSimId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: simCardsData, isLoading, error, refetch } = useGetSimCardsQuery({ page: 1 });
  const { data: simCardsSummaryData } = useGetSimCardsSummaryQuery();
  const { data: obdDevicesData } = useListObdDevicesQuery({ page: 1 });
  const [createSimCard] = useCreateSimCardMutation();
  const [updateSimCard] = useUpdateSimCardMutation();
  const [deleteSimCard] = useDeleteSimCardMutation();

  const simCards = simCardsData?.results || [];

  const filteredSimCards = simCards.filter((simCard: any) => {
    const matchesStatus = !statusFilter || simCard.status === statusFilter;
    const matchesPlan = !planFilter || simCard.plan_name?.toLowerCase().includes(planFilter.toLowerCase());
    const matchesDevice = !deviceFilter || simCard.device?.toString() === deviceFilter;
    
    // Check for overage (highlight rows where current_data_used_gb >= plan_data_limit_gb * overage_threshold)
    const hasOverage = simCard.plan_data_limit_gb && simCard.current_data_used_gb && simCard.overage_threshold &&
      simCard.current_data_used_gb >= (simCard.plan_data_limit_gb * simCard.overage_threshold);
    
    return matchesStatus && matchesPlan && matchesDevice;
  });

  const handleAddSimCard = () => {
    router.push('/sim-cards/add');
  };

  const handleViewSimCard = (simId: number) => {
    setSelectedSimId(simId);
    setIsViewModalOpen(true);
  };

  const handleEditSimCard = (simId: number) => {
    setSelectedSimId(simId);
    setIsEditModalOpen(true);
  };

  const handleDeleteSimCard = (simId: number) => {
    setSelectedSimId(simId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedSimId) {
      try {
        await deleteSimCard(selectedSimId.toString()).unwrap();
        await refetch();
        setIsDeleteModalOpen(false);
        setSelectedSimId(null);
      } catch (error) {
        console.error('Failed to delete SIM card:', error);
      }
    }
  };

  const handleSuccess = () => {
    refetch();
  };

  const getSelectedSimData = () => {
    return simCards.find((sim: any) => sim.id === selectedSimId);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { className: "bg-green-100 text-green-800", label: "Active" },
      inactive: { className: "bg-red-100 text-red-800", label: "Inactive" },
      suspended: { className: "bg-yellow-100 text-yellow-800", label: "Suspended" },
      pending: { className: "bg-blue-100 text-blue-800", label: "Pending" },
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
          <p>Error loading SIM cards</p>
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
            <h1 className="text-3xl font-bold tracking-tight">SIM Cards</h1>
          </div>
          <Button
            label="+ Create"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => router.push('/sim-cards/add')}
          />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total SIMs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {simCardsSummaryData?.count || simCards.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Data Used (GB)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {simCardsSummaryData?.total_data_used_gb?.toFixed(2) || Number(simCards.reduce((sum: number, sim: any) => sum + (sim.current_data_used_gb || 0), 0)).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Wifi className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Monthly Cost ($)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${simCardsSummaryData?.total_monthly_cost?.toFixed(2) || Number(simCards.reduce((sum: number, sim: any) => sum + (Number(sim.plan_cost) || 0), 0)).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <AlertCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plan
              </label>
              <input
                type="text"
                placeholder="Search by plan name..."
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Device (no‑SIM only if backend filter exists; else all)
              </label>
              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Devices</option>
                {(obdDevicesData?.results?.filter((device: any) => !device.sim_card) || obdDevicesData?.results || []).map((device: any) => (
                  <option key={device.id} value={device.id.toString()}>
                    {device.device_id || `Device ${device.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Legend: Signal = strong/weak/none
            </p>
            <Button
              label="Apply"
              variant="primary"
              size="small"
              onClick={() => {}} // Filters are applied automatically
            />
          </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {isLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="p-6 text-red-600">
                Error loading SIM cards
              </div>
            ) : filteredSimCards.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {statusFilter || planFilter || deviceFilter
                  ? "No SIM cards found matching your filters."
                  : "No SIM cards found."
                }
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ICCID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Plan Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Limit (GB)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Used (GB)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Act.
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSimCards.map((simCard: any) => {
                    // Check for overage highlighting
                    const hasOverage = simCard.plan_data_limit_gb && simCard.current_data_used_gb && simCard.overage_threshold &&
                      simCard.current_data_used_gb >= (simCard.plan_data_limit_gb * simCard.overage_threshold);
                    
                    return (
                      <tr 
                        key={simCard.id} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150 ${hasOverage ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
                        onClick={(e) => {
                          // Don't navigate if clicking on action buttons
                          const target = e.target as HTMLElement;
                          const isButton = target.closest('button');
                          
                          if (!isButton) {
                            router.push(`/sim-cards/${simCard.id}`);
                          }
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white font-mono">
                            {simCard.iccid ? `${simCard.iccid.substring(0, 4)}…` : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(simCard.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {simCard.plan_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {simCard.plan_data_limit_gb || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {simCard.current_data_used_gb || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {simCard.device || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {simCard.last_activity 
                            ? new Date(simCard.last_activity).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                            : 'N/A'
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Row Actions */}
          {filteredSimCards.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    label="View"
                    variant="outlineDark"
                    size="small"
                    onClick={() => {}}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}

        <ViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="SIM Card Details"
          data={getSelectedSimData()}
          fields={[
            { label: "Phone Number", key: "phone_number" },
            { label: "ICCID", key: "iccid" },
            { label: "Carrier", key: "carrier" },
            { label: "Data Plan", key: "data_plan" },
            { label: "Status", key: "status", type: "badge" },
            { label: "Activation Date", key: "activation_date", type: "date" },
            { label: "Expiry Date", key: "expiry_date", type: "date" },
          ]}
        />

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete SIM Card"
          message="Are you sure you want to delete this SIM card? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </ProtectedRoute>
  );
}
