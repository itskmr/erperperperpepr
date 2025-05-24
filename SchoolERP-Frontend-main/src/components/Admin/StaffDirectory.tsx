import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Download,
  UserPlus,
  School,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for schools (matching the schools from ManageSchools)
const MOCK_SCHOOLS = [
  { 
    id: 1, 
    name: 'Greenfield International School', 
    code: 'GIS001'
  },
  { 
    id: 2, 
    name: 'Sunshine Public School', 
    code: 'SPS002'
  },
  { 
    id: 3, 
    name: 'Excellence Academy', 
    code: 'EA003'
  },
  { 
    id: 4, 
    name: 'Heritage School of Arts', 
    code: 'HSA004'
  },
  { 
    id: 5, 
    name: 'Modern School of Technology', 
    code: 'MST005'
  },
];

// Mock data for staff members
const MOCK_STAFF = [
  {
    id: 1,
    name: 'Dr. James Wilson',
    email: 'james.wilson@greenfield.edu',
    phone: '+91 9876543001',
    designation: 'Principal',
    department: 'Administration',
    joinDate: '2018-06-15',
    address: '45 Park Avenue, Knowledge City',
    schoolId: 1, // Greenfield International School
    status: 'active',
    education: 'Ph.D. in Education Management',
    experience: '15 years',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 2,
    name: 'Ms. Emily Parker',
    email: 'emily.parker@greenfield.edu',
    phone: '+91 9876543002',
    designation: 'Vice Principal',
    department: 'Administration',
    joinDate: '2019-03-10',
    address: '22 Lake View, Knowledge City',
    schoolId: 1, // Greenfield International School
    status: 'active',
    education: 'M.Ed. in Educational Leadership',
    experience: '12 years',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 3,
    name: 'Mr. Robert Chen',
    email: 'robert.chen@greenfield.edu',
    phone: '+91 9876543003',
    designation: 'Mathematics Teacher',
    department: 'Mathematics',
    joinDate: '2020-07-05',
    address: '78 Green Street, Knowledge City',
    schoolId: 1, // Greenfield International School
    status: 'active',
    education: 'M.Sc. in Mathematics',
    experience: '8 years',
    profileImage: 'https://randomuser.me/api/portraits/men/64.jpg'
  },
  {
    id: 4,
    name: 'Mrs. Sarah Johnson',
    email: 'sarah.johnson@sunshine.edu',
    phone: '+91 9876543004',
    designation: 'Principal',
    department: 'Administration',
    joinDate: '2017-08-20',
    address: '15 Sunshine Road, Wisdom Town',
    schoolId: 2, // Sunshine Public School
    status: 'active',
    education: 'Ed.D. in Educational Administration',
    experience: '18 years',
    profileImage: 'https://randomuser.me/api/portraits/women/28.jpg'
  },
  {
    id: 5,
    name: 'Mr. David Miller',
    email: 'david.miller@sunshine.edu',
    phone: '+91 9876543005',
    designation: 'Science Teacher',
    department: 'Science',
    joinDate: '2019-06-12',
    address: '33 Bright Avenue, Wisdom Town',
    schoolId: 2, // Sunshine Public School
    status: 'inactive',
    education: 'M.Sc. in Physics',
    experience: '7 years',
    profileImage: 'https://randomuser.me/api/portraits/men/45.jpg'
  },
  {
    id: 6,
    name: 'Ms. Jennifer Lee',
    email: 'jennifer.lee@excellence.edu',
    phone: '+91 9876543006',
    designation: 'Principal',
    department: 'Administration',
    joinDate: '2016-05-18',
    address: '56 Scholar Lane, Brilliance City',
    schoolId: 3, // Excellence Academy
    status: 'active',
    education: 'Ph.D. in Educational Psychology',
    experience: '14 years',
    profileImage: 'https://randomuser.me/api/portraits/women/36.jpg'
  },
  {
    id: 7,
    name: 'Mr. Michael Brown',
    email: 'michael.brown@excellence.edu',
    phone: '+91 9876543007',
    designation: 'English Teacher',
    department: 'Languages',
    joinDate: '2020-02-15',
    address: '89 Excellence Road, Brilliance City',
    schoolId: 3, // Excellence Academy
    status: 'active',
    education: 'M.A. in English Literature',
    experience: '6 years',
    profileImage: 'https://randomuser.me/api/portraits/men/22.jpg'
  },
  {
    id: 8,
    name: 'Dr. Lisa Wong',
    email: 'lisa.wong@heritage.edu',
    phone: '+91 9876543008',
    designation: 'Arts Director',
    department: 'Fine Arts',
    joinDate: '2018-09-01',
    address: '12 Heritage Lane, Heritage District',
    schoolId: 4, // Heritage School of Arts
    status: 'active',
    education: 'Ph.D. in Fine Arts',
    experience: '11 years',
    profileImage: 'https://randomuser.me/api/portraits/women/54.jpg'
  },
  {
    id: 9,
    name: 'Prof. Alan Turing',
    email: 'alan.turing@moderntech.edu',
    phone: '+91 9876543009',
    designation: 'Computer Science Head',
    department: 'Technology',
    joinDate: '2019-01-15',
    address: '42 Innovation Street, Tech Park',
    schoolId: 5, // Modern School of Technology
    status: 'active',
    education: 'Ph.D. in Computer Science',
    experience: '16 years',
    profileImage: 'https://randomuser.me/api/portraits/men/67.jpg'
  },
  {
    id: 10,
    name: 'Ms. Grace Hopper',
    email: 'grace.hopper@moderntech.edu',
    phone: '+91 9876543010',
    designation: 'Programming Instructor',
    department: 'Technology',
    joinDate: '2020-03-10',
    address: '101 Code Avenue, Tech Park',
    schoolId: 5, // Modern School of Technology
    status: 'active',
    education: 'M.Sc. in Computer Engineering',
    experience: '9 years',
    profileImage: 'https://randomuser.me/api/portraits/women/62.jpg'
  }
];

interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  joinDate: string;
  address: string;
  schoolId: number;
  status: string;
  education: string;
  experience: string;
  profileImage: string;
}

interface School {
  id: number;
  name: string;
  code: string;
}

const StaffDirectory: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [schoolFilter, setSchoolFilter] = useState<number | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const itemsPerPage = 5;
  const modalRef = useRef<HTMLDivElement>(null);

  // Get unique departments from staff data
  const departments = Array.from(new Set(staff.map(member => member.department)));

  // Filter staff based on search term, school, department and status
  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSchool = 
      schoolFilter === 'all' || 
      member.schoolId === schoolFilter;
    
    const matchesDepartment = 
      departmentFilter === 'all' || 
      member.department === departmentFilter;
    
    const matchesStatus = 
      statusFilter === 'all' || 
      member.status === statusFilter;
    
    return matchesSearch && matchesSchool && matchesDepartment && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);

  // Get school name by ID
  const getSchoolName = (schoolId: number) => {
    const school = MOCK_SCHOOLS.find(s => s.id === schoolId);
    return school ? school.name : 'Unknown School';
  };

  // Handle view staff profile
  const handleViewProfile = (member: StaffMember) => {
    setSelectedStaff(member);
    setIsProfileOpen(true);
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, schoolFilter, departmentFilter, statusFilter]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Users className="h-6 w-6 mr-2 text-indigo-600" />
          Staff Directory
        </h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300">
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Staff
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full lg:w-64">
          <input
            type="text"
            placeholder="Search staff..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center space-x-2">
            <School className="h-4 w-4 text-gray-500" />
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={schoolFilter === 'all' ? 'all' : schoolFilter.toString()}
              onChange={(e) => setSchoolFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            >
              <option value="all">All Schools</option>
              {MOCK_SCHOOLS.map(school => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4 text-gray-500" />
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map(department => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
          
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

      {/* Staff Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff Member
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
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
            <AnimatePresence>
              {currentStaff.length > 0 ? (
                currentStaff.map((member) => (
                  <motion.tr 
                    key={member.id} 
                    className="hover:bg-gray-50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={member.profileImage} 
                            alt={member.name} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.designation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-500" />
                          {member.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-gray-500" />
                          {member.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getSchoolName(member.schoolId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {member.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleViewProfile(member)}
                          className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded-full"
                          title="View Profile"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No staff members found. Try adjusting your search or filters.
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredStaff.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(indexOfLastItem, filteredStaff.length)}
            </span>{' '}
            of <span className="font-medium">{filteredStaff.length}</span> staff members
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Staff Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && selectedStaff && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              ref={modalRef}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Staff Profile
                </h2>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-indigo-100">
                    <img 
                      src={selectedStaff.profileImage} 
                      alt={selectedStaff.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 text-center">{selectedStaff.name}</h3>
                  <p className="text-indigo-600 font-medium text-center">{selectedStaff.designation}</p>
                  <div className="mt-2 flex justify-center">
                    <span 
                      className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                        selectedStaff.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedStaff.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-xs text-gray-500 uppercase">School</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        <School className="h-4 w-4 mr-2 text-indigo-500" />
                        {getSchoolName(selectedStaff.schoolId)}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-xs text-gray-500 uppercase">Department</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-indigo-500" />
                        {selectedStaff.department}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-xs text-gray-500 uppercase">Email</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-indigo-500" />
                        {selectedStaff.email}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-xs text-gray-500 uppercase">Phone</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-indigo-500" />
                        {selectedStaff.phone}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-xs text-gray-500 uppercase">Join Date</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                        {new Date(selectedStaff.joinDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-xs text-gray-500 uppercase">Experience</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedStaff.experience}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-500 uppercase">Education</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedStaff.education}
                    </p>
                  </div>
                  
                  <div className="mt-4 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-500 uppercase">Address</p>
                    <p className="text-sm font-medium text-gray-900 flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-indigo-500 mt-0.5" />
                      {selectedStaff.address}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffDirectory;