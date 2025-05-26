import React, { useRef } from 'react';
import { Teacher } from './types';
import { motion } from 'framer-motion';
import { 
  Mail, Phone, MapPin, XCircle, Printer, Download, 
  BookOpen, Award, User2, Briefcase, FileText, Banknote, Clock
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface TeacherProfileModalProps {
  selectedTeacher: Teacher;
  setIsProfileOpen: (isOpen: boolean) => void;
}

const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  selectedTeacher,
  setIsProfileOpen
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setIsProfileOpen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const content = document.getElementById('teacher-profile-content');
      if (!content) return;

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${selectedTeacher.fullName.replace(/\s+/g, '_')}_profile.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
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
            {/* Left Column - Profile Image and Basic Info */}
            <div className="md:w-1/3 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-indigo-100 shadow-md">
                <img
                  src={selectedTeacher.profileImage || 'https://placehold.co/150x150/e2e8f0/475569?text=No+Image'}
                  alt={selectedTeacher.fullName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/150x150/e2e8f0/475569?text=No+Image';
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
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                selectedTeacher.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <span className={`h-2 w-2 rounded-full ${
                  selectedTeacher.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                } mr-2`}></span>
                {selectedTeacher.status || 'Active'}
              </div>

              {/* Basic Info */}
              <div className="w-full mt-6 space-y-4">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm">{selectedTeacher.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm">{selectedTeacher.phone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User2 className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm">{selectedTeacher.username}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm">
                    Joined: {new Date(selectedTeacher.joining_year || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Right Column - Details */}
            <div className="md:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Professional Information */}
                <div className="bg-gray-50 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 col-span-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-blue-600" />
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Qualification</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTeacher.qualification}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Experience</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTeacher.experience}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Subjects</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedTeacher.subjects?.map((subject, index) => (
                          <span 
                            key={index} 
                            className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teaching Assignments */}
                <div className="bg-gray-50 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 col-span-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                    Teaching Assignments
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedTeacher.sections?.map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded border border-blue-100">
                        <div className="font-medium text-blue-700">Class {item.class}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Sections: {item.sections.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedTeacher.isClassIncharge && (
                    <div className="mt-4 bg-blue-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-blue-800">
                        Class Incharge: Class {selectedTeacher.inchargeClass}, Section {selectedTeacher.inchargeSection}
                      </p>
                    </div>
                  )}
                </div>

                {/* Personal Information */}
                <div className="bg-gray-50 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <User2 className="h-4 w-4 mr-2 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedTeacher.dateOfBirth ? new Date(selectedTeacher.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Gender</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTeacher.gender}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Blood Group</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTeacher.bloodGroup}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Religion</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTeacher.religion}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Marital Status</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTeacher.maritalStatus}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Address</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTeacher.address}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Social Media</p>
                      <div className="space-y-1">
                        {selectedTeacher.facebook && (
                          <a href={selectedTeacher.facebook} target="_blank" rel="noopener noreferrer" 
                             className="text-sm text-blue-600 hover:underline block">Facebook</a>
                        )}
                        {selectedTeacher.twitter && (
                          <a href={selectedTeacher.twitter} target="_blank" rel="noopener noreferrer"
                             className="text-sm text-blue-600 hover:underline block">Twitter</a>
                        )}
                        {selectedTeacher.linkedIn && (
                          <a href={selectedTeacher.linkedIn} target="_blank" rel="noopener noreferrer"
                             className="text-sm text-blue-600 hover:underline block">LinkedIn</a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banking Information */}
                <div className="bg-gray-50 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 col-span-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Banknote className="h-4 w-4 mr-2 text-blue-600" />
                    Banking Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Account Holder Name</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTeacher.accountHolderName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Account Number</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTeacher.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Bank Name</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTeacher.bankName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Bank Branch</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTeacher.bankBranch}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Joining Salary</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedTeacher.joiningSalary ? `₹${selectedTeacher.joiningSalary.toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                {selectedTeacher.documents && selectedTeacher.documents.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 col-span-2">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-600" />
                      Documents
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedTeacher.documents.map((doc, index) => (
                        <a
                          key={index}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white p-3 rounded border border-blue-100 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm text-blue-600">Document {index + 1}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
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