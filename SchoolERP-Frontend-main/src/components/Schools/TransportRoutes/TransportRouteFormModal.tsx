import React, { useState } from 'react';
import { X, MapPin, Route, Truck, User } from 'lucide-react';
import { TransportRouteFormModalProps } from './types';

const TransportRouteFormModal: React.FC<TransportRouteFormModalProps> = ({
  isOpen,
  setIsOpen,
  mode,
  routeData,
  setRouteData,
  onSubmit,
  handleInputChange,
  vehicles,
  drivers,
}) => {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!(routeData as any).name) errors.name = 'Route name is required';
    if (!(routeData as any).fromLocation) errors.fromLocation = 'From location is required';
    if (!(routeData as any).toLocation) errors.toLocation = 'To location is required';

    // Validate numeric fields
    if ((routeData as any).distance && (routeData as any).distance < 0) {
      errors.distance = 'Distance cannot be negative';
    }

    if ((routeData as any).estimatedTime && (routeData as any).estimatedTime < 0) {
      errors.estimatedTime = 'Estimated time cannot be negative';
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
                {mode === 'add' ? 'Add New Transport Route' : 'Edit Transport Route'}
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
              {/* Route Information Section */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <Route className="h-5 w-5 mr-2 text-indigo-500" />
                  Route Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Route Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Route Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={(routeData as any).name || ''}
                      onChange={handleFieldChange}
                      required
                      placeholder="Enter route name"
                      className={`mt-1 block w-full border ${formErrors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      aria-invalid={!!formErrors.name}
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  {/* From Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      From Location *
                    </label>
                    <input
                      type="text"
                      name="fromLocation"
                      value={(routeData as any).fromLocation || ''}
                      onChange={handleFieldChange}
                      required
                      placeholder="Enter starting location"
                      className={`mt-1 block w-full border ${formErrors.fromLocation ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      aria-invalid={!!formErrors.fromLocation}
                    />
                    {formErrors.fromLocation && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.fromLocation}</p>
                    )}
                  </div>

                  {/* To Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      To Location *
                    </label>
                    <input
                      type="text"
                      name="toLocation"
                      value={(routeData as any).toLocation || ''}
                      onChange={handleFieldChange}
                      required
                      placeholder="Enter destination location"
                      className={`mt-1 block w-full border ${formErrors.toLocation ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      aria-invalid={!!formErrors.toLocation}
                    />
                    {formErrors.toLocation && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.toLocation}</p>
                    )}
                  </div>

                  {/* Distance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Distance (km)
                    </label>
                    <input
                      type="number"
                      name="distance"
                      value={(routeData as any).distance || ''}
                      onChange={handleFieldChange}
                      min="0"
                      step="0.1"
                      placeholder="Enter route distance"
                      className={`mt-1 block w-full border ${formErrors.distance ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      aria-invalid={!!formErrors.distance}
                    />
                    {formErrors.distance && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.distance}</p>
                    )}
                  </div>

                  {/* Estimated Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Estimated Time (minutes)
                    </label>
                    <input
                      type="number"
                      name="estimatedTime"
                      value={(routeData as any).estimatedTime || ''}
                      onChange={handleFieldChange}
                      min="0"
                      placeholder="Enter estimated travel time"
                      className={`mt-1 block w-full border ${formErrors.estimatedTime ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      aria-invalid={!!formErrors.estimatedTime}
                    />
                    {formErrors.estimatedTime && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.estimatedTime}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="isActive"
                      value={(routeData as any).isActive ? 'true' : 'false'}
                      onChange={(e) => handleFieldChange({
                        ...e,
                        target: {
                          ...e.target,
                          name: 'isActive',
                          value: e.target.value === 'true'
                        }
                      } as any)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={(routeData as any).description || ''}
                      onChange={handleFieldChange}
                      rows={3}
                      placeholder="Enter route description (optional)"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle & Driver Assignment Section */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-indigo-500" />
                  Vehicle & Driver Assignment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Assigned Vehicle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Assigned Vehicle
                    </label>
                    <select
                      name="vehicleId"
                      value={(routeData as any).vehicleId || ''}
                      onChange={handleFieldChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                    >
                      <option value="">Select Vehicle (Optional)</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.vehicleName} {vehicle.registrationNumber ? `(${vehicle.registrationNumber})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Assigned Driver */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Assigned Driver
                    </label>
                    <select
                      name="driverId"
                      value={(routeData as any).driverId || ''}
                      onChange={handleFieldChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                    >
                      <option value="">Select Driver (Optional)</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} - {driver.contactNumber}
                        </option>
                      ))}
                    </select>
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
                  {mode === 'add' ? 'Add Route' : 'Update Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportRouteFormModal; 