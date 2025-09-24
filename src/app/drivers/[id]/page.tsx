"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetDriverByIdQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, User, Phone, Mail, Calendar, Car, MapPin, Clock, Edit, Trash2, AlertTriangle } from "lucide-react";

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = params.id as string;

  const { data: driverData, isLoading, error } = useGetDriverByIdQuery(driverId);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { className: "bg-green-100 text-green-800", label: "Active" },
      inactive: { className: "bg-red-100 text-red-800", label: "Inactive" },
      suspended: { className: "bg-yellow-100 text-yellow-800", label: "Suspended" },
      terminated: { className: "bg-gray-100 text-gray-800", label: "Terminated" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      label: status || "Unknown"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getLicenseStatusBadge = (status: string) => {
    const statusConfig = {
      valid: { className: "bg-green-100 text-green-800", label: "Valid" },
      expired: { className: "bg-red-100 text-red-800", label: "Expired" },
      suspended: { className: "bg-yellow-100 text-yellow-800", label: "Suspended" },
      revoked: { className: "bg-gray-100 text-gray-800", label: "Revoked" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      label: status || "Unknown"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => router.back()} 
                variant="outlineDark"
                label="Back"
                icon={<ArrowLeft className="h-4 w-4" />}
                className="px-4 py-2 rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Loading Driver...
                </h1>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => router.back()} 
                variant="outlineDark"
                label="Back"
                icon={<ArrowLeft className="h-4 w-4" />}
                className="px-4 py-2 rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Error Loading Driver
                </h1>
              </div>
            </div>
          </div>
          <div className="text-center text-red-600">
            <p>Failed to load driver details. Please try again.</p>
            <Button 
              onClick={() => router.back()} 
              variant="primary" 
              label="Back to Drivers"
              className="mt-4"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!driverData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => router.back()} 
                variant="outlineDark"
                label="Back"
                icon={<ArrowLeft className="h-4 w-4" />}
                className="px-4 py-2 rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Driver Not Found
                </h1>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
                {/* Left Side - Driver Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Driver — Detail
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {driverData.name || 'Driver'} ({driverData.username || 'N/A'})
                      </p>
                    </div>
                  </div>

                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {driverData.phone_number || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">License</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {driverData.license_number || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${driverData.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {driverData.status || 'N/A'}
                        </span>
                        <span className={`inline-flex items-center text-xs ${driverData.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                          {driverData.status === 'active' ? '● Active' : '● Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Action Buttons */}
                <div className="flex flex-col space-y-2 ml-6">
                  <div className="flex space-x-2">
                    <Button
                      label="Edit"
                      variant="outlineDark"
                      size="small"
                      icon={<Edit className="h-3 w-3" />}
                      onClick={() => router.push(`/drivers/${driverData.id}/edit`)}
                      className="px-3 py-2 text-xs"
                    />
                    <Button
                      label="Suspend"
                      variant="outlineDark"
                      size="small"
                      icon={<AlertTriangle className="h-3 w-3" />}
                      onClick={() => {}} // TODO: Add suspend functionality
                      className="px-3 py-2 text-xs text-yellow-600 hover:text-yellow-700"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      label="Delete"
                      variant="outlineDark"
                      size="small"
                      icon={<Trash2 className="h-3 w-3" />}
                      onClick={() => {}} // TODO: Add delete functionality
                      className="px-3 py-2 text-xs text-red-600 hover:text-red-700"
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {driverData.rating ? driverData.rating.toFixed(1) : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <User className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Experience (y)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {driverData.experience_years || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Trips (completed, 30d)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {/* TODO: This would need to be fetched from trips API */}
                  0
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Car className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Profile</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">• Fleet Operator:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {driverData.fleet_operator?.name || 'N/A'} ({driverData.fleet_operator?.id || 'N/A'})
                </span>
                <Button
                  label="View Operator"
                  variant="outlineDark"
                  size="small"
                  onClick={() => router.push(`/fleet-operators/${driverData.fleet_operator?.id}`)}
                  className="px-2 py-1 text-xs"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">• Name (username) | Email:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {driverData.name || 'N/A'} ({driverData.username || 'N/A'}) | {driverData.email || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">• Phone | License | Status | Rating | Experience (years):</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {driverData.phone_number || 'N/A'} | {driverData.license_number || 'N/A'} | {driverData.status || 'N/A'} | {driverData.rating ? driverData.rating.toFixed(1) : 'N/A'} | {driverData.experience_years || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">• Address | Date of Birth | Emergency Contact:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {driverData.address || 'N/A'} | {driverData.date_of_birth ? new Date(driverData.date_of_birth).toLocaleDateString() : 'N/A'} | {driverData.emergency_contact || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">• Joined:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {driverData.date_joined ? new Date(driverData.date_joined).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Documents</h3>
          <div className="flex space-x-4">
            <Button
              label="View Driver Documents"
              variant="outlineDark"
              onClick={() => router.push('/driver-documents')}
              className="px-4 py-2"
            />
            <Button
              label="Upload Document"
              variant="primary"
              onClick={() => router.push('/driver-documents/add')}
              className="px-4 py-2"
            />
          </div>
        </div>

        {/* Trips Section */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Trips</h3>
          <div className="flex flex-col space-y-4">
            <Button
              label="View Trips"
              variant="outlineDark"
              onClick={() => router.push(`/trips?driver=${driverData.id}`)}
              className="px-4 py-2 w-fit"
            />
            <div className="flex space-x-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Filter chips:</span>
              <div className="flex space-x-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">all</span>
                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-xs">in_progress</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Alerts</h3>
          <div className="flex space-x-4">
            <Button
              label="Open Alerts"
              variant="outlineDark"
              onClick={() => router.push(`/alerts?driver=${driverData.id}`)}
              className="px-4 py-2"
            />
          </div>
        </div>

        {/* Performance Section (Admin only) */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Performance (Admin)</h3>
          <div className="flex space-x-4">
            <Button
              label="Open Driver Performance"
              variant="outlineDark"
              onClick={() => router.push(`/driver-performance?driver=${driverData.id}`)}
              className="px-4 py-2"
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
