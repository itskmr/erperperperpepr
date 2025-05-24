import React from 'react';
import { Trip } from './types';
import { Eye, Edit, Trash2, Play, Pause, Check, X, Clock } from 'lucide-react';

interface TripTableProps {
  currentTrips: Trip[];
  handleViewTrip: (trip: Trip) => void;
  handleEditTrip: (trip: Trip) => void;
  handleDeleteTrip: (id: number | string) => void;
  handleUpdateStatus: (tripId: number | string, status: string, endOdometer?: number) => void;
}

const TripTable: React.FC<TripTableProps> = ({
  currentTrips,
  handleViewTrip,
  handleEditTrip,
  handleDeleteTrip,
  handleUpdateStatus,
}) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      case 'DELAYED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <Clock className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Play className="h-4 w-4" />;
      case 'COMPLETED':
        return <Check className="h-4 w-4" />;
      case 'CANCELED':
        return <X className="h-4 w-4" />;
      case 'DELAYED':
        return <Pause className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    const options: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit'
    };
    
    // If timeString is a full ISO datetime, parse it properly
    if (timeString.includes('T')) {
      return new Date(timeString).toLocaleTimeString(undefined, options);
    }
    
    // Otherwise, treat it as a time string only
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      return date.toLocaleTimeString(undefined, options);
    } catch (error) {
      return timeString; // Return as is if parsing fails
    }
  };

  // Function to handle status update
  const onUpdateStatus = (trip: Trip, newStatus: string) => {
    // For COMPLETED status, prompt for final odometer reading when IN_PROGRESS
    if (newStatus === 'COMPLETED' && trip.status === 'IN_PROGRESS') {
      const endOdometer = window.prompt(
        `Please enter the final odometer reading for trip ${trip.tripID}:`, 
        trip.startOdometer.toString()
      );
      
      if (endOdometer === null) {
        return; // User canceled
      }
      
      const odometerValue = parseInt(endOdometer, 10);
      
      if (isNaN(odometerValue)) {
        alert('Please enter a valid number for the odometer reading.');
        return;
      }
      
      if (odometerValue <= trip.startOdometer) {
        alert('End odometer reading must be greater than the start reading.');
        return;
      }
      
      handleUpdateStatus(trip.id, newStatus, odometerValue);
    } else {
      handleUpdateStatus(trip.id, newStatus);
    }
  };

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bus
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTrips.length > 0 ? (
                currentTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trip.tripID}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(trip.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trip.routeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trip.busNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trip.driverName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(trip.startTime)}
                      {trip.endTime && ` - ${formatTime(trip.endTime)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(trip.status)}`}>
                        {getStatusIcon(trip.status)}
                        <span className="ml-1">{trip.status.replace('_', ' ')}</span>
                      </span>
                      {trip.delayMinutes && trip.delayMinutes > 0 && (
                        <span className="ml-2 text-xs text-red-600">
                          ({trip.delayMinutes} min delay)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        {/* View button */}
                        <button
                          onClick={() => handleViewTrip(trip)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        
                        {/* Edit button */}
                        <button
                          onClick={() => handleEditTrip(trip)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit trip"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        
                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteTrip(trip.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete trip"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>

                        {/* Status update buttons */}
                        <div className="ml-2 border-l pl-2 border-gray-200">
                          {trip.status === 'SCHEDULED' && (
                            <button
                              onClick={() => onUpdateStatus(trip, 'IN_PROGRESS')}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Start trip"
                            >
                              <Play className="h-5 w-5" />
                            </button>
                          )}
                          
                          {trip.status === 'SCHEDULED' && (
                            <button
                              onClick={() => onUpdateStatus(trip, 'CANCELED')}
                              className="text-red-600 hover:text-red-900 ml-1"
                              title="Cancel trip"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                          
                          {trip.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => onUpdateStatus(trip, 'COMPLETED')}
                              className="text-green-600 hover:text-green-900"
                              title="Complete trip"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                          )}
                          
                          {trip.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => {
                                const delayMinutes = window.prompt('Enter delay in minutes:', '0');
                                if (delayMinutes !== null) {
                                  const delayValue = parseInt(delayMinutes, 10);
                                  if (!isNaN(delayValue) && delayValue > 0) {
                                    // Call update status with delay info
                                    handleUpdateStatus(trip.id, 'DELAYED');
                                  }
                                }
                              }}
                              className="text-orange-600 hover:text-orange-900 ml-1"
                              title="Mark as delayed"
                            >
                              <Clock className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No trips found. Please try a different search or add a new trip.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TripTable; 