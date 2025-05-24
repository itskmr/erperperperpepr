// Teacher Dashboard data and utilities
import { useState, useEffect } from 'react';

// Teacher data types
export interface TeacherData {
  name: string;
  id: string;
  role: string;
  isClassIncharge: boolean;
  profileImage?: string;
  assignedClasses: ClassData[];
  inchargeClasses: InchargeClassData[];
  recentActivities: ActivityData[];
  notifications: NotificationData[];
}

export interface ClassData {
  id: number;
  name: string;
  subject: string;
  students: number;
  attendance: number;
}

export interface InchargeClassData {
  id: number;
  name: string;
  students: number;
  subjects: number;
  attendance: number;
  performance: number;
}

export interface ActivityData {
  id: number;
  type: 'assignment' | 'grade' | 'attendance' | 'meeting';
  description: string;
  time: string;
}

export interface NotificationData {
  id: number;
  type: 'alert' | 'reminder' | 'message';
  message: string;
  time: string;
}

export interface PerformanceData {
  subject: string;
  current: number;
  previous: number;
  average: number;
}

export interface AttendanceData {
  weekly: {
    day: string;
    present: number;
    absent: number;
    late: number;
  }[];
  reasons: {
    reason: string;
    percentage: number;
  }[];
}

export interface AssignmentData {
  id: number;
  title: string;
  class: string;
  subject: string;
  submitted: number;
  total: number;
  onTime: number;
  late: number;
}

export interface AtRiskStudentData {
  id: number;
  name: string;
  class: string;
  subject: string;
  current: number;
  trend: number;
  reason: string;
}

export interface ParentEngagementData {
  responseRate: number;
  averageResponseTime: string;
  meetingsScheduled: number;
  pendingResponses: number;
}

export interface ResourceUtilizationData {
  name: string;
  usage: number;
  total: number;
  booked: number;
}

// Mock data for dashboard
export const MOCK_TEACHER_DATA: TeacherData = {
  name: "Rakesh Ruhil",
  id: "T-1001",
  role: "Senior Mathematics Teacher",
  isClassIncharge: true,
  profileImage: "https://randomuser.me/api/portraits/men/67.jpg", // Added profile image
  assignedClasses: [
    { id: 1, name: "Class 9A", subject: "Mathematics", students: 28, attendance: 92 },
    { id: 2, name: "Class 10B", subject: "Mathematics", students: 25, attendance: 88 },
    { id: 3, name: "Class 11C", subject: "Mathematics Advanced", students: 22, attendance: 95 },
    { id: 4, name: "Class 12A", subject: "Mathematics", students: 30, attendance: 90 }
  ],
  inchargeClasses: [
    { id: 1, name: "Class 9A", students: 28, subjects: 6, attendance: 92, performance: 78 }
  ],
  recentActivities: [
    { id: 1, type: "assignment", description: "Posted new assignment for Class 10B", time: "Today, 10:30 AM" },
    { id: 2, type: "grade", description: "Updated grades for Math Quiz - Class 11C", time: "Yesterday, 4:15 PM" },
    { id: 3, type: "attendance", description: "Marked attendance for Class 9A", time: "Yesterday, 9:05 AM" },
    { id: 4, type: "meeting", description: "Scheduled parent meeting for Ryan Smith", time: "Mar 15, 3:30 PM" }
  ],
  notifications: [
    { id: 1, type: "alert", message: "3 students from Class 9A have been absent for 3+ days", time: "1 hour ago" },
    { id: 2, type: "reminder", message: "Math assignment due tomorrow for Class 10B", time: "3 hours ago" },
    { id: 3, type: "message", message: "New message from Principal regarding curriculum update", time: "Yesterday" }
  ]
};

// Mock performance data
export const MOCK_PERFORMANCE_DATA: PerformanceData[] = [
  { subject: "Mathematics", current: 78, previous: 72, average: 74 },
  { subject: "Science", current: 82, previous: 80, average: 79 },
  { subject: "English", current: 75, previous: 78, average: 76 },
  { subject: "History", current: 88, previous: 85, average: 83 },
  { subject: "Computer Science", current: 90, previous: 85, average: 82 }
];

// Mock attendance data
export const MOCK_ATTENDANCE_DATA: AttendanceData = {
  weekly: [
    { day: "Monday", present: 92, absent: 8, late: 3 },
    { day: "Tuesday", present: 95, absent: 5, late: 2 },
    { day: "Wednesday", present: 90, absent: 10, late: 4 },
    { day: "Thursday", present: 88, absent: 12, late: 5 },
    { day: "Friday", present: 85, absent: 15, late: 6 }
  ],
  reasons: [
    { reason: "Medical", percentage: 45 },
    { reason: "Personal", percentage: 30 },
    { reason: "Unexcused", percentage: 15 },
    { reason: "Other", percentage: 10 }
  ]
};

// Mock assignment data
export const MOCK_ASSIGNMENT_DATA: AssignmentData[] = [
  { id: 1, title: "Quadratic Equations", class: "10B", subject: "Mathematics", submitted: 20, total: 25, onTime: 18, late: 2 },
  { id: 2, title: "Linear Algebra Quiz", class: "11C", subject: "Mathematics Advanced", submitted: 19, total: 22, onTime: 17, late: 2 },
  { id: 3, title: "Geometry Project", class: "9A", subject: "Mathematics", submitted: 22, total: 28, onTime: 20, late: 2 },
  { id: 4, title: "Calculus Concepts", class: "12A", subject: "Mathematics", submitted: 25, total: 30, onTime: 22, late: 3 }
];

// Mock student risk data
export const MOCK_AT_RISK_STUDENTS: AtRiskStudentData[] = [
  { id: 1, name: "Emily Chen", class: "9A", subject: "Mathematics", current: 65, trend: -12, reason: "Performance decline in last two weeks" },
  { id: 2, name: "Jason Wilson", class: "10B", subject: "Mathematics", current: 62, trend: -8, reason: "Missed 3 classes in a row" },
  { id: 3, name: "Maria Rodriguez", class: "11C", subject: "Mathematics Advanced", current: 67, trend: -10, reason: "Late submission of 2 consecutive assignments" }
];

// Mock parent engagement data
export const MOCK_PARENT_ENGAGEMENT: ParentEngagementData = {
  responseRate: 78,
  averageResponseTime: "8 hours",
  meetingsScheduled: 12,
  pendingResponses: 5
};

// Mock resource utilization data
export const MOCK_RESOURCE_UTILIZATION: ResourceUtilizationData[] = [
  { name: "Science Lab", usage: 85, total: 8, booked: 7 },
  { name: "Computer Lab", usage: 75, total: 6, booked: 4 },
  { name: "Library Resources", usage: 60, total: 10, booked: 6 },
  { name: "Projectors", usage: 90, total: 4, booked: 4 }
];

// Options for filters
export const filterOptions = {
  classOptions: [
    { value: 'all', label: 'All Classes' },
    { value: '1', label: 'Class 9A' },
    { value: '2', label: 'Class 10B' },
    { value: '3', label: 'Class 11C' },
    { value: '4', label: 'Class 12A' }
  ],
  subjectOptions: [
    { value: 'all', label: 'All Subjects' },
    { value: 'math', label: 'Mathematics' },
    { value: 'mathAdv', label: 'Mathematics Advanced' }
  ],
  timeframeOptions: [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ]
};

// Custom hook for fetching teacher data
export const useTeacherData = (teacherId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);

  useEffect(() => {
    // Simulate API fetch with a delay
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real application, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setTeacherData(MOCK_TEACHER_DATA);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherId]);

  return { teacherData, loading, error };
};

// Filter data based on class, subject, etc.
export const filterAssignmentData = (
  data: AssignmentData[],
  selectedClass: string,
  selectedSubject: string
) => {
  return data.filter(item => {
    const classMatch = selectedClass === 'all' || item.class === selectedClass;
    const subjectMatch = selectedSubject === 'all' || item.subject === selectedSubject;
    return classMatch && subjectMatch;
  });
};

// Generate dynamic loading states for section data
export const useLoadingStates = () => {
  const [loadingStates, setLoadingStates] = useState({
    performance: true,
    attendance: true,
    assignments: true,
    atRiskStudents: true
  });

  useEffect(() => {
    // Simulate staggered loading of different sections
    setTimeout(() => setLoadingStates(prev => ({ ...prev, performance: false })), 600);
    setTimeout(() => setLoadingStates(prev => ({ ...prev, attendance: false })), 900);
    setTimeout(() => setLoadingStates(prev => ({ ...prev, assignments: false })), 1200);
    setTimeout(() => setLoadingStates(prev => ({ ...prev, atRiskStudents: false })), 1500);
  }, []);

  return loadingStates;
};

// Add mock chat messages
export const MOCK_CHAT_MESSAGES = [
  {
    id: '1',
    sender: 'James Peterson',
    message: 'Hello Mr. Johnson, I wanted to ask about Michael\'s recent math test performance.',
    time: '10:15 AM',
    isTeacher: false,
    read: true
  },
  {
    id: '2',
    sender: 'Alex Johnson',
    message: 'Good morning Mr. Peterson! Michael did well overall but struggled with algebraic equations. I recommend some additional practice in that area.',
    time: '10:20 AM',
    isTeacher: true,
    read: true
  },
  {
    id: '3',
    sender: 'James Peterson',
    message: 'Thank you for the specific feedback. Do you have any worksheets or resources you could recommend?',
    time: '10:22 AM',
    isTeacher: false,
    read: true
  },
  {
    id: '4',
    sender: 'Alex Johnson',
    message: 'Absolutely! I\'ll send over a set of practice problems by tomorrow morning, along with links to some interactive online resources that I find helpful for students.',
    time: '10:25 AM',
    isTeacher: true,
    read: true
  },
  {
    id: '5',
    sender: 'James Peterson',
    message: 'That would be great. We really appreciate your support. Michael mentioned he enjoys your teaching style.',
    time: '10:26 AM',
    isTeacher: false,
    read: true
  },
  {
    id: '6',
    sender: 'Alex Johnson',
    message: 'I\'m glad to hear that! I\'ll also schedule a brief session during lunch break tomorrow to review the problems with Michael if that works for him.',
    time: '10:28 AM',
    isTeacher: true,
    read: false
  }
];

// Add mock heatmap data for attendance visualization
export const MOCK_ATTENDANCE_HEATMAP_DATA = [
  { day: 'Monday', period: '1st Period', value: 95 },
  { day: 'Monday', period: '2nd Period', value: 88 },
  { day: 'Monday', period: '3rd Period', value: 92 },
  { day: 'Monday', period: '4th Period', value: 85 },
  { day: 'Tuesday', period: '1st Period', value: 86 },
  { day: 'Tuesday', period: '2nd Period', value: 67 },
  { day: 'Tuesday', period: '3rd Period', value: 78 },
  { day: 'Tuesday', period: '4th Period', value: 82 },
  { day: 'Wednesday', period: '1st Period', value: 90 },
  { day: 'Wednesday', period: '2nd Period', value: 93 },
  { day: 'Wednesday', period: '3rd Period', value: 88 },
  { day: 'Wednesday', period: '4th Period', value: 79 },
  { day: 'Thursday', period: '1st Period', value: 83 },
  { day: 'Thursday', period: '2nd Period', value: 95 },
  { day: 'Thursday', period: '3rd Period', value: 82 },
  { day: 'Thursday', period: '4th Period', value: 75 },
  { day: 'Friday', period: '1st Period', value: 88 },
  { day: 'Friday', period: '2nd Period', value: 90 },
  { day: 'Friday', period: '3rd Period', value: 70 },
  { day: 'Friday', period: '4th Period', value: 68 },
]; 