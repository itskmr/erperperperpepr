import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { 
  BusTrackingState, 
  BusTrackingAction,
  Bus,
  Driver,
  BusRoute,
  StudentBusAssignment,
  MaintenanceRecord,
  FuelRecord,
  TripLog,
  BusAlert
} from '../components/Schools/BusTrackingTypes';

// Sample data for initial state
import { 
  sampleBuses, 
  sampleDrivers, 
  sampleRoutes,
  sampleAssignments, 
  sampleMaintenanceRecords,
  sampleFuelRecords,
  sampleTripLogs,
  sampleAlerts
} from './BusTrackingSampleData';

// Initial state
const initialState: BusTrackingState = {
  buses: sampleBuses,
  drivers: sampleDrivers,
  routes: sampleRoutes,
  assignments: sampleAssignments,
  maintenanceRecords: sampleMaintenanceRecords,
  fuelRecords: sampleFuelRecords,
  tripLogs: sampleTripLogs,
  alerts: sampleAlerts,
  isLoading: false,
  error: null
};

// Create context with initial undefined value
const BusTrackingContext = createContext<{
  state: BusTrackingState;
  dispatch: React.Dispatch<BusTrackingAction>;
} | undefined>(undefined);

// Reducer function for state management
const busTrackingReducer = (state: BusTrackingState, action: BusTrackingAction): BusTrackingState => {
  switch (action.type) {
    case 'FETCH_DATA_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'FETCH_DATA_SUCCESS':
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: null
      };
    case 'FETCH_DATA_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    
    // Bus operations
    case 'ADD_BUS':
      return {
        ...state,
        buses: [...state.buses, action.payload]
      };
    case 'UPDATE_BUS':
      return {
        ...state,
        buses: state.buses.map(bus => 
          bus.id === action.payload.id ? action.payload : bus
        )
      };
    case 'DELETE_BUS':
      return {
        ...state,
        buses: state.buses.filter(bus => bus.id !== action.payload)
      };
    
    // Driver operations
    case 'ADD_DRIVER':
      return {
        ...state,
        drivers: [...state.drivers, action.payload]
      };
    case 'UPDATE_DRIVER':
      return {
        ...state,
        drivers: state.drivers.map(driver => 
          driver.id === action.payload.id ? action.payload : driver
        )
      };
    case 'DELETE_DRIVER':
      return {
        ...state,
        drivers: state.drivers.filter(driver => driver.id !== action.payload)
      };
    
    // Route operations
    case 'ADD_ROUTE':
      return {
        ...state,
        routes: [...state.routes, action.payload]
      };
    case 'UPDATE_ROUTE':
      return {
        ...state,
        routes: state.routes.map(route => 
          route.id === action.payload.id ? action.payload : route
        )
      };
    case 'DELETE_ROUTE':
      return {
        ...state,
        routes: state.routes.filter(route => route.id !== action.payload)
      };
    
    // Assignment operations
    case 'ADD_ASSIGNMENT':
      return {
        ...state,
        assignments: [...state.assignments, action.payload]
      };
    case 'UPDATE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.map(assignment => 
          assignment.id === action.payload.id ? action.payload : assignment
        )
      };
    case 'DELETE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.filter(assignment => assignment.id !== action.payload)
      };

    // Maintenance operations
    case 'ADD_MAINTENANCE':
      return {
        ...state,
        maintenanceRecords: [...state.maintenanceRecords, action.payload]
      };
    case 'UPDATE_MAINTENANCE':
      return {
        ...state,
        maintenanceRecords: state.maintenanceRecords.map(record => 
          record.id === action.payload.id ? action.payload : record
        )
      };
    case 'DELETE_MAINTENANCE':
      return {
        ...state,
        maintenanceRecords: state.maintenanceRecords.filter(record => record.id !== action.payload)
      };

    // Fuel record operations
    case 'ADD_FUEL_RECORD':
      return {
        ...state,
        fuelRecords: [...state.fuelRecords, action.payload]
      };
    case 'UPDATE_FUEL_RECORD':
      return {
        ...state,
        fuelRecords: state.fuelRecords.map(record => 
          record.id === action.payload.id ? action.payload : record
        )
      };
    case 'DELETE_FUEL_RECORD':
      return {
        ...state,
        fuelRecords: state.fuelRecords.filter(record => record.id !== action.payload)
      };

    // Trip log operations
    case 'ADD_TRIP_LOG':
      return {
        ...state,
        tripLogs: [...state.tripLogs, action.payload]
      };
    case 'UPDATE_TRIP_LOG':
      return {
        ...state,
        tripLogs: state.tripLogs.map(log => 
          log.id === action.payload.id ? action.payload : log
        )
      };
    case 'DELETE_TRIP_LOG':
      return {
        ...state,
        tripLogs: state.tripLogs.filter(log => log.id !== action.payload)
      };

    // Alert operations
    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [...state.alerts, action.payload]
      };
    case 'RESOLVE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(alert => 
          alert.id === action.payload 
            ? { ...alert, isResolved: true, resolvedAt: new Date().toISOString() } 
            : alert
        )
      };
    case 'DELETE_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.id !== action.payload)
      };

    default:
      return state;
  }
};

// Context provider component
export const BusTrackingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(busTrackingReducer, initialState);

  return (
    <BusTrackingContext.Provider value={{ state, dispatch }}>
      {children}
    </BusTrackingContext.Provider>
  );
};

// Custom hook for using the context
export const useBusTracking = () => {
  const context = useContext(BusTrackingContext);
  if (context === undefined) {
    throw new Error('useBusTracking must be used within a BusTrackingProvider');
  }
  return context;
};

// Data access hooks for specific entities
export const useBuses = () => {
  const { state, dispatch } = useBusTracking();
  
  const addBus = (bus: Bus) => {
    dispatch({ type: 'ADD_BUS', payload: bus });
  };
  
  const updateBus = (bus: Bus) => {
    dispatch({ type: 'UPDATE_BUS', payload: bus });
  };
  
  const deleteBus = (id: string) => {
    dispatch({ type: 'DELETE_BUS', payload: id });
  };
  
  return {
    buses: state.buses,
    addBus,
    updateBus,
    deleteBus
  };
};

export const useDrivers = () => {
  const { state, dispatch } = useBusTracking();
  
  const addDriver = (driver: Driver) => {
    dispatch({ type: 'ADD_DRIVER', payload: driver });
  };
  
  const updateDriver = (driver: Driver) => {
    dispatch({ type: 'UPDATE_DRIVER', payload: driver });
  };
  
  const deleteDriver = (id: string) => {
    dispatch({ type: 'DELETE_DRIVER', payload: id });
  };
  
  return {
    drivers: state.drivers,
    addDriver,
    updateDriver,
    deleteDriver
  };
};

export const useRoutes = () => {
  const { state, dispatch } = useBusTracking();
  
  const addRoute = (route: BusRoute) => {
    dispatch({ type: 'ADD_ROUTE', payload: route });
  };
  
  const updateRoute = (route: BusRoute) => {
    dispatch({ type: 'UPDATE_ROUTE', payload: route });
  };
  
  const deleteRoute = (id: string) => {
    dispatch({ type: 'DELETE_ROUTE', payload: id });
  };
  
  return {
    routes: state.routes,
    addRoute,
    updateRoute,
    deleteRoute
  };
};

export const useAssignments = () => {
  const { state, dispatch } = useBusTracking();
  
  const addAssignment = (assignment: StudentBusAssignment) => {
    dispatch({ type: 'ADD_ASSIGNMENT', payload: assignment });
  };
  
  const updateAssignment = (assignment: StudentBusAssignment) => {
    dispatch({ type: 'UPDATE_ASSIGNMENT', payload: assignment });
  };
  
  const deleteAssignment = (id: string) => {
    dispatch({ type: 'DELETE_ASSIGNMENT', payload: id });
  };
  
  return {
    assignments: state.assignments,
    addAssignment,
    updateAssignment,
    deleteAssignment
  };
};

export const useMaintenanceRecords = () => {
  const { state, dispatch } = useBusTracking();
  
  const addMaintenanceRecord = (record: MaintenanceRecord) => {
    dispatch({ type: 'ADD_MAINTENANCE', payload: record });
  };
  
  const updateMaintenanceRecord = (record: MaintenanceRecord) => {
    dispatch({ type: 'UPDATE_MAINTENANCE', payload: record });
  };
  
  const deleteMaintenanceRecord = (id: string) => {
    dispatch({ type: 'DELETE_MAINTENANCE', payload: id });
  };
  
  return {
    maintenanceRecords: state.maintenanceRecords,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord
  };
};

export const useFuelRecords = () => {
  const { state, dispatch } = useBusTracking();
  
  const addFuelRecord = (record: FuelRecord) => {
    dispatch({ type: 'ADD_FUEL_RECORD', payload: record });
  };
  
  const updateFuelRecord = (record: FuelRecord) => {
    dispatch({ type: 'UPDATE_FUEL_RECORD', payload: record });
  };
  
  const deleteFuelRecord = (id: string) => {
    dispatch({ type: 'DELETE_FUEL_RECORD', payload: id });
  };
  
  return {
    fuelRecords: state.fuelRecords,
    addFuelRecord,
    updateFuelRecord,
    deleteFuelRecord
  };
};

export const useTripLogs = () => {
  const { state, dispatch } = useBusTracking();
  
  const addTripLog = (log: TripLog) => {
    dispatch({ type: 'ADD_TRIP_LOG', payload: log });
  };
  
  const updateTripLog = (log: TripLog) => {
    dispatch({ type: 'UPDATE_TRIP_LOG', payload: log });
  };
  
  const deleteTripLog = (id: string) => {
    dispatch({ type: 'DELETE_TRIP_LOG', payload: id });
  };
  
  return {
    tripLogs: state.tripLogs,
    addTripLog,
    updateTripLog,
    deleteTripLog
  };
};

export const useAlerts = () => {
  const { state, dispatch } = useBusTracking();
  
  const addAlert = (alert: BusAlert) => {
    dispatch({ type: 'ADD_ALERT', payload: alert });
  };
  
  const resolveAlert = (id: string) => {
    dispatch({ type: 'RESOLVE_ALERT', payload: id });
  };
  
  const deleteAlert = (id: string) => {
    dispatch({ type: 'DELETE_ALERT', payload: id });
  };
  
  return {
    alerts: state.alerts,
    addAlert,
    resolveAlert,
    deleteAlert
  };
}; 