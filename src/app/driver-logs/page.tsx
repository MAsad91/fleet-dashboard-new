"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Plus, Eye, Download, RefreshCw, Calendar, User, Clock, Activity, AlertTriangle, ArrowLeft, MapPin } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { useGetDriversQuery } from "@/store/api/fleetApi";

export default function DriverLogsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [dateRange, setDateRange] = useState("7days");
  const [hasCoordinatesFilter, setHasCoordinatesFilter] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  // TODO: Implement real API hook when available
  // const { data: logsData, isLoading, error } = useGetDriverLogsQuery(filters);
  const logsData: any = null;
  const isLoading = false;
  const error = null;

  const logs = logsData?.results || [];

  const filteredLogs = logs.filter((log: any) => {
    // Trip ID search
    const matchesSearch = searchTerm
      ? log.trip?.toString().includes(searchTerm) ||
        log.event_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.trip?.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    // Driver filter
    const matchesDriver = driverFilter ? log.trip?.driver?.id?.toString() === driverFilter : true;
    
    // Has coordinates filter
    const hasCoordinates = log.coordinates?.coordinates && log.coordinates.coordinates.length >= 2;
    const matchesCoordinates = hasCoordinatesFilter === "" 
      ? true 
      : hasCoordinatesFilter === "true" 
        ? hasCoordinates 
        : !hasCoordinates;
    
    return matchesSearch && matchesDriver && matchesCoordinates;
  });

  const handleOpenTrip = (tripId: number) => {
    router.push(`/trips/${tripId}`);
  };

  const handleRefresh = () => {
    // TODO: Implement refresh functionality
    console.log("Refreshing driver logs...");
  };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      // Prepare CSV data
      const csvHeaders = [
        "ID",
        "Trip ID", 
        "Driver",
        "Timestamp",
        "Speed (kph)",
        "Heading (°)",
        "Latitude",
        "Longitude",
        "Event Type"
      ];
      
      const csvData = (filteredLogs as any[]).map(log => [
        log.id,
        log.trip,
        log.driver,
        log.timestamp,
        log.speed_kph || "",
        log.heading || "",
        log.latitude || "",
        log.longitude || "",
        log.event_type
      ]);
      
      // Create CSV content
      const csvContent = [
        csvHeaders.join(","),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");
      
      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `driver-logs-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log("CSV export completed successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
    } finally {
      setIsExporting(false);
    }
  };


  // Show loading state for list view
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

  // Show error state for list view
  if (error) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading driver logs</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="primary" 
              label="Retry"
              className="mt-4"
            />
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
              <h1 className="text-3xl font-bold tracking-tight">Driver Logs</h1>
            </div>
            <Button
              label={isExporting ? "Exporting..." : "Export CSV"}
              variant="primary"
              icon={<Download className="h-4 w-4" />}
              onClick={handleDownload}
              className={isExporting ? 'opacity-50 cursor-not-allowed' : ''}
            />
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Logs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(filteredLogs as any[]).length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Trips</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set((filteredLogs as any[]).map(log => log.trip)).size}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <User className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Speed (kph)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(filteredLogs as any[]).length > 0 ? Math.round((filteredLogs as any[]).reduce((sum, log) => sum + (log.speed_kph || 0), 0) / (filteredLogs as any[]).length) : 0}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trip ID
              </label>
              <input
                type="text"
                placeholder="Search by trip ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Driver
              </label>
              <select
                value={driverFilter}
                onChange={(e) => setDriverFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Drivers</option>
                <option value="John Doe">John Doe</option>
                <option value="Jane Smith">Jane Smith</option>
                <option value="Mike Johnson">Mike Johnson</option>
                <option value="Sarah Wilson">Sarah Wilson</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Has Coordinates
              </label>
              <select
                value={hasCoordinatesFilter}
                onChange={(e) => setHasCoordinatesFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              label="Apply"
              variant="primary"
              size="small"
              onClick={() => {}} // Filters are applied automatically
            />
          </div>
        </div>

        {/* Driver Logs Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-6 border-b border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold">Driver Logs List</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {(filteredLogs as any[]).length} logs found
            </p>
          </div>
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Speed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Heading
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Latitude
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Longitude
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {(filteredLogs as any[]).map((log: any) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150"
                    onClick={(e) => {
                      // Don't navigate if clicking on action buttons
                      const target = e.target as HTMLElement;
                      const isButton = target.closest('button');
                      
                      if (!isButton) {
                        router.push(`/driver-logs/${log.id}`);
                      }
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="font-medium">{log.trip}</div>
                          <div className="text-xs text-gray-500">
                            {log.trip?.driver?.name || log.trip?.driver?.full_name || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.speed_kph || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.heading || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.coordinates?.coordinates?.[1] || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.coordinates?.coordinates?.[0] || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {log.event_type || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          label="View"
                          variant="outlineDark"
                          size="small"
                          icon={<Eye className="h-4 w-4" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/driver-logs/${log.id}`);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(filteredLogs as any[]).length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No driver logs found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || driverFilter
                  ? "Try adjusting your search criteria"
                  : "No driver activities recorded for the selected period"
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Page 1/1
          </div>
        </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
