"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useListScheduledMaintenanceQuery, useMarkServiceDoneMutation, useGetScheduledMaintenanceByIdQuery, useUpdateScheduledMaintenanceMutation, useDeleteScheduledMaintenanceMutation, useGetMaintenanceRecordsOverviewMetricsQuery, useListMaintenanceRecordsQuery, useListVehiclesQuery, useGetScheduledMaintenanceDashboardStatsQuery } from "@/store/api/fleetApi";
import { setMaintenanceFilters, setMaintenancePagination } from "@/store/slices/maintenanceUISlice";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Search, Plus, Check, Eye, Edit, Wrench, Calendar, AlertTriangle, ArrowLeft, Save, X, Clock, User, Car, Trash, DollarSign, FileText, Play, Square, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeleteConfirmationModal } from "@/components/Modals/DeleteConfirmationModal";

export default function MaintenancePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector((state) => state.maintenanceUI);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<string | null>(null);
  
  // Full-page view states
  const [currentView, setCurrentView] = useState<'maintenance-records' | 'scheduled-maintenance' | 'view' | 'edit' | 'list'>('maintenance-records');
  const [maintenanceData, setMaintenanceData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { data: maintenanceListData, isLoading, error } = useListMaintenanceRecordsQuery({
    page: pagination.page,
    status: filters.status,
  });

  const { data: scheduledMaintenanceData, isLoading: scheduledLoading, error: scheduledError } = useListScheduledMaintenanceQuery({
    page: pagination.page,
  });

  const { data: overviewMetricsData } = useGetMaintenanceRecordsOverviewMetricsQuery();
  const { data: scheduledDashboardStats } = useGetScheduledMaintenanceDashboardStatsQuery();
  const { data: vehiclesData } = useListVehiclesQuery({ page: 1 });

  // API hooks for full-page views
  const { 
    data: maintenanceDetails, 
    isLoading: maintenanceLoading, 
    error: maintenanceError 
  } = useGetScheduledMaintenanceByIdQuery(selectedMaintenanceId!, {
    skip: !selectedMaintenanceId
  });

  const [updateMaintenance, { isLoading: isUpdating }] = useUpdateScheduledMaintenanceMutation();
  const [deleteMaintenance] = useDeleteScheduledMaintenanceMutation();
  const [markServiceDone] = useMarkServiceDoneMutation();

  // Update maintenance data when API response changes
  useEffect(() => {
    if (maintenanceDetails) {
      setMaintenanceData(maintenanceDetails);
      setFormData(maintenanceDetails);
    }
  }, [maintenanceDetails]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setMaintenanceFilters({ search: e.target.value }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setMaintenanceFilters({ status: e.target.value === "all" ? undefined : e.target.value }));
  };

  const handleMaintenanceTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setMaintenanceFilters({ maintenance_type: e.target.value === "all" ? undefined : e.target.value }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setMaintenancePagination({ page }));
  };

  const handleViewMaintenance = (maintenanceId: string) => {
    console.log('Opening maintenance view:', maintenanceId);
    setSelectedMaintenanceId(maintenanceId);
    setCurrentView('view');
  };

  const handleEditMaintenance = (maintenanceId: string) => {
    console.log('Opening maintenance edit:', maintenanceId);
    setSelectedMaintenanceId(maintenanceId);
    setCurrentView('edit');
  };

  const handleBackToList = () => {
    console.log('Going back to list');
    setCurrentView('list');
    // Don't reset selectedMaintenanceId to allow re-navigation
  };

  const handleClearSelection = () => {
    console.log('Clearing selection');
    setSelectedMaintenanceId(null);
    setMaintenanceData(null);
    setFormData({});
    setErrors({});
    setCurrentView('list');
  };

  const handleDeleteMaintenance = (maintenanceId: string) => {
    setSelectedMaintenanceId(maintenanceId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteMaintenance = async () => {
    if (!selectedMaintenanceId) return;
    
    try {
      await deleteMaintenance(selectedMaintenanceId).unwrap();
      setIsDeleteModalOpen(false);
      handleClearSelection();
    } catch (error) {
      console.error("Failed to delete maintenance:", error);
    }
  };

  const handleMarkServiceDone = async (maintenanceId: string) => {
    if (confirm("Are you sure you want to mark this service as done?")) {
      try {
        await markServiceDone({ id: maintenanceId }).unwrap();
      } catch (error) {
        console.error("Failed to mark service as done:", error);
      }
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
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.maintenance_type?.trim()) {
      newErrors.maintenance_type = 'Maintenance type is required';
    }
    if (!formData.scheduled_date) {
      newErrors.scheduled_date = 'Scheduled date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveMaintenance = async () => {
    if (!validateForm()) return;
    
    try {
      await updateMaintenance({
        id: selectedMaintenanceId!,
        body: formData
      }).unwrap();
      
      console.log('Maintenance updated successfully');
      handleClearSelection();
    } catch (error) {
      console.error('Failed to update maintenance:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { className: "bg-gray-100 text-gray-800", label: "Scheduled" },
      in_progress: { className: "bg-yellow-100 text-yellow-800", label: "In Progress" },
      completed: { className: "bg-green-100 text-green-800", label: "Completed" },
      overdue: { className: "bg-red-100 text-red-800", label: "Overdue" },
      cancelled: { className: "bg-red-100 text-red-800", label: "Cancelled" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { className: "bg-gray-100 text-gray-800", label: status };
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.className)}>
        {config.label}
      </span>
    );
  };

  const getMaintenanceTypeBadge = (type: string) => {
    const typeConfig = {
      routine: { className: "bg-gray-100 text-gray-800", label: "Routine" },
      repair: { className: "bg-red-100 text-red-800", label: "Repair" },
      inspection: { className: "bg-blue-100 text-blue-800", label: "Inspection" },
      emergency: { className: "bg-red-100 text-red-800", label: "Emergency" },
      recall: { className: "bg-yellow-100 text-yellow-800", label: "Recall" },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || { className: "bg-gray-100 text-gray-800", label: type };
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.className)}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { className: "bg-gray-100 text-gray-800", label: "Low" },
      medium: { className: "bg-yellow-100 text-yellow-800", label: "Medium" },
      high: { className: "bg-orange-100 text-orange-800", label: "High" },
      critical: { className: "bg-red-100 text-red-800", label: "Critical" },
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || { className: "bg-gray-100 text-gray-800", label: priority };
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.className)}>
        {config.label}
      </span>
    );
  };

  const isOverdue = (scheduledDate: string) => {
    return new Date(scheduledDate) < new Date() && new Date(scheduledDate).toDateString() !== new Date().toDateString();
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error loading maintenance records: {"message" in error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  // Debug current state
  console.log('Current Maintenance state:', { currentView, selectedMaintenanceId, maintenanceData: !!maintenanceData, maintenanceLoading });

  // Show loading state when switching maintenance records
  if ((currentView === 'view' || currentView === 'edit') && selectedMaintenanceId && !maintenanceData && maintenanceLoading) {
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
                  Loading Maintenance...
                </h1>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show error state when API fails
  if ((currentView === 'view' || currentView === 'edit') && selectedMaintenanceId && maintenanceError) {
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
                  Error Loading Maintenance
                </h1>
              </div>
            </div>
          </div>
          <div className="text-center text-red-600">
            <p>Failed to load maintenance details. Please try again.</p>
            <Button 
              onClick={handleBackToList} 
              variant="primary" 
              label="Back to Maintenance"
              className="mt-4"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Render different views based on currentView state
  if (currentView === 'view' && maintenanceData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div key={`view-${selectedMaintenanceId}`} className="p-6">
          {/* Header with Back Button and Action Buttons */}
          <div className="flex justify-between items-center mb-8">
            <Button 
              onClick={handleBackToList} 
              variant="outlineDark"
              label="Back"
              icon={<ArrowLeft className="h-4 w-4" />}
              className="px-4 py-2 rounded-lg"
            />
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Maintenance — Detail (#{selectedMaintenanceId})
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                label="Schedule"
                variant="outlineDark"
                icon={<Calendar className="h-4 w-4" />}
                onClick={() => {}}
              />
              <Button
                label="Start"
                variant="primary"
                icon={<Play className="h-4 w-4" />}
                onClick={() => {}}
              />
              <Button
                label="Complete"
                variant="primary"
                icon={<Check className="h-4 w-4" />}
                onClick={() => {}}
              />
              <Button
                label="Cancel"
                variant="outlineDark"
                icon={<X className="h-4 w-4" />}
                onClick={() => {}}
              />
            </div>
          </div>

          {/* KPI Cards for Detail View */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                  <div className="mt-2">
                    {getStatusBadge(maintenanceData.status)}
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled Time</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {maintenanceData.scheduled_date ? new Date(maintenanceData.scheduled_date).toLocaleDateString() : 'Not Set'}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estimated Duration (h)</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {maintenanceData.estimated_duration_hours || 'Not Set'}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cost</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {maintenanceData.cost ? `$${maintenanceData.cost}` : 'Not Set'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout as per Documentation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Record (Left Column) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <Wrench className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Record</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {maintenanceData.vehicle ? `${maintenanceData.vehicle.license_plate}` : 'Not Assigned'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Maintenance Type</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{maintenanceData.maintenance_type}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{maintenanceData.title}</span>
                </div>
                <div className="py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">Description</span>
                  <span className="text-gray-900 dark:text-white">{maintenanceData.description || 'No description provided'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Scheduled Date</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {maintenanceData.scheduled_date ? new Date(maintenanceData.scheduled_date).toLocaleString() : 'Not Set'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {maintenanceData.start_date ? new Date(maintenanceData.start_date).toLocaleString() : 'Not Started'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {maintenanceData.end_date ? new Date(maintenanceData.end_date).toLocaleString() : 'Not Completed'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {getPriorityBadge(maintenanceData.priority || 'medium')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Work Order Number</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {maintenanceData.work_order_number || 'Not Set'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {maintenanceData.location || 'Not Specified'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Est. Duration (hours)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {maintenanceData.estimated_duration_hours || 'Not Set'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Cost</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {maintenanceData.cost ? `$${maintenanceData.cost}` : 'Not Set'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Technician</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {maintenanceData.technician || 'Unassigned'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Parts Used</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {maintenanceData.parts_used || 'None Listed'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Alerts Enabled</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {maintenanceData.alerts_enabled ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle (Right Column) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Vehicle</h3>
              </div>
              <div className="text-center">
                <Button
                  label="Open Vehicle"
                  variant="primary"
                  icon={<Car className="h-4 w-4" />}
                  onClick={() => {
                    if (maintenanceData.vehicle?.id) {
                      router.push(`/vehicles/${maintenanceData.vehicle.id}`);
                    }
                  }}
                />
                {maintenanceData.vehicle && (
                  <div className="mt-6 space-y-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {maintenanceData.vehicle.make} {maintenanceData.vehicle.model}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        License Plate: {maintenanceData.vehicle.license_plate}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Work Order Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Work Order</h3>
              </div>
              <Button
                label="Open HTML"
                variant="primary"
                icon={<FileText className="h-4 w-4" />}
                onClick={() => {
                  // Open work order PDF endpoint
                  window.open(`/api/fleet/maintenance-records/${selectedMaintenanceId}/work_order_pdf/`, '_blank');
                }}
              />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (currentView === 'edit' && maintenanceData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div key={`edit-${selectedMaintenanceId}`} className="p-6">
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
                    Maintenance Type
                  </label>
                  <select
                    name="maintenance_type"
                    value={formData.maintenance_type || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.maintenance_type ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">Select maintenance type</option>
                    <option value="routine">Routine</option>
                    <option value="repair">Repair</option>
                    <option value="inspection">Inspection</option>
                    <option value="emergency">Emergency</option>
                  </select>
                  {errors.maintenance_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.maintenance_type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    name="scheduled_date"
                    value={formData.scheduled_date ? formData.scheduled_date.split('T')[0] : ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.scheduled_date ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.scheduled_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.scheduled_date}</p>
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
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estimated Duration (hours)
                  </label>
                  <input
                    type="number"
                    name="estimated_duration"
                    value={formData.estimated_duration || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estimated Cost ($)
                  </label>
                  <input
                    type="number"
                    name="estimated_cost"
                    value={formData.estimated_cost || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Description Field */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter maintenance description..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
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
                onClick={isUpdating ? undefined : handleSaveMaintenance}
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
            <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
            <p className="text-muted-foreground">
              Schedule and track vehicle maintenance activities
            </p>
          </div>
          <Button
            label="Create"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => router.push('/maintenance/add')}
          />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setCurrentView('maintenance-records')}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm",
                currentView === 'maintenance-records'
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              Maintenance Records
            </button>
            <button
              onClick={() => setCurrentView('scheduled-maintenance')}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm",
                currentView === 'scheduled-maintenance'
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              Scheduled Maintenance
            </button>
          </nav>
        </div>

        {/* Conditional Content Based on View */}
        {currentView === 'maintenance-records' && (
          <>
            {/* KPI Cards for Maintenance Records */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled (M)</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(overviewMetricsData as any)?.scheduled_this_month || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(overviewMetricsData as any)?.completed || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(overviewMetricsData as any)?.overdue || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cost (6 mo)</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${(overviewMetricsData as any)?.cost_last_6_months || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {currentView === 'scheduled-maintenance' && (
          <>
            {/* KPI Cards for Scheduled Maintenance */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(scheduledDashboardStats as any)?.total_records || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Due Soon (≤30 days)</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(scheduledDashboardStats as any)?.due_soon_records || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(scheduledDashboardStats as any)?.overdue_records || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(scheduledDashboardStats as any)?.completed_records || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Maintenance Records Filters and Content */}
        {currentView === 'maintenance-records' && (
          <>
            {/* Filters */}
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vehicle
              </label>
              <select
                value={filters.vehicle_id || "all"}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  dispatch(setMaintenanceFilters({ vehicle_id: e.target.value === "all" ? undefined : e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Vehicles</option>
                {(vehiclesData?.results || []).map((vehicle: any) => (
                  <option key={vehicle.id} value={vehicle.id.toString()}>
                    {vehicle.license_plate} - {vehicle.make} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={filters.maintenance_type || "all"}
              onChange={handleMaintenanceTypeFilter}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="routine">Routine</option>
                <option value="repair">Repair</option>
                <option value="inspection">Inspection</option>
                <option value="battery">Battery</option>
                <option value="software">Software</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Scheduled Date Range
              </label>
              <div className="flex space-x-2">
                <input
              type="date"
              value={filters.start_date || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                dispatch(setMaintenanceFilters({ start_date: e.target.value }))
              }
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            />
                <input
              type="date"
              value={filters.end_date || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                dispatch(setMaintenanceFilters({ end_date: e.target.value }))
              }
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button
              label="Apply"
              variant="primary"
              size="small"
              onClick={() => {}}
            />
          </div>
        </div>

        {/* Maintenance Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-6 border-b border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold">Maintenance Records</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {maintenanceData?.count || 0} maintenance records found
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
                Error loading maintenance
              </div>
            ) : maintenanceListData?.results?.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No maintenance records found.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: '1200px' }}>
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Scheduled
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Technician
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-dark divide-y divide-gray-200 dark:divide-gray-700">
                  {maintenanceListData?.results?.map((maintenance) => (
                    <tr key={maintenance.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Car className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {maintenance.vehicle?.license_plate || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {maintenance.vehicle ? `${maintenance.vehicle.make} ${maintenance.vehicle.model}` : "No Vehicle"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getMaintenanceTypeBadge(maintenance.maintenance_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(maintenance.status)}
                          {isOverdue(maintenance.scheduled_date) && maintenance.status === "scheduled" && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              {maintenance.scheduled_date ? new Date(maintenance.scheduled_date).toLocaleDateString() : "Not Set"}
                            </span>
                          </div>
                          {maintenance.scheduled_date && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(maintenance.scheduled_date).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{maintenance.technician || "Unassigned"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>{maintenance.cost ? `$${maintenance.cost}` : "Not Set"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            label="View"
                            variant="outlineDark"
                            size="small"
                            icon={<Eye className="h-4 w-4" />}
                            onClick={() => handleViewMaintenance(maintenance.id)}
                          />
                          <Button
                            label="Work Order"
                            variant="outlineDark"
                            size="small"
                            icon={<FileText className="h-4 w-4" />}
                            onClick={() => {
                              // Open work order PDF endpoint
                              window.open(`/api/fleet/maintenance-records/${maintenance.id}/work_order_pdf/`, '_blank');
                            }}
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
          {maintenanceData && maintenanceData.count > 0 && (
            <div className="px-6 py-4 border-t border-stroke dark:border-dark-3 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, maintenanceData.count)} of{" "}
                {maintenanceData.count} results
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
                  Page {pagination.page} of {Math.ceil(maintenanceData.count / pagination.limit)}
                </span>
                {pagination.page < Math.ceil(maintenanceData.count / pagination.limit) ? (
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
          </>
        )}

        {/* Scheduled Maintenance Content */}
        {currentView === 'scheduled-maintenance' && (
          <>
            {/* Scheduled Maintenance Filters */}
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vehicle
                  </label>
                  <select
                    value={filters.vehicle_id || "all"}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                      dispatch(setMaintenanceFilters({ vehicle_id: e.target.value === "all" ? undefined : e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Vehicles</option>
                    {(vehiclesData?.results || []).map((vehicle: any) => (
                      <option key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.license_plate} - {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={filters.maintenance_type || "all"}
                    onChange={handleMaintenanceTypeFilter}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="routine">Routine</option>
                    <option value="repair">Repair</option>
                    <option value="inspection">Inspection</option>
                    <option value="battery">Battery</option>
                    <option value="software">Software</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button
                  label="Apply"
                  variant="primary"
                  size="small"
                  onClick={() => {}}
                />
              </div>
            </div>

            {/* Scheduled Maintenance Table */}
            <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
              <div className="p-6 border-b border-stroke dark:border-dark-3 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Scheduled Maintenance</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {scheduledMaintenanceData?.count || 0} scheduled maintenance records found
                  </p>
                </div>
                <Button
                  label="Mark Done"
                  variant="primary"
                  icon={<Check className="h-4 w-4" />}
                  onClick={() => {}}
                />
              </div>
              
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {scheduledLoading ? (
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
                ) : scheduledError ? (
                  <div className="p-6 text-red-600">
                    Error loading scheduled maintenance
                  </div>
                ) : scheduledMaintenanceData?.results?.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No scheduled maintenance records found.
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: '1000px' }}>
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Vehicle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Interval km
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Interval days
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Last Service Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-dark divide-y divide-gray-200 dark:divide-gray-700">
                      {scheduledMaintenanceData?.results?.map((scheduled) => (
                        <tr key={scheduled.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <Car className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {scheduled.vehicle?.license_plate || "N/A"}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {scheduled.vehicle ? `${scheduled.vehicle.make} ${scheduled.vehicle.model}` : "No Vehicle"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getMaintenanceTypeBadge(scheduled.maintenance_type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {scheduled.interval_km ? `${scheduled.interval_km} km` : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {scheduled.interval_days ? `${scheduled.interval_days} days` : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {scheduled.last_service_date ? new Date(scheduled.last_service_date).toLocaleDateString() : "Never"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button
                                label=""
                                variant="outlineDark"
                                size="small"
                                icon={<Check className="h-4 w-4" />}
                                onClick={() => handleMarkServiceDone(scheduled.id)}
                              />
                              <Button
                                label=""
                                variant="outlineDark"
                                size="small"
                                icon={<Edit className="h-4 w-4" />}
                                onClick={() => handleEditMaintenance(scheduled.id)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>

    </ProtectedRoute>
  );
}