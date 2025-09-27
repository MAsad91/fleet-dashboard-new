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
  // NOTE: API endpoint matches Postman collection: GET /api/fleet/vehicles/dashboard_stats/
  const { data: dashboardStats } = useGetVehiclesDashboardStatsQuery({ dateRange: 'today' });

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
            <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              label="Create"
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

        {/* KPI CARDS */}
        {dashboardStats && (
          <>
            {/* First Row - 4 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats.total_vehicles || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vehicles</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Available</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardStats.vehicle_status_breakdown?.available || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vehicles</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">In Service</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardStats.vehicle_status_breakdown?.in_use || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vehicles</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Maint</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {dashboardStats.vehicle_status_breakdown?.maintenance || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vehicles</p>
                </div>
              </div>
            </div>

            {/* Second Row - 2 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Avg Battery %</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(dashboardStats.average_battery_level || 0)}%
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Expiring Vehicle Docs</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {dashboardStats.expiring_vehicle_docs || 0}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 Search by VIN, plate, make, model, year..."
                value={filters.search || ""}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            {/* Filter Dropdowns */}
            <div className="flex flex-wrap gap-2">
              <select
                value={filters.status || "all"}
                onChange={handleStatusFilter}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="all">Status ▾</option>
                <option value="available">Available</option>
                <option value="in_service">In Service</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>

              <select
                value={filters.has_obd?.toString() || "all"}
                onChange={handleHasObdFilter}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="all">Has OBD ▾</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>

              <select
                value={filters.online?.toString() || "all"}
                onChange={handleOnlineFilter}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="all">Online ▾</option>
                <option value="true">Online</option>
                <option value="false">Offline</option>
              </select>

              <select
                value={filters.health_status || "all"}
                onChange={handleHealthStatusFilter}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="all">Health ▾</option>
                <option value="Good">Good</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
              </select>

              <Button
                label="Apply"
                variant="primary"
                size="small"
                onClick={() => refetchVehicles()}
              />
            </div>
          </div>
        </div>

        {/* VEHICLES TABLE */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-4 border-b border-stroke dark:border-dark-3 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Vehicles Table</h3>
            <div className="flex items-center space-x-2">
              <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={selectedVehicles.length === paginatedVehicles.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
                />
                [▢ Select All]
              </label>
            </div>
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
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
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
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          label="◀"
                          variant="outlineDark"
                          size="small"
                          onClick={pagination.page === 1 ? undefined : () => handlePageChange(pagination.page - 1)}
                          className={pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : ''}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Page {pagination.page}/{Math.ceil(totalFilteredCount / pagination.limit)}
                        </span>
                        <Button
                          label="▶"
                          variant="outlineDark"
                          size="small"
                          onClick={pagination.page >= Math.ceil(totalFilteredCount / pagination.limit) ? undefined : () => handlePageChange(pagination.page + 1)}
                          className={pagination.page >= Math.ceil(totalFilteredCount / pagination.limit) ? 'opacity-50 cursor-not-allowed' : ''}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedVehicles.length === paginatedVehicles.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      VIN
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Plate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Make/Model (Year)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Batt
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Onln
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Hlth
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
                      <td className="px-4 py-3 whitespace-nowrap">
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
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                        {vehicle.vin || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {vehicle.license_plate || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {vehicle.make || 'N/A'}/{vehicle.model || 'N/A'}({vehicle.year || 'N/A'})
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {vehicle.current_battery_level ? `${vehicle.current_battery_level}%` : 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {vehicle.status === 'available' ? 'avail' : 
                         vehicle.status === 'in_service' ? 'in_srv' : 
                         vehicle.status === 'maintenance' ? 'maint' : 
                         vehicle.status || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {vehicle.online_status === true || vehicle.online_status === 'online' ? (
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-500">●</span>
                        ) : vehicle.online_status === false || vehicle.online_status === 'offline' ? (
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-300">○</span>
                        ) : (
                          <span className="text-gray-400 text-xs">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center justify-center w-4 h-4 ${
                          vehicle.health_status === 'Good' ? 'text-green-500' : 
                          vehicle.health_status === 'Warning' ? 'text-yellow-500' : 
                          vehicle.health_status === 'Critical' ? 'text-red-500' : 
                          'text-gray-400'
                        }`}>
                          {vehicle.health_status === 'Good' ? '✓' : 
                           vehicle.health_status === 'Warning' ? '⚠' : 
                           vehicle.health_status === 'Critical' ? '⛔' : 
                           '--'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </>
            )}
          </div>

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
