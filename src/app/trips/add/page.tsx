"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateTripMutation, useGetDriversQuery, useListVehiclesQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Save, X } from "lucide-react";

export default function AddTripPage() {
  const router = useRouter();
  const [createTrip, { isLoading }] = useCreateTripMutation();
  
  // Get drivers and vehicles for dropdowns
  const { data: driversData } = useGetDriversQuery({ page: 1 });
  const { data: vehiclesData } = useListVehiclesQuery({ page: 1 });

  const [formData, setFormData] = useState({
    trip_id: "",
    driver: "",
    vehicle: "",
    assignment: "",
    scheduled_start_time: "",
    scheduled_end_time: "",
    start_coordinate: "",
    end_coordinate: "",
    estimated_cost: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
    
    if (!formData.trip_id?.trim()) {
      newErrors.trip_id = 'Trip ID is required';
    }
    if (!formData.driver?.trim()) {
      newErrors.driver = 'Driver is required';
    }
    if (!formData.vehicle?.trim()) {
      newErrors.vehicle = 'Vehicle is required';
    }
    if (!formData.scheduled_start_time?.trim()) {
      newErrors.scheduled_start_time = 'Scheduled start time is required';
    }
    if (!formData.scheduled_end_time?.trim()) {
      newErrors.scheduled_end_time = 'Scheduled end time is required';
    }
    if (!formData.estimated_cost?.trim()) {
      newErrors.estimated_cost = 'Estimated cost is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // Parse coordinates if provided
      let startCoordinate = null;
      let endCoordinate = null;
      
      if (formData.start_coordinate.trim()) {
        try {
          startCoordinate = JSON.parse(formData.start_coordinate);
        } catch (error) {
          setErrors(prev => ({ ...prev, start_coordinate: 'Invalid JSON format' }));
          return;
        }
      }
      
      if (formData.end_coordinate.trim()) {
        try {
          endCoordinate = JSON.parse(formData.end_coordinate);
        } catch (error) {
          setErrors(prev => ({ ...prev, end_coordinate: 'Invalid JSON format' }));
          return;
        }
      }

      const tripData = {
        trip_id: formData.trip_id,
        driver: parseInt(formData.driver),
        vehicle: parseInt(formData.vehicle),
        assignment: formData.assignment || null,
        scheduled_start_time: formData.scheduled_start_time,
        scheduled_end_time: formData.scheduled_end_time,
        start_coordinate: startCoordinate,
        end_coordinate: endCoordinate,
        estimated_cost: parseFloat(formData.estimated_cost)
      };

      const result = await createTrip({ body: tripData }).unwrap();
      
      console.log('Trip created successfully:', result);
      router.push(`/trips/${result.id}`);
    } catch (error) {
      console.error('Failed to create trip:', error);
      setErrors({ submit: 'Failed to create trip. Please try again.' });
    }
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'FLEET_USER']}>
      <div className="space-y-6">
        {/* HEADER: Back Button + Title */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => router.back()}
            variant="outlineDark"
            label="Back"
            icon={<ArrowLeft className="h-4 w-4" />}
            className="px-4 py-2 rounded-lg"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Add Trip
            </h1>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trip ID *
                  </label>
                  <input
                    type="text"
                    name="trip_id"
                    value={formData.trip_id}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.trip_id ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="e.g., T-2025-0098"
                  />
                  {errors.trip_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.trip_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Driver *
                  </label>
                  <select
                    name="driver"
                    value={formData.driver}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.driver ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">Select Driver</option>
                    {driversData?.results?.map((driver: any) => (
                      <option key={driver.id} value={driver.id.toString()}>
                        {driver.name || driver.full_name || driver.username || 'N/A'} ({driver.phone || 'N/A'})
                      </option>
                    ))}
                  </select>
                  {errors.driver && (
                    <p className="mt-1 text-sm text-red-600">{errors.driver}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vehicle *
                  </label>
                  <select
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.vehicle ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">Select Vehicle</option>
                    {vehiclesData?.results?.map((vehicle: any) => (
                      <option key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.plate_number || vehicle.license_plate || 'N/A'} - {vehicle.make || ''} {vehicle.model || ''}
                      </option>
                    ))}
                  </select>
                  {errors.vehicle && (
                    <p className="mt-1 text-sm text-red-600">{errors.vehicle}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assignment (optional)
                  </label>
                  <input
                    type="text"
                    name="assignment"
                    value={formData.assignment}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    placeholder="Assignment ID (optional)"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Scheduled Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduled_start_time"
                    value={formData.scheduled_start_time}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.scheduled_start_time ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.scheduled_start_time && (
                    <p className="mt-1 text-sm text-red-600">{errors.scheduled_start_time}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Scheduled End Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduled_end_time"
                    value={formData.scheduled_end_time}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.scheduled_end_time ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.scheduled_end_time && (
                    <p className="mt-1 text-sm text-red-600">{errors.scheduled_end_time}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Coordinate (optional)
                  </label>
                  <textarea
                    name="start_coordinate"
                    value={formData.start_coordinate}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.start_coordinate ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder='{"type": "Point", "coordinates": [lng, lat]}'
                  />
                  {errors.start_coordinate && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_coordinate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Coordinate (optional)
                  </label>
                  <textarea
                    name="end_coordinate"
                    value={formData.end_coordinate}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.end_coordinate ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder='{"type": "Point", "coordinates": [lng, lat]}'
                  />
                  {errors.end_coordinate && (
                    <p className="mt-1 text-sm text-red-600">{errors.end_coordinate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estimated Cost *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="estimated_cost"
                    value={formData.estimated_cost}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.estimated_cost ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="250.00"
                  />
                  {errors.estimated_cost && (
                    <p className="mt-1 text-sm text-red-600">{errors.estimated_cost}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="text-red-600 text-sm text-center">
                {errors.submit}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => router.back()}
                variant="outlineDark"
                label="Cancel"
                icon={<X className="h-4 w-4" />}
                className="px-4 py-2 rounded-lg"
              />
              <Button
                onClick={handleSubmit}
                variant="primary"
                label={isLoading ? 'Creating...' : 'Save'}
                icon={<Save className="h-4 w-4" />}
                className={`px-6 py-2 rounded-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}