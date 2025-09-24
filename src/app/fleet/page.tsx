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
import { FleetStatus } from "./_components/fleet-status";
import { RecentAlerts } from "./_components/recent-alerts";
import { OBDMetricsSnapshot } from "./_components/obd-metrics-snapshot";
import { DeviceHealthCard } from "./_components/device-health-card";
import { SimUsageCard } from "./_components/sim-usage-card";
import { BatteryHealthCard } from "./_components/battery-health-card";
import { EnergyConsumptionChart } from "./_components/energy-consumption-chart";
import { BatteryHealthFleetChart } from "./_components/battery-health-fleet-chart";
import { MostActiveVehicle } from "./_components/most-active-vehicle";

// Dashboard content component that can use the dashboard context
function DashboardContent() {
  const { updateDateRange } = useDashboard();
  const [dateRange, setDateRange] = useState("1month");
  const [tenant, setTenant] = useState("acme-logistics");
  
  // Update dashboard when date range changes
  const handleDateRangeChange = (newRange: string) => {
    setDateRange(newRange);
    updateDateRange(newRange);
  };

  return (
    <>
        {/* Header */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">
                Fleet Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Welcome back! Here&apos;s what&apos;s happening with your fleet today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Tenant Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Tenant:</span>
                <Select
                  label=""
                  items={[
                    { value: "acme-logistics", label: "Acme Logistics" },
                    { value: "quick-delivery", label: "Quick Delivery" },
                    { value: "metro-fleet", label: "Metro Fleet" },
                  ]}
                  defaultValue={tenant}
                  onChange={(e) => setTenant(e.target.value)}
                  className="w-48"
                />
              </div>
              
              {/* Date Range Filters */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Period:</span>
                <div className="flex items-center space-x-1">
                  {["1d", "1 week", "4 week", "1 month"].map((range) => (
                    <button
                      key={range}
                      onClick={() => handleDateRangeChange(range.toLowerCase().replace(' ', ''))}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                        dateRange === range.toLowerCase().replace(' ', '') 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => console.log("Custom date range")}
                  className="ml-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center"
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </div>
              
              {/* User Menu */}
              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Admin User</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Fleet Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>


      {/* Row 1: Key Performance Indicators */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Key Performance Indicators</h2>
        <Suspense fallback={<FleetOverviewCardsSkeleton />}>
          <FleetOverviewCards />
        </Suspense>
      </div>

      {/* Row 2: Real-time Operations Center */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Real-time Operations Center</h2>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8">
            <LiveTrackingMap />
          </div>
          <div className="xl:col-span-4 space-y-4">
            <FleetStatus />
            <RecentAlerts />
          </div>
        </div>
      </div>

      {/* Row 3: Technical Metrics */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Technical Metrics</h2>
        <OBDMetricsSnapshot />
      </div>

      {/* Row 4: System Health & Diagnostics */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">System Health & Diagnostics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DeviceHealthCard />
          <SimUsageCard />
        </div>
      </div>

      {/* Row 5: Analytics Charts */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Analytics & Performance</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EnergyConsumptionChart />
          <BatteryHealthFleetChart />
        </div>
      </div>

      {/* Row 6: Vehicle Spotlight */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Vehicle Spotlight</h2>
        <MostActiveVehicle />
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
