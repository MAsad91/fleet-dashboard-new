"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MostActiveVehicleProps {
  className?: string;
}

export function MostActiveVehicle({ className }: MostActiveVehicleProps) {
  const { summary, loading } = useDashboard();

  if (loading) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  const mostActiveVehicle = summary?.most_active_vehicle;

  if (!mostActiveVehicle) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <h3 className="text-title-sm font-semibold text-dark dark:text-white mb-4">
          Most Active Vehicle
        </h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🚗</div>
          <p className="text-body-color dark:text-body-color-dark">
            No vehicle data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <h3 className="text-title-sm font-semibold text-dark dark:text-white mb-4">
        Most Active Vehicle
      </h3>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">🚗</div>
            <div>
              <div className="text-lg font-semibold text-dark dark:text-white">
                {mostActiveVehicle.license_plate}
              </div>
              <div className="text-sm text-body-color dark:text-body-color-dark">
                Vehicle ID: {mostActiveVehicle.id}
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="text-2xl font-bold text-primary mb-1">
              {mostActiveVehicle.total_distance_km.toLocaleString()} km
            </div>
            <div className="text-sm text-body-color dark:text-body-color-dark">
              Distance traveled (last 7 days)
            </div>
          </div>
        </div>
        
        <div className="ml-4">
          <Link
            href={`/vehicles/${mostActiveVehicle.id}`}
            className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            View Vehicle
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
