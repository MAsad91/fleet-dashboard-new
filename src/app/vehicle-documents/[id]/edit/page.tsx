"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGetVehicleDocumentByIdQuery, useUpdateVehicleDocumentMutation, useListVehiclesQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Save, X, Upload, FileText, Truck, CheckCircle, AlertTriangle } from "lucide-react";

interface VehicleDocumentEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VehicleDocumentEditPage({ params }: VehicleDocumentEditPageProps) {
  const router = useRouter();
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
  const [updateDocument, { isLoading: isUpdating }] = useUpdateVehicleDocumentMutation();

  const [formData, setFormData] = useState({
    vehicle: '',
    doc_type: '',
    doc_number: '',
    issue_date: '',
    expiry_date: '',
    is_active: true,
    doc_file: null as File | null,
  });

  const [errors, setErrors] = useState<any>({});

  // Helper function to get vehicle ID for a document
  const getVehicleId = useCallback((document: any) => {
    if (document.vehicle?.id) {
      return document.vehicle.id.toString();
    }
    
    // Fallback: find vehicle by ID in the vehicles list
    if (document.vehicle) {
      const vehicle = vehiclesData?.results?.find((v: any) => v.id === document.vehicle);
      if (vehicle) {
        return vehicle.id.toString();
      }
    }
    
    return '';
  }, [vehiclesData]);

  // Populate form when data loads
  useEffect(() => {
    if (documentData) {
      setFormData({
        vehicle: getVehicleId(documentData),
        doc_type: documentData.doc_type || '',
        doc_number: documentData.doc_number || '',
        issue_date: documentData.issue_date || '',
        expiry_date: documentData.expiry_date || '',
        is_active: documentData.is_active ?? true,
        doc_file: null, // Don't pre-populate file
      });
    }
  }, [documentData, vehiclesData, getVehicleId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev: any) => ({
      ...prev,
      doc_file: file
    }));
    
    // Clear error when user selects file
    if (errors.doc_file) {
      setErrors((prev: any) => ({ ...prev, doc_file: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.vehicle?.trim()) newErrors.vehicle = 'Vehicle is required';
    if (!formData.doc_type?.trim()) newErrors.doc_type = 'Document type is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateDocument = async () => {
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('vehicle', formData.vehicle);
      formDataToSend.append('doc_type', formData.doc_type);
      if (formData.doc_number) formDataToSend.append('doc_number', formData.doc_number);
      if (formData.issue_date) formDataToSend.append('issue_date', formData.issue_date);
      if (formData.expiry_date) formDataToSend.append('expiry_date', formData.expiry_date);
      formDataToSend.append('is_active', formData.is_active.toString());
      if (formData.doc_file) formDataToSend.append('doc_file', formData.doc_file);

      const result = await updateDocument({ id: id, body: formDataToSend }).unwrap();
      router.push(`/vehicle-documents/${id}`);
    } catch (error: any) {
      console.error('Error updating vehicle document:', error);
      // Handle validation errors from API
      if (error.data && typeof error.data === 'object') {
        const apiErrors: Record<string, string> = {};
        Object.keys(error.data).forEach(key => {
          if (Array.isArray(error.data[key])) {
            apiErrors[key] = error.data[key][0];
          } else {
            apiErrors[key] = error.data[key];
          }
        });
        setErrors(apiErrors);
      }
    }
  };

  const handleCancel = () => {
    router.push(`/vehicle-documents/${id}`);
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'FLEET_USER']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !documentData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'FLEET_USER']}>
        <div className="text-center text-red-600">
          <p>Error loading vehicle document</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'FLEET_USER']}>
      <div className="space-y-6">
        {/* HEADER: Back Button + Beautiful Title Card */}
        <div className="relative">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              onClick={() => router.back()}
              variant="outlineDark"
              label="Back"
              icon={<ArrowLeft className="h-4 w-4" />}
              className="px-4 py-2 rounded-lg"
            />
          </div>

          {/* Beautiful Title Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-lg border border-blue-200 dark:border-gray-600 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 dark:bg-gray-600 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200 dark:bg-gray-600 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                {/* Left Side - Document Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Edit Vehicle Document
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        #{id} • {documentData?.doc_type || 'Document'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Vehicle</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {documentData?.vehicle?.license_plate || documentData?.vehicle?.vin || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {documentData?.doc_type || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center space-x-2">
                        {documentData?.is_active ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {documentData?.is_active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vehicle *
              </label>
              <select
                name="vehicle"
                value={formData.vehicle}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                  errors.vehicle ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select vehicle</option>
                {vehiclesData?.results?.map((vehicle: any) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.license_plate} - {vehicle.make} {vehicle.model}
                  </option>
                ))}
              </select>
              {errors.vehicle && (
                <p className="mt-1 text-sm text-red-600">{errors.vehicle}</p>
              )}
            </div>

            {/* Document Type */}
            <div className="md:col-span-2">
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
                <option value="">Select document type</option>
                <option value="registration">Registration</option>
                <option value="insurance">Insurance</option>
                <option value="battery_test">Battery Test</option>
                <option value="software">Software</option>
                <option value="warranty">Warranty</option>
                <option value="other">Other</option>
              </select>
              {errors.doc_type && (
                <p className="mt-1 text-sm text-red-600">{errors.doc_type}</p>
              )}
            </div>

            {/* Document Number */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Number
              </label>
              <input
                type="text"
                name="doc_number"
                value={formData.doc_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                placeholder="Enter document number (optional)"
              />
              {errors.doc_number && (
                <p className="mt-1 text-sm text-red-600">{errors.doc_number}</p>
              )}
            </div>

            {/* Issue Date */}
            <div className="md:col-span-1">
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
              {errors.issue_date && (
                <p className="mt-1 text-sm text-red-600">{errors.issue_date}</p>
              )}
            </div>

            {/* Expiry Date */}
            <div className="md:col-span-1">
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
              {errors.expiry_date && (
                <p className="mt-1 text-sm text-red-600">{errors.expiry_date}</p>
              )}
            </div>

            {/* Active Status */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Active
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Document is active
                </label>
              </div>
            </div>

            {/* Current File Info */}
            {documentData.doc_file && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current File
                </label>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {documentData.doc_file.split('/').pop()}
                    </span>
                  </div>
                  <a
                    href={documentData.doc_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-primary-dark"
                  >
                    View Current File
                  </a>
                </div>
              </div>
            )}

            {/* New File Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {documentData.doc_file ? 'Replace File (Optional)' : 'Document File'}
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                <div className="space-y-1 text-center">
                  <div className="flex justify-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  </div>
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="doc_file"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, DOC, DOCX, JPG, PNG up to 10MB
                  </p>
                  {formData.doc_file && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Selected: {formData.doc_file.name}
                    </p>
                  )}
                </div>
              </div>
              {errors.doc_file && (
                <p className="mt-1 text-sm text-red-600">{errors.doc_file}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              label="Cancel"
              variant="outlineDark"
              icon={<X className="h-4 w-4" />}
              onClick={handleCancel}
            />
            <Button
              label={isUpdating ? "Updating..." : "Update Document"}
              variant="primary"
              icon={<Save className="h-4 w-4" />}
              onClick={isUpdating ? undefined : handleUpdateDocument}
              className={isUpdating ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
