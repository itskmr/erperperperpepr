import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Calendar, 
  Search, 
  Download, 
  Filter, 
  AlertTriangle, 
  FileText,
  Clock,
  Users,
  BarChart3
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Import teacher attendance service
import teacherAttendanceService, { 
  Teacher, 
  TeacherAttendanceStats,
  AttendanceSubmissionData,
  AttendanceSubmissionItem,
  TeacherAttendanceReport,
  DetailedTeacherAttendanceReport,
  TeacherAttendanceDashboard
} from '../../services/teacherAttendanceService';

// Error type for better error handling
interface ErrorWithMessage {
  message: string;
  status?: number;
  code?: string;
}

// Error Boundary Component
class TeacherAttendanceErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Teacher Attendance Management Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-6 m-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Something went wrong with the teacher attendance management
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Please refresh the page and try again. If the problem persists, contact support.</p>
                <details className="mt-2">
                  <summary className="cursor-pointer">Error details</summary>
                  <pre className="mt-1 text-xs bg-red-100 p-2 rounded">
                    {this.state.error?.message || 'Unknown error'}
                  </pre>
                </details>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const TeacherAttendanceManagement: React.FC = () => {
  // States
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [stats, setStats] = useState<TeacherAttendanceStats>({ 
    total: 0, present: 0, absent: 0, late: 0, notMarked: 0, attendanceRate: '0' 
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'report' | 'dashboard'>('daily');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedDesignation, setSelectedDesignation] = useState<string>('');
  const [departments, setDepartments] = useState<string[]>([]);
  const [designations, setDesignations] = useState<string[]>([]);
  
  // Report states
  const [reportType, setReportType] = useState<'summary' | 'detailed'>('summary');
  const [reportStartDate, setReportStartDate] = useState<string>('');
  const [reportEndDate, setReportEndDate] = useState<string>('');
  const [reportTeacherId, setReportTeacherId] = useState<string>('');
  const [reportDepartment, setReportDepartment] = useState<string>('');
  const [reportData, setReportData] = useState<TeacherAttendanceReport[] | DetailedTeacherAttendanceReport[] | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  
  // Dashboard states
  const [dashboardData, setDashboardData] = useState<TeacherAttendanceDashboard | null>(null);
  
  // Load initial data
  useEffect(() => {
    loadTeacherAttendanceData();
    loadFilterOptions();
    if (activeTab === 'dashboard') {
      loadDashboardData();
    }
  }, [selectedDate, selectedDepartment, selectedDesignation, activeTab]);

  const loadFilterOptions = async () => {
    try {
      const [depts, desigs] = await Promise.all([
        teacherAttendanceService.getTeacherDepartments(),
        teacherAttendanceService.getTeacherDesignations()
      ]);
      setDepartments(depts);
      setDesignations(desigs);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const loadTeacherAttendanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const data = await teacherAttendanceService.getTeacherAttendanceByDate(formattedDate);
      
      setTeachers(data.teachers);
      setStats(data.statistics);
    } catch (err: unknown) {
      console.error('Failed to load teacher attendance data:', err);
      const error = err as ErrorWithMessage;
      setError(error.message || 'Failed to load teacher attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const data = await teacherAttendanceService.getTeacherAttendanceDashboard();
      setDashboardData(data);
    } catch (err: unknown) {
      console.error('Failed to load dashboard data:', err);
      const error = err as ErrorWithMessage;
      setError(error.message || 'Failed to load dashboard data');
    }
  };

  // Filter teachers based on search query
  const filteredTeachers = teachers.filter(teacher => 
    teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (teacher.email && teacher.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (teacher.designation && teacher.designation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle attendance status change
  const handleStatusChange = (teacherId: number, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setTeachers(prevTeachers => 
      prevTeachers.map(teacher => 
        teacher.id === teacherId 
          ? { 
              ...teacher, 
              attendance: teacher.attendance 
                ? { ...teacher.attendance, status }
                : { 
                    id: 0, 
                    status, 
                    markedAt: new Date().toISOString() 
                  }
            }
          : teacher
      )
    );
    
    // Update stats
    updateStats();
  };

  // Update attendance statistics
  const updateStats = () => {
    const totalTeachers = teachers.length;
    const presentCount = teachers.filter(t => t.attendance?.status === 'PRESENT').length;
    const absentCount = teachers.filter(t => t.attendance?.status === 'ABSENT').length;
    const lateCount = teachers.filter(t => t.attendance?.status === 'LATE').length;
    const notMarkedCount = totalTeachers - (presentCount + absentCount + lateCount);
    const attendanceRate = totalTeachers > 0 
      ? ((presentCount + lateCount) / totalTeachers * 100).toFixed(2)
      : '0';

    setStats({
      total: totalTeachers,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      notMarked: notMarkedCount,
      attendanceRate
    });
  };

  // Handle notes change
  const handleNotesChange = (teacherId: number, notes: string) => {
    setTeachers(prevTeachers => 
      prevTeachers.map(teacher => 
        teacher.id === teacherId 
          ? { 
              ...teacher, 
              attendance: teacher.attendance 
                ? { ...teacher.attendance, notes }
                : { 
                    id: 0, 
                    status: 'PRESENT', 
                    notes,
                    markedAt: new Date().toISOString() 
                  }
            }
          : teacher
      )
    );
  };

  // Save all attendance records
  const handleSaveAttendance = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare attendance data
      const attendanceData: AttendanceSubmissionItem[] = teachers
        .filter(teacher => teacher.attendance?.status)
        .map(teacher => ({
          teacherId: teacher.id,
          status: teacher.attendance!.status,
          notes: teacher.attendance?.notes || undefined,
          checkInTime: teacher.attendance?.checkInTime || undefined,
          checkOutTime: teacher.attendance?.checkOutTime || undefined,
          workingHours: teacher.attendance?.workingHours || undefined
        }));

      if (attendanceData.length === 0) {
        setError('Please mark attendance for at least one teacher');
        return;
      }

      // Validate data
      const validation = teacherAttendanceService.validateAttendanceData(attendanceData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      const submissionData: AttendanceSubmissionData = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        attendanceData
      };

      const response = await teacherAttendanceService.markTeacherAttendance(submissionData);
      
      if (response.success) {
        // Reload data to reflect changes
        await loadTeacherAttendanceData();
        setError(null);
      } else {
        setError(response.message || 'Failed to save attendance');
      }
    } catch (err: unknown) {
      console.error('Failed to save teacher attendance:', err);
      const error = err as ErrorWithMessage;
      setError(error.message || 'Failed to save teacher attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate report
  const handleGenerateReport = async () => {
    if (!reportStartDate || !reportEndDate) {
      setReportError('Please select start and end dates');
      return;
    }

    try {
      setIsGeneratingReport(true);
      setReportError(null);
      
      const teacherId = reportTeacherId ? parseInt(reportTeacherId) : undefined;
      const data = await teacherAttendanceService.generateTeacherAttendanceReport(
        reportStartDate,
        reportEndDate,
        teacherId,
        reportDepartment || undefined,
        reportType
      );
      
      setReportData(data);
    } catch (err: unknown) {
      console.error('Failed to generate report:', err);
      const error = err as ErrorWithMessage;
      setReportError(error.message || 'Failed to generate report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Export current attendance data
  const handleExportCurrentData = () => {
    try {
      setIsSubmitting(true);
      
      // Generate CSV content from current table data
      const csvContent = generateTeacherAttendanceCSV(teachers, selectedDate);
      downloadTeacherCSV(csvContent, `teacher_attendance_${format(selectedDate, 'yyyy-MM-dd')}.csv`);
      
    } catch (err: unknown) {
      console.error('Failed to export data:', err);
      const error = err as ErrorWithMessage;
      setError(error.message || 'Failed to export data');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate CSV content for teacher attendance
  const generateTeacherAttendanceCSV = (teacherData: Teacher[], date: Date) => {
    const header = `Teacher Attendance Report\nDate: ${format(date, 'MMMM d, yyyy')}\nGenerated on: ${new Date().toLocaleDateString()}\n\nSummary:\nTotal Teachers: ${stats.total}\nPresent: ${stats.present}\nAbsent: ${stats.absent}\nLate: ${stats.late}\nNot Marked: ${stats.notMarked}\nAttendance Rate: ${stats.attendanceRate}%\n\nTeacher Details:\n`;
    
    const csvHeader = 'Teacher Name,Email,Designation,Department,Status,Check In,Check Out,Working Hours,Notes\n';
    const csvRows = teacherData.map((teacher) => {
      const name = `"${(teacher.fullName || '').replace(/"/g, '""')}"`;
      const email = teacher.email || '';
      const designation = teacher.designation || '';
      const department = teacher.subjects || '';
      const status = teacher.attendance?.status || 'Not Marked';
      const checkIn = teacher.attendance?.checkInTime 
        ? new Date(teacher.attendance.checkInTime).toLocaleTimeString() 
        : '';
      const checkOut = teacher.attendance?.checkOutTime 
        ? new Date(teacher.attendance.checkOutTime).toLocaleTimeString() 
        : '';
      const workingHours = teacher.attendance?.workingHours || '';
      const notes = teacher.attendance?.notes ? `"${teacher.attendance.notes.replace(/"/g, '""')}"` : '';
      
      return `${name},${email},${designation},${department},${status},${checkIn},${checkOut},${workingHours},${notes}`;
    }).join('\n');

    return header + csvHeader + csvRows;
  };

  // Helper function to download teacher CSV
  const downloadTeacherCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (isLoading && teachers.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-green-600 to-green-800 text-white">
            <h1 className="text-3xl font-bold">Teacher Attendance Management</h1>
            <p className="mt-2 text-green-100">Track and manage teacher attendance efficiently</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-gray-100 px-6 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('daily')}
                className={`py-4 px-2 font-medium text-sm focus:outline-none ${
                  activeTab === 'daily' 
                    ? 'text-green-700 border-b-2 border-green-700' 
                    : 'text-gray-500 hover:text-green-600'
                }`}
              >
                <Users className="inline mr-2" />
                Daily Attendance
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`py-4 px-2 font-medium text-sm focus:outline-none ${
                  activeTab === 'report' 
                    ? 'text-green-700 border-b-2 border-green-700' 
                    : 'text-gray-500 hover:text-green-600'
                }`}
              >
                <FileText className="inline mr-2" />
                Reports
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-2 font-medium text-sm focus:outline-none ${
                  activeTab === 'dashboard' 
                    ? 'text-green-700 border-b-2 border-green-700' 
                    : 'text-gray-500 hover:text-green-600'
                }`}
              >
                <BarChart3 className="inline mr-2" />
                Dashboard
              </button>
            </div>
          </div>

          {activeTab === 'daily' && (
            <>
              {/* Controls */}
              <div className="p-6 border-b border-gray-200 bg-white">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="text-gray-400" />
                      </div>
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date | null) => date && setSelectedDate(date)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        dateFormat="MMMM d, yyyy"
                      />
                    </div>
                    
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Filter className="mr-2" /> Filters
                    </button>
                  </div>
                  
                  <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search teachers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                
                {showFilters && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-700 mb-2">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select 
                          value={selectedDepartment}
                          onChange={(e) => setSelectedDepartment(e.target.value)}
                          className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">All Departments</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                        <select 
                          value={selectedDesignation}
                          onChange={(e) => setSelectedDesignation(e.target.value)}
                          className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">All Designations</option>
                          {designations.map(desig => (
                            <option key={desig} value={desig}>{desig}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="p-6 bg-white border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Teachers</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                      <div className="bg-blue-400 p-3 rounded-full">
                        <Users className="h-6 w-6" />
                  </div>
                  </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Present</p>
                        <p className="text-2xl font-bold">{stats.present}</p>
                      </div>
                      <div className="bg-green-400 p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm font-medium">Absent</p>
                        <p className="text-2xl font-bold">{stats.absent}</p>
                      </div>
                      <div className="bg-red-400 p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm font-medium">Late</p>
                        <p className="text-2xl font-bold">{stats.late}</p>
                      </div>
                      <div className="bg-yellow-400 p-3 rounded-full">
                        <Clock className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Attendance Rate</p>
                        <p className="text-2xl font-bold">{stats.attendanceRate}%</p>
                      </div>
                      <div className="bg-purple-400 p-3 rounded-full">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading indicator for teacher list */}
              {isLoading && (
                <div className="p-6 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                </div>
              )}

              {/* No teachers message */}
              {!isLoading && filteredTeachers.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No teachers found matching your criteria.</p>
                </div>
              )}

              {/* Teacher Attendance Table */}
              {!isLoading && filteredTeachers.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teacher
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Designation
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check In/Out
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTeachers.map(teacher => {
                        const attendance = teacher.attendance;
                        
                        return (
                          <tr key={teacher.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {teacher.profileImage ? (
                                    <img 
                                      className="h-10 w-10 rounded-full object-cover" 
                                      src={teacher.profileImage} 
                                      alt={teacher.fullName}
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                      {teacher.fullName.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{teacher.fullName}</div>
                                  <div className="text-sm text-gray-500">{teacher.email}</div>
                                  {teacher.isClassIncharge && (
                                    <div className="text-xs text-blue-600">
                                      Class Incharge: {teacher.inchargeClass} {teacher.inchargeSection}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{teacher.designation}</div>
                              {teacher.subjects && (
                                <div className="text-xs text-gray-500">
                                  {teacher.subjects.length > 50 ? teacher.subjects.substring(0, 50) + '...' : teacher.subjects}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleStatusChange(teacher.id, 'PRESENT')}
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    attendance?.status === 'PRESENT' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800 hover:bg-green-50'
                                  }`}
                                >
                                  Present
                                </button>
                                <button
                                  onClick={() => handleStatusChange(teacher.id, 'ABSENT')}
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    attendance?.status === 'ABSENT' 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-gray-100 text-gray-800 hover:bg-red-50'
                                  }`}
                                >
                                  Absent
                                </button>
                                <button
                                  onClick={() => handleStatusChange(teacher.id, 'LATE')}
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    attendance?.status === 'LATE' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-gray-100 text-gray-800 hover:bg-yellow-50'
                                  }`}
                                >
                                  Late
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2 text-xs">
                                {attendance?.checkInTime && (
                                  <div className="flex items-center">
                                    <Clock className="mr-1" />
                                    In: {teacherAttendanceService.formatTimeForDisplay(attendance.checkInTime)}
                                  </div>
                                )}
                                {attendance?.checkOutTime && (
                                  <div className="flex items-center">
                                    <Clock className="mr-1" />
                                    Out: {teacherAttendanceService.formatTimeForDisplay(attendance.checkOutTime)}
                                  </div>
                                )}
                                {attendance?.workingHours && (
                                  <div className="text-gray-600">
                                    ({attendance.workingHours}h)
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                value={attendance?.notes || ''}
                                onChange={(e) => handleNotesChange(teacher.id, e.target.value)}
                                placeholder="Add notes..."
                                className="w-full text-sm border border-gray-300 rounded-md p-1 focus:ring-green-500 focus:border-green-500"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Showing {filteredTeachers.length} of {teachers.length} teachers
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleExportCurrentData}
                    disabled={isSubmitting || teachers.length === 0}
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium 
                      ${isSubmitting ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
                  >
                    <Download className="mr-2" />
                    {isSubmitting ? 'Exporting...' : 'Export CSV'}
                  </button>
                  <button 
                    onClick={handleSaveAttendance}
                    disabled={isSubmitting || teachers.length === 0}
                    className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                      ${isSubmitting ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Attendance'}
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'report' && (
            <div className="p-6">
              <div className="bg-white">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Teacher Attendance Reports</h2>
                
                {/* Report Controls */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                      <select 
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value as 'summary' | 'detailed')}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="summary">Summary Report</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teacher (Optional)</label>
                      <select 
                        value={reportTeacherId}
                        onChange={(e) => setReportTeacherId(e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">All Teachers</option>
                        {teachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id.toString()}>
                            {teacher.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department (Optional)</label>
                      <select 
                        value={reportDepartment}
                        onChange={(e) => setReportDepartment(e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-3">
                    <button 
                      onClick={handleGenerateReport}
                      disabled={!reportStartDate || !reportEndDate || isGeneratingReport}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 text-sm font-medium"
                    >
                      {isGeneratingReport ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2" />
                          Generate Report
                        </>
                      )}
                    </button>
                    
                    <button 
                      onClick={handleExportCurrentData}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                    >
                      <Download className="mr-2" />
                      Export Current Data
                    </button>
                  </div>
                </div>

                {/* Report Error */}
                {reportError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{reportError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Report Results */}
                {reportData && reportData.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">
                        {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Generated for {reportStartDate} to {reportEndDate}
                      </p>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Teacher
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Designation
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Days
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Present
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Absent
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Late
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Attendance %
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportData.map((report, index) => (
                            <tr key={report.teacher.id || index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {report.teacher.fullName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {report.teacher.email}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {report.teacher.designation}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {report.attendance?.totalDays || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                {report.attendance?.presentDays || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                {report.attendance?.absentDays || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                                {report.attendance?.lateDays || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {report.attendance?.attendanceRate || '0'}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {reportData && reportData.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No data found for the selected criteria.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && dashboardData && (
            <div className="p-6">
              <div className="bg-white">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Teacher Attendance Dashboard</h2>
                
                {/* Today's Stats */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Attendance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="text-2xl font-bold text-blue-800">{dashboardData.todayStats.total}</div>
                      <div className="text-sm text-blue-600">Total Teachers</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="text-2xl font-bold text-green-800">{dashboardData.todayStats.present}</div>
                      <div className="text-sm text-green-600">Present</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <div className="text-2xl font-bold text-red-800">{dashboardData.todayStats.absent}</div>
                      <div className="text-sm text-red-600">Absent</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                      <div className="text-2xl font-bold text-yellow-800">{dashboardData.todayStats.late}</div>
                      <div className="text-sm text-yellow-600">Late</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="text-2xl font-bold text-purple-800">{dashboardData.todayStats.attendanceRate}%</div>
                      <div className="text-sm text-purple-600">Attendance Rate</div>
                    </div>
                  </div>
                </div>

                {/* Monthly Stats */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">This Month's Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="text-xl font-bold text-gray-800">{dashboardData.monthlyStats.totalRecords}</div>
                      <div className="text-sm text-gray-600">Total Records</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="text-xl font-bold text-green-800">{dashboardData.monthlyStats.present}</div>
                      <div className="text-sm text-green-600">Present Days</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <div className="text-xl font-bold text-red-800">{dashboardData.monthlyStats.absent}</div>
                      <div className="text-sm text-red-600">Absent Days</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="text-xl font-bold text-blue-800">{dashboardData.monthlyStats.avgAttendanceRate}%</div>
                      <div className="text-sm text-blue-600">Avg Attendance</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrap component with Error Boundary
const TeacherAttendanceManagementWithErrorBoundary: React.FC = () => (
  <TeacherAttendanceErrorBoundary>
    <TeacherAttendanceManagement />
  </TeacherAttendanceErrorBoundary>
);

export default TeacherAttendanceManagementWithErrorBoundary; 