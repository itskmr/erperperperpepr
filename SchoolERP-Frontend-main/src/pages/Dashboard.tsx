import React, { useState, useEffect } from 'react';
import { Users, CreditCard, AlertCircle, TrendingUp, Calendar, Bell, PieChart, 
  BookOpen, GraduationCap, Award, Clock, FileText, School } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define proper types for chart components
interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface LineChartData {
  month: string;
  amount: number;
}

interface BarChartData {
  name: string;
  value: number;
}

// Colors
const THEME_COLORS = {
  primary: '#3b82f6', // blue
  secondary: '#10b981', // emerald
  accent: '#8b5cf6', // violet
  warning: '#f97316', // orange
  error: '#ef4444', // red
  success: '#22c55e', // green
  info: '#06b6d4', // cyan
  background: '#f8fafc', // light blue gray
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('6months');
  const [view, setView] = useState('all');

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      name: 'Total Students',
      value: '2,543',
      icon: Users,
      change: '+5.4%',
      changeType: 'increase',
      description: 'Active enrollments this semester',
      color: THEME_COLORS.primary
    },
    {
      name: 'Fees Collected',
      value: '₹15,43,250',
      icon: CreditCard,
      change: '+12.3%',
      changeType: 'increase',
      description: 'Total collections this month',
      color: THEME_COLORS.success
    },
    {
      name: 'Due Payments',
      value: '₹2,38,400',
      icon: AlertCircle,
      change: '-2.3%',
      changeType: 'decrease',
      description: 'Pending fee payments',
      color: THEME_COLORS.warning
    },
    {
      name: 'Attendance Rate',
      value: '92.6%',
      icon: Clock,
      change: '+1.8%',
      changeType: 'increase',
      description: 'Average this month',
      color: THEME_COLORS.accent
    }
  ];

  const extraStats = [
    {
      name: 'Academic Performance',
      value: '87.3%',
      icon: GraduationCap,
      change: '+2.4%',
      changeType: 'increase',
      description: 'Average scores',
      color: THEME_COLORS.info
    },
    {
      name: 'Library Books',
      value: '12,450',
      icon: BookOpen,
      change: '+120',
      changeType: 'increase',
      description: 'Total collection',
      color: THEME_COLORS.secondary
    },
    {
      name: 'Scholarships',
      value: '₹8,75,000',
      icon: Award,
      change: '+15.2%',
      changeType: 'increase',
      description: 'Awarded this year',
      color: THEME_COLORS.success
    },
    {
      name: 'Faculty Count',
      value: '186',
      icon: School,
      change: '+12',
      changeType: 'increase',
      description: 'Teaching staff',
      color: THEME_COLORS.primary
    }
  ];

  const recentActivity = [
    {
      id: 1,
      title: 'New Student Registration',
      description: 'Rajesh Kumar registered for Computer Science',
      timestamp: '2 hours ago',
      icon: Users,
      action: 'View Profile'
    },
    {
      id: 2,
      title: 'Fee Payment Received',
      description: 'Priya Sharma paid ₹45,000 for Term 2',
      timestamp: '4 hours ago',
      icon: CreditCard,
      action: 'Receipt'
    },
    {
      id: 3,
      title: 'Due Date Reminder',
      description: 'Fee payment due for 125 students in Class 10',
      timestamp: '5 hours ago',
      icon: Bell,
      action: 'Send Reminder'
    },
    {
      id: 4,
      title: 'Exam Results Published',
      description: 'Class 12 Mid-term results are now available',
      timestamp: '8 hours ago',
      icon: FileText,
      action: 'View Results'
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Parent-Teacher Meeting',
      date: 'March 1, 2025',
      time: '10:00 AM',
      location: 'Main Auditorium',
      description: 'Discussion about academic progress of students'
    },
    {
      id: 2,
      title: 'Annual Sports Day',
      date: 'March 5, 2025',
      time: '9:00 AM',
      location: 'School Grounds',
      description: 'Annual sports competition with various track and field events'
    },
    {
      id: 3,
      title: 'Science Exhibition',
      date: 'March 12, 2025',
      time: '11:00 AM',
      location: 'Science Block',
      description: 'Students showcase innovative science projects'
    }
  ];

  // Sample data for charts
  const feeCollectionData: LineChartData[] = [
    { month: 'Jan', amount: 1250000 },
    { month: 'Feb', amount: 1350000 },
    { month: 'Mar', amount: 1543250 },
    { month: 'Apr', amount: 1650000 },
    { month: 'May', amount: 1440000 },
    { month: 'Jun', amount: 1380000 },
    { month: 'Jul', amount: 1580000 },
    { month: 'Aug', amount: 1720000 },
    { month: 'Sep', amount: 1650000 },
    { month: 'Oct', amount: 1490000 },
    { month: 'Nov', amount: 1420000 },
    { month: 'Dec', amount: 1350000 },
  ];

  const filteredFeeData = timeframe === '6months' 
    ? feeCollectionData.slice(-6) 
    : feeCollectionData;

  // Data for pie chart
  const departmentDistribution: PieChartData[] = [
    { name: 'Computer Science', value: 750, color: THEME_COLORS.primary },
    { name: 'Engineering', value: 620, color: THEME_COLORS.accent },
    { name: 'Commerce', value: 480, color: THEME_COLORS.success },
    { name: 'Arts', value: 350, color: THEME_COLORS.warning },
    { name: 'Science', value: 343, color: THEME_COLORS.info },
  ];

  // Attendance data
  const attendanceData: BarChartData[] = [
    { name: 'Class 6', value: 94 },
    { name: 'Class 7', value: 91 },
    { name: 'Class 8', value: 89 },
    { name: 'Class 9', value: 92 },
    { name: 'Class 10', value: 96 },
    { name: 'Class 11', value: 88 },
    { name: 'Class 12', value: 94 },
  ];

  const formatIndianRupee = (value: number) => {
    // Convert to crores/lakhs format for larger numbers
    if (value >= 10000000) { // 1 crore
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) { // 1 lakh
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    
    // Otherwise use standard Indian formatting
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.4 }
    })
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <div className="flex items-center">
          <School className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NPS School Management Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back! Here's your School overview for today.
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="bg-white rounded-lg shadow-sm p-2 flex gap-2">
            <button 
              onClick={() => setView('all')} 
              className={`px-3 py-1.5 text-sm rounded-md ${view === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              All
            </button>
            <button 
              onClick={() => setView('academic')} 
              className={`px-3 py-1.5 text-sm rounded-md ${view === 'academic' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Academic
            </button>
            <button 
              onClick={() => setView('finance')} 
              className={`px-3 py-1.5 text-sm rounded-md ${view === 'finance' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Finance
            </button>
          </div>
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
      >
        {stats.map((item, index) => (
          <motion.div 
            key={item.name} 
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border-t-4"
            style={{ borderColor: item.color }}
            variants={cardVariants}
            custom={index}
          >
            <div className="flex items-center">
              <div className="rounded-lg p-3" style={{ backgroundColor: `${item.color}20` }}>
                <item.icon className="h-6 w-6" style={{ color: item.color }} aria-hidden="true" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{item.name}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {item.change}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{item.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {view !== 'finance' && (
        <motion.div 
          className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
          }}
        >
          {/* Fee Collection Chart */}
          <motion.div 
            className="bg-white rounded-lg shadow-md p-6"
            variants={cardVariants}
            custom={0}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-gray-900">Fee Collection Trend</h2>
              </div>
              <select 
                className="text-sm border rounded-md p-1.5"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="6months">Last 6 Months</option>
                <option value="12months">Last Year</option>
              </select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredFeeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatIndianRupee(value).replace('₹', '')} />
                  <Tooltip formatter={(value: number) => [formatIndianRupee(value), 'Amount']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke={THEME_COLORS.primary} 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                    name="Fee Collection" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-500">Total Collected:</span>
                  <span className="ml-2 font-semibold">{formatIndianRupee(9800000)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Outstanding:</span>
                  <span className="ml-2 font-semibold text-orange-600">{formatIndianRupee(2384000)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Department Distribution Pie Chart */}
          <motion.div 
            className="bg-white rounded-lg shadow-md p-6"
            variants={cardVariants}
            custom={1}
          >
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-gray-900">Department Distribution</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={departmentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({name, percent}: {name: string; percent: number}) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {departmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} students`, 'Enrollment']} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <p className="text-gray-500">Total Students</p>
                  <p className="font-semibold text-gray-900">2,543</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-gray-500">New Admissions</p>
                  <p className="font-semibold text-gray-900">+127</p>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded-lg">
                  <p className="text-gray-500">Avg. per Class</p>
                  <p className="font-semibold text-gray-900">38</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {view !== 'finance' && (
        <motion.div 
          className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
          }}
        >
          {/* Class Attendance Chart */}
          <motion.div 
            className="bg-white rounded-lg shadow-md p-6"
            variants={cardVariants}
            custom={0}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-gray-900">Class Attendance</h2>
              </div>
              <select className="text-sm border rounded-md p-1.5">
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[80, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Attendance']} />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    name="Attendance Rate" 
                    fill={THEME_COLORS.primary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-500">Average:</span>
                  <span className="ml-2 font-semibold">92.0%</span>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Detailed Report
                </button>
              </div>
            </div>
          </motion.div>

          {/* Secondary Stats */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            variants={cardVariants}
            custom={1}
          >
            {extraStats.slice(0, 4).map((item, index) => (
              <motion.div 
                key={item.name} 
                className="bg-white rounded-lg shadow-md p-4 border-l-4"
                style={{ borderColor: item.color }}
                variants={cardVariants}
                custom={index}
              >
                <div className="flex items-center">
                  <div className="rounded-lg p-2" style={{ backgroundColor: `${item.color}15` }}>
                    <item.icon className="h-5 w-5" style={{ color: item.color }} aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">{item.name}</p>
                    <div className="flex items-baseline">
                      <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                      <span
                        className={`ml-2 text-xs font-medium ${
                          item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {item.change}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      <motion.div 
        className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } }
        }}
      >
        {/* Recent Activity Card */}
        <motion.div 
          className="bg-white rounded-lg shadow-md p-6"
          variants={cardVariants}
          custom={0}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div 
                key={activity.id} 
                className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                <div className="bg-blue-100 rounded-full p-2">
                  <activity.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-400">{activity.timestamp}</p>
                    <button className="text-xs text-blue-600 hover:text-blue-800">{activity.action}</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events Card */}
        <motion.div 
          className="bg-white rounded-lg shadow-md p-6"
          variants={cardVariants}
          custom={1}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
            </div>
            <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors">
              Add Event
            </button>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <motion.div 
                key={event.id} 
                className="flex items-start space-x-4 p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                <div className="bg-blue-100 rounded-lg p-3 text-center min-w-16">
                  <p className="text-xs font-medium text-blue-600">
                    {event.date.split(',')[0]}
                  </p>
                  <p className="text-sm font-bold text-blue-800">
                    {event.time.split(' ')[0]}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                  <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                    Details
                  </button>
                  <button className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
                    RSVP
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;