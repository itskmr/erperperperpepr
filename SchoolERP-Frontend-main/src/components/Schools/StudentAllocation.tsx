import React, { useState } from 'react';
import { useBusTracking } from './BusTrackingContext';
import { Plus, Edit, Trash2, Search, User, Bus, MapPin, Clock } from 'lucide-react';

const StudentAllocation: React.FC = () => {
  const {
    students,
    routes,
    buses,
    addStudent,
    updateStudent,
    deleteStudent,
    loading,
    error
  } = useBusTracking();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRoute, setFilterRoute] = useState('');
  
  // Filter students based on search query and route
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRoute = filterRoute ? student.routeId === filterRoute : true;
    
    return matchesSearch && matchesRoute;
  });
  
  // Get route details for a student
  const getRouteDetails = (routeId: string) => {
    return routes.find(route => route.id === routeId);
  };
  
  // Get stop details for a student
  const getStopDetails = (routeId: string, stopId: string) => {
    const route = getRouteDetails(routeId);
    return route?.stops.find(stop => stop.id === stopId);
  };

  const handleAddStudent = async (formData: Omit<any, 'id'>) => {
    await addStudent(formData);
    setIsAddModalOpen(false);
  };

  const handleEditStudent = async (id: string, formData: Partial<any>) => {
    await updateStudent(id, formData);
    setIsEditModalOpen(false);
  };

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this student from bus allocation?')) {
      await deleteStudent(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Student Bus Allocation</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Student Allocation
        </button>
      </div>
      
      {/* Search and filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search by student name, grade or parent name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select 
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterRoute}
              onChange={(e) => setFilterRoute(e.target.value)}
            >
              <option value="">All Routes</option>
              {routes.map(route => (
                <option key={route.id} value={route.id}>{route.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      {/* Route summary */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Route Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {routes.map(route => {
              const studentsOnRoute = students.filter(s => s.routeId === route.id).length;
              const bus = buses.find(b => b.id === route.assignedBus);
              
              return (
                <div key={route.id} className="border rounded-lg p-4">
                  <h4 className="font-medium text-indigo-600">{route.name}</h4>
                  <div className="mt-2 text-sm text-gray-700">
                    <div className="flex items-center">
                      <Bus className="h-4 w-4 text-gray-400 mr-1" />
                      {bus ? `${bus.registrationNumber} (${bus.capacity} seats)` : 'No bus assigned'}
                    </div>
                    <div className="flex items-center mt-1">
                      <User className="h-4 w-4 text-gray-400 mr-1" />
                      {studentsOnRoute} students allocated
                    </div>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      {route.stops.length} stops
                    </div>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => setFilterRoute(route.id)}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      View students
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Students list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Allocated Students</h3>
        </div>
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner"></div>
            <p className="mt-2 text-sm text-gray-500">Loading student allocations...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-500">No student allocations found.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredStudents.map((student) => {
              const route = getRouteDetails(student.routeId);
              const stop = getStopDetails(student.routeId, student.stopId);
              
              return (
                <li key={student.id}>
                  <div className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">Grade {student.grade}{student.section}</div>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                          <button 
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsEditModalOpen(true);
                            }}
                            className="ml-3 text-gray-500 hover:text-indigo-600"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteStudent(student.id)}
                            className="ml-3 text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex space-x-6">
                          <p className="flex items-center text-sm text-gray-500">
                            <Bus className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            Route: {route?.name || 'Unknown'}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            Stop: {stop?.name || 'Unknown'}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <div className="flex space-x-4">
                            <span className="flex items-center">
                              <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              Pickup: {student.pickupTime}
                            </span>
                            <span className="flex items-center">
                              <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              Drop: {student.dropTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Parent:</span> {student.parentName} • <span className="font-medium">Contact:</span> {student.parentContact}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">Address:</span> {student.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Add Student Allocation</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <StudentForm routes={routes} onSubmit={handleAddStudent} onCancel={() => setIsAddModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Student Modal */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Edit Student Allocation</h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <StudentForm 
                student={selectedStudent} 
                routes={routes} 
                onSubmit={(data) => handleEditStudent(selectedStudent.id, data)} 
                onCancel={() => setIsEditModalOpen(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface StudentFormProps {
  student?: any;
  routes: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, routes, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    grade: student?.grade || '',
    section: student?.section || '',
    routeId: student?.routeId || '',
    stopId: student?.stopId || '',
    contactNumber: student?.contactNumber || '',
    parentName: student?.parentName || '',
    parentContact: student?.parentContact || '',
    pickupTime: student?.pickupTime || '',
    dropTime: student?.dropTime || '',
    address: student?.address || ''
  });
  
  const [selectedRoute, setSelectedRoute] = useState<any>(
    student?.routeId ? routes.find(r => r.id === student.routeId) : null
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // If changing the route, update the selected route and reset the stop
    if (name === 'routeId') {
      const route = routes.find(r => r.id === value);
      setSelectedRoute(route);
      setFormData({
        ...formData,
        routeId: value,
        stopId: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Student Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
            Grade
          </label>
          <input
            type="text"
            name="grade"
            id="grade"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.grade}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label htmlFor="section" className="block text-sm font-medium text-gray-700">
            Section
          </label>
          <input
            type="text"
            name="section"
            id="section"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.section}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="routeId" className="block text-sm font-medium text-gray-700">
          Route
        </label>
        <select
          id="routeId"
          name="routeId"
          required
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.routeId}
          onChange={handleChange}
        >
          <option value="">Select a route</option>
          {routes.map(route => (
            <option key={route.id} value={route.id}>{route.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="stopId" className="block text-sm font-medium text-gray-700">
          Bus Stop
        </label>
        <select
          id="stopId"
          name="stopId"
          required
          disabled={!selectedRoute}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.stopId}
          onChange={handleChange}
        >
          <option value="">Select a stop</option>
          {selectedRoute?.stops.map((stop: any) => (
            <option key={stop.id} value={stop.id}>{stop.name}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700">
            Pickup Time
          </label>
          <input
            type="time"
            name="pickupTime"
            id="pickupTime"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.pickupTime}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label htmlFor="dropTime" className="block text-sm font-medium text-gray-700">
            Drop Time
          </label>
          <input
            type="time"
            name="dropTime"
            id="dropTime"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.dropTime}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="parentName" className="block text-sm font-medium text-gray-700">
            Parent Name
          </label>
          <input
            type="text"
            name="parentName"
            id="parentName"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.parentName}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label htmlFor="parentContact" className="block text-sm font-medium text-gray-700">
            Parent Contact
          </label>
          <input
            type="text"
            name="parentContact"
            id="parentContact"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={formData.parentContact}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
          Student Contact Number (Optional)
        </label>
        <input
          type="text"
          name="contactNumber"
          id="contactNumber"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.contactNumber}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <textarea
          name="address"
          id="address"
          rows={3}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={formData.address}
          onChange={handleChange}
        />
      </div>
      
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {student ? 'Update Student' : 'Add Student'}
        </button>
      </div>
    </form>
  );
};

export default StudentAllocation; 