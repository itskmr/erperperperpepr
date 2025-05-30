import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Download, FileText, Route } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { TransportRoute, AddTransportRouteFormData } from './types';
import TransportRouteTable from './TransportRouteTable';
import TransportRouteSearchFilter from './TransportRouteSearchFilter';
import TransportRoutePagination from './TransportRoutePagination';
import TransportRouteFormModal from './TransportRouteFormModal';
import TransportRouteProfileModal from './TransportRouteProfileModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TransportRoutes: React.FC = () => {
  // State management
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [vehicles, setVehicles] = useState<Array<{ id: string; vehicleName: string; registrationNumber?: string }>>([]);
  const [drivers, setDrivers] = useState<Array<{ id: string; name: string; contactNumber: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newRoute, setNewRoute] = useState<AddTransportRouteFormData>({
    name: '',
    fromLocation: '',
    toLocation: '',
    description: '',
    distance: 0,
    estimatedTime: 0,
    vehicleId: '',
    driverId: '',
    isActive: true
  });
  const [editRoute, setEditRoute] = useState<Partial<TransportRoute>>({});
  const itemsPerPage = 5;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<TransportRoute | null>(null);

  // Fetch routes from API
  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/transport/routes`);
      
      if (response.data && response.data.success) {
        // The backend now returns properly formatted data with vehicle and driver info
        const transformedRoutes = (response.data.data || []).map((route: any) => {
          return {
            ...route,
            fromLocation: route.startLocation || route.fromLocation,
            toLocation: route.endLocation || route.toLocation,
            vehicleId: route.busId || route.vehicleId,
            // The vehicle and driver info is now provided directly by the backend
            vehicle: route.vehicle || null,
            driver: route.driver || null,
            isActive: route.isActive !== undefined ? route.isActive : true
          };
        });
        
        setRoutes(transformedRoutes);
        setError(null);
      } else {
        setError('Failed to fetch transport routes');
      }
    } catch (error: unknown) {
      console.error('Error fetching routes:', error);
      setError(`Failed to fetch routes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch vehicles for dropdown
  const fetchVehicles = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/transport/buses`);
      
      if (response.data && response.data.success) {
        // Transform backend data to frontend format
        const transformedVehicles = (response.data.data || []).map((vehicle: any) => ({
          id: vehicle.id,
          vehicleName: vehicle.make || vehicle.vehicleName,
          registrationNumber: vehicle.registrationNumber,
          ...vehicle
        }));
        setVehicles(transformedVehicles);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  }, []);

  // Fetch drivers for dropdown
  const fetchDrivers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/transport/drivers`);
      
      if (response.data && response.data.success) {
        setDrivers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchRoutes();
    fetchVehicles();
    fetchDrivers();
  }, [fetchRoutes, fetchVehicles, fetchDrivers]);

  // Filtered routes based on search and status filter
  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.fromLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.toLocation?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || 
      (statusFilter === 'active' && route.isActive) ||
      (statusFilter === 'inactive' && !route.isActive);

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRoutes = filteredRoutes.slice(indexOfFirstItem, indexOfLastItem);

  // Show toast notification
  const showToast = (type: 'success' | 'error', message: string) => {
    toast[type](message, {
      duration: 3000,
      style: {
        background: type === 'success' ? '#2563EB' : '#EF4444',
        color: '#ffffff',
        padding: '16px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: type === 'success' ? '#2563EB' : '#EF4444',
      },
    });
  };

  // Handle viewing a route's profile
  const handleViewProfile = async (route: TransportRoute) => {
    try {
      const response = await axios.get(`${API_URL}/transport/routes/${route.id}`);
      
      if (response.data.success) {
        // The backend now returns properly formatted data with vehicle and driver info
        const transformedRoute = {
          ...response.data.data,
          fromLocation: response.data.data.startLocation || response.data.data.fromLocation,
          toLocation: response.data.data.endLocation || response.data.data.toLocation,
          vehicleId: response.data.data.busId || response.data.data.vehicleId,
          // Vehicle and driver info is now provided directly by the backend
          vehicle: response.data.data.vehicle || null,
          driver: response.data.data.driver || null
        };
        
        setSelectedRoute(transformedRoute);
        setIsProfileOpen(true);
      } else {
        showToast('error', 'Failed to fetch route details');
      }
    } catch (error) {
      console.error('Error fetching route details:', error);
      showToast('error', 'Failed to fetch route details');
    }
  };

  // Handle editing a route
  const handleEditRoute = async (route: TransportRoute) => {
    try {
      const response = await axios.get(`${API_URL}/transport/routes/${route.id}`);
      
      if (response.data.success) {
        // The backend now returns properly formatted data with vehicle and driver info
        const transformedRoute = {
          ...response.data.data,
          fromLocation: response.data.data.startLocation || response.data.data.fromLocation,
          toLocation: response.data.data.endLocation || response.data.data.toLocation,
          vehicleId: response.data.data.busId || response.data.data.vehicleId,
          // Vehicle and driver info is now provided directly by the backend
          vehicle: response.data.data.vehicle || null,
          driver: response.data.data.driver || null
        };
        
        setEditRoute(transformedRoute);
        setIsEditModalOpen(true);
      } else {
        showToast('error', 'Failed to fetch route details');
      }
    } catch (error) {
      console.error('Error fetching route details:', error);
      showToast('error', 'Failed to fetch route details');
    }
  };

  // Handle deleting a route
  const handleDeleteRoute = (route: TransportRoute) => {
    setRouteToDelete(route);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete route
  const confirmDeleteRoute = async () => {
    if (!routeToDelete) return;

    try {
      const response = await axios.delete(`${API_URL}/transport/routes/${routeToDelete.id}`);
      
      if (response.data.success) {
        setRoutes(routes.filter(r => r.id !== routeToDelete.id));
        showToast('success', 'Route deleted successfully');
      } else {
        showToast('error', 'Failed to delete route');
      }
    } catch (error) {
      console.error('Error deleting route:', error);
      showToast('error', 'Failed to delete route');
    } finally {
      setIsDeleteModalOpen(false);
      setRouteToDelete(null);
    }
  };

  // Handle adding a new route
  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Transform the data to match backend expected field names
      const routeDataForAPI = {
        name: newRoute.name,
        description: newRoute.description,
        startLocation: newRoute.fromLocation,  // Map fromLocation to startLocation
        endLocation: newRoute.toLocation,      // Map toLocation to endLocation
        distance: newRoute.distance,
        estimatedTime: newRoute.estimatedTime,
        busId: newRoute.vehicleId, // Map vehicleId to busId for backend compatibility
        driverId: newRoute.driverId
      };

      const response = await axios.post(`${API_URL}/transport/routes`, routeDataForAPI);
      
      if (response.data.success) {
        // Transform response back to frontend format for state
        const newRouteData = {
          ...response.data.data,
          fromLocation: response.data.data.startLocation,
          toLocation: response.data.data.endLocation,
          vehicleId: response.data.data.busId
        };
        
        setRoutes([newRouteData, ...routes]);
        setNewRoute({
          name: '',
          fromLocation: '',
          toLocation: '',
          description: '',
          distance: 0,
          estimatedTime: 0,
          vehicleId: '',
          driverId: '',
          isActive: true
        });
        setIsAddFormOpen(false);
        showToast('success', 'Route added successfully');
      } else {
        showToast('error', response.data.message || 'Failed to add route');
      }
    } catch (error) {
      console.error('Error adding route:', error);
      showToast('error', 'Failed to add route');
    }
  };

  // Handle updating a route
  const handleUpdateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Transform the data to match backend expected field names
      const routeDataForAPI = {
        name: editRoute.name,
        description: editRoute.description,
        startLocation: editRoute.fromLocation,  // Map fromLocation to startLocation
        endLocation: editRoute.toLocation,      // Map toLocation to endLocation
        distance: editRoute.distance,
        estimatedTime: editRoute.estimatedTime,
        busId: editRoute.vehicleId, // Map vehicleId to busId for backend compatibility
        driverId: editRoute.driverId
      };

      const response = await axios.put(`${API_URL}/transport/routes/${editRoute.id}`, routeDataForAPI);
      
      if (response.data.success) {
        // Transform response back to frontend format for state
        const updatedRouteData = {
          ...response.data.data,
          fromLocation: response.data.data.startLocation,
          toLocation: response.data.data.endLocation,
          vehicleId: response.data.data.busId
        };
        
        setRoutes(routes.map(r => r.id === editRoute.id ? updatedRouteData : r));
        setEditRoute({});
        setIsEditModalOpen(false);
        showToast('success', 'Route updated successfully');
      } else {
        showToast('error', response.data.message || 'Failed to update route');
      }
    } catch (error) {
      console.error('Error updating route:', error);
      showToast('error', 'Failed to update route');
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    if (isEditModalOpen) {
      setEditRoute(prev => ({ ...prev, [name]: val }));
    } else {
      setNewRoute(prev => ({ ...prev, [name]: val }));
    }
  };

  // Export functions
  const handleExportCSV = () => {
    const csvContent = [
      ['Route Name', 'From', 'To', 'Distance (km)', 'Est. Time (min)', 'Vehicle', 'Driver', 'Status'].join(','),
      ...filteredRoutes.map(route => [
        route.name,
        route.fromLocation,
        route.toLocation,
        route.distance || 0,
        route.estimatedTime || 0,
        route.vehicle?.vehicleName || 'Unassigned',
        route.driver?.name || 'Unassigned',
        route.isActive ? 'Active' : 'Inactive'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transport-routes.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    showToast('success', 'PDF export feature coming soon!');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transport Routes</h1>
        <p className="text-gray-600">Manage and organize your transport routes</p>
      </div>

      {/* Statistics Section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Routes</p>
              <p className="text-2xl font-bold">{routes.length}</p>
            </div>
            <div className="bg-blue-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Routes</p>
              <p className="text-2xl font-bold">
                {routes.filter(route => route.isActive).length}
              </p>
            </div>
            <div className="bg-green-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Inactive Routes</p>
              <p className="text-2xl font-bold">
                {routes.filter(route => !route.isActive).length}
              </p>
            </div>
            <div className="bg-yellow-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Avg Distance</p>
              <p className="text-2xl font-bold">
                {routes.length > 0 && routes.some(r => r.distance) 
                  ? Math.round(routes.filter(r => r.distance).reduce((sum, route) => sum + (route.distance || 0), 0) / routes.filter(r => r.distance).length) 
                  : 0} km
              </p>
            </div>
            <div className="bg-purple-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300 shadow-sm"
              title="Export to CSV"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300 shadow-sm"
              title="Export to PDF"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </button>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300 shadow-sm"
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isAddFormOpen ? 'Cancel' : 'Add New Route'}
          </button>
        </div>
      </div>

      {/* Add Route Form Dropdown */}
      {isAddFormOpen && (
        <div className="mb-6 border rounded-lg shadow-lg">
          <TransportRouteFormModal
            isOpen={true}
            setIsOpen={setIsAddFormOpen}
            mode="add"
            routeData={newRoute}
            setRouteData={setNewRoute}
            onSubmit={handleAddRoute}
            handleInputChange={handleInputChange}
            vehicles={vehicles}
            drivers={drivers}
          />
        </div>
      )}

      {/* Search and Filters */}
      <TransportRouteSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Show loading state */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : routes.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No routes found. Add your first route!</div>
      ) : (
        <>
          {/* Route Table */}
          <div className="overflow-x-auto">
            <TransportRouteTable
              currentRoutes={currentRoutes}
              handleViewProfile={handleViewProfile}
              handleEditRoute={handleEditRoute}
              handleDeleteRoute={handleDeleteRoute}
            />
          </div>

          {/* Pagination */}
          {filteredRoutes.length > 0 && (
            <TransportRoutePagination
              currentPage={currentPage}
              totalPages={totalPages}
              filteredRoutes={filteredRoutes}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
              setCurrentPage={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Route Profile Modal */}
      {isProfileOpen && selectedRoute && (
        <TransportRouteProfileModal
          selectedRoute={selectedRoute}
          setIsProfileOpen={setIsProfileOpen}
        />
      )}

      {/* Edit Route Modal */}
      {isEditModalOpen && (
        <TransportRouteFormModal
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          mode="edit"
          routeData={editRoute}
          setRouteData={setEditRoute}
          onSubmit={handleUpdateRoute}
          handleInputChange={handleInputChange}
          vehicles={vehicles}
          drivers={drivers}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && routeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Route</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the route "{routeToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteRoute}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportRoutes; 