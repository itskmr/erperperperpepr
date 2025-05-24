import React, { useState, useEffect } from 'react';
import { Trip } from './types';

interface Bus {
  id: number | string;
  registrationNumber: string;
}

interface Route {
  id: number | string;
  name: string;
}

interface Driver {
  id: number | string;
  name: string;
}

interface TripFormProps {
  trip: Trip | null;
  buses: Bus[];
  routes: Route[];
  drivers: Driver[];
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

const TripForm: React.FC<TripFormProps> = ({
  trip,
  buses,
  routes,
  drivers,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().substring(0, 10),
    busId: '',
    routeId: '',
    driverId: '',
    startTime: '',
    startOdometer: '',
    notes: '',
    status: 'SCHEDULED',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with trip data if editing
  useEffect(() => {
    if (trip) {
      setFormData({
        date: trip.date.substring(0, 10), // Format YYYY-MM-DD
        busId: String(trip.busId),
        routeId: String(trip.routeId),
        driverId: String(trip.driverId),
        startTime: trip.startTime,
        startOdometer: String(trip.startOdometer),
        notes: trip.notes || '',
        status: trip.status,
      });
    }
  }, [trip]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.busId) newErrors.busId = 'Bus is required';
    if (!formData.routeId) newErrors.routeId = 'Route is required';
    if (!formData.driverId) newErrors.driverId = 'Driver is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    
    // Odometer must be a positive number
    if (!formData.startOdometer) {
      newErrors.startOdometer = 'Start odometer reading is required';
    } else if (isNaN(Number(formData.startOdometer)) || Number(formData.startOdometer) <= 0) {
      newErrors.startOdometer = 'Must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const submitData = {
      ...formData,
      startOdometer: Number(formData.startOdometer),
    };
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Trip Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${
              errors.date ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
            Start Time *
          </label>
          <input
            type="time"
            id="startTime"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${
              errors.startTime ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.startTime && (
            <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
          )}
        </div>
      </div>
      
      {/* Bus and Route */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="busId" className="block text-sm font-medium text-gray-700 mb-1">
            Bus *
          </label>
          <select
            id="busId"
            name="busId"
            value={formData.busId}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${
              errors.busId ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          >
            <option value="">Select a bus</option>
            {buses.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {bus.registrationNumber}
              </option>
            ))}
          </select>
          {errors.busId && (
            <p className="mt-1 text-sm text-red-600">{errors.busId}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="routeId" className="block text-sm font-medium text-gray-700 mb-1">
            Route *
          </label>
          <select
            id="routeId"
            name="routeId"
            value={formData.routeId}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${
              errors.routeId ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          >
            <option value="">Select a route</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
          </select>
          {errors.routeId && (
            <p className="mt-1 text-sm text-red-600">{errors.routeId}</p>
          )}
        </div>
      </div>
      
      {/* Driver and Odometer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="driverId" className="block text-sm font-medium text-gray-700 mb-1">
            Driver *
          </label>
          <select
            id="driverId"
            name="driverId"
            value={formData.driverId}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${
              errors.driverId ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          >
            <option value="">Select a driver</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </select>
          {errors.driverId && (
            <p className="mt-1 text-sm text-red-600">{errors.driverId}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="startOdometer" className="block text-sm font-medium text-gray-700 mb-1">
            Start Odometer (km) *
          </label>
          <input
            type="number"
            id="startOdometer"
            name="startOdometer"
            value={formData.startOdometer}
            onChange={handleChange}
            placeholder="Enter current odometer reading"
            className={`block w-full px-3 py-2 border ${
              errors.startOdometer ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.startOdometer && (
            <p className="mt-1 text-sm text-red-600">{errors.startOdometer}</p>
          )}
        </div>
      </div>
      
      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          value={formData.notes}
          onChange={handleChange}
          placeholder="Enter any additional notes about this trip..."
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      
      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {trip ? 'Update Trip' : 'Create Trip'}
        </button>
      </div>
    </form>
  );
};

export default TripForm; 