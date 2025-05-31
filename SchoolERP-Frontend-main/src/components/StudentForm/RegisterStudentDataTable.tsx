import React, { useEffect, useState } from "react";
import { Eye, Edit, Trash2, Search, Download, X } from "lucide-react";

type Student = {
  // Required fields
  registrationId?: string;
  formNo: string;
  fullName: string;
  regnDate: string;
  registerForClass: string;
  
  // Optional fields
  testDate?: string;
  branchName?: string;
  gender?: string;
  dob?: string;
  category?: string;
  religion?: string;
  admissionCategory?: string;
  bloodGroup?: string;
  transactionNo?: string;
  singleParent?: boolean;
  contactNo?: string;
  studentEmail?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  studentAadharCardNo?: string;
  regnCharge?: string;
  examSubject?: string;
  paymentStatus?: string;
  fatherName?: string;
  fatherMobileNo?: string;
  smsAlert?: boolean;
  fatherEmail?: string;
  fatherAadharCardNo?: string;
  isFatherCampusEmployee?: boolean;
  motherName?: string;
  motherMobileNo?: string;
  motherAadharCardNo?: string;
  
  // Document fields
  casteCertificate?: string;
  studentAadharCard?: string;
  fatherAadharCard?: string;
  motherAadharCard?: string;
  previousClassMarksheet?: string;
  transferCertificate?: string;
  studentDateOfBirthCertificate?: string;
  
  // Legacy fields for compatibility
  studentId?: string;
  className?: string;
  mobileNumber?: string;
  email?: string;
  dateOfBirth?: string;
  caste?: string;
};

// Add type for API response - Updated to match backend response
type RegistrationAPIResponse = {
  registrationId?: string;
  formNo: string;
  fullName: string;
  regnDate: string;
  registerForClass: string;
  testDate?: string;
  branchName?: string;
  gender?: string;
  dob?: string;
  category?: string;
  religion?: string;
  admissionCategory?: string;
  bloodGroup?: string;
  transactionNo?: string;
  singleParent?: boolean;
  contactNo?: string;
  studentEmail?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  studentAadharCardNo?: string;
  regnCharge?: string;
  examSubject?: string;
  paymentStatus?: string;
  fatherName?: string;
  fatherMobileNo?: string;
  smsAlert?: boolean;
  fatherEmail?: string;
  fatherAadharCardNo?: string;
  isFatherCampusEmployee?: boolean;
  motherName?: string;
  motherMobileNo?: string;
  motherAadharCardNo?: string;
  casteCertificate?: string;
  studentAadharCard?: string;
  fatherAadharCard?: string;
  motherAadharCard?: string;
  previousClassMarksheet?: string;
  transferCertificate?: string;
  studentDateOfBirthCertificate?: string;
};

const RegisterStudentDataTable: React.FC = () => {
  const [studentData, setStudentData] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Student>('formNo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch("http://localhost:5000/register/student/allStudent", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
          // Optionally redirect to login
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch students");
      }
      
      // Map the API response to our Student type
      const formattedData = data.data.map((student: RegistrationAPIResponse) => ({
        // Map all fields directly from API response
        registrationId: student.registrationId,
        formNo: student.formNo,
        fullName: student.fullName,
        regnDate: student.regnDate,
        registerForClass: student.registerForClass,
        testDate: student.testDate,
        branchName: student.branchName,
        gender: student.gender,
        dob: student.dob,
        category: student.category,
        religion: student.religion,
        admissionCategory: student.admissionCategory,
        bloodGroup: student.bloodGroup,
        transactionNo: student.transactionNo,
        singleParent: student.singleParent,
        contactNo: student.contactNo,
        studentEmail: student.studentEmail,
        address: student.address,
        city: student.city,
        state: student.state,
        pincode: student.pincode,
        studentAadharCardNo: student.studentAadharCardNo,
        regnCharge: student.regnCharge,
        examSubject: student.examSubject,
        paymentStatus: student.paymentStatus || 'Pending',
        fatherName: student.fatherName,
        fatherMobileNo: student.fatherMobileNo,
        smsAlert: student.smsAlert,
        fatherEmail: student.fatherEmail,
        fatherAadharCardNo: student.fatherAadharCardNo,
        isFatherCampusEmployee: student.isFatherCampusEmployee,
        motherName: student.motherName,
        motherMobileNo: student.motherMobileNo,
        motherAadharCardNo: student.motherAadharCardNo,
        casteCertificate: student.casteCertificate,
        studentAadharCard: student.studentAadharCard,
        fatherAadharCard: student.fatherAadharCard,
        motherAadharCard: student.motherAadharCard,
        previousClassMarksheet: student.previousClassMarksheet,
        transferCertificate: student.transferCertificate,
        studentDateOfBirthCertificate: student.studentDateOfBirthCertificate,
        
        // Legacy compatibility fields
        className: student.registerForClass,
        mobileNumber: student.contactNo,
        email: student.studentEmail,
        dateOfBirth: student.dob,
        studentId: student.registrationId,
      }));
      
      setStudentData(formattedData);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err instanceof Error ? err.message : "An error occurred while fetching students");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Student) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      fullName: student.fullName || '',
      formNo: student.formNo || '',
      regnDate: student.regnDate || '',
      registerForClass: student.registerForClass || '',
      testDate: student.testDate || '',
      branchName: student.branchName || '',
      gender: student.gender || '',
      paymentStatus: student.paymentStatus || '',
      contactNo: student.contactNo || '',
      studentEmail: student.studentEmail || '',
      address: student.address || '',
      city: student.city || '',
      state: student.state || '',
      pincode: student.pincode || '',
      fatherName: student.fatherName || '',
      fatherMobileNo: student.fatherMobileNo || '',
      fatherEmail: student.fatherEmail || '',
      motherName: student.motherName || '',
      motherMobileNo: student.motherMobileNo || '',
    });
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEditError(null);

    try {
      const response = await fetch(`http://localhost:5000/register/student/update/${selectedStudent?.formNo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update student');
      }

      setIsEditModalOpen(false);
      fetchStudents();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (studentId: string) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/students/${studentId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete student");
        }

        fetchStudents();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete student");
      }
    }
  };

  // Filter students based on search term and filters
  const filteredStudents = studentData.filter(student => {
    const matchesSearch = 
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.formNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.mobileNumber?.includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = filterClass ? student.className === filterClass : true;
    const matchesStatus = filterStatus ? student.paymentStatus === filterStatus : true;

    return matchesSearch && matchesClass && matchesStatus;
  });

  // Sort filtered students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const fieldA = a[sortField] || '';
    const fieldB = b[sortField] || '';
    
    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const exportToCSV = () => {
    const headers = ['Form No', 'Full Name', 'Gender', 'Class', 'Registration Date', 'Payment Status', 'Contact', 'Email'];
    const csvData = sortedStudents.map(student => [
      student.formNo,
      student.fullName,
      student.gender,
      student.className || '',
      student.regnDate,
      student.paymentStatus,
      student.mobileNumber || '',
      student.email || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'students.csv';
    link.click();
  };

  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Registered Students Report', 20, 20);
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
      
      // Add student records
      let yPosition = 50;
      doc.setFontSize(10);
      
      sortedStudents.forEach((student, index) => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(`${index + 1}. ${student.fullName} (${student.formNo})`, 20, yPosition);
        doc.text(`Class: ${student.className || 'N/A'}`, 30, yPosition + 8);
        doc.text(`Contact: ${student.mobileNumber || 'N/A'}`, 30, yPosition + 16);
        doc.text(`Status: ${student.paymentStatus}`, 30, yPosition + 24);
        doc.text(`Registration Date: ${new Date(student.regnDate).toLocaleDateString()}`, 30, yPosition + 32);
        
        yPosition += 45;
      });
      
      doc.save(`registered_students_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Statistics Section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Students</p>
              <p className="text-2xl font-bold">{studentData.length}</p>
            </div>
            <div className="bg-blue-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Paid Fees</p>
              <p className="text-2xl font-bold">
                {studentData.filter(student => student.paymentStatus === 'Paid').length}
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
              <p className="text-yellow-100 text-sm font-medium">Pending Fees</p>
              <p className="text-2xl font-bold">
                {studentData.filter(student => student.paymentStatus === 'Pending').length}
              </p>
            </div>
            <div className="bg-yellow-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Total Classes</p>
              <p className="text-2xl font-bold">
                {new Set(studentData.map(s => s.className).filter(Boolean)).size}
              </p>
            </div>
            <div className="bg-red-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col md:flex-row md:space-x-3 space-y-3 md:space-y-0 mb-4 md:mb-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, form no, class..."
              className="pl-10 pr-4 py-2 border rounded-md w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-3">
            <select
              className="px-4 py-2 border rounded-md"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {Array.from(new Set(studentData.map(s => s.className).filter(Boolean))).map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <select
              className="px-4 py-2 border rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300 shadow-sm"
            onClick={exportToCSV}
            disabled={sortedStudents.length === 0}
            title="Export to CSV"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </button>
          <button 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300 shadow-sm"
            onClick={exportToPDF}
            disabled={sortedStudents.length === 0}
            title="Export to PDF"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export PDF
          </button>
          <button 
            className="px-4 py-2 border border-gray-300 rounded-md flex items-center hover:bg-gray-50 transition-colors duration-300"
            onClick={() => {
              setSearchTerm('');
              setFilterClass('');
              setFilterStatus('');
              setSortField('formNo');
              setSortDirection('asc');
            }}
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Student Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('formNo')}
              >
                <div className="flex items-center">
                  Form No
                  {sortField === 'formNo' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('fullName')}
              >
                <div className="flex items-center">
                  Student Name
                  {sortField === 'fullName' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('className')}
              >
                <div className="flex items-center">
                  Class
                  {sortField === 'className' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('mobileNumber')}
              >
                <div className="flex items-center">
                  Contact
                  {sortField === 'mobileNumber' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('regnDate')}
              >
                <div className="flex items-center">
                  Registration Date
                  {sortField === 'regnDate' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('paymentStatus')}
              >
                <div className="flex items-center">
                  Payment Status
                  {sortField === 'paymentStatus' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            ) : (
              sortedStudents.map((student) => (
                <tr key={student.formNo} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.formNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.className || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.mobileNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.regnDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      student.paymentStatus === 'Paid' 
                        ? 'bg-green-100 text-green-800'
                        : student.paymentStatus === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleView(student)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Edit Student"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.studentId || student.formNo)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Student"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700">Student Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Basic Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><strong>Form No:</strong> {selectedStudent.formNo}</div>
                <div><strong>Full Name:</strong> {selectedStudent.fullName}</div>
                <div><strong>Registration Date:</strong> {selectedStudent.regnDate ? new Date(selectedStudent.regnDate).toLocaleDateString() : '-'}</div>
                <div><strong>Register For Class:</strong> {selectedStudent.registerForClass || '-'}</div>
                <div><strong>Test Date:</strong> {selectedStudent.testDate ? new Date(selectedStudent.testDate).toLocaleDateString() : '-'}</div>
                <div><strong>Branch Name:</strong> {selectedStudent.branchName || '-'}</div>
                <div><strong>Gender:</strong> {selectedStudent.gender || '-'}</div>
                <div><strong>Date of Birth:</strong> {selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : '-'}</div>
                <div><strong>Category:</strong> {selectedStudent.category || '-'}</div>
                <div><strong>Religion:</strong> {selectedStudent.religion || '-'}</div>
                <div><strong>Blood Group:</strong> {selectedStudent.bloodGroup || '-'}</div>
                <div><strong>Admission Category:</strong> {selectedStudent.admissionCategory || '-'}</div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><strong>Contact Number:</strong> {selectedStudent.contactNo || '-'}</div>
                <div><strong>Student Email:</strong> {selectedStudent.studentEmail || '-'}</div>
                <div><strong>Address:</strong> {selectedStudent.address || '-'}</div>
                <div><strong>City:</strong> {selectedStudent.city || '-'}</div>
                <div><strong>State:</strong> {selectedStudent.state || '-'}</div>
                <div><strong>Pincode:</strong> {selectedStudent.pincode || '-'}</div>
                <div><strong>Aadhaar Number:</strong> {selectedStudent.studentAadharCardNo || '-'}</div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Parent Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Father's Details</h4>
                  <div className="space-y-2">
                    <div><strong>Name:</strong> {selectedStudent.fatherName || '-'}</div>
                    <div><strong>Mobile:</strong> {selectedStudent.fatherMobileNo || '-'}</div>
                    <div><strong>Email:</strong> {selectedStudent.fatherEmail || '-'}</div>
                    <div><strong>Aadhaar:</strong> {selectedStudent.fatherAadharCardNo || '-'}</div>
                    <div><strong>Campus Employee:</strong> {selectedStudent.isFatherCampusEmployee ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Mother's Details</h4>
                  <div className="space-y-2">
                    <div><strong>Name:</strong> {selectedStudent.motherName || '-'}</div>
                    <div><strong>Mobile:</strong> {selectedStudent.motherMobileNo || '-'}</div>
                    <div><strong>Aadhaar:</strong> {selectedStudent.motherAadharCardNo || '-'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><strong>Transaction No:</strong> {selectedStudent.transactionNo || '-'}</div>
                <div><strong>Registration Charge:</strong> {selectedStudent.regnCharge || '-'}</div>
                <div><strong>Exam Subject:</strong> {selectedStudent.examSubject || '-'}</div>
                <div><strong>Payment Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    selectedStudent.paymentStatus === 'Paid' 
                      ? 'bg-green-100 text-green-800'
                      : selectedStudent.paymentStatus === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedStudent.paymentStatus}
                  </span>
                </div>
                <div><strong>Single Parent:</strong> {selectedStudent.singleParent ? 'Yes' : 'No'}</div>
                <div><strong>SMS Alert:</strong> {selectedStudent.smsAlert ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>

            {/* Documents */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Caste Certificate:</strong> {selectedStudent.casteCertificate ? 'Uploaded' : 'Not uploaded'}</div>
                <div><strong>Student Aadhaar:</strong> {selectedStudent.studentAadharCard ? 'Uploaded' : 'Not uploaded'}</div>
                <div><strong>Father Aadhaar:</strong> {selectedStudent.fatherAadharCard ? 'Uploaded' : 'Not uploaded'}</div>
                <div><strong>Mother Aadhaar:</strong> {selectedStudent.motherAadharCard ? 'Uploaded' : 'Not uploaded'}</div>
                <div><strong>Previous Marksheet:</strong> {selectedStudent.previousClassMarksheet ? 'Uploaded' : 'Not uploaded'}</div>
                <div><strong>Transfer Certificate:</strong> {selectedStudent.transferCertificate ? 'Uploaded' : 'Not uploaded'}</div>
                <div><strong>Birth Certificate:</strong> {selectedStudent.studentDateOfBirthCertificate ? 'Uploaded' : 'Not uploaded'}</div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Simplified for now */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-700">Edit Student Registration</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            {editError && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {editError}
              </div>
            )}
            
            <form onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Form Number *</label>
                  <input
                    type="text"
                    name="formNo"
                    value={formData.formNo || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date *</label>
                  <input
                    type="date"
                    name="regnDate"
                    value={formData.regnDate ? new Date(formData.regnDate).toISOString().split('T')[0] : ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Register For Class *</label>
                  <select
                    name="registerForClass"
                    value={formData.registerForClass || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select class</option>
                    {['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11 (Science)', 'Class 11 (Commerce)', 'Class 11 (Arts)', 'Class 12 (Science)', 'Class 12 (Commerce)', 'Class 12 (Arts)'].map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNo"
                    value={formData.contactNo || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterStudentDataTable; 