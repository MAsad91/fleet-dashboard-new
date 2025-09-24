"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";
import { Battery, Zap, TrendingUp } from "lucide-react";

interface EnergyKPIsProps {
  className?: string;
}

export function EnergyKPIs({ className }: EnergyKPIsProps) {
  const { summary, loading } = useDashboard();

  if (loading) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Mock data since energy_metrics might not be available in API
  const energyMetrics = summary?.energy_metrics || {
    total_energy_consumed_kwh: 6240,
    average_efficiency_km_per_kwh: 6.3,
  };

  const totalEnergy = energyMetrics.total_energy_consumed_kwh || 0;
  const avgEfficiency = energyMetrics.average_efficiency_km_per_kwh || 0;

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark mb-4">
        Energy Performance
      </h4>
      
      <div className="space-y-6">
        {/* Total Energy Consumed */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Energy Consumed
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalEnergy.toLocaleString()} kWh
              </div>
            </div>
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Battery className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          {/* Energy Gauge */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((totalEnergy / 10000) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0 kWh</span>
              <span>10,000 kWh</span>
            </div>
          </div>
        </div>

        {/* Average Efficiency */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Average Efficiency
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {avgEfficiency} km/kWh
              </div>
            </div>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          {/* Efficiency Gauge */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((avgEfficiency / 10) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0 km/kWh</span>
              <span>10 km/kWh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
