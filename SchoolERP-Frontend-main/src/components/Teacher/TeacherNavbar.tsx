import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface TeacherNavbarProps {
  activeDropdown: string | null;
  toggleDropdown: (menu: string) => void;
  setIsMobileSidebarOpen: (isOpen: boolean) => void;
  onLogout?: () => void;
  isProfileDropdownOpen?: boolean;
  setIsProfileDropdownOpen?: (isOpen: boolean) => void;
  profileDropdownRef?: React.RefObject<HTMLDivElement>;
  onSidebarCollapse?: (isCollapsed: boolean) => void;
}

interface NavDropdownProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
  isCollapsed?: boolean;
}

interface NavLinkProps {
  to: string;
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  badge?: number;
  isCollapsed?: boolean;
  isActive?: boolean;
}

// Navigation dropdown component
const NavDropdown: React.FC<NavDropdownProps> = ({ 
  title, 
  icon, 
  isOpen, 
  onClick, 
  children,
  isCollapsed
}) => {
  return (
    <li className="relative group">
      <button
        onClick={onClick}
        className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between rounded-lg transition-all duration-200
          ${isOpen 
            ? "text-white bg-emerald-600 shadow-md" 
            : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
          }`}
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          {icon && (
            <span className={`${isCollapsed ? 'flex justify-center w-full' : 'mr-3'} text-opacity-90`}>
              {icon}
            </span>
          )}
          {!isCollapsed && <span>{title}</span>}
        </div>
        {!isCollapsed && (
          <svg 
            className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
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
        )}
      </button>
      
      {isCollapsed && !isOpen && (
        <div className="absolute left-full top-0 ml-2 w-56 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="py-2 px-3">
            <div className="font-medium text-gray-800 pb-2 border-b border-gray-100">{title}</div>
            <div className="pt-2">
              {children}
            </div>
          </div>
        </div>
      )}
      
      {((isOpen && !isCollapsed) || (isCollapsed && isOpen)) && (
        <div className={`${isCollapsed ? 'absolute left-full top-0 ml-2 w-56 bg-white rounded-lg shadow-lg z-50' : 'pl-4 pr-2 py-2 bg-emerald-50 rounded-b-lg mt-1'} space-y-1 py-2`}>
          {isCollapsed && <div className="font-medium text-gray-800 px-3 pb-2 border-b border-gray-100">{title}</div>}
          <div className={isCollapsed ? 'pt-2 px-2' : ''}>
            {children}
          </div>
        </div>
      )}
    </li>
  );
};

// Navigation link component
const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, onClick, badge, isCollapsed, isActive }) => {
  return (
    <Link
      to={to}
      className={`
        ${isCollapsed ? 'justify-center tooltip-trigger' : 'justify-between'} 
        flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group relative
        ${isActive 
          ? `${isCollapsed ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-100 text-emerald-700'} font-medium` 
          : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
        }
        ${isCollapsed && isActive ? 'scale-110' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center">
        {icon && (
          <span className={`${isCollapsed ? 'flex justify-center w-full' : 'mr-3'} flex-shrink-0`}>
            {icon}
          </span>
        )}
        {!isCollapsed && <span className="font-medium">{label}</span>}
      </div>
      {!isCollapsed && badge !== undefined && (
        <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {badge}
        </span>
      )}
      
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-md">
          {label}
          {badge !== undefined && <span className="ml-1.5 bg-emerald-500 text-white px-1.5 py-0.5 rounded-full text-xs">{badge}</span>}
        </div>
      )}
    </Link>
  );
};

// TeacherSidebar component with collapsing functionality
const TeacherSidebar: React.FC<TeacherNavbarProps> = (props) => {
  const { activeDropdown, toggleDropdown, setIsMobileSidebarOpen, onSidebarCollapse } = props;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  
  // Function to check if a path is active based on current location
  const isPathActive = (path: string) => {
    if (path === "/teacher/dashboard") {
      return location.pathname === "/teacher/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  // Handle collapse toggle and notify parent
  const handleCollapseToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onSidebarCollapse) {
      onSidebarCollapse(newCollapsedState);
    }
  };
  
  return (
    <div className={`flex flex-col h-full bg-white shadow-md transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        {!isCollapsed && (
          <div className="flex items-center">
            <GraduationCap className="h-7 w-7 text-emerald-600" />
            <span className="ml-2 text-lg font-semibold text-gray-800">Teacher Portal</span>
          </div>
        )}
        
        <button 
          onClick={handleCollapseToggle}
          className={`p-1.5 rounded-md text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200 ${isCollapsed ? 'mx-auto' : ''}`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 bg-white">
        <nav className={`space-y-2 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {/* Teacher Dashboard */}
          <NavLink 
            to="/teacher/dashboard" 
            icon={<Home className="h-5 w-5" />} 
            label="Teacher Dashboard" 
            onClick={() => setIsMobileSidebarOpen(false)}
            isCollapsed={isCollapsed}
            isActive={isPathActive("/teacher/dashboard")}
          />

          {/* My Classes - Primary teaching tools */}
          <NavDropdown 
            title="My Classes" 
            icon={<Book className="h-5 w-5" />}
            isOpen={activeDropdown === "classes"} 
            onClick={() => toggleDropdown("classes")}
            isCollapsed={isCollapsed}
          >
            <NavLink 
              to="/teacher/timetable" 
              icon={<Calendar className="h-4 w-4" />}
              label="My Timetable" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/teacher/timetable")}
            />
            <NavLink 
              to="/teacher/diary" 
              icon={<BookOpen className="h-4 w-4" />}
              label="Teacher Diary" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/teacher/diary")}
            />
          </NavDropdown>

          {/* My Students - Student management and interaction */}
          <NavDropdown 
            title="My Students" 
            icon={<Users className="h-5 w-5" />}
            isOpen={activeDropdown === "students"} 
            onClick={() => toggleDropdown("students")}
            isCollapsed={isCollapsed}
          >
            <NavLink 
              to="/teacher/students" 
              icon={<User className="h-4 w-4" />}
              label="Student Directory" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/teacher/students")}
            />
            <NavLink 
              to="/teacher/students-attendance" 
              icon={<UserCheck className="h-4 w-4" />}
              label="Student Attendance" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/teacher/students-attendance")}
            />
          </NavDropdown>
        </nav>
      </div>
    </div>
  );
};

const TeacherNavbar = {
  renderSidebar: (props: TeacherNavbarProps) => {
    return <TeacherSidebar {...props} />;
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
    
    if (!setIsProfileDropdownOpen) return null;
    
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