import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Dashboard API types
export interface DashboardStats {
  school: {
    id: number;
    name: string;
    address: string;
    contact: string;
    email: string;
  };
  overview: {
    totalStudents: number;
    totalTeachers: number;
    totalVehicles: number;
    totalDrivers: number;
    totalRoutes: number;
    activeStudents: number;
    activeTeachers: number;
  };
  financial: {
    totalFeesCollected: number;
    totalFeesPending: number;
    totalFeesAmount: number;
    totalExpenses: number;
    netIncome: number;
  };
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    icon: string;
  }>;
  monthlyFeeData: Array<{
    month: string;
    collected: number;
    count: number;
  }>;
}

export interface FeeAnalytics {
  monthlyTrends: Array<{
    month: string;
    collected: number;
    pending: number;
  }>;
  classWiseDistribution: Array<{
    name: string;
    value: number;
    count: number;
  }>;
  feeStructureBreakdown: Array<{
    name: string;
    value: number;
    usage: number;
  }>;
}

export interface QuickAccessData {
  pendingAdmissions: number;
  pendingFees: number;
  todayAttendance: number;
  pendingTCs: number;
  shortcuts: Array<{
    name: string;
    route: string;
    icon: string;
    count: number | null;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp?: string;
}

// Dashboard service functions
export const dashboardService = {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  },

  /**
   * Get fee analytics data for charts
   */
  async getFeeAnalytics(timeframe: '6months' | '12months' = '12months'): Promise<FeeAnalytics> {
    try {
      const response = await api.get<ApiResponse<FeeAnalytics>>('/dashboard/fee-analytics', {
        params: { timeframe }
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching fee analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch fee analytics');
    }
  },

  /**
   * Get quick access data for shortcuts
   */
  async getQuickAccessData(): Promise<QuickAccessData> {
    try {
      const response = await api.get<ApiResponse<QuickAccessData>>('/dashboard/quick-access');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching quick access data:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch quick access data');
    }
  },
};

// Utility functions
export const formatCurrency = (amount: number): string => {
  if (amount >= 10000000) { // 1 crore
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) { // 1 lakh
    return `₹${(amount / 100000).toFixed(2)} L`;
  } else if (amount >= 1000) { // 1 thousand
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

export default dashboardService; 