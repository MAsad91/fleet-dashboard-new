"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetVehicleDocumentByIdQuery, useListVehiclesQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Edit, Trash2, FileText, Calendar, Truck, Download, AlertTriangle, CheckCircle } from "lucide-react";
import { ConfirmationModal } from "@/components/Modals/ConfirmationModal";

interface VehicleDocumentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VehicleDocumentDetailPage({ params }: VehicleDocumentDetailPageProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [id, setId] = useState<string>('');
  
  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
    });
  }, [params]);

  const { data: documentData, isLoading, error } = useGetVehicleDocumentByIdQuery(id, {
    skip: !id
  });
  const { data: vehiclesData } = useListVehiclesQuery({});

  const document = documentData;
  const vehicles = vehiclesData?.results || [];

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !document) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="text-center text-red-600">
          <p>Error loading vehicle document</p>
        </div>
      </ProtectedRoute>
    );
  }

  const handleEdit = () => {
    router.push(`/vehicle-documents/${id}/edit`);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    // TODO: Implement delete vehicle document API call
    console.log('Delete vehicle document:', id);
    setIsDeleteModalOpen(false);
    router.push('/vehicle-documents');
  };

  const handleViewVehicle = () => {
    router.push(`/vehicles/${document.vehicle?.id}`);
  };

  const getStatusBadge = () => {
    if (!document.is_active) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          Inactive
        </span>
      );
    }

    if (document.expiry_date) {
      const expiry = new Date(document.expiry_date);
      const today = new Date();
      const daysToExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysToExpiry <= 0) {
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Expired
          </span>
        );
      } else if (daysToExpiry <= 30) {
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            Expires Soon
          </span>
        );
      }
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        Active
      </span>
    );
  };

  const getDaysToExpiry = () => {
    if (!document.expiry_date) return null;
    const expiry = new Date(document.expiry_date);
    const today = new Date();
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysToExpiry = getDaysToExpiry();

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                label=""
                variant="outlineDark"
                icon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => router.back()}
                className="p-2"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Vehicle Document — Detail (#{document.id})
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {document.vehicle?.license_plate} • {document.doc_type} • {document.doc_number || 'No number'}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                label="View Vehicle"
                variant="outlineDark"
                icon={<Truck className="h-4 w-4" />}
                onClick={handleViewVehicle}
              />
              <Button
                label="Edit"
                variant="outlineDark"
                icon={<Edit className="h-4 w-4" />}
                onClick={handleEdit}
              />
              <Button
                label="Delete"
                variant="outlineDark"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              />
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                <div className="mt-2">
                  {getStatusBadge()}
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expires In</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {daysToExpiry !== null ? `${daysToExpiry}d` : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiry Date</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {document.expiry_date ? new Date(document.expiry_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <Calendar className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {document.doc_type || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Document Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Document Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Vehicle ID:</span>
                <span className="text-sm text-gray-900 dark:text-white">{document.vehicle?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Vehicle:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {document.vehicle?.license_plate} - {document.vehicle?.make} {document.vehicle?.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Type:</span>
                <span className="text-sm text-gray-900 dark:text-white">{document.doc_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Number:</span>
                <span className="text-sm text-gray-900 dark:text-white">{document.doc_number || 'N/A'}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Issue Date:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {document.issue_date ? new Date(document.issue_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiry Date:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {document.expiry_date ? new Date(document.expiry_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {document.is_active ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Created:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {document.created_at ? new Date(document.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* File Download Section */}
          {document.doc_file && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Document File</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {document.doc_file.split('/').pop()}
                  </p>
                </div>
                <Button
                  label="Download"
                  variant="outlineDark"
                  icon={<Download className="h-4 w-4" />}
                  onClick={() => {
                    // TODO: Implement file download
                    window.open(document.doc_file, '_blank');
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Vehicle Document"
          message="Are you sure you want to delete this document? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </ProtectedRoute>
  );
}
