import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBook, FiUsers, FiUser, FiUserPlus } from 'react-icons/fi';

const AuthLanding: React.FC = () => {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  // Function to check admin access
  const checkAdminAccess = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('Value') === 'true';
    
    if (isAdmin) {
      navigate('/auth/admin-login');
    } else {
      alert('Access to admin login is restricted');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">School ERP System</h1>
          <p className="text-white text-lg opacity-90">Select your role to continue</p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* School Login Card */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            variants={itemVariants}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <FiBook className="text-blue-600 text-2xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">School</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Access the school administration portal to manage students, teachers, and school operations.
              </p>
              <Link
                to="/auth/school-login"
                className="block w-full py-3 px-4 bg-blue-600 text-white text-center rounded-lg font-medium hover:bg-blue-700 transition duration-200"
              >
                School Login
              </Link>
            </div>
          </motion.div>

          {/* Teacher Login Card */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            variants={itemVariants}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <FiUsers className="text-purple-600 text-2xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Teacher</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Login to your teacher account to manage classes, assignments, attendance, and student records.
              </p>
              <Link
                to="/auth/teacher-login"
                className="block w-full py-3 px-4 bg-purple-600 text-white text-center rounded-lg font-medium hover:bg-purple-700 transition duration-200"
              >
                Teacher Login
              </Link>
            </div>
          </motion.div>

          {/* Parent Login Card */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            variants={itemVariants}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                  <FiUser className="text-orange-600 text-2xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Parent</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Login to view your child's academic progress, attendance, and communicate with teachers.
              </p>
              <Link
                to="/auth/parent-login"
                className="block w-full py-3 px-4 bg-orange-600 text-white text-center rounded-lg font-medium hover:bg-orange-700 transition duration-200"
              >
                Parent Login
              </Link>
            </div>
          </motion.div>

          {/* Student Login Card */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            variants={itemVariants}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <FiUserPlus className="text-green-600 text-2xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Student</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Login to access your courses, assignments, grades, and school resources.
              </p>
              <Link
                to="/auth/student-login"
                className="block w-full py-3 px-4 bg-green-600 text-white text-center rounded-lg font-medium hover:bg-green-700 transition duration-200"
              >
                Student Login
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Admin access (hidden link) */}
        <div className="mt-10 text-center">
          <button 
            onClick={checkAdminAccess}
            className="text-white text-opacity-60 hover:text-opacity-100 text-sm"
          >
            System Administration
          </button>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-sm text-white text-opacity-70">
          <p>© {new Date().getFullYear()} School ERP System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLanding; 