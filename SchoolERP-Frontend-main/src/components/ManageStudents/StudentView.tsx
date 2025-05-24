import React from 'react';
import { StudentFormData } from '../StudentForm/StudentFormTypes';

interface StudentViewProps {
  student: StudentFormData | null;
  onClose: () => void;
  isOpen: boolean;
}

export const StudentView: React.FC<StudentViewProps> = ({ 
  student, 
  onClose,
  isOpen
}) => {
  if (!isOpen || !student) return null;

  // Add function to copy studentId to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Student ID copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">
              Student Information: {student.fullName}
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Student ID and basic information */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Admission No</p>
                <p className="text-base font-semibold">{student.admissionNo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Class & Section</p>
                <p className="text-base font-semibold">{student.className} {student.section}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Registration Date</p>
                <p className="text-base font-semibold">{new Date(student.admissionDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Main content sections */}
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div className="border rounded-lg p-4">
              <h4 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Personal Information</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Name</p>
                    <p>{student.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p>{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gender</p>
                    <p>{student.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Blood Group</p>
                    <p>{student.bloodGroup || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Religion</p>
                    <p>{student.religion || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <p>{student.category || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Mobile Number</p>
                    <p>{student.mobileNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{student.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="border rounded-lg p-4">
              <h4 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Parent Information</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Father's Name</p>
                  <p>{student.father?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Father's Contact</p>
                  <p>{student.father?.contactNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Mother's Name</p>
                  <p>{student.mother?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Mother's Contact</p>
                  <p>{student.mother?.contactNumber || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border rounded-lg p-4">
              <h4 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Address Information</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Present Address</p>
                  <p>
                    {[
                      student.address?.houseNo,
                      student.address?.street,
                      student.address?.city,
                      student.address?.state,
                      student.address?.pinCode
                    ].filter(Boolean).join(', ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Permanent Address</p>
                  <p>
                    {[
                      student.address?.permanentHouseNo,
                      student.address?.permanentStreet,
                      student.address?.permanentCity,
                      student.address?.permanentState,
                      student.address?.permanentPinCode
                    ].filter(Boolean).join(', ') || 'Same as Present Address'}
                  </p>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="border rounded-lg p-4">
              <h4 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Academic Information</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Admission Date</p>
                    <p>{student.admissionDate || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Class</p>
                    <p>{student.className}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Section</p>
                    <p>{student.section || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Roll Number</p>
                    <p>{student.rollNumber || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Previous School</p>
                    <p>{student.previousSchool || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Registration Number</p>
                    <p>{student.academic?.registrationNo || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with close button */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentView; 