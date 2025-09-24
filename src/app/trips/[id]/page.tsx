"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetTripByIdQuery, useStartTripMutation, useEndTripMutation, useCancelTripMutation } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Play, Square, X, User, Car, Calendar, Clock, MapPin, Activity, AlertTriangle, Edit } from "lucide-react";

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const { data: tripData, isLoading, error } = useGetTripByIdQuery(tripId);
  const [startTrip] = useStartTripMutation();
  const [endTrip] = useEndTripMutation();
  const [cancelTrip] = useCancelTripMutation();

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !tripData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="text-center text-red-600">
          <p>Failed to load trip details. Please try again.</p>
          <Button 
            onClick={() => router.back()} 
            variant="primary" 
            label="Back to Trips"
            className="mt-4"
          />
        </div>
      </ProtectedRoute>
    );
  }

  const handleStartTrip = async () => {
    try {
      await startTrip({ id: tripId }).unwrap();
    } catch (error) {
      console.error("Failed to start trip:", error);
    }
  };

  const handleEndTrip = async () => {
    try {
      await endTrip({ id: tripId }).unwrap();
    } catch (error) {
      console.error("Failed to end trip:", error);
    }
  };

  const handleCancelTrip = async () => {
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="space-y-6">
        {/* HEADER: Back Button + Beautiful Title Card */}
        <div className="relative">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              onClick={() => router.back()}
              variant="outlineDark"
              label="Back"
              icon={<ArrowLeft className="h-4 w-4" />}
              className="px-4 py-2 rounded-lg"
            />
          </div>

          {/* Beautiful Title Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-lg border border-blue-200 dark:border-gray-600 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 dark:bg-gray-600 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200 dark:bg-gray-600 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                {/* Left Side - Trip Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <MapPin className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Trip — Detail
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        Trip: {tripData.trip_id} • Vehicle: {tripData.vehicle?.plate_number || tripData.vehicle?.license_plate || 'N/A'} • Driver: {tripData.driver?.name || tripData.driver?.full_name || 'N/A'} • Status: {tripData.status}
                      </p>
                    </div>
                  </div>

                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Driver Distance</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {tripData.driver_distance_km || 'N/A'} km
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">OBD Distance</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {tripData.obd_distance_km || 'N/A'} km
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getStatusBadge(tripData.status)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Action Buttons */}
                <div className="flex flex-col space-y-2 ml-6">
                  <div className="flex space-x-2">
                    {tripData.status === 'scheduled' && (
                      <Button
                        label="Start"
                        variant="primary"
                        size="small"
                        icon={<Play className="h-3 w-3" />}
                        onClick={handleStartTrip}
                        className="px-3 py-2 text-xs"
                      />
                    )}
                    {tripData.status === 'in_progress' && (
                      <>
                        <Button
                          label="End"
                          variant="primary"
                          size="small"
                          icon={<Square className="h-3 w-3" />}
                          onClick={handleEndTrip}
                          className="px-3 py-2 text-xs"
                        />
                        <Button
                          label="Cancel"
                          variant="outlineDark"
                          size="small"
                          icon={<X className="h-3 w-3" />}
                          onClick={handleCancelTrip}
                          className="px-3 py-2 text-xs"
                        />
                      </>
                    )}
                    <Button
                      label="Command"
                      variant="outlineDark"
                      size="small"
                      icon={<Activity className="h-3 w-3" />}
                      onClick={() => {}}
                      className="px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Driver Dist (km)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tripData.driver_distance_km || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">OBD Dist (km)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tripData.obd_distance_km || 'N/A'}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Est. Cost</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${tripData.estimated_cost || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Actual Cost</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${tripData.actual_cost || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Info (Left) */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Info</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">trip_id:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{tripData.trip_id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">driver:</span>
                <Button
                  label={`View Driver`}
                  variant="primary"
                  size="small"
                  onClick={() => router.push(`/drivers/${tripData.driver?.id}`)}
                  className="px-2 py-1 text-xs"
                />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">vehicle:</span>
                <Button
                  label={`View Vehicle`}
                  variant="primary"
                  size="small"
                  onClick={() => router.push(`/vehicles/${tripData.vehicle?.id}`)}
                  className="px-2 py-1 text-xs"
                />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">assignment:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{tripData.assignment || 'None'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">scheduled_start_time:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {tripData.scheduled_start_time ? new Date(tripData.scheduled_start_time).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">scheduled_end_time:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {tripData.scheduled_end_time ? new Date(tripData.scheduled_end_time).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">actual_start_time:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {tripData.actual_start_time ? new Date(tripData.actual_start_time).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">actual_end_time:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {tripData.actual_end_time ? new Date(tripData.actual_end_time).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">start_coordinate:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {tripData.start_coordinate ? JSON.stringify(tripData.start_coordinate) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">end_coordinate:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {tripData.end_coordinate ? JSON.stringify(tripData.end_coordinate) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Live & Actions (Right) */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Live & Actions</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {getStatusBadge(tripData.status)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Actions:</span>
                <div className="flex space-x-2">
                  {tripData.status === 'scheduled' && (
                    <Button
                      label="Start"
                      variant="primary"
                      size="small"
                      icon={<Play className="h-3 w-3" />}
                      onClick={handleStartTrip}
                      className="px-2 py-1 text-xs"
                    />
                  )}
                  {tripData.status === 'in_progress' && (
                    <>
                      <Button
                        label="End"
                        variant="primary"
                        size="small"
                        icon={<Square className="h-3 w-3" />}
                        onClick={handleEndTrip}
                        className="px-2 py-1 text-xs"
                      />
                      <Button
                        label="Cancel"
                        variant="outlineDark"
                        size="small"
                        icon={<X className="h-3 w-3" />}
                        onClick={handleCancelTrip}
                        className="px-2 py-1 text-xs"
                      />
                    </>
                  )}
                  <Button
                    label="Send Command"
                    variant="outlineDark"
                    size="small"
                    icon={<Activity className="h-3 w-3" />}
                    onClick={() => {}}
                    className="px-2 py-1 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">live_driver_coordinate updated_at:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {tripData.live_driver_coordinate_updated_at ? new Date(tripData.live_driver_coordinate_updated_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">live_obd_coordinate updated_at:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {tripData.live_obd_coordinate_updated_at ? new Date(tripData.live_obd_coordinate_updated_at).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}