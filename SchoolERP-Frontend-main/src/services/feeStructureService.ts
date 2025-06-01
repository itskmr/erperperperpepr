import { ClassFeeStructure } from '../types/FeeStructureTypes';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with authentication
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Get all fee structures
export const getFeeStructures = async (schoolId?: number): Promise<ClassFeeStructure[]> => {
  try {
    const queryParam = schoolId ? `?schoolId=${schoolId}` : '';
    const response = await axiosInstance.get(`/fee-structure${queryParam}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching fee structures:', error);
    throw error;
  }
};

// Get fee structure by class name
export const getFeeStructureByClassName = async (className: string): Promise<ClassFeeStructure | null> => {
  try {
    const allStructures = await getFeeStructures();
    const matchingStructure = allStructures.find(
      structure => structure.className === className
    );
    return matchingStructure || null;
  } catch (error) {
    console.error(`Error fetching fee structure for class ${className}:`, error);
    throw error;
  }
};

// Get fee structure by ID
export const getFeeStructureById = async (id: string): Promise<ClassFeeStructure> => {
  try {
    const response = await axiosInstance.get(`/fee-structure/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching fee structure ${id}:`, error);
    throw error;
  }
};

// Create fee structure
export const createFeeStructure = async (feeStructure: Partial<ClassFeeStructure>): Promise<ClassFeeStructure> => {
  try {
    const response = await axiosInstance.post('/fee-structure', {
      ...feeStructure,
      schoolId: 1
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating fee structure:', error);
    throw error;
  }
};

// Update fee structure
export const updateFeeStructure = async (id: string, feeStructure: Partial<ClassFeeStructure>): Promise<ClassFeeStructure> => {
  try {
    const response = await axiosInstance.put(`/fee-structure/${id}`, {
      ...feeStructure,
      schoolId: feeStructure.schoolId || 1
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error updating fee structure ${id}:`, error);
    throw error;
  }
};

// Delete fee structure
export const deleteFeeStructure = async (id: string): Promise<boolean> => {
  try {
    await axiosInstance.delete(`/fee-structure/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting fee structure ${id}:`, error);
    throw error;
  }
};

// Get all fee categories
export const getFeeCategories = async (): Promise<string[]> => {
  try {
    const response = await axiosInstance.get('/fee-structure/categories/all');
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      return getFallbackCategories();
    }
  } catch {
    return getFallbackCategories();
  }
};

// Fallback method to get categories
const getFallbackCategories = (): string[] => {
  // Use default categories if API fails
  const defaultCategories = [
    'Registration Fee',
    'Admission Fee',
    'Tuition Fee',
    'Monthly Fee',
    'Annual Charges',
    'Development Fund',
    'Computer Lab Fee',
    'Transport Fee',
    'Library Fee',
    'Laboratory Fee',
    'Sports Fee',
    'Readmission Charge',
    'PTA Fee',
    'Smart Class Fee',
    'Security and Safety Fee',
    'Activities Fee',
    'Examination Fee',
    'Maintenance Fee'
  ];
  return defaultCategories;
}; 