import { useEffect, useRef } from 'react';
import { useWebSocketSubscription } from '@/contexts/WebSocketContext';

interface UseRealtimeDataOptions {
  channel: string;
  refetch: () => void;
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * Hook that subscribes to WebSocket updates and automatically refetches data
 * when updates are received. Includes debouncing to prevent excessive refetches.
 */
export function useRealtimeData({ 
  channel, 
  refetch, 
  enabled = true, 
  debounceMs = 1000 
}: UseRealtimeDataOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const handleUpdate = (data: any) => {
    if (!enabled) return;

    const now = Date.now();
    lastUpdateRef.current = now;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the refetch
    timeoutRef.current = setTimeout(() => {
      // Only refetch if this is still the latest update
      if (lastUpdateRef.current === now) {
        console.log(`Realtime update received on channel ${channel}:`, data);
        refetch();
      }
    }, debounceMs);
  };

  useWebSocketSubscription(channel, handleUpdate);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isEnabled: enabled,
    channel,
  };
}

/**
 * Hook for real-time updates on specific entity types
 */
export function useRealtimeEntityUpdates(entityType: string, refetch: () => void, enabled = true) {
  return useRealtimeData({
    channel: `${entityType}_updates`,
    refetch,
    enabled,
    debounceMs: 500, // Faster updates for entity changes
  });
}

/**
 * Hook for real-time dashboard updates
 */
export function useRealtimeDashboard(refetch: () => void, enabled = true) {
  return useRealtimeData({
    channel: 'dashboard_updates',
    refetch,
    enabled,
    debounceMs: 2000, // Slower updates for dashboard
  });
}

/**
 * Hook for real-time alerts
 */
export function useRealtimeAlerts(refetch: () => void, enabled = true) {
  return useRealtimeData({
    channel: 'alerts_updates',
    refetch,
    enabled,
    debounceMs: 300, // Very fast updates for alerts
  });
}

/**
 * Hook for real-time vehicle telemetry
 */
export function useRealtimeTelemetry(vehicleId: string, refetch: () => void, enabled = true) {
  return useRealtimeData({
    channel: `vehicle_${vehicleId}_telemetry`,
    refetch,
    enabled,
    debounceMs: 1000,
  });
}
