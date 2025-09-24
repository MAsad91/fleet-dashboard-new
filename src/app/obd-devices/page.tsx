"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useListObdDevicesQuery, useDeleteObdDeviceMutation } from "@/store/api/fleetApi";
import { setOBDFilters, setOBDPagination } from "@/store/slices/obdUISlice";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Search, Plus, Edit, Trash2, Eye, Wifi, WifiOff, Activity, Battery, Cpu, HardDrive, Wrench, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";

export default function OBDDevicesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector((state) => state.obdUI);
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
    status: filters.status,
  });

  const [deleteDevice] = useDeleteObdDeviceMutation();

  // Client-side filtering for device_type and search
  const allFilteredDevices = devicesData?.results?.filter(device => {
    const matchesSearch = !filters.search || 
      device.device_id?.toLowerCase().includes(filters.search.toLowerCase()) ||
      device.model?.toLowerCase().includes(filters.search.toLowerCase()) ||
      device.firmware_version?.toLowerCase().includes(filters.search.toLowerCase()) ||
      device.serial_number?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesModel = !filters.model || device.model === filters.model;
    const matchesFirmware = !filters.firmware_version || device.firmware_version === filters.firmware_version;
    
    return matchesSearch && matchesModel && matchesFirmware;
  }) || [];

  const totalFilteredCount = allFilteredDevices.length;
  const paginatedDevices = allFilteredDevices.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setOBDFilters({ search: e.target.value }));
    dispatch(setOBDPagination({ page: 1 }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setOBDFilters({ status: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setOBDPagination({ page: 1 }));
  };

  const handleModelFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setOBDFilters({ model: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setOBDPagination({ page: 1 }));
  };

  const handleFirmwareFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setOBDFilters({ firmware_version: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setOBDPagination({ page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setOBDPagination({ page }));
  };

  const handleViewDevice = (deviceId: string) => {
    router.push(`/obd-devices/${deviceId}`);
  };

  const handleEditDevice = (deviceId: string) => {
    router.push(`/obd-devices/${deviceId}/edit`);
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
      console.error("Failed to delete device:", error);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    const config = isActive 
      ? { className: "bg-green-100 text-green-800", label: "Active" }
      : { className: "bg-red-100 text-red-800", label: "Inactive" };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getOnlineBadge = (lastCommunication: string) => {
    const isOnline = lastCommunication && new Date(lastCommunication) > new Date(Date.now() - 5 * 60 * 1000);
    const config = isOnline
      ? { className: "bg-green-100 text-green-800", label: "Online", icon: Wifi }
      : { className: "bg-red-100 text-red-800", label: "Offline", icon: WifiOff };
    
    const Icon = config.icon;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${config.className}`}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  const getModelBadge = (model: string) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-purple-100 text-purple-800', 'bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 'bg-pink-100 text-pink-800'];
    const colorIndex = model ? model.length % colors.length : 0;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[colorIndex]}`}>
        {model || 'Unknown'}
      </span>
    );
  };

  // Get unique models and firmware versions for filter options
  const uniqueModels = [...new Set(devicesData?.results?.map(device => device.model).filter(Boolean))];
  const uniqueFirmwareVersions = [...new Set(devicesData?.results?.map(device => device.firmware_version).filter(Boolean))];

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error loading devices: {"message" in error ? error.message : "Unknown error"}
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
              Manage OBD devices and their configurations
            </p>
          </div>
          <Button
            label="Add Device"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => router.push('/obd-devices/add')}
          />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Devices</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {devicesData?.results?.length || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Cpu className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Devices</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {devicesData?.results?.filter(device => device.is_active).length || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online (≤5m)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {devicesData?.results?.filter(device => {
                    const lastComm = device.last_communication_at;
                    return lastComm && new Date(lastComm) > new Date(Date.now() - 5 * 60 * 1000);
                  }).length || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Wifi className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              label="Model"
              items={[
                { value: "all", label: "All Models" },
                ...uniqueModels.map(model => ({ value: model, label: model }))
              ]}
              defaultValue={filters.model || "all"}
              placeholder="Select model"
              onChange={handleModelFilter}
            />

            <Select
              label="Firmware"
              items={[
                { value: "all", label: "All Versions" },
                ...uniqueFirmwareVersions.map(version => ({ value: version, label: version }))
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
                onClick={() => dispatch(setOBDFilters({ 
                  search: "", 
                  status: undefined, 
                  model: undefined,
                  firmware_version: undefined
                }))}
              />
            </div>
          </div>
        </div>

        {/* Devices Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-6 border-b border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold">Device List</h3>
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
                Error loading OBD devices
              </div>
            ) : paginatedDevices.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {allFilteredDevices.length === 0 && (filters.search || filters.status || filters.model || filters.firmware_version) 
                  ? "No devices found matching your filters." 
                  : "No devices found."
                }
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: '1200px' }}>
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Device ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Firmware
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Comm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Online
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-dark divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedDevices.map((device) => (
                    <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Cpu className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {device.device_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {device.vehicle?.license_plate || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getModelBadge(device.model)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {device.firmware_version || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {device.last_communication_at 
                          ? new Date(device.last_communication_at).toLocaleString()
                          : 'Never'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(device.is_active)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getOnlineBadge(device.last_communication_at)}
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
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalFilteredCount > 0 && (
            <div className="px-6 py-4 border-t border-stroke dark:border-dark-3 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, totalFilteredCount)} of {totalFilteredCount} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  label="Previous"
                  variant="outlineDark"
                  size="small"
                  onClick={pagination.page === 1 ? undefined : () => handlePageChange(pagination.page - 1)}
                  className={pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : ''}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination.page} of {Math.ceil(totalFilteredCount / pagination.limit)}
                </span>
                <Button
                  label="Next"
                  variant="outlineDark"
                  size="small"
                  onClick={pagination.page >= Math.ceil(totalFilteredCount / pagination.limit) ? undefined : () => handlePageChange(pagination.page + 1)}
                  className={pagination.page >= Math.ceil(totalFilteredCount / pagination.limit) ? 'opacity-50 cursor-not-allowed' : ''}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteDevice}
        title="Delete OBD Device"
        message="Are you sure you want to delete this OBD device? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </ProtectedRoute>
  );
}
