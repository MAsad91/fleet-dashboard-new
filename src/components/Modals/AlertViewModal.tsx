"use client";

import { Modal } from "@/components/ui/Modal";
import { useGetAlertByIdQuery } from "@/store/api/fleetApi";
import { AlertTriangle, AlertCircle, AlertOctagon, Calendar, Car, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertId: number | null;
}

export function AlertViewModal({ isOpen, onClose, alertId }: AlertViewModalProps) {
  const { data: alert, isLoading, error } = useGetAlertByIdQuery(alertId!, {
    skip: !alertId,
  });

  const getSeverityIcon = (severity: string) => {
    const severityConfig = {
      low: { icon: AlertCircle, className: "text-gray-600" },
      medium: { icon: AlertTriangle, className: "text-yellow-600" },
      high: { icon: AlertTriangle, className: "text-orange-600" },
      critical: { icon: AlertOctagon, className: "text-red-600" },
    };
    
    const config = severityConfig[severity as keyof typeof severityConfig] || { 
      icon: AlertCircle, 
      className: "text-gray-600" 
    };
    
    return config;
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { className: "bg-gray-100 text-gray-800", label: "Low" },
      medium: { className: "bg-yellow-100 text-yellow-800", label: "Medium" },
      high: { className: "bg-orange-100 text-orange-800", label: "High" },
      critical: { className: "bg-red-100 text-red-800", label: "Critical" },
    };
    
    const config = severityConfig[severity as keyof typeof severityConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      label: severity
    };
    
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.className)}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { className: "bg-red-100 text-red-800", label: "Active" },
      acknowledged: { className: "bg-yellow-100 text-yellow-800", label: "Acknowledged" },
      ignored: { className: "bg-gray-100 text-gray-800", label: "Ignored" },
      resolved: { className: "bg-green-100 text-green-800", label: "Resolved" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      label: status 
    };
    
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.className)}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Alert Details" size="lg">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </Modal>
    );
  }

  if (error || !alert) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Alert Details" size="lg">
        <div className="text-center text-red-600 py-8">
          Error loading alert details
        </div>
      </Modal>
    );
  }

  const severityIcon = getSeverityIcon(alert.severity);
  const Icon = severityIcon.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alert Details" size="lg">
      <div className="space-y-6">
        {/* Alert Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn("p-2 rounded-lg", severityIcon.className)}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {alert.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                {getSeverityBadge(alert.severity)}
                {getStatusBadge(alert.status || 'unknown')}
              </div>
            </div>
          </div>
        </div>

        {/* Alert Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Alert ID
              </label>
              <p className="text-sm text-gray-900 dark:text-white">#{alert.id}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Severity
              </label>
              <div className="flex items-center space-x-2">
                <Icon className={cn("h-4 w-4", severityIcon.className)} />
                <span className="text-sm text-gray-900 dark:text-white capitalize">
                  {alert.severity}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Status
              </label>
              {getStatusBadge(alert.status || 'unknown')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Vehicle
              </label>
              <div className="flex items-center space-x-2">
                <Car className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {typeof alert.vehicle === 'string' ? alert.vehicle : typeof alert.vehicle === 'object' && alert.vehicle?.license_plate || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Created At
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(alert.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Driver
              </label>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">
                  N/A
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Description */}
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Description
          </label>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-900 dark:text-white">
              {alert.description || "No description available"}
            </p>
          </div>
        </div>

        {/* Alert Message */}
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Message
          </label>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-900 dark:text-white">
              {alert.description || "No description available"}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
