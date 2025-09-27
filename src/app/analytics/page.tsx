"use client";

import { useState } from "react";
import { useGetAnalyticsQuery, useListVehicleTypesQuery, useListVehiclesQuery, useGetDriversQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { BarChart, PieChart, TrendingUp, Download, RefreshCw, Calendar, Clock, AlertTriangle, Shield, DollarSign, MapPin, Gauge, ChevronDown } from "lucide-react";
import { Select } from "@/components/FormElements/select";
import InputGroup from "@/components/FormElements/InputGroup";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState("");

  // Fetch data for dropdowns
  const { data: vehicleTypesData } = useListVehicleTypesQuery();
  const { data: vehiclesData } = useListVehiclesQuery({ page: 1 });
  const { data: driversData } = useGetDriversQuery({ page: 1 });

  // Build analytics query parameters
  const analyticsParams = {
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    vehicle_type: vehicleTypeFilter || undefined,
    vehicle: vehicleFilter || undefined,
    driver: driverFilter || undefined,
    metrics: selectedMetrics.length > 0 ? selectedMetrics : undefined,
    group_by: groupBy || undefined,
  };

  const { data: analyticsData, isLoading, error, refetch } = useGetAnalyticsQuery(analyticsParams);

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export analytics data');
  };

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const availableMetrics = [
    'fleet_availability',
    'average_downtime', 
    'accident_rate',
    'average_eco_score',
    'total_maintenance_cost',
    'active_alerts',
    'geofence_breaches',
    'total_distance',
    'average_speed'
  ];

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRoles={['admin']}>
        <div className="text-center text-red-600">
          <p>Error loading analytics data</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleExport}
              variant="outlineDark"
              label="+ Export"
              icon={<Download className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search metrics..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            {/* Filter Dropdowns */}
            <div className="flex flex-wrap gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="today">Date Range: Today</option>
                <option value="7days">7d</option>
                <option value="30days">30d</option>
                <option value="90days">90d</option>
                <option value="custom">Custom ▾</option>
              </select>

              <select
                value={selectedMetrics.length > 0 ? "selected" : "all"}
                onChange={(e) => {
                  if (e.target.value === "all") {
                    setSelectedMetrics([]);
                  }
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="all">Metrics: Select Multiple ▾</option>
                <option value="selected">{selectedMetrics.length} selected</option>
              </select>

              <Button
                label="Apply"
                variant="primary"
                size="small"
                onClick={handleRefresh}
              />
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Fleet Avail.</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {typeof analyticsData?.fleet_availability === 'number' 
                  ? `${analyticsData.fleet_availability}%` 
                  : '82.5%'}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Avg Downtime</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData?.average_downtime ? `${analyticsData.average_downtime}h` : '6.8h'}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Accident Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData?.accident_rate ? analyticsData.accident_rate.toFixed(4) : '0.0031'}
              </p>
            </div>
          </div>
        </div>

        {/* FLEET OVERVIEW */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1 mb-6">
          <h3 className="text-lg font-semibold mb-4">Fleet Performance</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total Distance:</span>
                <span className="font-semibold ml-2">{analyticsData?.total_distance ? `${analyticsData.total_distance.toLocaleString()} km` : '142,876 km'}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Energy Used:</span>
                <span className="font-semibold ml-2">23,476 kWh</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Avg Efficiency:</span>
                <span className="font-semibold ml-2">6.1 km/kWh</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">CO₂ Saved:</span>
                <span className="font-semibold ml-2">12.6 tons</span>
              </div>
            </div>
            
            {/* Daily Distance Chart */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Daily Distance (km)</span>
                <Button
                  label="[View Report]"
                  variant="outlineDark"
                  size="small"
                />
              </div>
              <div className="h-24 bg-white dark:bg-gray-900 rounded border">
                <div className="h-full flex items-end justify-between px-2">
                  <div className="w-2 h-4 bg-blue-500 rounded-t"></div>
                  <div className="w-2 h-8 bg-blue-500 rounded-t"></div>
                  <div className="w-2 h-12 bg-blue-500 rounded-t"></div>
                  <div className="w-2 h-16 bg-blue-500 rounded-t"></div>
                  <div className="w-2 h-20 bg-blue-500 rounded-t"></div>
                  <div className="w-2 h-18 bg-blue-500 rounded-t"></div>
                  <div className="w-2 h-14 bg-blue-500 rounded-t"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VEHICLE METRICS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Vehicle Utilization */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Vehicle Utilization</h3>
            <div className="space-y-4">
              <div className="h-20 bg-gray-50 dark:bg-gray-800 rounded border">
                <div className="h-full flex items-end justify-between px-2">
                  <div className="w-3 h-16 bg-blue-500 rounded-t"></div>
                  <div className="w-3 h-18 bg-blue-500 rounded-t"></div>
                  <div className="w-3 h-14 bg-blue-500 rounded-t"></div>
                  <div className="w-3 h-20 bg-blue-500 rounded-t"></div>
                  <div className="w-3 h-16 bg-blue-500 rounded-t"></div>
                  <div className="w-3 h-12 bg-blue-500 rounded-t"></div>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg: 68% utilized</div>
              <Button
                label="[View Detailed Usage]"
                variant="outlineDark"
                size="small"
              />
            </div>
          </div>

          {/* Vehicle Status */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Vehicle Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Available (62)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">In Service (48)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm">Maintenance (18)</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">▶ View status changes</div>
              <Button
                label="[View Status Report]"
                variant="outlineDark"
                size="small"
              />
            </div>
          </div>
        </div>

        {/* ENERGY & BATTERY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Energy Consumption */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Energy Consumption</h3>
            <div className="space-y-4">
              <div className="h-16 bg-gray-50 dark:bg-gray-800 rounded border">
                <div className="h-full flex items-end justify-between px-2">
                  <div className="w-2 h-4 bg-green-500 rounded-t"></div>
                  <div className="w-2 h-6 bg-green-500 rounded-t"></div>
                  <div className="w-2 h-8 bg-green-500 rounded-t"></div>
                  <div className="w-2 h-10 bg-green-500 rounded-t"></div>
                  <div className="w-2 h-8 bg-green-500 rounded-t"></div>
                  <div className="w-2 h-6 bg-green-500 rounded-t"></div>
                  <div className="w-2 h-4 bg-green-500 rounded-t"></div>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Peak: 09:00 - 11:00</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg: 4.8 kWh/vehicle/day</div>
              <Button
                label="[View Energy Report]"
                variant="outlineDark"
                size="small"
              />
            </div>
          </div>

          {/* Battery Health */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Battery Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">90-100% (64)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">80-90% (42)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm">70-80% (18)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">&lt;70% (4)</span>
                </div>
              </div>
              <Button
                label="[View Battery Report]"
                variant="outlineDark"
                size="small"
              />
            </div>
          </div>
        </div>

        {/* DRIVER & TRIP ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Driver Performance */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Driver Performance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">⭐⭐⭐⭐⭐ (42%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">⭐⭐⭐⭐ (38%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">⭐⭐⭐ (15%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">⭐⭐ (5%)</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Top: Jane Doe (4.9)</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg: 4.7</div>
              <Button
                label="[View Driver Report]"
                variant="outlineDark"
                size="small"
              />
            </div>
          </div>

          {/* Trip Analysis */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Trip Analysis</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Completed: 312</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">In Progress: 27</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cancelled: 17</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Duration: 1h 45m</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Distance: 45 km</div>
              <Button
                label="[View Trip Metrics]"
                variant="outlineDark"
                size="small"
              />
            </div>
          </div>
        </div>

        {/* MAINTENANCE & RELIABILITY */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1 mb-6">
          <h3 className="text-lg font-semibold mb-4">Fleet Reliability</h3>
          <div className="space-y-4">
            <div className="h-20 bg-gray-50 dark:bg-gray-800 rounded border">
              <div className="h-full flex items-end justify-between px-2">
                <div className="w-2 h-4 bg-blue-500 rounded-t"></div>
                <div className="w-2 h-8 bg-blue-500 rounded-t"></div>
                <div className="w-2 h-6 bg-blue-500 rounded-t"></div>
                <div className="w-2 h-10 bg-blue-500 rounded-t"></div>
                <div className="w-2 h-8 bg-blue-500 rounded-t"></div>
                <div className="w-2 h-12 bg-blue-500 rounded-t"></div>
                <div className="w-2 h-6 bg-blue-500 rounded-t"></div>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Maintenance Events (30 days)</div>
            <div className="space-y-2 text-sm">
              <div>• Maintenance Costs: ₹245,800</div>
              <div>• Avg Downtime: 2.3 days</div>
              <div>• Most Common: Brake Service (24%)</div>
            </div>
            <Button
              label="[View Maintenance Analytics]"
              variant="outlineDark"
              size="small"
            />
          </div>
        </div>

        {/* REPORT SHORTCUTS */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Report Shortcuts</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button
              label="[Fleet Summary]"
              variant="outlineDark"
              size="small"
            />
            <Button
              label="[Cost Analysis]"
              variant="outlineDark"
              size="small"
            />
            <Button
              label="[Vehicle Comparison]"
              variant="outlineDark"
              size="small"
            />
            <Button
              label="[Efficiency Report]"
              variant="outlineDark"
              size="small"
            />
            <Button
              label="[Driver Ranking]"
              variant="outlineDark"
              size="small"
            />
            <Button
              label="[Maintenance Forecast]"
              variant="outlineDark"
              size="small"
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
