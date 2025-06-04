import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaCalendarAlt, FaSearch, FaDownload, FaFilter, FaEdit, FaExclamationTriangle, FaFileAlt, FaPrint } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

// Import attendance service
import attendanceService, { 
  Student, 
  AttendanceStats 
} from '../../services/attendanceService';

// Types for component state
interface Class {
  className: string;
  sections: string[];
}

interface AttendanceRecord {
  id: string | number;
  studentId: string | number;
  date: Date;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  notes?: string;
}

// Error Boundary Component
class AttendanceErrorBoundary extends React.Component<
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
    console.error('Attendance Management Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-6 m-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Something went wrong with the attendance management
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

const AttendanceManagement: React.FC = () => {
  // Helper function to ensure ID is compatible
  const getStudentIdAsString = (id: string | number): string => {
    return typeof id === 'string' ? id : id.toString();
  };

  // Helper function to generate unique record ID
  const generateRecordId = (studentId: string | number): string => {
    return `${Date.now()}_${getStudentIdAsString(studentId)}`;
  };

  // States
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({ total: 0, present: 0, absent: 0, late: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'report'>('daily');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'student'>('daily');
  const [reportClass, setReportClass] = useState<string>('');
  const [reportSection, setReportSection] = useState<string>('');
  const [reportDate, setReportDate] = useState<string>('');
  const [reportMonth, setReportMonth] = useState<string>('');
  const [reportYear, setReportYear] = useState<string>(new Date().getFullYear().toString());
  const [reportData, setReportData] = useState<{ students: Student[]; stats: AttendanceStats } | null>(null);
  const [monthlyReportData, setMonthlyReportData] = useState<{
    reportInfo: {
      year: number;
      month: number;
      monthName: string;
      className: string;
      section: string;
      schoolId: number;
    };
    classStats: {
      totalStudents: number;
      totalWorkingDays: number;
      averageAttendance: string;
    };
    studentReports: Array<{
      student: {
        id: string;
        name: string;
        admissionNo: string;
        rollNumber: string;
      };
      attendance: {
        totalDays: number;
        presentDays: number;
        absentDays: number;
        lateDays: number;
        attendancePercentage: string;
      };
    }>;
  } | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  
  // Get the teacher ID from localStorage or context
  // This is just an example; you should replace it with your actual auth implementation
  const teacherId = 1; // Replace with actual teacher ID from your auth system
  
  // Fetch classes taught by the teacher
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First try to get teacher-specific classes
        try {
          const classesTaught = await attendanceService.getTeacherClasses(teacherId);
          setClasses(classesTaught);
          
          if (classesTaught.length > 0) {
            setSelectedClass(classesTaught[0].className);
            if (classesTaught[0].sections && classesTaught[0].sections.length > 0) {
              setSelectedSection(classesTaught[0].sections[0]);
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
          
          // Convert API data to AttendanceRecord format
          const records: AttendanceRecord[] = (data.students || [])
            .filter(student => student.status)
            .map(student => ({
              id: generateRecordId(student.id), // Use helper function
              studentId: student.id,
              date: selectedDate,
              status: student.status as 'PRESENT' | 'ABSENT' | 'LATE',
              notes: student.notes || undefined
            }));
          
          setAttendanceRecords(records);
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
            setAttendanceRecords([]);
          } catch (studentsError) {
            console.error('Failed to get students by class:', studentsError);
            setError('Failed to load students. Please try again.');
          }
        }
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
  const handleStatusChange = (studentId: string | number, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
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
  const updateStats = (newStatus: 'PRESENT' | 'ABSENT' | 'LATE', oldStatus?: 'PRESENT' | 'ABSENT' | 'LATE' | null) => {
    setStats(prevStats => {
      const updatedStats = { ...prevStats };
      
      // Ensure all stats are numbers and not NaN
      if (isNaN(updatedStats.total)) updatedStats.total = 0;
      if (isNaN(updatedStats.present)) updatedStats.present = 0;
      if (isNaN(updatedStats.absent)) updatedStats.absent = 0;
      if (isNaN(updatedStats.late)) updatedStats.late = 0;
      
      // Decrement old status count if exists
      if (oldStatus) {
        const oldStatusKey = oldStatus.toLowerCase() as 'present' | 'absent' | 'late';
        if (updatedStats[oldStatusKey] > 0) {
          updatedStats[oldStatusKey] = Math.max(0, updatedStats[oldStatusKey] - 1);
        }
      }
      
      // Increment new status count
      const newStatusKey = newStatus.toLowerCase() as 'present' | 'absent' | 'late';
      updatedStats[newStatusKey] = (updatedStats[newStatusKey] || 0) + 1;
      
      return updatedStats;
    });
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
    
    if (!selectedClass) {
      toast.error('Please select a class first');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare attendance data with more validation
      const validStudents = students.filter(student => {
        // Check if student has a valid ID (can be string or number)
        let hasValidId = false;
        if (student && student.id !== undefined && student.id !== null) {
          if (typeof student.id === 'number') {
            hasValidId = !isNaN(student.id);
          } else if (typeof student.id === 'string') {
            hasValidId = (student.id as string).trim().length > 0;
          }
        }
        
        const hasValidStatus = student.status && typeof student.status === 'string' && 
                              ['PRESENT', 'ABSENT', 'LATE'].includes(student.status);
        
        console.log(`Student ${student.name} (ID: ${student.id}, type: ${typeof student.id}): hasValidId=${hasValidId}, status="${student.status}", hasValidStatus=${hasValidStatus}`);
        
        return hasValidId && hasValidStatus;
      });

      // Add error handling for validation
      if (validStudents.length === 0 && students.length > 0) {
        const issueDetails = students.map(student => ({
          name: student.name,
          id: student.id,
          idType: typeof student.id,
          status: student.status,
          hasStatus: !!student.status
        }));
        
        console.error('No valid students found. Student details:', issueDetails);
        toast.error(`No students have valid attendance status. Please mark attendance for at least one student before saving.`);
        setIsSubmitting(false);
        return;
      }
      
      console.log('Total students:', students.length);
      console.log('Valid students with status:', validStudents.length);
      console.log('Students data:', students.map(s => ({ 
        id: s.id, 
        name: s.name, 
        status: s.status 
      })));
      
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
      
      console.log("Final attendance data being sent:", attendanceData);
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      console.log("Formatted date:", formattedDate);
      console.log("Selected class:", selectedClass);
      console.log("Selected section:", selectedSection);
      console.log("Teacher ID:", teacherId);
      
      // Use attendanceService with proper typing
      const response = await attendanceService.markAttendance(
        formattedDate,
        selectedClass,
        teacherId || 1,
        attendanceData,
        selectedSection
      );
      
      console.log("API Response:", response);
      
      if (response && response.success) {
        toast.success(`Attendance saved successfully for ${validStudents.length} students!`);
        
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
            if (refreshedData.stats) {
              // Ensure stats are valid numbers
              const validStats = {
                total: refreshedData.stats.total || 0,
                present: refreshedData.stats.present || 0,
                absent: refreshedData.stats.absent || 0,
                late: refreshedData.stats.late || 0
              };
              setStats(validStats);
            }
          }
        } catch (refreshError) {
          console.error("Error refreshing data:", refreshError);
          // Still consider this a success since the save worked
          toast.info('Attendance saved, but failed to refresh display. Please reload the page.');
        }
      } else {
        const errorMessage = response?.message || 'Unknown error occurred';
        console.error('Save failed with response:', response);
        toast.error('Error: ' + errorMessage);
      }
    } catch (error: unknown) {
      console.error('Failed to save attendance:', error);
      let errorMessage = 'Unknown error occurred';
      
      // Enhanced error handling
      if (error && typeof error === 'object') {
        if ('response' in error) {
          const axiosError = error as { 
            response?: { 
              data?: { message?: string; error?: string; errors?: unknown }; 
              status?: number;
              statusText?: string;
            }; 
            message?: string;
            request?: unknown;
          };
          
          if (axiosError.response) {
            console.error('Response status:', axiosError.response.status);
            console.error('Response data:', axiosError.response.data);
            
            if (axiosError.response.data?.message) {
              errorMessage = axiosError.response.data.message;
            } else if (axiosError.response.data?.error) {
              errorMessage = axiosError.response.data.error;
            } else if (axiosError.response.statusText) {
              errorMessage = `Server error: ${axiosError.response.statusText}`;
            } else {
              errorMessage = `HTTP ${axiosError.response.status} error`;
            }
          } else if (axiosError.request) {
            console.error('Request made but no response received:', axiosError.request);
            errorMessage = 'No response from server. Please check your internet connection.';
          } else if (axiosError.message) {
            errorMessage = axiosError.message;
          }
        } else if ('message' in error) {
          const genericError = error as { message: string };
          errorMessage = genericError.message;
        }
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

  // Handle report generation
  const handleGenerateReport = async () => {
    if (!reportClass) {
      setReportError('Please select a class');
      return;
    }

    if (reportType === 'daily' && !reportDate) {
      setReportError('Please select a date for daily report');
      return;
    }

    if (reportType === 'monthly' && (!reportMonth || !reportYear)) {
      setReportError('Please select month and year for monthly report');
      return;
    }

    try {
      setIsGeneratingReport(true);
      setReportError(null);
      setReportData(null);
      setMonthlyReportData(null);

      if (reportType === 'daily') {
        const formattedDate = reportDate;
        const dailyReportData = await attendanceService.generateReport(
          reportClass,
          reportSection,
          formattedDate,
          teacherId
        );

        if (dailyReportData) {
          setReportData(dailyReportData);
        } else {
          setReportError('No data found for the selected criteria');
        }
      } else if (reportType === 'monthly') {
        const monthlyData = await attendanceService.getMonthlyAttendanceReport(
          parseInt(reportYear),
          parseInt(reportMonth),
          reportClass,
          reportSection
        );

        if (monthlyData) {
          setMonthlyReportData(monthlyData);
        } else {
          setReportError('No monthly data found for the selected criteria');
        }
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setReportError('An error occurred while generating the report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Handle report export
  const handleExportReport = async () => {
    if (reportType === 'daily' && reportData) {
      await handleExportDailyReport();
    } else if (reportType === 'monthly' && monthlyReportData) {
      await handleExportMonthlyReport();
    } else {
      setReportError('No report data to export');
    }
  };

  // Export daily report as CSV
  const handleExportDailyReport = async () => {
    if (!reportData) return;

    try {
      setIsSubmitting(true);
      const csvContent = generateDailyReportCSV(reportData, reportClass, reportSection, reportDate);
      downloadCSV(csvContent, `daily_attendance_report_${reportClass}_${reportDate}.csv`);
      toast.success('Daily report exported successfully!');
    } catch (error) {
      console.error('Error exporting daily report:', error);
      setReportError('An error occurred while exporting the daily report');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export monthly report as CSV
  const handleExportMonthlyReport = async () => {
    if (!monthlyReportData) return;

    try {
      setIsSubmitting(true);
      const csvContent = generateMonthlyReportCSV(monthlyReportData);
      downloadCSV(csvContent, `monthly_attendance_report_${reportClass}_${reportMonth}_${reportYear}.csv`);
      toast.success('Monthly report exported successfully!');
    } catch (error) {
      console.error('Error exporting monthly report:', error);
      setReportError('An error occurred while exporting the monthly report');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate CSV content for daily report
  const generateDailyReportCSV = (data: any, className: string, section: string, date: string) => {
    const header = `Daily Attendance Report\nClass: ${className}\nSection: ${section || 'All Sections'}\nDate: ${date}\nGenerated on: ${new Date().toLocaleDateString()}\n\nSummary:\nTotal Students: ${data.stats?.total || 0}\nPresent: ${data.stats?.present || 0}\nAbsent: ${data.stats?.absent || 0}\nLate: ${data.stats?.late || 0}\n\nStudent Details:\n`;
    
    const csvHeader = 'Student Name,Roll Number,Admission Number,Status,Notes\n';
    const csvRows = data.students.map((student: any) => {
      const name = `"${(student.name || '').replace(/"/g, '""')}"`;
      const rollNumber = student.rollNumber || '';
      const admissionNo = student.admissionNo || '';
      const status = student.status || 'Not Marked';
      const notes = student.notes ? `"${student.notes.replace(/"/g, '""')}"` : '';
      return `${name},${rollNumber},${admissionNo},${status},${notes}`;
    }).join('\n');

    return header + csvHeader + csvRows;
  };

  // Generate CSV content for monthly report
  const generateMonthlyReportCSV = (data: any) => {
    const header = `Monthly Attendance Report\nClass: ${data.reportInfo?.className}\nSection: ${data.reportInfo?.section || 'All Sections'}\nMonth: ${data.reportInfo?.monthName} ${data.reportInfo?.year}\nGenerated on: ${new Date().toLocaleDateString()}\n\nSummary:\nTotal Students: ${data.classStats?.totalStudents || 0}\nTotal Working Days: ${data.classStats?.totalWorkingDays || 0}\nAverage Attendance: ${data.classStats?.averageAttendance || '0'}%\n\nStudent Details:\n`;
    
    const csvHeader = 'Student Name,Roll Number,Admission Number,Total Days,Present Days,Absent Days,Late Days,Attendance Percentage\n';
    const csvRows = data.studentReports.map((studentReport: any) => {
      const name = `"${(studentReport.student?.name || '').replace(/"/g, '""')}"`;
      const rollNumber = studentReport.student?.rollNumber || '';
      const admissionNo = studentReport.student?.admissionNo || '';
      const totalDays = studentReport.attendance?.totalDays || 0;
      const presentDays = studentReport.attendance?.presentDays || 0;
      const absentDays = studentReport.attendance?.absentDays || 0;
      const lateDays = studentReport.attendance?.lateDays || 0;
      const percentage = studentReport.attendance?.attendancePercentage || '0';
      return `${name},${rollNumber},${admissionNo},${totalDays},${presentDays},${absentDays},${lateDays},${percentage}%`;
    }).join('\n');

    return header + csvHeader + csvRows;
  };

  // Helper function to download CSV
  const downloadCSV = (content: string, filename: string) => {
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

  // Print report functionality
  const handlePrintReport = () => {
    if (reportType === 'daily' && reportData) {
      printDailyReport();
    } else if (reportType === 'monthly' && monthlyReportData) {
      printMonthlyReport();
    } else {
      setReportError('No report data to print');
    }
  };

  // Print daily report
  const printDailyReport = () => {
    if (!reportData) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Daily Attendance Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .header h1 { margin: 0; font-size: 24px; color: #333; }
          .header h2 { margin: 5px 0; font-size: 18px; color: #666; }
          .header h3 { margin: 5px 0; font-size: 16px; color: #888; }
          .stats { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #007bff; }
          .stats h4 { margin: 0 0 10px 0; font-size: 16px; color: #333; }
          .stats-line { margin: 5px 0; font-size: 14px; color: #555; }
          .stats-line strong { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Daily Attendance Report</h1>
          <h2>${reportClass} ${reportSection ? `- Section ${reportSection}` : ''}</h2>
          <h3>Date: ${reportDate}</h3>
        </div>
        
        <div class="stats">
          <h4>Attendance Summary</h4>
          <div class="stats-line"><strong>Total Students:</strong> ${reportData.stats?.total || 0}</div>
          <div class="stats-line"><strong>Present:</strong> ${reportData.stats?.present || 0}</div>
          <div class="stats-line"><strong>Absent:</strong> ${reportData.stats?.absent || 0}</div>
          <div class="stats-line"><strong>Late:</strong> ${reportData.stats?.late || 0}</div>
          <div class="stats-line"><strong>Attendance Rate:</strong> ${reportData.stats?.total > 0 ? (((reportData.stats?.present || 0) + (reportData.stats?.late || 0)) / reportData.stats.total * 100).toFixed(1) : 0}%</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll Number</th>
              <th>Admission Number</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.students.map((student: any) => `
              <tr>
                <td>${student.name || ''}</td>
                <td>${student.rollNumber || ''}</td>
                <td>${student.admissionNo || ''}</td>
                <td>${student.status || 'Not Marked'}</td>
                <td>${student.notes || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
      </body>
      </html>
    `;

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

  // Print monthly report
  const printMonthlyReport = () => {
    if (!monthlyReportData) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Monthly Attendance Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .header h1 { margin: 0; font-size: 24px; color: #333; }
          .header h2 { margin: 5px 0; font-size: 18px; color: #666; }
          .header h3 { margin: 5px 0; font-size: 16px; color: #888; }
          .stats { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #28a745; }
          .stats h4 { margin: 0 0 10px 0; font-size: 16px; color: #333; }
          .stats-line { margin: 5px 0; font-size: 14px; color: #555; }
          .stats-line strong { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Monthly Attendance Report</h1>
          <h2>${monthlyReportData.reportInfo?.className} ${monthlyReportData.reportInfo?.section ? `- Section ${monthlyReportData.reportInfo?.section}` : ''}</h2>
          <h3>${monthlyReportData.reportInfo?.monthName} ${monthlyReportData.reportInfo?.year}</h3>
        </div>
        
        <div class="stats">
          <h4>Monthly Summary</h4>
          <div class="stats-line"><strong>Total Students:</strong> ${monthlyReportData.classStats?.totalStudents || 0}</div>
          <div class="stats-line"><strong>Total Working Days:</strong> ${monthlyReportData.classStats?.totalWorkingDays || 0}</div>
          <div class="stats-line"><strong>Average Attendance:</strong> ${monthlyReportData.classStats?.averageAttendance || '0'}%</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll Number</th>
              <th>Total Days</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Late</th>
              <th>Attendance %</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyReportData.studentReports.map((studentReport: any) => `
              <tr>
                <td>${studentReport.student?.name || ''}</td>
                <td>${studentReport.student?.rollNumber || ''}</td>
                <td>${studentReport.attendance?.totalDays || 0}</td>
                <td>${studentReport.attendance?.presentDays || 0}</td>
                <td>${studentReport.attendance?.absentDays || 0}</td>
                <td>${studentReport.attendance?.lateDays || 0}</td>
                <td>${studentReport.attendance?.attendancePercentage || '0'}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
      </body>
      </html>
    `;

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
                    <div className="text-lg font-medium text-blue-800">{Number.isNaN(stats.total) ? 0 : stats.total || 0}</div>
                    <div className="text-sm text-blue-600">Total Students</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="text-lg font-medium text-green-800">{Number.isNaN(stats.present) ? 0 : stats.present || 0}</div>
                    <div className="text-sm text-green-600">Present</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <div className="text-lg font-medium text-red-800">{Number.isNaN(stats.absent) ? 0 : stats.absent || 0}</div>
                    <div className="text-sm text-red-600">Absent</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <div className="text-lg font-medium text-yellow-800">{Number.isNaN(stats.late) ? 0 : stats.late || 0}</div>
                    <div className="text-sm text-yellow-600">Late</div>
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
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isEditing && editingStudentId === student.id ? (
                                <input 
                                  type="text"
                                  defaultValue={student.notes || ''}
                                  onBlur={(e) => {
                                    const studentIdNumber = typeof student.id === 'string' ? parseInt(student.id) : student.id;
                                    handleAddNotes(studentIdNumber, e.target.value);
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
                                onClick={() => {
                                  const studentIdNumber = typeof student.id === 'string' ? parseInt(student.id) : student.id;
                                  handleEditNotes(studentIdNumber);
                                }}
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
            // Reports tab - Now fully functional
            <div className="p-6">
              <div className="bg-white">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Attendance Reports</h2>
                
                {/* Report Controls */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                      <select 
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value as 'monthly' | 'daily')}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Daily Report</option>
                        <option value="monthly">Monthly Report</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                      <select 
                        value={reportClass}
                        onChange={(e) => setReportClass(e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Class</option>
                        {classes.map(cls => (
                          <option key={cls.className} value={cls.className}>{cls.className}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      <select 
                        value={reportSection}
                        onChange={(e) => setReportSection(e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Sections</option>
                        {reportClass && classes.find(c => c.className === reportClass)?.sections.map(section => (
                          <option key={section} value={section}>Section {section}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                      {reportType === 'daily' ? (
                        <input
                          type="date"
                          value={reportDate}
                          onChange={(e) => setReportDate(e.target.value)}
                          className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : reportType === 'monthly' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={reportMonth}
                            onChange={(e) => setReportMonth(e.target.value)}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Month</option>
                            {[
                              { value: '1', label: 'January' },
                              { value: '2', label: 'February' },
                              { value: '3', label: 'March' },
                              { value: '4', label: 'April' },
                              { value: '5', label: 'May' },
                              { value: '6', label: 'June' },
                              { value: '7', label: 'July' },
                              { value: '8', label: 'August' },
                              { value: '9', label: 'September' },
                              { value: '10', label: 'October' },
                              { value: '11', label: 'November' },
                              { value: '12', label: 'December' }
                            ].map(month => (
                              <option key={month.value} value={month.value}>{month.label}</option>
                            ))}
                          </select>
                          <select
                            value={reportYear}
                            onChange={(e) => setReportYear(e.target.value)}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {Array.from({ length: 5 }, (_, i) => {
                              const year = new Date().getFullYear() - i;
                              return (
                                <option key={year} value={year.toString()}>{year}</option>
                              );
                            })}
                          </select>
                        </div>
                      ) : (
                        <input
                          type="date"
                          value={reportDate}
                          onChange={(e) => setReportDate(e.target.value)}
                          className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-3">
                    <button 
                      onClick={handleGenerateReport}
                      disabled={!reportClass || isGeneratingReport}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium"
                    >
                      {isGeneratingReport ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <FaFileAlt className="mr-2" />
                          Generate Report
                        </>
                      )}
                    </button>
                    
                    {(reportData || monthlyReportData) && (
                      <div className="flex space-x-2">
                      <button 
                        onClick={handleExportReport}
                          disabled={isSubmitting}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 text-sm font-medium"
                      >
                        <FaDownload className="mr-2" />
                          {isSubmitting ? 'Exporting...' : 'Export CSV'}
                      </button>
                        
                        <button 
                          onClick={handlePrintReport}
                          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
                        >
                          <FaPrint className="mr-2" />
                          Print Report
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Report Results */}
                {(reportData || monthlyReportData) && (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">
                        {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - {reportClass} 
                        {reportSection && ` (Section ${reportSection})`}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Generated on {new Date().toLocaleDateString()} 
                        {reportType === 'daily' && reportDate && ` for ${reportDate}`}
                        {reportType === 'monthly' && reportMonth && reportYear && ` for ${['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][parseInt(reportMonth)]} ${reportYear}`}
                      </p>
                    </div>
                    
                    {/* Daily Report Display */}
                    {reportType === 'daily' && reportData && (
                      <>
                        {/* Report Statistics */}
                        <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{reportData.stats?.total || 0}</div>
                              <div className="text-sm text-gray-600">Total Students</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{reportData.stats?.present || 0}</div>
                              <div className="text-sm text-gray-600">Present</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">{reportData.stats?.absent || 0}</div>
                              <div className="text-sm text-gray-600">Absent</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-yellow-600">{reportData.stats?.late || 0}</div>
                              <div className="text-sm text-gray-600">Late</div>
                            </div>
                          </div>
                          
                          {reportData.stats && reportData.stats.total > 0 && (
                            <div className="mt-4 text-center">
                              <span className="text-lg font-semibold text-gray-700">
                                Attendance Rate: {(((reportData.stats.present + reportData.stats.late) / reportData.stats.total) * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Report Table */}
                        {reportData.students && reportData.students.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student Name
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Roll No.
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Admission No.
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Notes
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {reportData.students.map((student, index) => (
                                  <tr key={student.id || index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {student.name || ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {student.rollNumber || ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {student.admissionNo || ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        student.status === 'PRESENT' 
                                          ? 'bg-green-100 text-green-800'
                                          : student.status === 'ABSENT'
                                          ? 'bg-red-100 text-red-800'
                                          : student.status === 'LATE'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {student.status || 'Not Marked'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {student.notes || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    )}

                    {/* Monthly Report Display */}
                    {reportType === 'monthly' && monthlyReportData && (
                      <div className="p-6">
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Monthly Overview</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <div className="text-xl font-bold text-blue-600">{monthlyReportData.classStats?.totalStudents || 0}</div>
                              <div className="text-sm text-gray-600">Total Students</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <div className="text-xl font-bold text-green-600">{monthlyReportData.classStats?.totalWorkingDays || 0}</div>
                              <div className="text-sm text-gray-600">Working Days</div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <div className="text-xl font-bold text-purple-600">{monthlyReportData.classStats?.averageAttendance || '0.0'}%</div>
                              <div className="text-sm text-gray-600">Average Attendance</div>
                            </div>
                          </div>
                        </div>
                        
                        {monthlyReportData.studentReports && monthlyReportData.studentReports.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student Name
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
                                {monthlyReportData.studentReports.map((studentReport: any, index: number) => (
                                  <tr key={studentReport.student?.id || index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {studentReport.student?.name || ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {studentReport.attendance?.totalDays || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                      {studentReport.attendance?.presentDays || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                      {studentReport.attendance?.absentDays || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                                      {studentReport.attendance?.lateDays || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {studentReport.attendance?.attendancePercentage || '0'}%
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {((reportType === 'daily' && reportData && (!reportData.students || reportData.students.length === 0)) ||
                      (reportType === 'monthly' && monthlyReportData && (!monthlyReportData.studentReports || monthlyReportData.studentReports.length === 0))) && (
                      <div className="px-6 py-8 text-center">
                        <p className="text-gray-500">No attendance data found for the selected criteria.</p>
                      </div>
                    )}
                  </div>
                )}

                {reportError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{reportError}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;