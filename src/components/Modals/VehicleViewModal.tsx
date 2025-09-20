"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import { 
  useGetVehicleByIdQuery
} from "@/store/api/fleetApi";
import { 
  Car, 
  Calendar,
  Fuel,
  Battery,
  Gauge,
  Wrench,
  MapPin,
  DollarSign,
  FileText
} from "lucide-react";

interface VehicleViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number | null;
  onEdit: (vehicleId: number) => void;
}

export function VehicleViewModal({ isOpen, onClose, vehicleId, onEdit }: VehicleViewModalProps) {
  const [vehicleData, setVehicleData] = useState<any>(null);

  // API hooks
  const { data: vehicle, isLoading, error } = useGetVehicleByIdQuery(vehicleId?.toString() || "", {
    skip: !vehicleId || !isOpen
  });

  // Update vehicle data when loaded
  useEffect(() => {
    if (vehicle) {
      // The API returns vehicle data nested under 'vehicle' property
      setVehicleData(vehicle.vehicle || vehicle);
    }
  }, [vehicle]);

  const handleClose = () => {
    onClose();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", label: "Available" },
      in_service: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", label: "In Service" },
      maintenance: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", label: "Maintenance" },
      retired: { className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", label: "Retired" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { className: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400", label: status || "Unknown" };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getVehicleTypeLabel = (type: string) => {
    // API returns vehicle_type as category string directly
    return type || "Unknown";
  };

  const getFuelTypeLabel = (fuelType: string) => {
    const fuelMap: Record<string, string> = {
      "gasoline": "Gasoline",
      "diesel": "Diesel", 
      "electric": "Electric",
      "hybrid": "Hybrid",
      "lpg": "LPG",
      "cng": "CNG"
    };
    return fuelMap[fuelType] || fuelType;
  };

  const getHealthBadge = (healthStatus: string) => {
    const healthConfig = {
      Good: { className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", label: "Good" },
      Warning: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", label: "Warning" },
      Critical: { className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", label: "Critical" },
    };
    const config = healthConfig[healthStatus as keyof typeof healthConfig] || { className: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400", label: healthStatus || "Unknown" };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (!isOpen || !vehicleId) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Vehicle Details"
        size="xl"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load vehicle details</p>
          </div>
        ) : vehicleData ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {vehicleData.license_plate || "Vehicle"}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {vehicleData.make} {vehicleData.model} ({vehicleData.year})
                </p>
              </div>
              
            </div>

            {/* Vehicle Information Card */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">License Plate</label>
                    <p className="text-gray-900 dark:text-white font-medium">{vehicleData.license_plate || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">VIN</label>
                    <p className="text-gray-900 dark:text-white font-medium">{vehicleData.vin || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Make & Model</label>
                    <p className="text-gray-900 dark:text-white font-medium">{vehicleData.make} {vehicleData.model}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Year</label>
                    <p className="text-gray-900 dark:text-white font-medium">{vehicleData.year || "—"}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Color</label>
                    <p className="text-gray-900 dark:text-white font-medium">{vehicleData.color || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle Type</label>
                    <p className="text-gray-900 dark:text-white font-medium">{getVehicleTypeLabel(vehicleData.vehicle_type)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Health Status</label>
                    <div className="mt-1">{getHealthBadge(vehicleData.health_status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Fuel Type</label>
                    <p className="text-gray-900 dark:text-white font-medium">{getFuelTypeLabel(vehicleData.fuel_type)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                    <div className="mt-1">{getStatusBadge(vehicleData.status)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Battery Information Card */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Battery className="h-5 w-5" />
                Battery Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Battery Capacity</label>
                  <p className="text-gray-900 dark:text-white font-medium">{vehicleData.battery_capacity_kwh ? `${vehicleData.battery_capacity_kwh} kWh` : "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Battery Level</label>
                  <p className="text-gray-900 dark:text-white font-medium">{vehicleData.current_battery_level ? `${vehicleData.current_battery_level}%` : "—"}</p>
                </div>
              </div>
            </div>

            {/* Performance Information Card */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Performance Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Mileage</label>
                  <p className="text-gray-900 dark:text-white font-medium">{vehicleData.mileage_km ? `${vehicleData.mileage_km.toLocaleString()} km` : "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Efficiency</label>
                  <p className="text-gray-900 dark:text-white font-medium">{vehicleData.efficiency_km_per_kwh ? `${vehicleData.efficiency_km_per_kwh} km/kWh` : "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Seating Capacity</label>
                  <p className="text-gray-900 dark:text-white font-medium">{vehicleData.seating_capacity || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Transmission Type</label>
                  <p className="text-gray-900 dark:text-white font-medium">{vehicleData.transmission_type || "—"}</p>
                </div>
              </div>
            </div>

            {/* Warranty Information Card */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Warranty Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Warranty Expiry Date</label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {vehicleData.warranty_expiry_date ? new Date(vehicleData.warranty_expiry_date).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {vehicleData.created_at ? new Date(vehicleData.created_at).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* System Information Card */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                System Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Alerts Enabled</label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {vehicleData.alerts_enabled ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">OTA Enabled</label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {vehicleData.ota_enabled ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Online Status</label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {vehicleData.online_status ? "Online" : "Offline"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Speed (kph)</label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {vehicleData.speed_kph ? `${vehicleData.speed_kph} km/h` : "—"}
                  </p>
                </div>
              </div>
            </div>

          </div>
        ) : null}
      </Modal>

    </>
  );
}
