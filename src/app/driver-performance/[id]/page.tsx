"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetDriverPerformanceByIdQuery, useUpdateDriverPerformanceMutation, useDeleteDriverPerformanceMutation } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Award, Save, Trash2, Shield, Gauge, Clock, MapPin, AlertTriangle } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { DeleteConfirmationModal } from "@/components/Modals/DeleteConfirmationModal";

export default function DriverPerformanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const performanceId = params?.id as string;

  const { data: performanceData, isLoading, error } = useGetDriverPerformanceByIdQuery(performanceId);
  const [updatePerformance] = useUpdateDriverPerformanceMutation();
  const [deletePerformance] = useDeleteDriverPerformanceMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    driver: "",
    period_start: "",
    period_end: "",
    average_speed_kph: "",
    distance_covered_km: "",
    number_of_harsh_brakes: "",
    number_of_accidents: "",
    safety_score: "",
    eco_score: ""
  });

  useEffect(() => {
    if (performanceData) {
      const perf = performanceData;
      setFormData({
        driver: perf.driver?.id?.toString() || "",
        period_start: perf.period_start || "",
        period_end: perf.period_end || "",
        average_speed_kph: perf.average_speed_kph?.toString() || "",
        distance_covered_km: perf.distance_covered_km?.toString() || "",
        number_of_harsh_brakes: perf.number_of_harsh_brakes?.toString() || "",
        number_of_accidents: perf.number_of_accidents?.toString() || "",
        safety_score: perf.safety_score?.toString() || "",
        eco_score: perf.eco_score?.toString() || ""
      });
    }
  }, [performanceData]);

  const handleSave = async () => {
    try {
      await updatePerformance({
        id: performanceId,
        body: {
          ...formData,
          average_speed_kph: parseFloat(formData.average_speed_kph) || 0,
          distance_covered_km: parseFloat(formData.distance_covered_km) || 0,
          number_of_harsh_brakes: parseInt(formData.number_of_harsh_brakes) || 0,
          number_of_accidents: parseInt(formData.number_of_accidents) || 0,
          safety_score: parseInt(formData.safety_score) || 0,
          eco_score: parseInt(formData.eco_score) || 0
        }
      }).unwrap();
      setIsEditing(false);
      alert('Driver performance updated successfully');
    } catch (error) {
      console.error('Failed to update driver performance:', error);
      alert('Failed to update driver performance');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePerformance(performanceId).unwrap();
      router.push('/driver-performance');
    } catch (error) {
      console.error('Failed to delete driver performance:', error);
      alert('Failed to delete driver performance');
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
            <p>Failed to load driver performance details. Please try again.</p>
            <Button 
              onClick={() => router.back()} 
              variant="primary" 
              label="Back to Driver Performance"
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
              Driver Performance — Detail (#{performance.id})
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Driver: {performance.driver?.name || 'Unknown'} | Period: {performance.period_start ? new Date(performance.period_start).toLocaleDateString() : 'N/A'} → {performance.period_end ? new Date(performance.period_end).toLocaleDateString() : 'N/A'}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Safety Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? (
                    <InputGroup
                      type="number"
                      label=""
                      placeholder="0"
                      value={formData.safety_score}
                      handleChange={(e) => setFormData({...formData, safety_score: e.target.value})}
                      className="w-20"
                    />
                  ) : (
                    performance.safety_score || 0
                  )}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Eco Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? (
                    <InputGroup
                      type="number"
                      label=""
                      placeholder="0"
                      value={formData.eco_score}
                      handleChange={(e) => setFormData({...formData, eco_score: e.target.value})}
                      className="w-20"
                    />
                  ) : (
                    performance.eco_score || 0
                  )}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Gauge className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Speed (kph)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? (
                    <InputGroup
                      type="number"
                      label=""
                      placeholder="0"
                      value={formData.average_speed_kph}
                      handleChange={(e) => setFormData({...formData, average_speed_kph: e.target.value})}
                      className="w-20"
                    />
                  ) : (
                    performance.average_speed_kph || 0
                  )}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
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
                      value={formData.distance_covered_km}
                      handleChange={(e) => setFormData({...formData, distance_covered_km: e.target.value})}
                      className="w-20"
                    />
                  ) : (
                    performance.distance_covered_km?.toLocaleString() || 0
                  )}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <MapPin className="h-6 w-6 text-orange-600" />
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Harsh Brakes</p>
              {isEditing ? (
                <InputGroup
                  type="number"
                  label=""
                  placeholder="0"
                  value={formData.number_of_harsh_brakes}
                  handleChange={(e) => setFormData({...formData, number_of_harsh_brakes: e.target.value})}
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {performance.number_of_harsh_brakes || 0}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Accidents</p>
              {isEditing ? (
                <InputGroup
                  type="number"
                  label=""
                  placeholder="0"
                  value={formData.number_of_accidents}
                  handleChange={(e) => setFormData({...formData, number_of_accidents: e.target.value})}
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {performance.number_of_accidents || 0}
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
          title="Delete Driver Performance"
          message="Are you sure you want to delete this driver performance record? This action cannot be undone."
        />
      </div>
    </ProtectedRoute>
  );
}
