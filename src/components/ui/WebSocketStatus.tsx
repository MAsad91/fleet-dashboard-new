"use client";

import { useWebSocket } from '@/contexts/WebSocketContext';
import { Wifi, WifiOff, AlertCircle, Loader2 } from 'lucide-react';

export function WebSocketStatus() {
  const { connectionStatus, isConnected } = useWebSocket();

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <Wifi className="h-4 w-4" />,
          text: 'Live',
          className: 'text-green-600 dark:text-green-400',
          bgClassName: 'bg-green-100 dark:bg-green-900/20',
        };
      case 'connecting':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Connecting...',
          className: 'text-yellow-600 dark:text-yellow-400',
          bgClassName: 'bg-yellow-100 dark:bg-yellow-900/20',
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: 'Connection Error',
          className: 'text-red-600 dark:text-red-400',
          bgClassName: 'bg-red-100 dark:bg-red-900/20',
        };
      case 'disconnected':
      default:
        return {
          icon: <WifiOff className="h-4 w-4" />,
          text: 'Offline',
          className: 'text-gray-600 dark:text-gray-400',
          bgClassName: 'bg-gray-100 dark:bg-gray-900/20',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgClassName}`}>
      <span className={`mr-1 ${statusConfig.className}`}>
        {statusConfig.icon}
      </span>
      <span className={statusConfig.className}>
        {statusConfig.text}
      </span>
    </div>
  );
}
