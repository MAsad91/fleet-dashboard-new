"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetSimCardByIdQuery, useActivateSimCardMutation, useDeactivateSimCardMutation, useSuspendSimCardMutation, useUpdateSimCardUsageMutation } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, CreditCard, Wifi, Activity, AlertCircle, DollarSign, Gauge, CheckCircle, XCircle, Pause, Edit, Trash2 } from "lucide-react";

export default function SimCardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const simCardId = params?.id as string;

  const { data: simCardData, isLoading, error } = useGetSimCardByIdQuery(simCardId);
  const [activateSimCard] = useActivateSimCardMutation();
  const [deactivateSimCard] = useDeactivateSimCardMutation();
  const [suspendSimCard] = useSuspendSimCardMutation();
  const [updateSimCardUsage] = useUpdateSimCardUsageMutation();

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const simCard = simCardData;

  if (error || !simCard) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
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
                  SIM Card Not Found
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {simCardId ? `SIM Card ID: ${simCardId}` : 'SIM Card Information'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800 dark:text-red-200">
                {error ? 'Failed to load SIM card details. Please try again.' : 'SIM card not found.'}
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button 
              onClick={() => router.push('/sim-cards')}
              variant="primary"
              label="Back to SIM Cards"
              className="px-6 py-3"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { className: "bg-green-100 text-green-800", label: "Active" },
      inactive: { className: "bg-red-100 text-red-800", label: "Inactive" },
      suspended: { className: "bg-yellow-100 text-yellow-800", label: "Suspended" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      label: status || "Unknown"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getSignalStrengthBadge = (strength: string) => {
    const strengthConfig = {
      strong: { className: "bg-green-100 text-green-800", label: "Strong" },
      weak: { className: "bg-yellow-100 text-yellow-800", label: "Weak" },
      none: { className: "bg-red-100 text-red-800", label: "None" },
    };
    
    const config = strengthConfig[strength as keyof typeof strengthConfig] || { 
      className: "bg-gray-100 text-gray-800", 
      label: strength || "Unknown"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const handleActivate = async () => {
    try {
      await activateSimCard({ id: simCardId }).unwrap();
      // Refresh the data
      window.location.reload();
    } catch (error) {
      console.error('Failed to activate SIM card:', error);
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateSimCard({ id: simCardId }).unwrap();
      // Refresh the data
      window.location.reload();
    } catch (error) {
      console.error('Failed to deactivate SIM card:', error);
    }
  };

  const handleSuspend = async () => {
    try {
      await suspendSimCard({ id: simCardId }).unwrap();
      // Refresh the data
      window.location.reload();
    } catch (error) {
      console.error('Failed to suspend SIM card:', error);
    }
  };

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


        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                SIM Card — Detail
              </h1>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>ICCID: {simCard.iccid ? `${simCard.iccid.substring(0, 4)}…` : 'N/A'}</span>
                <span>SIM: {simCard.sim_id || 'N/A'}</span>
                <span>Status: {getStatusBadge(simCard.status)}</span>
                <span>Signal: {getSignalStrengthBadge(simCard.signal_strength)}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              {simCard.status === 'inactive' && (
                <Button
                  label="Activate"
                  variant="primary"
                  icon={<CheckCircle className="h-4 w-4" />}
                  onClick={handleActivate}
                />
              )}
              {simCard.status === 'active' && (
                <Button
                  label="Deactivate"
                  variant="outlineDark"
                  icon={<XCircle className="h-4 w-4" />}
                  onClick={handleDeactivate}
                />
              )}
              {simCard.status === 'active' && (
                <Button
                  label="Suspend"
                  variant="outlineDark"
                  icon={<Pause className="h-4 w-4" />}
                  onClick={handleSuspend}
                />
              )}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Plan Limit (GB)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {simCard.plan_data_limit_gb || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Gauge className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Used (GB)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {simCard.current_data_used_gb || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Wifi className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overage Threshold (%)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round((simCard.overage_threshold || 0) * 100)}%
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {getStatusBadge(simCard.status)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Info (Left) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Info</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">sim_id</span>
                <span className="font-semibold text-gray-900 dark:text-white">{simCard.sim_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">iccid</span>
                <span className="font-semibold text-gray-900 dark:text-white font-mono text-sm">{simCard.iccid || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">status</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {getStatusBadge(simCard.status)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">plan_name</span>
                <span className="font-semibold text-gray-900 dark:text-white">{simCard.plan_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">plan_data_limit_gb</span>
                <span className="font-semibold text-gray-900 dark:text-white">{simCard.plan_data_limit_gb || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">plan_cost</span>
                <span className="font-semibold text-gray-900 dark:text-white">${simCard.plan_cost || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">current_cycle_start</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {simCard.current_cycle_start 
                    ? new Date(simCard.current_cycle_start).toLocaleDateString()
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">current_data_used_gb</span>
                <span className="font-semibold text-gray-900 dark:text-white">{simCard.current_data_used_gb || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">overage_threshold</span>
                <span className="font-semibold text-gray-900 dark:text-white">{Math.round((simCard.overage_threshold || 0) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Device/Connectivity (Right) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Device/Connectivity</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">device (OBD id)</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{simCard.device || 'Unassigned'}</span>
                  {simCard.device && (
                    <Button
                      label="View OBD Device"
                      variant="outlineDark"
                      size="small"
                      onClick={() => router.push(`/obd-devices/${simCard.device}`)}
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">last_activity</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {simCard.last_activity 
                    ? new Date(simCard.last_activity).toLocaleString()
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">signal_strength</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {getSignalStrengthBadge(simCard.signal_strength)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">created_at</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {simCard.created_at 
                    ? new Date(simCard.created_at).toLocaleString()
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Actions</h3>
            <div className="flex space-x-4">
              <Button
                label="Activate"
                variant="primary"
                icon={<CheckCircle className="h-4 w-4" />}
                onClick={() => {
                  // TODO: Implement activate API call
                  alert('Activate functionality coming soon');
                }}
                className={simCard.status === 'active' ? 'opacity-50 cursor-not-allowed' : ''}
              />
              <Button
                label="Deactivate"
                variant="outlineDark"
                icon={<XCircle className="h-4 w-4" />}
                onClick={() => {
                  // TODO: Implement deactivate API call
                  alert('Deactivate functionality coming soon');
                }}
                className={simCard.status === 'inactive' ? 'opacity-50 cursor-not-allowed' : ''}
              />
              <Button
                label="Suspend"
                variant="outlineDark"
                icon={<Pause className="h-4 w-4" />}
                onClick={() => {
                  // TODO: Implement suspend API call
                  alert('Suspend functionality coming soon');
                }}
                className={simCard.status === 'suspended' ? 'opacity-50 cursor-not-allowed' : ''}
              />
              <Button
                label="Update Usage"
                variant="outlineDark"
                icon={<Edit className="h-4 w-4" />}
                onClick={() => {
                  // TODO: Implement update usage API call
                  alert('Update Usage functionality coming soon');
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
