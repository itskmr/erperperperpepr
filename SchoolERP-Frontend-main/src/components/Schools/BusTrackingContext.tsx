import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import transportService from '../../services/transportService';

// Define types for our bus tracking system
export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  contactNumber: string;
  address: string;
  experience: number;
  joiningDate: string;
  isActive: boolean;
  photo?: string;
}

export interface BusRoute {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  stops: RouteStop[];
  distanceKm: number;
  estimatedDuration: number; // in minutes
  schedule: RouteSchedule[];
  assignedBus?: string;
}

export interface RouteStop {
  id: string;
  name: string;
  location: string;
  estimatedTime: string;
  sequence: number;
  studentsCount: number;
}

export interface RouteSchedule {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  weekdays: string[]; // ['Monday', 'Tuesday', etc.]
}

export interface Bus {
  id: string;
  registrationNumber: string;
  model: string;
  make: string;
  capacity: number;
  manufactureYear: number;
  assignedDriver?: string;
  assignedRoute?: string;
  fuelType: string;
  status: 'active' | 'maintenance' | 'inactive';
  trackerDeviceId?: string;
  lastLocation?: { lat: number; lng: number };
  photo?: string;
}

export interface MaintenanceRecord {
  id: string;
  busId: string;
  date: string;
  type: 'regular' | 'repair' | 'inspection';
  description: string;
  cost: number;
  odometer: number;
  nextDueDate?: string;
  completedBy: string;
  status: 'scheduled' | 'in-progress' | 'completed';
}

export interface FuelRecord {
  id: string;
  busId: string;
  date: string;
  quantity: number;
  cost: number;
  odometer: number;
  fuelType: string;
  filledBy: string;
}

export interface TripLog {
  id: string;
  busId: string;
  routeId: string;
  driverId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  startOdometer: number;
  endOdometer: number;
  deviationNotes?: string;
  delayMinutes: number;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  routeId: string;
  stopId: string;
  contactNumber: string;
  parentName: string;
  parentContact: string;
  pickupTime: string;
  dropTime: string;
  address: string;
}

interface BusTrackingContextType {
  buses: Bus[];
  drivers: Driver[];
  routes: BusRoute[];
  maintenanceRecords: MaintenanceRecord[];
  fuelRecords: FuelRecord[];
  tripLogs: TripLog[];
  students: Student[];
  
  // Bus CRUD operations
  addBus: (bus: Omit<Bus, 'id'>) => Promise<void>;
  updateBus: (id: string, bus: Partial<Bus>) => Promise<void>;
  deleteBus: (id: string) => Promise<void>;
  
  // Driver CRUD operations
  addDriver: (driver: Omit<Driver, 'id'>) => Promise<void>;
  updateDriver: (id: string, driver: Partial<Driver>) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;
  
  // Route CRUD operations
  addRoute: (route: Omit<BusRoute, 'id'>) => Promise<void>;
  updateRoute: (id: string, route: Partial<BusRoute>) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  
  // Maintenance CRUD operations
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => Promise<void>;
  updateMaintenanceRecord: (id: string, record: Partial<MaintenanceRecord>) => Promise<void>;
  deleteMaintenanceRecord: (id: string) => Promise<void>;
  
  // Fuel CRUD operations
  addFuelRecord: (record: Omit<FuelRecord, 'id'>) => Promise<void>;
  updateFuelRecord: (id: string, record: Partial<FuelRecord>) => Promise<void>;
  deleteFuelRecord: (id: string) => Promise<void>;
  
  // Trip log operations
  addTripLog: (log: Omit<TripLog, 'id'>) => Promise<void>;
  updateTripLog: (id: string, log: Partial<TripLog>) => Promise<void>;
  deleteTripLog: (id: string) => Promise<void>;
  
  // Student operations
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  
  // Helper functions
  getStudentsByRoute: (routeId: string) => Student[];
  getBusesInMaintenance: () => Bus[];
  getActiveTrips: () => TripLog[];
  getRoutesWithBuses: () => (BusRoute & { bus?: Bus })[];
  
  // UI state
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Add the new fetchTripLogs function to the context
  fetchTripLogs: () => Promise<void>;
}

// Create the context with a default value
const BusTrackingContext = createContext<BusTrackingContextType | undefined>(undefined);

// Sample data for development
const sampleBuses: Bus[] = [
  {
    id: '1',
    registrationNumber: 'KA-01-MX-1234',
    model: 'Tata Starbus',
    make: 'Tata Motors',
    capacity: 42,
    manufactureYear: 2020,
    assignedDriver: '1',
    assignedRoute: '1',
    fuelType: 'Diesel',
    status: 'active',
    trackerDeviceId: 'TRK-001',
    lastLocation: { lat: 12.9716, lng: 77.5946 },
  },
  {
    id: '2',
    registrationNumber: 'KA-01-MX-5678',
    model: 'Ashok Leyland Lynx',
    make: 'Ashok Leyland',
    capacity: 36,
    manufactureYear: 2019,
    assignedDriver: '2',
    assignedRoute: '2',
    fuelType: 'Diesel',
    status: 'active',
    trackerDeviceId: 'TRK-002',
    lastLocation: { lat: 12.9352, lng: 77.6245 },
  },
  {
    id: '3',
    registrationNumber: 'KA-01-MX-9012',
    model: 'Eicher Skyline Pro',
    make: 'Eicher Motors',
    capacity: 32,
    manufactureYear: 2018,
    assignedDriver: '3',
    fuelType: 'Diesel',
    status: 'maintenance',
  },
];

const sampleDrivers: Driver[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    licenseNumber: 'DL-0123456789',
    contactNumber: '9876543210',
    address: '123, MG Road, Bangalore',
    experience: 8,
    joiningDate: '2018-06-15',
    isActive: true,
  },
  {
    id: '2',
    name: 'Suresh Singh',
    licenseNumber: 'DL-9876543210',
    contactNumber: '8765432109',
    address: '45, Brigade Road, Bangalore',
    experience: 6,
    joiningDate: '2019-03-22',
    isActive: true,
  },
  {
    id: '3',
    name: 'Mahesh Patel',
    licenseNumber: 'DL-5678901234',
    contactNumber: '7654321098',
    address: '789, Residency Road, Bangalore',
    experience: 10,
    joiningDate: '2015-11-10',
    isActive: true,
  },
];

const sampleRoutes: BusRoute[] = [
  {
    id: '1',
    name: 'North Route',
    startLocation: 'School Campus',
    endLocation: 'North Terminal',
    stops: [
      {
        id: 's1',
        name: 'Hebbal Bridge',
        location: 'Hebbal',
        estimatedTime: '07:15',
        sequence: 1,
        studentsCount: 8,
      },
      {
        id: 's2',
        name: 'Manyata Tech Park',
        location: 'Nagawara',
        estimatedTime: '07:30',
        sequence: 2,
        studentsCount: 12,
      },
      {
        id: 's3',
        name: 'Veeranna Palya',
        location: 'Banaswadi',
        estimatedTime: '07:45',
        sequence: 3,
        studentsCount: 6,
      },
    ],
    distanceKm: 18.5,
    estimatedDuration: 45,
    schedule: [
      {
        id: 'sch1',
        title: 'Morning Pickup',
        startTime: '06:45',
        endTime: '08:30',
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      {
        id: 'sch2',
        title: 'Afternoon Drop',
        startTime: '15:30',
        endTime: '17:15',
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
    ],
    assignedBus: '1',
  },
  {
    id: '2',
    name: 'South Route',
    startLocation: 'School Campus',
    endLocation: 'South Terminal',
    stops: [
      {
        id: 's4',
        name: 'Jayanagar 4th Block',
        location: 'Jayanagar',
        estimatedTime: '07:20',
        sequence: 1,
        studentsCount: 10,
      },
      {
        id: 's5',
        name: 'Banashankari Temple',
        location: 'Banashankari',
        estimatedTime: '07:35',
        sequence: 2,
        studentsCount: 7,
      },
      {
        id: 's6',
        name: 'JP Nagar 6th Phase',
        location: 'JP Nagar',
        estimatedTime: '07:50',
        sequence: 3,
        studentsCount: 9,
      },
    ],
    distanceKm: 16.8,
    estimatedDuration: 50,
    schedule: [
      {
        id: 'sch3',
        title: 'Morning Pickup',
        startTime: '06:45',
        endTime: '08:30',
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      {
        id: 'sch4',
        title: 'Afternoon Drop',
        startTime: '15:30',
        endTime: '17:15',
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
    ],
    assignedBus: '2',
  },
];

const sampleMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: '1',
    busId: '3',
    date: '2023-09-15',
    type: 'repair',
    description: 'Brake system repair',
    cost: 12500,
    odometer: 45689,
    nextDueDate: '2023-12-15',
    completedBy: 'Authorized Service Center',
    status: 'in-progress',
  },
  {
    id: '2',
    busId: '1',
    date: '2023-08-22',
    type: 'regular',
    description: 'Oil change and filter replacement',
    cost: 4500,
    odometer: 38500,
    nextDueDate: '2023-11-22',
    completedBy: 'School Mechanic',
    status: 'completed',
  },
];

const sampleFuelRecords: FuelRecord[] = [
  {
    id: '1',
    busId: '1',
    date: '2023-09-12',
    quantity: 45.6,
    cost: 4560,
    odometer: 39580,
    fuelType: 'Diesel',
    filledBy: 'Rajesh Kumar',
  },
  {
    id: '2',
    busId: '2',
    date: '2023-09-14',
    quantity: 40.2,
    cost: 4020,
    odometer: 36420,
    fuelType: 'Diesel',
    filledBy: 'Suresh Singh',
  },
];

const sampleTripLogs: TripLog[] = [
  {
    id: '1',
    busId: '1',
    routeId: '1',
    driverId: '1',
    date: '2023-09-18',
    startTime: '06:45',
    endTime: '08:30',
    status: 'completed',
    startOdometer: 39580,
    endOdometer: 39598,
    delayMinutes: 0,
  },
  {
    id: '2',
    busId: '2',
    routeId: '2',
    driverId: '2',
    date: '2023-09-18',
    startTime: '06:45',
    endTime: '08:35',
    status: 'completed',
    startOdometer: 36420,
    endOdometer: 36437,
    deviationNotes: 'Traffic congestion at Banashankari signal',
    delayMinutes: 5,
  },
];

const sampleStudents: Student[] = [
  {
    id: '1',
    name: 'Amit Sharma',
    grade: '8',
    section: 'A',
    routeId: '1',
    stopId: 's1',
    contactNumber: '9876543210',
    parentName: 'Ramesh Sharma',
    parentContact: '9876543211',
    pickupTime: '07:15',
    dropTime: '16:00',
    address: '45, Hebbal Layout, Bangalore',
  },
  {
    id: '2',
    name: 'Priya Patel',
    grade: '6',
    section: 'B',
    routeId: '1',
    stopId: 's2',
    contactNumber: '8765432109',
    parentName: 'Suresh Patel',
    parentContact: '8765432110',
    pickupTime: '07:30',
    dropTime: '16:15',
    address: '78, Manyata Residency, Bangalore',
  },
  {
    id: '3',
    name: 'Rahul Gupta',
    grade: '9',
    section: 'A',
    routeId: '2',
    stopId: 's4',
    contactNumber: '7654321098',
    parentName: 'Mahesh Gupta',
    parentContact: '7654321099',
    pickupTime: '07:20',
    dropTime: '16:05',
    address: '123, Jayanagar 4th Block, Bangalore',
  },
];

// Provider component
export const BusTrackingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [buses, setBuses] = useState<Bus[]>(sampleBuses);
  const [drivers, setDrivers] = useState<Driver[]>(sampleDrivers);
  const [routes, setRoutes] = useState<BusRoute[]>(sampleRoutes);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(sampleMaintenanceRecords);
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>(sampleFuelRecords);
  const [tripLogs, setTripLogs] = useState<TripLog[]>(sampleTripLogs);
  const [students, setStudents] = useState<Student[]>(sampleStudents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from API or localStorage
  useEffect(() => {
    // Simulate API loading
    setLoading(true);
    
    // Here you would normally fetch data from an API
    // For now, we're using sample data
    
    // Simulate completion
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Bus CRUD operations
  const addBus = async (bus: Omit<Bus, 'id'>) => {
    try {
      setLoading(true);
      // Simulate API call
      const newBus: Bus = {
        ...bus,
        id: Date.now().toString(),
      };
      setBuses([...buses, newBus]);
    } catch (err) {
      setError('Failed to add bus. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateBus = async (id: string, bus: Partial<Bus>) => {
    try {
      setLoading(true);
      // Simulate API call
      setBuses(
        buses.map((b) => (b.id === id ? { ...b, ...bus } : b))
      );
    } catch (err) {
      setError('Failed to update bus. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBus = async (id: string) => {
    try {
      setLoading(true);
      // Simulate API call
      setBuses(buses.filter((b) => b.id !== id));
    } catch (err) {
      setError('Failed to delete bus. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Driver CRUD operations
  const addDriver = async (driver: Omit<Driver, 'id'>) => {
    try {
      setLoading(true);
      // Simulate API call
      const newDriver: Driver = {
        ...driver,
        id: Date.now().toString(),
      };
      setDrivers([...drivers, newDriver]);
    } catch (err) {
      setError('Failed to add driver. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateDriver = async (id: string, driver: Partial<Driver>) => {
    try {
      setLoading(true);
      // Simulate API call
      setDrivers(
        drivers.map((d) => (d.id === id ? { ...d, ...driver } : d))
      );
    } catch (err) {
      setError('Failed to update driver. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteDriver = async (id: string) => {
    try {
      setLoading(true);
      // Simulate API call
      setDrivers(drivers.filter((d) => d.id !== id));
    } catch (err) {
      setError('Failed to delete driver. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Route CRUD operations
  const addRoute = async (route: Omit<BusRoute, 'id'>) => {
    try {
      setLoading(true);
      // Simulate API call
      const newRoute: BusRoute = {
        ...route,
        id: Date.now().toString(),
      };
      setRoutes([...routes, newRoute]);
    } catch (err) {
      setError('Failed to add route. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateRoute = async (id: string, route: Partial<BusRoute>) => {
    try {
      setLoading(true);
      // Simulate API call
      setRoutes(
        routes.map((r) => (r.id === id ? { ...r, ...route } : r))
      );
    } catch (err) {
      setError('Failed to update route. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoute = async (id: string) => {
    try {
      setLoading(true);
      // Simulate API call
      setRoutes(routes.filter((r) => r.id !== id));
    } catch (err) {
      setError('Failed to delete route. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Maintenance CRUD operations
  const addMaintenanceRecord = async (record: Omit<MaintenanceRecord, 'id'>) => {
    try {
      setLoading(true);
      // Simulate API call
      const newRecord: MaintenanceRecord = {
        ...record,
        id: Date.now().toString(),
      };
      setMaintenanceRecords([...maintenanceRecords, newRecord]);
    } catch (err) {
      setError('Failed to add maintenance record. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateMaintenanceRecord = async (id: string, record: Partial<MaintenanceRecord>) => {
    try {
      setLoading(true);
      // Simulate API call
      setMaintenanceRecords(
        maintenanceRecords.map((r) => (r.id === id ? { ...r, ...record } : r))
      );
    } catch (err) {
      setError('Failed to update maintenance record. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMaintenanceRecord = async (id: string) => {
    try {
      setLoading(true);
      // Simulate API call
      setMaintenanceRecords(maintenanceRecords.filter((r) => r.id !== id));
    } catch (err) {
      setError('Failed to delete maintenance record. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fuel CRUD operations
  const addFuelRecord = async (record: Omit<FuelRecord, 'id'>) => {
    try {
      setLoading(true);
      // Simulate API call
      const newRecord: FuelRecord = {
        ...record,
        id: Date.now().toString(),
      };
      setFuelRecords([...fuelRecords, newRecord]);
    } catch (err) {
      setError('Failed to add fuel record. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateFuelRecord = async (id: string, record: Partial<FuelRecord>) => {
    try {
      setLoading(true);
      // Simulate API call
      setFuelRecords(
        fuelRecords.map((r) => (r.id === id ? { ...r, ...record } : r))
      );
    } catch (err) {
      setError('Failed to update fuel record. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteFuelRecord = async (id: string) => {
    try {
      setLoading(true);
      // Simulate API call
      setFuelRecords(fuelRecords.filter((r) => r.id !== id));
    } catch (err) {
      setError('Failed to delete fuel record. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add a function to fetch trip logs from the API
  const fetchTripLogs = async () => {
    try {
      setLoading(true);
      const response = await transportService.trip.getAllTrips();
      
      if (response.success) {
        // Map backend data to frontend format if needed
        const formattedTrips = response.data.map((trip: any) => ({
          ...trip,
          // Convert status from backend format to frontend format if needed
          status: trip.status.toLowerCase()
        }));
        
        setTripLogs(formattedTrips);
      } else {
        setError(response.error || 'Failed to fetch trip logs');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching trip logs');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch trip logs on component mount
  useEffect(() => {
    fetchTripLogs();
  }, []);

  // Replace the Trip Log operations with API calls
  const addTripLog = async (log: Omit<TripLog, 'id'>) => {
    try {
      setLoading(true);
      
      // Create a new trip log via API
      const apiLog = {
        ...log,
        // Convert status to uppercase if backend expects it
        status: log.status.toUpperCase()
      };
      
      const response = await transportService.trip.createTrip(apiLog);
      
      if (response.success) {
        // Add to local state with data from API response
        const newLog = {
          ...response.data,
          // Convert status from backend format to frontend format if needed
          status: response.data.status.toLowerCase()
        };
        
        setTripLogs(prev => [...prev, newLog]);
      } else {
        setError(response.error || 'Failed to create trip');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while adding a trip log');
    } finally {
      setLoading(false);
    }
  };

  const updateTripLog = async (id: string, log: Partial<TripLog>) => {
    try {
      setLoading(true);
      
      // Prepare the update data for API
      const apiUpdateData = { ...log };
      if (apiUpdateData.status) {
        apiUpdateData.status = apiUpdateData.status.toUpperCase();
      }
      
      const response = await transportService.trip.updateTrip(id, apiUpdateData);
      
      if (response.success) {
        // Update local state with data from API response
        const updatedLog = {
          ...response.data,
          // Convert status from backend format to frontend format if needed
          status: response.data.status.toLowerCase()
        };
        
        setTripLogs(prev => prev.map(item => item.id === id ? { ...item, ...updatedLog } : item));
      } else {
        setError(response.error || 'Failed to update trip');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating a trip log');
    } finally {
      setLoading(false);
    }
  };

  const deleteTripLog = async (id: string) => {
    try {
      setLoading(true);
      
      const response = await transportService.trip.deleteTrip(id);
      
      if (response.success) {
        // Remove from local state if API call was successful
        setTripLogs(prev => prev.filter(log => log.id !== id));
      } else {
        setError(response.error || 'Failed to delete trip');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while deleting a trip log');
    } finally {
      setLoading(false);
    }
  };

  // Student operations
  const addStudent = async (student: Omit<Student, 'id'>) => {
    try {
      setLoading(true);
      // Simulate API call
      const newStudent: Student = {
        ...student,
        id: Date.now().toString(),
      };
      setStudents([...students, newStudent]);
    } catch (err) {
      setError('Failed to add student. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (id: string, student: Partial<Student>) => {
    try {
      setLoading(true);
      // Simulate API call
      setStudents(
        students.map((s) => (s.id === id ? { ...s, ...student } : s))
      );
    } catch (err) {
      setError('Failed to update student. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      setLoading(true);
      // Simulate API call
      setStudents(students.filter((s) => s.id !== id));
    } catch (err) {
      setError('Failed to delete student. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getStudentsByRoute = (routeId: string) => {
    return students.filter((student) => student.routeId === routeId);
  };

  const getBusesInMaintenance = () => {
    return buses.filter((bus) => bus.status === 'maintenance');
  };

  const getActiveTrips = () => {
    return tripLogs.filter((trip) => trip.status === 'in-progress');
  };

  const getRoutesWithBuses = () => {
    return routes.map((route) => ({
      ...route,
      bus: buses.find((bus) => bus.id === route.assignedBus),
    }));
  };

  const value = {
    buses,
    drivers,
    routes,
    maintenanceRecords,
    fuelRecords,
    tripLogs,
    students,
    addBus,
    updateBus,
    deleteBus,
    addDriver,
    updateDriver,
    deleteDriver,
    addRoute,
    updateRoute,
    deleteRoute,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    addFuelRecord,
    updateFuelRecord,
    deleteFuelRecord,
    addTripLog,
    updateTripLog,
    deleteTripLog,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentsByRoute,
    getBusesInMaintenance,
    getActiveTrips,
    getRoutesWithBuses,
    loading,
    error,
    setError,
    fetchTripLogs,
  };

  return (
    <BusTrackingContext.Provider value={value}>
      {children}
    </BusTrackingContext.Provider>
  );
};

// Custom hook for using the Bus Tracking context
export const useBusTracking = () => {
  const context = useContext(BusTrackingContext);
  if (context === undefined) {
    throw new Error('useBusTracking must be used within a BusTrackingProvider');
  }
  return context;
}; 
