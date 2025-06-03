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
  GraduationCap,
  MessageSquare,
  Bell,
  Clock,
  Activity,
  Award,
  CreditCard,
  Heart,
  BookOpen,
  MessageCircle
} from "lucide-react";
import { handleSignOut } from "../../utils/auth";

interface ParentNavbarProps {
  activeDropdown: string | null;
  toggleDropdown: (menu: string) => void;
  setIsMobileSidebarOpen: (isOpen: boolean) => void;
  onLogout?: () => void;
  isProfileDropdownOpen?: boolean;
  setIsProfileDropdownOpen?: (isOpen: boolean) => void;
  profileDropdownRef?: React.RefObject<HTMLDivElement>;
  closeMobileSidebar?: () => void;
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
            ? "text-pink-700 bg-pink-50" 
            : "text-gray-700 hover:text-pink-600 hover:bg-pink-50"
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
      className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 rounded-md hover:bg-pink-50 hover:text-pink-700 transition-colors duration-200"
      onClick={onClick}
    >
      <div className="flex items-center">
        {icon && <span className="mr-3 flex-shrink-0">{icon}</span>}
        <span className="font-medium">{label}</span>
      </div>
      {badge !== undefined && (
        <span className="bg-pink-100 text-pink-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
};

const ParentNavbar = {
  renderSidebar: (props: ParentNavbarProps) => {
    const { activeDropdown, toggleDropdown, setIsMobileSidebarOpen, closeMobileSidebar } = props;
    const closeMenu = closeMobileSidebar || (() => setIsMobileSidebarOpen(false));
    
    return (
      <div className="flex-1 overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 px-3 space-y-1.5">
          {/* Dashboard Link */}
          <NavLink 
            to="/parent/dashboard" 
            icon={<Home className="h-5 w-5 text-pink-600" />} 
            label="Dashboard" 
            onClick={closeMenu}
          />

          {/* Academic Overview Dropdown */}
          <NavDropdown 
            title="Academic Overview" 
            icon={<GraduationCap className="h-5 w-5 text-pink-600" />}
            isOpen={activeDropdown === "academic"} 
            onClick={() => toggleDropdown("academic")}
          >
            <NavLink 
              to="/parent/academics/diary" 
              icon={<BookOpen className="h-4 w-4 text-pink-600" />}
              label="Class Diary" 
              onClick={closeMenu}
            />
            <NavLink 
              to="/parent/academics/attendance" 
              icon={<Clock className="h-4 w-4 text-pink-600" />}
              label="Attendance" 
              onClick={closeMenu}
            />
          </NavDropdown>  

          {/* Communication Hub Dropdown */}
          <NavDropdown 
            title="Communication" 
            icon={<MessageSquare className="h-5 w-5 text-orange-500" />}
            isOpen={activeDropdown === "communication"} 
            onClick={() => toggleDropdown("communication")}
          >
            <NavLink 
              to="/parent/communication/messages" 
              label="Direct Messaging" 
              onClick={closeMenu}
              badge={3}
            />
            <NavLink 
              to="/parent/communication/announcements" 
              label="Announcements" 
              onClick={closeMenu}
            />
            <NavLink 
              to="/parent/communication/calendar" 
              icon={<Calendar className="h-4 w-4 text-orange-500" />}
              label="Event Calendar" 
              onClick={closeMenu}
            />
          </NavDropdown>

          {/* Feedback & Surveys */}
          <NavLink 
            to="/parent/feedback" 
            icon={<MessageCircle className="h-5 w-5 text-purple-500" />} 
            label="Feedback & Surveys" 
            onClick={closeMenu}
          />
          
          {/* Help & Support */}
          <NavLink 
            to="/help" 
            icon={<HelpCircle className="h-5 w-5 text-gray-600" />} 
            label="Help & Support" 
            onClick={closeMenu}
          />
        </nav>
      </div>
    );
  },

  renderHeader: () => (
    <div className="flex items-center">
      <div className="bg-pink-50 p-1.5 rounded-md">
        <User className="h-8 w-8 text-pink-600" />
      </div>
      <span className="ml-2.5 text-xl font-bold text-gray-900 hidden md:block">
        Parent Portal
      </span>
    </div>
  ),

  // Profile dropdown content
  ProfileDropdown: ({ onLogout }: { onLogout?: () => void }) => {
    const navigate = useNavigate();
    
    const handleSignOutClick = () => {
      if (onLogout) {
        onLogout();
      } else {
        handleSignOut(navigate);
      }
    };
    
    return (
      <div className="py-1">
        <Link
          to="/parent/profile"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700"
        >
          Your Profile
        </Link>
        <Link
          to="/parent/settings"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700"
        >
          Settings
        </Link>
        <button
          onClick={handleSignOutClick}
          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700"
        >
          Sign out
        </button>
      </div>
    );
  },

  // Profile button for the header
  renderProfileButton: ({ 
    isProfileDropdownOpen, 
    setIsProfileDropdownOpen, 
    profileDropdownRef,
    onLogout
  }: ParentNavbarProps) => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';
    
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (setIsProfileDropdownOpen) {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
      }
    };
    
    return (
      <div className="ml-3 relative" ref={profileDropdownRef}>
        <div>
          <button
            type="button"
            className="flex items-center max-w-xs rounded-full bg-pink-100 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            id="user-menu-button"
            aria-expanded={isProfileDropdownOpen}
            aria-haspopup="true"
            onClick={handleClick}
            aria-label="Open profile menu"
          >
            <span className="sr-only">Open user menu</span>
            <span className="h-8 w-8 rounded-full flex items-center justify-center bg-pink-100 text-pink-700 font-bold">
              {userInitial}
            </span>
          </button>
        </div>
        
        {isProfileDropdownOpen && (
          <div
            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
            tabIndex={-1}
          >
            <ParentNavbar.ProfileDropdown onLogout={onLogout} />
          </div>
        )}
      </div>
    );
  }
};

export default ParentNavbar; 