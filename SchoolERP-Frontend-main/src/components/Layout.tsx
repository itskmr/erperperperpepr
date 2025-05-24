import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { 
  School, 
  Bell, 
  Menu, 
  X, 
  User, 
  Search
} from "lucide-react";
import TeacherNavbar from "./Teacher/TeacherNavbar";
import SchoolNavbar from "./Schools/SchoolNavbar";
import AdminNavbar from "./Admin/AdminNavbar";
import { ParentNavbar } from "./parent";
import StudentNavbar from "./Student/StudentNavbar";

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  userRole?: string | null;
}

interface Notification {
  id: number;
  text: string;
  isRead: boolean;
  date?: string; // Optional date field
}

// Main Layout Component
const Layout: React.FC<LayoutProps> = ({ children, onLogout, userRole }) => {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, text: "New student registration", isRead: false, date: "2025-03-12" },
    { id: 2, text: "Fee payment reminder", isRead: false, date: "2025-03-11" },
    { id: 3, text: "Staff meeting at 3:00 PM", isRead: true, date: "2025-03-10" }
  ]);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const toggleDropdown = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const handleNotificationClick = (id: number) => {
    // Mark notification as read
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
    
    // Optionally close the notifications dropdown
    // setIsNotificationsOpen(false);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Add your search logic here
    }
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  // Close sidebar when clicking a link on mobile
  const closeMobileSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileSidebarOpen(false);
    }
  };

  // Replace the existing useEffect for click handling with this:
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle profile dropdown - only if it's currently open
      if (
        isProfileDropdownOpen &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node) &&
        // Make sure we're not clicking the button that toggles the dropdown
        !(event.target as Element).closest('button')?.getAttribute('aria-label')?.includes('profile')
      ) {
        setIsProfileDropdownOpen(false);
      }

      // Handle notifications dropdown - only if it's currently open
      if (
        isNotificationsOpen &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('button')?.getAttribute('aria-label')?.includes('notifications')
      ) {
        setIsNotificationsOpen(false);
      }

      // Handle search dropdown - only if it's currently open
      if (
        isSearchOpen &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('button')?.getAttribute('aria-label')?.includes('search')
      ) {
        setIsSearchOpen(false);
      }
    };

    // Only add listener if any dropdown is open
    if (isProfileDropdownOpen || isNotificationsOpen || isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen, isNotificationsOpen, isSearchOpen]);

  // Close active dropdowns when route changes
  useEffect(() => {
    setActiveDropdown(null);
    setIsProfileDropdownOpen(false);
    setIsNotificationsOpen(false);
    setIsSearchOpen(false);
    closeMobileSidebar();
  }, [location.pathname]);

  // Create props for navigation components
  const navbarProps = {
    activeDropdown,
    toggleDropdown,
    setIsMobileSidebarOpen,
    onLogout,
    isProfileDropdownOpen,
    setIsProfileDropdownOpen,
    profileDropdownRef,
    closeMobileSidebar
  };

  // Get the appropriate header based on user role
  const renderRoleBasedHeader = () => {
    if (userRole === 'teacher') {
      return TeacherNavbar.renderHeader();
    } else if (userRole === 'school') {
      return SchoolNavbar.renderHeader();
    } else if (userRole === 'parent') {
      return ParentNavbar.renderHeader();
    } else if (userRole === 'student') {
      return StudentNavbar.renderHeader();
    } else {
      return (
        <>
          <School className="h-8 w-8 text-indigo-600" />
          <span className="ml-2 text-xl font-bold text-gray-900 hidden md:block">
            School Management
          </span>
        </>
      );
    }
  };

  // Get the appropriate profile button based on user role
  const renderRoleBasedProfileButton = () => {
    if (userRole === 'teacher') {
      return TeacherNavbar.renderProfileButton(navbarProps);
    } else if (userRole === 'school') {
      return SchoolNavbar.renderProfileButton(navbarProps);
    } else if (userRole === 'parent') {
      return ParentNavbar.renderProfileButton(navbarProps);
    } else if (userRole === 'student') {
      return StudentNavbar.renderProfileButton(navbarProps);
    } else {
      return AdminNavbar.renderProfileButton({
        ...navbarProps,
        isProfileDropdownOpen,
        setIsProfileDropdownOpen,
        profileDropdownRef,
        onLogout
      });
    }
  };

  // Get the appropriate sidebar based on user role
  const renderRoleBasedSidebar = () => {
    if (userRole === 'teacher') {
      return TeacherNavbar.renderSidebar(navbarProps);
    } else if (userRole === 'school') {
      return SchoolNavbar.renderSidebar(navbarProps);
    } else if (userRole === 'parent') {
      return ParentNavbar.renderSidebar(navbarProps);
    } else if (userRole === 'student') {
      return StudentNavbar.renderSidebar(navbarProps);
    } else {
      return AdminNavbar.renderSidebar(navbarProps);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left section - Logo and toggle */}
            <div className="flex items-center">
              <button
                onClick={toggleMobileSidebar}
                className="p-2 rounded-md text-gray-500 lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-expanded={isMobileSidebarOpen}
                aria-label="Open navigation menu"
              >
                {isMobileSidebarOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
              
              {/* Logo - Render based on role */}
              <div className="flex items-center flex-shrink-0 lg:px-0">
                {renderRoleBasedHeader()}
              </div>
            </div>

            {/* Center section - Search */}
            <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
              <div className="max-w-lg w-full lg:max-w-xs">
                <div className="relative">
                  <button
                    onClick={toggleSearch}
                    className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    aria-label="Search"
                    aria-expanded={isSearchOpen}
                  >
                    <Search className="h-5 w-5" />
                  </button>
                  
                  {isSearchOpen && (
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg p-4 z-50">
                      <form onSubmit={handleSearchSubmit}>
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <div className="pl-3">
                            <Search className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search..."
                            className="w-full p-2 focus:outline-none"
                            value={searchQuery}
                            onChange={handleSearchChange}
                          />
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right section - Notifications and Profile */}
            <div className="flex items-center">
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  aria-label="View notifications"
                  aria-expanded={isNotificationsOpen}
                >
                  <span className="sr-only">View notifications</span>
                  <div className="relative">
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    )}
                  </div>
                </button>
                
                {isNotificationsOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-2 text-sm text-gray-500">No notifications</p>
                      ) : (
                        notifications.map(notification => (
                          <div 
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification.id)}
                            className={`px-4 py-2 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                          >
                            <p className={`text-sm ${!notification.isRead ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                              {notification.text}
                            </p>
                            {notification.date && (
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile dropdown */}
              {renderRoleBasedProfileButton()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
            onClick={toggleMobileSidebar}
            aria-hidden="true"
          ></div>
        )}

        {/* Sidebar */}
        <div
          ref={dropdownRef}
          className={`bg-white shadow-lg fixed lg:sticky top-0 lg:top-16 h-full z-30 w-64 lg:w-56 xl:w-64 transform ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col lg:h-[calc(100vh-4rem)]`}
        >
          {/* Sidebar Content - Render based on role */}
          {renderRoleBasedSidebar()}

          {/* Sidebar Footer */}
          <div className="border-t border-gray-200 p-4 mt-auto">
            <a 
              href="/help" 
              className="flex items-center text-sm text-gray-600 hover:text-indigo-600"
              onClick={closeMobileSidebar}
            >
              <User className="h-5 w-5 mr-3" />
              Help & Support
            </a>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;