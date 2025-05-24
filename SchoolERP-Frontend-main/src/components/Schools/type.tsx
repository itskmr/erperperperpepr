export interface Bus {
    id: number;
    routeNumber: string;
    driverName: string;
    location: [number, number];
    status: 'running' | 'stopped' | 'maintenance';
    lastUpdated: string;
    speed: number;
    fuelLevel: number;
    capacity: number;
    occupancy: number;
    nextStop: string;
    estimatedArrival: string;
    route: [number, number][];
  }
  
  export interface BusFilter {
    status?: string;
    routeNumber?: string;
    search?: string;
  }