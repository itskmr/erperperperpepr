import React from 'react';
import { Teacher } from './types';
import TeacherRow from './TeacherRow';

interface TeacherTableProps {
  currentTeachers: Teacher[];
  handleViewProfile: (teacher: Teacher) => void;
  handleEditTeacher: (teacher: Teacher) => void;
  handleDeleteTeacher: (id: number) => void;
  handleStatusChange?: (id: number, status: 'active' | 'inactive') => void;
}

const TeacherTable: React.FC<TeacherTableProps> = ({
  currentTeachers,
  handleViewProfile,
  handleEditTeacher,
  handleDeleteTeacher,
  handleStatusChange,
}) => {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th scope="col" className="hidden sm:table-cell px-3 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th scope="col" className="hidden md:table-cell px-3 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Subjects
                </th>
                <th scope="col" className="hidden lg:table-cell px-3 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Class Incharge
                </th>
                <th scope="col" className="hidden lg:table-cell px-3 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Incharge Details
                </th>
                <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTeachers.length > 0 ? (
                currentTeachers.map((teacher) => (
                  <TeacherRow
                    key={teacher.id}
                    teacher={teacher}
                    handleViewProfile={handleViewProfile}
                    handleEditTeacher={handleEditTeacher}
                    handleDeleteTeacher={handleDeleteTeacher}
                    handleStatusChange={handleStatusChange}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 py-4 sm:px-6 text-center text-sm text-gray-500">
                    No teachers found. Try adjusting your search or filters.
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

export default TeacherTable;