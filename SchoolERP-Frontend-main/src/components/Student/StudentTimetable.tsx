import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Book,
  MapPin,
  User,
  RefreshCw,
  XCircle,
  Download,
  Eye
} from 'lucide-react';
import { apiGet, ApiError } from '../../utils/authApi';

// Types
interface TimetableEntry {
  id: string;
  className: string;
  section: string;
  subjectName: string;
  teacherId: number;
  day: string;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  teacherName?: string;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
}

interface StudentInfo {
  id: string;
  fullName: string;
  currentSession?: {
    class: string;
    section: string;
  };
}

// Constants
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

interface StudentTimetableProps {
  userRole?: 'student' | 'parent';
  studentId?: string;
}

const StudentTimetable: React.FC<StudentTimetableProps> = ({ 
  userRole = 'student',
  studentId 
}) => {
  // State
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('');

  // Utility functions
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getCurrentDay = () => {
    const today = new Date();
    const dayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (dayIndex === 0) return 'MONDAY'; // If Sunday, show Monday
    return DAYS[dayIndex - 1] || 'MONDAY';
  };

  // Get student info from localStorage or props
  const getStudentInfo = () => {
    try {
      if (userRole === 'parent' && studentId) {
        // For parent role, studentId should be provided
        return { id: studentId };
      } else {
        // For student role, get from localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
          return JSON.parse(userData);
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing student data:', error);
      return null;
    }
  };

  // Fetch student information
  const fetchStudentInfo = async () => {
    try {
      const student = getStudentInfo();
      if (!student?.id) {
        setError('Student information not found');
        return;
      }

      // Fetch student details to get class and section
      const response = await apiGet(`/students/${student.id}`);
      if (response) {
        setStudentInfo(response);
      }
    } catch (error) {
      console.error('Error fetching student info:', error);
      setError('Failed to load student information');
    }
  };

  // Fetch timetable data for student's class
  const fetchTimetableData = async () => {
    try {
      if (!studentInfo?.currentSession?.class || !studentInfo?.currentSession?.section) {
        return;
      }

      const { class: className, section } = studentInfo.currentSession;
      
      // Fetch timetable for the specific class and section
      const response = await apiGet(`/timetable/class/${className}/section/${section}`);
      
      if (response && Array.isArray(response)) {
        setTimetableData(response);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setError('Failed to load timetable data');
    }
  };

  // Fetch time slots
  const fetchTimeSlots = async () => {
    try {
      const response = await apiGet('/timetable/time-slots');
      if (response && Array.isArray(response)) {
        setTimeSlots(response);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await fetchStudentInfo();
    };
    
    initializeData();
  }, [userRole, studentId]);

  // Fetch timetable when student info is available
  useEffect(() => {
    if (studentInfo?.currentSession?.class && studentInfo?.currentSession?.section) {
      Promise.all([
        fetchTimetableData(),
        fetchTimeSlots()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [studentInfo]);

  // Set current day as default
  useEffect(() => {
    if (!selectedDay) {
      setSelectedDay(getCurrentDay());
    }
  }, []);

  // Get entries for a specific time slot and day
  const getCellEntries = (timeSlotId: string, day: string) => {
    const timeSlot = timeSlots.find(ts => ts.id === timeSlotId);
    return timetableData.filter(
      entry => entry.startTime === timeSlot?.startTime && 
               entry.endTime === timeSlot?.endTime &&
               entry.day.toUpperCase() === day
    );
  };

  // Get today's schedule
  const getTodaySchedule = () => {
    const today = getCurrentDay();
    const todayEntries: Array<TimetableEntry & { timeSlot: TimeSlot }> = [];
    
    timeSlots.forEach(timeSlot => {
      const entries = timetableData.filter(
        entry => entry.startTime === timeSlot.startTime && 
                 entry.endTime === timeSlot.endTime &&
                 entry.day.toUpperCase() === today
      );
      
      entries.forEach(entry => {
        todayEntries.push({ ...entry, timeSlot });
      });
    });
    
    return todayEntries.sort((a, b) => a.timeSlot.startTime.localeCompare(b.timeSlot.startTime));
  };

  // Export timetable as text
  const exportTimetable = () => {
    let exportText = `Timetable for ${studentInfo?.fullName}\n`;
    exportText += `Class: ${studentInfo?.currentSession?.class} ${studentInfo?.currentSession?.section}\n\n`;
    
    DAYS.forEach(day => {
      exportText += `${day}:\n`;
      timeSlots.forEach(timeSlot => {
        const entries = getCellEntries(timeSlot.id, day);
        if (entries.length > 0) {
          entries.forEach(entry => {
            exportText += `  ${formatTime(timeSlot.startTime)} - ${formatTime(timeSlot.endTime)}: ${entry.subjectName}`;
            if (entry.teacherName) exportText += ` (${entry.teacherName})`;
            if (entry.roomNumber) exportText += ` - Room ${entry.roomNumber}`;
            exportText += '\n';
          });
        }
      });
      exportText += '\n';
    });
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable_${studentInfo?.fullName?.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render cell content
  const renderCell = (timeSlotId: string, day: string) => {
    const entries = getCellEntries(timeSlotId, day);
    
    if (entries.length === 0) {
      return (
        <div className="h-14 border border-gray-200 bg-gray-50 flex items-center justify-center">
          <span className="text-gray-400 text-xs font-medium">Free</span>
        </div>
      );
    }

    return (
      <div className="h-14 border border-gray-200 overflow-hidden">
        {entries.slice(0, 1).map((entry, index) => (
          <div
            key={index}
            className="h-full p-1 text-xs bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 transition-colors duration-200 border-l-3 border-blue-500"
          >
            <div className="flex items-center justify-between h-full">
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="font-semibold text-blue-900 truncate text-xs">
                  {entry.subjectName}
                </div>
                <div className="flex items-center space-x-1">
                  {entry.teacherName && (
                    <span className="text-blue-700 truncate text-xs">
                      {entry.teacherName.split(' ')[0]}
                    </span>
                  )}
                  {entry.roomNumber && entry.teacherName && (
                    <span className="text-blue-400">•</span>
                  )}
                  {entry.roomNumber && (
                    <div className="text-blue-600 flex items-center text-xs">
                      <MapPin className="h-2 w-2 mr-0.5 flex-shrink-0" />
                      <span>{entry.roomNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {entries.length > 1 && (
          <div className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-1 rounded-tl">
            +{entries.length - 1}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Timetable</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const todaySchedule = getTodaySchedule();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-3 mb-3 md:mb-0">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {userRole === 'parent' ? 'Student Timetable' : 'My Timetable'}
              </h1>
              <p className="text-blue-100 text-sm">
                {studentInfo?.fullName} - Class {studentInfo?.currentSession?.class} {studentInfo?.currentSession?.section}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={exportTimetable}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-md hover:bg-opacity-30 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Schedule Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Clock className="h-5 w-5 text-blue-600 mr-2" />
          Today's Schedule ({getCurrentDay()})
        </h2>
        
        {todaySchedule.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No classes scheduled for today</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {todaySchedule.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-blue-900">
                      {formatTime(entry.timeSlot.startTime)}
                    </div>
                    <div className="text-xs text-blue-600">
                      {formatTime(entry.timeSlot.endTime)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Book className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">{entry.subjectName}</div>
                      {entry.teacherName && (
                        <div className="text-sm text-gray-600 flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {entry.teacherName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {entry.roomNumber && (
                  <div className="text-sm text-blue-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Room {entry.roomNumber}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Timetable */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Weekly Timetable</h2>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="w-28 px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider bg-gradient-to-r from-slate-600 to-slate-700">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Time
                  </th>
                  {DAYS.map((day, index) => (
                    <th
                      key={day}
                      className={`px-2 py-2 text-center text-xs font-medium uppercase tracking-wider ${
                        day === getCurrentDay()
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                          : index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                            index === 1 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' :
                            index === 2 ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' :
                            index === 3 ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' :
                            index === 4 ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white' :
                            'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white'
                      }`}
                    >
                      {day.substring(0, 3)}
                      {day === getCurrentDay() && (
                        <div className="text-xs font-normal lowercase text-emerald-100">(Today)</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot.id}>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-white bg-gradient-to-r from-slate-600 to-slate-700 font-medium">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">{formatTime(timeSlot.startTime)}</span>
                        <span className="text-xs opacity-75">
                          {formatTime(timeSlot.endTime)}
                        </span>
                      </div>
                    </td>
                    {DAYS.map((day) => (
                      <td key={`${timeSlot.id}-${day}`} className="p-0">
                        {renderCell(timeSlot.id, day)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable; 