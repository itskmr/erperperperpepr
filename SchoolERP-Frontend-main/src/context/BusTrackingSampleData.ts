import {
  Bus,
  Driver,
  BusRoute,
  RouteStop,
  RouteSchedule,
  StudentBusAssignment,
  MaintenanceRecord,
  FuelRecord,
  TripLog,
  BusAlert,
  TripStopLog
} from '../components/Schools/BusTrackingTypes';

// Sample Buses
export const sampleBuses: Bus[] = [
  {
    id: 'bus-001',
    vehicleNumber: 'KA-01-MX-1234',
    model: 'Ashok Leyland Falcon',
    make: 'Ashok Leyland',
    year: 2020,
    capacity: 42,
    fuelType: 'Diesel',
    status: 'Active',
    registrationDate: '2020-01-15',
    insuranceExpiryDate: '2024-01-14',
    lastMaintenanceDate: '2023-10-05',
    nextMaintenanceDate: '2024-01-05',
    fuelEfficiency: 4.2,
    gpsDeviceId: 'GPS-001-AL',
    currentLocationLat: 12.9716,
    currentLocationLng: 77.5946,
    lastUpdated: new Date().toISOString(),
    notes: 'Primary school bus, excellent condition',
    imageUrl: 'https://example.com/images/bus-001.jpg'
  },
  {
    id: 'bus-002',
    vehicleNumber: 'KA-01-MX-5678',
    model: 'Tata Starbus Ultra',
    make: 'Tata Motors',
    year: 2021,
    capacity: 36,
    fuelType: 'CNG',
    status: 'Active',
    registrationDate: '2021-03-10',
    insuranceExpiryDate: '2024-03-09',
    lastMaintenanceDate: '2023-11-12',
    nextMaintenanceDate: '2024-02-12',
    fuelEfficiency: 5.1,
    gpsDeviceId: 'GPS-002-TM',
    currentLocationLat: 12.9342,
    currentLocationLng: 77.6102,
    lastUpdated: new Date().toISOString(),
    notes: 'Secondary school bus, CNG converted',
    imageUrl: 'https://example.com/images/bus-002.jpg'
  },
  {
    id: 'bus-003',
    vehicleNumber: 'KA-01-MY-9012',
    model: 'BharatBenz 1014',
    make: 'BharatBenz',
    year: 2022,
    capacity: 50,
    fuelType: 'Diesel',
    status: 'InMaintenance',
    registrationDate: '2022-05-20',
    insuranceExpiryDate: '2025-05-19',
    lastMaintenanceDate: '2023-12-01',
    nextMaintenanceDate: '2024-03-01',
    fuelEfficiency: 4.5,
    gpsDeviceId: 'GPS-003-BB',
    notes: 'Undergoing scheduled maintenance, engine overhaul',
    imageUrl: 'https://example.com/images/bus-003.jpg'
  },
  {
    id: 'bus-004',
    vehicleNumber: 'KA-01-MZ-3456',
    model: 'Eicher Skyline Pro',
    make: 'Eicher',
    year: 2021,
    capacity: 38,
    fuelType: 'Diesel',
    status: 'Active',
    registrationDate: '2021-07-18',
    insuranceExpiryDate: '2024-07-17',
    lastMaintenanceDate: '2023-10-22',
    nextMaintenanceDate: '2024-01-22',
    fuelEfficiency: 4.8,
    gpsDeviceId: 'GPS-004-EI',
    currentLocationLat: 12.9230,
    currentLocationLng: 77.5970,
    lastUpdated: new Date().toISOString(),
    notes: 'Used for sports team transport',
    imageUrl: 'https://example.com/images/bus-004.jpg'
  },
  {
    id: 'bus-005',
    vehicleNumber: 'KA-01-NA-7890',
    model: 'Force Traveller',
    make: 'Force Motors',
    year: 2023,
    capacity: 26,
    fuelType: 'Diesel',
    status: 'Active',
    registrationDate: '2023-01-05',
    insuranceExpiryDate: '2026-01-04',
    lastMaintenanceDate: '2023-11-30',
    nextMaintenanceDate: '2024-02-28',
    fuelEfficiency: 6.2,
    gpsDeviceId: 'GPS-005-FM',
    currentLocationLat: 12.9010,
    currentLocationLng: 77.6150,
    lastUpdated: new Date().toISOString(),
    notes: 'Newest addition to the fleet, for primary school trips',
    imageUrl: 'https://example.com/images/bus-005.jpg'
  }
];

// Sample Drivers
export const sampleDrivers: Driver[] = [
  {
    id: 'driver-001',
    name: 'Rajesh Kumar',
    licenseNumber: 'KA50-20210004567',
    licenseExpiryDate: '2026-05-14',
    contactNumber: '+91 9876543210',
    email: 'rajesh.kumar@example.com',
    address: '123 Main Street, Bengaluru, Karnataka',
    joiningDate: '2018-04-10',
    status: 'OnDuty',
    dateOfBirth: '1985-06-15',
    emergencyContact: '+91 9876543211',
    bloodGroup: 'O+',
    rating: 4.8,
    photo: 'https://example.com/driver-photos/rajesh.jpg',
    assignedBusId: 'bus-001'
  },
  {
    id: 'driver-002',
    name: 'Suresh Patel',
    licenseNumber: 'KA50-20190003421',
    licenseExpiryDate: '2025-08-22',
    contactNumber: '+91 9876543220',
    email: 'suresh.patel@example.com',
    address: '456 Park Avenue, Bengaluru, Karnataka',
    joiningDate: '2019-06-02',
    status: 'OnDuty',
    dateOfBirth: '1990-03-22',
    emergencyContact: '+91 9876543221',
    bloodGroup: 'B+',
    rating: 4.5,
    photo: 'https://example.com/driver-photos/suresh.jpg',
    assignedBusId: 'bus-002'
  },
  {
    id: 'driver-003',
    name: 'Venkatesh Rao',
    licenseNumber: 'KA50-20170002345',
    licenseExpiryDate: '2024-12-10',
    contactNumber: '+91 9876543230',
    email: 'venkatesh.rao@example.com',
    address: '789 School Road, Bengaluru, Karnataka',
    joiningDate: '2017-08-15',
    status: 'OnLeave',
    dateOfBirth: '1978-11-05',
    emergencyContact: '+91 9876543231',
    bloodGroup: 'A-',
    rating: 4.9,
    photo: 'https://example.com/driver-photos/venkatesh.jpg',
    assignedBusId: 'bus-003'
  },
  {
    id: 'driver-004',
    name: 'Abdul Karim',
    licenseNumber: 'KA50-20200003789',
    licenseExpiryDate: '2025-11-18',
    contactNumber: '+91 9876543240',
    email: 'abdul.karim@example.com',
    address: '101 Garden Avenue, Bengaluru, Karnataka',
    joiningDate: '2020-02-20',
    status: 'OnDuty',
    dateOfBirth: '1987-09-12',
    emergencyContact: '+91 9876543241',
    bloodGroup: 'AB+',
    rating: 4.7,
    photo: 'https://example.com/driver-photos/abdul.jpg',
    assignedBusId: 'bus-004'
  },
  {
    id: 'driver-005',
    name: 'Ramanuj Singh',
    licenseNumber: 'KA50-20220004123',
    licenseExpiryDate: '2027-03-25',
    contactNumber: '+91 9876543250',
    email: 'ramanuj.singh@example.com',
    address: '222 Ring Road, Bengaluru, Karnataka',
    joiningDate: '2022-01-10',
    status: 'Available',
    dateOfBirth: '1992-05-30',
    emergencyContact: '+91 9876543251',
    bloodGroup: 'O-',
    rating: 4.6,
    photo: 'https://example.com/driver-photos/ramanuj.jpg',
    assignedBusId: 'bus-005'
  }
];

// Sample Route Stops
const routeAStops: RouteStop[] = [
  {
    id: 'stop-a-1',
    name: 'Green Park Junction',
    order: 1,
    latitude: 12.9516,
    longitude: 77.5900,
    estimatedArrivalTime: '07:00:00',
    estimatedDepartureTime: '07:02:00',
    studentsToPickup: 8,
    studentsToDropoff: 0
  },
  {
    id: 'stop-a-2',
    name: 'Shivajinagar Market',
    order: 2,
    latitude: 12.9615,
    longitude: 77.5969,
    estimatedArrivalTime: '07:10:00',
    estimatedDepartureTime: '07:13:00',
    studentsToPickup: 12,
    studentsToDropoff: 0
  },
  {
    id: 'stop-a-3',
    name: 'Railway Colony',
    order: 3,
    latitude: 12.9785,
    longitude: 77.6037,
    estimatedArrivalTime: '07:22:00',
    estimatedDepartureTime: '07:25:00',
    studentsToPickup: 10,
    studentsToDropoff: 0
  },
  {
    id: 'stop-a-4',
    name: 'Main School Gate',
    order: 4,
    latitude: 12.9835,
    longitude: 77.6150,
    estimatedArrivalTime: '07:40:00',
    estimatedDepartureTime: '07:45:00',
    studentsToPickup: 0,
    studentsToDropoff: 30
  }
];

const routeBStops: RouteStop[] = [
  {
    id: 'stop-b-1',
    name: 'Sunshine Apartments',
    order: 1,
    latitude: 12.9216,
    longitude: 77.5800,
    estimatedArrivalTime: '07:05:00',
    estimatedDepartureTime: '07:08:00',
    studentsToPickup: 6,
    studentsToDropoff: 0
  },
  {
    id: 'stop-b-2',
    name: 'West End Circle',
    order: 2,
    latitude: 12.9385,
    longitude: 77.5869,
    estimatedArrivalTime: '07:15:00',
    estimatedDepartureTime: '07:18:00',
    studentsToPickup: 8,
    studentsToDropoff: 0
  },
  {
    id: 'stop-b-3',
    name: 'City Center Mall',
    order: 3,
    latitude: 12.9585,
    longitude: 77.5937,
    estimatedArrivalTime: '07:25:00',
    estimatedDepartureTime: '07:28:00',
    studentsToPickup: 10,
    studentsToDropoff: 0
  },
  {
    id: 'stop-b-4',
    name: 'Main School Gate',
    order: 4,
    latitude: 12.9835,
    longitude: 77.6150,
    estimatedArrivalTime: '07:40:00',
    estimatedDepartureTime: '07:45:00',
    studentsToPickup: 0,
    studentsToDropoff: 24
  }
];

// Sample Route Schedules
const routeASchedules: RouteSchedule[] = [
  {
    id: 'schedule-a-1',
    routeId: 'route-001',
    dayOfWeek: 'Monday',
    startTime: '07:00:00',
    endTime: '08:00:00',
    type: 'Regular',
    isActive: true
  },
  {
    id: 'schedule-a-2',
    routeId: 'route-001',
    dayOfWeek: 'Tuesday',
    startTime: '07:00:00',
    endTime: '08:00:00',
    type: 'Regular',
    isActive: true
  },
  {
    id: 'schedule-a-3',
    routeId: 'route-001',
    dayOfWeek: 'Wednesday',
    startTime: '07:00:00',
    endTime: '08:00:00',
    type: 'Regular',
    isActive: true
  },
  {
    id: 'schedule-a-4',
    routeId: 'route-001',
    dayOfWeek: 'Thursday',
    startTime: '07:00:00',
    endTime: '08:00:00',
    type: 'Regular',
    isActive: true
  },
  {
    id: 'schedule-a-5',
    routeId: 'route-001',
    dayOfWeek: 'Friday',
    startTime: '07:00:00',
    endTime: '08:00:00',
    type: 'Regular',
    isActive: true
  }
];

const routeBSchedules: RouteSchedule[] = [
  {
    id: 'schedule-b-1',
    routeId: 'route-002',
    dayOfWeek: 'Monday',
    startTime: '07:05:00',
    endTime: '08:05:00',
    type: 'Regular',
    isActive: true
  },
  {
    id: 'schedule-b-2',
    routeId: 'route-002',
    dayOfWeek: 'Tuesday',
    startTime: '07:05:00',
    endTime: '08:05:00',
    type: 'Regular',
    isActive: true
  },
  {
    id: 'schedule-b-3',
    routeId: 'route-002',
    dayOfWeek: 'Wednesday',
    startTime: '07:05:00',
    endTime: '08:05:00',
    type: 'Regular',
    isActive: true
  },
  {
    id: 'schedule-b-4',
    routeId: 'route-002',
    dayOfWeek: 'Thursday',
    startTime: '07:05:00',
    endTime: '08:05:00',
    type: 'Regular',
    isActive: true
  },
  {
    id: 'schedule-b-5',
    routeId: 'route-002',
    dayOfWeek: 'Friday',
    startTime: '07:05:00',
    endTime: '08:05:00',
    type: 'Regular',
    isActive: true
  }
];

// Sample Routes
export const sampleRoutes: BusRoute[] = [
  {
    id: 'route-001',
    name: 'North Route',
    description: 'Covers northern part of the city including Green Park and Railway Colony',
    startPoint: 'Green Park Junction',
    endPoint: 'Main School Gate',
    distance: 15.2,
    estimatedDuration: 40,
    assignedBusId: 'bus-001',
    assignedDriverId: 'driver-001',
    stops: routeAStops,
    schedules: routeASchedules,
    status: 'OnTime'
  },
  {
    id: 'route-002',
    name: 'West Route',
    description: 'Covers western part of the city including Sunshine Apartments and City Center',
    startPoint: 'Sunshine Apartments',
    endPoint: 'Main School Gate',
    distance: 12.8,
    estimatedDuration: 35,
    assignedBusId: 'bus-002',
    assignedDriverId: 'driver-002',
    stops: routeBStops,
    schedules: routeBSchedules,
    status: 'OnTime'
  }
];

// Sample Student Assignments
export const sampleAssignments: StudentBusAssignment[] = [
  {
    id: 'assignment-001',
    studentId: 'student-001',
    studentName: 'Aarav Sharma',
    studentClass: 'Class 5A',
    busId: 'bus-001',
    routeId: 'route-001',
    pickupStopId: 'stop-a-1',
    dropoffStopId: 'stop-a-4',
    pickupTime: '07:00:00',
    dropoffTime: '16:00:00',
    startDate: '2023-06-01',
    isActive: true,
    guardianContact: '+91 9876543260',
    alternateContact: '+91 9876543261',
    specialNotes: 'Has asthma, carries inhaler'
  },
  {
    id: 'assignment-002',
    studentId: 'student-002',
    studentName: 'Diya Patel',
    studentClass: 'Class 7B',
    busId: 'bus-001',
    routeId: 'route-001',
    pickupStopId: 'stop-a-2',
    dropoffStopId: 'stop-a-4',
    pickupTime: '07:10:00',
    dropoffTime: '16:00:00',
    startDate: '2023-06-01',
    isActive: true,
    guardianContact: '+91 9876543262',
    specialNotes: 'Needs to be dropped off first at the stop'
  },
  {
    id: 'assignment-003',
    studentId: 'student-003',
    studentName: 'Vikram Singh',
    studentClass: 'Class 9C',
    busId: 'bus-002',
    routeId: 'route-002',
    pickupStopId: 'stop-b-1',
    dropoffStopId: 'stop-b-4',
    pickupTime: '07:05:00',
    dropoffTime: '16:05:00',
    startDate: '2023-06-01',
    isActive: true,
    guardianContact: '+91 9876543263',
    alternateContact: '+91 9876543264'
  },
  {
    id: 'assignment-004',
    studentId: 'student-004',
    studentName: 'Ananya Reddy',
    studentClass: 'Class 6A',
    busId: 'bus-002',
    routeId: 'route-002',
    pickupStopId: 'stop-b-3',
    dropoffStopId: 'stop-b-4',
    pickupTime: '07:25:00',
    dropoffTime: '16:05:00',
    startDate: '2023-06-01',
    isActive: true,
    guardianContact: '+91 9876543265',
    specialNotes: 'Has younger sibling on the same bus'
  },
  {
    id: 'assignment-005',
    studentId: 'student-005',
    studentName: 'Rohan Reddy',
    studentClass: 'Class 3B',
    busId: 'bus-002',
    routeId: 'route-002',
    pickupStopId: 'stop-b-3',
    dropoffStopId: 'stop-b-4',
    pickupTime: '07:25:00',
    dropoffTime: '16:05:00',
    startDate: '2023-06-01',
    isActive: true,
    guardianContact: '+91 9876543265',
    specialNotes: 'Younger sibling of Ananya Reddy'
  }
];

// Sample Maintenance Records
export const sampleMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 'maintenance-001',
    busId: 'bus-001',
    date: '2023-10-05',
    type: 'Regular',
    description: 'Routine service, oil change, filter replacement',
    cost: 8500,
    vendor: 'Ashok Leyland Service Center',
    odometer: 45678,
    status: 'Completed',
    nextMaintenanceDate: '2024-01-05',
    completedBy: 'Rajiv Mechanic',
    notes: 'All systems normal, brake pads at 70%'
  },
  {
    id: 'maintenance-002',
    busId: 'bus-002',
    date: '2023-11-12',
    type: 'Regular',
    description: 'Quarterly service, brake inspection',
    cost: 7200,
    vendor: 'Tata Authorized Workshop',
    odometer: 32456,
    status: 'Completed',
    nextMaintenanceDate: '2024-02-12',
    completedBy: 'Sanjay Technician',
    notes: 'Front right tire showing wear, to be monitored'
  },
  {
    id: 'maintenance-003',
    busId: 'bus-003',
    date: '2023-12-01',
    type: 'Repair',
    description: 'Engine overhaul, clutch replacement',
    cost: 45000,
    vendor: 'BharatBenz Service Station',
    odometer: 78234,
    status: 'InProgress',
    notes: 'Major repair, expected completion by Dec 15'
  },
  {
    id: 'maintenance-004',
    busId: 'bus-004',
    date: '2023-10-22',
    type: 'Regular',
    description: 'Scheduled maintenance, A/C service',
    cost: 6800,
    vendor: 'Eicher Service Center',
    odometer: 28976,
    status: 'Completed',
    nextMaintenanceDate: '2024-01-22',
    completedBy: 'Praveen Service Engineer',
    notes: 'A/C performance improved after servicing'
  },
  {
    id: 'maintenance-005',
    busId: 'bus-005',
    date: '2023-11-30',
    type: 'Inspection',
    description: 'RTO inspection and compliance check',
    cost: 2500,
    vendor: 'Government RTO Office',
    odometer: 12345,
    status: 'Completed',
    nextMaintenanceDate: '2024-02-28',
    completedBy: 'RTO Officer',
    notes: 'All documents verified, passed all tests'
  },
  {
    id: 'maintenance-006',
    busId: 'bus-001',
    date: '2024-01-05',
    type: 'Regular',
    description: 'Upcoming quarterly service',
    cost: 9000,
    vendor: 'Ashok Leyland Service Center',
    odometer: 50000,
    status: 'Scheduled',
    notes: 'Pre-scheduled service'
  }
];

// Sample Fuel Records
export const sampleFuelRecords: FuelRecord[] = [
  {
    id: 'fuel-001',
    busId: 'bus-001',
    date: '2023-12-01',
    fuelAmount: 85,
    cost: 8075,
    odometer: 47890,
    filledBy: 'Rajesh Kumar',
    fuelStation: 'HP Petrol Pump, MG Road',
    notes: 'Full tank fill-up'
  },
  {
    id: 'fuel-002',
    busId: 'bus-002',
    date: '2023-12-02',
    fuelAmount: 12, // CNG in kg
    cost: 1080,
    odometer: 34567,
    filledBy: 'Suresh Patel',
    fuelStation: 'Indraprastha Gas Station, Ring Road',
    notes: 'CNG refill'
  },
  {
    id: 'fuel-003',
    busId: 'bus-004',
    date: '2023-12-03',
    fuelAmount: 72,
    cost: 6840,
    odometer: 30123,
    filledBy: 'Abdul Karim',
    fuelStation: 'Indian Oil, Highway Junction',
    notes: 'Regular fill-up'
  },
  {
    id: 'fuel-004',
    busId: 'bus-005',
    date: '2023-12-04',
    fuelAmount: 65,
    cost: 6175,
    odometer: 13456,
    filledBy: 'Ramanuj Singh',
    fuelStation: 'BPCL Pump, City Center',
    notes: 'Partial fill-up'
  },
  {
    id: 'fuel-005',
    busId: 'bus-001',
    date: '2023-12-08',
    fuelAmount: 80,
    cost: 7600,
    odometer: 48367,
    filledBy: 'Rajesh Kumar',
    fuelStation: 'HP Petrol Pump, MG Road',
    notes: 'Almost full tank'
  }
];

// Sample Trip Stop Logs for Trip 001
const tripStopLogs001: TripStopLog[] = [
  {
    id: 'trip-stop-001-1',
    tripId: 'trip-001',
    stopId: 'stop-a-1',
    stopName: 'Green Park Junction',
    scheduledArrivalTime: '07:00:00',
    actualArrivalTime: '07:01:00',
    delay: 1,
    studentsPickedUp: 8,
    studentsDroppedOff: 0,
    notes: 'Slight delay due to traffic'
  },
  {
    id: 'trip-stop-001-2',
    tripId: 'trip-001',
    stopId: 'stop-a-2',
    stopName: 'Shivajinagar Market',
    scheduledArrivalTime: '07:10:00',
    actualArrivalTime: '07:12:00',
    delay: 2,
    studentsPickedUp: 12,
    studentsDroppedOff: 0,
    notes: 'All students present'
  },
  {
    id: 'trip-stop-001-3',
    tripId: 'trip-001',
    stopId: 'stop-a-3',
    stopName: 'Railway Colony',
    scheduledArrivalTime: '07:22:00',
    actualArrivalTime: '07:25:00',
    delay: 3,
    studentsPickedUp: 9,
    studentsDroppedOff: 0,
    notes: '1 student absent'
  },
  {
    id: 'trip-stop-001-4',
    tripId: 'trip-001',
    stopId: 'stop-a-4',
    stopName: 'Main School Gate',
    scheduledArrivalTime: '07:40:00',
    actualArrivalTime: '07:43:00',
    delay: 3,
    studentsPickedUp: 0,
    studentsDroppedOff: 29,
    notes: 'Arrived at school, all students dropped off'
  }
];

// Sample Trip Stop Logs for Trip 002
const tripStopLogs002: TripStopLog[] = [
  {
    id: 'trip-stop-002-1',
    tripId: 'trip-002',
    stopId: 'stop-b-1',
    stopName: 'Sunshine Apartments',
    scheduledArrivalTime: '07:05:00',
    actualArrivalTime: '07:04:00',
    delay: -1,
    studentsPickedUp: 6,
    studentsDroppedOff: 0,
    notes: 'Arrived early'
  },
  {
    id: 'trip-stop-002-2',
    tripId: 'trip-002',
    stopId: 'stop-b-2',
    stopName: 'West End Circle',
    scheduledArrivalTime: '07:15:00',
    actualArrivalTime: '07:13:00',
    delay: -2,
    studentsPickedUp: 8,
    studentsDroppedOff: 0,
    notes: 'All students present'
  },
  {
    id: 'trip-stop-002-3',
    tripId: 'trip-002',
    stopId: 'stop-b-3',
    stopName: 'City Center Mall',
    scheduledArrivalTime: '07:25:00',
    actualArrivalTime: '07:22:00',
    delay: -3,
    studentsPickedUp: 10,
    studentsDroppedOff: 0,
    notes: 'All students present'
  },
  {
    id: 'trip-stop-002-4',
    tripId: 'trip-002',
    stopId: 'stop-b-4',
    stopName: 'Main School Gate',
    scheduledArrivalTime: '07:40:00',
    actualArrivalTime: '07:35:00',
    delay: -5,
    studentsPickedUp: 0,
    studentsDroppedOff: 24,
    notes: 'Arrived at school early, all students dropped off'
  }
];

// Sample Trip Logs
export const sampleTripLogs: TripLog[] = [
  {
    id: 'trip-001',
    routeId: 'route-001',
    busId: 'bus-001',
    driverId: 'driver-001',
    date: '2023-12-04',
    actualStartTime: '07:00:00',
    actualEndTime: '07:43:00',
    status: 'Completed',
    actualDistance: 15.5,
    fuelConsumed: 3.7,
    actualDuration: 43,
    weather: 'Clear',
    trafficConditions: 'Moderate',
    stopLogs: tripStopLogs001
  },
  {
    id: 'trip-002',
    routeId: 'route-002',
    busId: 'bus-002',
    driverId: 'driver-002',
    date: '2023-12-04',
    actualStartTime: '07:04:00',
    actualEndTime: '07:35:00',
    status: 'Completed',
    actualDistance: 12.6,
    fuelConsumed: 2.5,
    actualDuration: 31,
    weather: 'Clear',
    trafficConditions: 'Light',
    stopLogs: tripStopLogs002
  },
  {
    id: 'trip-003',
    routeId: 'route-001',
    busId: 'bus-001',
    driverId: 'driver-001',
    date: '2023-12-05',
    actualStartTime: '07:00:00',
    status: 'OnTime',
    stopLogs: []
  }
];

// Sample Alerts
export const sampleAlerts: BusAlert[] = [
  {
    id: 'alert-001',
    type: 'MaintenanceDue',
    severity: 'Medium',
    message: 'Scheduled maintenance due for Bus KA-01-MX-1234 in 7 days',
    busId: 'bus-001',
    timestamp: '2023-12-01T10:30:00Z',
    isResolved: false,
    actions: ['Schedule Maintenance', 'Postpone']
  },
  {
    id: 'alert-002',
    type: 'Delay',
    severity: 'Low',
    message: 'Bus KA-01-MX-5678 running 5 minutes behind schedule',
    busId: 'bus-002',
    routeId: 'route-002',
    timestamp: '2023-12-04T07:20:00Z',
    isResolved: true,
    resolvedAt: '2023-12-04T07:35:00Z',
    resolvedBy: 'System',
    actions: ['Notify Parents', 'Adjust Schedule']
  },
  {
    id: 'alert-003',
    type: 'Breakdown',
    severity: 'High',
    message: 'Bus KA-01-MY-9012 reported engine issue, requiring immediate attention',
    busId: 'bus-003',
    timestamp: '2023-12-01T08:45:00Z',
    isResolved: true,
    resolvedAt: '2023-12-01T10:30:00Z',
    resolvedBy: 'Maintenance Team',
    actions: ['Dispatch Mechanic', 'Arrange Alternative Transport']
  },
  {
    id: 'alert-004',
    type: 'RouteChange',
    severity: 'Medium',
    message: 'Temporary route change for North Route due to road construction',
    routeId: 'route-001',
    timestamp: '2023-12-03T18:00:00Z',
    isResolved: false,
    actions: ['Notify Parents', 'Update Schedule']
  },
  {
    id: 'alert-005',
    type: 'Other',
    severity: 'Low',
    message: 'Driver Venkatesh Rao requested leave for medical reasons',
    driverId: 'driver-003',
    timestamp: '2023-12-02T14:20:00Z',
    isResolved: true,
    resolvedAt: '2023-12-02T15:00:00Z',
    resolvedBy: 'Transport Manager',
    actions: ['Assign Replacement', 'Approve Leave']
  }
]; 