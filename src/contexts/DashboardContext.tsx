"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useDashboardData, DashboardSummary, DashboardStats } from '@/hooks/useDashboardData';

interface DashboardContextType {
  summary: DashboardSummary | null;
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateDateRange: (dateRange: string, startDate?: string, endDate?: string) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
  initialDateRange?: string;
  initialStartDate?: string;
  initialEndDate?: string;
}

export function DashboardProvider({ 
  children, 
  initialDateRange = 'today',
  initialStartDate,
  initialEndDate 
}: DashboardProviderProps) {
  const dashboardData = useDashboardData(initialDateRange, initialStartDate, initialEndDate);

  return (
    <DashboardContext.Provider value={dashboardData}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

