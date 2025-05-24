import React, { useState } from 'react';
import { 
  X, Clock, Users, BookOpen, Calendar, MapPin, Mail, Phone, 
  Edit2, UserPlus, Download, ChevronLeft, ChevronRight
} from 'lucide-react';

// Define the type for class details
interface ClassDetailsProps {
  classData: {
    id: number;
    name: string;
    grade: string;
    section: string;
    subject: string;
    students: number;
    room: string;
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedClass: any) => void;
}

// Mock student data - in a real app, this would be fetched based on the class ID
const MOCK_STUDENTS = [
  { id: 1, name: "Emma Johnson", avatar: "https://i.pravatar.cc/150?img=1", email: "emma.j@example.com", phone: "555-1234" },
  { id: 2, name: "Noah Williams", avatar: "https://i.pravatar.cc/150?img=2", email: "noah.w@example.com", phone: "555-2345" },
  { id: 3, name: "Olivia Smith", avatar: "https://i.pravatar.cc/150?img=3", email: "olivia.s@example.com", phone: "555-3456" },
  { id: 4, name: "Liam Brown", avatar: "https://i.pravatar.cc/150?img=4", email: "liam.b@example.com", phone: "555-4567" },
  { id: 5, name: "Ava Jones", avatar: "https://i.pravatar.cc/150?img=5", email: "ava.j@example.com", phone: "555-5678" },
  { id: 6, name: "Mason Davis", avatar: "https://i.pravatar.cc/150?img=6", email: "mason.d@example.com", phone: "555-6789" },
  { id: 7, name: "Sophia Miller", avatar: "https://i.pravatar.cc/150?img=7", email: "sophia.m@example.com", phone: "555-7890" },
  { id: 8, name: "James Wilson", avatar: "https://i.pravatar.cc/150?img=8", email: "james.w@example.com", phone: "555-8901" },
];

const ClassDetails: React.FC<ClassDetailsProps> = ({ classData, isOpen, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'schedule'>('overview');
  const [editedClass, setEditedClass] = useState({ ...classData });
  const [isEditing, setIsEditing] = useState(false);
  const [studentsPage, setStudentsPage] = useState(1);
  const studentsPerPage = 4;
  
  // Handle saving changes
  const handleSaveChanges = () => {
    onUpdate(editedClass);
    setIsEditing(false);
  };
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedClass(prev => ({ ...prev, [name]: value }));
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? "Edit Class Details" : classData.name}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 focus:outline-none ${
                activeTab === 'overview' 
                  ? 'text-emerald-600 border-b-2 border-emerald-600 font-medium' 
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-3 focus:outline-none ${
                activeTab === 'students' 
                  ? 'text-emerald-600 border-b-2 border-emerald-600 font-medium' 
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-3 focus:outline-none ${
                activeTab === 'schedule' 
                  ? 'text-emerald-600 border-b-2 border-emerald-600 font-medium' 
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              Schedule
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-grow overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                    <input 
                      type="text"
                      name="name"
                      value={editedClass.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                      <select 
                        name="grade"
                        value={editedClass.grade}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        {[7, 8, 9, 10, 11, 12].map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      <select 
                        name="section"
                        value={editedClass.section}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        {['A', 'B', 'C', 'D', 'E'].map(section => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select 
                      name="subject"
                      value={editedClass.subject}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science', 'Art', 'Music', 'Physical Education'].map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                    <input 
                      type="text"
                      name="room"
                      value={editedClass.room}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Class Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <BookOpen className="h-5 w-5 text-emerald-600 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Subject</p>
                            <p className="font-medium">{classData.subject}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-purple-600 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Grade & Section</p>
                            <p className="font-medium">Grade {classData.grade}, Section {classData.section}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-red-500 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Room</p>
                            <p className="font-medium">{classData.room}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Students</p>
                            <p className="font-medium">{classData.students} students</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Schedule Overview</h3>
                      <ul className="space-y-2">
                        {classData.schedule.map((session, idx) => (
                          <li key={idx} className="flex items-start">
                            <Clock className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
                            <div>
                              <p className="font-medium">{session.day}</p>
                              <p className="text-sm text-gray-600">{session.startTime} - {session.endTime}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Activity</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500 italic">No recent activity recorded.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Student List</h3>
                <button className="flex items-center text-sm bg-emerald-50 text-emerald-600 px-3 py-1 rounded hover:bg-emerald-100">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add Student
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  {MOCK_STUDENTS
                    .slice((studentsPage - 1) * studentsPerPage, studentsPage * studentsPerPage)
                    .map(student => (
                      <div key={student.id} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                        <img 
                          src={student.avatar} 
                          alt={student.name}
                          className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{student.name}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 gap-2">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {student.email}
                            </div>
                            <div className="hidden sm:inline">•</div>
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {student.phone}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                
                {/* Pagination */}
                {MOCK_STUDENTS.length > studentsPerPage && (
                  <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing {((studentsPage - 1) * studentsPerPage) + 1} to {Math.min(studentsPage * studentsPerPage, MOCK_STUDENTS.length)} of {MOCK_STUDENTS.length}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setStudentsPage(p => Math.max(1, p - 1))}
                        disabled={studentsPage === 1}
                        className={`p-1 rounded ${
                          studentsPage === 1 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => setStudentsPage(p => p + 1)}
                        disabled={studentsPage * studentsPerPage >= MOCK_STUDENTS.length}
                        className={`p-1 rounded ${
                          studentsPage * studentsPerPage >= MOCK_STUDENTS.length 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <button className="flex items-center text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100">
                  <Download className="h-4 w-4 mr-1" />
                  Export Student List
                </button>
              </div>
            </div>
          )}
          
          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Class Schedule</h3>
                <button className="flex items-center text-sm bg-emerald-50 text-emerald-600 px-3 py-1 rounded hover:bg-emerald-100">
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit Schedule
                </button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-7 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <div key={day} className="bg-white p-2 rounded-md shadow-sm">
                      <h4 className="font-medium text-center border-b pb-1 mb-2">{day}</h4>
                      <div>
                        {classData.schedule
                          .filter(session => session.day === day)
                          .map((session, idx) => (
                            <div 
                              key={idx} 
                              className="text-xs p-2 mb-1 bg-emerald-50 border-l-2 border-emerald-500 rounded"
                            >
                              <div className="font-medium text-emerald-600">{classData.name}</div>
                              <div>{session.startTime} - {session.endTime}</div>
                              <div className="text-gray-500 mt-1">{classData.room}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
          {isEditing ? (
            <>
              <button 
                onClick={() => {
                  setEditedClass({ ...classData });
                  setIsEditing(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Edit Details
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;