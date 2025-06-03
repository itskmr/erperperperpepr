import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('role');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// TypeScript interfaces
export interface SchoolProfileData {
  id: number;
  schoolName: string;
  email: string;
  code: string;
  address: string;
  contact: string;
  phone: string;
  principal: string;
  image_url?: string;
  established: number;
  affiliate?: string;
  affiliateNo?: string;
  website?: string;
  status: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  statistics: {
    totalStudents: number;
    totalTeachers: number;
    totalBuses: number;
    totalRoutes: number;
  };
}

export interface UpdateSchoolProfileData {
  schoolName: string;
  email: string;
  address?: string;
  contact?: string;
  phone?: string;
  principal?: string;
  image_url?: string;
  established?: number;
  affiliate?: string;
  affiliateNo?: string;
  website?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiError {
  success: boolean;
  message: string;
  error?: string;
}

export interface ImageUploadResponse {
  id: number;
  schoolName: string;
  image_url: string;
  imageUrl: string;
}

class SchoolProfileService {
  /**
   * Get school profile information
   */
  async getSchoolProfile(): Promise<SchoolProfileData> {
    try {
      const response = await apiClient.get<ApiResponse<SchoolProfileData>>('/school/profile');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch school profile');
      }
      
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = this.extractErrorMessage(error) || 'Failed to fetch school profile';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update school profile information
   */
  async updateSchoolProfile(profileData: UpdateSchoolProfileData): Promise<SchoolProfileData> {
    try {
      const response = await apiClient.put<ApiResponse<SchoolProfileData>>('/school/profile', profileData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update school profile');
      }
      
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = this.extractErrorMessage(error) || 'Failed to update school profile';
      throw new Error(errorMessage);
    }
  }

  /**
   * Upload school logo/image file
   */
  async uploadSchoolImage(imageFile: File): Promise<ImageUploadResponse> {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(imageFile.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, and GIF images are allowed.');
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (imageFile.size > maxSize) {
        throw new Error('File too large. Maximum size allowed is 5MB.');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', imageFile);

      // Create special axios config for file upload
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await apiClient.post<ApiResponse<ImageUploadResponse>>('/school/profile/image', formData, config);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to upload school image');
      }
      
      return response.data.data;
    } catch (error: unknown) {
      const errorMessage = this.extractErrorMessage(error) || 'Failed to upload school image';
      throw new Error(errorMessage);
    }
  }

  /**
   * Extract error message from various error types
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'object' && error !== null) {
      const err = error as any;
      return err.response?.data?.message || err.message || 'An unknown error occurred';
    }
    return 'An unknown error occurred';
  }

  /**
   * Validate school profile data before submission
   */
  validateProfileData(data: UpdateSchoolProfileData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!data.schoolName?.trim()) {
      errors.push('School name is required');
    }

    if (!data.email?.trim()) {
      errors.push('Email is required');
    } else {
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Please provide a valid email address');
      }
    }

    // Phone number validation
    if (data.phone && !/^\d{10,15}$/.test(data.phone.replace(/\D/g, ''))) {
      errors.push('Phone number must be 10-15 digits');
    }

    // Contact number validation
    if (data.contact && !/^\d{10,15}$/.test(data.contact.replace(/\D/g, ''))) {
      errors.push('Contact number must be 10-15 digits');
    }

    // Website URL validation
    if (data.website && data.website.trim()) {
      const urlRegex = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlRegex.test(data.website)) {
        errors.push('Please provide a valid website URL');
      }
    }

    // Establishment year validation
    if (data.established) {
      const currentYear = new Date().getFullYear();
      if (data.established < 1800 || data.established > currentYear) {
        errors.push(`Establishment year must be between 1800 and ${currentYear}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate image file before upload
   */
  validateImageFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Invalid file type. Only JPEG, PNG, and GIF images are allowed.');
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      errors.push('File too large. Maximum size allowed is 5MB.');
    }

    // Check if file is empty
    if (file.size === 0) {
      errors.push('File is empty. Please select a valid image file.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format establishment year for display
   */
  formatEstablishmentYear(year: number): string {
    return year.toString();
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for 10-digit numbers
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    // Return as-is for other lengths
    return phone;
  }

  /**
   * Format website URL for display
   */
  formatWebsiteUrl(url: string): string {
    if (!url) return '';
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    
    return url;
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get establishment years for dropdown (last 100 years)
   */
  getEstablishmentYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    
    for (let year = currentYear; year >= currentYear - 100; year--) {
      years.push(year);
    }
    
    return years;
  }

  /**
   * Get common school affiliations
   */
  getAffiliationOptions(): string[] {
    return [
      'CBSE',
      'ICSE',
      'CISCE',
      'State Board',
      'IB (International Baccalaureate)',
      'Cambridge International',
      'NIOS',
      'Other'
    ];
  }
}

// Export singleton instance
export const schoolProfileService = new SchoolProfileService();

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

export default schoolProfileService; 