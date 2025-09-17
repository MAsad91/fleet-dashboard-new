"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useListVehiclesQuery, useDeleteVehicleMutation } from "@/store/api/vehiclesApi";
import { setVehiclesFilters, setVehiclesPagination } from "@/store/slices/vehiclesUISlice";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Search, Plus, Edit, Trash2, Eye, Car, Wrench, Fuel } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VehiclesPage() {
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector((state) => state.vehiclesUI);
  
  const { data: vehiclesData, isLoading, error } = useListVehiclesQuery({
    page: pagination.page,
    vehicle_type: filters.vehicle_type_id,
  });

  const [deleteVehicle] = useDeleteVehicleMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setVehiclesFilters({ search: e.target.value }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setVehiclesFilters({ status: e.target.value === "all" ? undefined : e.target.value }));
  };

  const handleVehicleTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setVehiclesFilters({ vehicle_type_id: e.target.value === "all" ? undefined : e.target.value }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setVehiclesPagination({ page }));
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await deleteVehicle(vehicleId).unwrap();
      } catch (error) {
        console.error("Failed to delete vehicle:", error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { className: "bg-green-100 text-green-800", label: "Active" },
      inactive: { className: "bg-gray-100 text-gray-800", label: "Inactive" },
      maintenance: { className: "bg-yellow-100 text-yellow-800", label: "Maintenance" },
      retired: { className: "bg-red-100 text-red-800", label: "Retired" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { className: "bg-gray-100 text-gray-800", label: status };
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
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer']}>
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
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              label="Status"
              items={[
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "maintenance", label: "Maintenance" },
                { value: "retired", label: "Retired" },
              ]}
              defaultValue={filters.status || "all"}
              placeholder="Select status"
            />

            <Select
              label="Vehicle Type"
              items={[
                { value: "all", label: "All Types" },
                { value: "sedan", label: "Sedan" },
                { value: "suv", label: "SUV" },
                { value: "truck", label: "Truck" },
                { value: "van", label: "Van" },
                { value: "motorcycle", label: "Motorcycle" },
              ]}
              defaultValue={filters.vehicle_type_id || "all"}
              placeholder="Select type"
            />

            <InputGroup
              label="Make"
              type="text"
              placeholder="e.g., Toyota"
              value={filters.make || ""}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                dispatch(setVehiclesFilters({ make: e.target.value }))
              }
            />

            <InputGroup
              label="Model"
              type="text"
              placeholder="e.g., Camry"
              value={filters.model || ""}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                dispatch(setVehiclesFilters({ model: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Vehicles Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-6 border-b border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold">Vehicle List</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {vehiclesData?.count || 0} vehicles found
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
                      Last Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-dark divide-y divide-gray-200 dark:divide-gray-700">
                  {vehiclesData?.results?.map((vehicle) => (
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
                          {vehicle.vehicle_type?.name || "N/A"}
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
                        {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {vehicle.last_service_date 
                          ? new Date(vehicle.last_service_date).toLocaleDateString()
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
          {vehiclesData && vehiclesData.count > 0 && (
            <div className="px-6 py-4 border-t border-stroke dark:border-dark-3 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, vehiclesData.count)} of{" "}
                {vehiclesData.count} results
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
                  Page {pagination.page} of {Math.ceil(vehiclesData.count / pagination.limit)}
                </span>
                {pagination.page < Math.ceil(vehiclesData.count / pagination.limit) ? (
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