"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetTripsQuery, useStartTripMutation, useEndTripMutation, useCancelTripMutation, useGetTripByIdQuery, useUpdateTripMutation, useGetTripsDashboardStatsQuery, useGetDriversQuery, useListVehiclesQuery } from "@/store/api/fleetApi";
import { setTripsFilters, setTripsPagination } from "@/store/slices/tripsUISlice";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Search, Plus, Play, Square, X, Eye, Edit, ArrowLeft, Save, Car, User, Calendar, MapPin, Clock, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TripsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector((state) => state.tripsUI);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
  const [tripIdFilter, setTripIdFilter] = useState("");
  
  
  const { data: tripsData, isLoading, error } = useGetTripsQuery({
    page: pagination.page,
    limit: pagination.limit,
    status: filters.status,
    driver: filters.driver_id,
    vehicle: filters.vehicle_id,
    trip_id: tripIdFilter || undefined,
  });

  // Dashboard stats for KPI cards
  const { data: dashboardStats } = useGetTripsDashboardStatsQuery();
  
  // Additional data for filters
  const { data: driversData } = useGetDriversQuery({ page: 1 });
  const { data: vehiclesData } = useListVehiclesQuery({ page: 1 });

  const [startTrip] = useStartTripMutation();
  const [endTrip] = useEndTripMutation();
  const [cancelTrip] = useCancelTripMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setTripsFilters({ search: e.target.value }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setTripsFilters({ status: e.target.value === "all" ? undefined : e.target.value }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setTripsPagination({ page }));
  };

  const handleStartTrip = async (tripId: string) => {
    try {
      await startTrip({ id: tripId }).unwrap();
    } catch (error) {
      console.error("Failed to start trip:", error);
    }
  };

  const handleEndTrip = async (tripId: string) => {
    try {
      await endTrip({ id: tripId }).unwrap();
    } catch (error) {
      console.error("Failed to end trip:", error);
    }
  };

  const handleCancelTrip = async (tripId: string) => {
    try {
      await cancelTrip({ id: tripId }).unwrap();
    } catch (error) {
      console.error("Failed to cancel trip:", error);
    }
  };

  const handleSelectAll = () => {
    if (selectedTrips.length === tripsData?.results?.length) {
      setSelectedTrips([]);
    } else {
      setSelectedTrips(tripsData?.results?.map((trip: any) => trip.id) || []);
    }
  };

  const handleSelectTrip = (tripId: string) => {
    setSelectedTrips(prev => 
      prev.includes(tripId) 
        ? prev.filter(id => id !== tripId)
        : [...prev, tripId]
    );
  };

  const handleBulkCancel = async () => {
    if (selectedTrips.length === 0) return;
    
    try {
      // TODO: Implement bulk cancel API call
      console.log("Bulk canceling trips:", selectedTrips);
      setSelectedTrips([]);
    } catch (error) {
      console.error("Failed to bulk cancel trips:", error);
    }
  };


  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { className: "bg-gray-100 text-gray-800", label: "Scheduled" },
      in_progress: { className: "bg-blue-100 text-blue-800", label: "In Progress" },
      completed: { className: "bg-green-100 text-green-800", label: "Completed" },
      cancelled: { className: "bg-red-100 text-red-800", label: "Cancelled" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { className: "bg-gray-100 text-gray-800", label: status };
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
          Error loading trips: {"message" in error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }


  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Trips</h1>
            </div>
            <div className="flex space-x-3">
              <Button
                label="Create"
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => router.push('/trips/add')}
              />
              <Button
                label="Bulk ▼"
                variant="outlineDark"
                onClick={() => {}}
              />
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Trips</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats?.total_trips || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardStats?.in_progress || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Play className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardStats?.completed || 0}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Square className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">
                    {dashboardStats?.cancelled || 0}
                  </p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <X className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status || "all"}
                onChange={handleStatusFilter}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vehicle
              </label>
              <select
                value={filters.vehicle_id || ""}
                onChange={(e) => dispatch(setTripsFilters({ vehicle_id: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Vehicles</option>
                {vehiclesData?.results?.map((vehicle: any) => (
                  <option key={vehicle.id} value={vehicle.id.toString()}>
                    {vehicle.plate_number || vehicle.license_plate || 'N/A'} - {vehicle.make || ''} {vehicle.model || ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Driver
              </label>
              <select
                value={filters.driver_id || ""}
                onChange={(e) => dispatch(setTripsFilters({ driver_id: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Drivers</option>
                {driversData?.results?.map((driver: any) => (
                  <option key={driver.id} value={driver.id.toString()}>
                    {driver.name || driver.full_name || driver.username || 'N/A'} ({driver.phone || 'N/A'})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trip ID
              </label>
              <input
                type="text"
                placeholder="Search by trip ID..."
                value={tripIdFilter}
                onChange={(e) => setTripIdFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              label="Apply"
              variant="primary"
              size="small"
              onClick={() => {}} // Filters are applied automatically
            />
          </div>
        </div>

        {/* Trips Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-6 border-b border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold">Trip List</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {tripsData?.count || 0} trips found
            </p>
          </div>
          
          {/* Bulk Actions */}
          {tripsData?.results && tripsData.results.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    label="Select All"
                    variant="outlineDark"
                    size="small"
                    onClick={handleSelectAll}
                    className="text-sm"
                  />
                  {selectedTrips.length > 0 && (
                    <Button
                      label="Cancel Selected"
                      variant="outlineDark"
                      size="small"
                      onClick={handleBulkCancel}
                      className="text-sm text-red-600 hover:text-red-700"
                    />
                  )}
                </div>
                
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Page 1/2
                </div>
              </div>
            </div>
          )}
          
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
                Error loading trips
              </div>
            ) : tripsData?.results?.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No trips found.
              </div>
            ) : (
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedTrips.length === tripsData?.results?.length && tripsData?.results?.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trip ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Start → End
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-dark divide-y divide-gray-200 dark:divide-gray-700">
                  {tripsData?.results?.map((trip: any) => (
                    <tr 
                      key={trip.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150"
                      onClick={(e) => {
                        // Don't navigate if clicking on checkboxes or action buttons
                        const target = e.target as HTMLInputElement;
                        const isCheckbox = target.type === 'checkbox';
                        const isButton = target.closest('button');
                        
                        if (!isCheckbox && !isButton) {
                          router.push(`/trips/${trip.id}`);
                        }
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedTrips.includes(trip.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectTrip(trip.id);
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {trip.trip_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Car className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium">{trip.vehicle?.plate_number || trip.vehicle?.license_plate || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{trip.vehicle?.make} {trip.vehicle?.model}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{trip.driver?.name || trip.driver?.full_name || trip.driver?.username || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div>{trip.scheduled_start_time ? new Date(trip.scheduled_start_time).toLocaleTimeString() : 'N/A'}</div>
                            <div className="text-xs text-gray-400">→ {trip.scheduled_end_time ? new Date(trip.scheduled_end_time).toLocaleTimeString() : 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(trip.status)}
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
                              router.push(`/trips/${trip.id}`);
                            }}
                          />
                          <Button
                            label=""
                            variant="outlineDark"
                            size="small"
                            icon={<Edit className="h-4 w-4" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/trips/${trip.id}/edit`);
                            }}
                          />
                          {trip.status === 'scheduled' && (
                            <Button
                              label="Start"
                              variant="green"
                              size="small"
                              icon={<Play className="h-4 w-4" />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartTrip(trip.id);
                              }}
                            />
                          )}
                          {trip.status === 'in_progress' && (
                            <div className="flex gap-2">
                              <Button
                                label="End"
                                variant="primary"
                                size="small"
                                icon={<Square className="h-4 w-4" />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEndTrip(trip.id);
                                }}
                              />
                              <Button
                                label="Cancel"
                                variant="outlineDark"
                                size="small"
                                icon={<X className="h-4 w-4" />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelTrip(trip.id);
                                }}
                              />
                            </div>
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
          {tripsData && tripsData.count > 0 && (
            <div className="px-6 py-4 border-t border-stroke dark:border-dark-3 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, tripsData.count)} of{" "}
                {tripsData.count} results
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
                  Page {pagination.page} of {Math.ceil(tripsData.count / pagination.limit)}
                </span>
                {pagination.page < Math.ceil(tripsData.count / pagination.limit) ? (
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
      </div>

    </ProtectedRoute>
  );
}