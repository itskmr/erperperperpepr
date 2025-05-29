import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Download, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import jsPDF from 'jspdf';
import { Driver, AddDriverFormData } from './types';
import DriverTable from './DriverTable';
import SearchFilter from './SearchFilter';
import Pagination from './Pagination';
import DriverFormModal from './DriverFormModal';
import DriverProfileModal from './DriverProfileModal';

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
      const response = await axios.get(`${API_URL}/transport/drivers`);
      
      if (response.data && response.data.success) {
        setDrivers(response.data.data || []);
        setError(null);
      } else {
        setError('Failed to fetch drivers');
      }
    } catch (error: unknown) {
      console.error('Error fetching drivers:', error);
      setError(`Failed to fetch drivers: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      const response = await axios.get(`${API_URL}/transport/drivers/${driver.id}`);
      
      if (response.data.success) {
        setSelectedDriver(response.data.data);
        setIsProfileOpen(true);
      } else {
        showToast('error', 'Failed to fetch driver details');
      }
    } catch (error) {
      console.error('Error fetching driver details:', error);
      showToast('error', 'Failed to fetch driver details');
    }
  };

  // Handle editing a driver
  const handleEditDriver = async (driver: Driver) => {
    try {
      const response = await axios.get(`${API_URL}/transport/drivers/${driver.id}`);
      
      if (response.data.success) {
        const driverData = response.data.data;
        
        // Format dates for form inputs
        const formattedDriver = {
          ...driverData,
          joiningDate: driverData.joiningDate ? new Date(driverData.joiningDate).toISOString().split('T')[0] : '',
          dateOfBirth: driverData.dateOfBirth ? new Date(driverData.dateOfBirth).toISOString().split('T')[0] : '',
          // Ensure all fields are properly set
          name: driverData.name || '',
          licenseNumber: driverData.licenseNumber || '',
          contactNumber: driverData.contactNumber || '',
          address: driverData.address || '',
          experience: driverData.experience || 0,
          age: driverData.age || 0,
          gender: driverData.gender || '',
          maritalStatus: driverData.maritalStatus || '',
          emergencyContact: driverData.emergencyContact || '',
          bloodGroup: driverData.bloodGroup || '',
          qualification: driverData.qualification || '',
          salary: driverData.salary || 0,
          isActive: driverData.isActive !== undefined ? driverData.isActive : true,
          photo: driverData.photo || ''
        };
        
        setEditDriver(formattedDriver);
        setIsEditModalOpen(true);
      } else {
        showToast('error', 'Failed to fetch driver details');
      }
    } catch (error) {
      console.error('Error fetching driver details:', error);
      showToast('error', 'Failed to fetch driver details');
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
      const response = await axios.delete(`${API_URL}/transport/drivers/${driverToDelete.id}`);
      
      if (response.data.success) {
        setDrivers(drivers.filter(d => d.id !== driverToDelete.id));
        showToast('success', 'Driver deleted successfully');
      } else {
        showToast('error', 'Failed to delete driver');
      }
    } catch (error) {
      console.error('Error deleting driver:', error);
      showToast('error', 'Failed to delete driver');
    } finally {
      setIsDeleteModalOpen(false);
      setDriverToDelete(null);
    }
  };

  // Handle adding a new driver
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Attempting to add new driver with data:', newDriver);
      
      const driverData = {
        ...newDriver,
        joiningDate: new Date(newDriver.joiningDate).toISOString()
      };
      
      // Log the data being sent to backend
      console.log('Sending driver data to backend:', driverData);
      
      const response = await axios.post(`${API_URL}/transport/drivers`, driverData);
      
      console.log('Backend response:', response.data);
      
      if (response.data.success) {
        setDrivers([response.data.data, ...drivers]);
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
        setIsAddFormOpen(false);
        showToast('success', 'Driver added successfully');
      } else {
        console.error('Backend returned error:', response.data);
        showToast('error', response.data.message || 'Failed to add driver');
      }
    } catch (error) {
      console.error('Error adding driver (detailed):', error);
      
      // Log detailed error information
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        
        // Show specific error message from backend if available
        const errorMessage = error.response?.data?.message || error.message || 'Failed to add driver';
        showToast('error', errorMessage);
      } else {
        console.error('Non-axios error:', error);
        showToast('error', 'Failed to add driver: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  };

  // Handle updating a driver
  const handleUpdateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Attempting to update driver with data:', editDriver);
      
      // Prepare the driver data with proper date handling
      const driverData = {
        ...editDriver
      };
      
      // Handle dates properly - avoid double conversion
      if (editDriver.joiningDate) {
        try {
          // If it's already an ISO string, use it; if it's a date input format, convert it
          const joiningDate = editDriver.joiningDate.includes('T') 
            ? editDriver.joiningDate 
            : new Date(editDriver.joiningDate).toISOString();
          driverData.joiningDate = joiningDate;
        } catch (dateError) {
          console.error('Error processing joining date:', dateError);
          delete driverData.joiningDate;
        }
      } else {
        delete driverData.joiningDate;
      }
      
      if (editDriver.dateOfBirth) {
        try {
          // If it's already an ISO string, use it; if it's a date input format, convert it
          const dateOfBirth = editDriver.dateOfBirth.includes('T') 
            ? editDriver.dateOfBirth 
            : new Date(editDriver.dateOfBirth).toISOString();
          driverData.dateOfBirth = dateOfBirth;
        } catch (dateError) {
          console.error('Error processing date of birth:', dateError);
          delete driverData.dateOfBirth;
        }
      } else {
        delete driverData.dateOfBirth;
      }
      
      console.log('Sending driver update data to backend:', {
        id: driverData.id,
        name: driverData.name,
        hasPhoto: !!driverData.photo,
        photoLength: driverData.photo ? driverData.photo.length : 0,
        joiningDate: driverData.joiningDate,
        dateOfBirth: driverData.dateOfBirth
      });
      
      const response = await axios.put(`${API_URL}/transport/drivers/${editDriver.id}`, driverData);
      
      console.log('Backend response for driver update:', response.data);
      
      if (response.data.success) {
        // Update the drivers list with the new data
        setDrivers(drivers.map(d => d.id === editDriver.id ? {
          ...response.data.data,
          // Ensure dates are properly formatted for display
          joiningDate: response.data.data.joiningDate,
          dateOfBirth: response.data.data.dateOfBirth,
          // Ensure status is properly set
          isActive: response.data.data.isActive
        } : d));
        setEditDriver({});
        setIsEditModalOpen(false);
        showToast('success', 'Driver updated successfully');
        fetchDrivers(); // Refresh the drivers list
      } else {
        console.error('Backend returned error:', response.data);
        showToast('error', response.data.message || 'Failed to update driver');
      }
    } catch (error) {
      console.error('Error updating driver (detailed):', error);
      
      // Log detailed error information
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        
        // Show specific error message from backend if available
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update driver';
        showToast('error', errorMessage);
      } else {
        console.error('Non-axios error:', error);
        showToast('error', 'Failed to update driver: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
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
        const response = await axios.get(`${API_URL}/transport/school-info`);
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
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Drivers</h3>
          <p className="text-2xl font-semibold text-blue-600">{drivers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Drivers</h3>
          <p className="text-2xl font-semibold text-green-600">
            {drivers.filter(driver => driver.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Inactive Drivers</h3>
          <p className="text-2xl font-semibold text-red-600">
            {drivers.filter(driver => !driver.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Avg Experience</h3>
          <p className="text-2xl font-semibold text-purple-600">
            {drivers.length > 0 ? Math.round(drivers.reduce((sum, driver) => sum + driver.experience, 0) / drivers.length) : 0} years
          </p>
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