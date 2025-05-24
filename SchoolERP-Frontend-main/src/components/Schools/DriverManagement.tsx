import React, { useState, useEffect } from 'react';
import { useTransport } from '../../contexts/TransportContext.jsx';
import { Plus, Edit, Trash2, Search, User, Phone, Calendar, MapPin } from 'lucide-react';

// Define Driver interface
interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  contactNumber: string;
  address?: string;
  experience: number;
  joiningDate: string;
  isActive: boolean;
  photo?: string;
}

const DriverManagement: React.FC = () => {
  const {
    drivers,
    buses,
    fetchDrivers,
    addDriver,
    updateDriver,
    deleteDriver,
    loading,
    error
  } = useTransport();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [driverStatusFilter, setDriverStatusFilter] = useState('');
  
  // Load drivers on component mount
  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);
  
  // Filter drivers based on search query and status filter
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.contactNumber.includes(searchQuery);
    
    const matchesStatusFilter = 
      driverStatusFilter === '' || 
      (driverStatusFilter === 'active' && driver.isActive) ||
      (driverStatusFilter === 'inactive' && !driver.isActive);
    
    return matchesSearch && matchesStatusFilter;
  });

  const handleAddDriver = async (formData: Omit<Driver, 'id'>) => {
    await addDriver(formData);
    setIsAddModalOpen(false);
  };

  const handleEditDriver = async (id: string, formData: Partial<Driver>) => {
    await updateDriver(id, formData);
    setIsEditModalOpen(false);
  };

  const handleDeleteDriver = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      await deleteDriver(id);
    }
  };

  // Get assigned bus for a driver
  const getAssignedBus = (driverId: string) => {
    return buses.find(bus => bus.driverId === driverId);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Driver Management</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search drivers by name, license number, or contact"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="ml-4">
            <select 
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              defaultValue=""
              onChange={(e) => setDriverStatusFilter(e.target.value)}
            >
              <option value="">All Drivers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      {/* Driver list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner"></div>
            <p className="mt-2 text-sm text-gray-500">Loading drivers...</p>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-500">No drivers found. Add a new driver to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredDrivers.map((driver) => {
              const assignedBus = getAssignedBus(driver.id);
              
              return (
                <li key={driver.id}>
                  <div className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                            {driver.photo ? (
                              <img src={driver.photo} alt={driver.name} className="h-12 w-12 rounded-full" />
                            ) : (
                              <User className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                            <div className="text-sm text-gray-500">License: {driver.licenseNumber}</div>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${driver.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {driver.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button 
                            onClick={() => {
                              setSelectedDriver(driver);
                              setIsEditModalOpen(true);
                            }}
                            className="ml-3 text-gray-500 hover:text-indigo-600"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteDriver(driver.id)}
                            className="ml-3 text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex space-x-6">
                          <p className="flex items-center text-sm text-gray-500">
                            <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {driver.contactNumber}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {driver.experience} years experience • Joined {formatDate(driver.joiningDate)}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {driver.address || 'No address provided'}
                        </div>
                      </div>
                      {assignedBus && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-indigo-600">
                            Assigned to bus: {assignedBus.registrationNumber} ({assignedBus.make} {assignedBus.model})
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
      {/* Add Driver Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Add New Driver</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <DriverForm onSubmit={handleAddDriver} onCancel={() => setIsAddModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Driver Modal */}
      {isEditModalOpen && selectedDriver && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Edit Driver</h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <DriverForm driver={selectedDriver} onSubmit={(data) => handleEditDriver(selectedDriver.id, data)} onCancel={() => setIsEditModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface DriverFormProps {
  driver?: Driver;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const DriverForm: React.FC<DriverFormProps> = ({ driver, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: driver?.name || '',
    licenseNumber: driver?.licenseNumber || '',
    contactNumber: driver?.contactNumber || '',
    address: driver?.address || '',
    experience: driver?.experience || 0,
    joiningDate: driver?.joiningDate ? new Date(driver.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    isActive: driver?.isActive ?? true
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : type === 'number' 
          ? Number(value) 
          : value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
          License Number
        </label>
        <input
          type="text"
          name="licenseNumber"
          id="licenseNumber"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.licenseNumber}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
          Contact Number
        </label>
        <input
          type="text"
          name="contactNumber"
          id="contactNumber"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.contactNumber}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <textarea
          name="address"
          id="address"
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.address}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
          Years of Experience
        </label>
        <input
          type="number"
          name="experience"
          id="experience"
          min="0"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.experience}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="joiningDate" className="block text-sm font-medium text-gray-700">
          Joining Date
        </label>
        <input
          type="date"
          name="joiningDate"
          id="joiningDate"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.joiningDate}
          onChange={handleChange}
        />
      </div>
      
      <div className="flex items-center">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          checked={formData.isActive}
          onChange={handleChange}
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
          Active
        </label>
      </div>
      
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {driver ? 'Update Driver' : 'Add Driver'}
        </button>
      </div>
    </form>
  );
};

export default DriverManagement; 