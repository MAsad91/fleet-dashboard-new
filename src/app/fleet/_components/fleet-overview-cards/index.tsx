"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { useGetVehiclesDashboardStatsQuery } from "@/store/api/fleetApi";
import { compactFormat } from "@/lib/format-number";
import { FleetOverviewCard } from "./card";
import * as icons from "./icons";

export function FleetOverviewCards() {
  const { summary, loading: dashboardLoading } = useDashboard();
  const { data: vehiclesStats, isLoading: vehiclesLoading, error: vehiclesError } = useGetVehiclesDashboardStatsQuery({
    dateRange: 'today'
  });

  const loading = dashboardLoading || vehiclesLoading;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(7)].map((_, index) => (
          <div key={index} className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Debug logging to identify the issue
  console.log('🔍 Fleet Overview Cards - Summary data:', summary);
  console.log('🔍 Fleet Overview Cards - Vehicles stats:', vehiclesStats);
  console.log('🔍 Fleet Overview Cards - Online vehicles:', summary?.online_vehicles);
  console.log('🔍 Fleet Overview Cards - Type of online_vehicles:', typeof summary?.online_vehicles);

  // Enhanced fleet data with vehicles dashboard stats - NO MOCK DATA
  const fleetData = {
    totalVehicles: { 
      value: vehiclesStats?.total_vehicles ?? summary?.total_vehicles ?? 0, 
      growthRate: vehiclesStats?.vehicles_growth_rate || null,
      description: "Total fleet vehicles",
      hasData: (vehiclesStats?.total_vehicles !== undefined) || (summary?.total_vehicles !== undefined)
    },
    onlineVehicles: { 
      value: vehiclesStats?.online_vehicles ?? summary?.online_vehicles ?? 0,
      growthRate: vehiclesStats?.online_growth_rate || null,
      description: "Currently online",
      hasData: (vehiclesStats?.online_vehicles !== undefined) || (summary?.online_vehicles !== undefined)
    },
    activeTrips: { 
      value: summary?.total_active_trips ?? 0, 
      growthRate: null,
      description: "Active trips",
      hasData: summary?.total_active_trips !== undefined
    },
    criticalAlerts: { 
      value: summary?.critical_alerts ?? 0,
      growthRate: null,
      description: "Critical alerts",
      hasData: summary?.critical_alerts !== undefined
    },
    openMaintenance: { 
      value: vehiclesStats?.maintenance_vehicles ?? summary?.open_maintenance ?? 0, 
      growthRate: vehiclesStats?.maintenance_growth_rate || null,
      description: "Open maintenance",
      hasData: (vehiclesStats?.maintenance_vehicles !== undefined) || (summary?.open_maintenance !== undefined)
    },
    avgBattery: { 
      value: vehiclesStats?.average_battery_level ?? summary?.average_battery_level ?? 0, 
      growthRate: vehiclesStats?.battery_growth_rate || null,
      description: "Average battery level",
      hasData: (vehiclesStats?.average_battery_level !== undefined) || (summary?.average_battery_level !== undefined)
    },
    totalDistance: { 
      value: vehiclesStats?.total_distance_km ?? summary?.total_distance_travelled_km ?? 0, 
      growthRate: vehiclesStats?.distance_growth_rate || null,
      description: "Total distance (km)",
      hasData: (vehiclesStats?.total_distance_km !== undefined) || (summary?.total_distance_travelled_km !== undefined)
    }
  };

  return (
    <div className="space-y-4">
      {/* First Row: 5 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <FleetOverviewCard
          label="Total Vehicles"
          data={{
            ...fleetData.totalVehicles,
            value: compactFormat(fleetData.totalVehicles.value),
          }}
          Icon={icons.TruckIcon}
        />

        <FleetOverviewCard
          label="Online Vehicles"
          data={{
            ...fleetData.onlineVehicles,
            value: compactFormat(fleetData.onlineVehicles.value),
          }}
          Icon={icons.OnlineVehiclesIcon}
        />

        <FleetOverviewCard
          label="Active Trips"
          data={{
            ...fleetData.activeTrips,
            value: compactFormat(fleetData.activeTrips.value),
          }}
          Icon={icons.ActiveTripsIcon}
        />

        <FleetOverviewCard
          label="Critical Alerts"
          data={{
            ...fleetData.criticalAlerts,
            value: compactFormat(fleetData.criticalAlerts.value),
          }}
          Icon={icons.CriticalAlertsIcon}
        />

        <FleetOverviewCard
          label="Open Maintenance"
          data={{
            ...fleetData.openMaintenance,
            value: compactFormat(fleetData.openMaintenance.value),
          }}
          Icon={icons.MaintenanceIcon}
        />
      </div>

      {/* Second Row: 2 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FleetOverviewCard
          label="Avg Battery"
          data={{
            ...fleetData.avgBattery,
            value: compactFormat(fleetData.avgBattery.value) + "%",
          }}
          Icon={icons.BatteryIcon}
        />

        <FleetOverviewCard
          label="Total Distance (km)"
          data={{
            ...fleetData.totalDistance,
            value: compactFormat(fleetData.totalDistance.value),
          }}
          Icon={icons.DistanceIcon}
        />
      </div>
    </div>
  );
}
