"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useListDriverPerformanceQuery, useGetDriversQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Plus, Eye, Edit, RefreshCw, Calendar, Award } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";

export default function DriverPerformancePage() {
  const router = useRouter();
  const [driverFilter, setDriverFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");

  // Fetch data
  const { data: performanceData, isLoading, error } = useListDriverPerformanceQuery({ page: 1 });
  const { data: driversData } = useGetDriversQuery({ page: 1 });

  const performances = performanceData?.results || [];

  const filteredPerformances = performances.filter((perf: any) => {
    const matchesDriver = !driverFilter || perf.driver?.id?.toString() === driverFilter;
    const matchesStartDate = !startDate || new Date(perf.period_start) >= new Date(startDate);
    const matchesEndDate = !endDate || new Date(perf.period_end) <= new Date(endDate);
    const matchesMinScore = !minScore || (perf.safety_score || 0) >= parseInt(minScore);
    const matchesMaxScore = !maxScore || (perf.safety_score || 0) <= parseInt(maxScore);
    
    return matchesDriver && matchesStartDate && matchesEndDate && matchesMinScore && matchesMaxScore;
  });

  const handleRefresh = () => {
    window.location.reload();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    return "text-red-600";
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
          <p>Error loading driver performance data</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Driver Performance</h1>
            <p className="text-muted-foreground">
              Monitor and analyze driver performance metrics
            </p>
          </div>
          <Button
            label="+ Create"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => router.push('/driver-performance/create')}
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              label="Min Score"
              placeholder="0"
              value={minScore}
              handleChange={(e) => setMinScore(e.target.value)}
              icon={<Award className="h-4 w-4" />}
            />
            <InputGroup
              type="number"
              label="Max Score"
              placeholder="100"
              value={maxScore}
              handleChange={(e) => setMaxScore(e.target.value)}
              icon={<Award className="h-4 w-4" />}
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

        {/* Driver Performance Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: '1200px' }}>
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Safety
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Eco
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Avg Speed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Harsh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Accidents
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
                          <Award className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {perf.driver?.name || 'Unknown Driver'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {perf.driver?.phone || 'N/A'}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getScoreColor(perf.safety_score || 0)}`}>
                        {perf.safety_score || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getScoreColor(perf.eco_score || 0)}`}>
                        {perf.eco_score || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {perf.average_speed_kph ? `${perf.average_speed_kph} kph` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {perf.distance_covered_km ? `${perf.distance_covered_km.toLocaleString()} km` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {perf.number_of_harsh_brakes || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {perf.number_of_accidents || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => router.push(`/driver-performance/${perf.id}`)}
                          variant="outlineDark"
                          label=""
                          icon={<Eye className="h-4 w-4" />}
                          size="small"
                        />
                        <Button
                          onClick={() => router.push(`/driver-performance/${perf.id}/edit`)}
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
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No driver performance records found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {driverFilter || startDate || endDate || minScore || maxScore
                  ? "Try adjusting your search criteria"
                  : "No driver performance records available"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
