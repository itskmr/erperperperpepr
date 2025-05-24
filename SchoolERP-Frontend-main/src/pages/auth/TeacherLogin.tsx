import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

const TeacherLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [useDemo, setUseDemo] = useState(false);

  // Demo account for teacher
  const demoAccount = { email: 'Ram3@gmail.com', password: 'Ram@1234' };

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
      if (useDemo || (formData.email === demoAccount.email && formData.password === demoAccount.password)) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Store auth token
        const mockToken = `teacher-token-${Date.now()}`;
        const mockUserData = {
          id: 1,
          name: 'Demo Teacher',
          email: demoAccount.email,
          subject: 'Mathematics'
        };
        
        // Set consistent auth data
        localStorage.setItem('token', mockToken);
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('role', 'teacher');
        localStorage.setItem('userRole', 'teacher');
        localStorage.setItem('userData', JSON.stringify(mockUserData));
        
        console.log('Demo teacher login successful, redirecting to /teacher/dashboard');
        console.log('Auth data:', {
          token: mockToken,
          role: 'teacher',
          userData: mockUserData
        });
        
        // Use window.location.href for a full page reload to ensure auth state is recognized
        window.location.href = '/teacher/dashboard';
        return;
      }
      
      // Actual authentication logic with API call
      const response = await fetch('http://localhost:5000/api/teacherLogin', {
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
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('role', 'teacher');
        localStorage.setItem('userRole', 'teacher');
        localStorage.setItem('userData', JSON.stringify(data.data.user));
        
        console.log('API teacher login successful, redirecting to /teacher/dashboard');
        console.log('Auth data:', {
          token: data.data.token,
          role: 'teacher',
          userData: data.data.user
        });
        
        // Use window.location.href for a full page reload to ensure auth state is recognized
        window.location.href = '/teacher/dashboard';
      } else {
        setError('Invalid response from server. Missing token or user data.');
      }
      
    } catch (err) {
      setError('Cannot connect to the server. Try using demo credentials or check network.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set up demo account data when demo mode is toggled
  React.useEffect(() => {
    if (useDemo) {
      setFormData({
        email: demoAccount.email,
        password: demoAccount.password,
      });
    }
  }, [useDemo]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Teacher Login</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
              <FiAlertCircle className="mr-2" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <FiMail />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="teacher@example.com"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <FiLock />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useDemo}
                  onChange={() => setUseDemo(!useDemo)}
                  className="form-checkbox h-5 w-5 text-purple-600"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Use demo credentials
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <Link
                to="/auth"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-300 flex items-center justify-center"
              >
                <FiArrowLeft className="mr-2" />
                Back
              </Link>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
            <p className="text-xs text-purple-800 font-semibold">Demo Teacher Credentials</p>
            <p className="text-xs text-purple-700 mt-1">
              Email: {demoAccount.email}
              <br />
              Password: {demoAccount.password}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherLogin; 