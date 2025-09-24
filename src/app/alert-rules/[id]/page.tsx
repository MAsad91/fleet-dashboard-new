"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, AlertTriangle, Settings, Bell, Trash2, Save, Plus, Minus } from "lucide-react";

export default function AlertRuleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const alertRuleId = params.id as string;

  // Mock data since API hooks don't exist yet
  const alertRuleData = {
    id: parseInt(alertRuleId),
    name: "High Motor Temperature",
    description: "Alert when motor temperature exceeds 90°C for more than 5 minutes",
    severity: "high",
    system: "motor",
    is_active: true,
    condition_logic: "AND",
    trigger_duration_sec: 300,
    cooldown_minutes: 10,
    auto_resolve: true,
    notification_channels: ["in_app", "email"],
    recipients: ["ops@example.com", "maintenance@example.com"],
    vehicle_types: [3, 5],
    conditions: [
      { field: "motor_temp_c", operator: ">", threshold: 90 }
    ]
  };

  const [formData, setFormData] = useState(alertRuleData);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isLoading = false;
  const error = null;

  useEffect(() => {
    setFormData(alertRuleData);
  }, [alertRuleId, alertRuleData]);

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !alertRuleData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="text-center text-red-600">
          <p>Failed to load alert rule details. Please try again.</p>
          <Button 
            onClick={() => router.back()} 
            variant="primary" 
            label="Back to Alert Rules"
            className="mt-4"
          />
        </div>
      </ProtectedRoute>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleConditionChange = (index: number, field: string, value: string) => {
    const newConditions = [...formData.conditions];
    newConditions[index] = {
      ...newConditions[index],
      [field]: value
    };
    setFormData((prev: any) => ({
      ...prev,
      conditions: newConditions
    }));
  };

  const addCondition = () => {
    setFormData((prev: any) => ({
      ...prev,
      conditions: [...prev.conditions, { field: "motor_temp_c", operator: ">", threshold: "" }]
    }));
  };

  const removeCondition = (index: number) => {
    const newConditions = formData.conditions.filter((_: any, i: number) => i !== index);
    setFormData((prev: any) => ({
      ...prev,
      conditions: newConditions
    }));
  };

  const handleSave = () => {
    console.log('Saving alert rule:', formData);
    // TODO: Implement save API call
    setIsEditing(false);
  };

  const handleDelete = () => {
    console.log('Deleting alert rule:', alertRuleId);
    // TODO: Implement delete API call
    router.back();
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { className: "bg-blue-100 text-blue-800", label: "Low" },
      medium: { className: "bg-yellow-100 text-yellow-800", label: "Medium" },
      high: { className: "bg-orange-100 text-orange-800", label: "High" },
      critical: { className: "bg-red-100 text-red-800", label: "Critical" },
    };
    
    const config = severityConfig[severity as keyof typeof severityConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      label: severity || "Unknown"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
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
          <div className="bg-gradient-to-r from-orange-50 to-red-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-lg border border-orange-200 dark:border-gray-600 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 dark:bg-gray-600 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-200 dark:bg-gray-600 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                {/* Left Side - Alert Rule Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <AlertTriangle className="h-8 w-8 text-orange-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Alert Rule — Detail/Edit
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {formData.name} • {getSeverityBadge(formData.severity)} • {formData.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Severity</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getSeverityBadge(formData.severity)}
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formData.is_active ? "✓" : "✗"}
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Conditions</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formData.conditions.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Action Buttons */}
                <div className="flex flex-col space-y-2 ml-6">
                  <div className="flex space-x-2">
                    <Button
                      label="Save"
                      variant="primary"
                      size="small"
                      icon={<Save className="h-3 w-3" />}
                      onClick={handleSave}
                      className="px-3 py-2 text-xs"
                    />
                    <Button
                      label="Delete"
                      variant="outlineDark"
                      size="small"
                      icon={<Trash2 className="h-3 w-3" />}
                      onClick={handleDelete}
                      className="px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Severity</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getSeverityBadge(formData.severity)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formData.is_active ? "✓" : "✗"}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conditions (count)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formData.conditions.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Types #</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formData.vehicle_types.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rule (Left) */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Rule</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">severity</label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">system</label>
                <input
                  type="text"
                  name="system"
                  value={formData.system}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">is_active</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">condition_logic (AND/OR)</label>
                <select
                  name="condition_logic"
                  value={formData.condition_logic}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">trigger_duration_sec</label>
                <input
                  type="number"
                  name="trigger_duration_sec"
                  value={formData.trigger_duration_sec}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">cooldown_minutes</label>
                <input
                  type="number"
                  name="cooldown_minutes"
                  value={formData.cooldown_minutes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="auto_resolve"
                  checked={formData.auto_resolve}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, auto_resolve: e.target.checked }))}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">auto_resolve</label>
              </div>
            </div>
          </div>

          {/* Notifications & Scope (Right) */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Notifications & Scope</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">notification_channels</label>
                <div className="space-y-2">
                  {['email', 'sms', 'in_app'].map((channel) => (
                    <label key={channel} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.notification_channels.includes(channel)}
                        onChange={(e) => {
                          const newChannels = e.target.checked
                            ? [...formData.notification_channels, channel]
                            : formData.notification_channels.filter((c: string) => c !== channel);
                          setFormData((prev: any) => ({ ...prev, notification_channels: newChannels }));
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">recipients</label>
                <textarea
                  value={formData.recipients.join(', ')}
                  onChange={(e) => {
                    const recipients = e.target.value.split(',').map((r: string) => r.trim()).filter(Boolean);
                    setFormData((prev: any) => ({ ...prev, recipients }));
                  }}
                  rows={3}
                  placeholder="Enter email addresses separated by commas"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">vehicle_types[]</label>
                <textarea
                  value={formData.vehicle_types.join(', ')}
                  onChange={(e) => {
                    const vehicleTypes = e.target.value.split(',').map((v: string) => parseInt(v.trim())).filter((v: number) => !isNaN(v));
                    setFormData((prev: any) => ({ ...prev, vehicle_types: vehicleTypes }));
                  }}
                  rows={2}
                  placeholder="Enter vehicle type IDs separated by commas"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CONDITIONS (grid) */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">CONDITIONS (grid)</h3>
            <Button
              label="+ Add Condition"
              variant="outlineDark"
              size="small"
              icon={<Plus className="h-4 w-4" />}
              onClick={addCondition}
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Field
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Operator (&gt;, &gt;=, &lt;, &lt;=, ==, !=)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Threshold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {formData.conditions.map((condition: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={condition.field}
                        onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      >
                        <option value="motor_temp_c">motor_temp_c</option>
                        <option value="battery_level_percent">battery_level_percent</option>
                        <option value="speed_kph">speed_kph</option>
                        <option value="range_km">range_km</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={condition.operator}
                        onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      >
                        <option value=">">&gt;</option>
                        <option value=">=">&gt;=</option>
                        <option value="<">&lt;</option>
                        <option value="<=">&lt;=</option>
                        <option value="==">==</option>
                        <option value="!=">!=</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={condition.threshold}
                        onChange={(e) => handleConditionChange(index, 'threshold', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        label="− Remove"
                        variant="outlineDark"
                        size="small"
                        icon={<Minus className="h-4 w-4" />}
                        onClick={() => removeCondition(index)}
                        className="text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}