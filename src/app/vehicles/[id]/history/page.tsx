"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetVehicleByIdQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Calendar, TrendingUp, AlertTriangle, Car, Fuel, Battery, Gauge, Thermometer, Zap, MapPin, Activity } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function VehicleHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;
  
  const { data: vehicleData, isLoading, error } = useGetVehicleByIdQuery(vehicleId);
  
  // Local state for filters and data
  const [dateRange, setDateRange] = useState("30d");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [historyData, setHistoryData] = useState<any>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // TODO: Implement real API call when available
  // const { data: historyData, isLoading: isLoadingHistory } = useGetVehicleHistoryQuery({ vehicleId, dateRange, startDate, endDate });
  const mockHistoryData = null;

  useEffect(() => {
    // TODO: Implement real API call when available
    // For now, set loading to false and data to null
    setIsLoadingHistory(false);
    setHistoryData(null);
  }, [dateRange, startDate, endDate]);

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    // Reset custom dates when selecting predefined range
    if (range !== "custom") {
      setStartDate("");
      setEndDate("");
    }
  };

  const handleApplyFilters = () => {
    // TODO: Implement real API call when available
    // For now, just set loading to false
    setIsLoadingHistory(false);
    setHistoryData(null);
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !vehicleData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="text-center text-red-600">
            <p>Failed to load vehicle details. Please try again.</p>
            <Button 
              onClick={() => router.back()} 
              variant="primary" 
              label="Back to Vehicles"
              className="mt-4"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const vehicle = vehicleData.vehicle || vehicleData;

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="space-y-6">
        {/* HEADER: Vehicle — History (VIN: …) [Back] */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Vehicle — History (VIN: {vehicle.vin || 'N/A'})
            </h1>
          </div>
          <Button
            onClick={() => router.back()}
            variant="outlineDark"
            label="Back"
            icon={<ArrowLeft className="h-4 w-4" />}
          />
        </div>

        {/* FILTERS: [Range ▾ today|10d|30d|90d] [Start] [End] (Apply) */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Range:</label>
              <select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="today">Today</option>
                <option value="10d">10d</option>
                <option value="30d">30d</option>
                <option value="90d">90d</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {dateRange === "custom" && (
              <>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            )}

            <Button
              label="Apply"
              variant="primary"
              onClick={handleApplyFilters}
              className="ml-4"
            />
          </div>
          
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Notes: Only admins can view any vehicle; others scoped to their operator.
          </div>
        </div>

        {/* KPI CARDS */}
        {historyData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Max Speed (kph)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {historyData.max_speed_kph}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Gauge className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Battery %</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {historyData.avg_battery_level.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Battery className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Range (km)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {historyData.avg_range_km}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Error Records</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {historyData.error_count}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Trips</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {historyData.trip_count}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Car className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Distance (km)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {historyData.distance_km.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <Fuel className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TIME SERIES CHARTS */}
        {historyData && (
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-6">Time Series Charts</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Speed Chart */}
              <div>
                <h4 className="text-md font-medium mb-3 flex items-center">
                  <Gauge className="h-4 w-4 mr-2" />
                  Speed (speed_kph)
                </h4>
                <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                    <p>Speed chart integration coming soon</p>
                  </div>
                </div>
              </div>

              {/* Battery Chart */}
              <div>
                <h4 className="text-md font-medium mb-3 flex items-center">
                  <Battery className="h-4 w-4 mr-2" />
                  Battery % (battery_level_percent)
                </h4>
                <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                    <p>Battery chart integration coming soon</p>
                  </div>
                </div>
              </div>

              {/* Range Chart */}
              <div>
                <h4 className="text-md font-medium mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Range (range_km)
                </h4>
                <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                    <p>Range chart integration coming soon</p>
                  </div>
                </div>
              </div>

              {/* Motor Temperature Chart */}
              <div>
                <h4 className="text-md font-medium mb-3 flex items-center">
                  <Thermometer className="h-4 w-4 mr-2" />
                  Motor Temp (motor_temp_c)
                </h4>
                <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                    <p>Temperature chart integration coming soon</p>
                  </div>
                </div>
              </div>

              {/* Power Chart */}
              <div>
                <h4 className="text-md font-medium mb-3 flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Power (battery_power_kw)
                </h4>
                <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                    <p>Power chart integration coming soon</p>
                  </div>
                </div>
              </div>

              {/* Tire Pressure Chart */}
              <div>
                <h4 className="text-md font-medium mb-3 flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Tire Pressure (tire_pressure_kpa)
                </h4>
                <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                    <p>Tire pressure chart integration coming soon</p>
                  </div>
                </div>
              </div>

              {/* Torque Chart */}
              <div>
                <h4 className="text-md font-medium mb-3 flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Torque (torque_nm)
                </h4>
                <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                    <p>Torque chart integration coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANELS */}
        {historyData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Telemetry Stats */}
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <h3 className="text-lg font-semibold mb-4">Telemetry Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Speed (kph):</span>
                  <span className="text-gray-900 dark:text-white">
                    Avg: {historyData.telemetry_stats.speed.avg} | Min: {historyData.telemetry_stats.speed.min} | Max: {historyData.telemetry_stats.speed.max}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Battery (%):</span>
                  <span className="text-gray-900 dark:text-white">
                    Avg: {historyData.telemetry_stats.battery.avg} | Min: {historyData.telemetry_stats.battery.min} | Max: {historyData.telemetry_stats.battery.max}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Temperature (°C):</span>
                  <span className="text-gray-900 dark:text-white">
                    Avg: {historyData.telemetry_stats.temperature.avg} | Min: {historyData.telemetry_stats.temperature.min} | Max: {historyData.telemetry_stats.temperature.max}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Range (km):</span>
                  <span className="text-gray-900 dark:text-white">
                    Avg: {historyData.telemetry_stats.range.avg} | Min: {historyData.telemetry_stats.range.min} | Max: {historyData.telemetry_stats.range.max}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Power (kW):</span>
                  <span className="text-gray-900 dark:text-white">
                    Avg: {historyData.telemetry_stats.power.avg} | Min: {historyData.telemetry_stats.power.min} | Max: {historyData.telemetry_stats.power.max}
                  </span>
                </div>
              </div>
            </div>

            {/* Trips Summary */}
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <h3 className="text-lg font-semibold mb-4">Trips Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Completed Trips:</span>
                  <span className="text-gray-900 dark:text-white">{historyData.trips_summary.completed_trips}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Distance:</span>
                  <span className="text-gray-900 dark:text-white">{historyData.trips_summary.total_distance.toLocaleString()} km</span>
                </div>
              </div>
            </div>

            {/* Maintenance Summary */}
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <h3 className="text-lg font-semibold mb-4">Maintenance Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Count:</span>
                  <span className="text-gray-900 dark:text-white">{historyData.maintenance_summary.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Cost:</span>
                  <span className="text-gray-900 dark:text-white">${historyData.maintenance_summary.total_cost}</span>
                </div>
              </div>
            </div>

            {/* Energy Breakdown */}
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <h3 className="text-lg font-semibold mb-4">Energy Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Driving:</span>
                  <span className="text-gray-900 dark:text-white">{historyData.energy_breakdown.driving}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Charging:</span>
                  <span className="text-gray-900 dark:text-white">{historyData.energy_breakdown.charging}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Idle:</span>
                  <span className="text-gray-900 dark:text-white">{historyData.energy_breakdown.idle}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RAW DATA (Optional) */}
        {historyData && (
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Raw Data (First 100 telemetry records)</h3>
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Activity className="h-8 w-8 mx-auto mb-2" />
                <p>Raw telemetry data table coming soon</p>
              </div>
            </div>
          </div>
        )}

        {isLoadingHistory && (
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading history data...</span>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
