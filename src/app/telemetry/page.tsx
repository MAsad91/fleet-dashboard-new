"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetObdTelemetryQuery, useListVehiclesQuery, useGetDriversQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Activity, Database, Filter, Download, RefreshCw, Car, AlertTriangle, Gauge, Battery, Thermometer, MapPin, Eye } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";

export default function TelemetryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [dateRange, setDateRange] = useState("today");
  const [tripFilter, setTripFilter] = useState("");
  const [tripIdFilter, setTripIdFilter] = useState("");
  const [minSpeed, setMinSpeed] = useState("");
  const [maxSpeed, setMaxSpeed] = useState("");
  const [minBattery, setMinBattery] = useState("");
  const [maxBattery, setMaxBattery] = useState("");
  const [minMotorTemp, setMinMotorTemp] = useState("");
  const [maxMotorTemp, setMaxMotorTemp] = useState("");
  const [minRange, setMinRange] = useState("");
  const [maxRange, setMaxRange] = useState("");
  const [hasErrorCodes, setHasErrorCodes] = useState("");
  const [showInsights, setShowInsights] = useState(false);
  const [selectedTelemetryId, setSelectedTelemetryId] = useState<number | null>(null);

  const { data: telemetryData, isLoading, error, refetch } = useGetObdTelemetryQuery({
    vehicle_id: vehicleFilter || undefined,
    device_id: undefined,
    date_range: undefined,
    start_date: undefined,
    end_date: undefined,
  });

  // Mock data since API hooks don't exist yet
  const aggregatedData = {
    record_count: 0,
    vehicle_count: 0,
    error_record_count: 0,
    averages: {
      speed_kph: 0,
      battery_percent: 0,
      motor_temp_c: 0,
      range_km: 0
    }
  };

  const topErrorsData = {
    top_error_codes: [],
    total_error_types: 0,
    vehicles_with_errors: 0
  };

  // Additional data for filters
  const { data: vehiclesData } = useListVehiclesQuery({ page: 1 });
  const { data: driversData } = useGetDriversQuery({ page: 1 });

  const telemetryRecords = telemetryData?.results || [];

  const filteredRecords = telemetryRecords.filter((record: any) => {
    const matchesSearch = record.vehicle?.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.device_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.trip?.toString().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export telemetry data');
  };

  const handleViewTelemetry = (telemetryId: number) => {
    // Navigate to telemetry detail page
    router.push(`/telemetry/${telemetryId}`);
  };

  const handleVehicleSnapshot = () => {
    if (vehicleFilter) {
      // Navigate to vehicle snapshot or open modal
      router.push(`/vehicles/${vehicleFilter}/telemetry`);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="text-center text-red-600">
          <p>Error loading telemetry data</p>
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
              <h1 className="text-3xl font-bold tracking-tight">Telemetry — Explorer</h1>
              <p className="text-muted-foreground">
                Real-time OBD device telemetry and performance data
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                label="Insights"
                variant="outlineDark"
                onClick={() => setShowInsights(!showInsights)}
                icon={<Activity className="h-4 w-4" />}
              />
              {vehicleFilter && (
                <Button
                  label="Vehicle Snapshot"
                  variant="primary"
                  onClick={handleVehicleSnapshot}
                  icon={<Car className="h-4 w-4" />}
                />
              )}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {aggregatedData?.record_count || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vehicles</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {aggregatedData?.vehicle_count || 0}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Error Records</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {aggregatedData?.error_record_count || 0}
                  </p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Speed (kph)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {aggregatedData?.averages?.speed_kph ? Math.round(aggregatedData.averages.speed_kph) : 0}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Gauge className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Battery (%)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {aggregatedData?.averages?.battery_percent ? Math.round(aggregatedData.averages.battery_percent) : 0}%
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Battery className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Motor Temp (°C)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {aggregatedData?.averages?.motor_temp_c ? Math.round(aggregatedData.averages.motor_temp_c) : 0}°C
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Thermometer className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Range (km)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {aggregatedData?.averages?.range_km ? Math.round(aggregatedData.averages.range_km) : 0} km
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Vehicle"
                items={[
                  { value: "", label: "All Vehicles" },
                  ...(vehiclesData?.results?.map((vehicle: any) => ({
                    value: vehicle.id.toString(),
                    label: `${vehicle.plate_number || vehicle.license_plate || 'N/A'} - ${vehicle.make || ''} ${vehicle.model || ''}`
                  })) || [])
                ]}
                defaultValue={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
              />
              
              <InputGroup
                type="text"
                label="Trip ID"
                placeholder="Search by trip ID..."
                value={tripIdFilter}
                handleChange={(e) => setTripIdFilter(e.target.value)}
                icon={<Activity className="h-4 w-4" />}
              />
              
              <InputGroup
                type="number"
                label="Min Speed (kph)"
                placeholder="0"
                value={minSpeed}
                handleChange={(e) => setMinSpeed(e.target.value)}
                icon={<Gauge className="h-4 w-4" />}
              />
              
              <InputGroup
                type="number"
                label="Max Speed (kph)"
                placeholder="200"
                value={maxSpeed}
                handleChange={(e) => setMaxSpeed(e.target.value)}
                icon={<Gauge className="h-4 w-4" />}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <InputGroup
                type="number"
                label="Min Battery (%)"
                placeholder="0"
                value={minBattery}
                handleChange={(e) => setMinBattery(e.target.value)}
                icon={<Battery className="h-4 w-4" />}
              />
              
              <InputGroup
                type="number"
                label="Max Battery (%)"
                placeholder="100"
                value={maxBattery}
                handleChange={(e) => setMaxBattery(e.target.value)}
                icon={<Battery className="h-4 w-4" />}
              />
              
              <InputGroup
                type="number"
                label="Min Motor Temp (°C)"
                placeholder="0"
                value={minMotorTemp}
                handleChange={(e) => setMinMotorTemp(e.target.value)}
                icon={<Thermometer className="h-4 w-4" />}
              />
              
              <InputGroup
                type="number"
                label="Max Motor Temp (°C)"
                placeholder="100"
                value={maxMotorTemp}
                handleChange={(e) => setMaxMotorTemp(e.target.value)}
                icon={<Thermometer className="h-4 w-4" />}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <InputGroup
                type="number"
                label="Min Range (km)"
                placeholder="0"
                value={minRange}
                handleChange={(e) => setMinRange(e.target.value)}
                icon={<MapPin className="h-4 w-4" />}
              />
              
              <InputGroup
                type="number"
                label="Max Range (km)"
                placeholder="500"
                value={maxRange}
                handleChange={(e) => setMaxRange(e.target.value)}
                icon={<MapPin className="h-4 w-4" />}
              />
              
              <Select
                label="Has Error Codes"
                items={[
                  { value: "", label: "All Records" },
                  { value: "true", label: "With Errors" },
                  { value: "false", label: "No Errors" },
                ]}
                defaultValue={hasErrorCodes}
                onChange={(e) => setHasErrorCodes(e.target.value)}
              />
              
              <div className="flex items-end">
                <Button
                  label="Clear Filters"
                  variant="outlineDark"
                  size="small"
                  onClick={() => {
                    setVehicleFilter("");
                    setTripIdFilter("");
                    setMinSpeed("");
                    setMaxSpeed("");
                    setMinBattery("");
                    setMaxBattery("");
                    setMinMotorTemp("");
                    setMaxMotorTemp("");
                    setMinRange("");
                    setMaxRange("");
                    setHasErrorCodes("");
                  }}
                />
              </div>
            </div>
          </div>

          {/* Telemetry Table */}
          <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
            <div className="p-6 border-b border-stroke dark:border-dark-3">
              <h3 className="text-lg font-semibold">Telemetry Data List</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredRecords.length} records found
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
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Speed (kph)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Battery %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Temp °C
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Range (km)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Errors
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRecords.map((record: any, index: number) => (
                    <tr key={record.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.timestamp ? new Date(record.timestamp).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.vehicle?.license_plate || record.vehicle?.vin || record.vehicle_id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.speed_kph || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.battery_level_percent ? `${record.battery_level_percent}%` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.motor_temp_c ? `${record.motor_temp_c}°C` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {(() => {
                          // Check all possible range field variations
                          const rangeFields = [
                            'range_km', 'estimated_range_km', 'range_estimate_km', 
                            'estimated_range', 'range_estimate', 'range',
                            'remaining_range_km', 'battery_range_km', 'range_remaining_km',
                            'estimated_range_remaining_km', 'battery_estimated_range_km'
                          ];
                          
                          for (const field of rangeFields) {
                            if (record[field] !== undefined && record[field] !== null && record[field] !== '') {
                              return `${record[field]} km`;
                            }
                          }
                          
                          // If no range data found, show a calculated estimate based on battery
                          if (record.battery_level_percent && record.battery_level_percent > 0) {
                            // Simple estimation: assume 4km per 1% battery (400km at 100%)
                            const estimatedRange = Math.round((record.battery_level_percent / 100) * 400);
                            return `~${estimatedRange} km`;
                          }
                          
                          return 'N/A';
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.error_codes && Array.isArray(record.error_codes) && record.error_codes.length > 0 
                          ? record.error_codes.join(', ')
                          : record.diagnostic_trouble_codes && Array.isArray(record.diagnostic_trouble_codes) && record.diagnostic_trouble_codes.length > 0
                          ? record.diagnostic_trouble_codes.join(', ')
                          : record.errors && Array.isArray(record.errors) && record.errors.length > 0
                          ? record.errors.join(', ')
                          : '—'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            label=""
                            variant="outlineDark"
                            size="small"
                            icon={<Eye className="h-4 w-4" />}
                            onClick={() => handleViewTelemetry(record.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRecords.length === 0 && (
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No telemetry data found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || vehicleFilter || deviceFilter
                    ? "Try adjusting your search criteria"
                    : "No telemetry data available for the selected time range"
                  }
                </p>
              </div>
            )}
          </div>

          {/* Insights Panel */}
          {showInsights && (
            <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
              <div className="p-6 border-b border-stroke dark:border-dark-3">
                <h3 className="text-lg font-semibold">Insights Panel</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Aggregated KPIs and Top Error Codes
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Aggregated KPIs */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Aggregated KPIs</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Record Count</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{aggregatedData?.record_count || 0}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle Count</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{aggregatedData?.vehicle_count || 0}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Error Record Count</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{aggregatedData?.error_record_count || 0}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Speed (kph)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {aggregatedData?.averages?.speed_kph ? Math.round(aggregatedData.averages.speed_kph) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Battery (%)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {aggregatedData?.averages?.battery_percent ? Math.round(aggregatedData.averages.battery_percent) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Motor Temp (°C)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {aggregatedData?.averages?.motor_temp_c ? Math.round(aggregatedData.averages.motor_temp_c) : 0}°C
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Range (km)</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {aggregatedData?.averages?.range_km ? Math.round(aggregatedData.averages.range_km) : 0} km
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Top Error Codes */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Error Codes</h4>
                    {topErrorsData?.top_error_codes && topErrorsData.top_error_codes.length > 0 ? (
                      <div className="space-y-3">
                        {topErrorsData.top_error_codes.map((error: any, index: number) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{error.code}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{error.count} occurrences</span>
                          </div>
                        ))}
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <div>Total Error Types: {topErrorsData.total_error_types || 0}</div>
                            <div>Vehicles with Errors: {topErrorsData.vehicles_with_errors || 0}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No error codes found for the current filters</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
