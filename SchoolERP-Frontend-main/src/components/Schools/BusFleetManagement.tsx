import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, AlertTriangle, Calendar, Truck, User, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import transportService from '../../services/transportService';

// Define Bus interface based on API structure
interface Bus {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  capacity: number;
  fuelType: string;
  purchaseDate?: string;
  insuranceExpiryDate?: string;
  driverId?: string;
  routeId?: string;
  status: string;
}

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  contactNumber: string;
  isActive: boolean;
}

interface Route {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
}

// Bus Form component
interface BusFormProps {
  bus?: Bus;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  drivers: Driver[];
  routes: Route[];
}

const BusForm: React.FC<BusFormProps> = ({ 
  bus, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  drivers,
  routes
}) => {
  const [formData, setFormData] = useState({
    registrationNumber: bus?.registrationNumber || '',
    make: bus?.make || '',
    model: bus?.model || '',
    capacity: bus?.capacity || '',
    fuelType: bus?.fuelType || 'Diesel',
    purchaseDate: bus?.purchaseDate ? new Date(bus.purchaseDate).toISOString().substr(0, 10) : '',
    insuranceExpiryDate: bus?.insuranceExpiryDate ? new Date(bus.insuranceExpiryDate).toISOString().substr(0, 10) : '',
    driverId: bus?.driverId || '',
    routeId: bus?.routeId || '',
    status: bus?.status || 'ACTIVE'
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
    if (!formData.registrationNumber) errors.registrationNumber = 'Registration number is required';
    if (!formData.make) errors.make = 'Make is required';
    if (!formData.model) errors.model = 'Model is required';
    if (!formData.capacity) errors.capacity = 'Seating capacity is required';
    
    // Validate capacity is a positive number
    if (formData.capacity && Number(formData.capacity) <= 0) {
      errors.capacity = 'Capacity must be greater than 0';
    }
    
    // Validate dates
    if (formData.purchaseDate && formData.insuranceExpiryDate) {
      const purchaseDate = new Date(formData.purchaseDate);
      const insuranceExpiryDate = new Date(formData.insuranceExpiryDate);
      
      if (insuranceExpiryDate < purchaseDate) {
        errors.insuranceExpiryDate = 'Insurance expiry date cannot be before purchase date';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    } else {
      toast.error('Please fix the errors in the form');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic information section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Truck className="h-5 w-5 mr-2 text-indigo-500" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
              Registration Number *
            </label>
            <input
              type="text"
              name="registrationNumber"
              id="registrationNumber"
              placeholder="e.g. KA-01-MX-1234"
              required
              className={`mt-1 block w-full border ${formErrors.registrationNumber ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={formData.registrationNumber}
              onChange={handleChange}
              aria-invalid={!!formErrors.registrationNumber}
            />
            {formErrors.registrationNumber && (
              <p className="mt-1 text-sm text-red-600">{formErrors.registrationNumber}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">Active</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="make" className="block text-sm font-medium text-gray-700">
              Make *
            </label>
            <input
              type="text"
              name="make"
              id="make"
              placeholder="e.g. Tata Motors"
              required
              className={`mt-1 block w-full border ${formErrors.make ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={formData.make}
              onChange={handleChange}
              aria-invalid={!!formErrors.make}
            />
            {formErrors.make && (
              <p className="mt-1 text-sm text-red-600">{formErrors.make}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">
              Model *
            </label>
            <input
              type="text"
              name="model"
              id="model"
              placeholder="e.g. Starbus"
              required
              className={`mt-1 block w-full border ${formErrors.model ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={formData.model}
              onChange={handleChange}
              aria-invalid={!!formErrors.model}
            />
            {formErrors.model && (
              <p className="mt-1 text-sm text-red-600">{formErrors.model}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
              Seating Capacity *
            </label>
            <input
              type="number"
              name="capacity"
              id="capacity"
              min="1"
              placeholder="e.g. 42"
              required
              className={`mt-1 block w-full border ${formErrors.capacity ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={formData.capacity}
              onChange={handleChange}
              aria-invalid={!!formErrors.capacity}
            />
            {formErrors.capacity && (
              <p className="mt-1 text-sm text-red-600">{formErrors.capacity}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700">
              Fuel Type
            </label>
            <select
              id="fuelType"
              name="fuelType"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.fuelType}
              onChange={handleChange}
            >
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="CNG">CNG</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchaseDate"
              id="purchaseDate"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.purchaseDate}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="insuranceExpiryDate" className="block text-sm font-medium text-gray-700">
              Insurance Expiry Date
            </label>
            <input
              type="date"
              name="insuranceExpiryDate"
              id="insuranceExpiryDate"
              className={`mt-1 block w-full border ${formErrors.insuranceExpiryDate ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              value={formData.insuranceExpiryDate}
              onChange={handleChange}
              aria-invalid={!!formErrors.insuranceExpiryDate}
            />
            {formErrors.insuranceExpiryDate && (
              <p className="mt-1 text-sm text-red-600">{formErrors.insuranceExpiryDate}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Assignments section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-indigo-500" />
          Assignments
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="driverId" className="block text-sm font-medium text-gray-700">
              Assigned Driver
            </label>
            <select
              id="driverId"
              name="driverId"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.driverId}
              onChange={handleChange}
            >
              <option value="">-- None --</option>
              {drivers.filter(d => d.isActive).map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="routeId" className="block text-sm font-medium text-gray-700">
              Assigned Route
            </label>
            <select
              id="routeId"
              name="routeId"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.routeId}
              onChange={handleChange}
            >
              <option value="">-- None --</option>
              {routes.map(route => (
                <option key={route.id} value={route.id}>
                  {route.name}
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
              {bus ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            bus ? 'Update Bus' : 'Add Bus'
          )}
        </button>
      </div>
    </form>
  );
};

const BusFleetManagement: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Fetch buses, drivers, and routes data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch buses, drivers, and routes in parallel
        const [busesResponse, driversResponse, routesResponse] = await Promise.all([
          transportService.bus.getAllBuses(),
          transportService.driver.getAllDrivers(),
          transportService.route.getAllRoutes()
        ]);
        
        if (!busesResponse.success) {
          throw new Error(busesResponse.error || 'Failed to fetch buses');
        }
        
        setBuses(busesResponse.data || []);
        setDrivers(driversResponse.success ? driversResponse.data : []);
        setRoutes(routesResponse.success ? routesResponse.data : []);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter buses based on search query and status
  const filteredBuses = buses.filter(bus => {
    const matchesSearch = 
      bus.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bus.status && bus.status.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter ? (bus.status === statusFilter) : true;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleAddBus = async (formData: Omit<Bus, 'id'>) => {
    try {
      setIsSubmitting(true);
      const response = await transportService.bus.createBus(formData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to add bus');
      }
      
      // Update buses list with the newly created bus
      setBuses(prev => [...prev, response.data]);
      toast.success('Bus added successfully');
      setIsAddModalOpen(false);
    } catch (error: any) {
      console.error('Error adding bus:', error);
      toast.error(error.message || 'Failed to add bus');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditBus = async (formData: Partial<Bus>) => {
    if (!selectedBus) return;
    
    try {
      setIsSubmitting(true);
      const response = await transportService.bus.updateBus(selectedBus.id, formData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update bus');
      }
      
      // Update buses list with the updated bus
      setBuses(prev => prev.map(bus => 
        bus.id === selectedBus.id ? response.data : bus
      ));
      
      toast.success('Bus updated successfully');
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error('Error updating bus:', error);
      toast.error(error.message || 'Failed to update bus');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteBus = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        setIsSubmitting(true);
        const response = await transportService.bus.deleteBus(id);
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to delete bus');
        }
        
        // Remove the deleted bus from the list
        setBuses(prev => prev.filter(bus => bus.id !== id));
        toast.success('Bus deleted successfully');
      } catch (error: any) {
        console.error('Error deleting bus:', error);
        toast.error(error.message || 'Failed to delete bus');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Refresh buses
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await transportService.bus.getAllBuses();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch buses');
      }
      
      setBuses(response.data || []);
      toast.success('Buses refreshed successfully');
    } catch (error: any) {
      console.error('Error refreshing buses:', error);
      setError(error.message || 'Failed to refresh buses');
    } finally {
      setLoading(false);
    }
  };
  
  // Bus status badge styling
  const getStatusBadgeColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format status display
  const formatStatus = (status: string) => {
    if (!status) return '';
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Bus Fleet Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading || isSubmitting}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Bus
          </button>
        </div>
      </div>
      
      {/* Search and filter bar */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search buses by registration, make, model, or status"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="ml-4">
            <select 
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>
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
      
      {/* Bus list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner h-10 w-10 mx-auto border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-500">Loading buses...</p>
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-500">No buses found. Add a new bus to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bus Information
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBuses.map((bus) => {
                  const assignedDriver = drivers.find(d => d.id === bus.driverId);
                  const assignedRoute = routes.find(r => r.id === bus.routeId);
                  
                  return (
                    <tr key={bus.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {bus.registrationNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {bus.make} {bus.model}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{bus.capacity} seats</div>
                        <div className="text-sm text-gray-500">{bus.fuelType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(bus.status)}`}>
                          {formatStatus(bus.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignedDriver ? assignedDriver.name : 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignedRoute ? assignedRoute.name : 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedBus(bus);
                              setIsEditModalOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                            disabled={isSubmitting}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteBus(bus.id)}
                            className="text-red-600 hover:text-red-900"
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
      
      {/* Add Bus Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Add New Bus</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                  disabled={isSubmitting}
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <BusForm 
                onSubmit={handleAddBus} 
                onCancel={() => setIsAddModalOpen(false)}
                isSubmitting={isSubmitting}
                drivers={drivers}
                routes={routes}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Bus Modal */}
      {isEditModalOpen && selectedBus && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Edit Bus - {selectedBus.registrationNumber}</h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                  disabled={isSubmitting}
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <BusForm 
                bus={selectedBus}
                onSubmit={handleEditBus} 
                onCancel={() => setIsEditModalOpen(false)}
                isSubmitting={isSubmitting}
                drivers={drivers}
                routes={routes}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusFleetManagement;