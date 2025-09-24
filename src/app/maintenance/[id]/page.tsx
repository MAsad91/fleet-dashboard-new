"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetMaintenanceRecordByIdQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Wrench, Calendar, Clock, DollarSign, User, Car, AlertTriangle, CheckCircle, Play, Square, X, FileText } from "lucide-react";

export default function MaintenanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const maintenanceId = params?.id as string;

  const { data: maintenanceData, isLoading, error } = useGetMaintenanceRecordByIdQuery(maintenanceId);

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
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
                  Error Loading Maintenance
                </h1>
              </div>
            </div>
          </div>
          <div className="text-center text-red-600">
            <p>Failed to load maintenance details. Please try again.</p>
            <Button 
              onClick={() => router.back()} 
              variant="primary" 
              label="Back to Maintenance"
              className="mt-4"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!maintenanceData) {
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
                  Maintenance Not Found
                </h1>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Extract the actual maintenance data from the nested structure
  const maintenance = (maintenanceData as any)?.maintenance_record || maintenanceData;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { className: "bg-gray-100 text-gray-800", label: "Scheduled" },
      in_progress: { className: "bg-yellow-100 text-yellow-800", label: "In Progress" },
      completed: { className: "bg-green-100 text-green-800", label: "Completed" },
      cancelled: { className: "bg-red-100 text-red-800", label: "Cancelled" },
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

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { className: "bg-gray-100 text-gray-800", label: "Low" },
      medium: { className: "bg-yellow-100 text-yellow-800", label: "Medium" },
      high: { className: "bg-orange-100 text-orange-800", label: "High" },
      critical: { className: "bg-red-100 text-red-800", label: "Critical" },
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      label: priority || "Unknown"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

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

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Maintenance — Detail (#{maintenance.id})
              </h1>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Title: {maintenance.title || 'N/A'}</span>
                <span>Type: {maintenance.maintenance_type || 'N/A'}</span>
                <span>Status: {getStatusBadge(maintenance.status)}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                label="Schedule"
                variant="outlineDark"
                icon={<Calendar className="h-4 w-4" />}
                onClick={() => {
                  // TODO: Implement schedule functionality
                  alert('Schedule functionality coming soon');
                }}
                className={maintenance.status !== 'scheduled' ? 'opacity-50 cursor-not-allowed' : ''}
              />
              <Button
                label="Start"
                variant="primary"
                icon={<Play className="h-4 w-4" />}
                onClick={() => {
                  // TODO: Implement start functionality
                  alert('Start functionality coming soon');
                }}
                className={maintenance.status !== 'scheduled' ? 'opacity-50 cursor-not-allowed' : ''}
              />
              <Button
                label="Complete"
                variant="outlineDark"
                icon={<CheckCircle className="h-4 w-4" />}
                onClick={() => {
                  // TODO: Implement complete functionality
                  alert('Complete functionality coming soon');
                }}
                className={maintenance.status !== 'in_progress' ? 'opacity-50 cursor-not-allowed' : ''}
              />
              <Button
                label="Cancel"
                variant="outlineDark"
                icon={<X className="h-4 w-4" />}
                onClick={() => {
                  // TODO: Implement cancel functionality
                  alert('Cancel functionality coming soon');
                }}
                className={maintenance.status === 'completed' || maintenance.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}
              />
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {getStatusBadge(maintenance.status)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled Time</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {maintenance.scheduled_date 
                    ? new Date(maintenance.scheduled_date).toLocaleString()
                    : 'Not Set'
                  }
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estimated Duration (h)</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {maintenance.estimated_duration_hours || 'Not Set'}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cost</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {maintenance.cost ? `$${maintenance.cost}` : 'Not Set'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Record (Left) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Record</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">vehicle</span>
                <span className="font-semibold text-gray-900 dark:text-white">{maintenance.vehicle || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">maintenance_type</span>
                <span className="font-semibold text-gray-900 dark:text-white">{maintenance.maintenance_type || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">title</span>
                <span className="font-semibold text-gray-900 dark:text-white">{maintenance.title || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">description</span>
                <span className="font-semibold text-gray-900 dark:text-white">{maintenance.description || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">scheduled_date</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {maintenance.scheduled_date 
                    ? new Date(maintenance.scheduled_date).toLocaleString()
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">start_date</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {maintenance.start_date 
                    ? new Date(maintenance.start_date).toLocaleString()
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">end_date</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {maintenance.end_date 
                    ? new Date(maintenance.end_date).toLocaleString()
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">priority</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {getPriorityBadge(maintenance.priority)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">work_order_number</span>
                <span className="font-semibold text-gray-900 dark:text-white">{maintenance.work_order_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">location</span>
                <span className="font-semibold text-gray-900 dark:text-white">{maintenance.location || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">estimated_duration_hours</span>
                <span className="font-semibold text-gray-900 dark:text-white">{maintenance.estimated_duration_hours || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">cost</span>
                <span className="font-semibold text-gray-900 dark:text-white">{maintenance.cost ? `$${maintenance.cost}` : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">technician</span>
                <span className="font-semibold text-gray-900 dark:text-white">{maintenance.technician || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">parts_used</span>
                <span className="font-semibold text-gray-900 dark:text-white">{maintenance.parts_used || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">alerts_enabled</span>
                <span className="font-semibold text-gray-900 dark:text-white">{maintenance.alerts_enabled ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Vehicle (Right) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Vehicle</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Vehicle Info</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{maintenance.vehicle || 'N/A'}</span>
                  {maintenance.vehicle && (
                    <Button
                      label="Open Vehicle"
                      variant="outlineDark"
                      size="small"
                      onClick={() => router.push(`/vehicles/${maintenance.vehicle}`)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Work Order Section */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Work Order</h3>
            <div className="flex items-center space-x-4">
              <Button
                label="Open HTML"
                variant="primary"
                icon={<FileText className="h-4 w-4" />}
                onClick={() => {
                  // TODO: Implement work order PDF generation
                  alert('Work Order HTML functionality coming soon');
                }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                → GET /api/fleet/maintenance-records/{maintenance.id}/work_order_pdf/
              </span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}