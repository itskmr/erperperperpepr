import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { User2, UserPlus, Download, FileText, AlertTriangle } from 'lucide-react';
import { Teacher } from './types';
import TeacherTable from './TeacherTable';
import SearchFilters from './SearchFilter';
import Pagination from './Pegination';
import TeacherProfileModal from './TeacherProfileModal';
import TeacherFormModal from './TeacherFormModal';
import axios, { AxiosError } from 'axios';
import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

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
      // Fetch the complete teacher data
      const response = await axios.get(`${API_URL}/teachers/${teacher.id}`);
      
      if (response.data.success) {
        const teacherData = response.data.data;
        
        // Format the data to ensure all fields are properly set
        const formattedTeacherData = {
          id: teacherData.id,
          fullName: teacherData.fullName || '',
          email: teacherData.email || '',
          phone: teacherData.phone || '',
          username: teacherData.username || '',
          gender: teacherData.gender || '',
          dateOfBirth: teacherData.dateOfBirth || '',
          age: teacherData.age || 0,
          designation: teacherData.designation || 'Teacher',
          qualification: teacherData.qualification || teacherData.education || '',
          address: teacherData.address || '',
          subjects: Array.isArray(teacherData.subjects) ? teacherData.subjects : [],
          sections: Array.isArray(teacherData.sections) ? teacherData.sections : [],
          joining_year: teacherData.joining_year || teacherData.joinDate || '',
          experience: teacherData.experience || '',
          profileImage: teacherData.profileImage || '',
          isClassIncharge: teacherData.isClassIncharge || false,
          inchargeClass: teacherData.inchargeClass || '',
          inchargeSection: teacherData.inchargeSection || '',
          religion: teacherData.religion || '',
          bloodGroup: teacherData.bloodGroup || '',
          maritalStatus: teacherData.maritalStatus || '',
          facebook: teacherData.facebook || '',
          twitter: teacherData.twitter || '',
          linkedIn: teacherData.linkedIn || '',
          documents: teacherData.documents || [],
          joiningSalary: teacherData.joiningSalary || 0,
          accountHolderName: teacherData.accountHolderName || '',
          accountNumber: teacherData.accountNumber || '',
          bankName: teacherData.bankName || '',
          bankBranch: teacherData.bankBranch || '',
          status: teacherData.status || 'active',
          schoolId: teacherData.schoolId,
          lastLogin: teacherData.lastLogin || '',
          createdAt: teacherData.createdAt || '',
          updatedAt: teacherData.updatedAt || ''
        };

        console.log('Teacher Profile Data:', formattedTeacherData);
        setSelectedTeacher(formattedTeacherData);
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
  const handleDeleteTeacher = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!teacherToDelete) return;

    try {
      const response = await axios.delete(`${API_URL}/teachers/${teacherToDelete.id}`);
      
      if (response.data.success) {
        setTeachers((prev) => prev.filter((teacher) => teacher.id !== teacherToDelete.id));
        showToast('success', 'Teacher deleted successfully!');
      } else {
        showToast('error', response.data.message || 'Failed to delete teacher. Please try again.');
      }
    } catch (error: unknown) {
      console.error('Error deleting teacher:', error);
      showToast('error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsDeleteModalOpen(false);
      setTeacherToDelete(null);
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


  // Add export functions
  const handleExportCSV = () => {
    try {
      // Prepare headers for CSV
      const headers = [
        'ID',
        'Full Name',
        'Email',
        'Phone',
        'Gender',
        'Date of Birth',
        'Age',
        'Designation',
        'Qualification',
        'Address',
        'Subjects',
        'Classes and Sections',
        'Joining Date',
        'Experience',
        'Profile Image',
        'Is Class Incharge',
        'Incharge Class',
        'Incharge Section',
        'Status',
        'Religion',
        'Blood Group',
        'Marital Status',
        'Facebook',
        'Twitter',
        'LinkedIn',
        'Joining Salary',
        'Account Holder Name',
        'Account Number',
        'Bank Name',
        'Bank Branch',
        'School ID',
        'Username',
        'Last Login',
        'Created At',
        'Updated At'
      ];

      // Prepare data rows with all fields
      const csvData = teachers.map(teacher => {
        // Format sections data
        const formattedSections = Array.isArray(teacher.sections) 
          ? teacher.sections.map(section => {
              const classNum = section.class || '';
              const sections = Array.isArray(section.sections) ? section.sections.join(',') : '';
              return `${classNum}-${sections}`;
            }).join('; ')
          : '';

        // Format subjects data
        const formattedSubjects = Array.isArray(teacher.subjects) 
          ? teacher.subjects.join(', ')
          : '';

        // Format dates
        const formatDate = (date: string | undefined) => {
          if (!date) return '';
          try {
            return new Date(date).toLocaleDateString();
          } catch {
            return date;
          }
        };

        return [
          String(teacher.id || ''),
          teacher.fullName || '',
          teacher.email || '',
          teacher.phone || '',
          teacher.gender || '',
          formatDate(teacher.dateOfBirth),
          String(teacher.age || ''),
          teacher.designation || '',
          teacher.qualification || '',
          teacher.address || '',
          formattedSubjects,
          formattedSections,
          formatDate(teacher.joining_year),
          teacher.experience || '',
          teacher.profileImage || '',
          teacher.isClassIncharge ? 'Yes' : 'No',
          teacher.inchargeClass || '',
          teacher.inchargeSection || '',
          teacher.status || '',
          teacher.religion || '',
          teacher.bloodGroup || '',
          teacher.maritalStatus || '',
          teacher.facebook || '',
          teacher.twitter || '',
          teacher.linkedIn || '',
          String(teacher.joiningSalary || 0),
          teacher.accountHolderName || '',
          teacher.accountNumber || '',
          teacher.bankName || '',
          teacher.bankBranch || '',
          String(teacher.schoolId || ''),
          teacher.username || '',
          formatDate(teacher.lastLogin),
          formatDate(teacher.createdAt),
          formatDate(teacher.updatedAt)
        ];
      });

      // Combine headers and data with proper CSV formatting
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => {
          // Handle special characters and ensure proper CSV formatting
          const cellStr = String(cell || '');
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return `"${cellStr}"`;
        }).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `teachers_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('success', 'Teachers data exported successfully');
    } catch (error) {
      console.error('Error exporting teachers to CSV:', error);
      showToast('error', 'Failed to export teachers data to CSV');
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title and header
      doc.setFontSize(20);
      doc.setTextColor(41, 128, 185); // Blue color
      doc.text('Teachers Directory', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100); // Gray color
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

      let yPosition = 40;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 14;
      const contentWidth = pageWidth - (margin * 2);

      // Process each teacher
      teachers.forEach((teacher, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Teacher header
        doc.setFontSize(14);
        doc.setTextColor(41, 128, 185);
        doc.text(`${teacher.fullName}`, margin, yPosition);
        
        yPosition += 8;

        // Basic Information
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Basic Information:', margin, yPosition);
        yPosition += 6;

        doc.setFontSize(9);
        doc.setTextColor(60);
        
        // Calculate age if dateOfBirth is available
        let ageDisplay = 'N/A';
        if (teacher.dateOfBirth) {
          const today = new Date();
          const birthDate = new Date(teacher.dateOfBirth);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          ageDisplay = `${age} years`;
        } else if (teacher.age) {
          ageDisplay = `${teacher.age} years`;
        }

        // Create two columns for basic info
        const basicInfo = [
          ['Email', teacher.email || 'N/A'],
          ['Phone', teacher.phone || 'N/A'],
          ['Gender', teacher.gender || 'N/A'],
          ['Age', ageDisplay],
          ['Designation', teacher.designation || 'N/A'],
          ['Qualification', teacher.qualification || 'N/A'],
          ['Experience', teacher.experience ? `${teacher.experience} years` : 'N/A'],
          ['Status', teacher.status || 'N/A']
        ];

        // Draw basic info in two columns
        basicInfo.forEach(([label, value], i) => {
          const x = margin + (i % 2) * (contentWidth / 2);
          const y = yPosition + Math.floor(i / 2) * 6;
          doc.text(`${label}: ${value}`, x, y);
        });

        yPosition += Math.ceil(basicInfo.length / 2) * 6 + 8;

        // Teaching Details
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Teaching Details:', margin, yPosition);
        yPosition += 6;

        doc.setFontSize(9);
        doc.setTextColor(60);

        // Format subjects
        const subjects = Array.isArray(teacher.subjects) ? teacher.subjects.join(', ') : 'N/A';
        doc.text(`Subjects: ${subjects}`, margin, yPosition);
        yPosition += 6;

        // Format sections
        const sections = Array.isArray(teacher.sections) 
          ? teacher.sections.map(s => `${s.class}-${s.sections.join(',')}`).join('; ')
          : 'N/A';
        doc.text(`Classes & Sections: ${sections}`, margin, yPosition);
        yPosition += 6;

        // Class Incharge details if applicable
        if (teacher.isClassIncharge) {
          doc.text(`Class Incharge: ${teacher.inchargeClass} - ${teacher.inchargeSection}`, margin, yPosition);
          yPosition += 6;
        }

        // Add joining date
        const joiningDate = teacher.joining_year ? new Date(teacher.joining_year).toLocaleDateString() : 'N/A';
        doc.text(`Joining Date: ${joiningDate}`, margin, yPosition);
        yPosition += 12;

        // Add a separator line between teachers
        if (index < teachers.length - 1) {
          doc.setDrawColor(200);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 8;
        }
      });

      // Add page numbers
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin - 30,
          doc.internal.pageSize.height - 10
        );
      }

      // Save the PDF
      doc.save(`teachers_export_${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('success', 'Teachers data exported to PDF successfully');
    } catch (error) {
      console.error('Error exporting teachers to PDF:', error);
      showToast('error', 'Failed to export teachers data to PDF');
    }
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
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
          <button
              onClick={handleExportCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300 shadow-sm"
              title="Export to CSV"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300 shadow-sm"
              title="Export to PDF"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </button>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300 shadow-sm"
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {isAddFormOpen ? 'Cancel' : 'Add New Teacher'}
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Teachers</p>
              <p className="text-2xl font-bold">{teachers.length}</p>
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
              <p className="text-green-100 text-sm font-medium">Active Teachers</p>
              <p className="text-2xl font-bold">
                {teachers.filter(teacher => teacher.status === 'active').length}
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
              <p className="text-yellow-100 text-sm font-medium">Class Incharges</p>
              <p className="text-2xl font-bold">
                {teachers.filter(teacher => teacher.isClassIncharge).length}
              </p>
            </div>
            <div className="bg-yellow-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Avg Experience</p>
              <p className="text-2xl font-bold">
                {teachers.length > 0 
                  ? Math.round(teachers.filter(t => t.experience && parseFloat(t.experience)).reduce((sum, teacher) => sum + parseFloat(teacher.experience || '0'), 0) / teachers.filter(t => t.experience && parseFloat(t.experience)).length || 0)
                  : 0} yrs
              </p>
            </div>
            <div className="bg-purple-400 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && teacherToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" ref={modalRef}>
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Delete Teacher
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete {teacherToDelete.fullName}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setTeacherToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
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

export default TeacherDirectory;