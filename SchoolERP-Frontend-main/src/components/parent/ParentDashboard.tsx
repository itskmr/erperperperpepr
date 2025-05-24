import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  Activity, 
  Bell, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  BarChart,
  AlertTriangle,
  BookOpen,
  PieChart,
  TrendingUp,
  Clock4,
  Download,
  Filter,
  RefreshCw,
  School,
  GraduationCap
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart as RechartBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Sample data - in a real app, this would come from API
const sampleData = {
  studentName: "Alex Johnson",
  grade: "9th Grade",
  upcomingEvents: [
    { id: 1, title: "Parent-Teacher Meeting", date: "2025-04-05", time: "3:00 PM" },
    { id: 2, title: "Science Fair", date: "2025-04-15", time: "10:00 AM" },
    { id: 3, title: "Sports Day", date: "2025-04-22", time: "9:00 AM" }
  ],
  attendance: {
    present: 22,
    absent: 1,
    late: 2,
    total: 25,
    lastAbsent: "2025-03-15"
  },
  messages: [
    { id: 1, from: "Ms. Garcia (Math)", preview: "About Alex's recent test performance...", date: "2025-03-26", unread: true },
    { id: 2, from: "Principal Williams", preview: "School event announcement", date: "2025-03-25", unread: true },
    { id: 3, from: "Mr. Thompson (Science)", preview: "Science project feedback", date: "2025-03-24", unread: true }
  ],
  timetableToday: [
    { period: "1", time: "8:00 - 8:50", subject: "Mathematics", teacher: "Ms. Garcia", room: "301" },
    { period: "2", time: "9:00 - 9:50", subject: "Science", teacher: "Mr. Thompson", room: "Lab 2" },
    { period: "3", time: "10:00 - 10:50", subject: "English", teacher: "Ms. Robinson", room: "205" },
    { period: "4", time: "11:00 - 11:50", subject: "History", teacher: "Mr. Davis", room: "103" }
  ],
  financials: {
    nextPayment: { amount: 25000, dueDate: "2025-04-10", description: "Monthly Tuition Fee" },
    recentPayment: { amount: 25000, date: "2025-03-10", receipt: "REC-23456" }
  },
  // New chat analytics data
  chatAnalytics: {
    totalChats: 236,
    totalTimeSpent: '42h 18m',
    questionsAnswered: 587,
    responseRate: '98.3%',
    recentActivity: [
      { id: 1, topic: 'Mathematics', duration: '35 minutes', timestamp: '2 hours ago', questions: 8 },
      { id: 2, topic: 'Science Project', duration: '42 minutes', timestamp: '1 day ago', questions: 12 },
      { id: 3, topic: 'English Essay', duration: '28 minutes', timestamp: '2 days ago', questions: 6 }
    ],
    subjectDistribution: [
      { name: 'Mathematics', value: 35, color: '#3b82f6' },
      { name: 'Science', value: 25, color: '#8b5cf6' },
      { name: 'Programming', value: 20, color: '#10b981' },
      { name: 'English', value: 12, color: '#f97316' },
      { name: 'Other', value: 8, color: '#6b7280' }
    ],
    monthlyActivity: [
      { day: '01/03', count: 12 },
      { day: '05/03', count: 7 },
      { day: '10/03', count: 6 },
      { day: '15/03', count: 11 },
      { day: '20/03', count: 18 },
      { day: '25/03', count: 11 },
      { day: '30/03', count: 14 }
    ],
    timeSpentData: [
      { day: '01/03', minutes: 45 },
      { day: '05/03', minutes: 43 },
      { day: '10/03', minutes: 35 },
      { day: '15/03', minutes: 45 },
      { day: '20/03', minutes: 72 },
      { day: '25/03', minutes: 58 },
      { day: '30/03', minutes: 59 }
    ],
    weekdayUsage: [
      { name: 'Mon', chats: 42 },
      { name: 'Tue', chats: 38 },
      { name: 'Wed', chats: 45 },
      { name: 'Thu', chats: 39 },
      { name: 'Fri', chats: 35 },
      { name: 'Sat', chats: 22 },
      { name: 'Sun', chats: 15 }
    ],
  }
};

// Dashboard Card component
interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  collapsible?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  icon, 
  children, 
  className = "", 
  fullWidth = false,
  collapsible = false
}) => {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <div className={`bg-white rounded-lg shadow-md ${fullWidth ? 'col-span-full' : ''} ${className}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center">
          <div className="mr-3 text-pink-500">{icon}</div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        {collapsible && (
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-gray-600"
          >
            {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        )}
      </div>
      {!collapsed && (
        <div className="p-5">
          {children}
        </div>
      )}
    </div>
  );
};

// Main Parent Dashboard Component
const ParentDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'7days' | '30days' | '90days'>('30days');
  
  // Filter data based on selected timeframe
  const getFilteredData = (data: any[], amount: number) => {
    switch (timeframe) {
      case '7days':
        return data.slice(-7);
      case '90days':
        return data;
      default: // 30days
        return data.slice(-amount);
    }
  };

  const filteredChatData = getFilteredData(sampleData.chatAnalytics.monthlyActivity, 7);
  const filteredTimeData = getFilteredData(sampleData.chatAnalytics.timeSpentData, 7);
  
  return (
    <div className="space-y-8">
      {/* Header with student info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-pink-50 to-pink-100 p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Parent Dashboard: {sampleData.studentName}'s Progress</h1>
          <p className="text-pink-700">{sampleData.grade} • Academic Year 2024-2025</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center">
          <div className="relative">
            <Bell className="h-6 w-6 text-pink-600" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">{sampleData.messages.filter(m => m.unread).length}</span>
          </div>
          <span className="ml-2 text-sm text-gray-600">Last updated: Today, 8:30 AM</span>
        </div>
      </div>

      {/* Chat Analytics Overview Card */}
      <DashboardCard 
        title={`Your Child's Learning Assistant Usage`}
        icon={<MessageSquare size={22} />}
        className="col-span-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Chats */}
          <div className="bg-blue-50 rounded-lg p-4 flex items-start">
            <div className="rounded-full p-3 bg-blue-100 mr-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Total Chat Sessions</p>
              <p className="text-2xl font-bold text-gray-800">{sampleData.chatAnalytics.totalChats}</p>
              <div className="flex items-center mt-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+12% from last month</span>
              </div>
            </div>
          </div>
          
          {/* Time Spent */}
          <div className="bg-purple-50 rounded-lg p-4 flex items-start">
            <div className="rounded-full p-3 bg-purple-100 mr-3">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-700 font-medium">Child's Learning Time</p>
              <p className="text-2xl font-bold text-gray-800">{sampleData.chatAnalytics.totalTimeSpent}</p>
              <div className="flex items-center mt-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+8.5% from last month</span>
              </div>
            </div>
          </div>
          
          {/* Questions Answered */}
          <div className="bg-green-50 rounded-lg p-4 flex items-start">
            <div className="rounded-full p-3 bg-green-100 mr-3">
              <BarChart className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-700 font-medium">Questions Solved</p>
              <p className="text-2xl font-bold text-gray-800">{sampleData.chatAnalytics.questionsAnswered}</p>
              <div className="flex items-center mt-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+15.2% from last month</span>
              </div>
            </div>
          </div>
          
          {/* Response Rate */}
          <div className="bg-orange-50 rounded-lg p-4 flex items-start">
            <div className="rounded-full p-3 bg-orange-100 mr-3">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-orange-700 font-medium">Study Engagement</p>
              <p className="text-2xl font-bold text-gray-800">{sampleData.chatAnalytics.responseRate}</p>
              <div className="flex items-center mt-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+1.2% from last month</span>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Chat Analytics Charts */}
        <DashboardCard 
          title="Your Child's Chat Activity" 
          icon={<MessageSquare size={22} />}
          className="md:col-span-1 xl:col-span-2"
        >
          {/* Time Frame Selection */}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-sm text-gray-500">Monitor how often your child uses the Learning Assistant</p>
            <div className="inline-flex bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setTimeframe('7days')}
                className={`px-4 py-2 text-sm rounded-md ${
                  timeframe === '7days' ? 'bg-pink-500 text-white' : 'text-gray-700'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeframe('30days')}
                className={`px-4 py-2 text-sm rounded-md ${
                  timeframe === '30days' ? 'bg-pink-500 text-white' : 'text-gray-700'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeframe('90days')}
                className={`px-4 py-2 text-sm rounded-md ${
                  timeframe === '90days' ? 'bg-pink-500 text-white' : 'text-gray-700'
                }`}
              >
                90 Days
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredChatData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Number of Chat Sessions" 
                  stroke="#ec4899" 
                  strokeWidth={3}
                  dot={{ r: 0 }}
                  activeDot={{ r: 6, fill: '#ec4899' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        {/* Subject Distribution */}
        <DashboardCard 
          title="Subjects Your Child Studies" 
          icon={<PieChart size={22} />}
          className="md:col-span-1"
        >
          <p className="text-sm text-gray-500 mb-4">See which subjects your child is focusing on</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={sampleData.chatAnalytics.subjectDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sampleData.chatAnalytics.subjectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                  formatter={(value) => [`${value} sessions`, '']}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  layout="horizontal" 
                  fontSize={12}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        {/* Time Spent */}
        <DashboardCard 
          title="Your Child's Learning Duration" 
          icon={<Clock4 size={22} />}
          className="md:col-span-1"
        >
          <p className="text-sm text-gray-500 mb-4">Track how much time your child spends learning</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartBarChart data={filteredTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                  labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                />
                <Bar 
                  dataKey="minutes" 
                  name="Study Time (minutes)" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={16}
                />
              </RechartBarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        {/* Recent Chat Activity */}
        <DashboardCard 
          title="Recent Learning Sessions" 
          icon={<BookOpen size={22} />}
          className="md:col-span-1"
        >
          <p className="text-sm text-gray-500 mb-4">See what your child has been learning recently</p>
          <div className="space-y-3">
            {sampleData.chatAnalytics.recentActivity.map((activity) => (
              <div key={activity.id} className="p-3 border border-gray-100 rounded-md hover:bg-pink-50 transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{activity.topic}</p>
                    <div className="flex space-x-4 mt-1">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock size={14} className="mr-1" />
                        <span>{activity.duration}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <BarChart size={14} className="mr-1" />
                        <span>{activity.questions} questions</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{activity.timestamp}</span>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <a href="/parent/learning/history" className="text-sm text-pink-600 hover:text-pink-800 flex items-center">
                View your child's complete learning history
                <ChevronRight size={16} className="ml-1" />
              </a>
            </div>
          </div>
        </DashboardCard>

        {/* Weekday Usage */}
        <DashboardCard 
          title="When Your Child Studies" 
          icon={<BarChart size={22} />}
          className="md:col-span-1"
        >
          <p className="text-sm text-gray-500 mb-4">Understand when your child prefers to study during the week</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartBarChart data={sampleData.chatAnalytics.weekdayUsage} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                  labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                />
                <Bar 
                  dataKey="chats" 
                  name="Number of Study Sessions" 
                  fill="#f97316" 
                  radius={[4, 4, 0, 0]} 
                  barSize={20}
                />
              </RechartBarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        {/* Attendance */}
        <DashboardCard 
          title="Your Child's Attendance" 
          icon={<Clock size={22} />}
          className="md:col-span-1"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{sampleData.attendance.present}</p>
                <p className="text-xs text-gray-600">Present</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{sampleData.attendance.absent}</p>
                <p className="text-xs text-gray-600">Absent</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">{sampleData.attendance.late}</p>
                <p className="text-xs text-gray-600">Late</p>
              </div>
            </div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <div style={{ width: `${(sampleData.attendance.present / sampleData.attendance.total) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                <div style={{ width: `${(sampleData.attendance.late / sampleData.attendance.total) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"></div>
                <div style={{ width: `${(sampleData.attendance.absent / sampleData.attendance.total) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">Attendance Rate: <span className="font-medium">{Math.round(((sampleData.attendance.present + sampleData.attendance.late * 0.5) / sampleData.attendance.total) * 100)}%</span></span>
                <span className="text-xs text-gray-500">School Days: {sampleData.attendance.total}</span>
              </div>
            </div>
            {sampleData.attendance.absent > 0 && (
              <div className="flex items-start mt-3 bg-red-50 p-3 rounded-md">
                <AlertTriangle size={18} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">
                  Your child was absent on {new Date(sampleData.attendance.lastAbsent).toLocaleDateString()}. 
                  <a href="/parent/academics/attendance" className="underline ml-1">View details</a>
                </p>
              </div>
            )}
            <div className="pt-2">
              <a href="/parent/academics/attendance" className="text-sm text-pink-600 hover:text-pink-800 flex items-center">
                View detailed attendance records
                <ChevronRight size={16} className="ml-1" />
              </a>
            </div>
          </div>
        </DashboardCard>

        {/* Messages */}
        <DashboardCard 
          title="School Communications" 
          icon={<MessageSquare size={22} />}
          className="md:col-span-1"
        >
          <p className="text-sm text-gray-500 mb-4">Messages from your child's teachers and school</p>
          <div className="space-y-3">
            {sampleData.messages.map(message => (
              <div key={message.id} className={`p-3 border rounded-md cursor-pointer transition-colors ${message.unread ? 'bg-pink-50 border-pink-200' : 'border-gray-100 hover:bg-gray-50'}`}>
                <div className="flex justify-between">
                  <p className={`font-medium ${message.unread ? 'text-pink-700' : 'text-gray-700'}`}>{message.from}</p>
                  {message.unread && (
                    <span className="bg-pink-200 text-pink-800 text-xs px-2 py-0.5 rounded-full">New</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">{message.preview}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(message.date).toLocaleDateString()}</p>
              </div>
            ))}
            <div className="pt-2 flex justify-between">
              <a href="/parent/communication/messages" className="text-sm text-pink-600 hover:text-pink-800 flex items-center">
                View all messages
                <ChevronRight size={16} className="ml-1" />
              </a>
              <a href="/parent/communication/send" className="text-sm text-pink-600 hover:text-pink-800 flex items-center">
                Contact teacher
              </a>
            </div>
          </div>
        </DashboardCard>

        {/* Fee Information */}
        <DashboardCard 
          title="School Fee Information" 
          icon={<School size={22} />}
          className="md:col-span-1"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Next Payment Due</p>
                  <p className="text-lg font-bold text-gray-800">₹{sampleData.financials.nextPayment.amount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500">{sampleData.financials.nextPayment.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">Due Date</p>
                  <p className="text-sm text-red-600">{new Date(sampleData.financials.nextPayment.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-4">
                <button className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 transition-colors">
                  Pay Now
                </button>
              </div>
            </div>
            <div className="pt-2">
              <a href="/parent/fees/details" className="text-sm text-pink-600 hover:text-pink-800 flex items-center">
                Payment history & details
                <ChevronRight size={16} className="ml-1" />
              </a>
            </div>
          </div>
        </DashboardCard>

        {/* Upcoming Events */}
        <DashboardCard 
          title="Upcoming School Events" 
          icon={<Calendar size={22} />}
          className="md:col-span-1"
        >
          <div className="space-y-3">
            {sampleData.upcomingEvents.map(event => (
              <div key={event.id} className="p-3 border border-gray-100 rounded-md hover:bg-gray-50 transition-colors">
                <p className="font-medium text-gray-800">{event.title}</p>
                <div className="flex justify-between mt-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={14} className="mr-1" />
                    <span>{event.time}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <a href="/parent/communication/calendar" className="text-sm text-pink-600 hover:text-pink-800 flex items-center">
                View full school calendar
                <ChevronRight size={16} className="ml-1" />
              </a>
            </div>
          </div>
        </DashboardCard>

        {/* Today's Timetable */}
        <DashboardCard 
          title="Your Child's Schedule Today" 
          icon={<Clock size={22} />}
          className="md:col-span-1"
        >
          <div className="space-y-3">
            {sampleData.timetableToday.map((period, index) => (
              <div key={index} className="flex items-center p-2 border-l-4 border-pink-500 bg-pink-50 rounded-r-md">
                <div className="w-10 h-10 flex items-center justify-center bg-pink-100 text-pink-700 rounded-full mr-3 font-bold">
                  {period.period}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{period.subject}</p>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">{period.time}</p>
                    <p className="text-xs text-gray-500">Room {period.room}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <a href="/parent/schedule/timetable" className="text-sm text-pink-600 hover:text-pink-800 flex items-center">
                View full class schedule
                <ChevronRight size={16} className="ml-1" />
              </a>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default ParentDashboard; 