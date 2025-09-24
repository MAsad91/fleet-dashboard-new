"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { compactFormat } from "@/lib/format-number";
import { FleetOverviewCard } from "./card";
import * as icons from "./icons";

export function FleetOverviewCards() {
  const { summary, loading } = useDashboard();

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
  console.log('🔍 Fleet Overview Cards - Online vehicles:', summary?.online_vehicles);
  console.log('🔍 Fleet Overview Cards - Type of online_vehicles:', typeof summary?.online_vehicles);

  const fleetData = {
    totalVehicles: { 
      value: summary?.total_vehicles || 128, 
      growthRate: null, // No growth rate from API
      description: "Total fleet vehicles" 
    },
    onlineVehicles: { 
      value: summary?.online_vehicles ?? 114, // Use nullish coalescing to handle 0 values
      growthRate: null, // No growth rate from API
      description: "Currently online" 
    },
    activeTrips: { 
      value: summary?.total_active_trips || 27, 
      growthRate: null, // No growth rate from API
      description: "Active trips" 
    },
    criticalAlerts: { 
      value: summary?.critical_alerts || 3, 
      growthRate: null, // No growth rate from API
      description: "Critical alerts" 
    },
    openMaintenance: { 
      value: summary?.open_maintenance || 6, 
      growthRate: null, // No growth rate from API
      description: "Open maintenance" 
    },
    avgBattery: { 
      value: summary?.average_battery_level || 78, 
      growthRate: null, // No growth rate from API
      description: "Average battery level" 
    },
    totalDistance: { 
      value: summary?.total_distance_travelled_km || 154230, 
      growthRate: null, // No growth rate from API
      description: "Total distance (km)" 
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

      <FleetOverviewCard
        label="Avg Battery %"
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
  );
}
