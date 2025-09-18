"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { compactFormat } from "@/lib/format-number";
import { FleetOverviewCard } from "./card";
import * as icons from "./icons";

export function FleetOverviewCards() {
  const { summary, loading } = useDashboard();

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const fleetData = {
    totalVehicles: { 
      value: summary?.total_vehicles || 0, 
      growthRate: 12.5, // Mock growth rate
      description: "Active fleet vehicles" 
    },
    activeDrivers: { 
      value: summary?.total_active_trips || 0,
      growthRate: 8.3, // Mock growth rate
      description: "Active trips" 
    },
    chargingStations: { 
      value: summary?.open_maintenance || 0, 
      growthRate: -2.1, // Mock growth rate
      description: "Maintenance due" 
    },
    totalRevenue: { 
      value: summary?.total_distance_travelled_km || 0, 
      growthRate: 15.7, // Mock growth rate
      description: "Total distance (km)" 
    },
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <FleetOverviewCard
        label="Total Vehicles"
        data={{
          ...fleetData.totalVehicles,
          value: compactFormat(fleetData.totalVehicles.value),
        }}
        Icon={icons.TruckIcon}
      />

      <FleetOverviewCard
        label="Active Drivers"
        data={{
          ...fleetData.activeDrivers,
          value: compactFormat(fleetData.activeDrivers.value),
        }}
        Icon={icons.ActiveTripsIcon}
      />

      <FleetOverviewCard
        label="Charging Stations"
        data={{
          ...fleetData.chargingStations,
          value: compactFormat(fleetData.chargingStations.value),
        }}
        Icon={icons.MaintenanceIcon}
      />

      <FleetOverviewCard
        label="Total Revenue"
        data={{
          ...fleetData.totalRevenue,
          value: "$" + compactFormat(fleetData.totalRevenue.value),
        }}
        Icon={icons.FuelIcon}
      />
    </div>
  );
}
