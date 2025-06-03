import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, CheckCircle, XCircle, Clock, User, Book, Plus,
  Bell, Activity, GraduationCap, BarChart3, MessageSquare, FileText,
  Eye, UserCheck, BookOpen, TrendingUp, AlertCircle, RefreshCw,
  Home, ChevronRight, Target, Award, Mail, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// Types
interface TeacherInfo {
  id: number;
  fullName: string;
  email: string;
  designation?: string;
  schoolId: number;
  schoolName?: string;
}

interface TodayTimetableEntry {
  id: string;
  className: string;
  section: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  day: string;
}

interface TeacherAttendanceStats {
  thisMonth: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendancePercentage: string;
  };
  today: {
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'NOT_MARKED';
    checkInTime?: string;
    checkOutTime?: string;
  };
}

interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  className: string;
  section: string;
  subject: string;
  date: string;
  entryType: string;
  priority: string;
  isPublic: boolean;
}

interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  todayClasses: number;
  pendingAssignments: number;
}

const TeacherDashboard: React.FC = () => {
  // State
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);
  const [todayTimetable, setTodayTimetable] = useState<TodayTimetableEntry[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<TeacherAttendanceStats | null>(null);
  const [recentDiaryEntries, setRecentDiaryEntries] = useState<DiaryEntry[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get teacher info from authentication
  const getTeacherInfo = (): TeacherInfo | null => {
    try {
      const userData = localStorage.getItem('userData');
      const token = localStorage.getItem('token');
      
      if (userData) {
        const user = JSON.parse(userData);
        return {
          id: user.id,
          fullName: user.fullName || user.name || 'Teacher',
          email: user.email || '',
          designation: user.designation || 'Teacher',
          schoolId: user.schoolId || user.school_id,
          schoolName: user.schoolName || user.school_name
        };
      }
      
      // Try to get from JWT token
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          id: payload.id,
          fullName: payload.fullName || payload.name || 'Teacher',
          email: payload.email || '',
          designation: payload.designation || 'Teacher',
          schoolId: payload.schoolId || payload.school_id,
          schoolName: payload.schoolName || payload.school_name
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing teacher info:', error);
      return null;
    }
  };

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
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to access this resource.');
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    }

    return await response.json();
  };

  // Fetch today's timetable
  const fetchTodayTimetable = async () => {
    try {
      const teacher = teacherInfo;
      if (!teacher) return;

      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      const response = await apiCall(`/api/timetable?teacherId=${teacher.id}&day=${today}`);
      
      if (response.success && response.data) {
        setTodayTimetable(response.data);
      }
    } catch (error) {
      console.error('Error fetching today\'s timetable:', error);
    }
  };

  // Fetch teacher attendance stats
  const fetchAttendanceStats = async () => {
    try {
      const teacher = teacherInfo;
      if (!teacher) return;

      // Get current month attendance
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const response = await apiCall(
        `/api/teacher-attendance/reports?startDate=${startOfMonth.toISOString().split('T')[0]}&endDate=${endOfMonth.toISOString().split('T')[0]}&teacherId=${teacher.id}`
      );
      
      if (response.success && response.data?.teachers?.length > 0) {
        const teacherData = response.data.teachers[0];
        const stats = teacherData.attendanceStats;
        
        // Get today's attendance
        const todayResponse = await apiCall(`/api/teacher-attendance/date?date=${now.toISOString().split('T')[0]}`);
        let todayStatus = 'NOT_MARKED' as const;
        let checkInTime = undefined;
        let checkOutTime = undefined;
        
        if (todayResponse.success && todayResponse.data?.teachers) {
          const todayTeacher = todayResponse.data.teachers.find((t: any) => t.id === teacher.id);
          if (todayTeacher?.teacherAttendance?.length > 0) {
            const attendance = todayTeacher.teacherAttendance[0];
            todayStatus = attendance.status;
            checkInTime = attendance.checkInTime;
            checkOutTime = attendance.checkOutTime;
          }
        }

        setAttendanceStats({
          thisMonth: {
            totalDays: stats.totalWorkingDays || 0,
            presentDays: stats.presentDays || 0,
            absentDays: stats.absentDays || 0,
            lateDays: stats.lateDays || 0,
            attendancePercentage: stats.attendancePercentage || '0%'
          },
          today: {
            status: todayStatus,
            checkInTime,
            checkOutTime
          }
        });
      }
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  };

  // Fetch recent diary entries
  const fetchRecentDiaryEntries = async () => {
    try {
      const response = await apiCall('/api/teacher-diary/teacher/entries?limit=5&page=1');
      
      if (response.success && response.data?.entries) {
        setRecentDiaryEntries(response.data.entries);
      }
    } catch (error) {
      console.error('Error fetching recent diary entries:', error);
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const teacher = teacherInfo;
      if (!teacher) return;

      // Get students count from teacher's classes
      const studentsResponse = await apiCall('/api/students');
      const timetableResponse = await apiCall(`/api/timetable?teacherId=${teacher.id}`);
      
      let totalStudents = 0;
      let totalClasses = 0;
      let todayClasses = 0;
      
      if (studentsResponse.success && studentsResponse.data) {
        totalStudents = studentsResponse.data.length;
      }
      
      if (timetableResponse.success && timetableResponse.data) {
        totalClasses = timetableResponse.data.length;
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        todayClasses = timetableResponse.data.filter((entry: any) => entry.day === today).length;
      }

      setDashboardStats({
        totalStudents,
        totalClasses,
        todayClasses,
        pendingAssignments: 0 // This would come from assignments API
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Initialize dashboard
  const initializeDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const teacher = getTeacherInfo();
      if (!teacher) {
        setError('Teacher information not found. Please log in again.');
        return;
      }
      
      setTeacherInfo(teacher);
      
      // Fetch all data in parallel
      await Promise.all([
        fetchTodayTimetable(),
        fetchAttendanceStats(),
        fetchRecentDiaryEntries(),
        fetchDashboardStats()
      ]);
      
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Refresh dashboard
  const refreshDashboard = async () => {
    setIsRefreshing(true);
    await initializeDashboard();
      setIsRefreshing(false);
  };

  // Format time
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get current date info
  const getCurrentDateInfo = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  // Initialize on mount
  useEffect(() => {
    initializeDashboard();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading teacher dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <motion.div 
            className="bg-white rounded-xl shadow-md p-6 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
          <button
              onClick={initializeDashboard}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
          >
            Try Again
          </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const dateInfo = getCurrentDateInfo();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
          <motion.div
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl shadow-lg mb-6 overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Welcome back, {teacherInfo?.fullName || 'Teacher'}!
                  </h1>
                  <p className="text-emerald-100 text-lg">
                    {teacherInfo?.schoolName || 'School Dashboard'} • {teacherInfo?.designation || 'Teacher'}
                  </p>
                  <p className="text-emerald-200 text-sm">
                    {dateInfo.date} • {dateInfo.time}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={refreshDashboard}
                  disabled={isRefreshing}
                  className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-200 flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <motion.div 
            className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            >
                                      <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
                                        </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats?.totalStudents || 0}</p>
                                      </div>
                                    </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg shadow-md p-6"
            initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
                                      <div className="flex items-center">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Book className="h-6 w-6 text-emerald-600" />
                                        </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats?.totalClasses || 0}</p>
                </div>
              </div>
            </motion.div>
          
              <motion.div 
            className="bg-white rounded-lg shadow-md p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                        <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
                        </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Classes</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats?.todayClasses || 0}</p>
                        </div>
                </div>
              </motion.div>
              
              <motion.div 
            className="bg-white rounded-lg shadow-md p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${
                attendanceStats?.today.status === 'PRESENT' ? 'bg-green-100' :
                attendanceStats?.today.status === 'ABSENT' ? 'bg-red-100' :
                attendanceStats?.today.status === 'LATE' ? 'bg-yellow-100' : 'bg-gray-100'
              }`}>
                {attendanceStats?.today.status === 'PRESENT' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : attendanceStats?.today.status === 'ABSENT' ? (
                  <XCircle className="h-6 w-6 text-red-600" />
                ) : (
                  <Clock className="h-6 w-6 text-gray-600" />
                )}
                                </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Status</p>
                <p className="text-lg font-bold text-gray-900">
                  {attendanceStats?.today.status === 'NOT_MARKED' ? 'Not Marked' : 
                   attendanceStats?.today.status || 'Unknown'}
                </p>
                                </div>
                </div>
              </motion.div>
            </div>
          
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Today's Timetable & Attendance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Timetable */}
            <motion.div 
              className="bg-white rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 text-emerald-600 mr-2" />
                    Today's Timetable
                  </h2>
                  <Link 
                    to="/teacher/timetable"
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
                  >
                    View Full Timetable
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {todayTimetable.length > 0 ? (
                    <div className="space-y-4">
                    {todayTimetable.map((entry, index) => (
                      <div key={entry.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="bg-emerald-100 p-2 rounded-lg">
                            <Clock className="h-4 w-4 text-emerald-600" />
                    </div>
                    </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900">
                              {entry.subjectName} - {entry.className} {entry.section}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                            </span>
                          </div>
                          {entry.roomNumber && (
                            <p className="text-sm text-gray-600 mt-1">Room: {entry.roomNumber}</p>
                          )}
                          </div>
                        </div>
                    ))}
                          </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No classes scheduled for today</p>
                    </div>
                  )}
              </div>
            </motion.div>
          
            {/* Teacher Attendance Summary */}
              <motion.div
              className="bg-white rounded-lg shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 text-emerald-600 mr-2" />
                  My Attendance Summary
                </h2>
              </div>
              
              <div className="p-6">
                {attendanceStats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {attendanceStats.thisMonth.presentDays}
                  </div>
                      <div className="text-sm text-green-800">Present Days</div>
                </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {attendanceStats.thisMonth.absentDays}
              </div>
                      <div className="text-sm text-red-800">Absent Days</div>
                </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {attendanceStats.thisMonth.lateDays}
              </div>
                      <div className="text-sm text-yellow-800">Late Days</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {attendanceStats.thisMonth.attendancePercentage}
                  </div>
                      <div className="text-sm text-blue-800">Attendance %</div>
                  </div>
                </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Attendance data not available</p>
              </div>
                )}
              </div>
                    </motion.div>
                  </div>
                  
          {/* Right Column - Recent Diary & Quick Actions */}
          <div className="space-y-6">
            {/* Recent Diary Entries */}
            <motion.div 
              className="bg-white rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <BookOpen className="h-5 w-5 text-emerald-600 mr-2" />
                    Recent Diary Entries
                  </h2>
                  <Link 
                    to="/teacher/diary"
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
                  >
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {recentDiaryEntries.length > 0 ? (
                  <div className="space-y-4">
                    {recentDiaryEntries.slice(0, 3).map((entry) => (
                      <div key={entry.id} className="border-l-4 border-emerald-500 pl-4">
                        <h3 className="text-sm font-medium text-gray-900">{entry.title}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {entry.className} {entry.section} • {entry.subject}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(entry.date).toLocaleDateString()}
                        </p>
                        </div>
                    ))}
                </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent diary entries</p>
                    <Link 
                      to="/teacher/diary" 
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-2 inline-block"
                    >
                      Create your first entry
                    </Link>
                </div>
                )}
              </div>
            </motion.div>
        
            {/* Quick Access Shortcuts */}
        <motion.div 
              className="bg-white rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Target className="h-5 w-5 text-emerald-600 mr-2" />
                  Quick Access
                </h2>
          </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    to="/teacher/timetable"
                    className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    <Calendar className="h-6 w-6 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-blue-800">View Full Timetable</span>
                  </Link>

                  <Link 
                    to="/teacher/attendance"
                    className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors duration-200"
                  >
                    <UserCheck className="h-6 w-6 text-emerald-600 mb-2" />
                    <span className="text-sm font-medium text-emerald-800">Mark Student Attendance</span>
                  </Link>

                  <Link 
                    to="/teacher/diary"
                    className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
                  >
                    <Plus className="h-6 w-6 text-purple-600 mb-2" />
                    <span className="text-sm font-medium text-purple-800">Create Diary</span>
                  </Link>

                  <Link 
                    to="/teacher/students"
                    className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors duration-200"
                  >
                    <Eye className="h-6 w-6 text-orange-600 mb-2" />
                    <span className="text-sm font-medium text-orange-800">View Students</span>
                  </Link>
                </div>
              </div>
            </motion.div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
