"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, AlertTriangle, AlertCircle, Clock, Calendar, Check, X, Car, User, Eye } from "lucide-react";

export default function AlertDetailPage() {
  const router = useRouter();
  const params = useParams();
  const alertId = params.id as string;

  // Mock data since API hooks don't exist yet
  const alertData = {
    id: parseInt(alertId),
    alert_type: "vehicle_health",
    system: "motor",
    vehicle: 123,
    driver: 456,
    title: "High Motor Temperature",
    message: "Vehicle motor temperature has exceeded safe operating limits. Immediate attention required.",
    severity: "high",
    created_at: new Date().toISOString(),
    status_label: "New",
    status: "active",
    read: false,
    ignored: false,
    resolved: false,
    resolved_at: null,
    vehicle_info: {
      license_plate: "EV-9012",
      make: "Tesla",
      model: "Model 3"
    },
    device_id: "DEV-456"
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

  if (error || !alertData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="text-center text-red-600">
          <p>Failed to load alert details. Please try again.</p>
          <Button 
            onClick={() => router.back()} 
            variant="primary" 
            label="Back to Alerts"
            className="mt-4"
          />
        </div>
      </ProtectedRoute>
    );
  }

  const handleAcknowledge = () => {
    console.log('Acknowledging alert:', alertData.id);
    // TODO: Implement acknowledge API call
  };

  const handleIgnore = () => {
    console.log('Ignoring alert:', alertData.id);
    // TODO: Implement ignore API call
  };

  const handleResolve = () => {
    console.log('Resolving alert:', alertData.id);
    // TODO: Implement resolve API call
  };

  const handleViewVehicle = () => {
    router.push(`/vehicles/${alertData.vehicle}`);
  };

  const handleViewOBDDevice = () => {
    router.push(`/obd-devices/${alertData.device_id}`);
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { className: "bg-gray-100 text-gray-800", label: "Low" },
      medium: { className: "bg-yellow-100 text-yellow-800", label: "Medium" },
      high: { className: "bg-orange-100 text-orange-800", label: "High" },
      critical: { className: "bg-red-100 text-red-800", label: "Critical" },
    };
    
    const config = severityConfig[severity as keyof typeof severityConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      label: severity
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { className: "bg-red-100 text-red-800", label: "Active" },
      acknowledged: { className: "bg-yellow-100 text-yellow-800", label: "Acknowledged" },
      ignored: { className: "bg-gray-100 text-gray-800", label: "Ignored" },
      resolved: { className: "bg-green-100 text-green-800", label: "Resolved" },
      new: { className: "bg-blue-100 text-blue-800", label: "New" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      label: status 
    };
    
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
          <div className="bg-gradient-to-r from-red-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-lg border border-red-200 dark:border-gray-600 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 dark:bg-gray-600 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-200 dark:bg-gray-600 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                {/* Left Side - Alert Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Alert — Detail
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        Type: {alertData.alert_type} • Severity: {alertData.severity} • Status: {alertData.status_label} • System: {alertData.system}
                      </p>
                    </div>
                  </div>

                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Severity</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getSeverityBadge(alertData.severity)}
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getStatusBadge(alertData.status_label)}
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(alertData.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Action Buttons */}
                <div className="flex flex-col space-y-2 ml-6">
                  <div className="flex space-x-2">
                    {alertData.status === 'active' || alertData.status === 'new' ? (
                      <Button
                        label="Acknowledge"
                        variant="outlineDark"
                        size="small"
                        icon={<Check className="h-3 w-3" />}
                        onClick={handleAcknowledge}
                        className="px-3 py-2 text-xs"
                      />
                    ) : null}
                    {alertData.status === 'active' || alertData.status === 'new' || alertData.status === 'acknowledged' ? (
                      <Button
                        label="Ignore"
                        variant="outlineDark"
                        size="small"
                        icon={<X className="h-3 w-3" />}
                        onClick={handleIgnore}
                        className="px-3 py-2 text-xs"
                      />
                    ) : null}
                    {alertData.status === 'acknowledged' ? (
                      <Button
                        label="Resolve"
                        variant="primary"
                        size="small"
                        icon={<Check className="h-3 w-3" />}
                        onClick={handleResolve}
                        className="px-3 py-2 text-xs"
                      />
                    ) : null}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Severity</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getSeverityBadge(alertData.severity)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getStatusBadge(alertData.status_label)}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Created At</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {alertData.created_at ? new Date(alertData.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {alertData.resolved_at ? new Date(alertData.resolved_at).toLocaleDateString() : '—'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Check className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary (Left) */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">title:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{alertData.title}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">message:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{alertData.message}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">created_at:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{new Date(alertData.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">status_label:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{getStatusBadge(alertData.status_label)}</span>
              </div>
            </div>
          </div>

          {/* Context (Right) */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Context</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">vehicle_info (plate/make):</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {alertData.vehicle_info ? `${alertData.vehicle_info.license_plate} - ${alertData.vehicle_info.make} ${alertData.vehicle_info.model}` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">device_id (if any):</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{alertData.device_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">driver (if any):</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{alertData.driver ? `Driver #${alertData.driver}` : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Actions:</span>
                <div className="flex space-x-2">
                  <Button
                    label="View Vehicle"
                    variant="outlineDark"
                    size="small"
                    icon={<Car className="h-3 w-3" />}
                    onClick={handleViewVehicle}
                    className="px-2 py-1 text-xs"
                  />
                  <Button
                    label="View OBD Device"
                    variant="outlineDark"
                    size="small"
                    icon={<Eye className="h-3 w-3" />}
                    onClick={handleViewOBDDevice}
                    className="px-2 py-1 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}