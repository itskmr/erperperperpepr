// Status types for various entities
export type MaintenanceStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'Overdue';
export type BusStatus = 'Active' | 'InMaintenance' | 'OutOfService' | 'Reserved';
export type RouteStatus = 'OnTime' | 'Delayed' | 'Completed' | 'Cancelled' | 'NotStarted';
export type DriverStatus = 'Available' | 'OnDuty' | 'OnLeave' | 'Former';
export type FuelType = 'Diesel' | 'Petrol' | 'CNG' | 'Electric' | 'Hybrid';

// Bus entity
export interface Bus {
  id: string;
  vehicleNumber: string;
  model: string;
  make: string;
  year: number;
  capacity: number;
  fuelType: FuelType;
  status: BusStatus;
  registrationDate: string;
  insuranceExpiryDate: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  fuelEfficiency: number; // km per liter
  gpsDeviceId?: string;
  currentLocationLat?: number;
  currentLocationLng?: number;
  lastUpdated?: string;
  notes?: string;
  imageUrl?: string;
}

// Driver entity
export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  contactNumber: string;
  email?: string;
  address: string;
  joiningDate: string;
  status: DriverStatus;
  dateOfBirth: string;
  emergencyContact: string;
  bloodGroup?: string;
  rating?: number;
  photo?: string;
  assignedBusId?: string;
  assignedBus?: Bus;
}

// Route entity
export interface BusRoute {
  id: string;
  name: string;
  description?: string;
  startPoint: string;
  endPoint: string;
  distance: number; // in km
  estimatedDuration: number; // in minutes
  assignedBusId?: string;
  assignedDriverId?: string;
  assignedBus?: Bus;
  assignedDriver?: Driver;
  stops: RouteStop[];
  schedules: RouteSchedule[];
  status: RouteStatus;
}

// Route Stop entity
export interface RouteStop {
  id: string;
  name: string;
  order: number;
  latitude: number;
  longitude: number;
  estimatedArrivalTime?: string;
  estimatedDepartureTime?: string;
  studentsToPickup: number;
  studentsToDropoff: number;
}

// Route Schedule entity
export interface RouteSchedule {
  id: string;
  routeId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  type: 'Regular' | 'SpecialEvent';
  isActive: boolean;
}

// Student Bus Assignment entity
export interface StudentBusAssignment {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  busId: string;
  routeId: string;
  pickupStopId: string;
  dropoffStopId: string;
  pickupTime: string;
  dropoffTime: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  guardianContact: string;
  alternateContact?: string;
  specialNotes?: string;
}

// Maintenance Record entity
export interface MaintenanceRecord {
  id: string;
  busId: string;
  date: string;
  type: 'Regular' | 'Repair' | 'Inspection';
  description: string;
  cost: number;
  vendor: string;
  odometer: number;
  status: MaintenanceStatus;
  nextMaintenanceDate?: string;
  completedBy?: string;
  notes?: string;
  attachments?: string[];
}

// Fuel Consumption Record entity
export interface FuelRecord {
  id: string;
  busId: string;
  date: string;
  fuelAmount: number; // in liters
  cost: number;
  odometer: number;
  filledBy: string;
  fuelStation?: string;
  notes?: string;
  receiptImage?: string;
}

// Trip Log entity for actual trips
export interface TripLog {
  id: string;
  routeId: string;
  busId: string;
  driverId: string;
  date: string;
  actualStartTime: string;
  actualEndTime?: string;
  status: RouteStatus;
  actualDistance?: number;
  fuelConsumed?: number;
  actualDuration?: number;
  incidents?: string[];
  weather?: string;
  trafficConditions?: string;
  studentAttendance?: TripStudentAttendance[];
  stopLogs: TripStopLog[];
}

// Trip Stop Log entity
export interface TripStopLog {
  id: string;
  tripId: string;
  stopId: string;
  stopName: string;
  scheduledArrivalTime: string;
  actualArrivalTime?: string;
  delay?: number; // in minutes
  studentsPickedUp: number;
  studentsDroppedOff: number;
  notes?: string;
}

// Trip Student Attendance entity
export interface TripStudentAttendance {
  studentId: string;
  studentName: string;
  wasPickedUp: boolean;
  wasDroppedOff: boolean;
  pickupTime?: string;
  dropoffTime?: string;
  notes?: string;
}

// Alert entity for notifications
export interface BusAlert {
  id: string;
  type: 'Delay' | 'Breakdown' | 'Accident' | 'RouteChange' | 'MaintenanceDue' | 'Other';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  message: string;
  busId?: string;
  routeId?: string;
  driverId?: string;
  timestamp: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  actions?: string[];
}

// Bus Tracking System State (for context)
export interface BusTrackingState {
  buses: Bus[];
  drivers: Driver[];
  routes: BusRoute[];
  assignments: StudentBusAssignment[];
  maintenanceRecords: MaintenanceRecord[];
  fuelRecords: FuelRecord[];
  tripLogs: TripLog[];
  alerts: BusAlert[];
  isLoading: boolean;
  error: string | null;
}

// Actions for state management
export type BusTrackingAction =
  | { type: 'FETCH_DATA_START' }
  | { type: 'FETCH_DATA_SUCCESS'; payload: Partial<BusTrackingState> }
  | { type: 'FETCH_DATA_ERROR'; payload: string }
  | { type: 'ADD_BUS'; payload: Bus }
  | { type: 'UPDATE_BUS'; payload: Bus }
  | { type: 'DELETE_BUS'; payload: string }
  | { type: 'ADD_DRIVER'; payload: Driver }
  | { type: 'UPDATE_DRIVER'; payload: Driver }
  | { type: 'DELETE_DRIVER'; payload: string }
  | { type: 'ADD_ROUTE'; payload: BusRoute }
  | { type: 'UPDATE_ROUTE'; payload: BusRoute }
  | { type: 'DELETE_ROUTE'; payload: string }
  | { type: 'ADD_ASSIGNMENT'; payload: StudentBusAssignment }
  | { type: 'UPDATE_ASSIGNMENT'; payload: StudentBusAssignment }
  | { type: 'DELETE_ASSIGNMENT'; payload: string }
  | { type: 'ADD_MAINTENANCE'; payload: MaintenanceRecord }
  | { type: 'UPDATE_MAINTENANCE'; payload: MaintenanceRecord }
  | { type: 'DELETE_MAINTENANCE'; payload: string }
  | { type: 'ADD_FUEL_RECORD'; payload: FuelRecord }
  | { type: 'UPDATE_FUEL_RECORD'; payload: FuelRecord }
  | { type: 'DELETE_FUEL_RECORD'; payload: string }
  | { type: 'ADD_TRIP_LOG'; payload: TripLog }
  | { type: 'UPDATE_TRIP_LOG'; payload: TripLog }
  | { type: 'DELETE_TRIP_LOG'; payload: string }
  | { type: 'ADD_ALERT'; payload: BusAlert }
  | { type: 'RESOLVE_ALERT'; payload: string }
  | { type: 'DELETE_ALERT'; payload: string }; 