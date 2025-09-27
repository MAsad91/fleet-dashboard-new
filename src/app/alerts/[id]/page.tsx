"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { TabbedInterface } from "@/components/ui/TabbedInterface";
import { useGetAlertByIdQuery } from "@/store/api/fleetApi";
import { ArrowLeft, AlertTriangle, AlertCircle, Clock, Calendar, Check, X, Car, User, Eye, Wifi, MapPin, Activity, BarChart3, FileText, ExternalLink } from "lucide-react";

export default function AlertDetailPage() {
  const router = useRouter();
  const params = useParams();
  const alertId = params.id as string;

  // Use real API data from alerts endpoint
  const { data: alertData, isLoading, error } = useGetAlertByIdQuery(parseInt(alertId));


  // Show no data message when no alert data is available
  if (!alertData) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alert Not Found</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">The requested alert could not be found.</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !alertData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="text-center text-red-600">
          <p>Failed to load alert details. Please try again.</p>
          <Button 
            onClick={() => router.back()} 
            variant="primary" 
            label="Back to Alerts"
            className="mt-4"
          />
        </div>
      </ProtectedRoute>
    );
  }

  const handleAcknowledge = () => {
    if (!alertData) return;
    console.log('Acknowledging alert:', alertData.id);
    // TODO: Implement acknowledge API call
  };

  const handleIgnore = () => {
    if (!alertData) return;
    console.log('Ignoring alert:', alertData.id);
    // TODO: Implement ignore API call
  };

  const handleResolve = () => {
    if (!alertData) return;
    console.log('Resolving alert:', alertData.id);
    // TODO: Implement resolve API call
  };

  // Tab content components
  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alert Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Title:</span>
              <span className="text-gray-900 dark:text-white">{alertData.title || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Message:</span>
              <span className="text-gray-900 dark:text-white text-sm">{alertData.message || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Alert Type:</span>
              <span className="text-gray-900 dark:text-white">{alertData.alert_type || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">System:</span>
              <span className="text-gray-900 dark:text-white">{alertData.system || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Severity:</span>
              <span className="text-gray-900 dark:text-white">{alertData.severity || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Created:</span>
              <span className="text-gray-900 dark:text-white">{alertData.created_at || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Read:</span>
              <span className="text-gray-900 dark:text-white">{alertData.read ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Ignored:</span>
              <span className="text-gray-900 dark:text-white">{alertData.ignored ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Resolved:</span>
              <span className="text-gray-900 dark:text-white">{alertData.resolved ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Context */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Context</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Vehicle:</span>
              <div className="text-right">
                <span className="text-gray-900 dark:text-white">{alertData.vehicle_info?.license_plate || 'N/A'}</span>
                <Button
                  variant="outlineDark"
                  label="View Vehicle"
                  icon={<Car className="h-3 w-3" />}
                  className="ml-2 px-2 py-1 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Driver:</span>
              <div className="text-right">
                <span className="text-gray-900 dark:text-white">
                  {typeof alertData.driver === 'object' && alertData.driver 
                    ? (alertData.driver.full_name || alertData.driver.display_name || alertData.driver.name || 'N/A')
                    : alertData.driver || 'N/A'
                  }
                </span>
                <Button
                  variant="outlineDark"
                  label="View Driver"
                  icon={<User className="h-3 w-3" />}
                  className="ml-2 px-2 py-1 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Device:</span>
              <div className="text-right">
                <span className="text-gray-900 dark:text-white">{alertData.device_id || 'N/A'}</span>
                <Button
                  variant="outlineDark"
                  label="View OBD Device"
                  icon={<Wifi className="h-3 w-3" />}
                  className="ml-2 px-2 py-1 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Similar Alerts:</span>
              <div className="text-right">
                <span className="text-gray-900 dark:text-white">5</span>
                <Button
                  variant="outlineDark"
                  label="View Similar Alerts"
                  icon={<ExternalLink className="h-3 w-3" />}
                  className="ml-2 px-2 py-1 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TelemetryTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">TELEMETRY TAB</h3>
        
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">ALERT PARAMETER CHART</h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="h-64 bg-white dark:bg-gray-800 rounded flex items-center justify-center">
              <div className="text-gray-500 dark:text-gray-400 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Temperature Chart (2h window around alert time)</p>
                <p className="text-sm mt-2">105°C Threshold</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">TELEMETRY DATA AT ALERT TIME</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Parameter</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Value</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Threshold</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Motor Temperature</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">112°C</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">CRITICAL</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">&gt;105°C</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Speed</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">65 km/h</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Normal</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">-</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Battery Level</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">72%</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Normal</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">-</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex space-x-2">
            <Button
              variant="outlineDark"
              label="Export Data"
              className="px-4 py-2"
            />
            <Button
              variant="outlineDark"
              label="View Full Telemetry"
              className="px-4 py-2"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const TimelineTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">TIMELINE TAB</h3>
        
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">ALERT HISTORY</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date & Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Event</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">User/System</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{alertData.created_at || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Alert created</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">System</td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{alertData.created_at || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Notification sent</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">System</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">RESPONSE TIMELINE</h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Add Note/Response:
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={4}
                placeholder="Enter your note or response..."
              />
            </div>
            <Button
              variant="outlineDark"
              label="Add Note"
              className="px-4 py-2"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Note: Notes and responses will be added to the alert timeline
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const RelatedTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">RELATED TAB</h3>
        
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">SIMILAR ALERTS</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Vehicle</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Value</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">2025-09-24</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">EV-9812</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">108°C</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Resolved</td>
                  <td className="py-3 px-4">
                    <Button
                      variant="outlineDark"
                      label="View"
                      icon={<Eye className="h-3 w-3" />}
                      className="px-2 py-1 text-xs"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Note: Showing similar alerts with the same alert type
          </p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">RELATED ENTITIES</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Entity Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">ID/Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Relationship</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Vehicle</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{alertData.vehicle_info?.license_plate || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Source of alert</td>
                  <td className="py-3 px-4">
                    <Button
                      variant="outlineDark"
                      label="View Vehicle"
                      icon={<Car className="h-3 w-3" />}
                      className="px-2 py-1 text-xs"
                    />
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Driver</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    {typeof alertData.driver === 'object' && alertData.driver 
                      ? (alertData.driver.full_name || alertData.driver.display_name || alertData.driver.name || 'N/A')
                      : alertData.driver || 'N/A'
                    }
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Assigned to vehicle</td>
                  <td className="py-3 px-4">
                    <Button
                      variant="outlineDark"
                      label="View Driver"
                      icon={<User className="h-3 w-3" />}
                      className="px-2 py-1 text-xs"
                    />
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">OBD Device</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{alertData.device_id || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Reporting device</td>
                  <td className="py-3 px-4">
                    <Button
                      variant="outlineDark"
                      label="View OBD"
                      icon={<Wifi className="h-3 w-3" />}
                      className="px-2 py-1 text-xs"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', content: <OverviewTab /> },
    { id: 'telemetry', label: 'Telemetry', content: <TelemetryTab /> },
    { id: 'timeline', label: 'Timeline', content: <TimelineTab /> },
    { id: 'related', label: 'Related', content: <RelatedTab /> },
  ];

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="space-y-6">
        {/* HEADER: Back Button + Compact Header */}
        <div className="relative">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              onClick={() => router.back()}
              variant="outlineDark"
              label="Back"
              icon={<ArrowLeft className="h-4 w-4" />}
              className="px-4 py-2 rounded-lg"
            />
          </div>

          {/* Compact Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Alert ID: {alertData.id}   {getSeverityIcon(alertData.severity)} {alertData.severity?.toUpperCase()}: {alertData.title}   Status: {alertData.status_label}   Created: {formatTimeAgo(alertData.created_at)}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outlineDark"
                  label="Mark Read"
                  icon={<Eye className="h-3 w-3" />}
                  className="px-3 py-1 text-sm"
                  onClick={handleAcknowledge}
                />
                <Button
                  variant="outlineDark"
                  label="Ignore"
                  icon={<X className="h-3 w-3" />}
                  className="px-3 py-1 text-sm"
                  onClick={handleIgnore}
                />
                <Button
                  variant="outlineDark"
                  label="Resolve"
                  icon={<Check className="h-3 w-3" />}
                  className="px-3 py-1 text-sm"
                  onClick={handleResolve}
                />
                <Button
                  variant="outlineDark"
                  label="Delete"
                  icon={<X className="h-3 w-3" />}
                  className="px-3 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">System</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{alertData.system || 'N/A'}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Severity</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{alertData.severity || 'N/A'}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{alertData.status_label || 'New'}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Count</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">5</div>
          </div>
        </div>

        {/* TABBED INTERFACE */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <TabbedInterface tabs={tabs} defaultTab="overview" />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
