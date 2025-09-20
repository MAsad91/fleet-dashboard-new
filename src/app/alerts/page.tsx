"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useGetAlertsQuery, useAcknowledgeAlertMutation, useIgnoreAlertMutation, useResolveAlertLegacyMutation, useDeleteAlertMutation } from "../../store/api/fleetApi";
import { setAlertsFilters, setAlertsPagination } from "../../store/slices/alertsUISlice";
import ProtectedRoute from "../../components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Search, Plus, Check, X, Eye, Edit, Trash, AlertTriangle, AlertCircle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddAlertModal } from "@/components/Modals/AddAlertModal";
import { AlertViewModal } from "@/components/Modals/AlertViewModal";
import { AlertEditModal } from "@/components/Modals/AlertEditModal";
import { DeleteConfirmationModal } from "@/components/Modals/DeleteConfirmationModal";

export default function AlertsPage() {
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector((state) => state.alertsUI);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  
  const { data: alertsData, isLoading, error } = useGetAlertsQuery({
    page: pagination.page,
    limit: pagination.limit,
    status: filters.status,
    severity: filters.severity,
    vehicle: filters.vehicle_id,
    // Temporarily remove system parameter to fix API error
    // system: filters.alert_type,
  });

  // Client-side filtering for alert_type and search
  const allFilteredAlerts = alertsData?.results?.filter((alert: any) => {
    // Filter by alert type (client-side since API doesn't support it properly)
    if (filters.alert_type && filters.alert_type !== 'all' && filters.alert_type !== undefined) {
      const alertType = alert.alert_type || alert.system || alert.type;
      if (!alertType || !alertType.toLowerCase().includes(filters.alert_type.toLowerCase())) {
        return false;
      }
    }

    // Filter by search term
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      const searchableFields = [
        alert.title,
        alert.description,
        alert.message,
        alert.vehicle,
        alert.severity,
        alert.status,
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchableFields.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  }) || [];

  // Pagination for client-side filtered results
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const filteredAlerts = allFilteredAlerts.slice(startIndex, endIndex);
  const totalFilteredCount = allFilteredAlerts.length;

  const [acknowledgeAlert] = useAcknowledgeAlertMutation();
  const [ignoreAlert] = useIgnoreAlertMutation();
  const [resolveAlert] = useResolveAlertLegacyMutation();
  const [deleteAlert] = useDeleteAlertMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setAlertsFilters({ search: e.target.value }));
    dispatch(setAlertsPagination({ page: 1 })); // Reset pagination
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setAlertsFilters({ status: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setAlertsPagination({ page: 1 })); // Reset pagination
  };

  const handleSeverityFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setAlertsFilters({ severity: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setAlertsPagination({ page: 1 })); // Reset pagination
  };

  const handleAlertTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setAlertsFilters({ alert_type: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setAlertsPagination({ page: 1 })); // Reset pagination
  };

  const handlePageChange = (page: number) => {
    dispatch(setAlertsPagination({ page }));
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert({ id: parseInt(alertId) }).unwrap();
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
    }
  };

  const handleIgnoreAlert = async (alertId: string) => {
    try {
      await ignoreAlert({ id: parseInt(alertId) }).unwrap();
    } catch (error) {
      console.error("Failed to ignore alert:", error);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveAlert({ id: parseInt(alertId) }).unwrap();
    } catch (error) {
      console.error("Failed to resolve alert:", error);
    }
  };

  const handleViewAlert = (alertId: number) => {
    setSelectedAlertId(alertId);
    setIsViewModalOpen(true);
  };

  const handleEditAlert = (alertId: number) => {
    setSelectedAlertId(alertId);
    setIsEditModalOpen(true);
  };

  const handleDeleteAlert = (alertId: number) => {
    setSelectedAlertId(alertId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAlert = async () => {
    if (!selectedAlertId) return;
    
    try {
      await deleteAlert(selectedAlertId).unwrap();
      setIsDeleteModalOpen(false);
      setSelectedAlertId(null);
    } catch (error) {
      console.error("Failed to delete alert:", error);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { className: "bg-gray-100 text-gray-800", icon: AlertCircle, label: "Low" },
      medium: { className: "bg-yellow-100 text-yellow-800", icon: AlertTriangle, label: "Medium" },
      high: { className: "bg-orange-100 text-orange-800", icon: AlertTriangle, label: "High" },
      critical: { className: "bg-red-100 text-red-800", icon: AlertOctagon, label: "Critical" },
    };
    
    const config = severityConfig[severity as keyof typeof severityConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      icon: AlertCircle,
      label: severity
    };
    
    const Icon = config.icon;
    
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1", config.className)}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { className: "bg-red-100 text-red-800", label: "Active" },
      acknowledged: { className: "bg-yellow-100 text-yellow-800", label: "Acknowledged" },
      ignored: { className: "bg-gray-100 text-gray-800", label: "Ignored" },
      resolved: { className: "bg-green-100 text-green-800", label: "Resolved" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { className: "bg-gray-100 text-gray-800", label: status };
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.className)}>
        {config.label}
      </span>
    );
  };

  const getActionButtons = (alert: any) => {
    const buttons = [];
    
    if (alert.status === "active") {
      buttons.push(
        <Button
          key="acknowledge"
          label="Acknowledge"
          variant="outlineDark"
          size="small"
          icon={<Check className="h-4 w-4" />}
          onClick={() => handleAcknowledgeAlert(alert.id)}
        />
      );
    }
    
    if (alert.status === "active" || alert.status === "acknowledged") {
      buttons.push(
        <Button
          key="ignore"
          label="Ignore"
          variant="outlineDark"
          size="small"
          icon={<X className="h-4 w-4" />}
          onClick={() => handleIgnoreAlert(alert.id)}
        />
      );
    }
    
    if (alert.status === "acknowledged") {
      buttons.push(
        <Button
          key="resolve"
          label="Resolve"
          variant="green"
          size="small"
          icon={<Check className="h-4 w-4" />}
          onClick={() => handleResolveAlert(alert.id)}
        />
      );
    }
    
    return buttons;
  };

  if (error) {
    const errorMessage = "message" in error ? error.message : "Unknown error";
    const isTokenError = errorMessage.includes("token") || errorMessage.includes("403") || errorMessage.includes("401");
    
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          {isTokenError ? (
            <div>
              <p>Your session has expired. Please log in again.</p>
              <Button
                label="Go to Login"
                variant="primary"
                className="mt-4"
                onClick={() => window.location.href = '/auth/signin'}
              />
            </div>
          ) : (
            <p>Error loading alerts: {errorMessage}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
            <p className="text-muted-foreground">
              Monitor and manage fleet alerts and notifications
            </p>
          </div>
          <Button
            label="Create Alert"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsAddModalOpen(true)}
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="flex gap-4 pb-2" style={{ minWidth: 'max-content' }}>
              <div className="flex-shrink-0 w-48">
                <InputGroup
                  label="Search"
                  type="text"
                  placeholder="Search alerts..."
                  value={filters.search || ""}
                  handleChange={handleSearchChange}
                  icon={<Search className="h-4 w-4 text-gray-400" />}
                  iconPosition="left"
                />
              </div>
              
              <div className="flex-shrink-0 w-40">
                <Select
                  label="Status"
                  items={[
                    { value: "all", label: "All Status" },
                    { value: "active", label: "Active" },
                    { value: "acknowledged", label: "Acknowledged" },
                    { value: "ignored", label: "Ignored" },
                    { value: "resolved", label: "Resolved" },
                  ]}
                  defaultValue={filters.status || "all"}
                  placeholder="Select status"
                  onChange={handleStatusFilter}
                />
              </div>

              <div className="flex-shrink-0 w-40">
                <Select
                  label="Severity"
                  items={[
                    { value: "all", label: "All Severities" },
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                    { value: "critical", label: "Critical" },
                  ]}
                  defaultValue={filters.severity || "all"}
                  placeholder="Select severity"
                  onChange={handleSeverityFilter}
                />
              </div>

              <div className="flex-shrink-0 w-40">
                <Select
                  label="Alert Type"
                  items={[
                    { value: "all", label: "All Types" },
                    { value: "maintenance", label: "Maintenance" },
                    { value: "safety", label: "Safety" },
                    { value: "performance", label: "Performance" },
                    { value: "fuel", label: "Fuel" },
                    { value: "location", label: "Location" },
                  ]}
                  defaultValue={filters.alert_type || "all"}
                  placeholder="Select type"
                  onChange={handleAlertTypeFilter}
                />
              </div>

              <div className="flex-shrink-0 w-40">
                <InputGroup
                  label="Start Date"
                  type="date"
                  placeholder="Start date"
                  value={filters.start_date || ""}
                  handleChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    dispatch(setAlertsFilters({ start_date: e.target.value }))
                  }
                />
              </div>
              
              <div className="flex-shrink-0 w-40">
                <InputGroup
                  label="End Date"
                  type="date"
                  placeholder="End date"
                  value={filters.end_date || ""}
                  handleChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    dispatch(setAlertsFilters({ end_date: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-6 border-b border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold">Alert List</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalFilteredCount} alerts found
            </p>
          </div>
          
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
                Error: {error.message}
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {allFilteredAlerts.length === 0 && (filters.search || filters.alert_type) ? (
                  <div>
                    <p>No alerts found matching your filters.</p>
                    <Button
                      label="Clear Filters"
                      variant="outlineDark"
                      size="small"
                      className="mt-2"
                      onClick={() => dispatch(setAlertsFilters({ search: "", alert_type: undefined }))}
                    />
                  </div>
                ) : (
                  <p>No alerts found.</p>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: '1000px' }}>
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Alert
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-dark divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {alert.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSeverityBadge(alert.severity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {alert.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {alert.vehicle || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        N/A
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(alert.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(alert.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            label="View"
                            variant="ghost"
                            size="small"
                            icon={<Eye className="h-4 w-4" />}
                            onClick={() => handleViewAlert(alert.id)}
                          />
                          <Button
                            label="Edit"
                            variant="ghost"
                            size="small"
                            icon={<Edit className="h-4 w-4" />}
                            onClick={() => handleEditAlert(alert.id)}
                          />
                          <Button
                            label="Delete"
                            variant="ghost"
                            size="small"
                            icon={<Trash className="h-4 w-4" />}
                            onClick={() => handleDeleteAlert(alert.id)}
                          />
                          {getActionButtons(alert)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalFilteredCount > 0 && (
            <div className="px-6 py-4 border-t border-stroke dark:border-dark-3 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, totalFilteredCount)} of{" "}
                {totalFilteredCount} results
              </div>
              <div className="flex items-center space-x-2">
                {pagination.page > 1 ? (
                  <Button
                    label="Previous"
                    variant="outlineDark"
                    size="small"
                    onClick={() => handlePageChange(pagination.page - 1)}
                  />
                ) : (
                  <Button
                    label="Previous"
                    variant="outlineDark"
                    size="small"
                    onClick={() => {}}
                    className="opacity-50 cursor-not-allowed"
                  />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination.page} of {Math.ceil(totalFilteredCount / pagination.limit)}
                </span>
                {pagination.page < Math.ceil(totalFilteredCount / pagination.limit) ? (
                  <Button
                    label="Next"
                    variant="outlineDark"
                    size="small"
                    onClick={() => handlePageChange(pagination.page + 1)}
                  />
                ) : (
                  <Button
                    label="Next"
                    variant="outlineDark"
                    size="small"
                    onClick={() => {}}
                    className="opacity-50 cursor-not-allowed"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Alert Modal */}
      <AddAlertModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* View Alert Modal */}
      <AlertViewModal
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setSelectedAlertId(null); }}
        alertId={selectedAlertId}
      />

      {/* Edit Alert Modal */}
      <AlertEditModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedAlertId(null); }}
        alertId={selectedAlertId}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedAlertId(null); }}
        onConfirm={confirmDeleteAlert}
        title="Delete Alert"
        message="Are you sure you want to delete this alert? This action cannot be undone."
        itemName={selectedAlertId ? `Alert #${selectedAlertId}` : undefined}
      />
    </ProtectedRoute>
  );
}