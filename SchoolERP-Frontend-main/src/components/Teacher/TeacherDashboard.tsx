import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  Users, TrendingUp, MessageSquare, Calendar, ChevronDown, ChevronUp, Bell, 
  Zap, UserCheck, Activity, Award, FileText, Book, HelpCircle, Settings,
  RefreshCw, Filter, Mail, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import components
import {
  SelectDropdown, MetricCard, TabGroup, AIAlert, CollapsibleSection, ChartComponent,
  TeacherProfile, PerformanceBar, StudentRiskCard, ResourceUtilization, CalendarEvent,
  QuickActionButton, ProgressLoader, AnimatedContainer, SkeletonLoader, HeatmapChart,
  ChatInterface
} from './components/DashboardComponents';

// Import data and hooks
import {
  useTeacherData, useLoadingStates, filterOptions,
  MOCK_PERFORMANCE_DATA, MOCK_ATTENDANCE_DATA, MOCK_ASSIGNMENT_DATA,
  MOCK_AT_RISK_STUDENTS, MOCK_PARENT_ENGAGEMENT, MOCK_RESOURCE_UTILIZATION,
  MOCK_CHAT_MESSAGES, MOCK_ATTENDANCE_HEATMAP_DATA
} from './data/teacherDashboardData';

// Lazy loaded components for code splitting
const ClassInchargeTools = lazy(() => import('./sections/ClassInchargeTools'));
const ClassPerformance = lazy(() => import('./sections/ClassPerformance'));

// Main dashboard component
const TeacherDashboard: React.FC = () => {
  // Teacher data state
  const { teacherData, loading: teacherLoading, error } = useTeacherData('T-1001');
  const loadingStates = useLoadingStates();
  
  // State for filters and tabs
  const [timeframe, setTimeframe] = useState('weekly');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [activeMetricsTab, setActiveMetricsTab] = useState('Performance');
  const [activeReportTab, setActiveReportTab] = useState('At-Risk Students');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Function to refresh dashboard data
  const refreshDashboard = () => {
    setIsRefreshing(true);
    // Simulate refresh with delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  // Show loader when data is loading
  if (teacherLoading || !teacherData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <ProgressLoader loading={true} progress={60} text="Loading teacher dashboard..." />
      </div>
    );
  }

  // Show error if data loading failed
  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto shadow-sm">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all shadow-sm"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading overlay */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <ProgressLoader loading={true} progress={70} text="Refreshing dashboard data..." />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto p-4 sm:p-6">
        {/* Dashboard Header */}
        <motion.div 
          className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg mb-6 overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <TeacherProfile 
                name={teacherData.name}
                role={teacherData.role}
                isClassIncharge={teacherData.isClassIncharge}
                profileImage={teacherData.profileImage}
              />
              
              <div className="flex justify-end gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white bg-opacity-20 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-opacity-30 transition-all"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={16} />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white bg-opacity-20 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-opacity-30 transition-all"
                  onClick={refreshDashboard}
                  disabled={isRefreshing}
                >
                  <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                  Refresh Data
                </motion.button>
              </div>
            </div>
            
            {/* Filters Row - conditionally shown */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 pt-4 border-t border-white border-opacity-20 overflow-hidden"
                >
                  <div className="flex flex-wrap gap-3">
                    <SelectDropdown 
                      label="Class"
                      options={filterOptions.classOptions}
                      value={selectedClass}
                      onChange={setSelectedClass}
                    />
                    
                    <SelectDropdown 
                      label="Subject"
                      options={filterOptions.subjectOptions}
                      value={selectedSubject}
                      onChange={setSelectedSubject}
                    />
                    
                    <SelectDropdown 
                      label="Time Period"
                      options={filterOptions.timeframeOptions}
                      value={timeframe}
                      onChange={setTimeframe}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-6 xl:grid-cols-12 gap-6">
          
          {/* Quick stats/KPIs - Full width on mobile, spans 12 columns */}
          <div className="md:col-span-6 xl:col-span-12">
            <AnimatedContainer>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <MetricCard
                  title="Total Students"
                  value={teacherData.assignedClasses.reduce((sum, cls) => sum + cls.students, 0)}
                  subtitle={`in ${teacherData.assignedClasses.length} classes`}
                  icon={<Users className="h-5 w-5 text-blue-600" />}
                  color="bg-blue-100"
                  trend={{ value: 5, label: "increase this term" }}
                  delay={100}
                />
                
                <MetricCard
                  title="Average Attendance"
                  value={`${Math.round(teacherData.assignedClasses.reduce((sum, cls) => sum + cls.attendance, 0) / teacherData.assignedClasses.length)}%`}
                  subtitle="this week"
                  icon={<UserCheck className="h-5 w-5 text-emerald-600" />}
                  color="bg-emerald-100"
                  trend={{ value: -2, label: "vs last week" }}
                  delay={200}
                />
                
                <MetricCard
                  title="Avg. Performance"
                  value="78%"
                  subtitle="across subjects"
                  icon={<Activity className="h-5 w-5 text-purple-600" />}
                  color="bg-purple-100"
                  trend={{ value: 3, label: "vs last term" }}
                  delay={300}
                />
                
                <MetricCard
                  title="Parent Engagement"
                  value={`${MOCK_PARENT_ENGAGEMENT.responseRate}%`}
                  subtitle="response rate"
                  icon={<MessageSquare className="h-5 w-5 text-amber-600" />}
                  color="bg-amber-100"
                  trend={{ value: 12, label: "increase" }}
                  delay={400}
                />
              </div>
            </AnimatedContainer>
          </div>
          
          {/* Main Dashboard Columns */}
          {/* Left column - Performance metrics - spans 8 columns on large screens */}
          <div className="md:col-span-6 xl:col-span-8 space-y-6">
            {/* Performance section with tabs */}
            <motion.div 
              className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="border-b border-gray-100 p-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Activity className="h-5 w-5 text-emerald-600 mr-2" />
                    Class Performance Metrics
                  </h2>
                  
                  <div className="flex items-center text-xs text-gray-500 bg-gray-50 p-1.5 rounded-md">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 mr-1"></span>
                    <span className="mr-3">Current</span>
                    <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                    <span className="mr-3">Previous</span>
                    <span className="w-3 h-3 rounded-full bg-gray-300 mr-1"></span>
                    <span>Average</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <TabGroup
                  tabs={['Performance', 'Attendance', 'Assignments']}
                  activeTab={activeMetricsTab}
                  onChange={setActiveMetricsTab}
                />
                
                <div className="mt-4">
                  {/* Performance Tab */}
                  {activeMetricsTab === 'Performance' && (
                    <div className="mt-4">
                      {loadingStates.performance ? (
                        <div className="space-y-4">
                          {[1, 2, 3, 4, 5].map(i => (
                            <SkeletonLoader key={i} height="h-16" />
                          ))}
                        </div>
                      ) : (
                        <AnimatedContainer>
                          <div className="space-y-4">
                            {MOCK_PERFORMANCE_DATA.map((subject, index) => (
                              <PerformanceBar
                                key={subject.subject}
                                subject={subject.subject}
                                current={subject.current}
                                previous={subject.previous}
                                average={subject.average}
                              />
                            ))}
                          </div>
                        </AnimatedContainer>
                      )}
                      <div className="mt-6 text-center">
                        <motion.button 
                          className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-100 transition-all flex items-center mx-auto"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          View Detailed Performance Report
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  )}
                  
                  {/* Attendance Tab */}
                  {activeMetricsTab === 'Attendance' && (
                    <div className="mt-4">
                      {loadingStates.attendance ? (
                        <>
                          <SkeletonLoader height="h-64" />
                          <div className="mt-4 grid grid-cols-2 gap-4">
                            <SkeletonLoader height="h-36" />
                            <SkeletonLoader height="h-36" />
                          </div>
                        </>
                      ) : (
                        <>
                          <HeatmapChart 
                            title="Weekly Attendance Distribution by Period" 
                            data={MOCK_ATTENDANCE_HEATMAP_DATA}
                          />
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                              <h4 className="text-sm font-medium mb-3 text-gray-700">Attendance by Reason</h4>
                              <AnimatedContainer>
                                <div className="space-y-3">
                                  {MOCK_ATTENDANCE_DATA.reasons.map((item) => (
                                    <div key={item.reason} className="flex justify-between text-sm items-center">
                                      <span className="text-gray-800">{item.reason}</span>
                                      <div className="flex items-center">
                                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                                          <motion.div 
                                            className={`h-full rounded-full ${
                                              item.reason === 'Sick Leave' ? 'bg-amber-500' : 
                                              item.reason === 'Personal Leave' ? 'bg-blue-500' : 
                                              item.reason === 'Unexcused' ? 'bg-red-500' : 'bg-green-500'
                                            }`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.percentage}%` }}
                                            transition={{ duration: 0.8, delay: 0.1 }}
                                          />
                                        </div>
                                        <span className="font-medium">{item.percentage}%</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </AnimatedContainer>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                              <h4 className="text-sm font-medium mb-3 text-gray-700">Daily Breakdown</h4>
                              <AnimatedContainer>
                                <div className="space-y-3">
                                  {MOCK_ATTENDANCE_DATA.weekly.map((day) => (
                                    <div key={day.day} className="flex justify-between text-sm items-center">
                                      <span className="text-gray-800">{day.day}</span>
                                      <div className="flex items-center">
                                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                                          <motion.div 
                                            className={`h-full bg-emerald-500 rounded-full`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${day.present}%` }}
                                            transition={{ duration: 0.8, delay: 0.1 }}
                                          />
                                        </div>
                                        <span className="font-medium">{day.present}%</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </AnimatedContainer>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Assignments Tab */}
                  {activeMetricsTab === 'Assignments' && (
                    <div className="mt-4">
                      {loadingStates.assignments ? (
                        <div className="space-y-3">
                          {[1, 2, 3, 4].map(i => (
                            <SkeletonLoader key={i} height="h-12" />
                          ))}
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr className="bg-gray-50">
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Assignment
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Class
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Submission
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  On Time
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              <AnimatedContainer>
                                {MOCK_ASSIGNMENT_DATA.map((assignment) => (
                                  <motion.tr 
                                    key={assignment.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    whileHover={{ backgroundColor: '#f9fafb' }}
                                    className="cursor-pointer"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {assignment.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {assignment.class}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      <div className="flex items-center">
                                        <span className="mr-2">{assignment.submitted}/{assignment.total}</span>
                                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                          <motion.div 
                                            className="h-full bg-emerald-500 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(assignment.submitted / assignment.total) * 100}%` }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                          />
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      <div className="flex items-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          assignment.late > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                          {assignment.onTime}/{assignment.submitted} On Time
                                          {assignment.late > 0 && ` (${assignment.late} Late)`}
                                        </span>
                                      </div>
                                    </td>
                                  </motion.tr>
                                ))}
                              </AnimatedContainer>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          
            {/* Advanced visualizations section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="border-b border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-800 flex items-center">
                      <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                      Predictive Student Performance
                    </h2>
                    <button className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                      AI Powered
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  {loadingStates.performance ? (
                    <SkeletonLoader height="h-60" />
                  ) : (
                    <>
                      <div className="h-60 flex items-center justify-center bg-gray-50 rounded mb-3">
                        {/* This is where we'd integrate a proper chart library like Chart.js or Recharts */}
                        <div className="relative w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 400 150" className="w-full h-full p-4">
                            <path
                              d="M0,75 C50,30 100,120 150,90 C200,65 250,95 300,75 C350,55 400,90 400,75"
                              fill="none"
                              stroke="#8b5cf6"
                              strokeWidth="3"
                            />
                            <path
                              d="M0,75 C50,60 100,140 150,105 C200,80 250,110 300,90 C350,70 400,100 400,90"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="3"
                              strokeDasharray="5,5"
                            />
                          </svg>
                          <motion.div
                            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full shadow-lg"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1, duration: 0.5 }}
                          >
                            +8% predicted growth by end of term
                          </motion.div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-purple-600 mr-1"></div>
                          <span>Current Trajectory</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-emerald-500 mr-1 border border-dashed border-emerald-500"></div>
                          <span>With Interventions</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-900">Key Findings:</div>
                        <ul className="text-xs text-gray-700 mt-1 space-y-1">
                          <motion.li
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div>
                            95% probability of improvement in Algebra with targeted exercises
                          </motion.li>
                          <motion.li
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="flex items-center"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></div>
                            At-risk areas: Geometry and Problem Solving
                          </motion.li>
                          <motion.li
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 }}
                            className="flex items-center"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                            Group study sessions recommended for 7 students
                          </motion.li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="border-b border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-800 flex items-center">
                      <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                      Assignment Completion Trends
                    </h2>
                    <SelectDropdown 
                      label=""
                      options={[
                        { value: 'weekly', label: 'Weekly' },
                        { value: 'monthly', label: 'Monthly' },
                        { value: 'term', label: 'Term' },
                      ]}
                      value="weekly"
                      onChange={() => {}}
                    />
                  </div>
                </div>
                <div className="p-4">
                  {loadingStates.assignments ? (
                    <SkeletonLoader height="h-60" />
                  ) : (
                    <>
                      <div className="h-60 flex items-center justify-center bg-gray-50 rounded mb-3">
                        {/* This is where we'd integrate a proper chart library like Chart.js or Recharts */}
                        <div className="relative w-full h-full p-4">
                          <div className="grid grid-cols-5 h-full gap-4 items-end pt-6">
                            {[80, 65, 90, 75, 82].map((value, index) => (
                              <div key={index} className="relative h-full flex flex-col justify-end">
                                <motion.div
                                  className="bg-blue-500 rounded-t-md w-full"
                                  initial={{ height: 0 }}
                                  animate={{ height: `${value}%` }}
                                  transition={{ duration: 0.8, delay: index * 0.1 }}
                                />
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][index]}
                                </div>
                                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold">
                                  {value}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-sm font-medium text-blue-800">On-Time: 78%</div>
                          <div className="text-xs text-blue-600 mt-1">↑ 5% from last week</div>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg">
                          <div className="text-sm font-medium text-amber-800">Late: 22%</div>
                          <div className="text-xs text-amber-600 mt-1">↓ 3% from last week</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          
            {/* AI-powered insights section */}
            <motion.div 
              className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="border-b border-gray-100 p-4">
                <div className="flex items-center">
                  <div className="bg-amber-100 p-2 rounded-md mr-3">
                    <Zap className="h-5 w-5 text-amber-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">AI-Powered Insights</h2>
                </div>
              </div>
              
              <div className="p-4">
                <TabGroup
                  tabs={['At-Risk Students', 'Recommendations', 'Auto-Generated Reports']}
                  activeTab={activeReportTab}
                  onChange={setActiveReportTab}
                />
                
                <div className="mt-4">
                  {/* At-Risk Students Tab */}
                  {activeReportTab === 'At-Risk Students' && (
                    <div className="space-y-4">
                      {loadingStates.atRiskStudents ? (
                        <>
                          {[1, 2, 3].map(i => (
                            <SkeletonLoader key={i} height="h-28" />
                          ))}
                        </>
                      ) : (
                        <AnimatedContainer>
                          {MOCK_AT_RISK_STUDENTS.map((student) => (
                            <StudentRiskCard
                              key={student.id}
                              name={student.name}
                              classGrade={student.class}
                              subject={student.subject}
                              current={student.current}
                              trend={student.trend}
                              reason={student.reason}
                              onMessageClick={() => alert(`Message to ${student.name}'s parent`)}
                              onScheduleClick={() => alert(`Scheduling intervention for ${student.name}`)}
                            />
                          ))}
                        </AnimatedContainer>
                      )}
                    </div>
                  )}
                  
                  {/* Recommendations Tab */}
                  {activeReportTab === 'Recommendations' && (
                    <div className="space-y-3">
                      <AIAlert
                        title="Three students have attendance issues"
                        description="Jason, Maria, and Alex have missed more than 3 classes this month."
                        action="Send Automated Reminders"
                        severity="medium"
                        onActionClick={() => alert('Sending automated reminders')}
                      />
                      
                      <AIAlert
                        title="Class 10B performance declining in Mathematics"
                        description="Average performance has dropped by 8% compared to last month."
                        action="Schedule Review Session"
                        severity="high"
                        onActionClick={() => alert('Scheduling review session')}
                      />
                      
                      <AIAlert
                        title="Five students may benefit from additional resources"
                        description="Based on recent quiz results in Mathematics Advanced."
                        action="View Recommended Materials"
                        severity="low"
                        onActionClick={() => alert('Viewing recommended materials')}
                      />
                      
                      <AIAlert
                        title="Parent-teacher conference recommended"
                        description="For Emily Chen based on recent performance changes."
                        action="Schedule Meeting"
                        severity="medium"
                        onActionClick={() => alert('Scheduling parent meeting')}
                      />
                    </div>
                  )}
                  
                  {/* Auto-Generated Reports Tab */}
                  {activeReportTab === 'Auto-Generated Reports' && (
                    <div className="space-y-3">
                      <motion.div 
                        className="bg-white border border-gray-200 rounded-lg p-3"
                        whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-gray-900">Weekly Performance Summary</h3>
                            <p className="text-sm text-gray-600">Auto-generated on March 17, 2025</p>
                          </div>
                          <button className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
                            Download PDF
                          </button>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-white border border-gray-200 rounded-lg p-3"
                        whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-gray-900">Class Incharge Monthly Report</h3>
                            <p className="text-sm text-gray-600">Auto-generated on March 01, 2025</p>
                          </div>
                          <button className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
                            Download PDF
                          </button>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-white border border-gray-200 rounded-lg p-3"
                        whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-gray-900">Parent-Teacher Conference Notes</h3>
                            <p className="text-sm text-gray-600">Drafts prepared for 5 students</p>
                          </div>
                          <button className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
                            Review & Edit
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Right column - Sidebar content - spans 4 columns on large screens */}
          <div className="md:col-span-6 xl:col-span-4 space-y-6">
            {/* Class Incharge specific tools - only shown if incharge */}
            {teacherData.isClassIncharge && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Suspense fallback={<SkeletonLoader height="h-64" />}>
                  <ClassInchargeTools 
                    inchargeClasses={teacherData.inchargeClasses}
                    resourceUtilization={MOCK_RESOURCE_UTILIZATION}
                  />
                </Suspense>
              </motion.div>
            )}
            
            {/* Quick Action Buttons - Moved to top of sidebar */}
            <motion.div 
              className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="border-b border-gray-100 p-4">
                <h2 className="text-base font-semibold text-gray-800">Quick Actions</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <QuickActionButton
                    icon={<UserCheck className="h-5 w-5 mb-1" />}
                    label="Take Attendance"
                    color="bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                  />
                  <QuickActionButton
                    icon={<FileText className="h-5 w-5 mb-1" />}
                    label="Create Assignment"
                    color="bg-blue-50 hover:bg-blue-100 text-blue-700"
                  />
                  <QuickActionButton
                    icon={<Book className="h-5 w-5 mb-1" />}
                    label="Add Materials"
                    color="bg-purple-50 hover:bg-purple-100 text-purple-700"
                  />
                  <QuickActionButton
                    icon={<MessageSquare className="h-5 w-5 mb-1" />}
                    label="Message Students"
                    color="bg-amber-50 hover:bg-amber-100 text-amber-700"
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Calendar & upcoming events */}
            <motion.div 
              className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="border-b border-gray-100 p-4">
                <div className="flex items-center">
                  <div className="bg-red-100 p-2 rounded-md mr-3">
                    <Calendar className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-800">Upcoming Schedule</h2>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-3">
                  <CalendarEvent
                    month="MAR"
                    day={21}
                    title="Class 10B Mathematics Test"
                    time="09:30 AM - 11:00 AM"
                    type="class"
                  />
                  
                  <CalendarEvent
                    month="MAR"
                    day={22}
                    title="Department Meeting"
                    time="01:30 PM - 03:00 PM"
                    type="meeting"
                  />
                  
                  <CalendarEvent
                    month="MAR"
                    day={23}
                    title="Parent-Teacher Conference"
                    time="04:00 PM - 06:00 PM"
                    type="event"
                  />
                  
                  <motion.button 
                    className="w-full text-sm font-medium text-indigo-600 border border-indigo-100 bg-indigo-50 py-2 rounded-md mt-2 hover:bg-indigo-100 transition-colors flex items-center justify-center"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View Full Calendar
                  </motion.button>
                </div>
              </div>
            </motion.div>
            
            {/* Parent engagement section */}
            <motion.div 
              className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="border-b border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-md mr-3">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-800">Parent Engagement</h2>
                  </div>
                  <div className="flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-blue-50 p-1.5 rounded text-blue-600"
                    >
                      <Mail size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-green-50 p-1.5 rounded text-green-600"
                    >
                      <Phone size={16} />
                    </motion.button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div 
                      className="bg-blue-50 p-3 rounded-lg text-center shadow-sm"
                      whileHover={{ y: -3 }}
                    >
                      <p className="text-sm text-gray-600">Response Rate</p>
                      <p className="text-xl font-semibold text-gray-900 mt-1">{MOCK_PARENT_ENGAGEMENT.responseRate}%</p>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-blue-50 p-3 rounded-lg text-center shadow-sm"
                      whileHover={{ y: -3 }}
                    >
                      <p className="text-sm text-gray-600">Avg. Response Time</p>
                      <p className="text-xl font-semibold text-gray-900 mt-1">{MOCK_PARENT_ENGAGEMENT.averageResponseTime}</p>
                    </motion.div>
                  </div>
                  
                  <TabGroup
                    tabs={['Recent Conversation', 'All Parents']}
                    activeTab={'Recent Conversation'}
                    onChange={() => {}}
                  />
                  
                  <ChatInterface 
                    messages={MOCK_CHAT_MESSAGES} 
                    onSendMessage={(message) => console.log('Message sent:', message)}
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Recent Activity & Notifications */}
            <motion.div 
              className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="border-b border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-amber-100 p-2 rounded-md mr-3">
                      <Bell className="h-5 w-5 text-amber-600" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-800">Recent Activity</h2>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    {teacherData.notifications.length} New
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-3">
                  <AnimatedContainer>
                    {teacherData.recentActivities.map((activity) => (
                      <motion.div 
                        key={activity.id} 
                        className="flex items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                        whileHover={{ x: 3 }}
                      >
                        <div className={`p-2 rounded-full mr-3 
                          ${activity.type === 'assignment' ? 'bg-blue-100 text-blue-600' : 
                          activity.type === 'grade' ? 'bg-emerald-100 text-emerald-600' : 
                          activity.type === 'attendance' ? 'bg-amber-100 text-amber-600' : 
                          'bg-purple-100 text-purple-600'}`}
                        >
                          {activity.type === 'assignment' ? <FileText className="h-4 w-4" /> : 
                           activity.type === 'grade' ? <Award className="h-4 w-4" /> : 
                           activity.type === 'attendance' ? <UserCheck className="h-4 w-4" /> : 
                           <MessageSquare className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatedContainer>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <motion.button 
                    className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center"
                    whileHover={{ x: 3 }}
                  >
                    View All Activity
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Footer section with additional resources */}
        <motion.div 
          className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
            <h3 className="text-sm font-medium text-gray-700">Teacher Resources & Settings</h3>
          </div>
          <div className="p-4">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-sm font-medium text-gray-700 flex items-center mb-3">
                  <HelpCircle className="h-4 w-4 mr-1 text-emerald-600" />
                  Teacher Resources
                </h3>
                <div className="flex flex-wrap gap-2">
                  <motion.a 
                    href="#" 
                    className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 shadow-sm flex items-center"
                    whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  >
                    <Book className="h-3 w-3 mr-1.5" />
                    Teaching Guides
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 shadow-sm flex items-center"
                    whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  >
                    <FileText className="h-3 w-3 mr-1.5" />
                    Lesson Plan Templates
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 shadow-sm flex items-center"
                    whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  >
                    <Award className="h-3 w-3 mr-1.5" />
                    Professional Development
                  </motion.a>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 flex items-center mb-3">
                  <Settings className="h-4 w-4 mr-1 text-emerald-600" />
                  Dashboard Settings
                </h3>
                <div className="flex flex-wrap gap-2">
                  <motion.button 
                    className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 shadow-sm flex items-center"
                    whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                    onClick={refreshDashboard}
                  >
                    <RefreshCw className="h-3 w-3 mr-1.5" />
                    Refresh Data
                  </motion.button>
                  <motion.button 
                    className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 shadow-sm flex items-center"
                    whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  >
                    <Settings className="h-3 w-3 mr-1.5" />
                    Customize Widgets
                  </motion.button>
                  <motion.button 
                    className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 shadow-sm flex items-center"
                    whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  >
                    <Bell className="h-3 w-3 mr-1.5" />
                    Notification Preferences
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
