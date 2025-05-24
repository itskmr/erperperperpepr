export interface Teacher {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    designation: string;
    subjects: string[];
    classes?: string;
    sections: {
      class: string;
      sections: string[];
    }[];
    joinDate: string;
    address: string;
    education: string;
    experience: string;
    profileImage: string;
    isClassIncharge: boolean;
    inchargeClass: string | null;
    inchargeSection: string | null;
    status: string;
    schoolId: number;
    username: string;
    password?: string;
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