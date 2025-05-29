import React from 'react';
import { X, MapPin, Clock, Truck, User, Route, Printer } from 'lucide-react';
import { TransportRouteProfileModalProps } from './types';
import { generateTransportRoutePDF } from '../../../utils/printUtils';

const TransportRouteProfileModal: React.FC<TransportRouteProfileModalProps> = ({
  selectedRoute,
  setIsProfileOpen,
}) => {
  const handlePrint = async () => {
    try {
      await generateTransportRoutePDF(selectedRoute);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">Route Details</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-200"
              title="Print Route Details"
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
          {/* Basic Information */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Route className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Route Name</label>
                  <p className="text-gray-900 font-medium">{selectedRoute.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedRoute.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedRoute.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                  <p className="text-gray-900">{selectedRoute.description || 'No description provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Route Information */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <MapPin className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Route Information</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">From Location</label>
                  <p className="text-gray-900 font-medium">{selectedRoute.fromLocation}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">To Location</label>
                  <p className="text-gray-900 font-medium">{selectedRoute.toLocation}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Distance</label>
                  <div className="flex items-center">
                    <p className="text-gray-900">{selectedRoute.distance ? `${selectedRoute.distance} km` : 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Estimated Time</label>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-1" />
                    <p className="text-gray-900">{selectedRoute.estimatedTime ? `${selectedRoute.estimatedTime} minutes` : 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Truck className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Assigned Vehicle</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              {selectedRoute.vehicle ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Vehicle Name</label>
                    <p className="text-gray-900 font-medium">{selectedRoute.vehicle.vehicleName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Registration Number</label>
                    <p className="text-gray-900">{selectedRoute.vehicle.registrationNumber || 'Not provided'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Truck className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No vehicle assigned to this route</p>
                </div>
              )}
            </div>
          </div>

          {/* Driver Information */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <User className="h-6 w-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Assigned Driver</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              {selectedRoute.driver ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Driver Name</label>
                    <p className="text-gray-900 font-medium">{selectedRoute.driver.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Contact Number</label>
                    <p className="text-gray-900">{selectedRoute.driver.contactNumber}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No driver assigned to this route</p>
                </div>
              )}
            </div>
          </div>

          {/* Route Stops (if available) */}
          {selectedRoute.stops && selectedRoute.stops.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 text-orange-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Route Stops</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {selectedRoute.stops.map((stop, index) => (
                    <div key={stop.id} className="flex items-center p-3 bg-white rounded-md">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{stop.name}</p>
                        <p className="text-sm text-gray-500">{stop.location}</p>
                      </div>
                      {stop.studentsCount && (
                        <div className="text-sm text-gray-500">
                          {stop.studentsCount} students
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Creation Date */}
          <div className="text-sm text-gray-500 border-t pt-4">
            {selectedRoute.createdAt && (
              <p>Created on: {new Date(selectedRoute.createdAt).toLocaleDateString()}</p>
            )}
            {selectedRoute.updatedAt && (
              <p>Last updated: {new Date(selectedRoute.updatedAt).toLocaleDateString()}</p>
            )}
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

export default TransportRouteProfileModal; 