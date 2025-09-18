"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";

interface BatteryHealthCardProps {
  className?: string;
}

export function BatteryHealthCard({ className }: BatteryHealthCardProps) {
  const { summary, loading } = useDashboard();

  if (loading) {
    return (
      <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="flex flex-col items-center justify-center h-48">
            <div className="h-16 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  const batteryLevel = summary?.average_battery_level || 0;

  // Determine battery color based on level
  const getBatteryColor = (level: number) => {
    if (level >= 60) return "fill-green-500";
    if (level >= 30) return "fill-yellow-500";
    return "fill-red-500";
  };

  const getBatteryGlow = (level: number) => {
    if (level >= 60) return "shadow-green-500/50";
    if (level >= 30) return "shadow-yellow-500/50";
    return "shadow-red-500/50";
  };

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <h4 className="text-sm font-medium text-body-color dark:text-body-color-dark mb-4">
        Battery Health
      </h4>
      
      <div className="text-center">
        <div className="flex flex-col items-center justify-center h-48">
          {/* Animated Battery Icon */}
          <div className="relative mb-4">
            <svg
              width="80"
              height="40"
              viewBox="0 0 80 40"
              className="drop-shadow-lg"
            >
              {/* Battery Outline */}
              <rect
                x="2"
                y="8"
                width="60"
                height="24"
                rx="4"
                ry="4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-400 dark:text-gray-600"
              />
              
              {/* Battery Tip */}
              <rect
                x="62"
                y="14"
                width="4"
                height="12"
                rx="2"
                ry="2"
                fill="currentColor"
                className="text-gray-400 dark:text-gray-600"
              />
              
              {/* Battery Fill - Animated */}
              <rect
                x="4"
                y="10"
                width={`${(batteryLevel / 100) * 56}`}
                height="20"
                rx="2"
                ry="2"
                className={cn(
                  "transition-all duration-1000 ease-out",
                  getBatteryColor(batteryLevel),
                  getBatteryGlow(batteryLevel)
                )}
                style={{
                  filter: `drop-shadow(0 0 8px currentColor)`,
                }}
              />
              
              {/* Battery Fill Animation */}
              <rect
                x="4"
                y="10"
                width={`${(batteryLevel / 100) * 56}`}
                height="20"
                rx="2"
                ry="2"
                className={cn(
                  "transition-all duration-1000 ease-out opacity-30",
                  getBatteryColor(batteryLevel)
                )}
                style={{
                  animation: "batteryPulse 2s ease-in-out infinite",
                }}
              />
            </svg>
            
            {/* Lightning bolt for charging effect */}
            {batteryLevel > 0 && batteryLevel < 100 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  className={cn(
                    "transition-all duration-1000",
                    batteryLevel >= 60 ? "text-green-600" : 
                    batteryLevel >= 30 ? "text-yellow-600" : "text-red-600"
                  )}
                  style={{
                    animation: "lightningFlicker 3s ease-in-out infinite",
                  }}
                >
                  <path
                    fill="currentColor"
                    d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.15 17.25 11 21 11 21z"
                  />
                </svg>
              </div>
            )}
          </div>
          
          {/* Percentage Display */}
          <div className="text-2xl font-bold text-dark dark:text-white mb-2">
            {batteryLevel.toFixed(1)}%
          </div>
          
          {/* Status Text */}
          <div className="text-sm text-body-color dark:text-body-color-dark mb-2">
            Average Battery Level
          </div>
          
          {/* Status Badge */}
          {batteryLevel < 20 && (
            <div className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs font-medium animate-pulse">
              Low Level Alert
            </div>
          )}
          {batteryLevel >= 20 && batteryLevel < 50 && (
            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full text-xs font-medium">
              Medium Level
            </div>
          )}
          {batteryLevel >= 50 && (
            <div className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-medium">
              Good Level
            </div>
          )}
        </div>
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes batteryPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes lightningFlicker {
          0%, 90%, 100% { opacity: 0; }
          5%, 85% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
