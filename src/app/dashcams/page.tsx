"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useListDashcamsQuery, useRefreshDashcamApiKeyMutation, useDeleteDashcamMutation, useGetDashcamByIdQuery, useUpdateDashcamMutation, useGetDashcamsDashboardStatsQuery, useListVehiclesQuery, useBulkRefreshDashcamApiKeysMutation } from "@/store/api/fleetApi";
import { setDashcamsFilters, setDashcamsPagination } from "@/store/slices/dashcamsUISlice";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Search, Plus, RefreshCw, Trash2, Eye, Edit, Video, Wifi, WifiOff, Copy, Check, ArrowLeft, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashcamsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector((state) => state.dashcamsUI);
  const [copiedApiKey, setCopiedApiKey] = useState<string | null>(null);
  const [selectedDashcams, setSelectedDashcams] = useState<string[]>([]);
  
  // Full-page view states
  const [currentView, setCurrentView] = useState<'list' | 'view' | 'edit'>('list');
  const [selectedDashcamId, setSelectedDashcamId] = useState<string | null>(null);
  const [dashcamData, setDashcamData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  
  const { data: dashcamsData, isLoading, error } = useListDashcamsQuery({
    page: pagination.page,
    search: filters.search,
    vehicle_id: filters.vehicle_id,
  });

  const { data: dashboardStatsData } = useGetDashcamsDashboardStatsQuery();
  const { data: vehiclesData } = useListVehiclesQuery({ page: 1 });

  const [refreshApiKey] = useRefreshDashcamApiKeyMutation();
  const [bulkRefreshApiKeys] = useBulkRefreshDashcamApiKeysMutation();
  const [deleteDashcam] = useDeleteDashcamMutation();
  
  // API hooks for full-page views
  const { data: dashcamDetails, isLoading: dashcamLoading, error: dashcamError } = useGetDashcamByIdQuery(
    selectedDashcamId || '',
    { skip: !selectedDashcamId }
  );
  const [updateDashcam, { isLoading: isUpdating }] = useUpdateDashcamMutation();

  // Update dashcamData and formData when dashcamDetails changes
  useEffect(() => {
    if (dashcamDetails) {
      setDashcamData(dashcamDetails);
      setFormData({
        device_id: dashcamDetails.device_id || '',
        model: dashcamDetails.model || '',
        status: dashcamDetails.status || '',
        vehicle_id: dashcamDetails.vehicle?.id || '',
        storage_used: dashcamDetails.storage_used || 0,
        last_recording: dashcamDetails.last_recording || '',
        api_key: dashcamDetails.api_key || '',
      });
    }
  }, [dashcamDetails]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDashcamsFilters({ search: e.target.value }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setDashcamsFilters({ status: e.target.value === "all" ? undefined : e.target.value }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setDashcamsPagination({ page }));
  };

  const handleRefreshApiKey = async (dashcamId: string) => {
    try {
      await refreshApiKey({ id: dashcamId }).unwrap();
      alert("API key refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh API key:", error);
      alert("Failed to refresh API key");
    }
  };

  const handleSelectAll = () => {
    if (selectedDashcams.length === dashcamsData?.results?.length) {
      setSelectedDashcams([]);
    } else {
      setSelectedDashcams(dashcamsData?.results?.map((dashcam: any) => dashcam.id) || []);
    }
  };

  const handleSelectDashcam = (dashcamId: string, checked: boolean) => {
    if (checked) {
      setSelectedDashcams([...selectedDashcams, dashcamId]);
    } else {
      setSelectedDashcams(selectedDashcams.filter(id => id !== dashcamId));
    }
  };

  const handleBulkRefreshApiKey = async () => {
    if (selectedDashcams.length === 0) return;
    
    try {
      // Use the bulk refresh API endpoint
      await bulkRefreshApiKeys({ 
        selected_records: selectedDashcams 
      }).unwrap();
      alert(`API keys refreshed successfully for ${selectedDashcams.length} dashcam(s)`);
      setSelectedDashcams([]);
    } catch (error) {
      console.error("Failed to refresh API keys:", error);
      alert("Failed to refresh API keys");
    }
  };

  const handleDeleteDashcam = async (dashcamId: string) => {
    if (confirm("Are you sure you want to delete this dashcam?")) {
      try {
        await deleteDashcam(dashcamId).unwrap();
        alert("Dashcam deleted successfully");
        handleClearSelection();
      } catch (error) {
        console.error("Failed to delete dashcam:", error);
        alert("Failed to delete dashcam");
      }
    }
  };

  const handleCopyApiKey = async (apiKey: string) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedApiKey(apiKey);
      alert("API key copied to clipboard");
      setTimeout(() => setCopiedApiKey(null), 2000);
    } catch (error) {
      console.error("Failed to copy API key:", error);
      alert("Failed to copy API key");
    }
  };

  // Full-page view handlers
  const handleViewDashcam = (dashcamId: string) => {
    console.log('Viewing dashcam:', dashcamId);
    setSelectedDashcamId(dashcamId);
    setCurrentView('view');
  };

  const handleEditDashcam = (dashcamId: string) => {
    console.log('Editing dashcam:', dashcamId);
    setSelectedDashcamId(dashcamId);
    setCurrentView('edit');
  };

  const handleBackToList = () => {
    console.log('Back to list');
    setCurrentView('list');
    // Don't reset selectedDashcamId to allow re-navigation
  };

  const handleClearSelection = () => {
    console.log('Clearing selection');
    setSelectedDashcamId(null);
    setDashcamData(null);
    setFormData({});
    setErrors({});
    setCurrentView('list');
  };

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
    const newErrors: any = {};
    
    if (!formData.device_id?.trim()) {
      newErrors.device_id = 'Device ID is required';
    }
    
    if (!formData.model?.trim()) {
      newErrors.model = 'Model is required';
    }
    
    if (!formData.status?.trim()) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDashcam = async () => {
    if (!validateForm() || !selectedDashcamId) return;

    try {
      console.log('Saving dashcam:', selectedDashcamId, formData);
      await updateDashcam({
        id: selectedDashcamId,
        body: formData
      }).unwrap();
      
      console.log('Dashcam updated successfully');
      handleClearSelection();
    } catch (error) {
      console.error('Failed to update dashcam:', error);
      alert('Failed to update dashcam. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      online: { className: "bg-green-100 text-green-800", icon: Wifi, label: "Online" },
      offline: { className: "bg-red-100 text-red-800", icon: WifiOff, label: "Offline" },
      recording: { className: "bg-blue-100 text-blue-800", icon: Video, label: "Recording" },
      maintenance: { className: "bg-yellow-100 text-yellow-800", icon: Video, label: "Maintenance" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      icon: Video,
      label: status
    };
    
    const Icon = config.icon;
    
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1", config.className)}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  if (error) {
    // Check if it's a 403 error (admin-only access)
    const is403Error = error && 'status' in error && error.status === 403;
    
    if (is403Error) {
      return (
        <div className="p-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
              <Video className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Access Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Dashcams management requires administrator privileges. Please contact your system administrator to access this feature.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> This section is restricted to admin users only. Regular fleet users can view other sections like Vehicles, Drivers, and Trips.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error loading dashcams: {"message" in error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  // Debug current state
  console.log('Current Dashcams state:', { currentView, selectedDashcamId, dashcamData: !!dashcamData, dashcamLoading });

  // Show loading state when switching dashcams
  if ((currentView === 'view' || currentView === 'edit') && selectedDashcamId && !dashcamData && dashcamLoading) {
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
                  Loading Dashcam...
                </h1>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show error state when API fails
  if ((currentView === 'view' || currentView === 'edit') && selectedDashcamId && dashcamError) {
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
                  Error Loading Dashcam
                </h1>
              </div>
            </div>
          </div>
          <div className="text-center text-red-600">
            <p>Failed to load dashcam details. Please try again.</p>
            <Button 
              onClick={handleBackToList} 
              variant="primary" 
              label="Back to Dashcams"
              className="mt-4"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Render different views based on currentView state
  if (currentView === 'view' && dashcamData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div key={`view-${selectedDashcamId}`} className="p-6">
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

          {/* Header with Action Buttons */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dashcam — Detail/Edit (#{dashcamData.device_id})
              </h1>
            </div>
            <div className="flex space-x-2">
              <Button
                label="Save"
                variant="primary"
                icon={<Edit className="h-4 w-4" />}
                onClick={() => {
                  // TODO: Implement save functionality
                  alert('Save functionality coming soon');
                }}
              />
              <Button
                label="Delete"
                variant="outlineDark"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => {
                  // TODO: Implement delete functionality
                  alert('Delete functionality coming soon');
                }}
              />
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dashcamData.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {dashcamData.is_active ? 'Active' : 'Off'}
                    </span>
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Video className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Firmware Version</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashcamData.firmware_version || 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Wifi className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API Key (created at)</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {dashcamData.created_at 
                      ? new Date(dashcamData.created_at).toLocaleString()
                      : 'N/A'
                    }
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Copy className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Device (Left) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Device</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">device_id</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{dashcamData.device_id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">is_active</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dashcamData.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {dashcamData.is_active ? '✓' : '✗'}
                    </span>
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">firmware_version</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{dashcamData.firmware_version || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">last_streamed_at (read-only)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {dashcamData.last_streamed_at 
                      ? new Date(dashcamData.last_streamed_at).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">api_key (admin-visible)</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                      {dashcamData.api_key ? `${dashcamData.api_key.substring(0, 8)}...` : 'N/A'}
                    </code>
                    {dashcamData.api_key && (
                      <Button
                        label=""
                        variant="outlineDark"
                        size="small"
                        icon={copiedApiKey === dashcamData.api_key ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                        onClick={() => handleCopyApiKey(dashcamData.api_key)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle (Right) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Vehicle</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Vehicle Info</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {dashcamData.vehicle?.license_plate || 'Unassigned'}
                    </span>
                    {dashcamData.vehicle && (
                      <Button
                        label="Open Vehicle"
                        variant="outlineDark"
                        size="small"
                        onClick={() => router.push(`/vehicles/${dashcamData.vehicle.id}`)}
                      />
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      label="List Segments"
                      variant="outlineDark"
                      size="small"
                      onClick={() => {
                        // TODO: Navigate to video segments filtered by vehicle
                        alert('Navigate to video segments filtered by vehicle');
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (currentView === 'edit' && dashcamData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div key={`edit-${selectedDashcamId}`} className="p-6">
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dashcam Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Device ID
                  </label>
                  <input
                    type="text"
                    name="device_id"
                    value={formData.device_id || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.device_id ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.device_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.device_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.model ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.model && (
                    <p className="mt-1 text-sm text-red-600">{errors.model}</p>
                  )}
                </div>

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
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="recording">Recording</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Storage Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Storage Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Storage Used (bytes)
                  </label>
                  <input
                    type="number"
                    name="storage_used"
                    value={formData.storage_used || 0}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
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
                onClick={handleSaveDashcam} 
                variant="primary" 
                label={isUpdating ? 'Saving...' : 'Save Changes'}
                icon={<Save className="h-4 w-4" />}
                className="px-6 py-2 rounded-lg"
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
            <h1 className="text-3xl font-bold tracking-tight">Dashcams</h1>
            <p className="text-muted-foreground">
              Manage dashcam devices and their video recordings
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              label="Add Dashcam"
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
            />
            {selectedDashcams.length > 0 && (
              <Button
                label={`Bulk (${selectedDashcams.length})`}
                variant="outlineDark"
                icon={<RefreshCw className="h-4 w-4" />}
              />
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(dashboardStatsData as any)?.total || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(dashboardStatsData as any)?.active || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Wifi className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(dashboardStatsData as any)?.inactive || 0}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <WifiOff className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Note: Entire Dashcams section is admin-only (403 for non-admins).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Active"
              items={[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              defaultValue={filters.status || "all"}
              placeholder="Select status"
              onChange={handleStatusFilter}
            />

            <Select
              label="Vehicle"
              items={[
                { value: "all", label: "All Vehicles" },
                ...(vehiclesData?.results?.map((vehicle: any) => ({
                  value: vehicle.id.toString(),
                  label: `${vehicle.license_plate} - ${vehicle.make} ${vehicle.model}`
                })) || [])
              ]}
              defaultValue={filters.vehicle_id || "all"}
              placeholder="Select vehicle"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                dispatch(setDashcamsFilters({ vehicle_id: e.target.value === "all" ? undefined : e.target.value }))
              }
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedDashcams.length > 0 && (
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedDashcams.length} dashcam(s) selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  label="Refresh API Key"
                  variant="outlineDark"
                  size="small"
                  icon={<RefreshCw className="h-4 w-4" />}
                  onClick={handleBulkRefreshApiKey}
                />
              </div>
            </div>
          </div>
        )}

        {/* Dashcams Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-6 border-b border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold">Dashcam List</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {dashcamsData?.count || 0} dashcams found
            </p>
          </div>
          
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
                Error loading dashcams
              </div>
            ) : dashcamsData?.results?.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No dashcams found.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: '1200px' }}>
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedDashcams.length === dashcamsData?.results?.length && dashcamsData?.results?.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      DeviceID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Firmware
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      API Key Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Streamed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-dark divide-y divide-gray-200 dark:divide-gray-700">
                  {dashcamsData?.results?.map((dashcam) => (
                    <tr key={dashcam.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedDashcams.includes(dashcam.id)}
                          onChange={(e) => handleSelectDashcam(dashcam.id, e.target.checked)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <Video className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {dashcam.device_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {dashcam.vehicle?.license_plate || "Unassigned"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {dashcam.firmware_version || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          dashcam.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {dashcam.is_active ? '✓' : '✗'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {dashcam.created_at 
                          ? new Date(dashcam.created_at).toLocaleDateString()
                          : "N/A"
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {dashcam.last_streamed_at 
                          ? new Date(dashcam.last_streamed_at).toLocaleDateString()
                          : "Never"
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            label=""
                            variant="outlineDark"
                            size="small"
                            icon={<Eye className="h-4 w-4" />}
                            onClick={() => handleViewDashcam(dashcam.id)}
                          />
                          <Button
                            label=""
                            variant="outlineDark"
                            size="small"
                            icon={<Edit className="h-4 w-4" />}
                            onClick={() => handleEditDashcam(dashcam.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {dashcamsData && dashcamsData.count > 0 && (
            <div className="px-6 py-4 border-t border-stroke dark:border-dark-3 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, dashcamsData.count)} of{" "}
                {dashcamsData.count} results
              </div>
              <div className="flex items-center space-x-2">
                {pagination.page > 1 ? (
                  <Button
                    label="Previous"
                    variant="outlineDark"
                    size="small"
                    onClick={() => handlePageChange(pagination.page - 1)}
                  />
                ) : (
                  <Button
                    label="Previous"
                    variant="outlineDark"
                    size="small"
                    onClick={() => {}}
                    className="opacity-50 cursor-not-allowed"
                  />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination.page} of {Math.ceil(dashcamsData.count / pagination.limit)}
                </span>
                {pagination.page < Math.ceil(dashcamsData.count / pagination.limit) ? (
                  <Button
                    label="Next"
                    variant="outlineDark"
                    size="small"
                    onClick={() => handlePageChange(pagination.page + 1)}
                  />
                ) : (
                  <Button
                    label="Next"
                    variant="outlineDark"
                    size="small"
                    onClick={() => {}}
                    className="opacity-50 cursor-not-allowed"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}