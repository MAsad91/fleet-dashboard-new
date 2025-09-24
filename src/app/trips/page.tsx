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
  
  // Full-page view states
  const [currentView, setCurrentView] = useState<'list' | 'view' | 'edit'>('list');
  const [tripData, setTripData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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

  // API hooks for full-page views
  const { 
    data: tripDetails, 
    isLoading: tripLoading, 
    error: tripError 
  } = useGetTripByIdQuery(selectedTripId!, {
    skip: !selectedTripId
  });

  const [updateTrip, { isLoading: isUpdating }] = useUpdateTripMutation();
  const [startTrip] = useStartTripMutation();
  const [endTrip] = useEndTripMutation();
  const [cancelTrip] = useCancelTripMutation();

  // Update trip data when API response changes
  useEffect(() => {
    if (tripDetails) {
      setTripData(tripDetails);
      setFormData(tripDetails);
    }
  }, [tripDetails]);

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

  const handleViewTrip = (tripId: string) => {
    console.log('Opening trip view:', tripId);
    setSelectedTripId(tripId);
    setCurrentView('view');
  };

  const handleEditTrip = (tripId: string) => {
    console.log('Opening trip edit:', tripId);
    setSelectedTripId(tripId);
    setCurrentView('edit');
  };

  const handleBackToList = () => {
    console.log('Going back to list');
    setCurrentView('list');
    // Don't reset selectedTripId to allow re-navigation
  };

  const handleClearSelection = () => {
    console.log('Clearing selection');
    setSelectedTripId(null);
    setTripData(null);
    setFormData({});
    setErrors({});
    setCurrentView('list');
  };

  // Form handling for edit view
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.start_location?.trim()) {
      newErrors.start_location = 'Start location is required';
    }
    if (!formData.end_location?.trim()) {
      newErrors.end_location = 'End location is required';
    }
    if (!formData.purpose?.trim()) {
      newErrors.purpose = 'Purpose is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveTrip = async () => {
    if (!validateForm()) return;
    
    try {
      await updateTrip({
        id: selectedTripId!,
        body: formData
      }).unwrap();
      
      console.log('Trip updated successfully');
      handleClearSelection();
    } catch (error) {
      console.error('Failed to update trip:', error);
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
    const statusButtons = (() => {
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
    })();

    return (
      <div className="flex items-center space-x-2">
        <Button
          label=""
          variant="outlineDark"
          size="small"
          icon={<Eye className="h-4 w-4" />}
          onClick={() => handleViewTrip(trip.id)}
        />
        <Button
          label=""
          variant="outlineDark"
          size="small"
          icon={<Edit className="h-4 w-4" />}
          onClick={() => handleEditTrip(trip.id)}
        />
        {statusButtons && (
          <div className="ml-2">
            {statusButtons}
          </div>
        )}
      </div>
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

  // Debug current state
  console.log('Current Trips state:', { currentView, selectedTripId, tripData: !!tripData, tripLoading });

  // Show loading state when switching trips
  if ((currentView === 'view' || currentView === 'edit') && selectedTripId && !tripData && tripLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleBackToList} 
                variant="outlineDark"
                label="Back"
                icon={<ArrowLeft className="h-4 w-4" />}
                className="px-4 py-2 rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Loading Trip...
                </h1>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show error state when API fails
  if ((currentView === 'view' || currentView === 'edit') && selectedTripId && tripError) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleBackToList} 
                variant="outlineDark"
                label="Back"
                icon={<ArrowLeft className="h-4 w-4" />}
                className="px-4 py-2 rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Error Loading Trip
                </h1>
              </div>
            </div>
          </div>
          <div className="text-center text-red-600">
            <p>Failed to load trip details. Please try again.</p>
            <Button 
              onClick={handleBackToList} 
              variant="primary" 
              label="Back to Trips"
              className="mt-4"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Render different views based on currentView state
  if (currentView === 'view' && tripData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div key={`view-${selectedTripId}`} className="p-6">
          {/* Header with Back Button */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={handleBackToList} 
                  variant="outlineDark"
                  label="Back"
                  icon={<ArrowLeft className="h-4 w-4" />}
                  className="px-4 py-2 rounded-lg"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Trip — Detail
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Trip: {tripData.trip_id} • Vehicle: {tripData.vehicle?.plate_number || tripData.vehicle?.license_plate || 'N/A'} • Driver: {tripData.driver?.name || tripData.driver?.full_name || 'N/A'} • Status: {tripData.status}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                {tripData.status === 'scheduled' && (
                  <Button
                    label="Start"
                    variant="primary"
                    icon={<Play className="h-4 w-4" />}
                    onClick={() => handleStartTrip(tripData.id)}
                  />
                )}
                {tripData.status === 'in_progress' && (
                  <div className="flex space-x-2">
                    <Button
                      label="End"
                      variant="primary"
                      icon={<Square className="h-4 w-4" />}
                      onClick={() => handleEndTrip(tripData.id)}
                    />
                    <Button
                      label="Cancel"
                      variant="outlineDark"
                      icon={<X className="h-4 w-4" />}
                      onClick={() => handleCancelTrip(tripData.id)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Driver Dist (km)</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {tripData.driver_distance_km || 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">OBD Dist (km)</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {tripData.obd_distance_km || 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Car className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Est. Cost</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    ${tripData.estimated_cost || 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Actual Cost</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    ${tripData.actual_cost || 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Trip Information Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Trip Details</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Start Location</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-lg">{tripData.start_location}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">End Location</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{tripData.end_location}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {getStatusBadge(tripData.status)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Purpose</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{tripData.purpose || 'Not Specified'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created At</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {tripData.created_at ? new Date(tripData.created_at).toLocaleString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Trip Information</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Driver</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {tripData.driver ? `${tripData.driver.first_name} ${tripData.driver.last_name}` : 'Not Assigned'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Vehicle</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {tripData.vehicle ? `${tripData.vehicle.make} ${tripData.vehicle.model} (${tripData.vehicle.license_plate})` : 'Not Assigned'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Start Time</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {tripData.start_time ? new Date(tripData.start_time).toLocaleString() : 'Not Started'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">End Time</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {tripData.end_time ? new Date(tripData.end_time).toLocaleString() : 'Not Ended'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (currentView === 'edit' && tripData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div key={`edit-${selectedTripId}`} className="p-6">
          {/* Header with Back Button */}
          <div className="mb-8">
            <Button 
              onClick={handleBackToList} 
              variant="outlineDark"
              label="Back"
              icon={<ArrowLeft className="h-4 w-4" />}
              className="px-4 py-2 rounded-lg"
            />
          </div>

          {/* Edit Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trip Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Location
                  </label>
                  <input
                    type="text"
                    name="start_location"
                    value={formData.start_location || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.start_location ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.start_location && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Location
                  </label>
                  <input
                    type="text"
                    name="end_location"
                    value={formData.end_location || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.end_location ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.end_location && (
                    <p className="mt-1 text-sm text-red-600">{errors.end_location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Purpose
                  </label>
                  <textarea
                    name="purpose"
                    value={formData.purpose || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.purpose ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter trip purpose..."
                  />
                  {errors.purpose && (
                    <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
                  )}
                </div>
              </div>

              {/* Status Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button 
                onClick={handleBackToList} 
                variant="outlineDark"
                label="Cancel"
                icon={<X className="h-4 w-4" />}
                className="px-4 py-2 rounded-lg"
              />
              <Button 
                onClick={handleSaveTrip} 
                variant="primary" 
                label={isUpdating ? 'Saving...' : 'Save Changes'}
                icon={<Save className="h-4 w-4" />}
                className="px-6 py-2 rounded-lg"
              />
            </div>
          </div>
        </div>
      </ProtectedRoute>
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
              <p className="text-muted-foreground">
                Manage and monitor all fleet trips
              </p>
            </div>
            <Button
              label="Create Trip"
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => router.push('/trips/add')}
            />
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
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              onChange={handleStatusFilter}
            />
            
            <Select
              label="Vehicle"
              items={[
                { value: "", label: "All Vehicles" },
                ...(vehiclesData?.results?.map((vehicle: any) => ({
                  value: vehicle.id.toString(),
                  label: `${vehicle.plate_number || vehicle.license_plate || 'N/A'} - ${vehicle.make || ''} ${vehicle.model || ''}`
                })) || [])
              ]}
              defaultValue={filters.vehicle_id || ""}
              onChange={(e) => dispatch(setTripsFilters({ vehicle_id: e.target.value || undefined }))}
            />
            
            <Select
              label="Driver"
              items={[
                { value: "", label: "All Drivers" },
                ...(driversData?.results?.map((driver: any) => ({
                  value: driver.id.toString(),
                  label: `${driver.name || driver.full_name || driver.username || 'N/A'} (${driver.phone || 'N/A'})`
                })) || [])
              ]}
              defaultValue={filters.driver_id || ""}
              onChange={(e) => dispatch(setTripsFilters({ driver_id: e.target.value || undefined }))}
            />
            
            <InputGroup
              label="Trip ID"
              type="text"
              placeholder="Search by trip ID..."
              value={tripIdFilter}
              handleChange={(e) => setTripIdFilter(e.target.value)}
              icon={<Search className="h-4 w-4 text-gray-400" />}
              iconPosition="left"
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button
              label="Clear Filters"
              variant="outlineDark"
              size="small"
              onClick={() => {
                dispatch(setTripsFilters({ 
                  status: undefined,
                  vehicle_id: undefined,
                  driver_id: undefined
                }));
                setTripIdFilter("");
              }}
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
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTrips.length === tripsData.results.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Select All ({selectedTrips.length} selected)
                    </span>
                  </label>
                </div>
                
                {selectedTrips.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Button
                      label="Cancel Selected"
                      variant="outlineDark"
                      onClick={handleBulkCancel}
                      className="text-sm text-red-600 hover:text-red-700"
                    />
                  </div>
                )}
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
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: '1200px' }}>
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
                    <tr key={trip.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedTrips.includes(trip.id)}
                          onChange={() => handleSelectTrip(trip.id)}
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
      </div>

    </ProtectedRoute>
  );
}