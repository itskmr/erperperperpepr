import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Calendar, 
  Search, 
  Download, 
  Filter, 
  Users, 
  BarChart3,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

// Import attendance service
import attendanceService, { 
  Student, 
  ClassWithSections, 
  AttendanceStats 
} from '../../services/attendanceService';

interface AttendanceDashboardProps {
  teacherId?: number;
}

const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({ teacherId = 1 }) => {
  // State management
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassWithSections[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({ total: 0, present: 0, absent: 0, late: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'reports' | 'summary'>('daily');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bulkStatus, setBulkStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE' | ''>('');

  // Fetch available classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First try to get teacher-specific classes
        try {
          const teacherClasses = await attendanceService.getTeacherClasses(teacherId);
          setClasses(teacherClasses);
          
          if (teacherClasses.length > 0) {
            setSelectedClass(teacherClasses[0].className);
            if (teacherClasses[0].sections && teacherClasses[0].sections.length > 0) {
              setSelectedSection(teacherClasses[0].sections[0]);
            }
          }
        } catch (teacherError) {
          console.warn('Failed to fetch teacher classes, trying general classes:', teacherError);
          
          // Fallback to general classes endpoint
          try {
            const generalClasses = await attendanceService.getAvailableClasses();
            setClasses(generalClasses);
            
            if (generalClasses.length > 0) {
              setSelectedClass(generalClasses[0].className);
              if (generalClasses[0].sections && generalClasses[0].sections.length > 0) {
                setSelectedSection(generalClasses[0].sections[0]);
              }
            }
          } catch (generalError) {
            console.error('Failed to fetch general classes:', generalError);
            setError('Failed to load classes. Please ensure you are logged in and try again.');
          }
        }
      } catch (error) {
        console.error('Error in fetchClasses:', error);
        setError('Failed to load classes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClasses();
  }, [teacherId]);

  // Fetch students and attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!selectedClass) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        
        // Try to get attendance data first
        try {
          const data = await attendanceService.getAttendanceData(
            selectedClass,
            formattedDate,
            teacherId,
            selectedSection || undefined
          );
          
          setStudents(data.students || []);
          setStats(data.stats || { total: 0, present: 0, absent: 0, late: 0 });
        } catch (attendanceError) {
          console.warn('Failed to get attendance data, trying students by class:', attendanceError);
          
          // Fallback to getting students by class
          try {
            const studentsData = await attendanceService.getStudentsByClass(
              selectedClass,
              selectedSection || undefined
            );
            
            setStudents(studentsData || []);
            setStats({ 
              total: studentsData.length, 
              present: 0, 
              absent: 0, 
              late: 0 
            });
          } catch (studentsError) {
            console.error('Failed to get students by class:', studentsError);
            setError('Failed to load students. Please try again.');
          }
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setError('Failed to load attendance data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (selectedClass) {
      fetchAttendanceData();
    }
  }, [selectedClass, selectedSection, selectedDate, teacherId]);

  // Filter students based on search query
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (student.rollNumber && student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (student.admissionNo && student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle attendance status change - Fix type issue
  const handleStatusChange = (studentId: string | number, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    const numericStudentId = typeof studentId === 'string' ? parseInt(studentId) : studentId;
    
    setStudents(prevStudents => 
      prevStudents.map(student => {
        const currentStudentId = typeof student.id === 'string' ? parseInt(student.id) : student.id;
        if (currentStudentId === numericStudentId) {
          const oldStatus = student.status;
          
          // Update stats
          setStats(prevStats => {
            const newStats = { ...prevStats };
            
            // Ensure all stats are numbers and not NaN
            if (Number.isNaN(newStats.total)) newStats.total = 0;
            if (Number.isNaN(newStats.present)) newStats.present = 0;
            if (Number.isNaN(newStats.absent)) newStats.absent = 0;
            if (Number.isNaN(newStats.late)) newStats.late = 0;
            
            // Remove old status count
            if (oldStatus) {
              const oldKey = oldStatus.toLowerCase() as keyof AttendanceStats;
              if (oldKey !== 'total' && newStats[oldKey] > 0) {
                newStats[oldKey] = Math.max(0, newStats[oldKey] - 1);
              }
            }
            
            // Add new status count
            const newKey = status.toLowerCase() as keyof AttendanceStats;
            if (newKey !== 'total') {
              newStats[newKey] = (newStats[newKey] || 0) + 1;
            }
            
            return newStats;
          });
          
          return { ...student, status };
        }
        return student;
      })
    );
  };

  // Handle bulk status change - Fix type issue
  const handleBulkStatusChange = () => {
    if (!bulkStatus) {
      toast.warning('Please select a status for bulk operation');
      return;
    }
    
    const studentsToUpdate = filteredStudents.filter(student => !student.status);
    
    if (studentsToUpdate.length === 0) {
      toast.warning('No unmarked students found');
      return;
    }
    
    studentsToUpdate.forEach(student => {
      const studentId = typeof student.id === 'string' ? parseInt(student.id) : student.id;
      handleStatusChange(studentId, bulkStatus);
    });
    
    toast.success(`Marked ${studentsToUpdate.length} students as ${bulkStatus}`);
    setBulkStatus('');
  };

  // Save attendance
  const handleSaveAttendance = async () => {
    if (!selectedClass || students.length === 0) {
      toast.warning('No students to mark attendance for');
      return;
    }
    
    const studentsWithStatus = students.filter(student => student.status);
    
    if (studentsWithStatus.length === 0) {
      toast.warning('Please mark attendance for at least one student');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const attendanceData = studentsWithStatus.map(student => ({
        studentId: typeof student.id === 'string' ? parseInt(student.id) : student.id,
        status: student.status as string,
        notes: student.notes || ''
      }));
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const response = await attendanceService.markAttendance(
        formattedDate,
        selectedClass,
        teacherId,
        attendanceData,
        selectedSection || undefined
      );
      
      if (response.success) {
        toast.success(`Attendance saved successfully for ${studentsWithStatus.length} students!`);
      } else {
        toast.error('Error saving attendance: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to save attendance:', error);
      toast.error('Failed to save attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export attendance
  const handleExportAttendance = async () => {
    if (!selectedClass) {
      toast.warning('Please select a class to export');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const blob = await attendanceService.exportAttendanceData(
        selectedClass,
        formattedDate,
        selectedSection || undefined
      );
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${selectedClass}_${selectedSection || 'all'}_${formattedDate}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Attendance data exported successfully!');
    } catch (error) {
      console.error('Failed to export attendance:', error);
      toast.error('Failed to export attendance data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle class change
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newClass = e.target.value;
    setSelectedClass(newClass);
    
    // Reset section
    const classObj = classes.find(c => c.className === newClass);
    if (classObj && classObj.sections.length > 0) {
      setSelectedSection(classObj.sections[0]);
    } else {
      setSelectedSection('');
    }
  };

  // Loading state
  if (isLoading && classes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading attendance dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <h1 className="text-3xl font-bold">Student Attendance Management</h1>
            <p className="mt-2 text-blue-100">Track and manage student attendance efficiently</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-sm text-red-600 hover:text-red-800 underline mt-1"
                  >
                    Click here to refresh the page
                  </button>
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
                    ? 'text-blue-700 border-b-2 border-blue-700' 
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                <Users className="inline mr-2" />
                Daily Attendance
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-2 font-medium text-sm focus:outline-none ${
                  activeTab === 'reports' 
                    ? 'text-blue-700 border-b-2 border-blue-700' 
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                <BarChart3 className="inline mr-2" />
                Reports
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`py-4 px-2 font-medium text-sm focus:outline-none ${
                  activeTab === 'summary' 
                    ? 'text-blue-700 border-b-2 border-blue-700' 
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                <BarChart3 className="inline mr-2" />
                Summary
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
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        dateFormat="MMMM d, yyyy"
                      />
                    </div>

                    <div>
                      <select
                        value={selectedClass}
                        onChange={handleClassChange}
                        className="border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                      >
                        <option value="">Select Class</option>
                        {classes.map(cls => (
                          <option key={cls.className} value={cls.className}>
                            {cls.className}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading || !selectedClass}
                      >
                        <option value="">All Sections</option>
                        {classes
                          .find(c => c.className === selectedClass)
                          ?.sections.map(section => (
                            <option key={section} value={section}>
                              Section {section}
                            </option>
                          ))}
                      </select>
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
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {showFilters && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-700 mb-2">Bulk Actions</h3>
                    <div className="flex items-center space-x-2">
                      <select
                        value={bulkStatus}
                        onChange={(e) => setBulkStatus(e.target.value as 'PRESENT' | 'ABSENT' | 'LATE' | '')}
                        className="border border-gray-300 rounded-md py-1 px-3 text-sm"
                      >
                        <option value="">Select Status</option>
                        <option value="PRESENT">Present</option>
                        <option value="ABSENT">Absent</option>
                        <option value="LATE">Late</option>
                      </select>
                      <button
                        onClick={handleBulkStatusChange}
                        disabled={!bulkStatus}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        Mark All Unmarked
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Statistics */}
              <div className="p-6 bg-white border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Students</p>
                        <p className="text-2xl font-bold">{Number.isNaN(stats.total) ? 0 : stats.total || 0}</p>
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
                        <p className="text-2xl font-bold">{Number.isNaN(stats.present) ? 0 : stats.present || 0}</p>
                      </div>
                      <div className="bg-green-400 p-3 rounded-full">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm font-medium">Absent</p>
                        <p className="text-2xl font-bold">{Number.isNaN(stats.absent) ? 0 : stats.absent || 0}</p>
                      </div>
                      <div className="bg-red-400 p-3 rounded-full">
                        <XCircle className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm font-medium">Late</p>
                        <p className="text-2xl font-bold">{Number.isNaN(stats.late) ? 0 : stats.late || 0}</p>
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
                        <p className="text-2xl font-bold">
                          {(() => {
                            const present = Number.isNaN(stats.present) ? 0 : stats.present || 0;
                            const late = Number.isNaN(stats.late) ? 0 : stats.late || 0;
                            const total = Number.isNaN(stats.total) ? 0 : stats.total || 0;
                            return total > 0 ? ((present + late) / total * 100).toFixed(1) : '0.0';
                          })()}%
                        </p>
                      </div>
                      <div className="bg-purple-400 p-3 rounded-full">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading indicator for student list */}
              {isLoading && (
                <div className="p-6 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                </div>
              )}

              {/* No students message */}
              {!isLoading && filteredStudents.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No students found matching your criteria.</p>
                </div>
              )}

              {/* Student List Table - Updated to match teacher attendance styling */}
              {!isLoading && filteredStudents.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Roll No.
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map(student => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                                  {student.name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">Admission: {student.admissionNo}</div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.rollNumber || 'N/A'}</div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStatusChange(student.id, 'PRESENT')}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  student.status === 'PRESENT' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800 hover:bg-green-50'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  student.status === 'ABSENT' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-gray-100 text-gray-800 hover:bg-red-50'
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                onClick={() => handleStatusChange(student.id, 'LATE')}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  student.status === 'LATE' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-gray-100 text-gray-800 hover:bg-yellow-50'
                                }`}
                              >
                                Late
                              </button>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={student.notes || ''}
                              onChange={(e) => {
                                const newNotes = e.target.value;
                                setStudents(prev => 
                                  prev.map(s => 
                                    s.id === student.id ? { ...s, notes: newNotes } : s
                                  )
                                );
                              }}
                              placeholder="Add notes..."
                              className="w-full text-sm border border-gray-300 rounded-md p-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Showing {filteredStudents.length} of {students.length} students
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleExportAttendance}
                    disabled={isSubmitting || !selectedClass}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <Download className="mr-2" />
                    {isSubmitting ? 'Exporting...' : 'Export CSV'}
                  </button>
                  
                  <button
                    onClick={handleSaveAttendance}
                    disabled={isSubmitting || !selectedClass || students.filter(s => s.status).length === 0}
                    className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                      ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Attendance'}
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'reports' && (
            <div className="p-6">
              <div className="bg-white">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Student Attendance Reports</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-4">
                      <BarChart3 className="text-blue-600 text-2xl mr-3" />
                      <h3 className="text-lg font-medium text-gray-900">Monthly Report</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Generate detailed monthly attendance reports for classes and individual students.
                    </p>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                      Generate Report
                    </button>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="flex items-center mb-4">
                      <BarChart3 className="text-green-600 text-2xl mr-3" />
                      <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      View comprehensive analytics and trends for attendance patterns.
                    </p>
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                      View Analytics
                    </button>
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <div className="flex items-center mb-4">
                      <Users className="text-purple-600 text-2xl mr-3" />
                      <h3 className="text-lg font-medium text-gray-900">Class Reports</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Class-wise attendance reports with detailed breakdowns.
                    </p>
                    <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
                      Class Reports
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="p-6">
              <div className="bg-white">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Attendance Summary</h2>
                
                <div className="text-center py-12">
                  <BarChart3 className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    Summary features are coming soon!
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    This will include school-wide statistics, class comparisons, and trend analysis.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard; 