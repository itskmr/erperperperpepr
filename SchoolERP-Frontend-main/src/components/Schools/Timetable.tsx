import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
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
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

// Types
interface TimetableEntry {
  id: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  day: string;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  className?: string;
  sectionName?: string;
  subjectName?: string;
  teacherName?: string;
}

interface Teacher {
  id: string;
  name: string;
}

// Predefined classes
const CLASS_OPTIONS = [
  'Nursery',
  'LKG',
  'UKG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11 (Science)',
  'Class 11 (Commerce)',
  'Class 11 (Arts)',
  'Class 12 (Science)',
  'Class 12 (Commerce)',
  'Class 12 (Arts)'
];

// Predefined sections
const SECTION_OPTIONS = ['A', 'B', 'C', 'D', 'E'];

// Predefined subjects
const SUBJECT_OPTIONS = [
  'Mathematics',
  'Science',
  'English',
  'Social Studies',
  'Hindi',
  'Computer Science',
  'Physical Education',
  'Art',
  'Music',
  'Economics',
  'Business Studies',
  'Accountancy',
  'History',
  'Geography',
  'Political Science',
  'Sociology',
  'Psychology',
  'Biology',
  'Physics',
  'Chemistry'
];

// Predefined days
const DAY_OPTIONS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const Timetable: React.FC = () => {
  // State
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('');
  const [dayFilter, setDayFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);

  // Columns for DataGrid
  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', width: 70 },
    { field: 'className', headerName: 'Class', width: 130 },
    { field: 'sectionName', headerName: 'Section', width: 130 },
    { field: 'subjectName', headerName: 'Subject', width: 130 },
    { field: 'teacherName', headerName: 'Teacher', width: 130 },
    { field: 'day', headerName: 'Day', width: 130 },
    { 
      field: 'time', 
      headerName: 'Time', 
      width: 130,
      valueGetter: (params: GridRenderCellParams) => `${params.row.startTime} - ${params.row.endTime}`
    },
    { field: 'roomNumber', headerName: 'Room', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton onClick={() => handleViewEntry(params.row as TimetableEntry)}>
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleEditEntry(params.row as TimetableEntry)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDeleteEntry(params.row.id as string)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Handlers
  const handleClassChange = (event: SelectChangeEvent) => {
    setSelectedClass(event.target.value);
  };

  const handleSectionChange = (event: SelectChangeEvent) => {
    setSelectedSection(event.target.value);
  };

  const handleViewTimetable = async () => {
    try {
      const response = await fetch('/api/timetable');
      const data = await response.json();
      setTimetable(data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    }
  };

  const handleAddEntry = () => {
    setIsAddModalOpen(true);
  };

  const handleEditEntry = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await fetch(`/api/timetable/${id}`, { method: 'DELETE' });
      setTimetable(timetable.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error deleting timetable entry:', error);
    }
  };

  const handleViewEntry = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    // TODO: Implement view functionality
  };

  const handleResetFilters = () => {
    setClassFilter('');
    setDayFilter('');
    setSearchQuery('');
  };

  // Effects
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch teachers from the timetable API
        const teachersResponse = await fetch('/api/timetable/teachers');
        const teachersData = await teachersResponse.json();
        if (teachersData.success) {
          setTeachers(teachersData.data);
        } else {
          console.error('Error fetching teachers:', teachersData.message);
        }

        // Fetch initial timetable
        handleViewTimetable();
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  return (
    <Container maxWidth="lg">
      <Card>
        <CardHeader
          title="Class Timetable"
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddEntry}
            >
              Add Timetable
            </Button>
          }
        />
        <CardContent>
          {/* Filters Section */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Class</InputLabel>
                <Select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {CLASS_OPTIONS.map((cls) => (
                    <MenuItem key={cls} value={cls}>
                      {cls}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Day</InputLabel>
                <Select
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                >
                  <MenuItem value="">All Days</MenuItem>
                  {DAY_OPTIONS.map((day) => (
                    <MenuItem key={day} value={day.toLowerCase()}>
                      {day}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Timetable"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </Grid>
          </Grid>

          {/* Timetable View */}
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={timetable}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 5, page: 0 },
                },
              }}
              pageSizeOptions={[5]}
              checkboxSelection
              disableRowSelectionOnClick
              autoHeight
            />
          </Box>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog
        open={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isAddModalOpen ? 'Add Timetable Entry' : 'Edit Timetable Entry'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={handleClassChange}
                >
                  {CLASS_OPTIONS.map((cls) => (
                    <MenuItem key={cls} value={cls}>
                      {cls}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Section</InputLabel>
                <Select
                  value={selectedSection}
                  onChange={handleSectionChange}
                >
                  {SECTION_OPTIONS.map((section) => (
                    <MenuItem key={section} value={section}>
                      {section}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={selectedEntry?.subjectId || ''}
                  onChange={(e) => setSelectedEntry({ ...selectedEntry!, subjectId: e.target.value })}
                >
                  {SUBJECT_OPTIONS.map((subject) => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Teacher</InputLabel>
                <Select
                  value={selectedEntry?.teacherId || ''}
                  onChange={(e) => setSelectedEntry({ ...selectedEntry!, teacherId: e.target.value })}
                >
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Day</InputLabel>
                <Select
                  value={selectedEntry?.day || ''}
                  onChange={(e) => setSelectedEntry({ ...selectedEntry!, day: e.target.value })}
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <MenuItem key={day} value={day.toLowerCase()}>
                      {day}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Room Number"
                value={selectedEntry?.roomNumber || ''}
                onChange={(e) => setSelectedEntry({ ...selectedEntry!, roomNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={selectedEntry?.startTime || ''}
                onChange={(e) => setSelectedEntry({ ...selectedEntry!, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={selectedEntry?.endTime || ''}
                onChange={(e) => setSelectedEntry({ ...selectedEntry!, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}>
            Cancel
          </Button>
          <Button variant="contained" color="primary">
            {isAddModalOpen ? 'Add' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Timetable; 