import React, { useState, useEffect } from 'react';
import { 
  User,
  Book,
  Clock,
  Award,
  Users,
  School,
  BookOpen,
  GraduationCap,
  MapPin,
  CheckCircle,
  Calendar,
  Target,
  BookMarked,
  Home,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface QuickLink {
  icon: React.ElementType;
  label: string;
  path: string;
  color: string;
  badge?: number;
  onClick?: () => void;
}

interface StudentData {
  name: string;
  age: string;
  gender: string;
  school: string;
  class_: string;
  section: string;
  hobbies: string;
  student_id: string;
  aim_of_life: string;
  location: string;
  ethnicity: string;
  attendance?: number;
  performance?: number;
  activities?: string[];
}

const StudentProfile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [studentData, setStudentData] = useState<StudentData>({
    name: 'John Doe',
    age: '15',
    gender: 'Male',
    school: 'St. Xavier\'s High School',
    class_: 'X',
    section: 'A',
    hobbies: 'Reading, Swimming, Chess, Painting, Playing Guitar',
    student_id: 'STU2023001',
    aim_of_life: 'To become a software engineer and develop solutions that help society.',
    location: 'India',
    ethnicity: 'Indian',
    attendance: 92,
    performance: 87,
    activities: ['Science Club', 'Chess Team', 'Environmental Club', 'Debate Society', 'Music Band'],
  });

  // Stats for the profile
  const stats = [
    {
      name: 'Performance',
      value: `${studentData.performance}%`,
      icon: Award,
      color: '#3b82f6'
    },
    {
      name: 'Attendance Rate',
      value: `${studentData.attendance}%`,
      icon: Clock,
      color: '#8b5cf6'
    },
    {
      name: 'Class Rank',
      value: '3rd',
      icon: Users,
      color: '#10b981'
    }
  ];

  // Daily learning objectives that rotate based on the day
  const allObjectives = [
    [
      "Complete Mathematics Chapter 5 exercises",
      "Review Science notes for upcoming test",
      "Practice public speaking for debate club"
    ],
    [
      "Complete English literature assignment",
      "Prepare presentation for Environmental Club",
      "Practice Chess strategies for tournament"
    ],
    [
      "Work on Computer Science project",
      "Review Social Studies notes",
      "Prepare for Music Band practice"
    ],
    [
      "Complete Physics lab report",
      "Practice for upcoming sports event",
      "Revise vocabulary for language class"
    ],
    [
      "Work on Science fair project",
      "Complete history timeline assignment",
      "Practice leadership skills for club meeting"
    ],
    [
      "Study for weekly Math quiz",
      "Complete assigned reading chapters",
      "Prepare for upcoming class presentation"
    ],
    [
      "Review all subjects for weekly assessment",
      "Complete all pending assignments",
      "Prepare for extracurricular activities"
    ]
  ];

  // Quick navigation links
  const quickLinks = [
    { icon: Home, label: "Dashboard", path: "/student/dashboard", color: "#3b82f6" },
    { icon: MessageSquare, label: "Chat", path: "/student/chat", color: "#8b5cf6", badge: 2 },
    { icon: User, label: "Profile", path: "/student/StudentProfileDashboard", color: "#10b981" },
    { icon: Settings, label: "Settings", path: "/student/profile/settings", color: "#f59e0b" },
    { icon: HelpCircle, label: "Help & Support", path: "/student/help/faq", color: "#6366f1" }
    
  ];

  // Calculate which set of objectives to show based on the day
  const daysSinceEpoch = differenceInDays(new Date(), new Date(2020, 0, 1));
  const todayObjectiveIndex = daysSinceEpoch % allObjectives.length;
  const [dailyObjectives, setDailyObjectives] = useState(allObjectives[todayObjectiveIndex]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Set the daily objectives based on the current day
    setDailyObjectives(allObjectives[todayObjectiveIndex]);
  }, [todayObjectiveIndex]);

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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
          <p className="text-gray-600">
            {studentData.name}'s profile as of {format(new Date(), 'MMMM d, yyyy')}
          </p>
        </header>

        {/* Profile Summary Card */}
        <motion.div
          variants={cardVariants}
          custom={0}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow mb-8 overflow-hidden"
        >
          <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border-r">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center mb-4 shadow-sm">
                  <GraduationCap className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{studentData.name}</h2>
                <p className="text-sm text-gray-500 mt-1">Student ID: {studentData.student_id}</p>
                <div className="mt-6 w-full space-y-3">
                  <div className="flex items-center text-sm bg-white p-2 rounded-lg shadow-sm">
                    <School className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="text-gray-700">{studentData.school}</span>
                  </div>
                  <div className="flex items-center text-sm bg-white p-2 rounded-lg shadow-sm">
                    <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
                    <span className="text-gray-700">Class {studentData.class_}-{studentData.section}</span>
                  </div>
                  <div className="flex items-center text-sm bg-white p-2 rounded-lg shadow-sm">
                    <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                    <span className="text-gray-700">{studentData.location}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-2/3 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Academic Overview</h3>
                <p className="text-gray-600 text-sm leading-relaxed border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded-r-md">
                  {studentData.aim_of_life}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {stats.map((stat, index) => (
                  <div key={stat.name} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center">
                      <div className="rounded-lg p-2" style={{ backgroundColor: `${stat.color}15` }}>
                        <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                      </div>
                      <div className="ml-3">
                        <p className="text-xs font-medium text-gray-500">{stat.name}</p>
                        <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <User className="h-4 w-4 mr-1 text-blue-600" />
                    Key Interests
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {studentData.hobbies.split(',').map((hobby, index) => (
                      <span key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 px-3 py-1 rounded-full text-xs border border-blue-100">
                        {hobby.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <BookMarked className="h-4 w-4 mr-1 text-indigo-600" />
                    Activities
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {studentData.activities?.map((activity, index) => (
                      <li key={index} className="flex items-center text-gray-600 text-sm bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily Learning Objectives */}
        <motion.div
          variants={cardVariants}
          custom={1}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Today's Learning Objectives
            </h2>
            <span className="text-sm text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {format(new Date(), 'EEEE, MMM d')}
            </span>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 italic">
              Complete these objectives to stay on track with your academic goals. They are updated daily to help with your progress.
            </p>
          </div>
          
          <ul className="space-y-3">
            {dailyObjectives.map((objective, index) => (
              <li key={index} className="flex items-start p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 mr-3 flex-shrink-0">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-800">{objective}</h3>
                  <div className="mt-2 flex justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Due today</span>
                    </div>
                    <button className="text-xs font-medium text-blue-600 hover:text-blue-800">
                      Mark as completed
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          variants={cardVariants}
          custom={2}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookMarked className="h-5 w-5 mr-2 text-blue-600" />
            Quick Navigation
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link 
              to="/student/dashboard"
              className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-md transition-all duration-200 border border-gray-100 group"
            >
              <div className="rounded-full p-3 mb-2" style={{ backgroundColor: `#3b82f620` }}>
                <Home className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" style={{ color: "#3b82f6" }} />
              </div>
              <span className="text-sm text-gray-800 font-medium">Dashboard</span>
            </Link>
            
            <Link 
              to="/student/chat"
              className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-md transition-all duration-200 border border-gray-100 group"
            >
              <div className="rounded-full p-3 mb-2" style={{ backgroundColor: `#8b5cf620` }}>
                <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" style={{ color: "#8b5cf6" }} />
              </div>
              <span className="text-sm text-gray-800 font-medium">Chat</span>
              <span className="mt-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                2
              </span>
            </Link>
            
            <Link 
              to="/student/StudentProfileDashboard"
              className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-md transition-all duration-200 border border-gray-100 group"
            >
              <div className="rounded-full p-3 mb-2" style={{ backgroundColor: `#10b98120` }}>
                <User className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" style={{ color: "#10b981" }} />
              </div>
              <span className="text-sm text-gray-800 font-medium">Profile</span>
            </Link>
            
            <Link 
              to="/student/profile/settings"
              className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-md transition-all duration-200 border border-gray-100 group"
            >
              <div className="rounded-full p-3 mb-2" style={{ backgroundColor: `#f59e0b20` }}>
                <Settings className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" style={{ color: "#f59e0b" }} />
              </div>
              <span className="text-sm text-gray-800 font-medium">Settings</span>
            </Link>
            
            <Link 
              to="/student/help/faq"
              className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-md transition-all duration-200 border border-gray-100 group"
            >
              <div className="rounded-full p-3 mb-2" style={{ backgroundColor: `#6366f120` }}>
                <HelpCircle className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" style={{ color: "#6366f1" }} />
              </div>
              <span className="text-sm text-gray-800 font-medium">Help & Support</span>
            </Link>
            
            <button 
              onClick={() => console.log("Logout clicked")}
              className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:shadow-md transition-all duration-200 border border-gray-100 group"
            >
              <div className="rounded-full p-3 mb-2" style={{ backgroundColor: `#ef444420` }}>
                <LogOut className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" style={{ color: "#ef4444" }} />
              </div>
              <span className="text-sm text-gray-800 font-medium">Logout</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentProfile;