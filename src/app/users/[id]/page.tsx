"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Edit, Trash2, User, Shield, Mail, Calendar, Phone, MapPin, Key, Users, CheckCircle, XCircle, Lock } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { Checkbox } from "@/components/FormElements/checkbox";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // TODO: Implement real API hook when available
  // const { data: userData, isLoading, error } = useGetUserQuery(userId);
  const mockUser: any = null;

  const [userData, setUserData] = useState<any>(mockUser);

  // Show no data message when no user data is available
  if (!userData) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Not Found</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">The requested user could not be found.</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // KPI data
  const kpiData = {
    active: userData.is_active,
    phoneVerified: userData.profile.is_phone_verified,
    emailVerified: userData.profile.is_email_verified,
    lastLogin: userData.last_login,
    directPerms: userData.permissions.direct_permissions,
    groupPerms: userData.permissions.group_permissions,
    effectivePerms: userData.permissions.all_permissions
  };

  const handleSave = async () => {
    try {
      // TODO: Implement save user API call
      console.log("Saving user:", userData);
      setIsEditMode(false);
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleDelete = async () => {
    try {
      // TODO: Implement delete user API call
      console.log("Deleting user:", userId);
      setIsDeleteModalOpen(false);
      router.push('/users');
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleSetPassword = async () => {
    try {
      // TODO: Implement set password API call
      console.log("Setting password for user:", userId);
      setIsPasswordModalOpen(false);
    } catch (error) {
      console.error('Failed to set password:', error);
    }
  };

  const handleSendOTP = () => {
    console.log("Sending OTP to user:", userId);
  };

  const handleUpdateEmail = () => {
    console.log("Update email for user:", userId);
  };

  const handleUpdatePhone = () => {
    console.log("Update phone for user:", userId);
  };

  const handleManageDirectPerms = () => {
    console.log("Manage direct permissions for user:", userId);
  };

  const handleAddToGroup = () => {
    console.log("Add user to group:", userId);
  };

  const handleRemoveFromGroup = (groupName: string) => {
    console.log("Remove user from group:", groupName);
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User — Detail: {userData.username}</h1>
            <p className="text-muted-foreground">
              Manage user account and permissions
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              label={isEditMode ? "Save" : "Edit"}
              variant="primary"
              icon={<Edit className="h-4 w-4" />}
              onClick={isEditMode ? handleSave : () => setIsEditMode(true)}
            />
            <Button
              label="Set Password"
              variant="outlineDark"
              icon={<Lock className="h-4 w-4" />}
              onClick={() => setIsPasswordModalOpen(true)}
            />
            <Button
              label="Delete"
              variant="outlineDark"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => setIsDeleteModalOpen(true)}
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpiData.active ? '✓' : '✗'}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone Verified</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpiData.phoneVerified ? '✓' : '✗'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email Verified</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpiData.emailVerified ? '✓' : '✗'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Login</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {new Date(kpiData.lastLogin).toLocaleDateString()}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Direct Perms</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpiData.directPerms}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <Key className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Group Perms</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpiData.groupPerms}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Effective Perms</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpiData.effectivePerms}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Info (Left) */}
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">User Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup
                  type="text"
                  label="Username"
                  placeholder="Enter username"
                  value={userData.username}
                  handleChange={(e) => setUserData((prev: any) => ({ ...prev, username: e.target.value }))}
                  icon={<User className="h-4 w-4" />}
                />
                <InputGroup
                  type="text"
                  label="First Name"
                  placeholder="Enter first name"
                  value={userData.first_name}
                  handleChange={(e) => setUserData((prev: any) => ({ ...prev, first_name: e.target.value }))}
                  icon={<User className="h-4 w-4" />}
                />
                <InputGroup
                  type="text"
                  label="Last Name"
                  placeholder="Enter last name"
                  value={userData.last_name}
                  handleChange={(e) => setUserData((prev: any) => ({ ...prev, last_name: e.target.value }))}
                  icon={<User className="h-4 w-4" />}
                />
                <InputGroup
                  type="email"
                  label="Email"
                  placeholder="Enter email"
                  value={userData.email}
                  handleChange={(e) => setUserData((prev: any) => ({ ...prev, email: e.target.value }))}
                  icon={<Mail className="h-4 w-4" />}
                />
                <div className="md:col-span-2">
                  <Checkbox
                    label="Active"
                    name="is_active"
                    onChange={(e) => setUserData((prev: any) => ({ ...prev, is_active: e.target.checked }))} 
                  />
                </div>
              </div>
            </div>

            {/* Profile */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup
                  type="tel"
                  label="Phone Number"
                  placeholder="Enter phone number"
                  value={userData.profile.phone_number}
                  handleChange={(e) => setUserData((prev: any) => ({ 
                    ...prev, 
                    profile: { ...prev.profile, phone_number: e.target.value }
                  }))}
                  icon={<Phone className="h-4 w-4" />}
                />
                <Select
                  label="Role"
                  items={[
                    { value: "OEM_ADMIN", label: "OEM Admin" },
                    { value: "FLEET_ADMIN", label: "Fleet Admin" },
                    { value: "FLEET_USER", label: "Fleet User" },
                    { value: "DRIVER", label: "Driver" },
                    { value: "TECHNICIAN", label: "Technician" },
                  ]}
                  defaultValue={userData.profile.role}
                  onChange={(e) => setUserData((prev: any) => ({ 
                    ...prev, 
                    profile: { ...prev.profile, role: e.target.value }
                  }))}
                />
                <InputGroup
                  type="text"
                  label="City"
                  placeholder="Enter city"
                  value={userData.profile.city}
                  handleChange={(e) => setUserData((prev: any) => ({ 
                    ...prev, 
                    profile: { ...prev.profile, city: e.target.value }
                  }))}
                  icon={<MapPin className="h-4 w-4" />}
                />
                <InputGroup
                  type="text"
                  label="State"
                  placeholder="Enter state"
                  value={userData.profile.state}
                  handleChange={(e) => setUserData((prev: any) => ({ 
                    ...prev, 
                    profile: { ...prev.profile, state: e.target.value }
                  }))}
                  icon={<MapPin className="h-4 w-4" />}
                />
                <InputGroup
                  type="text"
                  label="PIN"
                  placeholder="Enter PIN"
                  value={userData.profile.pin}
                  handleChange={(e) => setUserData((prev: any) => ({ 
                    ...prev, 
                    profile: { ...prev.profile, pin: e.target.value }
                  }))}
                  icon={<MapPin className="h-4 w-4" />}
                />
                <Select
                  label="Preferred Theme"
                  items={[
                    { value: "light", label: "Light" },
                    { value: "dark", label: "Dark" },
                    { value: "system", label: "System" },
                  ]}
                  defaultValue={userData.profile.preferred_theme}
                  onChange={(e) => setUserData((prev: any) => ({ 
                    ...prev, 
                    profile: { ...prev.profile, preferred_theme: e.target.value }
                  }))}
                />
                <div className="md:col-span-2">
                  <InputGroup
                    type="text"
                    label="Address"
                    placeholder="Enter address"
                    value={userData.profile.address}
                    handleChange={(e) => setUserData((prev: any) => ({ 
                      ...prev, 
                      profile: { ...prev.profile, address: e.target.value }
                    }))}
                    icon={<MapPin className="h-4 w-4" />}
                  />
                </div>
                <div className="md:col-span-2">
                  <InputGroup
                    type="text"
                    label="Fleet Operator"
                    placeholder="Fleet Operator"
                    value={userData.profile.fleet_operator}
                    handleChange={(e) => setUserData((prev: any) => ({ 
                      ...prev, 
                      profile: { ...prev.profile, fleet_operator: e.target.value }
                    }))}
                    icon={<Shield className="h-4 w-4" />}
                  />
                </div>
              </div>
            </div>

            {/* Contact (Self) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Contact (Self)</h2>
              <div className="space-y-4">
                <Button
                  label="Send OTP"
                  variant="outlineDark"
                  icon={<Phone className="h-4 w-4" />}
                  onClick={handleSendOTP}
                />
                <Button
                  label="Update Email"
                  variant="outlineDark"
                  icon={<Mail className="h-4 w-4" />}
                  onClick={handleUpdateEmail}
                />
                <Button
                  label="Update Phone"
                  variant="outlineDark"
                  icon={<Phone className="h-4 w-4" />}
                  onClick={handleUpdatePhone}
                />
              </div>
            </div>

            {/* Security */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Security</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Login:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(userData.last_login).toLocaleString()}
                  </span>
                </div>
                <Button
                  label="Set Password"
                  variant="outlineDark"
                  icon={<Lock className="h-4 w-4" />}
                  onClick={() => setIsPasswordModalOpen(true)}
                />
              </div>
            </div>
          </div>

          {/* Access (Right) */}
          <div className="space-y-6">
            {/* Groups */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Groups: memberships</h2>
                <Button
                  label="Add"
                  variant="primary"
                  size="small"
                  onClick={handleAddToGroup}
                />
              </div>
              <div className="space-y-2">
                {userData.groups.map((group: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{group}</span>
                    </div>
                    <Button
                      label="Remove"
                      variant="outlineDark"
                      size="small"
                      onClick={() => handleRemoveFromGroup(group)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Permissions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Direct Perms: top items</h2>
                <Button
                  label="Manage Direct…"
                  variant="primary"
                  size="small"
                  onClick={handleManageDirectPerms}
                />
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <Key className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900 dark:text-white">fleet.add_vehicle</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <Key className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900 dark:text-white">fleet.change_vehicle</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <Key className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900 dark:text-white">users.view_user</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Effective Permissions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Effective Perms: count (direct ∪ group)</h2>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {userData.permissions.all_permissions}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total effective permissions
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Data source: /users/{'{id}'}/ + /users/{'{id}'}/permissions/
          </p>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />

        {/* Set Password Modal */}
        <ConfirmationModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onConfirm={handleSetPassword}
          title="Set Password"
          message="This will set a new password for the user. The user will need to use this password for login."
          confirmText="Set Password"
          cancelText="Cancel"
        />
      </div>
    </ProtectedRoute>
  );
}
