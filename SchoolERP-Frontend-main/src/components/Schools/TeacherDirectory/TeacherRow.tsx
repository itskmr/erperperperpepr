import React from 'react';
import { Teacher } from './types';
import { Mail, Phone, Eye, Edit, Trash } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeacherRowProps {
  teacher: Teacher;
  handleViewProfile: (teacher: Teacher) => void;
  handleEditTeacher: (teacher: Teacher) => void;
  handleDeleteTeacher: (teacher: Teacher) => void;
}

const TeacherRow: React.FC<TeacherRowProps> = ({
  teacher,
  handleViewProfile,
  handleEditTeacher,
  handleDeleteTeacher,
}) => {
  return (
    <motion.tr
      className={`hover:bg-gray-50 ${teacher.status === 'inactive' ? 'bg-gray-100' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
            {teacher.profileImage ? (
              <img
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                src={teacher.profileImage}
                alt={teacher.fullName}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm ${teacher.profileImage ? 'hidden' : ''}`}>
              {teacher.fullName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-2 sm:ml-4">
            <div className="text-xs sm:text-sm font-medium text-gray-900">
              {teacher.fullName}
              {teacher.status === 'inactive' && (
                <span className="ml-2 text-xs text-red-500 font-normal">(Inactive)</span>
              )}
            </div>
            <div className="text-xs text-gray-500">{teacher.designation}</div>
          </div>
        </div>
      </td>
      <td className="hidden sm:table-cell px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <div className="text-xs sm:text-sm text-gray-900 flex items-center">
            <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-gray-500" />
            {teacher.email}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 flex items-center">
            <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-gray-500" />
            {teacher.phone}
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
        <div className="text-xs sm:text-sm text-gray-900">{teacher.subjects?.join(', ')}</div>
      </td>
      <td className="hidden lg:table-cell px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
        <div className="text-xs sm:text-sm text-gray-900">
          {teacher.isClassIncharge ? 'Yes' : 'No'}
        </div>
      </td>
      <td className="hidden lg:table-cell px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
        {teacher.isClassIncharge ? (
          <div className="text-xs sm:text-sm text-gray-900">
            <span className="font-medium">{teacher.inchargeClass}</span>
            {teacher.inchargeSection && (
              <span className="ml-2 text-gray-500">
                (Section {teacher.inchargeSection})
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs sm:text-sm text-gray-500">-</span>
        )}
      </td>
      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-1 sm:space-x-2">
          <button
            onClick={() => handleViewProfile(teacher)}
            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-indigo-100 rounded-full"
            title="View Profile"
          >
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => handleEditTeacher(teacher)}
            className="p-1 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100 rounded-full"
            title="Edit"
          >
            <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => handleDeleteTeacher(teacher)}
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

export default TeacherRow;