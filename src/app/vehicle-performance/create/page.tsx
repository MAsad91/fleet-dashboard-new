"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Car, Loader2 } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";

export default function CreateVehiclePerformancePage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    vehicle: "",
    period: "",
    total_distance: "",
    fuel_consumption: "",
    average_speed: "",
    maintenance_cost: "",
    efficiency_rating: "",
    performance_score: "",
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
    
    if (!formData.vehicle) {
      newErrors.vehicle = "Vehicle is required";
    }
    
    if (!formData.period) {
      newErrors.period = "Period is required";
    }
    
    if (!formData.total_distance.trim()) {
      newErrors.total_distance = "Total distance is required";
    }
    
    if (!formData.fuel_consumption.trim()) {
      newErrors.fuel_consumption = "Fuel consumption is required";
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
      // TODO: Implement API call to create vehicle performance record
      console.log('Creating vehicle performance:', formData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/vehicle-performance');
    } catch (error) {
      console.error('Error creating vehicle performance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/vehicle-performance');
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Vehicle Performance</h1>
            <p className="text-gray-600 dark:text-gray-400">Add a new vehicle performance record</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Vehicle"
                defaultValue={formData.vehicle}
                onChange={(e) => handleInputChange('vehicle', e.target.value)}
                items={[
                  { value: '1', label: 'ABC-123 - Tesla Model 3' },
                  { value: '2', label: 'XYZ-789 - BMW i3' },
                  { value: '3', label: 'DEF-456 - Nissan Leaf' },
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
                label="Total Distance (km)"
                type="number"
                placeholder="Enter total distance"
                value={formData.total_distance}
                handleChange={(e) => handleInputChange('total_distance', e.target.value)}
                error={errors.total_distance}
                required
              />
              
              <InputGroup
                label="Fuel Consumption (L)"
                type="number"
                placeholder="Enter fuel consumption"
                value={formData.fuel_consumption}
                handleChange={(e) => handleInputChange('fuel_consumption', e.target.value)}
                error={errors.fuel_consumption}
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
                label="Maintenance Cost ($)"
                type="number"
                placeholder="Enter maintenance cost"
                value={formData.maintenance_cost}
                handleChange={(e) => handleInputChange('maintenance_cost', e.target.value)}
                error={errors.maintenance_cost}
              />
              
              <Select
                label="Efficiency Rating"
                defaultValue={formData.efficiency_rating}
                onChange={(e) => handleInputChange('efficiency_rating', e.target.value)}
                items={[
                  { value: 'excellent', label: 'Excellent' },
                  { value: 'good', label: 'Good' },
                  { value: 'average', label: 'Average' },
                  { value: 'poor', label: 'Poor' },
                ]}
              />
              
              <InputGroup
                label="Performance Score"
                type="number"
                placeholder="Enter performance score"
                value={formData.performance_score}
                handleChange={(e) => handleInputChange('performance_score', e.target.value)}
                error={errors.performance_score}
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
                icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Car className="h-4 w-4" />}
                label={isLoading ? 'Creating...' : 'Create Performance Record'}
              />
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
