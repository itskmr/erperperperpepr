import React from 'react';
import { motion } from 'framer-motion';

interface SuccessNotificationProps {
  message: string;
  onClose: () => void;
  visible: boolean;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({ message, onClose, visible }) => {
  if (!visible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 bg-green-50 border-l-4 border-green-500"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex justify-between items-center w-full">
          <p className="text-sm text-green-700">{message}</p>
          <button 
            onClick={onClose}
            className="ml-4 text-green-700 hover:text-green-900"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SuccessNotification;