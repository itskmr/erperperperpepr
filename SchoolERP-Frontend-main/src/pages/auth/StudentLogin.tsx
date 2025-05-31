import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in email and password');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const endpoint = `${API_URL}/schools/student/email-login`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Provide more specific error messages based on status codes
        if (response.status === 403) {
          setError('Student login is not enabled. Please contact administration.');
        } else if (response.status === 401) {
          setError('Invalid credentials. Please check your email and password.');
        } else if (response.status === 404) {
          setError('Student not found with provided credentials.');
        } else {
          setError(data.message || 'Login failed. Please check your credentials.');
        }
        return;
      }
      
      if (data.success && data.data && data.data.token) {
        // Store authentication data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('role', 'student');
        localStorage.setItem('userRole', 'student');
        localStorage.setItem('userData', JSON.stringify(data.data.student));
        
        toast.success('Login successful!');
        
        console.log('Student login successful, redirecting to /student/dashboard');
        console.log('Auth data:', {
          token: data.data.token,
          role: 'student',
          userData: data.data.student
        });
        
        // Force immediate navigation by using window.location.href
        // This ensures the page reloads and App.tsx re-initializes with the new auth state
        window.location.href = '/student/dashboard';
      } else {
        setError('Invalid response from server. Missing token or student data.');
      }
      
    } catch (err) {
      setError('Cannot connect to the server. Please check your network connection.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/auth"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiArrowLeft className="text-gray-600" />
            </Link>
            <h2 className="text-2xl font-bold text-gray-800">Student Login</h2>
            <div className="w-8"></div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
              <FiAlertCircle className="mr-2" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="student@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help with your account?{' '}
              <Link to="/contact" className="text-green-600 hover:text-green-700 font-medium">
                Contact Support
              </Link>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Are you a parent?{' '}
              <Link to="/auth/parent-login" className="text-green-600 hover:text-green-700 font-medium">
                Parent Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentLogin; 