import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaCalendarAlt, FaSearch, FaDownload, FaFilter, FaEye, FaEdit, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify'; // Assuming react-toastify is used in your project
import axios from 'axios';

// Import attendance service
import attendanceService, { 
  Student, 
  ClassWithSections, 
  AttendanceStats, 
  AttendanceData 
} from '../../services/attendanceService';

// Types for component state
interface Class {
  className: string;
  sections: string[];
}

interface AttendanceRecord {
  id: number;
  studentId: number;
  date: Date;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  notes?: string;
}

const AttendanceManagement: React.FC = () => {
  // States
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({ total: 0, present: 0, absent: 0, late: 0, excused: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'report'>('daily');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get the teacher ID from localStorage or context
  // This is just an example; you should replace it with your actual auth implementation
  const teacherId = 1; // Replace with actual teacher ID from your auth system
  
  // Fetch classes taught by the teacher
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        const classesTaught = await attendanceService.getTeacherClasses(teacherId);
        setClasses(classesTaught);
        
        if (classesTaught.length > 0) {
          setSelectedClass(classesTaught[0].className);
          if (classesTaught[0].sections && classesTaught[0].sections.length > 0) {
            setSelectedSection(classesTaught[0].sections[0]);
          }
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch classes:', err);
        setError('Failed to load classes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClasses();
  }, [teacherId]);
  
  // Fetch attendance data when class or date changes
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!selectedClass) return;
      
      try {
        setIsLoading(true);
        
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const data = await attendanceService.getAttendanceData(
          selectedClass,
          formattedDate,
          teacherId,
          selectedSection || undefined
        );
        
        setStudents(data.students);
        setStats(data.stats);
        
        // Convert API data to AttendanceRecord format
        const records: AttendanceRecord[] = data.students
          .filter(student => student.status)
          .map(student => ({
            id: Date.now() + student.id, // Temporary ID for frontend use
            studentId: student.id,
            date: selectedDate,
            status: student.status as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
            notes: student.notes || undefined
          }));
        
        setAttendanceRecords(records);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch attendance data:', err);
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
    (student.rollNumber && student.rollNumber.includes(searchQuery))
  );

  // Handle attendance status change
  const handleStatusChange = (studentId: number, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    const existingRecord = attendanceRecords.find(
      record => record.studentId === studentId
    );

    if (existingRecord) {
      // Update existing record
      setAttendanceRecords(prevRecords => 
        prevRecords.map(record => 
          record.studentId === studentId ? { ...record, status } : record
        )
      );
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        id: Date.now(),
        studentId,
        date: selectedDate,
        status
      };
      setAttendanceRecords(prev => [...prev, newRecord]);
    }
    
    // Update student status in the students list
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.id === studentId ? { ...student, status } : student
      )
    );
    
    // Update stats
    updateStats(status, existingRecord?.status);
  };

  // Update attendance statistics
  const updateStats = (newStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED', oldStatus?: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | null) => {
    setStats(prevStats => {
      const updatedStats = { ...prevStats };
      
      // Decrement old status count if exists
      if (oldStatus) {
        const oldStatusKey = oldStatus.toLowerCase() as 'present' | 'absent' | 'late' | 'excused';
        updatedStats[oldStatusKey] = Math.max(0, updatedStats[oldStatusKey] - 1);
      }
      
      // Increment new status count
      const newStatusKey = newStatus.toLowerCase() as 'present' | 'absent' | 'late' | 'excused';
      updatedStats[newStatusKey] += 1;
      
      return updatedStats;
    });
  };

  // Get attendance status for a student
  const getAttendanceStatus = (studentId: number): 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | null => {
    const student = students.find(s => s.id === studentId);
    return student?.status || null;
  };

  // Add notes to a student's attendance
  const handleAddNotes = (studentId: number, notes: string) => {
    // Update the attendance record
    setAttendanceRecords(prevRecords => 
      prevRecords.map(record => 
        record.studentId === studentId ? { ...record, notes } : record
      )
    );
    
    // Update the student's notes in the students list
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.id === studentId ? { ...student, notes } : student
      )
    );
  };

  // Save all attendance records
  const handleSaveAttendance = async () => {
    if (!students || students.length === 0) {
      toast.warning('No students to mark attendance for');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare attendance data with more validation
      const validStudents = students.filter(student => 
        student && 
        typeof student.id === 'number' && 
        student.status
      );
      
      if (validStudents.length === 0) {
        toast.warning('Please mark attendance for at least one student');
        setIsSubmitting(false);
        return;
      }
      
      // Create properly typed attendance data for API
      const attendanceData = validStudents.map(student => ({
        studentId: student.id,
        status: student.status as string, // Cast to string to satisfy type requirements
        notes: student.notes || ""
      }));
      
      console.log("Attendance data being sent:", attendanceData);
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Use attendanceService with proper typing
      const response = await attendanceService.markAttendance(
        formattedDate,
        selectedClass,
        teacherId || 1,
        attendanceData,
        selectedSection
      );
      
      if (response.success) {
        toast.success('Attendance saved successfully!');
        
        // Refresh data after saving
        try {
          const refreshedData = await attendanceService.getAttendanceData(
            selectedClass,
            formattedDate,
            teacherId,
            selectedSection
          );
          
          if (refreshedData && refreshedData.students) {
            setStudents(refreshedData.students);
            setStats(refreshedData.stats);
          }
        } catch (refreshError) {
          console.error("Error refreshing data:", refreshError);
          // Still consider this a success since the save worked
        }
      } else {
        toast.error('Error: ' + (response.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Failed to save attendance:', error);
      let errorMessage = 'Unknown error occurred';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`Failed to save attendance: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export attendance as CSV
  const exportAttendance = async () => {
    try {
      setIsSubmitting(true);
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const blob = await attendanceService.exportAttendanceData(
        selectedClass,
        formattedDate,
        selectedSection || undefined
      );
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${selectedClass}_${formattedDate}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Attendance data exported successfully!');
    } catch (err) {
      console.error('Failed to export attendance:', err);
      toast.error('Failed to export attendance data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle student note edit
  const handleEditNotes = (studentId: number) => {
    setEditingStudentId(studentId);
    setIsEditing(true);
  };

  // Handle class change
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newClass = e.target.value;
    setSelectedClass(newClass);
    
    // Reset section if needed
    const classObj = classes.find(c => c.className === newClass);
    if (classObj && classObj.sections.length > 0) {
      setSelectedSection(classObj.sections[0]);
    } else {
      setSelectedSection('');
    }
  };

  if (isLoading && classes.length === 0) {
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
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <h1 className="text-3xl font-bold">Attendance Management</h1>
            <p className="mt-2 text-blue-100">Track and manage student attendance efficiently</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-red-500" />
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
                    ? 'text-blue-700 border-b-2 border-blue-700' 
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                Daily Attendance
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`py-4 px-2 font-medium text-sm focus:outline-none ${
                  activeTab === 'report' 
                    ? 'text-blue-700 border-b-2 border-blue-700' 
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                Attendance Reports
              </button>
            </div>
          </div>

          {activeTab === 'daily' ? (
            <>
              {/* Controls */}
              <div className="p-6 border-b border-gray-200 bg-white">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date | null) => date && setSelectedDate(date)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        dateFormat="MMMM d, yyyy"
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <select
                        value={selectedClass}
                        onChange={handleClassChange}
                        className="border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {classes.map(cls => (
                          <option key={cls.className} value={cls.className}>
                            {cls.className}
                          </option>
                        ))}
                      </select>
                      
                      {/* Section selector */}
                      {(() => {
                        const foundClass = classes.find(c => c.className === selectedClass);
                        return selectedClass && foundClass?.sections && foundClass.sections.length > 0 && (
                          <select
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            className="border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            {foundClass.sections.map(section => (
                              <option key={section} value={section}>
                                Section {section}
                              </option>
                            ))}
                          </select>
                        );
                      })()}
                    </div>
                    
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FaFilter className="mr-2" /> Filters
                    </button>
                  </div>
                  
                  <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
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
                    <h3 className="font-medium text-gray-700 mb-2">Additional Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                          <option>All</option>
                          <option>Present</option>
                          <option>Absent</option>
                          <option>Late</option>
                          <option>Excused</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <select className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                          <option>Name (A-Z)</option>
                          <option>Name (Z-A)</option>
                          <option>Roll Number</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">View</label>
                        <select className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                          <option>All Students</option>
                          <option>Only Marked</option>
                          <option>Not Marked</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 mr-2">
                        Reset
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="p-6 bg-white border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="text-lg font-medium text-blue-800">{stats.total}</div>
                    <div className="text-sm text-blue-600">Total Students</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="text-lg font-medium text-green-800">{stats.present}</div>
                    <div className="text-sm text-green-600">Present</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <div className="text-lg font-medium text-red-800">{stats.absent}</div>
                    <div className="text-sm text-red-600">Absent</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <div className="text-lg font-medium text-yellow-800">{stats.late}</div>
                    <div className="text-sm text-yellow-600">Late</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <div className="text-lg font-medium text-purple-800">{stats.excused}</div>
                    <div className="text-sm text-purple-600">Excused</div>
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
              {!isLoading && students.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No students found for the selected class and section.</p>
                </div>
              )}

              {/* Attendance Table */}
              {!isLoading && students.length > 0 && (
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
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map(student => {
                        const status = student.status;
                        
                        return (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                    {student.name.charAt(0)}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                  <div className="text-sm text-gray-500">{student.admissionNo}</div>
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
                                    status === 'PRESENT' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800 hover:bg-green-50'
                                  }`}
                                >
                                  Present
                                </button>
                                <button
                                  onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    status === 'ABSENT' 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-gray-100 text-gray-800 hover:bg-red-50'
                                  }`}
                                >
                                  Absent
                                </button>
                                <button
                                  onClick={() => handleStatusChange(student.id, 'LATE')}
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    status === 'LATE' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-gray-100 text-gray-800 hover:bg-yellow-50'
                                  }`}
                                >
                                  Late
                                </button>
                                <button
                                  onClick={() => handleStatusChange(student.id, 'EXCUSED')}
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    status === 'EXCUSED' 
                                      ? 'bg-purple-100 text-purple-800' 
                                      : 'bg-gray-100 text-gray-800 hover:bg-purple-50'
                                  }`}
                                >
                                  Excused
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isEditing && editingStudentId === student.id ? (
                                <input 
                                  type="text"
                                  defaultValue={student.notes || ''}
                                  onBlur={(e) => {
                                    handleAddNotes(student.id, e.target.value);
                                    setIsEditing(false);
                                    setEditingStudentId(null);
                                  }}
                                  className="border border-gray-300 rounded-md p-1 text-sm w-full"
                                  autoFocus
                                />
                              ) : (
                                <div className="text-sm text-gray-900">
                                  {student.notes ? student.notes : 
                                    <span className="text-gray-400 italic">No notes</span>}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEditNotes(student.id)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                <FaEdit />
                              </button>
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
                  Showing {filteredStudents.length} of {students.length} students
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={exportAttendance}
                    disabled={isSubmitting || students.length === 0}
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium 
                      ${isSubmitting ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
                  >
                    <FaDownload className="mr-2" /> Export
                  </button>
                  <button 
                    onClick={handleSaveAttendance}
                    disabled={isSubmitting || students.length === 0}
                    className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                      ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Attendance'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Reports tab
            <div className="p-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      The reports section is under development. Please check back soon!
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Report</h3>
                  <p className="text-gray-600 mb-4">View attendance statistics for the entire month</p>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200">
                    <FaEye className="mr-2" /> View Report
                  </button>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Student Report</h3>
                  <p className="text-gray-600 mb-4">View individual student attendance patterns</p>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200">
                    <FaEye className="mr-2" /> View Report
                  </button>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Class Comparison</h3>
                  <p className="text-gray-600 mb-4">Compare attendance across different classes</p>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200">
                    <FaEye className="mr-2" /> View Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;