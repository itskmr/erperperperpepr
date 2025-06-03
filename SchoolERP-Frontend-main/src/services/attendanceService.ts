import axios from 'axios';

// Use a direct API URL instead of relying on process.env
const API_URL = 'http://localhost:5000/api';

// Create axios instance with authentication
const axiosInstance = axios.create({
  baseURL: API_URL,
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
    console.log(`Attendance API Request: ${config.method?.toUpperCase()} ${config.url}`, token ? 'with auth' : 'without auth');
    
    return config;
  },
  (error) => {
    console.error('Attendance API Request configuration error:', error);
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
export interface Student {
  id: string | number; // Can be either string (UUID) or number
  name: string;
  rollNumber: string;
  admissionNo: string;
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | null;
  notes?: string | null;
}

export interface ClassWithSections {
  className: string;
  sections: string[];
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
}

export interface AttendanceData {
  students: Student[];
  stats: AttendanceStats;
  date: string;
  className: string;
  section?: string;
  schoolId?: number;
}

export interface TeacherData {
  id: number;
  fullName: string;
}

export interface TeacherClassesData {
  teacher: TeacherData;
  classesTaught: ClassWithSections[];
  schoolId?: number;
}

export interface MonthlyReportData {
  reportInfo: {
    year: number;
    month: number;
    monthName: string;
    className: string;
    section: string;
    schoolId: number;
  };
  classStats: {
    totalStudents: number;
    totalWorkingDays: number;
    averageAttendance: string;
  };
  studentReports: Array<{
    student: {
      id: string;
      name: string;
      admissionNo: string;
      rollNumber: string;
    };
    attendance: {
      totalDays: number;
      presentDays: number;
      absentDays: number;
      lateDays: number;
      attendancePercentage: string;
    };
    dailyRecords: Array<{
      date: string;
      status: string;
      notes?: string;
    }>;
  }>;
}

export interface SchoolSummaryData {
  schoolStats: {
    totalRecords: number;
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    overallAttendanceRate: string;
  };
  classWiseStats: Array<{
    className: string;
    section: string;
    totalRecords: number;
    present: number;
    absent: number;
    late: number;
    attendanceRate: string;
  }>;
}

export interface DetailedStudentReportData {
  student: {
    id: string;
    name: string;
    admissionNo: string;
    class: string;
    section: string;
    rollNumber: string;
  };
  overallStats: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendancePercentage: string;
  };
  monthlyBreakdown: Array<{
    month: string;
    total: number;
    present: number;
    absent: number;
    late: number;
    attendanceRate: string;
  }>;
  recentRecords: Array<{
    date: string;
    status: string;
    notes?: string;
    markedBy: string;
  }>;
}

// Interface for attendance statistics response
export interface AttendanceStatsResponse {
  overallStats: {
    totalRecords: number;
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    overallAttendanceRate: string;
  };
  dailyStats: Array<{
    date: string;
    total: number;
    present: number;
    absent: number;
    late: number;
  }>;
  meta: {
    schoolId: number;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    className: string;
    section: string;
  };
}

// Interface for attendance records response
export interface AttendanceRecordsResponse {
  id: number;
  date: string;
  status: string;
  notes?: string;
  student: {
    id: number;
    name: string;
    admissionNo: string;
  };
}

// Get classes taught by teacher
export const getTeacherClasses = async (teacherId: number): Promise<ClassWithSections[]> => {
  try {
    const response = await axiosInstance.get('/attendance/teacher-management', {
      params: { teacherId }
    });
    return response.data.data.classesTaught;
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    throw error;
  }
};

// Get attendance data for a specific class and date
export const getAttendanceData = async (
  className: string,
  date: string,
  teacherId: number,
  section?: string
): Promise<AttendanceData> => {
  try {
    const response = await axiosInstance.get('/attendance/teacher-management', {
      params: { 
        className, 
        date, 
        teacherId,
        ...(section && { section })
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    throw error;
  }
};

// Mark attendance for students
export const markAttendance = async (
  date: string,
  className: string,
  teacherId: number,
  attendanceData: Array<{studentId: string | number, status: string, notes?: string}>,
  section?: string
) => {
  try {
    // Convert studentId to appropriate type
    const formattedAttendanceData = attendanceData.map(item => ({
      ...item,
      studentId: item.studentId // Keep as-is since backend should handle both types
    }));
    
    // Ensure teacherId is a positive number
    const validTeacherId = typeof teacherId === 'number' && !isNaN(teacherId) && teacherId > 0 
      ? teacherId 
      : 1; // Default to 1 if invalid
    
    console.log('Sending attendance data:', {
      date,
      className,
      section,
      teacherId: validTeacherId,
      attendanceData: formattedAttendanceData
    });
    
    // Create the request body with proper typing
    const requestBody: {
      date: string;
      className: string;
      teacherId: number;
      attendanceData: Array<{studentId: string | number, status: string, notes?: string}>;
      section?: string;
    } = {
      date,
      className,
      teacherId: validTeacherId,
      attendanceData: formattedAttendanceData
    };
    
    if (section) {
      requestBody.section = section;
    }
    
    // Use axiosInstance for consistency
    const response = await axiosInstance.post('/attendance/mark', requestBody);
    
    return response.data;
  } catch (error: unknown) {
    console.error('Error marking attendance:', error);
    
    // Enhanced error logging with proper type checking
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { 
        response?: { 
          data?: { message?: string }; 
          status?: number; 
          headers?: unknown 
        }; 
        message?: string;
        request?: unknown;
      };
      
      if (axiosError.response) {
        console.error('Response error data:', axiosError.response.data);
        console.error('Response status:', axiosError.response.status);
        console.error('Response headers:', axiosError.response.headers);
        
        // Log detailed errors if available
        if (axiosError.response.data && typeof axiosError.response.data === 'object' && 'errors' in axiosError.response.data) {
          console.error('Detailed errors:', axiosError.response.data.errors);
        }
      } else if (axiosError.request) {
        console.error('Request was made but no response received');
      } else {
        console.error('Error setting up request:', axiosError.message);
      }
    } else if (error && typeof error === 'object' && 'message' in error) {
      const genericError = error as { message: string };
      console.error('Error setting up request:', genericError.message);
    }
    
    throw error;
  }
};

// Get attendance reports by date range
export const getAttendanceStats = async (
  startDate: string,
  endDate: string,
  className: string,
  section?: string
): Promise<AttendanceStatsResponse> => {
  try {
    const response = await axiosInstance.get('/attendance/stats', {
      params: {
        startDate,
        endDate,
        className,
        ...(section && { section })
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching attendance statistics:', error);
    throw error;
  }
};

// Export attendance data as CSV
export const exportAttendanceData = async (
  className: string,
  date: string,
  section?: string
): Promise<Blob> => {
  try {
    const response = await axiosInstance.get('/attendance/export', {
      params: {
        className,
        date,
        ...(section && { section })
      },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting attendance data:', error);
    throw error;
  }
};

// Enhanced Reporting Functions

// Get monthly attendance report for a class
export const getMonthlyAttendanceReport = async (
  year: number,
  month: number,
  className: string,
  section?: string
): Promise<MonthlyReportData> => {
  try {
    const response = await axiosInstance.get('/attendance/reports/monthly', {
      params: {
        year,
        month,
        className,
        ...(section && { section })
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching monthly attendance report:', error);
    throw error;
  }
};

// Get school-wide attendance summary
export const getSchoolAttendanceSummary = async (
  startDate: string,
  endDate: string
): Promise<SchoolSummaryData> => {
  try {
    const response = await axiosInstance.get('/attendance/reports/school-summary', {
      params: {
        startDate,
        endDate
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching school attendance summary:', error);
    throw error;
  }
};

// Get detailed student attendance report
export const getDetailedStudentReport = async (
  studentId: string,
  startDate?: string,
  endDate?: string
): Promise<DetailedStudentReportData> => {
  try {
    const response = await axiosInstance.get('/attendance/reports/student-detailed', {
      params: {
        studentId,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching detailed student report:', error);
    throw error;
  }
};

// Get students by class for attendance marking
export const getStudentsByClass = async (
  className: string,
  section?: string
): Promise<Student[]> => {
  try {
    const response = await axiosInstance.get('/attendance/students', {
      params: {
        className,
        ...(section && { section })
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching students by class:', error);
    throw error;
  }
};

// Get attendance records by date and class
export const getAttendanceRecords = async (
  date: string,
  className: string,
  section?: string
): Promise<AttendanceRecordsResponse[]> => {
  try {
    const response = await axiosInstance.get('/attendance/records', {
      params: {
        date,
        className,
        ...(section && { section })
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    throw error;
  }
};

// Get available classes and sections for the school
export const getAvailableClasses = async (): Promise<ClassWithSections[]> => {
  try {
    const response = await axiosInstance.get('/attendance/classes');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching available classes:', error);
    throw error;
  }
};

// Generate attendance report for a specific class and date
export const generateReport = async (
  className: string,
  section: string,
  date: string,
  teacherId: number
): Promise<{ students: Student[]; stats: AttendanceStats }> => {
  try {
    const response = await axiosInstance.get('/attendance/teacher-management', {
      params: {
        className,
        section,
        date,
        teacherId
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

// Export report data as CSV blob
export const exportReportData = async (
  className: string,
  section: string,
  date: string,
  students: Student[],
  stats: AttendanceStats
): Promise<Blob> => {
  try {
    // Create CSV content
    const csvHeader = 'Student Name,Roll Number,Admission Number,Status,Notes\n';
    const csvRows = students.map(student => {
      const name = `"${student.name.replace(/"/g, '""')}"`;
      const rollNumber = student.rollNumber || '';
      const admissionNo = student.admissionNo || '';
      const status = student.status || 'Not Marked';
      const notes = student.notes ? `"${student.notes.replace(/"/g, '""')}"` : '';
      
      return `${name},${rollNumber},${admissionNo},${status},${notes}`;
    }).join('\n');
    
    // Add summary at the top
    const summary = `Attendance Report\nClass: ${className}\nSection: ${section}\nDate: ${date}\nTotal Students: ${stats.total}\nPresent: ${stats.present}\nAbsent: ${stats.absent}\nLate: ${stats.late}\n\n`;
    
    const csvContent = summary + csvHeader + csvRows;
    
    // Create blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return blob;
  } catch (error) {
    console.error('Error creating report export:', error);
    throw error;
  }
};

export default {
  getTeacherClasses,
  getAttendanceData,
  markAttendance,
  getAttendanceStats,
  exportAttendanceData,
  getMonthlyAttendanceReport,
  getSchoolAttendanceSummary,
  getDetailedStudentReport,
  getStudentsByClass,
  getAttendanceRecords,
  getAvailableClasses,
  generateReport,
  exportReportData,
}; 