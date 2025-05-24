import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiUser, FiBook, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import IdForm from '../../components/Student/idform';

interface FormData {
  name: string;
  email: string;
  admissionNumber: string;
  grade: string;
  section: string;
  password: string;
  confirmPassword: string;
  school: string;
  rollNumber: string;
  className: string;
  presentCity?: string;
  presentState?: string;
  mobileNumber?: string;
}

// Mock database of valid admission numbers
const VALID_ADMISSION_NUMBERS = ['AD12345', 'AD67890', 'AD11111', 'AD22222', 'AD33333'];

// Mock list of schools
const SCHOOLS = [
  { id: 'SCH001', name: 'Cambridge International School' },
  { id: 'SCH002', name: 'St. Mary\'s Academy' },
  { id: 'SCH003', name: 'Delhi Public School' },
  { id: 'SCH004', name: 'Green Valley High School' },
  { id: 'SCH005', name: 'Oakridge International School' },
  { id: 'SCH006', name: 'Sunbeam Academy' }
];

const StudentSignup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    admissionNumber: '',
    grade: '',
    section: '',
    password: '',
    confirmPassword: '',
    school: '',
    rollNumber: '',
    className: '',
    presentCity: '',
    presentState: '',
    mobileNumber: ''
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State for ID form popup
  const [showIdForm, setShowIdForm] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  
  // State for admission number validation
  const [isCheckingAdmission, setIsCheckingAdmission] = useState(false);
  const [isAdmissionValid, setIsAdmissionValid] = useState(false);
  const [admissionChecked, setAdmissionChecked] = useState(false);
  
  // State to track if email has been validated
  const [emailValidated, setEmailValidated] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when typing
    if (error) setError('');
    
    // Reset admission validation when admission number changes
    if (name === 'admissionNumber') {
      setAdmissionChecked(false);
      setIsAdmissionValid(false);
    }
    
    // Reset email validation when email changes
    if (name === 'email') {
      setEmailValidated(false);
    }
  };

  // Function to check if admission number exists in database
  const checkAdmissionNumber = async () => {
    if (!formData.admissionNumber) {
      setError('Please enter your admission number');
      return false;
    }
    
    setIsCheckingAdmission(true);
    
    try {
      // Make real API call to check admission number
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/student/check-admission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          admissionNumber: formData.admissionNumber
        })
      });
      
      const data = await response.json();
      
      const isValid = data.success;
      setIsAdmissionValid(isValid);
      setAdmissionChecked(true);
      
      if (!isValid) {
        setError(data.message || 'Invalid admission number. Please check with your school administrator.');
      } else {
        setError('');
        setSuccess('Admission number verified successfully!');
        
        // If we have class and section data from the API, auto-fill them
        if (data.data) {
          setFormData(prev => ({
            ...prev,
            className: data.data.className || prev.className,
            section: data.data.section || prev.section,
          }));
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      }
      
      setIsCheckingAdmission(false);
      return isValid;
    } catch (err) {
      setError('Error verifying admission number. Please try again.');
      setIsCheckingAdmission(false);
      return false;
    }
  };

  const validateCurrentStep = (): boolean => {
    // Step 1 validation: Email
    if (currentStep === 1) {
      if (!formData.email) {
        setError('Please enter your email address');
        return false;
      }
      
      // Email validation
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
      
      setEmailValidated(true);
      return true;
    }
    
    // Step 2 validation: Personal info
    if (currentStep === 2) {
      if (!formData.name) {
        setError('Please enter your name');
        return false;
      }
    }
    
    // Step 3 validation: School info
    if (currentStep === 3) {
      if (!formData.admissionNumber) {
        setError('Please enter your admission number');
        return false;
      }
      
      if (!admissionChecked || !isAdmissionValid) {
        setError('Please verify your admission number first');
        return false;
      }
      
      if (!formData.grade || !formData.section || !formData.school) {
        setError('Please fill in all school information');
        return false;
      }
    }
    
    // Step 4 validation: Password
    if (currentStep === 4) {
      if (!formData.password || !formData.confirmPassword) {
        setError('Please create a password');
        return false;
      }
      
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      // If email is validated in step 1, show the IdForm directly
      if (currentStep === 1 && emailValidated) {
        // Set a success message
        setSuccess('Email verified! Please complete your profile.');
        
        // Show ID form after a short delay
        setTimeout(() => {
          setShowIdForm(true);
        }, 800);
        
        return;
      }
      
      // Otherwise proceed with normal step progression
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Real API call for registration using the new endpoint
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/student/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          admissionNumber: formData.admissionNumber,
          name: formData.name,
          className: formData.className || formData.grade,
          section: formData.section,
          school: formData.school,
          rollNumber: formData.rollNumber,
          mobileNumber: formData.mobileNumber || '' // You may need to add this to your form
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Store token and user data from response
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('role', 'student');
      localStorage.setItem('userData', JSON.stringify(data.data.user));
      
      // Success message
      setSuccess('Account created successfully! Please complete your student profile.');
      setIsLoading(false);
      
      // Show ID form popup after a short delay
      setTimeout(() => {
        setShowIdForm(true);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration. Please try again.');
      console.error('Registration error:', err);
      setIsLoading(false);
    }
  };

  // Handle completion of ID form
  const handleIdFormComplete = (idFormData: any) => {
    // Find the school name based on the selected school ID
    const selectedSchool = SCHOOLS.find(school => school.id === formData.school);
    const schoolName = selectedSchool ? selectedSchool.name : idFormData.school || '';
    
    // Store user data
    const mockToken = `student-token-${Date.now()}`;
    const mockUserData = {
      id: Math.floor(Math.random() * 1000),
      name: formData.name || idFormData.name,
      email: formData.email,
      class: formData.className || formData.grade || idFormData.class_,
      section: formData.section || idFormData.section,
      rollNumber: formData.rollNumber || formData.admissionNumber || idFormData.student_id,
      // Include additional data from ID form
      age: idFormData.age,
      hobbies: idFormData.hobbies,
      aim_of_life: idFormData.aim_of_life,
      school: schoolName
    };
    
    localStorage.setItem('token', mockToken);
    localStorage.setItem('role', 'student');
    localStorage.setItem('userData', JSON.stringify(mockUserData));
    
    setRegistrationComplete(true);
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      window.location.href = '/student/dashboard';
    }, 1500);
  };

  // Progress indicator
  const getStepProgress = () => {
    return (currentStep / 4) * 100;
  };

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  // Available grade options
  const gradeOptions = [
    'Kindergarten',
    '1st Grade',
    '2nd Grade',
    '3rd Grade',
    '4th Grade',
    '5th Grade',
    '6th Grade',
    '7th Grade',
    '8th Grade',
    '9th Grade',
    '10th Grade',
    '11th Grade',
    '12th Grade'
  ];

  // Available section options
  const sectionOptions = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Student Registration</h2>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div 
              className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${getStepProgress()}%` }}
            ></div>
          </div>
          
          {/* Step indicator */}
          <div className="flex justify-between text-xs text-gray-500 mb-6">
            <span className={currentStep >= 1 ? "text-green-600 font-medium" : ""}>Email</span>
            <span className={currentStep >= 2 ? "text-green-600 font-medium" : ""}>Personal</span>
            <span className={currentStep >= 3 ? "text-green-600 font-medium" : ""}>School</span>
            <span className={currentStep >= 4 ? "text-green-600 font-medium" : ""}>Security</span>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center"
            >
              <FiAlertCircle className="mr-2" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center"
            >
              <FiCheck className="mr-2" />
              <span>{success}</span>
            </motion.div>
          )}

          {registrationComplete && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center"
            >
              <FiCheck className="mr-2" />
              <span>Registration complete! Redirecting to dashboard...</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1: Email */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={pageVariants}
                  initial="initial"
                  animate="in"
                  exit="out"
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Please enter your email address to begin the registration process.
                    </p>
                    
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                      Email Address
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
                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <p className="mt-2 text-xs text-green-600">
                      Enter your email to proceed directly to profile creation.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Personal Information */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  variants={pageVariants}
                  initial="initial"
                  animate="in"
                  exit="out"
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <FiUser />
                      </span>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: School Information */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  variants={pageVariants}
                  initial="initial"
                  animate="in"
                  exit="out"
                  transition={{ duration: 0.3 }}
                >
                  {/* Admission Number Section */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="admissionNumber">
                      Admission Number
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          <FiBook />
                        </span>
                        <input
                          id="admissionNumber"
                          name="admissionNumber"
                          type="text"
                          value={formData.admissionNumber}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                            admissionChecked 
                              ? isAdmissionValid 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-red-500 bg-red-50'
                              : 'border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-green-500`}
                          placeholder="Your admission number"
                          disabled={isCheckingAdmission}
                        />
                        {admissionChecked && isAdmissionValid && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500">
                            <FiCheck />
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={checkAdmissionNumber}
                        disabled={isCheckingAdmission || !formData.admissionNumber}
                        className={`px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300 ${
                          isCheckingAdmission
                            ? 'bg-gray-400 cursor-not-allowed'
                            : !formData.admissionNumber
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {isCheckingAdmission ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Checking...
                          </span>
                        ) : (
                          'Verify'
                        )}
                      </button>
                    </div>
                    {admissionChecked && isAdmissionValid && (
                      <p className="mt-2 text-xs text-green-600">
                        Admission number verified successfully!
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      For demo purposes, try using one of these admission numbers: AD12345, AD67890, AD11111
                    </p>
                  </div>

                  {/* Show these fields only if admission number is validated */}
                  <AnimatePresence>
                    {isAdmissionValid && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* School Selection Dropdown */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="school">
                            Select Your School
                          </label>
                          <select
                            id="school"
                            name="school"
                            value={formData.school}
                            onChange={handleChange}
                            className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Select your school</option>
                            {SCHOOLS.map((school) => (
                              <option key={school.id} value={school.id}>
                                {school.name}
                              </option>
                            ))}
                          </select>
                          <p className="mt-2 text-xs text-gray-500">
                            Please select the school you are currently enrolled in.
                          </p>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="grade">
                            Grade
                          </label>
                          <select
                            id="grade"
                            name="grade"
                            value={formData.grade}
                            onChange={handleChange}
                            className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Select your grade</option>
                            {gradeOptions.map((grade) => (
                              <option key={grade} value={grade}>
                                {grade}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="section">
                            Section
                          </label>
                          <select
                            id="section"
                            name="section"
                            value={formData.section}
                            onChange={handleChange}
                            className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Select your section</option>
                            {sectionOptions.map((section) => (
                              <option key={section} value={section}>
                                Section {section}
                              </option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Step 4: Password */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  variants={pageVariants}
                  initial="initial"
                  animate="in"
                  exit="out"
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                      Create Password
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
                        className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Create a secure password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters</p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <FiLock />
                      </span>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 mt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-300"
                >
                  Back
                </button>
              )}
              
              {currentStep === 1 && (
                <Link
                  to="/auth"
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-300 flex items-center justify-center"
                >
                  <FiArrowLeft className="mr-2" />
                  Cancel
                </Link>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
                >
                  {currentStep === 1 ? 'Continue' : 'Next'}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>

      {/* ID Form Modal */}
      <IdForm 
        isOpen={showIdForm}
        onClose={() => setShowIdForm(false)}
        onComplete={handleIdFormComplete}
        initialData={{
          name: formData.name,
          age: "",
          gender: "",
          hobbies: "",
          aim_of_life: "",
          location: "",
          city: formData.presentCity || "",
          state: formData.presentState || "",
          country: "India",
          ethnicity: ""
        }}
      />
    </div>
  );
};

export default StudentSignup; 