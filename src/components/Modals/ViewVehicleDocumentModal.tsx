"use client";

import { useEffect, useState } from "react";
import { useGetVehicleDocumentByIdQuery } from "@/store/api/fleetApi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import { FileText, Download, Calendar, Truck, User, Loader2 } from "lucide-react";

interface ViewVehicleDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number | null;
}

export function ViewVehicleDocumentModal({ isOpen, onClose, documentId }: ViewVehicleDocumentModalProps) {
  const { data: documentData, isLoading, error } = useGetVehicleDocumentByIdQuery(
    documentId?.toString() || "",
    { skip: !documentId }
  );

  const getStatusBadge = (status: boolean) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        status 
          ? "bg-green-100 text-green-800" 
          : "bg-red-100 text-red-800"
      }`}>
        {status ? "Active" : "Inactive"}
      </span>
    );
  };

  const getDocumentTypeLabel = (type: string) => {
    const typeLabels = {
      registration: "Registration",
      insurance: "Insurance",
      battery_test: "Battery Test",
      software: "Software",
      warranty: "Warranty",
      other: "Other",
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const handleDownload = () => {
    if (documentData?.document_file) {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = documentData.document_file;
      link.download = documentData.document_file.split('/').pop() || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="View Vehicle Document"
        size="lg"
      >
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Modal>
    );
  }

  if (error || !documentData) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="View Vehicle Document"
        size="lg"
      >
        <div className="text-center text-red-600 py-8">
          Error loading document data
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="View Vehicle Document"
      size="lg"
    >
      <div className="space-y-6">
        {/* Document Header */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {documentData.document_name || "Vehicle Document"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Document ID: {documentData.id}
            </p>
          </div>
          <div className="ml-auto">
            {getStatusBadge(documentData.is_active)}
          </div>
        </div>

        {/* Document Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Document Type
              </label>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {getDocumentTypeLabel(documentData.document_type)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Document Number
              </label>
              <span className="text-gray-900 dark:text-white">
                {documentData.document_number || "Not specified"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vehicle
              </label>
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {documentData.vehicle?.license_plate || documentData.vehicle?.vin || "Unknown Vehicle"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Issue Date
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {documentData.issue_date 
                    ? new Date(documentData.issue_date).toLocaleDateString()
                    : "Not specified"
                  }
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiry Date
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className={`${
                  documentData.expiry_date && new Date(documentData.expiry_date) < new Date()
                    ? "text-red-600"
                    : "text-gray-900 dark:text-white"
                }`}>
                  {documentData.expiry_date 
                    ? new Date(documentData.expiry_date).toLocaleDateString()
                    : "No expiry"
                  }
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Created
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {documentData.created_at 
                    ? new Date(documentData.created_at).toLocaleDateString()
                    : "Unknown"
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* File Download Section */}
        {documentData.document_file && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Document File
            </h4>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {documentData.document_file.split('/').pop()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Document file
                  </p>
                </div>
              </div>
              <Button
                label="Download"
                variant="outlinePrimary"
                icon={<Download className="h-4 w-4" />}
                onClick={handleDownload}
                size="small"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            label="Close"
            variant="outlineDark"
            onClick={onClose}
          />
        </div>
      </div>
    </Modal>
  );
}
