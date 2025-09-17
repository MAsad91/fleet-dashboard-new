"use client";

import { cn } from "@/lib/utils";
import { WrenchIcon } from "@/components/Layouts/sidebar/icons";

type PropsType = {
  className?: string;
};

export function MaintenanceSchedule({ className }: PropsType) {
  // Mock maintenance data
  const maintenanceData = [
    {
      id: "M001",
      vehicle: "Truck Alpha",
      type: "Oil Change",
      dueDate: "2024-01-15",
      status: "overdue",
      priority: "high",
      assignedTo: "Service Center A",
    },
    {
      id: "M002",
      vehicle: "Truck Beta",
      type: "Brake Inspection",
      dueDate: "2024-01-20",
      status: "scheduled",
      priority: "medium",
      assignedTo: "Service Center B",
    },
    {
      id: "M003",
      vehicle: "Truck Gamma",
      type: "Tire Rotation",
      dueDate: "2024-01-25",
      status: "scheduled",
      priority: "low",
      assignedTo: "Service Center A",
    },
    {
      id: "M004",
      vehicle: "Truck Delta",
      type: "Engine Check",
      dueDate: "2024-01-30",
      status: "completed",
      priority: "high",
      assignedTo: "Service Center C",
    },
    {
      id: "M005",
      vehicle: "Truck Echo",
      type: "Transmission Service",
      dueDate: "2024-02-05",
      status: "scheduled",
      priority: "medium",
      assignedTo: "Service Center B",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
      case "scheduled":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
      case "completed":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "in-progress":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={cn("rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark", className)}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <WrenchIcon className="h-5 w-5 text-primary" />
          <h3 className="text-title-sm font-semibold text-dark dark:text-white">
            Maintenance Schedule
          </h3>
        </div>
        <p className="text-sm text-body-color dark:text-body-color-dark">
          Upcoming and overdue maintenance tasks
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-600">
              <th className="pb-3 text-left text-sm font-medium text-dark dark:text-white">
                Vehicle
              </th>
              <th className="pb-3 text-left text-sm font-medium text-dark dark:text-white">
                Type
              </th>
              <th className="pb-3 text-left text-sm font-medium text-dark dark:text-white">
                Due Date
              </th>
              <th className="pb-3 text-left text-sm font-medium text-dark dark:text-white">
                Status
              </th>
              <th className="pb-3 text-left text-sm font-medium text-dark dark:text-white">
                Priority
              </th>
              <th className="pb-3 text-left text-sm font-medium text-dark dark:text-white">
                Assigned To
              </th>
            </tr>
          </thead>
          <tbody>
            {maintenanceData.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-4 text-sm font-medium text-dark dark:text-white">
                  {item.vehicle}
                </td>
                <td className="py-4 text-sm text-body-color dark:text-body-color-dark">
                  {item.type}
                </td>
                <td className="py-4 text-sm text-body-color dark:text-body-color-dark">
                  {formatDate(item.dueDate)}
                </td>
                <td className="py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getStatusColor(item.status)
                  )}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </td>
                <td className="py-4">
                  <span className={cn(
                    "text-sm font-medium",
                    getPriorityColor(item.priority)
                  )}>
                    {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                  </span>
                </td>
                <td className="py-4 text-sm text-body-color dark:text-body-color-dark">
                  {item.assignedTo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {maintenanceData.filter(item => item.status === "overdue").length}
          </div>
          <p className="text-sm text-red-600 dark:text-red-400">Overdue</p>
        </div>
        
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {maintenanceData.filter(item => item.status === "scheduled").length}
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-400">Scheduled</p>
        </div>
        
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {maintenanceData.filter(item => item.status === "completed").length}
          </div>
          <p className="text-sm text-green-600 dark:text-green-400">Completed</p>
        </div>
      </div>
    </div>
  );
}
