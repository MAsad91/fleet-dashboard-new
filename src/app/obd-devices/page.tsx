"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useListObdDevicesQuery, useDeleteObdDeviceMutation, useGetObdDeviceByIdQuery } from "@/store/api/fleetApi";
import { setOBDFilters, setOBDPagination } from "@/store/slices/obdUISlice";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Search, Plus, Edit, Trash2, Eye, Wifi, WifiOff, Activity, Battery } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddObdDeviceModal } from "@/components/Modals/AddObdDeviceModal";
import { ObdDeviceViewModal } from "@/components/Modals/ObdDeviceViewModal";
import { ObdDeviceEditModal } from "@/components/Modals/ObdDeviceEditModal";
import { DeleteConfirmationModal } from "@/components/Modals/DeleteConfirmationModal";

export default function OBDDevicesPage() {
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector((state) => state.obdUI);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  // Initialize filters to show all devices by default
  useEffect(() => {
    if (filters.status === undefined && filters.online === undefined && filters.model === undefined && filters.firmware_version === undefined) {
      // Set initial state to show all devices
      dispatch(setOBDFilters({ status: undefined, online: undefined, model: undefined, firmware_version: undefined }));
    }
  }, [dispatch, filters.status, filters.online, filters.model, filters.firmware_version]);
  
  const { data: devicesData, isLoading, error } = useListObdDevicesQuery({
    page: pagination.page,
    // Temporarily remove status filter from API to test client-side filtering
    // status: filters.status,
  });

  // Debug: Log the first few devices to see their structure and values
  if (devicesData?.results?.length > 0) {
    console.log('OBD Device Data Analysis:', {
      totalDevices: devicesData.results.length,
      firstDevice: devicesData.results[0],
      firstDeviceKeys: Object.keys(devicesData.results[0] || {}),
      models: devicesData.results.map(d => d.model).filter(Boolean),
      firmwareVersions: devicesData.results.map(d => d.firmware_version).filter(Boolean),
      activeStatuses: devicesData.results.map(d => d.is_active),
      lastCommunications: devicesData.results.map(d => d.last_communication_at),
      uniqueModels: [...new Set(devicesData.results.map(d => d.model).filter(Boolean))],
      uniqueFirmwareVersions: [...new Set(devicesData.results.map(d => d.firmware_version).filter(Boolean))],
      // Check actual API fields
      sampleDeviceFields: {
        device_id: devicesData.results[0].device_id,
        model: devicesData.results[0].model,
        serial_number: devicesData.results[0].serial_number,
        is_active: devicesData.results[0].is_active,
        last_communication_at: devicesData.results[0].last_communication_at,
        firmware_version: devicesData.results[0].firmware_version,
        vehicle: devicesData.results[0].vehicle
      }
    });
  }

  // Client-side filtering based on actual API fields
  const allFilteredDevices = devicesData?.results?.filter((device: any) => {
    // Filter by status (active/inactive)
    if (filters.status && filters.status !== 'all' && filters.status !== undefined) {
      const isActive = device.is_active;
      const matches = (filters.status === 'active' && isActive) || (filters.status === 'inactive' && !isActive);
      console.log('Status filter check:', {
        deviceId: device.device_id,
        isActive: isActive,
        filterStatus: filters.status,
        matches: matches
      });
      if (!matches) {
        return false;
      }
    }

    // Filter by online status (computed from last_communication_at)
    if (filters.online && filters.online !== 'all' && filters.online !== undefined) {
      const lastComm = device.last_communication_at;
      const isOnline = lastComm && new Date(lastComm) > new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      const matches = (filters.online === 'online' && isOnline) || (filters.online === 'offline' && !isOnline);
      console.log('Online filter check:', {
        deviceId: device.device_id,
        lastComm: lastComm,
        isOnline: isOnline,
        filterOnline: filters.online,
        matches: matches
      });
      if (!matches) {
        return false;
      }
    }

    // Filter by model
    if (filters.model && filters.model !== 'all' && filters.model !== undefined) {
      const deviceModel = device.model;
      const matches = deviceModel?.toLowerCase().includes(filters.model.toLowerCase());
      if (!matches) {
        return false;
      }
    }

    // Filter by firmware version
    if (filters.firmware_version && filters.firmware_version !== 'all' && filters.firmware_version !== undefined) {
      const deviceFirmware = device.firmware_version;
      const matches = deviceFirmware?.toLowerCase().includes(filters.firmware_version.toLowerCase());
      if (!matches) {
        return false;
      }
    }

    // Filter by search term
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      const searchableFields = [
        device.device_id,
        device.model,
        device.serial_number,
        device.firmware_version,
        device.vehicle?.license_plate,
        device.vehicle?.make,
        device.vehicle?.model,
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchableFields.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  }) || [];

  // Paginate the filtered results
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const filteredDevices = allFilteredDevices.slice(startIndex, endIndex);
  const totalFilteredCount = allFilteredDevices.length;

  // Debug current filter state
  console.log('Current OBD Filter State:', {
    filters,
    devicesFromAPI: devicesData?.results?.length || 0,
    filteredDevices: allFilteredDevices.length,
    statusFilter: filters.status,
    onlineFilter: filters.online,
    modelFilter: filters.model,
    firmwareFilter: filters.firmware_version,
    searchFilter: filters.search,
    statusIsAll: filters.status === 'all' || filters.status === undefined,
    onlineIsAll: filters.online === 'all' || filters.online === undefined,
    modelIsAll: filters.model === 'all' || filters.model === undefined,
    firmwareIsAll: filters.firmware_version === 'all' || filters.firmware_version === undefined,
    shouldShowAllDevices: (filters.status === 'all' || filters.status === undefined) && 
                         (filters.online === 'all' || filters.online === undefined) && 
                         (filters.model === 'all' || filters.model === undefined) && 
                         (filters.firmware_version === 'all' || filters.firmware_version === undefined) && 
                         (!filters.search || filters.search.trim() === ''),
    // Debug individual device filtering
    sampleDevice: devicesData?.results?.[0] ? {
      deviceId: devicesData.results[0].device_id,
      isActive: devicesData.results[0].is_active,
      lastComm: devicesData.results[0].last_communication_at,
      model: devicesData.results[0].model,
      firmware: devicesData.results[0].firmware_version
    } : null
  });

  const [deleteDevice] = useDeleteObdDeviceMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setOBDFilters({ search: e.target.value }));
    // Reset to page 1 when search changes
    dispatch(setOBDPagination({ page: 1 }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value === "all" ? undefined : e.target.value;
    console.log('Status filter changed:', { 
      oldStatus: filters.status, 
      newStatus, 
      selectedValue: e.target.value,
      willShowAll: e.target.value === "all"
    });
    dispatch(setOBDFilters({ status: newStatus }));
    // Reset to page 1 when status changes
    dispatch(setOBDPagination({ page: 1 }));
  };

  const handleOnlineFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOnline = e.target.value === "all" ? undefined : e.target.value;
    console.log('Online filter changed:', { 
      oldOnline: filters.online, 
      newOnline,
      selectedValue: e.target.value,
      willShowAll: e.target.value === "all"
    });
    dispatch(setOBDFilters({ online: newOnline }));
    // Reset to page 1 when online filter changes
    dispatch(setOBDPagination({ page: 1 }));
  };

  const handleModelFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value === "all" ? undefined : e.target.value;
    console.log('Model filter changed:', { 
      oldModel: filters.model, 
      newModel,
      selectedValue: e.target.value,
      willShowAll: e.target.value === "all"
    });
    dispatch(setOBDFilters({ model: newModel }));
    // Reset to page 1 when model filter changes
    dispatch(setOBDPagination({ page: 1 }));
  };

  const handleFirmwareFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFirmware = e.target.value === "all" ? undefined : e.target.value;
    console.log('Firmware filter changed:', { 
      oldFirmware: filters.firmware_version, 
      newFirmware,
      selectedValue: e.target.value,
      willShowAll: e.target.value === "all"
    });
    dispatch(setOBDFilters({ firmware_version: newFirmware }));
    // Reset to page 1 when firmware filter changes
    dispatch(setOBDPagination({ page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setOBDPagination({ page }));
  };

  const handleViewDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setIsViewModalOpen(true);
  };

  const handleEditDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setIsEditModalOpen(true);
  };

  const handleDeleteDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteDevice = async () => {
    if (!selectedDeviceId) return;
    
    try {
      await deleteDevice(selectedDeviceId).unwrap();
      setIsDeleteModalOpen(false);
      setSelectedDeviceId(null);
    } catch (error) {
      console.error("Failed to delete OBD device:", error);
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

  const getModelBadge = (device: any) => {
    const model = device.model;
    
    // Create a consistent color based on model name
    const getModelColor = (modelName: string) => {
      if (!modelName) return "bg-gray-100 text-gray-800";
      
      const hash = modelName.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      const colors = [
        "bg-blue-100 text-blue-800",
        "bg-green-100 text-green-800", 
        "bg-purple-100 text-purple-800",
        "bg-indigo-100 text-indigo-800",
        "bg-orange-100 text-orange-800",
        "bg-teal-100 text-teal-800",
        "bg-pink-100 text-pink-800",
        "bg-yellow-100 text-yellow-800"
      ];
      
      return colors[Math.abs(hash) % colors.length];
    };
    
    const className = getModelColor(model);
    
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", className)}>
        {model || "Unknown Model"}
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
            onClick={() => setIsAddModalOpen(true)}
          />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Battery className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Devices</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {devicesData?.results?.length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Battery className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Devices</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {devicesData?.results?.filter(d => d.is_active).length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Battery className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Online (≤5m)</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {devicesData?.results?.filter(d => {
                    const lastComm = d.last_communication_at;
                    return lastComm && new Date(lastComm) > new Date(Date.now() - 5 * 60 * 1000);
                  }).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              defaultValue={filters.status || "all"}
              placeholder="Select status"
              onChange={handleStatusFilter}
            />

            <Select
              label="Online"
              items={[
                { value: "all", label: "All" },
                { value: "online", label: "Online" },
                { value: "offline", label: "Offline" },
              ]}
              defaultValue={filters.online || "all"}
              placeholder="Select online status"
              onChange={handleOnlineFilter}
            />

            <Select
              label="Model"
              items={[
                { value: "all", label: "All Models" },
                ...(devicesData?.results ? 
                  [...new Set(devicesData.results.map(d => d.model).filter(Boolean))].map(model => ({
                    value: model,
                    label: model
                  })) : []
                )
              ]}
              defaultValue={filters.model || "all"}
              placeholder="Select model"
              onChange={handleModelFilter}
            />

            <Select
              label="Firmware"
              items={[
                { value: "all", label: "All Versions" },
                ...(devicesData?.results ? 
                  [...new Set(devicesData.results.map(d => d.firmware_version).filter(Boolean))].map(version => ({
                    value: version,
                    label: version
                  })) : []
                )
              ]}
              defaultValue={filters.firmware_version || "all"}
              placeholder="Select firmware"
              onChange={handleFirmwareFilter}
            />

            <div className="flex items-end">
              <Button
                label="Clear Filters"
                variant="outlineDark"
                size="small"
                onClick={() => dispatch(setOBDFilters({ search: "", status: undefined, online: undefined, model: undefined, firmware_version: undefined }))}
              />
            </div>
          </div>
        </div>

        {/* OBD Devices Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-6 border-b border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold">OBD Device List</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalFilteredCount} devices found
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
            ) : filteredDevices.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {allFilteredDevices.length === 0 && (filters.search || filters.status || filters.online || filters.model || filters.firmware_version) ? (
                  <div>
                    <p>No devices found matching your filters.</p>
                    <Button
                      label="Clear Filters"
                      variant="outlineDark"
                      size="small"
                      className="mt-2"
                      onClick={() => dispatch(setOBDFilters({ search: "", status: undefined, online: undefined, model: undefined, firmware_version: undefined }))}
                    />
                  </div>
                ) : (
                  <p>No devices found.</p>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: '1200px' }}>
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Device
                    </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Model
                        </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Online
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
                  {filteredDevices.map((device) => {
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
                          {getModelBadge(device)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(device.is_active ? 'active' : 'inactive')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const lastComm = device.last_communication_at;
                            const isOnline = lastComm && new Date(lastComm) > new Date(Date.now() - 5 * 60 * 1000);
                            return getStatusBadge(isOnline ? 'online' : 'offline');
                          })()}
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
                              onClick={() => handleViewDevice(device.id)}
                            />
                            <Button
                              label=""
                              variant="outlineDark"
                              size="small"
                              icon={<Edit className="h-4 w-4" />}
                              onClick={() => handleEditDevice(device.id)}
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
            
            {/* No results message */}
            {!isLoading && totalFilteredCount === 0 && (
              <div className="p-6 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  {allFilteredDevices.length === 0 && devicesData?.results?.length === 0 ? (
                    "No OBD devices found"
                  ) : (
                    "No devices match the current filters"
                  )}
                </div>
                {(filters.search || filters.device_type) && (
                  <Button
                    label="Clear Filters"
                    variant="outlineDark"
                    size="small"
                    onClick={() => dispatch(setOBDFilters({ search: "", device_type: undefined }))}
                    className="mt-2"
                  />
                )}
              </div>
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

      {/* Add OBD Device Modal */}
      <AddObdDeviceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* View OBD Device Modal */}
      <ObdDeviceViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedDeviceId(null);
        }}
        deviceId={selectedDeviceId}
      />

      {/* Edit OBD Device Modal */}
      <ObdDeviceEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDeviceId(null);
        }}
        deviceId={selectedDeviceId}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDeviceId(null);
        }}
        onConfirm={confirmDeleteDevice}
        title="Delete OBD Device"
        message="Are you sure you want to delete this OBD device? This action cannot be undone."
        itemName={selectedDeviceId ? `Device ${selectedDeviceId}` : undefined}
      />
    </ProtectedRoute>
  );
}