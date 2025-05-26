export interface Teacher {
  id?: number;
  fullName: string;
  email: string;
  password?: string;
  username?: string;
  phone: string;
  gender: string;
  dateOfBirth?: string;
  age?: number;
  
  // Professional details
  designation?: string;
  qualification?: string;
  address?: string;
  joining_year?: string;
  experience?: string;
  profileImage?: string;
  
  // Teaching details
  subjects?: string[];
  sections?: Array<{
    class: string;
    sections: string[];
  }>;
  
  // Class incharge details
  isClassIncharge?: boolean;
  inchargeClass?: string;
  inchargeSection?: string;
  
  // Additional details
  religion?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  
  // Social media links
  facebook?: string;
  twitter?: string;
  linkedIn?: string;
  
  // Documents
  documents?: string[];
  
  // Salary and bank details
  joiningSalary?: number;
  accountHolderName?: string;
  accountNumber?: string;
  bankName?: string;
  bankBranch?: string;
  
  // Status fields
  status?: 'active' | 'inactive';
  schoolId?: number;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface School {
  id: number;
  name: string;
  address: string;
  contactNumber: string;
  email: string;
  principalName: string;
}

export interface TeacherPagination {
  currentPage: number;
  totalPages: number;
  totalTeachers: number;
  itemsPerPage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}