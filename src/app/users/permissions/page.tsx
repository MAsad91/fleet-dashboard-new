"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Key, Search, Filter, Users } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";

export default function PermissionsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [appLabelFilter, setAppLabelFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  // Mock data for demonstration
  const mockPermissions = [
    {
      id: 12,
      name: "Can add vehicle",
      app: "fleet",
      model: "vehicle",
      codename: "add_vehicle"
    },
    {
      id: 13,
      name: "Can change vehicle",
      app: "fleet",
      model: "vehicle",
      codename: "change_vehicle"
    },
    {
      id: 14,
      name: "Can delete vehicle",
      app: "fleet",
      model: "vehicle",
      codename: "delete_vehicle"
    },
    {
      id: 15,
      name: "Can view vehicle",
      app: "fleet",
      model: "vehicle",
      codename: "view_vehicle"
    },
    {
      id: 55,
      name: "Can view trip",
      app: "fleet",
      model: "trip",
      codename: "view_trip"
    },
    {
      id: 56,
      name: "Can add trip",
      app: "fleet",
      model: "trip",
      codename: "add_trip"
    },
    {
      id: 78,
      name: "Can view user",
      app: "users",
      model: "user",
      codename: "view_user"
    },
    {
      id: 79,
      name: "Can change user",
      app: "users",
      model: "user",
      codename: "change_user"
    }
  ];

  const filteredPermissions = mockPermissions.filter((permission) => {
    const matchesSearch = searchTerm
      ? permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.codename.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesApp = appLabelFilter ? permission.app === appLabelFilter : true;
    const matchesModel = modelFilter ? permission.model === modelFilter : true;
    return matchesSearch && matchesApp && matchesModel;
  });

  const handlePermissionSelect = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleAssignToGroup = () => {
    if (selectedPermissions.length === 0) {
      alert("Please select permissions to assign");
      return;
    }
    console.log("Assign permissions to group:", selectedPermissions);
    // TODO: Open modal to select group and assign permissions
  };

  const getAppOptions = () => {
    const apps = [...new Set(mockPermissions.map(p => p.app))];
    return [
      { value: "", label: "All Apps" },
      ...apps.map(app => ({ value: app, label: app }))
    ];
  };

  const getModelOptions = () => {
    const models = [...new Set(mockPermissions.map(p => p.model))];
    return [
      { value: "", label: "All Models" },
      ...models.map(model => ({ value: model, label: model }))
    ];
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
            <p className="text-muted-foreground">
              Manage system permissions and assign them to groups
            </p>
          </div>
          <Button
            label="Assign to Group"
            variant="primary"
            icon={<Users className="h-4 w-4" />}
            onClick={handleAssignToGroup}
            className={selectedPermissions.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
          />
        </div>

        {/* Access Note */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center">
            <Key className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Open via Groups
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Navigate to Groups → [Open Permissions] to access this page with group context
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputGroup
              type="text"
              label="Search"
              placeholder="Search permissions..."
              value={searchTerm}
              handleChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
            <Select
              label="App Label"
              items={getAppOptions()}
              defaultValue={appLabelFilter}
              onChange={(e) => setAppLabelFilter(e.target.value)}
            />
            <Select
              label="Model"
              items={getModelOptions()}
              defaultValue={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Button
              onClick={() => {
                setSearchTerm("");
                setAppLabelFilter("");
                setModelFilter("");
                setSelectedPermissions([]);
              }}
              variant="outlineDark"
              label="Apply"
              icon={<Filter className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Permissions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedPermissions.length === filteredPermissions.length && filteredPermissions.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPermissions(filteredPermissions.map(p => p.id));
                        } else {
                          setSelectedPermissions([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    App
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Codename
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPermissions.map((permission) => (
                  <tr 
                    key={permission.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedPermissions.includes(permission.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handlePermissionSelect(permission.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {permission.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Key className="h-4 w-4 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {permission.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {permission.app}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {permission.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {permission.codename}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPermissions.length === 0 && (
            <div className="text-center py-12">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No permissions found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || appLabelFilter || modelFilter
                  ? "Try adjusting your search criteria"
                  : "No permissions available"
                }
              </p>
            </div>
          )}
          
          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Data source: /permissions/
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              IMPORTANT: POST /groups/{'{gid}'}/permissions/ OVERWRITES group permissions.
              To append, fetch current, union with selected, then POST.
            </p>
          </div>
        </div>

        {/* Selected Permissions Summary */}
        {selectedPermissions.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Key className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Selected Permissions: {selectedPermissions.length}
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {selectedPermissions.map(id => {
                      const perm = mockPermissions.find(p => p.id === id);
                      return perm?.name;
                    }).join(", ")}
                  </p>
                </div>
              </div>
              <Button
                label="Assign to Group"
                variant="primary"
                icon={<Users className="h-4 w-4" />}
                onClick={handleAssignToGroup}
              />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
