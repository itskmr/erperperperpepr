import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Demo admin account
  const demoAccount = { email: 'Ram@gmail.com', password: 'Ram@1234' };

  // Check if admin access is allowed
  const [isVerified, setIsVerified] = useState(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    // For development purposes, you might want to set this to true
    // In production, implement proper verification
    return isAdmin || process.env.NODE_ENV === 'development';
  });

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
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Check if using demo credentials
      if (formData.email === demoAccount.email && formData.password === demoAccount.password) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Store admin auth token
        const mockToken = `admin-token-${Date.now()}`;
        const mockUserData = {
          id: 1,
          name: 'Admin User',
          email: formData.email
        };
        
        localStorage.setItem('token', mockToken);
        localStorage.setItem('role', 'admin');
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('userData', JSON.stringify(mockUserData));
        
        // Use window.location.href for a full page reload to ensure auth state is recognized
        window.location.href = '/admin/dashboard';
        return;
      }
      
      // Actual authentication logic with API call
      const response = await fetch('http://localhost:5000/api/adminLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Provide more specific error messages based on status codes
        if (response.status === 403) {
          setError('This account is inactive. Please contact administrator.');
        } else if (response.status === 401) {
          setError('Invalid email or password.');
        } else if (response.status === 404) {
          setError('Login endpoint not found.');
        } else {
          setError(data.error || data.message || 'Login failed. Please check your credentials.');
        }
        return;
      }
      
      if (data.success && data.data && data.data.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('role', 'admin');
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('userData', JSON.stringify(data.data.user));
        
        // Use window.location.href for a full page reload to ensure auth state is recognized
        window.location.href = '/admin/dashboard';
      } else {
        setError('Invalid response from server. Missing token or user data.');
      }
      
    } catch (err) {
      setError('Cannot connect to the server. Please check your network connection.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVerified) {
    return (
      <div className="text-center">
        <FiAlertCircle className="mx-auto text-red-500 text-4xl mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Access Restricted</h3>
        <p className="text-gray-600 mb-4">
          This area is restricted to authorized administrators only.
        </p>
        <Link 
          to="/auth"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft className="mr-2" /> Return to login options
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
              <p className="text-gray-600 mt-2">Sign in to access the admin dashboard</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center">
                <FiAlertCircle className="mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                    isLoading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } transition-colors duration-200`}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/auth"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <FiArrowLeft className="mr-2" /> Back to login options
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 