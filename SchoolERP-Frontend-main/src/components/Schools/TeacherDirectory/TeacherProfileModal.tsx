import React, { useRef } from 'react';
import { Teacher } from './types';
import { motion } from 'framer-motion';
import { Mail, Phone, Calendar, MapPin, XCircle, Printer, Download, BookOpen, GraduationCap, Award } from 'lucide-react';

interface TeacherProfileModalProps {
  selectedTeacher: Teacher;
  setIsProfileOpen: (isOpen: boolean) => void;
}

const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  selectedTeacher,
  setIsProfileOpen,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Close modal when clicking outside
  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setIsProfileOpen(false);
    }
  };
  
  // Print teacher profile
  const handlePrint = () => {
    const printContents = document.getElementById('teacher-profile-content')?.innerHTML;
    if (printContents) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="text-align: center; margin-bottom: 20px;">Teacher Profile</h1>
          ${printContents}
        </div>
      `;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  // Download teacher profile as PDF
  const handleDownload = () => {
    alert('PDF download functionality will be implemented with a PDF library');
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleClickOutside}
    >
      <motion.div
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header with action buttons */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Teacher Profile
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-150"
              title="Print profile"
            >
              <Printer className="h-5 w-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-150"
              title="Download as PDF"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsProfileOpen(false)}
              className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-150"
              title="Close"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Content for printing/display */}
        <div id="teacher-profile-content" className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column - Profile Image */}
            <div className="md:w-1/3 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-indigo-100 shadow-md">
                <img 
                  src={selectedTeacher.profileImage || 'https://via.placeholder.com/150?text=No+Image'} 
                  alt={selectedTeacher.fullName} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image';
                  }}
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">
                {selectedTeacher.fullName}
              </h3>
              <p className="text-blue-600 font-medium text-center mb-2">
                {selectedTeacher.designation}
              </p>
              
              {/* Status badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                Active
              </div>
            </div>
            
            {/* Right Column - Details */}
            <div className="md:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Subjects */}
                <div className="bg-gray-50 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center mb-2">
                    <BookOpen className="h-4 w-4 text-blue-600 mr-2" />
                    <p className="text-xs text-gray-500 uppercase font-semibold">Subjects</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedTeacher.subjects.map((subject, index) => (
                      <span 
                        key={index} 
                        className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs border border-blue-100"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Email */}
                <div className="bg-gray-50 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center mb-2">
                    <Mail className="h-4 w-4 text-blue-600 mr-2" />
                    <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedTeacher.email}
                  </p>
                </div>
                
                {/* Phone */}
                <div className="bg-gray-50 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center mb-2">
                    <Phone className="h-4 w-4 text-blue-600 mr-2" />
                    <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedTeacher.phone}
                  </p>
                </div>
                
                {/* Join Date */}
                <div className="bg-gray-50 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                    <p className="text-xs text-gray-500 uppercase font-semibold">Join Date</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedTeacher.joinDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                {/* Class Incharge Details */}
                {selectedTeacher.isClassIncharge && (
                  <div className="bg-gray-50 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 col-span-2">
                    <div className="flex items-center mb-2">
                      <Award className="h-4 w-4 text-blue-600 mr-2" />
                      <p className="text-xs text-gray-500 uppercase font-semibold">Class Incharge</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <div className="font-medium text-blue-700">
                        Class {selectedTeacher.inchargeClass}, Section {selectedTeacher.inchargeSection}
                      </div>
                    </div>
                  </div>
                )}

                {/* Teaching Classes & Sections */}
                <div className="bg-gray-50 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 col-span-2">
                  <div className="flex items-center mb-2">
                    <BookOpen className="h-4 w-4 text-blue-600 mr-2" />
                    <p className="text-xs text-gray-500 uppercase font-semibold">Teaching Classes & Sections</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedTeacher.sections.map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded border border-blue-100">
                        <div className="font-medium text-blue-700">Class {item.class}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Sections: {item.sections.map(section => (
                            <span 
                              key={section} 
                              className="inline-block bg-gray-100 px-2 py-1 rounded-full text-xs mr-1 mb-1"
                            >
                              {section}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="bg-gray-50 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center mb-2">
                    <Award className="h-4 w-4 text-blue-600 mr-2" />
                    <p className="text-xs text-gray-500 uppercase font-semibold">Experience</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedTeacher.experience}
                  </p>
                </div>

                {/* Education */}
                <div className="bg-gray-50 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center mb-2">
                    <GraduationCap className="h-4 w-4 text-blue-600 mr-2" />
                    <p className="text-xs text-gray-500 uppercase font-semibold">Education</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedTeacher.education}
                  </p>
                </div>
                
                {/* Address */}
                <div className="bg-gray-50 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 col-span-2">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                    <p className="text-xs text-gray-500 uppercase font-semibold">Address</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedTeacher.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end rounded-b-lg">
          <button
            onClick={() => setIsProfileOpen(false)}
            className="px-6 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-150"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TeacherProfileModal;