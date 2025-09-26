"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useGetAlertsQuery, useAcknowledgeAlertMutation, useIgnoreAlertMutation, useResolveAlertLegacyMutation, useDeleteAlertMutation, useGetAlertByIdQuery, useUpdateAlertMutation, useGetDriversQuery, useGetAlertsDashboardStatsQuery, useGetAlertsTrendsQuery, useListVehiclesQuery } from "../../store/api/fleetApi";
import { setAlertsFilters, setAlertsPagination } from "../../store/slices/alertsUISlice";
import ProtectedRoute from "../../components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Search, Plus, Check, X, Eye, Edit, Trash, AlertTriangle, AlertCircle, AlertOctagon, ArrowLeft, Save, Clock, User, Car, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeleteConfirmationModal } from "@/components/Modals/DeleteConfirmationModal";

export default function AlertsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector((state) => state.alertsUI);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  
  // Full-page view states
  const [currentView, setCurrentView] = useState<'list' | 'view' | 'edit'>('list');
  const [alertData, setAlertData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { data: alertsData, isLoading, error } = useGetAlertsQuery({
    page: pagination.page,
    limit: pagination.limit,
    status: filters.status,
    severity: filters.severity,
    vehicle: filters.vehicle_id,
    system: filters.alert_type,
  });

  // API hooks for full-page views
  const { 
    data: alertDetails, 
    isLoading: alertLoading, 
    error: alertError 
  } = useGetAlertByIdQuery(selectedAlertId!, {
    skip: !selectedAlertId
  });

  // Get drivers data to populate driver names
  const { data: driversData } = useGetDriversQuery({});

  // Get dashboard stats for KPI cards
  const { data: dashboardStats } = useGetAlertsDashboardStatsQuery();
  
  // Get trends data for distribution charts
  const { data: trendsData } = useGetAlertsTrendsQuery({ dateRange: 'today' });
  
  // Get vehicles data for vehicle filter
  const { data: vehiclesData } = useListVehiclesQuery({ page: 1 });

  // Helper function to get driver name by ID
  const getDriverName = (driverId: any) => {
    if (!driverId || !driversData?.results) return null;
    
    const driver = driversData.results.find((d: any) => 
      d.id === driverId || d.id === String(driverId)
    );
    
    if (driver) {
      return driver.name || 
             driver.username || 
             (driver.first_name && driver.last_name ? `${driver.first_name} ${driver.last_name}` : null) ||
             driver.full_name ||
             driver.display_name;
    }
    
    return null;
  };

  const [updateAlert, { isLoading: isUpdating }] = useUpdateAlertMutation();

  // Update alert data when API response changes
  useEffect(() => {
    if (alertDetails) {
      setAlertData(alertDetails);
      setFormData(alertDetails);
    }
  }, [alertDetails]);

  // Client-side filtering for alert_type and search
  const allFilteredAlerts = alertsData?.results?.filter((alert: any) => {
    // Debug: Log first alert to see available fields
    if (alertsData?.results?.indexOf(alert) === 0) {
      console.log('First alert fields:', Object.keys(alert));
      console.log('First alert data:', alert);
      console.log('Vehicle field:', alert.vehicle);
      console.log('Driver field:', alert.driver);
      console.log('Vehicle info field:', alert.vehicle_info);
    }

    // Filter by alert type (client-side since API doesn't support it properly)
    if (filters.alert_type && filters.alert_type !== 'all' && filters.alert_type !== undefined) {
      const alertType = alert.alert_type || alert.source || alert.category;
      if (!alertType || !alertType.toLowerCase().includes(filters.alert_type.toLowerCase())) {
        return false;
      }
    }

    // Filter by search term
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      const searchableFields = [
        alert.title,
        alert.description,
        alert.message,
        alert.vehicle,
        alert.severity,
        alert.status,
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchableFields.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  }) || [];

  // Pagination for client-side filtered results
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const filteredAlerts = allFilteredAlerts.slice(startIndex, endIndex);
  const totalFilteredCount = allFilteredAlerts.length;

  const [acknowledgeAlert] = useAcknowledgeAlertMutation();
  const [ignoreAlert] = useIgnoreAlertMutation();
  const [resolveAlert] = useResolveAlertLegacyMutation();
  const [deleteAlert] = useDeleteAlertMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setAlertsFilters({ search: e.target.value }));
    dispatch(setAlertsPagination({ page: 1 })); // Reset pagination
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setAlertsFilters({ status: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setAlertsPagination({ page: 1 })); // Reset pagination
  };

  const handleSeverityFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setAlertsFilters({ severity: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setAlertsPagination({ page: 1 })); // Reset pagination
  };

  const handleAlertTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setAlertsFilters({ alert_type: e.target.value === "all" ? undefined : e.target.value }));
    dispatch(setAlertsPagination({ page: 1 })); // Reset pagination
  };

  const handlePageChange = (page: number) => {
    dispatch(setAlertsPagination({ page }));
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert({ id: parseInt(alertId) }).unwrap();
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
    }
  };

  const handleIgnoreAlert = async (alertId: string) => {
    try {
      await ignoreAlert({ id: parseInt(alertId) }).unwrap();
    } catch (error) {
      console.error("Failed to ignore alert:", error);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveAlert({ id: parseInt(alertId) }).unwrap();
    } catch (error) {
      console.error("Failed to resolve alert:", error);
    }
  };

  const handleSelectAll = () => {
    if (selectedAlerts.length === filteredAlerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(filteredAlerts.map((alert: any) => alert.id.toString()));
    }
  };

  const handleSelectAlert = (alertId: string) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const handleBulkMarkRead = async () => {
    if (selectedAlerts.length === 0) return;
    
    try {
      // TODO: Implement bulk mark read API call
      console.log("Bulk marking alerts as read:", selectedAlerts);
      setSelectedAlerts([]);
    } catch (error) {
      console.error("Failed to bulk mark alerts as read:", error);
    }
  };

  const handleBulkResolve = async () => {
    if (selectedAlerts.length === 0) return;
    
    try {
      // TODO: Implement bulk resolve API call
      console.log("Bulk resolving alerts:", selectedAlerts);
      setSelectedAlerts([]);
    } catch (error) {
      console.error("Failed to bulk resolve alerts:", error);
    }
  };

  const handleViewAlert = (alertId: number) => {
    console.log('Opening alert view:', alertId);
    setSelectedAlertId(alertId);
    setCurrentView('view');
  };

  const handleEditAlert = (alertId: number) => {
    console.log('Opening alert edit:', alertId);
    setSelectedAlertId(alertId);
    setCurrentView('edit');
  };

  const handleBackToList = () => {
    console.log('Going back to list');
    setCurrentView('list');
    // Don't reset selectedAlertId to allow re-navigation
  };

  const handleClearSelection = () => {
    console.log('Clearing selection');
    setSelectedAlertId(null);
    setAlertData(null);
    setFormData({});
    setErrors({});
    setCurrentView('list');
  };

  const handleDeleteAlert = (alertId: number) => {
    setSelectedAlertId(alertId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAlert = async () => {
    if (!selectedAlertId) return;
    
    try {
      await deleteAlert(selectedAlertId).unwrap();
      setIsDeleteModalOpen(false);
      handleClearSelection();
    } catch (error) {
      console.error("Failed to delete alert:", error);
    }
  };

  // Form handling for edit view
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.message?.trim()) {
      newErrors.message = 'Message is required';
    }
    if (!formData.alert_type?.trim()) {
      newErrors.alert_type = 'Alert type is required';
    }
    if (!formData.severity?.trim()) {
      newErrors.severity = 'Severity is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAlert = async () => {
    if (!validateForm()) return;
    
    try {
      await updateAlert({
        id: selectedAlertId!,
        body: formData
      }).unwrap();
      
      console.log('Alert updated successfully');
      handleClearSelection();
    } catch (error) {
      console.error('Failed to update alert:', error);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { className: "bg-gray-100 text-gray-800", icon: AlertCircle, label: "Low" },
      medium: { className: "bg-yellow-100 text-yellow-800", icon: AlertTriangle, label: "Medium" },
      high: { className: "bg-orange-100 text-orange-800", icon: AlertTriangle, label: "High" },
      critical: { className: "bg-red-100 text-red-800", icon: AlertOctagon, label: "Critical" },
    };
    
    const config = severityConfig[severity as keyof typeof severityConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      icon: AlertCircle,
      label: severity
    };
    
    const Icon = config.icon;
    
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1", config.className)}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      // API status values from README
      active: { className: "bg-red-100 text-red-800", label: "Active" },
      acknowledged: { className: "bg-yellow-100 text-yellow-800", label: "Acknowledged" },
      ignored: { className: "bg-gray-100 text-gray-800", label: "Ignored" },
      resolved: { className: "bg-green-100 text-green-800", label: "Resolved" },
      new: { className: "bg-blue-100 text-blue-800", label: "New" },
      // Legacy status values
      open: { className: "bg-orange-100 text-orange-800", label: "Open" },
      closed: { className: "bg-gray-100 text-gray-800", label: "Closed" },
      unknown: { className: "bg-gray-100 text-gray-800", label: "Unknown" },
    };
    
    const normalizedStatus = status?.toLowerCase() || 'unknown';
    const config = statusConfig[normalizedStatus as keyof typeof statusConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      label: status || 'Unknown' 
    };
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.className)}>
        {config.label}
      </span>
    );
  };

  const getActionButtons = (alert: any) => {
    const buttons = [];
    const status = alert.status_label || alert.status || 'unknown';
    
    if (status === "active" || status === "new") {
      buttons.push(
        <Button
          key="acknowledge"
          label="Acknowledge"
          variant="outlineDark"
          size="small"
          icon={<Check className="h-4 w-4" />}
          onClick={() => handleAcknowledgeAlert(alert.id)}
        />
      );
    }
    
    if (status === "active" || status === "new" || status === "acknowledged") {
      buttons.push(
        <Button
          key="ignore"
          label="Ignore"
          variant="outlineDark"
          size="small"
          icon={<X className="h-4 w-4" />}
          onClick={() => handleIgnoreAlert(alert.id)}
        />
      );
    }
    
    if (status === "acknowledged") {
      buttons.push(
        <Button
          key="resolve"
          label="Resolve"
          variant="green"
          size="small"
          icon={<Check className="h-4 w-4" />}
          onClick={() => handleResolveAlert(alert.id)}
        />
      );
    }
    
    return buttons;
  };

  if (error) {
    const errorMessage = "message" in error ? error.message : "Unknown error";
    const isTokenError = errorMessage?.includes("token") || errorMessage?.includes("403") || errorMessage?.includes("401");
    
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          {isTokenError ? (
            <div>
              <p>Your session has expired. Please log in again.</p>
              <Button
                label="Go to Login"
                variant="primary"
                className="mt-4"
                onClick={() => window.location.href = '/auth/signin'}
              />
            </div>
          ) : (
            <p>Error loading alerts: {errorMessage}</p>
          )}
        </div>
      </div>
    );
  }

  // Debug current state
  console.log('Current Alerts state:', { currentView, selectedAlertId, alertData: !!alertData, alertLoading });

  // Show loading state when switching alerts
  if ((currentView === 'view' || currentView === 'edit') && selectedAlertId && !alertData && alertLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleBackToList} 
                variant="outlineDark"
                label="Back"
                icon={<ArrowLeft className="h-4 w-4" />}
                className="px-4 py-2 rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Loading Alert...
                </h1>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show error state when API fails
  if ((currentView === 'view' || currentView === 'edit') && selectedAlertId && alertError) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleBackToList} 
                variant="outlineDark"
                label="Back"
                icon={<ArrowLeft className="h-4 w-4" />}
                className="px-4 py-2 rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Error Loading Alert
                </h1>
              </div>
            </div>
          </div>
          <div className="text-center text-red-600">
            <p>Failed to load alert details. Please try again.</p>
            <Button 
              onClick={handleBackToList} 
              variant="primary" 
              label="Back to Alerts"
              className="mt-4"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Render different views based on currentView state
  if (currentView === 'view' && alertData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div key={`view-${selectedAlertId}`} className="p-6">
          {/* Header with Back Button */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={handleBackToList} 
                  variant="outlineDark"
                  label="Back"
                  icon={<ArrowLeft className="h-4 w-4" />}
                  className="px-4 py-2 rounded-lg"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Alert — Detail
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Type: {alertData.alert_type || alertData.system || 'Unknown'} • Severity: {alertData.severity} • Status: {alertData.status_label || alertData.status} • System: {alertData.system || 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                {alertData && (alertData.status === 'active' || alertData.status === 'new') && (
                  <Button
                    label="Acknowledge"
                    variant="outlineDark"
                    icon={<Check className="h-4 w-4" />}
                    onClick={() => handleAcknowledgeAlert(alertData.id.toString())}
                  />
                )}
                {alertData && (alertData.status === 'active' || alertData.status === 'new' || alertData.status === 'acknowledged') && (
                  <Button
                    label="Ignore"
                    variant="outlineDark"
                    icon={<X className="h-4 w-4" />}
                    onClick={() => handleIgnoreAlert(alertData.id.toString())}
                  />
                )}
                {alertData && alertData.status === 'acknowledged' && (
                  <Button
                    label="Resolve"
                    variant="primary"
                    icon={<Check className="h-4 w-4" />}
                    onClick={() => handleResolveAlert(alertData.id.toString())}
                  />
                )}
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Severity</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {getSeverityBadge(alertData.severity)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {getStatusBadge(alertData.status_label || alertData.status)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Created At</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {alertData.created_at ? new Date(alertData.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {alertData.resolved_at ? new Date(alertData.resolved_at).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Check className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Alert Information Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Alert Details</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Title</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-lg">{alertData.title}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Type</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{alertData.alert_type || alertData.system || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">System</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{alertData.system || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Severity</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {getSeverityBadge(alertData.severity)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {getStatusBadge(alertData.status_label || alertData.status)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created At</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {alertData.created_at ? new Date(alertData.created_at).toLocaleString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Additional Information</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Vehicle</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(() => {
                      if (alertData.vehicle_info) {
                        const vehicleInfo = alertData.vehicle_info;
                        if (vehicleInfo.make && vehicleInfo.model && vehicleInfo.license_plate) {
                          return `${vehicleInfo.make} ${vehicleInfo.model} (${vehicleInfo.license_plate})`;
                        }
                        if (vehicleInfo.license_plate) return vehicleInfo.license_plate;
                        if (vehicleInfo.name) return vehicleInfo.name;
                      }
                      
                      if (typeof alertData.vehicle === 'object' && alertData.vehicle) {
                        const vehicle = alertData.vehicle;
                        if (vehicle.make && vehicle.model && vehicle.license_plate) {
                          return `${vehicle.make} ${vehicle.model} (${vehicle.license_plate})`;
                        }
                        if (vehicle.license_plate) return vehicle.license_plate;
                        if (vehicle.name) return vehicle.name;
                      }
                      
                      if (typeof alertData.vehicle === 'string' && alertData.vehicle.trim() !== '') {
                        return alertData.vehicle;
                      }
                      
                      return 'Not Assigned';
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Acknowledged By</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {alertData.acknowledged_by ? alertData.acknowledged_by.username : 'Not Acknowledged'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Acknowledged At</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {alertData.acknowledged_at ? new Date(alertData.acknowledged_at).toLocaleString() : 'Not Acknowledged'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Resolved At</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {alertData.resolved_at ? new Date(alertData.resolved_at).toLocaleString() : 'Not Resolved'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Message Card */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Message</h3>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-900 dark:text-white">{alertData.message || alertData.description || 'No message available'}</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (currentView === 'edit' && alertData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div key={`edit-${selectedAlertId}`} className="p-6">
          {/* Header with Back Button */}
          <div className="mb-8">
            <Button 
              onClick={handleBackToList} 
              variant="outlineDark"
              label="Back"
              icon={<ArrowLeft className="h-4 w-4" />}
              className="px-4 py-2 rounded-lg"
            />
          </div>

          {/* Edit Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alert Type
                  </label>
                  <select
                    name="alert_type"
                    value={formData.alert_type || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.alert_type ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">Select alert type</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="safety">Safety</option>
                    <option value="performance">Performance</option>
                    <option value="fuel">Fuel</option>
                    <option value="location">Location</option>
                    <option value="system">System</option>
                  </select>
                  {errors.alert_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.alert_type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Severity
                  </label>
                  <select
                    name="severity"
                    value={formData.severity || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.severity ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">Select severity</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  {errors.severity && (
                    <p className="mt-1 text-sm text-red-600">{errors.severity}</p>
                  )}
                </div>
              </div>

              {/* Status Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                  >
                    <option value="open">Open</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="resolved">Resolved</option>
                    <option value="ignored">Ignored</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Message Field */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message || ''}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.message ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter alert message..."
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
              )}
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button 
                onClick={handleBackToList} 
                variant="outlineDark"
                label="Cancel"
                icon={<X className="h-4 w-4" />}
                className="px-4 py-2 rounded-lg"
              />
              <Button 
                onClick={isUpdating ? undefined : handleSaveAlert}
                variant="primary"
                label={isUpdating ? 'Saving...' : 'Save Changes'}
                icon={<Save className="h-4 w-4" />}
                className={`px-6 py-2 rounded-lg ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
          </div>
          <div className="flex space-x-3">
            <Button
              label="Mark Read"
              variant="outlineDark"
              icon={<Check className="h-4 w-4" />}
              onClick={handleBulkMarkRead}
              className={selectedAlerts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
            />
            <Button
              label="Resolve"
              variant="primary"
              icon={<Check className="h-4 w-4" />}
              onClick={handleBulkResolve}
              className={selectedAlerts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardStats?.total_alerts || alertsData?.count || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardStats?.unread || alertsData?.results?.filter((alert: any) => alert.status === 'active').length || 0}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardStats?.resolved_alerts || alertsData?.results?.filter((alert: any) => alert.status === 'resolved').length || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Severity Distribution */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">• By Severity: low [#] | medium [#] | high [#] | critical [#]</h4>
              <div className="space-y-3">
                {['low', 'medium', 'high', 'critical'].map((severity) => {
                  const count = dashboardStats?.severity_distribution?.[severity] || 0;
                  const maxCount = Math.max(
                    dashboardStats?.severity_distribution?.low || 0,
                    dashboardStats?.severity_distribution?.medium || 0,
                    dashboardStats?.severity_distribution?.high || 0,
                    dashboardStats?.severity_distribution?.critical || 0
                  );
                  const barWidth = maxCount > 0 ? Math.round((count / maxCount) * 7) : 0;
                  const bar = '█'.repeat(barWidth);
                  
                  return (
                    <div key={severity} className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize w-16">
                        {severity}
                      </span>
                      <span className="text-sm font-mono text-gray-600 dark:text-gray-400 ml-4">
                        | {bar.padEnd(7, ' ')} {Number(count)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Type Distribution */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">• By Type: vehicle_health [#] | maintenance_due [#] | system [#] …</h4>
              <div className="space-y-3">
                {dashboardStats?.type_distribution ? Object.entries(dashboardStats.type_distribution).map(([type, count]) => {
                  const maxCount = Math.max(...Object.values(dashboardStats.type_distribution).map(v => Number(v)));
                  const barWidth = Math.round((Number(count) / maxCount) * 7);
                  const bar = '█'.repeat(barWidth);
                  
                  return (
                    <div key={type} className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize w-20 truncate">
                        {type.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-mono text-gray-600 dark:text-gray-400 ml-4">
                        | {bar.padEnd(7, ' ')} {Number(count)}
                      </span>
                    </div>
                  );
                }) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No type distribution data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity
              </label>
              <select
                value={filters.severity || "all"}
                onChange={handleSeverityFilter}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status || "all"}
                onChange={handleStatusFilter}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="ignored">Ignored</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vehicle
              </label>
              <select
                value={filters.vehicle_id || ""}
                onChange={(e) => dispatch(setAlertsFilters({ vehicle_id: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Vehicles</option>
                {vehiclesData?.results?.map((vehicle: any) => (
                  <option key={vehicle.id} value={vehicle.id.toString()}>
                    {vehicle.plate_number || vehicle.license_plate || 'N/A'} - {vehicle.make || ''} {vehicle.model || ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                System
              </label>
              <select
                value={filters.alert_type || "all"}
                onChange={handleAlertTypeFilter}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Systems</option>
                <option value="vehicle_health">Vehicle Health</option>
                <option value="maintenance_due">Maintenance Due</option>
                <option value="system">System</option>
                <option value="geofence">Geofence</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button
              label="Apply"
              variant="primary"
              size="small"
              onClick={() => {}} // Filters are applied automatically
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {isLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="p-6 text-red-600">
                Error loading alerts
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {allFilteredAlerts.length === 0 && (filters.search || filters.alert_type) ? (
                  <div>
                    <p>No alerts found matching your filters.</p>
                    <Button
                      label="Clear Filters"
                      variant="outlineDark"
                      size="small"
                      className="mt-2"
                      onClick={() => dispatch(setAlertsFilters({ search: "", alert_type: undefined }))}
                    />
                  </div>
                ) : (
                  <p>No alerts found.</p>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Sev
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      St
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-dark divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAlerts.map((alert) => (
                    <tr 
                      key={alert.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150"
                      onClick={(e) => {
                        // Don't navigate if clicking on action buttons
                        const target = e.target as HTMLElement;
                        const isButton = target.closest('button');
                        
                        if (!isButton) {
                          router.push(`/alerts/${alert.id}`);
                        }
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSeverityBadge(alert.severity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {alert.alert_type || alert.system || alert.source || alert.category || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {alert.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {(() => {
                          // Handle vehicle field based on new API structure
                          if (alert.vehicle_info) {
                            // Use vehicle_info if available (preferred)
                            const vehicleInfo = alert.vehicle_info;
                            if (vehicleInfo.license_plate) return vehicleInfo.license_plate;
                            if (vehicleInfo.name) return vehicleInfo.name;
                            if (vehicleInfo.make && vehicleInfo.model) return `${vehicleInfo.make} ${vehicleInfo.model}`;
                            if (vehicleInfo.vin) return vehicleInfo.vin;
                          }
                          
                          if (typeof alert.vehicle === 'object' && alert.vehicle) {
                            // Handle object vehicle field
                            const vehicle = alert.vehicle as any;
                            if (vehicle.license_plate) return vehicle.license_plate;
                            if (vehicle.name) return vehicle.name;
                            if (vehicle.make && vehicle.model) return `${vehicle.make} ${vehicle.model}`;
                            if (vehicle.vin) return vehicle.vin;
                          }
                          
                          if (typeof alert.vehicle === 'string' && alert.vehicle.trim() !== '') {
                            return alert.vehicle;
                          }
                          
                          if (typeof alert.vehicle === 'number') {
                            return `Vehicle #${alert.vehicle}`;
                          }
                          
                          return 'N/A';
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(alert.status_label || alert.status || 'unknown')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Bulk Actions */}
          {filteredAlerts.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    label="Mark Read"
                    variant="outlineDark"
                    size="small"
                    onClick={handleBulkMarkRead}
                    className={selectedAlerts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                  />
                  <Button
                    label="Resolve"
                    variant="primary"
                    size="small"
                    onClick={handleBulkResolve}
                    className={selectedAlerts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                  />
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Page 1/2
                </div>
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedAlertId(null); }}
        onConfirm={confirmDeleteAlert}
        title="Delete Alert"
        message="Are you sure you want to delete this alert? This action cannot be undone."
        itemName={selectedAlertId ? `Alert #${selectedAlertId}` : undefined}
      />
    </ProtectedRoute>
  );
}