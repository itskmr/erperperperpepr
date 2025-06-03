import axios from 'axios';

// Use a direct API URL instead of relying on process.env
const API_URL = 'http://localhost:5000/api';

// Create axios instance with authentication
const axiosInstance = axios.create({
  baseURL: `${API_URL}/teacher-attendance`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 15000 // 15 second timeout
});

// Request interceptor to add authentication token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage (check both possible storage keys)
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log the request for debugging
    console.log(`Teacher Attendance API Request: ${config.method?.toUpperCase()} ${config.url}`, token ? 'with auth' : 'without auth');
    
    return config;
  },
  (error) => {
    console.error('Teacher Attendance API Request configuration error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response) {
      const status = error.response.status;
      
      // Handle authentication errors
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('role');
        localStorage.removeItem('userRole');
        
        // Redirect to login page
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/auth')) {
          console.warn('Authentication failed, redirecting to login');
          window.location.href = '/auth';
        }
        
        return Promise.reject({
          message: 'Authentication failed. Please log in again.',
          status: 401,
          code: 'AUTH_FAILED'
        });
      }
      
      // Handle forbidden errors
      if (status === 403) {
        return Promise.reject({
          message: 'You do not have permission to access this resource.',
          status: 403,
          code: 'FORBIDDEN'
        });
      }
      
      // Handle server errors
      if (status >= 500) {
        return Promise.reject({
          message: 'Server error. Please try again later.',
          status: status,
          code: 'SERVER_ERROR'
        });
      }
      
      // Extract error message from response
      const responseData = error.response.data;
      const errorMessage = responseData?.error || 
                          responseData?.message || 
                          error.message || 
                          'An error occurred';
      
      return Promise.reject({
        message: errorMessage,
        status: status,
        code: 'API_ERROR'
      });
    }
    
    // Handle network errors
    if (error.request) {
      console.error('Network error - no response received:', error.request);
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR'
      });
    }
    
    // Handle other errors
    console.error('Error setting up request:', error.message);
    return Promise.reject({
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    });
  }
);

// Types
export interface Teacher {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  designation: string;
  subjects?: string;
  isClassIncharge: boolean;
  inchargeClass?: string;
  inchargeSection?: string;
  profileImage?: string;
  status: string;
  attendance?: TeacherAttendanceRecord | null;
}

export interface TeacherAttendanceRecord {
  id: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  notes?: string;
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: number;
  markedAt: string;
}

export interface TeacherAttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  notMarked: number;
  attendanceRate: string;
}

export interface TeacherAttendanceData {
  teachers: Teacher[];
  statistics: TeacherAttendanceStats;
  date: string;
  schoolId: number;
}

export interface AttendanceSubmissionItem {
  teacherId: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  notes?: string;
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: number;
}

export interface AttendanceSubmissionData {
  date: string;
  attendanceData: AttendanceSubmissionItem[];
}

export interface TeacherAttendanceReport {
  teacher: {
    id: number;
    fullName: string;
    email?: string;
    designation: string;
    subjects?: string;
    isClassIncharge: boolean;
    inchargeClass?: string;
    inchargeSection?: string;
  };
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendanceRate: string;
  };
}

export interface DetailedTeacherAttendanceReport extends TeacherAttendanceReport {
  summary: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendanceRate: string;
  };
  dailyRecords: Array<{
    date: string;
    status: string;
    notes?: string;
    checkInTime?: string;
    checkOutTime?: string;
    workingHours?: number;
  }>;
}

export interface TeacherAttendanceDashboard {
  todayStats: TeacherAttendanceStats;
  monthlyStats: {
    totalRecords: number;
    present: number;
    absent: number;
    late: number;
    avgAttendanceRate: string;
  };
  schoolInfo: {
    schoolId: number;
    totalTeachers: number;
  };
  meta: {
    today: string;
    currentMonth: {
      start: string;
      end: string;
    };
  };
}

// API Functions

/**
 * Get all teachers for attendance marking
 */
export const getTeachersForAttendance = async (
  department?: string,
  designation?: string
): Promise<Teacher[]> => {
  try {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (designation) params.append('designation', designation);
    
    const response = await axiosInstance.get(`/teachers?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching teachers for attendance:', error);
    throw error;
  }
};

/**
 * Get teacher attendance for a specific date
 */
export const getTeacherAttendanceByDate = async (date: string): Promise<TeacherAttendanceData> => {
  try {
    const response = await axiosInstance.get(`/date?date=${date}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching teacher attendance by date:', error);
    throw error;
  }
};

/**
 * Mark teacher attendance
 */
export const markTeacherAttendance = async (
  attendanceData: AttendanceSubmissionData
): Promise<any> => {
  try {
    console.log('Submitting teacher attendance data:', attendanceData);
    
    const response = await axiosInstance.post('/mark', attendanceData);
    return response.data;
  } catch (error) {
    console.error('Error marking teacher attendance:', error);
    throw error;
  }
};

/**
 * Generate teacher attendance report
 */
export const generateTeacherAttendanceReport = async (
  startDate: string,
  endDate: string,
  teacherId?: number,
  department?: string,
  reportType: 'summary' | 'detailed' = 'summary'
): Promise<TeacherAttendanceReport[] | DetailedTeacherAttendanceReport[]> => {
  try {
    const params = new URLSearchParams({
      startDate,
      endDate,
      reportType
    });
    
    if (teacherId) params.append('teacherId', teacherId.toString());
    if (department) params.append('department', department);
    
    const response = await axiosInstance.get(`/reports?${params.toString()}`);
    return response.data.data.teachers;
  } catch (error) {
    console.error('Error generating teacher attendance report:', error);
    throw error;
  }
};

/**
 * Get teacher attendance dashboard data
 */
export const getTeacherAttendanceDashboard = async (): Promise<TeacherAttendanceDashboard> => {
  try {
    const response = await axiosInstance.get('/dashboard');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching teacher attendance dashboard:', error);
    throw error;
  }
};

/**
 * Export teacher attendance data as CSV
 */
export const exportTeacherAttendanceData = async (
  startDate: string,
  endDate: string,
  teacherId?: number,
  department?: string
): Promise<Blob> => {
  try {
    const params = new URLSearchParams({
      startDate,
      endDate
    });
    
    if (teacherId) params.append('teacherId', teacherId.toString());
    if (department) params.append('department', department);
    
    const response = await axiosInstance.get(`/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error exporting teacher attendance data:', error);
    throw error;
  }
};

/**
 * Get unique departments from teachers
 */
export const getTeacherDepartments = async (): Promise<string[]> => {
  try {
    const teachers = await getTeachersForAttendance();
    const departments = new Set<string>();
    
    teachers.forEach(teacher => {
      if (teacher.subjects) {
        // Parse subjects (assuming JSON string format)
        try {
          const subjects = JSON.parse(teacher.subjects);
          if (Array.isArray(subjects)) {
            subjects.forEach(subject => departments.add(subject));
          }
        } catch {
          // If not JSON, treat as comma-separated string
          teacher.subjects.split(',').forEach(subject => 
            departments.add(subject.trim())
          );
        }
      }
    });
    
    return Array.from(departments).sort();
  } catch (error) {
    console.error('Error fetching teacher departments:', error);
    return [];
  }
};

/**
 * Get unique designations from teachers
 */
export const getTeacherDesignations = async (): Promise<string[]> => {
  try {
    const teachers = await getTeachersForAttendance();
    const designations = new Set<string>();
    
    teachers.forEach(teacher => {
      if (teacher.designation) {
        designations.add(teacher.designation);
      }
    });
    
    return Array.from(designations).sort();
  } catch (error) {
    console.error('Error fetching teacher designations:', error);
    return [];
  }
};

/**
 * Calculate working hours between check-in and check-out times
 */
export const calculateWorkingHours = (checkInTime: string, checkOutTime: string): number => {
  try {
    const checkIn = new Date(checkInTime);
    const checkOut = new Date(checkOutTime);
    
    if (checkOut <= checkIn) {
      return 0;
    }
    
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
  } catch {
    return 0;
  }
};

/**
 * Format time for display (HH:MM format)
 */
export const formatTimeForDisplay = (dateTime: string): string => {
  try {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } catch {
    return '';
  }
};

/**
 * Validate attendance data before submission
 */
export const validateAttendanceData = (
  attendanceData: AttendanceSubmissionItem[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!attendanceData || !Array.isArray(attendanceData)) {
    errors.push('Attendance data must be an array');
    return { isValid: false, errors };
  }
  
  if (attendanceData.length === 0) {
    errors.push('At least one teacher attendance record is required');
    return { isValid: false, errors };
  }
  
  attendanceData.forEach((item, index) => {
    if (!item.teacherId) {
      errors.push(`Teacher ID is required for record ${index + 1}`);
    }
    
    if (!item.status || !['PRESENT', 'ABSENT', 'LATE'].includes(item.status)) {
      errors.push(`Valid status (PRESENT, ABSENT, LATE) is required for record ${index + 1}`);
    }
    
    if (item.checkInTime && item.checkOutTime) {
      const checkIn = new Date(item.checkInTime);
      const checkOut = new Date(item.checkOutTime);
      
      if (checkOut <= checkIn) {
        errors.push(`Check-out time must be after check-in time for record ${index + 1}`);
      }
    }
  });
  
  return { isValid: errors.length === 0, errors };
};

export default {
  getTeachersForAttendance,
  getTeacherAttendanceByDate,
  markTeacherAttendance,
  generateTeacherAttendanceReport,
  getTeacherAttendanceDashboard,
  exportTeacherAttendanceData,
  getTeacherDepartments,
  getTeacherDesignations,
  calculateWorkingHours,
  formatTimeForDisplay,
  validateAttendanceData
}; 