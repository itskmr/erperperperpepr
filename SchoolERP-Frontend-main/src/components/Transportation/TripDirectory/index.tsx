import React, { useState, useEffect } from 'react';
import { useTransport } from '../../../contexts/TransportContext.jsx';
import TripTable from './TripTable';
import TripDetailModal from './TripDetailModal';
import TripForm from './TripForm';
import { Plus, Search, Calendar, Filter } from 'lucide-react';
import { Trip } from './types';

const TripDirectory: React.FC = () => {
  const {
    trips,
    buses,
    routes,
    drivers,
    fetchTrips,
    fetchBuses,
    fetchRoutes,
    fetchDrivers,
    addTrip,
    updateTrip,
    deleteTrip,
    updateTripStatus,
    loading,
    error
  } = useTransport();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [tripsPerPage] = useState(10);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Load data on component mount
  useEffect(() => {
    fetchTrips();
    fetchBuses();
    fetchRoutes();
    fetchDrivers();
  }, [fetchTrips, fetchBuses, fetchRoutes, fetchDrivers]);

  // Transform backend trips to frontend Trip type
  const transformTrips = (): Trip[] => {
    return trips.map(backendTrip => {
      const bus = buses.find(b => b.id === backendTrip.busId);
      const route = routes.find(r => r.id === backendTrip.routeId);
      const driver = drivers.find(d => d.id === backendTrip.driverId);

      return {
        id: backendTrip.id,
        tripID: backendTrip.id.substring(0, 8),
        date: backendTrip.date,
        busNumber: bus ? bus.registrationNumber : 'Unknown',
        routeName: route ? route.name : 'Unknown',
        driverName: driver ? driver.name : 'Unknown',
        startTime: backendTrip.startTime,
        endTime: backendTrip.endTime,
        startOdometer: backendTrip.startOdometer,
        endOdometer: backendTrip.endOdometer || 0,
        status: backendTrip.status,
        delayMinutes: backendTrip.delayMinutes,
        notes: backendTrip.notes || '',
        // Include the original IDs for references
        busId: backendTrip.busId,
        routeId: backendTrip.routeId,
        driverId: backendTrip.driverId
      };
    });
  };

  // Filter trips based on search query, status filter, and date filter
  const filterTrips = () => {
    const frontendTrips = transformTrips();
    
    return frontendTrips.filter(trip => {
      const matchesSearch = 
        trip.tripID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.driverName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === '' || 
        trip.status === statusFilter;
      
      const matchesDate = 
        dateFilter === '' || 
        new Date(trip.date).toISOString().split('T')[0] === dateFilter;
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  // Get current trips based on pagination
  const getCurrentTrips = () => {
    const filteredTrips = filterTrips();
    const indexOfLastTrip = currentPage * tripsPerPage;
    const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
    return filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip);
  };

  // Calculate total pages
  const totalPages = Math.ceil(filterTrips().length / tripsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Handle view trip detail
  const handleViewTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowDetailModal(true);
  };

  // Handle add new trip
  const handleAddTrip = () => {
    setSelectedTrip(null);
    setIsEditMode(false);
    setShowTripModal(true);
  };

  // Handle edit trip
  const handleEditTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsEditMode(true);
    setShowTripModal(true);
  };

  // Handle delete trip
  const handleDeleteTrip = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      await deleteTrip(id.toString());
    }
  };

  // Handle trip status update
  const handleUpdateStatus = async (tripId: number, status: string, endOdometer?: number) => {
    await updateTripStatus(tripId.toString(), status, endOdometer);
  };

  // Handle trip form submission
  const handleTripSubmit = async (formData: any) => {
    if (isEditMode && selectedTrip) {
      await updateTrip(selectedTrip.id.toString(), formData);
    } else {
      await addTrip(formData);
    }
    setShowTripModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Trip Directory</h2>
        <button
          onClick={handleAddTrip}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Trip
        </button>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div>
            <div className="relative flex items-center">
              <Filter className="h-5 w-5 text-gray-400 absolute left-3" />
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELED">Canceled</option>
                <option value="DELAYED">Delayed</option>
              </select>
            </div>
          </div>
          
          <div>
            <div className="relative flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 absolute left-3" />
              <input
                type="date"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
                setDateFilter('');
                setCurrentPage(1);
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Clear Filters
            </button>
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
      
      {/* Trip Table */}
      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner"></div>
            <p className="mt-2 text-sm text-gray-500">Loading trips...</p>
          </div>
        ) : (
          <>
            <TripTable
              currentTrips={getCurrentTrips()}
              handleViewTrip={handleViewTrip}
              handleEditTrip={handleEditTrip}
              handleDeleteTrip={handleDeleteTrip}
              handleUpdateStatus={handleUpdateStatus}
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * tripsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * tripsPerPage, filterTrips().length)}
                      </span>{' '}
                      of <span className="font-medium">{filterTrips().length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => paginate(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === index + 1
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } text-sm font-medium`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Trip Form Modal */}
      {showTripModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditMode ? 'Edit Trip' : 'Add New Trip'}
                </h3>
                <button 
                  onClick={() => setShowTripModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <TripForm
                trip={selectedTrip}
                buses={buses}
                routes={routes}
                drivers={drivers}
                onSubmit={handleTripSubmit}
                onCancel={() => setShowTripModal(false)}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Trip Detail Modal */}
      {showDetailModal && selectedTrip && (
        <TripDetailModal
          show={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          trip={selectedTrip}
          onEdit={handleEditTrip}
        />
      )}
    </div>
  );
};

export default TripDirectory; 