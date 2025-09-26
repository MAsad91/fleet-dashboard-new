"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Plus, Eye, Edit, Trash2, User, Shield, Mail, Calendar, Users, Phone, CheckCircle } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";

export default function UsersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [orderingFilter, setOrderingFilter] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Mock data for demonstration
  const mockUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@company.com",
      role: "admin",
      status: "active",
      lastLogin: "2024-01-15 09:30:00",
      createdAt: "2023-06-15",
      permissions: ["fleet_management", "user_management", "analytics"]
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@company.com",
      role: "manager",
      status: "active",
      lastLogin: "2024-01-15 08:45:00",
      createdAt: "2023-08-20",
      permissions: ["fleet_management", "analytics"]
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      role: "operator",
      status: "active",
      lastLogin: "2024-01-14 16:20:00",
      createdAt: "2023-09-10",
      permissions: ["fleet_management"]
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah.wilson@company.com",
      role: "viewer",
      status: "inactive",
      lastLogin: "2024-01-10 14:15:00",
      createdAt: "2023-10-05",
      permissions: ["analytics"]
    },
    {
      id: 5,
      name: "David Brown",
      email: "david.brown@company.com",
      role: "FLEET_USER",
      status: "active",
      lastLogin: "2024-01-15 07:30:00",
      createdAt: "2023-11-12",
      permissions: ["fleet_management"]
    }
  ];

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch = searchTerm
      ? user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesGroup = groupFilter ? user.role === groupFilter : true;
    return matchesSearch && matchesGroup;
  });

  // Calculate KPI data (mock for now)
  const kpiData = {
    totalUsers: mockUsers.length,
    totalGroups: 4, // Mock groups count
    phoneVerified: mockUsers.filter(u => u.status === 'active').length, // Mock phone verified
    emailVerified: mockUsers.filter(u => u.status === 'active').length // Mock email verified
  };

  const handleAddUser = () => {
    console.log("Add new user");
  };

  const handleViewUser = (userId: number) => {
    console.log("View user", userId);
  };

  const handleEditUser = (userId: number) => {
    console.log("Edit user", userId);
  };

  const handleDeleteUser = (userId: number) => {
    setSelectedUserId(userId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedUserId) {
      try {
        // TODO: Implement delete user API call
        console.log("Deleting user", selectedUserId);
        setIsDeleteModalOpen(false);
        setSelectedUserId(null);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    switch (role) {
      case "admin":
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case "manager":
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      case "operator":
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case "viewer":
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case "FLEET_USER":
        return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    switch (status) {
      case "active":
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case "inactive":
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
    }
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users & Permissions — Users</h1>
            <p className="text-muted-foreground">
              Manage user accounts and permissions
            </p>
          </div>
          <div className="flex space-x-2">
            <InputGroup
              type="text"
              label=""
              placeholder="Search user/email/phone"
              value={searchTerm}
              handleChange={(e) => setSearchTerm(e.target.value)}
              icon={<User className="h-4 w-4" />}
              className="w-64"
            />
            <Button
              label="Create"
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => router.push('/users/add')}
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpiData.totalUsers}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Groups</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpiData.totalGroups}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone Verified</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpiData.phoneVerified}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Phone className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email Verified</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kpiData.emailVerified}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputGroup
              type="text"
              label="Search user/email/phone"
              placeholder="Search users..."
              value={searchTerm}
              handleChange={(e) => setSearchTerm(e.target.value)}
              icon={<User className="h-4 w-4" />}
            />
            <Select
              label="Group: exclude"
              items={[
                { value: "", label: "All Groups" },
                { value: "admin", label: "Admin" },
                { value: "manager", label: "Manager" },
                { value: "operator", label: "Operator" },
                { value: "viewer", label: "Viewer" },
                { value: "FLEET_USER", label: "Fleet User" },
              ]}
              defaultValue={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            />
            <Select
              label="Ordering"
              items={[
                { value: "", label: "Default" },
                { value: "username", label: "Username" },
                { value: "date_joined", label: "Date Joined" },
                { value: "-username", label: "Username (desc)" },
                { value: "-date_joined", label: "Date Joined (desc)" },
              ]}
              defaultValue={orderingFilter}
              onChange={(e) => setOrderingFilter(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Button
              onClick={handleAddUser}
              variant="primary"
              label="Apply"
              icon={<Plus className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Operator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name.toLowerCase().replace(' ', '.')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        +1-555-0123
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getRoleBadge(user.role)}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Fleet Operator 1
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(user.status)}>
                        {user.status === 'active' ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {user.lastLogin}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          label="View"
                          variant="outlineDark"
                          size="small"
                          icon={<Eye className="h-4 w-4" />}
                          onClick={() => handleViewUser(user.id)}
                        />
                        <Button
                          label="Edit"
                          variant="outlineDark"
                          size="small"
                          icon={<Edit className="h-4 w-4" />}
                          onClick={() => handleEditUser(user.id)}
                        />
                        <Button
                          label="Delete"
                          variant="outlineDark"
                          size="small"
                          icon={<Trash2 className="h-4 w-4" />}
                          onClick={() => handleDeleteUser(user.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Data source: /users/ + /profiles/ (counts)
            </p>
          </div>
        </div>
      </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
    </ProtectedRoute>
  );
}
