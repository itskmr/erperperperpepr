// ReportsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Mock data
const mockStudentData = {
  totalCount: 1250,
  byGrade: [
    { grade: '1st', count: 120 },
    { grade: '2nd', count: 135 },
    { grade: '3rd', count: 142 },
    { grade: '4th', count: 128 },
    { grade: '5th', count: 145 },
    { grade: '6th', count: 155 },
    { grade: '7th', count: 140 },
    { grade: '8th', count: 130 },
    { grade: '9th', count: 85 },
    { grade: '10th', count: 70 },
  ],
  genderDistribution: { male: 625, female: 610, other: 15 },
  attendanceRate: 92.5,
  monthlyAttendance: [
    { month: 'Jan', rate: 94 },
    { month: 'Feb', rate: 93 },
    { month: 'Mar', rate: 91 },
    { month: 'Apr', rate: 92 },
    { month: 'May', rate: 90 },
    { month: 'Jun', rate: 88 },
    { month: 'Jul', rate: 85 },
    { month: 'Aug', rate: 91 },
    { month: 'Sep', rate: 93 },
    { month: 'Oct', rate: 95 },
    { month: 'Nov', rate: 94 },
    { month: 'Dec', rate: 92 },
  ]
};

const mockAcademicData = {
  averageGPA: 3.6,
  subjectPerformance: [
    { subject: 'Math', average: 82 },
    { subject: 'Science', average: 78 },
    { subject: 'English', average: 85 },
    { subject: 'History', average: 79 },
    { subject: 'Art', average: 90 },
    { subject: 'PE', average: 92 },
  ],
  yearlyPerformance: [
    { year: '2018', gpa: 3.4 },
    { year: '2019', gpa: 3.5 },
    { year: '2020', gpa: 3.45 },
    { year: '2021', gpa: 3.55 },
    { year: '2022', gpa: 3.6 },
    { year: '2023', gpa: 3.65 },
  ]
};

const mockFinancialData = {
  annualBudget: 2500000,
  expenditure: [
    { category: 'Staff Salaries', amount: 1250000 },
    { category: 'Infrastructure', amount: 450000 },
    { category: 'Learning Resources', amount: 350000 },
    { category: 'Technology', amount: 200000 },
    { category: 'Extracurricular', amount: 150000 },
    { category: 'Administrative', amount: 100000 },
  ],
  monthlyExpenses: [
    { month: 'Jan', amount: 210000 },
    { month: 'Feb', amount: 195000 },
    { month: 'Mar', amount: 205000 },
    { month: 'Apr', amount: 215000 },
    { month: 'May', amount: 220000 },
    { month: 'Jun', amount: 190000 },
    { month: 'Jul', amount: 180000 },
    { month: 'Aug', amount: 230000 },
    { month: 'Sep', amount: 225000 },
    { month: 'Oct', amount: 210000 },
    { month: 'Nov', amount: 200000 },
    { month: 'Dec', amount: 220000 },
  ],
  feesCollection: {
    target: 1800000,
    collected: 1650000,
    pending: 150000
  }
};

const mockStaffData = {
  totalCount: 85,
  byDepartment: [
    { department: 'Teaching', count: 45 },
    { department: 'Administration', count: 15 },
    { department: 'Support', count: 12 },
    { department: 'Maintenance', count: 8 },
    { department: 'IT', count: 5 },
  ],
  experienceDistribution: [
    { range: '0-2 years', count: 15 },
    { range: '3-5 years', count: 25 },
    { range: '6-10 years', count: 30 },
    { range: '>10 years', count: 15 },
  ],
  qualificationDistribution: [
    { qualification: 'Bachelor', count: 20 },
    { qualification: 'Masters', count: 45 },
    { qualification: 'PhD', count: 10 },
    { qualification: 'Other', count: 10 },
  ]
};

const ReportsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Custom SVG Bar Chart Component
  const BarChart: React.FC<{data: any[], xKey: string, yKey: string, color: string}> = ({ data, xKey, yKey, color }) => {
    const maxValue = Math.max(...data.map(item => item[yKey])) * 1.1;
    
    return (
      <div className="h-64 w-full">
        <svg className="w-full h-full" viewBox="0 0 600 300">
          {/* Y-Axis */}
          <line x1="50" y1="250" x2="50" y2="50" stroke="#cbd5e0" strokeWidth="2" />
          
          {/* X-Axis */}
          <line x1="50" y1="250" x2="550" y2="250" stroke="#cbd5e0" strokeWidth="2" />
          
          {/* Bars */}
          {data.map((item, index) => {
            const barWidth = 400 / data.length;
            const barHeight = (item[yKey] / maxValue) * 180;
            const x = 75 + index * (barWidth + 10);
            
            return (
              <motion.g key={index}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                transformOrigin={`${x} 250`}
              >
                <rect
                  x={x}
                  y={250 - barHeight}
                  width={barWidth}
                  height={barHeight}
                  fill={color}
                  rx="4"
                  className="hover:opacity-80 cursor-pointer transition-opacity"
                />
                <text
                  x={x + barWidth / 2}
                  y="270"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#4a5568"
                >
                  {item[xKey]}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={245 - barHeight}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#4a5568"
                >
                  {item[yKey]}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>
    );
  };

  // Custom SVG Line Chart Component
  const LineChart: React.FC<{data: any[], xKey: string, yKey: string, color: string}> = ({ data, xKey, yKey, color }) => {
    const maxValue = Math.max(...data.map(item => item[yKey])) * 1.1;
    const points = data.map((item, index) => {
      const x = 50 + (index * (500 / (data.length - 1)));
      const y = 250 - ((item[yKey] / maxValue) * 180);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="h-64 w-full">
        <svg className="w-full h-full" viewBox="0 0 600 300">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line 
              key={i} 
              x1="50" 
              y1={250 - i * 45} 
              x2="550" 
              y2={250 - i * 45} 
              stroke="#e2e8f0" 
              strokeWidth="1" 
              strokeDasharray="5,5" 
            />
          ))}
          
          {/* Y-Axis */}
          <line x1="50" y1="250" x2="50" y2="50" stroke="#cbd5e0" strokeWidth="2" />
          
          {/* X-Axis */}
          <line x1="50" y1="250" x2="550" y2="250" stroke="#cbd5e0" strokeWidth="2" />
          
          {/* Line */}
          <motion.polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          
          {/* Points */}
          {data.map((item, index) => {
            const x = 50 + (index * (500 / (data.length - 1)));
            const y = 250 - ((item[yKey] / maxValue) * 180);
            
            return (
              <motion.g key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + (index * 0.1) }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="white"
                  stroke={color}
                  strokeWidth="2"
                  className="hover:r-6 transition-all cursor-pointer"
                />
                <text
                  x={x}
                  y="270"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#4a5568"
                >
                  {item[xKey]}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>
    );
  };

  // Custom SVG Pie Chart Component
  const PieChart: React.FC<{data: any[], nameKey: string, valueKey: string, colors: string[]}> = ({ data, nameKey, valueKey, colors }) => {
    const total = data.reduce((sum, item) => sum + item[valueKey], 0);
    let startAngle = 0;
    
    return (
      <div className="h-64 w-full flex justify-center">
        <svg className="w-64 h-64" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const percentage = (item[valueKey] / total) * 100;
            const angle = (percentage / 100) * 360;
            const endAngle = startAngle + angle;
            
            // Calculate SVG arc path
            const x1 = 50 + 40 * Math.cos((Math.PI * startAngle) / 180);
            const y1 = 50 + 40 * Math.sin((Math.PI * startAngle) / 180);
            const x2 = 50 + 40 * Math.cos((Math.PI * endAngle) / 180);
            const y2 = 50 + 40 * Math.sin((Math.PI * endAngle) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            
            const result = (
              <motion.path
                key={index}
                d={pathData}
                fill={colors[index % colors.length]}
                stroke="white"
                strokeWidth="1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="hover:opacity-80 cursor-pointer transition-opacity"
                onMouseEnter={(e) => {
                  // Could add tooltip functionality here
                }}
              />
            );
            
            startAngle = endAngle;
            return result;
          })}
          <circle cx="50" cy="50" r="20" fill="white" />
        </svg>
        <div className="ml-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center mb-2">
              <div 
                className="w-4 h-4 mr-2" 
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span>{item[nameKey]}: {item[valueKey]} ({((item[valueKey] / total) * 100).toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Custom SVG Gauge Chart Component
  const GaugeChart: React.FC<{value: number, max: number, color: string}> = ({ value, max, color }) => {
    const percentage = (value / max) * 100;
    const angle = (percentage / 100) * 180;
    
    return (
      <div className="h-48 w-full flex flex-col items-center">
        <svg className="w-48 h-48" viewBox="0 0 100 100">
          {/* Background arc */}
          <path
            d="M 10 80 A 40 40 0 0 1 90 80"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Value arc */}
          <motion.path
            d="M 10 80 A 40 40 0 0 1 90 80"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="125.6"
            initial={{ strokeDashoffset: 125.6 }}
            animate={{ strokeDashoffset: 125.6 - (angle / 180) * 125.6 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          {/* Needle */}
          <motion.line
            x1="50"
            y1="80"
            x2="50"
            y2="40"
            stroke="#374151"
            strokeWidth="2"
            initial={{ transform: "rotate(-90deg)", transformOrigin: "50px 80px" }}
            animate={{ transform: `rotate(${angle - 90}deg)`, transformOrigin: "50px 80px" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          {/* Center point */}
          <circle cx="50" cy="80" r="4" fill="#374151" />
        </svg>
        <div className="text-2xl font-bold mt-2">{value} / {max}</div>
        <div className="text-gray-500">{percentage.toFixed(1)}%</div>
      </div>
    );
  };

  // Custom SVG Donut Chart Component
  const DonutChart: React.FC<{value: number, max: number, color: string, label: string}> = ({ value, max, color, label }) => {
    const percentage = (value / max) * 100;
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="h-48 w-full flex flex-col items-center justify-center">
        <svg className="w-40 h-40" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
          />
          
          {/* Value circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            transform="rotate(-90 50 50)"
          />
          
          {/* Text */}
          <text
            x="50"
            y="45"
            textAnchor="middle"
            fontSize="18"
            fontWeight="bold"
            fill="#374151"
          >
            {percentage.toFixed(1)}%
          </text>
          <text
            x="50"
            y="65"
            textAnchor="middle"
            fontSize="10"
            fill="#6b7280"
          >
            {label}
          </text>
        </svg>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading reports dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">School Management Reports</h1>
        <p className="text-gray-600">Comprehensive analytics and insights for super administrators</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="mb-8 flex overflow-x-auto bg-white rounded-lg shadow p-1">
        {['overview', 'students', 'academic', 'financial', 'staff'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 font-medium rounded-md transition-all duration-200 ${
              activeTab === tab 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Overview Dashboard */}
      {activeTab === 'overview' && (
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Total Students</h3>
              <span className="p-2 bg-blue-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </span>
            </div>
            <div className="flex items-end">
              <span className="text-3xl font-bold text-gray-800">{mockStudentData.totalCount}</span>
              <span className="ml-2 text-sm text-green-500 font-medium">+5.2% YoY</span>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-500 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                transition={{ duration: 1, delay: 0.5 }}
              ></motion.div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Staff Members</h3>
              <span className="p-2 bg-purple-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
            </div>
            <div className="flex items-end">
              <span className="text-3xl font-bold text-gray-800">{mockStaffData.totalCount}</span>
              <span className="ml-2 text-sm text-green-500 font-medium">+2.1% YoY</span>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-purple-500 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: '70%' }}
                transition={{ duration: 1, delay: 0.6 }}
              ></motion.div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Attendance Rate</h3>
              <span className="p-2 bg-green-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div className="flex items-end">
              <span className="text-3xl font-bold text-gray-800">{mockStudentData.attendanceRate}%</span>
              <span className="ml-2 text-sm text-yellow-500 font-medium">-0.8% MoM</span>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-green-500 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${mockStudentData.attendanceRate}%` }}
                transition={{ duration: 1, delay: 0.7 }}
              ></motion.div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Avg. GPA</h3>
              <span className="p-2 bg-amber-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </span>
            </div>
            <div className="flex items-end">
              <span className="text-3xl font-bold text-gray-800">{mockAcademicData.averageGPA}</span>
              <span className="ml-2 text-sm text-green-500 font-medium">+0.2 YoY</span>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-amber-500 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${(mockAcademicData.averageGPA / 4) * 100}%` }}
                transition={{ duration: 1, delay: 0.8 }}
              ></motion.div>
            </div>
          </motion.div>

          {/* Overview Charts */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 col-span-1 md:col-span-2 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Attendance Trend</h3>
            <LineChart 
              data={mockStudentData.monthlyAttendance} 
              xKey="month" 
              yKey="rate" 
              color="#10B981" 
            />
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 col-span-1 md:col-span-2 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Budget Allocation</h3>
            <PieChart 
              data={mockFinancialData.expenditure} 
              nameKey="category" 
              valueKey="amount" 
              colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']} 
            />
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 col-span-1 md:col-span-2 lg:col-span-4 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Student Distribution by Grade</h3>
            <BarChart 
              data={mockStudentData.byGrade} 
              xKey="grade" 
              yKey="count" 
              color="#3B82F6" 
            />
          </motion.div>

          {/* Key Performance Indicators */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 col-span-1 md:col-span-2 lg:col-span-4 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Key Performance Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <DonutChart 
                  value={mockFinancialData.feesCollection.collected} 
                  max={mockFinancialData.feesCollection.target} 
                  color="#3B82F6" 
                  label="Fees Collection" 
                  />
                  <div className="text-center mt-2">
                    <p className="text-gray-600">Target: ${(mockFinancialData.feesCollection.target / 1000).toFixed(0)}K</p>
                    <p className="text-gray-600">Collected: ${(mockFinancialData.feesCollection.collected / 1000).toFixed(0)}K</p>
                  </div>
                </div>
                
                <div>
                  <GaugeChart 
                    value={mockStudentData.attendanceRate} 
                    max={100} 
                    color="#10B981" 
                  />
                  <p className="text-center text-gray-600 mt-2">Attendance Rate</p>
                </div>
                
                <div>
                  <DonutChart 
                    value={mockAcademicData.averageGPA} 
                    max={4} 
                    color="#8B5CF6" 
                    label="Average GPA" 
                  />
                  <div className="text-center mt-2">
                    <p className="text-gray-600">School Average: {mockAcademicData.averageGPA}</p>
                    <p className="text-gray-600">National Avg: 3.2</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
  
        {/* Student Reports */}
        {activeTab === 'students' && (
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Gender Distribution</h3>
              <PieChart 
                data={[
                  { label: 'Male', value: mockStudentData.genderDistribution.male },
                  { label: 'Female', value: mockStudentData.genderDistribution.female },
                  { label: 'Other', value: mockStudentData.genderDistribution.other }
                ]} 
                nameKey="label" 
                valueKey="value" 
                colors={['#3B82F6', '#EC4899', '#8B5CF6']} 
              />
            </motion.div>
  
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Grade Level Distribution</h3>
              <BarChart 
                data={mockStudentData.byGrade} 
                xKey="grade" 
                yKey="count" 
                color="#10B981" 
              />
            </motion.div>
  
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Attendance Overview</h3>
              <DonutChart 
                value={mockStudentData.attendanceRate} 
                max={100} 
                color="#F59E0B" 
                label="Attendance Rate" 
              />
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Present</span>
                  <span className="font-medium">{mockStudentData.attendanceRate}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-green-500 rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${mockStudentData.attendanceRate}%` }}
                    transition={{ duration: 1 }}
                  ></motion.div>
                </div>
                
                <div className="flex justify-between text-sm mt-3 mb-1">
                  <span className="text-gray-600">Absent</span>
                  <span className="font-medium">{100 - mockStudentData.attendanceRate}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-red-500 rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - mockStudentData.attendanceRate}%` }}
                    transition={{ duration: 1 }}
                  ></motion.div>
                </div>
              </div>
            </motion.div>
  
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 col-span-1 md:col-span-3 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Attendance Trend</h3>
              <LineChart 
                data={mockStudentData.monthlyAttendance} 
                xKey="month" 
                yKey="rate" 
                color="#3B82F6" 
              />
            </motion.div>
  
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 col-span-1 md:col-span-3 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Student Enrollment Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "New Enrollments", value: 245, change: "+12%", color: "green" },
                  { title: "Transfers Out", value: 38, change: "-5%", color: "red" },
                  { title: "Graduation Rate", value: "98.2%", change: "+1.5%", color: "green" }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 p-4 rounded-lg"
                  >
                    <h4 className="text-gray-600 font-medium">{item.title}</h4>
                    <div className="flex items-end mt-2">
                      <span className="text-2xl font-bold text-gray-800">{item.value}</span>
                      <span className={`ml-2 text-sm font-medium text-${item.color}-500`}>{item.change}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
  
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 col-span-1 md:col-span-3 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-700">Student Demographics</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors">Export</button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">Filter</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Male</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Female</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockStudentData.byGrade.map((grade, idx) => (
                      <motion.tr 
                        key={grade.grade}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{grade.grade}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.count}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Math.round(grade.count * 0.51)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Math.round(grade.count * 0.49)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-full rounded-full ${
                                  idx % 3 === 0 ? 'bg-green-500' : idx % 3 === 1 ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${90 + idx % 10}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">{90 + idx % 10}%</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
  
        {/* Academic Reports */}
        {activeTab === 'academic' && (
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Average GPA Trend</h3>
              <LineChart 
                data={mockAcademicData.yearlyPerformance} 
                xKey="year" 
                yKey="gpa" 
                color="#8B5CF6" 
              />
            </motion.div>
  
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Subject Performance</h3>
              <BarChart 
                data={mockAcademicData.subjectPerformance} 
                xKey="subject" 
                yKey="average" 
                color="#EC4899" 
              />
            </motion.div>
  
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Academic Standing</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Honor Roll (GPA ≥ 3.5)</span>
                    <span className="font-medium">42%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-green-500 rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: '42%' }}
                      transition={{ duration: 1 }}
                    ></motion.div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Good Standing (3.0-3.49)</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500 rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: '35%' }}
                      transition={{ duration: 1 }}
                    ></motion.div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Average (2.5-2.99)</span>
                    <span className="font-medium">18%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-yellow-500 rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: '18%' }}
                      transition={{ duration: 1 }}
                    ></motion.div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">At Risk ( 2.5)</span>
                    <span className="font-medium">5%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-red-500 rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: '5%' }}
                      transition={{ duration: 1 }}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
  
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 col-span-1 md:col-span-3 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Standardized Test Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { subject: "Math", schoolAvg: 85, nationalAvg: 78, color: "blue" },
                  { subject: "Reading", schoolAvg: 82, nationalAvg: 76, color: "purple" },
                  { subject: "Science", schoolAvg: 79, nationalAvg: 75, color: "green" }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 p-4 rounded-lg"
                  >
                    <h4 className="text-gray-700 font-medium">{item.subject}</h4>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">School Average</span>
                        <span className="font-medium">{item.schoolAvg}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full bg-${item.color}-500 rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.schoolAvg}%` }}
                          transition={{ duration: 1 }}
                        ></motion.div>
                      </div>
                      
                      <div className="flex justify-between text-sm mt-3 mb-1">
                        <span className="text-gray-600">National Average</span>
                        <span className="font-medium">{item.nationalAvg}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full bg-${item.color}-300 rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.nationalAvg}%` }}
                          transition={{ duration: 1 }}
                        ></motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
  
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 col-span-1 md:col-span-3 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-700">Subject Performance Breakdown</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors">Export</button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">Filter</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Rate</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Grade</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockAcademicData.subjectPerformance.map((subject, idx) => (
                      <motion.tr 
                        key={subject.subject}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.subject}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.average}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Math.round(subject.average * 0.95)}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx === 0 ? '10th' : idx === 1 ? '8th' : idx === 2 ? '9th' : '7th'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {idx % 3 === 0 ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                              </svg>
                            ) : idx % 3 === 1 ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span className="ml-2 text-sm text-gray-500">
                              {idx % 3 === 0 ? '+2.3%' : idx % 3 === 1 ? '0.0%' : '-1.5%'}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
  
        {/* Financial Reports */}
        {activeTab === 'financial' && (
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Budget Allocation</h3>
              <PieChart 
                data={mockFinancialData.expenditure} 
                nameKey="category" 
                valueKey="amount" 
                colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']} 
              />
            </motion.div>
  
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Expenses</h3>
              <LineChart 
                data={mockFinancialData.monthlyExpenses} 
                xKey="month" 
                yKey="amount" 
                color="#EF4444" 
              />
            </motion.div>
  
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Fees Collection</h3>
              <DonutChart 
                value={mockFinancialData.feesCollection.collected} 
                max={mockFinancialData.feesCollection.target} 
                color="#F59E0B" 
                label="Collection Rate" 
              />
              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Target</span>
                  <span className="font-medium">${(mockFinancialData.feesCollection.target / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Collected</span>
                  <span className="font-medium">${(mockFinancialData.feesCollection.collected / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium">${(mockFinancialData.feesCollection.pending / 1000).toFixed(0)}K</span>
                </div>
              </div>
            </motion.div>
  
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 col-span-1 md:col-span-3 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Annual Budget Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Total Budget", value: `$${(mockFinancialData.annualBudget / 1000000).toFixed(1)}M`, change: "+5.2%", color: "blue" },
                  { title: "Total Spent", value: `$${((mockFinancialData.annualBudget * 0.85) / 1000000).toFixed(1)}M`, change: "85%", color: "yellow" },
                  { title: "Remaining", value: `$${((mockFinancialData.annualBudget * 0.15) / 1000000).toFixed(1)}M`, change: "15%", color: "green" }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 p-4 rounded-lg"
                  >
                    <h4 className="text-gray-600 font-medium">{item.title}</h4>
                    <div className="flex items-end mt-2">
                      <span className="text-2xl font-bold text-gray-800">{item.value}</span>
                      <span className={`ml-2 text-sm font-medium text-${item.color}-500`}>{item.change}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
  
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 col-span-1 md:col-span-3 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-700">Expenditure Breakdown</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors">Export</button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">Filter</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockFinancialData.expenditure.map((item, idx) => {
                      const spent = Math.round(item.amount * (0.7 + (idx * 0.05)));
                      const remaining = item.amount - spent;
                      const percentSpent = Math.round((spent / item.amount) * 100);
                      
                      return (
                        <motion.tr 
                          key={item.category}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                                                  transition={{ delay: idx * 0.05 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(item.amount / 1000).toFixed(0)}K</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(spent / 1000).toFixed(0)}K</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(remaining / 1000).toFixed(0)}K</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-full rounded-full ${
                                  percentSpent > 90 ? 'bg-red-500' : percentSpent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${percentSpent}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">{percentSpent}%</span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Staff Reports */}
      {activeTab === 'staff' && (
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Staff by Department</h3>
            <PieChart 
              data={mockStaffData.byDepartment} 
              nameKey="department" 
              valueKey="count" 
              colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']} 
            />
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Experience Distribution</h3>
            <BarChart 
              data={mockStaffData.experienceDistribution} 
              xKey="range" 
              yKey="count" 
              color="#8B5CF6" 
            />
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Qualification Distribution</h3>
            <PieChart 
              data={mockStaffData.qualificationDistribution} 
              nameKey="qualification" 
              valueKey="count" 
              colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']} 
            />
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 col-span-1 md:col-span-3 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Staff Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: "Average Rating", value: "4.2/5", change: "+0.3", color: "green" },
                { title: "Attendance Rate", value: "96.5%", change: "+1.2%", color: "green" },
                { title: "Training Completion", value: "87%", change: "+5%", color: "green" },
                { title: "Retention Rate", value: "92%", change: "-2%", color: "red" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 p-4 rounded-lg"
                >
                  <h4 className="text-gray-600 font-medium">{item.title}</h4>
                  <div className="flex items-end mt-2">
                    <span className="text-2xl font-bold text-gray-800">{item.value}</span>
                    <span className={`ml-2 text-sm font-medium text-${item.color}-500`}>{item.change}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 col-span-1 md:col-span-3 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-700">Department Performance</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors">Export</button>
                <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">Filter</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Count</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Experience</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turnover Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockStaffData.byDepartment.map((dept, idx) => (
                    <motion.tr 
                      key={dept.department}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(3 + (idx * 1.5)).toFixed(1)} years</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-full rounded-full ${
                                idx % 3 === 0 ? 'bg-green-500' : idx % 3 === 1 ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${85 + idx * 3}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">{85 + idx * 3}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(10 - idx).toFixed(1)}%</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 col-span-1 md:col-span-3 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Staff Training & Development</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">Training Completion by Department</h4>
                <div className="space-y-4">
                  {mockStaffData.byDepartment.map((dept, idx) => (
                    <div key={dept.department}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{dept.department}</span>
                        <span className="font-medium">{85 + idx * 2}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full rounded-full ${
                            idx % 4 === 0 ? 'bg-blue-500' : 
                            idx % 4 === 1 ? 'bg-green-500' : 
                            idx % 4 === 2 ? 'bg-purple-500' : 'bg-amber-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${85 + idx * 2}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                        ></motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-3">Professional Development Programs</h4>
                <div className="space-y-3">
                  {[
                    { name: "Leadership Training", participants: 15, status: "In Progress" },
                    { name: "Tech Skills Workshop", participants: 22, status: "Completed" },
                    { name: "Classroom Management", participants: 30, status: "Completed" },
                    { name: "Student Counseling", participants: 12, status: "Upcoming" },
                    { name: "Curriculum Development", participants: 18, status: "In Progress" },
                  ].map((program, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h5 className="font-medium text-gray-800">{program.name}</h5>
                        <p className="text-sm text-gray-500">{program.participants} participants</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        program.status === "Completed" ? "bg-green-100 text-green-800" :
                        program.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {program.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Footer */}
      <motion.div 
        variants={itemVariants} 
        className="mt-8 text-center text-gray-500 text-sm"
      >
        <p>© 2023 School Management System | Super Admin Reports Dashboard</p>
        <p className="mt-1">Last updated: {new Date().toLocaleDateString()}</p>
      </motion.div>
    </motion.div>
  );
};

export default ReportsDashboard;