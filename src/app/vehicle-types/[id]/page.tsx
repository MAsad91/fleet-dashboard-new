"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetVehicleTypeByIdQuery, useListVehiclesQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Edit, Trash2, Truck, Battery, Zap, Gauge, BarChart3, FileText, AlertTriangle, Car, CheckCircle } from "lucide-react";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";

interface VehicleTypeDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VehicleTypeDetailPage({ params }: VehicleTypeDetailPageProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [id, setId] = useState<string>('');
  
  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
    });
  }, [params]);

  const { data: typeData, isLoading, error } = useGetVehicleTypeByIdQuery(id, {
    skip: !id
  });
  const { data: vehiclesData } = useListVehiclesQuery({ vehicle_type: id }, {
    skip: !id
  });

  const vehicleType = typeData;
  const vehicles = vehiclesData?.results || [];

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !vehicleType) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="text-center text-red-600">
          <p>Error loading vehicle type</p>
        </div>
      </ProtectedRoute>
    );
  }

  const handleEdit = () => {
    router.push(`/vehicle-types/${id}/edit`);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    // TODO: Implement delete vehicle type API call
    console.log('Delete vehicle type:', id);
    setIsDeleteModalOpen(false);
    router.push('/vehicle-types');
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="space-y-6">
        {/* HEADER: Back Button + Beautiful Title Card */}
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

          {/* Beautiful Title Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-lg border border-blue-200 dark:border-gray-600 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 dark:bg-gray-600 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200 dark:bg-gray-600 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                {/* Left Side - Vehicle Type Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <Truck className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Vehicle Type — Detail
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        #{vehicleType.id} • {vehicleType.name || 'Vehicle Type'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {vehicleType.category || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <Battery className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Battery</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {vehicleType.battery_capacity_kwh || 'N/A'} kWh
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center space-x-2">
                        {vehicleType.status === 'active' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {vehicleType.status === 'active' ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Action Buttons */}
                <div className="flex flex-col space-y-2">
                  <Button
                    label="Edit"
                    variant="outlineDark"
                    size="small"
                    icon={<Edit className="h-3 w-3" />}
                    onClick={handleEdit}
                    className="px-3 py-2"
                  />
                  <Button
                    label="Delete"
                    variant="outlineDark"
                    size="small"
                    icon={<Trash2 className="h-3 w-3" />}
                    onClick={handleDelete}
                    className="px-3 py-2 text-red-600 hover:text-red-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Vehicles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {vehicleType.active_vehicle_count || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Battery (kWh)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {vehicleType.battery_capacity_kwh || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Battery className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Motor (kW)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {vehicleType.motor_power_kw || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">WLTP Range (km)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {vehicleType.wltp_range_km || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Gauge className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Info Column */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Code:</span>
                <span className="text-sm text-gray-900 dark:text-white">{vehicleType.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Name:</span>
                <span className="text-sm text-gray-900 dark:text-white">{vehicleType.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Category:</span>
                <span className="text-sm text-gray-900 dark:text-white">{vehicleType.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Drivetrain:</span>
                <span className="text-sm text-gray-900 dark:text-white">{vehicleType.drivetrain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  vehicleType.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {vehicleType.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Description:</span>
                <span className="text-sm text-gray-900 dark:text-white text-right max-w-xs">
                  {vehicleType.description || 'No description'}
                </span>
              </div>
            </div>
          </div>

          {/* Insights Column */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="space-y-4">
              <Button
                label="Firmware Lineage"
                variant="outlineDark"
                icon={<FileText className="h-4 w-4" />}
                onClick={() => {/* TODO: Implement firmware lineage */}}
                className="w-full justify-start"
              />
              <Button
                label="Alert Breakdown"
                variant="outlineDark"
                icon={<AlertTriangle className="h-4 w-4" />}
                onClick={() => {/* TODO: Implement alert breakdown */}}
                className="w-full justify-start"
              />
              <Button
                label="Type Documents"
                variant="outlineDark"
                icon={<FileText className="h-4 w-4" />}
                onClick={() => {/* TODO: Implement type documents */}}
                className="w-full justify-start"
              />
              <Button
                label="Active Vehicles"
                variant="outlineDark"
                icon={<Car className="h-4 w-4" />}
                onClick={() => {/* TODO: Show active vehicles */}}
                className="w-full justify-start"
              />
            </div>
          </div>
        </div>

        {/* Vehicles Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vehicles ({vehicles.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    VIN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Plate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Make/Model (Year)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Battery %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Online
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Health
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {vehicles.map((vehicle: any) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {vehicle.vin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {vehicle.license_plate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {vehicle.make} / {vehicle.model} ({vehicle.year})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {vehicle.current_battery_level || 0}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vehicle.status === 'available' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : vehicle.status === 'in_service'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vehicle.online_status 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {vehicle.online_status ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vehicle.health_status === 'Good'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : vehicle.health_status === 'Warning'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {vehicle.health_status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {vehicles.length === 0 && (
            <div className="text-center py-12">
              <Truck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No vehicles found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No vehicles are currently assigned to this vehicle type.
              </p>
            </div>
          )}
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
