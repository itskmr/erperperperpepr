import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { User2, UserPlus, Download, FileText, AlertTriangle } from 'lucide-react';
import { Teacher } from './types';
import TeacherTable from './TeacherTable';
import SearchFilters from './SearchFilter';
import Pagination from './Pegination';
import TeacherProfileModal from './TeacherProfileModal';
import TeacherFormModal from './TeacherFormModal';
import jsPDF from 'jspdf';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '../../../utils/authApi';
import { 
  exportData, 
  getTeacherExportConfig,
  ExportFormat 
} from '../../../utils/exportUtils';
// import autoTable from 'jspdf-autotable';

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

  // Fetch teachers from API
  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get school ID from authenticated user context
      const getSchoolIdFromAuth = (): number | null => {
        // First try to get from JWT token
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.schoolId) return payload.schoolId;
          } catch {
            console.warn('Failed to decode token for school ID');
          }
        }
        
        // Then try from user data
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            return user.schoolId || user.id; // For school users, their ID is the school ID
          } catch {
            console.warn('Failed to parse user data for school ID');
          }
        }
        
        return null;
      };
      
      const schoolId = getSchoolIdFromAuth();
      if (!schoolId) {
        setError('School context not found. Please login again.');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Fetching teachers for school ID:', schoolId);
      // School isolation will be handled automatically by backend auth middleware
      const data = await apiGet(`/teachers/school/${schoolId}`);
      
      if (Array.isArray(data)) {
        setTeachers(data);
      } else {
        setTeachers([]);
      }
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching teachers:', err);
      const apiErr = err as ApiError;
      setError(`Failed to fetch teachers: ${apiErr.message || 'Unknown error'}`);
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
      
      // Get school ID from authenticated user context
      const getSchoolIdFromAuth = (): number | null => {
        // First try to get from JWT token
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.schoolId) return payload.schoolId;
          } catch {
            console.warn('Failed to decode token for school ID');
          }
        }
        
        // Then try from user data
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            return user.schoolId || user.id; // For school users, their ID is the school ID
          } catch {
            console.warn('Failed to parse user data for school ID');
          }
        }
        
        return null;
      };
      
      const schoolId = getSchoolIdFromAuth();
      if (!schoolId) {
        setError('School context not found. Please login again.');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Searching teachers for school ID:', schoolId);
      let url = `/teachers/school/${schoolId}/search?`;
      
      if (searchTerm) {
        url += `searchTerm=${encodeURIComponent(searchTerm)}&`;
      }
      
      if (classFilter && classFilter !== 'all') {
        url += `classFilter=${encodeURIComponent(classFilter)}&`;
      }
      
      const data = await apiGet(url);
      
      if (Array.isArray(data)) {
        setTeachers(data);
      } else {
        setTeachers([]);
      }
      setError(null);
    } catch (err: unknown) {
      console.error('Error searching teachers:', err);
      const apiErr = err as ApiError;
      setError(`Failed to search teachers: ${apiErr.message || 'Unknown error'}`);
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
      const data = await apiGet(`/teachers/${teacher.id}`);
      
      if (data) {
        // The apiGet function already extracts the data, so use it directly
        const teacherData = data as Teacher;
        
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
          qualification: teacherData.qualification || '',
          address: teacherData.address || '',
          subjects: Array.isArray(teacherData.subjects) ? teacherData.subjects : [],
          sections: Array.isArray(teacherData.sections) ? teacherData.sections : [],
          joining_year: teacherData.joining_year || '',
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
    } catch (err: unknown) {
      console.error('Error fetching teacher details:', err);
      const apiErr = err as ApiError;
      showToast('error', 'Failed to fetch teacher details: ' + (apiErr.message || 'Unknown error'));
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

      // Get school ID from authenticated user context
      const getSchoolIdFromAuth = (): number | null => {
        // First try to get from JWT token
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.schoolId) return payload.schoolId;
          } catch {
            console.warn('Failed to decode token for school ID');
          }
        }
        
        // Then try from user data
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            return user.schoolId || user.id; // For school users, their ID is the school ID
          } catch {
            console.warn('Failed to parse user data for school ID');
          }
        }
        
        return null;
      };
      
      const schoolId = getSchoolIdFromAuth();
      if (!schoolId) {
        toast.error('School context not found. Please login again.');
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
        profileImage: formData.profileImage || '',
        isClassIncharge: formData.isClassIncharge || false,
        inchargeClass: formData.isClassIncharge ? formData.inchargeClass : null,
        inchargeSection: formData.isClassIncharge ? formData.inchargeSection : null,
        status: formData.status || 'active',
        schoolId: schoolId, // Use authenticated school context
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
      type RequiredField = keyof Pick<Teacher, 'fullName' | 'gender'>;
      const requiredFields: RequiredField[] = ['fullName', 'gender'];
      const missingFields = requiredFields.filter(field => {
        const value = formData[field];
        return !value;
      });

      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      console.log('Sending teacher data:', formattedData);

      await apiPost(`/teachers`, formattedData);
      
      // If we get here, the teacher was added successfully (apiPost would throw on error)
      toast.success('Teacher added successfully');
      setIsAddFormOpen(false);
      fetchTeachers(); // Refresh the teacher list
    } catch (error) {
      console.error('Error adding teacher:', error);
      const apiErr = error as ApiError;
      toast.error(apiErr.message || 'Error adding teacher');
    }
  };

  // Handle editing a teacher
  const handleEditTeacher = async (teacher: Teacher) => {
    try {
      // Fetch the complete teacher data
      const teacherData = await apiGet(`/teachers/${teacher.id}`) as Teacher;
      
      if (teacherData) {
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
      const apiErr = error as ApiError;
      toast.error(apiErr.message || 'Failed to fetch teacher details');
    }
  };

  // Handle deleting a teacher
  const handleDeleteTeacher = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
      setTeacherToDelete(teacher);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!teacherToDelete) return;

    try {
      await apiDelete(`/teachers/${teacherToDelete.id}`);
      
      // If we get here, the deletion was successful (apiDelete would throw on error)
      setTeachers((prev) => prev.filter((teacher) => teacher.id !== teacherToDelete.id));
      showToast('success', 'Teacher deleted successfully!');
    } catch (error: unknown) {
      console.error('Error deleting teacher:', error);
      const apiErr = error as ApiError;
      showToast('error', apiErr.message || 'Failed to delete teacher. Please try again.');
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
      type RequiredField = keyof Pick<Teacher, 'fullName' | 'gender'>;
      const requiredFields: RequiredField[] = ['fullName', 'gender'];
      const missingFields = requiredFields.filter(field => {
        const value = editTeacher[field];
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

      // Get school ID from authenticated user context
      const getSchoolIdFromAuth = (): number | null => {
        // First try to get from JWT token
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.schoolId) return payload.schoolId;
          } catch {
            console.warn('Failed to decode token for school ID');
          }
        }
        
        // Then try from user data
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            return user.schoolId || user.id; // For school users, their ID is the school ID
          } catch {
            console.warn('Failed to parse user data for school ID');
          }
        }
        
        return null;
      };
      
      const schoolId = getSchoolIdFromAuth();
      if (!schoolId) {
        toast.error('School context not found. Please login again.');
        return;
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
        schoolId: schoolId, // Use authenticated school context
        
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
      
      await apiPut(`/teachers/${editTeacher.id}`, teacherToUpdate);
      
      // If we get here, the teacher was updated successfully (apiPut would throw on error)
      setIsEditModalOpen(false);
      showToast('success', 'Teacher updated successfully!');
      
      // Refresh the list to ensure we have the latest data
      fetchTeachers();
    } catch (error: unknown) {
      console.error('Error updating teacher:', error);
      const apiErr = error as ApiError;
      showToast('error', apiErr.message || 'Failed to update teacher. Please try again.');
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


  // Enhanced export functions
  const handleExportCSV = () => {
    try {
      const config = getTeacherExportConfig(teachers);
      exportData('csv', config);
      showToast('success', 'Teachers data exported to CSV successfully');
    } catch (error) {
      console.error('Error exporting teachers to CSV:', error);
      showToast('error', 'Failed to export teachers data to CSV');
    }
  };

  const handleExportPDF = () => {
    try {
      const config = getTeacherExportConfig(teachers);
      exportData('pdf', config);
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