import { subDays, subMonths, subWeeks, format, addDays } from 'date-fns';

// Types for our dashboard data
export interface DashboardMetrics {
  totalSchools: number;
  schoolsGrowth: number;
  newSchools: number;
  totalStudents: number;
  studentGrowth: number;
  totalTeachers: number;
  teacherGrowth: number;
  totalParents: number;
  parentGrowth: number;
  parentEngagement: number;
  activeSchools: number;
  activeSchoolsChange: number;
  feesCollected: number;
  feeCollection: {
    growth: number;
    forecast: number;
  };
  feesPending: number;
  openTickets: number;
  avgResolutionTime: number;
  resolvedTickets: number;
  serverUptime: number;
  responseTime: number;
  activeUsers: number;
  peakUserTime: string;
}

export interface StudentGrade {
  grade: string;
  count: number;
}

export interface TeacherSubject {
  subject: string;
  count: number;
}

export interface InactiveReason {
  reason: string;
  count: number;
}

export interface EnrollmentDataPoint {
  month: string;
  enrollments: number | null;
  predicted: number;
}

export interface SystemHealthDataPoint {
  date: string;
  uptime: number;
  users: number;
  responseTime: number;
}

export interface RegionalData {
  region: string;
  schools: number;
  activeSchools: number;
  students: number;
  feesCollected: number;
  feesPending: number;
}

export interface FeeBreakdown {
  school: string;
  tuition: number;
  transport: number;
  extracurricular: number;
  pending: number;
}

export interface TicketPriority {
  name: string;
  value: number;
}

export interface TicketCategory {
  name: string;
  value: number;
}

export interface TicketResolutionTime {
  priority: string;
  time: number;
}

export interface TicketData {
  id: string;
  school: string;
  issue: string;
  status: string;
  created: string;
}

// Generate different metrics based on timeframe
export const getMetrics = (timeframe: 'daily' | 'weekly' | 'monthly'): DashboardMetrics => {
  // Base values for monthly view
  const baseMetrics: DashboardMetrics = {
    totalSchools: 100,
    schoolsGrowth: 5.2,
    newSchools: 7,
    totalStudents: 12500,
    studentGrowth: 8.3,
    totalTeachers: 850,
    teacherGrowth: 3.6,
    totalParents: 9600,
    parentGrowth: 7.8,
    parentEngagement: 68.5,
    activeSchools: 75,
    activeSchoolsChange: 2.5,
    feesCollected: 4250000,
    feeCollection: {
      growth: 12.5,
      forecast: 4850000,
    },
    feesPending: 750000,
    openTickets: 24,
    avgResolutionTime: 16.8,
    resolvedTickets: 156,
    serverUptime: 99.8,
    responseTime: 0.6,
    activeUsers: 1240,
    peakUserTime: "14:00 - 16:00"
  };

  // Adjust metrics based on timeframe
  switch (timeframe) {
    case 'daily':
      return {
        ...baseMetrics,
        totalStudents: 12470,
        studentGrowth: 0.3,
        totalTeachers: 845,
        teacherGrowth: 0.1,
        feesCollected: 142000,
        feeCollection: {
          growth: 0.5,
          forecast: 150000,
        },
        feesPending: 28000,
        openTickets: 8,
        avgResolutionTime: 4.2,
        resolvedTickets: 12,
        serverUptime: 99.95,
        responseTime: 0.58,
        activeUsers: 980,
        peakUserTime: "10:00 - 12:00"
      };
    case 'weekly':
      return {
        ...baseMetrics,
        totalStudents: 12490,
        studentGrowth: 1.2,
        totalTeachers: 848,
        teacherGrowth: 0.8,
        feesCollected: 950000,
        feeCollection: {
          growth: 3.2,
          forecast: 1100000,
        },
        feesPending: 175000,
        openTickets: 18,
        avgResolutionTime: 8.5,
        resolvedTickets: 42,
        serverUptime: 99.87,
        responseTime: 0.62,
        activeUsers: 1120,
        peakUserTime: "13:00 - 15:00"
      };
    default:
      return baseMetrics;
  }
};

// Generate system health data based on timeframe
export const getSystemHealthData = (
  timeframe: 'daily' | 'weekly' | 'monthly'
): SystemHealthDataPoint[] => {
  let dataPoints: SystemHealthDataPoint[] = [];
  let startDate: Date;
  let interval: number; // days between data points

  // Set parameters based on timeframe
  switch (timeframe) {
    case 'daily':
      startDate = subDays(new Date(), 24); // Last 24 hours
      interval = 1; // hourly
      for (let i = 0; i <= 24; i++) {
        const date = addDays(startDate, i / 24);
        const hourlyVariation = Math.sin(i * Math.PI / 12) * 0.3 + 0.1; // Create natural daily cycle
        dataPoints.push({
          date: date.toISOString(),
          uptime: 99.8 + (Math.random() * 0.2 - 0.1), // Small random variation
          users: Math.round(800 + hourlyVariation * 600), // Users vary by time of day
          responseTime: 0.5 + hourlyVariation * 0.3, // Response time varies with load
        });
      }
      break;
    
    case 'weekly':
      startDate = subDays(new Date(), 7);
      interval = 1; // daily
      for (let i = 0; i <= 7; i++) {
        const date = addDays(startDate, i);
        // Weekend vs weekday pattern
        const isWeekend = [0, 6].includes(date.getDay());
        const dayFactor = isWeekend ? 0.7 : 1.2;
        
        dataPoints.push({
          date: date.toISOString(),
          uptime: 99.7 + (Math.random() * 0.3),
          users: Math.round(900 + (Math.random() * 400 * dayFactor)),
          responseTime: 0.55 + (Math.random() * 0.15 * dayFactor),
        });
      }
      break;
    
    case 'monthly':
    default:
      startDate = subDays(new Date(), 30);
      interval = 5; // every 5 days
      dataPoints = [
        { date: subDays(new Date(), 30).toISOString(), uptime: 98.7, users: 850, responseTime: 0.8 },
        { date: subDays(new Date(), 25).toISOString(), uptime: 99.2, users: 920, responseTime: 0.9 },
        { date: subDays(new Date(), 20).toISOString(), uptime: 99.8, users: 980, responseTime: 0.7 },
        { date: subDays(new Date(), 15).toISOString(), uptime: 98.9, users: 1050, responseTime: 0.8 },
        { date: subDays(new Date(), 10).toISOString(), uptime: 99.5, users: 1120, responseTime: 0.6 },
        { date: subDays(new Date(), 5).toISOString(), uptime: 99.7, users: 1180, responseTime: 0.7 },
        { date: new Date().toISOString(), uptime: 99.8, users: 1240, responseTime: 0.6 },
      ];
      break;
  }

  return dataPoints;
};

// Generate enrollment prediction data
export const getEnrollmentPredictionData = (
  timeframe: 'daily' | 'weekly' | 'monthly'
): EnrollmentDataPoint[] => {
  // For monthly view - show months
  if (timeframe === 'monthly') {
    return [
      { month: 'Jan', enrollments: 120, predicted: 122 },
      { month: 'Feb', enrollments: 145, predicted: 142 },
      { month: 'Mar', enrollments: 165, predicted: 168 },
      { month: 'Apr', enrollments: 180, predicted: 182 },
      { month: 'May', enrollments: 210, predicted: 208 },
      { month: 'Jun', enrollments: 195, predicted: 198 },
      { month: 'Jul', enrollments: 205, predicted: 210 },
      { month: 'Aug', enrollments: 230, predicted: 225 },
      { month: 'Sep', enrollments: 245, predicted: 240 },
      { month: 'Oct', enrollments: 260, predicted: 255 },
      { month: 'Nov', enrollments: 270, predicted: 265 },
      { month: 'Dec', enrollments: 275, predicted: 280 },
      { month: 'Jan', enrollments: null, predicted: 295 },
      { month: 'Feb', enrollments: null, predicted: 310 },
      { month: 'Mar', enrollments: null, predicted: 325 },
    ];
  } 
  // For weekly view - show weeks
  else if (timeframe === 'weekly') {
    return [
      { month: 'Week 1', enrollments: 220, predicted: 225 },
      { month: 'Week 2', enrollments: 235, predicted: 240 },
      { month: 'Week 3', enrollments: 250, predicted: 255 },
      { month: 'Week 4', enrollments: 265, predicted: 270 },
      { month: 'Week 5', enrollments: 275, predicted: 280 },
      { month: 'Week 6', enrollments: 280, predicted: 285 },
      { month: 'Week 7', enrollments: 290, predicted: 295 },
      { month: 'Week 8', enrollments: 300, predicted: 305 },
      { month: 'Week 9', enrollments: null, predicted: 315 },
      { month: 'Week 10', enrollments: null, predicted: 325 },
      { month: 'Week 11', enrollments: null, predicted: 335 },
    ];
  } 
  // For daily view - show days
  else {
    const days = [];
    const today = new Date();
    
    for (let i = 14; i >= 0; i--) {
      const day = subDays(today, i);
      days.push({ 
        month: format(day, 'MMM dd'),
        enrollments: i > 0 ? 270 + Math.round(Math.random() * 20) : 290,
        predicted: 270 + Math.round((14 - i) * 1.5)
      });
    }
    
    // Add future predictions
    for (let i = 1; i <= 7; i++) {
      const day = addDays(today, i);
      days.push({ 
        month: format(day, 'MMM dd'),
        enrollments: null,
        predicted: 290 + Math.round(i * 1.5)
      });
    }
    
    return days;
  }
};

// Static data that doesn't change with timeframe
export const studentGradeDistribution: StudentGrade[] = [
  { grade: "Pre-K", count: 1050 },
  { grade: "K-2", count: 2300 },
  { grade: "3-5", count: 2800 },
  { grade: "6-8", count: 3100 },
  { grade: "9-10", count: 2150 },
  { grade: "11-12", count: 1100 },
];

export const teacherSubjectDistribution: TeacherSubject[] = [
  { subject: "Math", count: 180 },
  { subject: "Science", count: 165 },
  { subject: "Language", count: 210 },
  { subject: "Social Studies", count: 135 },
  { subject: "Arts", count: 90 },
  { subject: "Physical Ed", count: 70 },
];

export const inactiveReasons: InactiveReason[] = [
  { reason: "Financial", count: 12 },
  { reason: "Low Enrollment", count: 8 },
  { reason: "Compliance", count: 4 },
  { reason: "Infrastructure", count: 1 },
];

export const regionalData: RegionalData[] = [
  { region: 'North', schools: 45, activeSchools: 38, students: 5600, feesCollected: 1850000, feesPending: 280000 },
  { region: 'South', schools: 32, activeSchools: 29, students: 3900, feesCollected: 1540000, feesPending: 210000 },
  { region: 'East', schools: 28, activeSchools: 18, students: 3400, feesCollected: 1220000, feesPending: 390000 },
  { region: 'West', schools: 35, activeSchools: 30, students: 4300, feesCollected: 1680000, feesPending: 180000 },
];

export const feeBreakdown: FeeBreakdown[] = [
  { school: 'School A', tuition: 65000, transport: 12000, extracurricular: 8000, pending: 15000 },
  { school: 'School B', tuition: 70000, transport: 15000, extracurricular: 7000, pending: 8000 },
  { school: 'School C', tuition: 58000, transport: 10000, extracurricular: 10000, pending: 22000 },
  { school: 'School D', tuition: 67000, transport: 14000, extracurricular: 7000, pending: 12000 },
  { school: 'School E', tuition: 72000, transport: 16000, extracurricular: 7000, pending: 5000 },
];

export const ticketAnalytics = {
  byPriority: [
    { name: 'Critical', value: 8 },
    { name: 'High', value: 16 },
    { name: 'Medium', value: 32 },
    { name: 'Low', value: 24 },
  ],
  byCategory: [
    { name: 'Login Issues', value: 22 },
    { name: 'Payment Gateway', value: 18 },
    { name: 'Reporting', value: 15 },
    { name: 'Data Sync', value: 12 },
    { name: 'Permissions', value: 9 },
    { name: 'Other', value: 4 },
  ],
  resolutionTime: [
    { priority: 'Critical', time: 4.2 },
    { priority: 'High', time: 8.6 },
    { priority: 'Medium', time: 24.5 },
    { priority: 'Low', time: 72.3 },
  ]
};

export const mockTicketData: TicketData[] = [
  { id: 'T-1021', school: 'School A', issue: 'Payment Gateway Error', status: 'Urgent', created: 'Oct 21, 2023' },
  { id: 'T-1020', school: 'School C', issue: 'Login Authentication Failure', status: 'Urgent', created: 'Oct 21, 2023' },
  { id: 'T-1019', school: 'School B', issue: 'Report Generation Timeout', status: 'Pending', created: 'Oct 20, 2023' },
  { id: 'T-1018', school: 'School D', issue: 'Student Registration Bug', status: 'Pending', created: 'Oct 20, 2023' },
  { id: 'T-1017', school: 'School A', issue: 'Data Export Issue', status: 'Resolved', created: 'Oct 19, 2023' },
]; 