import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, LineChart, RefreshCw, Download, Filter } from 'lucide-react';

// Import components
import { TabGroup, PerformanceBar, SkeletonLoader, AnimatedContainer } from '../components/DashboardComponents';

// Import types and data
import { PerformanceData } from '../data/teacherDashboardData';

interface ClassPerformanceProps {
  performanceData: PerformanceData[];
  loading?: boolean;
  selectedClass: string;
  selectedSubject: string;
}

// Animation variants
const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};

const ClassPerformance: React.FC<ClassPerformanceProps> = ({ 
  performanceData, 
  loading = false,
  selectedClass,
  selectedSubject
}) => {
  const [activeTab, setActiveTab] = useState('Subject-wise');
  const [showFilters, setShowFilters] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [isPrinting, setIsPrinting] = useState(false);

  // Handle print/export report
  const handleExport = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      alert('Report exported successfully!');
    }, 1500);
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
      initial="hidden"
      animate="visible"
      variants={slideIn}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <BarChart className="h-5 w-5 text-emerald-600 mr-2" />
          Class {selectedClass !== 'all' ? selectedClass : ''} Performance Analysis
        </h2>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100"
            onClick={() => setChartType(chartType === 'bar' ? 'line' : 'bar')}
            title={`Switch to ${chartType === 'bar' ? 'line' : 'bar'} chart`}
          >
            {chartType === 'bar' ? <LineChart size={18} /> : <BarChart size={18} />}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100"
            onClick={() => setShowFilters(!showFilters)}
            title="Show filters"
          >
            <Filter size={18} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100"
            title="Refresh data"
          >
            <RefreshCw size={18} className="transition-transform hover:rotate-180" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-1.5 rounded-full ${isPrinting ? 'text-emerald-600 bg-emerald-50' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={handleExport}
            disabled={isPrinting}
            title="Export report"
          >
            <Download size={18} className={isPrinting ? 'animate-bounce' : ''} />
          </motion.button>
        </div>
      </div>
      
      {/* Advanced filter panel (hidden by default) */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-sm font-medium text-gray-700 mb-2">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date Range</label>
                <select className="w-full text-sm border border-gray-300 rounded-md p-1.5">
                  <option>Last 30 days</option>
                  <option>Last quarter</option>
                  <option>Current semester</option>
                  <option>Academic year</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Performance Range</label>
                <select className="w-full text-sm border border-gray-300 rounded-md p-1.5">
                  <option>All ranges</option>
                  <option>Below 60%</option>
                  <option>60-80%</option>
                  <option>Above 80%</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Comparison</label>
                <select className="w-full text-sm border border-gray-300 rounded-md p-1.5">
                  <option>vs Previous Term</option>
                  <option>vs Class Average</option>
                  <option>vs School Average</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700">
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <TabGroup
        tabs={['Subject-wise', 'Student-wise', 'Time Period Comparison']}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      
      <div className="mt-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <SkeletonLoader key={i} height="h-16" />
            ))}
          </div>
        ) : (
          <div>
            {activeTab === 'Subject-wise' && (
              <AnimatedContainer>
                <div className="space-y-4">
                  {performanceData.map((subject) => (
                    <PerformanceBar
                      key={subject.subject}
                      subject={subject.subject}
                      current={subject.current}
                      previous={subject.previous}
                      average={subject.average}
                    />
                  ))}
                </div>
                <div className="mt-6 flex justify-between items-center bg-emerald-50 p-3 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">Overall Performance</h3>
                    <p className="text-xs text-gray-600 mt-1">Across all subjects and assessments</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">78%</div>
                    <div className="text-xs text-emerald-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      3.2% vs last term
                    </div>
                  </div>
                </div>
              </AnimatedContainer>
            )}
            
            {activeTab === 'Student-wise' && (
              <div className="space-y-3">
                <div className="bg-amber-50 p-3 rounded-lg">
                  <p className="text-amber-700 text-sm">This view is available only when a specific class is selected.</p>
                  {selectedClass === 'all' && (
                    <button className="mt-2 text-xs bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600">
                      Select a Class
                    </button>
                  )}
                </div>
                {selectedClass !== 'all' && (
                  <div className="overflow-x-auto mt-2">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Previous
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Change
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* Sample student data */}
                        {[
                          { id: 1, name: "Emily Chen", current: 88, previous: 84, trend: 4 },
                          { id: 2, name: "Jason Wilson", current: 72, previous: 76, trend: -4 },
                          { id: 3, name: "Maria Rodriguez", current: 90, previous: 85, trend: 5 },
                          { id: 4, name: "Michael Davis", current: 82, previous: 79, trend: 3 },
                          { id: 5, name: "Sarah Johnson", current: 79, previous: 80, trend: -1 }
                        ].map((student) => (
                          <motion.tr 
                            key={student.id}
                            whileHover={{ backgroundColor: '#f9fafb' }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.current}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.previous}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                ${student.trend > 0 
                                  ? 'bg-green-100 text-green-800' 
                                  : student.trend < 0 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {student.trend > 0 ? '+' : ''}{student.trend}%
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'Time Period Comparison' && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      Time Series Comparison Chart
                      <br />
                      <span className="text-xs">(Visualization would render here)</span>
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div 
                    className="bg-blue-50 p-3 rounded-lg"
                    whileHover={{ y: -3 }}
                  >
                    <h3 className="text-sm font-medium text-blue-700">Previous Term</h3>
                    <p className="text-2xl font-semibold text-blue-900 mt-1">75%</p>
                    <p className="text-xs text-blue-600 mt-1">Term 1, 2024-25</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-emerald-50 p-3 rounded-lg"
                    whileHover={{ y: -3 }}
                  >
                    <h3 className="text-sm font-medium text-emerald-700">Current Term</h3>
                    <p className="text-2xl font-semibold text-emerald-900 mt-1">78%</p>
                    <p className="text-xs text-emerald-600 mt-1">Term 2, 2024-25</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-purple-50 p-3 rounded-lg"
                    whileHover={{ y: -3 }}
                  >
                    <h3 className="text-sm font-medium text-purple-700">Improvement</h3>
                    <p className="text-2xl font-semibold text-purple-900 mt-1">+3%</p>
                    <p className="text-xs text-purple-600 mt-1">Term-over-Term</p>
                  </motion.div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Key Insights</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      Most improved subject: Mathematics (+6%)
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      Subject needing attention: English (-2%)
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Consistent performance: Science (unchanged)
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <motion.button 
                className="text-emerald-600 text-sm font-medium hover:text-emerald-800"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Download Detailed Performance Report →
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ClassPerformance; 