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
            <p className="text-muted-foreground">
              Manage vehicle documents and certifications
            </p>
          </div>
          <Button
            label="Add Document"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => router.push('/vehicle-documents/add')}
          />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Documents</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Documents</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {expiringDocs}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalDocs > 0 ? Math.round((activeDocs / totalDocs) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputGroup
              label="Search"
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              handleChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4 text-gray-400" />}
              iconPosition="left"
            />
            
            <Select
              label="Vehicle"
              items={[
                { value: "", label: "All Vehicles" },
                ...(vehicles.map((vehicle: any) => ({
                  value: vehicle.id.toString(),
                  label: `${vehicle.vin} - ${vehicle.license_plate}`
                })))
              ]}
              defaultValue={vehicleFilter}
              placeholder="Select vehicle"
              onChange={(e) => setVehicleFilter(e.target.value)}
            />

            <Select
              label="Document Type"
              items={[
                { value: "", label: "All Types" },
                { value: "registration", label: "Registration" },
                { value: "insurance", label: "Insurance" },
                { value: "inspection", label: "Inspection" },
                { value: "permit", label: "Permit" },
                { value: "other", label: "Other" },
              ]}
              defaultValue={docTypeFilter}
              placeholder="Select type"
              onChange={(e) => setDocTypeFilter(e.target.value)}
            />

            <Select
              label="Status"
              items={[
                { value: "", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              defaultValue={activeFilter}
              placeholder="Select status"
              onChange={(e) => setActiveFilter(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end mt-4">
            <Button
              label="Clear Filters"
              variant="outlineDark"
              size="small"
              onClick={clearFilters}
            />
          </div>
        </div>

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
                            Select All ({selectedDocuments.length} selected)
                          </span>
                        </label>
                      </div>
                      
                      {selectedDocuments.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Button
                            label="Delete Selected"
                            variant="outlineDark"
                            onClick={handleBulkDelete}
                            className="text-sm"
                          />
                        </div>
                      )}
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
                        Document
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Expiry Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-dark divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredDocuments.map((document: any) => (
                      <tr key={document.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.includes(document.id)}
                            onChange={() => handleSelectDocument(document.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {document.document_name || 'Unnamed Document'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {document.document_number || 'No number'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                              <Truck className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {document.vehicle?.vin || 'Unknown Vehicle'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {document.vehicle?.license_plate || 'No plate'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            {document.document_type || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            document.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {document.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {document.expiry_date ? new Date(document.expiry_date).toLocaleDateString() : 'No expiry'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              label=""
                              variant="outlineDark"
                              size="small"
                              icon={<Eye className="h-4 w-4" />}
                              onClick={() => handleViewDocument(document.id)}
                            />
                            <Button
                              label=""
                              variant="outlineDark"
                              size="small"
                              icon={<Edit className="h-4 w-4" />}
                              onClick={() => handleEditDocument(document.id)}
                            />
                            <Button
                              label=""
                              variant="outlineDark"
                              size="small"
                              icon={<Trash2 className="h-4 w-4" />}
                              onClick={() => handleDeleteDocument(document.id)}
                            />
                          </div>
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