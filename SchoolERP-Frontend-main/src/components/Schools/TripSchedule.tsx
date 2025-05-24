import React, { useState, useEffect } from 'react';
import { useBusTracking } from './BusTrackingContext';
import { Plus, Edit, Trash2, Search, Check, X, Calendar, Clock, MapPin, Bus, User, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

// @ts-ignore - Ignore type checking for the transport service import
import transportService from '../../services/transportService';

// Define valid status types that match both frontend and backend
type TripStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

// Helper function to convert between backend and frontend status formats
const normalizeStatus = (status: string): TripStatus => {
  const lowerStatus = status.toLowerCase();
  // Validate that the status is one of our allowed values
  if (['scheduled', 'in-progress', 'completed', 'cancelled'].includes(lowerStatus)) {
    return lowerStatus as TripStatus;
  }
  // Default fallback
  return 'scheduled';
};

// Map frontend status to backend status format
const mapStatusToBackend = (status: string): string => {
  // Map frontend statuses to what backend expects
  switch(status.toLowerCase()) {
    case 'scheduled': return 'SCHEDULED';
    case 'in-progress': return 'IN_PROGRESS'; // Note: backend might use IN_PROGRESS with underscore
    case 'completed': return 'COMPLETED';
    case 'cancelled': return 'CANCELLED';
    default: return 'SCHEDULED';
  }
};

interface TripLogExtended {
  id: string;
  busId: string;
  routeId: string;
  driverId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: TripStatus;
  startOdometer: number;
  endOdometer: number;
  deviationNotes?: string;
  delayMinutes: number;
  // Extended properties with references
  bus?: any;
  route?: any;
  driver?: any;
}

const TripSchedule: React.FC = () => {
  const {
    tripLogs,
    buses,
    drivers,
    routes,
    addTripLog,
    updateTripLog,
    deleteTripLog,
    loading,
    error,
    fetchTripLogs
  } = useBusTracking();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripLogExtended | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedTrips, setExpandedTrips] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reload trips data when component mounts
  useEffect(() => {
    fetchTripLogs();
  }, []);
  
  // Enhance trip logs with references
  const enhancedTripLogs: TripLogExtended[] = tripLogs.map(trip => ({
    ...trip,
    bus: buses.find(bus => bus.id === trip.busId),
    route: routes.find(route => route.id === trip.routeId),
    driver: drivers.find(driver => driver.id === trip.driverId),
    status: normalizeStatus(trip.status)
  }));
  
  // Filter trip logs
  const filteredTripLogs = enhancedTripLogs.filter(trip => {
    const matchesSearch = 
      trip.bus?.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.route?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.driver?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus ? trip.status === filterStatus : true;
    const matchesDate = filterDate ? trip.date === filterDate : true;
    
    return matchesSearch && matchesStatus && matchesDate;
  });
  
  // Group trips by date
  const groupedTrips: Record<string, TripLogExtended[]> = {};
  filteredTripLogs.forEach(trip => {
    if (!groupedTrips[trip.date]) {
      groupedTrips[trip.date] = [];
    }
    groupedTrips[trip.date].push(trip);
  });
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedTrips).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const handleAddTrip = async (formData: Omit<TripLogExtended, 'id' | 'bus' | 'route' | 'driver'>) => {
    try {
      setIsSubmitting(true);
      
      // Format the trip data for the API
      const apiFormData = {
        busId: formData.busId,
        routeId: formData.routeId,
        driverId: formData.driverId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        startOdometer: formData.startOdometer,
        endOdometer: formData.endOdometer || 0,
        deviationNotes: formData.deviationNotes || '',
        delayMinutes: formData.delayMinutes || 0,
        status: mapStatusToBackend(formData.status),
        notes: formData.deviationNotes || '' // If backend expects 'notes' instead of 'deviationNotes'
      };
      
      console.log('Creating trip with data:', apiFormData);
      const response = await transportService.trip.createTrip(apiFormData);
      
      if (response.success) {
        toast.success('Trip scheduled successfully');
        // Refresh trip logs from server
        await fetchTripLogs();
        setIsAddModalOpen(false);
      } else {
        toast.error(response.error || 'Failed to schedule trip');
        console.error('API error:', response);
      }
    } catch (error: any) {
      console.error('Error creating trip:', error);
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTrip = async (id: string, formData: Partial<TripLogExtended>) => {
    try {
      setIsSubmitting(true);
      
      // Remove added references before update
      const { bus, route, driver, ...updateData } = formData;
      
      // Format the update data for the API
      const apiUpdateData: any = { ...updateData };
      
      // Convert status from frontend format to backend format if needed
      if (apiUpdateData.status) {
        apiUpdateData.status = mapStatusToBackend(apiUpdateData.status);
      }
      
      // If we're setting to "completed" and endOdometer is missing,
      // make sure to add it to avoid validation errors in the backend
      if (apiUpdateData.status === 'COMPLETED' && !apiUpdateData.endOdometer) {
        const currentTrip = tripLogs.find(t => t.id === id);
        apiUpdateData.endOdometer = currentTrip?.endOdometer || currentTrip?.startOdometer || 0;
      }
      
      // If there are notes, also set them as 'notes' for backend compatibility
      if (apiUpdateData.deviationNotes) {
        apiUpdateData.notes = apiUpdateData.deviationNotes;
      }
      
      console.log('Updating trip with data:', apiUpdateData);
      const response = await transportService.trip.updateTrip(id, apiUpdateData);
      
      if (response.success) {
        toast.success('Trip updated successfully');
        // Refresh trip logs from server
        await fetchTripLogs();
        setIsEditModalOpen(false);
      } else {
        toast.error(response.error || 'Failed to update trip');
        console.error('API error:', response);
      }
    } catch (error: any) {
      console.error('Error updating trip:', error);
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        setIsSubmitting(true);
        const response = await transportService.trip.deleteTrip(id);
        
        if (response.success) {
          toast.success('Trip deleted successfully');
          // Refresh trip logs from server
          await fetchTripLogs();
        } else {
          toast.error(response.error || 'Failed to delete trip');
          console.error('API error:', response);
        }
      } catch (error: any) {
        console.error('Error deleting trip:', error);
        toast.error(error.message || 'An error occurred');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const toggleTripExpand = (tripId: string) => {
    if (expandedTrips.includes(tripId)) {
      setExpandedTrips(expandedTrips.filter(id => id !== tripId));
    } else {
      setExpandedTrips([...expandedTrips, tripId]);
    }
  };
  
  // Get status badge styling
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Trip Schedule</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Trip
        </button>
      </div>
      
      {/* Loading indicator */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Processing...</p>
          </div>
        </div>
      )}
      
      {/* Search and filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search by bus, route or driver"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select 
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="w-full md:w-48">
            <input
              type="date"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
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
      
      {/* Refresh button */}
      <div className="flex justify-end">
        <button
          onClick={() => fetchTripLogs()}
          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={loading || isSubmitting}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      
      {/* Trip data display */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner"></div>
            <p className="mt-2 text-sm text-gray-500">Loading trip schedules...</p>
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">No trips found for the selected filters.</p>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {groupedTrips[date].length} trips scheduled
                </p>
              </div>
              <ul className="divide-y divide-gray-200">
                {groupedTrips[date].map((trip) => {
                  const isExpanded = expandedTrips.includes(trip.id);
                  
                  return (
                    <li key={trip.id} className="block hover:bg-gray-50">
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleTripExpand(trip.id)}>
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Bus className="h-6 w-6 text-indigo-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {trip.route?.name || 'Unknown Route'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {trip.bus?.registrationNumber || 'No Bus Assigned'} • Driver: {trip.driver?.name || 'Unassigned'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className={`mr-4 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(trip.status)}`}>
                              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                            </span>
                            <div className="ml-2 text-gray-500">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="mt-4 pl-14">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <div className="text-xs font-medium text-gray-500">TIME</div>
                                <div className="mt-1 flex items-center text-sm text-gray-900">
                                  <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                  {trip.startTime} - {trip.endTime}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-500">ODOMETER</div>
                                <div className="mt-1 text-sm text-gray-900">
                                  Start: {trip.startOdometer} km
                                  {trip.status === 'completed' && (
                                    <span> • End: {trip.endOdometer} km</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-500">DELAY</div>
                                <div className="mt-1 text-sm text-gray-900">
                                  {trip.delayMinutes > 0 ? `${trip.delayMinutes} minutes delayed` : 'On time'}
                                </div>
                              </div>
                            </div>
                            
                            {trip.deviationNotes && (
                              <div className="mb-4">
                                <div className="text-xs font-medium text-gray-500">NOTES</div>
                                <div className="mt-1 text-sm text-gray-900">{trip.deviationNotes}</div>
                              </div>
                            )}
                            
                            {trip.route && (
                              <div className="mb-4">
                                <div className="text-xs font-medium text-gray-500">ROUTE DETAILS</div>
                                <div className="mt-1 text-sm text-gray-900">
                                  {trip.route.startLocation} to {trip.route.endLocation} ({trip.route.distanceKm} km)
                                </div>
                                <div className="mt-2">
                                  <div className="text-xs font-medium text-gray-500">STOPS</div>
                                  <div className="mt-1 space-y-2">
                                    {trip.route.stops?.map((stop: any, index: number) => (
                                      <div key={stop.id} className="flex items-center">
                                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium">
                                          {index + 1}
                                        </div>
                                        <div className="ml-2 text-sm text-gray-700">
                                          {stop.name} - {stop.estimatedTime}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTrip(trip);
                                  setIsEditModalOpen(true);
                                }}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTrip(trip.id);
                                }}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded shadow-sm text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </button>
                              {trip.status === 'scheduled' && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditTrip(trip.id, { status: 'in-progress' });
                                    }}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    disabled={isSubmitting}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Start Trip
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditTrip(trip.id, { status: 'cancelled' });
                                    }}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    disabled={isSubmitting}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </button>
                                </>
                              )}
                              {trip.status === 'in-progress' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // When completing a trip, prompt for end odometer reading if not provided
                                    const endOdometerReading = window.prompt('Enter end odometer reading (km)', trip.startOdometer.toString());
                                    if (endOdometerReading !== null) {
                                      handleEditTrip(trip.id, { 
                                        status: 'completed',
                                        endOdometer: parseInt(endOdometerReading) || trip.startOdometer
                                      });
                                    }
                                  }}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                  disabled={isSubmitting}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Complete
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
      
      {/* Add Trip Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Schedule New Trip</h3>
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
              <TripForm 
                buses={buses} 
                routes={routes} 
                drivers={drivers} 
                onSubmit={handleAddTrip} 
                onCancel={() => setIsAddModalOpen(false)}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Trip Modal */}
      {isEditModalOpen && selectedTrip && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Edit Trip</h3>
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
              <TripForm 
                trip={selectedTrip} 
                buses={buses} 
                routes={routes} 
                drivers={drivers} 
                onSubmit={(data) => handleEditTrip(selectedTrip.id, data)} 
                onCancel={() => setIsEditModalOpen(false)}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface TripFormProps {
  trip?: TripLogExtended;
  buses: any[];
  routes: any[];
  drivers: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const TripForm: React.FC<TripFormProps> = ({ trip, buses, routes, drivers, onSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    busId: trip?.busId || '',
    routeId: trip?.routeId || '',
    driverId: trip?.driverId || '',
    date: trip?.date || new Date().toISOString().split('T')[0],
    startTime: trip?.startTime || '',
    endTime: trip?.endTime || '',
    status: trip?.status || 'scheduled',
    startOdometer: trip?.startOdometer || 0,
    endOdometer: trip?.endOdometer || 0,
    deviationNotes: trip?.deviationNotes || '',
    delayMinutes: trip?.delayMinutes || 0
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [selectedRoute, setSelectedRoute] = useState<any>(
    trip?.routeId ? routes.find(r => r.id === trip.routeId) : null
  );
  
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
    
    // If changing the route, update the selected route
    if (name === 'routeId') {
      const route = routes.find(r => r.id === value);
      setSelectedRoute(route);
      
      // If the route has an assigned bus, auto-select it
      if (route && route.assignedBus) {
        setFormData({
          ...formData,
          routeId: value,
          busId: route.assignedBus
        });
        return;
      }
    }
    
    // Handle numeric values
    if (type === 'number') {
      const numericValue = value === '' ? 0 : Number(value);
      
      // Validate odometer readings
      if (name === 'endOdometer' && numericValue < formData.startOdometer) {
        setFormErrors({
          ...formErrors,
          endOdometer: 'End odometer must be greater than or equal to start odometer'
        });
      }
      
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
    if (!formData.busId) errors.busId = 'Bus is required';
    if (!formData.routeId) errors.routeId = 'Route is required';
    if (!formData.driverId) errors.driverId = 'Driver is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.endTime) errors.endTime = 'End time is required';
    
    // Validation for completed trips
    if (formData.status === 'completed' && formData.endOdometer < formData.startOdometer) {
      errors.endOdometer = 'End odometer must be greater than or equal to start odometer';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    } else {
      // Scroll to the first error
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          name="date"
          id="date"
          required
          className={`mt-1 block w-full border ${formErrors.date ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          value={formData.date}
          onChange={handleChange}
          aria-invalid={!!formErrors.date}
          aria-describedby={formErrors.date ? "date-error" : undefined}
        />
        {formErrors.date && (
          <p className="mt-1 text-sm text-red-600" id="date-error">{formErrors.date}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="routeId" className="block text-sm font-medium text-gray-700">
          Route
        </label>
        <select
          id="routeId"
          name="routeId"
          required
          className={`mt-1 block w-full py-2 px-3 border ${formErrors.routeId ? 'border-red-300' : 'border-gray-300'} bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          value={formData.routeId}
          onChange={handleChange}
          aria-invalid={!!formErrors.routeId}
          aria-describedby={formErrors.routeId ? "routeId-error" : undefined}
        >
          <option value="">Select a route</option>
          {routes.map(route => (
            <option key={route.id} value={route.id}>{route.name}</option>
          ))}
        </select>
        {formErrors.routeId && (
          <p className="mt-1 text-sm text-red-600" id="routeId-error">{formErrors.routeId}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="busId" className="block text-sm font-medium text-gray-700">
          Bus
        </label>
        <select
          id="busId"
          name="busId"
          required
          className={`mt-1 block w-full py-2 px-3 border ${formErrors.busId ? 'border-red-300' : 'border-gray-300'} bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          value={formData.busId}
          onChange={handleChange}
          aria-invalid={!!formErrors.busId}
          aria-describedby={formErrors.busId ? "busId-error" : undefined}
        >
          <option value="">Select a bus</option>
          {buses.map(bus => (
            <option key={bus.id} value={bus.id}>
              {bus.registrationNumber} ({bus.model}, {bus.capacity} seats)
            </option>
          ))}
        </select>
        {formErrors.busId && (
          <p className="mt-1 text-sm text-red-600" id="busId-error">{formErrors.busId}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="driverId" className="block text-sm font-medium text-gray-700">
          Driver
        </label>
        <select
          id="driverId"
          name="driverId"
          required
          className={`mt-1 block w-full py-2 px-3 border ${formErrors.driverId ? 'border-red-300' : 'border-gray-300'} bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          value={formData.driverId}
          onChange={handleChange}
          aria-invalid={!!formErrors.driverId}
          aria-describedby={formErrors.driverId ? "driverId-error" : undefined}
        >
          <option value="">Select a driver</option>
          {drivers.filter(d => d.isActive).map(driver => (
            <option key={driver.id} value={driver.id}>
              {driver.name} ({driver.experience} yrs exp)
            </option>
          ))}
        </select>
        {formErrors.driverId && (
          <p className="mt-1 text-sm text-red-600" id="driverId-error">{formErrors.driverId}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="time"
            name="startTime"
            id="startTime"
            required
            className={`mt-1 block w-full border ${formErrors.startTime ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            value={formData.startTime}
            onChange={handleChange}
            aria-invalid={!!formErrors.startTime}
            aria-describedby={formErrors.startTime ? "startTime-error" : undefined}
          />
          {formErrors.startTime && (
            <p className="mt-1 text-sm text-red-600" id="startTime-error">{formErrors.startTime}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            type="time"
            name="endTime"
            id="endTime"
            required
            className={`mt-1 block w-full border ${formErrors.endTime ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            value={formData.endTime}
            onChange={handleChange}
            aria-invalid={!!formErrors.endTime}
            aria-describedby={formErrors.endTime ? "endTime-error" : undefined}
          />
          {formErrors.endTime && (
            <p className="mt-1 text-sm text-red-600" id="endTime-error">{formErrors.endTime}</p>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          required
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startOdometer" className="block text-sm font-medium text-gray-700">
            Start Odometer (km)
          </label>
          <input
            type="number"
            name="startOdometer"
            id="startOdometer"
            min="0"
            required
            className={`mt-1 block w-full border ${formErrors.startOdometer ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            value={formData.startOdometer || ''}
            onChange={handleChange}
            aria-invalid={!!formErrors.startOdometer}
            aria-describedby={formErrors.startOdometer ? "startOdometer-error" : undefined}
          />
          {formErrors.startOdometer && (
            <p className="mt-1 text-sm text-red-600" id="startOdometer-error">{formErrors.startOdometer}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="endOdometer" className="block text-sm font-medium text-gray-700">
            End Odometer (km)
          </label>
          <input
            type="number"
            name="endOdometer"
            id="endOdometer"
            min={formData.startOdometer}
            className={`mt-1 block w-full border ${formErrors.endOdometer ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${formData.status !== 'completed' ? 'bg-gray-100' : ''}`}
            value={formData.endOdometer || ''}
            onChange={handleChange}
            disabled={formData.status !== 'completed'}
            aria-invalid={!!formErrors.endOdometer}
            aria-describedby={formErrors.endOdometer ? "endOdometer-error" : undefined}
          />
          {formErrors.endOdometer && (
            <p className="mt-1 text-sm text-red-600" id="endOdometer-error">{formErrors.endOdometer}</p>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="delayMinutes" className="block text-sm font-medium text-gray-700">
          Delay (minutes)
        </label>
        <input
          type="number"
          name="delayMinutes"
          id="delayMinutes"
          min="0"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.delayMinutes || ''}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="deviationNotes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          name="deviationNotes"
          id="deviationNotes"
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.deviationNotes}
          onChange={handleChange}
          placeholder="Any deviations or issues during the trip"
        />
      </div>
      
      {selectedRoute && (
        <div className="p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700">Route Details</h4>
          <p className="mt-1 text-sm text-gray-500">
            {selectedRoute.startLocation} to {selectedRoute.endLocation}
          </p>
          <p className="text-sm text-gray-500">
            Distance: {selectedRoute.distanceKm} km • Duration: ~{selectedRoute.estimatedDuration} min
          </p>
          <p className="text-sm text-gray-500">
            Stops: {selectedRoute.stops?.length || 0}
          </p>
        </div>
      )}
      
      <div className="flex space-x-3 pt-4">
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
              {trip ? 'Updating...' : 'Scheduling...'}
            </>
          ) : (
            trip ? 'Update Trip' : 'Schedule Trip'
          )}
        </button>
      </div>
    </form>
  );
};

export default TripSchedule; 