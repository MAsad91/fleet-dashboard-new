"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import { AlertTriangle, X } from "lucide-react";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

export function ErrorModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = "OK"
}: ErrorModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="sm"
    >
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </p>
        
        <div className="flex justify-center">
          <Button
            label={buttonText}
            variant="primary"
            onClick={onClose}
            className="px-8"
          />
        </div>
      </div>
    </Modal>
  );
}
