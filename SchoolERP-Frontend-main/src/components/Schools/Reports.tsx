import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Styled components could be used for more advanced styling
// This is a simulated styled component approach
const StyledCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl ${className}`}>
    {children}
  </div>
);

// Enhanced mock data with more details
const attendanceData = [
  { month: 'Jan', attendance: 92, previousYear: 90, target: 95 },
  { month: 'Feb', attendance: 94, previousYear: 89, target: 95 },
  { month: 'Mar', attendance: 91, previousYear: 88, target: 95 },
  { month: 'Apr', attendance: 88, previousYear: 87, target: 95 },
  { month: 'May', attendance: 86, previousYear: 85, target: 95 },
  { month: 'Jun', attendance: 94, previousYear: 92, target: 95 },
  { month: 'Jul', attendance: 97, previousYear: 94, target: 95 },
  { month: 'Aug', attendance: 96, previousYear: 93, target: 95 },
  { month: 'Sep', attendance: 93, previousYear: 91, target: 95 },
  { month: 'Oct', attendance: 90, previousYear: 88, target: 95 },
  { month: 'Nov', attendance: 89, previousYear: 87, target: 95 },
  { month: 'Dec', attendance: 87, previousYear: 85, target: 95 },
];

const enrollmentData = [
  { year: '2020', students: 450, male: 220, female: 230, international: 45 },
  { year: '2021', students: 520, male: 250, female: 270, international: 62 },
  { year: '2022', students: 580, male: 280, female: 300, international: 75 },
  { year: '2023', students: 620, male: 300, female: 320, international: 85 },
  { year: '2024', students: 680, male: 330, female: 350, international: 95 },
];

const teacherPerformanceData = [
  { 
    id: 1,
    name: 'Ms. Johnson', 
    rating: 4.8, 
    subjects: 'Math', 
    students: 120,
    experience: 8,
    qualifications: 'Ph.D',
    feedbackScore: 92,
    improvementRate: 4.2
  },
  { 
    id: 2,
    name: 'Mr. Smith', 
    rating: 4.5, 
    subjects: 'Science', 
    students: 110,
    experience: 6,
    qualifications: 'M.Sc',
    feedbackScore: 88,
    improvementRate: 3.8
  },
  { 
    id: 3,
    name: 'Mrs. Davis', 
    rating: 4.7, 
    subjects: 'English', 
    students: 115,
    experience: 10,
    qualifications: 'M.A',
    feedbackScore: 90,
    improvementRate: 4.0
  },
  { 
    id: 4,
    name: 'Mr. Wilson', 
    rating: 4.6, 
    subjects: 'History', 
    students: 105,
    experience: 7,
    qualifications: 'Ph.D',
    feedbackScore: 89,
    improvementRate: 3.9
  },
  { 
    id: 5,
    name: 'Ms. Brown', 
    rating: 4.9, 
    subjects: 'Art', 
    students: 90,
    experience: 12,
    qualifications: 'M.F.A',
    feedbackScore: 95,
    improvementRate: 4.5
  },
];

const subjectPerformanceData = [
  { name: 'Math', average: 78, passingRate: 92, improvement: 3.2, difficulty: 4.2 },
  { name: 'Science', average: 82, passingRate: 94, improvement: 2.8, difficulty: 4.0 },
  { name: 'English', average: 75, passingRate: 90, improvement: 2.5, difficulty: 3.5 },
  { name: 'History', average: 80, passingRate: 93, improvement: 3.0, difficulty: 3.8 },
  { name: 'Art', average: 88, passingRate: 98, improvement: 2.0, difficulty: 2.5 },
];

const gradeDistributionData = [
  { name: 'A', value: 25, color: '#4CAF50' },
  { name: 'B', value: 35, color: '#2196F3' },
  { name: 'C', value: 25, color: '#FFC107' },
  { name: 'D', value: 10, color: '#FF9800' },
  { name: 'F', value: 5, color: '#F44336' },
];

const studentDemographicsData = [
  { name: 'Male', value: 52 },
  { name: 'Female', value: 48 },
];

const studentAgeDistributionData = [
  { age: '5-8', count: 120 },
  { age: '9-12', count: 240 },
  { age: '13-15', count: 180 },
  { age: '16-18', count: 140 },
];

const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#FF9800', '#F44336', '#9C27B0', '#3F51B5'];

const SchoolReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [exportFormat, setExportFormat] = useState<string>('csv');
  const [dateRange, setDateRange] = useState<string>('year');
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chartType, setChartType] = useState<string>('bar');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const avgAttendance = attendanceData.reduce((sum, item) => sum + item.attendance, 0) / attendanceData.length;
    const totalStudents = enrollmentData[enrollmentData.length - 1].students;
    const avgRating = teacherPerformanceData.reduce((sum, item) => sum + item.rating, 0) / teacherPerformanceData.length;
    const avgPerformance = subjectPerformanceData.reduce((sum, item) => sum + item.average, 0) / subjectPerformanceData.length;
    
    return {
      avgAttendance: avgAttendance.toFixed(1),
      totalStudents,
      teacherCount: teacherPerformanceData.length,
      avgRating: avgRating.toFixed(1),
      avgPerformance: avgPerformance.toFixed(1),
      passingGrades: gradeDistributionData.slice(0, 3).reduce((sum, item) => sum + item.value, 0)
    };
  }, []);

  // Function to export data
  const exportData = () => {
    // Function to convert data to CSV
    const convertToCSV = (data: any[]) => {
      const headers = Object.keys(data).join(',');
      const rows = data.map(item => Object.values(item).join(','));
      return [headers, ...rows].join('\n');
    };

    let dataToExport;
    let filename;

    switch (activeTab) {
      case 'performance':
        dataToExport = teacherPerformanceData;
        filename = 'teacher-performance';
        break;
      case 'attendance':
        dataToExport = attendanceData;
        filename = 'attendance-trends';
        break;
      case 'enrollment':
        dataToExport = enrollmentData;
        filename = 'enrollment-data';
        break;
      default:
        dataToExport = teacherPerformanceData;
        filename = 'school-data';
    }

    if (exportFormat === 'csv') {
      const csvData = convertToCSV(dataToExport);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (exportFormat === 'pdf') {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(`School Report: ${filename}`, 14, 22);
      
      // Add date
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Add table
      const tableColumn = Object.keys(dataToExport);
      const tableRows = dataToExport.map(item => Object.values(item));
      
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
      });
      
      doc.save(`${filename}.pdf`);
    }
  };

  // Dashboard component
  const Dashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:col-span-3"
      >
        <StyledCard>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Performance Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-sm text-blue-600 font-medium">Average Attendance</p>
              <p className="text-2xl font-bold">{summaryStats.avgAttendance}%</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-sm text-green-600 font-medium">Total School</p>
              <p className="text-2xl font-bold">{summaryStats.totalStudents}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
              <p className="text-sm text-purple-600 font-medium">Teacher Rating</p>
              <p className="text-2xl font-bold">{summaryStats.avgRating}/5</p>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500">
              <p className="text-sm text-amber-600 font-medium">Average Performance</p>
              <p className="text-2xl font-bold">{summaryStats.avgPerformance}%</p>
            </div>
          </div>
        </StyledCard>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="lg:col-span-2"
      >
        <StyledCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Attendance Trends</h3>
            <div className="flex space-x-2">
              <button 
                className={`px-2 py-1 text-xs rounded ${chartType === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setChartType('line')}
              >
                Line
              </button>
              <button 
                className={`px-2 py-1 text-xs rounded ${chartType === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setChartType('bar')}
              >
                Bar
              </button>
              <button 
                className={`px-2 py-1 text-xs rounded ${chartType === 'area' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setChartType('area')}
              >
                Area
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart
                  data={attendanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis domain={[60, 100]} stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: 'none' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="attendance" stroke="#4CAF50" strokeWidth={2} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="previousYear" stroke="#2196F3" strokeWidth={2} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="target" stroke="#F44336" strokeWidth={2} />
                </LineChart>
              ) : chartType === 'bar' ? (
                <BarChart
                  data={attendanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis domain={[60, 100]} stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: 'none' }}
                  />
                  <Legend />
                  <Bar dataKey="attendance" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="previousYear" fill="#2196F3" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart
                  data={attendanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis domain={[60, 100]} stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: 'none' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="attendance" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="previousYear" stroke="#2196F3" fill="#2196F3" fillOpacity={0.1} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </StyledCard>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <StyledCard>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Grade Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gradeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value}%`}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: 'none' }}
                />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  formatter={(value, entry, index) => (
                    <span className="text-gray-800">{value} ({gradeDistributionData[index].value}%)</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </StyledCard>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="lg:col-span-3"
      >
        <StyledCard>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Subject Performance Analysis</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={subjectPerformanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis yAxisId="left" stroke="#888" />
                <YAxis yAxisId="right" orientation="right" stroke="#888" domain={[0, 5]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: 'none' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="average" fill="#8884d8" radius={[4, 4, 0, 0]} name="Average Score (%)" />
                <Bar yAxisId="left" dataKey="passingRate" fill="#82ca9d" radius={[4, 4, 0, 0]} name="Passing Rate (%)" />
                <Line yAxisId="right" type="monotone" dataKey="difficulty" stroke="#ff7300" strokeWidth={2} name="Difficulty (1-5)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </StyledCard>
      </motion.div>
    </div>
  );

  // Performance Reports component
  const PerformanceReports = () => {
    const selectedTeacherData = teacherPerformanceData.find(t => t.id === selectedTeacher);
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3"
        >
          <StyledCard>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">School & Teacher Performance</h2>
              <div className="flex space-x-2">
                <button 
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                  onClick={() => setSelectedTeacher(null)}
                >
                  View All
                </button>
              </div>
            </div>
            
            {selectedTeacher ? (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-blue-800">{selectedTeacherData?.name}</h3>
                    <p className="text-blue-600">Subject: {selectedTeacherData?.subjects}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedTeacherData?.rating}/5</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="text-xl font-bold">{selectedTeacherData?.experience} years</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500">Students</p>
                    <p className="text-xl font-bold">{selectedTeacherData?.students}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500">Feedback Score</p>
                    <p className="text-xl font-bold">{selectedTeacherData?.feedbackScore}%</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Teacher Ratings</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={teacherPerformanceData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis domain={[0, 5]} stroke="#888" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: 'none' }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="rating" 
                        fill="#8884d8" 
                        name="Teacher Rating (out of 5)" 
                        radius={[4, 4, 0, 0]}
                        onClick={(data) => setSelectedTeacher(data.id)} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Subject Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} data={subjectPerformanceData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Average Score" dataKey="average" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Radar name="Passing Rate" dataKey="passingRate" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Legend />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: 'none' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Grade Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradeDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {gradeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Teacher Performance Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700">Teacher</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700">Rating</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700">Subjects</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700">Students</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700">Experience</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherPerformanceData.map((teacher, index) => (
                      <tr 
                        key={index} 
                        className={`
                          border-b border-gray-200 hover:bg-blue-50 transition-colors
                          ${selectedTeacher === teacher.id ? 'bg-blue-50' : index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                        `}
                      >
                        <td className="py-3 px-4">{teacher.name}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="mr-2">{teacher.rating}</span>
                            <div className="w-20 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${(teacher.rating / 5) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{teacher.subjects}</td>
                        <td className="py-3 px-4">{teacher.students}</td>
                        <td className="py-3 px-4">{teacher.experience} years</td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => setSelectedTeacher(teacher.id)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </StyledCard>
        </motion.div>
      </div>
    );
  };

  // Attendance Reports component
  const AttendanceReports = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-2"
      >
        <StyledCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Attendance Analysis</h2>
            <div className="flex space-x-2">
            <select 
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="year">Past Year</option>
                <option value="semester">Past Semester</option>
                <option value="quarter">Past Quarter</option>
                <option value="month">Past Month</option>
              </select>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={attendanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis domain={[60, 100]} stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: 'none' }}
                />
                <Legend />
                <Area type="monotone" dataKey="previousYear" fill="#2196F3" stroke="#2196F3" fillOpacity={0.3} name="Previous Year %" />
                <Bar dataKey="attendance" barSize={20} fill="#4CAF50" name="Current Year %" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="target" stroke="#FF5722" strokeWidth={2} name="Target %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-green-700 font-medium">Average Attendance</p>
              <p className="text-2xl font-bold text-green-800">{summaryStats.avgAttendance}%</p>
              <p className="text-xs text-green-600 mt-1">
                {Number(summaryStats.avgAttendance) > 90 ? '↑ Above target' : '↓ Below target'}
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-blue-700 font-medium">Best Month</p>
              <p className="text-2xl font-bold text-blue-800">
                {attendanceData.reduce((prev, current) => (prev.attendance > current.attendance) ? prev : current).month}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {attendanceData.reduce((prev, current) => (prev.attendance > current.attendance) ? prev : current).attendance}% attendance
              </p>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
              <p className="text-sm text-amber-700 font-medium">Lowest Month</p>
              <p className="text-2xl font-bold text-amber-800">
                {attendanceData.reduce((prev, current) => (prev.attendance < current.attendance) ? prev : current).month}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                {attendanceData.reduce((prev, current) => (prev.attendance < current.attendance) ? prev : current).attendance}% attendance
              </p>
            </div>
          </div>
        </StyledCard>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <StyledCard>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Attendance by Student Demographics</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studentDemographicsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {studentDemographicsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Male students show a slightly higher attendance rate compared to female students this semester.</p>
          </div>
        </StyledCard>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <StyledCard>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Attendance by Age Group</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={studentAgeDistributionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="age" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: 'none' }}
                />
                <Legend />
                <Bar dataKey="count" name="Number of Students" fill="#FF9800" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>The 9-12 age group represents our largest student demographic with the highest overall attendance rates.</p>
          </div>
        </StyledCard>
      </motion.div>
    </div>
  );

  // Enrollment Reports component
  const EnrollmentReports = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-2"
      >
        <StyledCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Enrollment Trends</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year Range</label>
                      <select className="w-full p-2 border border-gray-300 rounded">
                        <option>All Years</option>
                        <option>Last 3 Years</option>
                        <option>Last 5 Years</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student Type</label>
                      <select className="w-full p-2 border border-gray-300 rounded">
                        <option>All Students</option>
                        <option>Domestic</option>
                        <option>International</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select className="w-full p-2 border border-gray-300 rounded">
                        <option>All</option>
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm">
                      Apply Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={enrollmentData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: 'none' }}
                />
                <Legend />
                <Bar dataKey="students" name="Total Students" fill="#3F51B5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="male" name="Male" stackId="gender" fill="#2196F3" radius={[0, 0, 0, 0]} />
                <Bar dataKey="female" name="Female" stackId="gender" fill="#E91E63" radius={[0, 0, 0, 0]} />
                <Line type="monotone" dataKey="international" name="International" stroke="#FF9800" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
              <p className="text-sm text-indigo-700 font-medium">Total Students</p>
              <p className="text-2xl font-bold text-indigo-800">{enrollmentData[enrollmentData.length - 1].students}</p>
              <p className="text-xs text-indigo-600 mt-1">
                ↑ {((enrollmentData[enrollmentData.length - 1].students - enrollmentData.students) / enrollmentData.students * 100).toFixed(1)}% growth
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-blue-700 font-medium">Male Students</p>
              <p className="text-2xl font-bold text-blue-800">{enrollmentData[enrollmentData.length - 1].male}</p>
              <p className="text-xs text-blue-600 mt-1">
                {((enrollmentData[enrollmentData.length - 1].male / enrollmentData[enrollmentData.length - 1].students) * 100).toFixed(1)}% of total
              </p>
            </div>
            
            <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-500">
              <p className="text-sm text-pink-700 font-medium">Female Students</p>
              <p className="text-2xl font-bold text-pink-800">{enrollmentData[enrollmentData.length - 1].female}</p>
              <p className="text-xs text-pink-600 mt-1">
                {((enrollmentData[enrollmentData.length - 1].female / enrollmentData[enrollmentData.length - 1].students) * 100).toFixed(1)}% of total
              </p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
              <p className="text-sm text-orange-700 font-medium">International</p>
              <p className="text-2xl font-bold text-orange-800">{enrollmentData[enrollmentData.length - 1].international}</p>
              <p className="text-xs text-orange-600 mt-1">
                {((enrollmentData[enrollmentData.length - 1].international / enrollmentData[enrollmentData.length - 1].students) * 100).toFixed(1)}% of total
              </p>
            </div>
          </div>
        </StyledCard>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <StyledCard>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Enrollment Growth Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={enrollmentData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: 'none' }}
                />
                <Legend />
                <Area type="monotone" dataKey="students" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Our enrollment has shown consistent growth over the past 5 years, with an average annual increase of 10%.</p>
          </div>
        </StyledCard>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <StyledCard>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Gender Distribution Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={enrollmentData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: 'none' }}
                />
                <Legend />
                <Area type="monotone" dataKey="male" stackId="1" stroke="#2196F3" fill="#2196F3" fillOpacity={0.6} />
                <Area type="monotone" dataKey="female" stackId="1" stroke="#E91E63" fill="#E91E63" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>We maintain a balanced gender distribution with a slight increase in female students over recent years.</p>
          </div>
        </StyledCard>
      </motion.div>
    </div>
  );

  // Render different report sections based on active tab
  const renderReportContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'performance':
        return <PerformanceReports />;
      case 'attendance':
        return <AttendanceReports />;
      case 'enrollment':
        return <EnrollmentReports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">School Analytics Dashboard</h1>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select 
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option value="csv">Export as CSV</option>
                <option value="pdf">Export as PDF</option>
              </select>
            </div>
            <button 
              onClick={exportData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Report
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-1 mb-6">
          <div className="flex flex-wrap">
            <button 
              className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'performance' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('performance')}
            >
              Performance
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'attendance' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('attendance')}
            >
              Attendance
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'enrollment' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('enrollment')}
            >
              Enrollment
            </button>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderReportContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SchoolReports;