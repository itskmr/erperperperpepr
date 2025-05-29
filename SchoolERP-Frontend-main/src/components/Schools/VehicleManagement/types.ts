export interface Vehicle {
  id: string;
  registrationNumber?: string;
  vehicleName: string;
  model?: string;
  capacity?: number;
  fuelType?: string;
  purchaseDate?: string;
  insuranceExpiryDate?: string;
  lastMaintenanceDate?: string;
  lastInspectionDate?: string;
  currentOdometer?: number;
  status: string;
  notes?: string;
  driverId: string;
  driver?: {
    id: string;
    name: string;
    contactNumber: string;
  };
  routeId?: string;
  route?: {
    id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AddVehicleFormData {
  registrationNumber?: string;
  vehicleName: string;
  model?: string;
  capacity?: number;
  fuelType?: string;
  purchaseDate?: string;
  insuranceExpiryDate?: string;
  lastMaintenanceDate?: string;
  lastInspectionDate?: string;
  currentOdometer?: number;
  status?: string;
  notes?: string;
  driverId: string;
}

export interface VehicleTableProps {
  currentVehicles: Vehicle[];
  handleViewProfile: (vehicle: Vehicle) => void;
  handleEditVehicle: (vehicle: Vehicle) => void;
  handleDeleteVehicle: (vehicle: Vehicle) => void;
}

export interface VehicleSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  fuelTypeFilter: string;
  setFuelTypeFilter: (filter: string) => void;
}

export interface VehiclePaginationProps {
  currentPage: number;
  totalPages: number;
  filteredVehicles: Vehicle[];
  indexOfFirstItem: number;
  indexOfLastItem: number;
  setCurrentPage: (page: number) => void;
}

export interface VehicleFormModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  mode: 'add' | 'edit';
  vehicleData: AddVehicleFormData | Partial<Vehicle>;
  setVehicleData: (data: AddVehicleFormData | Partial<Vehicle>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  drivers: Array<{ id: string; name: string; contactNumber: string }>;
}

export interface VehicleProfileModalProps {
  selectedVehicle: Vehicle;
  setIsProfileOpen: (open: boolean) => void;
} 