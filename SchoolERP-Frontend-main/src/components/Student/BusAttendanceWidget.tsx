import React, { useState, useEffect } from 'react';
import {
  Bus,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

// Types
interface BusAttendanceRecord {
  id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  reason?: string;
  pickupTime?: string;
  dropoffTime?: string;
  busInfo: {
    registrationNumber: string;
    driverName?: string;
    routeName?: string;
  };
}

interface BusAttendanceStats {
  thisMonth: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendancePercentage: number;
  };
  recentRecords: BusAttendanceRecord[];
  studentBusInfo: {
    busId: string;
    busNumber: string;
    pickupPoint: string;
    routeName: string;
    driverName: string;
  } | null;
}

interface BusAttendanceWidgetProps {
  studentId?: string;
  showHistory?: boolean;
  compact?: boolean;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  busInfo?: {
    registrationNumber: string;
    make: string;
    model: string;
  };
  pickupTime?: string;
  pickupPoint?: string;
}

interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: string;
}

const BusAttendanceWidget: React.FC<BusAttendanceWidgetProps> = ({
  studentId,
  showHistory = true,
  compact = false
}) => {
  const [todayStatus, setTodayStatus] = useState<string>('NOT_MARKED');
  const [monthlyStats, setMonthlyStats] = useState<AttendanceStats | null>(null);
  const [recentHistory, setRecentHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  // API helper function
  const apiCall = async (endpoint: string) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return await response.json();
  };

  // Fetch bus attendance data
  const fetchBusAttendanceData = async () => {
    try {
      setLoading(true);
      
      if (!studentId) {
        // Try to get student ID from auth context
        const userData = localStorage.getItem('userData');
        if (!userData) {
          setError('Student information not found');
          return;
        }
        
        const user = JSON.parse(userData);
        const actualStudentId = user.id || user.studentId;
        
        if (!actualStudentId) {
          setError('Student ID not found');
          return;
        }

        // Fetch student bus attendance history
        const response = await apiCall(`/api/transport/students/${actualStudentId}/bus-attendance?limit=10`);
        
        if (response.success && response.data) {
          const { attendanceHistory, attendanceStats } = response.data;
          
          // Set monthly stats
          setMonthlyStats(attendanceStats);
          
          // Set recent history
          setRecentHistory(attendanceHistory.slice(0, 5));
          
          // Check today's status
          const today = new Date().toISOString().split('T')[0];
          const todayRecord = attendanceHistory.find((record: AttendanceRecord) => 
            record.date.split('T')[0] === today
          );
          setTodayStatus(todayRecord?.status || 'NOT_MARKED');
        }
      }
    } catch (error) {
      console.error('Error fetching bus attendance data:', error);
      setError('Failed to load bus attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'text-green-600 bg-green-100';
      case 'ABSENT': return 'text-red-600 bg-red-100';
      case 'LATE': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT': return <CheckCircle className="h-4 w-4" />;
      case 'ABSENT': return <XCircle className="h-4 w-4" />;
      case 'LATE': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Get today's attendance record
  const getTodayRecord = () => {
    if (!recentHistory) return null;
    const today = new Date().toISOString().split('T')[0];
    return recentHistory.find(record => 
      record.date.split('T')[0] === today
    );
  };

  // Initialize data
  useEffect(() => {
    fetchBusAttendanceData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="bg-gray-300 rounded-lg p-3 mr-3">
              <div className="h-6 w-6 bg-gray-400 rounded"></div>
            </div>
            <div className="h-6 w-32 bg-gray-300 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-300 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-3 rounded-lg mr-3">
            <Bus className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Bus Attendance</h3>
        </div>
        <div className="text-center py-4">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const todayRecord = getTodayRecord();

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg mr-3">
            <Bus className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Bus Attendance</h3>
            <p className="text-sm text-gray-600">Your transport attendance overview</p>
          </div>
        </div>
      </div>

      {/* Today's Status */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">Today's Status</h4>
        <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(todayStatus)}`}>
          {getStatusIcon(todayStatus)}
          <span className="ml-2">{todayStatus.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Monthly Statistics */}
      {monthlyStats && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">This Month</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{monthlyStats.presentDays}</div>
              <div className="text-xs text-green-800">Present</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{monthlyStats.absentDays}</div>
              <div className="text-xs text-red-800">Absent</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{monthlyStats.lateDays}</div>
              <div className="text-xs text-yellow-800">Late</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{monthlyStats.attendancePercentage}</div>
              <div className="text-xs text-blue-800">Overall</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent History */}
      {showHistory && recentHistory.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Recent History
          </h4>
          <div className="space-y-2">
            {recentHistory.map((record, index) => (
              <div key={record.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`p-1.5 rounded-full mr-3 ${getStatusColor(record.status)}`}>
                    {getStatusIcon(record.status)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(record.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    {record.pickupTime && (
                      <div className="text-xs text-gray-500">
                        Pickup: {new Date(record.pickupTime).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance Trend */}
      {monthlyStats && parseFloat(monthlyStats.attendancePercentage) > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className={`h-4 w-4 mr-2 ${
                parseFloat(monthlyStats.attendancePercentage) >= 85 ? 'text-green-600' : 
                parseFloat(monthlyStats.attendancePercentage) >= 75 ? 'text-yellow-600' : 'text-red-600'
              }`} />
              <span className="text-sm text-gray-600">Attendance Trend</span>
            </div>
            <span className={`text-sm font-medium ${
              parseFloat(monthlyStats.attendancePercentage) >= 85 ? 'text-green-600' : 
              parseFloat(monthlyStats.attendancePercentage) >= 75 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {parseFloat(monthlyStats.attendancePercentage) >= 85 ? 'Excellent' : 
               parseFloat(monthlyStats.attendancePercentage) >= 75 ? 'Good' : 'Needs Improvement'}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BusAttendanceWidget; 