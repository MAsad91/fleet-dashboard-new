"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetTripsQuery, useStartTripMutation, useEndTripMutation, useCancelTripMutation } from "@/store/api/fleetApi";
import { setTripsFilters, setTripsPagination } from "@/store/slices/tripsUISlice";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Search, Plus, Play, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddTripModal } from "@/components/Modals/AddTripModal";

export default function TripsPage() {
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector((state) => state.tripsUI);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const { data: tripsData, isLoading, error } = useGetTripsQuery({
    page: pagination.page,
    limit: pagination.limit,
    status: filters.status,
    driver: filters.driver_id,
    vehicle: filters.vehicle_id,
  });

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

  const getActionButton = (trip: any) => {
    switch (trip.status) {
      case "scheduled":
        return (
          <Button
            label="Start"
            variant="green"
            size="small"
            icon={<Play className="h-4 w-4" />}
            onClick={() => handleStartTrip(trip.id)}
          />
        );
      case "in_progress":
        return (
          <div className="flex gap-2">
            <Button
              label="End"
              variant="primary"
              size="small"
              icon={<Square className="h-4 w-4" />}
              onClick={() => handleEndTrip(trip.id)}
            />
            <Button
              label="Cancel"
              variant="outlineDark"
              size="small"
              icon={<X className="h-4 w-4" />}
              onClick={() => handleCancelTrip(trip.id)}
            />
          </div>
        );
      default:
        return null;
    }
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trips</h1>
            <p className="text-muted-foreground">
              Manage and monitor all fleet trips
            </p>
          </div>
          <Button
            label="Create Trip"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsAddModalOpen(true)}
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputGroup
              label="Search"
              type="text"
              placeholder="Search trips..."
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
                { value: "cancelled", label: "Cancelled" },
              ]}
              defaultValue={filters.status || "all"}
              placeholder="Select status"
            />

            <InputGroup
              label="Start Date"
              type="date"
              placeholder="Start date"
              value={filters.start_date || ""}
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                dispatch(setTripsFilters({ start_date: e.target.value }))
              }
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
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-dark divide-y divide-gray-200 dark:divide-gray-700">
                  {tripsData?.results?.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {trip.trip_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {trip.driver || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {trip.vehicle || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(trip.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {trip.actual_start_time 
                          ? new Date(trip.actual_start_time).toLocaleString() 
                          : "N/A"
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {getActionButton(trip)}
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

      {/* Add Trip Modal */}
      <AddTripModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </ProtectedRoute>
  );
}