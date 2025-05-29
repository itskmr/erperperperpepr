import React from 'react';
import { X, Truck, Calendar, Settings, User, FileText, Fuel, Printer } from 'lucide-react';
import { VehicleProfileModalProps } from './types';
import { generateVehiclePDF } from '../../../utils/printUtils';

const VehicleProfileModal: React.FC<VehicleProfileModalProps> = ({
  selectedVehicle,
  setIsProfileOpen,
}) => {
  const handlePrint = async () => {
    try {
      // Transform the selectedVehicle to match the expected format
      const vehicleForPrint = {
        ...selectedVehicle,
        vehicleName: selectedVehicle.make || selectedVehicle.vehicleName || 'Unknown Vehicle'
      };
      await generateVehiclePDF(vehicleForPrint);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">Vehicle Profile</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-200"
              title="Print Vehicle Profile"
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
          {/* Header Section */}
          <div className="flex items-center mb-6 pb-6 border-b">
            <div className="flex-shrink-0 mr-6">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200">
                <Truck className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedVehicle.make} {selectedVehicle.model}
              </h3>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold text-gray-700">
                  {selectedVehicle.registrationNumber}
                </span>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedVehicle.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : selectedVehicle.status === 'MAINTENANCE'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedVehicle.status}
                </span>
                <span className="text-gray-500">
                  {selectedVehicle.capacity} seats
                </span>
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Registration Number</label>
                  <p className="text-gray-900">{selectedVehicle.registrationNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Make & Model</label>
                  <p className="text-gray-900">{selectedVehicle.make} {selectedVehicle.model}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Capacity</label>
                  <p className="text-gray-900">{selectedVehicle.capacity} seats</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fuel Type</label>
                  <p className="text-gray-900">{selectedVehicle.fuelType || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Driver Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Driver Information
              </h4>
              <div className="space-y-3">
                {selectedVehicle.driver ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Driver Name</label>
                      <p className="text-gray-900">{selectedVehicle.driver.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contact Number</label>
                      <p className="text-gray-900">{selectedVehicle.driver.contactNumber}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">No driver assigned</p>
                )}
              </div>
            </div>

            {/* Maintenance Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                Maintenance Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Odometer</label>
                  <p className="text-gray-900">{selectedVehicle.currentOdometer} KM</p>
                </div>
                {selectedVehicle.lastMaintenanceDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Maintenance</label>
                    <p className="text-gray-900">
                      {new Date(selectedVehicle.lastMaintenanceDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedVehicle.lastInspectionDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Inspection</label>
                    <p className="text-gray-900">
                      {new Date(selectedVehicle.lastInspectionDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Important Dates */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Important Dates
              </h4>
              <div className="space-y-3">
                {selectedVehicle.purchaseDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Purchase Date</label>
                    <p className="text-gray-900">
                      {new Date(selectedVehicle.purchaseDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedVehicle.insuranceExpiryDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Insurance Expiry</label>
                    <p className={`${
                      new Date(selectedVehicle.insuranceExpiryDate) < new Date() 
                        ? 'text-red-600 font-semibold' 
                        : 'text-gray-900'
                    }`}>
                      {new Date(selectedVehicle.insuranceExpiryDate).toLocaleDateString()}
                      {new Date(selectedVehicle.insuranceExpiryDate) < new Date() && ' (Expired)'}
                    </p>
                  </div>
                )}
                {selectedVehicle.createdAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Added to System</label>
                    <p className="text-gray-900">
                      {new Date(selectedVehicle.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Route Information */}
            {selectedVehicle.route && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Route Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Assigned Route</label>
                    <p className="text-gray-900">{selectedVehicle.route.name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {selectedVehicle.notes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Notes
                </h4>
                <p className="text-gray-900">{selectedVehicle.notes}</p>
              </div>
            )}

            {/* System Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                System Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Vehicle ID</label>
                  <p className="text-gray-900 font-mono text-sm">{selectedVehicle.id}</p>
                </div>
                {selectedVehicle.updatedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-gray-900">
                      {new Date(selectedVehicle.updatedAt).toLocaleDateString()}
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

export default VehicleProfileModal; 