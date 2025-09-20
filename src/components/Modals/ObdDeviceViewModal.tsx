"use client";

import { useState, useEffect } from "react";
import { useGetObdDeviceByIdQuery } from "@/store/api/fleetApi";
import { Modal } from "@/components/ui/Modal";
import { Activity, Wifi, WifiOff, Battery, MapPin, Calendar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface ObdDeviceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string | null;
}

export function ObdDeviceViewModal({ isOpen, onClose, deviceId }: ObdDeviceViewModalProps) {
  const { data: device, isLoading, error } = useGetObdDeviceByIdQuery(deviceId || "", {
    skip: !deviceId || !isOpen,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      online: { className: "bg-green-100 text-green-800", icon: Wifi, label: "Online" },
      offline: { className: "bg-red-100 text-red-800", icon: WifiOff, label: "Offline" },
      maintenance: { className: "bg-yellow-100 text-yellow-800", icon: Activity, label: "Maintenance" },
      inactive: { className: "bg-gray-100 text-gray-800", icon: WifiOff, label: "Inactive" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      icon: WifiOff,
      label: status || "Unknown"
    };
    
    const Icon = config.icon;
    
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1", config.className)}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  const getDeviceTypeBadge = (deviceType: string) => {
    const typeConfig = {
      elm327: { className: "bg-blue-100 text-blue-800", label: "ELM327" },
      obd2: { className: "bg-green-100 text-green-800", label: "OBD2" },
      canbus: { className: "bg-purple-100 text-purple-800", label: "CAN Bus" },
      bluetooth: { className: "bg-indigo-100 text-indigo-800", label: "Bluetooth" },
      wifi: { className: "bg-orange-100 text-orange-800", label: "WiFi" },
      cellular: { className: "bg-teal-100 text-teal-800", label: "Cellular" },
    };
    
    const config = typeConfig[deviceType?.toLowerCase() as keyof typeof typeConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      label: deviceType || "Unknown"
    };
    
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.className)}>
        {config.label}
      </span>
    );
  };

  const getBatteryLevel = (batteryLevel: number) => {
    if (batteryLevel >= 80) return { color: "text-green-600", bg: "bg-green-100" };
    if (batteryLevel >= 50) return { color: "text-yellow-600", bg: "bg-yellow-100" };
    if (batteryLevel >= 20) return { color: "text-orange-600", bg: "bg-orange-100" };
    return { color: "text-red-600", bg: "bg-red-100" };
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="OBD Device Details">
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">
            Error loading device details
          </div>
        ) : device ? (
          <>
            {/* Device Header */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {device.device_id}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {device.model || "Unknown Model"}
                </p>
              </div>
            </div>

            {/* Device Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Device Information</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Device ID:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{device.device_id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Model:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{device.model || "Unknown"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Serial Number:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{device.serial_number || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Firmware Version:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{device.firmware_version || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Type:</span>
                    {getDeviceTypeBadge(device.device_type)}
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                    {getStatusBadge(device.status)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Connection Details</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {device.vehicle?.license_plate || "Unassigned"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Battery Level:</span>
                    <div className="flex items-center space-x-2">
                      <div className={cn("p-1 rounded", getBatteryLevel(device.battery_level || 0).bg)}>
                        <Battery className={cn("h-4 w-4", getBatteryLevel(device.battery_level || 0).color)} />
                      </div>
                      <span className={cn("text-sm font-medium", getBatteryLevel(device.battery_level || 0).color)}>
                        {device.battery_level || 0}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Seen:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {device.last_seen 
                        ? new Date(device.last_seen).toLocaleString()
                        : "Never"
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Report Interval:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {device.report_interval_sec ? `${device.report_interval_sec}s` : "N/A"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">CAN Baud Rate:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {device.can_baud_rate || "N/A"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active:</span>
                    <span className={cn(
                      "text-sm font-medium",
                      device.is_active ? "text-green-600" : "text-red-600"
                    )}>
                      {device.is_active ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Installation Details */}
            {device.installed_at && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Installation Details</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>Installed on: {new Date(device.installed_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No device data available
          </div>
        )}
      </div>
    </Modal>
  );
}
