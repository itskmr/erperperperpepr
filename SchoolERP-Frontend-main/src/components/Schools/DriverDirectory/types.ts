export interface Driver {
  id: string;
  name: string;
  licenseNumber?: string;
  contactNumber: string;
  address?: string;
  experience: number;
  joiningDate: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  maritalStatus?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  qualification?: string;
  salary?: number;
  isActive: boolean;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddDriverFormData {
  name: string;
  licenseNumber?: string;
  contactNumber: string;
  address: string;
  experience: number;
  joiningDate: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  maritalStatus: string;
  emergencyContact: string;
  bloodGroup: string;
  qualification: string;
  salary: number;
  isActive: boolean;
  photo: string;
}

export interface DriverTableProps {
  currentDrivers: Driver[];
  handleViewProfile: (driver: Driver) => void;
  handleEditDriver: (driver: Driver) => void;
  handleDeleteDriver: (driver: Driver) => void;
}

export interface SearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  filteredDrivers: Driver[];
  indexOfFirstItem: number;
  indexOfLastItem: number;
  setCurrentPage: (page: number) => void;
}

export interface DriverFormModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  mode: 'add' | 'edit';
  driverData: AddDriverFormData | Partial<Driver>;
  setDriverData: (data: AddDriverFormData | Partial<Driver>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export interface DriverProfileModalProps {
  selectedDriver: Driver;
  setIsProfileOpen: (open: boolean) => void;
} 