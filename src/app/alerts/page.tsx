"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetAlertsQuery, useAcknowledgeAlertMutation, useIgnoreAlertMutation, useResolveAlertLegacyMutation } from "@/store/api/fleetApi";
import { setAlertsFilters, setAlertsPagination } from "@/store/slices/alertsUISlice";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Search, Plus, Check, X, Eye, AlertTriangle, AlertCircle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddAlertModal } from "@/components/Modals/AddAlertModal";

export default function AlertsPage() {
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector((state) => state.alertsUI);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const { data: alertsData, isLoading, error } = useGetAlertsQuery({
    page: pagination.page,
    limit: pagination.limit,
    status: filters.status,
    severity: filters.severity,
    vehicle: filters.vehicle_id,
    system: filters.alert_type,
  });

  const [acknowledgeAlert] = useAcknowledgeAlertMutation();
  const [ignoreAlert] = useIgnoreAlertMutation();
  const [resolveAlert] = useResolveAlertLegacyMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setAlertsFilters({ search: e.target.value }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setAlertsFilters({ status: e.target.value === "all" ? undefined : e.target.value }));
  };

  const handleSeverityFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setAlertsFilters({ severity: e.target.value === "all" ? undefined : e.target.value }));
  };

  const handleAlertTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setAlertsFilters({ alert_type: e.target.value === "all" ? undefined : e.target.value }));
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
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error loading alerts: {"message" in error ? error.message : "Unknown error"}
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <InputGroup
              label="Search"
              type="text"
              placeholder="Search alerts..."
              value={filters.search || ""}
              handleChange={handleSearchChange}
              icon={<Search className="h-4 w-4 text-gray-400" />}
              iconPosition="left"
            />
            
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
            />

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
            />

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
            />

            <div className="flex space-x-2">
              <InputGroup
                label="Start Date"
                type="date"
                placeholder="Start date"
                value={filters.start_date || ""}
                handleChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  dispatch(setAlertsFilters({ start_date: e.target.value }))
                }
              />
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

        {/* Alerts Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-6 border-b border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold">Alert List</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {alertsData?.count || 0} alerts found
            </p>
          </div>
          
          <div className="overflow-x-auto">
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
            ) : (
              <table className="w-full">
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
                  {alertsData?.results?.map((alert) => (
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
                            label=""
                            variant="outlineDark"
                            size="small"
                            icon={<Eye className="h-4 w-4" />}
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
          {alertsData && alertsData.count > 0 && (
            <div className="px-6 py-4 border-t border-stroke dark:border-dark-3 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, alertsData.count)} of{" "}
                {alertsData.count} results
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
                  Page {pagination.page} of {Math.ceil(alertsData.count / pagination.limit)}
                </span>
                {pagination.page < Math.ceil(alertsData.count / pagination.limit) ? (
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
    </ProtectedRoute>
  );
}