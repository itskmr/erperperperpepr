import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ParentLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    parentType: 'father'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const endpoint = `${API_URL}/schools/parent/email-login`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          parentType: formData.parentType
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Provide more specific error messages based on status codes
        if (response.status === 403) {
          setError('Parent account is inactive. Please contact administration.');
        } else if (response.status === 401) {
          setError('Invalid email or password for the selected parent type.');
        } else if (response.status === 404) {
          setError('Parent not found with provided email.');
        } else {
          setError(data.message || 'Login failed. Please check your credentials.');
        }
        return;
      }
      
      if (data.success && data.data && data.data.token) {
        // Store authentication data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('role', 'parent');
        localStorage.setItem('userRole', 'parent');
        localStorage.setItem('userData', JSON.stringify(data.data.parent));
        
        toast.success('Login successful!');
        
        console.log('Parent login successful, redirecting to /parent/dashboard');
        console.log('Auth data:', {
          token: data.data.token,
          role: 'parent',
          userData: data.data.parent
        });
        
        // Navigate to parent dashboard
        window.location.href = '/parent/dashboard';
      } else {
        setError('Invalid response from server. Missing token or parent data.');
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
            <h2 className="text-2xl font-bold text-gray-800">Parent Login</h2>
            <div className="w-8"></div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
              <FiAlertCircle className="mr-2" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Parent Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="parentType">
                Parent Type
              </label>
              <div className="relative">
                <select
                  id="parentType"
                  name="parentType"
                  value={formData.parentType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                </select>
              </div>
            </div>

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
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={`${formData.parentType}@example.com`}
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
                  className="w-full px-3 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              <Link to="/contact" className="text-orange-600 hover:text-orange-700 font-medium">
                Contact Support
              </Link>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Are you a student?{' '}
              <Link to="/auth/student-login" className="text-orange-600 hover:text-orange-700 font-medium">
                Student Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ParentLogin; 