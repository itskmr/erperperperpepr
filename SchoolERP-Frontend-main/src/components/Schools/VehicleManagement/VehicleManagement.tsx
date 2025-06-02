import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Download, FileText, Truck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import { Vehicle, AddVehicleFormData } from './types';
import VehicleTable from './VehicleTable';
import VehicleSearchFilter from './VehicleSearchFilter';
import VehiclePagination from './VehiclePagination';
import VehicleFormModal from './VehicleFormModal';
import VehicleProfileModal from './VehicleProfileModal';
import { formatDateForInput } from '../../../utils/dateUtils';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '../../../utils/authApi';

// Define interfaces for API responses
interface VehicleApiResponse {
  id: string;
  registrationNumber?: string;
  make?: string;
  vehicleName?: string;
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
  driverId?: string;
}

interface DriverApiResponse {
  id: string;
  name: string;
  contactNumber: string;
}

interface SchoolInfoResponse {
  schoolName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

const VehicleManagement: React.FC = () => {
  // State management
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Array<{ id: string; name: string; contactNumber: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState<AddVehicleFormData>({
    registrationNumber: '',
    vehicleName: '',
    model: '',
    capacity: 0,
    fuelType: 'Diesel',
    purchaseDate: '',
    insuranceExpiryDate: '',
    lastMaintenanceDate: '',
    lastInspectionDate: '',
    currentOdometer: 0,
    status: 'ACTIVE',
    notes: '',
    driverId: ''
  });
  const [editVehicle, setEditVehicle] = useState<Partial<Vehicle>>({});
  const itemsPerPage = 5;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  // Fetch vehicles from API
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet('/transport/buses');
      
      if (Array.isArray(data)) {
        // Handle direct array response
        const transformedVehicles = await Promise.all(data.map(async (vehicle: VehicleApiResponse) => {
          let driverDetails = null;
          
          // Fetch driver details if driverId exists
          if (vehicle.driverId) {
            try {
              const driverData = await apiGet(`/transport/drivers/${vehicle.driverId}`) as DriverApiResponse;
              if (driverData) {
                driverDetails = {
                  id: driverData.id,
                  name: driverData.name,
                  contactNumber: driverData.contactNumber
                };
              }
            } catch (error) {
              console.error('Error fetching driver details:', error);
            }
          }
          
          return {
            id: vehicle.id,
            registrationNumber: vehicle.registrationNumber || '',
            vehicleName: vehicle.make || vehicle.vehicleName || '', // Map make to vehicleName
            model: vehicle.model || '',
            capacity: vehicle.capacity || 0,
            fuelType: vehicle.fuelType || '',
            purchaseDate: vehicle.purchaseDate || '',
            insuranceExpiryDate: vehicle.insuranceExpiryDate || '',
            lastMaintenanceDate: vehicle.lastMaintenanceDate || '',
            lastInspectionDate: vehicle.lastInspectionDate || '',
            currentOdometer: vehicle.currentOdometer || 0,
            status: vehicle.status || 'ACTIVE', // Ensure status has a default value
            notes: vehicle.notes || '',
            driverId: vehicle.driverId || '',
            driver: driverDetails
          } as Vehicle;
        }));
        
        setVehicles(transformedVehicles);
      } else if (data && typeof data === 'object' && 'data' in data) {
        // Handle wrapped response with data field
        const responseData = data as { data: VehicleApiResponse[] };
        const vehicleArray = Array.isArray(responseData.data) ? responseData.data : [];
        const transformedVehicles = await Promise.all(vehicleArray.map(async (vehicle: VehicleApiResponse) => {
          let driverDetails = null;
          
          // Fetch driver details if driverId exists
          if (vehicle.driverId) {
            try {
              const driverData = await apiGet(`/transport/drivers/${vehicle.driverId}`) as DriverApiResponse;
              if (driverData) {
                driverDetails = {
                  id: driverData.id,
                  name: driverData.name,
                  contactNumber: driverData.contactNumber
                };
              }
            } catch (error) {
              console.error('Error fetching driver details:', error);
            }
          }
          
          return {
            id: vehicle.id,
            registrationNumber: vehicle.registrationNumber || '',
            vehicleName: vehicle.make || vehicle.vehicleName || '',
            model: vehicle.model || '',
            capacity: vehicle.capacity || 0,
            fuelType: vehicle.fuelType || '',
            purchaseDate: vehicle.purchaseDate || '',
            insuranceExpiryDate: vehicle.insuranceExpiryDate || '',
            lastMaintenanceDate: vehicle.lastMaintenanceDate || '',
            lastInspectionDate: vehicle.lastInspectionDate || '',
            currentOdometer: vehicle.currentOdometer || 0,
            status: vehicle.status || 'ACTIVE', // Ensure status has a default value
            notes: vehicle.notes || '',
            driverId: vehicle.driverId || '',
            driver: driverDetails
          } as Vehicle;
        }));
        
        setVehicles(transformedVehicles);
      } else {
        setVehicles([]);
      }
      setError(null);
    } catch (error: unknown) {
      console.error('Error fetching vehicles:', error);
      const apiErr = error as ApiError;
      setError(`Failed to fetch vehicles: ${apiErr.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch drivers for dropdown
  const fetchDrivers = useCallback(async () => {
    try {
      const data = await apiGet('/transport/drivers');
      
      if (Array.isArray(data)) {
        setDrivers(data);
      } else if (data && typeof data === 'object' && 'data' in data) {
        const responseData = data as { data: DriverApiResponse[] };
        setDrivers(responseData.data || []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
  }, [fetchVehicles, fetchDrivers]);

  // Filtered vehicles based on search and filters
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || vehicle.status === statusFilter;

    const matchesFuelType =
      fuelTypeFilter === 'all' || vehicle.fuelType === fuelTypeFilter;

    return matchesSearch && matchesStatus && matchesFuelType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVehicles = filteredVehicles.slice(indexOfFirstItem, indexOfLastItem);

  // Show toast notification
  const showToast = (type: 'success' | 'error', message: string) => {
    toast[type](message, {
      duration: 3000,
      style: {
        background: type === 'success' ? '#2563EB' : '#EF4444',
        color: '#ffffff',
        padding: '16px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: type === 'success' ? '#2563EB' : '#EF4444',
      },
    });
  };

  // Handle viewing a vehicle's profile
  const handleViewProfile = async (vehicle: Vehicle) => {
    try {
      const data = await apiGet(`/transport/buses/${vehicle.id}`) as VehicleApiResponse;
      
      if (data) {
        setSelectedVehicle(data as Vehicle);
        setIsProfileOpen(true);
      } else {
        showToast('error', 'Failed to fetch vehicle details');
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      const apiErr = error as ApiError;
      showToast('error', apiErr.message || 'Failed to fetch vehicle details');
    }
  };

  // Handle editing a vehicle
  const handleEditVehicle = async (vehicle: Vehicle) => {
    try {
      const data = await apiGet(`/transport/buses/${vehicle.id}`) as VehicleApiResponse;
      
      if (data) {
        // Transform backend data to frontend format with properly formatted dates
        const transformedVehicle = {
          ...data,
          vehicleName: data.make || data.vehicleName || '',
          driverId: data.driverId || '',
          purchaseDate: formatDateForInput(data.purchaseDate),
          insuranceExpiryDate: formatDateForInput(data.insuranceExpiryDate),
          lastMaintenanceDate: formatDateForInput(data.lastMaintenanceDate),
          lastInspectionDate: formatDateForInput(data.lastInspectionDate)
        };
        
        setEditVehicle(transformedVehicle);
        setIsEditModalOpen(true);
      } else {
        showToast('error', 'Failed to fetch vehicle details');
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      const apiErr = error as ApiError;
      showToast('error', apiErr.message || 'Failed to fetch vehicle details');
    }
  };

  // Handle deleting a vehicle
  const handleDeleteVehicle = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete vehicle
  const confirmDeleteVehicle = async () => {
    if (!vehicleToDelete) return;

    try {
      await apiDelete(`/transport/buses/${vehicleToDelete.id}`);
      
      // If we get here, deletion was successful (apiDelete would throw on error)
      setVehicles(vehicles.filter(v => v.id !== vehicleToDelete.id));
      showToast('success', 'Vehicle deleted successfully');
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      const apiErr = error as ApiError;
      showToast('error', apiErr.message || 'Failed to delete vehicle');
    } finally {
      setIsDeleteModalOpen(false);
      setVehicleToDelete(null);
    }
  };

  // Handle adding a new vehicle
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Transform the data to match backend expected field names
      const vehicleDataForAPI = {
        registrationNumber: newVehicle.registrationNumber || '',
        make: newVehicle.vehicleName, // Map vehicleName to make for backend
        model: newVehicle.model || 'Unknown', // Provide default if not specified
        capacity: parseInt(newVehicle.capacity?.toString() || '0') || 1, // Ensure capacity is provided
        fuelType: newVehicle.fuelType || '',
        purchaseDate: newVehicle.purchaseDate || null,
        insuranceExpiryDate: newVehicle.insuranceExpiryDate || null,
        lastMaintenanceDate: newVehicle.lastMaintenanceDate || null,
        lastInspectionDate: newVehicle.lastInspectionDate || null,
        currentOdometer: parseFloat(newVehicle.currentOdometer?.toString() || '0') || 0,
        status: newVehicle.status || 'ACTIVE',
        notes: newVehicle.notes || '',
        driverId: newVehicle.driverId || null
      };
      
      const data = await apiPost('/transport/buses', vehicleDataForAPI) as VehicleApiResponse;
      
      // If we get here, vehicle was added successfully (apiPost would throw on error)
      // Transform response back to frontend format for state
      const newVehicleData = {
        ...data,
        vehicleName: data.make || data.vehicleName || ''
      };
      
      setVehicles([newVehicleData as Vehicle, ...vehicles]);
      setNewVehicle({
        registrationNumber: '',
        vehicleName: '',
        model: '',
        capacity: 0,
        fuelType: 'Diesel',
        purchaseDate: '',
        insuranceExpiryDate: '',
        lastMaintenanceDate: '',
        lastInspectionDate: '',
        currentOdometer: 0,
        status: 'ACTIVE',
        notes: '',
        driverId: ''
      });
      setIsAddFormOpen(false);
      showToast('success', 'Vehicle added successfully');
      fetchVehicles(); // Refresh the vehicle list
    } catch (error) {
      console.error('Error adding vehicle:', error);
      const apiErr = error as ApiError;
      showToast('error', apiErr.message || 'Failed to add vehicle');
    }
  };

  // Handle updating a vehicle
  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Transform the data to match backend expected field names
      const vehicleDataForAPI = {
        ...editVehicle,
        make: editVehicle.vehicleName, // Map vehicleName to make for backend
        // Remove vehicleName from the payload
        vehicleName: undefined
      };
      
      const data = await apiPut(`/transport/buses/${editVehicle.id}`, vehicleDataForAPI) as VehicleApiResponse;
      
      // If we get here, vehicle was updated successfully (apiPut would throw on error)
      // Fetch updated driver information if driverId exists
      let driverDetails = null;
      if (data.driverId) {
        try {
          const driverData = await apiGet(`/transport/drivers/${data.driverId}`) as DriverApiResponse;
          if (driverData) {
            driverDetails = {
              id: driverData.id,
              name: driverData.name,
              contactNumber: driverData.contactNumber
            };
          }
        } catch (error) {
          console.error('Error fetching updated driver details:', error);
        }
      }
      
      // Transform response back to frontend format for state
      const updatedVehicleData = {
        ...data,
        vehicleName: data.make || data.vehicleName || '',
        driver: driverDetails // Include the fetched driver details
      };
      
      // Update the vehicles list with the new data including driver info
      setVehicles(vehicles.map(v => v.id === editVehicle.id ? updatedVehicleData as Vehicle : v));
      setEditVehicle({});
      setIsEditModalOpen(false);
      showToast('success', 'Vehicle updated successfully');
      
      // Refresh the entire vehicles list to ensure consistency
      fetchVehicles();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      const apiErr = error as ApiError;
      showToast('error', apiErr.message || 'Failed to update vehicle');
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    if (isEditModalOpen) {
      setEditVehicle(prev => ({ ...prev, [name]: val }));
    } else {
      setNewVehicle(prev => ({ ...prev, [name]: val }));
    }
  };

  // Export functions
  const handleExportCSV = () => {
    const csvContent = [
      ['Registration Number', 'Vehicle Name', 'Model', 'Capacity', 'Fuel Type', 'Status', 'Driver'].join(','),
      ...filteredVehicles.map(vehicle => [
        vehicle.registrationNumber || '',
        vehicle.vehicleName || '',
        vehicle.model || '',
        vehicle.capacity || '',
        vehicle.fuelType || '',
        vehicle.status || '',
        vehicle.driver?.name || 'Unassigned'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vehicles.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    // Generate PDF for all filtered vehicles
    try {
      const doc = new jsPDF();
      
      // Fetch school information from API
      let schoolInfo: SchoolInfoResponse;
      try {
        const response = await apiGet('/transport/school-info') as SchoolInfoResponse;
        schoolInfo = response || {
          schoolName: 'Excellence School System',
          address: '123 Education Street, Learning City, State 12345',
          phone: '+1 (555) 123-4567',
          email: 'info@excellenceschool.edu'
        };
      } catch {
        // Fallback to default values
        schoolInfo = {
          schoolName: 'Excellence School System',
          address: '123 Education Street, Learning City, State 12345',
          phone: '+1 (555) 123-4567',
          email: 'info@excellenceschool.edu'
        };
      }

      // School header
      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235);
      doc.text(schoolInfo.schoolName || 'School Name', 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text(schoolInfo.address || 'School Address', 20, 28);
      doc.text(`Phone: ${schoolInfo.phone || 'N/A'} | Email: ${schoolInfo.email || 'N/A'}`, 20, 34);
      
      // Add line separator
      doc.setDrawColor(229, 231, 235);
      doc.line(20, 40, 190, 40);
      
      // Title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Vehicle Fleet Report', 20, 50);
      
      // Table headers
      let yPosition = 60;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Vehicle Name', 20, yPosition);
      doc.text('Reg. Number', 70, yPosition);
      doc.text('Capacity', 120, yPosition);
      doc.text('Driver', 150, yPosition);
      
      yPosition += 5;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;
      
      // Vehicle data
      filteredVehicles.forEach((vehicle) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(10);
        doc.text(vehicle.vehicleName || 'N/A', 20, yPosition);
        doc.text(vehicle.registrationNumber || 'N/A', 70, yPosition);
        doc.text(`${vehicle.capacity || 0} seats`, 120, yPosition);
        doc.text(vehicle.driver?.name || 'Unassigned', 150, yPosition);
        yPosition += 8;
      });
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 280);
      
      // Open in new tab
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      
      showToast('success', 'PDF export completed!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('error', 'Failed to generate PDF');
    }
  };

  // Create a compatible setter function for the modal
  const handleVehicleDataChange = (data: AddVehicleFormData | Partial<Vehicle>) => {
    if (isEditModalOpen) {
      setEditVehicle(data as Partial<Vehicle>);
    } else {
      setNewVehicle(data as AddVehicleFormData);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Management</h1>
        <p className="text-gray-600">Manage and organize your transport fleet</p>
      </div>

      {/* Statistics Section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Vehicles</p>
              <p className="text-2xl font-bold">{vehicles.length}</p>
            </div>
            <div className="bg-blue-400 p-3 rounded-full">
              <Truck className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Vehicles</p>
              <p className="text-2xl font-bold">
                {vehicles.filter(vehicle => vehicle.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="bg-green-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">In Maintenance</p>
              <p className="text-2xl font-bold">
                {vehicles.filter(vehicle => vehicle.status === 'MAINTENANCE').length}
              </p>
            </div>
            <div className="bg-yellow-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">With Drivers</p>
              <p className="text-2xl font-bold">
                {vehicles.filter(vehicle => vehicle.driver).length}
              </p>
            </div>
            <div className="bg-purple-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300 shadow-sm"
              title="Export to CSV"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300 shadow-sm"
              title="Export to PDF"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </button>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300 shadow-sm"
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isAddFormOpen ? 'Cancel' : 'Add New Vehicle'}
          </button>
        </div>
      </div>

      {/* Add Vehicle Form Dropdown */}
      {isAddFormOpen && (
        <div className="mb-6 border rounded-lg shadow-lg">
          <VehicleFormModal
            isOpen={true}
            setIsOpen={setIsAddFormOpen}
            mode="add"
            vehicleData={newVehicle}
            setVehicleData={handleVehicleDataChange}
            onSubmit={handleAddVehicle}
            handleInputChange={handleInputChange}
            drivers={drivers}
          />
        </div>
      )}

      {/* Search and Filters */}
      <VehicleSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        fuelTypeFilter={fuelTypeFilter}
        setFuelTypeFilter={setFuelTypeFilter}
      />

      {/* Show loading state */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No vehicles found. Add your first vehicle!</div>
      ) : (
        <>
          {/* Vehicle Table */}
          <div className="overflow-x-auto">
            <VehicleTable
              currentVehicles={currentVehicles}
              handleViewProfile={handleViewProfile}
              handleEditVehicle={handleEditVehicle}
              handleDeleteVehicle={handleDeleteVehicle}
            />
          </div>

          {/* Pagination */}
          {filteredVehicles.length > 0 && (
            <VehiclePagination
              currentPage={currentPage}
              totalPages={totalPages}
              filteredVehicles={filteredVehicles}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
              setCurrentPage={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Vehicle Profile Modal */}
      {isProfileOpen && selectedVehicle && (
        <VehicleProfileModal
          selectedVehicle={selectedVehicle}
          setIsProfileOpen={setIsProfileOpen}
        />
      )}

      {/* Edit Vehicle Modal */}
      {isEditModalOpen && (
        <VehicleFormModal
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          mode="edit"
          vehicleData={editVehicle}
          setVehicleData={handleVehicleDataChange}
          onSubmit={handleUpdateVehicle}
          handleInputChange={handleInputChange}
          drivers={drivers}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && vehicleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Vehicle</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete vehicle {vehicleToDelete.registrationNumber}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteVehicle}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement; 