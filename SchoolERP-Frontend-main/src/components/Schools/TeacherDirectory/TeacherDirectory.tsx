import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { User2, UserPlus } from 'lucide-react';
import { Teacher } from './types';
import TeacherTable from './TeacherTable';
import SearchFilters from './SearchFilter';
import Pagination from './Pegination';
import TeacherProfileModal from './TeacherProfileModal';
import TeacherFormModal from './TeacherFormModal';
import axios, { AxiosError } from 'axios';

// Update API URL to ensure it's correctly pointing to your backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AddTeacherFormData extends Partial<Teacher> {
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  subjects: string[];
  sections: Array<{ class: string; sections: string[] }>;
  joining_year: string;
  address: string;
  qualification: string;
  experience: string;
  profileImage: string;
  isClassIncharge: boolean;
  inchargeClass?: string;
  inchargeSection?: string;
  status: 'active' | 'inactive';
}

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
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState<AddTeacherFormData>({
    fullName: '',
    email: '',
    phone: '',
    designation: 'Teacher',
    subjects: [],
    sections: [],
    joining_year: new Date().toISOString(),
    address: '',
    qualification: '',
    experience: '',
    profileImage: '',
    isClassIncharge: false,
    inchargeClass: undefined,
    inchargeSection: undefined,
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
  const fetchTeachers = useCallback(async () => {
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
    } catch (error: unknown) {
      console.error('Error fetching teachers:', error);
      setError(`Failed to fetch teachers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setTeachers, setError]);

  // Fetch teachers on component mount
  useEffect(() => {
    // Only fetch if search and filter are not active
    if (!searchTerm && classFilter === 'all') {
      fetchTeachers();
    }
  }, [searchTerm, classFilter, fetchTeachers]);

  // Backend search and filter
  const searchTeachers = useCallback(async () => {
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
    } catch (error: unknown) {
      console.error('Error searching teachers:', error);
      setError(`Failed to search teachers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, classFilter, setLoading, setTeachers, setError]);

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
  }, [searchTerm, classFilter, searchTeachers, fetchTeachers]);

  // Filtered teachers based on search and class filter
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects?.some((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase())) || false;

    const matchesClass =
      classFilter === 'all' || teacher.sections?.some((section) => section.class === classFilter) || false;

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
  const handleViewProfile = async (teacher: Teacher) => {
    try {
      const response = await axios.get(`${API_URL}/teachers/${teacher.id}`);
      if (response.data.success) {
        const teacherData = response.data.data;
        console.log('Teacher Profile Data:', {
          id: teacherData.id,
          fullName: teacherData.fullName,
          email: teacherData.email,
          phone: teacherData.phone,
          username: teacherData.username,
          gender: teacherData.gender,
          dateOfBirth: teacherData.dateOfBirth,
          age: teacherData.age,
          designation: teacherData.designation,
          qualification: teacherData.qualification,
          address: teacherData.address,
          subjects: teacherData.subjects,
          sections: teacherData.sections,
          joining_year: teacherData.joining_year,
          experience: teacherData.experience,
          profileImage: teacherData.profileImage,
          isClassIncharge: teacherData.isClassIncharge,
          inchargeClass: teacherData.inchargeClass,
          inchargeSection: teacherData.inchargeSection,
          religion: teacherData.religion,
          bloodGroup: teacherData.bloodGroup,
          maritalStatus: teacherData.maritalStatus,
          facebook: teacherData.facebook,
          twitter: teacherData.twitter,
          linkedIn: teacherData.linkedIn,
          documents: teacherData.documents,
          joiningSalary: teacherData.joiningSalary,
          accountHolderName: teacherData.accountHolderName,
          accountNumber: teacherData.accountNumber,
          bankName: teacherData.bankName,
          bankBranch: teacherData.bankBranch,
          status: teacherData.status,
          schoolId: teacherData.schoolId,
          lastLogin: teacherData.lastLogin,
          createdAt: teacherData.createdAt,
          updatedAt: teacherData.updatedAt
        });
        setSelectedTeacher(teacherData);
    setIsProfileOpen(true);
      } else {
        showToast('error', 'Failed to fetch teacher details');
      }
    } catch (error) {
      console.error('Error fetching teacher details:', error);
      showToast('error', 'Failed to fetch teacher details');
    }
  };

  // Handle adding a new teacher
  const handleAddTeacher = async (formData: Partial<Teacher>) => {
    try {
      // Ensure we have valid form data
      if (!formData) {
        toast.error('Invalid form data');
        return;
      }

      // Calculate age if dateOfBirth is provided
      let age: number | undefined;
      if (formData.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(formData.dateOfBirth);
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      // Format the data with all fields, using empty strings/arrays for undefined values
      const formattedData = {
        // Required fields
        fullName: formData.fullName || '',
        email: formData.email || '',
        gender: formData.gender || '',
        phone: formData.phone || '',
        subjects: Array.isArray(formData.subjects) ? formData.subjects : [],
        sections: Array.isArray(formData.sections) ? formData.sections : [],
        
        // Optional fields with default values
        designation: formData.designation || 'Subject Teacher',
        joining_year: formData.joining_year || new Date().toISOString().split('T')[0],
        address: formData.address || '',
        qualification: formData.qualification || '',
        experience: formData.experience || '0',
        profileImage: formData.profileImage || 'https://randomuser.me/api/portraits/men/0.jpg',
        isClassIncharge: formData.isClassIncharge || false,
        inchargeClass: formData.isClassIncharge ? formData.inchargeClass : null,
        inchargeSection: formData.isClassIncharge ? formData.inchargeSection : null,
        status: formData.status || 'active',
        schoolId: parseInt(localStorage.getItem('schoolId') || '1'),
        documents: [],
        password: '123456', // Default password for new teachers
        
        // Personal information with default values
        dateOfBirth: formData.dateOfBirth || '',
        age: age || 0,
        religion: formData.religion || '',
        bloodGroup: formData.bloodGroup || '',
        maritalStatus: formData.maritalStatus || '',
        facebook: formData.facebook || '',
        twitter: formData.twitter || '',
        linkedIn: formData.linkedIn || '',
        
        // Banking information with default values
        joiningSalary: formData.joiningSalary || 0,
        accountHolderName: formData.accountHolderName || '',
        accountNumber: formData.accountNumber || '',
        bankName: formData.bankName || '',
        bankBranch: formData.bankBranch || ''
      };

      // Validate required fields before sending
      type RequiredField = keyof Pick<Teacher, 'fullName' | 'email' | 'gender' | 'phone' | 'subjects' | 'sections'>;
      const requiredFields: RequiredField[] = ['fullName', 'email', 'gender', 'phone', 'subjects', 'sections'];
      const missingFields = requiredFields.filter(field => {
        const value = formData[field];
        if (field === 'subjects' || field === 'sections') {
          return !value || !Array.isArray(value) || value.length === 0;
        }
        return !value;
      });

      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      console.log('Sending teacher data:', formattedData);

      const response = await axios.post(`${API_URL}/teachers`, formattedData);
      
      if (response.data.success) {
        toast.success('Teacher added successfully');
        setIsAddFormOpen(false);
        fetchTeachers(); // Refresh the teacher list
      } else {
        toast.error(response.data.message || 'Failed to add teacher');
      }
    } catch (error) {
      console.error('Error adding teacher:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Error adding teacher';
        console.error('Server error details:', error.response?.data);
        toast.error(errorMessage);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  // Handle editing a teacher
  const handleEditTeacher = async (teacher: Teacher) => {
    try {
      // Fetch the complete teacher data
      const response = await axios.get(`${API_URL}/teachers/${teacher.id}`);
      
      if (response.data.success) {
        const teacherData = response.data.data;
        
        // Format the data to ensure all fields are properly set
        const formattedTeacherData = {
          id: teacherData.id,
          fullName: teacherData.fullName || '',
          email: teacherData.email || '',
          gender: teacherData.gender || '',
          phone: teacherData.phone || '',
          subjects: Array.isArray(teacherData.subjects) ? teacherData.subjects : [],
          sections: Array.isArray(teacherData.sections) ? teacherData.sections : [],
          designation: teacherData.designation || 'Subject Teacher',
          joining_year: teacherData.joining_year || '', // Use joining_year directly instead of joinDate
          address: teacherData.address || '',
          qualification: teacherData.qualification || '', // Use qualification directly instead of education
          experience: teacherData.experience || '',
          profileImage: teacherData.profileImage || '',
          isClassIncharge: teacherData.isClassIncharge || false,
          inchargeClass: teacherData.inchargeClass || '',
          inchargeSection: teacherData.inchargeSection || '',
          status: teacherData.status || 'active',
          schoolId: teacherData.schoolId,
          username: teacherData.username || '',
          
          // Personal information
          dateOfBirth: teacherData.dateOfBirth || '',
          age: teacherData.age || 0,
          religion: teacherData.religion || '',
          bloodGroup: teacherData.bloodGroup || '',
          maritalStatus: teacherData.maritalStatus || '',
          facebook: teacherData.facebook || '',
          twitter: teacherData.twitter || '',
          linkedIn: teacherData.linkedIn || '',
          
          // Banking information
          joiningSalary: teacherData.joiningSalary || 0,
          accountHolderName: teacherData.accountHolderName || '',
          accountNumber: teacherData.accountNumber || '',
          bankName: teacherData.bankName || '',
          bankBranch: teacherData.bankBranch || ''
        };

        console.log('Setting edit teacher data:', formattedTeacherData);
        
        // Set the edit teacher data
        setEditTeacher(formattedTeacherData);
        
        // Ensure the modal is opened after data is set
        setTimeout(() => {
    setIsEditModalOpen(true);
        }, 0);
      } else {
        toast.error('Failed to fetch teacher details');
      }
    } catch (error) {
      console.error('Error fetching teacher details:', error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to fetch teacher details');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
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
      } catch (error: unknown) {
        console.error('Error deleting teacher:', error);
        showToast('error', error instanceof Error ? error.message : 'Unknown error');
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
  const handleInputChange = (field: keyof Teacher, value: unknown) => {
    if (typeof value === 'string' || typeof value === 'boolean' || Array.isArray(value) || value === null) {
    setNewTeacher((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Handle input changes for editing teacher
  const handleEditInputChange = (field: keyof Teacher, value: unknown) => {
    if (typeof value === 'string' || typeof value === 'boolean' || Array.isArray(value) || value === null) {
    setEditTeacher((prev) => ({ ...prev, [field]: value }));
    }
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

  // Handle class incharge selection
  const handleClassInchargeSelect = (isIncharge: boolean) => {
    setNewTeacher(prev => ({
      ...prev,
      isClassIncharge: isIncharge,
      inchargeClass: isIncharge ? prev.inchargeClass : undefined,
      inchargeSection: isIncharge ? prev.inchargeSection : undefined
    }));
  };

  // Handle edit class incharge selection
  const handleEditClassInchargeSelect = (isIncharge: boolean) => {
    setEditTeacher(prev => ({
      ...prev,
      isClassIncharge: isIncharge,
      inchargeClass: isIncharge ? prev.inchargeClass : undefined,
      inchargeSection: isIncharge ? prev.inchargeSection : undefined
    }));
  };

  // Handle form submission for editing a teacher
  const handleEditSubmit = async () => {
    try {
      // Validate required fields
      type RequiredField = keyof Pick<Teacher, 'fullName' | 'email' | 'gender' | 'phone' | 'subjects' | 'sections'>;
      const requiredFields: RequiredField[] = ['fullName', 'email', 'gender', 'phone', 'subjects', 'sections'];
      const missingFields = requiredFields.filter(field => {
        const value = editTeacher[field];
        if (field === 'subjects' || field === 'sections') {
          return !value || !Array.isArray(value) || value.length === 0;
        }
        return !value;
      });

      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

    if (editTeacher.isClassIncharge) {
      if (!editTeacher.inchargeClass || !editTeacher.inchargeSection) {
          toast.error('Please select both incharge class and section');
        return;
      }

      if (checkInchargePosition(editTeacher.inchargeClass, editTeacher.inchargeSection, editTeacher.id)) {
        return;
      }
    }

      // Create the teacher update object with only provided fields
      const teacherToUpdate = {
        // Required fields
        fullName: editTeacher.fullName,
        email: editTeacher.email,
        gender: editTeacher.gender,
        phone: editTeacher.phone,
        subjects: editTeacher.subjects,
        sections: editTeacher.sections,
        
        // Optional fields - only include if provided
        ...(editTeacher.designation && { designation: editTeacher.designation }),
        ...(editTeacher.joining_year && { joining_year: editTeacher.joining_year }),
        ...(editTeacher.address && { address: editTeacher.address }),
        ...(editTeacher.qualification && { qualification: editTeacher.qualification }),
        ...(editTeacher.experience && { experience: editTeacher.experience }),
        ...(editTeacher.profileImage && { profileImage: editTeacher.profileImage }),
        ...(editTeacher.isClassIncharge && { 
          isClassIncharge: editTeacher.isClassIncharge,
          inchargeClass: editTeacher.inchargeClass,
          inchargeSection: editTeacher.inchargeSection
        }),
        ...(editTeacher.status && { status: editTeacher.status }),
        schoolId: parseInt(localStorage.getItem('schoolId') || '1'),
        
        // Optional personal information - only include if provided
        ...(editTeacher.religion && { religion: editTeacher.religion }),
        ...(editTeacher.bloodGroup && { bloodGroup: editTeacher.bloodGroup }),
        ...(editTeacher.maritalStatus && { maritalStatus: editTeacher.maritalStatus }),
        ...(editTeacher.facebook && { facebook: editTeacher.facebook }),
        ...(editTeacher.twitter && { twitter: editTeacher.twitter }),
        ...(editTeacher.linkedIn && { linkedIn: editTeacher.linkedIn }),
        
        // Optional banking information - only include if provided
        ...(editTeacher.joiningSalary && { joiningSalary: editTeacher.joiningSalary }),
        ...(editTeacher.accountHolderName && { accountHolderName: editTeacher.accountHolderName }),
        ...(editTeacher.accountNumber && { accountNumber: editTeacher.accountNumber }),
        ...(editTeacher.bankName && { bankName: editTeacher.bankName }),
        ...(editTeacher.bankBranch && { bankBranch: editTeacher.bankBranch })
      };

      console.log('Updating teacher data:', teacherToUpdate);
      
      const response = await axios.put(`${API_URL}/teachers/${editTeacher.id}`, teacherToUpdate);
      
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
    } catch (error: unknown) {
      console.error('Error updating teacher:', error);
      if (error instanceof AxiosError && error.response?.data?.message) {
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
        setIsAddFormOpen(false);
        setIsEditModalOpen(false);
      }
    };

    if (isProfileOpen || isAddFormOpen || isEditModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen, isAddFormOpen, isEditModalOpen]);

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
        if (error instanceof AxiosError && error.response?.data?.message) {
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
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {isAddFormOpen ? 'Cancel' : 'Add New Teacher'}
          </button>
        </div>
      </div>

      {/* Add Teacher Form Dropdown */}
      {isAddFormOpen && (
        <div className="mb-6 border rounded-lg shadow-lg">
          <TeacherFormModal
            isOpen={true}
            setIsOpen={setIsAddFormOpen}
            mode="add"
            teacherData={newTeacher}
            setTeacherData={(data) => setNewTeacher(data as AddTeacherFormData)}
            onSubmit={handleAddTeacher}
            validateInchargeClass={validateInchargeClass}
            handleInputChange={handleInputChange}
            handleClassInchargeSelect={handleClassInchargeSelect}
          />
        </div>
      )}

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
          handleClassInchargeSelect={handleEditClassInchargeSelect}
        />
      )}
    </div>
  );
};

export default TeacherDirectory;