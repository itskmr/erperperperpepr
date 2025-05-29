export interface TransportRoute {
  id: string;
  name: string;
  fromLocation: string;
  toLocation: string;
  description?: string;
  distance?: number;
  estimatedTime?: number; // in minutes
  stops?: RouteStop[];
  schedule?: RouteSchedule[];
  vehicleId?: string;
  vehicle?: {
    id: string;
    vehicleName: string;
    registrationNumber?: string;
  };
  driverId?: string;
  driver?: {
    id: string;
    name: string;
    contactNumber: string;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RouteStop {
  id: string;
  name: string;
  location: string;
  sequence: number;
  estimatedTime?: number;
  studentsCount?: number;
}

export interface RouteSchedule {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  weekdays: string[];
}

export interface AddTransportRouteFormData {
  name: string;
  fromLocation: string;
  toLocation: string;
  description: string;
  distance: number;
  estimatedTime: number;
  vehicleId: string;
  driverId: string;
  isActive: boolean;
}

export interface TransportRouteTableProps {
  currentRoutes: TransportRoute[];
  handleViewProfile: (route: TransportRoute) => void;
  handleEditRoute: (route: TransportRoute) => void;
  handleDeleteRoute: (route: TransportRoute) => void;
}

export interface TransportRouteSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
}

export interface TransportRoutePaginationProps {
  currentPage: number;
  totalPages: number;
  filteredRoutes: TransportRoute[];
  indexOfFirstItem: number;
  indexOfLastItem: number;
  setCurrentPage: (page: number) => void;
}

export interface TransportRouteFormModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  mode: 'add' | 'edit';
  routeData: AddTransportRouteFormData | Partial<TransportRoute>;
  setRouteData: (data: AddTransportRouteFormData | Partial<TransportRoute>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  vehicles: Array<{ id: string; vehicleName: string; registrationNumber?: string }>;
  drivers: Array<{ id: string; name: string; contactNumber: string }>;
}

export interface TransportRouteProfileModalProps {
  selectedRoute: TransportRoute;
  setIsProfileOpen: (open: boolean) => void;
} 