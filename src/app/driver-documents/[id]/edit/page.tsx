"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetDriverDocumentByIdQuery, useGetDriversQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, FileText } from "lucide-react";

export default function EditDriverDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const { data: documentData, isLoading: documentLoading, error: documentError } = useGetDriverDocumentByIdQuery(documentId);
  const { data: driversData } = useGetDriversQuery({ page: 1, limit: 1000 });

  const [formData, setFormData] = useState({
    driver: '',
    doc_type: '',
    doc_number: '',
    issue_date: '',
    expiry_date: '',
    is_active: true,
    doc_file: null as File | null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (documentData) {
      setFormData({
        driver: documentData.driver?.toString() || '',
        doc_type: documentData.doc_type || documentData.document_type || '',
        doc_number: documentData.doc_number || documentData.document_number || '',
        issue_date: documentData.issue_date ? documentData.issue_date.split('T')[0] : '',
        expiry_date: documentData.expiry_date ? documentData.expiry_date.split('T')[0] : '',
        is_active: documentData.is_active !== undefined ? documentData.is_active : true,
        doc_file: null
      });
    }
  }, [documentData]);

  if (documentLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (documentError || !documentData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="text-center text-red-600">
          <p>Failed to load driver document details. Please try again.</p>
          <Button 
            onClick={() => router.back()} 
            variant="primary" 
            label="Back to Driver Documents"
            className="mt-4"
          />
        </div>
      </ProtectedRoute>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      doc_file: file
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.driver) {
      newErrors.driver = 'Driver is required';
    }
    if (!formData.doc_type) {
      newErrors.doc_type = 'Document type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // TODO: Implement update driver document API call
      console.log('Updating driver document:', formData);
      
      // For now, just navigate back
      router.push(`/driver-documents/${documentId}`);
    } catch (error) {
      console.error('Failed to update driver document:', error);
    }
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => router.back()}
            variant="outlineDark"
            label="Back"
            icon={<ArrowLeft className="h-4 w-4" />}
            className="px-4 py-2 rounded-lg"
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Driver Document</h1>
            <p className="text-muted-foreground">
              Edit driver document details
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Driver Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Driver *
                </label>
                <select
                  name="driver"
                  value={formData.driver}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                    errors.driver ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <option value="">Select Driver</option>
                  {driversData?.results?.map((driver: any) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name || driver.full_name || driver.username || `Driver #${driver.id}`}
                    </option>
                  ))}
                </select>
                {errors.driver && (
                  <p className="mt-1 text-sm text-red-600">{errors.driver}</p>
                )}
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Type *
                </label>
                <select
                  name="doc_type"
                  value={formData.doc_type}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                    errors.doc_type ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <option value="">Select Type</option>
                  <option value="license">License</option>
                  <option value="insurance">Insurance</option>
                  <option value="medical">Medical</option>
                  <option value="training">Training</option>
                  <option value="background">Background</option>
                  <option value="other">Other</option>
                </select>
                {errors.doc_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.doc_type}</p>
                )}
              </div>

              {/* Document Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Number
                </label>
                <input
                  type="text"
                  name="doc_number"
                  value={formData.doc_number}
                  onChange={handleInputChange}
                  placeholder="Enter document number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Issue Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Issue Date
                </label>
                <input
                  type="date"
                  name="issue_date"
                  value={formData.issue_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document File
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
                {documentData.doc_file && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Current file: {documentData.doc_file}
                  </p>
                )}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Active
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                label="Cancel"
                variant="outlineDark"
                onClick={() => router.back()}
                className="px-6 py-2"
              />
              <Button
                label="Save"
                variant="primary"
                onClick={handleSubmit}
                className="px-6 py-2"
              />
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
