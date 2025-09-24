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
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);

  // Mock data since API hooks don't exist yet
  const logsData = { results: [] };
  const logDetail = null;
  const isLoading = false;
  const error = null;
  const logDetailLoading = false;

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

  const handleViewLog = (logId: number) => {
    setSelectedLogId(logId);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedLogId(null);
  };

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

  // Show loading state when switching to detail view
  if (currentView === 'detail' && selectedLogId && !logDetail && logDetailLoading) {
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
                  Loading Driver Log...
                </h1>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show error state when API fails
  if (currentView === 'detail' && selectedLogId && error) {
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
                  Error Loading Driver Log
                </h1>
              </div>
            </div>
          </div>
          <div className="text-center text-red-600">
            <p>Failed to load driver log details. Please try again.</p>
            <Button 
              onClick={handleBackToList} 
              variant="primary" 
              label="Back to Driver Logs"
              className="mt-4"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Render detail view
  if (currentView === 'detail' && logDetail) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
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
                    Driver Log — Detail (#{(logDetail as any)?.id})
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Trip #{(logDetail as any)?.trip} • {new Date((logDetail as any)?.timestamp || Date.now()).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  label="Open Trip"
                  variant="primary"
                  icon={<User className="h-4 w-4" />}
                  onClick={() => handleOpenTrip((logDetail as any)?.trip)}
                />
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Speed (kph)</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {(logDetail as any)?.speed_kph || 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Heading (deg)</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {(logDetail as any)?.heading || 'N/A'}°
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Event Type</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {(logDetail as any)?.event_type || '—'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Timestamp & Location */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timestamp & Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Timestamp</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Date((logDetail as any)?.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Trip ID</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{(logDetail as any)?.trip}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Coordinates</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(logDetail as any)?.coordinates?.coordinates ? 
                      `${(logDetail as any)?.coordinates.coordinates[1]}, ${(logDetail as any)?.coordinates.coordinates[0]}` : 
                      'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Location</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(logDetail as any)?.coordinates?.coordinates ? 
                      `${(logDetail as any)?.coordinates.coordinates[1]?.toFixed(6)}, ${(logDetail as any)?.coordinates.coordinates[0]?.toFixed(6)}` : 
                      'No coordinates'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fields — API Accurate */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fields — API Accurate</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">ID</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{(logDetail as any)?.id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Trip</span>
                  <Button
                    label={`Trip #${(logDetail as any)?.trip}`}
                    variant="primary"
                    size="small"
                    onClick={() => handleOpenTrip((logDetail as any)?.trip)}
                  />
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Timestamp</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Date((logDetail as any)?.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Speed (kph)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{(logDetail as any)?.speed_kph || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Heading</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{(logDetail as any)?.heading || 'N/A'}°</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Event Type</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{(logDetail as any)?.event_type || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Coordinates (GeoJSON)</h4>
              <pre className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                {JSON.stringify((logDetail as any)?.coordinates, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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
              <p className="text-muted-foreground">
                Track driver activities and system interactions
              </p>
            </div>
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            <Button
              label={isExporting ? "Exporting..." : "Export CSV"}
              variant="primary"
              size="small"
              icon={<Download className="h-4 w-4" />}
              onClick={handleDownload}
              className={isExporting ? 'opacity-50 cursor-not-allowed' : ''}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputGroup
              type="text"
              label="Trip ID"
              placeholder="Search by trip ID..."
              value={searchTerm}
              handleChange={(e) => setSearchTerm(e.target.value)}
              icon={<User className="h-4 w-4" />}
            />
            <Select
              label="Driver"
              items={[
                { value: "", label: "All Drivers" },
                { value: "John Doe", label: "John Doe" },
                { value: "Jane Smith", label: "Jane Smith" },
                { value: "Mike Johnson", label: "Mike Johnson" },
                { value: "Sarah Wilson", label: "Sarah Wilson" },
              ]}
              defaultValue={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
            />
            <Select
              label="Time Range"
              items={[
                { value: "today", label: "Today" },
                { value: "7days", label: "Last 7 Days" },
                { value: "30days", label: "Last 30 Days" },
                { value: "90days", label: "Last 90 Days" },
              ]}
              defaultValue={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            />
            <Select
              label="Has Coordinates"
              items={[
                { value: "", label: "All" },
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
              ]}
              defaultValue={hasCoordinatesFilter}
              onChange={(e) => setHasCoordinatesFilter(e.target.value)}
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button
              label="Clear Filters"
              variant="outlineDark"
              size="small"
              onClick={() => {
                setSearchTerm("");
                setDriverFilter("");
                setDateRange("7days");
                setHasCoordinatesFilter("");
              }}
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
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
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
                      {log.speed_kph || "—"} kph
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.heading || "—"}°
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
                          label=""
                          variant="outlineDark"
                          size="small"
                          icon={<Eye className="h-4 w-4" />}
                          onClick={() => handleViewLog(log.id)}
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

        {/* Pagination */}
        <div className="bg-white dark:bg-gray-900 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                disabled
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
              >
                Previous
              </button>
              <button
                disabled
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{(filteredLogs as any[]).length}</span> of{' '}
                  <span className="font-medium">{(filteredLogs as any[]).length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    disabled
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    disabled
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
