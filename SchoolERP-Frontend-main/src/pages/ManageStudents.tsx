import React, { useState, useEffect } from 'react';
import { useStudentManagement } from '../hooks/useStudentManagement';
import { StudentTable } from '../components/ManageStudents/StudentTable';
import { Pagination } from '../components/ManageStudents/Pagination';
import { Link } from 'react-router-dom';
import StudentView from '../components/ManageStudents/StudentView';
import StudentEdit from '../components/ManageStudents/StudentEdit';
import { StudentFormData } from '../components/StudentForm/StudentFormTypes';

export const ManageStudent: React.FC = () => {
  const {
    students,
    loading,
    error,
    pagination,
    deleteStudent,
    fetchStudents,
    fetchStudentIds
  } = useStudentManagement();

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  
  // State for view and edit modals
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentFormData | null>(null);

  // Log data for debugging
  useEffect(() => {
    console.log('ManageStudent component - Current students:', students);
    console.log('ManageStudent component - Student IDs:', students.map(s => ({ id: s.id, studentId: s.studentId })));
    console.log('ManageStudent component - Pagination:', pagination);
    console.log('ManageStudent component - Loading state:', loading);
    console.log('ManageStudent component - Error state:', error);
    
    // Get a list of all student IDs for debugging
    fetchStudentIds().then(ids => {
      console.log('All available student IDs:', ids);
    });
  }, [students, pagination, loading, error, fetchStudentIds]);

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchStudents(page, pagination.limit);
  };

  // Handle student deletion
  const handleDeleteStudent = async (id: string) => {
    setIsDeleting(true);
    setDeleteError(null);
    setDeleteSuccess(null);
    
    try {
      await deleteStudent(id);
      setDeleteSuccess('Student deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete student');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle view student
  const handleViewStudent = (student: StudentFormData) => {
    // Log the selected student for debugging
    console.log('Viewing student details:', student);
    console.log('Student ID:', student.studentId);
    
    setSelectedStudent(student);
    setViewModalOpen(true);
  };

  // Handle edit student
  const handleEditStudent = (student: StudentFormData) => {
    // Log the selected student for debugging
    console.log('Editing student:', student);
    console.log('Student ID:', student.studentId);
    
    setSelectedStudent(student);
    setEditModalOpen(true);
  };
  
  // Handle student update
  const handleStudentUpdated = () => {
    // Refresh the student list
    fetchStudents(pagination.page, pagination.limit);
  };

  // Function to copy student ID to clipboard
  const copyStudentIdToClipboard = (studentId: string) => {
    navigator.clipboard.writeText(studentId)
      .then(() => {
        alert(`Student ID (${studentId}) copied to clipboard!`);
      })
      .catch(err => {
        console.error('Failed to copy student ID:', err);
      });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
            <p className="mt-2 text-sm text-gray-700">
              View, edit, and manage all student records
            </p>
          </div>
          <Link
            to="/students/add"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add New Student
          </Link>
        </div>

        {/* Debug section for student IDs (only in development) */}
        {import.meta.env.DEV && students.length > 0 && (
          <div className="mb-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800">Student IDs Debug</h3>
            <div className="mt-2 max-h-40 overflow-y-auto">
              <ul className="text-sm space-y-1">
                {students.map((student, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span>{student.fullName}:</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border">{student.studentId || 'N/A'}</span>
                    <button 
                      onClick={() => student.studentId && copyStudentIdToClipboard(student.studentId)}
                      disabled={!student.studentId}
                      className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      Copy
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Students
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {loading ? '...' : pagination.total}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Registrations
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {loading ? '...' : pagination.total}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Fee Defaulters
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {/* Mock data, would be replaced with actual defaulters count */}
                        {loading ? '...' : '0'}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {deleteError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{deleteError}</p>
              </div>
            </div>
          </div>
        )}

        {deleteSuccess && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{deleteSuccess}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <StudentTable
            students={students}
            loading={loading || isDeleting}
            onDelete={handleDeleteStudent}
            onView={handleViewStudent}
            onEdit={handleEditStudent}
          />
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
        
        {/* View Student Modal */}
        <StudentView
          student={selectedStudent}
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
        />
        
        {/* Edit Student Modal */}
        <StudentEdit
          student={selectedStudent}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onStudentUpdated={handleStudentUpdated}
        />
      </div>
    </div>
  );
};

// Also export as default for backward compatibility
export default ManageStudent;
