"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetSimCardByIdQuery, useUpdateSimCardMutation, useDeleteSimCardMutation, useActivateSimCardMutation, useDeactivateSimCardMutation, useSuspendSimCardMutation, useUpdateSimCardUsageMutation } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, CreditCard, Wifi, Signal, Calendar, DollarSign, Activity, Edit, Trash2, Save, Power, PowerOff, Pause, Play } from "lucide-react";

export default function SimCardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const simCardId = params.id as string;

  const { data: simCardData, isLoading, error, refetch } = useGetSimCardByIdQuery(simCardId);
  const [updateSimCard] = useUpdateSimCardMutation();
  const [deleteSimCard] = useDeleteSimCardMutation();
  const [activateSimCard] = useActivateSimCardMutation();
  const [deactivateSimCard] = useDeactivateSimCardMutation();
  const [suspendSimCard] = useSuspendSimCardMutation();
  const [updateSimCardUsage] = useUpdateSimCardUsageMutation();

  const [formData, setFormData] = useState({
    sim_id: "",
    iccid: "",
    status: "inactive",
    plan_name: "",
    plan_data_limit_gb: 0,
    plan_cost: 0,
    current_data_used_gb: 0,
    current_cycle_start: "",
    overage_threshold: 0.9,
    device: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (simCardData) {
      setFormData({
        sim_id: simCardData.sim_id || "",
        iccid: simCardData.iccid || "",
        status: simCardData.status || "inactive",
        plan_name: simCardData.plan_name || "",
        plan_data_limit_gb: simCardData.plan_data_limit_gb || 0,
        plan_cost: simCardData.plan_cost || 0,
        current_data_used_gb: simCardData.current_data_used_gb || 0,
        current_cycle_start: simCardData.current_cycle_start || "",
        overage_threshold: simCardData.overage_threshold || 0.9,
        device: simCardData.device || null,
      });
    }
  }, [simCardId, simCardData]);

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !simCardData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="text-center text-red-600">
          <p>Failed to load SIM card details. Please try again.</p>
          <Button 
            onClick={() => router.back()} 
            variant="primary" 
            label="Back to SIM Cards"
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

  const handleSave = async () => {
    try {
      await updateSimCard({ id: simCardId, body: formData }).unwrap();
      await refetch();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating SIM card:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this SIM card?')) {
      try {
        await deleteSimCard(simCardId).unwrap();
        router.push('/sim-cards');
      } catch (error) {
        console.error('Error deleting SIM card:', error);
      }
    }
  };

  const handleActivate = async () => {
    try {
      await activateSimCard({ id: simCardId }).unwrap();
      await refetch();
    } catch (error) {
      console.error('Error activating SIM card:', error);
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateSimCard({ id: simCardId }).unwrap();
      await refetch();
    } catch (error) {
      console.error('Error deactivating SIM card:', error);
    }
  };

  const handleSuspend = async () => {
    try {
      await suspendSimCard({ id: simCardId }).unwrap();
      await refetch();
    } catch (error) {
      console.error('Error suspending SIM card:', error);
    }
  };

  const handleUpdateUsage = async () => {
    const newUsage = prompt('Enter new data usage (GB):');
    if (newUsage && !isNaN(parseFloat(newUsage))) {
      try {
        await updateSimCardUsage({ id: simCardId, body: { current_data_used_gb: parseFloat(newUsage) } }).unwrap();
        await refetch();
      } catch (error) {
        console.error('Error updating SIM card usage:', error);
      }
    }
  };

  const handleViewOBDDevice = () => {
    router.push(`/obd-devices/${formData.device}`);
  };

  const getSignalStrength = (strength: number) => {
    if (strength >= -70) return { label: 'strong', className: 'text-green-600' };
    if (strength >= -85) return { label: 'weak', className: 'text-yellow-600' };
    return { label: 'none', className: 'text-red-600' };
  };

  const signalInfo = getSignalStrength(simCardData?.signal_strength || -100);

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
          <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-lg border border-green-200 dark:border-gray-600 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 dark:bg-gray-600 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200 dark:bg-gray-600 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                {/* Left Side - SIM Card Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <CreditCard className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        SIM Card — Detail/Edit
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        ICCID: {simCardData?.iccid?.substring(0, 8)}… • SIM: {simCardData?.sim_id} • Status: {simCardData?.status} • Signal: {signalInfo.label}
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
                      label="Activate"
                      variant="outlineDark"
                      size="small"
                      icon={<Play className="h-3 w-3" />}
                      onClick={handleActivate}
                      className="px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      label="Deactivate"
                      variant="outlineDark"
                      size="small"
                      icon={<PowerOff className="h-3 w-3" />}
                      onClick={handleDeactivate}
                      className="px-3 py-2 text-xs"
                    />
                    <Button
                      label="Suspend"
                      variant="outlineDark"
                      size="small"
                      icon={<Pause className="h-3 w-3" />}
                      onClick={handleSuspend}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Plan Limit (GB)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {simCardData?.plan_data_limit_gb || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Wifi className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Used (GB)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {simCardData?.current_data_used_gb || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overage Threshold (%)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round((simCardData?.overage_threshold || 0.9) * 100)}%
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Signal className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {simCardData?.status || 'Unknown'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Info (Left) */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Info</h3>
              <Button
                label={isEditing ? "Cancel" : "Edit"}
                variant="outlineDark"
                size="small"
                icon={isEditing ? undefined : <Edit className="h-4 w-4" />}
                onClick={() => {
                  if (isEditing) {
                    // Reset form data to original
                    setFormData({
                      sim_id: simCardData?.sim_id || "",
                      iccid: simCardData?.iccid || "",
                      status: simCardData?.status || "inactive",
                      plan_name: simCardData?.plan_name || "",
                      plan_data_limit_gb: simCardData?.plan_data_limit_gb || 0,
                      plan_cost: simCardData?.plan_cost || 0,
                      current_data_used_gb: simCardData?.current_data_used_gb || 0,
                      current_cycle_start: simCardData?.current_cycle_start || "",
                      overage_threshold: simCardData?.overage_threshold || 0.9,
                      device: simCardData?.device || null,
                    });
                  }
                  setIsEditing(!isEditing);
                }}
                className="text-xs"
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">sim_id</label>
                <input
                  type="text"
                  name="sim_id"
                  value={formData.sim_id}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">iccid</label>
                <input
                  type="text"
                  name="iccid"
                  value={formData.iccid}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="inactive">inactive</option>
                  <option value="active">active</option>
                  <option value="suspended">suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">plan_name</label>
                <input
                  type="text"
                  name="plan_name"
                  value={formData.plan_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">plan_data_limit_gb</label>
                <input
                  type="number"
                  step="0.1"
                  name="plan_data_limit_gb"
                  value={formData.plan_data_limit_gb}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">plan_cost</label>
                <input
                  type="number"
                  step="0.01"
                  name="plan_cost"
                  value={formData.plan_cost}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">current_cycle_start</label>
                <input
                  type="date"
                  name="current_cycle_start"
                  value={formData.current_cycle_start ? formData.current_cycle_start.split('T')[0] : ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">current_data_used_gb</label>
                <input
                  type="number"
                  step="0.1"
                  name="current_data_used_gb"
                  value={formData.current_data_used_gb}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">overage_threshold</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  name="overage_threshold"
                  value={formData.overage_threshold}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Device/Connectivity (Right) */}
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <h3 className="text-lg font-semibold mb-4">Device/Connectivity</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">device (OBD id)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={simCardData?.device || 'Unassigned'}
                    disabled
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                  {simCardData?.device && (
                    <Button
                      label="View OBD Device"
                      variant="outlineDark"
                      size="small"
                      onClick={handleViewOBDDevice}
                      className="text-xs"
                    />
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">last_activity</label>
                <input
                  type="text"
                  value={simCardData?.last_activity ? new Date(simCardData.last_activity).toLocaleString() : 'Never'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">signal_strength</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={`${simCardData?.signal_strength || -100} dBm`}
                    disabled
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                  <span className={`text-sm font-medium ${signalInfo.className}`}>
                    {signalInfo.label}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">created_at</label>
                <input
                  type="text"
                  value={simCardData?.created_at ? new Date(simCardData.created_at).toLocaleString() : 'N/A'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="pt-4">
                <Button
                  label="Update Usage"
                  variant="primary"
                  icon={<Activity className="h-4 w-4" />}
                  onClick={handleUpdateUsage}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  POST /api/fleet/sim-cards/{simCardId}/update-usage/
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}