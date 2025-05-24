import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiBook, FiPhone, FiCalendar, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface SignupFormProps {
  onSignupSuccess: (token: string, role: string) => void;
  role: 'parent' | 'student';
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  // Student-specific fields
  isInSchool?: boolean;
  schoolName?: string;
  admissionNumber?: string;
  grade?: string;
  section?: string;
  // Parent-specific fields
  phone?: string;
  childName?: string;
  relation?: string;
}

const SCHOOLS = [
  { id: 'jpis', name: 'JPIS - Jayshree Periwal International School' }
];

const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess, role }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Initialize role-specific fields with empty values
    isInSchool: true,
    schoolName: 'jpis',
    admissionNumber: '',
    grade: '',
    section: '',
    phone: '',
    childName: '',
    relation: 'parent'
  });
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [signupError, setSignupError] = useState<string>('');
  const [formStep, setFormStep] = useState<number>(1);
  const totalSteps = 2;

  const validateCurrentStep = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (formStep === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }

      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (formStep === 2 && role === 'student') {
      // Only validate these for in-school students
      if (formData.isInSchool) {
        if (!formData.schoolName) {
          newErrors.schoolName = 'School name is required';
        }
        
        if (!formData.admissionNumber) {
          newErrors.admissionNumber = 'Admission number is required';
        }
        
        if (!formData.grade) {
          newErrors.grade = 'Grade/Class is required';
        }
      }
    } else if (formStep === 2 && role === 'parent') {
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
      
      if (!formData.childName) {
        newErrors.childName = 'Child\'s name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear signup error when user types
    if (signupError) {
      setSignupError('');
    }
  };

  const handleToggleChange = (name: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setFormStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setFormStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (formStep < totalSteps) {
      nextStep();
      return;
    }

    if (!validateCurrentStep()) return;

    setIsLoading(true);
    setSignupError('');

    try {
      // This is where you'd make an API call to your backend
      // For demo purposes, we'll simulate a successful signup after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate registration
      // In a real app, you would send the role-specific data to the server
      // Generate mock token after successful registration
      const mockToken = `auth_${Math.random().toString(36).substring(2)}`;
      
      // Pass the role back to the parent component
      onSignupSuccess(mockToken, role);
    } catch (error) {
      console.error('Signup failed', error);
      setSignupError('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render student-specific fields
  const renderStudentFields = () => {
    return (
      <>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">School Status</label>
          <div className="flex w-full">
            <button
              type="button"
              onClick={() => handleToggleChange('isInSchool', true)}
              className={`flex-1 py-2 px-4 rounded-l-lg border ${
                formData.isInSchool 
                  ? 'bg-amber-600 text-white border-amber-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              } transition-colors duration-200`}
            >
              In School
            </button>
            <button
              type="button"
              onClick={() => handleToggleChange('isInSchool', false)}
              className={`flex-1 py-2 px-4 rounded-r-lg border ${
                !formData.isInSchool 
                  ? 'bg-amber-600 text-white border-amber-600' 
                  : 'bg-white text-gray-700 border-gray-300'
              } transition-colors duration-200`}
            >
              Out of School
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {formData.isInSchool ? (
            <motion.div
              key="in-school-fields"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="schoolName">
                  School
                </label>
                <select
                  id="schoolName"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  className={`w-full pl-3 pr-3 py-2 rounded-lg border ${
                    errors.schoolName ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                >
                  <option value="">Select School</option>
                  {SCHOOLS.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
                {errors.schoolName && <p className="mt-1 text-sm text-red-600">{errors.schoolName}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="admissionNumber">
                  Admission Number
                </label>
                <div className="relative">
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
                      errors.admissionNumber ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    placeholder="e.g., STU20230001"
                  />
                </div>
                {errors.admissionNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.admissionNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="grade">
                    Grade/Class
                  </label>
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className={`w-full pl-3 pr-3 py-2 rounded-lg border ${
                      errors.grade ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  >
                    <option value="">Select Grade</option>
                    <option value="1">Grade 1</option>
                    <option value="2">Grade 2</option>
                    <option value="3">Grade 3</option>
                    <option value="4">Grade 4</option>
                    <option value="5">Grade 5</option>
                    <option value="6">Grade 6</option>
                    <option value="7">Grade 7</option>
                    <option value="8">Grade 8</option>
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                  {errors.grade && <p className="mt-1 text-sm text-red-600">{errors.grade}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="section">
                    Section
                  </label>
                  <select
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className="w-full pl-3 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select Section</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="out-school-message"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md"
            >
              <p className="text-sm text-blue-800">
                As an out-of-school student, you'll have access to our learning platform with limited features.
                You can upgrade your account later by providing your school information.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  };

  // Render parent-specific fields
  const renderParentFields = () => {
    return (
      <>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
            Phone Number
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              <FiPhone />
            </span>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-pink-500`}
              placeholder="(123) 456-7890"
            />
          </div>
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="childName">
            Child's Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              <FiUser />
            </span>
            <input
              id="childName"
              name="childName"
              type="text"
              value={formData.childName}
              onChange={handleChange}
              className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                errors.childName ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-pink-500`}
              placeholder="Child's full name"
            />
          </div>
          {errors.childName && <p className="mt-1 text-sm text-red-600">{errors.childName}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="relation">
            Relation to Child
          </label>
          <select
            id="relation"
            name="relation"
            value={formData.relation}
            onChange={handleChange}
            className="w-full pl-3 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="parent">Parent</option>
            <option value="guardian">Guardian</option>
            <option value="grandparent">Grandparent</option>
            <option value="other">Other</option>
          </select>
        </div>
      </>
    );
  };

  // Progress bar component
  const ProgressBar = () => (
    <div className="w-full mb-6">
      <div className="flex justify-between mb-1">
        <div className="text-xs text-gray-500">Step {formStep} of {totalSteps}</div>
        <div className="text-xs text-gray-500">{Math.round((formStep / totalSteps) * 100)}%</div>
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <motion.div
          className={`h-full rounded-full ${role === 'student' ? 'bg-amber-600' : 'bg-pink-600'}`}
          initial={{ width: 0 }}
          animate={{ width: `${(formStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );

  const stepIndicator = () => {
    return (
      <div className="flex justify-center mb-6">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`rounded-full transition-colors flex items-center justify-center w-8 h-8 ${
                formStep > index
                  ? role === 'student'
                    ? 'bg-amber-600 text-white'
                    : 'bg-pink-600 text-white'
                  : formStep === index + 1
                  ? role === 'student'
                    ? 'bg-amber-100 text-amber-800 border border-amber-600'
                    : 'bg-pink-100 text-pink-800 border border-pink-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {formStep > index ? <FiCheck /> : index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`w-10 h-1 ${
                  formStep > index + 1
                    ? role === 'student'
                      ? 'bg-amber-600'
                      : 'bg-pink-600'
                    : 'bg-gray-200'
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto"
    >
      {stepIndicator()}
      <ProgressBar />

      {signupError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
        >
          {signupError}
        </motion.div>
      )}

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {formStep === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
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
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-${role === 'student' ? 'amber' : 'pink'}-500`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="signup-email">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <FiMail />
                  </span>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-${role === 'student' ? 'amber' : 'pink'}-500`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="signup-password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <FiLock />
                  </span>
                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-2 rounded-lg border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-${role === 'student' ? 'amber' : 'pink'}-500`}
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
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters long.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirm-password">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <FiLock />
                  </span>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-${role === 'student' ? 'amber' : 'pink'}-500`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {role === 'student' ? renderStudentFields() : renderParentFields()}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 mt-6">
          {formStep > 1 && (
            <motion.button
              type="button"
              onClick={prevStep}
              className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-300`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back
            </motion.button>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            className={`flex-1 ${
              role === 'student' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-pink-600 hover:bg-pink-700'
            } text-white py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {formStep < totalSteps ? 'Saving...' : 'Creating account...'}
              </span>
            ) : (
              formStep < totalSteps ? 'Continue' : 'Create Account'
            )}
          </motion.button>
        </div>
      </form>

      <p className="mt-4 text-center text-xs text-gray-600">
        By signing up, you agree to our{' '}
        <a href="#" className={`font-medium ${role === 'student' ? 'text-amber-600 hover:text-amber-500' : 'text-pink-600 hover:text-pink-500'}`}>
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className={`font-medium ${role === 'student' ? 'text-amber-600 hover:text-amber-500' : 'text-pink-600 hover:text-pink-500'}`}>
          Privacy Policy
        </a>
        .
      </p>
    </motion.div>
  );
};

export default SignupForm;