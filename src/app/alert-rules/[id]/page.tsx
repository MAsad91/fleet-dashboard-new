"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetAlertRuleByIdQuery, useUpdateAlertRuleMutation, useDeleteAlertRuleMutation } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Save, Trash2, Plus, Minus, AlertTriangle, Settings, Bell, Calendar, CheckCircle } from "lucide-react";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";

export default function AlertRuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const isEdit = id !== 'add';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    severity: 'medium',
    system: '',
    is_active: true,
    condition_logic: 'AND',
    trigger_duration_sec: 0,
    cooldown_minutes: 10,
    auto_resolve: true,
    notification_channels: ['in_app'],
    recipients: [] as string[],
    vehicle_types: [] as number[],
    conditions: [] as Array<{ field: string; operator: string; threshold: string }>
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // API hooks
  const { data: ruleData, isLoading, error } = useGetAlertRuleByIdQuery(id, {
    skip: !isEdit
  });

  const [updateAlertRule, { isLoading: isUpdating }] = useUpdateAlertRuleMutation();
  const [deleteAlertRule] = useDeleteAlertRuleMutation();

  // Update form data when rule data loads
  useEffect(() => {
    if (ruleData && isEdit) {
      setFormData({
        name: ruleData.name || '',
        description: ruleData.description || '',
        severity: ruleData.severity || 'medium',
        system: ruleData.system || '',
        is_active: ruleData.is_active ?? true,
        condition_logic: ruleData.condition_logic || 'AND',
        trigger_duration_sec: ruleData.trigger_duration_sec || 0,
        cooldown_minutes: ruleData.cooldown_minutes || 10,
        auto_resolve: ruleData.auto_resolve ?? true,
        notification_channels: ruleData.notification_channels || ['in_app'],
        recipients: ruleData.recipients || [],
        vehicle_types: ruleData.vehicle_types || [],
        conditions: ruleData.conditions || []
      });
    }
  }, [ruleData, isEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNotificationChannelChange = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      notification_channels: prev.notification_channels.includes(channel)
        ? prev.notification_channels.filter(c => c !== channel)
        : [...prev.notification_channels, channel]
    }));
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const recipients = value.split(',').map(r => r.trim()).filter(r => r);
    setFormData(prev => ({
      ...prev,
      recipients
    }));
  };

  const handleVehicleTypesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const vehicleTypes = value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    setFormData(prev => ({
      ...prev,
      vehicle_types: vehicleTypes
    }));
  };

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, { field: '', operator: '>', threshold: '' }]
    }));
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const updateCondition = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      )
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.system.trim()) {
      newErrors.system = 'System is required';
    }
    if (formData.conditions.length === 0) {
      newErrors.conditions = 'At least one condition is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      if (isEdit) {
        await updateAlertRule({ id, body: formData }).unwrap();
      } else {
        // For create, we'd need a create mutation
        console.log('Create functionality not implemented yet');
      }
      router.push('/alert-rules');
    } catch (error) {
      console.error('Failed to save alert rule:', error);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    
    try {
      await deleteAlertRule(id).unwrap();
      router.push('/alert-rules');
    } catch (error) {
      console.error('Failed to delete alert rule:', error);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="text-center text-red-600">
          <p>Error loading alert rule</p>
          <Button
            label="Back to Rules"
            variant="primary"
            className="mt-4"
            onClick={() => router.push('/alert-rules')}
          />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push('/alert-rules')}
                variant="outlineDark"
                label="Back"
                icon={<ArrowLeft className="h-4 w-4" />}
                className="px-4 py-2 rounded-lg"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Alert Rule — {isEdit ? 'Detail/Edit' : 'Add'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {isEdit ? `Editing rule: ${formData.name}` : 'Create a new alert rule'}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {isEdit && (
                <Button
                  label="Delete"
                  variant="outlineDark"
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() => setIsDeleteModalOpen(true)}
                />
              )}
              <Button
                label={isUpdating ? 'Saving...' : 'Save'}
                variant="primary"
                icon={<Save className="h-4 w-4" />}
                onClick={handleSave}
                className={isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
              />
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Severity</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                    {formData.severity}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formData.is_active ? "✓" : "✗"}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
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

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Types #</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formData.vehicle_types.length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Bell className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Rule (Left) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Rule</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                      errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Severity
                    </label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      System *
                    </label>
                    <input
                      type="text"
                      name="system"
                      value={formData.system}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                        errors.system ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      }`}
                    />
                    {errors.system && <p className="mt-1 text-sm text-red-600">{errors.system}</p>}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Is Active
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Condition Logic
                  </label>
                  <select
                    name="condition_logic"
                    value={formData.condition_logic}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Trigger Duration (sec)
                    </label>
                    <input
                      type="number"
                      name="trigger_duration_sec"
                      value={formData.trigger_duration_sec}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cooldown (minutes)
                    </label>
                    <input
                      type="number"
                      name="cooldown_minutes"
                      value={formData.cooldown_minutes}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="auto_resolve"
                    checked={formData.auto_resolve}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Auto Resolve
                  </label>
                </div>
              </div>
            </div>

            {/* Notifications & Scope (Right) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Notifications & Scope</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notification Channels
                  </label>
                  <div className="space-y-2">
                    {['email', 'sms', 'in_app'].map((channel) => (
                      <div key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notification_channels.includes(channel)}
                          onChange={() => handleNotificationChannelChange(channel)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {channel.replace('_', ' ').toUpperCase()}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipients (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.recipients.join(', ')}
                    onChange={handleRecipientChange}
                    placeholder="email1@example.com, email2@example.com"
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vehicle Types (comma-separated IDs)
                  </label>
                  <input
                    type="text"
                    value={formData.vehicle_types.join(', ')}
                    onChange={handleVehicleTypesChange}
                    placeholder="1, 2, 3"
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Conditions Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Conditions</h3>
              <Button
                label="Add Condition"
                variant="outlineDark"
                icon={<Plus className="h-4 w-4" />}
                onClick={addCondition}
              />
            </div>

            {errors.conditions && (
              <p className="mb-4 text-sm text-red-600">{errors.conditions}</p>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Field
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Operator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Threshold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {formData.conditions.map((condition: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={condition.field}
                          onChange={(e) => updateCondition(index, 'field', e.target.value)}
                          placeholder="e.g., motor_temp_c"
                          className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={condition.operator}
                          onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
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
                          type="text"
                          value={condition.threshold}
                          onChange={(e) => updateCondition(index, 'threshold', e.target.value)}
                          placeholder="e.g., 90"
                          className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          label=""
                          variant="outlineDark"
                          size="small"
                          icon={<Minus className="h-4 w-4" />}
                          onClick={() => removeCondition(index)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {formData.conditions.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No conditions defined. Click &quot;Add Condition&quot; to create one.</p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Alert Rule"
          message="Are you sure you want to delete this alert rule? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </ProtectedRoute>
  );
}
