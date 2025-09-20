"use client";

import { useState, useEffect } from "react";
import { useGetScheduledMaintenanceByIdQuery } from "@/store/api/fleetApi";
import { Modal } from "@/components/ui/Modal";
import { Wrench, Calendar, Clock, CheckCircle, AlertCircle, Car, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaintenanceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceId: string | null;
}

export function MaintenanceViewModal({ isOpen, onClose, maintenanceId }: MaintenanceViewModalProps) {
  const { data: maintenance, isLoading, error } = useGetScheduledMaintenanceByIdQuery(maintenanceId || "", {
    skip: !maintenanceId || !isOpen,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { className: "bg-gray-100 text-gray-800", icon: Clock, label: "Scheduled" },
      in_progress: { className: "bg-yellow-100 text-yellow-800", icon: Wrench, label: "In Progress" },
      completed: { className: "bg-green-100 text-green-800", icon: CheckCircle, label: "Completed" },
      overdue: { className: "bg-red-100 text-red-800", icon: AlertCircle, label: "Overdue" },
      cancelled: { className: "bg-red-100 text-red-800", icon: AlertCircle, label: "Cancelled" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      icon: Clock,
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

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { className: "bg-green-100 text-green-800", label: "Low" },
      medium: { className: "bg-yellow-100 text-yellow-800", label: "Medium" },
      high: { className: "bg-orange-100 text-orange-800", label: "High" },
      critical: { className: "bg-red-100 text-red-800", label: "Critical" },
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      label: priority || "Unknown"
    };
    
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.className)}>
        {config.label}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Maintenance Details">
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">
            Error loading maintenance details
          </div>
        ) : maintenance ? (
          <>
            {/* Maintenance Header */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Wrench className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {maintenance.title || "Maintenance Task"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {maintenance.description || "No description available"}
                </p>
              </div>
            </div>

            {/* Maintenance Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Task Details</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Title:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{maintenance.title || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Type:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{maintenance.maintenance_type || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority:</span>
                    {getPriorityBadge(maintenance.priority)}
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                    {getStatusBadge(maintenance.status)}
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Cost:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {maintenance.estimated_cost ? `$${maintenance.estimated_cost}` : "N/A"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Duration:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {maintenance.estimated_duration ? `${maintenance.estimated_duration} hours` : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Schedule & Assignment</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle:</span>
                    <div className="flex items-center space-x-1">
                      <Car className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {maintenance.vehicle?.license_plate || "Unassigned"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned To:</span>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {maintenance.assigned_to?.name || "Unassigned"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Scheduled Date:</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {maintenance.scheduled_date 
                          ? new Date(maintenance.scheduled_date).toLocaleDateString()
                          : "Not scheduled"
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date:</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {maintenance.due_date 
                          ? new Date(maintenance.due_date).toLocaleDateString()
                          : "No due date"
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Date:</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {maintenance.completed_date 
                          ? new Date(maintenance.completed_date).toLocaleDateString()
                          : "Not completed"
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {maintenance.created_at 
                        ? new Date(maintenance.created_at).toLocaleDateString()
                        : "N/A"
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {maintenance.description && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Description</h4>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {maintenance.description}
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            {maintenance.notes && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Notes</h4>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {maintenance.notes}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No maintenance data available
          </div>
        )}
      </div>
    </Modal>
  );
}
