import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Create axios instance with default configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/teacher-diary`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add authentication token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types and Interfaces

export interface TeacherDiaryEntry {
  id: number;
  title: string;
  content: string;
  date: string;
  className: string;
  section: string;
  subject: string;
  period?: string;
  entryType: DiaryEntryType;
  homework?: string;
  classSummary?: string;
  notices?: string;
  remarks?: string;
  isPublic: boolean;
  priority: DiaryPriority;
  attachments?: string[];
  imageUrls?: string[];
  teacherId: number;
  schoolId: number;
  teacher?: {
    id: number;
    fullName: string;
    email?: string;
    designation: string;
    subjects?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type DiaryEntryType = 
  | 'GENERAL'
  | 'HOMEWORK'
  | 'ANNOUNCEMENT'
  | 'ASSESSMENT'
  | 'EVENT'
  | 'NOTICE'
  | 'REMINDER'
  | 'ASSIGNMENT'
  | 'TEACHING_MATERIAL';

export type DiaryPriority = 
  | 'LOW'
  | 'NORMAL'
  | 'HIGH'
  | 'URGENT';

export interface CreateDiaryEntryData {
  title: string;
  content: string;
  date: string;
  className: string;
  section: string;
  subject: string;
  period?: string;
  entryType?: DiaryEntryType;
  homework?: string;
  classSummary?: string;
  notices?: string;
  remarks?: string;
  isPublic?: boolean;
  priority?: DiaryPriority;
  attachments?: string[];
  imageUrls?: string[];
}

export interface UpdateDiaryEntryData {
  title?: string;
  content?: string;
  date?: string;
  className?: string;
  section?: string;
  subject?: string;
  period?: string;
  entryType?: DiaryEntryType;
  homework?: string;
  classSummary?: string;
  notices?: string;
  remarks?: string;
  isPublic?: boolean;
  priority?: DiaryPriority;
  attachments?: string[];
  imageUrls?: string[];
}

export interface DiaryEntriesResponse {
  entries: TeacherDiaryEntry[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEntries: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface DiaryStats {
  totalEntries: number;
  entriesByType: Array<{ type: DiaryEntryType; count: number }>;
  entriesByPriority: Array<{ priority: DiaryPriority; count: number }>;
  recentEntries: TeacherDiaryEntry[];
}

export interface ClassSection {
  className: string;
  sections: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Error type
interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
  message: string;
}

// API Functions

/**
 * Get teacher diary entries (for teachers - their own entries)
 */
export const getTeacherDiaryEntries = async (params?: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  className?: string;
  section?: string;
  subject?: string;
  entryType?: DiaryEntryType;
  priority?: DiaryPriority;
}): Promise<DiaryEntriesResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await axiosInstance.get(`/teacher/entries?${queryParams.toString()}`);
    return response.data.data;
  } catch (error) {
    const err = error as ErrorResponse;
    console.error('Error fetching teacher diary entries:', err);
    throw new Error(err.response?.data?.message || err.message || 'Failed to fetch diary entries');
  }
};

/**
 * Get diary entries for viewing (students, parents, school admin)
 */
export const getDiaryEntriesForView = async (params?: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  className?: string;
  section?: string;
  subject?: string;
  teacherId?: number;
}): Promise<DiaryEntriesResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await axiosInstance.get(`/view?${queryParams.toString()}`);
    return response.data.data;
  } catch (error) {
    const err = error as ErrorResponse;
    console.error('Error fetching diary entries for view:', err);
    throw new Error(err.response?.data?.message || err.message || 'Failed to fetch diary entries');
  }
};

/**
 * Create a new diary entry
 */
export const createDiaryEntry = async (data: CreateDiaryEntryData): Promise<TeacherDiaryEntry> => {
  try {
    const response = await axiosInstance.post('/create', data);
    return response.data.data.entry;
  } catch (error) {
    const err = error as ErrorResponse;
    console.error('Error creating diary entry:', err);
    throw new Error(err.response?.data?.message || err.message || 'Failed to create diary entry');
  }
};

/**
 * Update a diary entry
 */
export const updateDiaryEntry = async (id: number, data: UpdateDiaryEntryData): Promise<TeacherDiaryEntry> => {
  try {
    const response = await axiosInstance.put(`/update/${id}`, data);
    return response.data.data.entry;
  } catch (error) {
    const err = error as ErrorResponse;
    console.error('Error updating diary entry:', err);
    throw new Error(err.response?.data?.message || err.message || 'Failed to update diary entry');
  }
};

/**
 * Delete a diary entry
 */
export const deleteDiaryEntry = async (id: number): Promise<boolean> => {
  try {
    await axiosInstance.delete(`/delete/${id}`);
    return true;
  } catch (error) {
    const err = error as ErrorResponse;
    console.error('Error deleting diary entry:', err);
    throw new Error(err.response?.data?.message || err.message || 'Failed to delete diary entry');
  }
};

/**
 * Get a single diary entry by ID
 */
export const getDiaryEntryById = async (id: number): Promise<TeacherDiaryEntry> => {
  try {
    const response = await axiosInstance.get(`/entry/${id}`);
    return response.data.data.entry;
  } catch (error) {
    const err = error as ErrorResponse;
    console.error('Error fetching diary entry:', err);
    throw new Error(err.response?.data?.message || err.message || 'Failed to fetch diary entry');
  }
};

/**
 * Get diary statistics
 */
export const getDiaryStats = async (params?: {
  startDate?: string;
  endDate?: string;
  teacherId?: number;
}): Promise<DiaryStats> => {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await axiosInstance.get(`/stats?${queryParams.toString()}`);
    return response.data.data;
  } catch (error) {
    const err = error as ErrorResponse;
    console.error('Error fetching diary statistics:', err);
    throw new Error(err.response?.data?.message || err.message || 'Failed to fetch diary statistics');
  }
};

/**
 * Get available classes and sections
 */
export const getClassesAndSections = async (): Promise<ClassSection[]> => {
  try {
    const response = await axiosInstance.get('/classes');
    return response.data.data.classes;
  } catch (error) {
    const err = error as ErrorResponse;
    console.error('Error fetching classes and sections:', err);
    throw new Error(err.response?.data?.message || err.message || 'Failed to fetch classes and sections');
  }
};

/**
 * Health check for the API
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await axiosInstance.get('/health');
    return response.data.success;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

// Utility Functions

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date for input fields
 */
export const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

/**
 * Get priority color for display
 */
export const getPriorityColor = (priority: DiaryPriority): string => {
  switch (priority) {
    case 'LOW':
      return 'text-green-600 bg-green-100';
    case 'NORMAL':
      return 'text-blue-600 bg-blue-100';
    case 'HIGH':
      return 'text-orange-600 bg-orange-100';
    case 'URGENT':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

/**
 * Get entry type color for display
 */
export const getEntryTypeColor = (entryType: DiaryEntryType): string => {
  switch (entryType) {
    case 'GENERAL':
      return 'text-gray-600 bg-gray-100';
    case 'HOMEWORK':
      return 'text-blue-600 bg-blue-100';
    case 'ANNOUNCEMENT':
      return 'text-purple-600 bg-purple-100';
    case 'ASSESSMENT':
      return 'text-indigo-600 bg-indigo-100';
    case 'EVENT':
      return 'text-green-600 bg-green-100';
    case 'NOTICE':
      return 'text-yellow-600 bg-yellow-100';
    case 'REMINDER':
      return 'text-red-600 bg-red-100';
    case 'ASSIGNMENT':
      return 'text-pink-600 bg-pink-100';
    case 'TEACHING_MATERIAL':
      return 'text-teal-600 bg-teal-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

/**
 * Validate diary entry data
 */
export const validateDiaryEntry = (data: CreateDiaryEntryData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push('Title is required');
  }

  if (!data.content?.trim()) {
    errors.push('Content is required');
  }

  if (!data.date) {
    errors.push('Date is required');
  }

  if (!data.className?.trim()) {
    errors.push('Class name is required');
  }

  if (!data.section?.trim()) {
    errors.push('Section is required');
  }

  if (!data.subject?.trim()) {
    errors.push('Subject is required');
  }

  // Validate date format
  if (data.date && isNaN(new Date(data.date).getTime())) {
    errors.push('Invalid date format');
  }

  // Validate title length
  if (data.title && data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  // Validate content length
  if (data.content && data.content.length > 5000) {
    errors.push('Content must be less than 5000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get user role from localStorage
 */
export const getUserRole = (): string | null => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.role || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

/**
 * Check if user can create/edit diary entries
 */
export const canCreateDiary = (): boolean => {
  const role = getUserRole();
  return role === 'TEACHER';
};

/**
 * Check if user can view diary entries
 */
export const canViewDiary = (): boolean => {
  const role = getUserRole();
  return ['TEACHER', 'STUDENT', 'PARENT', 'SCHOOL'].includes(role || '');
};

export default {
  getTeacherDiaryEntries,
  getDiaryEntriesForView,
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
  getDiaryEntryById,
  getDiaryStats,
  getClassesAndSections,
  healthCheck,
  formatDate,
  formatDateForInput,
  getPriorityColor,
  getEntryTypeColor,
  validateDiaryEntry,
  getUserRole,
  canCreateDiary,
  canViewDiary,
}; 