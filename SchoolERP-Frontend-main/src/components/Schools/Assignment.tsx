import React, { useState, useEffect } from 'react';

// Types
interface Assignment {
  id: string;
  title: string;
  description: string;
  className: string;
  dueDate: string;
  createdAt: string;
  attachmentUrl?: string;
}

interface Class {
  id: string;
  name: string;
}

const ClassAssignmentManager: React.FC = () => {
  // State management
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    className: '',
    dueDate: '',
    attachmentUrl: '',
  });

  // Mock data initialization
  useEffect(() => {
    // Mock classes data
    const mockClasses: Class[] = [
      { id: '1', name: '10th Grade - Science' },
      { id: '2', name: '9th Grade - Mathematics' },
      { id: '3', name: '11th Grade - English' },
      { id: '4', name: '12th Grade - Computer Science' },
    ];

    // Mock assignments data
    const mockAssignments: Assignment[] = [
      {
        id: '1',
        title: 'Physics Lab Report',
        description: 'Complete the lab report on Newton\'s Laws of Motion',
        className: '10th Grade - Science',
        dueDate: '2023-12-15',
        createdAt: '2023-12-01',
      },
      {
        id: '2',
        title: 'Algebra Problem Set',
        description: 'Solve problems 1-20 from Chapter 5',
        className: '9th Grade - Mathematics',
        dueDate: '2023-12-10',
        createdAt: '2023-12-02',
      },
      {
        id: '3',
        title: 'Essay on Shakespeare',
        description: 'Write a 1000-word essay analyzing a theme from Hamlet',
        className: '11th Grade - English',
        dueDate: '2023-12-20',
        createdAt: '2023-12-03',
      },
    ];

    setClasses(mockClasses);
    setAssignments(mockAssignments);
  }, []);

  // Filter assignments based on selected class
  const filteredAssignments = selectedClass === 'all'
    ? assignments
    : assignments.filter(assignment => assignment.className === selectedClass);

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      className: '',
      dueDate: '',
      attachmentUrl: '',
    });
    setIsEditMode(false);
    setCurrentAssignment(null);
  };

  const openModal = (assignment?: Assignment) => {
    if (assignment) {
      setIsEditMode(true);
      setCurrentAssignment(assignment);
      setFormData({
        title: assignment.title,
        description: assignment.description,
        className: assignment.className,
        dueDate: assignment.dueDate,
        attachmentUrl: assignment.attachmentUrl || '',
      });
    } else {
      resetForm();
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && currentAssignment) {
      // Update existing assignment
      const updatedAssignments = assignments.map(assignment => 
        assignment.id === currentAssignment.id 
          ? { 
              ...assignment, 
              title: formData.title,
              description: formData.description,
              className: formData.className,
              dueDate: formData.dueDate,
              attachmentUrl: formData.attachmentUrl,
            } 
          : assignment
      );
      setAssignments(updatedAssignments);
    } else {
      // Create new assignment
      const newAssignment: Assignment = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        className: formData.className,
        dueDate: formData.dueDate,
        createdAt: new Date().toISOString().split('T'),
        attachmentUrl: formData.attachmentUrl || undefined,
      };
      setAssignments([...assignments, newAssignment]);
    }
    
    closeModal();
  };

  const handleDeleteAssignment = (id: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(assignments.filter(assignment => assignment.id !== id));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Class Assignments</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow transition duration-200"
        >
          Create New Assignment
        </button>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-1/3">
            <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Class
            </label>
            <select
              id="classFilter"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.name}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-2/3 text-right text-sm text-gray-600">
            <p>Showing {filteredAssignments.length} assignments</p>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{assignment.title}</h3>
                  <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {assignment.className}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{assignment.description}</p>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Due:</span> {assignment.dueDate}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {assignment.createdAt}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
                {assignment.attachmentUrl && (
                  <a 
                    href={assignment.attachmentUrl} 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View Attachment
                  </a>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(assignment)}
                    className="text-gray-600 hover:text-blue-600 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    className="text-gray-600 hover:text-red-600 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No assignments found for the selected class.</p>
          </div>
        )}
      </div>

      {/* Modal for Creating/Editing Assignment */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                {isEditMode ? 'Edit Assignment' : 'Create New Assignment'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select
                  id="className"
                  name="className"
                  value={formData.className}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.name}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="attachmentUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Attachment URL (optional)
                  </label>
                  <input
                    type="url"
                    id="attachmentUrl"
                    name="attachmentUrl"
                    value={formData.attachmentUrl}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    placeholder="https://example.com/file.pdf"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow transition duration-200"
                >
                  {isEditMode ? 'Update Assignment' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassAssignmentManager;