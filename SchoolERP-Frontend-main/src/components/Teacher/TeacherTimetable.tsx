import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/authApi';

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
  isMyClass?: boolean;
  teacher?: {
    id: number;
    fullName: string;
    subjects?: string;
  };
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
}

interface Teacher {
  id: number;
  fullName: string;
  designation?: string;
  subjects?: string; // JSON string of subjects
}

// Predefined data
// const CLASS_OPTIONS = [...];
// const SECTION_OPTIONS = [...];
// const ALL_SUBJECTS = [...];

// Constants
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const TeacherTimetable: React.FC = () => {
  // State
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [teacherData, setTeacherData] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  
  // Delete confirmation states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [deletingEntryTitle, setDeletingEntryTitle] = useState<string>('');

  // Form data
  const [formData, setFormData] = useState({
    className: '',
    section: '',
    subjectName: '',
    roomNumber: ''
  });

  // UI states
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Utility functions
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => setSnackbar({ open: false, message: '', severity: 'success' }), 5000);
  };

  // Get authenticated teacher info
  const getTeacherInfo = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Error parsing teacher data:', error);
      return null;
    }
  };

  // Fetch teacher's timetable data
  const fetchTimetableData = async () => {
    try {
      setLoading(true);
      const teacher = getTeacherInfo();
      
      if (!teacher?.id) {
        setError('Teacher information not found');
        return;
      }

      // Fetch all timetable entries for the school
      const response = await apiGet('/timetable');
      
      if (response && Array.isArray(response)) {
        // Filter entries where the teacher is assigned or can view
        const filteredEntries = response.filter((entry: TimetableEntry) => 
          entry.teacherId === teacher.id
        );
        
        // Mark teacher's own classes
        const entriesWithFlags = filteredEntries.map((entry: TimetableEntry) => ({
          ...entry,
          isMyClass: entry.teacherId === teacher.id
        }));
        
        setTimetableData(entriesWithFlags);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setError('Failed to load timetable data');
    } finally {
      setLoading(false);
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

  // Fetch teacher data
  const fetchTeacherData = async () => {
    try {
      const teacher = getTeacherInfo();
      if (teacher?.id) {
        const response = await apiGet(`/teachers/${teacher.id}`);
        if (response && typeof response === 'object') {
          setTeacherData(response as Teacher);
        }
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    }
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchTimetableData(),
        fetchTimeSlots(),
        fetchTeacherData()
      ]);
    };
    
    initializeData();
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

  // Handle cell click for adding new entry
  const handleCellClick = (timeSlotId: string, day: string) => {
    const timeSlot = timeSlots.find(ts => ts.id === timeSlotId);
    if (!timeSlot) return;

    setSelectedTimeSlot(timeSlotId);
    setSelectedDay(day);
    setFormData({
      className: '',
      section: '',
      subjectName: '',
      roomNumber: ''
    });
    setIsAddModalOpen(true);
  };

  // Handle edit entry
  const handleEditEntry = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setFormData({
      className: entry.className,
      section: entry.section,
      subjectName: entry.subjectName,
      roomNumber: entry.roomNumber || ''
    });
    setIsEditModalOpen(true);
  };

  // Save new entry
  const handleSaveEntry = async () => {
    try {
      const timeSlot = timeSlots.find(ts => ts.id === selectedTimeSlot);
      if (!timeSlot || !teacherData) return;

      const entryData = {
        className: formData.className,
        section: formData.section,
        subjectName: formData.subjectName,
        teacherId: teacherData.id,
        day: selectedDay,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        roomNumber: formData.roomNumber
      };

      await apiPost('/timetable', entryData);
      showSnackbar('Timetable entry added successfully!');
      setIsAddModalOpen(false);
      fetchTimetableData();
    } catch (error) {
      console.error('Error saving entry:', error);
      showSnackbar('Failed to add timetable entry', 'error');
    }
  };

  // Update existing entry
  const handleUpdateEntry = async () => {
    try {
      if (!selectedEntry) return;

      const entryData = {
        className: formData.className,
        section: formData.section,
        subjectName: formData.subjectName,
        teacherId: teacherData?.id,
        day: selectedEntry.day,
        startTime: selectedEntry.startTime,
        endTime: selectedEntry.endTime,
        roomNumber: formData.roomNumber
      };

      await apiPut(`/timetable/${selectedEntry.id}`, entryData);
      showSnackbar('Timetable entry updated successfully!');
      setIsEditModalOpen(false);
      fetchTimetableData();
    } catch (error) {
      console.error('Error updating entry:', error);
      showSnackbar('Failed to update timetable entry', 'error');
    }
  };

  // Delete entry
  const handleDeleteEntry = async (entryId: string) => {
    try {
      await apiDelete(`/timetable/${entryId}`);
      showSnackbar('Timetable entry deleted successfully!');
      fetchTimetableData();
    } catch (error) {
      console.error('Error deleting entry:', error);
      showSnackbar('Failed to delete timetable entry', 'error');
    }
  };

  // Render cell content
  const renderCell = (timeSlotId: string, day: string) => {
    const entries = getCellEntries(timeSlotId, day);
    
    if (entries.length === 0) {
      return (
        <div
          className="h-16 border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center bg-gray-50"
          onClick={() => handleCellClick(timeSlotId, day)}
        >
          <Plus className="h-3 w-3 text-gray-400 hover:text-blue-500" />
        </div>
      );
    }

    return (
      <div className="h-16 border border-gray-200 overflow-hidden">
        {entries.slice(0, 1).map((entry, index) => (
          <div
            key={index}
            className={`h-full p-1 text-xs flex items-center justify-between cursor-pointer transition-colors duration-200 ${
              entry.isMyClass
                ? 'bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 border-l-3 border-blue-500'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-l-2 border-gray-300'
            }`}
          >
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className={`font-semibold text-xs truncate ${entry.isMyClass ? 'text-blue-900' : 'text-gray-900'}`}>
                {entry.subjectName}
              </div>
              <div className="flex items-center space-x-1">
                <span className={`text-xs truncate ${entry.isMyClass ? 'text-blue-700' : 'text-gray-600'}`}>
                  {entry.className}-{entry.section}
                </span>
                {entry.roomNumber && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className={`text-xs flex items-center ${entry.isMyClass ? 'text-blue-600' : 'text-gray-500'}`}>
                      <MapPin className="h-2 w-2 mr-0.5" />
                      <span>{entry.roomNumber}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {entry.isMyClass && (
              <div className="flex flex-col space-y-0.5 ml-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditEntry(entry);
                  }}
                  className="text-blue-600 hover:text-blue-800 p-0.5 rounded hover:bg-blue-50"
                  title="Edit"
                >
                  <Edit className="h-2 w-2" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingEntryId(entry.id);
                    setDeletingEntryTitle(entry.subjectName);
                    setShowDeleteConfirmation(true);
                  }}
                  className="text-red-600 hover:text-red-800 p-0.5 rounded hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 className="h-2 w-2" />
                </button>
              </div>
            )}
          </div>
        ))}
        
        {entries.length > 1 && (
          <div className="absolute bottom-0 right-0 bg-gray-600 text-white text-xs px-1 rounded-tl">
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
          onClick={fetchTimetableData}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-3 mb-3 md:mb-0">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">My Timetable</h1>
              <p className="text-blue-100 text-sm">
                Manage your class schedules and teaching assignments
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchTimetableData}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-md hover:bg-opacity-30 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border-l-4 border-blue-500 rounded"></div>
            <span className="text-gray-700">My Classes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
            <span className="text-gray-700">Other Classes</span>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
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
                    className={`px-2 py-2 text-center text-xs font-medium text-white uppercase tracking-wider ${
                      index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      index === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      index === 2 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                      index === 3 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                      index === 4 ? 'bg-gradient-to-r from-pink-500 to-pink-600' :
                      'bg-gradient-to-r from-cyan-500 to-cyan-600'
                    }`}
                  >
                    {day.substring(0, 3)}
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Class</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <input
                  type="text"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Class 10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., A"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mathematics"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 101"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEntry}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Class</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <input
                  type="text"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEntry}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && deletingEntryId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Class</h3>
            
            <p>Are you sure you want to delete the class "{deletingEntryTitle}"?</p>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteEntry(deletingEntryId);
                  setShowDeleteConfirmation(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          snackbar.severity === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {snackbar.severity === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <span>{snackbar.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherTimetable; 