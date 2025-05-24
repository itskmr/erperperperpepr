import React, { useState, useEffect } from 'react';
import { 
  BarChart, Users, BookOpen, Check, AlertTriangle, TrendingUp, MessageSquare, 
  Calendar, Clipboard, ChevronDown, ChevronUp, Bell, Zap, UserCheck, Clock, 
  Activity, Award, FileText, Layers, Briefcase, Settings, HelpCircle, Book,
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Loading skeleton component
export const SkeletonLoader: React.FC<{ height?: string }> = ({ height = 'h-24' }) => {
  return (
    <div className={`animate-pulse ${height} bg-gray-200 rounded-lg w-full`}></div>
  );
};

// Teacher profile component
export const TeacherProfile: React.FC<{
  name: string;
  role: string;
  isClassIncharge: boolean;
  profileImage?: string;
}> = ({ name, role, isClassIncharge, profileImage }) => {
  return (
    <motion.div 
      className="flex items-center space-x-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <img 
          src={profileImage || 'https://via.placeholder.com/60'} 
          alt={name} 
          className="w-14 h-14 rounded-full border-2 border-white shadow-md"
        />
        {isClassIncharge && (
          <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white p-1 rounded-full text-xs flex items-center justify-center w-6 h-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {name}!
        </h1>
        <div className="flex items-center">
          <p className="text-emerald-100">
            {role}
          </p>
          {isClassIncharge && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-200 text-purple-800">
              Class Incharge
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Select dropdown component
export const SelectDropdown: React.FC<{
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, options, value, onChange }) => {
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-200 mb-1">{label}</label>
      <select
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-white bg-opacity-90 transition-colors hover:bg-opacity-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Metric card component with animations
export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; label: string };
  delay?: number;
}> = ({ title, value, subtitle, icon, color, trend, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow"
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={slideUp}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-end mt-1">
            <p className="text-2xl font-semibold">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 ml-1 mb-0.5">{subtitle}</p>}
          </div>
          {trend && (
            <motion.div 
              className={`flex items-center mt-1 text-sm ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + delay / 1000 }}
            >
              {trend.value >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />
              )}
              <span>{Math.abs(trend.value)}% {trend.label}</span>
            </motion.div>
          )}
        </div>
        <div className={`p-2 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

// Chart component with loading state
export const ChartComponent: React.FC<{
  title: string;
  type: 'bar' | 'line' | 'pie' | 'radar' | 'heatmap';
  height?: string;
  loading?: boolean;
}> = ({ title, type, height = 'h-64', loading = false }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
      <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>
      {loading ? (
        <SkeletonLoader height={height} />
      ) : (
        <motion.div 
          className={`${height} flex items-center justify-center bg-gray-50 rounded-md`}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="text-center">
            <BarChart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              {type.charAt(0).toUpperCase() + type.slice(1)} Chart
              <br />
              <span className="text-xs">(Visualization would render here)</span>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Collapsible section component with smooth animation
export const CollapsibleSection: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <button
        className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// AI Alert component with enhanced UI
export const AIAlert: React.FC<{
  title: string;
  description: string;
  action: string;
  severity: 'low' | 'medium' | 'high';
  onActionClick?: () => void;
}> = ({ title, description, action, severity, onActionClick }) => {
  const severityColors = {
    low: 'bg-blue-50 text-blue-800 border-blue-100',
    medium: 'bg-amber-50 text-amber-800 border-amber-100',
    high: 'bg-red-50 text-red-800 border-red-100'
  };

  const buttonColors = {
    low: 'bg-blue-100 text-blue-700 hover:bg-blue-200', 
    medium: 'bg-amber-100 text-amber-700 hover:bg-amber-200', 
    high: 'bg-red-100 text-red-700 hover:bg-red-200'
  };

  return (
    <motion.div 
      className={`rounded-lg p-3 ${severityColors[severity]} mb-3 border`}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Zap className={`h-5 w-5 ${severity === 'low' ? 'text-blue-500' : severity === 'medium' ? 'text-amber-500' : 'text-red-500'}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="mt-1 text-xs">{description}</div>
          <div className="mt-2">
            <button 
              className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded transition-colors ${buttonColors[severity]}`}
              onClick={onActionClick}
            >
              {action}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Tab component with animated indicator
export const TabGroup: React.FC<{
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className="relative whitespace-nowrap pb-3 px-1 font-medium text-sm transition-colors"
          >
            <span className={activeTab === tab ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'}>
              {tab}
            </span>
            {activeTab === tab && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                layoutId="tab-underline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

// Advanced loader component with progress indicator
export const ProgressLoader: React.FC<{
  loading: boolean;
  progress?: number;
  text?: string;
}> = ({ loading, progress = 0, text = "Loading..." }) => {
  if (!loading) return null;
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center p-4 bg-white bg-opacity-90 rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Loader className="h-8 w-8 text-emerald-600 animate-spin mb-2" />
      <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
    </motion.div>
  );
};

// Performance bar component
export const PerformanceBar: React.FC<{
  subject: string;
  current: number;
  previous: number;
  average: number;
}> = ({ subject, current, previous, average }) => {
  return (
    <motion.div 
      className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
      initial="hidden"
      animate="visible"
      variants={slideUp}
      whileHover={{ y: -2 }}
    >
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{subject}</span>
        <span className="text-sm font-medium">{current}%</span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${current}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>Previous: {previous}%</span>
        <span>Class Avg: {average}%</span>
      </div>
    </motion.div>
  );
};

// Student card component (for at-risk students)
export const StudentRiskCard: React.FC<{
  name: string;
  classGrade: string;
  subject: string;
  current: number;
  trend: number;
  reason: string;
  onScheduleClick?: () => void;
  onMessageClick?: () => void;
}> = ({ name, classGrade, subject, current, trend, reason, onScheduleClick, onMessageClick }) => {
  return (
    <motion.div 
      className="bg-red-50 rounded-lg p-3 border border-red-100"
      initial="hidden"
      animate="visible"
      variants={slideUp}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600">Class {classGrade} • {subject}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold text-gray-900">{current}%</div>
          <div className="text-sm text-red-600">{trend}% ↓</div>
        </div>
      </div>
      <p className="text-sm text-gray-700 mt-2">{reason}</p>
      <div className="mt-3 flex justify-end space-x-2">
        <button 
          className="text-xs bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
          onClick={onMessageClick}
        >
          Message Parent
        </button>
        <button 
          className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
          onClick={onScheduleClick}
        >
          Schedule Intervention
        </button>
      </div>
    </motion.div>
  );
};

// Resource utilization component
export const ResourceUtilization: React.FC<{
  name: string;
  usage: number;
  total: number;
  booked: number;
}> = ({ name, usage, total, booked }) => {
  return (
    <motion.div 
      className="bg-gray-50 p-3 rounded-lg"
      initial="hidden"
      animate="visible"
      variants={slideUp}
    >
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-sm font-medium">{usage}% Utilized</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full rounded-full ${
            usage > 90 ? 'bg-red-500' : 
            usage > 75 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${usage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {booked}/{total} slots booked this week
      </div>
    </motion.div>
  );
};

// Calendar Event component
export const CalendarEvent: React.FC<{
  day: number;
  month: string;
  title: string;
  time: string;
  type: 'class' | 'meeting' | 'event';
}> = ({ day, month, title, time, type }) => {
  const typeStyles = {
    class: 'bg-red-50 border-red-100',
    meeting: 'bg-blue-50 border-blue-100',
    event: 'bg-purple-50 border-purple-100'
  };
  
  const dateStyles = {
    class: 'bg-red-100 text-red-700',
    meeting: 'bg-blue-100 text-blue-700',
    event: 'bg-purple-100 text-purple-700'
  };

  return (
    <motion.div 
      className={`flex items-start p-2 ${typeStyles[type]} rounded-lg border`}
      initial="hidden"
      animate="visible"
      variants={slideUp}
      whileHover={{ x: 3 }}
    >
      <div className={`${dateStyles[type]} p-2 rounded-lg mr-3 text-xs font-semibold`}>
        <div>{month}</div>
        <div className="text-base">{day}</div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-600 mt-1">{time}</p>
      </div>
    </motion.div>
  );
};

// Quick action button
export const QuickActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick?: () => void;
}> = ({ icon, label, color, onClick }) => {
  return (
    <motion.button 
      className={`${color} p-3 rounded-lg text-sm text-center flex flex-col items-center transition-colors`}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </motion.button>
  );
};

// Animation container for staggered children
export const AnimatedContainer: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      transition={{ delayChildren: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
};

// HeatmapChart component
export const HeatmapChart: React.FC<{ 
  title: string;
  loading?: boolean;
  data?: { day: string; period: string; value: number }[];
}> = ({ title, loading = false, data = [] }) => {
  // Default data if none provided
  const defaultData = [
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

  const heatmapData = data.length > 0 ? data : defaultData;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = ['1st Period', '2nd Period', '3rd Period', '4th Period'];

  // Helper to get color based on value
  const getColor = (value: number) => {
    if (value >= 90) return 'bg-emerald-500';
    if (value >= 80) return 'bg-emerald-400';
    if (value >= 70) return 'bg-emerald-300';
    if (value >= 60) return 'bg-yellow-300';
    if (value >= 50) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  // Helper to get text color based on value
  const getTextColor = (value: number) => {
    if (value >= 70) return 'text-white';
    return 'text-gray-800';
  };

  if (loading) {
    return <SkeletonLoader height="h-64" />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
      <div className="border-b border-gray-100 p-4">
        <h3 className="font-medium text-gray-800">{title}</h3>
      </div>
      <div className="p-4">
        <div className="mb-3 flex justify-end">
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-sm bg-red-400 mr-1"></div>
              <span>{"<70%"}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-sm bg-yellow-400 mr-1"></div>
              <span>70-79%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-sm bg-emerald-300 mr-1"></div>
              <span>80-89%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-sm bg-emerald-500 mr-1"></div>
              <span>90%+</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-5 gap-1">
              {/* Header row with periods */}
              <div className="h-10"></div>
              {periods.map(period => (
                <div key={period} className="h-10 flex items-center justify-center text-xs font-medium text-gray-600">
                  {period}
                </div>
              ))}
              
              {/* Data grid */}
              {days.map(day => (
                <React.Fragment key={day}>
                  {/* Day label */}
                  <div className="h-14 flex items-center justify-start text-xs font-medium text-gray-600">
                    {day}
                  </div>
                  
                  {/* Attendance cells for this day */}
                  {periods.map(period => {
                    const cell = heatmapData.find(d => d.day === day && d.period === period);
                    const value = cell ? cell.value : 0;
                    return (
                      <motion.div
                        key={`${day}-${period}`}
                        className={`h-14 rounded-md flex items-center justify-center ${getColor(value)}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                      >
                        <span className={`text-sm font-medium ${getTextColor(value)}`}>{value}%</span>
                      </motion.div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ChatInterface component
export const ChatInterface: React.FC<{
  messages: Array<{
    id: string;
    sender: string;
    message: string;
    time: string;
    isTeacher: boolean;
    read: boolean;
  }>;
  onSendMessage: (message: string) => void;
}> = ({ messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="flex flex-col h-96 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Chat header */}
      <div className="bg-white p-3 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
            <span className="text-sm font-medium">JP</span>
          </div>
          <div>
            <h3 className="text-sm font-medium">James Peterson (Parent)</h3>
            <p className="text-xs text-gray-500">Student: Michael Peterson - Class 10B</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        <AnimatedContainer>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isTeacher ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[75%] rounded-lg p-3 ${
                  msg.isTeacher 
                    ? 'bg-emerald-100 text-emerald-900 rounded-tr-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <div className="mt-1 flex justify-between items-center">
                  <span className="text-xs text-gray-500">{msg.time}</span>
                  {msg.isTeacher && (
                    <span className="text-xs">
                      {msg.read 
                        ? <span className="text-blue-600">Read</span> 
                        : <span className="text-gray-400">Sent</span>}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </AnimatedContainer>
      </div>
      
      {/* Message input */}
      <div className="bg-white p-3 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1 bg-gray-100 rounded-lg p-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full bg-transparent outline-none resize-none text-sm"
              placeholder="Type a message..."
              rows={1}
            />
            <div className="flex justify-between mt-2">
              <div className="flex space-x-2">
                <button className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <button
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className={`px-3 py-1 rounded-md text-xs font-medium ${
                  newMessage.trim() 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 