import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Settings, 
  LogOut, 
  FileText, 
  User, 
  Home, 
  Calendar, 
  Users, 
  BarChart2,
  HelpCircle,
  DollarSign,
  Book,
  ChevronDown,
  Building, 
  UserPlus,
  Shield,
  LayoutDashboard
} from "lucide-react";
import { handleSignOut } from "../../utils/auth";

interface AdminNavbarProps {
  activeDropdown: string | null;
  toggleDropdown: (menu: string) => void;
  setIsMobileSidebarOpen: (isOpen: boolean) => void;
  onLogout?: () => void;
  isProfileDropdownOpen?: boolean;
  setIsProfileDropdownOpen?: (isOpen: boolean) => void;
  profileDropdownRef?: React.RefObject<HTMLDivElement>;
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
            ? "text-indigo-700 bg-indigo-50" 
            : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
          }`}
      >
        <div className="flex items-center">
          {icon && <span className="mr-3">{icon}</span>}
          <span>{title}</span>
        </div>
        <ChevronDown 
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
        />
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
      className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-200"
      onClick={onClick}
    >
      <div className="flex items-center">
        {icon && <span className="mr-3 flex-shrink-0">{icon}</span>}
        <span className="font-medium">{label}</span>
      </div>
      {badge !== undefined && (
        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
};

const AdminNavbar = {
  renderSidebar: (props: AdminNavbarProps) => {
    const { activeDropdown, toggleDropdown, setIsMobileSidebarOpen } = props;
    
    return (
      <div className="flex-1 overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 px-3 space-y-1.5">
          {/* Dashboard Link */}
          <NavLink 
            to="/admin/dashboard" 
            icon={<LayoutDashboard className="h-5 w-5 text-indigo-600" />} 
            label="Dashboard" 
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Home Link */}
          <NavLink 
            to="/" 
            icon={<Home className="h-5 w-5 text-indigo-600" />} 
            label="Home" 
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Administration Dropdown */}
            <NavDropdown 
              title="Administration" 
              icon={<Shield className="h-5 w-5 text-purple-600" />}
              isOpen={activeDropdown === "administration"} 
              onClick={() => toggleDropdown("administration")}
            >
              <NavLink 
                to="/admin/schools" 
                icon={<Building className="h-4 w-4 text-indigo-600" />}
                label="Manage Schools" 
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              <NavLink 
                to="/admin/users" 
                icon={<UserPlus className="h-4 w-4 text-indigo-600" />}
                label="Manage Users" 
                onClick={() => setIsMobileSidebarOpen(false)}
              />
            </NavDropdown>  


            {/* Staff Dropdown */}
          <NavDropdown 
            title="Staff" 
            icon={<Users className="h-5 w-5 text-orange-600" />}
            isOpen={activeDropdown === "staff"} 
            onClick={() => toggleDropdown("staff")}
          >
           
            <NavLink 
              

               to="/staff" 
              label="Staff Directory" 
              onClick={() => setIsMobileSidebarOpen(false)}/>
                  
              <NavLink 
              to="/staff/documents" 
              label="Document Management" 

              onClick={() => setIsMobileSidebarOpen(false)}
            />
             
          
          </NavDropdown>

          {/* Students Dropdown */}
          <NavDropdown 
            title="Students" 
            icon={<Users className="h-5 w-5 text-green-600" />}
            isOpen={activeDropdown === "students"} 
            onClick={() => toggleDropdown("students")}
          >
           
            <NavLink 
              to="/students/StudentRegistrationForm" 
              label="New Admission" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <NavLink 
              to="/school/students/manage-students" 
              label="Manage Students" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
           
          </NavDropdown>

          {/* Academics */}
          {/* <NavDropdown 
            title="Academics" 
            icon={<Book className="h-5 w-5 text-purple-600" />}
            isOpen={activeDropdown === "academics"} 
            onClick={() => toggleDropdown("academics")}
          >
            <NavLink 
              to="/academics/timetable" 
              label="Timetable" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <NavLink 
              to="/academics/syllabus" 
              label="Syllabus" 
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          </NavDropdown> */}

          {/* Reports */}
          <NavLink 
            to="/Report-admin" 
            icon={<BarChart2 className="h-5 w-5 text-yellow-600" />} 
            label="Reports" 
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Calendar */}
          {/* <NavLink 
            to="/calendar" 
            icon={<Calendar className="h-5 w-5 text-indigo-600" />} 
            label="Calendar" 
            onClick={() => setIsMobileSidebarOpen(false)}
          /> */}
          
          {/* Help & Support */}
          <NavLink 
            to="/help" 
            icon={<HelpCircle className="h-5 w-5 text-gray-600" />} 
            label="Help & Support" 
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        </nav>
      </div>
    );
  },

  renderHeader: () => (
    <div className="flex items-center">
      <div className="bg-indigo-50 p-1.5 rounded-md">
        <User className="h-8 w-8 text-indigo-600" />
      </div>
      <span className="ml-2.5 text-xl font-bold text-gray-900 hidden md:block">
        School Management
      </span>
    </div>
  ),

  renderProfileButton: (props: AdminNavbarProps) => {
    return <ProfileButton {...props} />;
  }
};

const ProfileDropdown = ({ onLogout }: { onLogout?: () => void }) => {
  const handleSignOutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Use a simpler approach without hooks
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userData');
      window.location.href = '/login'; // Use direct navigation instead of useNavigate
    }
  };
  
  return (
    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm text-gray-500">Signed in as</p>
        <p className="text-sm font-medium text-gray-900 truncate">admin@school.edu</p>
        <div className="mt-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            Administrator
          </span>
        </div>
      </div>

      <Link
        to="/profile"
        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
      >
        <div className="flex items-center">
          <User className="h-4 w-4 mr-3 text-indigo-600" />
          Your Profile
        </div>
      </Link>
      
      <Link
        to="/settings"
        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
      >
        <div className="flex items-center">
          <Settings className="h-4 w-4 mr-3 text-indigo-600" />
          Settings
        </div>
      </Link>
      
      <button
        onClick={handleSignOutClick}
        className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
      >
        <div className="flex items-center">
          <LogOut className="h-4 w-4 mr-3" />
          Sign out
        </div>
      </button>
    </div>
  );
};

const ProfileButton = ({ 
  isProfileDropdownOpen, 
  setIsProfileDropdownOpen, 
  profileDropdownRef,
  onLogout
}: {
  isProfileDropdownOpen?: boolean;
  setIsProfileDropdownOpen?: (isOpen: boolean) => void;
  profileDropdownRef?: React.RefObject<HTMLDivElement>;
  onLogout?: () => void;
}) => {
  if (!setIsProfileDropdownOpen) return null;
  
  const handleClick = (e: React.MouseEvent) => {
    // Stop event propagation to prevent conflicts
    e.stopPropagation();
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };
  
  return (
    <div className="ml-3 relative" ref={profileDropdownRef}>
      <button
        onClick={handleClick}
        aria-label="Toggle profile dropdown"
        className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:ring-2 hover:ring-offset-2 hover:ring-indigo-300"
      >
        <div className="bg-indigo-100 text-indigo-800 p-2 rounded-full">
          <User className="h-6 w-6" />
        </div>
      </button>
      
      {isProfileDropdownOpen && <ProfileDropdown onLogout={onLogout} />}
    </div>
  );
};

export default AdminNavbar;