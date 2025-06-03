
import React from "react";
import { Link } from "react-router-dom";
import { 
  Book, 
  Settings, 
  LogOut, 
  FileText, 
  User, 
  Home, 
  Calendar, 
  Users, 
  Database, 
  BarChart2,
  HelpCircle,
  MessageSquare
} from "lucide-react";

interface TeacherNavbarProps {
  activeDropdown: string | null;
  toggleDropdown: (menu: string) => void;
  setIsMobileSidebarOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  isProfileDropdownOpen: boolean;
  setIsProfileDropdownOpen: (isOpen: boolean) => void;
  profileDropdownRef: React.RefObject<HTMLDivElement>;
}

interface NavDropdownProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

interface NavLinkProps {
  to: string;
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  badge?: number;
}

// Navigation dropdown component
const NavDropdown: React.FC<NavDropdownProps> = ({ 
  title, 
  icon, 
  isOpen, 
  onClick, 
  children 
}) => {
  return (
    <li className="relative">
      <button
        onClick={onClick}
        className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between rounded-md transition-colors
          ${isOpen 
            ? "text-emerald-700 bg-emerald-50" 
            : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
          }`}
      >
        <div className="flex items-center">
          {icon && <span className="mr-3">{icon}</span>}
          <span>{title}</span>
        </div>
        <svg 
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      
      {isOpen && (
        <div className="pl-4 pr-2 py-2 space-y-1">
          {children}
        </div>
      )}
    </li>
  );
};

// Navigation link component
const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, onClick, badge }) => {
  return (
    <Link
      to={to}
      className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-emerald-50 hover:text-emerald-700"
      onClick={onClick}
    >
      <div className="flex items-center">
        {icon && <span className="mr-3">{icon}</span>}
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
};

const TeacherNavbar = {
  renderSidebar: (props: TeacherNavbarProps) => {
    const { activeDropdown, toggleDropdown, setIsMobileSidebarOpen } = props;
    
    return (
      <div className="flex-1 overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 px-2 space-y-1">
          {/* Teacher Dashboard */}
          <NavLink 
            to="/teacher/dashboard" 
            icon={<Home className="h-5 w-5 text-emerald-600" />} 
            label="Teacher Dashboard" 
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* My Classes - New section for teachers */}
          <NavDropdown 
            title="My Classes" 
            icon={<Book className="h-5 w-5 text-emerald-600" />}
            isOpen={activeDropdown === "classes"} 
            onClick={() => toggleDropdown("classes")}
          >
            <NavLink 
              to="/classes/manage" 
              label="Manage Classes" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <NavLink 
              to="/classes/TeachingMaterials" 
              label="Teaching Materials" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <NavLink 
              to="/teachers/myclasses/assignment" 
              label="Assignments" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          </NavDropdown>

          {/* Students - Customized for teachers */}
          <NavDropdown 
            title="My Students" 
            icon={<Users className="h-5 w-5 text-blue-600" />}
            isOpen={activeDropdown === "students"} 
            onClick={() => toggleDropdown("students")}
          >
            <NavLink 
              to="/students" 
              label="Student Directory" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <NavLink 
              to="/teacher/students-attendance" 
              label="Student Attendance" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <NavLink 
              to="/students/grades" 
              label="Grade Management" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          </NavDropdown>

          {/* Examinations - Teacher view */}
          <NavDropdown 
            title="Examinations" 
            icon={<FileText className="h-5 w-5 text-orange-600" />}
            isOpen={activeDropdown === "examination"} 
            onClick={() => toggleDropdown("examination")}
          >
            <NavLink 
              to="/teachers/examination/create-exam" 
              label="Create Exam" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <NavLink 
              to="/teachers/examination/exam-schedule" 
              label="Exam Schedule" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          </NavDropdown>

          {/* Teacher Resources - New section */}
          {/* <NavDropdown 
            title="Teacher Resources" 
            icon={<Database className="h-5 w-5 text-purple-600" />}
            isOpen={activeDropdown === "resources"} 
            onClick={() => toggleDropdown("resources")}
          >
            <NavLink 
              to="/resources/library" 
              label="Resource Library" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <NavLink 
              to="/resources/templates" 
              label="Lesson Templates" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <NavLink 
              to="/resources/professional" 
              label="Professional Development" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          </NavDropdown> */}

          {/* Reports - Teacher specific */}
          {/* <NavLink 
            to="/reports" 
            icon={<BarChart2 className="h-5 w-5 text-red-600" />} 
            label="My Reports" 
            onClick={() => setIsMobileSidebarOpen(false)}
          />

        
          <NavLink 
            to="/calendar" 
            icon={<Calendar className="h-5 w-5 text-teal-600" />} 
            label="Class Calendar" 
            onClick={() => setIsMobileSidebarOpen(false)}
          /> */}

          {/* Parent Feedback */}
          <NavLink 
            to="/teacher/feedback" 
            icon={<MessageSquare className="h-5 w-5 text-purple-600" />} 
            label="Parent Feedback" 
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <NavLink 
            to="/teacher/studentform" 
            icon={<MessageSquare className="h-5 w-5 text-purple-600" />} 
            label="Studentfrom" 
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        </nav>
      </div>
    );
  },

  renderProfileDropdown: (props: TeacherNavbarProps) => {
    const { onLogout } = props;
    
    return (
      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">Signed in as</p>
          <p className="text-sm font-medium text-gray-900 truncate">teacher@school.edu</p>
          <div className="mt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              Teacher
            </span>
          </div>
        </div>

        <Link
          to="/teacher/profile"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <div className="flex items-center">
            <User className="h-4 w-4 mr-3 text-emerald-600" />
            Teacher Profile
          </div>
        </Link>
        
        <Link
          to="/teacher/preferences"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <div className="flex items-center">
            <Settings className="h-4 w-4 mr-3 text-blue-600" />
            Teaching Preferences
          </div>
        </Link>
        
        <button
          onClick={onLogout}
          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          <div className="flex items-center">
            <LogOut className="h-4 w-4 mr-3" />
            Sign out
          </div>
        </button>
      </div>
    );
  },

  renderHeader: () => (
    <>
      <Book className="h-8 w-8 text-emerald-600" />
      <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">
        Teacher Portal
      </span>
    </>
  ),

  renderProfileButton: (props: TeacherNavbarProps) => {
    const { isProfileDropdownOpen, setIsProfileDropdownOpen, profileDropdownRef } = props;
    
    return (
      <div className="ml-3 relative" ref={profileDropdownRef}>
        <button
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <div className="bg-emerald-100 text-emerald-800 p-2 rounded-full">
            <User className="h-6 w-6" />
          </div>
        </button>
        
        {isProfileDropdownOpen && TeacherNavbar.renderProfileDropdown(props)}
      </div>
    );
  }
};

export default TeacherNavbar;