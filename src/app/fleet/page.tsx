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
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Welcome back! Here&apos;s what&apos;s happening with your fleet today.
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6 flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range:</span>
        <div className="flex items-center space-x-1">
          {["Today", "10d", "30d", "90d"].map((range) => (
            <button
              key={range}
              onClick={() => handleDateRangeChange(range.toLowerCase())}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                dateRange === range.toLowerCase() 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        <button
          onClick={() => console.log("Custom date range")}
          className="ml-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 flex items-center"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>


      {/* KPI CARDS */}
      <div className="mb-6">
        <Suspense fallback={<FleetOverviewCardsSkeleton />}>
          <FleetOverviewCards />
        </Suspense>
      </div>

      {/* Row 2: Maintenance Dashboard */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Maintenance Overview</h2>
        <MaintenanceDashboardCards dateRange={dateRange} />
      </div>

      {/* STATUS & ENERGY */}
      <div className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <VehicleStatusPieChart />
          {/* EnergyKPIs - COMMENTED OUT: No energy metrics API available */}
          {/* <EnergyKPIs /> */}
        </div>
      </div>

      {/* OBD METRICS */}
      <div className="mb-6">
        <OBDMetricsSnapshot />
      </div>

      {/* DIAGNOSTICS */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DeviceHealthCard />
          <SimUsageCard />
          <BatteryHealthCard />
        </div>
      </div>

      {/* MOST ACTIVE VEHICLE */}
      <div className="mb-6">
        <MostActiveVehicle />
      </div>

      {/* VEHICLE MAP */}
      <div className="mb-6">
        <LiveTrackingMap />
      </div>

      {/* Row 7: Live Telemetry - COMMENTED OUT: No WebSocket API available */}
      {/* <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Live Telemetry</h2>
        <div className="bg-white dark:bg-gray-dark rounded-[10px] p-6 shadow-1">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Live Telemetry</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Real-time vehicle data streaming</p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>Speed: 0 km/h</span>
              <span>Battery: 0%</span>
              <span>Range: 0 km</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">WebSocket connection required</p>
          </div>
        </div>
      </div> */}

      {/* DATA TABLES */}
      <div className="mb-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <TopErrorCodesChart />
          <RecentAlertsTable />
          <ActiveTripsTable />
        </div>
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


      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last updated: <span className="font-medium">{new Date().toLocaleString()}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Data source: Dashboard Summary + Telemetry/Trips/Alerts
          </p>
        </div>
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
