"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger",
  isLoading = false
}: ConfirmationModalProps) {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case "info":
        return <AlertTriangle className="h-6 w-6 text-blue-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
    }
  };

  const getConfirmButtonVariant = () => {
    switch (type) {
      case "danger":
        return "dark" as const;
      case "warning":
        return "green" as const;
      case "info":
        return "primary" as const;
      default:
        return "dark" as const;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="sm"
    >
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {getIcon()}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </p>
        
        <div className="flex gap-3 justify-center">
          <Button
            label={cancelText}
            variant="outlineDark"
            onClick={onClose}
            className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
          />
          <Button
            label={confirmText}
            variant={getConfirmButtonVariant()}
            onClick={onConfirm}
            className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
          />
        </div>
      </div>
    </Modal>
  );
}
