"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

interface WebSocketContextType {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  subscribe: (channel: string, callback: (data: any) => void) => () => void;
  unsubscribe: (channel: string, callback: (data: any) => void) => void;
  sendMessage: (channel: string, data: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const subscribersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  
  // Temporarily disable WebSocket connection
  const isWebSocketEnabled = false;

  const connect = () => {
    try {
      // Get the base URL from environment or use default
      const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
      const wsUrl = `${baseUrl}/ws/fleet/`;
      
      // Get auth token
      const token = localStorage.getItem('authToken') || 
                   localStorage.getItem('access_token') ||
                   (typeof document !== 'undefined' ? 
                    document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1] : 
                    null);

      const wsUrlWithAuth = token ? `${wsUrl}?token=${token}` : wsUrl;
      
      wsRef.current = new WebSocket(wsUrlWithAuth);
      
      setConnectionStatus('connecting');
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { channel, data } = message;
          
          // Notify subscribers
          const channelSubscribers = subscribersRef.current.get(channel);
          if (channelSubscribers) {
            channelSubscribers.forEach(callback => {
              try {
                callback(data);
              } catch (error) {
                console.error('Error in WebSocket callback:', error);
              }
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect if not a manual close
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          scheduleReconnect();
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
      scheduleReconnect();
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
    reconnectAttemptsRef.current++;
    
    console.log(`Scheduling WebSocket reconnect attempt ${reconnectAttemptsRef.current} in ${delay}ms`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  };

  const subscribe = (channel: string, callback: (data: any) => void) => {
    if (!subscribersRef.current.has(channel)) {
      subscribersRef.current.set(channel, new Set());
    }
    
    subscribersRef.current.get(channel)!.add(callback);
    
    // Return unsubscribe function
    return () => unsubscribe(channel, callback);
  };

  const unsubscribe = (channel: string, callback: (data: any) => void) => {
    const channelSubscribers = subscribersRef.current.get(channel);
    if (channelSubscribers) {
      channelSubscribers.delete(callback);
      if (channelSubscribers.size === 0) {
        subscribersRef.current.delete(channel);
      }
    }
  };

  const sendMessage = (channel: string, data: any) => {
    if (wsRef.current && isConnected) {
      try {
        wsRef.current.send(JSON.stringify({ channel, data }));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  };

  useEffect(() => {
    // Only connect if we're in the browser and WebSocket is enabled
    if (typeof window !== 'undefined' && isWebSocketEnabled) {
      connect();
    } else if (!isWebSocketEnabled) {
      console.log('🔌 WebSocket connection disabled');
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [isWebSocketEnabled]);

  const value: WebSocketContextType = {
    isConnected,
    connectionStatus,
    subscribe,
    unsubscribe,
    sendMessage,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

// Hook for subscribing to specific channels
export function useWebSocketSubscription(channel: string, callback: (data: any) => void, deps: any[] = []) {
  const { subscribe, unsubscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribeFn = subscribe(channel, callback);
    return unsubscribeFn;
  }, [channel, subscribe, ...deps]);

  useEffect(() => {
    // Re-subscribe when callback changes
    const unsubscribeFn = subscribe(channel, callback);
    return unsubscribeFn;
  }, [callback, channel, subscribe]);
}
