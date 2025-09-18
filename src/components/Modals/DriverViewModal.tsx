"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import { 
  useGetDriverByIdQuery
} from "@/store/api/driversApi";
import { 
  User, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  IdCard,
  Shield,
  Clock
} from "lucide-react";

interface DriverViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverId: number | null;
  onEdit: (driverId: number) => void;
}

export function DriverViewModal({ isOpen, onClose, driverId, onEdit }: DriverViewModalProps) {
  const [driverData, setDriverData] = useState<any>(null);

  // API hooks
  const { data: driver, isLoading, error } = useGetDriverByIdQuery(driverId?.toString() || "", {
    skip: !driverId || !isOpen
  });

  // Update driver data when loaded
  useEffect(() => {
    if (driver) {
      setDriverData(driver);
    }
  }, [driver]);

  const handleClose = () => {
    onClose();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", label: "Active" },
      inactive: { className: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400", label: "Inactive" },
      suspended: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", label: "Suspended" },
      terminated: { className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", label: "Terminated" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getLicenseTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      "A": "Class A",
      "B": "Class B", 
      "C": "Class C",
      "D": "Class D",
      "M": "Motorcycle",
      "CDL": "Commercial Driver&apos;s License"
    };
    return typeMap[type] || type;
  };

  if (!isOpen || !driverId) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Driver Details"
        size="xl"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load driver details</p>
          </div>
        ) : driverData ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {driverData.user?.first_name} {driverData.user?.last_name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {driverData.user?.email}
                </p>
              </div>
              
            </div>

            {/* Personal Information Card */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                    <p className="text-gray-900 dark:text-white font-medium">{driverData.user?.first_name} {driverData.user?.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                    <p className="text-gray-900 dark:text-white font-medium">{driverData.user?.email || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                    <p className="text-gray-900 dark:text-white font-medium">{driverData.phone || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</label>
                    <p className="text-gray-900 dark:text-white font-medium">{driverData.phone_number || "—"}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {driverData.date_of_birth ? new Date(driverData.date_of_birth).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                    <div className="mt-1">{getStatusBadge(driverData.status)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* License Information Card */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IdCard className="h-5 w-5" />
                License Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">License Number</label>
                    <p className="text-gray-900 dark:text-white font-medium">{driverData.license_number || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">License Type</label>
                    <p className="text-gray-900 dark:text-white font-medium">{getLicenseTypeLabel(driverData.license_type)}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">License Expiry</label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {driverData.license_expiry ? new Date(driverData.license_expiry).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information Card */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                  <p className="text-gray-900 dark:text-white font-medium">{driverData.address || "—"}</p>
                </div>
              </div>
            </div>

            {/* Employment Information Card */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Employment Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date Joined</label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {driverData.date_joined ? new Date(driverData.date_joined).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience (Years)</label>
                  <p className="text-gray-900 dark:text-white font-medium">{driverData.experience_years || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</label>
                  <p className="text-gray-900 dark:text-white font-medium">{driverData.rating || "—"}</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact Card */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Emergency Contact
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Emergency Contact</label>
                  <p className="text-gray-900 dark:text-white font-medium">{driverData.emergency_contact || "—"}</p>
                </div>
              </div>
            </div>

            {/* Notes Card */}
            {driverData.notes && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Additional Notes
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{driverData.notes}</p>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

    </>
  );
}
