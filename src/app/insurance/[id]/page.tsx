"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetInsurancePolicyByIdQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Shield, Calendar, DollarSign, FileText, Edit, Trash2 } from "lucide-react";

export default function InsuranceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const insuranceId = params?.id as string;

  const { data: insuranceData, isLoading, error } = useGetInsurancePolicyByIdQuery(insuranceId);

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
                  Error Loading Insurance Policy
                </h1>
              </div>
            </div>
          </div>
          <div className="text-center text-red-600">
            <p>Failed to load insurance policy details. Please try again.</p>
            <Button 
              onClick={() => router.back()} 
              variant="primary" 
              label="Back to Insurance"
              className="mt-4"
            />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!insuranceData) {
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
                  Insurance Policy Not Found
                </h1>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Extract the actual insurance data from the nested structure
  const policy = (insuranceData as any)?.insurance_policy || insuranceData;

  // Calculate if policy is active
  const today = new Date();
  const startDate = new Date(policy.start_date);
  const endDate = new Date(policy.end_date);
  const isActive = today >= startDate && today <= endDate;

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
                Insurance — Detail/Edit
              </h1>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Policy #: {policy.policy_number || 'N/A'}</span>
                <span>Provider: {policy.provider || 'N/A'}</span>
                <span>Status: {isActive ? 'Active' : 'Expired'}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                label="Save"
                variant="primary"
                icon={<Edit className="h-4 w-4" />}
                onClick={() => {
                  // TODO: Implement save functionality
                  alert('Save functionality coming soon');
                }}
              />
              <Button
                label="Delete"
                variant="outlineDark"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => {
                  // TODO: Implement delete functionality
                  alert('Delete functionality coming soon');
                }}
              />
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isActive ? 'Active' : 'Expired'}
                  </span>
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Coverage Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${policy.coverage_amount ? policy.coverage_amount.toLocaleString() : '0'}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Premium Amount (annual)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${policy.premium_amount || '0'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Policy (Left) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Policy</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">vehicle</span>
                <span className="font-semibold text-gray-900 dark:text-white">{policy.vehicle || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">policy_number</span>
                <span className="font-semibold text-gray-900 dark:text-white font-mono text-sm">{policy.policy_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">provider</span>
                <span className="font-semibold text-gray-900 dark:text-white">{policy.provider || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">start_date</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {policy.start_date 
                    ? new Date(policy.start_date).toLocaleDateString()
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">end_date</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {policy.end_date 
                    ? new Date(policy.end_date).toLocaleDateString()
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">coverage_amount</span>
                <span className="font-semibold text-gray-900 dark:text-white">${policy.coverage_amount ? policy.coverage_amount.toLocaleString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">premium_amount</span>
                <span className="font-semibold text-gray-900 dark:text-white">${policy.premium_amount || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Vehicle (Right) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Vehicle</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Vehicle Info</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{policy.vehicle || 'N/A'}</span>
                  {policy.vehicle && (
                    <Button
                      label="Open Vehicle"
                      variant="outlineDark"
                      size="small"
                      onClick={() => router.push(`/vehicles/${policy.vehicle}`)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
