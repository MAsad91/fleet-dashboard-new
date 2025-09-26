"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetDriverDocumentsQuery, useCreateDriverDocumentMutation, useUpdateDriverDocumentMutation, useDeleteDriverDocumentMutation, useGetDriversQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Plus, Eye, Edit, Trash2, FileText, Calendar, User } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";

export default function DriverDocumentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: documentsData, isLoading, error, refetch } = useGetDriverDocumentsQuery();
  const { data: driversData } = useGetDriversQuery({ page: 1, limit: 1000 }); // Get all drivers for filter
  const [createDocument] = useCreateDriverDocumentMutation();
  const [updateDocument] = useUpdateDriverDocumentMutation();
  const [deleteDocument] = useDeleteDriverDocumentMutation();

  const documents = documentsData?.results || [];

  const filteredDocuments = documents.filter((document: any) => {
    const matchesSearch = document.document_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.doc_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDriver = !driverFilter || document.driver?.id?.toString() === driverFilter;
    const matchesDocType = !docTypeFilter || document.doc_type === docTypeFilter;
    const matchesActive = !activeFilter || 
      (activeFilter === 'active' && (document.is_active === true || document.status === 'active')) ||
      (activeFilter === 'inactive' && (document.is_active === false || document.status !== 'active'));
    return matchesSearch && matchesDriver && matchesDocType && matchesActive;
  });

  const handleAddDocument = () => {
    setIsAddModalOpen(true);
  };

  const handleViewDocument = (documentId: number) => {
    setSelectedDocumentId(documentId);
    setIsViewModalOpen(true);
  };

  const handleEditDocument = (documentId: number) => {
    setSelectedDocumentId(documentId);
    setIsEditModalOpen(true);
  };

  const handleDeleteDocument = (documentId: number) => {
    setSelectedDocumentId(documentId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedDocumentId) {
      try {
        await deleteDocument(selectedDocumentId.toString()).unwrap();
        await refetch();
        setIsDeleteModalOpen(false);
        setSelectedDocumentId(null);
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map((doc: any) => doc.id));
    }
  };

  const handleSelectDocument = (documentId: number) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.length === 0) return;
    
    try {
      await Promise.all(
        selectedDocuments.map(id => deleteDocument(id.toString()).unwrap())
      );
      setSelectedDocuments([]);
      refetch();
    } catch (error) {
      console.error('Failed to delete documents:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { className: "bg-green-100 text-green-800", label: "Active" },
      expired: { className: "bg-red-100 text-red-800", label: "Expired" },
      pending: { className: "bg-yellow-100 text-yellow-800", label: "Pending" },
      suspended: { className: "bg-gray-100 text-gray-800", label: "Suspended" },
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
          <p>Error loading driver documents</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Driver Documents</h1>
          </div>
          <div className="flex space-x-2">
            <Button
              label="Create"
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => router.push('/driver-documents/add')}
            />
            <Button
              label="Bulk ▼"
              variant="outlineDark"
              onClick={() => {}} // TODO: Add bulk actions dropdown
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Docs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {documents.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Docs</p>
                <p className="text-2xl font-bold text-green-600">
                  {documents.filter((doc: any) => doc.is_active === true || doc.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring ≤30d</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(() => {
                    const thirtyDaysFromNow = new Date();
                    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                    
                    return documents.filter((doc: any) => {
                      if (!doc.expiry_date) return false;
                      const expiryDate = new Date(doc.expiry_date);
                      return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
                    }).length;
                  })()}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Driver
              </label>
              <select
                value={driverFilter}
                onChange={(e) => setDriverFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Drivers</option>
                {driversData?.results?.map((driver: any) => (
                  <option key={driver.id} value={driver.id.toString()}>
                    {driver.name || driver.full_name || driver.username || `Driver #${driver.id}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Doc Type
              </label>
              <select
                value={docTypeFilter}
                onChange={(e) => setDocTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="license">License</option>
                <option value="insurance">Insurance</option>
                <option value="medical">Medical</option>
                <option value="training">Training</option>
                <option value="background">Background</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Active
              </label>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              label="Apply"
              variant="primary"
              size="small"
              onClick={() => {}} // Filters are applied automatically
            />
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-6 border-b border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold">Driver Documents List</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredDocuments.length} documents found
            </p>
          </div>
          
          {/* Bulk Actions */}
          {filteredDocuments.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    label="Select All"
                    variant="outlineDark"
                    size="small"
                    onClick={handleSelectAll}
                    className="text-sm"
                  />
                  {selectedDocuments.length > 0 && (
                    <Button
                      label="Delete Selected"
                      variant="outlineDark"
                      size="small"
                      onClick={handleBulkDelete}
                      className="text-sm text-red-600 hover:text-red-700"
                    />
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Page 1/1
                </div>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.length === filteredDocuments.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDocuments.map((document: any) => (
                  <tr 
                    key={document.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150"
                    onClick={(e) => {
                      // Don't navigate if clicking on checkbox or action buttons
                      const target = e.target as HTMLElement;
                      const isCheckbox = (target as HTMLInputElement).type === 'checkbox' || target.closest('input[type="checkbox"]');
                      const isButton = target.closest('button');
                      
                      if (!isCheckbox && !isButton) {
                        router.push(`/driver-documents/${document.id}`);
                      }
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(document.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectDocument(document.id);
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {document.driver?.name || document.driver?.full_name || document.driver?.username || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {document.doc_type || document.document_type || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {document.doc_number || document.document_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {document.issue_date ? new Date(document.issue_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {document.expiry_date ? new Date(document.expiry_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        document.is_active === true || document.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {document.is_active === true || document.status === 'active' ? '✅' : '❌'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          label="View"
                          variant="outlineDark"
                          size="small"
                          icon={<Eye className="h-4 w-4" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/driver-documents/${document.id}`);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No documents found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || driverFilter || docTypeFilter || activeFilter
                  ? "Try adjusting your search criteria"
                  : "Get started by adding a new document"
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
          title="Delete Document"
          message="Are you sure you want to delete this document? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </ProtectedRoute>
  );
}
