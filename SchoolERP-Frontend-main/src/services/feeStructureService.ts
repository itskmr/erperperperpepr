import { ClassFeeStructure, FeeCategory } from '../types/FeeStructureTypes';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configure axios defaults
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Get all fee structures
export const getFeeStructures = async (schoolId?: number): Promise<ClassFeeStructure[]> => {
  try {
    const queryParam = schoolId ? `?schoolId=${schoolId}` : '';
    const response = await axiosInstance.get(`/fee-structures${queryParam}`);
    return response.data;
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
    const response = await axiosInstance.get(`/fee-structures/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching fee structure ${id}:`, error);
    throw error;
  }
};

// Create fee structure
export const createFeeStructure = async (feeStructure: Partial<ClassFeeStructure>): Promise<ClassFeeStructure> => {
  try {
    const response = await axiosInstance.post('/fee-structures', {
      ...feeStructure,
      schoolId: 1
    });
    return response.data;
  } catch (error) {
    console.error('Error creating fee structure:', error);
    throw error;
  }
};

// Update fee structure
export const updateFeeStructure = async (id: string, feeStructure: Partial<ClassFeeStructure>): Promise<ClassFeeStructure> => {
  try {
    const response = await axiosInstance.put(`/fee-structures/${id}`, {
      ...feeStructure,
      schoolId: feeStructure.schoolId || 1
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating fee structure ${id}:`, error);
    throw error;
  }
};

// Delete fee structure
export const deleteFeeStructure = async (id: string): Promise<boolean> => {
  try {
    await axiosInstance.delete(`/fee-structures/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting fee structure ${id}:`, error);
    throw error;
  }
};

// Get all fee categories
export const getFeeCategories = async (): Promise<string[]> => {
  try {
    const response = await axiosInstance.get('/fee-categories');
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      return await getFallbackCategories();
    }
  } catch (error) {
    return await getFallbackCategories();
  }
};

// Fallback method to get categories
const getFallbackCategories = async (): Promise<string[]> => {
  try {
    const response = await axiosInstance.get('/fee-categories/check');
    if (response.data.available_categories && Array.isArray(response.data.available_categories)) {
      return response.data.available_categories;
    } else {
      throw new Error("Invalid data from fallback endpoint");
    }
  } catch (error) {
    throw error;
  }
}; 