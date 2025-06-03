import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  User, 
  Phone, 
  Mail, 
  GraduationCap,
  Filter,
  Eye,
  X,
  Loader,
  BookOpen,
  UserCircle,
  Home,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Student interface based on the existing StudentFormData structure
interface Student {
  id: string;
  admissionNo: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  mobileNumber: string;
  emergencyContact: string;
  currentSession: {
    class: string;
    section: string;
    rollNo: string;
    group?: string;
    stream?: string;
  };
  father: {
    name: string;
    contactNumber: string;
    email: string;
    occupation: string;
  };
  mother: {
    name: string;
    contactNumber: string;
    email: string;
    occupation: string;
  };
  address: {
    houseNo: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  category: string;
  religion: string;
  nationality: string;
  studentImagePath?: string;
}

// API Response interface for student data from backend
interface StudentApiResponse {
  id: string;
  admissionNo?: string;
  admissionNumber?: string;
  fullName?: string;
  email?: string;
  dateOfBirth?: string;
  age?: string;
  gender?: string;
  mobileNumber?: string;
  phone?: string;
  emergencyContact?: string;
  className?: string;
  section?: string;
  rollNumber?: string;
  group?: string;
  stream?: string;
  fatherName?: string;
  motherName?: string;
  category?: string;
  religion?: string;
  nationality?: string;
  studentImagePath?: string;
  image_url?: string;
  sessionInfo?: {
    currentClass?: string;
    currentSection?: string;
    currentRollNo?: string;
    currentGroup?: string;
    currentStream?: string;
  };
  parentInfo?: {
    fatherName?: string;
    fatherContact?: string;
    fatherEmail?: string;
    fatherOccupation?: string;
    motherName?: string;
    motherContact?: string;
    motherEmail?: string;
    motherOccupation?: string;
  };
  address?: {
    houseNo?: string;
    street?: string;
    city?: string;
    state?: string;
    pinCode?: string;
  };
  otherInfo?: {
    address?: string;
  };
}

interface TeacherStudentDirectoryProps {
  className?: string;
}

const AVAILABLE_CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11 (Science)', 'Class 11 (Commerce)', 'Class 11 (Arts)',
  'Class 12 (Science)', 'Class 12 (Commerce)', 'Class 12 (Arts)'
];

const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

const GENDER_OPTIONS = ['All', 'Male', 'Female'];

const TeacherStudentDirectory: React.FC<TeacherStudentDirectoryProps> = ({ className }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedGender, setSelectedGender] = useState('All');
  const [sortField, setSortField] = useState<keyof Student>('fullName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Modal states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Load students data
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get authentication token
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // API call to fetch students - backend handles school isolation automatically
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view students.');
        } else {
          throw new Error(`Failed to fetch students: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch students');
      }

      // Transform the data to match our interface
      const transformedStudents = (data.data || []).map((student: StudentApiResponse) => ({
        id: student.id,
        admissionNo: student.admissionNo || student.admissionNumber || '',
        fullName: student.fullName || '',
        email: student.email || '',
        dateOfBirth: student.dateOfBirth || '',
        age: student.age || '',
        gender: student.gender || '',
        mobileNumber: student.mobileNumber || student.phone || '',
        emergencyContact: student.emergencyContact || '',
        currentSession: {
          class: student.sessionInfo?.currentClass || student.className || '',
          section: student.sessionInfo?.currentSection || student.section || '',
          rollNo: student.sessionInfo?.currentRollNo || student.rollNumber || '',
          group: student.sessionInfo?.currentGroup || student.group,
          stream: student.sessionInfo?.currentStream || student.stream
        },
        father: {
          name: student.parentInfo?.fatherName || student.fatherName || '',
          contactNumber: student.parentInfo?.fatherContact || '',
          email: student.parentInfo?.fatherEmail || '',
          occupation: student.parentInfo?.fatherOccupation || ''
        },
        mother: {
          name: student.parentInfo?.motherName || student.motherName || '',
          contactNumber: student.parentInfo?.motherContact || '',
          email: student.parentInfo?.motherEmail || '',
          occupation: student.parentInfo?.motherOccupation || ''
        },
        address: {
          houseNo: student.address?.houseNo || student.otherInfo?.address || '',
          street: student.address?.street || '',
          city: student.address?.city || '',
          state: student.address?.state || '',
          pinCode: student.address?.pinCode || ''
        },
        category: student.category || '',
        religion: student.religion || '',
        nationality: student.nationality || 'Indian',
        studentImagePath: student.studentImagePath || student.image_url
      }));

      setStudents(transformedStudents);
    } catch (err) {
      console.error('Error loading students:', err);
      setError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting
  const handleSort = (field: keyof Student) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort students
  const filteredAndSortedStudents = React.useMemo(() => {
    const filtered = students.filter(student => {
      const matchesSearch = [
        student.fullName,
        student.admissionNo,
        student.currentSession.class,
        student.currentSession.section,
        student.currentSession.rollNo,
        student.mobileNumber,
        student.email,
        student.father.name,
        student.mother.name
      ].some(field => 
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesClass = !selectedClass || student.currentSession.class === selectedClass;
      const matchesSection = !selectedSection || student.currentSession.section === selectedSection;
      const matchesGender = selectedGender === 'All' || student.gender === selectedGender;

      return matchesSearch && matchesClass && matchesSection && matchesGender;
    });

    // Sort students
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortField] as string | number;
      let bValue: string | number = b[sortField] as string | number;

      // Handle nested properties
      if (sortField === 'currentSession') {
        aValue = `${a.currentSession.class} ${a.currentSession.section}`;
        bValue = `${b.currentSession.class} ${b.currentSession.section}`;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [students, searchTerm, selectedClass, selectedSection, selectedGender, sortField, sortDirection]);

  // Handle student view
  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedClass('');
    setSelectedSection('');
    setSelectedGender('All');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading student directory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <motion.div 
            className="bg-white rounded-xl shadow-md p-6 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Students</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadStudents}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          className="bg-white rounded-xl shadow-md p-6 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Directory</h1>
                <p className="text-gray-600">View and search all students in your school</p>
              </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg px-4 py-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                <div className="text-sm text-blue-800">Total Students</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg px-4 py-3 text-center">
                <div className="text-2xl font-bold text-emerald-600">{filteredAndSortedStudents.length}</div>
                <div className="text-sm text-emerald-800">Filtered Results</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg px-4 py-3 text-center col-span-2 lg:col-span-1">
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(students.map(s => s.currentSession.class)).size}
                </div>
                <div className="text-sm text-orange-800">Active Classes</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="bg-white rounded-xl shadow-md p-6 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div className="relative flex-1 max-w-md mb-4 lg:mb-0">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-3 transition-colors duration-200"
                placeholder="Search by name, admission no, class, contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors duration-200 ${
                  isFiltersOpen 
                    ? 'bg-emerald-600 text-white border-emerald-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
              
              {(selectedClass || selectedSection || selectedGender !== 'All') && (
                <button
                  onClick={resetFilters}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-200 pt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        if (!e.target.value) setSelectedSection('');
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">All Classes</option>
                      {AVAILABLE_CLASSES.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      disabled={!selectedClass}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
                    >
                      <option value="">All Sections</option>
                      {SECTIONS.map(section => (
                        <option key={section} value={section}>Section {section}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={selectedGender}
                      onChange={(e) => setSelectedGender(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {GENDER_OPTIONS.map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Students Table */}
        <motion.div 
          className="bg-white rounded-xl shadow-md overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('admissionNo')}
                  >
                    <div className="flex items-center">
                      Admission No
                      {sortField === 'admissionNo' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('fullName')}
                  >
                    <div className="flex items-center">
                      Student Name
                      {sortField === 'fullName' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class & Section
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent Info
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No students found</p>
                      <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.admissionNo}</div>
                        <div className="text-sm text-gray-500">Roll: {student.currentSession.rollNo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {student.studentImagePath ? (
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={`${student.studentImagePath}`}
                                alt={student.fullName}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <UserCircle className="h-6 w-6 text-emerald-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                            <div className="text-sm text-gray-500">{student.gender} • Age {student.age}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.currentSession.class}</div>
                        <div className="text-sm text-gray-500">Section {student.currentSession.section}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-gray-400" />
                          {student.mobileNumber}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          {student.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Father: {student.father.name}</div>
                        <div className="text-sm text-gray-500">Mother: {student.mother.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleViewStudent(student)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                          title="View student details"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Student Detail Modal */}
        <AnimatePresence>
          {isViewModalOpen && selectedStudent && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViewModalOpen(false)}
            >
              <motion.div
                className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedStudent.fullName}</h2>
                        <p className="text-emerald-100">Admission No: {selectedStudent.admissionNo}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsViewModalOpen(false)}
                      className="text-white hover:text-emerald-200 transition-colors duration-200"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="h-5 w-5 mr-2 text-emerald-600" />
                        Basic Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Full Name:</span>
                          <span className="font-medium">{selectedStudent.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gender:</span>
                          <span className="font-medium">{selectedStudent.gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age:</span>
                          <span className="font-medium">{selectedStudent.age} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date of Birth:</span>
                          <span className="font-medium">{new Date(selectedStudent.dateOfBirth).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{selectedStudent.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Religion:</span>
                          <span className="font-medium">{selectedStudent.religion}</span>
                        </div>
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                        Academic Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Class:</span>
                          <span className="font-medium">{selectedStudent.currentSession.class}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Section:</span>
                          <span className="font-medium">{selectedStudent.currentSession.section}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Roll Number:</span>
                          <span className="font-medium">{selectedStudent.currentSession.rollNo}</span>
                        </div>
                        {selectedStudent.currentSession.group && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Group:</span>
                            <span className="font-medium">{selectedStudent.currentSession.group}</span>
                          </div>
                        )}
                        {selectedStudent.currentSession.stream && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Stream:</span>
                            <span className="font-medium">{selectedStudent.currentSession.stream}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Phone className="h-5 w-5 mr-2 text-green-600" />
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mobile:</span>
                          <span className="font-medium">{selectedStudent.mobileNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{selectedStudent.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Emergency:</span>
                          <span className="font-medium">{selectedStudent.emergencyContact}</span>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Home className="h-5 w-5 mr-2 text-purple-600" />
                        Address Information
                      </h3>
                      <div className="space-y-2">
                        <p className="text-gray-900 font-medium">
                          {selectedStudent.address.houseNo}, {selectedStudent.address.street}
                        </p>
                        <p className="text-gray-600">
                          {selectedStudent.address.city}, {selectedStudent.address.state}
                        </p>
                        <p className="text-gray-600">PIN: {selectedStudent.address.pinCode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Parent Information */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-orange-600" />
                      Parent Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Father Information */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-3">Father Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{selectedStudent.father.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Contact:</span>
                            <span className="font-medium">{selectedStudent.father.contactNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium text-sm">{selectedStudent.father.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Occupation:</span>
                            <span className="font-medium">{selectedStudent.father.occupation}</span>
                          </div>
                        </div>
                      </div>

                      {/* Mother Information */}
                      <div className="bg-pink-50 rounded-lg p-4">
                        <h4 className="font-medium text-pink-900 mb-3">Mother Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{selectedStudent.mother.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Contact:</span>
                            <span className="font-medium">{selectedStudent.mother.contactNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium text-sm">{selectedStudent.mother.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Occupation:</span>
                            <span className="font-medium">{selectedStudent.mother.occupation}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeacherStudentDirectory;