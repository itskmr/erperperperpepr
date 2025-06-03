import React from "react";
import { Link } from "react-router-dom";
import { 
  Book, 
  Settings, 
  LogOut, 
  User, 
  Home, 
  Users, 
  BookOpen,
  Calendar,
  GraduationCap,
  UserCheck,
  MessageCircle
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
      className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-200"
      onClick={onClick}
    >
      <div className="flex items-center">
        {icon && <span className="mr-3 flex-shrink-0">{icon}</span>}
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-2">
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

          {/* My Classes - Primary teaching tools */}
          <NavDropdown 
            title="My Classes" 
            icon={<Book className="h-5 w-5 text-blue-600" />}
            isOpen={activeDropdown === "classes"} 
            onClick={() => toggleDropdown("classes")}
          >
            <NavLink 
              to="/teacher/timetable" 
              icon={<Calendar className="h-4 w-4 text-blue-500" />}
              label="My Timetable" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <NavLink 
              to="/teacher/diary" 
              icon={<BookOpen className="h-4 w-4 text-indigo-500" />}
              label="Teacher Diary" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            
          </NavDropdown>

          {/* My Students - Student management and interaction */}
          <NavDropdown 
            title="My Students" 
            icon={<Users className="h-5 w-5 text-indigo-600" />}
            isOpen={activeDropdown === "students"} 
            onClick={() => toggleDropdown("students")}
          >
            <NavLink 
              to="/teacher/students" 
              icon={<User className="h-4 w-4 text-indigo-500" />}
              label="Student Directory" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <NavLink 
              to="/teacher/students-attendance" 
              icon={<UserCheck className="h-4 w-4 text-green-500" />}
              label="Student Attendance" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          </NavDropdown>


        </nav>
      </div>
    );
  },

  renderProfileDropdown: (props: TeacherNavbarProps) => {
    const { onLogout } = props;
    
    // Get teacher info from localStorage
    const getTeacherInfo = () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          return {
            name: user.fullName || user.name || 'Teacher',
            email: user.email || 'teacher@school.edu',
            role: user.role || 'teacher'
          };
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
      return {
        name: 'Teacher',
        email: 'teacher@school.edu',
        role: 'teacher'
      };
    };

    const teacherInfo = getTeacherInfo();
    
    return (
      <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">Signed in as</p>
          <p className="text-sm font-medium text-gray-900 truncate" title={teacherInfo.email}>
            {teacherInfo.email}
          </p>
          <p className="text-xs text-gray-600 truncate mt-1" title={teacherInfo.name}>
            {teacherInfo.name}
          </p>
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              <GraduationCap className="h-3 w-3 mr-1" />
              Teacher
            </span>
          </div>
        </div>

        <Link
          to="/teacher/profile"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex items-center">
            <User className="h-4 w-4 mr-3 text-emerald-600" />
            Teacher Profile
          </div>
        </Link>
        
        <Link
          to="/teacher/preferences"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex items-center">
            <Settings className="h-4 w-4 mr-3 text-blue-600" />
            Teaching Preferences
          </div>
        </Link>

        <Link
          to="/teacher/help"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex items-center">
            <MessageCircle className="h-4 w-4 mr-3 text-purple-600" />
            Help & Support
          </div>
        </Link>
        
        <button
          onClick={onLogout}
          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-200"
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
      <div className="flex items-center">
        <GraduationCap className="h-8 w-8 text-emerald-600" />
        <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">
          Teacher Portal
        </span>
      </div>
    </>
  ),

  renderProfileButton: (props: TeacherNavbarProps) => {
    const { isProfileDropdownOpen, setIsProfileDropdownOpen, profileDropdownRef } = props;
    
    // Get teacher info for profile display
    const getTeacherInfo = () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          return {
            name: user.fullName || user.name || 'Teacher',
            initials: (user.fullName || user.name || 'T').split(' ').map((n: string) => n[0]).join('').substring(0, 2)
          };
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
      return {
        name: 'Teacher',
        initials: 'T'
      };
    };

    const teacherInfo = getTeacherInfo();
    
    return (
      <div className="ml-3 relative" ref={profileDropdownRef}>
        <button
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-md"
          title={`${teacherInfo.name} - Click for profile options`}
        >
          <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white p-2 rounded-full flex items-center justify-center min-w-[40px] h-10">
            <span className="text-sm font-semibold">
              {teacherInfo.initials}
            </span>
          </div>
        </button>
        
        {isProfileDropdownOpen && TeacherNavbar.renderProfileDropdown(props)}
      </div>
    );
  }
};

export default TeacherNavbar;