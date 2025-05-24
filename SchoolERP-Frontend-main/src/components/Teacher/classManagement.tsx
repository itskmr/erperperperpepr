import React, { useState} from "react";
import { Edit2, Clock, Users, BookOpen, Calendar, Plus, Search, Filter, Trash2 } from "lucide-react";
import ClassDetails from './ClassDetails'; // Add this import at the top with other imports

// Mock data for classes
const MOCK_CLASSES = [
  {
    id: 1,
    name: "Mathematics 9A",
    grade: "9",
    section: "A",
    subject: "Mathematics",
    students: 28,
    room: "Room 104",
    schedule: [
      { day: "Monday", startTime: "09:00", endTime: "10:30" },
      { day: "Wednesday", startTime: "09:00", endTime: "10:30" },
      { day: "Friday", startTime: "11:00", endTime: "12:30" }
    ]
  },
  {
    id: 2,
    name: "Science 10B",
    grade: "10",
    section: "B",
    subject: "Science",
    students: 25,
    room: "Lab 203",
    schedule: [
      { day: "Tuesday", startTime: "11:00", endTime: "12:30" },
      { day: "Thursday", startTime: "11:00", endTime: "12:30" }
    ]
  },
  {
    id: 3,
    name: "English Literature 11C",
    grade: "11",
    section: "C",
    subject: "English Literature",
    students: 22,
    room: "Room 107",
    schedule: [
      { day: "Monday", startTime: "13:00", endTime: "14:30" },
      { day: "Thursday", startTime: "09:00", endTime: "10:30" }
    ]
  },
  {
    id: 4,
    name: "Mathematics 8D",
    grade: "8",
    section: "D",
    subject: "Mathematics",
    students: 30,
    room: "Room 102",
    schedule: [
      { day: "Tuesday", startTime: "09:00", endTime: "10:30" },
      { day: "Friday", startTime: "13:00", endTime: "14:30" }
    ]
  }
];

const ClassManagement: React.FC = () => {
  const [classes, setClasses] = useState(MOCK_CLASSES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<typeof MOCK_CLASSES[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false); // Add this state
  const [viewingClass, setViewingClass] = useState<typeof MOCK_CLASSES[0] | null>(null); // Add this state
  
  // Filter classes based on search term
  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle schedule editing
  const handleScheduleUpdate = (updatedSchedule: any) => {
    if (selectedClass) {
      const updatedClasses = classes.map(cls => 
        cls.id === selectedClass.id 
          ? { ...cls, schedule: updatedSchedule }
          : cls
      );
      setClasses(updatedClasses);
      setSelectedClass(null);
      setIsModalOpen(false);
    }
  };

  // Add this function to handle class updates from the details modal
  const handleClassUpdate = (updatedClass: any) => {
    const updatedClasses = classes.map(cls => 
      cls.id === updatedClass.id ? updatedClass : cls
    );
    setClasses(updatedClasses);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">My Classes</h1>
          <button 
            onClick={() => setIsAddingClass(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-1" />
            Add Class
          </button>
        </div>
        
        {/* Search and filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <button className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>
        
        {/* Class cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map(cls => (
            <div key={cls.id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-emerald-600 text-white px-4 py-3 flex justify-between items-center">
                <h3 className="font-semibold truncate">{cls.name}</h3>
                <button 
                  onClick={() => {
                    setSelectedClass(cls);
                    setIsModalOpen(true);
                  }}
                  className="p-1 hover:bg-emerald-700 rounded"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <BookOpen className="h-5 w-5 text-emerald-600 mr-2" />
                  <span className="text-gray-700">{cls.subject}</span>
                </div>
                
                <div className="flex items-center mb-3">
                  <Users className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-700">{cls.students} students</span>
                </div>
                
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-gray-700">Grade {cls.grade}, Section {cls.section}</span>
                </div>
                
                <div className="flex items-center mb-3">
                  <Clock className="h-5 w-5 text-amber-600 mr-2" />
                  <span className="text-gray-700">{cls.schedule.length} scheduled sessions</span>
                </div>
                
                {/* Schedule preview */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Schedule:</h4>
                  <ul className="text-sm space-y-1">
                    {cls.schedule.slice(0, 2).map((session, idx) => (
                      <li key={idx} className="text-gray-600">
                        {session.day}: {session.startTime} - {session.endTime}
                      </li>
                    ))}
                    {cls.schedule.length > 2 && (
                      <li className="text-emerald-600 cursor-pointer hover:underline" onClick={() => {
                        setSelectedClass(cls);
                        setIsModalOpen(true);
                      }}>
                        + {cls.schedule.length - 2} more sessions
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => {
                      setViewingClass(cls);
                      setIsViewDetailsOpen(true);
                    }}
                    className="text-sm text-emerald-600 hover:text-emerald-800"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty state */}
        {filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              {searchTerm ? 'No classes match your search criteria.' : 'You don\'t have any assigned classes yet.'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Timetable Modal */}
      {isModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">{selectedClass.name} Schedule</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Current Schedule</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="divide-y divide-gray-200">
                    {selectedClass.schedule.map((session, idx) => (
                      <li key={idx} className="py-3 flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-800">{session.day}</span>
                          <p className="text-gray-600">{session.startTime} - {session.endTime}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Add New Session</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input 
                      type="time" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input 
                      type="time" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <button className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
                  Add Session
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleScheduleUpdate(selectedClass.schedule)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Class Modal */}
      {isAddingClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Add New Class</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Mathematics 9A" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500">
                      {[7, 8, 9, 10, 11, 12].map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500">
                      {['A', 'B', 'C', 'D', 'E'].map(section => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500">
                    {['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science', 'Art', 'Music', 'Physical Education'].map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                  <input 
                    type="text"
                    placeholder="e.g. Room 104" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setIsAddingClass(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // Add new class logic here
                  setIsAddingClass(false);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Add Class
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Class Details Modal */}
      <ClassDetails 
        classData={viewingClass || MOCK_CLASSES[0]} 
        isOpen={isViewDetailsOpen && viewingClass !== null}
        onClose={() => {
          setIsViewDetailsOpen(false);
          setViewingClass(null);
        }}
        onUpdate={handleClassUpdate}
      />
    </div>
  );
};

export default ClassManagement;