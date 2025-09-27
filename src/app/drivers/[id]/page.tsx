"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetDriverByIdQuery, useGetDriverDocumentsQuery, useGetTripsQuery, useGetAlertsQuery, useGetDriverPerformanceByIdQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { TabbedInterface } from "@/components/ui/TabbedInterface";
import { ArrowLeft, Edit, Trash2, User, Phone, FileText, Calendar, Clock, AlertTriangle, Star, MapPin, Download, Eye, Upload, Filter, BarChart3 } from "lucide-react";

export default function DriverDetailPage() {
  const router = useRouter();
  const params = useParams();
  const driverId = params.id as string;
  
  const { data: driverData, isLoading, error } = useGetDriverByIdQuery(driverId);
  const { data: documentsData } = useGetDriverDocumentsQuery();
  const { data: tripsData } = useGetTripsQuery({ driver: driverId, status: 'completed' });
  const { data: alertsData } = useGetAlertsQuery({});
  const { data: performanceData } = useGetDriverPerformanceByIdQuery(driverId);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !driverData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="text-center text-red-600">
            <p>Failed to load driver details. Please try again.</p>
            <Button 
              onClick={() => router.back()} 
              variant="primary" 
              label="Back to Drivers"
              className="mt-4"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const driver = driverData.driver || driverData;
  const user = driver.user || {};
  const documents = documentsData?.results?.filter((doc: any) => doc.driver === parseInt(driverId)) || [];
  const trips = tripsData?.results || [];
  const alerts = alertsData?.results || [];
  const performance = performanceData || {};

  // Tab content components
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Driver Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">DRIVER INFORMATION</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Fleet Operator:</span>
              <span className="text-gray-900 dark:text-white">Acme Logistics (ID: {driver.fleet_operator || 'N/A'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Name:</span>
              <span className="text-gray-900 dark:text-white">{user.first_name} {user.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Username:</span>
              <span className="text-gray-900 dark:text-white">{user.username || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Email:</span>
              <span className="text-gray-900 dark:text-white">{user.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Phone:</span>
              <span className="text-gray-900 dark:text-white">{driver.phone_number || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">License Number:</span>
              <span className="text-gray-900 dark:text-white">{driver.license_number || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Experience:</span>
              <span className="text-gray-900 dark:text-white">{driver.experience_years || 'N/A'} years</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Address:</span>
              <span className="text-gray-900 dark:text-white">{driver.address || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Date of Birth:</span>
              <span className="text-gray-900 dark:text-white">{driver.date_of_birth || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Emergency Contact:</span>
              <span className="text-gray-900 dark:text-white">{driver.emergency_contact || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Joined:</span>
              <span className="text-gray-900 dark:text-white">{driver.date_joined || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="text-gray-900 dark:text-white">{driver.status || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Rating:</span>
              <span className="text-gray-900 dark:text-white">{driver.rating || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SAFETY STATISTICS</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {performance.safety_score || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Safety Score</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">/100</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {performance.eco_score || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Eco Score</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">/100</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {performance.number_of_harsh_brakes || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Harsh Brakes</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">(last 30d)</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {performance.average_speed_kph || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Speed</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">kph</div>
          </div>
        </div>
      </div>
    </div>
  );

  const DocumentsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">DOCUMENTS TAB</h3>
          <div className="flex space-x-2">
            <Button
              variant="outlineDark"
              label="Upload Document"
              icon={<Upload className="h-4 w-4" />}
              className="px-3 py-1 text-sm"
            />
            <Button
              variant="outlineDark"
              label="View All Documents →"
              className="px-3 py-1 text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Number</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Issued</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Expires</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? (
                documents.map((doc: any) => (
                  <tr key={doc.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{doc.doc_type || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{doc.doc_number || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{doc.issue_date || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{doc.expiry_date || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{doc.is_active ? 'Active' : 'Inactive'}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outlineDark"
                          label="View"
                          icon={<Eye className="h-3 w-3" />}
                          className="px-2 py-1 text-xs"
                        />
                        <Button
                          variant="outlineDark"
                          label="Download"
                          icon={<Download className="h-3 w-3" />}
                          className="px-2 py-1 text-xs"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No documents found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const TripsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">TRIPS TAB</h3>
          <div className="flex space-x-2">
            <Button
              variant="outlineDark"
              label="Filter ▼"
              icon={<Filter className="h-4 w-4" />}
              className="px-3 py-1 text-sm"
            />
            <Button
              variant="outlineDark"
              label="View All Driver Trips →"
              className="px-3 py-1 text-sm"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex space-x-2">
            <Button variant="outlineDark" label="All" className="px-3 py-1 text-sm" />
            <Button variant="outlineDark" label="In Progress" className="px-3 py-1 text-sm" />
            <Button variant="outlineDark" label="Completed" className="px-3 py-1 text-sm" />
            <Button variant="outlineDark" label="Cancelled" className="px-3 py-1 text-sm" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Trip ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Vehicle</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date/Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Duration</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.length > 0 ? (
                trips.map((trip: any) => (
                  <tr key={trip.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{trip.trip_id || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{trip.vehicle || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{trip.scheduled_start_time || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">2h 30m</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{trip.status || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outlineDark"
                        label="View Details"
                        icon={<Eye className="h-3 w-3" />}
                        className="px-2 py-1 text-xs"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No trips found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const LogsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">LOGS TAB</h3>
          <div className="flex space-x-2">
            <Button
              variant="outlineDark"
              label="Filter ▼"
              icon={<Filter className="h-4 w-4" />}
              className="px-3 py-1 text-sm"
            />
            <Button
              variant="outlineDark"
              label="View All Driver Logs →"
              className="px-3 py-1 text-sm"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex space-x-2">
            <Button variant="outlineDark" label="All" className="px-3 py-1 text-sm" />
            <Button variant="outlineDark" label="Regular" className="px-3 py-1 text-sm" />
            <Button variant="outlineDark" label="Events" className="px-3 py-1 text-sm" />
            <Button variant="outlineDark" label="Date Range: Today ▼" className="px-3 py-1 text-sm" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Trip</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Vehicle</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Event</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Location</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-3 px-4 text-gray-900 dark:text-white">13:45:22</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">T-2025-98</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">EV-9012</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">-</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">Gachibowli Road</td>
                <td className="py-3 px-4">
                  <Button
                    variant="outlineDark"
                    label="Details"
                    icon={<Eye className="h-3 w-3" />}
                    className="px-2 py-1 text-xs"
                  />
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-3 px-4 text-gray-900 dark:text-white">12:30:15</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">T-2025-98</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">EV-9012</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">-</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">Hitech City</td>
                <td className="py-3 px-4">
                  <Button
                    variant="outlineDark"
                    label="Details"
                    icon={<Eye className="h-3 w-3" />}
                    className="px-2 py-1 text-xs"
                  />
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-3 px-4 text-gray-900 dark:text-white">12:15:00</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">T-2025-98</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">EV-9012</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">Start</td>
                <td className="py-3 px-4 text-gray-900 dark:text-white">Madhapur</td>
                <td className="py-3 px-4">
                  <Button
                    variant="outlineDark"
                    label="Details"
                    icon={<Eye className="h-3 w-3" />}
                    className="px-2 py-1 text-xs"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const AlertsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ALERTS TAB</h3>
          <div className="flex space-x-2">
            <Button
              variant="outlineDark"
              label="Filter ▼"
              icon={<Filter className="h-4 w-4" />}
              className="px-3 py-1 text-sm"
            />
            <Button
              variant="outlineDark"
              label="View All Driver Alerts →"
              className="px-3 py-1 text-sm"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex space-x-2">
            <Button variant="outlineDark" label="Active" className="px-3 py-1 text-sm" />
            <Button variant="outlineDark" label="Resolved" className="px-3 py-1 text-sm" />
            <Button variant="outlineDark" label="All" className="px-3 py-1 text-sm" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-400 text-center">No active alerts for this driver.</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">ALERT HISTORY</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Sev.</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Message</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.length > 0 ? (
                    alerts.map((alert: any) => (
                      <tr key={alert.id} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 px-4 text-gray-900 dark:text-white">{alert.severity || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">{alert.created_at || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">{alert.message || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">{alert.status_label || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outlineDark"
                            label="View Details"
                            icon={<Eye className="h-3 w-3" />}
                            className="px-2 py-1 text-xs"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No alert history found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PerformanceTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">PERFORMANCE TAB (Admin Only)</h3>
          <div className="flex space-x-2">
            <Button
              variant="outlineDark"
              label="Date Range ▼"
              className="px-3 py-1 text-sm"
            />
            <Button
              variant="outlineDark"
              label="View Full Performance →"
              className="px-3 py-1 text-sm"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">KEY METRICS</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {performance.safety_score || 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Safety Score</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">/100</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {performance.eco_score || 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Eco Score</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">/100</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {driver.rating || 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">/5.0</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {trips.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Trips Completed</div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">PERFORMANCE HISTORY</h4>
          <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Performance metrics chart over time</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">PERFORMANCE BREAKDOWN</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Period</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Avg Speed (kph)</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Distance (km)</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Harsh Brakes</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Accidents</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">Last Month</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{performance.average_speed_kph || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{performance.distance_covered_km || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{performance.number_of_harsh_brakes || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{performance.number_of_accidents || 'N/A'}</td>
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
    { id: 'documents', label: 'Documents', content: <DocumentsTab /> },
    { id: 'trips', label: 'Trips', content: <TripsTab /> },
    { id: 'logs', label: 'Logs', content: <LogsTab /> },
    { id: 'alerts', label: 'Alerts', content: <AlertsTab /> },
    { id: 'performance', label: 'Performance', content: <PerformanceTab /> },
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
                  {user.first_name} {user.last_name} ({user.username})   Phone: {driver.phone_number}   License: {driver.license_number}   Status: {driver.status}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outlineDark"
                  label="Edit"
                  className="px-3 py-1 text-sm"
                />
                <Button
                  variant="outlineDark"
                  label="Suspend"
                  className="px-3 py-1 text-sm"
                />
                <Button
                  variant="outlineDark"
                  label="Delete"
                  className="px-3 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rating</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{driver.rating || 'N/A'}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Experience</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{driver.experience_years || 'N/A'} years</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trips (completed, 30d)</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{trips.length}</div>
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