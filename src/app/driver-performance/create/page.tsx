"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, TrendingUp, Loader2 } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";

export default function CreateDriverPerformancePage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    driver: "",
    period: "",
    total_trips: "",
    total_distance: "",
    average_speed: "",
    fuel_efficiency: "",
    safety_score: "",
    performance_rating: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.driver) {
      newErrors.driver = "Driver is required";
    }
    
    if (!formData.period) {
      newErrors.period = "Period is required";
    }
    
    if (!formData.total_trips.trim()) {
      newErrors.total_trips = "Total trips is required";
    }
    
    if (!formData.total_distance.trim()) {
      newErrors.total_distance = "Total distance is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to create driver performance record
      console.log('Creating driver performance:', formData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/driver-performance');
    } catch (error) {
      console.error('Error creating driver performance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/driver-performance');
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleCancel}
            variant="outlinePrimary"
            label="Back"
            icon={<ArrowLeft className="h-4 w-4" />}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Driver Performance</h1>
            <p className="text-gray-600 dark:text-gray-400">Add a new driver performance record</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Driver"
                defaultValue={formData.driver}
                onChange={(e) => handleInputChange('driver', e.target.value)}
                items={[
                  { value: '1', label: 'John Doe' },
                  { value: '2', label: 'Jane Smith' },
                  { value: '3', label: 'Mike Johnson' },
                ]}
              />
              
              <Select
                label="Period"
                defaultValue={formData.period}
                onChange={(e) => handleInputChange('period', e.target.value)}
                items={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'quarterly', label: 'Quarterly' },
                  { value: 'yearly', label: 'Yearly' },
                ]}
              />
              
              <InputGroup
                label="Total Trips"
                type="number"
                placeholder="Enter total trips"
                value={formData.total_trips}
                handleChange={(e) => handleInputChange('total_trips', e.target.value)}
                error={errors.total_trips}
                required
              />
              
              <InputGroup
                label="Total Distance (km)"
                type="number"
                placeholder="Enter total distance"
                value={formData.total_distance}
                handleChange={(e) => handleInputChange('total_distance', e.target.value)}
                error={errors.total_distance}
                required
              />
              
              <InputGroup
                label="Average Speed (km/h)"
                type="number"
                placeholder="Enter average speed"
                value={formData.average_speed}
                handleChange={(e) => handleInputChange('average_speed', e.target.value)}
                error={errors.average_speed}
              />
              
              <InputGroup
                label="Fuel Efficiency (km/L)"
                type="number"
                placeholder="Enter fuel efficiency"
                value={formData.fuel_efficiency}
                handleChange={(e) => handleInputChange('fuel_efficiency', e.target.value)}
                error={errors.fuel_efficiency}
              />
              
              <InputGroup
                label="Safety Score"
                type="number"
                placeholder="Enter safety score"
                value={formData.safety_score}
                handleChange={(e) => handleInputChange('safety_score', e.target.value)}
                error={errors.safety_score}
              />
              
              <Select
                label="Performance Rating"
                defaultValue={formData.performance_rating}
                onChange={(e) => handleInputChange('performance_rating', e.target.value)}
                items={[
                  { value: 'excellent', label: 'Excellent' },
                  { value: 'good', label: 'Good' },
                  { value: 'average', label: 'Average' },
                  { value: 'poor', label: 'Poor' },
                ]}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outlinePrimary"
                onClick={handleCancel}
                label="Cancel"
              />
              <Button
                variant="primary"
                icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                label={isLoading ? 'Creating...' : 'Create Performance Record'}
              />
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
