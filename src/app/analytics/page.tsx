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
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Fleet performance analytics and insights
            </p>
          </div>
          <div className="relative">
          <Button
            onClick={handleExport}
            variant="outlineDark"
            label="Export"
            icon={<Download className="h-4 w-4" />}
              className="pr-8"
          />
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          
          {/* First Row: Range, Start, End, Vehicle Type, Vehicle */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <Select
              label="Range ▾"
              items={[
                { value: "today", label: "today" },
                { value: "10days", label: "10d" },
                { value: "30days", label: "30d" },
                { value: "90days", label: "90d" },
              ]}
              defaultValue={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            />
            <InputGroup
              type="date"
              label="Start"
              placeholder="Select start date"
              value={startDate}
              handleChange={(e) => setStartDate(e.target.value)}
              icon={<Calendar className="h-4 w-4" />}
            />
            <InputGroup
              type="date"
              label="End"
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
          </div>
          
          {/* Second Row: Driver, Metrics (multi-select), Group by, Apply */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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

          {/* Metrics Selection */}
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Metrics (multi-select)</label>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {availableMetrics.slice(0, 4).map((metric) => (
                <button
                  key={metric}
                  onClick={() => handleMetricToggle(metric)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
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
            
            <Select
              label="Group by ▾"
              items={[
                { value: "", label: "None" },
                { value: "vehicle_type", label: "vehicle_type" },
              ]}
              defaultValue={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            />
            
            <div className="flex items-end">
              <Button
                onClick={handleRefresh}
                variant="primary"
                label="Apply"
                size="small"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* KPI Cards - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Availability %</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {typeof analyticsData?.fleet_availability === 'number' 
                    ? `${analyticsData.fleet_availability}%` 
                    : '82.5%'}
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
                  {analyticsData?.average_downtime ? `${analyticsData.average_downtime} h` : '6.8 h'}
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
                  {analyticsData?.accident_rate ? analyticsData.accident_rate.toFixed(4) : '0.0031'}
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
                  {analyticsData?.average_eco_score ? analyticsData.average_eco_score.toFixed(1) : '87.2'}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Gauge className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maint. Cost</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.total_maintenance_cost 
                    ? `₹ ${parseFloat(analyticsData.total_maintenance_cost).toLocaleString()}` 
                    : '₹ 3,450.50'}
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
                  {analyticsData?.active_alerts || 4}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Geofence</p>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Breaches: 1</p>
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
                    : '12,450 km'}
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
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full flex items-center justify-end pr-1" 
                      style={{ width: `${Math.min((analyticsData?.active_alerts || 4) * 12, 100)}%` }}
                    >
                      <div className="text-xs text-white font-bold">|</div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[20px]">
                    {analyticsData?.active_alerts || 4}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Geofence Breaches</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-yellow-500 h-3 rounded-full flex items-center justify-end pr-1" 
                      style={{ width: `${Math.min((analyticsData?.geofence_breaches || 1) * 25, 100)}%` }}
                    >
                      <div className="text-xs text-white font-bold">|</div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[20px]">
                    {analyticsData?.geofence_breaches || 1}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Distance km</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full flex items-center justify-end pr-1" 
                      style={{ width: `${Math.min(((analyticsData?.total_distance || 12450) / 20000) * 100, 100)}%` }}
                    >
                      <div className="text-xs text-white font-bold">|</div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[20px]">
                    {analyticsData?.total_distance || 12450}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Speed kph</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full flex items-center justify-end pr-1" 
                      style={{ width: `${Math.min((analyticsData?.average_speed || 53) * 1.5, 100)}%` }}
                    >
                      <div className="text-xs text-white font-bold">|</div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[20px]">
                    {analyticsData?.average_speed || 53}
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
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full flex items-center justify-end pr-1" 
                          style={{ width: `${typeof percentage === 'number' ? percentage : 0}%` }}
                        >
                          <div className="text-xs text-white font-bold">|</div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[30px]">
                        {typeof percentage === 'number' ? percentage : 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Bus</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full flex items-center justify-end pr-1" 
                        style={{ width: '91%' }}
                      >
                        <div className="text-xs text-white font-bold">|</div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[30px]">91</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Truck</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full flex items-center justify-end pr-1" 
                        style={{ width: '75%' }}
                      >
                        <div className="text-xs text-white font-bold">|</div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[30px]">75</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Van</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full flex items-center justify-end pr-1" 
                        style={{ width: '83%' }}
                      >
                        <div className="text-xs text-white font-bold">|</div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[30px]">83</span>
                  </div>
                </div>
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
                {analyticsData?.average_downtime || 6.8} h
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">Hours (bar)</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                <div 
                  className="bg-red-500 h-6 rounded-full flex items-center justify-end pr-2" 
                  style={{ width: `${Math.min((analyticsData?.average_downtime || 6.8) * 8, 100)}%` }}
                >
                  <div className="text-white text-xs font-bold">|</div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analyticsData?.average_eco_score || 87.2}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">Eco Score (line)</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                <div 
                  className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2" 
                  style={{ width: `${analyticsData?.average_eco_score || 87.2}%` }}
                >
                  <div className="text-white text-xs font-bold">*</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">(scale 0–100)</div>
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
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">HIGH</div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="w-4 h-4 bg-red-500 rounded"></div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">MED+LOW</div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>D1</span>
                <span>D2</span>
                <span>D3</span>
                <span>D4</span>
                <span>D5</span>
                <span>D6</span>
                <span>D7</span>
              </div>
            </div>
          </div>

          {/* Distance per Day */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distance per Day (Line)
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>12k km</span>
                <span>9k km</span>
                <span>6k km</span>
                <span>3k km</span>
              </div>
              <div className="relative h-24 bg-gray-50 dark:bg-gray-900 rounded">
                {/* Simple line representation */}
                <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
                  <div className="w-full h-full flex items-end justify-between px-2">
                    <div className="w-1 h-3 bg-blue-500 rounded"></div>
                    <div className="w-1 h-6 bg-blue-500 rounded"></div>
                    <div className="w-1 h-8 bg-blue-500 rounded"></div>
                    <div className="w-1 h-12 bg-blue-500 rounded"></div>
                    <div className="w-1 h-8 bg-blue-500 rounded"></div>
                    <div className="w-1 h-10 bg-blue-500 rounded"></div>
                    <div className="w-1 h-6 bg-blue-500 rounded"></div>
                  </div>
                </div>
                {/* Line connecting the points */}
                <svg className="absolute inset-0 w-full h-full">
                  <polyline
                    points="8,20 24,16 40,12 56,8 72,12 88,10 104,16"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>D1</span>
                <span>D2</span>
                <span>D3</span>
                <span>D4</span>
                <span>D5</span>
                <span>D6</span>
                <span>D7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
