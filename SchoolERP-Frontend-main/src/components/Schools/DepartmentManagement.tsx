import React, { useState, useEffect } from 'react';

// Types
interface Department {
  id: string;
  name: string;
  headOfDepartment: string;
  facultyCount: number;
  description: string;
  createdAt: Date;
}

const DepartmentManagement: React.FC = () => {
  // State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    headOfDepartment: '',
    facultyCount: 0,
    description: '',
  });
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch departments (mock data for now)
  useEffect(() => {
    // In a real app, you would fetch from an API
    const mockDepartments: Department[] = [
      {
        id: '1',
        name: 'Mathematics',
        headOfDepartment: 'Dr. John Smith',
        facultyCount: 12,
        description: 'Department focused on mathematical sciences and research.',
        createdAt: new Date('2022-01-15'),
      },
      {
        id: '2',
        name: 'Computer Science',
        headOfDepartment: 'Prof. Sarah Johnson',
        facultyCount: 18,
        description: 'Specializes in software development, AI, and computer systems.',
        createdAt: new Date('2021-09-05'),
      },
      {
        id: '3',
        name: 'Biology',
        headOfDepartment: 'Dr. Michael Chen',
        facultyCount: 15,
        description: 'Studies of living organisms and life sciences.',
        createdAt: new Date('2022-03-20'),
      },
    ];
    setDepartments(mockDepartments);
  }, []);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'facultyCount' ? parseInt(value) || 0 : value,
    });
  };

  const handleAddDepartment = () => {
    setIsEditMode(false);
    setFormData({
      name: '',
      headOfDepartment: '',
      facultyCount: 0,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setIsEditMode(true);
    setCurrentDepartment(department);
    setFormData({
      name: department.name,
      headOfDepartment: department.headOfDepartment,
      facultyCount: department.facultyCount,
      description: department.description,
    });
    setIsModalOpen(true);
  };

  const handleDeleteDepartment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      setDepartments(departments.filter(dept => dept.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && currentDepartment) {
      // Update existing department
      setDepartments(
        departments.map(dept =>
          dept.id === currentDepartment.id
            ? { ...dept, ...formData }
            : dept
        )
      );
    } else {
      // Add new department
      const newDepartment: Department = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
      };
      setDepartments([...departments, newDepartment]);
    }
    
    setIsModalOpen(false);
  };

  // Filter departments based on search term
  const filteredDepartments = departments.filter(
    dept => 
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.headOfDepartment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Department Management</h1>
        <p className="text-gray-600 mt-2">Manage school departments, faculty, and resources</p>
      </div>

      {/* Search and Add Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search departments..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button
          onClick={handleAddDepartment}
          className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center justify-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Department
        </button>
      </div>

      {/* Departments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredDepartments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Head of Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faculty Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDepartments.map((department) => (
                  <tr key={department.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{department.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {department.headOfDepartment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {department.facultyCount} Faculty
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {department.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditDepartment(department)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(department.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No departments found. Please add a new department or modify your search.
          </div>
        )}
      </div>

      {/* Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                {isEditMode ? 'Edit Department' : 'Add New Department'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Department Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="headOfDepartment">
                  Head of Department
                </label>
                <input
                  type="text"
                  id="headOfDepartment"
                  name="headOfDepartment"
                  value={formData.headOfDepartment}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="facultyCount">
                  Faculty Count
                </label>
                <input
                  type="number"
                  id="facultyCount"
                  name="facultyCount"
                  value={formData.facultyCount}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min="0"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
                >
                  {isEditMode ? 'Update' : 'Add'} Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Stats Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Departments</h3>
          <p className="text-3xl font-bold text-blue-600">{departments.length}</p>
          <p className="text-sm text-gray-500 mt-1">Across all academic disciplines</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Faculty</h3>
          <p className="text-3xl font-bold text-green-600">
            {departments.reduce((sum, dept) => sum + dept.facultyCount, 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Teaching staff members</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Latest Department</h3>
          <p className="text-xl font-medium text-purple-600">
            {departments.length > 0 
              ? departments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).name
              : 'None'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Most recently added</p>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagement;