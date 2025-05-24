import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search,  Download, Edit, Trash2, X } from 'lucide-react';

// Define Student type
interface Student {
  id: number;
  name: string;
  admissionNo: string;
  class: string;
  feeStatus: 'Paid' | 'Partially Paid' | 'Unpaid';
  totalFees: number;
  paidAmount: number;
  dueAmount: number;
  lastPaymentDate?: string;
  fullName: string;
}

// StudentManagement Component
const StudentManagement = () => {
  // State management
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: 'John Doe',
      admissionNo: 'ST2024001',
      class: 'Grade 10',
      feeStatus: 'Paid',
      totalFees: 50000,
      paidAmount: 50000,
      dueAmount: 0,
      lastPaymentDate: '2024-02-15',
      fullName: 'John Doe',
    },
    {
      id: 2,
      name: 'Jane Smith',
      admissionNo: 'ST2024002',
      class: 'Grade 9',
      feeStatus: 'Partially Paid',
      totalFees: 45000,
      paidAmount: 30000,
      dueAmount: 15000,
      lastPaymentDate: '2024-01-20',
      fullName: 'Jane Smith',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      admissionNo: 'ST2024003',
      class: 'Grade 11',
      feeStatus: 'Unpaid',
      totalFees: 55000,
      paidAmount: 0,
      dueAmount: 55000,
      fullName: 'Mike Johnson',
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Student; direction: 'ascending' | 'descending' } | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [viewDetails, setViewDetails] = useState<number | null>(null);

  // Form state for adding/editing student
  const [formData, setFormData] = useState<Omit<Student, 'id' | 'dueAmount'>>({
    name: '',
    admissionNo: '',
    class: '',
    feeStatus: 'Unpaid',
    totalFees: 0,
    paidAmount: 0,
    lastPaymentDate: '',
    fullName: '',
  });

  // Available classes for dropdown
  const availableClasses = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const feeStatusOptions = ['Paid', 'Partially Paid', 'Unpaid'];

  // Helper Functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Partially Paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'Unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      admissionNo: '',
      class: '',
      feeStatus: 'Unpaid',
      totalFees: 0,
      paidAmount: 0,
      lastPaymentDate: '',
      fullName: '',
    });
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'totalFees' || name === 'paidAmount') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle student addition
  const handleAddStudent = () => {
    const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    const dueAmount = formData.totalFees - formData.paidAmount;
    
    // Determine fee status based on payment
    let calculatedFeeStatus: 'Paid' | 'Partially Paid' | 'Unpaid';
    if (formData.paidAmount === 0) {
      calculatedFeeStatus = 'Unpaid';
    } else if (formData.paidAmount >= formData.totalFees) {
      calculatedFeeStatus = 'Paid';
    } else {
      calculatedFeeStatus = 'Partially Paid';
    }
    
    const newStudent: Student = {
      id: newId,
      ...formData,
      feeStatus: calculatedFeeStatus,
      dueAmount: Math.max(0, dueAmount),
      paidAmount: Math.min(formData.paidAmount, formData.totalFees),
      fullName: formData.name,
    };
    
    setStudents([...students, newStudent]);
    resetForm();
    setShowAddForm(false);
  };

  // Handle student update
  const handleUpdateStudent = () => {
    if (!editingStudent) return;
    
    const dueAmount = formData.totalFees - formData.paidAmount;
    
    // Determine fee status based on payment
    let calculatedFeeStatus: 'Paid' | 'Partially Paid' | 'Unpaid';
    if (formData.paidAmount === 0) {
      calculatedFeeStatus = 'Unpaid';
    } else if (formData.paidAmount >= formData.totalFees) {
      calculatedFeeStatus = 'Paid';
    } else {
      calculatedFeeStatus = 'Partially Paid';
    }
    
    const updatedStudents = students.map(student => {
      if (student.id === editingStudent.id) {
        return {
          ...student,
          ...formData,
          feeStatus: calculatedFeeStatus,
          dueAmount: Math.max(0, dueAmount),
          paidAmount: Math.min(formData.paidAmount, formData.totalFees),
          fullName: formData.name,
        };
      }
      return student;
    });
    
    setStudents(updatedStudents);
    setEditingStudent(null);
    resetForm();
  };

  // Handle student deletion
  const handleDeleteStudent = (id: number) => {
    setStudents(students.filter(student => student.id !== id));
    // If the deleted student was being viewed, close the details view
    if (viewDetails === id) {
      setViewDetails(null);
    }
  };

  // Handle student edit
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      admissionNo: student.admissionNo,
      class: student.class,
      feeStatus: student.feeStatus,
      totalFees: student.totalFees,
      paidAmount: student.paidAmount,
      lastPaymentDate: student.lastPaymentDate || '',
      fullName: student.fullName,
    });
  };

  // Handle sorting
  const handleSort = (key: keyof Student) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  // Handle bulk selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedStudents([...selectedStudents, id]);
    } else {
      setSelectedStudents(selectedStudents.filter(studentId => studentId !== id));
    }
  };

  // Export functions
  const exportToCSV = () => {
    let dataToExport = students;
    
    // If there are selected students, export only those
    if (selectedStudents.length > 0) {
      dataToExport = students.filter(student => selectedStudents.includes(student.id));
    }
    
    // Create CSV header and rows
    const headers = ['Name', 'Admission No', 'Class', 'Fee Status', 'Total Fees', 'Paid Amount', 'Due Amount', 'Last Payment Date'];
    const rows = dataToExport.map(student => [
      student.name,
      student.admissionNo,
      student.class,
      student.feeStatus,
      student.totalFees,
      student.paidAmount,
      student.dueAmount,
      student.lastPaymentDate || 'Not available'
    ]);
    
    // Combine headers and rows
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_fee_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and sort students
  let filteredStudents = [...students];
  
  // Apply search filter
  if (searchTerm) {
    filteredStudents = filteredStudents.filter(
      student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Apply class filter
  if (filterClass) {
    filteredStudents = filteredStudents.filter(student => student.class === filterClass);
  }
  
  // Apply status filter
  if (filterStatus) {
    filteredStudents = filteredStudents.filter(student => student.feeStatus === filterStatus);
  }
  
  // Apply sorting
  if (sortConfig) {
    filteredStudents.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue !== undefined && bValue !== undefined) {
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
      }
      return 0;
    });
  }

  // Get totals for dashboard
  const totalStudents = students.length;
  const totalFees = students.reduce((sum, student) => sum + student.totalFees, 0);
  const totalCollected = students.reduce((sum, student) => sum + student.paidAmount, 0);
  const totalDue = students.reduce((sum, student) => sum + student.dueAmount, 0);
  const paidStudents = students.filter(student => student.feeStatus === 'Paid').length;
  const partiallyPaidStudents = students.filter(student => student.feeStatus === 'Partially Paid').length;
  const unpaidStudents = students.filter(student => student.feeStatus === 'Unpaid').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Student Fee Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage student records, view fee status, and handle registrations.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button onClick={() => { resetForm(); setShowAddForm(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Dashboard Summary */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalStudents}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Fees</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">₹{totalFees.toLocaleString()}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Collected Amount</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">₹{totalCollected.toLocaleString()}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Due Amount</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">₹{totalDue.toLocaleString()}</dd>
          </div>
        </div>
      </div>

      {/* Fee Status Summary */}
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <dt className="text-sm font-medium text-gray-500 truncate">Fully Paid</dt>
            </div>
            <dd className="mt-1 text-3xl font-semibold text-green-600">{paidStudents}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              <dt className="text-sm font-medium text-gray-500 truncate">Partially Paid</dt>
            </div>
            <dd className="mt-1 text-3xl font-semibold text-yellow-600">{partiallyPaidStudents}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              <dt className="text-sm font-medium text-gray-500 truncate">Unpaid</dt>
            </div>
            <dd className="mt-1 text-3xl font-semibold text-red-600">{unpaidStudents}</dd>
          </div>
        </div>
      </div>

      {/* Search and filter section */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col md:flex-row md:space-x-3 space-y-3 md:space-y-0 mb-4 md:mb-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or admission no"
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
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <select
              className="px-4 py-2 border rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {feeStatusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            disabled={filteredStudents.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setFilterClass('');
              setFilterStatus('');
              setSortConfig(null);
              setSelectedStudents([]);
            }}
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Student Table */}
      <div className="mt-4 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th 
                      scope="col" 
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Name
                      {sortConfig?.key === 'name' && (
                        <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('admissionNo')}
                    >
                      Admission No
                      {sortConfig?.key === 'admissionNo' && (
                        <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('class')}
                    >
                      Class
                      {sortConfig?.key === 'class' && (
                        <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('feeStatus')}
                    >
                      Fee Status
                      {sortConfig?.key === 'feeStatus' && (
                        <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('totalFees')}
                    >
                      Total Fees
                      {sortConfig?.key === 'totalFees' && (
                        <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('paidAmount')}
                    >
                      Paid Amount
                      {sortConfig?.key === 'paidAmount' && (
                        <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('dueAmount')}
                    >
                      Due Amount
                      {sortConfig?.key === 'dueAmount' && (
                        <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                      )}
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className={selectedStudents.includes(student.id) ? 'bg-indigo-50' : ''}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                            checked={selectedStudents.includes(student.id)}
                            onChange={(e) => handleSelectStudent(e, student.id)}
                          />
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {student.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.admissionNo}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.class}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                              student.feeStatus
                            )}`}
                          >
                            {student.feeStatus}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          ₹{student.totalFees.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          ₹{student.paidAmount.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          ₹{student.dueAmount.toLocaleString()}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-indigo-600"
                            onClick={() => setViewDetails(student.id === viewDetails ? null : student.id)}
                          >
                            {student.id === viewDetails ? 'Hide Details' : 'View Details'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-indigo-600"
                            onClick={() => handleEditStudent(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600"
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-4 text-center text-gray-500">
                        No students match your search criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Student Details View */}
      {viewDetails !== null && (
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          {students.filter(s => s.id === viewDetails).map((student) => (
            <div key={student.id}>
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Student Information</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and fee information.</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setViewDetails(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Full name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.fullName}</dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Admission No</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.admissionNo}</dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Class</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.class}</dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Fee Status</dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                          student.feeStatus
                        )}`}
                      >
                        {student.feeStatus}

                        </span>
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Total Fees</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      ₹{student.totalFees.toLocaleString()}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Paid Amount</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      ₹{student.paidAmount.toLocaleString()}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Due Amount</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      ₹{student.dueAmount.toLocaleString()}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Last Payment Date</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {student.lastPaymentDate || 'No payment recorded'}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {student.paidAmount === 0 ? (
                        <span className="text-red-600">No payment made yet</span>
                      ) : student.paidAmount >= student.totalFees ? (
                        <span className="text-green-600">Fully paid</span>
                      ) : (
                        <span className="text-yellow-600">
                          {Math.round((student.paidAmount / student.totalFees) * 100)}% paid
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Student Form */}
      {(showAddForm || editingStudent) && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingStudent(null);
                  resetForm();
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="admissionNo" className="block text-sm font-medium text-gray-700">
                  Admission No
                </label>
                <input
                  type="text"
                  name="admissionNo"
                  id="admissionNo"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={formData.admissionNo}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="class" className="block text-sm font-medium text-gray-700">
                  Class
                </label>
                <select
                  name="class"
                  id="class"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={formData.class}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Class</option>
                  {availableClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="totalFees" className="block text-sm font-medium text-gray-700">
                  Total Fees
                </label>
                <input
                  type="number"
                  name="totalFees"
                  id="totalFees"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={formData.totalFees}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700">
                  Paid Amount
                </label>
                <input
                  type="number"
                  name="paidAmount"
                  id="paidAmount"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={formData.paidAmount}
                  onChange={handleInputChange}
                  min="0"
                  max={formData.totalFees}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="lastPaymentDate" className="block text-sm font-medium text-gray-700">
                  Last Payment Date
                </label>
                <input
                  type="date"
                  name="lastPaymentDate"
                  id="lastPaymentDate"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={formData.lastPaymentDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingStudent(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingStudent ? handleUpdateStudent : handleAddStudent}
                  disabled={!formData.name || !formData.admissionNo || !formData.class}
                >
                  {editingStudent ? 'Update' : 'Add'} Student
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;