"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useListFirmwareUpdatesQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Plus, Eye, Download, RefreshCw, Upload, Settings, AlertCircle } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";

export default function FirmwareUpdatesPage() {
  const router = useRouter();
  const [componentFilter, setComponentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [versionSearch, setVersionSearch] = useState("");

  const { data: firmwareData, isLoading, error } = useListFirmwareUpdatesQuery({ page: 1 });

  const firmwareUpdates = firmwareData?.results || [];

  const filteredFirmware = firmwareUpdates.filter((fw: any) => {
    const matchesComponent = !componentFilter || fw.component === componentFilter;
    const matchesStatus = !statusFilter || fw.status === statusFilter;
    const matchesVersion = !versionSearch || fw.version.toLowerCase().includes(versionSearch.toLowerCase());
    return matchesComponent && matchesStatus && matchesVersion;
  });

  const handleRefresh = () => {
    console.log("Refreshing firmware updates...");
  };

  const handleUpload = () => {
    console.log("Uploading new firmware...");
  };

  const handleDownload = (firmwareId: number) => {
    console.log("Downloading firmware", firmwareId);
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

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Firmware Updates</h1>
            <p className="text-muted-foreground">
              Manage device firmware versions and updates
            </p>
          </div>
          <Button
            label="Add Update"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => router.push('/firmware-updates/add')}
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Component"
              items={[
                { value: "", label: "All Components" },
                { value: "obd", label: "OBD" },
                { value: "dashcam", label: "Dashcam" },
                { value: "other", label: "Other" },
              ]}
              defaultValue={componentFilter}
              onChange={(e) => setComponentFilter(e.target.value)}
            />
            <Select
              label="Status"
              items={[
                { value: "", label: "All Status" },
                { value: "paused", label: "Paused" },
                { value: "rolling_out", label: "Rolling Out" },
                { value: "completed", label: "Completed" },
              ]}
              defaultValue={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <InputGroup
              type="text"
              label="Version search"
              placeholder="Search by version..."
              value={versionSearch}
              handleChange={(e) => setVersionSearch(e.target.value)}
              icon={<Settings className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Firmware Updates Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
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
            <div className="p-6 text-center text-red-600">
              Error loading firmware updates
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: '1200px' }}>
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Component
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Targets
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Success/Fail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Release Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredFirmware.map((fw: any) => (
                  <tr key={fw.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Settings className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {fw.version}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span className="capitalize">{fw.component || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(fw.status)}>
                        {fw.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {fw.target_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 font-medium">{fw.success_count || 0}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-red-600 font-medium">{fw.failure_count || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {fw.release_date 
                        ? new Date(fw.release_date).toLocaleDateString()
                        : 'N/A'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => router.push(`/firmware-updates/${fw.id}`)}
                          variant="outlineDark"
                          label=""
                          icon={<Eye className="h-4 w-4" />}
                          size="small"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
