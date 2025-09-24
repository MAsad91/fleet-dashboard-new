"use client";

import { useState } from "react";
import { useCreateVehicleDocumentMutation, useListVehiclesQuery } from "@/store/api/fleetApi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { Select } from "@/components/FormElements/select";
import { FileText, Loader2 } from "lucide-react";

interface AddVehicleDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddVehicleDocumentModal({ isOpen, onClose, onSuccess }: AddVehicleDocumentModalProps) {
  const [createDocument, { isLoading }] = useCreateVehicleDocumentMutation();
  const { data: vehiclesData, isLoading: vehiclesLoading } = useListVehiclesQuery({});
  
  const [formData, setFormData] = useState({
    vehicle: "",
    document_type: "",
    document_number: "",
    issue_date: "",
    expiry_date: "",
    is_active: true,
    document_file: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      document_file: file
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicle) {
      newErrors.vehicle = "Vehicle is required";
    }
    if (!formData.document_type) {
      newErrors.document_type = "Document type is required";
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
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('vehicle', formData.vehicle);
      formDataToSend.append('document_type', formData.document_type);
      formDataToSend.append('document_number', formData.document_number);
      if (formData.issue_date) {
        formDataToSend.append('issue_date', formData.issue_date);
      }
      if (formData.expiry_date) {
        formDataToSend.append('expiry_date', formData.expiry_date);
      }
      formDataToSend.append('is_active', formData.is_active.toString());
      
      if (formData.document_file) {
        formDataToSend.append('document_file', formData.document_file);
      }

      const result = await createDocument(formDataToSend).unwrap();
      console.log('Document created successfully:', result);
      
      // Call success callback to refresh the documents list
      onSuccess?.();
      
      // Reset form and close modal
      setFormData({
        vehicle: "",
        document_type: "",
        document_number: "",
        issue_date: "",
        expiry_date: "",
        is_active: true,
        document_file: null,
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Failed to create document:", error);
      setErrors({ submit: "Failed to create document. Please try again." });
    }
  };

  const documentTypes = [
    { value: "registration", label: "Registration" },
    { value: "insurance", label: "Insurance" },
    { value: "battery_test", label: "Battery Test" },
    { value: "software", label: "Software" },
    { value: "warranty", label: "Warranty" },
    { value: "other", label: "Other" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Vehicle Document"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vehicle *
            </label>
            <select
              name="vehicle"
              value={formData.vehicle}
              onChange={handleInputChange}
              disabled={vehiclesLoading}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                errors.vehicle ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              } ${vehiclesLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <option value="">
                {vehiclesLoading ? "Loading vehicles..." : "Select vehicle"}
              </option>
              {vehiclesData?.results?.map((vehicle: any) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.license_plate} - {vehicle.make} {vehicle.model}
                </option>
              ))}
            </select>
            {errors.vehicle && (
              <p className="text-red-500 text-sm mt-1">{errors.vehicle}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Document Type *
            </label>
            <select
              name="document_type"
              value={formData.document_type}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                errors.document_type ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <option value="">Select document type</option>
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.document_type && (
              <p className="text-red-500 text-sm mt-1">{errors.document_type}</p>
            )}
          </div>

          <InputGroup
            label="Document Number"
            type="text"
            name="document_number"
            value={formData.document_number}
            handleChange={handleInputChange}
            placeholder="Enter document number (optional)"
          />

          <InputGroup
            label="Issue Date"
            type="date"
            name="issue_date"
            value={formData.issue_date}
            handleChange={handleInputChange}
            placeholder="Select issue date"
          />

          <InputGroup
            label="Expiry Date"
            type="date"
            name="expiry_date"
            value={formData.expiry_date}
            handleChange={handleInputChange}
            placeholder="Select expiry date"
          />

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Document File
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX, JPG, PNG up to 10MB
              </p>
              {formData.document_file && (
                <p className="text-sm text-green-600">
                  Selected: {formData.document_file.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            label="Cancel"
            variant="outlineDark"
            onClick={isLoading ? undefined : onClose}
            className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
          />
          <Button
            label={isLoading ? "Creating..." : "Create Document"}
            variant="primary"
            onClick={isLoading ? undefined : undefined}
            className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
            icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
          />
        </div>
      </form>
    </Modal>
  );
}
