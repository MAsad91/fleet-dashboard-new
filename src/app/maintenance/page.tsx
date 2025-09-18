"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useListScheduledMaintenanceQuery, useMarkServiceDoneMutation } from "@/store/api/fleetApi";
import { setMaintenanceFilters, setMaintenancePagination } from "@/store/slices/maintenanceUISlice";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Search, Plus, Check, Eye, Edit, Wrench, Calendar, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MaintenancePage() {
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector((state) => state.maintenanceUI);
  
  const { data: maintenanceData, isLoading, error } = useListScheduledMaintenanceQuery({
    page: pagination.page,
    status: filters.status,
  });

  const [markServiceDone] = useMarkServiceDoneMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setMaintenanceFilters({ search: e.target.value }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setMaintenanceFilters({ status: e.target.value === "all" ? undefined : e.target.value }));
  };

  const handleMaintenanceTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setMaintenanceFilters({ maintenance_type: e.target.value === "all" ? undefined : e.target.value }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setMaintenancePagination({ page }));
  };

  const handleMarkServiceDone = async (maintenanceId: string) => {
    if (confirm("Are you sure you want to mark this service as done?")) {
      try {
        await markServiceDone({ id: maintenanceId }).unwrap();
      } catch (error) {
        console.error("Failed to mark service as done:", error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { className: "bg-gray-100 text-gray-800", label: "Scheduled" },
      in_progress: { className: "bg-yellow-100 text-yellow-800", label: "In Progress" },
      completed: { className: "bg-green-100 text-green-800", label: "Completed" },
      overdue: { className: "bg-red-100 text-red-800", label: "Overdue" },
      cancelled: { className: "bg-red-100 text-red-800", label: "Cancelled" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { className: "bg-gray-100 text-gray-800", label: status };
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.className)}>
        {config.label}
      </span>
    );
  };

  const getMaintenanceTypeBadge = (type: string) => {
    const typeConfig = {
      routine: { className: "bg-gray-100 text-gray-800", label: "Routine" },
      repair: { className: "bg-red-100 text-red-800", label: "Repair" },
      inspection: { className: "bg-blue-100 text-blue-800", label: "Inspection" },
      emergency: { className: "bg-red-100 text-red-800", label: "Emergency" },
      recall: { className: "bg-yellow-100 text-yellow-800", label: "Recall" },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || { className: "bg-gray-100 text-gray-800", label: type };
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.className)}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { className: "bg-gray-100 text-gray-800", label: "Low" },
      medium: { className: "bg-yellow-100 text-yellow-800", label: "Medium" },
      high: { className: "bg-orange-100 text-orange-800", label: "High" },
      critical: { className: "bg-red-100 text-red-800", label: "Critical" },
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || { className: "bg-gray-100 text-gray-800", label: priority };
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.className)}>
        {config.label}
      </span>
    );
  };

  const isOverdue = (scheduledDate: string) => {
    return new Date(scheduledDate) < new Date() && new Date(scheduledDate).toDateString() !== new Date().toDateString();
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error loading maintenance records: {"message" in error ? error.message : "Unknown error"}
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
            <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
            <p className="text-muted-foreground">
              Schedule and track vehicle maintenance activities
            </p>
          </div>
          <Button
            label="Schedule Maintenance"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <InputGroup
              label="Search"
              type="text"
              placeholder="Search maintenance..."
              value={filters.search || ""}
              handleChange={handleSearchChange}
              icon={<Search className="h-4 w-4 text-gray-400" />}
              iconPosition="left"
            />
            
            <Select
              label="Status"
              items={[
                { value: "all", label: "All Status" },
                { value: "scheduled", label: "Scheduled" },
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
                { value: "overdue", label: "Overdue" },
                { value: "cancelled", label: "Cancelled" },
              ]}
              defaultValue={filters.status || "all"}
              placeholder="Select status"
            />

            <Select
              label="Type"
              items={[
                { value: "all", label: "All Types" },
                { value: "routine", label: "Routine" },
                { value: "repair", label: "Repair" },
                { value: "inspection", label: "Inspection" },
                { value: "emergency", label: "Emergency" },
                { value: "recall", label: "Recall" },
              ]}
              defaultValue={filters.maintenance_type || "all"}
              placeholder="Select type"
            />

            <InputGroup
              label="Start Date"
              type="date"
              placeholder="Start date"
              value={filters.start_date || ""}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                dispatch(setMaintenanceFilters({ start_date: e.target.value }))
              }
            />

            <InputGroup
              label="End Date"
              type="date"
              placeholder="End date"
              value={filters.end_date || ""}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                dispatch(setMaintenanceFilters({ end_date: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Maintenance Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-6 border-b border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold">Maintenance Records</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {maintenanceData?.count || 0} maintenance records found
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
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Scheduled Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-dark divide-y divide-gray-200 dark:divide-gray-700">
                  {maintenanceData?.results?.map((maintenance) => (
                    <tr key={maintenance.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                            <Wrench className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {maintenance.service_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                              {maintenance.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {maintenance.vehicle?.license_plate || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getMaintenanceTypeBadge(maintenance.maintenance_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(maintenance.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(maintenance.status)}
                          {isOverdue(maintenance.scheduled_date) && maintenance.status === "scheduled" && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              {new Date(maintenance.scheduled_date).toLocaleDateString()}
                            </span>
                          </div>
                          {isOverdue(maintenance.scheduled_date) && maintenance.status === "scheduled" && (
                            <div className="text-xs text-red-600 font-medium">
                              Overdue
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            label=""
                            variant="outlineDark"
                            size="small"
                            icon={<Eye className="h-4 w-4" />}
                          />
                          <Button
                            label=""
                            variant="outlineDark"
                            size="small"
                            icon={<Edit className="h-4 w-4" />}
                          />
                          {maintenance.status === "scheduled" && (
                            <Button
                              label="Mark Done"
                              variant="green"
                              size="small"
                              icon={<Check className="h-4 w-4" />}
                              onClick={() => handleMarkServiceDone(maintenance.id)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {maintenanceData && maintenanceData.count > 0 && (
            <div className="px-6 py-4 border-t border-stroke dark:border-dark-3 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, maintenanceData.count)} of{" "}
                {maintenanceData.count} results
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
                  Page {pagination.page} of {Math.ceil(maintenanceData.count / pagination.limit)}
                </span>
                {pagination.page < Math.ceil(maintenanceData.count / pagination.limit) ? (
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
    </ProtectedRoute>
  );
}