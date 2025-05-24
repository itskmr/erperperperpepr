import React from 'react';
import { useNavigate } from 'react-router-dom';
import { handleSignOut } from '../../utils/auth';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo and navigation links */}
          </div>
          
          <div className="flex items-center">
            {/* User menu and sign out button */}
            <button
              onClick={() => handleSignOut(navigate)}
              className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;