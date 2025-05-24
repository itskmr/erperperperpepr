import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, AlertTriangle, Check, X, AlertCircle, 
  ChevronLeft, ChevronRight, User, Filter 
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

// For now using mock data, later will fetch from attendance table
const MOCK_STUDENT_DATA = {
  name: "Alex Johnson",
  id: 101,
  grade: "9th Grade",
  section: "A",
  attendance: [
    { date: "2025-03-01", status: "PRESENT" },
    { date: "2025-03-02", status: "PRESENT" },
    { date: "2025-03-03", status: "PRESENT" },
    { date: "2025-03-04", status: "LATE", notes: "Arrived 15 minutes late" },
    { date: "2025-03-05", status: "PRESENT" },
    { date: "2025-03-06", status: "PRESENT" },
    { date: "2025-03-07", status: "PRESENT" },
    { date: "2025-03-08", status: "WEEKEND" },
    { date: "2025-03-09", status: "WEEKEND" },
    { date: "2025-03-10", status: "ABSENT", notes: "Medical absence" },
    { date: "2025-03-11", status: "ABSENT", notes: "Medical absence" },
    { date: "2025-03-12", status: "PRESENT" },
    { date: "2025-03-13", status: "PRESENT" },
    { date: "2025-03-14", status: "PRESENT" },
    { date: "2025-03-15", status: "WEEKEND" },
    { date: "2025-03-16", status: "WEEKEND" },
    { date: "2025-03-17", status: "PRESENT" },
    { date: "2025-03-18", status: "PRESENT" },
    { date: "2025-03-19", status: "PRESENT" },
    { date: "2025-03-20", status: "LATE", notes: "Arrived 10 minutes late" },
    { date: "2025-03-21", status: "PRESENT" },
    { date: "2025-03-22", status: "WEEKEND" },
    { date: "2025-03-23", status: "WEEKEND" },
    { date: "2025-03-24", status: "PRESENT" },
    { date: "2025-03-25", status: "PRESENT" },
    { date: "2025-03-26", status: "EXCUSED", notes: "Family event" },
    { date: "2025-03-27", status: "PRESENT" },
    { date: "2025-03-28", status: "PRESENT" },
    { date: "2025-03-29", status: "WEEKEND" },
    { date: "2025-03-30", status: "WEEKEND" },
    { date: "2025-03-31", status: "PRESENT" },
  ]
};

type AttendanceRecord = {
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" | "WEEKEND" | "HOLIDAY";
  notes?: string;
};

type AttendanceSummary = {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  percentage: number;
};

const ParentAttendance: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>({
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: 0,
    percentage: 0
  });
  
  // Load data (would fetch from API in real implementation)
  useEffect(() => {
    // This would be an API call in a real implementation
    setAttendanceData(MOCK_STUDENT_DATA.attendance);
    
    // Calculate summary statistics
    const stats = calculateAttendanceSummary(MOCK_STUDENT_DATA.attendance);
    setSummary(stats);
  }, []);
  
  const calculateAttendanceSummary = (records: AttendanceRecord[]): AttendanceSummary => {
    let present = 0, absent = 0, late = 0, excused = 0;
    
    records.forEach(record => {
      switch(record.status) {
        case 'PRESENT':
          present++;
          break;
        case 'ABSENT':
          absent++;
          break;
        case 'LATE':
          late++;
          break;
        case 'EXCUSED':
          excused++;
          break;
      }
    });
    
    const total = present + absent + late + excused;
    const percentage = total > 0 ? Math.round((present + excused + (late * 0.5)) / total * 100) : 0;
    
    return { present, absent, late, excused, total, percentage };
  };
  
  const getAttendanceForDate = (date: Date): AttendanceRecord | undefined => {
    const dateString = format(date, 'yyyy-MM-dd');
    return attendanceData.find(record => record.date === dateString);
  };
  
  const getDayClassName = (date: Date) => {
    const record = getAttendanceForDate(date);
    
    if (!record) return "bg-gray-100 text-gray-400"; // No data
    
    switch(record.status) {
      case 'PRESENT':
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case 'ABSENT':
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case 'LATE':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case 'EXCUSED':
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case 'WEEKEND':
        return "bg-gray-50 text-gray-400";
      case 'HOLIDAY':
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-gray-100 text-gray-400";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'PRESENT':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'ABSENT':
        return <X className="h-4 w-4 text-red-600" />;
      case 'LATE':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'EXCUSED':
        return <AlertCircle className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const changeMonth = (amount: number) => {
    if (amount > 0) {
      setCurrentMonth(addMonths(currentMonth, amount));
    } else {
      setCurrentMonth(subMonths(currentMonth, Math.abs(amount)));
    }
  };
  
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Attendance Records</h1>
          <div className="flex items-center space-x-4">
            {/* Student selector would go here in a real app */}
            <div className="bg-pink-100 p-2 rounded-full">
              <User className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{MOCK_STUDENT_DATA.name}</p>
              <p className="text-sm text-gray-500">{MOCK_STUDENT_DATA.grade} - Section {MOCK_STUDENT_DATA.section}</p>
            </div>
          </div>
        </div>
        
        {/* Attendance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
            <p className="text-sm text-gray-500">School Days</p>
            <p className="text-2xl font-bold text-gray-800">{summary.total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
            <p className="text-sm text-green-700">Present</p>
            <p className="text-2xl font-bold text-green-800">{summary.present}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
            <p className="text-sm text-red-700">Absent</p>
            <p className="text-2xl font-bold text-red-800">{summary.absent}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-center">
            <p className="text-sm text-yellow-700">Late</p>
            <p className="text-2xl font-bold text-yellow-800">{summary.late}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
            <p className="text-sm text-blue-700">Attendance Rate</p>
            <p className="text-2xl font-bold text-blue-800">{summary.percentage}%</p>
          </div>
        </div>
        
        {/* Attendance Chart */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-green-500 h-4 rounded-full" 
              style={{ width: `${summary.percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
        
        {/* Month Selector */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button 
            onClick={() => changeMonth(1)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Weekday headers */}
          {weekdays.map((day, i) => (
            <div key={i} className="text-center py-2 text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Day slots */}
          {daysInMonth.map((day, i) => {
            const record = getAttendanceForDate(day);
            return (
              <div
                key={i}
                className={`aspect-square flex flex-col items-center justify-center rounded-md p-1 text-sm ${getDayClassName(day)}`}
              >
                <span className="font-medium">{format(day, 'd')}</span>
                {record && record.status !== 'WEEKEND' && (
                  <span className="mt-1">{getStatusIcon(record.status)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Detailed Records */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Daily Attendance Log</h2>
          <button className="flex items-center px-3 py-1.5 bg-gray-100 rounded-md text-gray-700 text-sm hover:bg-gray-200">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </button>
        </div>
        
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData
                .filter(record => record.status !== 'WEEKEND')
                .map((record, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(parseISO(record.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(parseISO(record.date), 'EEEE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${record.status === 'PRESENT' ? 'bg-green-100 text-green-800' : 
                          record.status === 'ABSENT' ? 'bg-red-100 text-red-800' : 
                          record.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-purple-100 text-purple-800'}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.notes || '-'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {summary.absent > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your child has been absent for {summary.absent} {summary.absent === 1 ? 'day' : 'days'} this month.
                {summary.absent >= 3 && " This may affect their academic performance. Please ensure regular attendance."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentAttendance; 