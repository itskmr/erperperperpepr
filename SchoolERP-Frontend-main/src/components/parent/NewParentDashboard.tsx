import React, { useState, useEffect } from 'react';
import {
  User,
  School,
  Clock,
  // Calendar,
  BookOpen,
  Bell,
  PieChart,
  BarChart3,
  // TrendingUp,
  // Download,
  // FileText,
  // Mail,
  // Phone,
  // MapPin,
  AlertCircle,
  // CheckCircle,
  // XCircle,
  RefreshCw,
  // Eye,
  Settings,
  Calendar,
  MapPin
} from 'lucide-react';
import {
  // LineChart,
  // Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  // XAxis,
  // YAxis,
  //  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  // BarChart,
  // Bar
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Student {
  id: string;
  fullName: string;
  admissionNo: string;
  currentClass: string;
  currentSection: string;
  rollNo: string;
  profileImage?: string;
}

interface School {
  id: number;
  schoolName: string;
  address: string;
  phone: string;
  email: string;
  principal: string;
}

interface AttendanceData {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  percentage: number;
  lastUpdated: string;
}

interface TimetableEntry {
  id: string;
  subject: string;
  startTime: string;
  endTime: string;
  teacher: {
    fullName: string;
    designation: string;
  };
  room?: string;
}

interface DiaryEntry {
  id: string;
  subject: string;
  content: string;
  date: string;
  teacher: {
    fullName: string;
    designation: string;
  };
  priority: string;
  type: string;
  attachments?: string[];
  imageUrls?: string[];
  homework?: string;
  classSummary?: string;
  notices?: string;
  remarks?: string;
}

interface DashboardData {
  student: Student;
  school: School;
  attendance: AttendanceData;
  recentDiaries: DiaryEntry[];
  todayTimetable: TimetableEntry[];
  parent: {
    type: string;
    email: string;
  };
}

interface AttendanceRecord {
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

interface AttendanceStatistics {
  presentDays: number;
  absentDays: number;
  lateDays: number;
  percentage: number;
}

interface AttendanceResponseData {
  statistics: AttendanceStatistics;
  records: AttendanceRecord[];
}

interface TimetableResponseData {
  student: {
    class: string;
    section: string;
  };
  timetable: Record<string, TimetableEntry[]>;
}

const NewParentDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'timetable' | 'diary' | 'profile'>('overview');
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('authToken');
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      const response = await fetch(`${API_URL}/parent/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">No Data Available</h2>
          <p className="text-gray-600">Unable to load dashboard data.</p>
        </div>
      </div>
    );
  }

  const { student, school, attendance, recentDiaries, todayTimetable, parent } = dashboardData;

  // Prepare attendance chart data
  const attendanceChartData = [
    { name: 'Present', value: attendance.presentDays, color: '#10b981' },
    { name: 'Absent', value: attendance.absentDays, color: '#ef4444' },
    { name: 'Late', value: attendance.lateDays, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getGreeting()}, {parent.type === 'father' ? 'Father' : 'Mother'} 👋
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center text-sm text-gray-600">
                  <School className="h-4 w-4 mr-1" />
                  {school.schoolName}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-1" />
                  {parent.email}
                </div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  🔒 Read-only Dashboard
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowUpdateForm(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Settings className="h-4 w-4" />
                <span>Request Update</span>
              </button>
              <button
                onClick={fetchDashboardData}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Student Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {student.profileImage ? (
                  <img
                    src={student.profileImage}
                    alt={student.fullName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{student.fullName}</h3>
                <p className="text-sm text-gray-600">
                  {student.currentClass}-{student.currentSection} • Roll: {student.rollNo}
                </p>
                <p className="text-xs text-gray-500">Admission: {student.admissionNo}</p>
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Attendance</h3>
                <p className="text-3xl font-bold text-green-600">{attendance.percentage}%</p>
                <p className="text-sm text-gray-600">{attendance.presentDays}/{attendance.totalDays} days</p>
              </div>
              <PieChart className="h-8 w-8 text-green-500" />
            </div>
          </div>

          {/* School Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">School</h3>
                <p className="text-sm font-medium text-gray-700">{school.schoolName}</p>
                <p className="text-xs text-gray-500">Principal: {school.principal}</p>
              </div>
              <School className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Diary</h3>
                <p className="text-sm text-gray-600">
                  {recentDiaries.length} new entries
                </p>
                <p className="text-xs text-gray-500">Last updated: Today</p>
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'attendance', label: 'Attendance', icon: PieChart },
                { key: 'timetable', label: 'Timetable', icon: Clock },
                { key: 'diary', label: 'Diary', icon: BookOpen },
                { key: 'profile', label: 'Profile', icon: User }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
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

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Today's Timetable */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
                  <div className="grid gap-4">
                    {todayTimetable.length > 0 ? (
                      todayTimetable.map((entry, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-600">
                            {entry.startTime} - {entry.endTime}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{entry.subject}</div>
                            <div className="text-sm text-gray-600">{entry.teacher.fullName}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No classes scheduled for today</p>
                    )}
                  </div>
                </div>

                {/* Attendance Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={attendanceChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {attendanceChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Diary Entries */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Diary Entries</h3>
                  <div className="space-y-4">
                    {recentDiaries.map((entry) => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{entry.subject}</h4>
                            <p className="text-sm text-gray-600">by {entry.teacher.fullName}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{entry.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <AttendanceView />
            )}

            {activeTab === 'timetable' && (
              <TimetableView student={student} />
            )}

            {activeTab === 'diary' && (
              <DiaryView student={student} />
            )}

            {activeTab === 'profile' && (
              <ProfileView student={student} />
            )}
          </div>
        </div>
      </div>

      {/* Update Request Modal */}
      {showUpdateForm && (
        <UpdateRequestModal
          onClose={() => setShowUpdateForm(false)}
          student={student}
        />
      )}
    </div>
  );
};

// Additional Components for each tab view
const AttendanceView: React.FC<{ student: Student }> = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAttendanceData();
  }, [month, year]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(
        `${API_URL}/parent/attendance?month=${month}&year=${year}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAttendanceData(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading attendance data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Attendance Details</h3>
        <div className="flex space-x-4">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="border rounded px-3 py-1"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border rounded px-3 py-1"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <option key={2020 + i} value={2020 + i}>
                {2020 + i}
              </option>
            ))}
          </select>
        </div>
      </div>

      {attendanceData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-800 font-semibold">Present Days</div>
            <div className="text-2xl font-bold text-green-600">
              {attendanceData.statistics.presentDays}
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800 font-semibold">Absent Days</div>
            <div className="text-2xl font-bold text-red-600">
              {attendanceData.statistics.absentDays}
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-yellow-800 font-semibold">Late Days</div>
            <div className="text-2xl font-bold text-yellow-600">
              {attendanceData.statistics.lateDays}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-800 font-semibold">Attendance %</div>
            <div className="text-2xl font-bold text-blue-600">
              {attendanceData.statistics.percentage}%
            </div>
          </div>
        </div>
      )}

      {attendanceData?.records && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.records.map((record: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'PRESENT'
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'ABSENT'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const TimetableView: React.FC<{ student: Student }> = ({ student }) => {
  const [timetableData, setTimetableData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetableData();
  }, []);

  const fetchTimetableData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/parent/timetable`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTimetableData(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading timetable...</div>;
  }

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 rounded-lg">
        <h3 className="text-lg font-semibold text-white">
          Class Timetable - {timetableData?.student?.class}-{timetableData?.student?.section}
        </h3>
      </div>

      <div className="grid gap-4">
        {days.map((day, dayIndex) => (
          <div key={day} className="bg-white border rounded-lg overflow-hidden shadow-sm">
            <div className={`px-4 py-2 text-white font-semibold text-sm ${
              dayIndex === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
              dayIndex === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
              dayIndex === 2 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
              dayIndex === 3 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
              dayIndex === 4 ? 'bg-gradient-to-r from-pink-500 to-pink-600' :
              'bg-gradient-to-r from-cyan-500 to-cyan-600'
            }`}>
              {day.charAt(0).toUpperCase() + day.slice(1, 3).toLowerCase()}
            </div>
            <div className="space-y-2 p-3">
              {timetableData?.timetable?.[day]?.length > 0 ? (
                timetableData.timetable[day].map((entry: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gradient-to-r from-blue-50 to-indigo-100 rounded border-l-3 border-blue-500">
                    <div className="text-xs font-semibold text-blue-900 w-14 text-center bg-white rounded px-1 py-0.5 flex-shrink-0">
                      <div className="leading-tight">{entry.startTime}</div>
                      <div className="text-blue-600 leading-tight">{entry.endTime}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{entry.subject}</div>
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <User className="h-2 w-2" />
                        <span className="truncate">{entry.teacher?.fullName}</span>
                        {entry.room && (
                          <>
                            <span>•</span>
                            <MapPin className="h-2 w-2" />
                            <span>{entry.room}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No classes</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DiaryView: React.FC<{ student: Student }> = ({ student }) => {
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    date: ''
  });

  useEffect(() => {
    fetchDiaryEntries();
  }, [filters]);

  const fetchDiaryEntries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const params = new URLSearchParams();
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.date) params.append('date', filters.date);
      
      const response = await fetch(`${API_URL}/parent/diary?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDiaryEntries(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching diary entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Teacher Diary Entries</h3>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Filter by subject"
            value={filters.subject}
            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            className="border rounded px-3 py-1"
          />
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="border rounded px-3 py-1"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center">Loading diary entries...</div>
      ) : (
        <div className="space-y-4">
          {diaryEntries.map((entry) => (
            <div key={entry.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{entry.subject}</h4>
                  <p className="text-sm text-gray-600">
                    by {entry.teacher.fullName} • {entry.teacher.designation}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end space-y-2">
                  <div className="text-sm text-gray-500">
                    {new Date(entry.date).toLocaleDateString()}
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      entry.priority === 'HIGH'
                        ? 'bg-red-100 text-red-800'
                        : entry.priority === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {entry.priority}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-3">{entry.content}</p>
              
              {/* Show attachment/image indicators */}
              {((entry.attachments && Array.isArray(entry.attachments) && entry.attachments.length > 0) || (entry.imageUrls && Array.isArray(entry.imageUrls) && entry.imageUrls.length > 0)) && (
                <div className="flex items-center space-x-4 mb-3 pt-3 border-t border-gray-100">
                  {entry.imageUrls && Array.isArray(entry.imageUrls) && entry.imageUrls.length > 0 && (
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {entry.imageUrls.length} image{entry.imageUrls.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  {entry.attachments && Array.isArray(entry.attachments) && entry.attachments.length > 0 && (
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {entry.attachments.length} document{entry.attachments.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setSelectedEntry(entry);
                    setShowDetailModal(true);
                  }}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
          {diaryEntries.length === 0 && (
            <p className="text-center text-gray-500 py-8">No diary entries found</p>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{selectedEntry.subject}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Date:</span>
                  <p className="text-gray-600">{new Date(selectedEntry.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Teacher:</span>
                  <p className="text-gray-600">{selectedEntry.teacher.fullName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Subject:</span>
                  <p className="text-gray-600">{selectedEntry.subject}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Priority:</span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedEntry.priority === 'HIGH'
                        ? 'bg-red-100 text-red-800'
                        : selectedEntry.priority === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {selectedEntry.priority}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Content</h3>
                <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
                  {selectedEntry.content}
                </div>
              </div>

              {selectedEntry.homework && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Homework</h3>
                  <div className="bg-yellow-50 rounded-lg p-4 whitespace-pre-wrap">
                    {selectedEntry.homework}
                  </div>
                </div>
              )}

              {selectedEntry.classSummary && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Class Summary</h3>
                  <div className="bg-blue-50 rounded-lg p-4 whitespace-pre-wrap">
                    {selectedEntry.classSummary}
                  </div>
                </div>
              )}

              {selectedEntry.notices && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notices</h3>
                  <div className="bg-red-50 rounded-lg p-4 whitespace-pre-wrap">
                    {selectedEntry.notices}
                  </div>
                </div>
              )}

              {selectedEntry.remarks && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Remarks</h3>
                  <div className="bg-green-50 rounded-lg p-4 whitespace-pre-wrap">
                    {selectedEntry.remarks}
                  </div>
                </div>
              )}

              {/* Images section */}
              {selectedEntry.imageUrls && Array.isArray(selectedEntry.imageUrls) && selectedEntry.imageUrls.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedEntry.imageUrls.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Diary image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <button
                            onClick={() => handleDownload(imageUrl, `image-${index + 1}.jpg`)}
                            className="opacity-0 group-hover:opacity-100 bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                            title="Download image"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents section */}
              {selectedEntry.attachments && Array.isArray(selectedEntry.attachments) && selectedEntry.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Documents</h3>
                  <div className="space-y-2">
                    {selectedEntry.attachments.map((attachment, index) => {
                      const fileName = attachment.split('/').pop() || `document-${index + 1}`;
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm text-gray-700">{fileName}</span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => window.open(attachment, '_blank')}
                              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
                            >
                              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                            <button
                              onClick={() => handleDownload(attachment, fileName)}
                              className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
                            >
                              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileView: React.FC<{ student: Student }> = ({ student }) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/parent/student/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProfileData(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Student Profile</h3>
        <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded">
          ⚠️ Read-only: Contact school for changes
        </div>
      </div>

      {profileData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-gray-900">{profileData.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                <p className="text-gray-900">
                  {profileData.dateOfBirth
                    ? new Date(profileData.dateOfBirth).toLocaleDateString()
                    : 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Gender</label>
                <p className="text-gray-900">{profileData.gender || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Blood Group</label>
                <p className="text-gray-900">{profileData.bloodGroup || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Academic Information</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Admission Number</label>
                <p className="text-gray-900">{profileData.admissionNo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Current Class</label>
                <p className="text-gray-900">
                  {profileData.sessionInfo?.currentClass}-{profileData.sessionInfo?.currentSection}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Roll Number</label>
                <p className="text-gray-900">{profileData.sessionInfo?.currentRollNo || 'Not assigned'}</p>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Parent Information</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Father's Name</label>
                <p className="text-gray-900">{profileData.fatherName || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Mother's Name</label>
                <p className="text-gray-900">{profileData.motherName || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Contact Number</label>
                <p className="text-gray-900">{profileData.mobileNumber || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{profileData.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Address</label>
                <p className="text-gray-900">{profileData.address || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UpdateRequestModal: React.FC<{ onClose: () => void; student: Student }> = ({
  onClose,
  student
}) => {
  const [formData, setFormData] = useState({
    requestType: '',
    message: '',
    currentValue: '',
    requestedValue: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/parent/request-update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Update request submitted successfully!');
          onClose();
        }
      }
    } catch (error) {
      console.error('Error submitting update request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Information Update</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Request Type
            </label>
            <select
              value={formData.requestType}
              onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Select request type</option>
              <option value="contact">Contact Information</option>
              <option value="address">Address Update</option>
              <option value="emergency">Emergency Contact</option>
              <option value="medical">Medical Information</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Value
            </label>
            <input
              type="text"
              value={formData.currentValue}
              onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Current information"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requested Value
            </label>
            <input
              type="text"
              value={formData.requestedValue}
              onChange={(e) => setFormData({ ...formData, requestedValue: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="New information"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={3}
              placeholder="Please explain your request..."
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewParentDashboard; 