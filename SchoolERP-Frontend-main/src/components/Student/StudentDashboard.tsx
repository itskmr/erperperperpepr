import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, CheckCircle, XCircle, Clock, User, Book, BookOpen,
  Bell, Activity, GraduationCap, BarChart3, MessageSquare, FileText,
  Eye, UserCheck, Home, ChevronRight, Target, AlertCircle, RefreshCw,
  Phone, Mail, MapPin, Calendar as CalendarIcon, School, UserIcon,
  Contact, Info, Edit, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// Types
interface StudentInfo {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  rollNumber: string;
  admissionNo: string;
  schoolId: number;
  schoolName?: string;
  currentSession: {
    class: string;
    section: string;
    rollNo: string;
  };
  parentInfo: {
    fatherName?: string;
    motherName?: string;
    guardianName?: string;
    contactNumber?: string;
    email?: string;
  };
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  profileImage?: string;
  admissionDate?: string;
}

interface TimetableEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  teacherName?: string;
  roomNumber?: string;
  className: string;
  section: string;
}

interface AttendanceStats {
  thisMonth: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendancePercentage: string;
  };
  dailyRecords: Array<{
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
  }>;
}

interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  date: string;
  subject: string;
  teacherName: string;
  entryType: string;
  priority: string;
  isPublic: boolean;
}

interface DashboardStats {
  totalSubjects: number;
  todayClasses: number;
  upcomingTests: number;
  pendingAssignments: number;
}

const StudentDashboard: React.FC = () => {
  // State
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'timetable' | 'attendance' | 'diary' | 'profile'>('timetable');

  // Get student info from authentication
  const getStudentInfo = (): StudentInfo | null => {
    try {
      const userData = localStorage.getItem('userData');
      const token = localStorage.getItem('token');
      
      if (userData) {
        const user = JSON.parse(userData);
        return {
          id: user.id,
          fullName: user.fullName || user.name || 'Student',
          email: user.email || '',
          phone: user.phone,
          rollNumber: user.rollNumber || user.admissionNo || '',
          admissionNo: user.admissionNo || '',
          schoolId: user.schoolId || user.school_id,
          schoolName: user.schoolName || user.school_name,
          currentSession: user.currentSession || user.sessionInfo || {
            class: user.currentClass || user.class || '',
            section: user.currentSection || user.section || '',
            rollNo: user.currentRollNo || user.rollNumber || ''
          },
          parentInfo: user.parentInfo || {
            fatherName: user.fatherName,
            motherName: user.motherName,
            guardianName: user.guardianName,
            contactNumber: user.parentContact,
            email: user.parentEmail
          },
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          address: user.address,
          profileImage: user.profileImage,
          admissionDate: user.admissionDate
        };
      }
      
      // Try to get from JWT token
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          id: payload.id,
          fullName: payload.fullName || payload.name || 'Student',
          email: payload.email || '',
          phone: payload.phone,
          rollNumber: payload.rollNumber || '',
          admissionNo: payload.admissionNo || '',
          schoolId: payload.schoolId || payload.school_id,
          schoolName: payload.schoolName || payload.school_name,
          currentSession: {
            class: payload.class || '',
            section: payload.section || '',
            rollNo: payload.rollNumber || ''
          },
          parentInfo: {
            fatherName: payload.fatherName,
            motherName: payload.motherName,
            guardianName: payload.guardianName,
            contactNumber: payload.parentContact,
            email: payload.parentEmail
          },
          dateOfBirth: payload.dateOfBirth,
          gender: payload.gender,
          address: payload.address,
          profileImage: payload.profileImage,
          admissionDate: payload.admissionDate
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing student info:', error);
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

  // Fetch student's timetable
  const fetchTimetable = async () => {
    try {
      const student = studentInfo;
      if (!student?.currentSession?.class || !student?.currentSession?.section) return;

      const response = await apiCall(
        `/api/timetable/class/${student.currentSession.class}/section/${student.currentSession.section}`
      );
      
      if (response.success && response.data) {
        setTimetable(response.data);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
    }
  };

  // Fetch student attendance stats
  const fetchAttendanceStats = async () => {
    try {
      const student = studentInfo;
      if (!student) return;

      // Get current month attendance
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const response = await apiCall(
        `/api/attendance/student/${student.id}/reports?startDate=${startOfMonth.toISOString().split('T')[0]}&endDate=${endOfMonth.toISOString().split('T')[0]}`
      );
      
      if (response.success && response.data) {
        const stats = response.data.attendanceStats || {};
        const records = response.data.dailyRecords || [];
        
        setAttendanceStats({
          thisMonth: {
            totalDays: stats.totalWorkingDays || 0,
            presentDays: stats.presentDays || 0,
            absentDays: stats.absentDays || 0,
            lateDays: stats.lateDays || 0,
            attendancePercentage: stats.attendancePercentage || '0%'
          },
          dailyRecords: records
        });
      }
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  };

  // Fetch teacher diary entries
  const fetchDiaryEntries = async () => {
    try {
      const student = studentInfo;
      if (!student?.currentSession?.class || !student?.currentSession?.section) return;

      const response = await apiCall(
        `/api/teacher-diary/view?className=${student.currentSession.class}&section=${student.currentSession.section}&limit=10&page=1`
      );
      
      if (response.success && response.data?.entries) {
        setDiaryEntries(response.data.entries);
      }
    } catch (error) {
      console.error('Error fetching diary entries:', error);
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const student = studentInfo;
      if (!student) return;

      // Get timetable for today's classes count
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      const todayClasses = timetable.filter(entry => entry.day === today).length;
      
      // Get unique subjects count
      const uniqueSubjects = [...new Set(timetable.map(entry => entry.subjectName))].length;

      setDashboardStats({
        totalSubjects: uniqueSubjects,
        todayClasses,
        upcomingTests: 0, // This would come from tests/exams API
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
      
      const student = getStudentInfo();
      if (!student) {
        setError('Student information not found. Please log in again.');
        return;
      }
      
      setStudentInfo(student);
      
      // Fetch all data in parallel
      await Promise.all([
        fetchTimetable(),
        fetchAttendanceStats(),
        fetchDiaryEntries(),
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

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
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

  // Get today's timetable
  const getTodayTimetable = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    return timetable.filter(entry => entry.day === today);
  };

  // Get attendance status color
  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'LATE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeDashboard();
  }, []);

  // Update dashboard stats when timetable changes
  useEffect(() => {
    if (timetable.length > 0) {
      fetchDashboardStats();
    }
  }, [timetable]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading student dashboard...</p>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const dateInfo = getCurrentDateInfo();
  const todayTimetable = getTodayTimetable();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Greeting Panel */}
        <motion.div 
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg mb-6 overflow-hidden"
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
                    {getGreeting()}, {studentInfo?.fullName || 'Student'}! 👋
                  </h1>
                  <div className="text-blue-100 text-lg mt-2 space-y-1">
                    <p className="flex items-center">
                      <School className="h-4 w-4 mr-2" />
                      {studentInfo?.schoolName || 'School Dashboard'}
                    </p>
                    <p className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Class {studentInfo?.currentSession?.class} - {studentInfo?.currentSession?.section} • Roll No: {studentInfo?.currentSession?.rollNo}
                    </p>
                    {(studentInfo?.parentInfo?.fatherName || studentInfo?.parentInfo?.motherName) && (
                      <p className="flex items-center">
                        <Contact className="h-4 w-4 mr-2" />
                        Parent: {studentInfo?.parentInfo?.fatherName || studentInfo?.parentInfo?.motherName || studentInfo?.parentInfo?.guardianName}
                      </p>
                    )}
                  </div>
                  <p className="text-blue-200 text-sm mt-2">
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
              <div className="bg-purple-100 p-3 rounded-lg">
                <Book className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats?.totalSubjects || 0}</p>
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
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
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
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${
                attendanceStats?.thisMonth.attendancePercentage && parseFloat(attendanceStats.thisMonth.attendancePercentage) >= 85 
                  ? 'bg-green-100' 
                  : parseFloat(attendanceStats?.thisMonth.attendancePercentage || '0') >= 75 
                    ? 'bg-yellow-100' 
                    : 'bg-red-100'
              }`}>
                <BarChart3 className={`h-6 w-6 ${
                  attendanceStats?.thisMonth.attendancePercentage && parseFloat(attendanceStats.thisMonth.attendancePercentage) >= 85 
                    ? 'text-green-600' 
                    : parseFloat(attendanceStats?.thisMonth.attendancePercentage || '0') >= 75 
                      ? 'text-yellow-600' 
                      : 'text-red-600'
                }`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceStats?.thisMonth.attendancePercentage || '0%'}
                </p>
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
              <div className="bg-emerald-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Diary Entries</p>
                <p className="text-2xl font-bold text-gray-900">{diaryEntries.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'timetable', label: 'Timetable', icon: Calendar },
                { id: 'attendance', label: 'Attendance', icon: BarChart3 },
                { id: 'diary', label: 'Teacher Diary', icon: BookOpen },
                { id: 'profile', label: 'My Profile', icon: User }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Timetable Tab */}
              {activeTab === 'timetable' && (
                <motion.div
                  key="timetable"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Timetable</h3>
                  {timetable.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Day
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Subject
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Teacher
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Room
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {timetable.map((entry, index) => (
                            <tr key={`${entry.id}-${index}`} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {entry.day}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {entry.subjectName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {entry.teacherName || 'TBA'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {entry.roomNumber || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No timetable available</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Attendance Tab */}
              {activeTab === 'attendance' && (
                <motion.div
                  key="attendance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Summary</h3>
                  {attendanceStats ? (
                    <div className="space-y-6">
                      {/* Monthly Summary */}
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
                          <div className="text-sm text-blue-800">Overall %</div>
                        </div>
                      </div>

                      {/* Daily Records */}
                      {attendanceStats.dailyRecords.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium text-gray-900 mb-3">Recent Attendance</h4>
                          <div className="space-y-2">
                            {attendanceStats.dailyRecords.slice(0, 10).map((record, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-900">
                                  {new Date(record.date).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceColor(record.status)}`}>
                                  {record.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No attendance data available</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Diary Tab */}
              {activeTab === 'diary' && (
                <motion.div
                  key="diary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Teacher Diary Entries</h3>
                  {diaryEntries.length > 0 ? (
                    <div className="space-y-4">
                      {diaryEntries.map(entry => (
                        <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-md font-medium text-gray-900">{entry.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {entry.subject} • {entry.teacherName}
                              </p>
                              <p className="text-sm text-gray-800 mt-2">{entry.content}</p>
                            </div>
                            <div className="ml-4 text-right">
                              <p className="text-xs text-gray-500">
                                {new Date(entry.date).toLocaleDateString()}
                              </p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                entry.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                entry.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {entry.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No diary entries available</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Student Profile</h3>
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      Read Only
                    </div>
                  </div>
                  
                  {studentInfo && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                          <UserIcon className="h-4 w-4 mr-2" />
                          Personal Information
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</label>
                            <p className="mt-1 text-sm text-gray-900">{studentInfo.fullName}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</label>
                            <p className="mt-1 text-sm text-gray-900">
                              {studentInfo.dateOfBirth ? new Date(studentInfo.dateOfBirth).toLocaleDateString() : 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</label>
                            <p className="mt-1 text-sm text-gray-900">{studentInfo.gender || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Number</label>
                            <p className="mt-1 text-sm text-gray-900">{studentInfo.admissionNo}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Date</label>
                            <p className="mt-1 text-sm text-gray-900">
                              {studentInfo.admissionDate ? new Date(studentInfo.admissionDate).toLocaleDateString() : 'Not provided'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Academic Information */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                          <Book className="h-4 w-4 mr-2" />
                          Academic Information
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Class</label>
                            <p className="mt-1 text-sm text-gray-900">{studentInfo.currentSession.class}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Section</label>
                            <p className="mt-1 text-sm text-gray-900">{studentInfo.currentSession.section}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</label>
                            <p className="mt-1 text-sm text-gray-900">{studentInfo.currentSession.rollNo}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">School</label>
                            <p className="mt-1 text-sm text-gray-900">{studentInfo.schoolName}</p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          Contact Information
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                            <p className="mt-1 text-sm text-gray-900">{studentInfo.email || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</label>
                            <p className="mt-1 text-sm text-gray-900">{studentInfo.phone || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</label>
                            <p className="mt-1 text-sm text-gray-900">{studentInfo.address || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Parent Information */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                          <Contact className="h-4 w-4 mr-2" />
                          Parent Information
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Father's Name</label>
                            <p className="mt-1 text-sm text-gray-900">{studentInfo.parentInfo.fatherName || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mother's Name</label>
                            <p className="mt-1 text-sm text-gray-900">{studentInfo.parentInfo.motherName || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Guardian Name</label>
                            <p className="mt-1 text-sm text-gray-900">{studentInfo.parentInfo.guardianName || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Contact</label>
                            <p className="mt-1 text-sm text-gray-900">{studentInfo.parentInfo.contactNumber || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Email</label>
                            <p className="mt-1 text-sm text-gray-900">{studentInfo.parentInfo.email || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Admin Notice */}
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Info className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Need to update your information?</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Contact your school administrator to make changes to your profile information.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
