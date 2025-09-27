"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useListVehiclePerformanceQuery, useListVehiclesQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Plus, Eye, Edit, RefreshCw, Calendar, Car, Battery, Wrench } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";

export default function VehiclePerformancePage() {
  const router = useRouter();
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minBatteryScore, setMinBatteryScore] = useState("");
  const [maxDowntime, setMaxDowntime] = useState("");

  // Fetch data
  const { data: performanceData, isLoading, error } = useListVehiclePerformanceQuery({ page: 1 });
  const { data: vehiclesData } = useListVehiclesQuery({ page: 1 });

  const performances = performanceData?.results || [];

  const filteredPerformances = performances.filter((perf: any) => {
    const matchesVehicle = !vehicleFilter || perf.vehicle?.id?.toString() === vehicleFilter;
    const matchesStartDate = !startDate || new Date(perf.period_start) >= new Date(startDate);
    const matchesEndDate = !endDate || new Date(perf.period_end) <= new Date(endDate);
    const matchesMinBatteryScore = !minBatteryScore || (perf.battery_health_score || 0) >= parseInt(minBatteryScore);
    const matchesMaxDowntime = !maxDowntime || (perf.downtime_hours || 0) <= parseFloat(maxDowntime);
    
    return matchesVehicle && matchesStartDate && matchesEndDate && matchesMinBatteryScore && matchesMaxDowntime;
  });

  const handleRefresh = () => {
    window.location.reload();
  };

  const getBatteryHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getBatteryHealthBadge = (score: number) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    if (score >= 80) return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
    if (score >= 60) return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
    return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
  };

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
          <p>Error loading vehicle performance data</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Vehicle Performance</h1>
            <p className="text-muted-foreground">
              Monitor and analyze vehicle performance metrics
            </p>
          </div>
          <Button
            label="Create"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => router.push('/vehicle-performance/create')}
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <InputGroup
              type="number"
              label="Min Battery Score"
              placeholder="0"
              value={minBatteryScore}
              handleChange={(e) => setMinBatteryScore(e.target.value)}
              icon={<Battery className="h-4 w-4" />}
            />
            <InputGroup
              type="number"
              label="Max Downtime (h)"
              placeholder="∞"
              value={maxDowntime}
              handleChange={(e) => setMaxDowntime(e.target.value)}
              icon={<Wrench className="h-4 w-4" />}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleRefresh}
              variant="outlineDark"
              label="Apply"
              icon={<RefreshCw className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Vehicle Performance Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Avg Cons.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Downtime
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Battery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPerformances.map((perf: any) => (
                  <tr key={perf.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Car className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {perf.vehicle?.license_plate || 'Unknown Vehicle'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {perf.vehicle?.make} {perf.vehicle?.model}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div>
                        <div>{perf.period_start ? new Date(perf.period_start).toLocaleDateString() : 'N/A'}</div>
                        <div className="text-gray-500">→ {perf.period_end ? new Date(perf.period_end).toLocaleDateString() : 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {perf.average_energy_consumption_kwh_per_km ? `${perf.average_energy_consumption_kwh_per_km} kWh/km` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {perf.total_distance_covered_km ? `${perf.total_distance_covered_km.toLocaleString()} km` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {perf.downtime_hours ? `${perf.downtime_hours} h` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${getBatteryHealthColor(perf.battery_health_score || 0)}`}>
                          {perf.battery_health_score || 0}
                        </span>
                        <span className={getBatteryHealthBadge(perf.battery_health_score || 0)}>
                          {perf.battery_health_score >= 80 ? 'Good' : perf.battery_health_score >= 60 ? 'Fair' : 'Poor'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {perf.service_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => router.push(`/vehicle-performance/${perf.id}`)}
                          variant="outlineDark"
                          label=""
                          icon={<Eye className="h-4 w-4" />}
                          size="small"
                        />
                        <Button
                          onClick={() => router.push(`/vehicle-performance/${perf.id}/edit`)}
                          variant="outlinePrimary"
                          label=""
                          icon={<Edit className="h-4 w-4" />}
                          size="small"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPerformances.length === 0 && (
            <div className="text-center py-12">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No vehicle performance records found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {vehicleFilter || startDate || endDate || minBatteryScore || maxDowntime
                  ? "Try adjusting your search criteria"
                  : "No vehicle performance records available"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
