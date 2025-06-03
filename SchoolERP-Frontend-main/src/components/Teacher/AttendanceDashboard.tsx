import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  FaCalendarAlt, 
  FaSearch, 
  FaDownload, 
  FaFilter, 
  FaUsers, 
  FaChartBar, 
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';
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
  const [activeTab, setActiveTab] = useState<'mark' | 'reports' | 'summary'>('mark');
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

  // Handle attendance status change
  const handleStatusChange = (studentId: number, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setStudents(prevStudents => 
      prevStudents.map(student => {
        if (student.id === studentId) {
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

  // Handle bulk status change
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
      handleStatusChange(student.id, bulkStatus);
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
        studentId: student.id,
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
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading attendance dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-xl">
            <h1 className="text-3xl font-bold">Student Attendance Dashboard</h1>
            <p className="mt-2 text-blue-100">Comprehensive attendance management system</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500">
              <div className="flex">
                <FaExclamationTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
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

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'mark', label: 'Mark Attendance', icon: FaUsers },
                { id: 'reports', label: 'Reports', icon: FaFileAlt },
                { id: 'summary', label: 'Summary', icon: FaChartBar }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'mark' | 'reports' | 'summary')}
                  className={`py-4 px-2 text-sm font-medium flex items-center ${
                    activeTab === tab.id 
                      ? 'text-blue-700 border-b-2 border-blue-700' 
                      : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  <tab.icon className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        {activeTab === 'mark' && (
          <div className="bg-white rounded-xl shadow-md">
            {/* Controls */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Date Picker */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date: Date | null) => date && setSelectedDate(date)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      dateFormat="MMMM d, yyyy"
                    />
                  </div>
                </div>

                {/* Class Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={selectedClass}
                    onChange={handleClassChange}
                    className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

                {/* Section Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

                {/* Search */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Students</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Name, Roll No, or Admission No..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="flex flex-wrap items-center gap-4">
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

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaFilter className="mr-2" /> Filters
                </button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-3">Advanced Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
                      <select className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm">
                        <option>All Students</option>
                        <option>Present Only</option>
                        <option>Absent Only</option>
                        <option>Late Only</option>
                        <option>Unmarked Only</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                      <select className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm">
                        <option>Name (A-Z)</option>
                        <option>Name (Z-A)</option>
                        <option>Roll Number</option>
                        <option>Admission Number</option>
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 mr-2">
                        Apply Filters
                      </button>
                      <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400">
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center">
                    <FaUsers className="text-blue-600 text-xl mr-3" />
                    <div>
                      <div className="text-lg font-semibold text-blue-800">{Number.isNaN(stats.total) ? 0 : stats.total || 0}</div>
                      <div className="text-sm text-blue-600">Total Students</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center">
                    <FaCheckCircle className="text-green-600 text-xl mr-3" />
                    <div>
                      <div className="text-lg font-semibold text-green-800">{Number.isNaN(stats.present) ? 0 : stats.present || 0}</div>
                      <div className="text-sm text-green-600">Present</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <div className="flex items-center">
                    <FaTimesCircle className="text-red-600 text-xl mr-3" />
                    <div>
                      <div className="text-lg font-semibold text-red-800">{Number.isNaN(stats.absent) ? 0 : stats.absent || 0}</div>
                      <div className="text-sm text-red-600">Absent</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <div className="flex items-center">
                    <FaExclamationCircle className="text-yellow-600 text-xl mr-3" />
                    <div>
                      <div className="text-lg font-semibold text-yellow-800">{Number.isNaN(stats.late) ? 0 : stats.late || 0}</div>
                      <div className="text-sm text-yellow-600">Late</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {stats.total > 0 && !Number.isNaN(stats.total) && (
                <div className="mt-4 text-center">
                  <span className="text-sm text-gray-600">
                    Attendance Rate: {(() => {
                      const present = Number.isNaN(stats.present) ? 0 : stats.present || 0;
                      const late = Number.isNaN(stats.late) ? 0 : stats.late || 0;
                      const total = Number.isNaN(stats.total) ? 0 : stats.total || 0;
                      return total > 0 ? ((present + late) / total * 100).toFixed(1) : '0.0';
                    })()}%
                  </span>
                </div>
              )}
            </div>

            {/* Student List */}
            {isLoading ? (
              <div className="p-6 text-center">
                <FaSpinner className="animate-spin text-2xl text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-6 text-center">
                <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {students.length === 0 
                    ? 'No students found for the selected class and section.' 
                    : 'No students match your search criteria.'
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendance Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                            {['PRESENT', 'ABSENT', 'LATE'].map(status => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(student.id, status as 'PRESENT' | 'ABSENT' | 'LATE')}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                  student.status === status
                                    ? status === 'PRESENT'
                                      ? 'bg-green-100 text-green-800 border border-green-300'
                                      : status === 'ABSENT'
                                      ? 'bg-red-100 text-red-800 border border-red-300'
                                      : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                                }`}
                              >
                                {status === 'PRESENT' ? 'Present' : status === 'ABSENT' ? 'Absent' : 'Late'}
                              </button>
                            ))}
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
                            className="text-sm border border-gray-300 rounded-md p-1 w-full max-w-xs"
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
                {stats.total > 0 && (
                  <span className="ml-4">
                    Marked: {stats.present + stats.absent + stats.late}/{stats.total}
                  </span>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleExportAttendance}
                  disabled={isSubmitting || !selectedClass}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <FaDownload className="mr-2" />
                  {isSubmitting ? 'Exporting...' : 'Export CSV'}
                </button>
                
                <button
                  onClick={handleSaveAttendance}
                  disabled={isSubmitting || !selectedClass || students.filter(s => s.status).length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Attendance'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Attendance Reports</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center mb-4">
                  <FaFileAlt className="text-blue-600 text-2xl mr-3" />
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
                  <FaChartBar className="text-green-600 text-2xl mr-3" />
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
                  <FaUsers className="text-purple-600 text-2xl mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">Student Reports</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Individual student attendance reports with detailed breakdowns.
                </p>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
                  Student Reports
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Attendance Summary</h2>
            
            <div className="text-center py-12">
              <FaChartBar className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                Summary features are coming soon!
              </p>
              <p className="text-gray-400 text-sm mt-2">
                This will include school-wide statistics, class comparisons, and trend analysis.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceDashboard; 