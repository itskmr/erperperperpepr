import { ADMIN_API, handleApiResponse } from '@/config/api';

export interface UserData {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  lastLogin: string;
  createdAt: string;
  userType: string;
}

export interface UserFormData {
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  confirmPassword: string;
}

export const adminService = {
  // Fetch all users
  fetchUsers: async (page: number = 1, limit: number = 10) => {
    try {
      const response = await fetch(`${ADMIN_API.GET_ALL_USERS}?page=${page}&limit=${limit}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Create a new user
  createUser: async (userData: UserFormData) => {
    const response = await fetch(ADMIN_API.ADD_USER, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    return await handleApiResponse(response);
  },

  // Update a user
  updateUser: async (id: number, userData: Partial<UserFormData>, userType: string) => {
    const response = await fetch(ADMIN_API.UPDATE_USER(id), {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...userData, userType }),
    });
    
    return await handleApiResponse(response);
  },

  // Delete a user
  deleteUser: async (id: number, userType: string) => {
    const response = await fetch(ADMIN_API.DELETE_USER(id), {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userType }),
    });
    
    return await handleApiResponse(response);
  },

  // Update user status
  updateUserStatus: async (id: number, status: string, userType: string) => {
    const response = await fetch(`${ADMIN_API.UPDATE_USER(id)}/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, userType }),
    });
    
    return await handleApiResponse(response);
  }
}; 