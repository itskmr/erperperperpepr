import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  User,
  Book,
  School,
  MoreVertical,
  Filter,
  MapPin,
  CheckCircle,
  XCircle
} from 'lucide-react';

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

interface TeacherSubjectMapping {
  [teacherId: number]: string[];
}

interface TimetableEntryData {
  className: string;
  section: string;
  subjectName: string;
  teacherId: number;
  day: string;
  startTime: string;
  endTime: string;
  roomNumber?: string;
}

// Add school info interface
interface SchoolInfo {
  id: number;
  schoolName: string;
  code: string;
}

// Predefined data
const CLASS_OPTIONS = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11 (Science)', 'Class 11 (Commerce)', 'Class 11 (Arts)', 
  'Class 12 (Science)', 'Class 12 (Commerce)', 'Class 12 (Arts)'
];

const SECTION_OPTIONS = ['A', 'B', 'C', 'D', 'E'];

const ALL_SUBJECTS = [
  'Mathematics', 'Science', 'English', 'Social Studies', 'Hindi',
  'Computer Science', 'Physical Education', 'Art', 'Music',
  'Economics', 'Business Studies', 'Accountancy', 'History',
  'Geography', 'Political Science', 'Biology', 'Physics', 'Chemistry'
];

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const Timetable: React.FC = () => {
  // State
  const [selectedClass, setSelectedClass] = useState<string>('Class 1');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubjectMapping>({});
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false);
  const [isEditTimeSlotModalOpen, setIsEditTimeSlotModalOpen] = useState(false);
  
  // Selected data
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  
  // Form data
  const [newTimeSlot, setNewTimeSlot] = useState<{ startTime: string; endTime: string }>({
    startTime: '',
    endTime: ''
  });

  const [formData, setFormData] = useState({
    subjectName: '',
    teacherId: '',
    roomNumber: ''
  });

  // UI states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTimeSlotForMenu, setSelectedTimeSlotForMenu] = useState<TimeSlot | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [loading, setLoading] = useState(false);

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
  };

  const getCellEntries = (timeSlotId: string, day: string) => {
    const timeSlot = timeSlots.find(ts => ts.id === timeSlotId);
    return timetableData.filter(
      entry => entry.startTime === timeSlot?.startTime && 
               entry.endTime === timeSlot?.endTime &&
               entry.day.toUpperCase() === day
    );
  };

  // Enhanced API functions with better error handling
  const fetchTimeSlots = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showSnackbar('Authentication token not found. Please login again.', 'error');
        return;
      }

      console.log('Fetching time slots...');
      const response = await fetch('/api/timetable/time-slots', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Time slots response status:', response.status);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          console.log('Time slots data received:', result);
          
          if (result.data && result.data.length > 0) {
            setTimeSlots(result.data);
          } else {
            // No time slots exist yet - this is normal for new schools
            console.log('No time slots found. User can create them manually.');
            setTimeSlots([]);
          }
        } else {
          console.error('Expected JSON but got:', response.headers.get('content-type'));
          showSnackbar('Server returned invalid response format for time slots.', 'error');
        }
      } else {
        const errorText = await response.text();
        console.error('Time slots API error:', errorText);
        if (response.status === 404) {
          // No time slots found - this is normal for new schools
          setTimeSlots([]);
        } else {
          showSnackbar(`Failed to fetch time slots: ${response.status}`, 'error');
        }
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      showSnackbar('Error fetching time slots. Please check your connection.', 'error');
    }
  };

  const fetchTimetableData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        showSnackbar('Authentication token not found. Please login again.', 'error');
        return;
      }

      console.log('Fetching timetable for:', selectedClass, selectedSection);
      const response = await fetch(`/api/timetable/class/${encodeURIComponent(selectedClass)}/section/${encodeURIComponent(selectedSection)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Timetable response status:', response.status);
      console.log('Timetable response headers:', response.headers.get('content-type'));
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          console.log('Timetable data received:', result);
          setTimetableData(result.data || []);
          
          // After fetching timetable data, also refresh time slots in case new ones were created
          await fetchTimeSlots();
        } else {
          const text = await response.text();
          console.error('Expected JSON but got:', text.substring(0, 200));
          showSnackbar('Server returned invalid response format. Please check server configuration.', 'error');
        }
      } else {
        const errorText = await response.text();
        console.error('Timetable API error:', errorText);
        showSnackbar(`Failed to load timetable data: ${response.status}`, 'error');
      }
    } catch (error) {
      console.error('Error loading timetable:', error);
      showSnackbar('Error loading timetable data. Please check your connection and server status.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showSnackbar('Authentication token not found. Please login again.', 'error');
        return;
      }

      console.log('Fetching teachers with subjects...');
      const response = await fetch('/api/timetable/teachers-subjects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Teachers response status:', response.status);
      console.log('Teachers response headers:', response.headers.get('content-type'));
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          console.log('Teachers data received:', result);
          const teachersData = result.data || [];
          setTeachers(teachersData);
          
          // Parse teacher subjects - data already comes parsed from backend
          const subjectMapping: TeacherSubjectMapping = {};
          teachersData.forEach((teacher: Teacher) => {
            // Since the new API returns parsed subjects directly
            subjectMapping[teacher.id] = Array.isArray(teacher.subjects) 
              ? teacher.subjects as string[] 
              : [];
          });
          setTeacherSubjects(subjectMapping);
        } else {
          const text = await response.text();
          console.error('Expected JSON but got:', text.substring(0, 200));
          showSnackbar('Server returned invalid response format for teachers. Please check server configuration.', 'error');
        }
      } else {
        const errorText = await response.text();
        console.error('Teachers API error:', errorText);
        showSnackbar(`Failed to fetch teachers: ${response.status}`, 'error');
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      showSnackbar('Error fetching teachers. Please check your connection and server status.', 'error');
    }
  };

  const saveEntry = async (entryData: TimetableEntryData): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showSnackbar('Authentication token not found. Please login again.', 'error');
        return false;
      }

      console.log('Saving timetable entry with data:', entryData);

      const response = await fetch('/api/timetable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });

      console.log('Save response status:', response.status);
      console.log('Save response headers:', response.headers.get('content-type'));

      const responseData = await response.json();
      console.log('Save response data:', responseData);

      if (response.ok && responseData.success) {
        await fetchTimetableData();
        showSnackbar(responseData.message || 'Timetable entry added successfully', 'success');
        return true;
      } else {
        const errorMessage = responseData.message || 
                           responseData.error || 
                           `Server responded with status ${response.status}`;
        console.error('Save failed:', errorMessage);
        showSnackbar(errorMessage, 'error');
        return false;
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      showSnackbar('Network error occurred while saving entry. Please check your connection.', 'error');
      return false;
    }
  };

  const updateEntry = async (id: string, entryData: TimetableEntryData): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showSnackbar('Authentication token not found. Please login again.', 'error');
        return false;
      }

      console.log('Updating timetable entry with ID:', id, 'and data:', entryData);

      const response = await fetch(`/api/timetable/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });

      console.log('Update response status:', response.status);
      const responseData = await response.json();
      console.log('Update response data:', responseData);

      if (response.ok && responseData.success) {
        await fetchTimetableData();
        showSnackbar(responseData.message || 'Timetable entry updated successfully', 'success');
        return true;
      } else {
        const errorMessage = responseData.message || 
                           responseData.error || 
                           `Server responded with status ${response.status}`;
        console.error('Update failed:', errorMessage);
        showSnackbar(errorMessage, 'error');
        return false;
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      showSnackbar('Network error occurred while updating entry. Please check your connection.', 'error');
      return false;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/timetable/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchTimetableData();
        showSnackbar('Timetable entry deleted successfully');
        return true;
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.message || 'Failed to delete entry', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      showSnackbar('Error deleting entry', 'error');
      return false;
    }
  };

  // Event handlers
  const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(event.target.value);
  };

  const handleSectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSection(event.target.value);
  };

  const handleCellClick = (timeSlotId: string, day: string) => {
    const entries = getCellEntries(timeSlotId, day);
    
    if (entries.length === 0) {
      // Add new entry
      setSelectedTimeSlot(timeSlotId);
      setSelectedDay(day);
      setFormData({ subjectName: '', teacherId: '', roomNumber: '' });
      setIsAddModalOpen(true);
    } else if (entries.length === 1) {
      // Edit existing entry
      setSelectedEntry(entries[0]);
      setIsEditModalOpen(true);
    } else {
      // Multiple entries - show selection dialog
      // For now, edit the first one (can be enhanced to show a selection modal)
      setSelectedEntry(entries[0]);
      setIsEditModalOpen(true);
    }
  };

  const handleEntryClick = (entry: TimetableEntry, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleSaveEntry = async () => {
    const timeSlot = timeSlots.find(ts => ts.id === selectedTimeSlot);
    if (!timeSlot) {
      showSnackbar('Invalid time slot selected', 'error');
      return;
    }

    if (!formData.teacherId || !formData.subjectName) {
      showSnackbar('Please select both teacher and subject', 'error');
      return;
    }

    const entryData: TimetableEntryData = {
      className: selectedClass,
      section: selectedSection,
      subjectName: formData.subjectName,
      teacherId: parseInt(formData.teacherId),
      day: selectedDay.toLowerCase(),
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      roomNumber: formData.roomNumber || undefined
    };

    console.log('Saving timetable entry:', entryData);

    const success = await saveEntry(entryData);
    if (success) {
      setIsAddModalOpen(false);
      setFormData({ subjectName: '', teacherId: '', roomNumber: '' });
      setSelectedTimeSlot('');
      setSelectedDay('');
      showSnackbar('Timetable entry added successfully', 'success');
    }
  };

  const handleUpdateEntry = async () => {
    if (!selectedEntry) return;

    const entryData = {
      className: selectedEntry.className,
      section: selectedEntry.section,
      subjectName: selectedEntry.subjectName,
      teacherId: parseInt(selectedEntry.teacherId.toString()),
      day: selectedEntry.day,
      startTime: selectedEntry.startTime,
      endTime: selectedEntry.endTime,
      roomNumber: selectedEntry.roomNumber
    };

    const success = await updateEntry(selectedEntry.id, entryData);
    if (success) {
      setIsEditModalOpen(false);
      setSelectedEntry(null);
    }
  };

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return;

    const success = await deleteEntry(selectedEntry.id);
    if (success) {
      setIsEditModalOpen(false);
      setSelectedEntry(null);
    }
  };

  const handleCreateTimeSlot = async () => {
    if (newTimeSlot.startTime && newTimeSlot.endTime) {
      // Validate time slot
      if (newTimeSlot.startTime >= newTimeSlot.endTime) {
        showSnackbar('End time must be after start time', 'error');
        return;
      }

      // Check for conflicts with existing time slots
      const conflictExists = timeSlots.some(slot => 
        (newTimeSlot.startTime >= slot.startTime && newTimeSlot.startTime < slot.endTime) ||
        (newTimeSlot.endTime > slot.startTime && newTimeSlot.endTime <= slot.endTime) ||
        (newTimeSlot.startTime <= slot.startTime && newTimeSlot.endTime >= slot.endTime)
      );

      if (conflictExists) {
        showSnackbar('Time slot conflicts with existing time slots', 'error');
        return;
      }

      // For production, you might want to save time slots to backend
      // For now, we'll add it locally and it will be picked up when timetable entries are created
      const newSlot: TimeSlot = {
        id: `${newTimeSlot.startTime}-${newTimeSlot.endTime}`,
        startTime: newTimeSlot.startTime,
        endTime: newTimeSlot.endTime,
        label: `${formatTime(newTimeSlot.startTime)} - ${formatTime(newTimeSlot.endTime)}`
      };
      
      const updatedSlots = [...timeSlots, newSlot].sort((a, b) => {
        const aTime = new Date(`1970-01-01T${a.startTime}:00`);
        const bTime = new Date(`1970-01-01T${b.startTime}:00`);
        return aTime.getTime() - bTime.getTime();
      });
      
      setTimeSlots(updatedSlots);
      setNewTimeSlot({ startTime: '', endTime: '' });
      setIsTimeSlotModalOpen(false);
      showSnackbar('Time slot added successfully');
    }
  };

  const handleEditTimeSlot = (timeSlot: TimeSlot) => {
    setEditingTimeSlot(timeSlot);
    setNewTimeSlot({ startTime: timeSlot.startTime, endTime: timeSlot.endTime });
    setIsEditTimeSlotModalOpen(true);
    setAnchorEl(null);
  };

  const handleUpdateTimeSlot = () => {
    if (!editingTimeSlot) return;

    const updatedSlots = timeSlots.map(slot => 
      slot.id === editingTimeSlot.id 
        ? {
            ...slot,
            startTime: newTimeSlot.startTime,
            endTime: newTimeSlot.endTime,
            label: `${formatTime(newTimeSlot.startTime)}\nto\n${formatTime(newTimeSlot.endTime)}`
          }
        : slot
    );
    
    setTimeSlots(updatedSlots);
    setIsEditTimeSlotModalOpen(false);
    setEditingTimeSlot(null);
    setNewTimeSlot({ startTime: '', endTime: '' });
    showSnackbar('Time slot updated successfully');
  };

  const handleDeleteTimeSlot = (timeSlotId: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== timeSlotId));
    setAnchorEl(null);
    showSnackbar('Time slot deleted successfully');
  };

  const handleTimeSlotMenuClick = (event: React.MouseEvent<HTMLElement>, timeSlot: TimeSlot) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedTimeSlotForMenu(timeSlot);
  };

  const getAvailableSubjects = (teacherId: string) => {
    if (!teacherId) return ALL_SUBJECTS;
    return teacherSubjects[parseInt(teacherId)] || ALL_SUBJECTS;
  };

  const renderCell = (timeSlotId: string, day: string) => {
    const entries = getCellEntries(timeSlotId, day);
    const entryCount = entries.length;

    return (
      <div 
        onClick={() => handleCellClick(timeSlotId, day)}
        className="min-h-[120px] bg-gray-50 border-2 border-gray-200 cursor-pointer relative overflow-hidden rounded-lg transition-all duration-300 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md"
      >
        {entryCount > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full shadow">
              {entryCount > 99 ? '99+' : entryCount}
            </span>
          </div>
        )}
        
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Plus className="text-gray-400 mb-2" size={24} />
            <span className="text-gray-500 hover:text-blue-600 text-center">
              Add Entry
            </span>
          </div>
        ) : (
          <div className="p-2">
            {entries.slice(0, 2).map((entry) => (
              <div 
                key={entry.id} 
                onClick={(e) => handleEntryClick(entry, e)}
                className="p-3 m-1 rounded-lg cursor-pointer transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg"
              >
                <div className="text-xs font-semibold mb-1">
                  {entry.subjectName}
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <User className="text-white" size={14} />
                  <span className="text-white text-xs">
                    {entry.teacher?.fullName || entry.teacherName || 'Unknown Teacher'}
                  </span>
                </div>
                
                {entry.roomNumber && (
                  <div className="flex items-center gap-1">
                    <MapPin className="text-white" size={14} />
                    <span className="text-white text-xs">
                      Room {entry.roomNumber}
                    </span>
                  </div>
                )}
              </div>
            ))}
            
            {entries.length > 2 && (
              <span className="ml-2 text-blue-600 font-semibold text-xs">
                +{entries.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  // Fetch school information
  const fetchSchoolInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/school/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSchoolInfo(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching school info:', error);
    }
  };

  // Load school info on component mount
  useEffect(() => {
    fetchSchoolInfo();
    fetchTimeSlots();
    fetchTeachers();
  }, []);

  // Load timetable data when class or section changes
  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchTimetableData();
    }
  }, [selectedClass, selectedSection]);

  // Enhanced print functionality
  const handlePrintTimetable = () => {
    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }
  };

  // Generate print content
  const generatePrintContent = () => {
    const schoolName = schoolInfo?.schoolName || 'School Name';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Timetable - ${selectedClass} ${selectedSection}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            font-size: 12px;
          }
          .header { 
            text-align: center; 
            margin-bottom: 20px; 
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .school-name { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 5px; 
          }
          .class-info { 
            font-size: 14px; 
            font-weight: bold; 
            margin-bottom: 10px; 
          }
          .timetable-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px;
          }
          .timetable-table th, 
          .timetable-table td { 
            border: 1px solid #333; 
            padding: 8px; 
            text-align: center; 
            vertical-align: middle;
            font-size: 10px;
          }
          .timetable-table th { 
            background-color: #f0f0f0; 
            font-weight: bold;
          }
          .time-slot { 
            background-color: #e8f4f8; 
            font-weight: bold;
            writing-mode: horizontal-tb;
          }
          .day-header { 
            background-color: #d4edda; 
            font-weight: bold;
          }
          .subject-cell {
            min-height: 40px;
            font-size: 9px;
            line-height: 1.2;
          }
          .subject-name { 
            font-weight: bold; 
            display: block;
          }
          .teacher-name { 
            font-size: 8px; 
            color: #666;
            display: block;
          }
          .room-number { 
            font-size: 8px; 
            color: #888;
            display: block;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="school-name">${schoolName}</div>
          <div class="class-info">Class Timetable - ${selectedClass} Section ${selectedSection}</div>
          <div style="font-size: 10px; color: #666;">Academic Year: ${new Date().getFullYear()}-${new Date().getFullYear() + 1}</div>
        </div>
        
        <table class="timetable-table">
          <thead>
            <tr>
              <th class="time-slot" style="width: 120px;">Time</th>
              ${DAYS.map(day => `<th class="day-header" style="width: 140px;">${day}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${timeSlots.map(timeSlot => `
              <tr>
                <td class="time-slot">
                  <div style="font-size: 10px; font-weight: bold;">
                    ${formatTime(timeSlot.startTime)}<br>
                    ${formatTime(timeSlot.endTime)}
                  </div>
                </td>
                ${DAYS.map(day => {
                  const entries = getCellEntries(timeSlot.id, day);
                  if (entries.length === 0) {
                    return '<td class="subject-cell">-</td>';
                  }
                  return `<td class="subject-cell">
                    ${entries.map(entry => `
                      <div style="margin-bottom: 2px;">
                        <span class="subject-name">${entry.subjectName}</span>
                        ${entry.teacherName ? `<span class="teacher-name">${entry.teacherName}</span>` : ''}
                        ${entry.roomNumber ? `<span class="room-number">Room: ${entry.roomNumber}</span>` : ''}
                      </div>
                    `).join('')}
                  </td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>Powered by School ERP System</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Controls */}
        <div className="bg-white rounded-lg shadow-md border p-6">
          <div className="flex items-center mb-4">
            <Filter className="mr-3 text-blue-600" size={20} />
            <h2 className="font-bold text-gray-800 text-xl">
              Timetable Management
            </h2>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <h3 className="font-bold text-blue-800 mb-2">
              <School className="mr-2 inline-block" size={20} />
              {schoolInfo?.schoolName || 'School Name'} - {selectedClass} Section {selectedSection}
            </h3>
            <p className="text-gray-600">
              Total Entries: <span className="font-semibold text-blue-600">{timetableData.length}</span> | 
              Time Slots: <span className="font-semibold text-purple-600">{timeSlots.length}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div>
              <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                id="class"
                value={selectedClass}
                onChange={handleClassChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {CLASS_OPTIONS.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                Section
              </label>
              <select
                id="section"
                value={selectedSection}
                onChange={handleSectionChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {SECTION_OPTIONS.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className="flex gap-3 justify-end flex-wrap w-full">
                <button
                  onClick={fetchTimetableData}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Load Timetable'
                  )}
                </button>
                
                <button
                  onClick={handlePrintTimetable}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Print Timetable
                </button>
                
                <button
                  onClick={() => setIsTimeSlotModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                  Add Time Slot
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Timetable Grid - Improved for better fit */}
        <div className="bg-white rounded-lg shadow-md border overflow-hidden">
          <div className="p-4">
            {timeSlots.length === 0 ? (
              // No time slots available - show helpful guidance
              <div className="text-center py-12">
                <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                <h6 className="text-gray-600 mb-2">
                  No Time Slots Available
                </h6>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Time slots are automatically generated from your timetable entries. 
                  Create your first timetable entry or add time slots manually to get started.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                    onClick={() => setIsTimeSlotModalOpen(true)}
                  >
                    Add Time Slot
                  </button>
                  <button
                    className="rounded-lg bg-gray-600 hover:bg-gray-700 text-white px-4 py-2"
                    onClick={fetchTimeSlots}
                  >
                    Refresh Time Slots
                  </button>
                </div>
              </div>
            ) : (
              // Improved timetable grid layout
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-32 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border border-gray-200">
                        <Clock className="mr-1 inline-block" size={14} />
                        Time
                      </th>
                      {DAYS.map((day) => (
                        <th
                          key={day}
                          className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border border-gray-200"
                          style={{ minWidth: '140px' }}
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((timeSlot) => (
                      <tr key={timeSlot.id}>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 bg-blue-50 font-medium border border-gray-200 relative">
                          <div className="flex flex-col">
                            <span className="font-semibold">{formatTime(timeSlot.startTime)}</span>
                            <span className="text-xs text-gray-500">
                              {formatTime(timeSlot.endTime)}
                            </span>
                          </div>
                          <button
                            onClick={(e) => handleTimeSlotMenuClick(e, timeSlot)}
                            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 rounded-full p-1"
                          >
                            <MoreVertical size={12} />
                          </button>
                        </td>
                        {DAYS.map((day) => (
                          <td key={`${timeSlot.id}-${day}`} className="p-0 border border-gray-200">
                            {renderCell(timeSlot.id, day)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-gray-600">
            Powered by Gyansetu.ai
          </p>
          <p className="text-gray-500">
            Developed By Ruhil Future Technologies (2025)
          </p>
        </div>
      </div>
      
      {/* Add Entry Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isAddModalOpen ? '' : 'hidden'}`}
        onClick={() => setIsAddModalOpen(false)}
      >
        <div
          className="bg-white rounded-lg p-8 space-y-4 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-bold text-blue-600 text-lg">
            <Book className="mr-2 inline-block" size={20} />
            Add New Timetable Entry
          </h2>
          
          {selectedTimeSlot && selectedDay && (
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Time Slot:</strong> {timeSlots.find(ts => ts.id === selectedTimeSlot)?.label}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Day:</strong> {selectedDay}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Class:</strong> {selectedClass} - Section {selectedSection}
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-1">
                Teacher <span className="text-red-500">*</span>
              </label>
              <select
                id="teacher"
                value={formData.teacherId}
                onChange={(e) => {
                  setFormData({ ...formData, teacherId: e.target.value, subjectName: '' });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select a teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id.toString()}>
                    {teacher.fullName} ({teacher.designation})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                id="subject"
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={!formData.teacherId}
                required
              >
                <option value="">Select a subject</option>
                {getAvailableSubjects(formData.teacherId).map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              {!formData.teacherId && (
                <p className="text-xs text-gray-500 mt-1">Please select a teacher first</p>
              )}
            </div>
            
            <div>
              <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Room Number (Optional)
              </label>
              <input
                type="text"
                id="roomNumber"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., 101, Lab-A"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setFormData({ subjectName: '', teacherId: '', roomNumber: '' });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEntry}
              disabled={!formData.teacherId || !formData.subjectName}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Plus className="mr-1 inline-block" size={16} />
              Add Entry
            </button>
          </div>
        </div>
      </div>
      
      {/* Edit Entry Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isEditModalOpen ? '' : 'hidden'}`}
        onClick={() => setIsEditModalOpen(false)}
      >
        <div
          className="bg-white rounded-lg p-8 space-y-4 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-bold text-purple-600 text-lg">
            <Edit className="mr-2 inline-block" size={20} />
            Edit Timetable Entry
          </h2>
          
          {selectedEntry && (
            <div className="bg-purple-50 p-3 rounded-md border border-purple-200">
              <p className="text-sm text-purple-800">
                <strong>Time:</strong> {formatTime(selectedEntry.startTime)} - {formatTime(selectedEntry.endTime)}
              </p>
              <p className="text-sm text-purple-800">
                <strong>Day:</strong> {selectedEntry.day.toUpperCase()}
              </p>
              <p className="text-sm text-purple-800">
                <strong>Class:</strong> {selectedEntry.className} - Section {selectedEntry.section}
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="teacherEdit" className="block text-sm font-medium text-gray-700 mb-1">
                Teacher <span className="text-red-500">*</span>
              </label>
              <select
                id="teacherEdit"
                value={selectedEntry?.teacherId?.toString() || ''}
                onChange={(e) => setSelectedEntry({ 
                  ...selectedEntry!, 
                  teacherId: parseInt(e.target.value),
                  subjectName: '' 
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              >
                <option value="">Select a teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id.toString()}>
                    {teacher.fullName} ({teacher.designation})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="subjectEdit" className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                id="subjectEdit"
                value={selectedEntry?.subjectName || ''}
                onChange={(e) => setSelectedEntry({ ...selectedEntry!, subjectName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                disabled={!selectedEntry?.teacherId}
                required
              >
                <option value="">Select a subject</option>
                {getAvailableSubjects(selectedEntry?.teacherId?.toString() || '').map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              {!selectedEntry?.teacherId && (
                <p className="text-xs text-gray-500 mt-1">Please select a teacher first</p>
              )}
            </div>
            
            <div>
              <label htmlFor="roomNumberEdit" className="block text-sm font-medium text-gray-700 mb-1">
                Room Number (Optional)
              </label>
              <input
                type="text"
                id="roomNumberEdit"
                value={selectedEntry?.roomNumber || ''}
                onChange={(e) => setSelectedEntry({ ...selectedEntry!, roomNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="e.g., 101, Lab-A"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={handleDeleteEntry}
              className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="mr-1 inline-block" size={16} />
              Delete
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedEntry(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateEntry}
                disabled={!selectedEntry?.teacherId || !selectedEntry?.subjectName}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <CheckCircle className="mr-1 inline-block" size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Time Slot Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${isTimeSlotModalOpen ? '' : 'hidden'}`}
        onClick={() => setIsTimeSlotModalOpen(false)}
      >
        <div
          className="bg-white rounded-lg p-8 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-bold text-green-600">
            <Clock className="mr-2 inline-block" size={20} />
            Add New Time Slot
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                value={newTimeSlot.startTime}
                onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="time"
                id="endTime"
                value={newTimeSlot.endTime}
                onChange={(e) => setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300"
              />
            </div>
          </div>
          <div className="mt-4 space-x-2">
            <button
              type="button"
              onClick={() => setIsTimeSlotModalOpen(false)}
              className="rounded-md bg-gray-500 text-white px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateTimeSlot}
              disabled={!newTimeSlot.startTime || !newTimeSlot.endTime}
              className="rounded-md bg-green-600 text-white px-4 py-2"
            >
              Add Time Slot
            </button>
          </div>
        </div>
      </div>

      {/* Edit Time Slot Modal */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${isEditTimeSlotModalOpen ? '' : 'hidden'}`}
        onClick={() => setIsEditTimeSlotModalOpen(false)}
      >
        <div
          className="bg-white rounded-lg p-8 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="font-bold text-orange-600">
            <Edit className="mr-2 inline-block" size={20} />
            Edit Time Slot
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="startTimeEdit" className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                id="startTimeEdit"
                value={newTimeSlot.startTime}
                onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300"
              />
            </div>
            <div>
              <label htmlFor="endTimeEdit" className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="time"
                id="endTimeEdit"
                value={newTimeSlot.endTime}
                onChange={(e) => setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300"
              />
            </div>
          </div>
          <div className="mt-4 space-x-2">
            <button
              type="button"
              onClick={() => setIsEditTimeSlotModalOpen(false)}
              className="rounded-md bg-gray-500 text-white px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateTimeSlot}
              className="rounded-md bg-orange-600 text-white px-4 py-2"
            >
              Update Time Slot
            </button>
          </div>
        </div>
      </div>

      {/* Time Slot Context Menu */}
      {anchorEl && selectedTimeSlotForMenu && (
        <div className="fixed z-50 bg-white rounded-lg shadow-lg border p-2 space-y-1">
          <button
            onClick={() => handleEditTimeSlot(selectedTimeSlotForMenu)}
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded"
          >
            <Edit className="mr-2 text-blue-600" size={16} />
            Edit Time Slot
          </button>
          <button
            onClick={() => handleDeleteTimeSlot(selectedTimeSlotForMenu.id)}
            className="flex items-center w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded"
          >
            <Trash2 className="mr-2 text-red-600" size={16} />
            Delete Time Slot
          </button>
        </div>
      )}

      {/* Snackbar for notifications */}
      {snackbar.open && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
          snackbar.severity === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center">
            {snackbar.severity === 'success' ? (
              <CheckCircle className="mr-2" size={20} />
            ) : (
              <XCircle className="mr-2" size={20} />
            )}
            {snackbar.message}
            <button 
              onClick={() => setSnackbar({ ...snackbar, open: false })}
              className="ml-4 text-white hover:text-gray-200"
            >
              <XCircle size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable; 