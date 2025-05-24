import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter,
  ComposedChart, ReferenceLine, RadialBarChart, RadialBar
} from "recharts";
import { 
  Users, Building, DollarSign, AlertTriangle, Server, 
  Activity, Check, Clock, MapPin, TrendingUp, TrendingDown,
  Calendar, BarChart2, PieChart as PieChartIcon, Shield, 
  Eye, Search, Filter, Download, RefreshCcw, Info as InfoIcon,
  Cpu
} from "lucide-react";
import { format, subDays } from 'date-fns';

// Import data from our new data file
import { 
  getMetrics, 
  getSystemHealthData, 
  getEnrollmentPredictionData,
  studentGradeDistribution,
  teacherSubjectDistribution,
  inactiveReasons,
  regionalData,
  feeBreakdown,
  ticketAnalytics,
  mockTicketData
} from './AdminDashboardData';

const AdminDashboard: React.FC = () => {
  // Use 'monthly' as the type to match our enum
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  
  // Add state for system performance chart
  const [systemChartView, setSystemChartView] = useState<'uptime' | 'response' | 'users'>('uptime');
  
  // Get data from our functions based on timeframe
  const [metrics, setMetrics] = useState(getMetrics('monthly'));
  const [systemHealthData, setSystemHealthData] = useState(getSystemHealthData('monthly'));
  const [enrollmentData, setEnrollmentData] = useState(getEnrollmentPredictionData('monthly'));
  
  // States derived from metrics
  const [studentsByGrade, setStudentsByGrade] = useState(studentGradeDistribution);
  const [teachersBySubject, setTeachersBySubject] = useState(teacherSubjectDistribution);
  const [inactiveSchoolReasons, setInactiveSchoolReasons] = useState(inactiveReasons);
  
  // State derivations for cleaner code
  const {
    totalSchools,
    schoolsGrowth,
    newSchools,
    totalStudents,
    studentGrowth,
    totalTeachers,
    teacherGrowth,
    totalParents,
    parentGrowth,
    parentEngagement,
    activeSchools,
    activeSchoolsChange,
    feesCollected,
    feeCollection,
    feesPending,
    openTickets,
    avgResolutionTime,
    resolvedTickets,
    serverUptime,
    responseTime,
    activeUsers,
    peakUserTime
  } = metrics;

  // Update data when timeframe changes
  useEffect(() => {
    const updateDashboardData = async () => {
      setIsLoading(true);
      
      // Simulate API loading delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update all data based on timeframe
      setMetrics(getMetrics(selectedTimeframe));
      setSystemHealthData(getSystemHealthData(selectedTimeframe));
      setEnrollmentData(getEnrollmentPredictionData(selectedTimeframe));
      
      setIsLoading(false);
    };
    
    updateDashboardData();
  }, [selectedTimeframe, selectedRegion]);

  // Format large numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `₹${(amount/1000000).toFixed(2)}M`;
  };

  // Handle time frame change
  const handleTimeframeChange = (timeframe: 'daily' | 'weekly' | 'monthly') => {
    setSelectedTimeframe(timeframe);
  };

  // Handle region filter change
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setIsLoading(true);
    // Simulate data fetch
    setTimeout(() => setIsLoading(false), 800);
  };

  // Export dashboard data as CSV
  const exportDashboardData = () => {
    alert("Exporting dashboard data as CSV...");
    // In real implementation, this would generate and download a CSV file
  };

  // Refresh dashboard data
  const refreshDashboard = () => {
    setIsLoading(true);
    
    // Reload all data based on current timeframe
    setMetrics(getMetrics(selectedTimeframe));
    setSystemHealthData(getSystemHealthData(selectedTimeframe));
    setEnrollmentData(getEnrollmentPredictionData(selectedTimeframe));
    
    setTimeout(() => setIsLoading(false), 1000);
  };

  // Get appropriate date format based on timeframe
  const getDateFormat = () => {
    switch (selectedTimeframe) {
      case 'daily': return 'HH:mm';
      case 'weekly': return 'EEE';
      case 'monthly': 
      default: return 'MMM dd';
    }
  };

  // Handle system chart view change
  const handleSystemChartViewChange = (view: 'uptime' | 'response' | 'users') => {
    setSystemChartView(view);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administrative Command Center</h1>
          <p className="text-gray-600">System-wide oversight, strategic planning, and risk mitigation</p>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button 
              type="button" 
              onClick={() => handleTimeframeChange("daily")}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                selectedTimeframe === "daily" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Daily
            </button>
            <button 
              type="button" 
              onClick={() => handleTimeframeChange("weekly")}
              className={`px-4 py-2 text-sm font-medium ${
                selectedTimeframe === "weekly" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Weekly
            </button>
            <button 
              type="button" 
              onClick={() => handleTimeframeChange("monthly")}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                selectedTimeframe === "monthly" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Monthly
            </button>
          </div>
          
          <select 
            className="bg-white border border-gray-300 rounded-md text-sm px-4 py-2"
            value={selectedRegion}
            onChange={(e) => handleRegionChange(e.target.value)}
          >
            <option value="all">All Regions</option>
            <option value="north">North</option>
            <option value="south">South</option>
            <option value="east">East</option>
            <option value="west">West</option>
          </select>
          
          <button 
            onClick={exportDashboardData}
            className="bg-white border border-gray-300 rounded-md text-sm px-4 py-2 inline-flex items-center gap-2 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          
          <button 
            onClick={refreshDashboard}
            className="bg-white border border-gray-300 rounded-md text-sm px-4 py-2 inline-flex items-center gap-2 hover:bg-gray-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-gray-900/20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <p>Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Key Metrics Section with Growth Indicators */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-indigo-600" />
          Institutional Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCardAdvanced 
            title="Total Schools" 
            value={totalSchools} 
            growth={schoolsGrowth}
            subtitle={`${newSchools} new this quarter`}
            icon={<Building className="h-8 w-8 text-indigo-500" />} 
            bgColor="bg-indigo-50"
            textColor="text-indigo-700"
            onClick={() => alert("View detailed school analytics")}
          />
          <MetricCardAdvanced 
            title="Total Students" 
            value={formatNumber(totalStudents)} 
            growth={studentGrowth}
            subtitle="View demographic breakdown"
            icon={<Users className="h-8 w-8 text-green-500" />} 
            bgColor="bg-green-50"
            textColor="text-green-700"
            onClick={() => alert("View student demographics")}
          />
          <MetricCardAdvanced 
            title="Total Teachers" 
            value={formatNumber(totalTeachers)} 
            growth={teacherGrowth}
            subtitle="By subject and qualification"
            icon={<Users className="h-8 w-8 text-blue-500" />} 
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            onClick={() => alert("View teacher analytics")}
          />
          <MetricCardAdvanced 
            title="Total Parents" 
            value={formatNumber(totalParents)}
            growth={parentGrowth}
            subtitle={`${parentEngagement}% engagement rate`}
            icon={<Users className="h-8 w-8 text-purple-500" />} 
            bgColor="bg-purple-50"
            textColor="text-purple-700"
            onClick={() => alert("View parent engagement details")}
          />
        </div>
      </div>

      {/* Financial Intelligence Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-emerald-600" />
          Financial Intelligence
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCardAdvanced 
            title="Fees Collected" 
            value={formatCurrency(feesCollected)} 
            growth={feeCollection.growth}
            subtitle={`${formatCurrency(feesPending)} pending`}
            icon={<DollarSign className="h-8 w-8 text-emerald-500" />} 
            bgColor="bg-emerald-50"
            textColor="text-emerald-700"
            onClick={() => alert("View detailed financial analytics")}
          />
          <MetricCardAdvanced 
            title="Q2 Forecast" 
            value={formatCurrency(feeCollection.forecast)} 
            growth={3.8}
            subtitle="Based on historical trends"
            icon={<TrendingUp className="h-8 w-8 text-amber-500" />} 
            bgColor="bg-amber-50"
            textColor="text-amber-700"
            onClick={() => alert("View forecast methodology")}
          />
          <MetricCardAdvanced 
            title="Active Schools" 
            value={`${activeSchools}%`} 
            growth={activeSchoolsChange}
            subtitle={`${Math.round(totalSchools * activeSchools / 100)} of ${totalSchools}`}
            icon={<Building className="h-8 w-8 text-teal-500" />} 
            bgColor="bg-teal-50"
            textColor="text-teal-700"
            onClick={() => alert("View active/inactive school details")}
          />
        </div>
      </div>

      {/* Support & Compliance Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
          Support & Compliance
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCardAdvanced 
            title="Open Tickets" 
            value={openTickets} 
            growth={-12.5} // Negative is good for tickets
            isNegativeGood={true}
            subtitle={`Avg. resolution: ${avgResolutionTime}h`}
            icon={<AlertTriangle className="h-8 w-8 text-red-500" />} 
            bgColor="bg-red-50"
            textColor="text-red-700"
            onClick={() => alert("View ticket details")}
          />
          <MetricCardAdvanced 
            title="System Health" 
            value={`${serverUptime}%`} 
            growth={0.3}
            subtitle={`${activeUsers} active users`}
            icon={<Server className="h-8 w-8 text-sky-500" />} 
            bgColor="bg-sky-50"
            textColor="text-sky-700"
            onClick={() => alert("View system health details")}
          />
          <MetricCardAdvanced 
            title="Response Time" 
            value={`${responseTime}s`} 
            growth={-15.2} // Negative is good for response time
            isNegativeGood={true}
            subtitle={`Peak hours: ${peakUserTime}`}
            icon={<Clock className="h-8 w-8 text-violet-500" />} 
            bgColor="bg-violet-50"
            textColor="text-violet-700"
            onClick={() => alert("View performance metrics")}
          />
        </div>
      </div>

      {/* Advanced Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Enrollment Trends with Forecast</h2>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-indigo-500 mr-1"></div>
                <span className="text-xs text-gray-600">Actual</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-emerald-500 mr-1"></div>
                <span className="text-xs text-gray-600">Predicted</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={enrollmentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="enrollments" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="predicted" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
                {selectedTimeframe === 'monthly' && (
                  <ReferenceLine x="Dec" stroke="#888" strokeDasharray="3 3" label={{ value: 'Current', position: 'top', fill: '#888' }} />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Fee Collection Breakdown</h2>
            <button className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center">
              <Filter className="h-3 w-3 mr-1" />
              Filter
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeBreakdown} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="school" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                <Legend />
                <Bar dataKey="tuition" stackId="a" fill="#4F46E5" name="Tuition" />
                <Bar dataKey="transport" stackId="a" fill="#10B981" name="Transport" />
                <Bar dataKey="extracurricular" stackId="a" fill="#6366F1" name="Extra" />
                <Bar dataKey="pending" fill="#EF4444" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Ticket Priority Distribution</h2>
          <div className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ticketAnalytics.byPriority}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                                    {ticketAnalytics.byPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#EF4444', '#F59E0B', '#6366F1', '#10B981'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">System Performance</h2>
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button 
                onClick={() => handleSystemChartViewChange('uptime')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-l-md ${
                  systemChartView === 'uptime' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Uptime
              </button>
              <button 
                onClick={() => handleSystemChartViewChange('response')}
                className={`px-2.5 py-1.5 text-xs font-medium ${
                  systemChartView === 'response' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Response
              </button>
              <button 
                onClick={() => handleSystemChartViewChange('users')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-r-md ${
                  systemChartView === 'users' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Users
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={systemHealthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), getDateFormat())}
                />
                
                {/* Conditional axes based on view */}
                {systemChartView === 'uptime' && (
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    domain={[98, 100]} 
                    tickFormatter={(value) => `${value}%`} 
                  />
                )}
                
                {systemChartView === 'response' && (
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    domain={[0, 'dataMax + 0.5']} 
                    tickFormatter={(value) => `${value}s`} 
                  />
                )}
                
                {systemChartView === 'users' && (
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    domain={[0, 'dataMax + 200']} 
                  />
                )}
                
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'uptime') return [`${value}%`, 'Uptime'];
                    if (name === 'responseTime') return [`${value}s`, 'Response Time'];
                    if (name === 'users') return [value.toLocaleString(), 'Active Users'];
                    return [value, name];
                  }}
                  labelFormatter={(date) => format(new Date(date), 'MMMM dd, yyyy')}
                />
                <Legend />
                
                {/* Show different chart elements based on view */}
                {systemChartView === 'uptime' && (
                  <>
                    <Area 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="uptime" 
                      fill="#4F46E5" 
                      stroke="#4F46E5" 
                      fillOpacity={0.3} 
                    />
                    <ReferenceLine 
                      yAxisId="left" 
                      y={99.5} 
                      stroke="#F59E0B" 
                      strokeDasharray="3 3" 
                      label={{ value: 'SLA Target', position: 'insideTopRight', fill: '#F59E0B' }} 
                    />
                  </>
                )}
                
                {systemChartView === 'response' && (
                  <Bar 
                    yAxisId="left" 
                    dataKey="responseTime" 
                    fill="#10B981" 
                    radius={[4, 4, 0, 0]} 
                  />
                )}
                
                {systemChartView === 'users' && (
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#EF4444" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Support Tickets with enhanced UX */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Support Tickets</h2>
          <div className="flex items-center">
            <div className="relative mr-4">
              <input
                type="text"
                placeholder="Search tickets..."
                className="pl-8 pr-4 py-1.5 text-sm border rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Search className="h-4 w-4 text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
            </div>
            <select className="text-sm border rounded-md bg-gray-50 py-1.5 px-2">
              <option>All Statuses</option>
              <option>Urgent</option>
              <option>Pending</option>
              <option>Resolved</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SLA
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockTicketData.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{ticket.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.school}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.issue}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ticket.status === 'Urgent' 
                        ? 'bg-red-100 text-red-800' 
                        : ticket.status === 'Pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.created}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ticket.status !== 'Resolved' && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${
                          ticket.status === 'Urgent' ? 'bg-red-600 w-3/4' : 'bg-amber-500 w-1/2'
                        }`}></div>
                      </div>
                    )}
                    {ticket.status === 'Resolved' && (
                      <span className="text-xs text-green-600 flex items-center">
                        <Check className="h-3 w-3 mr-1" /> Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">Showing {mockTicketData.length} of {openTickets + resolvedTickets} tickets</div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm border rounded hover:bg-gray-50">Previous</button>
            <button className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">Next</button>
          </div>
        </div>
      </div>

      {/* System Alerts with enhanced styling */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">System Alerts & Notifications</h2>
          <button className="text-xs text-indigo-600 hover:text-indigo-800">View All Alerts</button>
        </div>
        <div className="space-y-4">
          <SystemAlertEnhanced 
            type="warning" 
            title="Scheduled Maintenance"
            message="Server maintenance scheduled for October 25, 2023 from 2:00 AM to 4:00 AM" 
            time="2 days from now"
          />
          <SystemAlertEnhanced 
            type="info" 
            title="Feature Update"
            message="New feature update: Enhanced reporting module now available for all schools" 
            time="Today"
          />
          <SystemAlertEnhanced 
            type="error" 
            title="Authentication Issue"
            message="Login authentication issues reported from School C - Investigation in progress" 
            time="12 minutes ago"
            actionText="View Details"
            onAction={() => alert("View authentication issue details")}
          />
        </div>
      </div>
    </div>
  );
};

interface MetricCardAdvancedProps extends MetricCardProps {
  growth?: number;
  isNegativeGood?: boolean;
  onClick?: () => void;
}

const MetricCardAdvanced: React.FC<MetricCardAdvancedProps> = ({ 
  title, value, subtitle, icon, bgColor, textColor, growth, isNegativeGood = false, onClick 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={onClick}>
      <div className="flex items-center">
        <div className={`${bgColor} p-3 rounded-lg mr-4`}>
          {icon}
        </div>
        <div>
          <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
          <div className="flex items-center">
            <p className={`${textColor} text-2xl font-bold mr-2`}>{value}</p>
            {growth !== undefined && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center ${
                growth > 0 
                  ? (isNegativeGood ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800')
                  : (isNegativeGood ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')
              }`}>
                {growth > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(growth).toFixed(1)}%
              </span>
            )}
          </div>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

interface SystemAlertEnhancedProps extends SystemAlertProps {
  title: string;
  time?: string;
  actionText?: string;
  onAction?: () => void;
}

interface SystemAlertProps {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

const SystemAlertEnhanced: React.FC<SystemAlertEnhancedProps> = ({ 
  type, title, message, time, actionText, onAction
}) => {
  const getTypeStyles = () => {
    switch(type) {
      case 'warning': 
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
          title: 'text-amber-800'
        };
      case 'error': 
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          title: 'text-red-800'
        };
      case 'success': 
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: <Check className="h-5 w-5 text-green-500" />,
          title: 'text-green-800'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: <InfoIcon className="h-5 w-5 text-blue-500" />,
          title: 'text-blue-800'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-lg p-4`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {styles.icon}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-center">
            <h3 className={`text-sm font-medium ${styles.title}`}>{title}</h3>
            {time && <span className="text-xs text-gray-500">{time}</span>}
          </div>
          <div className="mt-1 text-sm text-gray-600">
            <p>{message}</p>
          </div>
          {actionText && (
            <div className="mt-2">
              <button 
                type="button" 
                onClick={onAction}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {actionText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

export default AdminDashboard;