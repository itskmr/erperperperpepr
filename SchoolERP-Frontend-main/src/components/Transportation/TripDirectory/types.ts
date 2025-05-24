export interface Trip {
  id: string | number;
  tripID: string;
  date: string;
  busNumber: string;
  routeName: string;
  driverName: string;
  startTime: string;
  endTime?: string;
  startOdometer: number;
  endOdometer?: number;
  status: string;
  delayMinutes?: number;
  notes?: string;
  busId: string | number;
  routeId: string | number;
  driverId: string | number;
}

export interface Route {
  id: number;
  routeID: string;
  name: string;
  stops: Stop[];
  defaultReleaseTime?: string;
  defaultDropTime?: string;
}

export interface Stop {
  stopID: string;
  name: string;
  sequence: number;
}

export interface Bus {
  id: number;
  busID: string;
  vehicleNumber: string;
  capacity: number;
  assignedRouteID?: number;
  currentLocation?: string;
  driverID?: number;
  currentOdometer: number;
}

export interface Driver {
  id: number;
  driverID: string;
  name: string;
  contact: string;
  assignedBusID?: number;
} 