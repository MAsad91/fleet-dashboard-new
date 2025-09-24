"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetDriverByIdQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, User, Phone, Mail, Calendar, Car, MapPin, Clock } from "lucide-react";

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
      <div className="p-6">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Button 
            onClick={() => router.back()} 
            variant="outlineDark"
            label="Back"
            icon={<ArrowLeft className="h-4 w-4" />}
            className="px-4 py-2 rounded-lg"
          />
        </div>

        {/* Driver Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name</span>
                <span className="font-semibold text-gray-900 dark:text-white text-lg">{driverData.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</span>
                <span className="font-semibold text-gray-900 dark:text-white">{driverData.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone</span>
                <span className="font-semibold text-gray-900 dark:text-white">{driverData.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {getStatusBadge(driverData.status)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date of Birth</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {driverData.date_of_birth ? new Date(driverData.date_of_birth).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Address</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {driverData.address || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* License Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">License Information</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">License Number</span>
                <span className="font-semibold text-gray-900 dark:text-white font-mono text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                  {driverData.license_number || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">License Class</span>
                <span className="font-semibold text-gray-900 dark:text-white">{driverData.license_class || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">License Status</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {getLicenseStatusBadge(driverData.license_status)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">License Expiry</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {driverData.license_expiry_date ? new Date(driverData.license_expiry_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Issuing Authority</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {driverData.issuing_authority || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Information Card */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Employment Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Employee ID</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {driverData.employee_id || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Department</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {driverData.department || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Position</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {driverData.position || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Hire Date</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {driverData.hire_date ? new Date(driverData.hire_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Emergency Contact</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {driverData.emergency_contact_name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Emergency Phone</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {driverData.emergency_contact_phone || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created At</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {driverData.created_at ? new Date(driverData.created_at).toLocaleString() : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Updated At</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {driverData.updated_at ? new Date(driverData.updated_at).toLocaleString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
