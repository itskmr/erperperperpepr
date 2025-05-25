import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { User2, UserPlus } from 'lucide-react';
import { Teacher } from './types';
import TeacherTable from './TeacherTable';
import SearchFilters from './SearchFilter';
import Pagination from './Pegination';
import TeacherProfileModal from './TeacherProfileModal';
import TeacherFormModal from './TeacherFormModal';
import axios, { AxiosError } from 'axios';

// Get current date from localStorage or create new
const getCurrentDate = () => {
  const storedDate = localStorage.getItem('currentDate');
  if (storedDate) {
    return storedDate;
  }
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];
  localStorage.setItem('currentDate', dateString);
  return dateString;
};

// Update API URL to ensure it's correctly pointing to your backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TeacherDirectory: React.FC = () => {
  // State management
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [classFilter, setClassFilter] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({
    fullName: '',
    email: '',
    phone: '',
    designation: 'Teacher',
    subjects: [],
    sections: [],
    classes: '',
    joinDate: getCurrentDate(),
    address: '',
    education: '',
    experience: '',
    profileImage: 'https://randomuser.me/api/portraits/men/0.jpg',
    isClassIncharge: false,
    inchargeClass: null,
    inchargeSection: null,
    status: 'active'
  });
  const [editTeacher, setEditTeacher] = useState<Partial<Teacher>>({
    subjects: [],
    sections: [],
  });
  const itemsPerPage = 5;
  const modalRef = useRef<HTMLDivElement>(null);

  // Configure axios defaults for better error handling
  useEffect(() => {
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    
    // Add interceptor to log request data for debugging
    axios.interceptors.request.use(request => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Request:', request.method, request.url, request.data);
      }
      return request;
    });
  }, []);

  // Fetch teachers from API
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const storedSchoolId = localStorage.getItem('schoolId') || '1';
      // Update API endpoint to match your backend route
      const response = await axios.get(`${API_URL}/teachers/school/${storedSchoolId}`);
      
      if (response.data && response.data.success) {
        setTeachers(response.data.data || []);
        setError(null);
      } else {
        setError('Failed to fetch teachers');
      }
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
      setError(`Failed to fetch teachers: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch teachers on component mount
  useEffect(() => {
    // Only fetch if search and filter are not active
    if (!searchTerm && classFilter === 'all') {
      fetchTeachers();
    }
  }, []);

  // Backend search and filter
  const searchTeachers = async () => {
    try {
      setLoading(true);
      const storedSchoolId = localStorage.getItem('schoolId') || '1';
      let url = `${API_URL}/teachers/school/${storedSchoolId}/search?`;
      
      if (searchTerm) {
        url += `searchTerm=${encodeURIComponent(searchTerm)}&`;
      }
      
      if (classFilter && classFilter !== 'all') {
        url += `classFilter=${encodeURIComponent(classFilter)}&`;
      }
      
      const response = await axios.get(url);
      
      if (response.data && response.data.success) {
        setTeachers(response.data.data || []);
        setError(null);
      } else {
        setError('Failed to search teachers');
      }
    } catch (error: any) {
      console.error('Error searching teachers:', error);
      setError(`Failed to search teachers: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search to prevent too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm || classFilter !== 'all') {
        searchTeachers();
      } else {
        fetchTeachers();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, classFilter]);

  // Filtered teachers based on search and class filter
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects.some((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClass =
      classFilter === 'all' || teacher.sections.some((section) => section.class === classFilter);

    return matchesSearch && matchesClass;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTeachers = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);

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

  // Handle viewing a teacher's profile
  const handleViewProfile = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsProfileOpen(true);
  };

  // Handle adding a new teacher
  const handleAddTeacher = () => {
    setNewTeacher({
      fullName: '',
      email: '',
      phone: '',
      designation: 'Teacher',
      subjects: [],
      sections: [],
      classes: '',
      joinDate: getCurrentDate(),
      address: '',
      education: '',
      experience: '',
      profileImage: 'https://randomuser.me/api/portraits/men/0.jpg',
      isClassIncharge: false,
      inchargeClass: null,
      inchargeSection: null,
      status: 'active'
    });
    setIsAddModalOpen(true);
  };

  // Handle editing a teacher
  const handleEditTeacher = (teacher: Teacher) => {
    setEditTeacher(teacher);
    setIsEditModalOpen(true);
  };

  // Handle deleting a teacher
  const handleDeleteTeacher = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        const response = await axios.delete(`${API_URL}/teachers/${id}`);
        
        if (response.data.success) {
          setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
          showToast('success', 'Teacher deleted successfully!');
        } else {
          showToast('error', response.data.message || 'Failed to delete teacher. Please try again.');
        }
      } catch (error: any) {
        console.error('Error deleting teacher:', error);
        showToast('error', error.response?.data?.message || 'Failed to delete teacher. Please try again.');
      }
    }
  };

  // Validate incharge class
  const validateInchargeClass = (value: string): string => {
    if (!value || value.trim() === '') {
      return 'Class is required for class incharge';
    }
    // Optionally, check if value is in AVAILABLE_CLASSES
    // if (!AVAILABLE_CLASSES.includes(value)) return 'Invalid class selected';
    return '';
  };

  // Handle input changes for new teacher
  const handleInputChange = (field: keyof Teacher, value: string | string[] | boolean | null) => {
    setNewTeacher((prev) => ({ ...prev, [field]: value }));
  };

  // Handle input changes for editing teacher
  const handleEditInputChange = (field: keyof Teacher, value: string | string[] | boolean | null) => {
    setEditTeacher((prev) => ({ ...prev, [field]: value }));
  };

  // Check if incharge position is already taken
  const checkInchargePosition = (inchargeClass?: string, inchargeSection?: string, teacherId?: number): boolean => {
    if (!inchargeClass || !inchargeSection) return false;
    
    const existingIncharge = teachers.find(
      (t) =>
        t.id !== teacherId &&
        t.isClassIncharge &&
        t.inchargeClass === inchargeClass &&
        t.inchargeSection === inchargeSection
    );

    if (existingIncharge) {
      showToast(
        'error',
        `${existingIncharge.fullName} is already incharge of Class ${inchargeClass} Section ${inchargeSection}`
      );
      return true;
    }
    return false;
  };

  // Handle form submission for adding a teacher
  const handleSubmit = async () => {
    if (newTeacher.isClassIncharge) {
      if (!newTeacher.inchargeClass || !newTeacher.inchargeSection) {
        showToast('error', 'Please select both incharge class and section');
        return;
      }

      if (checkInchargePosition(newTeacher.inchargeClass, newTeacher.inchargeSection)) {
        return;
      }
    }

    try {
      // Get the school ID from localStorage
      const storedSchoolId = localStorage.getItem('schoolId');
      console.log('Stored School ID:', storedSchoolId);
      
      if (!storedSchoolId) {
        console.error('School ID not found in localStorage');
        showToast('error', 'School ID not found. Please try logging in again.');
        return;
      }

      let schoolId = parseInt(storedSchoolId);
      console.log('Parsed School ID:', schoolId);

      // Try to get school, if not found create a default school
      try {
        console.log('Attempting to verify school with ID:', schoolId);
        const schoolResponse = await axios.get(`${API_URL}/schools/${schoolId}`);
        console.log('School verification response:', schoolResponse.data);
        
        if (!schoolResponse.data.success) {
          console.log('School not found, creating default school');
          // Create default school if not found
          const createSchoolResponse = await axios.post(`${API_URL}/schools`, {
            name: "Default School",
            address: "Default Address",
            contactNumber: "1234567890",
            email: "default@school.com",
            principalName: "Default Principal"
          });
          
          console.log('Default school creation response:', createSchoolResponse.data);
          
          if (createSchoolResponse.data.success) {
            schoolId = createSchoolResponse.data.data.id;
            localStorage.setItem('schoolId', schoolId.toString());
            console.log('New school ID set:', schoolId);
          } else {
            console.error('Failed to create school:', createSchoolResponse.data);
            showToast('error', 'Failed to create school. Please try again.');
            return;
          }
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 404) {
            console.log('School not found, creating default school');
            try {
              const createSchoolResponse = await axios.post(`${API_URL}/schools`, {
                name: "Default School",
                address: "Default Address",
                contactNumber: "1234567890",
                email: "default@school.com",
                principalName: "Default Principal"
              });
              
              console.log('Default school creation response:', createSchoolResponse.data);
              
              if (createSchoolResponse.data.success) {
                schoolId = createSchoolResponse.data.data.id;
                localStorage.setItem('schoolId', schoolId.toString());
                console.log('New school ID set:', schoolId);
              } else {
                console.error('Failed to create school:', createSchoolResponse.data);
                showToast('error', 'Failed to create school. Please try again.');
                return;
              }
            } catch (createError) {
              console.error('Error creating default school:', createError);
              showToast('error', 'Failed to create default school. Please try again.');
              return;
            }
          } else {
            console.error('Error verifying school:', {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status
            });
            showToast('error', `Failed to verify school: ${error.response?.data?.message || error.message}`);
            return;
          }
        } else {
          console.error('Unexpected error during school verification:', error);
          showToast('error', 'An unexpected error occurred while verifying school');
          return;
        }
      }

      // Format sections data properly
      const formattedSections = Array.isArray(newTeacher.sections) 
        ? newTeacher.sections.map(section => ({
            class: section.class,
            sections: Array.isArray(section.sections) ? section.sections : []
          }))
        : [];

      // Create the teacher object with all required fields
      const teacherToAdd = {
        fullName: newTeacher.fullName || '',
        email: newTeacher.email || '',
        password: newTeacher.password || newTeacher.email?.split('@')[0] || 'password123',
        phone: newTeacher.phone || '',
        designation: newTeacher.designation || 'Teacher',
        subjects: Array.isArray(newTeacher.subjects) ? newTeacher.subjects : [],
        sections: formattedSections,
        classes: newTeacher.sections?.map(section => section.class).join(',') || '',
        joinDate: newTeacher.joinDate || getCurrentDate(),
        address: newTeacher.address || '',
        education: newTeacher.education || '',
        experience: newTeacher.experience || '',
        profileImage: newTeacher.profileImage || 'https://randomuser.me/api/portraits/men/0.jpg',
        isClassIncharge: newTeacher.isClassIncharge ?? false,
        inchargeClass: newTeacher.isClassIncharge ? newTeacher.inchargeClass : null,
        inchargeSection: newTeacher.isClassIncharge ? newTeacher.inchargeSection : null,
        schoolId: schoolId,
        status: 'active',
        username: newTeacher.email?.split('@')[0] || ''
      };

      console.log('Sending teacher data:', teacherToAdd);
      
      const response = await axios.post(`${API_URL}/teachers`, teacherToAdd, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Teacher creation response:', response.data);

      if (response.data.success) {
        setTeachers((prev) => [...prev, response.data.data]);
        showToast('success', 'Teacher added successfully!');
        setIsAddModalOpen(false);
      } else {
        console.error('Failed to add teacher:', response.data);
        showToast('error', response.data.message || 'Failed to add teacher. Please try again.');
      }
    } catch (error: any) {
      console.error('Error adding teacher:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      showToast('error', error.response?.data?.message || 'Failed to add teacher. Please try again.');
    }
  };

  // Handle form submission for editing a teacher
  const handleEditSubmit = async () => {
    if (editTeacher.isClassIncharge) {
      if (!editTeacher.inchargeClass || !editTeacher.inchargeSection) {
        showToast('error', 'Please select both incharge class and section');
        return;
      }

      if (checkInchargePosition(editTeacher.inchargeClass, editTeacher.inchargeSection, editTeacher.id)) {
        return;
      }
    }

    try {
      // Create the teacher update object
      const teacherToUpdate = {
        fullName: editTeacher.fullName,
        email: editTeacher.email,
        phone: editTeacher.phone,
        designation: editTeacher.designation || 'Teacher',
        subjects: Array.isArray(editTeacher.subjects) ? editTeacher.subjects : [],
        classes: typeof editTeacher.classes === 'string' ? editTeacher.classes : '',
        sections: Array.isArray(editTeacher.sections) ? editTeacher.sections : [],
        joinDate: editTeacher.joinDate || getCurrentDate(),
        address: editTeacher.address || '',
        education: editTeacher.education || '',
        experience: editTeacher.experience || '',
        profileImage: editTeacher.profileImage || 'https://randomuser.me/api/portraits/men/0.jpg',
        isClassIncharge: editTeacher.isClassIncharge || false,
        inchargeClass: editTeacher.isClassIncharge ? editTeacher.inchargeClass : null,
        inchargeSection: editTeacher.isClassIncharge ? editTeacher.inchargeSection : null,
        status: editTeacher.status || 'active',
        schoolId: parseInt(localStorage.getItem('schoolId') || '1'),
      };

      console.log('Updating teacher data:', teacherToUpdate);
      
      // Set headers explicitly to ensure content type is set properly
      const config = {
        headers: {
          'Content-Type': 'application/json',
        }
      };

      const response = await axios.put(`${API_URL}/teachers/${editTeacher.id}`, teacherToUpdate, config);
      
      if (response.data.success) {
        const updatedTeachers = teachers.map((teacher) =>
          teacher.id === editTeacher.id ? response.data.data : teacher
        );
        setTeachers(updatedTeachers);
        setIsEditModalOpen(false);
        showToast('success', 'Teacher updated successfully!');
        
        // Refresh the list to ensure we have the latest data
        fetchTeachers();
      } else {
        showToast('error', response.data.message || 'Failed to update teacher. Please try again.');
      }
    } catch (error: any) {
      console.error('Error updating teacher:', error);
      if (error.response?.data?.message) {
        showToast('error', error.response.data.message);
      } else {
        showToast('error', 'Failed to update teacher. Please try again.');
      }
    }
  };

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
      }
    };

    if (isProfileOpen || isAddModalOpen || isEditModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen, isAddModalOpen, isEditModalOpen]);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, classFilter]);

  // Handle status change for a teacher
  const handleStatusChange = (teacherId: number, newStatus: 'active' | 'inactive') => {
    const teacherToUpdate = teachers.find(t => t.id === teacherId);
    if (!teacherToUpdate) return;
    
    setEditTeacher({
      ...teacherToUpdate,
      status: newStatus
    });
    
    // Auto-save the status change
    const updatedTeacher = {
      ...teacherToUpdate,
      status: newStatus
    };
    
    // Set headers explicitly to ensure content type is set properly
    const config = {
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    axios.put(`${API_URL}/teachers/${teacherId}`, updatedTeacher, config)
      .then(response => {
        if (response.data.success) {
          setTeachers(prev => prev.map(t => 
            t.id === teacherId ? { ...t, status: newStatus } : t
          ));
          showToast('success', `Teacher marked as ${newStatus}`);
        } else {
          showToast('error', response.data.message || `Failed to update status`);
        }
      })
      .catch(error => {
        console.error('Error updating teacher status:', error);
        if (error.response?.data?.message) {
          showToast('error', error.response.data.message);
        } else {
          showToast('error', `Failed to update status`);
        }
      });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center mb-4 md:mb-0">
          <User2 className="h-6 w-6 mr-2 text-blue-600" /> 
          Teacher Directory
        </h1>
        <div className="flex items-center space-x-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300"
            onClick={handleAddTeacher}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Teacher
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        classFilter={classFilter}
        setClassFilter={setClassFilter}
      />

      {/* Show loading state */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No teachers found. Add your first teacher!</div>
      ) : (
        <>
          {/* Teacher Table */}
          <div className="overflow-x-auto">
            <TeacherTable
              currentTeachers={currentTeachers}
              handleViewProfile={handleViewProfile}
              handleEditTeacher={handleEditTeacher}
              handleDeleteTeacher={handleDeleteTeacher}
              handleStatusChange={handleStatusChange}
            />
          </div>

          {/* Pagination */}
          {filteredTeachers.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              filteredTeachers={filteredTeachers}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
              setCurrentPage={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Teacher Profile Modal */}
      {isProfileOpen && selectedTeacher && (
        <TeacherProfileModal
          selectedTeacher={selectedTeacher}
          setIsProfileOpen={setIsProfileOpen}
        />
      )}

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <TeacherFormModal
          isOpen={isAddModalOpen}
          setIsOpen={setIsAddModalOpen}
          mode="add"
          teacherData={newTeacher}
          setTeacherData={setNewTeacher}
          onSubmit={handleSubmit}
          validateInchargeClass={validateInchargeClass}
          handleInputChange={handleInputChange}
        />
      )}

      {/* Edit Teacher Modal */}
      {isEditModalOpen && editTeacher && (
        <TeacherFormModal
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          mode="edit"
          teacherData={editTeacher}
          setTeacherData={setEditTeacher}
          onSubmit={handleEditSubmit}
          validateInchargeClass={validateInchargeClass}
          handleInputChange={handleEditInputChange}
        />
      )}
    </div>
  );
};

export default TeacherDirectory;