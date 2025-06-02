import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Menu,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Book as BookIcon,
  School as SchoolIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
  Room as RoomIcon,
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

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


// Simple animation for pulse effect
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Simplified styled components with basic colors
const EmptySlot = styled(Box)(() => ({
  height: '100%',
  minHeight: '120px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#757575',
  fontSize: '0.875rem',
  flexDirection: 'column',
  gap: 8,
  transition: 'all 0.3s ease',
  '&:hover': {
    color: '#1976d2',
    animation: `${pulse} 1s ease-in-out`,
  },
}));

const Timetable: React.FC = () => {
  // State
  const [selectedClass, setSelectedClass] = useState<string>('Class 1');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubjectMapping>({});
  
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
      const response = await fetch('/api/timetable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });

      if (response.ok) {
        await fetchTimetableData();
        showSnackbar('Timetable entry added successfully');
        return true;
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.message || 'Failed to save entry', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      showSnackbar('Error saving entry', 'error');
      return false;
    }
  };

  const updateEntry = async (id: string, entryData: TimetableEntryData): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/timetable/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });

      if (response.ok) {
        await fetchTimetableData();
        showSnackbar('Timetable entry updated successfully');
        return true;
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.message || 'Failed to update entry', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      showSnackbar('Error updating entry', 'error');
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
  const handleClassChange = (event: SelectChangeEvent) => {
    setSelectedClass(event.target.value);
  };

  const handleSectionChange = (event: SelectChangeEvent) => {
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
    if (!timeSlot) return;

    const entryData = {
      className: selectedClass,
      section: selectedSection,
      subjectName: formData.subjectName,
      teacherId: parseInt(formData.teacherId),
      day: selectedDay.toLowerCase(),
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      roomNumber: formData.roomNumber
    };

    const success = await saveEntry(entryData);
    if (success) {
      setIsAddModalOpen(false);
      setFormData({ subjectName: '', teacherId: '', roomNumber: '' });
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
          <EmptySlot>
            <AddIcon className="text-gray-400 mb-2" style={{ fontSize: '2rem' }} />
            <Typography variant="caption" className="text-gray-500 hover:text-blue-600">
              Add Entry
            </Typography>
          </EmptySlot>
        ) : (
          <div className="p-2">
            {entries.slice(0, 2).map((entry) => (
              <div 
                key={entry.id} 
                onClick={(e) => handleEntryClick(entry, e)}
                className="p-3 m-1 rounded-lg cursor-pointer transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg"
              >
                <Typography variant="subtitle2" className="font-bold text-white mb-1">
                  <BookIcon className="inline mr-1" style={{ fontSize: '1rem' }} />
                  {entry.subjectName}
                </Typography>
                
                <div className="flex items-center gap-1 mb-1">
                  <PersonIcon className="text-white" style={{ fontSize: '1rem' }} />
                  <Typography variant="caption" className="text-white text-xs">
                    {entry.teacher?.fullName || 'Unknown Teacher'}
                  </Typography>
                </div>
                
                {entry.roomNumber && (
                  <div className="flex items-center gap-1">
                    <RoomIcon className="text-white" style={{ fontSize: '1rem' }} />
                    <Typography variant="caption" className="text-white text-xs">
                      Room {entry.roomNumber}
                    </Typography>
                  </div>
                )}
              </div>
            ))}
            
            {entries.length > 2 && (
              <Typography variant="caption" className="ml-2 text-blue-600 font-semibold">
                +{entries.length - 2} more
              </Typography>
            )}
          </div>
        )}
      </div>
    );
  };

  // Effects
  useEffect(() => {
    fetchTeachers();
    fetchTimeSlots(); // Load time slots on component mount
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchTimetableData();
    }
  }, [selectedClass, selectedSection]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Container maxWidth="xl" className="space-y-6">
        {/* Header Controls */}
        <div className="bg-white rounded-lg shadow-md border p-6">
          <div className="flex items-center mb-4">
            <FilterIcon className="mr-3 text-blue-600" />
            <Typography variant="h6" className="font-bold text-gray-800">
              Timetable Filters
            </Typography>
          </div>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={handleClassChange}
                  className="rounded-lg"
                >
                  {CLASS_OPTIONS.map((cls) => (
                    <MenuItem key={cls} value={cls}>
                      {cls}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Section</InputLabel>
                <Select
                  value={selectedSection}
                  onChange={handleSectionChange}
                  className="rounded-lg"
                >
                  {SECTION_OPTIONS.map((section) => (
                    <MenuItem key={section} value={section}>
                      {section}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={8}>
              <div className="flex gap-3 justify-end flex-wrap">
                <Button
                  variant="contained"
                  startIcon={<ScheduleIcon />}
                  onClick={fetchTimetableData}
                  disabled={loading}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Load Timetable'
                  )}
                </Button>
                
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                  className="rounded-lg"
                >
                  Print Timetable
                </Button>
                
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => setIsTimeSlotModalOpen(true)}
                  className="rounded-lg"
                >
                  Add Time Slot
                </Button>
              </div>
            </Grid>
          </Grid>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <Typography variant="h6" className="font-bold text-blue-800 mb-2">
              <SchoolIcon className="mr-2 inline-block" />
              Timetable for {selectedClass} - Section {selectedSection}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Total Entries: <span className="font-semibold text-blue-600">{timetableData.length}</span> | 
              Time Slots: <span className="font-semibold text-purple-600">{timeSlots.length}</span>
            </Typography>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="bg-white rounded-lg shadow-md border overflow-hidden">
          <div className="p-4">
            {timeSlots.length === 0 ? (
              // No time slots available - show helpful guidance
              <div className="text-center py-12">
                <TimeIcon className="mx-auto text-gray-400 mb-4" style={{ fontSize: '4rem' }} />
                <Typography variant="h6" className="text-gray-600 mb-2">
                  No Time Slots Available
                </Typography>
                <Typography variant="body2" className="text-gray-500 mb-6 max-w-md mx-auto">
                  Time slots are automatically generated from your timetable entries. 
                  Create your first timetable entry or add time slots manually to get started.
                </Typography>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsTimeSlotModalOpen(true)}
                    className="rounded-lg bg-blue-600 hover:bg-blue-700"
                  >
                    Add Time Slot
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ScheduleIcon />}
                    onClick={fetchTimeSlots}
                    className="rounded-lg"
                  >
                    Refresh Time Slots
                  </Button>
                </div>
              </div>
            ) : (
              // Normal timetable grid
              <Grid container spacing={1}>
                {/* Header Row */}
                <Grid item xs={12}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={2}>
                      <div className="bg-blue-600 text-white font-bold text-center p-4 rounded-lg shadow">
                        <TimeIcon className="mr-2 inline-block" />
                        TIME SLOTS
                      </div>
                    </Grid>
                    {DAYS.map((day) => (
                      <Grid item xs={12} md={10/6} key={day}>
                        <div className="bg-cyan-500 text-white font-bold text-center p-4 rounded-lg shadow">
                          {day}
                        </div>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                {/* Time Slot Rows */}
                {timeSlots.map((timeSlot) => (
                  <Grid item xs={12} key={timeSlot.id}>
                    <Grid container spacing={1}>
                      <Grid item xs={12} md={2}>
                        <div className="relative bg-blue-600 text-white font-bold text-center p-4 rounded-lg shadow min-h-[120px] flex items-center justify-center hover:bg-blue-700 transition-all duration-300">
                          <Typography variant="caption" className="whitespace-pre-line">
                            {timeSlot.label}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => handleTimeSlotMenuClick(e, timeSlot)}
                            className="absolute top-1 right-1 text-white hover:bg-white/20 rounded-full"
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </div>
                      </Grid>
                      {DAYS.map((day) => (
                        <Grid item xs={12} md={10/6} key={`${timeSlot.id}-${day}`}>
                          {renderCell(timeSlot.id, day)}
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <Typography variant="body2" className="text-gray-600">
            Powered by Gyansetu.ai
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            Developed By Ruhil Future Technologies (2025)
          </Typography>
        </div>
      </Container>
      
      {/* Add Entry Modal */}
      <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="bg-blue-600 text-white">
          <BookIcon className="mr-2 inline-block" />
          Add New Timetable Entry
        </DialogTitle>
        <DialogContent className="mt-4">
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Teacher</InputLabel>
                <Select
                  value={formData.teacherId}
                  onChange={(e) => {
                    setFormData({ ...formData, teacherId: e.target.value, subjectName: '' });
                  }}
                  className="rounded-lg"
                >
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.fullName} ({teacher.designation})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth disabled={!formData.teacherId}>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  className="rounded-lg"
                >
                  {getAvailableSubjects(formData.teacherId).map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Room Number"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="e.g., 101, Lab-A, Library"
                className="rounded-lg"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setIsAddModalOpen(false)} className="rounded-lg">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveEntry}
            disabled={!formData.teacherId || !formData.subjectName}
            className="rounded-lg bg-green-600 hover:bg-green-700"
          >
            Add Entry
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Entry Modal */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="bg-purple-600 text-white">
          <EditIcon className="mr-2 inline-block" />
          Edit Timetable Entry
        </DialogTitle>
        <DialogContent className="mt-4">
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Teacher</InputLabel>
                <Select
                  value={selectedEntry?.teacherId?.toString() || ''}
                  onChange={(e) => setSelectedEntry({ 
                    ...selectedEntry!, 
                    teacherId: parseInt(e.target.value),
                    subjectName: '' 
                  })}
                  className="rounded-lg"
                >
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.fullName} ({teacher.designation})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={selectedEntry?.subjectName || ''}
                  onChange={(e) => setSelectedEntry({ ...selectedEntry!, subjectName: e.target.value })}
                  className="rounded-lg"
                >
                  {getAvailableSubjects(selectedEntry?.teacherId?.toString() || '').map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Room Number"
                value={selectedEntry?.roomNumber || ''}
                onChange={(e) => setSelectedEntry({ ...selectedEntry!, roomNumber: e.target.value })}
                className="rounded-lg"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className="p-4">
          <Button color="error" onClick={handleDeleteEntry} className="rounded-lg bg-red-500 hover:bg-red-600 text-white">
            <DeleteIcon className="mr-1" />
            Delete
          </Button>
          <Button onClick={() => setIsEditModalOpen(false)} className="rounded-lg">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUpdateEntry} className="rounded-lg bg-blue-600 hover:bg-blue-700">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Time Slot Modal */}
      <Dialog open={isTimeSlotModalOpen} onClose={() => setIsTimeSlotModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="bg-green-600 text-white">
          <TimeIcon className="mr-2 inline-block" />
          Add New Time Slot
        </DialogTitle>
        <DialogContent className="mt-4">
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={newTimeSlot.startTime}
                onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                className="rounded-lg"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={newTimeSlot.endTime}
                onChange={(e) => setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                className="rounded-lg"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setIsTimeSlotModalOpen(false)} className="rounded-lg">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateTimeSlot}
            disabled={!newTimeSlot.startTime || !newTimeSlot.endTime}
            className="rounded-lg bg-green-600 hover:bg-green-700"
          >
            Add Time Slot
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Time Slot Modal */}
      <Dialog open={isEditTimeSlotModalOpen} onClose={() => setIsEditTimeSlotModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="bg-orange-600 text-white">
          <EditIcon className="mr-2 inline-block" />
          Edit Time Slot
        </DialogTitle>
        <DialogContent className="mt-4">
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={newTimeSlot.startTime}
                onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                className="rounded-lg"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={newTimeSlot.endTime}
                onChange={(e) => setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
                className="rounded-lg"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setIsEditTimeSlotModalOpen(false)} className="rounded-lg">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUpdateTimeSlot} className="rounded-lg bg-orange-600 hover:bg-orange-700">
            Update Time Slot
          </Button>
        </DialogActions>
      </Dialog>

      {/* Time Slot Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        className="rounded-lg"
      >
        <MenuItem onClick={() => selectedTimeSlotForMenu && handleEditTimeSlot(selectedTimeSlotForMenu)} className="hover:bg-blue-50">
          <EditIcon className="mr-2 text-blue-600" fontSize="small" />
          Edit Time Slot
        </MenuItem>
        <MenuItem 
          onClick={() => selectedTimeSlotForMenu && handleDeleteTimeSlot(selectedTimeSlotForMenu.id)}
          className="text-red-600 hover:bg-red-50"
        >
          <DeleteIcon className="mr-2" fontSize="small" />
          Delete Time Slot
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          className="rounded-lg shadow-lg"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Timetable; 