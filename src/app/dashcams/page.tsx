"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useListDashcamsQuery, useRefreshDashcamApiKeyMutation, useDeleteDashcamMutation } from "@/store/api/fleetApi";
import { setDashcamsFilters, setDashcamsPagination } from "@/store/slices/dashcamsUISlice";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Search, Plus, RefreshCw, Trash2, Eye, Edit, Video, Wifi, WifiOff, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashcamsPage() {
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector((state) => state.dashcamsUI);
  const [copiedApiKey, setCopiedApiKey] = useState<string | null>(null);
  
  const { data: dashcamsData, isLoading, error } = useListDashcamsQuery({
    page: pagination.page,
    status: filters.status,
  });

  const [refreshApiKey] = useRefreshDashcamApiKeyMutation();
  const [deleteDashcam] = useDeleteDashcamMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDashcamsFilters({ search: e.target.value }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setDashcamsFilters({ status: e.target.value === "all" ? undefined : e.target.value }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setDashcamsPagination({ page }));
  };

  const handleRefreshApiKey = async (dashcamId: string) => {
    try {
      await refreshApiKey({ id: dashcamId }).unwrap();
      alert("API key refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh API key:", error);
      alert("Failed to refresh API key");
    }
  };

  const handleDeleteDashcam = async (dashcamId: string) => {
    if (confirm("Are you sure you want to delete this dashcam?")) {
      try {
        await deleteDashcam(dashcamId).unwrap();
        alert("Dashcam deleted successfully");
      } catch (error) {
        console.error("Failed to delete dashcam:", error);
        alert("Failed to delete dashcam");
      }
    }
  };

  const handleCopyApiKey = async (apiKey: string) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedApiKey(apiKey);
      alert("API key copied to clipboard");
      setTimeout(() => setCopiedApiKey(null), 2000);
    } catch (error) {
      console.error("Failed to copy API key:", error);
      alert("Failed to copy API key");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      online: { className: "bg-green-100 text-green-800", icon: Wifi, label: "Online" },
      offline: { className: "bg-red-100 text-red-800", icon: WifiOff, label: "Offline" },
      recording: { className: "bg-blue-100 text-blue-800", icon: Video, label: "Recording" },
      maintenance: { className: "bg-yellow-100 text-yellow-800", icon: Video, label: "Maintenance" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      icon: Video,
      label: status
    };
    
    const Icon = config.icon;
    
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1", config.className)}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  if (error) {
    // Check if it's a 403 error (admin-only access)
    const is403Error = error && 'status' in error && error.status === 403;
    
    if (is403Error) {
      return (
        <div className="p-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
              <Video className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Access Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Dashcams management requires administrator privileges. Please contact your system administrator to access this feature.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> This section is restricted to admin users only. Regular fleet users can view other sections like Vehicles, Drivers, and Trips.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error loading dashcams: {"message" in error ? error.message : "Unknown error"}
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
            <h1 className="text-3xl font-bold tracking-tight">Dashcams</h1>
            <p className="text-muted-foreground">
              Manage dashcam devices and their video recordings
            </p>
          </div>
          <Button
            label="Add Dashcam"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <InputGroup
              label="Search"
              type="text"
              placeholder="Search dashcams..."
              value={filters.search || ""}
              handleChange={handleSearchChange}
              icon={<Search className="h-4 w-4 text-gray-400" />}
              iconPosition="left"
            />
            
            <Select
              label="Status"
              items={[
                { value: "all", label: "All Status" },
                { value: "online", label: "Online" },
                { value: "offline", label: "Offline" },
                { value: "recording", label: "Recording" },
                { value: "maintenance", label: "Maintenance" },
              ]}
              defaultValue={filters.status || "all"}
              placeholder="Select status"
            />

            <InputGroup
              label="Vehicle"
              type="text"
              placeholder="Vehicle ID or license plate"
              value={filters.vehicle_id || ""}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                dispatch(setDashcamsFilters({ vehicle_id: e.target.value }))
              }
            />

            <div className="flex items-end">
              <Button
                label="Clear Filters"
                variant="outlineDark"
                size="small"
                onClick={() => dispatch(setDashcamsFilters({ search: "", status: undefined, vehicle_id: "" }))}
              />
            </div>
          </div>
        </div>

        {/* Dashcams Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-6 border-b border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold">Dashcam List</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {dashcamsData?.count || 0} dashcams found
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
                      Dashcam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      API Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Recording
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Storage Used
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-dark divide-y divide-gray-200 dark:divide-gray-700">
                  {dashcamsData?.results?.map((dashcam) => (
                    <tr key={dashcam.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <Video className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {dashcam.device_id}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {dashcam.model || "Unknown Model"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(dashcam.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {dashcam.vehicle?.license_plate || "Unassigned"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {dashcam.api_key ? `${dashcam.api_key.substring(0, 8)}...` : "N/A"}
                          </code>
                          {dashcam.api_key && (
                            <Button
                              label=""
                              variant="outlineDark"
                              size="small"
                              icon={copiedApiKey === dashcam.api_key ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                              onClick={() => handleCopyApiKey(dashcam.api_key)}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {dashcam.last_recording 
                          ? new Date(dashcam.last_recording).toLocaleString()
                          : "Never"
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {dashcam.storage_used 
                          ? `${(dashcam.storage_used / 1024 / 1024 / 1024).toFixed(1)} GB`
                          : "N/A"
                        }
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
                          <Button
                            label="Refresh Key"
                            variant="outlineDark"
                            size="small"
                            icon={<RefreshCw className="h-4 w-4" />}
                            onClick={() => handleRefreshApiKey(dashcam.id)}
                          />
                          <Button
                            label=""
                            variant="outlineDark"
                            size="small"
                            icon={<Trash2 className="h-4 w-4" />}
                            onClick={() => handleDeleteDashcam(dashcam.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {dashcamsData && dashcamsData.count > 0 && (
            <div className="px-6 py-4 border-t border-stroke dark:border-dark-3 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, dashcamsData.count)} of{" "}
                {dashcamsData.count} results
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
                  Page {pagination.page} of {Math.ceil(dashcamsData.count / pagination.limit)}
                </span>
                {pagination.page < Math.ceil(dashcamsData.count / pagination.limit) ? (
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