import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { StudentFormData } from '../components/StudentForm/StudentFormTypes';
import { STUDENT_API } from '../config/api';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface StudentListResponse {
  success: boolean;
  data: StudentFormData[];
  pagination: Pagination;
}

interface StudentDetailResponse {
  success: boolean;
  data: StudentFormData;
}

interface UseStudentManagementReturn {
  students: StudentFormData[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  deleteStudent: (id: string) => Promise<void>;
  fetchStudents: (page?: number, limit?: number) => Promise<void>;
  fetchStudentIds: () => Promise<string[]>;
  refreshStudents: () => Promise<void>;
  fetchStudentById: (id: string) => Promise<StudentFormData | null>;
  updateStudent: (id: string, data: Partial<StudentFormData>) => Promise<StudentFormData | null>;
}

export const useStudentManagement = (schoolId = '1'): UseStudentManagementReturn => {
  const [students, setStudents] = useState<StudentFormData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchStudents = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<StudentListResponse>(
        `${STUDENT_API.GET_ALL}?page=${page}&limit=${limit}&schoolId=${schoolId}`
      );
      
      if (response.data.success) {
        // Explicitly log student IDs for debugging
        const receivedStudents = response.data.data;
        console.log('Students received from API:', receivedStudents);
        console.log('Student IDs received:', receivedStudents.map(s => ({ studentId: s.studentId, id: s.id })));
        
        // Ensure each student has a studentId - if not available, use database id as fallback
        const processedStudents = receivedStudents.map(student => ({
          ...student,
          studentId: student.studentId || String(student.id || '') || `STD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        }));
        
        setStudents(processedStudents);
        setPagination(response.data.pagination);
      } else {
        throw new Error('Failed to fetch students');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching students');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  // New function to get only student IDs (can be useful for debugging)
  const fetchStudentIds = useCallback(async (): Promise<string[]> => {
    try {
      const response = await axios.get<StudentListResponse>(
        `${STUDENT_API.GET_ALL}?page=1&limit=1000&schoolId=${schoolId}`
      );
      
      if (response.data.success) {
        const studentIds = response.data.data.map(student => student.studentId || '').filter(Boolean);
        console.log('All student IDs:', studentIds);
        return studentIds;
      }
      return [];
    } catch (error) {
      console.error('Error fetching student IDs:', error);
      return [];
    }
  }, [schoolId]);

  const refreshStudents = useCallback(() => {
    return fetchStudents(pagination.page, pagination.limit);
  }, [fetchStudents, pagination.page, pagination.limit]);

  // Fetch a student by ID
  const fetchStudentById = useCallback(async (id: string): Promise<StudentFormData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<StudentDetailResponse>(STUDENT_API.GET_BY_ID(id));
      
      if (response.data.success) {
        // Ensure student ID is available
        const student = response.data.data;
        console.log('Fetched student detail:', student);
        
        if (!student.studentId && student.id) {
          console.log('No studentId found, using id as fallback');
          student.studentId = String(student.id);
        }
        
        return student;
      } else {
        throw new Error('Failed to fetch student details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching student details');
      console.error('Error fetching student details:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a student
  const updateStudent = useCallback(async (id: string, data: Partial<StudentFormData>): Promise<StudentFormData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put<StudentDetailResponse>(
        STUDENT_API.UPDATE(id),
        data
      );
      
      if (response.data.success) {
        // After successful update, refresh the student list
        await refreshStudents();
        return response.data.data;
      } else {
        throw new Error('Failed to update student');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the student');
      console.error('Error updating student:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [refreshStudents]);

  const deleteStudent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.delete(STUDENT_API.DELETE(id));
      
      if (response.data.success) {
        // After successful deletion, refresh the student list
        await refreshStudents();
        return;
      } else {
        throw new Error('Failed to delete student');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the student');
      console.error('Error deleting student:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshStudents]);

  // Initial fetch
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    pagination,
    deleteStudent,
    fetchStudents,
    fetchStudentIds,
    refreshStudents,
    fetchStudentById,
    updateStudent
  };
}; 