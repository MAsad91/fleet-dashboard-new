"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetFleetSettingsQuery, useUpdateFleetSettingsMutation, useListVehiclesQuery, useGetDriversQuery, useGetTripsQuery, useGetAlertsQuery, useListMaintenanceRecordsQuery, useListDashcamsQuery, useListFirmwareUpdatesQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Save, RefreshCw, Settings, Globe, Shield, Bell, Database, Car, Users, MapPin, AlertTriangle, Wrench, FileText, Camera, Cpu, Building2, Mail, Phone, MapPin as LocationIcon } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Checkbox } from "@/components/FormElements/checkbox";

export default function FleetSettingsPage() {
  const router = useRouter();
  
  // API calls
  const { data: settingsData, isLoading: isLoadingSettings, error } = useGetFleetSettingsQuery({});
  const [updateSettings] = useUpdateFleetSettingsMutation();
  
  // KPI data for admin/OEM users
  const { data: vehiclesData } = useListVehiclesQuery({ page: 1 });
  const { data: driversData } = useGetDriversQuery({ page: 1 });
  const { data: tripsData } = useGetTripsQuery({ status: 'in_progress', page: 1 });
  const { data: alertsData } = useGetAlertsQuery({ status: 'active', page: 1 });
  const { data: maintenanceData } = useListMaintenanceRecordsQuery({ page: 1 });
  // const { data: insuranceData } = useGetInsurancePoliciesQuery({ page: 1 });
  const { data: dashcamsData } = useListDashcamsQuery({ page: 1 });
  const { data: firmwareData } = useListFirmwareUpdatesQuery({ page: 1 });

  const [settings, setSettings] = useState({
    name: "",
    code: "",
    contact: "",
    address: "",
    metadata: "{}",
    timezone: "UTC",
    currency: "USD",
    unit_system: "metric",
    language: "en",
    date_format: "YYYY-MM-DD",
    logo: "",
    primary_color: "#3B82F6",
    preferred_theme: "light"
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (settingsData) {
      setSettings({
        name: settingsData.name || "",
        code: settingsData.code || "",
        contact: settingsData.contact || "",
        address: settingsData.address || "",
        metadata: settingsData.metadata ? JSON.stringify(settingsData.metadata, null, 2) : "{}",
        timezone: settingsData.timezone || "UTC",
        currency: settingsData.currency || "USD",
        unit_system: settingsData.unit_system || "metric",
        language: settingsData.language || "en",
        date_format: settingsData.date_format || "YYYY-MM-DD",
        logo: settingsData.logo || "",
        primary_color: settingsData.primary_color || "#3B82F6",
        preferred_theme: settingsData.preferred_theme || "light"
      });
    }
  }, [settingsData]);

  // Show the form even if no settings data is available (with default values)
  // Handle 404 as a normal case (no settings exist yet)
  const showForm = !isLoadingSettings;

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updateData = {
        ...settings,
        metadata: settings.metadata ? JSON.parse(settings.metadata) : {}
      };
      await updateSettings(updateData).unwrap();
      alert('Fleet settings saved successfully');
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert('Failed to save fleet settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Calculate KPI counts
  const kpiData = {
    vehicles: vehiclesData?.count || 0,
    drivers: driversData?.count || 0,
    activeTrips: tripsData?.count || 0,
    activeAlerts: alertsData?.count || 0,
    openMaintenance: maintenanceData?.results?.filter((m: any) => 
      ['scheduled', 'in_progress', 'delayed'].includes(m.status)
    ).length || 0,
    insurancePolicies: 0, // insuranceData?.count || 0,
    dashcams: dashcamsData?.count || 0,
    firmwareUpdates: firmwareData?.count || 0
  };

  if (isLoadingSettings) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }


  if (showForm) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator']}>
        <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Fleet Settings — Form
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure fleet operator settings and preferences
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={isLoading ? undefined : handleSave}
              variant="primary"
              label={isLoading ? "Saving..." : "Save"}
              icon={<Save className="h-4 w-4" />}
              className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            />
            <Button
              onClick={handleRefresh}
              variant="outlineDark"
              label="Cancel"
              icon={<RefreshCw className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* KPI Cards for Admin/OEM Users */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vehicles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpiData.vehicles}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drivers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpiData.drivers}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Trips</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpiData.activeTrips}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpiData.activeAlerts}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* General Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Organization */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-6">
                <Building2 className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Organization</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup
                  type="text"
                  label="Name"
                  placeholder="Enter fleet name"
                  value={settings.name}
                  handleChange={(e) => handleInputChange('name', e.target.value)}
                  icon={<Building2 className="h-4 w-4" />}
                />
                
                <InputGroup
                  type="text"
                  label="Code"
                  placeholder="Enter fleet code"
                  value={settings.code}
                  handleChange={(e) => handleInputChange('code', e.target.value)}
                  icon={<Settings className="h-4 w-4" />}
                />
                
                <InputGroup
                  type="text"
                  label="Contact"
                  placeholder="Enter contact person"
                  value={settings.contact}
                  handleChange={(e) => handleInputChange('contact', e.target.value)}
                  icon={<Phone className="h-4 w-4" />}
                />
                
                
                <div className="md:col-span-2">
                  <InputGroup
                    type="text"
                    label="Address"
                    placeholder="Enter address"
                    value={settings.address}
                    handleChange={(e) => handleInputChange('address', e.target.value)}
                    icon={<LocationIcon className="h-4 w-4" />}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Metadata (JSON)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows={4}
                    placeholder='{"key": "value"}'
                    value={settings.metadata}
                    onChange={(e) => handleInputChange('metadata', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Locale & Branding */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-6">
                <Globe className="h-6 w-6 text-green-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Locale & Branding</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Timezone"
                  items={[
                    { value: "UTC", label: "UTC" },
                    { value: "UTC-5", label: "UTC-5 (EST)" },
                    { value: "UTC-6", label: "UTC-6 (CST)" },
                    { value: "UTC-7", label: "UTC-7 (MST)" },
                    { value: "UTC-8", label: "UTC-8 (PST)" },
                    { value: "UTC+1", label: "UTC+1 (CET)" },
                    { value: "UTC+5:30", label: "UTC+5:30 (IST)" },
                  ]}
                  defaultValue={settings.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                />
                
                <Select
                  label="Currency"
                  items={[
                    { value: "USD", label: "USD ($)" },
                    { value: "EUR", label: "EUR (€)" },
                    { value: "GBP", label: "GBP (£)" },
                    { value: "CAD", label: "CAD (C$)" },
                    { value: "AUD", label: "AUD (A$)" },
                    { value: "INR", label: "INR (₹)" },
                  ]}
                  defaultValue={settings.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                />
                
                <Select
                  label="Unit System"
                  items={[
                    { value: "metric", label: "Metric" },
                    { value: "imperial", label: "Imperial" },
                  ]}
                  defaultValue={settings.unit_system}
                  onChange={(e) => handleInputChange('unit_system', e.target.value)}
                />
                
                <Select
                  label="Language"
                  items={[
                    { value: "en", label: "English" },
                    { value: "es", label: "Spanish" },
                    { value: "fr", label: "French" },
                    { value: "de", label: "German" },
                    { value: "hi", label: "Hindi" },
                  ]}
                  defaultValue={settings.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                />
                
                <Select
                  label="Date Format"
                  items={[
                    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                    { value: "DD-MM-YYYY", label: "DD-MM-YYYY" },
                  ]}
                  defaultValue={settings.date_format}
                  onChange={(e) => handleInputChange('date_format', e.target.value)}
                />
                
                <Select
                  label="Preferred Theme"
                  items={[
                    { value: "light", label: "Light" },
                    { value: "dark", label: "Dark" },
                    { value: "system", label: "System" },
                  ]}
                  defaultValue={settings.preferred_theme}
                  onChange={(e) => handleInputChange('preferred_theme', e.target.value)}
                />
                
                <div className="md:col-span-2">
                  <InputGroup
                    type="text"
                    label="Logo URL"
                    placeholder="Enter logo URL"
                    value={settings.logo}
                    handleChange={(e) => handleInputChange('logo', e.target.value)}
                    icon={<Camera className="h-4 w-4" />}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                    />
                    <InputGroup
                      type="text"
                      label=""
                      placeholder="#3B82F6"
                      value={settings.primary_color}
                      handleChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dependent Sections */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Dependent Sections</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => router.push('/vehicles')}
                  variant="outlineDark"
                  label="Vehicles"
                  icon={<Car className="h-4 w-4" />}
                  className="w-full"
                />
                
                <Button
                  onClick={() => router.push('/drivers')}
                  variant="outlineDark"
                  label="Drivers"
                  icon={<Users className="h-4 w-4" />}
                  className="w-full"
                />
                
                <Button
                  onClick={() => router.push('/trips')}
                  variant="outlineDark"
                  label="Trips"
                  icon={<MapPin className="h-4 w-4" />}
                  className="w-full"
                />
                
                <Button
                  onClick={() => router.push('/alerts')}
                  variant="outlineDark"
                  label="Alerts"
                  icon={<AlertTriangle className="h-4 w-4" />}
                  className="w-full"
                />
                
                <Button
                  onClick={() => router.push('/maintenance')}
                  variant="outlineDark"
                  label="Maintenance"
                  icon={<Wrench className="h-4 w-4" />}
                  className="w-full"
                />
                
                <Button
                  onClick={() => router.push('/insurance')}
                  variant="outlineDark"
                  label="Insurance"
                  icon={<FileText className="h-4 w-4" />}
                  className="w-full"
                />
                
                <Button
                  onClick={() => router.push('/dashcams')}
                  variant="outlineDark"
                  label="Dashcams"
                  icon={<Camera className="h-4 w-4" />}
                  className="w-full"
                />
                
                <Button
                  onClick={() => router.push('/firmware-updates')}
                  variant="outlineDark"
                  label="Firmware"
                  icon={<Cpu className="h-4 w-4" />}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
  }

  // Fallback for loading state
  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator']}>
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    </ProtectedRoute>
  );
}
