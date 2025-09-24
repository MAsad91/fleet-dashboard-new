"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Plus, Award, Car, ArrowLeft, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PerformancePage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'driver-performance' | 'vehicle-performance'>('driver-performance');

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
            <p className="text-muted-foreground">
              Monitor and analyze driver and vehicle performance metrics
            </p>
          </div>
          <Button
            label="+ Create"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => router.push(`/${currentView}/create`)}
          />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setCurrentView('driver-performance')}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2",
                currentView === 'driver-performance'
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Award className="h-4 w-4" />
              <span>Driver Performance</span>
            </button>
            <button
              onClick={() => setCurrentView('vehicle-performance')}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2",
                currentView === 'vehicle-performance'
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Car className="h-4 w-4" />
              <span>Vehicle Performance</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              {currentView === 'driver-performance' ? (
                <Award className="h-8 w-8 text-blue-600" />
              ) : (
                <Car className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {currentView === 'driver-performance' ? 'Driver Performance' : 'Vehicle Performance'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {currentView === 'driver-performance' 
                ? 'Monitor driver safety scores, eco scores, and performance metrics'
                : 'Track vehicle energy consumption, battery health, and maintenance metrics'
              }
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                label="View List"
                variant="primary"
                onClick={() => router.push(`/${currentView}`)}
              />
              <Button
                label="Create New"
                variant="outlineDark"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => router.push(`/${currentView}/create`)}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
