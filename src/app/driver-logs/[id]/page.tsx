"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Clock, Activity, AlertTriangle, MapPin, User } from "lucide-react";

export default function DriverLogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const logId = params.id as string;

  // Mock data since API hooks don't exist yet
  const logData = {
    id: parseInt(logId),
    trip: 712,
    timestamp: new Date().toISOString(),
    coordinates: {
      type: "Point",
      coordinates: [78.47, 17.41]
    },
    speed_kph: 45,
    heading: 180,
    event_type: "brake"
  };

  const isLoading = false;
  const error = null;

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !logData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="text-center text-red-600">
          <p>Failed to load driver log details. Please try again.</p>
          <Button 
            onClick={() => router.back()} 
            variant="primary" 
            label="Back to Driver Logs"
            className="mt-4"
          />
        </div>
      </ProtectedRoute>
    );
  }

  const handleOpenTrip = (tripId: number) => {
    router.push(`/trips/${tripId}`);
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
                {/* Left Side - Log Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Driver Log — Detail (#{logData.id})
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        Trip #{logData.trip} • {new Date(logData.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Speed</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {logData.speed_kph || 'N/A'} kph
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Heading</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {logData.heading || 'N/A'}°
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Event</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {logData.event_type || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Action Buttons */}
                <div className="flex flex-col space-y-2 ml-6">
                  <div className="flex space-x-2">
                    <Button
                      label="Open Trip"
                      variant="outlineDark"
                      size="small"
                      icon={<User className="h-3 w-3" />}
                      onClick={() => handleOpenTrip(logData.trip)}
                      className="px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Speed (kph)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {logData.speed_kph || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Heading (deg)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {logData.heading || 'N/A'}°
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Event Type</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {logData.event_type || '—'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timestamp & Location */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Timestamp & Location</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(logData.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Coordinates:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {logData.coordinates?.coordinates ? 
                    `${logData.coordinates.coordinates[1]}, ${logData.coordinates.coordinates[0]}` : 
                    'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Latitude:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {logData.coordinates?.coordinates?.[1] || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Longitude:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {logData.coordinates?.coordinates?.[0] || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Fields — API Accurate */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Fields — API Accurate</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ID:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{logData.id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Trip:</span>
                <Button
                  label={`Trip #${logData.trip}`}
                  variant="primary"
                  size="small"
                  onClick={() => handleOpenTrip(logData.trip)}
                  className="px-2 py-1 text-xs"
                />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(logData.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Speed (kph):</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{logData.speed_kph || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Heading:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{logData.heading || 'N/A'}°</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Event Type:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{logData.event_type || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coordinates (GeoJSON) */}
        {logData.coordinates && (
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Coordinates (GeoJSON)</h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <pre className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                {JSON.stringify(logData.coordinates, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
