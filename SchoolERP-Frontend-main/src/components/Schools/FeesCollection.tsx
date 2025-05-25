import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios, { AxiosError } from 'axios';
import UpdateFeeRecord from './UpdateFeeRecord';
import { getFeeStructureByClassName, getFeeCategories } from '../../services/feeStructureService';
import { toast } from 'react-hot-toast';

// Types
interface FeeCategoryType {
  id: string;
  name: string;
  amount: number;
  frequency: string;
}

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
  feeCategory?: string;
  feeCategories?: string[];
  studentDetails?: {
    fullName: string;
    fatherName: string;
    motherName: string;
    email: string;
    mobileNumber: string;
    className: string;
    section: string;
    rollNumber: string;
  };
}

interface StudentResponse {
  success: boolean;
  data: {
    firstName: string;
    middleName?: string;
    lastName: string;
    fullName?: string;
    fatherName: string;
    motherName: string;
    email: string;
    mobileNumber: string;
    sessionInfo?: {
      currentClass?: string;
      currentSection?: string;
      currentRollNo?: string;
      admitClass?: string;
      admitSection?: string;
      admitRollNo?: string;
    };
  };
}

interface FeeResponse {
  success: boolean;
  message?: string;
  data: FeeRecord | FeeRecord[];
}

const API_URL = 'http://localhost:5000/api/fees';
const STUDENT_API_URL = 'http://localhost:5000/api/students';

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
  
  // New state for fee categories
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [feeStructureCategories, setFeeStructureCategories] = useState<FeeCategoryType[]>([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // Update functionality
  const [selectedRecord, setSelectedRecord] = useState<FeeRecord | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Add a new state for selected categories
  const [selectedCategories, setSelectedCategories] = useState<FeeCategoryType[]>([]);

  // New state for student details
  const [studentDetails, setStudentDetails] = useState<FeeRecord['studentDetails'] | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);

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
      
      const response = await axios.get<FeeResponse>(API_URL);
      if (response.data.success) {
        // Transform dates to string format for the component
        let formattedRecords: FeeRecord[] = [];
        if (Array.isArray(response.data.data)) {
          formattedRecords = response.data.data.map((record: FeeRecord) => ({
            ...record,
            paymentDate: new Date(record.paymentDate).toISOString().split('T')[0]
          }));
        } else if (response.data.data) {
          const record = response.data.data as FeeRecord;
          formattedRecords = [{
            ...record,
            paymentDate: new Date(record.paymentDate).toISOString().split('T')[0]
          }];
        }
        setRecords(formattedRecords);
      } else {
        setError('Failed to fetch fee records: ' + (response.data.message || 'Unknown error'));
      }
      
    } catch (err: unknown) {
      console.error('Error fetching fee records:', err);
      if (err instanceof Error) {
        setError(`Failed to fetch fee records: ${err.message}`);
      } else {
        setError('Failed to fetch fee records: Unknown error');
      }
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

  // Modify existing handleChange to trigger fee structure load when class changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // If class is changing, fetch the fee structure
    if (name === 'class') {
      fetchFeeStructureForClass(value);
    }
    
    if (name === 'admissionNumber') {
      fetchStudentDetails(value);
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
    setFeeStructureCategories([]); // Reset fee categories
    setSelectedCategories([]); // Reset selected categories
  };

  // Update handleCategorySelect to work with FeeCategory objects
  const handleCategorySelect = (category: FeeCategoryType, isSelected: boolean) => {
    if (isSelected) {
      setSelectedCategories(prev => {
        const newSelected = [...prev, category];
        const newFeeAmount = newSelected.reduce((sum, cat) => sum + cat.amount, 0);
        
        // Update form data with new fee amount and categories
        setFormData(prev => ({
          ...prev,
          feeAmount: newFeeAmount,
          totalFees: newFeeAmount,
          feeCategory: newSelected.map(c => c.name).join(', '),
          feeCategories: newSelected.map(c => c.name)
        }));
        
        return newSelected;
      });
    } else {
      setSelectedCategories(prev => {
        const newSelected = prev.filter(c => c.id !== category.id);
        const newFeeAmount = newSelected.reduce((sum, cat) => sum + cat.amount, 0);
        
        // Update form data with new fee amount and categories
        setFormData(prev => ({
          ...prev,
          feeAmount: newFeeAmount,
          totalFees: newFeeAmount,
          feeCategory: newSelected.map(c => c.name).join(', '),
          feeCategories: newSelected.map(c => c.name)
        }));
        
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
      
      const response = await axios.post<FeeResponse>(API_URL, payload);
      
      // Update list with new record
      setRecords(prev => Array.isArray(response.data.data)
        ? [...response.data.data, ...prev]
        : [response.data.data as FeeRecord, ...prev]
      );
      resetForm();
      toast.success('Fee record created successfully');
      setIsFormVisible(false);
    } catch (error: unknown) {
      console.error('Error creating fee record:', error);
      if (error instanceof AxiosError) {
        toast.error(`Failed to create fee record: ${error.response?.data?.message || error.message}`);
      } else if (error instanceof Error) {
        toast.error(`Failed to create fee record: ${error.message}`);
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
      
      // Call API to update the record
      const response = await axios.put<FeeResponse>(`${API_URL}/${updatedRecord.id}`, payload);
      
      if (response.data.success) {
        // Update the record in state
        const updated = response.data.data as FeeRecord;
        setRecords(prevRecords => prevRecords.map(record => record.id === updated.id ? updated : record));
        showNotification('Fee record updated successfully!', 'success');
        setIsUpdateModalOpen(false);
        setSelectedRecord(null);
      } else {
        showNotification(`Failed to update record: ${response.data.message || 'Unknown error'}`, 'error');
      }
    } catch (err: unknown) {
      console.error('Error updating fee record:', err);
      
      if (err instanceof AxiosError) {
        const errorDetails = err.response?.data?.errors?.join(', ') || err.response?.data?.message;
        showNotification(`Server error: ${errorDetails || 'Unknown error'}`, 'error');
      } else if (err instanceof Error) {
        showNotification(`Failed to update fee record: ${err.message}`, 'error');
      } else {
        showNotification('Failed to update fee record: Unknown error', 'error');
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
        const response = await axios.delete<{ success: boolean; message: string }>(`${API_URL}/${id}`);
        
        if (response.data.success) {
          // Remove the record from local state
          setRecords(records.filter(record => record.id !== id));
          showNotification('Fee record deleted successfully!', 'success');
        } else {
          showNotification(`Failed to delete record: ${response.data.message}`, 'error');
        }
      } catch (err: unknown) {
        console.error('Error deleting fee record:', err);
        if (err instanceof Error) {
          showNotification(`Failed to delete fee record: ${err.message}`, 'error');
        } else {
          showNotification('Failed to delete fee record: Unknown error', 'error');
        }
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
  const fetchStudentDetails = async (admissionNumber: string) => {
    if (!admissionNumber.trim()) return;
    
    try {
      setIsLoadingStudent(true);
      setStudentDetails(null);
      
      const response = await axios.get<StudentResponse>(`${STUDENT_API_URL}/admission/${admissionNumber}`);
      
      if (response.data.success) {
        const student = response.data.data;
        
        // Create student details object
        const studentDetailsObj = {
          fullName: student.fullName || '',
          fatherName: student.fatherName || '',
          motherName: student.motherName || '',
          email: student.email || '',
          mobileNumber: student.mobileNumber || '',
          className: student.sessionInfo?.currentClass || student.sessionInfo?.admitClass || '',
          section: student.sessionInfo?.currentSection || student.sessionInfo?.admitSection || '',
          rollNumber: student.sessionInfo?.currentRollNo || student.sessionInfo?.admitRollNo || ''
        };

        setStudentDetails(studentDetailsObj);

        // Update form data with student details
        setFormData(prev => ({
          ...prev,
          studentName: studentDetailsObj.fullName,
          fatherName: studentDetailsObj.fatherName,
          class: studentDetailsObj.className,
          section: studentDetailsObj.section
        }));

        // Fetch fee structure for the student's class
        if (studentDetailsObj.className) {
          await fetchFeeStructureForClass(studentDetailsObj.className);
        }
      }
    } catch (error: unknown) {
      console.error('Error fetching student details:', error);
      if (error instanceof AxiosError) {
        toast.error(`Failed to fetch student details: ${error.response?.data?.message || error.message}`);
      } else if (error instanceof Error) {
        toast.error(`Failed to fetch student details: ${error.message}`);
      } else {
        toast.error('Failed to fetch student details');
      }
    } finally {
      setIsLoadingStudent(false);
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
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-indigo-50 px-6 py-6 sm:px-8 border-b border-indigo-100">
              <h2 className="text-lg font-medium text-indigo-800 mb-4">Add New Fee Record</h2>
              
              {/* Student Details Section */}
              {studentDetails && (
                <div className="mb-6 p-4 bg-white rounded-lg shadow">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Student Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium">{studentDetails.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Father's Name</p>
                      <p className="font-medium">{studentDetails.fatherName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Mother's Name</p>
                      <p className="font-medium">{studentDetails.motherName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{studentDetails.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Mobile Number</p>
                      <p className="font-medium">{studentDetails.mobileNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Class & Section</p>
                      <p className="font-medium">{studentDetails.className} - {studentDetails.section}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-5 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission Number</label>
                  <input
                    required
                    type="text"
                    name="admissionNumber"
                    value={formData.admissionNumber}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. ADM001"
                  />
                  {isLoadingStudent && (
                    <p className="text-sm text-gray-500 mt-1">Loading student details...</p>
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
                          const isSelected = selectedCategories.some(c => c.name === category.name);
                          return (
                            <div key={category.name} className={`flex items-center p-2 mb-1 ${isSelected ? 'bg-blue-50 rounded' : ''}`}>
                              <input
                                type="checkbox"
                                id={`category-${category.name}`}
                                checked={isSelected}
                                onChange={(e) => handleCategorySelect(category, e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                              />
                              <label htmlFor={`category-${category.name}`} className="ml-2 block text-sm text-gray-900 cursor-pointer flex-1">
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
                            key={category.name} 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {category.name}
                            <button
                              type="button"
                              onClick={() => handleCategorySelect(category, false)}
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