"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import { Truck, Calendar, Loader2 } from "lucide-react";

interface ViewVehicleTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  typeData?: any;
}

export function ViewVehicleTypeModal({ isOpen, onClose, typeData }: ViewVehicleTypeModalProps) {
  const getCategoryLabel = (category: string) => {
    const categoryLabels = {
      sedan: "Sedan",
      suv: "SUV", 
      truck: "Truck",
      van: "Van",
      motorcycle: "Motorcycle",
      bus: "Bus",
      electric: "Electric Vehicle",
      hybrid: "Hybrid Vehicle",
    };
    return categoryLabels[category as keyof typeof categoryLabels] || category;
  };

  if (!typeData) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="View Vehicle Type"
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
      title="View Vehicle Type"
      size="lg"
    >
      <div className="space-y-6">
        {/* Vehicle Type Header */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Truck className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {typeData.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vehicle Type ID: {typeData.id}
            </p>
          </div>
        </div>

        {/* Vehicle Type Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <span className="text-gray-900 dark:text-white">
                {typeData.name || "Not specified"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <span className="text-gray-900 dark:text-white">
                {getCategoryLabel(typeData.category) || "Not specified"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <span className="text-gray-900 dark:text-white">
                {typeData.description || "No description available"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Speed
              </label>
              <span className="text-gray-900 dark:text-white">
                {typeData.max_speed ? `${typeData.max_speed} km/h` : "Not specified"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Weight
              </label>
              <span className="text-gray-900 dark:text-white">
                {typeData.max_weight ? `${typeData.max_weight} kg` : "Not specified"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fuel Capacity
              </label>
              <span className="text-gray-900 dark:text-white">
                {typeData.fuel_capacity ? `${typeData.fuel_capacity} L` : "Not specified"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Battery Capacity
              </label>
              <span className="text-gray-900 dark:text-white">
                {typeData.battery_capacity ? `${typeData.battery_capacity} kWh` : "Not specified"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Seating Capacity
              </label>
              <span className="text-gray-900 dark:text-white">
                {typeData.seating_capacity ? `${typeData.seating_capacity} seats` : "Not specified"}
              </span>
            </div>
          </div>
        </div>

        {/* Metadata */}
        {typeData.created_at && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Metadata
            </h4>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>
                Created: {new Date(typeData.created_at).toLocaleDateString()}
              </span>
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
