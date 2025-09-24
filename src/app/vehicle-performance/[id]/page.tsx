"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetVehiclePerformanceByIdQuery, useUpdateVehiclePerformanceMutation, useDeleteVehiclePerformanceMutation } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Car, Save, Trash2, Battery, MapPin, Clock, Wrench } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { DeleteConfirmationModal } from "@/components/Modals/DeleteConfirmationModal";

export default function VehiclePerformanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const performanceId = params?.id as string;

  const { data: performanceData, isLoading, error } = useGetVehiclePerformanceByIdQuery(performanceId);
  const [updatePerformance] = useUpdateVehiclePerformanceMutation();
  const [deletePerformance] = useDeleteVehiclePerformanceMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicle: "",
    period_start: "",
    period_end: "",
    average_energy_consumption_kwh_per_km: "",
    total_distance_covered_km: "",
    downtime_hours: "",
    battery_health_score: "",
    service_count: ""
  });

  useEffect(() => {
    if (performanceData) {
      const perf = performanceData;
      setFormData({
        vehicle: perf.vehicle?.id?.toString() || "",
        period_start: perf.period_start || "",
        period_end: perf.period_end || "",
        average_energy_consumption_kwh_per_km: perf.average_energy_consumption_kwh_per_km?.toString() || "",
        total_distance_covered_km: perf.total_distance_covered_km?.toString() || "",
        downtime_hours: perf.downtime_hours?.toString() || "",
        battery_health_score: perf.battery_health_score?.toString() || "",
        service_count: perf.service_count?.toString() || ""
      });
    }
  }, [performanceData]);

  const handleSave = async () => {
    try {
      await updatePerformance({
        id: performanceId,
        body: {
          ...formData,
          average_energy_consumption_kwh_per_km: parseFloat(formData.average_energy_consumption_kwh_per_km) || 0,
          total_distance_covered_km: parseFloat(formData.total_distance_covered_km) || 0,
          downtime_hours: parseFloat(formData.downtime_hours) || 0,
          battery_health_score: parseInt(formData.battery_health_score) || 0,
          service_count: parseInt(formData.service_count) || 0
        }
      }).unwrap();
      setIsEditing(false);
      alert('Vehicle performance updated successfully');
    } catch (error) {
      console.error('Failed to update vehicle performance:', error);
      alert('Failed to update vehicle performance');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePerformance(performanceId).unwrap();
      router.push('/vehicle-performance');
    } catch (error) {
      console.error('Failed to delete vehicle performance:', error);
      alert('Failed to delete vehicle performance');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !performanceData) {
    return (
      <ProtectedRoute requiredRoles={['admin']}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => router.back()} 
                variant="outlineDark"
                label="Back"
                icon={<ArrowLeft className="h-4 w-4" />}
                className="px-4 py-2 rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Error Loading Performance Record
                </h1>
              </div>
            </div>
          </div>
          <div className="text-center text-red-600">
            <p>Failed to load vehicle performance details. Please try again.</p>
            <Button 
              onClick={() => router.back()} 
              variant="primary" 
              label="Back to Vehicle Performance"
              className="mt-4"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const performance = performanceData;

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="p-6">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Button 
            onClick={() => router.back()} 
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
              Vehicle Performance — Detail (#{performance.id})
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Vehicle: {performance.vehicle?.license_plate || 'Unknown'} | Period: {performance.period_start ? new Date(performance.period_start).toLocaleDateString() : 'N/A'} → {performance.period_end ? new Date(performance.period_end).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button
                  label="Cancel"
                  variant="outlineDark"
                  onClick={() => setIsEditing(false)}
                />
                <Button
                  label="Save"
                  variant="primary"
                  icon={<Save className="h-4 w-4" />}
                  onClick={handleSave}
                />
              </>
            ) : (
              <>
                <Button
                  label="Edit"
                  variant="primary"
                  onClick={() => setIsEditing(true)}
                />
                <Button
                  label="Delete"
                  variant="outlineDark"
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() => setShowDeleteModal(true)}
                />
              </>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Energy (kWh/km)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? (
                    <InputGroup
                      type="number"
                      label=""
                      placeholder="0.00"
                      value={formData.average_energy_consumption_kwh_per_km}
                      handleChange={(e) => setFormData({...formData, average_energy_consumption_kwh_per_km: e.target.value})}
                      className="w-24"
                    />
                  ) : (
                    performance.average_energy_consumption_kwh_per_km || 0
                  )}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Battery className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Distance (km)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? (
                    <InputGroup
                      type="number"
                      label=""
                      placeholder="0"
                      value={formData.total_distance_covered_km}
                      handleChange={(e) => setFormData({...formData, total_distance_covered_km: e.target.value})}
                      className="w-24"
                    />
                  ) : (
                    performance.total_distance_covered_km?.toLocaleString() || 0
                  )}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Downtime (h)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? (
                    <InputGroup
                      type="number"
                      label=""
                      placeholder="0.0"
                      value={formData.downtime_hours}
                      handleChange={(e) => setFormData({...formData, downtime_hours: e.target.value})}
                      className="w-24"
                    />
                  ) : (
                    performance.downtime_hours || 0
                  )}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Battery Health Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? (
                    <InputGroup
                      type="number"
                      label=""
                      placeholder="0"
                      value={formData.battery_health_score}
                      handleChange={(e) => setFormData({...formData, battery_health_score: e.target.value})}
                      className="w-24"
                    />
                  ) : (
                    performance.battery_health_score || 0
                  )}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Battery className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Services Count</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? (
                    <InputGroup
                      type="number"
                      label=""
                      placeholder="0"
                      value={formData.service_count}
                      handleChange={(e) => setFormData({...formData, service_count: e.target.value})}
                      className="w-24"
                    />
                  ) : (
                    performance.service_count || 0
                  )}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Wrench className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Period & Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Period & Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Period Start</p>
              {isEditing ? (
                <InputGroup
                  type="date"
                  label=""
                  placeholder="Select date"
                  value={formData.period_start}
                  handleChange={(e) => setFormData({...formData, period_start: e.target.value})}
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {performance.period_start ? new Date(performance.period_start).toLocaleDateString() : 'N/A'}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Period End</p>
              {isEditing ? (
                <InputGroup
                  type="date"
                  label=""
                  placeholder="Select date"
                  value={formData.period_end}
                  handleChange={(e) => setFormData({...formData, period_end: e.target.value})}
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {performance.period_end ? new Date(performance.period_end).toLocaleDateString() : 'N/A'}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {performance.created_at ? new Date(performance.created_at).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Vehicle Performance"
          message="Are you sure you want to delete this vehicle performance record? This action cannot be undone."
        />
      </div>
    </ProtectedRoute>
  );
}
