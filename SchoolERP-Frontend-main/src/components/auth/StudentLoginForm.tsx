import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiSend } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface StudentLoginFormProps {
  onSubmit: (formData: { 
    email: string; 
    password: string; 
  }) => Promise<void>;
  isLoading: boolean;
  error: string;
  useDemo: boolean;
  setUseDemo: (useDemo: boolean) => void;
  onBack: () => void;
}

// Demo account for student
const demoAccount = {
  email: 'student@gmail.com',
  password: 'Student@1234',
};

type FormState = 'login' | 'forgot';

const StudentLoginForm: React.FC<StudentLoginFormProps> = ({
  onSubmit,
  isLoading,
  error,
  useDemo,
  setUseDemo,
  onBack
}) => {
  const [formState, setFormState] = useState<FormState>('login');
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    resetEmail?: string;
  }>({
    email: '',
    password: '',
    resetEmail: '',
  });
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    resetEmail?: string;
  }>({});
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const [resetLoading, setResetLoading] = useState<boolean>(false);

  // Animation variants
  const formVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  // Pre-fill form data when demo is selected
  useEffect(() => {
    if (useDemo) {
      setFormData({
        email: demoAccount.email,
        password: demoAccount.password,
        resetEmail: '',
      });
    } else {
      setFormData({
        email: '',
        password: '',
        resetEmail: '',
      });
    }
  }, [useDemo]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (formState === 'login') {
        if (!formData.email) {
        newErrors.email = 'Email or ID is required';
        }
      
        if (!formData.password) {
          newErrors.password = 'Password is required';
      }
    } else if (formState === 'forgot') {
      if (!formData.resetEmail) {
        newErrors.resetEmail = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.resetEmail)) {
        newErrors.resetEmail = 'Please enter a valid email';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (formState === 'login') {
      // Submit login data
    await onSubmit({
      email: formData.email,
        password: formData.password
      });
    } else if (formState === 'forgot') {
      // Handle password reset request
      handleResetPassword();
    }
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;
    
    setResetLoading(true);

    try {
      // In a real application, this would be an API call to your backend
      // For demo purposes, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Password reset requested for:', formData.resetEmail);
      
      // Show success message
      setResetSuccess(true);
      
      // In 3 seconds, go back to login
      setTimeout(() => {
        setFormState('login');
        setResetSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setErrors({
        resetEmail: 'Failed to send reset link. Please try again.'
      });
    } finally {
      setResetLoading(false);
    }
  };

  const switchToForgotPassword = () => {
    setFormState('forgot');
    setFormData(prev => ({
      ...prev,
      resetEmail: prev.email // Pre-fill with login email if available
    }));
    setErrors({});
  };

  const switchToLogin = () => {
    setFormState('login');
    setErrors({});
    setResetSuccess(false);
  };

  return (
    <div className="student-login-container">
      <AnimatePresence mode="wait">
        {formState === 'login' ? (
        <motion.div 
            key="login-form"
            variants={formVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
              Student Login
            </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
          <FiAlertCircle className="mr-2" />
          <span>{error}</span>
        </div>
      )}

            <form onSubmit={handleSubmit} className="student-login-form">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Student ID/Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <FiMail />
                  </span>
                <input
                    id="email"
                    name="email"
                  type="text"
                    value={formData.email}
                  onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    placeholder="Enter your ID or email"
                />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                    Password
                  </label>
                  <button 
                    type="button"
                    onClick={switchToForgotPassword} 
                    className="text-sm text-amber-600 hover:text-amber-800"
                  >
                    Forgot password?
                  </button>
                </div>
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
                    className={`w-full pl-10 pr-10 py-2 rounded-lg border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

        {/* Demo credentials checkbox */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useDemo}
                onChange={() => setUseDemo(!useDemo)}
                className="form-checkbox h-5 w-5 text-amber-600"
              />
              <span className="ml-2 text-sm text-gray-700">
                Use demo credentials
              </span>
            </label>
          </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
                <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-300"
            >
              Back
                </button>

                <button
                  type="submit"
            disabled={isLoading}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300 flex items-center justify-center"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                      Logging in...
              </span>
                  ) : (
                    'Log in'
                  )}
                </button>
              </div>
            </form>

            {/* Help text box */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-xs text-amber-800 font-semibold">Student Portal Login</p>
              <p className="text-xs text-amber-700 mt-1">
                Enter your student ID or email and password to access your academic information.
                If you don't have an account, please contact your school administrator.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="forgot-password-form"
            variants={formVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
              Reset Your Password
            </h3>

            {resetSuccess ? (
              <motion.div 
                className="p-4 bg-green-50 border border-green-200 rounded-md text-green-800 mb-4 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-medium mb-1">Password Reset Link Sent!</p>
                <p className="text-sm">Check your email for instructions to reset your password.</p>
                <p className="text-xs mt-2">Redirecting to login...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="forgot-password-form">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Enter your email address below and we'll send you a link to reset your password.
                  </p>
                  
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="resetEmail">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <FiMail />
                    </span>
                    <input
                      id="resetEmail"
                      name="resetEmail"
                      type="email"
                      value={formData.resetEmail}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                        errors.resetEmail ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  {errors.resetEmail && <p className="mt-1 text-sm text-red-600">{errors.resetEmail}</p>}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={switchToLogin}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-300 flex items-center"
                  >
                    <FiArrowLeft className="mr-1" />
                    Back to Login
                  </button>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300 flex items-center justify-center"
                  >
                    {resetLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                ) : (
                  <>
                        <FiSend className="mr-1" />
                        Send Reset Link
                  </>
                )}
                  </button>
                </div>
              </form>
            )}

            {/* Help box */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800 font-semibold">Password Recovery</p>
              <p className="text-xs text-blue-700 mt-1">
                If you have trouble accessing your account, please contact your school administration office for assistance.
              </p>
        </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default StudentLoginForm; 