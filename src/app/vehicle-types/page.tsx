"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useListVehicleTypesQuery, useDeleteVehicleTypeMutation, useUploadVehicleTypesCSVMutation } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Plus, Eye, Edit, Trash2, Truck, Settings, Upload, BarChart3, Car, Battery, Zap, Gauge } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";

export default function VehicleTypesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  const { data: typesData, isLoading, error, refetch } = useListVehicleTypesQuery();
  const [deleteVehicleType] = useDeleteVehicleTypeMutation();
  const [uploadCSV] = useUploadVehicleTypesCSVMutation();

  const types = typesData?.results || [];

  // Calculate KPI data
  const totalTypes = types.length;
  const activeTypes = types.filter((type: any) => type.status === 'active').length;
  const totalActiveVehicles = types.reduce((sum: number, type: any) => sum + (type.active_vehicle_count || 0), 0);

  const filteredTypes = types.filter((type: any) => {
    const matchesSearch = !searchTerm || 
      type.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || type.status === statusFilter;
    const matchesCategory = !categoryFilter || type.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleAddType = () => {
    router.push('/vehicle-types/add');
  };

  const handleViewType = (typeId: number) => {
    router.push(`/vehicle-types/${typeId}`);
  };

  const handleEditType = (typeId: number) => {
    router.push(`/vehicle-types/${typeId}/edit`);
  };

  const handleDeleteType = (typeId: number) => {
    setSelectedTypeId(typeId);
    setIsDeleteModalOpen(true);
  };

  const handleSelectAll = () => {
    if (selectedTypes.length === filteredTypes.length) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(filteredTypes.map((type: any) => type.id));
    }
  };

  const handleSelectType = (typeId: number) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const confirmDelete = async () => {
    if (selectedTypeId) {
      try {
        await deleteVehicleType(selectedTypeId.toString()).unwrap();
        refetch();
        setIsDeleteModalOpen(false);
        setSelectedTypeId(null);
      } catch (error) {
        console.error('Failed to delete vehicle type:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTypes.length === 0) return;
    
    try {
      // Delete all selected vehicle types
      await Promise.all(
        selectedTypes.map(id => deleteVehicleType(id.toString()).unwrap())
      );
      setSelectedTypes([]);
      refetch();
    } catch (error) {
      console.error('Failed to delete vehicle types:', error);
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      await uploadCSV(formData).unwrap();
      refetch();
      // Reset the input
      event.target.value = '';
    } catch (error) {
      console.error('Failed to upload CSV:', error);
    }
  };

  const handleSuccess = () => {
    refetch();
  };

  const getSelectedTypeData = () => {
    return types.find((type: any) => type.id === selectedTypeId);
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

  if (error) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="text-center text-red-600">
          <p>Error loading vehicle types</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Vehicle Types</h1>
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button
                label="Upload CSV"
                variant="outlineDark"
                icon={<Upload className="h-4 w-4" />}
                onClick={() => {}}
              />
            </div>
            <Button
              label="+ Create"
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={handleAddType}
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Types</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTypes}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Types</p>
                <p className="text-2xl font-bold text-green-600">{activeTypes}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Vehicles</p>
                <p className="text-2xl font-bold text-purple-600">{totalActiveVehicles}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Car className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {Array.from(new Set(types.map((type: any) => type.category))).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <InputGroup
              label="Search name/code"
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              handleChange={(e) => setSearchTerm(e.target.value)}
              icon={<Truck className="h-4 w-4 text-gray-400" />}
              iconPosition="left"
            />

            <div className="flex items-end">
              <Button
                label="Apply"
                variant="primary"
                size="small"
                onClick={() => {}} // Filters are applied automatically
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Types Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-6 border-b border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold">Vehicle Types List</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredTypes.length} types found
            </p>
          </div>
          
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {/* Bulk Actions */}
            {filteredTypes.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTypes.length === filteredTypes.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        [Select All]
                      </span>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {selectedTypes.length > 0 && (
                      <Button
                        label="[Delete Selected]"
                        variant="outlineDark"
                        onClick={handleBulkDelete}
                        className="text-sm"
                      />
                    )}
                    
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Page 1/2
                    </div>
                  </div>
                </div>
              </div>
            )}
          
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: '1200px' }}>
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedTypes.length === filteredTypes.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Drivetrain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Battery (kWh)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Motor (kW)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    WLTP Range (km)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Active
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTypes.map((type: any) => (
                  <tr 
                    key={type.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150"
                    onClick={(e) => {
                      // Don't navigate if clicking on checkbox
                      const target = e.target as HTMLElement;
                      const isCheckbox = (target as HTMLInputElement).type === 'checkbox' || target.closest('input[type="checkbox"]');
                      
                      if (!isCheckbox) {
                        router.push(`/vehicle-types/${type.id}`);
                      }
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectType(type.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {type.code || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {type.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {type.category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {type.drivetrain || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {type.battery_capacity_kwh || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {type.motor_power_kw || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {type.wltp_range_km || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        type.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {type.status || 'inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {type.active_vehicle_count || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTypes.length === 0 && (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No vehicle types found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Get started by adding a new vehicle type"
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Vehicle Type"
          message="Are you sure you want to delete this vehicle type? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </ProtectedRoute>
  );
}
