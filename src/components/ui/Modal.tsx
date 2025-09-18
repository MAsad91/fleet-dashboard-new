"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className,
  size = "md" 
}: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container - Centered */}
      <div className="relative w-full max-h-[90vh] flex items-center justify-center">
        {/* Modal */}
        <div className={cn(
          "relative bg-white dark:bg-gray-dark rounded-lg shadow-2xl w-full max-h-[90vh] flex flex-col mx-auto",
          sizeClasses[size],
          className
        )}>
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Content - Scrollable */}
          <div className="p-6 overflow-y-auto flex-1 min-h-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  return createPortal(modalContent, document.body);
}
