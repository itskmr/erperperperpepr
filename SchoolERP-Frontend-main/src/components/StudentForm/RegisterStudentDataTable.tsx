import React, { useEffect, useState } from "react";
import { Eye, Edit, Trash2, Search, Download, X } from "lucide-react";

type Student = {
  formNo: string;
  fullName: string;
  gender: string;
  regnDate: string;
  paymentStatus: string;
  studentId?: string;
  className?: string;
  mobileNumber?: string;
  email?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  religion?: string;
  category?: string;
  caste?: string;
  address?: {
    street?: string;
    houseNo?: string;
    city?: string;
    state?: string;
    pinCode?: string;
  };
  father?: {
    name?: string;
    qualification?: string;
    occupation?: string;
    email?: string;
    contactNumber?: string;
    aadhaarNo?: string;
    annualIncome?: string;
    isCampusEmployee?: string;
  };
  mother?: {
    name?: string;
    qualification?: string;
    occupation?: string;
    email?: string;
    contactNumber?: string;
    aadhaarNo?: string;
    annualIncome?: string;
    isCampusEmployee?: string;
  };
  guardian?: {
    name?: string;
    address?: string;
    contactNumber?: string;
  };
};

// Add type for API response
type StudentResponse = {
  formNo?: string;
  admissionNo?: string;
  fullName: string;
  gender: string;
  regnDate?: string;
  registrationDate?: string;
  paymentStatus?: string;
  studentId?: string;
  className?: string;
  registerForClass?: string;
  mobileNumber?: string;
  contactNo?: string;
  email?: string;
  [key: string]: string | undefined; // For any additional fields
};

const RegisterStudentDataTable: React.FC = () => {
  const [studentData, setStudentData] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Student>('formNo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

    const fetchStudents = async () => {
      try {
      const response = await fetch("http://localhost:5000/api/students");
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }
        const data = await response.json();
      // Ensure all required fields are present and properly formatted
      const formattedData = data.data.map((student: StudentResponse) => ({
        ...student,
        formNo: student.formNo || student.admissionNo || '',
        regnDate: student.regnDate || student.registrationDate || new Date().toISOString(),
        paymentStatus: student.paymentStatus || 'Pending',
        email: student.email || '',
        mobileNumber: student.mobileNumber || student.contactNo || '',
        className: student.className || student.registerForClass || '',
      }));
      setStudentData(formattedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

  const handleSort = (field: keyof Student) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    // Initialize form data with all student fields
      setFormData({
      fullName: student.fullName || '',
      className: student.className || '',
      gender: student.gender || '',
      mobileNumber: student.mobileNumber || '',
      email: student.email || '',
      regnDate: student.regnDate || '',
      paymentStatus: student.paymentStatus || '',
      formNo: student.formNo || '',
      dateOfBirth: student.dateOfBirth || '',
      bloodGroup: student.bloodGroup || '',
      religion: student.religion || '',
      category: student.category || '',
      caste: student.caste || '',
      address: {
        street: student.address?.street || '',
        houseNo: student.address?.houseNo || '',
        city: student.address?.city || '',
        state: student.address?.state || '',
        pinCode: student.address?.pinCode || ''
      },
      father: {
        name: student.father?.name || '',
        qualification: student.father?.qualification || '',
        occupation: student.father?.occupation || '',
        email: student.father?.email || '',
        contactNumber: student.father?.contactNumber || '',
        aadhaarNo: student.father?.aadhaarNo || '',
        annualIncome: student.father?.annualIncome || '',
        isCampusEmployee: student.father?.isCampusEmployee || ''
      },
      mother: {
        name: student.mother?.name || '',
        qualification: student.mother?.qualification || '',
        occupation: student.mother?.occupation || '',
        email: student.mother?.email || '',
        contactNumber: student.mother?.contactNumber || '',
        aadhaarNo: student.mother?.aadhaarNo || '',
        annualIncome: student.mother?.annualIncome || '',
        isCampusEmployee: student.mother?.isCampusEmployee || ''
      },
      guardian: {
        name: student.guardian?.name || '',
        address: student.guardian?.address || '',
        contactNumber: student.guardian?.contactNumber || ''
      }
    });
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested object properties (e.g., address.houseNo, father.name)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        const parentObj = prev[parent as keyof typeof prev] as Record<string, string | undefined>;
        return {
          ...prev,
          [parent]: {
            ...(parentObj || {}),
            [child]: value
          }
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEditError(null);

    try {
      // Format the data before sending to match backend expectations
      const formattedData = {
        fullName: formData.fullName,
        className: formData.className,
        gender: formData.gender,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        admissionNo: formData.formNo, // Map formNo to admissionNo for backend
        regnDate: new Date(formData.regnDate || '').toISOString(),
        paymentStatus: formData.paymentStatus || 'Pending',
        dateOfBirth: formData.dateOfBirth,
        bloodGroup: formData.bloodGroup,
        religion: formData.religion,
        category: formData.category,
        caste: formData.caste,
        address: formData.address,
        father: formData.father,
        mother: formData.mother,
        guardian: formData.guardian
      };

      const response = await fetch(`http://localhost:5000/api/students/${selectedStudent?.studentId || selectedStudent?.formNo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update student');
      }

      setIsEditModalOpen(false);
      fetchStudents();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (studentId: string) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/students/${studentId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete student");
        }

    fetchStudents();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete student");
      }
    }
  };

  // Filter students based on search term and filters
  const filteredStudents = studentData.filter(student => {
    const matchesSearch = 
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.formNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.mobileNumber?.includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = filterClass ? student.className === filterClass : true;
    const matchesStatus = filterStatus ? student.paymentStatus === filterStatus : true;

    return matchesSearch && matchesClass && matchesStatus;
  });

  // Sort filtered students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const fieldA = a[sortField] || '';
    const fieldB = b[sortField] || '';
    
    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const exportToCSV = () => {
    const headers = ['Form No', 'Full Name', 'Gender', 'Class', 'Registration Date', 'Payment Status', 'Contact', 'Email'];
    const csvData = sortedStudents.map(student => [
      student.formNo,
      student.fullName,
      student.gender,
      student.className || '',
      student.regnDate,
      student.paymentStatus,
      student.mobileNumber || '',
      student.email || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'students.csv';
    link.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 rounded-2xl">
      {/* Total Students Count */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
          <p className="text-2xl font-semibold text-gray-900">{studentData.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Paid Students</h3>
          <p className="text-2xl font-semibold text-green-600">
            {studentData.filter(s => s.paymentStatus === 'Paid').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending Students</h3>
          <p className="text-2xl font-semibold text-yellow-600">
            {studentData.filter(s => s.paymentStatus === 'Pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Unpaid Students</h3>
          <p className="text-2xl font-semibold text-red-600">
            {studentData.filter(s => s.paymentStatus === 'Unpaid').length}
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col md:flex-row md:space-x-3 space-y-3 md:space-y-0 mb-4 md:mb-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, form no, class..."
              className="pl-10 pr-4 py-2 border rounded-md w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-3">
            <select
              className="px-4 py-2 border rounded-md"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {Array.from(new Set(studentData.map(s => s.className).filter(Boolean))).map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <select
              className="px-4 py-2 border rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            className="px-4 py-2 border rounded-md flex items-center hover:bg-gray-50"
            onClick={exportToCSV}
            disabled={sortedStudents.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </button>
          <button 
            className="px-4 py-2 border rounded-md flex items-center hover:bg-gray-50"
            onClick={() => {
              setSearchTerm('');
              setFilterClass('');
              setFilterStatus('');
              setSortField('formNo');
              setSortDirection('asc');
            }}
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Student Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('formNo')}
              >
                <div className="flex items-center">
                  Form No
                  {sortField === 'formNo' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('fullName')}
              >
                <div className="flex items-center">
                  Student Name
                  {sortField === 'fullName' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('className')}
              >
                <div className="flex items-center">
                  Class
                  {sortField === 'className' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('mobileNumber')}
              >
                <div className="flex items-center">
                  Contact
                  {sortField === 'mobileNumber' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('regnDate')}
              >
                <div className="flex items-center">
                  Registration Date
                  {sortField === 'regnDate' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('paymentStatus')}
              >
                <div className="flex items-center">
                  Payment Status
                  {sortField === 'paymentStatus' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            ) : (
              sortedStudents.map((student) => (
                <tr key={student.formNo} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.formNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.className || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.mobileNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.regnDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      student.paymentStatus === 'Paid' 
                        ? 'bg-green-100 text-green-800'
                        : student.paymentStatus === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleView(student)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Edit Student"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.studentId || student.formNo)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Student"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Student Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div className="col-span-3">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-semibold text-gray-600">Full Name</p>
                    <p className="mt-1">{selectedStudent.fullName}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Form No</p>
                    <p className="mt-1">{selectedStudent.formNo}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Class</p>
                    <p className="mt-1">{selectedStudent.className || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Gender</p>
                    <p className="mt-1">{selectedStudent.gender}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Date of Birth</p>
                    <p className="mt-1">{selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() : '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Blood Group</p>
                    <p className="mt-1">{selectedStudent.bloodGroup || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Religion</p>
                    <p className="mt-1">{selectedStudent.religion || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Category</p>
                    <p className="mt-1">{selectedStudent.category || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Caste</p>
                    <p className="mt-1">{selectedStudent.caste || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="col-span-3">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-semibold text-gray-600">Contact</p>
                    <p className="mt-1">{selectedStudent.mobileNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Email</p>
                    <p className="mt-1">{selectedStudent.email || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Registration Date</p>
                    <p className="mt-1">{new Date(selectedStudent.regnDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="col-span-3">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-semibold text-gray-600">House No</p>
                    <p className="mt-1">{selectedStudent.address?.houseNo || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Street</p>
                    <p className="mt-1">{selectedStudent.address?.street || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">City</p>
                    <p className="mt-1">{selectedStudent.address?.city || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">State</p>
                    <p className="mt-1">{selectedStudent.address?.state || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Pin Code</p>
                    <p className="mt-1">{selectedStudent.address?.pinCode || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Father's Information */}
              <div className="col-span-3">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Father's Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-semibold text-gray-600">Name</p>
                    <p className="mt-1">{selectedStudent.father?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Qualification</p>
                    <p className="mt-1">{selectedStudent.father?.qualification || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Occupation</p>
                    <p className="mt-1">{selectedStudent.father?.occupation || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Contact</p>
                    <p className="mt-1">{selectedStudent.father?.contactNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Email</p>
                    <p className="mt-1">{selectedStudent.father?.email || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Aadhaar No</p>
                    <p className="mt-1">{selectedStudent.father?.aadhaarNo || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Annual Income</p>
                    <p className="mt-1">{selectedStudent.father?.annualIncome || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Campus Employee</p>
                    <p className="mt-1">{selectedStudent.father?.isCampusEmployee || 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Mother's Information */}
              <div className="col-span-3">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Mother's Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-semibold text-gray-600">Name</p>
                    <p className="mt-1">{selectedStudent.mother?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Qualification</p>
                    <p className="mt-1">{selectedStudent.mother?.qualification || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Occupation</p>
                    <p className="mt-1">{selectedStudent.mother?.occupation || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Contact</p>
                    <p className="mt-1">{selectedStudent.mother?.contactNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Email</p>
                    <p className="mt-1">{selectedStudent.mother?.email || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Aadhaar No</p>
                    <p className="mt-1">{selectedStudent.mother?.aadhaarNo || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Annual Income</p>
                    <p className="mt-1">{selectedStudent.mother?.annualIncome || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Campus Employee</p>
                    <p className="mt-1">{selectedStudent.mother?.isCampusEmployee || 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Guardian's Information */}
              <div className="col-span-3">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Guardian's Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-semibold text-gray-600">Name</p>
                    <p className="mt-1">{selectedStudent.guardian?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Address</p>
                    <p className="mt-1">{selectedStudent.guardian?.address || '-'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Contact</p>
                    <p className="mt-1">{selectedStudent.guardian?.contactNumber || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="col-span-3">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Payment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-semibold text-gray-600">Payment Status</p>
                    <p className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedStudent.paymentStatus === 'Paid' 
                          ? 'bg-green-100 text-green-800'
                          : selectedStudent.paymentStatus === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedStudent.paymentStatus}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Student</h2>
            {editError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {editError}
              </div>
            )}
            <form onSubmit={handleEditSubmit}>
              {/* Basic Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Form No</label>
                    <input
                      type="text"
                      name="formNo"
                      value={formData.formNo || selectedStudent.formNo}
                      className="w-full p-2 border rounded bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Class</label>
                    <input
                      type="text"
                      name="className"
                      value={formData.className || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Blood Group</label>
                    <input
                      type="text"
                      name="bloodGroup"
                      value={formData.bloodGroup || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Contact</label>
                    <input
                      type="text"
                      name="mobileNumber"
                      value={formData.mobileNumber || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit mobile number"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Registration Date</label>
                    <input
                      type="date"
                      name="regnDate"
                      value={formData.regnDate ? new Date(formData.regnDate).toISOString().split('T')[0] : ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">House No</label>
                    <input
                      type="text"
                      name="address.houseNo"
                      value={formData.address?.houseNo || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Street</label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address?.street || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">City</label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address?.city || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">State</label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address?.state || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Pin Code</label>
                    <input
                      type="text"
                      name="address.pinCode"
                      value={formData.address?.pinCode || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      pattern="[0-9]{6}"
                      title="Please enter a valid 6-digit pin code"
                    />
                  </div>
                </div>
              </div>

              {/* Father's Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Father's Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Name</label>
                    <input
                      type="text"
                      name="father.name"
                      value={formData.father?.name || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Qualification</label>
                    <input
                      type="text"
                      name="father.qualification"
                      value={formData.father?.qualification || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Occupation</label>
                    <input
                      type="text"
                      name="father.occupation"
                      value={formData.father?.occupation || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Contact</label>
                    <input
                      type="text"
                      name="father.contactNumber"
                      value={formData.father?.contactNumber || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit mobile number"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      name="father.email"
                      value={formData.father?.email || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Aadhaar No</label>
                    <input
                      type="text"
                      name="father.aadhaarNo"
                      value={formData.father?.aadhaarNo || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      pattern="[0-9]{12}"
                      title="Please enter a valid 12-digit Aadhaar number"
                    />
                  </div>
                </div>
              </div>

              {/* Mother's Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Mother's Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Name</label>
                    <input
                      type="text"
                      name="mother.name"
                      value={formData.mother?.name || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Qualification</label>
                    <input
                      type="text"
                      name="mother.qualification"
                      value={formData.mother?.qualification || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Occupation</label>
                    <input
                      type="text"
                      name="mother.occupation"
                      value={formData.mother?.occupation || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Contact</label>
                    <input
                      type="text"
                      name="mother.contactNumber"
                      value={formData.mother?.contactNumber || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit mobile number"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      name="mother.email"
                      value={formData.mother?.email || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Aadhaar No</label>
                    <input
                      type="text"
                      name="mother.aadhaarNo"
                      value={formData.mother?.aadhaarNo || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      pattern="[0-9]{12}"
                      title="Please enter a valid 12-digit Aadhaar number"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Payment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-600 mb-1">Payment Status</label>
                    <select
                      name="paymentStatus"
                      value={formData.paymentStatus || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditError(null);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterStudentDataTable;
