"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateVehicleDocumentMutation, useListVehiclesQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, Save, X, Upload, FileText } from "lucide-react";

export default function VehicleDocumentAddPage() {
  const router = useRouter();
  const [createDocument, { isLoading: isCreating }] = useCreateVehicleDocumentMutation();
  const { data: vehiclesData } = useListVehiclesQuery({});

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

  const handleSaveDocument = async () => {
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

      const result = await createDocument(formDataToSend).unwrap();
      router.push('/vehicle-documents');
    } catch (error: any) {
      console.error('Error creating vehicle document:', error);
      
      // Handle validation errors from API
      if (error.data) {
        console.log('Error data:', error.data);
        if (typeof error.data === 'object') {
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
      } else if (error.message) {
        console.log('Error message:', error.message);
        setErrors({ general: error.message });
      } else if (error.status) {
        // Handle HTTP status errors
        let errorMessage = 'An error occurred while creating the document.';
        if (error.status === 415) {
          errorMessage = 'File upload format not supported. Please try a different file type.';
        } else if (error.status === 400) {
          errorMessage = 'Invalid data provided. Please check your inputs.';
        } else if (error.status === 401) {
          errorMessage = 'Authentication required. Please sign in again.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        setErrors({ general: errorMessage });
      } else {
        console.log('Unknown error:', error);
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    }
  };

  const handleCancel = () => {
    router.push('/vehicle-documents');
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'FLEET_USER']}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            label=""
            variant="outlineDark"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.back()}
            className="p-2"
          />
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {/* General Error Display */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}
          
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

            {/* File Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document File
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
              label={isCreating ? "Creating..." : "Create Document"}
              variant="primary"
              icon={<Save className="h-4 w-4" />}
              onClick={isCreating ? undefined : handleSaveDocument}
              className={isCreating ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
