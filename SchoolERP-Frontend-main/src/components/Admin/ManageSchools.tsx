import React, { useState, useEffect } from 'react';
import {
  School,
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Upload
} from 'lucide-react';

// Mock data for schools
const MOCK_SCHOOLS = [
  {
    id: 1,
    name: 'Greenfield International School',
    code: 'GIS001',
    address: '123 Education Lane, Knowledge City',
    contact: '+91 9876543210',
    email: 'info@greenfield.edu',
    principal: 'Dr. Sarah Johnson',
    status: 'active',
    students: 1250,
    teachers: 78,
    established: '2005'
  },
  {
    id: 2,
    name: 'Sunshine Public School',
    code: 'SPS002',
    address: '456 Learning Road, Wisdom Town',
    contact: '+91 9876543211',
    email: 'admin@sunshine.edu',
    principal: 'Mr. Robert Williams',
    status: 'active',
    students: 850,
    teachers: 45,
    established: '2010'
  },
  {
    id: 3,
    name: 'Excellence Academy',
    code: 'EA003',
    address: '789 Scholar Street, Brilliance City',
    contact: '+91 9876543212',
    email: 'info@excellence.edu',
    principal: 'Ms. Emily Chen',
    status: 'inactive',
    students: 620,
    teachers: 32,
    established: '2015'
  },
  {
    id: 4,
    name: 'Heritage School of Arts',
    code: 'HSA004',
    address: '101 Culture Avenue, Heritage District',
    contact: '+91 9876543213',
    email: 'contact@heritage.edu',
    principal: 'Dr. Michael Brown',
    status: 'active',
    students: 780,
    teachers: 41,
    established: '2008'
  },
  {
    id: 5,
    name: 'Modern School of Technology',
    code: 'MST005',
    address: '202 Innovation Boulevard, Tech Park',
    contact: '+91 9876543214',
    email: 'info@moderntech.edu',
    principal: 'Dr. Lisa Wong',
    status: 'active',
    students: 950,
    teachers: 60,
    established: '2012'
  },
];

interface SchoolData {
  id: number;
  name: string;
  code: string;
  address: string;
  contact: string;
  email: string;
  principal: string;
  status: string;
  students: number;
  teachers: number;
  established: string;
}

interface SchoolFormData {
  name: string;
  code: string;
  address: string;
  contact: string;
  email: string;
  password: string;
  principal: string;
  established: string;
}

const ManageSchools: React.FC = () => {
  const [schools, setSchools] = useState<SchoolData[]>(MOCK_SCHOOLS);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolData | null>(null);
  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    code: '',
    address: '',
    contact: '',
    email: '',
    password: "",
    principal: '',
    established: ''
  });
  const [statusFilter, setStatusFilter] = useState('all');

  const itemsPerPage = 5;

  // Filter schools based on search term and status
  const filteredSchools = schools.filter(school => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      school.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSchools = filteredSchools.slice(indexOfFirstItem, indexOfLastItem);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/addSchool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newSchool = await response.json();

        // // Add new school to state
        // setSchools([...schools, { ...newSchool, status: "active", students: 0, teachers: 0 }]);
        console.log("School added successfully:", newSchool);
      } else {
        console.error("Failed to add school");
      }
    } catch (error) {
      console.error("Error adding school:", error);
    }

    if (editingSchool) {
      // Update existing school
      const updatedSchools = schools.map(school =>
        school.id === editingSchool.id
          ? {
            ...school,
            ...formData
          }
          : school
      );
      setSchools(updatedSchools);
    } else {
      // Add new school
      const newSchool: SchoolData = {
        id: schools.length + 1,
        ...formData,
        status: 'active',
        students: 0,
        teachers: 0
      };
      setSchools([...schools, newSchool]);
    }

    // Reset form and state
    setShowForm(false);
    setEditingSchool(null);
    setFormData({
      name: '',
      code: '',
      address: '',
      contact: '',
      email: '',
      principal: '',
      established: '',
      password: '',
    });
  };

  // Handle edit school
  const handleEdit = (school: SchoolData) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      code: school.code,
      address: school.address,
      contact: school.contact,
      email: school.email,
      principal: school.principal,
      established: school.established,
      password: '',
    });
    setShowForm(true);
  };

  // Handle delete school
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this school?')) {
      setSchools(schools.filter(school => school.id !== id));
    }
  };

  // Handle toggle status
  const handleToggleStatus = (id: number) => {
    setSchools(schools.map(school =>
      school.id === id
        ? { ...school, status: school.status === 'active' ? 'inactive' : 'active' }
        : school
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <School className="h-6 w-6 mr-2 text-indigo-600" />
          Manage Schools
        </h1>
        <button
          onClick={() => {
            setEditingSchool(null);
            setFormData({
              name: '',
              code: '',
              address: '',
              contact: '',
              email: '',
              principal: '',
              established: '',
              password: ''
            });
            setShowForm(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New School
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search schools..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button className="flex items-center text-gray-600 hover:text-indigo-600 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-300">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* School Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingSchool ? 'Edit School' : 'Add New School'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School Code*
                  </label>
                  <input
                    type="text"
                    name="code"
                    required
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address*
                  </label>
                  <textarea
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number*
                  </label>
                  <input
                    type="text"
                    name="contact"
                    required
                    value={formData.contact}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address*
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password*
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Principal Name*
                  </label>
                  <input
                    type="text"
                    name="principal"
                    required
                    value={formData.principal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Established Year
                  </label>
                  <input
                    type="text"
                    name="established"
                    value={formData.established}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {editingSchool ? 'Update School' : 'Add School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schools Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Principal
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Students
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentSchools.length > 0 ? (
              currentSchools.map((school) => (
                <tr key={school.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-indigo-100 rounded-full">
                        <School className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{school.name}</div>
                        <div className="text-sm text-gray-500">Code: {school.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{school.email}</div>
                    <div className="text-sm text-gray-500">{school.contact}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{school.principal}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{school.students} Students</div>
                    <div className="text-sm text-gray-500">{school.teachers} Teachers</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${school.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {school.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleToggleStatus(school.id)}
                        className={`p-1 rounded-full ${school.status === 'active'
                          ? 'text-red-600 hover:bg-red-100'
                          : 'text-green-600 hover:bg-green-100'
                          }`}
                        title={school.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {school.status === 'active' ?
                          <XCircle className="h-5 w-5" /> :
                          <CheckCircle className="h-5 w-5" />
                        }
                      </button>
                      <button
                        onClick={() => handleEdit(school)}
                        className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded-full"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(school.id)}
                        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No schools found. Try adjusting your search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredSchools.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(indexOfLastItem, filteredSchools.length)}
            </span>{' '}
            of <span className="font-medium">{filteredSchools.length}</span> schools
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSchools;