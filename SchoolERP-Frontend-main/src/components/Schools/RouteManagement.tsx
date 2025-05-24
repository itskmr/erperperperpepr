import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, AlertTriangle, MapPin, Clock, Bus } from 'lucide-react';
import { toast } from 'react-hot-toast';
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

const RouteForm: React.FC<RouteFormProps> = ({
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

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, isSubmitting = false }) => {
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

const RouteManagement: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch routes and buses data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch routes and buses in parallel
        const [routesResponse, busesResponse] = await Promise.all([
          transportService.route.getAllRoutes(),
          transportService.bus.getAllBuses()
        ]);

        if (!routesResponse.success) {
          throw new Error(routesResponse.error || 'Failed to fetch routes');
        }

        setRoutes(routesResponse.data || []);
        setBuses(busesResponse.success ? busesResponse.data : []);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter routes based on search query
  const filteredRoutes = routes.filter(route => {
    return route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.startLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.endLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (route.description && route.description.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const handleAddRoute = async (formData: Omit<Route, 'id'>) => {
    try {
      setIsSubmitting(true);
      // Debug log to see what data is being sent to API
      console.log('Sending to API:', formData);
      
      const response = await transportService.route.createRoute(formData);

      if (!response.success) {
        throw new Error(response.error || 'Failed to add route');
      }

      // Update routes list with the newly created route
      setRoutes(prev => [...prev, response.data]);
      toast.success('Route added successfully');
      setIsAddModalOpen(false);
    } catch (error: any) {
      console.error('Error adding route:', error);
      toast.error(error.message || 'Failed to add route');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRoute = async (formData: Partial<Route>) => {
    if (!selectedRoute) return;

    try {
      setIsSubmitting(true);
      // Debug log to see what data is being sent to API
      console.log('Sending to API:', formData);
      
      const response = await transportService.route.updateRoute(selectedRoute.id, formData);

      if (!response.success) {
        throw new Error(response.error || 'Failed to update route');
      }

      // Update routes list with the updated route
      setRoutes(prev => prev.map(route =>
        route.id === selectedRoute.id ? response.data : route
      ));

      toast.success('Route updated successfully');
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error('Error updating route:', error);
      toast.error(error.message || 'Failed to update route');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (route: Route) => {
    setSelectedRoute(route);
    setIsEditModalOpen(true);
  };

  const handleDeleteRoute = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        setIsSubmitting(true);
        const response = await transportService.route.deleteRoute(id);

        if (!response.success) {
          throw new Error(response.error || 'Failed to delete route');
        }

        // Remove the deleted route from the list
        setRoutes(prev => prev.filter(route => route.id !== id));
        toast.success('Route deleted successfully');
      } catch (error: any) {
        console.error('Error deleting route:', error);
        toast.error(error.message || 'Failed to delete route');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Refresh routes
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await transportService.route.getAllRoutes();

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch routes');
      }

      setRoutes(response.data || []);
      toast.success('Routes refreshed successfully');
    } catch (error: any) {
      console.error('Error refreshing routes:', error);
      setError(error.message || 'Failed to refresh routes');
    } finally {
      setLoading(false);
    }
  };

  // Format time display
  const formatTime = (minutes: number) => {
    if (!minutes) return 'N/A';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins} mins`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Route Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading || isSubmitting}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Route
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search routes by name, start location, or end location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Routes list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner h-10 w-10 mx-auto border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-500">Loading routes...</p>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-500">No routes found. Add a new route to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance/Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Bus
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRoutes.map((route) => {
                  const assignedBus = buses.find(b => b.id === route.busId);

                  return (
                    <tr key={route.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{route.name}</div>
                        {route.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{route.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <span><strong>From:</strong> {route.startLocation}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <span><strong>To:</strong> {route.endLocation}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {formatTime(route.estimatedTime)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {route.distance ? `${route.distance} km` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {assignedBus ? (
                          <div className="flex items-center text-sm text-gray-900">
                            <Bus className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {assignedBus.registrationNumber}
                          </div>
                        ) : (
                          <span className="text-sm text-yellow-600">No bus assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(route)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            disabled={isSubmitting}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRoute(route.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            disabled={isSubmitting}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Route Modal with improved component */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Add New Route"
        isSubmitting={isSubmitting}
      >
        <RouteForm
          onSubmit={handleAddRoute}
          onCancel={() => setIsAddModalOpen(false)}
          isSubmitting={isSubmitting}
          buses={buses}
        />
      </Modal>

      {/* Edit Route Modal with improved component */}
      <Modal
        isOpen={isEditModalOpen && selectedRoute !== null}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Route - ${selectedRoute?.name}`}
        isSubmitting={isSubmitting}
      >
        {selectedRoute && (
          <RouteForm
            route={selectedRoute}
            onSubmit={handleEditRoute}
            onCancel={() => setIsEditModalOpen(false)}
            isSubmitting={isSubmitting}
            buses={buses}
          />
        )}
      </Modal>
    </div>
  );
};

export default RouteManagement; 