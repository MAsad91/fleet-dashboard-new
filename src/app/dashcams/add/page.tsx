"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateDashcamMutation, useListVehiclesQuery, useListFleetOperatorsQuery, useGetSimCardsQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Video, Loader2 } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";

export default function AddDashcamPage() {
  const router = useRouter();
  const [createDashcam, { isLoading }] = useCreateDashcamMutation();
  const { data: vehiclesData } = useListVehiclesQuery({ page: 1 });
  const { data: fleetOperatorsData } = useListFleetOperatorsQuery();
  const { data: simCardsData } = useGetSimCardsQuery({ page: 1 });
  
  const [formData, setFormData] = useState({
    // Device Information
    device_id: "",
    model: "",
    serial_number: "",
    firmware_version: "",
    
    // Vehicle & Installation
    vehicle: "",
    fleet_operator: "",
    installation_date: "",
    installation_position: "Front Windshield",
    
    // Connectivity
    connection_type: "4G",
    ip_address: "",
    sim_card: "",
    
    // Recording Configuration
    recording_mode: "Continuous",
    resolution: "1080p",
    frame_rate: 30,
    quality: "High",
    storage_capacity_gb: 160,
    
    // Additional Features
    night_vision: true,
    audio_recording: false,
    motion_detection: true,
    auto_upload: true,
    gps_tagging: false,
    tamper_alert: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set default fleet operator when data loads
  useEffect(() => {
    if (fleetOperatorsData?.results && fleetOperatorsData.results.length > 0 && !formData.fleet_operator) {
      setFormData(prev => ({
        ...prev,
        fleet_operator: fleetOperatorsData.results[0].id.toString()
      }));
    }
  }, [fleetOperatorsData, formData.fleet_operator]);

  // Set installation date to today
  useEffect(() => {
    if (!formData.installation_date) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        installation_date: today
      }));
    }
  }, [formData.installation_date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.device_id?.trim()) newErrors.device_id = 'Device ID is required';
    if (!formData.model?.trim()) newErrors.model = 'Model is required';
    if (!formData.serial_number?.trim()) newErrors.serial_number = 'Serial Number is required';
    if (!formData.vehicle?.trim()) newErrors.vehicle = 'Vehicle is required';
    if (!formData.fleet_operator?.trim()) newErrors.fleet_operator = 'Fleet Operator is required';
    if (!formData.installation_date?.trim()) newErrors.installation_date = 'Installation Date is required';
    if (!formData.connection_type?.trim()) newErrors.connection_type = 'Connection Type is required';
    if (!formData.recording_mode?.trim()) newErrors.recording_mode = 'Recording Mode is required';
    if (!formData.resolution?.trim()) newErrors.resolution = 'Resolution is required';
    if (!formData.frame_rate) newErrors.frame_rate = 'Frame Rate is required';
    if (!formData.quality?.trim()) newErrors.quality = 'Quality is required';
    if (!formData.storage_capacity_gb) newErrors.storage_capacity_gb = 'Storage Capacity is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await createDashcam({
        ...formData,
        frame_rate: parseInt(formData.frame_rate.toString()),
        storage_capacity_gb: parseInt(formData.storage_capacity_gb.toString()),
        vehicle: parseInt(formData.vehicle),
        fleet_operator: parseInt(formData.fleet_operator),
        sim_card: formData.sim_card ? parseInt(formData.sim_card) : undefined,
      }).unwrap();

      console.log('Dashcam created successfully:', response);
      router.push('/dashcams');
    } catch (error: any) {
      console.error('Failed to create dashcam:', error);
      
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

  const handleCancel = () => {
    router.push('/dashcams');
  };

  const availableVehicles = vehiclesData?.results?.filter(vehicle => !vehicle.has_dashcam) || [];
  const availableSimCards = simCardsData?.results?.filter((sim: any) => sim.status === 'inactive') || [];

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleCancel}
            variant="outlineDark"
            icon={<ArrowLeft className="h-4 w-4" />}
            label="Back"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Dashcam</h1>
            <p className="text-gray-600 dark:text-gray-400">Create a new dashcam device</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Device Information */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Device Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup
                label="Device ID"
                name="device_id"
                type="text"
                value={formData.device_id}
                handleChange={handleInputChange}
                error={errors.device_id}
                placeholder="DASH-001"
                required
              />
              
              <Select
                label="Model"
                defaultValue={formData.model}
                onChange={handleInputChange}
                items={[
                  { value: "DashPro X", label: "DashPro X" },
                  { value: "DashMax S", label: "DashMax S" },
                  { value: "DashCam Pro", label: "DashCam Pro" },
                  { value: "SmartDash 4K", label: "SmartDash 4K" },
                ]}
              />
              
              <InputGroup
                label="Serial Number"
                name="serial_number"
                type="text"
                value={formData.serial_number}
                handleChange={handleInputChange}
                error={errors.serial_number}
                placeholder="DP-X2023-4567"
                required
              />
              
              <InputGroup
                label="Firmware Version"
                name="firmware_version"
                type="text"
                value={formData.firmware_version}
                handleChange={handleInputChange}
                error={errors.firmware_version}
                placeholder="v2.5.3 (auto-detected)"
              />
            </div>
          </div>

          {/* Vehicle & Installation */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vehicle & Installation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Vehicle"
                defaultValue={formData.vehicle}
                onChange={handleInputChange}
                items={availableVehicles.map(vehicle => ({
                  value: vehicle.id.toString(),
                  label: `${vehicle.license_plate} - ${vehicle.make} ${vehicle.model}`
                }))}
              />
              
              <Select
                label="Fleet Operator"
                defaultValue={formData.fleet_operator}
                onChange={handleInputChange}
                items={(fleetOperatorsData?.results || []).map(operator => ({
                  value: operator.id.toString(),
                  label: operator.name
                }))}
              />
              
              <InputGroup
                label="Installation Date"
                name="installation_date"
                type="date"
                value={formData.installation_date}
                handleChange={handleInputChange}
                error={errors.installation_date}
                placeholder=""
                required
              />
              
              <Select
                label="Installation Position"
                defaultValue={formData.installation_position}
                onChange={handleInputChange}
                items={[
                  { value: "Front Windshield", label: "Front Windshield" },
                  { value: "Rear Windshield", label: "Rear Windshield" },
                  { value: "Cabin", label: "Cabin" },
                ]}
              />
            </div>
          </div>

          {/* Connectivity */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connectivity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Connection Type"
                defaultValue={formData.connection_type}
                onChange={handleInputChange}
                items={[
                  { value: "4G", label: "4G" },
                  { value: "WiFi", label: "WiFi" },
                  { value: "Ethernet", label: "Ethernet" },
                ]}
              />
              
              <InputGroup
                label="IP Address"
                name="ip_address"
                type="text"
                value={formData.ip_address}
                handleChange={handleInputChange}
                error={errors.ip_address}
                placeholder="10.0.14.23 (if static)"
              />
              
              {formData.connection_type === "4G" && (
                <Select
                  label="SIM Card"
                  defaultValue={formData.sim_card}
                  onChange={handleInputChange}
                  items={availableSimCards.map((sim: any) => ({
                    value: sim.id.toString(),
                    label: `${sim.sim_id} - ${sim.plan_name || 'No Plan'}`
                  }))}
                />
              )}
            </div>
          </div>

          {/* Recording Configuration */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recording Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Recording Mode"
                defaultValue={formData.recording_mode}
                onChange={handleInputChange}
                items={[
                  { value: "Continuous", label: "Continuous" },
                  { value: "Motion", label: "Motion" },
                  { value: "Scheduled", label: "Scheduled" },
                ]}
              />
              
              <Select
                label="Resolution"
                defaultValue={formData.resolution}
                onChange={handleInputChange}
                items={[
                  { value: "720p", label: "720p" },
                  { value: "1080p", label: "1080p" },
                  { value: "1440p", label: "1440p" },
                  { value: "4K", label: "4K" },
                ]}
              />
              
              <InputGroup
                label="Frame Rate (fps)"
                name="frame_rate"
                type="number"
                value={formData.frame_rate?.toString() || ''}
                handleChange={handleInputChange}
                error={errors.frame_rate}
                placeholder="30"
                required
              />
              
              <Select
                label="Quality"
                defaultValue={formData.quality}
                onChange={handleInputChange}
                items={[
                  { value: "Low", label: "Low" },
                  { value: "Medium", label: "Medium" },
                  { value: "High", label: "High" },
                ]}
              />
              
              <InputGroup
                label="Storage Capacity (GB)"
                name="storage_capacity_gb"
                type="number"
                value={formData.storage_capacity_gb?.toString() || ''}
                handleChange={handleInputChange}
                error={errors.storage_capacity_gb}
                placeholder="128"
                required
              />
            </div>
            
            {/* Additional Features */}
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Additional Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="night_vision"
                    checked={formData.night_vision}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Night Vision</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="audio_recording"
                    checked={formData.audio_recording}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Audio Recording</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="motion_detection"
                    checked={formData.motion_detection}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Motion Detection</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="auto_upload"
                    checked={formData.auto_upload}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Auto Upload</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="gps_tagging"
                    checked={formData.gps_tagging}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">GPS Tagging</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="tamper_alert"
                    checked={formData.tamper_alert}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Tamper Alert</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              onClick={handleCancel}
              variant="outlineDark"
              label="Cancel"
            />
            <Button
              variant="primary"
              label="Add Dashcam"
              icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
              disabled={isLoading}
            />
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
