"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui-elements/button";
import InputGroup from "@/components/FormElements/InputGroup";
import { 
  useGetDriverByIdQuery, 
  useUpdateDriverMutation 
} from "@/store/api/driversApi";
import { 
  Save, 
  X, 
  User
} from "lucide-react";

interface DriverEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverId: number | null;
}

export function DriverEditModal({ isOpen, onClose, driverId }: DriverEditModalProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    phone_number: "",
    license_number: "",
    license_type: "",
    license_expiry: "",
    date_of_birth: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    hire_date: "",
    status: "active",
    notes: "",
    fleet_operator: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // API hooks
  const { data: driver, isLoading, error } = useGetDriverByIdQuery(driverId?.toString() || "", {
    skip: !driverId || !isOpen
  });
  const [updateDriver, { isLoading: isUpdating }] = useUpdateDriverMutation();

  // Update form data when driver data loads
  useEffect(() => {
    if (driver) {
      setFormData({
        first_name: driver.first_name || "",
        last_name: driver.last_name || "",
        email: driver.email || "",
        phone: driver.phone || "",
        phone_number: driver.phone_number || "",
        license_number: driver.license_number || "",
        license_type: driver.license_type || "",
        license_expiry: driver.license_expiry || "",
        date_of_birth: driver.date_of_birth || "",
        address: driver.address || "",
        city: driver.city || "",
        state: driver.state || "",
        postal_code: driver.postal_code || "",
        country: driver.country || "",
        emergency_contact_name: driver.emergency_contact_name || "",
        emergency_contact_phone: driver.emergency_contact_phone || "",
        hire_date: driver.hire_date || "",
        status: driver.status || "active",
        notes: driver.notes || "",
        fleet_operator: driver.fleet_operator || 1,
      });
    }
  }, [driver]);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    }
    if (!formData.license_number.trim()) {
      newErrors.license_number = "License number is required";
    }
    if (!formData.license_type.trim()) {
      newErrors.license_type = "License type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !driverId) return;

    try {
      // Transform the form data to match API expectations
      const { first_name, last_name, email, ...restFormData } = formData;
      const apiData = {
        ...restFormData,
        // The API expects user data to be nested
        user: {
          first_name,
          last_name,
          email,
        }
      };

      console.log('Sending driver update data:', apiData);

      await updateDriver({
        id: driverId.toString(),
        body: apiData
      }).unwrap();
      
      onClose();
    } catch (error) {
      console.error("Failed to update driver:", error);
      setErrors({ submit: "Failed to update driver. Please try again." });
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen || !driverId) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Driver"
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
      ) : (
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit {formData.first_name} {formData.last_name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Update driver information
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                label="Cancel"
                variant="outlineDark"
                icon={<X className="h-4 w-4" />}
                onClick={handleClose}
              />
              <Button
                label="Save Changes"
                variant="primary"
                icon={<Save className="h-4 w-4" />}
                onClick={handleSave}
                className={isUpdating ? "opacity-50 cursor-not-allowed" : ""}
              />
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup
                label="First Name *"
                type="text"
                name="first_name"
                value={formData.first_name}
                handleChange={handleInputChange}
                placeholder="Enter first name"
                className={errors.first_name ? "border-red-500" : ""}
              />
              
              <InputGroup
                label="Last Name *"
                type="text"
                name="last_name"
                value={formData.last_name}
                handleChange={handleInputChange}
                placeholder="Enter last name"
                className={errors.last_name ? "border-red-500" : ""}
              />
              
              <InputGroup
                label="Email *"
                type="email"
                name="email"
                value={formData.email}
                handleChange={handleInputChange}
                placeholder="Enter email address"
                className={errors.email ? "border-red-500" : ""}
              />
              
              <InputGroup
                label="Phone"
                type="tel"
                name="phone"
                value={formData.phone}
                handleChange={handleInputChange}
                placeholder="Enter phone number"
              />
              
              <InputGroup
                label="Phone Number (API) *"
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                handleChange={handleInputChange}
                placeholder="Enter phone number for API"
                className={errors.phone_number ? "border-red-500" : ""}
              />
              
              <InputGroup
                label="Date of Birth"
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                handleChange={handleInputChange}
                placeholder=""
              />
            </div>
          </div>

          {/* License Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              License Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup
                label="License Number *"
                type="text"
                name="license_number"
                value={formData.license_number}
                handleChange={handleInputChange}
                placeholder="Enter license number"
                className={errors.license_number ? "border-red-500" : ""}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  License Type *
                </label>
                <select
                  name="license_type"
                  value={formData.license_type}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white ${
                    errors.license_type ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <option value="">Select license type</option>
                  <option value="A">Class A</option>
                  <option value="B">Class B</option>
                  <option value="C">Class C</option>
                  <option value="D">Class D</option>
                  <option value="M">Motorcycle</option>
                  <option value="CDL">Commercial Driver&apos;s License</option>
                </select>
                {errors.license_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.license_type}</p>
                )}
              </div>
              
              <InputGroup
                label="License Expiry"
                type="date"
                name="license_expiry"
                value={formData.license_expiry}
                handleChange={handleInputChange}
                placeholder=""
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Address Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <InputGroup
                  label="Address"
                  type="text"
                  name="address"
                  value={formData.address}
                  handleChange={handleInputChange}
                  placeholder="Enter street address"
                />
              </div>
              
              <InputGroup
                label="City"
                type="text"
                name="city"
                value={formData.city}
                handleChange={handleInputChange}
                placeholder="Enter city"
              />
              
              <InputGroup
                label="State"
                type="text"
                name="state"
                value={formData.state}
                handleChange={handleInputChange}
                placeholder="Enter state"
              />
              
              <InputGroup
                label="Postal Code"
                type="text"
                name="postal_code"
                value={formData.postal_code}
                handleChange={handleInputChange}
                placeholder="Enter postal code"
              />
              
              <InputGroup
                label="Country"
                type="text"
                name="country"
                value={formData.country}
                handleChange={handleInputChange}
                placeholder="Enter country"
              />
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Employment Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup
                label="Hire Date"
                type="date"
                name="hire_date"
                value={formData.hire_date}
                handleChange={handleInputChange}
                placeholder=""
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Emergency Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup
                label="Emergency Contact Name"
                type="text"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                handleChange={handleInputChange}
                placeholder="Enter emergency contact name"
              />
              
              <InputGroup
                label="Emergency Contact Phone"
                type="tel"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                handleChange={handleInputChange}
                placeholder="Enter emergency contact phone"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Additional Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                placeholder="Enter additional notes..."
              />
            </div>
          </div>

          {/* Error Messages */}
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
