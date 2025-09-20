"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false
}: DeleteConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        {/* Warning Icon and Message */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {message}
              </p>
              {itemName && (
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  <strong>Item:</strong> {itemName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Warning Details */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                This action cannot be undone
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>
                  This will permanently delete the item and remove all associated data. 
                  Please make sure you want to proceed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            label="Cancel"
            variant="outlineDark"
            icon={<X className="h-4 w-4" />}
            onClick={onClose}
            disabled={isLoading}
          />
          <Button
            type="button"
            label={isLoading ? "Deleting..." : "Delete"}
            variant="red"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={handleConfirm}
            disabled={isLoading}
          />
        </div>
      </div>
    </Modal>
  );
}
