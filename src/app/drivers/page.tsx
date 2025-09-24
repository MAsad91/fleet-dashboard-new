"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useListDriversQuery, useSuspendDriversMutation, useDeleteDriverMutation, useGetDriverByIdQuery, useUpdateDriverMutation, useDownloadDriversCsvMutation } from "@/store/api/driversApi";
import { useRealtimeEntityUpdates } from "@/hooks/useRealtimeData";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDriverFilters } from "@/store/slices/driversSlice";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Plus, Eye, Edit, Trash2, ArrowLeft, Save, X, User, Phone, Mail, Calendar, Car, Download, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";

export default function DriversPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.driversUI.filters);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [selectedDrivers, setSelectedDrivers] = useState<number[]>([]);
  
  // Full-page view states
  const [currentView, setCurrentView] = useState<'list' | 'view' | 'edit'>('list');
  const [driverData, setDriverData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading, refetch } = useListDriversQuery({
    page: filters.page,
    search: filters.search,
    status: filters.status,
  });

  // Enable real-time updates for drivers
  useRealtimeEntityUpdates('drivers', refetch);

  // API hooks for full-page views
  const { 
    data: driverDetails, 
    isLoading: driverLoading, 
    error: driverError 
  } = useGetDriverByIdQuery(selectedDriverId?.toString() || '', {
    skip: !selectedDriverId
  });

  const [updateDriver, { isLoading: isUpdating }] = useUpdateDriverMutation();
  const [suspendDrivers, { isLoading: isSuspending }] = useSuspendDriversMutation();
  const [deleteDriver] = useDeleteDriverMutation();
  const [downloadCsv, { isLoading: isDownloading }] = useDownloadDriversCsvMutation();

  // Update driver data when API response changes
  useEffect(() => {
    if (driverDetails) {
      setDriverData(driverDetails);
      setFormData(driverDetails);
    }
  }, [driverDetails]);

  const handleViewDriver = (driverId: number) => {
    console.log('Opening driver view:', driverId);
    setSelectedDriverId(driverId);
    setCurrentView('view');
  };

  const handleEditDriver = (driverId: number) => {
    console.log('Opening driver edit:', driverId);
    setSelectedDriverId(driverId);
    setCurrentView('edit');
  };

  const handleBackToList = () => {
    console.log('Going back to list');
    setCurrentView('list');
    // Don't reset selectedDriverId to allow re-navigation
  };

  const handleClearSelection = () => {
    console.log('Clearing selection');
    setSelectedDriverId(null);
    setDriverData(null);
    setFormData({});
    setErrors({});
    setCurrentView('list');
  };

  const handleSuccess = () => {
    refetch();
  };

  const handleDeleteDriver = (driverId: number) => {
    setSelectedDriverId(driverId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteDriver = async () => {
    if (!selectedDriverId) return;
    
    try {
      await deleteDriver(selectedDriverId.toString()).unwrap();
      setIsDeleteConfirmOpen(false);
      handleClearSelection();
    } catch (error) {
      console.error("Failed to delete driver:", error);
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
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDriver = async () => {
    if (!validateForm()) return;
    
    try {
      await updateDriver({
        id: selectedDriverId!.toString(),
        body: formData
      }).unwrap();
      
      console.log('Driver updated successfully');
      handleClearSelection();
    } catch (error) {
      console.error('Failed to update driver:', error);
    }
  };

  useEffect(() => {
    // Ensure page defaults
    if (!filters.page) {
      dispatch(setDriverFilters({ page: 1 }));
    }
  }, [dispatch, filters.page]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDriverFilters({ search: e.target.value, page: 1 }));
  };

  const handleStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setDriverFilters({ status: e.target.value || undefined, page: 1 }));
  };

  const handlePage = (delta: number) => {
    const next = Math.max(1, (filters.page || 1) + delta);
    dispatch(setDriverFilters({ page: next }));
  };

  const handleSuspendSelected = async () => {
    // Minimal demo action: suspend first 3 if present
    const ids = (data?.results || []).slice(0, 3).map((d: any) => d.id);
    if (ids.length) {
      await suspendDrivers({ ids });
      refetch();
    }
  };

  const handleExportCsv = async () => {
    if (isDownloading) return;
    
    try {
      const ids = selectedDrivers.length > 0 ? selectedDrivers : (data?.results || []).map((d: any) => d.id);
      const response = await downloadCsv({ ids: ids.map(id => id.toString()) }).unwrap();
      
      // Create blob and download
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `drivers_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };

  // Debug current state
  console.log('Current Drivers state:', { currentView, selectedDriverId, driverData: !!driverData, driverLoading });

  // Show loading state when switching drivers
  if ((currentView === 'view' || currentView === 'edit') && selectedDriverId && !driverData && driverLoading) {
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
                  Loading Driver...
                </h1>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show error state when API fails
  if ((currentView === 'view' || currentView === 'edit') && selectedDriverId && driverError) {
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
                  Error Loading Driver
                </h1>
              </div>
            </div>
          </div>
          <div className="text-center text-red-600">
            <p>Failed to load driver details. Please try again.</p>
            <Button 
              onClick={handleBackToList} 
              variant="primary" 
              label="Back to Drivers"
              className="mt-4"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Render different views based on currentView state
  if (currentView === 'view' && driverData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div key={`view-${selectedDriverId}`} className="p-6">
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

          {/* Driver Information Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-lg">{driverData.first_name} {driverData.last_name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{driverData.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{driverData.phone}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {driverData.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        Inactive
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created At</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {driverData.created_at ? new Date(driverData.created_at).toLocaleString() : 'Unknown'}
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
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Driver Information</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">License Number</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{driverData.license_number || 'Not Provided'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">License Expiry</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {driverData.license_expiry ? new Date(driverData.license_expiry).toLocaleDateString() : 'Not Set'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Assigned Vehicle</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {driverData.vehicle ? `${driverData.vehicle.make} ${driverData.vehicle.model} (${driverData.vehicle.license_plate})` : 'Not Assigned'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Experience</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {driverData.experience_years ? `${driverData.experience_years} years` : 'Not Specified'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (currentView === 'edit' && driverData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div key={`edit-${selectedDriverId}`} className="p-6">
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.first_name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.last_name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.phone ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Driver Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Driver Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    License Expiry
                  </label>
                  <input
                    type="date"
                    name="license_expiry"
                    value={formData.license_expiry ? formData.license_expiry.split('T')[0] : ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    name="is_active"
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
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
                onClick={handleSaveDriver} 
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
            <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
            <p className="text-muted-foreground">
              Manage drivers, documents, and status
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              label={isDownloading ? "Exporting..." : "Export CSV"}
              variant="outlineDark"
              icon={<Download className="h-4 w-4" />}
              onClick={handleExportCsv}
              className={`${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <Button
              label="Add Driver"
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => router.push('/drivers/add')}
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Drivers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data?.count || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Drivers</p>
                <p className="text-2xl font-bold text-green-600">
                  {data?.results?.filter((driver: any) => (driver.status || 'active').toLowerCase() === 'active').length || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suspended</p>
                <p className="text-2xl font-bold text-red-600">
                  {data?.results?.filter((driver: any) => (driver.status || 'active').toLowerCase() === 'suspended').length || 0}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <User className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(() => {
                    const ratings = data?.results?.map((driver: any) => driver.rating).filter((r: any) => r != null) || [];
                    return ratings.length > 0 ? Number(ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length).toFixed(1) : 'N/A';
                  })()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <User className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Driver Docs (30d)</p>
                <p className="text-2xl font-bold text-orange-600">
                  {/* TODO: This would need to be calculated from driver documents */}
                  0
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputGroup
              label="Search"
              type="text"
              placeholder="Search drivers..."
              value={filters.search || ""}
              handleChange={handleSearch}
              icon={<Search className="h-4 w-4 text-gray-400" />}
              iconPosition="left"
            />
            
            <Select
              label="Status"
              items={[
                { value: "", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "suspended", label: "Suspended" },
              ]}
              defaultValue={filters.status || ""}
              placeholder="Select status"
              onChange={handleStatus}
            />
            
            <InputGroup
              label="Min Rating"
              type="number"
              placeholder="Min rating (1-5)"
              value={filters.minRating || ""}
              handleChange={(e) => dispatch(setDriverFilters({ ...filters, minRating: e.target.value }))}
              icon={<User className="h-4 w-4 text-gray-400" />}
              iconPosition="left"
            />
          </div>
          
          <div className="flex justify-end mt-4">
            <Button
              label="Clear Filters"
              variant="outlineDark"
              size="small"
              onClick={() => dispatch(setDriverFilters({ search: "", status: "", minRating: "" }))}
            />
          </div>
        </div>

        {/* Drivers Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-6 border-b border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold">Driver List</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {data?.count || 0} drivers found
            </p>
          </div>
          
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  License
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Exp.(y)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700"/>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700"/>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"/>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"/>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"/>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"/>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"/>
                    </td>
                  </tr>
                ))
              ) : (data?.results || []).length ? (
                (data?.results || []).map((driver: any) => (
                  <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {driver.name || driver.full_name || driver.username || `Driver #${driver.id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {driver.phone_number || driver.phone || driver.mobile || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {driver.license_number || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {driver.experience_years || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {driver.rating ? driver.rating.toFixed(1) : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                        (driver.status || "active").toLowerCase() === "active" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      )}>
                        {(driver.status || "active").charAt(0).toUpperCase() + (driver.status || "active").slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          label=""
                          variant="outlineDark"
                          size="small"
                          icon={<Eye className="h-4 w-4" />}
                          onClick={() => handleViewDriver(driver.id)}
                        />
                        <Button
                          label=""
                          variant="outlineDark"
                          size="small"
                          icon={<Edit className="h-4 w-4" />}
                          onClick={() => handleEditDriver(driver.id)}
                        />
                        <Button
                          label=""
                          variant="outlineDark"
                          size="small"
                          icon={<Trash2 className="h-4 w-4" />}
                          onClick={() => handleDeleteDriver(driver.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={5}>
                    No drivers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white dark:bg-gray-900 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePage(-1)}
              disabled={!data?.previous}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
            >
              Previous
            </button>
            <button
              onClick={() => handlePage(1)}
              disabled={!data?.next}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing page <span className="font-medium">{filters.page || 1}</span> of{' '}
                <span className="font-medium">{Math.ceil((data?.count || 0) / 10)}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePage(-1)}
                  disabled={!data?.previous}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => handlePage(1)}
                  disabled={!data?.next}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>



    {/* Delete Confirmation Modal */}
    <ConfirmationModal
      isOpen={isDeleteConfirmOpen}
      onClose={() => {
        setIsDeleteConfirmOpen(false);
        setSelectedDriverId(null);
      }}
      onConfirm={confirmDeleteDriver}
      title="Delete Driver"
      message={`Are you sure you want to delete this driver? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      type="danger"
    />
    </ProtectedRoute>
  );
}


