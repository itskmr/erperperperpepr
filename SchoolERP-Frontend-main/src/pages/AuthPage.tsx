import React, { useState } from 'react';
import LoginForm from '../pages/LoginForm';
import SignupForm from '../pages/SignUpForm';

interface AuthPageProps {
  onAuthSuccess: (token: string, role: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);

  // Handle login success with role
  const handleLoginSuccess = (token: string, role: string) => {
    onAuthSuccess(token, role);
  };

  // Handle signup success (adapting to include role)
  const handleSignupSuccess = (token: string, role: string) => {
    onAuthSuccess(token, role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex">
            <button
              className={`w-1/2 py-4 text-sm font-medium ${
                isLogin
                  ? 'text-white bg-blue-600'
                  : 'text-gray-500 bg-gray-50 hover:text-gray-700'
              } transition-all duration-300`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`w-1/2 py-4 text-sm font-medium ${
                !isLogin
                  ? 'text-white bg-blue-600'
                  : 'text-gray-500 bg-gray-50 hover:text-gray-700'
              } transition-all duration-300`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>
          
          <div className="p-6">
            {isLogin ? (
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            ) : (
              <SignupForm onSignupSuccess={handleSignupSuccess} />
            )}
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-white">
          <p>© {new Date().getFullYear()} School Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;