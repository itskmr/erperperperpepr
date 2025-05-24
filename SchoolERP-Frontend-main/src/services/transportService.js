import axios from 'axios';

// Use a default URL if the environment variable is not defined
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with better error handling
const apiClient = axios.create({
  baseURL: `${API_URL}/transport`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request configuration error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls with improved error handling
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Check if error.response exists before accessing its properties
    if (error.response) {
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          // Call your refresh token endpoint here if needed
          // const refreshToken = localStorage.getItem('refreshToken');
          // const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
          // localStorage.setItem('token', response.data.token);
          // originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
          // return apiClient(originalRequest);
        } catch (err) {
          // Logout user if refresh token is invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else if (error.response.status === 500) {
        console.error('Server error:', error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error - no response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Wrapper for API calls with fallback error handling
const safeApiCall = async (apiFunction) => {
  try {
    return await apiFunction();
  } catch (error) {
    console.error('API call failed:', error);
    // Return a safe default response
    return { 
      success: false, 
      data: [], 
      error: error.message || 'An error occurred' 
    };
  }
};

// Driver API endpoints
const driverAPI = {
  // Get all drivers
  getAllDrivers: async () => {
    try {
      const response = await apiClient.get('/drivers');
      return response.data;
    } catch (error) {
      console.error('Error fetching drivers:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  // Get driver by ID
  getDriverById: async (id) => {
    try {
      const response = await apiClient.get(`/drivers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching driver ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Create new driver
  createDriver: async (driverData) => {
    try {
      const response = await apiClient.post('/drivers', driverData);
      return response.data;
    } catch (error) {
      console.error('Error creating driver:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Update driver
  updateDriver: async (id, driverData) => {
    try {
      const response = await apiClient.put(`/drivers/${id}`, driverData);
      return response.data;
    } catch (error) {
      console.error(`Error updating driver ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Delete driver
  deleteDriver: async (id) => {
    try {
      const response = await apiClient.delete(`/drivers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting driver ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }
  }
};

// Bus API endpoints
const busAPI = {
  // Get all buses
  getAllBuses: async () => {
    try {
      const response = await apiClient.get('/buses');
      return response.data;
    } catch (error) {
      console.error('Error fetching buses:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  // Get bus by ID
  getBusById: async (id) => {
    try {
      const response = await apiClient.get(`/buses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bus ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Create new bus
  createBus: async (busData) => {
    try {
      const response = await apiClient.post('/buses', busData);
      return response.data;
    } catch (error) {
      console.error('Error creating bus:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Update bus
  updateBus: async (id, busData) => {
    try {
      const response = await apiClient.put(`/buses/${id}`, busData);
      return response.data;
    } catch (error) {
      console.error(`Error updating bus ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Delete bus
  deleteBus: async (id) => {
    try {
      const response = await apiClient.delete(`/buses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting bus ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }
  }
};

// Route API endpoints
const routeAPI = {
  // Get all routes
  getAllRoutes: async () => {
    try {
      const response = await apiClient.get('/routes');
      return response.data;
    } catch (error) {
      console.error('Error fetching routes:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  // Get route by ID
  getRouteById: async (id) => {
    try {
      const response = await apiClient.get(`/routes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching route ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Create new route
  createRoute: async (routeData) => {
    try {
      const response = await apiClient.post('/routes', routeData);
      return response.data;
    } catch (error) {
      console.error('Error creating route:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Update route
  updateRoute: async (id, routeData) => {
    try {
      const response = await apiClient.put(`/routes/${id}`, routeData);
      return response.data;
    } catch (error) {
      console.error(`Error updating route ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Delete route
  deleteRoute: async (id) => {
    try {
      const response = await apiClient.delete(`/routes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting route ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }
  }
};

// Trip API endpoints
const tripAPI = {
  // Get all trips
  getAllTrips: async () => {
    try {
      const response = await apiClient.get('/trips');
      return response.data;
    } catch (error) {
      console.error('Error fetching trips:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  // Get trip by ID
  getTripById: async (id) => {
    try {
      const response = await apiClient.get(`/trips/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching trip ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Create new trip
  createTrip: async (tripData) => {
    try {
      const response = await apiClient.post('/trips', tripData);
      return response.data;
    } catch (error) {
      console.error('Error creating trip:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Update trip
  updateTrip: async (id, tripData) => {
    try {
      const response = await apiClient.put(`/trips/${id}`, tripData);
      return response.data;
    } catch (error) {
      console.error(`Error updating trip ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Delete trip
  deleteTrip: async (id) => {
    try {
      const response = await apiClient.delete(`/trips/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting trip ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Update trip status
  updateTripStatus: async (id, statusData) => {
    try {
      const response = await apiClient.patch(`/trips/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error(`Error updating trip status ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }
  }
};

// Maintenance API endpoints
const maintenanceAPI = {
  // Get all maintenance records
  getAllMaintenance: async () => {
    try {
      const response = await apiClient.get('/maintenance');
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  // Get maintenance record by ID
  getMaintenanceById: async (id) => {
    try {
      const response = await apiClient.get(`/maintenance/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching maintenance record ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Create new maintenance record
  createMaintenance: async (maintenanceData) => {
    try {
      const response = await apiClient.post('/maintenance', maintenanceData);
      return response.data;
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Update maintenance record
  updateMaintenance: async (id, maintenanceData) => {
    try {
      const response = await apiClient.put(`/maintenance/${id}`, maintenanceData);
      return response.data;
    } catch (error) {
      console.error(`Error updating maintenance record ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Delete maintenance record
  deleteMaintenance: async (id) => {
    try {
      const response = await apiClient.delete(`/maintenance/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting maintenance record ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }
  }
};

// Student Transport API endpoints
const studentTransportAPI = {
  // Get all student transport records
  getAllStudentTransport: async () => {
    try {
      const response = await apiClient.get('/student-transport');
      return response.data;
    } catch (error) {
      console.error('Error fetching student transport records:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  // Get students by route
  getStudentsByRoute: async (routeId) => {
    try {
      const response = await apiClient.get(`/student-transport/route/${routeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching students for route ${routeId}:`, error);
      return { success: false, data: [], error: error.message };
    }
  },

  // Assign student to route
  assignStudentToRoute: async (assignmentData) => {
    try {
      const response = await apiClient.post('/student-transport', assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error assigning student to route:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Update student transport record
  updateStudentTransport: async (id, transportData) => {
    try {
      const response = await apiClient.put(`/student-transport/${id}`, transportData);
      return response.data;
    } catch (error) {
      console.error(`Error updating student transport record ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Remove student from route
  removeStudentFromRoute: async (id) => {
    try {
      const response = await apiClient.delete(`/student-transport/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing student from route ${id}:`, error);
      return { success: false, data: null, error: error.message };
    }
  }
};

// Export all API services
export default {
  driver: driverAPI,
  bus: busAPI,
  route: routeAPI,
  trip: tripAPI,
  maintenance: maintenanceAPI,
  studentTransport: studentTransportAPI
}; 