import axios from 'axios';

// Use a direct API URL instead of relying on process.env
const API_URL = 'http://localhost:5000/api';

// Types
export interface Student {
  id: number;
  name: string;
  rollNumber: string;
  admissionNo: string;
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | null;
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
  excused: number;
}

export interface AttendanceData {
  students: Student[];
  stats: AttendanceStats;
  date: string;
  className: string;
  section?: string;
}

export interface TeacherData {
  id: number;
  fullName: string;
}

export interface TeacherClassesData {
  teacher: TeacherData;
  classesTaught: ClassWithSections[];
}

// Get classes taught by teacher
export const getTeacherClasses = async (teacherId: number): Promise<ClassWithSections[]> => {
  try {
    const response = await axios.get(`${API_URL}/attendance/teacher-management`, {
      params: { teacherId },
      withCredentials: true,
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
    const response = await axios.get(`${API_URL}/attendance/teacher-management`, {
      params: { 
        className, 
        date, 
        teacherId,
        ...(section && { section })
      },
      withCredentials: true,
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
  attendanceData: Array<{studentId: number, status: string, notes?: string}>,
  section?: string
) => {
  try {
    // Convert studentId to number if it's not already
    const formattedAttendanceData = attendanceData.map(item => ({
      ...item,
      studentId: typeof item.studentId === 'string' ? parseInt(item.studentId) : item.studentId
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
    
    // Create the request body
    const requestBody = {
      date,
      className,
      teacherId: validTeacherId,
      attendanceData: formattedAttendanceData
    };
    
    if (section) {
      requestBody.section = section;
    }
    
    // Use API_URL constant for consistency
    const response = await axios({
      method: 'post',
      url: `${API_URL}/attendance/mark`,
      data: requestBody,
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000 // 15 second timeout
    });
    
    return response.data;
  } catch (error) {
    console.error('Error marking attendance:', error);
    
    // Enhanced error logging
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      
      // Log detailed errors if available
      if (error.response.data && error.response.data.errors) {
        console.error('Detailed errors:', error.response.data.errors);
      }
    } else if (error.request) {
      console.error('Request was made but no response received');
    } else {
      console.error('Error setting up request:', error.message);
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
): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/attendance/stats`, {
      params: {
        startDate,
        endDate,
        className,
        ...(section && { section })
      },
      withCredentials: true,
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
    const response = await axios.get(`${API_URL}/attendance/export`, {
      params: {
        className,
        date,
        ...(section && { section })
      },
      responseType: 'blob',
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting attendance data:', error);
    throw error;
  }
};

export default {
  getTeacherClasses,
  getAttendanceData,
  markAttendance,
  getAttendanceStats,
  exportAttendanceData,
}; 