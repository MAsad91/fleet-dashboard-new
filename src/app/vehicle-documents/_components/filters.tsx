"use client";

import { Button } from "@/components/ui-elements/button";
import { Select } from "@/components/FormElements/select";

interface VehicleDocumentFiltersProps {
  vehicles: any[];
  vehicleFilter: string;
  docTypeFilter: string;
  activeFilter: string;
  onVehicleChange: (value: string) => void;
  onDocTypeChange: (value: string) => void;
  onActiveChange: (value: string) => void;
}

export default function VehicleDocumentFilters({
  vehicles,
  vehicleFilter,
  docTypeFilter,
  activeFilter,
  onVehicleChange,
  onDocTypeChange,
  onActiveChange,
}: VehicleDocumentFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          label="Vehicle"
          items={[
            { value: "", label: "All Vehicles" },
            ...(vehicles.map((vehicle: any) => ({
              value: vehicle.id.toString(),
              label: `${vehicle.license_plate || vehicle.vin} - ${vehicle.make} ${vehicle.model}`
            })))
          ]}
          defaultValue={vehicleFilter}
          placeholder="Select vehicle"
          onChange={(e) => onVehicleChange(e.target.value)}
        />

        <Select
          label="Doc Type"
          items={[
            { value: "", label: "All Types" },
            { value: "registration", label: "Registration" },
            { value: "insurance", label: "Insurance" },
            { value: "battery_test", label: "Battery Test" },
            { value: "software", label: "Software" },
            { value: "warranty", label: "Warranty" },
            { value: "other", label: "Other" },
          ]}
          defaultValue={docTypeFilter}
          placeholder="Select type"
          onChange={(e) => onDocTypeChange(e.target.value)}
        />

        <Select
          label="Active"
          items={[
            { value: "", label: "All" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          defaultValue={activeFilter}
          placeholder="Select status"
          onChange={(e) => onActiveChange(e.target.value)}
        />

        <div className="flex items-end">
          <Button
            label="Apply"
            variant="primary"
            size="small"
            onClick={() => {}} // Filters are applied automatically
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
