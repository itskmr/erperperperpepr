import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

// Import components
import { CollapsibleSection, ChartComponent, ResourceUtilization } from '../components/DashboardComponents';

// Import types
import { InchargeClassData, ResourceUtilizationData } from '../data/teacherDashboardData';

interface ClassInchargeToolsProps {
  inchargeClasses: InchargeClassData[];
  resourceUtilization: ResourceUtilizationData[];
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const ClassInchargeTools: React.FC<ClassInchargeToolsProps> = ({ 
  inchargeClasses, 
  resourceUtilization 
}) => {
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="flex items-center mb-4">
        <Award className="h-5 w-5 text-purple-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">Class Incharge Tools</h2>
      </div>
      
      {inchargeClasses.map((classItem) => (
        <CollapsibleSection 
          key={classItem.id} 
          title={`${classItem.name} Dashboard`}
          defaultOpen={true}
        >
          <div className="space-y-3">
            <motion.div 
              className="bg-purple-50 p-3 rounded-lg"
              whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">Overall Performance</p>
                  <p className="text-xl font-semibold text-gray-900 mt-1">{classItem.performance}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Attendance</p>
                  <p className="text-xl font-semibold text-gray-900 mt-1">{classItem.attendance}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Students</p>
                  <p className="text-xl font-semibold text-gray-900 mt-1">{classItem.students}</p>
                </div>
              </div>
            </motion.div>
            
            {/* Class statistics visualization */}
            <div className="bg-white rounded-md border border-gray-200 p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Class Statistics</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <h5 className="text-xs text-gray-500">Gender Ratio</h5>
                  <div className="mt-1 flex justify-center">
                    <div className="flex h-4 w-24 rounded overflow-hidden">
                      <motion.div 
                        className="bg-blue-500" 
                        initial={{ width: 0 }}
                        animate={{ width: '55%' }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                      <motion.div 
                        className="bg-pink-500" 
                        initial={{ width: 0 }}
                        animate={{ width: '45%' }}
                        transition={{ duration: 1, delay: 0.4 }}
                      />
                    </div>
                  </div>
                  <p className="text-xs mt-1">55% / 45%</p>
                </div>
                <div>
                  <h5 className="text-xs text-gray-500">Subjects</h5>
                  <p className="text-xl font-medium mt-1">{classItem.subjects}</p>
                </div>
                <div>
                  <h5 className="text-xs text-gray-500">Avg. Grade</h5>
                  <div className="mt-1 flex justify-center">
                    <div className="relative h-12 w-12 rounded-full flex items-center justify-center">
                      <svg className="h-12 w-12">
                        <circle
                          className="text-gray-200"
                          strokeWidth="4"
                          stroke="currentColor"
                          fill="transparent"
                          r="20"
                          cx="24"
                          cy="24"
                        />
                        <motion.circle
                          className="text-purple-600"
                          strokeWidth="4"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="20"
                          cx="24"
                          cy="24"
                          initial={{ strokeDasharray: "120 120", strokeDashoffset: "120" }}
                          animate={{ strokeDashoffset: 30 }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </svg>
                      <span className="absolute text-xs font-medium">B+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <motion.button 
                className="w-full text-sm bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                Manage Class Groups
              </motion.button>
              
              <motion.button 
                className="w-full text-sm border border-purple-300 text-purple-700 py-2 rounded-md hover:bg-purple-50 transition-colors"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                Delegate Tasks to Co-Teachers
              </motion.button>
            </div>
          </div>
        </CollapsibleSection>
      ))}
      
      <CollapsibleSection title="Resource Allocation" defaultOpen={true}>
        <div className="space-y-3">
          {resourceUtilization.map((resource) => (
            <ResourceUtilization 
              key={resource.name}
              name={resource.name}
              usage={resource.usage}
              total={resource.total}
              booked={resource.booked}
            />
          ))}
          
          <motion.button 
            className="w-full text-sm bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition-colors"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            Book Resources
          </motion.button>
        </div>
      </CollapsibleSection>
      
      <CollapsibleSection title="Cross-Class Comparison">
        <ChartComponent title="Performance by Subject Across Classes" type="radar" height="h-48" />
        <div className="mt-3">
          <motion.button 
            className="w-full text-sm text-blue-600 border border-blue-300 py-2 rounded-md hover:bg-blue-50 transition-colors"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            View Detailed Comparison
          </motion.button>
        </div>
      </CollapsibleSection>
      
      {/* New section specifically for class incharge */}
      <CollapsibleSection title="Student Performance Overview" defaultOpen={false}>
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Distribution</h4>
            <div className="flex items-center space-x-1">
              <motion.div 
                className="h-4 bg-red-500 rounded-l"
                initial={{ width: 0 }}
                animate={{ width: '15%' }}
                transition={{ duration: 0.8 }}
              />
              <motion.div 
                className="h-4 bg-amber-500"
                initial={{ width: 0 }}
                animate={{ width: '25%' }}
                transition={{ duration: 0.8, delay: 0.1 }}
              />
              <motion.div 
                className="h-4 bg-yellow-500"
                initial={{ width: 0 }}
                animate={{ width: '30%' }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <motion.div 
                className="h-4 bg-green-500"
                initial={{ width: 0 }}
                animate={{ width: '20%' }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
              <motion.div 
                className="h-4 bg-emerald-500 rounded-r"
                initial={{ width: 0 }}
                animate={{ width: '10%' }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Below 60%</span>
              <span>60-70%</span>
              <span>70-80%</span>
              <span>80-90%</span>
              <span>90%+</span>
            </div>
          </div>
          
          <motion.button 
            className="w-full text-sm bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            View Individual Student Reports
          </motion.button>
        </div>
      </CollapsibleSection>
    </motion.div>
  );
};

export default ClassInchargeTools; 