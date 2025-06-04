import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { STUDENT_API } from '../../config/api';
import { FaEdit, FaEye, FaTrash, FaSearch, FaDownload, FaFilePdf } from 'react-icons/fa';
import StudentView from '../ManageStudents/StudentView';
import StudentEdit from '../ManageStudents/StudentEdit';

interface StudentDocument {
  id: string;
  name: string;
  type: string;
  url: string;
}

interface Student {
  id: string;
  admissionNo: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  gender: string;
  category: string;
  apaarId: string;
  dateOfBirth: string;
  aadhaarNumber: string;
  fatherName: string;
  motherName: string;
  guardianName: string;
  guardianRelation: string;
  guardianMobile: string;
  presentAddress: string;
  permanentAddress: string;
  sameAsPresentAddress: boolean;
  bloodGroup: string;
  religion: string;
  nationality: string;
  lastSchool: string;
  tcNumber: string;
  tcDate: string;
  admissionDate: string;
  documents: StudentDocument[];
  sessionInfo: {
    currentClass: string;
    currentSection: string;
    rollNumber: string;
    stream: string;
    medium: string;
  };
}

interface StudentTableProps {
  onUpdateStats: (stats: {
    totalStudents: number;
    totalMale: number;
    totalFemale: number;
    activeRegistrations: number;
  }) => void;
}

const AVAILABLE_CLASSES = [
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

const StudentTable: React.FC<StudentTableProps> = ({ onUpdateStats }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Available options for filters
  const categoryOptions = [
    { value: 'General', label: 'General' },
    { value: 'EWS', label: 'Economically Weaker Section (EWS)' },
    { value: 'OBC', label: 'Other Backward Class (OBC)' },
    { value: 'BC', label: 'Backward Class (BC)' },
    { value: 'SC', label: 'Scheduled Caste (SC)' },
    { value: 'ST', label: 'Scheduled Tribe (ST)' }
  ];

  const handleSearch = () => {
    fetchStudents();
  };

  const handleView = async (student: Student) => {
    try {
      // Convert ID to string to match Prisma's expectation
      const response = await fetch(STUDENT_API.GET_BY_ID(student.id.toString()));
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch student details');
      }
      
      const completeStudentData = await response.json();
      if (!completeStudentData.data) {
        throw new Error('No student data received');
      }
      
      setSelectedStudent(completeStudentData.data);
      setViewModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student details');
      // Show error in a more visible way
      alert('Failed to load student details. Please try again.');
    }
  };

  const handleEdit = async (student: Student) => {
    try {
      // Convert ID to string to match Prisma's expectation
      const response = await fetch(STUDENT_API.GET_BY_ID(student.id.toString()));
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch student details');
      }
      
      const completeStudentData = await response.json();
      if (!completeStudentData.data) {
        throw new Error('No student data received');
      }
      
      setSelectedStudent(completeStudentData.data);
      setEditModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student details');
      // Show error in a more visible way
      alert('Failed to load student details. Please try again.');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []); // Only fetch on mount, now using search button for filters

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const url = new URL(STUDENT_API.GET_ALL);
      
      // Add query parameters
      const params = new URLSearchParams();
      if (selectedClass) params.append('class', selectedClass);
      if (selectedSection) params.append('section', selectedSection);
      if (selectedCategory) params.append('category', selectedCategory);
      
      // Add the params to the URL
      url.search = params.toString();

      const response = await fetch(url.toString());
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch students');
      }
      
      const data = await response.json();
      if (!data.data) {
        throw new Error('No data received from server');
      }

      setStudents(data.data);
      
      // Update stats
      onUpdateStats({
        totalStudents: data.data.length,
        totalMale: data.data.filter((s: Student) => s.gender.toLowerCase() === 'male').length,
        totalFemale: data.data.filter((s: Student) => s.gender.toLowerCase() === 'female').length,
        activeRegistrations: data.data.length
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStudents([]); // Clear students on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      const response = await fetch(`${STUDENT_API.DELETE}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete student');
      
      // Refresh the student list
      fetchStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete student');
    }
  };

  const renderTable = () => {
    if (loading) {
      return <div className="text-center p-4 bg-white rounded-lg shadow">Loading...</div>;
    }
    
    if (error) {
      return <div className="text-center p-4 bg-white rounded-lg shadow text-red-500">{error}</div>;
    }

    if (!students.length) {
      return <div className="text-center p-4 bg-white rounded-lg shadow">No students found</div>;
    }

    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Admission No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Class</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Section</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Gender</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{student.admissionNo}</td>
                <td className="px-4 py-3 text-sm">{student.fullName}</td>
                <td className="px-4 py-3 text-sm">{student.sessionInfo.currentClass}</td>
                <td className="px-4 py-3 text-sm">{student.sessionInfo.currentSection}</td>
                <td className="px-4 py-3 text-sm">{student.mobileNumber}</td>
                <td className="px-4 py-3 text-sm">{student.email}</td>
                <td className="px-4 py-3 text-sm">{student.gender}</td>
                <td className="px-4 py-3 text-sm">{student.category}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleView(student)}
                      className="text-blue-500 hover:text-blue-600"
                      title="View"
                    >
                      <FaEye size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(student)}
                      className="text-green-500 hover:text-green-600"
                      title="Edit"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-red-500 hover:text-red-600"
                      title="Delete"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* Filters - Always visible */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Filter Students</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              className="form-select w-full rounded-md border-gray-300"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection(''); // Reset section when class changes
              }}
            >
              <option value="">Select Class</option>
              {AVAILABLE_CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              className="form-select w-full rounded-md border-gray-300"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClass}
            >
              <option value="">Select Section</option>
              {SECTIONS.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="form-select w-full rounded-md border-gray-300"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categoryOptions.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSearch}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <FaSearch className="mr-2" />
            Search
          </button>
        </div>
      </div>

      {/* Add New Student Button - Always visible */}
      <div className="mb-4">
        <Link
          to="/students/StudentRegistrationForm"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center"
        >
          <span className="mr-2">+</span>
          Add New Student
        </Link>
      </div>

      {/* Table with loading/error states */}
      {renderTable()}

      {/* Modals */}
      {selectedStudent && (
        <StudentView
          student={selectedStudent}
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {selectedStudent && (
        <StudentEdit
          student={selectedStudent}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedStudent(null);
          }}
          onStudentUpdated={() => {
            fetchStudents();
            setEditModalOpen(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
};

export default StudentTable; 