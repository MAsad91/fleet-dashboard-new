"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetAlertRulesQuery, useCreateAlertRuleMutation, useUpdateAlertRuleMutation, useDeleteAlertRuleMutation } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Plus, Eye, Edit, Trash2, AlertTriangle, Settings, Bell } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";

export default function AlertRulesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: alertRulesData, isLoading, error, refetch } = useGetAlertRulesQuery();
  const [createAlertRule] = useCreateAlertRuleMutation();
  const [updateAlertRule] = useUpdateAlertRuleMutation();
  const [deleteAlertRule] = useDeleteAlertRuleMutation();

  const alertRules = alertRulesData?.results || [];

  const filteredRules = alertRules.filter((rule: any) => {
    const matchesSearch = rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.system?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || rule.is_active === (statusFilter === 'active');
    const matchesSeverity = !severityFilter || rule.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleAddRule = () => {
    setIsAddModalOpen(true);
  };

  const handleViewRule = (ruleId: number) => {
    setSelectedRuleId(ruleId);
    setIsViewModalOpen(true);
  };

  const handleEditRule = (ruleId: number) => {
    setSelectedRuleId(ruleId);
    setIsEditModalOpen(true);
  };

  const handleDeleteRule = (ruleId: number) => {
    setSelectedRuleId(ruleId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedRuleId) {
      try {
        await deleteAlertRule(selectedRuleId.toString()).unwrap();
        await refetch();
        setIsDeleteModalOpen(false);
        setSelectedRuleId(null);
      } catch (error) {
        console.error('Failed to delete alert rule:', error);
      }
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? "bg-green-100 text-green-800" 
          : "bg-gray-100 text-gray-800"
      }`}>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
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
          <p>Error loading alert rules</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alert Rules</h1>
            <p className="text-muted-foreground">
              Configure and manage alert rules for your fleet
            </p>
          </div>
          <Button
            label="Add Rule"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => router.push('/alert-rules/add')}
          />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rules</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {alertRules.length}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {alertRules.filter((rule: any) => rule.is_active).length}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {alertRules.filter((rule: any) => !rule.is_active).length}
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Auto-Resolve</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {alertRules.filter((rule: any) => rule.auto_resolve).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputGroup
              type="text"
              label="Search"
              placeholder="Search rules..."
              value={searchTerm}
              handleChange={(e) => setSearchTerm(e.target.value)}
              icon={<AlertTriangle className="h-4 w-4" />}
            />
            <Select
              label="Severity"
              items={[
                { value: "", label: "All Severities" },
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
              ]}
              defaultValue={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            />
            <Select
              label="Status"
              items={[
                { value: "", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              defaultValue={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <Button
              onClick={handleAddRule}
              variant="primary"
              label="Add Rule"
              icon={<Plus className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Alert Rules Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vehicle Types
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    System
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRules.map((rule: any) => (
                  <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Settings className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {rule.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {rule.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSeverityBadge(rule.severity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        rule.is_active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {rule.is_active ? "✓" : "✗"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {rule.vehicle_types && rule.vehicle_types.length > 0 
                        ? `[${rule.vehicle_types.join(',')}]` 
                        : 'All'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {rule.system || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {rule.created_at ? new Date(rule.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          label=""
                          variant="outlineDark"
                          size="small"
                          icon={<Eye className="h-4 w-4" />}
                          onClick={() => handleViewRule(rule.id)}
                        />
                        <Button
                          label=""
                          variant="outlineDark"
                          size="small"
                          icon={<Edit className="h-4 w-4" />}
                          onClick={() => handleEditRule(rule.id)}
                        />
                        <Button
                          label=""
                          variant="outlineDark"
                          size="small"
                          icon={<Trash2 className="h-4 w-4" />}
                          onClick={() => handleDeleteRule(rule.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRules.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No alert rules found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter
                  ? "Try adjusting your search criteria"
                  : "Get started by creating a new alert rule"
                }
              </p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Alert Rule"
          message="Are you sure you want to delete this alert rule? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </ProtectedRoute>
  );
}
