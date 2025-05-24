import React from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiKey, FiUser } from 'react-icons/fi';

interface ParentLoginFieldsProps {
  formData: {
    email: string;
    password: string;
    confirmPassword?: string;
    invitationKey?: string;
    admissionNo?: string;
  };
  errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    invitationKey?: string;
    admissionNo?: string;
  };
  showPassword: boolean;
  showConfirmPassword?: boolean;
  step: 'invitation' | 'admission' | 'email' | 'password' | 'confirm';
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  togglePasswordVisibility: () => void;
  toggleConfirmPasswordVisibility?: () => void;
}

const ParentLoginFields: React.FC<ParentLoginFieldsProps> = ({
  formData,
  errors,
  showPassword,
  showConfirmPassword,
  step,
  handleChange,
  togglePasswordVisibility,
  toggleConfirmPasswordVisibility
}) => {
  if (step === 'invitation') {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="invitationKey">
          Invitation Link
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <FiKey />
          </span>
          <input
            id="invitationKey"
            name="invitationKey"
            type="text"
            value={formData.invitationKey || ''}
            onChange={handleChange}
            className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
              errors.invitationKey ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-pink-500`}
            placeholder="Enter your invitation code"
          />
        </div>
        {errors.invitationKey && <p className="mt-1 text-sm text-red-600">{errors.invitationKey}</p>}
      </div>
    );
  }

  if (step === 'admission') {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="admissionNo">
          Student's Admission Number
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <FiUser />
          </span>
          <input
            id="admissionNo"
            name="admissionNo"
            type="text"
            value={formData.admissionNo || ''}
            onChange={handleChange}
            className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
              errors.admissionNo ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-pink-500`}
            placeholder="Enter your child's admission number"
          />
        </div>
        {errors.admissionNo && <p className="mt-1 text-sm text-red-600">{errors.admissionNo}</p>}
      </div>
    );
  }

  if (step === 'email') {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
          Parent Email
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
            className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-pink-500`}
            placeholder="parent@example.com"
          />
        </div>
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>
    );
  }

  if (step === 'password') {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700" htmlFor="password">
            Password
          </label>
          <a href="#" className="text-sm text-pink-600 hover:text-pink-800">
            Forgot password?
          </a>
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
            } focus:outline-none focus:ring-2 focus:ring-pink-500`}
            placeholder="Create a secure password"
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
    );
  }

  if (step === 'confirm') {
    return (
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
            value={formData.confirmPassword || ''}
            onChange={handleChange}
            className={`w-full pl-10 pr-10 py-2 rounded-lg border ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-pink-500`}
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
          >
            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
      </div>
    );
  }

  return null;
};

export default ParentLoginFields; 