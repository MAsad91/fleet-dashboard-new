"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Plus, Eye, Trash2, Shield, Users, Key } from "lucide-react";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";

export default function GroupsPage() {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  // Mock data for demonstration
  const mockGroups = [
    {
      id: 1,
      name: "Admins",
      users: 5,
      permissions: 87
    },
    {
      id: 2,
      name: "Fleet Ops",
      users: 8,
      permissions: 23
    },
    {
      id: 3,
      name: "Support",
      users: 3,
      permissions: 11
    },
    {
      id: 4,
      name: "Drivers",
      users: 12,
      permissions: 5
    }
  ];

  // Calculate KPI data (mock for now)
  const kpiData = {
    totalGroups: mockGroups.length,
    totalPerms: mockGroups.reduce((sum, group) => sum + group.permissions, 0)
  };

  const handleAddGroup = () => {
    console.log("Add new group");
  };

  const handleViewGroup = (groupId: number) => {
    router.push(`/users/groups/${groupId}`);
  };

  const handleDeleteGroup = (groupId: number) => {
    setSelectedGroupId(groupId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedGroupId) {
      try {
        // TODO: Implement delete group API call
        console.log("Deleting group", selectedGroupId);
        setIsDeleteModalOpen(false);
        setSelectedGroupId(null);
      } catch (error) {
        console.error('Failed to delete group:', error);
      }
    }
  };

  const handleOpenPermissions = () => {
    router.push('/users/permissions');
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users & Permissions — Groups</h1>
            <p className="text-muted-foreground">
              Manage user groups and their permissions
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              label="+ New Group"
              variant="outlineDark"
              icon={<Plus className="h-4 w-4" />}
              onClick={handleAddGroup}
            />
            <Button
              label="Open Permissions"
              variant="primary"
              icon={<Key className="h-4 w-4" />}
              onClick={handleOpenPermissions}
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Groups</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpiData.totalGroups}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Perms</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpiData.totalPerms}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Key className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Groups Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Perms
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {mockGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {group.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {group.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {group.users}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Key className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {group.permissions}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          label="View"
                          variant="outlineDark"
                          size="small"
                          icon={<Eye className="h-4 w-4" />}
                          onClick={() => handleViewGroup(group.id)}
                        />
                        <Button
                          label="Delete"
                          variant="outlineDark"
                          size="small"
                          icon={<Trash2 className="h-4 w-4" />}
                          onClick={() => handleDeleteGroup(group.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {mockGroups.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No groups found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Get started by creating a new group
              </p>
            </div>
          )}
          
          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Data source: /groups/ (+ /groups/{'{id}'}/users|permissions for counts)
            </p>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Group"
          message="Are you sure you want to delete this group? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </ProtectedRoute>
  );
}
