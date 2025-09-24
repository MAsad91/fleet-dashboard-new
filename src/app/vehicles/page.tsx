"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useListVehiclesQuery, useDeleteVehicleMutation, useListVehicleTypesQuery, useSetVehiclesForMaintenanceMutation, useRetireVehiclesMutation, useGetVehiclesDashboardStatsQuery, useListFleetOperatorsQuery } from "@/store/api/fleetApi";
import { useRealtimeEntityUpdates } from "@/hooks/useRealtimeData";
import { setVehiclesFilters, setVehiclesPagination } from "@/store/slices/vehiclesUISlice";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Search, Plus, Edit, Trash2, Eye, Car, Wrench, Fuel } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";

export default function VehiclesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector((state) => state.vehiclesUI);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  
  // Get all vehicles for client-side filtering (fetch multiple pages)
  const { data: page1Data, isLoading: page1Loading, error: page1Error } = useListVehiclesQuery({
    page: 1,
    // API-supported filters
    vehicle_type: filters.vehicle_type,
    has_obd: filters.has_obd,
    online: filters.online,
    health_status: filters.health_status,
    fleet: filters.fleet,
  });

  // Only fetch page 2 if page 1 has a next page
  const shouldFetchPage2 = page1Data?.next !== null;
  
  const { data: page2Data, isLoading: page2Loading, error: page2Error } = useListVehiclesQuery({
    page: 2,
    // API-supported filters
    vehicle_type: filters.vehicle_type,
    has_obd: filters.has_obd,
    online: filters.online,
    health_status: filters.health_status,
    fleet: filters.fleet,
  }, {
    skip: !shouldFetchPage2, // Skip the query if there's no next page
  });

  // Combine data from both pages for client-side filtering
  const allVehiclesData = {
    count: page1Data?.count || 0,
    results: [
      ...(page1Data?.results || []),
      ...(page2Data?.results || [])
    ],
    next: page2Data?.next,
    previous: page1Data?.previous,
  };

  const allVehiclesLoading = page1Loading || (shouldFetchPage2 && page2Loading);
  const allVehiclesError = page1Error || (shouldFetchPage2 && page2Error);

  // Get paginated data for display (this will be used for the actual table display)
  const { data: vehiclesData, isLoading, error, refetch: refetchVehicles } = useListVehiclesQuery({
    page: pagination.page,
    // API-supported filters
    vehicle_type: filters.vehicle_type,
    has_obd: filters.has_obd,
    online: filters.online,
    health_status: filters.health_status,
    fleet: filters.fleet,
  });

  const { data: vehicleTypesData } = useListVehicleTypesQuery();
  const { data: fleetOperatorsData } = useListFleetOperatorsQuery();
  const [deleteVehicle] = useDeleteVehicleMutation();
  const [setVehiclesForMaintenance] = useSetVehiclesForMaintenanceMutation();
  const [retireVehicles] = useRetireVehiclesMutation();

  // Get dashboard stats with same filters as vehicles list
  const { data: dashboardStats } = useGetVehiclesDashboardStatsQuery();

  // Enable real-time updates for vehicles
  useRealtimeEntityUpdates('vehicles', refetchVehicles);

  // Bulk action state
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // Client-side filtering for search and status
  const allFilteredVehicles = allVehiclesData?.results?.filter(vehicle => {
    const matchesSearch = !filters.search || 
      vehicle.license_plate?.toLowerCase().includes(filters.search.toLowerCase()) ||
      vehicle.make?.toLowerCase().includes(filters.search.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(filters.search.toLowerCase()) ||
      vehicle.vin?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || vehicle.status === filters.status;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const totalFilteredCount = allFilteredVehicles.length;
  const paginatedVehicles = allFilteredVehicles.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setVehiclesFilters({ search: e.target.value }));
    dispatch(setVehiclesPagination({ page: 1 }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setVehiclesFilters({ status: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setVehiclesPagination({ page: 1 }));
  };

  const handleVehicleTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setVehiclesFilters({ vehicle_type: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setVehiclesPagination({ page: 1 }));
  };

  const handleHasObdFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setVehiclesFilters({ has_obd: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setVehiclesPagination({ page: 1 }));
  };

  const handleOnlineFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setVehiclesFilters({ online: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setVehiclesPagination({ page: 1 }));
  };

  const handleHealthStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setVehiclesFilters({ health_status: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setVehiclesPagination({ page: 1 }));
  };

  const handleFleetFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setVehiclesFilters({ fleet: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setVehiclesPagination({ page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setVehiclesPagination({ page }));
  };

  const handleViewVehicle = (vehicleId: number) => {
    router.push(`/vehicles/${vehicleId}/view`);
  };

  const handleEditVehicle = (vehicleId: number) => {
    router.push(`/vehicles/${vehicleId}/edit`);
  };

  const handleDeleteVehicle = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteVehicle = async () => {
    if (!selectedVehicleId) return;
    
    try {
      await deleteVehicle(selectedVehicleId.toString()).unwrap();
      setIsDeleteConfirmOpen(false);
      setSelectedVehicleId(null);
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
    }
  };

  // Bulk action functions
  const handleSelectAll = () => {
    if (selectedVehicles.length === paginatedVehicles.length) {
      setSelectedVehicles([]);
    } else {
      setSelectedVehicles(paginatedVehicles.map((vehicle: any) => vehicle.id));
    }
  };

  const handleSelectVehicle = (vehicleId: number) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId) 
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const handleBulkMaintenance = async () => {
    if (selectedVehicles.length === 0) return;
    
    setIsBulkActionLoading(true);
    try {
      await setVehiclesForMaintenance({ selected_vehicles: selectedVehicles }).unwrap();
      setSelectedVehicles([]);
      refetchVehicles();
    } catch (error) {
      console.error("Failed to set vehicles for maintenance:", error);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkRetire = async () => {
    if (selectedVehicles.length === 0) return;
    
    setIsBulkActionLoading(true);
    try {
      await retireVehicles({ selected_vehicles: selectedVehicles }).unwrap();
      setSelectedVehicles([]);
      refetchVehicles();
    } catch (error) {
      console.error("Failed to retire vehicles:", error);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { className: "bg-green-100 text-green-800", label: "Available" },
      in_service: { className: "bg-blue-100 text-blue-800", label: "In Service" },
      maintenance: { className: "bg-yellow-100 text-yellow-800", label: "Maintenance" },
      retired: { className: "bg-red-100 text-red-800", label: "Retired" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      label: status || "Unknown"
    };
    
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.className)}>
        {config.label}
      </span>
    );
  };

  const getHealthBadge = (health: string) => {
    const healthConfig = {
      excellent: { className: "bg-green-100 text-green-800", label: "Excellent" },
      good: { className: "bg-blue-100 text-blue-800", label: "Good" },
      fair: { className: "bg-yellow-100 text-yellow-800", label: "Fair" },
      poor: { className: "bg-red-100 text-red-800", label: "Poor" },
    };
    
    const config = healthConfig[health as keyof typeof healthConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      label: health || "Unknown"
    };
    
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.className)}>
        {config.label}
      </span>
    );
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error loading vehicles: {"message" in error ? error.message : "Unknown error"}
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
            <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              label="+ Create"
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => router.push('/vehicles/add')}
            />
            <div className="relative">
              <Button
                label="Bulk ▼"
                variant="outlineDark"
                onClick={() => {}} // TODO: Add bulk actions dropdown
              />
            </div>
          </div>
        </div>

        {/* KPI Cards - First Row (4 cards) */}
        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats.total_vehicles || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardStats.vehicle_status_breakdown?.available || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Car className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Service</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardStats.vehicle_status_breakdown?.in_use || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {dashboardStats.vehicle_status_breakdown?.maintenance || 0}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Wrench className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards - Second Row (2 cards) */}
        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Battery %</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(dashboardStats.average_battery_level || 0)}%
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Fuel className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Vehicle Docs</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {dashboardStats.expiring_vehicle_docs || 0}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Wrench className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <InputGroup
              label="Search"
              type="text"
              placeholder="Search vehicles..."
              value={filters.search || ""}
              handleChange={handleSearchChange}
              icon={<Search className="h-4 w-4 text-gray-400" />}
              iconPosition="left"
            />
            
            <Select
              label="Vehicle Type"
              items={[
                { value: "all", label: "All Types" },
                ...(vehicleTypesData?.results?.map((type: any) => ({
                  value: type.id.toString(),
                  label: type.name
                })) || [])
              ]}
              defaultValue={filters.vehicle_type?.toString() || "all"}
              placeholder="Select type"
              onChange={handleVehicleTypeFilter}
            />

            <Select
              label="Has OBD"
              items={[
                { value: "all", label: "All" },
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
              ]}
              defaultValue={filters.has_obd?.toString() || "all"}
              placeholder="Select OBD status"
              onChange={handleHasObdFilter}
            />

            <Select
              label="Online"
              items={[
                { value: "all", label: "All" },
                { value: "true", label: "Online" },
                { value: "false", label: "Offline" },
              ]}
              defaultValue={filters.online?.toString() || "all"}
              placeholder="Select online status"
              onChange={handleOnlineFilter}
            />

            <Select
              label="Health"
              items={[
                { value: "all", label: "All" },
                { value: "Good", label: "Good" },
                { value: "Warning", label: "Warning" },
                { value: "Critical", label: "Critical" },
              ]}
              defaultValue={filters.health_status || "all"}
              placeholder="Select health"
              onChange={handleHealthStatusFilter}
            />

            <Select
              label="Fleet"
              items={[
                { value: "all", label: "All Fleets" },
                ...(fleetOperatorsData?.results?.map((operator: any) => ({
                  value: operator.id.toString(),
                  label: operator.name
                })) || [])
              ]}
              defaultValue={filters.fleet?.toString() || "all"}
              placeholder="Select fleet"
              onChange={handleFleetFilter}
            />
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Legend: Online = green/grey • Health = Good/Warning/Critical
            </div>
            <div className="flex space-x-2">
              <Button
                label="Apply"
                variant="primary"
                size="small"
                onClick={() => refetchVehicles()}
              />
              <Button
                label="Clear Filters"
                variant="outlineDark"
                size="small"
                onClick={() => dispatch(setVehiclesFilters({ 
                  search: "", 
                  status: undefined, 
                  vehicle_type: undefined,
                  has_obd: undefined,
                  online: undefined,
                  health_status: undefined,
                  fleet: undefined
                }))}
              />
            </div>
          </div>
        </div>

        {/* Vehicles Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-6 border-b border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold">Vehicle List</h3>
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
                Error loading vehicles
              </div>
            ) : paginatedVehicles.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {allFilteredVehicles.length === 0 && (filters.search || filters.status) 
                  ? "No vehicles found matching your filters." 
                  : "No vehicles found."
                }
              </div>
            ) : (
              <>
                {/* Bulk Actions */}
                {paginatedVehicles.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedVehicles.length === paginatedVehicles.length}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            [Select All]
                          </span>
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {selectedVehicles.length > 0 && (
                          <>
                            <Button
                              label="[Set for Maintenance]"
                              variant="outlineDark"
                              onClick={isBulkActionLoading ? undefined : handleBulkMaintenance}
                              className={`text-sm ${isBulkActionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            <Button
                              label="[Retire]"
                              variant="outlineDark"
                              onClick={isBulkActionLoading ? undefined : handleBulkRetire}
                              className={`text-sm ${isBulkActionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                          </>
                        )}
                        
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          Page {pagination.page}/{Math.ceil(totalFilteredCount / pagination.limit)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: '1200px' }}>
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedVehicles.length === paginatedVehicles.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      VIN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Plate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Make / Model (Year)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Battery
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Online
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Health
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-dark divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedVehicles.map((vehicle) => (
                    <tr 
                      key={vehicle.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150"
                      onClick={(e) => {
                        // Don't navigate if clicking on checkbox, action buttons, or their children
                        const target = e.target as HTMLElement;
                        const isCheckbox = (target as HTMLInputElement).type === 'checkbox' || target.closest('input[type="checkbox"]');
                        const isActionButton = target.closest('button') || target.closest('[role="button"]');
                        
                        if (!isCheckbox && !isActionButton) {
                          router.push(`/vehicles/${vehicle.id}/view`);
                        }
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedVehicles.includes(vehicle.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectVehicle(vehicle.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                        {vehicle.vin ? `${vehicle.vin.substring(0, 6)}...` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {vehicle.license_plate || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Car className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {vehicle.make} / {vehicle.model}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ({vehicle.year})
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {vehicle.current_battery_level || 0}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(vehicle.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vehicle.online_status ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {vehicle.online_status ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getHealthBadge(vehicle.health_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            label=""
                            variant="outlineDark"
                            size="small"
                            icon={<Eye className="h-4 w-4" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewVehicle(vehicle.id);
                            }}
                          />
                          <Button
                            label=""
                            variant="outlineDark"
                            size="small"
                            icon={<Edit className="h-4 w-4" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditVehicle(vehicle.id);
                            }}
                          />
                          <Button
                            label=""
                            variant="outlineDark"
                            size="small"
                            icon={<Trash2 className="h-4 w-4" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVehicle(vehicle.id);
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </>
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
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteVehicle}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </ProtectedRoute>
  );
}
