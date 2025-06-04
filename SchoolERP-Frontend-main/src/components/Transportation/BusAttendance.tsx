import React, { useState, useEffect } from 'react';
import {
  Bus,
  User,
  Calendar,
  Clock,
  X,
  Edit,
  RefreshCw,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  BarChart3,
  TrendingUp,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Student {
  id: string;
  fullName: string;
  admissionNo: string;
  rollNumber: string;
  currentClass: string;
  currentSection: string;
  busId: string;
  pickupPoint?: string;
  parentContact?: string;
  profileImage?: string;
}

interface BusInfo {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  capacity: number;
  driverName?: string;
  routeName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
}

interface AttendanceRecord {
  id?: string;
  studentId: string;
  busId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  reason?: string;
  pickupTime?: string;
  dropoffTime?: string;
  markedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BusAttendanceStats {
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  lateStudents: number;
  attendancePercentage: number;
}

interface ReportData {
  date: string;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  lateStudents: number;
  attendancePercentage: number;
}

const BusAttendance: React.FC = () => {
  // State
  const [buses, setBuses] = useState<BusInfo[]>([]);
  const [selectedBus, setSelectedBus] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [stats, setStats] = useState<BusAttendanceStats | null>(null);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [tempReason, setTempReason] = useState<string>('');
  
  // Reports state
  const [showReports, setShowReports] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [reportStartDate, setReportStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reportEndDate, setReportEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // API helper function
  const apiCall = async (endpoint: string, options?: RequestInit) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      }
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return await response.json();
  };

  // Fetch buses
  const fetchBuses = async () => {
    try {
      const response = await apiCall('/api/transport/buses');
      if (response.success && response.data) {
        setBuses(response.data.filter((bus: BusInfo) => bus.status === 'ACTIVE'));
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
      setError('Failed to load buses');
    }
  };

  // Fetch students by bus
  const fetchStudentsByBus = async (busId: string) => {
    try {
      setLoading(true);
      const response = await apiCall(`/api/transport/buses/${busId}/students`);
      if (response.success && response.data) {
        setStudents(response.data);
        calculateStats(response.data, attendanceRecords);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students for this bus');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance records
  const fetchAttendanceRecords = async (busId: string, date: string) => {
    try {
      const response = await apiCall(`/api/transport/buses/${busId}/attendance?date=${date}`);
      if (response.success && response.data) {
        setAttendanceRecords(response.data);
        calculateStats(students, response.data);
      } else {
        setAttendanceRecords([]);
        calculateStats(students, []);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      setAttendanceRecords([]);
      calculateStats(students, []);
    }
  };

  // Calculate attendance statistics
  const calculateStats = (studentList: Student[], records: AttendanceRecord[]) => {
    const totalStudents = studentList.length;
    const presentStudents = records.filter(r => r.status === 'PRESENT').length;
    const absentStudents = records.filter(r => r.status === 'ABSENT').length;
    const lateStudents = records.filter(r => r.status === 'LATE').length;
    const attendancePercentage = totalStudents > 0 ? 
      ((presentStudents + lateStudents) / totalStudents) * 100 : 0;

    setStats({
      totalStudents,
      presentStudents,
      absentStudents,
      lateStudents,
      attendancePercentage: Math.round(attendancePercentage * 100) / 100
    });
  };

  // Mark attendance for a student
  const markAttendance = async (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE', reason?: string) => {
    try {
      const existingRecord = attendanceRecords.find(r => r.studentId === studentId);
      const attendanceData = {
        studentId,
        busId: selectedBus,
        date: selectedDate,
        status,
        reason: reason || '',
        pickupTime: status === 'PRESENT' || status === 'LATE' ? new Date().toISOString() : undefined,
        markedBy: 'current_user' // This should come from auth context
      };

      let response;
      if (existingRecord) {
        // Update existing record
        response = await apiCall(`/api/transport/buses/attendance/${existingRecord.id}`, {
          method: 'PUT',
          body: JSON.stringify(attendanceData)
        });
      } else {
        // Create new record
        response = await apiCall('/api/transport/buses/attendance', {
          method: 'POST',
          body: JSON.stringify(attendanceData)
        });
      }

      if (response.success) {
        // Refresh attendance records
        await fetchAttendanceRecords(selectedBus, selectedDate);
        setEditingRecord(null);
        setTempReason('');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError('Failed to mark attendance');
    }
  };

  // Bulk mark attendance
  const bulkMarkAttendance = async (status: 'PRESENT' | 'ABSENT') => {
    try {
      setSaving(true);
      const promises = students.map(student => {
        const existingRecord = attendanceRecords.find(r => r.studentId === student.id);
        if (!existingRecord) {
          return markAttendance(student.id, status);
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      await fetchAttendanceRecords(selectedBus, selectedDate);
    } catch (error) {
      console.error('Error in bulk marking:', error);
      setError('Failed to mark bulk attendance');
    } finally {
      setSaving(false);
    }
  };

  // Export attendance to CSV
  const exportAttendance = () => {
    if (!selectedBus || students.length === 0) {
      setError('Please select a bus and load student data first');
      return;
    }

    const headers = [
      'Student Name',
      'Admission No',
      'Class',
      'Section', 
      'Roll Number',
      'Status',
      'Reason',
      'Pickup Point',
      'Marked Time',
      'Parent Contact'
    ];

    const csvData = students.map(student => {
      const record = getAttendanceRecord(student.id);
      return [
        student.fullName,
        student.admissionNo,
        student.currentClass,
        student.currentSection,
        student.rollNumber,
        record?.status || 'NOT_MARKED',
        record?.reason || '',
        student.pickupPoint || '',
        record?.createdAt ? new Date(record.createdAt).toLocaleTimeString() : '',
        student.parentContact || ''
      ];
    });

    const csvContent = [
      `Bus Attendance Report - ${selectedDate}`,
      `Bus: ${buses.find(b => b.id === selectedBus)?.registrationNumber || 'Unknown'}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bus_attendance_${selectedDate}_${buses.find(b => b.id === selectedBus)?.registrationNumber || 'bus'}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Fetch reports data
  const fetchReportsData = async () => {
    if (!selectedBus) {
      setError('Please select a bus first');
      return;
    }

    try {
      setLoadingReports(true);
      const startDate = reportStartDate;
      const endDate = reportEndDate;
      
      // Generate date range
      const dates = [];
      const currentDate = new Date(startDate);
      const lastDate = new Date(endDate);
      
      while (currentDate <= lastDate) {
        dates.push(new Date(currentDate).toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Fetch attendance data for each date
      const reports = [];
      for (const date of dates) {
        try {
          const response = await apiCall(`/api/transport/buses/${selectedBus}/attendance?date=${date}`);
          const attendanceRecords = response.success ? response.data : [];
          
          // Get students for this bus (assuming it's consistent)
          const studentsCount = students.length;
          const presentCount = attendanceRecords.filter((r: AttendanceRecord) => r.status === 'PRESENT').length;
          const absentCount = attendanceRecords.filter((r: AttendanceRecord) => r.status === 'ABSENT').length;
          const lateCount = attendanceRecords.filter((r: AttendanceRecord) => r.status === 'LATE').length;
          const attendancePercentage = studentsCount > 0 ? 
            ((presentCount + lateCount) / studentsCount) * 100 : 0;
          
          reports.push({
            date,
            totalStudents: studentsCount,
            presentStudents: presentCount,
            absentStudents: absentCount,
            lateStudents: lateCount,
            attendancePercentage: Math.round(attendancePercentage * 100) / 100
          });
        } catch (error) {
          console.error(`Error fetching data for ${date}:`, error);
        }
      }
      
      setReportData(reports);
    } catch (error) {
      console.error('Error generating reports:', error);
      setError('Failed to generate reports');
    } finally {
      setLoadingReports(false);
    }
  };

  // Export reports to CSV
  const exportReportsCSV = () => {
    if (reportData.length === 0) {
      setError('No report data to export');
      return;
    }

    const headers = [
      'Date',
      'Total Students',
      'Present',
      'Absent',
      'Late',
      'Attendance %'
    ];

    const csvData = reportData.map(report => [
      report.date,
      report.totalStudents.toString(),
      report.presentStudents.toString(),
      report.absentStudents.toString(),
      report.lateStudents.toString(),
      report.attendancePercentage.toFixed(2) + '%'
    ]);

    const csvContent = [
      `Bus Attendance Report - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`,
      `Bus: ${buses.find(b => b.id === selectedBus)?.registrationNumber || 'Unknown'}`,
      `Period: ${reportStartDate} to ${reportEndDate}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bus_attendance_report_${reportType}_${reportStartDate}_to_${reportEndDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Filter students based on search and status
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const record = attendanceRecords.find(r => r.studentId === student.id);
    const status = record?.status || 'NOT_MARKED';
    
    return matchesSearch && (
      (filterStatus === 'present' && status === 'PRESENT') ||
      (filterStatus === 'absent' && status === 'ABSENT') ||
      (filterStatus === 'late' && status === 'LATE') ||
      (filterStatus === 'not_marked' && status === 'NOT_MARKED')
    );
  });

  // Get attendance record for a student
  const getAttendanceRecord = (studentId: string) => {
    return attendanceRecords.find(r => r.studentId === studentId);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800 border-green-300';
      case 'ABSENT': return 'bg-red-100 text-red-800 border-red-300';
      case 'LATE': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
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

  // Initialize data
  useEffect(() => {
    fetchBuses();
  }, []);

  // Load students and attendance when bus or date changes
  useEffect(() => {
    if (selectedBus) {
      fetchStudentsByBus(selectedBus);
      fetchAttendanceRecords(selectedBus, selectedDate);
    }
  }, [selectedBus, selectedDate]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <Bus className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Bus Attendance</h1>
                  <p className="text-blue-100 text-lg">
                    Track and manage student bus attendance
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    if (selectedBus) {
                      fetchStudentsByBus(selectedBus);
                      fetchAttendanceRecords(selectedBus, selectedDate);
                    }
                  }}
                  className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-200 flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Bus Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Bus
              </label>
              <select
                value={selectedBus}
                onChange={(e) => setSelectedBus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a bus...</option>
                {buses.map(bus => (
                  <option key={bus.id} value={bus.id}>
                    {bus.registrationNumber} - {bus.make} {bus.model} (Capacity: {bus.capacity})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attendance Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Students
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, admission no., roll no."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Filter and Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Students</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="not_marked">Not Marked</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {selectedBus && students.length > 0 && (
                <>
                  <button
                    onClick={() => bulkMarkAttendance('PRESENT')}
                    disabled={saving}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Mark All Present</span>
                  </button>
                  
                  <button
                    onClick={() => bulkMarkAttendance('ABSENT')}
                    disabled={saving}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Mark All Absent</span>
                  </button>

                  <button
                    onClick={exportAttendance}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">{stats.presentStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{stats.absentStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.lateStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${
                  stats.attendancePercentage >= 90 ? 'bg-green-100' :
                  stats.attendancePercentage >= 80 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <Calendar className={`h-6 w-6 ${
                    stats.attendancePercentage >= 90 ? 'text-green-600' :
                    stats.attendancePercentage >= 80 ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Attendance %</p>
                  <p className={`text-2xl font-bold ${
                    stats.attendancePercentage >= 90 ? 'text-green-600' :
                    stats.attendancePercentage >= 80 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {stats.attendancePercentage}%
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div 
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Students List */}
        {selectedBus && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Students on Bus ({filteredStudents.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                <p className="text-gray-600">
                  {selectedBus ? 'No students are assigned to this bus or match your search criteria.' : 'Please select a bus to view students.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class/Section
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pickup Point
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {filteredStudents.map((student, index) => {
                        const record = getAttendanceRecord(student.id);
                        const status = record?.status || 'NOT_MARKED';
                        const isEditing = editingRecord === student.id;

                        return (
                          <motion.tr
                            key={student.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {student.profileImage ? (
                                    <img
                                      className="h-10 w-10 rounded-full object-cover"
                                      src={student.profileImage}
                                      alt={student.fullName}
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                      <User className="h-6 w-6 text-gray-600" />
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {student.fullName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Admission: {student.admissionNo} • Roll: {student.rollNumber}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.currentClass}-{student.currentSection}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {student.pickupPoint || 'Not specified'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                                  {getStatusIcon(status)}
                                  <span className="ml-1">{status.replace('_', ' ')}</span>
                                </span>
                                {record?.reason && (
                                  <span className="text-xs text-gray-500 italic">
                                    Reason: {record.reason}
                                  </span>
                                )}
                                {record?.pickupTime && (
                                  <span className="text-xs text-gray-500">
                                    Time: {new Date(record.pickupTime).toLocaleTimeString()}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => markAttendance(student.id, 'PRESENT', tempReason)}
                                      className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                                    >
                                      Present
                                    </button>
                                    <button
                                      onClick={() => markAttendance(student.id, 'LATE', tempReason)}
                                      className="bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700"
                                    >
                                      Late
                                    </button>
                                    <button
                                      onClick={() => markAttendance(student.id, 'ABSENT', tempReason)}
                                      className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                                    >
                                      Absent
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Reason (optional)"
                                    value={tempReason}
                                    onChange={(e) => setTempReason(e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                  />
                                  <button
                                    onClick={() => {
                                      setEditingRecord(null);
                                      setTempReason('');
                                    }}
                                    className="text-gray-600 hover:text-gray-800 text-xs"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingRecord(student.id);
                                    setTempReason(record?.reason || '');
                                  }}
                                  className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                                >
                                  <Edit className="h-4 w-4" />
                                  <span>Mark</span>
                                </button>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* Reports Section */}
        <div className="bg-white rounded-lg shadow-md mt-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Attendance Reports</h3>
              </div>
              <button
                onClick={() => setShowReports(!showReports)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>{showReports ? 'Hide Reports' : 'Show Reports'}</span>
              </button>
            </div>
          </div>

          {showReports && (
            <div className="p-6">
              {/* Report Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as 'daily' | 'monthly')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily Report</option>
                    <option value="monthly">Monthly Report</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-end space-x-2">
                  <button
                    onClick={fetchReportsData}
                    disabled={!selectedBus || loadingReports}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loadingReports ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}
                    <span>Generate</span>
                  </button>
                  <button
                    onClick={exportReportsCSV}
                    disabled={reportData.length === 0}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Report Data Table */}
              {reportData.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Students
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
                        <tr key={report.date} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Date(report.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.totalStudents}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            {report.presentStudents}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                            {report.absentStudents}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                            {report.lateStudents}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              report.attendancePercentage >= 90 ? 'bg-green-100 text-green-800' :
                              report.attendancePercentage >= 80 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {report.attendancePercentage.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Summary Statistics */}
                  {reportData.length > 1 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Summary Statistics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {reportData.length}
                          </p>
                          <p className="text-sm text-gray-600">Total Days</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {(reportData.reduce((sum, report) => sum + report.attendancePercentage, 0) / reportData.length).toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-600">Average Attendance</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {Math.max(...reportData.map(r => r.attendancePercentage)).toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-600">Best Day</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">
                            {Math.min(...reportData.map(r => r.attendancePercentage)).toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-600">Lowest Day</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {loadingReports && (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600">Generating reports...</p>
                </div>
              )}
              
              {!loadingReports && reportData.length === 0 && selectedBus && (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Data</h3>
                  <p className="text-gray-600">Click "Generate" to create attendance reports for the selected date range.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusAttendance; 