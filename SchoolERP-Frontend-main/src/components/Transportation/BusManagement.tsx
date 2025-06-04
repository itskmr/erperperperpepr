import React, { useState, useEffect } from 'react';
import {
  Bus,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface BusInfo {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  capacity: number;
  driverName?: string;
  driverContact?: string;
  routeName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  studentsAssigned: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
  createdAt: string;
  updatedAt: string;
}

interface BusFormData {
  registrationNumber: string;
  make: string;
  model: string;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  driverId?: string;
  routeId?: string;
  notes?: string;
}

interface Driver {
  id: string;
  name: string;
  contactNumber: string;
  licenseNumber: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface Route {
  id: string;
  name: string;
  fromLocation: string;
  toLocation: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const BusManagement: React.FC = () => {
  // State
  const [buses, setBuses] = useState<BusInfo[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingBus, setEditingBus] = useState<BusInfo | null>(null);
  const [formData, setFormData] = useState<BusFormData>({
    registrationNumber: '',
    make: '',
    model: '',
    capacity: 0,
    status: 'ACTIVE',
    driverId: '',
    routeId: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // API helper function
  const apiCall = async (endpoint: string, options?: RequestInit) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      }
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return await response.json();
  };

  // Fetch buses
  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/transport/buses');
      if (response.success && response.data) {
        setBuses(response.data);
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
      setError('Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  // Fetch drivers
  const fetchDrivers = async () => {
    try {
      const response = await apiCall('/api/transport/drivers');
      if (response.success && response.data) {
        setDrivers(response.data);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  // Fetch routes
  const fetchRoutes = async () => {
    try {
      const response = await apiCall('/api/transport/routes');
      if (response.success && response.data) {
        setRoutes(response.data);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.make.trim()) {
      errors.make = 'Make is required';
    }

    if (!formData.model.trim()) {
      errors.model = 'Model is required';
    }

    if (formData.capacity <= 0) {
      errors.capacity = 'Capacity must be greater than 0';
    }

    if (formData.registrationNumber.trim() && formData.registrationNumber.length < 3) {
      errors.registrationNumber = 'Registration number must be at least 3 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      const endpoint = editingBus 
        ? `/api/transport/buses/${editingBus.id}`
        : '/api/transport/buses';
      
      const method = editingBus ? 'PUT' : 'POST';
      
      const response = await apiCall(endpoint, {
        method,
        body: JSON.stringify(formData)
      });

      if (response.success) {
        await fetchBuses();
        resetForm();
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error saving bus:', error);
      setError('Failed to save bus');
    } finally {
      setSaving(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      registrationNumber: '',
      make: '',
      model: '',
      capacity: 0,
      status: 'ACTIVE',
      driverId: '',
      routeId: '',
      notes: ''
    });
    setFormErrors({});
    setEditingBus(null);
  };

  // Handle edit
  const handleEdit = (bus: BusInfo) => {
    setFormData({
      registrationNumber: bus.registrationNumber,
      make: bus.make,
      model: bus.model,
      capacity: bus.capacity,
      status: bus.status,
      driverId: '', // This would need to be fetched from the bus details
      routeId: '', // This would need to be fetched from the bus details
      notes: ''
    });
    setEditingBus(bus);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (busId: string) => {
    if (!confirm('Are you sure you want to delete this bus?')) {
      return;
    }

    try {
      const response = await apiCall(`/api/transport/buses/${busId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        await fetchBuses();
      }
    } catch (error) {
      console.error('Error deleting bus:', error);
      setError('Failed to delete bus');
    }
  };

  // Filter buses
  const filteredBuses = buses.filter(bus => {
    const matchesSearch = bus.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bus.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bus.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && bus.status === filterStatus;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4" />;
      case 'INACTIVE': return <XCircle className="h-4 w-4" />;
      case 'MAINTENANCE': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Initialize data
  useEffect(() => {
    fetchBuses();
    fetchDrivers();
    fetchRoutes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <Bus className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Bus Management</h1>
                  <p className="text-blue-100 text-lg">
                    Manage your school bus fleet
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-200 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Bus</span>
                </button>
                <button
                  onClick={fetchBuses}
                  className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-200 flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search buses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div 
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Bus Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingBus ? 'Edit Bus' : 'Add New Bus'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Registration Number
                        </label>
                        <input
                          type="text"
                          name="registrationNumber"
                          value={formData.registrationNumber}
                          onChange={handleInputChange}
                          placeholder="e.g. KA-01-MX-1234"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.registrationNumber ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.registrationNumber && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.registrationNumber}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Make *
                        </label>
                        <input
                          type="text"
                          name="make"
                          value={formData.make}
                          onChange={handleInputChange}
                          placeholder="e.g. Tata, Ashok Leyland"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.make ? 'border-red-300' : 'border-gray-300'
                          }`}
                          required
                        />
                        {formErrors.make && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.make}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Model *
                        </label>
                        <input
                          type="text"
                          name="model"
                          value={formData.model}
                          onChange={handleInputChange}
                          placeholder="e.g. Starbus, Viking"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.model ? 'border-red-300' : 'border-gray-300'
                          }`}
                          required
                        />
                        {formErrors.model && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.model}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Capacity *
                        </label>
                        <input
                          type="number"
                          name="capacity"
                          value={formData.capacity}
                          onChange={handleInputChange}
                          placeholder="Number of seats"
                          min="1"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.capacity ? 'border-red-300' : 'border-gray-300'
                          }`}
                          required
                        />
                        {formErrors.capacity && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.capacity}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="MAINTENANCE">Maintenance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assign Driver
                        </label>
                        <select
                          name="driverId"
                          value={formData.driverId}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Driver</option>
                          {drivers.filter(d => d.status === 'ACTIVE').map(driver => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name} - {driver.contactNumber}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign Route
                      </label>
                      <select
                        name="routeId"
                        value={formData.routeId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Route</option>
                        {routes.filter(r => r.status === 'ACTIVE').map(route => (
                          <option key={route.id} value={route.id}>
                            {route.name} ({route.fromLocation} - {route.toLocation})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Additional notes about the bus..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          resetForm();
                        }}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                      >
                        {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
                        <span>{editingBus ? 'Update' : 'Create'} Bus</span>
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buses List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Buses ({filteredBuses.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading buses...</p>
            </div>
          ) : filteredBuses.length === 0 ? (
            <div className="p-8 text-center">
              <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Buses Found</h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No buses match your search criteria.' 
                  : 'Get started by adding your first bus.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bus Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredBuses.map((bus, index) => (
                      <motion.tr
                        key={bus.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Bus className="h-6 w-6 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {bus.registrationNumber || `${bus.make} ${bus.model}`}
                              </div>
                              <div className="text-sm text-gray-500">
                                {bus.make} {bus.model}
                              </div>
                              {bus.driverName && (
                                <div className="text-xs text-gray-400">
                                  Driver: {bus.driverName}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bus.capacity} seats
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-400" />
                            {bus.studentsAssigned || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bus.status)}`}>
                            {getStatusIcon(bus.status)}
                            <span className="ml-1">{bus.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(bus)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(bus.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusManagement; 