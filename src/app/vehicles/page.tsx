"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useListVehiclesQuery, useDeleteVehicleMutation, useListVehicleTypesQuery } from "@/store/api/fleetApi";
import { setVehiclesFilters, setVehiclesPagination } from "@/store/slices/vehiclesUISlice";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Search, Plus, Edit, Trash2, Eye, Car, Wrench, Fuel } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddVehicleModal } from "@/components/Modals/AddVehicleModal";
import { VehicleViewModal } from "@/components/Modals/VehicleViewModal";
import { VehicleEditModal } from "@/components/Modals/VehicleEditModal";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";

export default function VehiclesPage() {
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector((state) => state.vehiclesUI);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  // Combine all pages of data
  const allVehiclesData = {
    results: [
      ...(page1Data?.results || []),
      ...(page2Data?.results || [])
    ],
    count: page1Data?.count || 0,
    page: 1,
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

  // Debug API parameters
  console.log('Vehicles API Parameters:', {
    page: pagination.page,
    vehicle_type: filters.vehicle_type,
    has_obd: filters.has_obd,
    online: filters.online,
    health_status: filters.health_status,
    fleet: filters.fleet,
  });
  
  console.log('Vehicles API Response:', {
    total: vehiclesData?.count,
    results: vehiclesData?.results?.length,
    page: vehiclesData?.page,
    next: vehiclesData?.next,
    previous: vehiclesData?.previous,
    data: vehiclesData
  });

  // Debug All Vehicles API response
  console.log('Page 1 API Response:', {
    total: page1Data?.count,
    results: page1Data?.results?.length,
    page: page1Data?.page,
    next: page1Data?.next,
    previous: page1Data?.previous,
  });

  console.log('Page 2 API Response:', {
    total: page2Data?.count,
    results: page2Data?.results?.length,
    page: page2Data?.page,
    next: page2Data?.next,
    previous: page2Data?.previous,
  });

  console.log('Combined All Vehicles Data:', {
    total: allVehiclesData?.count,
    results: allVehiclesData?.results?.length,
    page1Results: page1Data?.results?.length || 0,
    page2Results: page2Data?.results?.length || 0,
    combinedResults: allVehiclesData?.results?.length,
    shouldFetchPage2: shouldFetchPage2,
    page1HasNext: page1Data?.next !== null,
  });
  
  // Get fleet operator from existing vehicles data
  const fleetOperator = vehiclesData?.results?.[0]?.fleet_operator;
  console.log('Fleet Operator from existing data:', fleetOperator);

  const { data: vehicleTypesData, isLoading: vehicleTypesLoading } = useListVehicleTypesQuery();

  // Client-side filtering for search and status (API doesn't support these)
  // Use allVehiclesData for filtering to get complete dataset
  const allFilteredVehicles = allVehiclesData?.results?.filter((vehicle: any) => {
    // Filter by status (client-side since API doesn't support it)
    if (filters.status && filters.status !== 'all' && filters.status !== undefined) {
      if (vehicle.status !== filters.status) {
        return false;
      }
    }

    // Filter by search term (client-side)
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      const searchableFields = [
        vehicle.license_plate,
        vehicle.vin,
        vehicle.make,
        vehicle.model,
        vehicle.color,
        vehicle.fuel_type,
        vehicle.vehicle_type,
      ].filter(Boolean).join(' ').toLowerCase();

      if (!searchableFields.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  }) || [];

  // Debug filtering
  console.log('Filtering Debug:', {
    totalFromAllVehiclesAPI: allVehiclesData?.results?.length || 0,
    totalFromPaginatedAPI: vehiclesData?.results?.length || 0,
    filteredCount: allFilteredVehicles.length,
    searchFilter: filters.search,
    statusFilter: filters.status,
    apiFilters: {
      vehicle_type: filters.vehicle_type,
      has_obd: filters.has_obd,
      online: filters.online,
      health_status: filters.health_status,
      fleet: filters.fleet,
    }
  });

  // For pagination, we need to handle it differently since we're doing client-side filtering
  // We'll use the API pagination for the base data, but apply client-side filters
  const totalFilteredCount = allFilteredVehicles.length;
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const paginatedVehicles = allFilteredVehicles.slice(startIndex, endIndex);


  const [deleteVehicle] = useDeleteVehicleMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Search filter changed:', e.target.value);
    dispatch(setVehiclesFilters({ search: e.target.value }));
    dispatch(setVehiclesPagination({ page: 1 }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Status filter changed:', e.target.value);
    dispatch(setVehiclesFilters({ status: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setVehiclesPagination({ page: 1 }));
  };

  const handleVehicleTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Vehicle type filter changed:', e.target.value);
    dispatch(setVehiclesFilters({ vehicle_type: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setVehiclesPagination({ page: 1 }));
  };

  const handleHasObdFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Has OBD filter changed:', e.target.value);
    dispatch(setVehiclesFilters({ has_obd: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setVehiclesPagination({ page: 1 }));
  };

  const handleOnlineFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Online filter changed:', e.target.value);
    dispatch(setVehiclesFilters({ online: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setVehiclesPagination({ page: 1 }));
  };

  const handleHealthStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Health status filter changed:', e.target.value);
    dispatch(setVehiclesFilters({ health_status: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setVehiclesPagination({ page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setVehiclesPagination({ page }));
  };

  const handleViewVehicle = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    setIsViewModalOpen(true);
  };

  const handleEditVehicle = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId);
    setIsEditModalOpen(true);
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { className: "bg-green-100 text-green-800", label: "Available" },
      in_service: { className: "bg-blue-100 text-blue-800", label: "In Service" },
      maintenance: { className: "bg-yellow-100 text-yellow-800", label: "Maintenance" },
      retired: { className: "bg-red-100 text-red-800", label: "Retired" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { className: "bg-gray-100 text-gray-800", label: status || "Unknown" };
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.className)}>
        {config.label}
      </span>
    );
  };

  const getFuelTypeIcon = (fuelType: string) => {
    switch (fuelType?.toLowerCase()) {
      case "gasoline":
      case "petrol":
        return <Fuel className="h-4 w-4 text-blue-600" />;
      case "diesel":
        return <Fuel className="h-4 w-4 text-gray-600" />;
      case "electric":
        return <Fuel className="h-4 w-4 text-green-600" />;
      case "hybrid":
        return <Fuel className="h-4 w-4 text-purple-600" />;
      default:
        return <Fuel className="h-4 w-4 text-gray-400" />;
    }
  };

  const getHealthBadge = (healthStatus: string) => {
    const healthConfig = {
      Good: { className: "bg-green-100 text-green-800", label: "Good" },
      Warning: { className: "bg-yellow-100 text-yellow-800", label: "Warning" },
      Critical: { className: "bg-red-100 text-red-800", label: "Critical" },
    };
    
    const config = healthConfig[healthStatus as keyof typeof healthConfig] || { className: "bg-gray-100 text-gray-800", label: healthStatus || "Unknown" };
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
            <p className="text-muted-foreground">
              Manage your fleet vehicles and their information
            </p>
          </div>
          <Button
            label="Add Vehicle"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsAddModalOpen(true)}
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-4 min-w-max">
              <div className="flex-shrink-0 w-48">
                <InputGroup
                  label="Search"
                  type="text"
                  placeholder="Search vehicles..."
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
                    { value: "available", label: "Available" },
                    { value: "in_service", label: "In Service" },
                    { value: "maintenance", label: "Maintenance" },
                    { value: "retired", label: "Retired" },
                  ]}
                  defaultValue={filters.status || "all"}
                  placeholder="Select status"
                  onChange={handleStatusFilter}
                />
              </div>

          <div className="flex-shrink-0 w-40">
            <Select
              label="Vehicle Type"
              items={[
                { value: "all", label: "All Types" },
                ...(vehicleTypesData?.results?.map((type: any) => ({
                  value: type.id.toString(),
                  label: `${type.name} (${type.category})`
                })) || [])
              ]}
              defaultValue={filters.vehicle_type || "all"}
              placeholder={vehicleTypesLoading ? "Loading..." : "Select type"}
              onChange={handleVehicleTypeFilter}
            />
          </div>

              <div className="flex-shrink-0 w-40">
                <Select
                  label="Has OBD"
                  items={[
                    { value: "all", label: "All" },
                    { value: "true", label: "Yes" },
                    { value: "false", label: "No" },
                  ]}
                  defaultValue={filters.has_obd || "all"}
                  placeholder="Select OBD"
                  onChange={handleHasObdFilter}
                />
              </div>

              <div className="flex-shrink-0 w-40">
                <Select
                  label="Online"
                  items={[
                    { value: "all", label: "All" },
                    { value: "true", label: "Online" },
                    { value: "false", label: "Offline" },
                  ]}
                  defaultValue={filters.online || "all"}
                  placeholder="Select online"
                  onChange={handleOnlineFilter}
                />
              </div>

              <div className="flex-shrink-0 w-40">
                <Select
                  label="Health Status"
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
              </div>
            </div>
          </div>
        </div>

        {/* Vehicles Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-6 border-b border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold">Vehicle List</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalFilteredCount} vehicles found
            </p>
          </div>
          
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {isLoading || allVehiclesLoading ? (
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
            ) : error || allVehiclesError ? (
              <div className="p-6 text-red-600">
                Error: {(error as any)?.message || (allVehiclesError as any)?.message || 'Failed to load vehicles'}
              </div>
            ) : allFilteredVehicles.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {allVehiclesData?.results?.length === 0 ? "No vehicles found." : "No vehicles match the current filters."}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: '1200px' }}>
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fuel Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Mileage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Battery
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
                    <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <Car className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {vehicle.license_plate}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {vehicle.make} {vehicle.model} ({vehicle.year})
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {vehicle.vehicle_type || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(vehicle.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getFuelTypeIcon(vehicle.fuel_type)}
                          <span className="text-sm capitalize text-gray-900 dark:text-white">
                            {vehicle.fuel_type || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {vehicle.mileage_km ? `${vehicle.mileage_km.toLocaleString()} km` : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {vehicle.current_battery_level ? `${vehicle.current_battery_level}%` : "N/A"}
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
                            onClick={() => handleViewVehicle(vehicle.id)}
                          />
                          <Button
                            label=""
                            variant="outlineDark"
                            size="small"
                            icon={<Edit className="h-4 w-4" />}
                            onClick={() => handleEditVehicle(vehicle.id)}
                          />
                          <Button
                            label=""
                            variant="outlineDark"
                            size="small"
                            icon={<Trash2 className="h-4 w-4" />}
                            onClick={() => handleDeleteVehicle(vehicle.id)}
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

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={async () => {
          console.log('Vehicle creation successful, refetching vehicles list...');
          // Small delay to ensure API has processed the new vehicle
          setTimeout(async () => {
            try {
              const result = await refetchVehicles();
              console.log('Vehicles list refetched:', result);
            } catch (error) {
              console.error('Error refetching vehicles:', error);
            }
          }, 500);
          setIsAddModalOpen(false);
        }}
        fleetOperator={fleetOperator}
      />

      {/* Vehicle View Modal */}
      <VehicleViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedVehicleId(null);
        }}
        vehicleId={selectedVehicleId}
        onEdit={handleEditVehicle}
      />

      {/* Vehicle Edit Modal */}
      <VehicleEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedVehicleId(null);
        }}
        vehicleId={selectedVehicleId}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setSelectedVehicleId(null);
        }}
        onConfirm={confirmDeleteVehicle}
        title="Delete Vehicle"
        message={`Are you sure you want to delete this vehicle? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </ProtectedRoute>
  );
}