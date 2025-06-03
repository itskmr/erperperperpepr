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
  Settings
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

const NewParentDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'timetable' | 'diary' | 'profile'>('overview');
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [children, setChildren] = useState<Student[]>([]);
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

  // Fetch linked children
  const fetchChildren = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/parent/children`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChildren(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchChildren();
  }, []);

  // Attendance chart colors
  const attendanceColors = ['#10b981', '#ef4444', '#f59e0b', '#6b7280'];

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
              <AttendanceView student={student} />
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
const AttendanceView: React.FC<{ student: Student }> = ({ student }) => {
  const [attendanceData, setAttendanceData] = useState<any>(null);
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
      <h3 className="text-lg font-semibold">
        Class Timetable - {timetableData?.student?.class}-{timetableData?.student?.section}
      </h3>

      <div className="grid gap-6">
        {days.map((day) => (
          <div key={day} className="bg-white border rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3 capitalize">
              {day.toLowerCase()}
            </h4>
            <div className="space-y-2">
              {timetableData?.timetable?.[day]?.length > 0 ? (
                timetableData.timetable[day].map((entry: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                    <div className="text-sm font-medium text-gray-600 w-20">
                      {entry.startTime} - {entry.endTime}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{entry.subject}</div>
                      <div className="text-sm text-gray-600">{entry.teacher?.fullName}</div>
                    </div>
                    {entry.room && (
                      <div className="text-sm text-gray-500">Room: {entry.room}</div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-2">No classes scheduled</p>
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
            <div key={entry.id} className="bg-white border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{entry.subject}</h4>
                  <p className="text-sm text-gray-600">
                    by {entry.teacher.fullName} • {entry.teacher.designation}
                  </p>
                </div>
                <div className="text-right">
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
              <p className="text-gray-700">{entry.content}</p>
            </div>
          ))}
          {diaryEntries.length === 0 && (
            <p className="text-center text-gray-500 py-8">No diary entries found</p>
          )}
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