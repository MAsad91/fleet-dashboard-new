"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useListObdDevicesQuery, useDeleteObdDeviceMutation } from "@/store/api/fleetApi";
import { setOBDFilters, setOBDPagination } from "@/store/slices/obdUISlice";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Search, Plus, Edit, Trash2, Eye, Wifi, WifiOff, Activity, Battery } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OBDDevicesPage() {
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector((state) => state.obdUI);
  
  const { data: devicesData, isLoading, error } = useListObdDevicesQuery();

  const [deleteDevice] = useDeleteObdDeviceMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setOBDFilters({ search: e.target.value }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setOBDFilters({ status: e.target.value === "all" ? undefined : e.target.value }));
  };

  const handleDeviceTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setOBDFilters({ device_type: e.target.value === "all" ? undefined : e.target.value }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setOBDPagination({ page }));
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (confirm("Are you sure you want to delete this OBD device?")) {
      try {
        await deleteDevice(deviceId).unwrap();
      } catch (error) {
        console.error("Failed to delete OBD device:", error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      online: { className: "bg-green-100 text-green-800", icon: Wifi, label: "Online" },
      offline: { className: "bg-red-100 text-red-800", icon: WifiOff, label: "Offline" },
      maintenance: { className: "bg-yellow-100 text-yellow-800", icon: Activity, label: "Maintenance" },
      inactive: { className: "bg-gray-100 text-gray-800", icon: WifiOff, label: "Inactive" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      icon: WifiOff,
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

  const getBatteryLevel = (batteryLevel: number) => {
    if (batteryLevel >= 80) return { color: "text-green-600", bg: "bg-green-100" };
    if (batteryLevel >= 50) return { color: "text-yellow-600", bg: "bg-yellow-100" };
    if (batteryLevel >= 20) return { color: "text-orange-600", bg: "bg-orange-100" };
    return { color: "text-red-600", bg: "bg-red-100" };
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error loading OBD devices: {"message" in error ? error.message : "Unknown error"}
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
            <h1 className="text-3xl font-bold tracking-tight">OBD Devices</h1>
            <p className="text-muted-foreground">
              Manage and monitor OBD devices and their telemetry data
            </p>
          </div>
          <Button
            label="Add Device"
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
              placeholder="Search devices..."
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
                { value: "maintenance", label: "Maintenance" },
                { value: "inactive", label: "Inactive" },
              ]}
              defaultValue={filters.status || "all"}
              placeholder="Select status"
            />

            <Select
              label="Device Type"
              items={[
                { value: "all", label: "All Types" },
                { value: "elm327", label: "ELM327" },
                { value: "obd2", label: "OBD2" },
                { value: "canbus", label: "CAN Bus" },
                { value: "bluetooth", label: "Bluetooth" },
              ]}
              defaultValue={filters.device_type || "all"}
              placeholder="Select type"
            />

            <div className="flex items-end">
              <Button
                label="Clear Filters"
                variant="outlineDark"
                size="small"
                onClick={() => dispatch(setOBDFilters({ search: "", status: undefined, device_type: undefined }))}
              />
            </div>
          </div>
        </div>

        {/* OBD Devices Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-6 border-b border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold">OBD Device List</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {devicesData?.count || 0} devices found
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
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Battery
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Seen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-dark divide-y divide-gray-200 dark:divide-gray-700">
                  {devicesData?.results?.map((device) => {
                    const batteryInfo = getBatteryLevel(device.battery_level || 0);
                    return (
                      <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                              <Activity className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {device.device_id}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {device.model || "Unknown Model"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 uppercase">
                            {device.device_type || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(device.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {device.vehicle?.license_plate || "Unassigned"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className={cn("p-1 rounded", batteryInfo.bg)}>
                              <Battery className={cn("h-4 w-4", batteryInfo.color)} />
                            </div>
                            <span className={cn("text-sm font-medium", batteryInfo.color)}>
                              {device.battery_level || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {device.last_seen 
                            ? new Date(device.last_seen).toLocaleString()
                            : "Never"
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
                              label=""
                              variant="outlineDark"
                              size="small"
                              icon={<Trash2 className="h-4 w-4" />}
                              onClick={() => handleDeleteDevice(device.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {devicesData && devicesData.count > 0 && (
            <div className="px-6 py-4 border-t border-stroke dark:border-dark-3 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, devicesData.count)} of{" "}
                {devicesData.count} results
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
                  Page {pagination.page} of {Math.ceil(devicesData.count / pagination.limit)}
                </span>
                {pagination.page < Math.ceil(devicesData.count / pagination.limit) ? (
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