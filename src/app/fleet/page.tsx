"use client";

import { Suspense, useState } from "react";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { DashboardProvider, useDashboard } from "@/contexts/DashboardContext";
import { Button } from "@/components/ui-elements/button";
import { Select } from "@/components/FormElements/select";
import { Calendar, ChevronDown, User } from "lucide-react";
import { FleetOverviewCards } from "./_components/fleet-overview-cards";
import { FleetOverviewCardsSkeleton } from "./_components/fleet-overview-cards/skeleton";
import { LiveTrackingMap } from "./_components/live-tracking-map";
import { OBDMetricsSnapshot } from "./_components/obd-metrics-snapshot";
import { DeviceHealthCard } from "./_components/device-health-card";
import { SimUsageCard } from "./_components/sim-usage-card";
import { BatteryHealthCard } from "./_components/battery-health-card";
// import { EnergyConsumptionChart } from "./_components/energy-consumption-chart"; // COMMENTED OUT: No API
// import { BatteryHealthFleetChart } from "./_components/battery-health-fleet-chart"; // COMMENTED OUT: No API
import { MostActiveVehicle } from "./_components/most-active-vehicle";
import { VehicleStatusPieChart } from "./_components/vehicle-status-pie-chart";
// import { EnergyKPIs } from "./_components/energy-kpis"; // COMMENTED OUT: No API
import { RecentAlertsTable } from "./_components/recent-alerts-table";
import { ActiveTripsTable } from "./_components/active-trips-table";
import { TopErrorCodesChart } from "./_components/top-error-codes-chart";
import { DistanceChart } from "./_components/distance-chart";
import { SpeedChart } from "./_components/speed-chart";
import { DashcamAnalytics } from "./_components/dashcam-analytics";
import { TelemetryAggregated } from "./_components/telemetry-aggregated";
import { MaintenanceDashboardCards } from "./_components/maintenance-dashboard-cards";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Dashboard content component that can use the dashboard context
function DashboardContent() {
  const { updateDateRange } = useDashboard();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dateRange, setDateRange] = useState("1month");
  const [tenant, setTenant] = useState("acme-logistics");
  const [activeAnalytics, setActiveAnalytics] = useState<'distance' | 'speed' | 'dashcam' | 'telemetry'>('distance');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  // Update dashboard when date range changes
  const handleDateRangeChange = (newRange: string) => {
    setDateRange(newRange);
    updateDateRange(newRange);
  };

  return (
    <>
      {/* DASHBOARD */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">
          Dashboard
        </h1>
      </div>

      {/* KPI CARDS */}
      <div className="mb-6">
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range: </span>
          <div className="inline-flex items-center space-x-1 ml-2">
            {["Today", "10d", "30d", "90d"].map((range) => (
              <button
                key={range}
                onClick={() => handleDateRangeChange(range.toLowerCase())}
                className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                  dateRange === range.toLowerCase() 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                }`}
              >
                {range}
              </button>
            ))}
            <button
              onClick={() => console.log("Custom date range")}
              className="px-2 py-1 text-xs font-medium rounded transition-all duration-200 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 flex items-center"
            >
              <Calendar className="h-3 w-3" />
            </button>
          </div>
        </div>
        
        <Suspense fallback={<FleetOverviewCardsSkeleton />}>
          <FleetOverviewCards />
        </Suspense>
      </div>

      {/* STATUS & ENERGY */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Status & Energy</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <VehicleStatusPieChart />
          {/* Energy metrics placeholder - will be implemented when API is available */}
          {/* NOTE: Energy metrics API is missing from Postman collection
              TODO: Implement GET /api/fleet/dashboard/summary/ with energy_metrics fields:
              - total_energy_consumed_kwh
              - average_efficiency_km_per_kwh */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-4 shadow-1">
            <h3 className="text-lg font-semibold mb-3">Energy Metrics</h3>
            <div className="space-y-2 text-sm mb-4">
              <div>• Total Energy (kWh): 6,240</div>
              <div>• Avg Efficiency: 6.3 km/kWh</div>
            </div>
            <div className="flex gap-6">
              <div className="flex-1 text-center">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-2 flex items-end justify-center">
                  <div className="w-full h-12 bg-blue-500 rounded-b"></div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
              </div>
              <div className="flex-1 text-center">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-2 flex items-end justify-center">
                  <div className="w-4/5 h-10 bg-green-500 rounded-b"></div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Efficiency</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OBD METRICS */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">OBD Metrics</h2>
        <OBDMetricsSnapshot />
      </div>

      {/* DIAGNOSTICS */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Diagnostics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DeviceHealthCard />
          <SimUsageCard />
          <BatteryHealthCard />
        </div>
      </div>

      {/* MOST ACTIVE VEHICLE */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Most Active Vehicle</h2>
        <MostActiveVehicle />
      </div>

      {/* VEHICLE MAP */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Vehicle Map</h2>
        <LiveTrackingMap />
      </div>

      {/* FLEET TELEMETRY INSIGHTS */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fleet Telemetry Insights</h2>
          
          {/* Analytics Toggle Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveAnalytics('speed')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeAnalytics === 'speed'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
            >
              Speed
            </button>
            <button
              onClick={() => setActiveAnalytics('distance')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeAnalytics === 'distance'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
            >
              Battery
            </button>
            <button
              onClick={() => setActiveAnalytics('dashcam')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeAnalytics === 'dashcam'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
            >
              Temperature
            </button>
            <button
              onClick={() => setActiveAnalytics('telemetry')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeAnalytics === 'telemetry'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
            >
              Range
            </button>
          </div>
        </div>
        
        {/* Dynamic Analytics Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeAnalytics === 'speed' && (
            <div className="lg:col-span-2">
              <SpeedChart />
            </div>
          )}
          {activeAnalytics === 'distance' && (
            <div className="lg:col-span-2">
              <DistanceChart />
            </div>
          )}
          {activeAnalytics === 'dashcam' && (
            <div className="lg:col-span-2">
              <DashcamAnalytics />
            </div>
          )}
          {activeAnalytics === 'telemetry' && (
            <div className="lg:col-span-2">
              <TelemetryAggregated />
            </div>
          )}
        </div>
      </div>

      {/* DATA TABLES */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data Tables</h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <TopErrorCodesChart />
          <RecentAlertsTable />
          <ActiveTripsTable />
        </div>
      </div>

      {/* Last updated timestamp */}
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Last updated: Just now
      </div>
    </>
  );
}

export default function FleetDashboard() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <DashboardProvider initialDateRange="1month">
        <DashboardContent />
      </DashboardProvider>
    </ProtectedRoute>
  );
}
