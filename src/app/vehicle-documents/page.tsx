"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useListVehicleDocumentsQuery, useDeleteVehicleDocumentMutation, useBulkDeleteVehicleDocumentsMutation, useListVehiclesQuery } from "@/store/api/fleetApi";
import { useRealtimeEntityUpdates } from "@/hooks/useRealtimeData";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { Plus, Eye, Edit, Trash2, FileText, Calendar, Truck, BarChart3, AlertTriangle, CheckCircle, Search } from "lucide-react";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";
import VehicleDocumentFilters from "./_components/filters";

export default function VehicleDocumentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);

  const { data: documentsData, isLoading, error, refetch } = useListVehicleDocumentsQuery();
  const { data: vehiclesData } = useListVehiclesQuery({});
  const [deleteDocument] = useDeleteVehicleDocumentMutation();
  const [bulkDeleteDocuments] = useBulkDeleteVehicleDocumentsMutation();

  // Enable real-time updates for vehicle documents
  useRealtimeEntityUpdates('vehicle_documents', refetch);

  const documents = documentsData?.results || [];
  const vehicles = vehiclesData?.results || [];

  // Helper function to get vehicle info for a document
  const getVehicleInfo = (document: any) => {
    if (document.vehicle?.license_plate) {
      return document.vehicle.license_plate;
    }
    
    // Fallback: find vehicle by ID in the vehicles list
    const vehicle = vehicles.find((v: any) => v.id === document.vehicle);
    if (vehicle) {
      return vehicle.license_plate || vehicle.vin || 'Unknown';
    }
    
    return 'Unknown';
  };

  // Calculate KPI data
  const totalDocs = documents.length;
  const activeDocs = documents.filter((doc: any) => doc.is_active).length;
  const expiringDocs = documents.filter((doc: any) => {
    if (!doc.expiry_date) return false;
    const expiryDate = new Date(doc.expiry_date);
    const today = new Date();
    const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysToExpiry <= 30 && daysToExpiry > 0;
  }).length;

  const filteredDocuments = documents.filter((document: any) => {
    const matchesSearch = !searchTerm || 
      document.document_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.document_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.vehicle?.vin?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVehicle = !vehicleFilter || document.vehicle?.id.toString() === vehicleFilter;
    const matchesDocType = !docTypeFilter || document.document_type === docTypeFilter;
    const matchesActive = !activeFilter || 
      (activeFilter === "active" && document.is_active) ||
      (activeFilter === "inactive" && !document.is_active);

    return matchesSearch && matchesVehicle && matchesDocType && matchesActive;
  });

  const handleSelectDocument = (documentId: number) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map((doc: any) => doc.id));
    }
  };

  const handleViewDocument = (documentId: number) => {
    router.push(`/vehicle-documents/${documentId}`);
  };

  const handleEditDocument = (documentId: number) => {
    router.push(`/vehicle-documents/${documentId}/edit`);
  };

  const handleDeleteDocument = (documentId: number) => {
    setSelectedDocumentId(documentId);
    setIsDeleteModalOpen(true);
  };

  const handleBulkDelete = () => {
    if (selectedDocuments.length > 0) {
      setIsBulkDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (selectedDocumentId) {
      try {
        await deleteDocument(selectedDocumentId.toString()).unwrap();
        setSelectedDocuments(prev => prev.filter(id => id !== selectedDocumentId));
        setIsDeleteModalOpen(false);
        setSelectedDocumentId(null);
      } catch (error) {
        console.error("Failed to delete document:", error);
      }
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkDeleteDocuments({ ids: selectedDocuments.map(id => id.toString()) }).unwrap();
      setSelectedDocuments([]);
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete documents:", error);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setVehicleFilter("");
    setDocTypeFilter("");
    setActiveFilter("");
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error loading vehicle documents: {"message" in error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vehicle Documents</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              label="+ Create"
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => router.push('/vehicle-documents/add')}
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
                  {totalDocs}
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeDocs}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring ≤30d</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {expiringDocs}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <VehicleDocumentFilters
          vehicles={vehicles}
          vehicleFilter={vehicleFilter}
          docTypeFilter={docTypeFilter}
          activeFilter={activeFilter}
          onVehicleChange={setVehicleFilter}
          onDocTypeChange={setDocTypeFilter}
          onActiveChange={setActiveFilter}
        />

        {/* Documents Table */}
        <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1">
          <div className="p-6 border-b border-stroke dark:border-dark-3">
            <h3 className="text-lg font-semibold">Document List</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredDocuments.length} documents found
            </p>
          </div>
          
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {isLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="p-6 text-red-600">
                Error loading documents
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {documents.length === 0 && (searchTerm || vehicleFilter || docTypeFilter || activeFilter) 
                  ? "No documents found matching your filters." 
                  : "No documents found."
                }
              </div>
            ) : (
              <>
                {/* Bulk Actions */}
                {filteredDocuments.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.length === filteredDocuments.length}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            [Select All]
                          </span>
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {selectedDocuments.length > 0 && (
                          <Button
                            label="[Delete Selected]"
                            variant="outlineDark"
                            onClick={handleBulkDelete}
                            className="text-sm"
                          />
                        )}
                        
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          Page 1/2
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: '1200px' }}>
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
                        Vehicle
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
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-dark divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredDocuments.map((document: any) => (
                      <tr 
                        key={document.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150"
                        onClick={(e) => {
                          // Don't navigate if clicking on checkbox or action buttons
                          const target = e.target as HTMLElement;
                          const isCheckbox = (target as HTMLInputElement).type === 'checkbox' || target.closest('input[type="checkbox"]');
                          const isActionButton = target.closest('button') || target.closest('[role="button"]');
                          
                          if (!isCheckbox && !isActionButton) {
                            router.push(`/vehicle-documents/${document.id}`);
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
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {getVehicleInfo(document)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {document.doc_type || document.document_type || 'Unknown'}
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
                          <span className={`inline-flex items-center ${
                            document.is_active ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {document.is_active ? '✅' : '❌'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      <ConfirmationModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Documents"
        message={`Are you sure you want to delete ${selectedDocuments.length} selected documents? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </ProtectedRoute>
  );
}