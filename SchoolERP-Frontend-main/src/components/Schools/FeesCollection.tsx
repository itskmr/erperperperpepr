import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UpdateFeeRecord from './UpdateFeeRecord';
import { getFeeStructureByClassName, getFeeCategories } from '../../services/feeStructureService';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '../../utils/authApi';

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
  feeCategory: string;
  feeCategories: string[];
  remarks?: string;
  discountType?: string;
  discountAmount?: number;
  discountValue?: number;
  amountAfterDiscount?: number;
  studentDetails?: {
    fullName: string;
    fatherName: string;
    class: string;
    section: string;
    motherName?: string;
    email?: string;
    mobileNumber?: string;
    className?: string;
    fatherContact?: string;
    motherContact?: string;
  };
}

interface StudentApiData {
  id?: string;
  fullName?: string;
  fatherName?: string;
  motherName?: string;
  email?: string;
  mobileNumber?: string;
  sessionInfo?: {
    currentClass?: string;
    currentSection?: string;
  };
  admissionNo?: string;
  section?: string;
}

interface Student {
  id: string;
  fullName: string;
  admissionNumber: string;
  admissionNo?: string; // Add this property for compatibility
  sessionInfo?: {
    currentClass?: string;
    currentSection?: string;
  };
  className?: string;
  section?: string;
  fatherName?: string;
}

interface FeeCategory {
  id: string;
  name: string;
  amount: number;
  frequency: string;
}

interface SchoolDetails {
  id: number;
  schoolName: string;
  address: string;
  phone: string;
  contact: string;
  email: string;
  principal: string;
  image_url?: string;
}

// Standardized class options to match the rest of the system
const CLASS_OPTIONS = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11 (Science)', 'Class 11 (Commerce)', 'Class 11 (Arts)',
  'Class 12 (Science)', 'Class 12 (Commerce)', 'Class 12 (Arts)'
];

// Section options A to D
const SECTION_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Export functions
const exportToCSV = (data: FeeRecord[]) => {
  const headers = [
    'Date',
    'Admission Number',
    'Student Name',
    'Father Name',
    'Class',
    'Section',
    'Fee Categories',
    'Total Fees',
    'Amount Paid',
    'Fee Amount',
    'Payment Mode',
    'Receipt Number',
    'Status',
    'Discount Type',
    'Discount Amount',
    'Amount After Discount'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(record => [
      new Date(record.paymentDate).toLocaleDateString(),
      `"${record.admissionNumber || ''}"`,
      `"${record.studentName || ''}"`,
      `"${record.fatherName || ''}"`,
      `"${record.class || ''}"`,
      `"${record.section || ''}"`,
      `"${record.feeCategory || ''}"`,
      record.totalFees || 0,
      record.amountPaid || 0,
      record.feeAmount || 0,
      record.paymentMode || '',
      `"${record.receiptNumber || ''}"`,
      record.status || '',
      `"${record.discountType || ''}"`,
      record.discountAmount || 0,
      record.amountAfterDiscount || 0,
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `fee_records_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToPDF = async (data: FeeRecord[]) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Fee Collection Report', 20, 20);
  
  // Add date
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
  
  // Add records
  let yPosition = 50;
  doc.setFontSize(10);
  
  data.forEach((record, index) => {
    if (yPosition > 280) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.text(`${index + 1}. ${record.studentName} (${record.admissionNumber})`, 20, yPosition);
    doc.text(`Class: ${record.class}-${record.section}`, 30, yPosition + 8);
    doc.text(`Fee Amount: ₹${record.feeAmount}`, 30, yPosition + 16);
    doc.text(`Amount Paid: ₹${record.amountPaid}`, 30, yPosition + 24);
    doc.text(`Status: ${record.status}`, 30, yPosition + 32);
    doc.text(`Date: ${new Date(record.paymentDate).toLocaleDateString()}`, 30, yPosition + 40);
    
    yPosition += 55;
  });
  
  doc.save(`fee_records_${new Date().toISOString().split('T')[0]}.pdf`);
};

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
    feeCategories: [],
    discountType: '',
    discountAmount: 0,
    discountValue: 0,
    amountAfterDiscount: 0
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); 
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

  // New state for mass fee collection
  const [selectedClass, setSelectedClass] = useState('');
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isMassFeeFormVisible, setIsMassFeeFormVisible] = useState(false);

  // Fix the type for student fee amounts
  const [studentFeeAmounts, setStudentFeeAmounts] = useState<{ [key: string]: number }>({});

  // New state for view record
  const [selectedRecordForView, setSelectedRecordForView] = useState<FeeRecord | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Add school details state
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(null);

  // Add state for custom discount type
  const [customDiscountType, setCustomDiscountType] = useState('');

  // Load data from backend
  useEffect(() => {
    fetchFeeRecords();
    // Load available fee categories when component mounts
    loadFeeCategories();
    // Load school details when component mounts
    fetchSchoolDetails();
  }, []);

  // Calculate summary statistics
  const calculateSummaryStats = () => {
    const totalRecords = records.length;
    const totalAmountToBePaid = records.reduce((sum, record) => sum + (record.amountAfterDiscount || record.feeAmount || 0), 0);
    const totalFeesPaid = records.reduce((sum, record) => sum + (record.amountPaid || 0), 0);
    const feesLeftToBePaid = totalAmountToBePaid - totalFeesPaid;
    
    const fullyPaid = records.filter(record => record.status === 'Paid').length;
    const partialPaid = records.filter(record => record.status === 'Partial').length;
    const pending = records.filter(record => record.status === 'Pending').length;
    
    // Get unique students count
    const uniqueStudents = new Set(records.map(record => record.admissionNumber)).size;
    
    return {
      totalRecords,
      totalAmountToBePaid,
      totalFeesPaid,
      feesLeftToBePaid,
      fullyPaid,
      partialPaid,
      pending,
      uniqueStudents
    };
  };

  const summaryStats = calculateSummaryStats();

  // Fetch school details from backend
  const fetchSchoolDetails = async () => {
    try {
      interface SchoolApiResponse {
        id?: number;
        schoolName?: string;
        address?: string;
        phone?: string;
        contact?: string;
        email?: string;
        principal?: string;
        image_url?: string;
      }
      
      const data = await apiGet('/transport/school-info') as SchoolApiResponse;
      if (data && data.schoolName) {
        setSchoolDetails({
          id: data.id || 1,
          schoolName: data.schoolName || 'SCHOOL NAME',
          address: data.address || 'School Address',
          phone: data.phone || '0123456789',
          contact: data.contact || data.phone || '0123456789',
          email: data.email || 'school@example.com',
          principal: data.principal || 'Principal Name',
          image_url: data.image_url
        });
      }
    } catch (err) {
      console.error('Error fetching school details:', err);
      // Set default school details if fetch fails
      setSchoolDetails({
        id: 1,
        schoolName: 'SCHOOL NAME',
        address: 'School Address',
        phone: '0123456789',
        contact: '0123456789',
        email: 'school@example.com',
        principal: 'Principal Name'
      });
    }
  };

  // Fetch records from backend
  const fetchFeeRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiGet<FeeRecord[]>('/fees');
      // Transform dates to string format for the component
      let formattedRecords: FeeRecord[] = [];
      if (Array.isArray(data)) {
        formattedRecords = data.map((record: FeeRecord) => ({
          ...record,
          paymentDate: new Date(record.paymentDate).toISOString().split('T')[0]
        }));
      } else if (data) {
        const record = data as FeeRecord;
        formattedRecords = [{
          ...record,
          paymentDate: new Date(record.paymentDate).toISOString().split('T')[0]
        }];
      }
      setRecords(formattedRecords);
      
    } catch (err: unknown) {
      console.error('Error fetching fee records:', err);
      const apiErr = err as ApiError;
      setError(`Failed to fetch fee records: ${apiErr.message || 'Unknown error'}`);
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
        [name]: ['feeAmount', 'totalFees', 'amountPaid', 'discountAmount'].includes(name) ? parseFloat(value) || 0 : value
      };

      // Calculate discount values when discount type or amount changes
      if (name === 'discountAmount' || name === 'discountType' || name === 'feeAmount') {
        const discountPercent = parseFloat(String(updatedData.discountAmount)) || 0;
        const totalAmount = updatedData.feeAmount || 0;
        
        if (updatedData.discountType && discountPercent > 0) {
          updatedData.discountValue = (totalAmount * discountPercent) / 100;
          updatedData.amountAfterDiscount = totalAmount - updatedData.discountValue;
        } else {
          updatedData.discountValue = 0;
          updatedData.amountAfterDiscount = totalAmount;
        }
      }

      // When amountPaid changes, update the status automatically
      if (name === 'amountPaid') {
        const amountPaid = parseFloat(value) || 0;
        const finalAmount = updatedData.amountAfterDiscount || updatedData.feeAmount || 0;
        if (amountPaid >= finalAmount) {
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
      feeCategories: [],
      discountType: '',
      discountAmount: 0,
      discountValue: 0,
      amountAfterDiscount: 0
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
    try {
      console.log('🔍 Preparing fee data for submission:', formData);
      console.log('🔍 Selected categories:', selectedCategories);
      
      // Validate required fields
      if (!formData.admissionNumber || !formData.studentName || !formData.fatherName || 
          !formData.class || !formData.section || !formData.paymentMode || !formData.receiptNumber) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      // Create clean payload matching backend validation schema exactly
      const submitData = {
        admissionNumber: formData.admissionNumber.trim(),
        studentName: formData.studentName.trim(),
        fatherName: formData.fatherName.trim(),
        class: formData.class,
        section: formData.section,
        totalFees: Number(formData.totalFees) || 0,
        amountPaid: Number(formData.amountPaid) || 0,
        feeAmount: Number(formData.feeAmount) || 0,
        paymentDate: formData.paymentDate, // Keep as string, backend expects string
        paymentMode: formData.paymentMode,
        receiptNumber: formData.receiptNumber.trim(),
        status: formData.status,
        feeCategory: formData.feeCategory || selectedCategories.map(cat => cat.name).join(', ') || '',
        feeCategories: selectedCategories.map(cat => cat.name),
        discountType: formData.discountType || null,
        discountAmount: formData.discountAmount ? Number(formData.discountAmount) : null,
        discountValue: formData.discountValue ? Number(formData.discountValue) : null,
        amountAfterDiscount: formData.amountAfterDiscount ? Number(formData.amountAfterDiscount) : null
        // Removed 'remarks' as it's not in the validation schema
      };

      console.log('📤 Sending fee data to API:', submitData);
      const response = await apiPost('/fees', submitData);
      console.log('✅ Fee record created successfully:', response);
      
      // Handle the response properly - it should be a FeeRecord or wrapped in data
      let newRecord: FeeRecord;
      if (response && typeof response === 'object' && 'data' in response) {
        newRecord = response.data as FeeRecord;
      } else {
        newRecord = response as FeeRecord;
      }
      
      setRecords(prev => [newRecord, ...prev]);
      resetForm();
      showNotification('Fee record added successfully!', 'success');
    } catch (error) {
      console.error('❌ Error submitting fee record:', error);
      const apiErr = error as ApiError;
      
      // Show more detailed error message if available
      if (apiErr.message && apiErr.message.includes('errors:')) {
        showNotification(`Validation Error: ${apiErr.message}`, 'error');
      } else {
        showNotification(apiErr.message || 'Error adding fee record', 'error');
      }
    }
  };

  // Function to open the update modal with selected record
  const handleUpdateClick = (record: FeeRecord) => {
    setSelectedRecord(record);
    setIsUpdateModalOpen(true);
  };

  // Handle record update - fix the function signature
  const handleRecordUpdate = (updatedRecord: FeeRecord) => {
    try {
      const updateRecord = async () => {
        const data: FeeRecord = await apiPut(`/fees/${updatedRecord.id}`, updatedRecord);
        
        setRecords(prev => prev.map(record => 
          record.id === updatedRecord.id ? data : record
        ));
        
        setIsUpdateModalOpen(false);
        setSelectedRecord(null);
        showNotification('Fee record updated successfully!', 'success');
      };
      
      updateRecord();
    } catch (error) {
      console.error('Error updating fee record:', error);
      const apiErr = error as ApiError;
      showNotification(apiErr.message || 'Error updating fee record', 'error');
    }
  };

  // Handle record deletion
  const handleDeleteRecord = async (id: string) => {
    try {
      await apiDelete(`/fees/${id}`);
      setRecords(prev => prev.filter(record => record.id !== id));
      showNotification('Fee record deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting fee record:', error);
      const apiErr = error as ApiError;
      showNotification(apiErr.message || 'Error deleting fee record', 'error');
    }
  };

  const showNotification = (message: string, type: string) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 4000);
  };

  // Fix the handleSort function
  const handleSort = (field: keyof FeeRecord) => {
    setSortDirection(prev => sortField === field && prev === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  // Add function to fetch student details by admission number
  const fetchStudentDetails = async (admissionNumber: string) => {
    if (!admissionNumber.trim()) {
      return;
    }
    
    try {
      console.log('🔍 Fetching student details for admission number:', admissionNumber);
      
      interface StudentApiResponse {
        data?: StudentApiData;
      }
      
      const response = await apiGet(`/students/admission/${admissionNumber}`) as StudentApiResponse | StudentApiData;
      console.log('📡 Student API response:', response);
      
      let studentData: StudentApiData | null = null;
      
      // Check if response has student data directly (has id, fullName, etc.)
      if (response && 'id' in response && response.id) {
        console.log('✅ Processing direct student response');
        studentData = response as StudentApiData;
      } else if (response && 'data' in response && response.data) {
        console.log('✅ Processing wrapped student response');
        studentData = response.data;
      }
      
      if (studentData) {
        console.log('✅ Student data found:', studentData);
        
        setFormData(prev => ({
          ...prev,
          studentName: studentData!.fullName || '',
          fatherName: studentData!.fatherName || '',
          class: studentData!.sessionInfo?.currentClass || '',
          section: studentData!.sessionInfo?.currentSection || '',
        }));
        
        setStudentDetails({
          fullName: studentData.fullName || '',
          fatherName: studentData.fatherName || '',
          motherName: studentData.motherName || '',
          email: studentData.email || '',
          mobileNumber: studentData.mobileNumber || '',
          class: studentData.sessionInfo?.currentClass || '',
          section: studentData.sessionInfo?.currentSection || '',
          className: studentData.sessionInfo?.currentClass || '',
        });
        
        showNotification('Student details loaded successfully!', 'success');
      } else {
        console.log('❌ No student found for admission number:', admissionNumber);
        // Reset form if no student found
        setFormData(prev => ({
          ...prev,
          studentName: '',
          fatherName: '',
          class: '',
          section: ''
        }));
        setStudentDetails(null);
        showNotification('Student not found with this admission number', 'error');
      }
    } catch (error) {
      console.error('❌ Error fetching student details:', error);
      const apiErr = error as ApiError;
      showNotification(apiErr.message || 'Error fetching student details', 'error');
      
      // Reset form data on error
      setFormData(prev => ({
        ...prev,
        studentName: '',
        fatherName: '',
        class: '',
        section: ''
      }));
      setStudentDetails(null);
    }
  };

  // Filter and sort records
  const filteredRecords = records
    .filter(record => 
      (record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       record.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
       record.fatherName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterClass === '' || record.class === filterClass) &&
      (filterSection === '' || record.section === filterSection) &&
      (filterStatus === '' || record.status === filterStatus)
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

  // Function to fetch students by class and section - FIXED
  const fetchStudentsByClass = async (className: string, section: string) => {
    if (!className || !section) {
      console.log('❌ Missing className or section:', { className, section });
      return;
    }
    
    try {
      setIsLoadingStudents(true);
      console.log('🔍 Fetching students for class:', className, 'section:', section);
      
      interface StudentsApiResponse {
        data?: StudentApiData[];
      }
      
      const response = await apiGet(`/students/class/${className}/section/${section}`) as StudentsApiResponse | StudentApiData[];
      console.log('📡 Students API response:', response);
      
      let students: Student[] = [];
      
      if (response && 'data' in response && Array.isArray(response.data)) {
        console.log('✅ Processing response with data field, found', response.data.length, 'students');
        // Handle response with data field
        students = response.data.map((student: StudentApiData) => ({
          id: student.id || '',
          fullName: student.fullName || "",
          admissionNumber: student.admissionNo || '',
          admissionNo: student.admissionNo || '', // Add for compatibility
          section: student.sessionInfo?.currentSection || student.section || '',
          fatherName: student.fatherName || '',
          className: student.sessionInfo?.currentClass || className
        }));
      } else if (Array.isArray(response)) {
        console.log('✅ Processing direct array response, found', response.length, 'students');
        // Handle direct array response
        students = response.map((student: StudentApiData) => ({
          id: student.id || '',
          fullName: student.fullName || "",
          admissionNumber: student.admissionNo || '',
          admissionNo: student.admissionNo || '', // Add for compatibility
          section: student.section || '',
          fatherName: student.fatherName || ''
        }));
      } else {
        console.log('❌ No students found in response');
        setClassStudents([]);
        showNotification('No students found for the selected class and section', 'error');
        return;
      }
      
      console.log('📋 Setting students in state:', students);
      setClassStudents(students);
      
      // Initialize student fee amounts with full fee
      const initialAmounts: { [key: string]: number } = {};
      students.forEach((student: Student) => {
        const totalFee = feeStructureCategories
          .filter(cat => selectedCategories.some(c => c.name === cat.name))
          .reduce((sum, cat) => sum + cat.amount, 0);
        initialAmounts[student.id] = totalFee;
      });
      setStudentFeeAmounts(initialAmounts);
      
      showNotification(`Found ${students.length} students for ${className} - ${section}`, 'success');
      
    } catch (err: unknown) {
      console.error('❌ Error fetching students:', err);
      const apiErr = err as ApiError;
      
      if (apiErr.status === 404) {
        showNotification('No students found for the selected class and section', 'error');
      } else if (apiErr.status === 500) {
        showNotification('Server error while fetching students', 'error');
      } else {
        showNotification(apiErr.message || 'Failed to fetch students', 'error');
      }
      setClassStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Function to handle class selection for mass fee collection
  const handleMassFeeClassChange = (className: string) => {
    console.log('📝 Class changed to:', className);
    setSelectedClass(className);
    setSelectedStudents([]);
    setClassStudents([]); // Clear previous students
    fetchFeeStructureForClass(className);
  };

  // Function to handle section selection for mass fee collection
  const handleMassFeeSectionChange = (section: string) => {
    console.log('📝 Section changed to:', section);
    setFormData(prev => ({ ...prev, section }));
    if (selectedClass) {
      fetchStudentsByClass(selectedClass, section);
    } else {
      console.log('❌ No class selected yet');
    }
  };

  // Function to handle student selection
  const handleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => {
      const newSelected = prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId];
      
      // Reset fee amounts for deselected students
      if (!newSelected.includes(studentId)) {
        setStudentFeeAmounts(prev => {
          const newAmounts = { ...prev };
          // Only remove the deselected student's amount
          delete newAmounts[studentId];
          return newAmounts;
        });
      }
      
      return newSelected;
    });
  };

  // Function to handle select all students
  const handleSelectAllStudents = () => {
    if (selectedStudents.length === classStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(classStudents.map(student => student.id));
    }
  };

  // Add this new function to handle individual fee amounts
  const handleStudentFeeAmountChange = (studentId: string, amount: number) => {
    setStudentFeeAmounts(prev => ({
      ...prev,
      [studentId]: amount
    }));
  };

  // Add function to set full fees for all selected students
  const handleSetFullFeeForAll = () => {
    const totalAmount = selectedCategories.reduce((sum, cat) => sum + cat.amount, 0);
    const newAmounts: { [key: string]: number } = {};
    selectedStudents.forEach(studentId => {
      newAmounts[studentId] = totalAmount;
    });
    setStudentFeeAmounts(prev => ({ ...prev, ...newAmounts }));
  };

  // Update handleMassFeeSubmit to use authenticated API
  const handleMassFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      showNotification('Please select at least one student', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const selectedFeeCategories = feeStructureCategories.filter(cat => 
        selectedCategories.some((selected: FeeCategory) => selected.id === cat.id)
      );

      const totalAmount = selectedFeeCategories.reduce((sum: number, cat: FeeCategory) => sum + cat.amount, 0);

      // Create fee records for each selected student with their individual amounts
      const promises = selectedStudents.map(studentId => {
        const student = classStudents.find(s => s.id === studentId);
        if (!student) return null;

        const studentFeeAmount = studentFeeAmounts[studentId];
        const amount = studentFeeAmount || totalAmount;

        const payload = {
          admissionNumber: student.admissionNo || student.admissionNumber,
          studentName: student.fullName,
          fatherName: student.fatherName,
          class: selectedClass,
          section: formData.section,
          totalFees: totalAmount,
          amountPaid: amount,
          feeAmount: amount,
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMode: formData.paymentMode,
          receiptNumber: formData.receiptNumber,
          status: amount >= totalAmount ? 'Paid' : amount > 0 ? 'Partial' : 'Pending',
          feeCategory: selectedFeeCategories.map((c: FeeCategory) => c.name).join(', '),
          feeCategories: selectedFeeCategories.map((c: FeeCategory) => c.name)
        };

        return apiPost('/fees', payload);
      });

      await Promise.all(promises.filter(Boolean));
      showNotification('Fee records created successfully', 'success');
      setIsMassFeeFormVisible(false);
      fetchFeeRecords();
    } catch (err: unknown) {
      console.error('Error creating mass fee records:', err);
      const apiErr = err as ApiError;
      showNotification('Failed to create fee records: ' + (apiErr.message || 'Unknown error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to handle view record
  const handleViewRecord = (record: FeeRecord) => {
    setSelectedRecordForView(record);
    setIsViewModalOpen(true);
  };

  // Comprehensive number to words function for Indian currency
  const numberToWords = (num: number): string => {
    if (num === 0) return 'Zero';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convertHundreds = (n: number): string => {
      let result = '';
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        return result.trim();
      }
      if (n > 0) {
        result += ones[n] + ' ';
      }
      return result.trim();
    };
    
    const convertIndianSystem = (n: number): string => {
      if (n === 0) return '';
      
      let result = '';
      
      // Handle crores
      if (n >= 10000000) {
        const crores = Math.floor(n / 10000000);
        result += convertHundreds(crores) + ' Crore ';
        n %= 10000000;
      }
      
      // Handle lakhs
      if (n >= 100000) {
        const lakhs = Math.floor(n / 100000);
        result += convertHundreds(lakhs) + ' Lakh ';
        n %= 100000;
      }
      
      // Handle thousands
      if (n >= 1000) {
        const thousands = Math.floor(n / 1000);
        result += convertHundreds(thousands) + ' Thousand ';
        n %= 1000;
      }
      
      // Handle remaining hundreds
      if (n > 0) {
        result += convertHundreds(n) + ' ';
      }
      
      return result.trim();
    };
    
    // Handle decimal part for paise
    const wholePart = Math.floor(num);
    const decimalPart = Math.round((num - wholePart) * 100);
    
    let result = convertIndianSystem(wholePart);
    if (result) {
      result += ' Rupees';
    }
    
    if (decimalPart > 0) {
      result += ' and ' + convertIndianSystem(decimalPart) + ' Paise';
    }
    
    return result || 'Zero Rupees';
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
        <div className="flex gap-4">
          {/* Export Buttons */}
          <button
            onClick={() => exportToCSV(records)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => exportToPDF(records)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
            Export PDF
          </button>
          <button
            onClick={() => setIsMassFeeFormVisible(!isMassFeeFormVisible)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out flex items-center"
          >
            {isMassFeeFormVisible ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Cancel Mass Fee Collection
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Mass Fee Collection
              </>
            )}
          </button>
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
      </div>

      {/* Summary Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Records */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Fee Records</p>
              <p className="text-2xl font-bold">{summaryStats.totalRecords}</p>
            </div>
            <div className="bg-blue-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Students</p>
              <p className="text-2xl font-bold">{summaryStats.uniqueStudents}</p>
            </div>
            <div className="bg-purple-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Amount Metrics */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Amount to be Paid</p>
              <p className="text-xl font-bold">₹{summaryStats.totalAmountToBePaid.toLocaleString()}</p>
              <p className="text-green-100 text-xs mt-1">Amount Paid: ₹{summaryStats.totalFeesPaid.toLocaleString()}</p>
            </div>
            <div className="bg-green-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Outstanding Amount */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Outstanding Amount</p>
              <p className="text-xl font-bold">₹{summaryStats.feesLeftToBePaid.toLocaleString()}</p>
              <p className="text-red-100 text-xs mt-1">Fees Left to be Paid</p>
            </div>
            <div className="bg-red-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Status Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Fully Paid</p>
                <p className="text-2xl font-bold text-green-900">{summaryStats.fullyPaid}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-600">Partial Paid</p>
                <p className="text-2xl font-bold text-yellow-900">{summaryStats.partialPaid}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-600">Pending</p>
                <p className="text-2xl font-bold text-red-900">{summaryStats.pending}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mass Fee Collection Form */}
      <AnimatePresence>
        {isMassFeeFormVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-green-50 px-6 py-6 sm:px-8 border-b border-green-100 rounded-lg shadow-md">
              <h2 className="text-lg font-medium text-green-800 mb-4">Mass Fee Collection</h2>
              <form onSubmit={handleMassFeeSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Class Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => handleMassFeeClassChange(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Class</option>
                      {CLASS_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* Section Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Section</label>
                    <select
                      value={formData.section}
                      onChange={(e) => handleMassFeeSectionChange(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={!selectedClass}
                    >
                      <option value="">Select Section</option>
                      {SECTION_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fee Structure Display */}
                {selectedClass && feeStructureCategories.length > 0 && (
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Fee Structure</h3>
                    <div className="space-y-2">
                      {feeStructureCategories.map(category => (
                        <div key={category.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`mass-category-${category.id}`}
                              checked={selectedCategories.some(c => c.id === category.id)}
                              onChange={(e) => handleCategorySelect(category, e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                            />
                            <label htmlFor={`mass-category-${category.id}`} className="ml-2 text-sm text-gray-900">
                              {category.name}
                            </label>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            ₹{category.amount.toLocaleString()} - {category.frequency}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                        <span className="text-xl font-bold text-blue-600">
                          ₹{selectedCategories.reduce((sum, cat) => sum + cat.amount, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Student List */}
                {selectedClass && formData.section && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-800">Select Students</h3>
                      <div className="flex gap-2">
                    <button
                      type="button"
                          onClick={handleSelectAllStudents}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                          {selectedStudents.length === classStudents.length ? 'Deselect All Students' : 'Select All Students'}
                        </button>
                        {selectedStudents.length > 0 && (
                          <button
                            type="button"
                            onClick={handleSetFullFeeForAll}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                            Set Full Fees for All
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {isLoadingStudents ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : classStudents.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <p className="text-sm text-gray-600">
                            {selectedStudents.length} of {classStudents.length} students selected
                          </p>
                        </div>
                        {classStudents.map(student => {
                          const studentFeeAmount = studentFeeAmounts[student.id];
                          const totalAmount = selectedCategories.reduce((sum, cat) => sum + cat.amount, 0);
                          
                          return (
                            <div
                              key={student.id}
                              className="flex items-center p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                id={`student-${student.id}`}
                                checked={selectedStudents.includes(student.id)}
                                onChange={() => handleStudentSelection(student.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                              />
                              <label htmlFor={`student-${student.id}`} className="ml-3 flex-1 cursor-pointer">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{student.fullName}</p>
                                    <p className="text-xs text-gray-500">Admission No: {student.admissionNumber}</p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                      <p className="text-sm text-gray-600">Section {student.section}</p>
                                      {selectedStudents.includes(student.id) && (
                                        <div className="mt-2">
                                          <input
                                            type="number"
                                            value={studentFeeAmount || totalAmount}
                                            onChange={(e) => handleStudentFeeAmountChange(student.id, Number(e.target.value))}
                                            className="w-32 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter amount"
                                            min="0"
                                            max={totalAmount}
                                          />
                                          <p className="text-xs text-gray-500 mt-1">
                                            Max: ₹{totalAmount.toLocaleString()}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">No students found in this class and section</p>
                    )}
                  </div>
                )}

                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                {/* Discount Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <div className="flex space-x-2">
                    <select
                      name="discountType"
                      value={formData.discountType && !customDiscountType ? formData.discountType : (customDiscountType ? 'other' : formData.discountType)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'other') {
                          setCustomDiscountType('');
                          setFormData(prev => ({ ...prev, discountType: 'other' }));
                        } else {
                          setCustomDiscountType('');
                          setFormData(prev => ({ ...prev, discountType: value }));
                        }
                      }}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Discount</option>
                      <option value="sibling_discount">Sibling Discount</option>
                      <option value="full_payment_discount">Full Payment Discount</option>
                      <option value="parent_employee_discount">Parent is Campus Employee</option>
                      <option value="scholarship">Scholarship</option>
                      <option value="early_payment">Early Payment Discount</option>
                      <option value="financial_aid">Financial Aid</option>
                      <option value="other">Other</option>
                    </select>
                    {(formData.discountType === 'other' || customDiscountType) && (
                      <input
                        type="text"
                        name="customDiscountType"
                        placeholder="Specify discount name"
                        value={customDiscountType}
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => {
                          const value = e.target.value;
                          setCustomDiscountType(value);
                          // Update the actual discount type with the custom value, but keep 'other' for UI logic
                          setFormData(prev => ({ 
                            ...prev, 
                            discountType: value || 'other'
                          }));
                        }}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    name="discountAmount"
                    value={formData.discountAmount || 0}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter discount percentage (0-100)"
                    min="0"
                    max="100"
                    step="0.1"
                    disabled={!formData.discountType}
                  />
                  {formData.discountType && (formData.discountAmount || 0) > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-md text-sm">
                      <div className="flex justify-between mb-1">
                        <span>Total Fee Amount:</span>
                        <span className="font-medium">₹{(formData.feeAmount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-1 text-red-600">
                        <span>Discount ({formData.discountAmount}%):</span>
                        <span className="font-medium">- ₹{(formData.discountValue || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 font-bold text-green-600">
                        <span>Amount After Discount:</span>
                        <span>₹{(formData.amountAfterDiscount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
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

      {/* Add new fee form */}
      <AnimatePresence>
        {isFormVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-indigo-50 px-6 py-6 sm:px-8 border-b border-indigo-100 rounded-lg shadow-md">
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
                    {studentDetails.motherName && (
                      <div>
                        <p className="text-sm text-gray-600">Mother's Name</p>
                        <p className="font-medium">{studentDetails.motherName}</p>
                      </div>
                    )}
                    {studentDetails.email && (
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{studentDetails.email}</p>
                      </div>
                    )}
                    {studentDetails.mobileNumber && (
                      <div>
                        <p className="text-sm text-gray-600">Mobile Number</p>
                        <p className="font-medium">{studentDetails.mobileNumber}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Class & Section</p>
                      <p className="font-medium">{studentDetails.className || studentDetails.class} - {studentDetails.section}</p>
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
                    onBlur={() => formData.admissionNumber && fetchStudentDetails(formData.admissionNumber)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. ADM001"
                  />
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
                    readOnly={!!studentDetails}
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
                    readOnly={!!studentDetails}
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
                  {studentDetails && (
                    <p className="mt-1 text-sm text-gray-500">Class is auto-filled from student details but can be modified if needed</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
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

                {/* Discount Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <div className="flex space-x-2">
                    <select
                      name="discountType"
                      value={formData.discountType && !customDiscountType ? formData.discountType : (customDiscountType ? 'other' : formData.discountType)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'other') {
                          setCustomDiscountType('');
                          setFormData(prev => ({ ...prev, discountType: 'other' }));
                        } else {
                          setCustomDiscountType('');
                          setFormData(prev => ({ ...prev, discountType: value }));
                        }
                      }}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Discount</option>
                      <option value="sibling_discount">Sibling Discount</option>
                      <option value="full_payment_discount">Full Payment Discount</option>
                      <option value="parent_employee_discount">Parent is Campus Employee</option>
                      <option value="scholarship">Scholarship</option>
                      <option value="early_payment">Early Payment Discount</option>
                      <option value="financial_aid">Financial Aid</option>
                      <option value="other">Other</option>
                    </select>
                    {(formData.discountType === 'other' || customDiscountType) && (
                      <input
                        type="text"
                        name="customDiscountType"
                        placeholder="Specify discount name"
                        value={customDiscountType}
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => {
                          const value = e.target.value;
                          setCustomDiscountType(value);
                          // Update the actual discount type with the custom value, but keep 'other' for UI logic
                          setFormData(prev => ({ 
                            ...prev, 
                            discountType: value || 'other'
                          }));
                        }}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    name="discountAmount"
                    value={formData.discountAmount || 0}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter discount percentage (0-100)"
                    min="0"
                    max="100"
                    step="0.1"
                    disabled={!formData.discountType}
                  />
                  {formData.discountType && (formData.discountAmount || 0) > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-md text-sm">
                      <div className="flex justify-between mb-1">
                        <span>Total Fee Amount:</span>
                        <span className="font-medium">₹{(formData.feeAmount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-1 text-red-600">
                        <span>Discount ({formData.discountAmount}%):</span>
                        <span className="font-medium">- ₹{(formData.discountValue || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 font-bold text-green-600">
                        <span>Amount After Discount:</span>
                        <span>₹{(formData.amountAfterDiscount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilterClass('');
              setFilterSection('');
              setFilterStatus('');
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition duration-300 ease-in-out"
          >
            Clear Filters
          </button>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('amountPaid')}>
                    Amount Paid {renderSortArrow('amountPaid')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('paymentDate')}>
                    Date {renderSortArrow('paymentDate')}
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
                    <td className="px-4 py-3 text-sm text-gray-900">{record.amountPaid}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(record.paymentDate).toLocaleDateString()}</td>
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
                          onClick={() => handleViewRecord(record)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleUpdateClick(record)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Record"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Record"
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

      {/* View Modal */}
      {selectedRecordForView && (
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full ${isViewModalOpen ? 'block' : 'hidden'}`}>
          <div className="relative top-10 mx-auto p-6 border w-full max-w-3xl shadow-lg rounded-lg bg-white print:w-full print:max-w-full print:shadow-none print:rounded-none">
            <div className="bg-white border border-black rounded-lg p-6 print:border print:rounded-none print:p-4">
              {/* School Header */}
              <div className="flex flex-col items-center text-center mb-2">
                {/* Logo (use school logo if available) */}
                <div className="mb-2">
                  {schoolDetails?.image_url ? (
                    <img 
                      src={schoolDetails.image_url} 
                      alt="School Logo" 
                      className="h-16 w-16 object-contain mx-auto" 
                      onError={(e) => {
                        // Fallback to default logo if school image fails
                        e.currentTarget.src = '/school-logo.png';
                        e.currentTarget.onerror = () => {
                          e.currentTarget.style.display = 'none';
                        };
                      }} 
                    />
                  ) : (
                    <img src="/school-logo.png" alt="School Logo" className="h-16 w-16 object-contain mx-auto" onError={e => (e.currentTarget.style.display = 'none')} />
                  )}
                </div>
                <h2 className="text-2xl font-bold uppercase tracking-wide">{schoolDetails?.schoolName || 'SCHOOL NAME'}</h2>
                <div className="text-sm font-medium">{schoolDetails?.address || 'School Address'}</div>
                <div className="text-sm">Contact Nos.: {schoolDetails?.phone || '-'}</div>
                <div className="text-sm">Email : {schoolDetails?.email || '-'}{schoolDetails?.principal ? `, Principal: ${schoolDetails.principal}` : ''}</div>
              </div>
              <hr className="my-2 border-black" />
              <div className="text-center font-semibold text-lg mb-2">FEE RECEIPT (2025-2026)</div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                <div>
                  <div className="flex mb-1"><span className="w-32 font-semibold">Receipt No</span>: <span className="ml-2">{selectedRecordForView.receiptNumber || '-'}</span></div>
                  <div className="flex mb-1"><span className="w-32 font-semibold">Name</span>: <span className="ml-2">{selectedRecordForView.studentName} {selectedRecordForView.fatherName ? `S/D/O ${selectedRecordForView.fatherName}` : ''} {selectedRecordForView.studentDetails?.motherName ? `/ ${selectedRecordForView.studentDetails.motherName}` : ''}</span></div>
                  <div className="flex mb-1"><span className="w-32 font-semibold">Admn No</span>: <span className="ml-2">{selectedRecordForView.admissionNumber}</span></div>
                  <div className="flex mb-1">
                    <span className="w-32 font-semibold">Contact No</span>: 
                    <span className="ml-2">
                      {selectedRecordForView.studentDetails?.fatherContact || 
                       selectedRecordForView.studentDetails?.mobileNumber || 
                       'N/A'}
                      {selectedRecordForView.studentDetails?.motherContact && 
                       selectedRecordForView.studentDetails.fatherContact !== selectedRecordForView.studentDetails.motherContact && 
                       `, ${selectedRecordForView.studentDetails.motherContact}`}
                    </span>
                  </div>
                  <div className="flex mb-1"><span className="w-32 font-semibold">Fee Month</span>: <span className="ml-2">{selectedRecordForView.paymentDate ? new Date(selectedRecordForView.paymentDate).toLocaleString('default', { month: 'long' }) : '-'}</span></div>
                </div>
                <div>
                  <div className="flex mb-1"><span className="w-32 font-semibold">Date</span>: <span className="ml-2">{selectedRecordForView.paymentDate ? new Date(selectedRecordForView.paymentDate).toLocaleDateString() : '-'}</span></div>
                  <div className="flex mb-1"><span className="w-32 font-semibold">Class</span>: <span className="ml-2">{selectedRecordForView.class} - {selectedRecordForView.section}</span></div>
                  {/* Add discount information if applicable */}
                  {selectedRecordForView.discountType && selectedRecordForView.discountType !== '' && (
                    <>
                      <div className="flex mb-1"><span className="w-32 font-semibold">Discount Type</span>: <span className="ml-2">{selectedRecordForView.discountType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span></div>
                      <div className="flex mb-1"><span className="w-32 font-semibold">Discount (%)</span>: <span className="ml-2">{selectedRecordForView.discountAmount || 0}%</span></div>
                    </>
                  )}
                </div>
              </div>

              {/* Discount Summary (if applicable) */}
              {selectedRecordForView.discountType && selectedRecordForView.discountType !== '' && (
                <div className="bg-blue-50 p-3 rounded-lg mb-2 border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Discount Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Total Fee Amount</div>
                      <div className="text-lg font-bold text-gray-900">₹{selectedRecordForView.feeAmount?.toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Discount ({selectedRecordForView.discountAmount || 0}%)</div>
                      <div className="text-lg font-bold text-red-600">-₹{selectedRecordForView.discountValue?.toLocaleString() || '0'}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Amount After Discount</div>
                      <div className="text-lg font-bold text-green-600">₹{selectedRecordForView.amountAfterDiscount?.toLocaleString() || selectedRecordForView.feeAmount?.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}
              {/* <div className="text-center font-semibold text-lg mb-2">FEE RECEIPT (2025-2026)</div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                <div>
                  <div className="flex mb-1"><span className="w-32 font-semibold">Receipt No</span>: <span className="ml-2">{selectedRecordForView.receiptNumber || '-'}</span></div>
                  <div className="flex mb-1"><span className="w-32 font-semibold">Name</span>: <span className="ml-2">{selectedRecordForView.studentName} {selectedRecordForView.fatherName ? `S/D/O ${selectedRecordForView.fatherName}` : ''} {selectedRecordForView.studentDetails?.motherName ? `/ ${selectedRecordForView.studentDetails.motherName}` : ''}</span></div>
                  <div className="flex mb-1"><span className="w-32 font-semibold">Admn No</span>: <span className="ml-2">{selectedRecordForView.admissionNumber}</span></div>
                  <div className="flex mb-1"><span className="w-32 font-semibold">Contact No</span>: <span className="ml-2">{selectedRecordForView.studentDetails?.mobileNumber || 'N/A'}</span></div>
                  <div className="flex mb-1"><span className="w-32 font-semibold">Fee Month</span>: <span className="ml-2">{selectedRecordForView.paymentDate ? new Date(selectedRecordForView.paymentDate).toLocaleString('default', { month: 'long' }) : '-'}</span></div>
                </div>
                <div>
                  <div className="flex mb-1"><span className="w-32 font-semibold">Date</span>: <span className="ml-2">{selectedRecordForView.paymentDate ? new Date(selectedRecordForView.paymentDate).toLocaleDateString() : '-'}</span></div>
                  <div className="flex mb-1"><span className="w-32 font-semibold">Class</span>: <span className="ml-2">{selectedRecordForView.class} - {selectedRecordForView.section}</span></div>
                </div>
              </div> */}
              {/* Fee Table */}
              <div className="mt-2 mb-2">
                <table className="w-full border border-black text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black px-2 py-1">Fee Description</th>
                      <th className="border border-black px-2 py-1">Previous Due</th>
                      <th className="border border-black px-2 py-1">Previous Adv</th>
                      <th className="border border-black px-2 py-1">Fees</th>
                      <th className="border border-black px-2 py-1">Discount</th>
                      <th className="border border-black px-2 py-1">To Pay</th>
                      <th className="border border-black px-2 py-1">Fee Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Example: Map over fee categories if available, else show a single row */}
                    {(selectedRecordForView.feeCategories && selectedRecordForView.feeCategories.length > 0 ? selectedRecordForView.feeCategories : ['TUITION FEE']).map(cat => {
                      const originalFeeAmount = selectedRecordForView.feeAmount || 0;
                      const discountAmount = selectedRecordForView.discountValue || 0;
                      const amountToPay = originalFeeAmount - discountAmount;
                      
                      return (
                        <tr key={cat}>
                          <td className="border border-black px-2 py-1">{cat}</td>
                          <td className="border border-black px-2 py-1 text-right">0</td>
                          <td className="border border-black px-2 py-1 text-right">0</td>
                          <td className="border border-black px-2 py-1 text-right">₹{originalFeeAmount.toLocaleString()}</td>
                          <td className="border border-black px-2 py-1 text-right">
                            {discountAmount > 0 ? `-₹${discountAmount.toLocaleString()}` : '0'}
                          </td>
                          <td className="border border-black px-2 py-1 text-right">₹{amountToPay.toLocaleString()}</td>
                          <td className="border border-black px-2 py-1 text-right">₹{(selectedRecordForView.amountPaid || 0).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                    {/* Total row */}
                    <tr className="font-bold">
                      <td className="border border-black px-2 py-1 text-right">Total :</td>
                      <td className="border border-black px-2 py-1 text-right">0</td>
                      <td className="border border-black px-2 py-1 text-right">0</td>
                      <td className="border border-black px-2 py-1 text-right">₹{(selectedRecordForView.feeAmount || 0).toLocaleString()}</td>
                      <td className="border border-black px-2 py-1 text-right">
                        {(selectedRecordForView.discountValue || 0) > 0 ? `-₹${(selectedRecordForView.discountValue || 0).toLocaleString()}` : '0'}
                      </td>
                      <td className="border border-black px-2 py-1 text-right">₹{(selectedRecordForView.amountAfterDiscount || selectedRecordForView.feeAmount || 0).toLocaleString()}</td>
                      <td className="border border-black px-2 py-1 text-right">₹{(selectedRecordForView.amountPaid || 0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* Summary Section */}
              <div className="text-sm mt-2">
                <div className="mb-1">In Words : <span className="font-semibold">{numberToWords(selectedRecordForView.amountPaid)} Only</span></div>
                <div className="flex flex-wrap gap-4">
                  <div>Mode : <span className="font-semibold">{selectedRecordForView.paymentMode}</span></div>
                  <div>Balance : <span className="font-semibold">0</span></div>
                  <div>Advance : <span className="font-semibold">0</span></div>
                  <div>Bank : <span className="font-semibold">-</span></div>
                  <div>Concession : <span className="font-semibold">
                    {selectedRecordForView.discountValue ? selectedRecordForView.discountValue.toLocaleString() : '0'}
                  </span></div>
                  <div>Cheque/CC/DB/DD & Inst. Date : <span className="font-semibold">,</span></div>
                  <div>Remarks : <span className="font-semibold">-</span></div>
                </div>
                <div className="mt-1 text-xs">** Subject to realization of cheque. <span className="ml-2">* Optional</span></div>
              </div>
              <div className="flex justify-end mt-4">
                <span className="font-semibold">(CASHIER)</span>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Print Receipt
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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