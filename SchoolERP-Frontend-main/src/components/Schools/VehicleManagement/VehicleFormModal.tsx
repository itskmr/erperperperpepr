import React, { useState } from 'react';
import { X, Truck, Calendar, Info, User } from 'lucide-react';
import { VehicleFormModalProps } from './types';
import { formatDateForInput } from '../../../utils/dateUtils';

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  setIsOpen,
  mode,
  vehicleData,
  setVehicleData,
  onSubmit,
  handleInputChange,
  drivers,
}) => {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!(vehicleData as any).vehicleName?.trim()) errors.vehicleName = 'Vehicle name is required';
    if (!(vehicleData as any).driverId) errors.driverId = 'Assigned driver is required';

    // Optional validations (only if values are provided)
    if ((vehicleData as any).capacity && (vehicleData as any).capacity < 0) {
      errors.capacity = 'Capacity cannot be negative';
    }

    if ((vehicleData as any).currentOdometer && (vehicleData as any).currentOdometer < 0) {
      errors.currentOdometer = 'Odometer reading cannot be negative';
    }

    // Date validations (only if dates are provided)
    const today = new Date();
    
    if ((vehicleData as any).purchaseDate) {
      const purchaseDate = new Date((vehicleData as any).purchaseDate);
      if (purchaseDate > today) {
        errors.purchaseDate = 'Purchase date cannot be in the future';
      }
    }

    if ((vehicleData as any).insuranceExpiryDate) {
      const expiryDate = new Date((vehicleData as any).insuranceExpiryDate);
      if (expiryDate <= today) {
        errors.insuranceExpiryDate = 'Insurance expiry date should be in the future';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(e);
    }
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    handleInputChange(e);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {mode === 'add' ? 'Add New Vehicle' : 'Edit Vehicle'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-indigo-500" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vehicle Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Vehicle Name *
                    </label>
                    <input
                      type="text"
                      name="vehicleName"
                      value={(vehicleData as any).vehicleName || ''}
                      onChange={handleFieldChange}
                      required
                      placeholder="Enter vehicle name"
                      className={`mt-1 block w-full border ${formErrors.vehicleName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      aria-invalid={!!formErrors.vehicleName}
                    />
                    {formErrors.vehicleName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.vehicleName}</p>
                    )}
                  </div>

                  {/* Assigned Driver */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Assigned Driver *
                    </label>
                    <select
                      name="driverId"
                      value={(vehicleData as any).driverId || ''}
                      onChange={handleFieldChange}
                      required
                      className={`mt-1 block w-full border ${formErrors.driverId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                      aria-invalid={!!formErrors.driverId}
                    >
                      <option value="">Select Driver</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} - {driver.contactNumber}
                        </option>
                      ))}
                    </select>
                    {formErrors.driverId && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.driverId}</p>
                    )}
                  </div>

                  {/* Registration Number (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={(vehicleData as any).registrationNumber || ''}
                      onChange={handleFieldChange}
                      placeholder="Enter registration number (optional)"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  {/* Model */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Model
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={(vehicleData as any).model || ''}
                      onChange={handleFieldChange}
                      placeholder="Enter vehicle model (optional)"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Capacity (Seats)
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={(vehicleData as any).capacity || ''}
                      onChange={handleFieldChange}
                      min="0"
                      placeholder="Enter seating capacity (optional)"
                      className={`mt-1 block w-full border ${formErrors.capacity ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      aria-invalid={!!formErrors.capacity}
                    />
                    {formErrors.capacity && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.capacity}</p>
                    )}
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fuel Type
                    </label>
                    <select
                      name="fuelType"
                      value={(vehicleData as any).fuelType || ''}
                      onChange={handleFieldChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                    >
                      <option value="">Select Fuel Type</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Petrol">Petrol</option>
                      <option value="CNG">CNG</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="status"
                      value={(vehicleData as any).status || 'ACTIVE'}
                      onChange={handleFieldChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>

                  {/* Current Odometer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Current Odometer (KM)
                    </label>
                    <input
                      type="number"
                      name="currentOdometer"
                      value={(vehicleData as any).currentOdometer || ''}
                      onChange={handleFieldChange}
                      min="0"
                      placeholder="Enter current odometer reading (optional)"
                      className={`mt-1 block w-full border ${formErrors.currentOdometer ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      aria-invalid={!!formErrors.currentOdometer}
                    />
                    {formErrors.currentOdometer && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.currentOdometer}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Important Dates Section */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                  Important Dates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Purchase Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      name="purchaseDate"
                      value={formatDateForInput((vehicleData as any).purchaseDate)}
                      onChange={handleFieldChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  {/* Insurance Expiry Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Insurance Expiry Date
                    </label>
                    <input
                      type="date"
                      name="insuranceExpiryDate"
                      value={formatDateForInput((vehicleData as any).insuranceExpiryDate)}
                      onChange={handleFieldChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  {/* Last Maintenance Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Maintenance Date
                    </label>
                    <input
                      type="date"
                      name="lastMaintenanceDate"
                      value={formatDateForInput((vehicleData as any).lastMaintenanceDate)}
                      onChange={handleFieldChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  {/* Last Inspection Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Inspection Date
                    </label>
                    <input
                      type="date"
                      name="lastInspectionDate"
                      value={formatDateForInput((vehicleData as any).lastInspectionDate)}
                      onChange={handleFieldChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-indigo-500" />
                  Additional Information
                </h3>
                <div>
                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={(vehicleData as any).notes || ''}
                      onChange={handleFieldChange}
                      rows={4}
                      placeholder="Enter any additional notes about the vehicle (optional)"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Form actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Object.keys(formErrors).length > 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mode === 'add' ? 'Add Vehicle' : 'Update Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleFormModal; 