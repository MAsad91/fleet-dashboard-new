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
            <p className="text-muted-foreground">
              Manage SIM card inventory and connectivity
            </p>
          </div>
          <Button
            label="Add SIM Card"
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
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Status"
              items={[
                { value: "", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "suspended", label: "Suspended" },
              ]}
              defaultValue={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            
            <InputGroup
              type="text"
              label="Plan"
              placeholder="Search by plan name..."
              value={planFilter}
              handleChange={(e) => setPlanFilter(e.target.value)}
              icon={<CreditCard className="h-4 w-4" />}
            />
            
            <Select
              label="Device"
              items={[
                { value: "", label: "All Devices" },
                ...(obdDevicesData?.results?.map((device: any) => ({
                  value: device.id.toString(),
                  label: device.device_id || `Device ${device.id}`
                })) || [])
              ]}
              defaultValue={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Legend: Signal = strong/weak/none
            </p>
          </div>

        {/* SIM Cards Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: '1200px' }}>
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ICCID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Plan Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Limit (GB)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Used (GB)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Act.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSimCards.map((simCard: any) => {
                  // Check for overage highlighting
                  const hasOverage = simCard.plan_data_limit_gb && simCard.current_data_used_gb && simCard.overage_threshold &&
                    simCard.current_data_used_gb >= (simCard.plan_data_limit_gb * simCard.overage_threshold);
                  
                  return (
                    <tr key={simCard.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${hasOverage ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 dark:text-white font-mono">
                            {simCard.iccid ? `${simCard.iccid.substring(0, 4)}…` : 'N/A'}
                          </span>
                        </div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            label=""
                            variant="outlineDark"
                            size="small"
                            icon={<Eye className="h-4 w-4" />}
                            onClick={() => handleViewSimCard(simCard.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredSimCards.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No SIM cards found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {statusFilter || planFilter || deviceFilter
                  ? "Try adjusting your search criteria"
                  : "Get started by adding a new SIM card"
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
