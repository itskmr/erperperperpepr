import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  School, 
  LogOut, 
  FileText, 
  User, 
  Home, 
  Calendar, 
  Users, 
  Database, 
  DollarSign,
  Award,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Menu,
  Truck,
  BookOpen,
  MapPin,
  UserCheck,
  ClipboardList,
  GraduationCap,
  CreditCard,
  Calculator,
  Layers,
  UserPlus
} from "lucide-react";

interface SchoolNavbarProps {
  activeDropdown: string | null;
  toggleDropdown: (menu: string) => void;
  setIsMobileSidebarOpen: (isOpen: boolean) => void;
  onLogout?: () => void;
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
            ? "text-white bg-blue-600 shadow-md" 
            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
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
        <div className={`${isCollapsed ? 'absolute left-full top-0 ml-2 w-56 bg-white rounded-lg shadow-lg z-50' : 'pl-4 pr-2 py-2 bg-blue-50 rounded-b-lg mt-1'} space-y-1 py-2`}>
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
          ? `${isCollapsed ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-100 text-blue-700'} font-medium` 
          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
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
        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {badge}
        </span>
      )}
      
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-md">
          {label}
          {badge !== undefined && <span className="ml-1.5 bg-blue-500 text-white px-1.5 py-0.5 rounded-full text-xs">{badge}</span>}
        </div>
      )}
    </Link>
  );
};

// Update the handleSignOutClick function in ProfileDropdown
const ProfileDropdown = ({ onLogout }: { onLogout?: () => void }) => {
  // Get user data from localStorage to display email
  const getUserEmail = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        return user.email || user.schoolName || 'school@example.edu';
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return 'school@example.edu'; // fallback email
  };

  const getUserName = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        return user.schoolName || user.fullName || user.name || 'School Admin';
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return 'School Admin'; // fallback name
  };

  const handleSignOutClick = () => {
    if (onLogout) {
      onLogout(); // This will call the handleLogout function from App.tsx
    } else {
      // Fallback if onLogout prop is not available
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userData');
      localStorage.removeItem('loginTimestamp');
      
      sessionStorage.clear();
      
      document.cookie = 'authCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      window.location.href = '/login';
    }
  };
  
  return (
    <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50 animate-fadeIn">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm text-gray-500">Signed in as</p>
        <p className="text-sm font-medium text-gray-900 truncate" title={getUserEmail()}>
          {getUserEmail()}
        </p>
        <p className="text-xs text-gray-600 truncate mt-1" title={getUserName()}>
          {getUserName()}
        </p>
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            School Admin
          </span>
        </div>
      </div>

      <Link
        to="/school/profile"
        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
      >
        <div className="flex items-center">
          <User className="h-4 w-4 mr-3 text-blue-600" />
          School Profile
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

// SchoolSidebar component
const SchoolSidebar: React.FC<SchoolNavbarProps> = (props) => {
  const { activeDropdown, toggleDropdown, setIsMobileSidebarOpen, onSidebarCollapse } = props;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  
  // Function to check if a path is active based on current location
  const isPathActive = (path: string) => {
    // For root path, only match exactly
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    // For other paths, match if the location starts with the path
    return location.pathname.startsWith(path);
  };

  // Handle collapse toggle and notify parent
  const handleCollapseToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    // Notify parent component about the collapse state change
    if (onSidebarCollapse) {
      onSidebarCollapse(newCollapsedState);
    }
  };
  
  return (
    <div className={`flex flex-col h-full bg-white shadow-md transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        {!isCollapsed && (
          <div className="flex items-center">
            <School className="h-7 w-7 text-blue-600" />
            <span className="ml-2 text-lg font-semibold text-gray-800">School Admin</span>
          </div>
        )}
        
        <button 
          onClick={handleCollapseToggle}
          className={`p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 ${isCollapsed ? 'mx-auto' : ''}`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 bg-white">
        <nav className={`space-y-2 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {/* School Dashboard */}
          <NavLink 
            to="/dashboard" 
            icon={<Home className="h-5 w-5" />} 
            label="School Dashboard" 
            onClick={() => setIsMobileSidebarOpen(false)}
            isCollapsed={isCollapsed}
            isActive={isPathActive("/dashboard")}
          />

          {/* Administration */}
          <NavDropdown 
            title="Administration" 
            icon={<Briefcase className="h-5 w-5" />}
            isOpen={activeDropdown === "administration"} 
            onClick={() => toggleDropdown("administration")}
            isCollapsed={isCollapsed}
          >
            <NavLink 
              to="/school/student-attendance" 
              icon={<UserCheck className="h-4 w-4" />}
              label="Student Attendance" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/school/student-attendance")}
            />
            <NavLink 
              to="/school/teacher-attendance" 
              icon={<ClipboardList className="h-4 w-4" />}
              label="Teacher Attendance" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/school/teacher-attendance")}
            />
            <NavLink 
              to="/school/administration/timetable" 
              icon={<Calendar className="h-4 w-4" />}
              label="Timetable" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/school/administration/timetable")}
            />
            <NavLink 
              to="/school/transport-management/bus-attendance" 
              icon={<UserCheck className="h-4 w-4" />}
              label="Bus Attendance" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/school/transport-management/bus-attendance")}
            />
          </NavDropdown>

          {/* Student Management */}
          <NavDropdown 
            title="Student Management" 
            icon={<Users className="h-5 w-5" />}
            isOpen={activeDropdown === "students"} 
            onClick={() => toggleDropdown("students")}
            isCollapsed={isCollapsed}
          >
            <NavLink 
              to="/students/StudentRegistrationForm" 
              icon={<UserPlus className="h-4 w-4" />}
              label="Admissions" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/students/StudentRegistrationForm")}
            />
            <NavLink 
              to="/school/students/manage-students" 
              icon={<Database className="h-4 w-4" />}
              label="Manage Students" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/school/students/manage-students")}
            />
             <NavLink 
              to="/school/students/register/addNew" 
              icon={<FileText className="h-4 w-4" />}
              label="Register Student" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/school/students/register/addNew")}
            />
            <NavLink 
              to="/school/students/tc-form" 
              icon={<Award className="h-4 w-4" />}
              label="TC Form" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/school/students/tc-form")}
            />
             <NavLink 
              to="/school/students/register/allStudents" 
              icon={<Layers className="h-4 w-4" />}
              label="All Register Student" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/school/students/register/allRegisterStudent")}
            />
          </NavDropdown>

          {/* Faculty Management */}
          <NavDropdown 
            title="Faculty Management" 
            icon={<GraduationCap className="h-5 w-5" />}
            isOpen={activeDropdown === "faculty"} 
            onClick={() => toggleDropdown("faculty")}
            isCollapsed={isCollapsed}
          >
            <NavLink 
              to="/school/faculty-management/teacher-directory" 
              icon={<Users className="h-4 w-4" />}
              label="Teacher Directory" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/school/faculty-management/teacher-directory")}
            />
            <NavLink 
              to="/school/faculty-management/teacher-diary" 
              icon={<BookOpen className="h-4 w-4" />}
              label="Teacher Diary" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/school/faculty-management/teacher-diary")}
            />
            {/* <NavLink 
              to="/school/BusTracking" 
              label="Bus tracking" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/school/BusTracking")}
            /> */}
            {/* <NavLink 
              to="/School/ClassAssignment" 
              label="Class Assignments" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/School/ClassAssignment")}
            /> */}
            {/* <NavLink 
              to="/School/TeacherEvaluationPage" 
              label="Teacher Evaluations" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/School/TeacherEvaluationPage")}
            /> */}
          </NavDropdown>

          {/* Transport Management */}
          <NavDropdown 
            title="Transport Management" 
            icon={<Truck className="h-5 w-5" />}
            isOpen={activeDropdown === "transport"} 
            onClick={() => toggleDropdown("transport")}
            isCollapsed={isCollapsed}
          >
            <NavLink 
              to="/school/transport-management/driver-directory" 
              icon={<User className="h-4 w-4" />}
              label="Driver Directory" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/school/transport-management/driver-directory")}
            />
            <NavLink 
              to="/school/transport-management/vehicle-management" 
              icon={<Truck className="h-4 w-4" />}
              label="Vehicle Management" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/school/transport-management/vehicle-management")}
            />
            <NavLink 
              to="/school/transport-management/transport-routes" 
              icon={<MapPin className="h-4 w-4" />}
              label="Transport Routes" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/school/transport-management/transport-routes")}
            />
            
          </NavDropdown>

          {/* Financial Management */}
          <NavDropdown 
            title="Financial Management" 
            icon={<DollarSign className="h-5 w-5" />}
            isOpen={activeDropdown === "finance"} 
            onClick={() => toggleDropdown("finance")}
            isCollapsed={isCollapsed}
          >
            <NavLink 
              to="/School/FeeCollection" 
              icon={<CreditCard className="h-4 w-4" />}
              label="Fees Collection" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/School/FeeCollection")}
            />
            <NavLink 
              to="/school/financial-management/fee-structure" 
              icon={<Layers className="h-4 w-4" />}
              label="Fee Structure" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/school/financial-management/fee-structure")}
            />
            <NavLink 
              to="/School/ExpenseTracker" 
              icon={<Calculator className="h-4 w-4" />}
              label="Expense Tracking" 
              onClick={() => setIsMobileSidebarOpen(false)}
              isActive={isPathActive("/School/ExpenseTracker")}
            />
          </NavDropdown>


        </nav>
      </div>
    </div>
  );
};

const SchoolNavbar = {
  renderSidebar: (props: SchoolNavbarProps) => {
    return <SchoolSidebar {...props} />;
  },

  ProfileDropdown,

  renderHeader: () => {
    return (
      <div className="flex items-center bg-white shadow-sm py-2 px-4 sticky top-0 z-10">
        <div className="bg-blue-50 p-1.5 rounded-lg shadow-sm">
          <School className="h-8 w-8 text-blue-600" />
        </div>
        <span className="ml-3 text-xl font-bold text-gray-900 hidden md:block">
          School Admin Portal
        </span>
      </div>
    );
  },

  renderProfileButton: (props: SchoolNavbarProps) => {
    const { isProfileDropdownOpen, setIsProfileDropdownOpen, profileDropdownRef, onLogout } = props;
    
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };
    
    return (
      <div className="ml-3 relative" ref={profileDropdownRef}>
        <button
          onClick={handleClick}
          aria-label="Toggle profile dropdown"
          className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:ring-2 hover:ring-offset-2 hover:ring-blue-300"
        >
          <div className="bg-blue-100 text-blue-800 p-2 rounded-full shadow-sm hover:shadow transition-all duration-200">
            <User className="h-6 w-6" />
          </div>
        </button>
        
        {isProfileDropdownOpen && <ProfileDropdown onLogout={onLogout} />}
      </div>
    );
  },
  
  renderMobileMenuButton: (setIsMobileSidebarOpen: (isOpen: boolean) => void) => {
    return (
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Open mobile menu"
      >
        <Menu className="h-6 w-6" />
      </button>
    );
  },

  // Export the collapsed state management
  useCollapsedState: () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    return { isCollapsed, setIsCollapsed };
  }
};

// Add these styles to your global CSS file
// @keyframes fadeIn {
//   from { opacity: 0; transform: translateY(-10px); }
//   to { opacity: 1; transform: translateY(0); }
// }
// .animate-fadeIn {
//   animation: fadeIn 0.2s ease-out forwards;
// }

export default SchoolNavbar;