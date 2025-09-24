"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import { Loader2 } from "lucide-react";

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data?: any;
  fields?: Array<{
    label: string;
    key: string;
    type?: 'text' | 'date' | 'currency' | 'status' | 'badge';
    format?: (value: any) => string;
  }>;
}

export function ViewModal({ isOpen, onClose, title, data, fields = [] }: ViewModalProps) {
  const formatValue = (field: any, value: any) => {
    if (!value && value !== 0) return "Not specified";
    
    if (field.format) {
      return field.format(value);
    }
    
    switch (field.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'currency':
        return `$${value?.toLocaleString()}`;
      case 'status':
        return value ? 'Active' : 'Inactive';
      case 'badge':
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'active' ? 'bg-green-100 text-green-800' :
            value === 'inactive' ? 'bg-red-100 text-red-800' :
            value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {value}
          </span>
        );
      default:
        return value?.toString();
    }
  };

  if (!data) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        size="lg"
      >
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
    >
      <div className="space-y-6">
        {/* Data Header */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.name || data.title || data.phone_number || data.policy_number || `ID: ${data.id}`}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {title} Details
            </p>
          </div>
        </div>

        {/* Data Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {field.label}
              </label>
              <div className="text-gray-900 dark:text-white">
                {formatValue(field, data[field.key])}
              </div>
            </div>
          ))}
        </div>

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
