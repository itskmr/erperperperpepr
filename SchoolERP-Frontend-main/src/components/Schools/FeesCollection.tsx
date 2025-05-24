import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import UpdateFeeRecord from './UpdateFeeRecord'; // Make sure this component is imported
import { getFeeStructureByClassName, getFeeCategories } from '../../services/feeStructureService';
import { FeeCategory } from '../../types/FeeStructureTypes';
import { toast } from 'react-hot-toast';

// Types
interface FeeRecord {
  id: string;
  admissionNumber: string;
  studentName: string;
  fatherName: string;
  class: string;
  section: string;
  totalFees: number;
  amountPaid: number;
  feeAmount: number;
  paymentDate: string;
  paymentMode: string;
  receiptNumber: string;
  status: 'Paid' | 'Pending' | 'Partial';
  feeCategory?: string; // Keep for backward compatibility
  feeCategories?: string[]; // New field for multiple categories
}

const API_URL = 'http://localhost:5000/api/fees';
const STUDENT_API_URL = 'http://localhost:5000/api/students'; // Add API URL for students

// Standardized class options to match the rest of the system
const CLASS_OPTIONS = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11 (Science)', 'Class 11 (Commerce)', 'Class 11 (Arts)',
  'Class 12 (Science)', 'Class 12 (Commerce)', 'Class 12 (Arts)'
];

// Section options A to D
const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];

const FeeCollectionApp: React.FC = () => {
  // State
  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [formData, setFormData] = useState<Omit<FeeRecord, 'id'>>({
    admissionNumber: '',
    studentName: '',
    fatherName: '',
    class: '',
    section: '',
    totalFees: 0,
    amountPaid: 0,
    feeAmount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Cash',
    receiptNumber: '',
    status: 'Paid',
    feeCategory: '',
    feeCategories: []
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [sortField, setSortField] = useState<keyof FeeRecord>('paymentDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentSearchLoading, setStudentSearchLoading] = useState(false); // State for student search loading
  const [studentNotFound, setStudentNotFound] = useState(false); // State for student not found error
  
  // New state for fee categories
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [feeStructureCategories, setFeeStructureCategories] = useState<FeeCategory[]>([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // Update functionality
  const [selectedRecord, setSelectedRecord] = useState<FeeRecord | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  // Add this state to track previous fee amount
  const [previousFeeAmount, setPreviousFeeAmount] = useState(0);

  // Add a new state for selected categories
  const [selectedCategories, setSelectedCategories] = useState<{
    id: string;
    name: string;
    amount: number;
  }[]>([]);

  // Load data from backend
  useEffect(() => {
    fetchFeeRecords();
    // Load available fee categories when component mounts
    loadFeeCategories();
  }, []);

  // Fetch records from backend
  const fetchFeeRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(API_URL);
      if (response.data.success) {
        // Transform dates to string format for the component
        const formattedRecords = response.data.data.map((record: any) => ({
          ...record,
          paymentDate: new Date(record.paymentDate).toISOString().split('T')[0]
        }));
        setRecords(formattedRecords);
      } else {
        setError('Failed to fetch fee records: ' + response.data.message);
      }
      
    } catch (err: any) {
      console.error('Error fetching fee records:', err);
      setError(`Failed to fetch fee records: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // New function to load available fee categories
  const loadFeeCategories = async () => {
    try {
      const categories = await getFeeCategories();
      setAvailableCategories(categories);
    } catch (err) {
      console.error('Error loading fee categories:', err);
      setError('Failed to load fee categories');
    }
  };

  // Function to fetch fee structure when class changes
  const fetchFeeStructureForClass = async (className: string) => {
    if (!className) return;
    
    try {
      setIsCategoryLoading(true);
      const feeStructure = await getFeeStructureByClassName(className);
      
      if (feeStructure && feeStructure.categories) {
        setFeeStructureCategories(feeStructure.categories);
        
        // Update total fees based on the annual total from the fee structure
        setFormData(prev => ({
          ...prev,
          totalFees: feeStructure.totalAnnualFee || 0
        }));
        
        showNotification('Fee structure loaded for class ' + className, 'success');
      } else {
        setFeeStructureCategories([]);
        showNotification('No fee structure found for this class', 'error');
      }
    } catch (err) {
      console.error(`Error fetching fee structure for class ${className}:`, err);
      setError(`Failed to load fee structure for class ${className}`);
      setFeeStructureCategories([]);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  // Function to update fee amount when category is selected
  const handleCategoryChange = (categoryName: string) => {
    // Find the selected category in the fee structure
    const selectedCategory = feeStructureCategories.find(cat => cat.name === categoryName);
    
    if (selectedCategory) {
      // Update the form with the fee amount for this category
      setFormData(prev => {
        const newFeeAmount = selectedCategory.amount;
        
        // Calculate new amount paid (remove previous amount, add new amount)
        const newAmountPaid = prev.amountPaid - previousFeeAmount + newFeeAmount;
        
        // Update status based on new amount paid
        let newStatus: 'Paid' | 'Pending' | 'Partial' = 'Pending';
        if (newAmountPaid >= prev.totalFees) {
          newStatus = 'Paid';
        } else if (newAmountPaid > 0) {
          newStatus = 'Partial';
        }
        
        setPreviousFeeAmount(newFeeAmount);
        
        return {
          ...prev,
          feeCategory: categoryName,
          feeAmount: newFeeAmount,
          amountPaid: newAmountPaid,
          status: newStatus
        };
      });
    }
  };

  // Modify existing handleChange to trigger fee structure load when class changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // If class is changing, fetch the fee structure
    if (name === 'class') {
      fetchFeeStructureForClass(value);
    }
    
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [name]: ['feeAmount', 'totalFees', 'amountPaid'].includes(name) ? parseFloat(value) || 0 : value
      };

      // When amountPaid changes, update the status automatically
      if (name === 'amountPaid') {
        const amountPaid = parseFloat(value) || 0;
        if (amountPaid >= updatedData.totalFees) {
          updatedData.status = 'Paid';
        } else if (amountPaid > 0) {
          updatedData.status = 'Partial';
        } else {
          updatedData.status = 'Pending';
        }
      }

      // When feeAmount changes, correctly update amountPaid
      if (name === 'feeAmount') {
        const currentPayment = parseFloat(value) || 0;
        // Only update amountPaid if it's not been manually changed
        if (!prev.amountPaid) {
          updatedData.amountPaid = currentPayment;
        }
        // Update the previous fee amount for next change
        setPreviousFeeAmount(currentPayment);
      }

      return updatedData;
    });
  };

  // Update resetForm function to include feeCategory and feeCategories
  const resetForm = () => {
    setFormData({
      admissionNumber: '',
      studentName: '',
      fatherName: '',
      class: '',
      section: '',
      totalFees: 0,
      amountPaid: 0,
      feeAmount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'Cash',
      receiptNumber: '',
      status: 'Paid',
      feeCategory: '',
      feeCategories: []
    });
    setPreviousFeeAmount(0); // Reset previous fee amount
    setFeeStructureCategories([]); // Reset fee categories
    setSelectedCategories([]); // Reset selected categories
  };

  // Create a function to handle multiple category selection
  const handleCategorySelect = (category: FeeCategory, isSelected: boolean) => {
    if (isSelected) {
      // Add the category to selected categories
      setSelectedCategories(prev => {
        const newSelected = [...prev, { 
          id: category.id, 
          name: category.name, 
          amount: category.amount 
        }];
        
        // Calculate new fee amount - sum of all selected categories
        const newFeeAmount = newSelected.reduce((sum, cat) => sum + cat.amount, 0);
        
        // Update the form data with new fee amount
        setFormData(prev => {
          const newAmountPaid = newFeeAmount;
          
          // Determine status based on total fees and amount paid
          let newStatus: 'Paid' | 'Pending' | 'Partial' = 'Pending';
          if (newAmountPaid >= prev.totalFees) {
            newStatus = 'Paid';
          } else if (newAmountPaid > 0) {
            newStatus = 'Partial';
          }
          
          // Update form data with new values
          return {
            ...prev,
            feeAmount: newFeeAmount,
            amountPaid: newAmountPaid,
            status: newStatus,
            // Store comma-separated names for backward compatibility
            feeCategory: newSelected.map(c => c.name).join(', '),
            // Store array of category names for new functionality
            feeCategories: newSelected.map(c => c.name)
          };
        });
        
        return newSelected;
      });
    } else {
      // Remove the category from selected categories
      setSelectedCategories(prev => {
        const newSelected = prev.filter(c => c.id !== category.id);
        
        // Calculate new fee amount
        const newFeeAmount = newSelected.reduce((sum, cat) => sum + cat.amount, 0);
        
        // Update the form data with new fee amount
        setFormData(prev => {
          const newAmountPaid = newFeeAmount;
          
          // Determine status based on total fees and amount paid
          let newStatus: 'Paid' | 'Pending' | 'Partial' = 'Pending';
          if (newAmountPaid >= prev.totalFees) {
            newStatus = 'Paid';
          } else if (newAmountPaid > 0) {
            newStatus = 'Partial';
          }
          
          // Update form data with new values
          return {
            ...prev,
            feeAmount: newFeeAmount,
            amountPaid: newAmountPaid,
            status: newStatus,
            // Store comma-separated names for backward compatibility
            feeCategory: newSelected.map(c => c.name).join(', '),
            // Store array of category names for new functionality
            feeCategories: newSelected.map(c => c.name)
          };
        });
        
        return newSelected;
      });
    }
  };

  // Update the handleSubmit function to include feeCategories in the payload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.admissionNumber || !formData.studentName || !formData.class) {
        toast.error('Please fill in all required fields');
        setIsLoading(false);
        return;
      }
      
      // Format date correctly
      const formattedDate = formData.paymentDate 
        ? new Date(formData.paymentDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
        
      // Convert feeCategories array to string for feeCategory field
      let feeCat = '';
      if (Array.isArray(formData.feeCategories) && formData.feeCategories.length > 0) {
        feeCat = formData.feeCategories.join(', ');
      } else if (formData.feeCategory) {
        feeCat = formData.feeCategory;
      }
      
      // Prepare payload with both fields for backward compatibility
      const payload = {
        ...formData,
        feeCategory: feeCat,
        paymentDate: formattedDate,
        totalFees: parseFloat(formData.totalFees.toString()),
        amountPaid: parseFloat(formData.amountPaid.toString()),
        feeAmount: parseFloat(formData.feeAmount.toString()),
      };
      
      const response = await axios.post(API_URL, payload);
      
      // Update list with new record
      setRecords(prev => [response.data.data, ...prev]);
      resetForm();
      toast.success('Fee record created successfully');
      setIsFormVisible(false);
    } catch (error) {
      console.error('Failed to create fee record:', error);
      
      // Handle error with proper type checking
      if (error && typeof error === 'object' && 'response' in error) {
        const serverError = error.response as { data?: { message?: string } };
        toast.error(serverError.data?.message || 'Failed to create fee record');
      } else {
        toast.error('Failed to create fee record');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to open the update modal with selected record
  const handleUpdateClick = (record: FeeRecord) => {
    // If the record has feeCategory but not feeCategories, convert it
    if (record.feeCategory && (!record.feeCategories || record.feeCategories.length === 0)) {
      record.feeCategories = record.feeCategory.split(', ').filter(cat => cat.trim() !== '');
    }
    
    setSelectedRecord(record);
    setIsUpdateModalOpen(true);
  };

  // Handle record update
  const handleRecordUpdate = async (updatedRecord: FeeRecord) => {
    try {
      setIsLoading(true);
      
      // Prepare feeCategories for the API
      let feeCategories = updatedRecord.feeCategories || [];
      
      // If we have feeCategory but empty feeCategories, try to parse categories from feeCategory
      if (updatedRecord.feeCategory && feeCategories.length === 0) {
        feeCategories = updatedRecord.feeCategory.split(', ').filter(cat => cat.trim() !== '');
      }
      
      // Create payload with proper data formatting
      const payload = {
        admissionNumber: updatedRecord.admissionNumber.trim(),
        studentName: updatedRecord.studentName.trim(),
        fatherName: updatedRecord.fatherName.trim(),
        class: updatedRecord.class,
        section: updatedRecord.section,
        totalFees: Number(updatedRecord.totalFees),
        amountPaid: Number(updatedRecord.amountPaid),
        feeAmount: Number(updatedRecord.feeAmount),
        paymentDate: updatedRecord.paymentDate,
        paymentMode: updatedRecord.paymentMode,
        receiptNumber: updatedRecord.receiptNumber.trim(),
        status: updatedRecord.status,
        feeCategory: updatedRecord.feeCategory || '',
        feeCategories: feeCategories,
        schoolId: 1
      };
      
      // Log the payload for debugging
      console.log('Updating record with payload:', JSON.stringify(payload, null, 2));
      
      // Call API to update the record
      const response = await axios.put(`${API_URL}/${updatedRecord.id}`, payload);
      
      if (response.data.success) {
        // Update the record in state
        setRecords(prevRecords => 
          prevRecords.map(record => 
            record.id === updatedRecord.id ? response.data.data : record
          )
        );
        
        showNotification('Fee record updated successfully!', 'success');
        setIsUpdateModalOpen(false);
        setSelectedRecord(null);
      } else {
        showNotification(`Failed to update record: ${response.data.message}`, 'error');
      }
    } catch (err: any) {
      console.error('Error updating fee record:', err);
      
      // Enhanced error logging with complete details
      if (err.response) {
        console.error('Full server response:', JSON.stringify(err.response.data, null, 2));
        
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          const errorDetails = err.response.data.errors.join(', ');
          console.log('Validation errors:', errorDetails);
          showNotification(`Validation errors: ${errorDetails}`, 'error');
        } else {
          showNotification(`Server error: ${err.response.data.message || 'Unknown error'}`, 'error');
        }
      } else {
        showNotification(`Failed to update fee record: ${err.message || 'Unknown error'}`, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle record deletion
  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this fee record?')) {
      try {
        setIsLoading(true);
        
        // Call API to delete the record
        const response = await axios.delete(`${API_URL}/${id}`);
        
        if (response.data.success) {
          // Remove the record from local state
          setRecords(records.filter(record => record.id !== id));
          showNotification('Fee record deleted successfully!', 'success');
        } else {
          showNotification(`Failed to delete record: ${response.data.message}`, 'error');
        }
      } catch (err: any) {
        console.error('Error deleting fee record:', err);
        showNotification(`Failed to delete fee record: ${err.message || 'Unknown error'}`, 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const showNotification = (message: string, type: string) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleSort = (field: keyof FeeRecord) => {
    setSortDirection(prev => (sortField === field && prev === 'asc' ? 'desc' : 'asc'));
    setSortField(field);
  };

  // Add function to fetch student details by admission number
  const fetchStudentByAdmissionNumber = async (admissionNumber: string) => {
    if (!admissionNumber.trim()) return;
    
    try {
      setStudentSearchLoading(true);
      setStudentNotFound(false);
      
      console.log(`Searching for student with admission number: ${admissionNumber}`);
      const response = await axios.get(`${STUDENT_API_URL}/admission/${admissionNumber}`);
      
      if (response.data.success) {
        const student = response.data.data;
        
        // Map student class name to match our format if needed
        let className = student.className || '';
        let fatherName = student.fatherName || '';
        
        // If parent info exists and fatherName is empty, try to get it from parentInfo
        if (!fatherName && student.parentInfo?.fatherName) {
          fatherName = student.parentInfo.fatherName;
        }
        
        // Update the form with the student information
        setFormData(prev => ({
          ...prev,
          studentName: `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`,
          fatherName: fatherName,
          class: className,
          section: student.section || ''
        }));

        // Automatically fetch fee structure for the student's class
        await fetchFeeStructureForClass(className);
        
        showNotification('Student information loaded successfully', 'success');
      } else {
        setStudentNotFound(true);
        showNotification('Failed to load student information', 'error');
      }
    } catch (err: any) {
      console.error('Error fetching student:', err);
      setStudentNotFound(true);
      
      if (err.response && err.response.status === 404) {
        showNotification('Student not found with this admission number', 'error');
      } else {
        showNotification(`Error: ${err.message || 'Failed to fetch student information'}`, 'error');
      }
    } finally {
      setStudentSearchLoading(false);
    }
  };

  // Filter and sort records
  const filteredRecords = records
    .filter(record => 
      (record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       record.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
       record.fatherName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterClass === '' || record.class === filterClass) &&
      (filterSection === '' || record.section === filterSection)
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

  // Render arrow indicator for sorting
  const renderSortArrow = (field: keyof FeeRecord) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <span className="ml-1">↑</span> 
      : <span className="ml-1">↓</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification component */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Fee Collection</h1>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out flex items-center"
        >
          {isFormVisible ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Fee Record
            </>
          )}
        </button>
      </div>

      {/* Add new fee form */}
      <AnimatePresence>
        {isFormVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Add New Fee Record</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission Number</label>
                  <div className="flex">
                    <input
                      type="text"
                      name="admissionNumber"
                      value={formData.admissionNumber}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => fetchStudentByAdmissionNumber(formData.admissionNumber)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-r-md transition-colors"
                      disabled={studentSearchLoading || !formData.admissionNumber.trim()}
                    >
                      {studentSearchLoading ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {studentNotFound && (
                    <p className="text-red-500 text-xs mt-1">Student not found with this admission number</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Class</option>
                    {CLASS_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Section</option>
                    {SECTION_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee Categories</label>
                  <div className="relative border border-gray-300 rounded-md p-2 bg-white">
                    {isCategoryLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent mr-2"></div>
                        <span className="text-gray-500">Loading categories...</span>
                      </div>
                    ) : feeStructureCategories.length > 0 ? (
                      <div className="max-h-48 overflow-y-auto">
                        {feeStructureCategories.map(category => {
                          const isSelected = selectedCategories.some(c => c.id === category.id);
                          return (
                            <div key={category.id} className={`flex items-center p-2 mb-1 ${isSelected ? 'bg-blue-50 rounded' : ''}`}>
                              <input
                                type="checkbox"
                                id={`category-${category.id}`}
                                checked={isSelected}
                                onChange={(e) => handleCategorySelect(category, e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                              />
                              <label htmlFor={`category-${category.id}`} className="ml-2 block text-sm text-gray-900 cursor-pointer flex-1">
                                {category.name} 
                                <span className="text-sm font-medium text-blue-600 ml-2">
                                  (₹{category.amount.toLocaleString()} - {category.frequency})
                                </span>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-gray-500">
                        {formData.class ? (
                          <>
                            <p>No fee categories found for this class.</p>
                            <p className="text-sm mt-1 text-yellow-600">
                              Please set up fee structures for this class in Fee Structure Management.
                            </p>
                          </>
                        ) : (
                          <p>Select a class to view available fee categories</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Categories Summary */}
                  {selectedCategories.length > 0 && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-md">
                      <h4 className="text-sm font-medium text-blue-700">Selected Categories:</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCategories.map(category => (
                          <span 
                            key={category.id} 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {category.name}
                            <button
                              type="button"
                              onClick={() => handleCategorySelect({ ...category, frequency: 'Monthly' } as FeeCategory, false)}
                              className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-200 hover:bg-blue-300 focus:outline-none"
                            >
                              <span className="sr-only">Remove {category.name}</span>
                              <svg className="h-2 w-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 text-sm text-blue-800">
                        <span className="font-medium">Total Fee Amount: ₹{formData.feeAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee Amount (Sum of selected categories)</label>
                  <input
                    type="number"
                    name="feeAmount"
                    value={formData.feeAmount || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This value is calculated automatically based on your selected fee categories
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (Total)</label>
                  <input
                    type="number"
                    name="amountPaid"
                    value={formData.amountPaid || ''}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the amount being paid by the student
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    autoComplete="off"
                    readOnly={false}
                    onFocus={(e) => e.currentTarget.readOnly = false}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                  <select
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
                  <input
                    type="text"
                    name="receiptNumber"
                    value={formData.receiptNumber}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div className="md:col-span-2 lg:col-span-3 mt-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition duration-300 ease-in-out"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Fee Record'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and search */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or admission number..."
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Class</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Classes</option>
              {CLASS_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Section</label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sections</option>
              {SECTION_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterClass('');
                setFilterSection('');
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition duration-300 ease-in-out"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Records table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading && records.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading fee records...</p>
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('admissionNumber')}>
                    Adm No {renderSortArrow('admissionNumber')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('studentName')}>
                    Student Name {renderSortArrow('studentName')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('fatherName')}>
                    Father Name {renderSortArrow('fatherName')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('class')}>
                    Class {renderSortArrow('class')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('feeAmount')}>
                    Payment {renderSortArrow('feeAmount')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('paymentDate')}>
                    Date {renderSortArrow('paymentDate')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('paymentMode')}>
                    Mode {renderSortArrow('paymentMode')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                    Status {renderSortArrow('status')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{record.admissionNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.studentName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.fatherName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.class}-{record.section}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">₹{record.feeAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(record.paymentDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.paymentMode}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'Partial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateClick(record)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {isLoading ? 'Loading records...' : 'No fee records found.'}
            </p>
          </div>
        )}
      </div>

      {/* Update modal */}
      {selectedRecord && (
        <UpdateFeeRecord
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          record={selectedRecord}
          onUpdate={handleRecordUpdate}
          classOptions={CLASS_OPTIONS}
          sectionOptions={SECTION_OPTIONS}
          feeCategories={availableCategories} // Pass available fee categories
        />
      )}
    </div>
  );
};

export default FeeCollectionApp;