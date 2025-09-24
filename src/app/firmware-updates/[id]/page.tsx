"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetFirmwareUpdateByIdQuery, useGetFirmwareUpdateSummaryQuery, usePauseFirmwareUpdateMutation, useResumeFirmwareUpdateMutation } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Settings, Play, Pause, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";

export default function FirmwareUpdateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const firmwareId = params?.id as string;

  const { data: firmwareData, isLoading, error } = useGetFirmwareUpdateByIdQuery(firmwareId);
  const { data: summaryData } = useGetFirmwareUpdateSummaryQuery(firmwareId);
  const [pauseFirmwareUpdate] = usePauseFirmwareUpdateMutation();
  const [resumeFirmwareUpdate] = useResumeFirmwareUpdateMutation();

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator']}>
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
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator']}>
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
                  Error Loading Firmware Update
                </h1>
              </div>
            </div>
          </div>
          <div className="text-center text-red-600">
            <p>Failed to load firmware update details. Please try again.</p>
            <Button 
              onClick={() => router.back()} 
              variant="primary" 
              label="Back to Firmware Updates"
              className="mt-4"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!firmwareData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator']}>
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
                  Firmware Update Not Found
                </h1>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Extract the actual firmware data from the nested structure
  const firmware = (firmwareData as any)?.firmware_update || firmwareData;

  const handlePause = async () => {
    try {
      await pauseFirmwareUpdate({ id: firmwareId }).unwrap();
      alert('Firmware update paused successfully');
    } catch (error) {
      console.error('Failed to pause firmware update:', error);
      alert('Failed to pause firmware update');
    }
  };

  const handleResume = async () => {
    try {
      await resumeFirmwareUpdate({ id: firmwareId }).unwrap();
      alert('Firmware update resumed successfully');
    } catch (error) {
      console.error('Failed to resume firmware update:', error);
      alert('Failed to resume firmware update');
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    switch (status) {
      case "paused":
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case "rolling_out":
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
    }
  };

  const getInstallStatusBadge = (status: string) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    switch (status) {
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case "in_progress":
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      case "success":
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case "failed":
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
    }
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator']}>
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

        {/* Header with Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Firmware Update — Detail (#{firmware.id})
            </h1>
          </div>
          <div className="flex space-x-2">
            {firmware.status === 'rolling_out' ? (
              <Button
                label="Pause"
                variant="outlineDark"
                icon={<Pause className="h-4 w-4" />}
                onClick={handlePause}
              />
            ) : firmware.status === 'paused' ? (
              <Button
                label="Resume"
                variant="primary"
                icon={<Play className="h-4 w-4" />}
                onClick={handleResume}
              />
            ) : null}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Targets</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {firmware.target_count || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {firmware.success_count || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failure</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {firmware.failure_count || 0}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {getStatusBadge(firmware.status)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Component</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {firmware.component || 'N/A'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Version</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {firmware.version || 'N/A'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {firmware.priority || 'N/A'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Release</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {firmware.release_date 
                  ? new Date(firmware.release_date).toLocaleDateString()
                  : 'N/A'
                }
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">File</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {firmware.file ? `${firmware.file.name || 'file'} (${(firmware.file_size / 1024 / 1024).toFixed(1)} MB)` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Installs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Installs (per vehicle)</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Attempt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Error
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {firmware.installs?.map((install: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Settings className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {install.vehicle?.license_plate || `Vehicle ${install.vehicle?.id || 'N/A'}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getInstallStatusBadge(install.status)}>
                        {install.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {install.attempts || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {install.last_attempt_date 
                        ? new Date(install.last_attempt_date).toLocaleString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {install.error_message || '—'}
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No install records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
