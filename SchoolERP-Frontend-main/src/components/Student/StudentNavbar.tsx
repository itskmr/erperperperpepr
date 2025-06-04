import React from "react";
import { Link } from "react-router-dom";
import { 
  Settings, 
  LogOut, 
  User, 
  Home, 
  BookOpen,
  GraduationCap
} from "lucide-react";

interface StudentNavbarProps {
  activeDropdown: string | null;
  toggleDropdown: (menu: string) => void;
  setIsMobileSidebarOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  isProfileDropdownOpen: boolean;
  setIsProfileDropdownOpen: (isOpen: boolean) => void;
  profileDropdownRef: React.RefObject<HTMLDivElement>;
  onSidebarCollapse?: (isCollapsed: boolean) => void;
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
    <div className="relative mb-1">
      <button
        onClick={onClick}
        className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between rounded-md transition-colors
          ${isOpen 
            ? "text-blue-700 bg-blue-100" 
            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
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
        <div className="pl-4 pr-2 py-2 space-y-1 border-l-2 border-blue-100 ml-4 mt-1">
          {children}
        </div>
      )}
    </div>
  );
};

// Navigation link component
const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, onClick, badge }) => {
  return (
    <Link
      to={to}
      className="flex items-center justify-between px-4 py-3 mb-1 text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700"
      onClick={onClick}
    >
      <div className="flex items-center">
        {icon && <span className="mr-3">{icon}</span>}
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
};

const StudentNavbar = {
  renderSidebar: (props: StudentNavbarProps) => {
    const { activeDropdown, toggleDropdown, setIsMobileSidebarOpen } = props;
    
    return (
      <div className="flex-1 overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 px-2 space-y-0">
          {/* Dashboard Section */}
          <NavLink 
            to="/student/dashboard" 
            icon={<Home className="h-5 w-5 text-blue-600" />} 
            label="Dashboard" 
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Academics Section */}
          <NavDropdown 
            title="Academics" 
            icon={<GraduationCap className="h-5 w-5 text-blue-600" />}
            isOpen={activeDropdown === "academics"} 
            onClick={() => toggleDropdown("academics")}
          >
            <NavLink 
              to="/student/academics/diary" 
              icon={<BookOpen className="h-4 w-4 text-blue-600" />}
              label="Class Diary" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <NavLink 
              to="/student/academics/schedule" 
              label="Class Schedule" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          </NavDropdown>

        </nav>
      </div>
    );
  },

  renderProfileDropdown: (props: StudentNavbarProps) => {
    const { onLogout } = props;
    
    return (
      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">Signed in as</p>
          <p className="text-sm font-medium text-gray-900 truncate">student@school.edu</p>
          <div className="mt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Student
            </span>
          </div>
        </div>

        <Link
          to="/student/profile"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
        >
          <div className="flex items-center">
            <User className="h-4 w-4 mr-3 text-blue-600" />
            My Profile
          </div>
        </Link>
        
        <Link
          to="/student/settings"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
        >
          <div className="flex items-center">
            <Settings className="h-4 w-4 mr-3 text-blue-600" />
            Settings
          </div>
        </Link>
        
        <button
          onClick={onLogout}
          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-blue-50"
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
      <Home className="h-8 w-8 text-blue-600" />
      <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">
        Student Portal
      </span>
    </>
  ),

  renderProfileButton: (props: StudentNavbarProps) => {
    const { isProfileDropdownOpen, setIsProfileDropdownOpen, profileDropdownRef } = props;
    
    return (
      <div className="ml-3 relative" ref={profileDropdownRef}>
        <button
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <div className="bg-blue-100 text-blue-800 p-2 rounded-full">
            <User className="h-6 w-6" />
          </div>
        </button>
        
        {isProfileDropdownOpen && StudentNavbar.renderProfileDropdown(props)}
      </div>
    );
  }
};

export default StudentNavbar; 
