import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Trash,
  Eye,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  Calendar,
  Clock,
  Edit,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Update interfaces to match database schema
interface Teacher {
  id: number;
  name: string;
  classes: TeacherClass[];
  subjects: TeacherSubject[];
}

interface TeacherClass {
  id: number;
  className: string;
}

interface TeacherSubject {
  id: number;
  subjectName: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  filePath?: string;
  createdDate: string;
  deadline: string;
  className: string;
  subject: string;
  teacherId: number;
}



const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 1,
    title: 'Algebra Basics',
    description: 'Complete exercises 1-10 from chapter 3',
    createdDate: '2024-03-01T09:00:00',
    deadline: '2024-03-10T23:59:00',
    className: '4',
    subject: 'Mathematics',
    teacherId: 1,
  },
  {
    id: 2,
    title: 'Shakespeare Analysis',
    description: 'Write a 500-word essay on Macbeth',
    filePath: '/assignments/literature.pdf',
    createdDate: '2024-03-05T14:30:00',
    deadline: '2024-03-15T23:59:00',
    className: '3',
    subject: 'English Literature',
    teacherId: 2,
  },
];

const AssignmentManager: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState<Partial<Assignment>>({});
  const [editAssignment, setEditAssignment] = useState<Partial<Assignment>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Add state for teacher data
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 5;
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch teacher data and their assignments on component mount
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setIsLoading(true);
        // Replace with your actual API endpoint
        const teacherResponse = await fetch('/api/teacher/current');
        const teacherData = await teacherResponse.json();
        setTeacher(teacherData);

        const assignmentsResponse = await fetch(`/api/teacher/${teacherData.id}/assignments`);
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Add proper error handling here
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  // Update the class and subject lists for filters and dropdowns
  const teacherClasses = teacher?.classes.map(c => c.className) || [];
  const teacherSubjects = teacher?.subjects.map(s => s.subjectName) || [];

  // Update the filter logic to only show assignments for teacher's classes and subjects
  const filteredAssignments = assignments.filter(
    (assignment) =>
      // Search term filter
      (assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.className.toLowerCase().includes(searchTerm.toLowerCase())) &&
      // Class filter - only show assignments for teacher's classes
      teacherClasses.includes(assignment.className) &&
      // Subject filter - only show assignments for teacher's subjects
      teacherSubjects.includes(assignment.subject) &&
      // Additional filters for specific class/subject selection
      (selectedClassFilter === 'all' || assignment.className === selectedClassFilter) &&
      (selectedSubjectFilter === 'all' || assignment.subject === selectedSubjectFilter)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const currentAssignments = filteredAssignments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Validate form fields
  const validateForm = (assignment: Partial<Assignment>) => {
    const errors: Record<string, string> = {};
    if (!assignment.title) errors.title = 'Title is required';
    if (!assignment.className) errors.className = 'Class is required';
    if (!assignment.subject) errors.subject = 'Subject is required';
    if (!assignment.deadline) errors.deadline = 'Deadline is required';
    if (!assignment.description) errors.description = 'Description is required';
    return errors;
  };

  // Update the create assignment handler
  const handleCreateAssignment = async () => {
    const errors = validateForm(newAssignment);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(newAssignment).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch('/api/assignments', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create assignment');

      const createdAssignment = await response.json();
      setAssignments((prev) => [...prev, createdAssignment]);
      setIsCreateModalOpen(false);
      setNewAssignment({});
      setSelectedFile(null);
      setErrors({});
    } catch (error) {
      console.error('Error creating assignment:', error);
      // Add proper error handling here
    }
  };

  // Update the edit assignment handler
  const handleUpdateAssignment = async () => {
    const errors = validateForm(editAssignment);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    try {
      const response = await fetch(`/api/assignments/${editAssignment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editAssignment),
      });

      if (!response.ok) throw new Error('Failed to update assignment');

      const updatedAssignment = await response.json();
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === updatedAssignment.id ? updatedAssignment : assignment
        )
      );
      setIsEditModalOpen(false);
      setEditAssignment({});
      setErrors({});
    } catch (error) {
      console.error('Error updating assignment:', error);
      // Add proper error handling here
    }
  };

  // Update the delete assignment handler
  const handleDeleteAssignment = async (id: number) => {
    try {
      const response = await fetch(`/api/assignments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete assignment');

      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Error deleting assignment:', error);
      // Add proper error handling here
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen, isCreateModalOpen, isEditModalOpen]);

  // Show loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <BookOpen className="h-6 w-6 mr-2 text-emerald-600" />
          Assignments
        </h1>
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Create Assignment
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search assignments..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        <div className="flex gap-4">
          <select
            className="p-2 border rounded-md focus:ring-2 focus:ring-emerald-600"
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
          >
            <option value="all">All Classes</option>
            {teacherClasses.map((cls) => (
              <option key={cls} value={cls}>
                Class {cls}
              </option>
            ))}
          </select>

          <select
            className="p-2 border rounded-md focus:ring-2 focus:ring-emerald-600"
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
          >
            <option value="all">All Subjects</option>
            {teacherSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments in Card Format */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentAssignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-gray-800">{assignment.title}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setIsModalOpen(true);
                  }}
                  className="text-emerald-600 hover:text-emerald-900"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setEditAssignment(assignment);
                    setIsEditModalOpen(true);
                  }}
                  className="text-yellow-600 hover:text-yellow-900"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  className="text-red-600 hover:text-red-900"
                  onClick={() => handleDeleteAssignment(assignment.id)}
                >
                  <Trash className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Class:</span> {assignment.className}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Subject:</span> {assignment.subject}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Deadline:</span>{' '}
                {new Date(assignment.deadline).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Description:</span> {assignment.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* View Assignment Modal */}
      <AnimatePresence>
        {isModalOpen && selectedAssignment && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={modalRef}
              className="bg-white rounded-lg p-6 w-full max-w-2xl"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{selectedAssignment.title}</h2>
                <button onClick={() => setIsModalOpen(false)}>
                  <XCircle className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created: {new Date(selectedAssignment.createdDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-red-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Deadline: {new Date(selectedAssignment.deadline).toLocaleString()}
                </div>

                {selectedAssignment.filePath ? (
                  <a
                    href={selectedAssignment.filePath}
                    className="text-emerald-600 hover:underline flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Download Assignment File
                  </a>
                ) : (
                  <div className="prose max-w-none">
                    {selectedAssignment.description}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Assignment Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={modalRef}
              className="bg-white rounded-lg p-6 w-full max-w-2xl"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">Create New Assignment</h2>
                <button onClick={() => setIsCreateModalOpen(false)}>
                  <XCircle className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title*</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={newAssignment.title || ''}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  />
                  {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Class*</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newAssignment.className || ''}
                      onChange={(e) => setNewAssignment({ ...newAssignment, className: e.target.value })}
                    >
                      <option value="">Select Class</option>
                      {teacherClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                    {errors.className && <p className="text-sm text-red-500 mt-1">{errors.className}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subject*</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newAssignment.subject || ''}
                      onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                    >
                      <option value="">Select Subject</option>
                      {teacherSubjects.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                    {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Deadline*</label>
                  <input
                    type="datetime-local"
                    className="w-full p-2 border rounded-md"
                    value={newAssignment.deadline || ''}
                    onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                  />
                  {errors.deadline && <p className="text-sm text-red-500 mt-1">{errors.deadline}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description*</label>
                  <textarea
                    className="w-full p-2 border rounded-md h-32"
                    value={newAssignment.description || ''}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  />
                  {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Upload File</label>
                  <label className="flex items-center p-2 border rounded-md cursor-pointer">
                    <Upload className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="text-sm">
                      {selectedFile?.name || 'Choose PDF or Image'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                <button
                  onClick={handleCreateAssignment}
                  className="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700"
                >
                  Create Assignment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Assignment Modal */}
      <AnimatePresence>
        {isEditModalOpen && editAssignment && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={modalRef}
              className="bg-white rounded-lg p-6 w-full max-w-2xl"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">Edit Assignment</h2>
                <button onClick={() => setIsEditModalOpen(false)}>
                  <XCircle className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title*</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={editAssignment.title || ''}
                    onChange={(e) => setEditAssignment({ ...editAssignment, title: e.target.value })}
                  />
                  {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Class*</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={editAssignment.className || ''}
                      onChange={(e) => setEditAssignment({ ...editAssignment, className: e.target.value })}
                    >
                      <option value="">Select Class</option>
                      {teacherClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                    {errors.className && <p className="text-sm text-red-500 mt-1">{errors.className}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subject*</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={editAssignment.subject || ''}
                      onChange={(e) => setEditAssignment({ ...editAssignment, subject: e.target.value })}
                    >
                      <option value="">Select Subject</option>
                      {teacherSubjects.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                    {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Deadline*</label>
                  <input
                    type="datetime-local"
                    className="w-full p-2 border rounded-md"
                    value={editAssignment.deadline || ''}
                    onChange={(e) => setEditAssignment({ ...editAssignment, deadline: e.target.value })}
                  />
                  {errors.deadline && <p className="text-sm text-red-500 mt-1">{errors.deadline}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description*</label>
                  <textarea
                    className="w-full p-2 border rounded-md h-32"
                    value={editAssignment.description || ''}
                    onChange={(e) => setEditAssignment({ ...editAssignment, description: e.target.value })}
                  />
                  {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                </div>

                <button
                  onClick={handleUpdateAssignment}
                  className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignmentManager;