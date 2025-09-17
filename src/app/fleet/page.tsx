import { Suspense } from "react";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
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

export default function FleetDashboard() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer']}>
      <div className="mb-6">
        <h1 className="text-title-md2 font-bold text-black dark:text-white">
          Fleet Management Dashboard
        </h1>
        <p className="text-sm text-body-color dark:text-body-color-dark">
          Welcome back! Here&apos;s what&apos;s happening with your fleet today.
        </p>
      </div>

      {/* Row 1: Key Performance Indicators */}
      <Suspense fallback={<FleetOverviewCardsSkeleton />}>
        <FleetOverviewCards />
      </Suspense>

      {/* Row 2: Real-time Operations Center */}
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-8">
          <LiveTrackingMap />
        </div>
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <FleetStatus />
          <RecentAlerts />
        </div>
      </div>

      {/* Row 3: Technical Metrics */}
      <div className="mt-4 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12">
          <OBDMetricsSnapshot />
        </div>
      </div>

      {/* Row 4: System Health & Diagnostics - Three Separate Cards */}
      <div className="mt-4 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 md:col-span-6">
          <DeviceHealthCard />
        </div>
        <div className="col-span-12 md:col-span-6">
          <SimUsageCard />
        </div>
        
      </div>

      {/* Row 5: Analytics Charts - Two Separate Charts */}
      <div className="mt-4 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 lg:col-span-6">
          <EnergyConsumptionChart />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <BatteryHealthFleetChart />
        </div>
      </div>


      {/* Row 6: Vehicle Spotlight */}
      <div className="mt-4 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12">
          <MostActiveVehicle />
        </div>
      </div>
    </ProtectedRoute>
  );
}
