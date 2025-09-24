"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetTripByIdQuery, useUpdateTripMutation } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Save, X } from "lucide-react";

export default function TripEditPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const { data: tripData, isLoading, error } = useGetTripByIdQuery(tripId);
  const [updateTrip, { isLoading: isUpdating }] = useUpdateTripMutation();

  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  // Update formData when tripData changes
  useEffect(() => {
    if (tripData) {
      setFormData({
        status: tripData.status || '',
        start_time: tripData.start_time || '',
        end_time: tripData.end_time || '',
        start_location: tripData.start_location || '',
        end_location: tripData.end_location || '',
        purpose: tripData.purpose || '',
        route_type: tripData.route_type || '',
        notes: tripData.notes || '',
        weather: tripData.weather || '',
        traffic_conditions: tripData.traffic_conditions || '',
      });
    }
  }, [tripData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.status?.trim()) newErrors.status = 'Status is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveTrip = async () => {
    if (!validateForm()) return;

    try {
      const apiData = {
        status: formData.status,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        start_location: formData.start_location || null,
        end_location: formData.end_location || null,
        purpose: formData.purpose || null,
        route_type: formData.route_type || null,
        notes: formData.notes || null,
        weather: formData.weather || null,
        traffic_conditions: formData.traffic_conditions || null,
      };

      await updateTrip({ id: tripId, body: apiData }).unwrap();
      router.push(`/trips/${tripId}`);
    } catch (error: any) {
      console.error('Error updating trip:', error);
      // Handle validation errors from API
      if (error.data && typeof error.data === 'object') {
        const apiErrors: Record<string, string> = {};
        Object.keys(error.data).forEach(key => {
          if (Array.isArray(error.data[key])) {
            apiErrors[key] = error.data[key][0];
          } else {
            apiErrors[key] = error.data[key];
          }
        });
        setErrors(apiErrors);
      }
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
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
                  Loading Trip...
                </h1>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
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
                  Error Loading Trip
                </h1>
              </div>
            </div>
          </div>
          <div className="text-center text-red-600">
            <p>Failed to load trip details. Please try again.</p>
            <Button 
              onClick={() => router.back()} 
              variant="primary" 
              label="Back to Trips"
              className="mt-4"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!tripData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
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
                  Trip Not Found
                </h1>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
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

        {/* Edit Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                    errors.status ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <option value="">Select Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="delayed">Delayed</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Purpose
                </label>
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Route Type
                </label>
                <select
                  name="route_type"
                  value={formData.route_type || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                >
                  <option value="">Select Route Type</option>
                  <option value="local">Local</option>
                  <option value="highway">Highway</option>
                  <option value="city">City</option>
                  <option value="rural">Rural</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Location
                </label>
                <input
                  type="text"
                  name="start_location"
                  value={formData.start_location || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Location
                </label>
                <input
                  type="text"
                  name="end_location"
                  value={formData.end_location || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weather
                </label>
                <select
                  name="weather"
                  value={formData.weather || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                >
                  <option value="">Select Weather</option>
                  <option value="sunny">Sunny</option>
                  <option value="cloudy">Cloudy</option>
                  <option value="rainy">Rainy</option>
                  <option value="snowy">Snowy</option>
                  <option value="foggy">Foggy</option>
                  <option value="stormy">Stormy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Traffic Conditions
                </label>
                <select
                  name="traffic_conditions"
                  value={formData.traffic_conditions || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                >
                  <option value="">Select Traffic Conditions</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="heavy">Heavy</option>
                  <option value="congested">Congested</option>
                  <option value="clear">Clear</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button 
              onClick={() => router.back()} 
              variant="outlineDark"
              label="Cancel"
              icon={<X className="h-4 w-4" />}
              className="px-4 py-2 rounded-lg"
            />
            <Button 
              onClick={handleSaveTrip} 
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
