import React from 'react';
import { X, User, Phone, Calendar, Award, CreditCard, Printer } from 'lucide-react';
import { DriverProfileModalProps } from './types';
import { generateDriverPDF } from '../../../utils/printUtils';

const DriverProfileModal: React.FC<DriverProfileModalProps> = ({
  selectedDriver,
  setIsProfileOpen,
}) => {
  const handlePrint = async () => {
    try {
      await generateDriverPDF(selectedDriver);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">Driver Profile</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-200"
              title="Print Driver Profile"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={() => setIsProfileOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Header Section with Photo */}
          <div className="flex items-center mb-6 pb-6 border-b">
            <div className="flex-shrink-0 mr-6">
              {selectedDriver.photo ? (
                <img
                  src={selectedDriver.photo}
                  alt={selectedDriver.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-blue-100">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedDriver.name}</h3>
              <div className="flex items-center space-x-4">
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedDriver.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedDriver.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-gray-500">
                  {selectedDriver.experience} years experience
                </span>
                {selectedDriver.age && (
                  <span className="text-gray-500">
                    Age: {selectedDriver.age} years
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Personal Information
              </h4>
              <div className="space-y-3">
                {selectedDriver.dateOfBirth && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-gray-900">{new Date(selectedDriver.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedDriver.gender && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-gray-900">{selectedDriver.gender}</p>
                  </div>
                )}
                {selectedDriver.maritalStatus && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Marital Status</label>
                    <p className="text-gray-900">{selectedDriver.maritalStatus}</p>
                  </div>
                )}
                {selectedDriver.bloodGroup && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Blood Group</label>
                    <p className="text-gray-900">{selectedDriver.bloodGroup}</p>
                  </div>
                )}
                {selectedDriver.qualification && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Qualification</label>
                    <p className="text-gray-900">{selectedDriver.qualification}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-blue-600" />
                Contact Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-gray-900">{selectedDriver.contactNumber}</p>
                </div>
                {selectedDriver.emergencyContact && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                    <p className="text-gray-900">{selectedDriver.emergencyContact}</p>
                  </div>
                )}
                {selectedDriver.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900">{selectedDriver.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* License Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                License Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">License Number</label>
                  <p className="text-gray-900">{selectedDriver.licenseNumber || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" />
                Professional Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Experience</label>
                  <p className="text-gray-900">{selectedDriver.experience} years</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Joining Date</label>
                  <p className="text-gray-900">
                    {new Date(selectedDriver.joiningDate).toLocaleDateString()}
                  </p>
                </div>
                {selectedDriver.salary && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Monthly Salary</label>
                    <p className="text-gray-900">₹{selectedDriver.salary.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                System Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Driver ID</label>
                  <p className="text-gray-900 font-mono text-sm">{selectedDriver.id}</p>
                </div>
                {selectedDriver.createdAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="text-gray-900">
                      {new Date(selectedDriver.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedDriver.updatedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-gray-900">
                      {new Date(selectedDriver.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-6 pt-4 border-t space-x-3">
            <button
              onClick={handlePrint}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print PDF
            </button>
            <button
              onClick={() => setIsProfileOpen(false)}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfileModal; 