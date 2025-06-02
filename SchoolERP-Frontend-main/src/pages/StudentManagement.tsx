import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Download, Edit, Trash2, X, Eye, FileText, Users, GraduationCap } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiDelete, ApiError, apiGetWithMeta } from '../utils/authApi';
import { debugAuth, clearAuthData, simulateLogin, testAuthentication, attemptSchoolLogin } from '../utils/authDebug';

// Define Student type
interface Student {
  id: string;
  fullName: string;
  admissionNo: string;
  gender: string;
  className?: string;
  section?: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  category?: string;
  religion?: string;
  guardianName?: string;
  guardianContact?: string;
  emergencyContact?: string;
  createdAt?: string;
  updatedAt?: string;
  sessionInfo?: {
    currentClass?: string;
    currentSection?: string;
    currentRollNo?: string;
    currentStream?: string;
    currentHouse?: string;
    currentFeeGroup?: string;
  };
  mobileNumber?: string;
  aadhaarNumber?: string;
  apaarId?: string;
  houseNo?: string;
  street?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  permanentHouseNo?: string;
  permanentStreet?: string;
  permanentCity?: string;
  permanentState?: string;
  permanentPinCode?: string;
}

// Predefined classes and sections
const CLASSES = [
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11 (Science)',
  'Class 11 (Commerce)',
  'Class 11 (Arts)',
  'Class 12 (Science)',
  'Class 12 (Commerce)',
  'Class 12 (Arts)'
];

const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

// StudentManagement Component
const StudentManagement: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  // const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>([]);
  // const [drivers, setDrivers] = useState<Driver[]>([]);

  // Show toast notification
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    if (type === 'info') {
      toast(message, {
        duration: 3000,
        style: {
          background: '#6B7280',
          color: '#ffffff',
          padding: '16px',
          borderRadius: '8px',
        },
        iconTheme: {
          primary: '#ffffff',
          secondary: '#6B7280',
        },
      });
    } else {
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
    }
  };

  // Fetch transport routes and drivers
  // const fetchTransportData = useCallback(async () => {
  //   try {
  //     const [routesResponse, driversResponse] = await Promise.all([
  //       axios.get(`${API_URL}/transport/routes`),
  //       axios.get(`${API_URL}/transport/drivers`)
  //     ]);

  //     if (routesResponse.data?.success) {
  //       // setTransportRoutes(routesResponse.data.data || []);
  //     }

  //     if (driversResponse.data?.success) {
  //       // setDrivers(driversResponse.data.data || []);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching transport data:', error);
  //   }
  // }, []);

  // Fetch students from API
  const fetchStudents = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
        // Remove schoolId as it will be handled by backend auth middleware
      });
      
      if (filterClass) params.append('class', filterClass);
      if (filterSection) params.append('section', filterSection);
      if (searchTerm) params.append('search', searchTerm);
      
      console.log('Fetching students with params:', params.toString());
      console.log('Current auth token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const response = await apiGetWithMeta<Student[]>(`/students?${params.toString()}`);
      
      console.log('API Response received:', response);
      
      // The response should have the structure: { success: true, data: Student[], pagination: {...} }
      if (response && response.success && response.data) {
        console.log(`Successfully fetched ${response.data.length} students`);
        setStudents(response.data);
        setTotalStudents(response.pagination?.total || 0);
        setTotalPages(response.pagination?.totalPages || 0);
        setCurrentPage(response.pagination?.page || 1);
      } else {
        console.warn('Unexpected response structure:', response);
        setError('Unexpected response format from server');
      }
    } catch (err: unknown) {
      console.error('Error fetching students:', err);
      const apiErr = err as ApiError;
      
      if (apiErr.status === 401) {
        setError('Authentication failed. Please log in again.');
        console.log('🔒 Authentication failed - token may be expired or invalid');
      } else if (apiErr.status === 403) {
        setError('Access denied. You do not have permission to view students.');
        console.log('🚫 Access denied - insufficient permissions');
      } else if (apiErr.status === 404) {
        setError('No students found.');
        console.log('📭 No students found');
      } else {
        setError(`Failed to fetch students: ${apiErr.message || 'Unknown error'}`);
        console.log('❌ API Error:', apiErr);
      }
    } finally {
      setLoading(false);
    }
  }, [filterClass, filterSection, searchTerm]);

  // Initial fetch
  useEffect(() => {
    // Debug authentication on component mount
    console.log('StudentManagement mounted - checking auth status');
    debugAuth();
    
    fetchStudents(1);
    // fetchTransportData();
  }, [fetchStudents]);

  // Handle view student
  const handleViewStudent = async (student: Student) => {
    try {
      const data = await apiGet<Student>(`/students/${student.id}`);
      if (data) {
        setSelectedStudent(data);
        setIsViewModalOpen(true);
      } else {
        showToast('error', 'Failed to fetch student details');
      }
    } catch (err: unknown) {
      console.error('Error fetching student details:', err);
      const apiErr = err as ApiError;
      showToast('error', 'Failed to fetch student details: ' + (apiErr.message || 'Unknown error'));
    }
  };

  // Handle edit student - route to edit form instead of modal
  const handleEditStudent = (student: Student) => {
    navigate(`/student-edit/${student.id}`);
  };

  // Handle delete student
  const handleDeleteStudent = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete student
  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      await apiDelete(`/students/${studentToDelete.id}`);
      
      setStudents(students.filter(s => s.id !== studentToDelete.id));
      showToast('success', 'Student deleted successfully');
      fetchStudents(currentPage); // Refresh the list
    } catch (err: unknown) {
      console.error('Error deleting student:', err);
      const apiErr = err as ApiError;
      showToast('error', 'Failed to delete student: ' + (apiErr.message || 'Unknown error'));
    } finally {
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Full Name', 'Admission No', 'Class', 'Section', 'Gender', 'Father Name', 'Contact', 'Email'].join(','),
      ...students.map(student => [
        student.fullName,
        student.admissionNo,
        student.sessionInfo?.currentClass || student.className || '',
        student.sessionInfo?.currentSection || student.section || '',
        student.gender,
        student.fatherName || '',
        student.contactNumber || '',
        student.email || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('success', 'CSV export completed!');
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235);
      doc.text('Student Management Report', 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.text('Generated on: ' + new Date().toLocaleDateString(), 20, 30);
      
      // Add line separator
      doc.setDrawColor(229, 231, 235);
      doc.line(20, 35, 190, 35);
      
      // Table headers
      let yPosition = 45;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Name', 20, yPosition);
      doc.text('Admission No', 70, yPosition);
      doc.text('Class', 120, yPosition);
      doc.text('Gender', 150, yPosition);
      
      yPosition += 5;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;
      
      // Student data
      students.forEach((student) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(10);
        doc.text(student.fullName || 'N/A', 20, yPosition);
        doc.text(student.admissionNo || 'N/A', 70, yPosition);
        doc.text(student.sessionInfo?.currentClass || student.className || 'N/A', 120, yPosition);
        doc.text(student.gender || 'N/A', 150, yPosition);
        yPosition += 8;
      });
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Total Students: ${students.length}`, 20, 280);
      
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

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = filterClass 
      ? (student.sessionInfo?.currentClass || student.className) === filterClass 
      : true;
    
    const matchesSection = filterSection 
      ? (student.sessionInfo?.currentSection || student.section) === filterSection 
      : true;
    
    const matchesGender = filterGender ? student.gender === filterGender : true;
    
    return matchesSearch && matchesClass && matchesSection && matchesGender;
  });

  // Get unique classes for filter
  const uniqueClasses = Array.from(new Set(students.map(s => s.sessionInfo?.currentClass || s.className).filter(Boolean)));

  // Calculate statistics
  const totalMaleStudents = students.filter(s => s.gender?.toLowerCase() === 'male').length;
  const totalFemaleStudents = students.filter(s => s.gender?.toLowerCase() === 'female').length;
  const totalClasses = uniqueClasses.length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Management</h1>
        <p className="text-gray-600">Manage and organize student records</p>
      </div>

      {/* Statistics Section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Students</p>
              <p className="text-2xl font-bold">{totalStudents}</p>
          </div>
            <div className="bg-blue-400 p-3 rounded-full">
              <Users className="h-6 w-6" />
        </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Male Students</p>
              <p className="text-2xl font-bold">{totalMaleStudents}</p>
          </div>
            <div className="bg-green-400 p-3 rounded-full">
              <Users className="h-6 w-6" />
        </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">Female Students</p>
              <p className="text-2xl font-bold">{totalFemaleStudents}</p>
      </div>
            <div className="bg-pink-400 p-3 rounded-full">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Classes</p>
              <p className="text-2xl font-bold">{totalClasses}</p>
            </div>
            <div className="bg-purple-400 p-3 rounded-full">
              <GraduationCap className="h-6 w-6" />
          </div>
        </div>
            </div>
          </div>

      {/* Action Buttons */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300 shadow-sm"
              title="Export to CSV"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={exportToPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300 shadow-sm"
              title="Export to PDF"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </button>
            {/* Debug buttons for authentication troubleshooting */}
            <button
              onClick={() => {
                debugAuth();
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm"
              title="Debug Authentication Status"
            >
              Debug Auth
            </button>
            <button
              onClick={async () => {
                const isWorking = await testAuthentication();
                showToast(isWorking ? 'success' : 'error', 
                         isWorking ? 'Authentication is working' : 'Authentication failed - check console');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
              title="Test Current Authentication"
            >
              Test Auth
            </button>
            <button
              onClick={() => {
                clearAuthData();
                showToast('success', 'Authentication data cleared');
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-md text-sm"
              title="Clear Auth Data"
            >
              Clear Auth
            </button>
            <button
              onClick={async () => {
                const token = await attemptSchoolLogin();
                if (token) {
                  showToast('success', 'School login successful - try API calls now');
                  window.location.reload();
                } else {
                  showToast('error', 'School login failed - check console');
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm"
              title="Attempt School Login"
            >
              School Login
            </button>
            <button
              onClick={() => {
                simulateLogin();
                showToast('success', 'Mock login completed - try API calls now');
                window.location.reload();
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm"
              title="Simulate Login for Testing"
            >
              Mock Login
            </button>
            <button
              onClick={() => fetchStudents(1)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm"
              title="Retry Fetching Students"
            >
              Retry Fetch
            </button>
          </div>
          <button
            onClick={() => navigate('/students/StudentRegistrationForm')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Student
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row md:space-x-3 space-y-3 md:space-y-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
                placeholder="Search by name or admission no..."
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
                {CLASSES.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <select
              className="px-4 py-2 border rounded-md"
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
              >
                <option value="">All Sections</option>
                {SECTIONS.map((section) => (
                  <option key={section} value={section}>{section}</option>
              ))}
            </select>
              <select
                className="px-4 py-2 border rounded-md"
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
          </div>
        </div>
        <div className="flex space-x-2">
            <button
            onClick={() => {
              setSearchTerm('');
              setFilterClass('');
                setFilterSection('');
                setFilterGender('');
            }}
              className="px-4 py-2 border border-gray-300 rounded-md flex items-center hover:bg-gray-50 transition-colors duration-300"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Loading/Error States */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : (
        <>
          {/* Students Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class & Section
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Father Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.admissionNo}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.sessionInfo?.currentClass || student.className || 'N/A'} - {student.sessionInfo?.currentSection || student.section || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.fatherName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.contactNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleViewStudent(student)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                            onClick={() => handleEditStudent(student)}
                              className="text-yellow-600 hover:text-yellow-800 p-1"
                              title="Edit Student"
                          >
                            <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Delete Student"
                          >
                            <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchStudents(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => fetchStudents(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
        </div>
      </div>
          )}
        </>
      )}

      {/* View Student Modal */}
      {isViewModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Student Profile</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
              </div>
            
            {/* Student Header Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                  {selectedStudent.fullName?.charAt(0) || 'S'}
                  </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedStudent.fullName}</h3>
                  <p className="text-blue-100">Admission No: {selectedStudent.admissionNo}</p>
                  <p className="text-blue-100">
                    Class: {selectedStudent.sessionInfo?.currentClass || selectedStudent.className || 'N/A'} - 
                    Section: {selectedStudent.sessionInfo?.currentSection || selectedStudent.section || 'N/A'}
                  </p>
                  </div>
                  </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">
                  <Users className="inline h-5 w-5 mr-2" />
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Full Name:</span>
                    <span className="text-gray-900">{selectedStudent.fullName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Admission No:</span>
                    <span className="text-gray-900">{selectedStudent.admissionNo || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Gender:</span>
                    <span className="text-gray-900">{selectedStudent.gender || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Date of Birth:</span>
                    <span className="text-gray-900">
                      {selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() : 'N/A'}
                        </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Blood Group:</span>
                    <span className="text-gray-900">{selectedStudent.bloodGroup || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Religion:</span>
                    <span className="text-gray-900">{selectedStudent.religion || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Category:</span>
                    <span className="text-gray-900">{selectedStudent.category || 'N/A'}</span>
                  </div>
                  </div>
              </div>

              {/* Academic Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-green-600 border-b pb-2">
                  <GraduationCap className="inline h-5 w-5 mr-2" />
                  Academic Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Current Class:</span>
                    <span className="text-gray-900">
                      {selectedStudent.sessionInfo?.currentClass || selectedStudent.className || 'N/A'}
                        </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Current Section:</span>
                    <span className="text-gray-900">
                      {selectedStudent.sessionInfo?.currentSection || selectedStudent.section || 'N/A'}
                    </span>
              </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Roll Number:</span>
                    <span className="text-gray-900">{selectedStudent.sessionInfo?.currentRollNo || 'N/A'}</span>
            </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Stream:</span>
                    <span className="text-gray-900">{selectedStudent.sessionInfo?.currentStream || 'N/A'}</span>
        </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">House:</span>
                    <span className="text-gray-900">{selectedStudent.sessionInfo?.currentHouse || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Fee Group:</span>
                    <span className="text-gray-900">{selectedStudent.sessionInfo?.currentFeeGroup || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Admission Date:</span>
                    <span className="text-gray-900">
                      {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-purple-600 border-b pb-2">
                  <FileText className="inline h-5 w-5 mr-2" />
                  Contact Information
              </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Mobile Number:</span>
                    <span className="text-gray-900">{selectedStudent.mobileNumber || 'N/A'}</span>
            </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Email:</span>
                    <span className="text-gray-900">{selectedStudent.email || 'N/A'}</span>
              </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Emergency Contact:</span>
                    <span className="text-gray-900">{selectedStudent.emergencyContact || 'N/A'}</span>
              </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Aadhaar Number:</span>
                    <span className="text-gray-900">{selectedStudent.aadhaarNumber || 'N/A'}</span>
              </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">APAAR ID:</span>
                    <span className="text-gray-900">{selectedStudent.apaarId || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Address Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-indigo-600 border-b pb-2">
                  <FileText className="inline h-5 w-5 mr-2" />
                  Address Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Present Address:</span>
                    <span className="text-gray-900 text-right max-w-xs">
                      {[selectedStudent.houseNo, selectedStudent.street, selectedStudent.city, selectedStudent.state, selectedStudent.pinCode]
                        .filter(Boolean).join(', ') || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Permanent Address:</span>
                    <span className="text-gray-900 text-right max-w-xs">
                      {[selectedStudent.permanentHouseNo, selectedStudent.permanentStreet, selectedStudent.permanentCity, selectedStudent.permanentState, selectedStudent.permanentPinCode]
                        .filter(Boolean).join(', ') || 'Same as Present Address'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Family Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-orange-600 border-b pb-2">
                  <Users className="inline h-5 w-5 mr-2" />
                  Family Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Father's Name:</span>
                    <span className="text-gray-900">{selectedStudent.fatherName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Mother's Name:</span>
                    <span className="text-gray-900">{selectedStudent.motherName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Guardian Name:</span>
                    <span className="text-gray-900">{selectedStudent.guardianName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Guardian Contact:</span>
                    <span className="text-gray-900">{selectedStudent.guardianContact || 'N/A'}</span>
                  </div>
                </div>
              </div>
              </div>
              
            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                  onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditStudent(selectedStudent);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Student
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Student</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {studentToDelete.fullName}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteStudent}
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

export default StudentManagement;