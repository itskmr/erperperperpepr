import React from 'react';
import { Trip } from './types';
import { Eye, Edit, Trash, AlertCircle, CheckCircle, Clock, PlayCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TripRowProps {
  trip: Trip;
  handleViewTrip: (trip: Trip) => void;
  handleEditTrip: (trip: Trip) => void;
  handleDeleteTrip: (id: number) => void;
  handleUpdateStatus: (tripId: number, status: string, endOdometer?: number) => void;
}

const TripRow: React.FC<TripRowProps> = ({
  trip,
  handleViewTrip,
  handleEditTrip,
  handleDeleteTrip,
  handleUpdateStatus,
}) => {
  const getStatusIcon = () => {
    switch (trip.status) {
      case 'SCHEDULED':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'IN_PROGRESS':
        return <PlayCircle className="h-4 w-4 text-yellow-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'DELAYED':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'CANCELED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    return trip.status.charAt(0) + trip.status.slice(1).toLowerCase().replace('_', ' ');
  };

  // Format date as DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <motion.tr
      className="hover:bg-gray-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-2 sm:ml-0">
            <div className="text-xs sm:text-sm font-medium text-gray-900">Trip #{trip.tripID}</div>
            <div className="text-xs text-gray-500">{formatDate(trip.date)}</div>
          </div>
        </div>
      </td>

      <td className="hidden sm:table-cell px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <div className="text-xs sm:text-sm text-gray-900">
            Bus: {trip.busNumber}
          </div>
          <div className="text-xs text-gray-500">
            Route: {trip.routeName}
          </div>
        </div>
      </td>

      <td className="hidden md:table-cell px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
        <div className="text-xs sm:text-sm text-gray-900">{trip.driverName}</div>
      </td>

      <td className="hidden lg:table-cell px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
        <div className="text-xs sm:text-sm text-gray-900">
          {trip.startTime} - {trip.endTime}
        </div>
      </td>

      <td className="hidden lg:table-cell px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
        <div className="flex items-center text-xs sm:text-sm">
          {getStatusIcon()}
          <span className="ml-2">{getStatusText()}</span>
          {trip.delayMinutes && (
            <span className="ml-2 text-orange-500">
              ({trip.delayMinutes} min delay)
            </span>
          )}
        </div>
      </td>

      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-1 sm:space-x-2">
          <button
            onClick={() => handleViewTrip(trip)}
            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-indigo-100 rounded-full"
            title="View Details"
          >
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {trip.status === 'SCHEDULED' && (
            <button
              onClick={() => handleUpdateStatus(trip.id, 'IN_PROGRESS')}
              className="p-1 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 rounded-full"
              title="Start Trip"
            >
              <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}

          {trip.status === 'IN_PROGRESS' && (
            <button
              onClick={() => {
                const endOdometer = window.prompt('Enter end odometer reading:', trip.startOdometer.toString());
                if (endOdometer) {
                  handleUpdateStatus(trip.id, 'COMPLETED', parseFloat(endOdometer));
                }
              }}
              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-full"
              title="Complete Trip"
            >
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
          
          <button
            onClick={() => handleEditTrip(trip)}
            className="p-1 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100 rounded-full"
            title="Edit"
          >
            <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          
          <button
            onClick={() => handleDeleteTrip(trip.id)}
            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full"
            title="Delete"
          >
            <Trash className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

export default TripRow; 