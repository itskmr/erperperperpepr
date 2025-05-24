import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import transportService from '../services/transportService';

// Create context
const TransportContext = createContext();

// Provider component
export const TransportProvider = ({ children }) => {
  // State for drivers
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  
  // State for buses
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  
  // State for routes
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  
  // State for trips
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  
  // State for maintenance
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  
  // State for student transport
  const [studentTransport, setStudentTransport] = useState([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =============================================================
  // Driver Functions
  // =============================================================

  // Fetch all drivers
  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.driver.getAllDrivers();
      
      // Check if the response was successful
      if (response.success === false) {
        setError(response.error || 'Failed to fetch drivers');
        setDrivers([]);
      } else {
        setDrivers(response.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch drivers');
      console.error('Error fetching drivers:', err);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch driver by ID
  const fetchDriverById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.driver.getDriverById(id);
      
      // Check if the response was successful
      if (response.success === false) {
        setError(response.error || `Failed to fetch driver ${id}`);
        setSelectedDriver(null);
        return null;
      } else {
        setSelectedDriver(response.data);
        return response.data;
      }
    } catch (err) {
      setError(err.message || `Failed to fetch driver ${id}`);
      console.error(`Error fetching driver ${id}:`, err);
      setSelectedDriver(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new driver
  const addDriver = useCallback(async (driverData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.driver.createDriver(driverData);
      
      // Check if the response was successful
      if (response.success === false) {
        setError(response.error || 'Failed to add driver');
        return null;
      } else {
        setDrivers(prev => [...prev, response.data]);
        return response.data;
      }
    } catch (err) {
      setError(err.message || 'Failed to add driver');
      console.error('Error adding driver:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update driver
  const updateDriver = useCallback(async (id, driverData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.driver.updateDriver(id, driverData);
      
      // Check if the response was successful
      if (response.success === false) {
        setError(response.error || `Failed to update driver ${id}`);
        return null;
      } else {
        setDrivers(prev => prev.map(driver => driver.id === id ? response.data : driver));
        if (selectedDriver && selectedDriver.id === id) {
          setSelectedDriver(response.data);
        }
        return response.data;
      }
    } catch (err) {
      setError(err.message || `Failed to update driver ${id}`);
      console.error(`Error updating driver ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedDriver]);

  // Delete driver
  const deleteDriver = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.driver.deleteDriver(id);
      
      // Check if the response was successful
      if (response.success === false) {
        setError(response.error || `Failed to delete driver ${id}`);
        return false;
      } else {
        setDrivers(prev => prev.filter(driver => driver.id !== id));
        if (selectedDriver && selectedDriver.id === id) {
          setSelectedDriver(null);
        }
        return true;
      }
    } catch (err) {
      setError(err.message || `Failed to delete driver ${id}`);
      console.error(`Error deleting driver ${id}:`, err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedDriver]);

  // =============================================================
  // Bus Functions
  // =============================================================

  // Fetch all buses
  const fetchBuses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.bus.getAllBuses();
      
      // Check if the response was successful
      if (response.success === false) {
        setError(response.error || 'Failed to fetch buses');
        setBuses([]);
      } else {
        setBuses(response.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch buses');
      console.error('Error fetching buses:', err);
      setBuses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch bus by ID
  const fetchBusById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.bus.getBusById(id);
      setSelectedBus(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to fetch bus ${id}`);
      console.error(`Error fetching bus ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new bus
  const addBus = useCallback(async (busData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.bus.createBus(busData);
      setBuses(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add bus');
      console.error('Error adding bus:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update bus
  const updateBus = useCallback(async (id, busData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.bus.updateBus(id, busData);
      setBuses(prev => prev.map(bus => bus.id === id ? response.data : bus));
      if (selectedBus && selectedBus.id === id) {
        setSelectedBus(response.data);
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update bus ${id}`);
      console.error(`Error updating bus ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedBus]);

  // Delete bus
  const deleteBus = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await transportService.bus.deleteBus(id);
      setBuses(prev => prev.filter(bus => bus.id !== id));
      if (selectedBus && selectedBus.id === id) {
        setSelectedBus(null);
      }
      return true;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to delete bus ${id}`);
      console.error(`Error deleting bus ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedBus]);

  // =============================================================
  // Route Functions
  // =============================================================

  // Fetch all routes
  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.route.getAllRoutes();
      setRoutes(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch routes');
      console.error('Error fetching routes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch route by ID
  const fetchRouteById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.route.getRouteById(id);
      setSelectedRoute(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to fetch route ${id}`);
      console.error(`Error fetching route ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new route
  const addRoute = useCallback(async (routeData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.route.createRoute(routeData);
      setRoutes(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add route');
      console.error('Error adding route:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update route
  const updateRoute = useCallback(async (id, routeData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.route.updateRoute(id, routeData);
      setRoutes(prev => prev.map(route => route.id === id ? response.data : route));
      if (selectedRoute && selectedRoute.id === id) {
        setSelectedRoute(response.data);
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update route ${id}`);
      console.error(`Error updating route ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedRoute]);

  // Delete route
  const deleteRoute = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await transportService.route.deleteRoute(id);
      setRoutes(prev => prev.filter(route => route.id !== id));
      if (selectedRoute && selectedRoute.id === id) {
        setSelectedRoute(null);
      }
      return true;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to delete route ${id}`);
      console.error(`Error deleting route ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedRoute]);

  // =============================================================
  // Trip Functions
  // =============================================================

  // Fetch all trips
  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.trip.getAllTrips();
      setTrips(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch trips');
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch trip by ID
  const fetchTripById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.trip.getTripById(id);
      setSelectedTrip(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to fetch trip ${id}`);
      console.error(`Error fetching trip ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new trip
  const addTrip = useCallback(async (tripData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.trip.createTrip(tripData);
      setTrips(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add trip');
      console.error('Error adding trip:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update trip
  const updateTrip = useCallback(async (id, tripData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.trip.updateTrip(id, tripData);
      setTrips(prev => prev.map(trip => trip.id === id ? response.data : trip));
      if (selectedTrip && selectedTrip.id === id) {
        setSelectedTrip(response.data);
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update trip ${id}`);
      console.error(`Error updating trip ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedTrip]);

  // Update trip status
  const updateTripStatus = useCallback(async (id, status, endOdometer) => {
    setLoading(true);
    setError(null);
    try {
      const statusData = { status };
      if (endOdometer !== undefined) {
        statusData.endOdometer = endOdometer;
      }
      
      const response = await transportService.trip.updateTripStatus(id, statusData);
      setTrips(prev => prev.map(trip => trip.id === id ? response.data : trip));
      if (selectedTrip && selectedTrip.id === id) {
        setSelectedTrip(response.data);
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update trip status ${id}`);
      console.error(`Error updating trip status ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedTrip]);

  // Delete trip
  const deleteTrip = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await transportService.trip.deleteTrip(id);
      setTrips(prev => prev.filter(trip => trip.id !== id));
      if (selectedTrip && selectedTrip.id === id) {
        setSelectedTrip(null);
      }
      return true;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to delete trip ${id}`);
      console.error(`Error deleting trip ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedTrip]);

  // =============================================================
  // Maintenance Functions
  // =============================================================

  // Fetch all maintenance records
  const fetchMaintenanceRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.maintenance.getAllMaintenance();
      setMaintenanceRecords(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch maintenance records');
      console.error('Error fetching maintenance records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch maintenance record by ID
  const fetchMaintenanceById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.maintenance.getMaintenanceById(id);
      setSelectedMaintenance(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to fetch maintenance ${id}`);
      console.error(`Error fetching maintenance ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new maintenance record
  const addMaintenance = useCallback(async (maintenanceData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.maintenance.createMaintenance(maintenanceData);
      setMaintenanceRecords(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add maintenance record');
      console.error('Error adding maintenance record:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update maintenance record
  const updateMaintenance = useCallback(async (id, maintenanceData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.maintenance.updateMaintenance(id, maintenanceData);
      setMaintenanceRecords(prev => prev.map(record => record.id === id ? response.data : record));
      if (selectedMaintenance && selectedMaintenance.id === id) {
        setSelectedMaintenance(response.data);
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update maintenance ${id}`);
      console.error(`Error updating maintenance ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedMaintenance]);

  // Delete maintenance record
  const deleteMaintenance = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await transportService.maintenance.deleteMaintenance(id);
      setMaintenanceRecords(prev => prev.filter(record => record.id !== id));
      if (selectedMaintenance && selectedMaintenance.id === id) {
        setSelectedMaintenance(null);
      }
      return true;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to delete maintenance ${id}`);
      console.error(`Error deleting maintenance ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedMaintenance]);

  // =============================================================
  // Student Transport Functions
  // =============================================================

  // Fetch all student transport records
  const fetchStudentTransport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.studentTransport.getAllStudentTransport();
      setStudentTransport(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch student transport records');
      console.error('Error fetching student transport records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get students by route
  const getStudentsByRoute = useCallback(async (routeId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.studentTransport.getStudentsByRoute(routeId);
      return response.data || [];
    } catch (err) {
      setError(err.response?.data?.message || `Failed to fetch students for route ${routeId}`);
      console.error(`Error fetching students for route ${routeId}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Assign student to route
  const assignStudentToRoute = useCallback(async (assignmentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.studentTransport.assignStudentToRoute(assignmentData);
      setStudentTransport(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign student to route');
      console.error('Error assigning student to route:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update student transport
  const updateStudentTransport = useCallback(async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await transportService.studentTransport.updateStudentTransport(id, updateData);
      setStudentTransport(prev => prev.map(record => record.id === id ? response.data : record));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update student transport ${id}`);
      console.error(`Error updating student transport ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove student from route
  const removeStudentFromRoute = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await transportService.studentTransport.removeStudentFromRoute(id);
      setStudentTransport(prev => prev.filter(record => record.id !== id));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || `Failed to remove student from route ${id}`);
      console.error(`Error removing student from route ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper functions

  // Get assigned bus for a route
  const getAssignedBus = useCallback((routeId) => {
    return buses.find(bus => bus.routeId === routeId);
  }, [buses]);

  // Get assigned driver for a bus
  const getAssignedDriver = useCallback((busId) => {
    return drivers.find(driver => {
      const assignedBus = buses.find(bus => bus.id === busId);
      return assignedBus && assignedBus.driverId === driver.id;
    });
  }, [buses, drivers]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Initialize data when context is first used
  useEffect(() => {
    fetchDrivers();
    fetchBuses();
    fetchRoutes();
    fetchTrips();
    fetchMaintenanceRecords();
    fetchStudentTransport();
  }, [
    fetchDrivers,
    fetchBuses,
    fetchRoutes,
    fetchTrips,
    fetchMaintenanceRecords,
    fetchStudentTransport
  ]);

  // Context value
  const value = {
    // State
    drivers,
    selectedDriver,
    buses,
    selectedBus,
    routes,
    selectedRoute,
    trips,
    selectedTrip,
    maintenanceRecords,
    selectedMaintenance,
    studentTransport,
    loading,
    error,

    // Driver functions
    fetchDrivers,
    fetchDriverById,
    addDriver,
    updateDriver,
    deleteDriver,
    setSelectedDriver,

    // Bus functions
    fetchBuses,
    fetchBusById,
    addBus,
    updateBus,
    deleteBus,
    setSelectedBus,

    // Route functions
    fetchRoutes,
    fetchRouteById,
    addRoute,
    updateRoute,
    deleteRoute,
    setSelectedRoute,

    // Trip functions
    fetchTrips,
    fetchTripById,
    addTrip,
    updateTrip,
    updateTripStatus,
    deleteTrip,
    setSelectedTrip,

    // Maintenance functions
    fetchMaintenanceRecords,
    fetchMaintenanceById,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
    setSelectedMaintenance,

    // Student transport functions
    fetchStudentTransport,
    getStudentsByRoute,
    assignStudentToRoute,
    updateStudentTransport,
    removeStudentFromRoute,

    // Helper functions
    getAssignedBus,
    getAssignedDriver,
    formatDate
  };

  return (
    <TransportContext.Provider value={value}>
      {children}
    </TransportContext.Provider>
  );
};

// Custom hook to use the transport context
export const useTransport = () => {
  const context = useContext(TransportContext);
  if (context === undefined) {
    throw new Error('useTransport must be used within a TransportProvider');
  }
  return context;
};

export default TransportContext; 