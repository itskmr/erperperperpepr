import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Download, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import { Driver, AddDriverFormData } from './types';
import DriverTable from './DriverTable';
import SearchFilter from './SearchFilter';
import Pagination from './Pagination';
import DriverFormModal from './DriverFormModal';
import DriverProfileModal from './DriverProfileModal';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '../../../utils/authApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DriverDirectory: React.FC = () => {
  // State management
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newDriver, setNewDriver] = useState<AddDriverFormData>({
    name: '',
    licenseNumber: '',
    contactNumber: '',
    address: '',
    experience: 0,
    joiningDate: new Date().toISOString().split('T')[0],
    dateOfBirth: '',
    age: 0,
    gender: '',
    maritalStatus: '',
    emergencyContact: '',
    bloodGroup: '',
    qualification: '',
    salary: 0,
    isActive: true,
    photo: ''
  });
  const [editDriver, setEditDriver] = useState<Partial<Driver>>({});
  const itemsPerPage = 5;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

  // Fetch drivers from API
  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet('/transport/drivers');
      
      if (Array.isArray(data)) {
        setDrivers(data);
      } else if (data && data.length !== undefined) {
        setDrivers(data);
      } else {
        setDrivers([]);
      }
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching drivers:', err);
      const apiErr = err as ApiError;
      setError(`Failed to fetch drivers: ${apiErr.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch drivers on component mount
  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Filtered drivers based on search and status filter
  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.contactNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || 
      (statusFilter === 'active' && driver.isActive) ||
      (statusFilter === 'inactive' && !driver.isActive);

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDrivers = filteredDrivers.slice(indexOfFirstItem, indexOfLastItem);

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

  // Handle viewing a driver's profile
  const handleViewProfile = async (driver: Driver) => {
    try {
      const data = await apiGet(`/transport/drivers/${driver.id}`);
      
      if (data) {
        setSelectedDriver(data);
        setIsProfileOpen(true);
      } else {
        showToast('error', 'Failed to fetch driver details');
      }
    } catch (err: unknown) {
      console.error('Error fetching driver details:', err);
      const apiErr = err as ApiError;
      showToast('error', 'Failed to fetch driver details: ' + (apiErr.message || 'Unknown error'));
    }
  };

  // Handle editing a driver
  const handleEditDriver = async (driver: Driver) => {
    try {
      const data = await apiGet(`/transport/drivers/${driver.id}`);
      
      if (data) {
        // Format dates for form inputs
        const formattedDriver = {
          ...data,
          joiningDate: data.joiningDate ? new Date(data.joiningDate).toISOString().split('T')[0] : '',
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
          // Ensure all fields are properly set
          name: data.name || '',
          licenseNumber: data.licenseNumber || '',
          contactNumber: data.contactNumber || '',
          address: data.address || '',
          experience: data.experience || 0,
          age: data.age || 0,
          gender: data.gender || '',
          maritalStatus: data.maritalStatus || '',
          emergencyContact: data.emergencyContact || '',
          bloodGroup: data.bloodGroup || '',
          qualification: data.qualification || '',
          salary: data.salary || 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
          photo: data.photo || ''
        };
        
        setEditDriver(formattedDriver);
        setIsEditModalOpen(true);
      } else {
        showToast('error', 'Failed to fetch driver details');
      }
    } catch (err: unknown) {
      console.error('Error fetching driver details:', err);
      const apiErr = err as ApiError;
      showToast('error', 'Failed to fetch driver details: ' + (apiErr.message || 'Unknown error'));
    }
  };

  // Handle deleting a driver
  const handleDeleteDriver = (driver: Driver) => {
    setDriverToDelete(driver);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete driver
  const confirmDeleteDriver = async () => {
    if (!driverToDelete) return;

    try {
      await apiDelete(`/transport/drivers/${driverToDelete.id}`);
      
      setDrivers(drivers.filter(d => d.id !== driverToDelete.id));
      showToast('success', 'Driver deleted successfully');
    } catch (err: unknown) {
      console.error('Error deleting driver:', err);
      const apiErr = err as ApiError;
      showToast('error', 'Failed to delete driver: ' + (apiErr.message || 'Unknown error'));
    } finally {
      setIsDeleteModalOpen(false);
      setDriverToDelete(null);
    }
  };

  // Handle adding a new driver
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!newDriver.name || !newDriver.licenseNumber || !newDriver.contactNumber) {
        showToast('error', 'Please fill in all required fields (Name, License Number, Contact Number)');
        return;
      }

      // Prepare driver data with proper formatting
      const driverData = {
        name: newDriver.name.trim(),
        licenseNumber: newDriver.licenseNumber.trim(),
        contactNumber: newDriver.contactNumber.trim(),
        address: newDriver.address.trim(),
        experience: Number(newDriver.experience) || 0,
        joiningDate: newDriver.joiningDate,
        dateOfBirth: newDriver.dateOfBirth,
        age: Number(newDriver.age) || 0,
        gender: newDriver.gender,
        maritalStatus: newDriver.maritalStatus,
        emergencyContact: newDriver.emergencyContact.trim(),
        bloodGroup: newDriver.bloodGroup,
        qualification: newDriver.qualification.trim(),
        salary: Number(newDriver.salary) || 0,
        isActive: newDriver.isActive,
        photo: newDriver.photo
      };

      console.log('Sending driver data to backend:', driverData);
      
      const data = await apiPost('/transport/drivers', driverData);
      
      console.log('Backend response:', data);
      
      if (data && data.id) {
        setDrivers(prevDrivers => [data, ...prevDrivers]);
        showToast('success', 'Driver added successfully');
        setIsAddFormOpen(false);
        // Reset form
        setNewDriver({
          name: '',
          licenseNumber: '',
          contactNumber: '',
          address: '',
          experience: 0,
          joiningDate: new Date().toISOString().split('T')[0],
          dateOfBirth: '',
          age: 0,
          gender: '',
          maritalStatus: '',
          emergencyContact: '',
          bloodGroup: '',
          qualification: '',
          salary: 0,
          isActive: true,
          photo: ''
        });
      } else {
        showToast('error', 'Failed to add driver: Invalid response from server');
      }
    } catch (err: unknown) {
      console.error('Error adding driver:', err);
      const apiErr = err as ApiError;
      const errorMessage = apiErr.message || 'Unknown error';
      showToast('error', 'Failed to add driver: ' + errorMessage);
    }
  };

  // Handle updating a driver
  const handleUpdateDriver = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!editDriver.name || !editDriver.licenseNumber || !editDriver.contactNumber) {
        showToast('error', 'Please fill in all required fields');
        return;
      }

      const driverData = {
        name: editDriver.name.trim(),
        licenseNumber: editDriver.licenseNumber.trim(),
        contactNumber: editDriver.contactNumber.trim(),
        address: editDriver.address?.trim() || '',
        experience: Number(editDriver.experience) || 0,
        joiningDate: editDriver.joiningDate,
        dateOfBirth: editDriver.dateOfBirth,
        age: Number(editDriver.age) || 0,
        gender: editDriver.gender,
        maritalStatus: editDriver.maritalStatus,
        emergencyContact: editDriver.emergencyContact?.trim() || '',
        bloodGroup: editDriver.bloodGroup,
        qualification: editDriver.qualification?.trim() || '',
        salary: Number(editDriver.salary) || 0,
        isActive: editDriver.isActive,
        photo: editDriver.photo
      };
      
      const data = await apiPut(`/transport/drivers/${editDriver.id}`, driverData);
      
      console.log('Backend response for driver update:', data);
      
      if (data && data.id) {
        setDrivers(prevDrivers => 
          prevDrivers.map(driver => 
            driver.id === editDriver.id ? data : driver
          )
        );
        showToast('success', 'Driver updated successfully');
        setIsEditModalOpen(false);
        setEditDriver({});
      } else {
        showToast('error', 'Failed to update driver: Invalid response from server');
      }
    } catch (err: unknown) {
      console.error('Error updating driver:', err);
      const apiErr = err as ApiError;
      const errorMessage = apiErr.message || 'Unknown error';
      showToast('error', 'Failed to update driver: ' + errorMessage);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    if (isEditModalOpen) {
      setEditDriver(prev => ({ ...prev, [name]: val }));
    } else {
      setNewDriver(prev => ({ ...prev, [name]: val }));
    }
  };

  // Export functions
  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'License Number', 'Contact', 'Experience', 'Status', 'Joining Date'].join(','),
      ...filteredDrivers.map(driver => [
        driver.name,
        driver.licenseNumber,
        driver.contactNumber,
        `${driver.experience} years`,
        driver.isActive ? 'Active' : 'Inactive',
        new Date(driver.joiningDate).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drivers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    // Generate PDF for all filtered drivers
    try {
      const doc = new jsPDF();
      
      // Fetch school information from API
      let schoolInfo;
      try {
        const response = await apiGet('/transport/school-info');
        schoolInfo = response.data.success ? response.data.data : {
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
      doc.text(schoolInfo.schoolName, 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text(schoolInfo.address, 20, 28);
      doc.text(`Phone: ${schoolInfo.phone} | Email: ${schoolInfo.email}`, 20, 34);
      
      // Add line separator
      doc.setDrawColor(229, 231, 235);
      doc.line(20, 40, 190, 40);
      
      // Title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Driver Directory Report', 20, 50);
      
      // Table headers
      let yPosition = 60;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Driver Name', 20, yPosition);
      doc.text('Contact', 70, yPosition);
      doc.text('Experience', 120, yPosition);
      doc.text('Status', 150, yPosition);
      
      yPosition += 5;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;
      
      // Driver data
      filteredDrivers.forEach((driver) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(10);
        doc.text(driver.name || 'N/A', 20, yPosition);
        doc.text(driver.contactNumber || 'N/A', 70, yPosition);
        doc.text(`${driver.experience || 0} years`, 120, yPosition);
        doc.text(driver.isActive ? 'Active' : 'Inactive', 150, yPosition);
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Driver Directory</h1>
        <p className="text-gray-600">Manage and organize your transport drivers</p>
      </div>

      {/* Statistics Section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Drivers</p>
              <p className="text-2xl font-bold">{drivers.length}</p>
            </div>
            <div className="bg-blue-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Drivers</p>
              <p className="text-2xl font-bold">
                {drivers.filter(driver => driver.isActive).length}
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
              <p className="text-yellow-100 text-sm font-medium">Inactive Drivers</p>
              <p className="text-2xl font-bold">
                {drivers.filter(driver => !driver.isActive).length}
              </p>
            </div>
            <div className="bg-yellow-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Avg Experience</p>
              <p className="text-2xl font-bold">
                {drivers.length > 0 ? Math.round(drivers.reduce((sum, driver) => sum + driver.experience, 0) / drivers.length) : 0} years
              </p>
            </div>
            <div className="bg-purple-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            <UserPlus className="h-4 w-4 mr-2" />
            {isAddFormOpen ? 'Cancel' : 'Add New Driver'}
          </button>
        </div>
      </div>

      {/* Add Driver Form Dropdown */}
      {isAddFormOpen && (
        <div className="mb-6 border rounded-lg shadow-lg">
          <DriverFormModal
            isOpen={true}
            setIsOpen={setIsAddFormOpen}
            mode="add"
            driverData={newDriver}
            setDriverData={setNewDriver}
            onSubmit={handleAddDriver}
            handleInputChange={handleInputChange}
          />
        </div>
      )}

      {/* Search and Filters */}
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Show loading state */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No drivers found. Add your first driver!</div>
      ) : (
        <>
          {/* Driver Table */}
          <div className="overflow-x-auto">
            <DriverTable
              currentDrivers={currentDrivers}
              handleViewProfile={handleViewProfile}
              handleEditDriver={handleEditDriver}
              handleDeleteDriver={handleDeleteDriver}
            />
          </div>

          {/* Pagination */}
          {filteredDrivers.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              filteredDrivers={filteredDrivers}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
              setCurrentPage={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Driver Profile Modal */}
      {isProfileOpen && selectedDriver && (
        <DriverProfileModal
          selectedDriver={selectedDriver}
          setIsProfileOpen={setIsProfileOpen}
        />
      )}

      {/* Edit Driver Modal */}
      {isEditModalOpen && (
        <DriverFormModal
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          mode="edit"
          driverData={editDriver}
          setDriverData={setEditDriver}
          onSubmit={handleUpdateDriver}
          handleInputChange={handleInputChange}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && driverToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Driver</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {driverToDelete.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDriver}
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

export default DriverDirectory; 