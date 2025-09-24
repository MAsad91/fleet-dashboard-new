"use client";

import { useState } from "react";
import { useGetAnalyticsQuery, useListVehicleTypesQuery, useListVehiclesQuery, useGetDriversQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { BarChart, PieChart, TrendingUp, Download, RefreshCw, Calendar, Clock, AlertTriangle, Shield, DollarSign, MapPin, Gauge } from "lucide-react";
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
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Fleet performance analytics and insights
            </p>
          </div>
          <Button
            onClick={handleExport}
            variant="outlineDark"
            label="Export"
            icon={<Download className="h-4 w-4" />}
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            <Select
              label="Range"
              items={[
                { value: "today", label: "Today" },
                { value: "10days", label: "Last 10 Days" },
                { value: "30days", label: "Last 30 Days" },
                { value: "90days", label: "Last 90 Days" },
              ]}
              defaultValue={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            />
            <InputGroup
              type="date"
              label="Start Date"
              placeholder="Select start date"
              value={startDate}
              handleChange={(e) => setStartDate(e.target.value)}
              icon={<Calendar className="h-4 w-4" />}
            />
            <InputGroup
              type="date"
              label="End Date"
              placeholder="Select end date"
              value={endDate}
              handleChange={(e) => setEndDate(e.target.value)}
              icon={<Calendar className="h-4 w-4" />}
            />
            <Select
              label="Vehicle Type"
              items={[
                { value: "", label: "All Types" },
                ...(vehicleTypesData?.results?.map((type: any) => ({
                  value: type.id.toString(),
                  label: type.name
                })) || [])
              ]}
              defaultValue={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            <Select
              label="Vehicle"
              items={[
                { value: "", label: "All Vehicles" },
                ...(vehiclesData?.results?.map((vehicle: any) => ({
                  value: vehicle.id.toString(),
                  label: `${vehicle.license_plate} - ${vehicle.make} ${vehicle.model}`
                })) || [])
              ]}
              defaultValue={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
            />
            <Select
              label="Driver"
              items={[
                { value: "", label: "All Drivers" },
                ...(driversData?.results?.map((driver: any) => ({
                  value: driver.id.toString(),
                  label: `${driver.name} - ${driver.phone}`
                })) || [])
              ]}
              defaultValue={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
            />
            <Select
              label="Group by"
              items={[
                { value: "", label: "None" },
                { value: "vehicle_type", label: "Vehicle Type" },
              ]}
              defaultValue={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            />
            <Button
              onClick={handleRefresh}
              variant="outlineDark"
              label="Apply"
              icon={<RefreshCw className="h-4 w-4" />}
            />
          </div>

          {/* Metrics Selection */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Metrics (multi-select)</h4>
            <div className="flex flex-wrap gap-2">
              {availableMetrics.map((metric) => (
                <button
                  key={metric}
                  onClick={() => handleMetricToggle(metric)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedMetrics.includes(metric)
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Availability %</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {typeof analyticsData?.fleet_availability === 'number' 
                    ? `${analyticsData.fleet_availability}%` 
                    : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Downtime h</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.average_downtime ? `${analyticsData.average_downtime} h` : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accident / km</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.accident_rate ? analyticsData.accident_rate.toFixed(4) : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Eco Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.average_eco_score ? analyticsData.average_eco_score.toFixed(1) : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Gauge className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Second Row KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maint. Cost</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.total_maintenance_cost 
                    ? `₹ ${parseFloat(analyticsData.total_maintenance_cost).toLocaleString()}` 
                    : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.active_alerts || 0}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Geofence Breaches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.geofence_breaches || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <MapPin className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Distance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.total_distance 
                    ? `${analyticsData.total_distance.toLocaleString()} km` 
                    : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Chart Row A */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* KPI Snapshot (Bar) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              KPI Snapshot (Bar)
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((analyticsData?.active_alerts || 0) * 10, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {analyticsData?.active_alerts || 0}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Geofence Breaches</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((analyticsData?.geofence_breaches || 0) * 20, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {analyticsData?.geofence_breaches || 0}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Distance (km)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(((analyticsData?.total_distance || 0) / 20000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {analyticsData?.total_distance?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Speed (kph)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((analyticsData?.average_speed || 0) * 2, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {analyticsData?.average_speed || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Availability by Vehicle Type */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Availability by Vehicle Type (%)
            </h3>
            {typeof analyticsData?.fleet_availability === 'object' ? (
              <div className="space-y-4">
                {Object.entries(analyticsData.fleet_availability).map(([type, percentage]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{type}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {typeof percentage === 'number' ? percentage : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <PieChart className="h-12 w-12 mx-auto mb-2" />
                <p>Group by vehicle type to see breakdown</p>
              </div>
            )}
          </div>
        </div>

        {/* Chart Row B - Downtime vs Eco Score */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Downtime vs Eco Score (Dual Axis)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {analyticsData?.average_downtime || 0} h
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">Hours (bar)</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-red-500 h-4 rounded-full" 
                  style={{ width: `${Math.min((analyticsData?.average_downtime || 0) * 10, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analyticsData?.average_eco_score || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">Eco Score (line)</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-green-500 h-4 rounded-full" 
                  style={{ width: `${analyticsData?.average_eco_score || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Row C - Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts per Day */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Alerts per Day (Stacked)
            </h3>
            <div className="text-center text-gray-500 dark:text-gray-400">
              <BarChart className="h-12 w-12 mx-auto mb-2" />
              <p>Trend visualization coming soon</p>
              <p className="text-xs mt-2">Data aggregated from domain endpoints</p>
            </div>
          </div>

          {/* Distance per Day */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distance per Day (Line)
            </h3>
            <div className="text-center text-gray-500 dark:text-gray-400">
              <TrendingUp className="h-12 w-12 mx-auto mb-2" />
              <p>Trend visualization coming soon</p>
              <p className="text-xs mt-2">Data aggregated from domain endpoints</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
