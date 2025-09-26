"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetGroupByIdQuery, useUpdateGroupMutation, useDeleteGroupMutation, useGetGroupUsersQuery, useGetGroupPermissionsQuery, useUpdateGroupUsersMutation, useUpdateGroupPermissionsMutation } from "@/store/api/usersApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Users, Shield, Edit, Trash2, Plus, X } from "lucide-react";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  
  const { data: groupData, isLoading, error } = useGetGroupByIdQuery(parseInt(groupId));
  const { data: groupUsersData } = useGetGroupUsersQuery(parseInt(groupId));
  const { data: groupPermissionsData } = useGetGroupPermissionsQuery(parseInt(groupId));
  
  const [updateGroup] = useUpdateGroupMutation();
  const [deleteGroup] = useDeleteGroupMutation();
  const [updateGroupUsers] = useUpdateGroupUsersMutation();
  const [updateGroupPermissions] = useUpdateGroupPermissionsMutation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (groupData) {
      setFormData({
        name: groupData.name || "",
        description: "", // Group doesn't have description field
      });
    }
  }, [groupData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      await updateGroup({
        id: parseInt(groupId),
        body: formData
      }).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGroup(parseInt(groupId)).unwrap();
      router.push('/users/groups');
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleRemoveUser = async (userId: number) => {
    try {
      const currentUserIds = groupUsersData?.results?.map(user => user.id) || [];
      const updatedUserIds = currentUserIds.filter(id => id !== userId);
      await updateGroupUsers({
        groupId: parseInt(groupId),
        userIds: updatedUserIds
      }).unwrap();
    } catch (error) {
      console.error('Error removing user from group:', error);
    }
  };

  const handleRemovePermission = async (permissionId: number) => {
    try {
      const currentPermissionIds = groupPermissionsData?.results?.map(perm => perm.id) || [];
      const updatedPermissionIds = currentPermissionIds.filter(id => id !== permissionId);
      await updateGroupPermissions({
        groupId: parseInt(groupId),
        permissionIds: updatedPermissionIds
      }).unwrap();
    } catch (error) {
      console.error('Error removing permission from group:', error);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !groupData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager']}>
        <div className="text-center text-red-600">
          <p>Error loading group or group not found</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push('/users/groups')}
              variant="outlinePrimary"
              label="Back"
              icon={<ArrowLeft className="h-4 w-4" />}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Group' : groupData.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isEditing ? 'Update group details' : 'Group details and members'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {!isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outlinePrimary"
                  label="Edit"
                  icon={<Edit className="h-4 w-4" />}
                />
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="outlineDark"
                  label="Delete"
                  icon={<Trash2 className="h-4 w-4" />}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                />
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outlinePrimary"
                  label="Cancel"
                />
                <Button
                  onClick={handleSave}
                  variant="primary"
                  label="Save"
                />
              </>
            )}
          </div>
        </div>

        {/* Group Details */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Group Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Group Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{groupData.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">No description available</p>
              )}
            </div>
          </div>
        </div>

        {/* Group Members */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Group Members</h2>
            <Button
              onClick={() => router.push(`/users/groups/${groupId}/users`)}
              variant="outlinePrimary"
              label="Add Members"
              icon={<Plus className="h-4 w-4" />}
            />
          </div>
          
          {groupUsersData?.results && groupUsersData.results.length > 0 ? (
            <div className="space-y-2">
              {groupUsersData.results.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRemoveUser(user.id)}
                    variant="outlineDark"
                    label="Remove"
                    icon={<X className="h-4 w-4" />}
                    className="text-red-600 hover:text-red-700"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No members in this group</p>
          )}
        </div>

        {/* Group Permissions */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Group Permissions</h2>
            <Button
              onClick={() => router.push(`/users/groups/${groupId}/permissions`)}
              variant="outlinePrimary"
              label="Add Permissions"
              icon={<Plus className="h-4 w-4" />}
            />
          </div>
          
          {groupPermissionsData?.results && groupPermissionsData.results.length > 0 ? (
            <div className="space-y-2">
              {groupPermissionsData.results.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{permission.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{permission.codename}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRemovePermission(permission.id)}
                    variant="outlineDark"
                    label="Remove"
                    icon={<X className="h-4 w-4" />}
                    className="text-red-600 hover:text-red-700"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No permissions assigned to this group</p>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Group"
          message={`Are you sure you want to delete the group "${groupData.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </ProtectedRoute>
  );
}
