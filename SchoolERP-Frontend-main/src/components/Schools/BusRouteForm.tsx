import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MapPin, Clock, Bus } from 'lucide-react';
import transportService from '../../services/transportService';

// Define interfaces for API data
interface Route {
  id: string;
  name: string;
  description?: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  estimatedTime: number;
  busId?: string;
  bus?: Bus;
}

interface Bus {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  capacity: number;
  status: string;
}

// Route Form component
interface RouteFormProps {
  route?: Route;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  buses: Bus[];
}

const BusRouteForm: React.FC<RouteFormProps> = ({
  route,
  onSubmit,
  onCancel,
  isSubmitting = false,
  buses
}) => {
  const [formData, setFormData] = useState({
    name: route?.name || '',
    description: route?.description || '',
    startLocation: route?.startLocation || '',
    endLocation: route?.endLocation || '',
    distance: route?.distance || '',
    estimatedTime: route?.estimatedTime || '',
    busId: route?.busId || ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    // Handle numeric values
    if (type === 'number') {
      const numericValue = value === '' ? '' : Number(value);
      setFormData({
        ...formData,
        [name]: numericValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!formData.name) errors.name = 'Route name is required';
    if (!formData.startLocation) errors.startLocation = 'Start location is required';
    if (!formData.endLocation) errors.endLocation = 'End location is required';

    // Validate numeric fields
    if (formData.distance && (isNaN(Number(formData.distance)) || Number(formData.distance) < 0)) {
      errors.distance = 'Distance must be a positive number';
    }

    if (formData.estimatedTime && (isNaN(Number(formData.estimatedTime)) || Number(formData.estimatedTime) < 0)) {
      errors.estimatedTime = 'Estimated time must be a positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Convert numeric strings to numbers for API
      const apiData = {
        ...formData,
        distance: formData.distance ? parseFloat(formData.distance as string) : 0,
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime as string) : 0
      };
      
      onSubmit(apiData);
    } else {
      toast.error('Please fix the errors in the form');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Route information section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-indigo-500" />
          Route Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Route Name *
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="e.g. North Route"
              required
              className={`mt-1 block w-full border ${formErrors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={formData.name}
              onChange={handleChange}
              aria-invalid={!!formErrors.name}
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              placeholder="Brief description of the route"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="startLocation" className="block text-sm font-medium text-gray-700">
              Start Location *
            </label>
            <input
              type="text"
              name="startLocation"
              id="startLocation"
              placeholder="e.g. Main Campus"
              required
              className={`mt-1 block w-full border ${formErrors.startLocation ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={formData.startLocation}
              onChange={handleChange}
              aria-invalid={!!formErrors.startLocation}
            />
            {formErrors.startLocation && (
              <p className="mt-1 text-sm text-red-600">{formErrors.startLocation}</p>
            )}
          </div>

          <div>
            <label htmlFor="endLocation" className="block text-sm font-medium text-gray-700">
              End Location *
            </label>
            <input
              type="text"
              name="endLocation"
              id="endLocation"
              placeholder="e.g. North Colony"
              required
              className={`mt-1 block w-full border ${formErrors.endLocation ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={formData.endLocation}
              onChange={handleChange}
              aria-invalid={!!formErrors.endLocation}
            />
            {formErrors.endLocation && (
              <p className="mt-1 text-sm text-red-600">{formErrors.endLocation}</p>
            )}
          </div>

          <div>
            <label htmlFor="distance" className="block text-sm font-medium text-gray-700">
              Distance (km)
            </label>
            <input
              type="number"
              name="distance"
              id="distance"
              min="0"
              step="0.1"
              placeholder="e.g. 12.5"
              className={`mt-1 block w-full border ${formErrors.distance ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={formData.distance}
              onChange={handleChange}
              aria-invalid={!!formErrors.distance}
            />
            {formErrors.distance && (
              <p className="mt-1 text-sm text-red-600">{formErrors.distance}</p>
            )}
          </div>

          <div>
            <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700">
              Estimated Time (minutes)
            </label>
            <input
              type="number"
              name="estimatedTime"
              id="estimatedTime"
              min="0"
              placeholder="e.g. 45"
              className={`mt-1 block w-full border ${formErrors.estimatedTime ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={formData.estimatedTime}
              onChange={handleChange}
              aria-invalid={!!formErrors.estimatedTime}
            />
            {formErrors.estimatedTime && (
              <p className="mt-1 text-sm text-red-600">{formErrors.estimatedTime}</p>
            )}
          </div>

          <div>
            <label htmlFor="busId" className="block text-sm font-medium text-gray-700">
              Assigned Bus
            </label>
            <select
              id="busId"
              name="busId"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.busId}
              onChange={handleChange}
            >
              <option value="">-- None --</option>
              {buses.filter(b => b.status === 'ACTIVE').map(bus => (
                <option key={bus.id} value={bus.id}>
                  {bus.registrationNumber} - {bus.make} {bus.model}
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
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || Object.keys(formErrors).length > 0}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {route ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            route ? 'Update Route' : 'Add Route'
          )}
        </button>
      </div>
    </form>
  );
};

// Modal component for better reusability
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isSubmitting?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, isSubmitting = false }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto" 
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
      onClick={(e) => {
        // Close modal when clicking outside content area
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        
        {/* This element centers the modal contents */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900" id="modal-title">{title}</h3>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
                aria-label="Close"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
          </div>
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusRouteForm; 