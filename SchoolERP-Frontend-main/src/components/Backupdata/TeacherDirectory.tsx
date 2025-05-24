// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   User2, 
//   Search, 
//   ChevronLeft, 
//   ChevronRight,
//   Mail,
//   Phone,
//   Calendar,
//   MapPin,
//   Briefcase,
//   Download,
//   UserPlus,
//   Eye,
//   XCircle,
//   Edit,
//   Trash
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Toaster, toast } from 'react-hot-toast';

// const AVAILABLE_CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

// const MOCK_TEACHERS = [
//   {
//     id: 1,
//     name: 'Mr. Robert Chen',
//     email: 'robert.chen@greenfield.edu',
//     phone: '+91 9876543003',
//     designation: 'Mathematics Teacher',
//     subjects: ['Mathematics', 'Calculus'],
//     classes: '4, 5, 6',
//     sections: [
//       { class: '4', sections: ['A', 'B'] },
//       { class: '5', sections: ['A', 'C'] },
//       { class: '6', sections: ['B'] },
//     ],
//     joinDate: '2020-07-05',
//     address: '78 Green Street, Knowledge City',
//     education: 'M.Sc. in Mathematics',
//     experience: '8 years',
//     profileImage: 'https://randomuser.me/api/portraits/men/64.jpg',
//     isClassIncharge: true,
//     inchargeClass: '4',
//     inchargeSection: 'A',
//   },
//   {
//     id: 2,
//     name: 'Ms. Jennifer Lee',
//     email: 'jennifer.lee@excellence.edu',
//     phone: '+91 9876543006',
//     designation: 'English Teacher',
//     subjects: ['English Literature', 'Creative Writing'],
//     classes: '3, 4',
//     sections: [
//       { class: '3', sections: ['A'] },
//       { class: '4', sections: ['B'] },
//     ],
//     joinDate: '2016-05-18',
//     address: '56 Scholar Lane, Brilliance City',
//     education: 'M.A. in English Literature',
//     experience: '6 years',
//     profileImage: 'https://randomuser.me/api/portraits/women/36.jpg',
//     isClassIncharge: true,
//     inchargeClass: '3',
//     inchargeSection: 'A',
//   },
//   {
//     id: 3,
//     name: 'Mr. Michael Brown',
//     email: 'michael.brown@excellence.edu',
//     phone: '+91 9876543007',
//     designation: 'Science Teacher',
//     subjects: ['Physics', 'Chemistry'],
//     classes: '5, 6, 7',
//     sections: [
//       { class: '5', sections: ['A'] },
//       { class: '6', sections: ['A', 'B'] },
//       { class: '7', sections: ['A'] },
//     ],
//     joinDate: '2020-02-15',
//     address: '89 Excellence Road, Brilliance City',
//     education: 'M.Sc. in Physics',
//     experience: '7 years',
//     profileImage: 'https://randomuser.me/api/portraits/men/22.jpg',
//     isClassIncharge: true,
//     inchargeClass: '5',
//     inchargeSection: 'A',
//   },
//   {
//     id: 4,
//     name: 'Dr. Lisa Wong',
//     email: 'lisa.wong@heritage.edu',
//     phone: '+91 9876543008',
//     designation: 'Arts Teacher',
//     subjects: ['Fine Arts', 'Art History'],
//     classes: '2, 3',
//     sections: [
//       { class: '2', sections: ['A'] },
//       { class: '3', sections: ['A'] },
//     ],
//     joinDate: '2018-09-01',
//     address: '12 Heritage Lane, Heritage District',
//     education: 'Ph.D. in Fine Arts',
//     experience: '11 years',
//     profileImage: 'https://randomuser.me/api/portraits/women/54.jpg',
//     isClassIncharge: true,
//     inchargeClass: '2',
//     inchargeSection: 'A',
//   },
//   {
//     id: 5,
//     name: 'Prof. Alan Turing',
//     email: 'alan.turing@moderntech.edu',
//     phone: '+91 9876543009',
//     designation: 'Computer Science Teacher',
//     subjects: ['Computer Science', 'Algorithms'],
//     classes: '6, 7, 8',
//     sections: [
//       { class: '6', sections: ['A'] },
//       { class: '7', sections: ['A'] },
//       { class: '8', sections: ['A'] },
//     ],
//     joinDate: '2019-01-15',
//     address: '42 Innovation Street, Tech Park',
//     education: 'Ph.D. in Computer Science',
//     experience: '16 years',
//     profileImage: 'https://randomuser.me/api/portraits/men/67.jpg',
//     isClassIncharge: true,
//     inchargeClass: '6',
//     inchargeSection: 'A',
//   },
// ];

// interface Teacher {
//   id: number;
//   name: string;
//   email: string;
//   phone: string;
//   designation: string;
//   subjects: string[];
//   classes: string;
//   sections: {
//     class: string;
//     sections: string[];
//   }[];
//   joinDate: string;
//   address: string;
//   education: string;
//   experience: string;
//   profileImage: string;
//   isClassIncharge: boolean;
//   inchargeClass?: string;
//   inchargeSection?: string;
// }

// const TeacherDirectory: React.FC = () => {
//   const [teachers, setTeachers] = useState<Teacher[]>(MOCK_TEACHERS);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [subjectFilter, setSubjectFilter] = useState('all');
//   const [classFilter, setClassFilter] = useState('all');
//   const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({
//     subjects: [],
//     classes: '',
//     sections: [],
//   });
//   const [editTeacher, setEditTeacher] = useState<Partial<Teacher>>({
//     subjects: [],
//     classes: '',
//     sections: [],
//   });

//   const itemsPerPage = 5;
//   const modalRef = useRef<HTMLDivElement>(null);

//   const subjects = Array.from(new Set(teachers.flatMap(teacher => teacher.subjects)));

//   const filteredTeachers = teachers.filter(teacher => {
//     const matchesSearch = 
//       teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       teacher.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       teacher.subjects.some(subject => 
//         subject.toLowerCase().includes(searchTerm.toLowerCase())
//       );
    
//     const matchesSubject = 
//       subjectFilter === 'all' || 
//       teacher.subjects.includes(subjectFilter);
    
//     const matchesClass = 
//       classFilter === 'all' || 
//       teacher.sections.some(section => section.class === classFilter);
    
//     return matchesSearch && matchesSubject && matchesClass;
//   });

//   const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentTeachers = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);

//   const handleViewProfile = (teacher: Teacher) => {
//     setSelectedTeacher(teacher);
//     setIsProfileOpen(true);
//   };

//   const handleAddTeacher = () => setIsAddModalOpen(true);

//   const handleEditTeacher = (teacher: Teacher) => {
//     setEditTeacher(teacher);
//     setIsEditModalOpen(true);
//   };

//   const handleDeleteTeacher = (id: number) => {
//     if (window.confirm('Are you sure you want to delete this teacher?')) {
//       setTeachers(prev => prev.filter(teacher => teacher.id !== id));
//       toast.success('Teacher deleted successfully!', {
//         duration: 3000,
//         style: {
//           background: '#4338CA',
//           color: '#ffffff',
//           padding: '16px',
//           borderRadius: '8px',
//         },
//         iconTheme: {
//           primary: '#ffffff',
//           secondary: '#4338CA',
//         },
//       });
//     }
//   };

//   const validateInchargeClass = (value: string): string => {
//     const classes = value.replace(/\s/g, '').split(',');
//     return classes[0] || '';
//   };

//   const handleInputChange = (field: keyof Teacher, value: any) => {
//     if (field === 'inchargeClass') {
//       const formattedValue = validateInchargeClass(value);
//       setNewTeacher(prev => ({ ...prev, [field]: formattedValue }));
//     } else {
//       setNewTeacher(prev => ({ ...prev, [field]: value }));
//     }
//   };

//   const handleEditInputChange = (field: keyof Teacher, value: any) => {
//     if (field === 'inchargeClass') {
//       const formattedValue = validateInchargeClass(value);
//       setEditTeacher(prev => ({ ...prev, [field]: formattedValue }));
//     } else {
//       setEditTeacher(prev => ({ ...prev, [field]: value }));
//     }
//   };

//   const handleSubmit = () => {
//     // Validate incharge class and section if isClassIncharge is true
//     if (newTeacher.isClassIncharge) {
//       if (!newTeacher.inchargeClass || !newTeacher.inchargeSection) {
//         toast.error('Please select both incharge class and section', {
//           duration: 3000,
//           style: {
//             background: '#EF4444',
//             color: '#ffffff',
//             padding: '16px',
//             borderRadius: '8px',
//           },
//           iconTheme: {
//             primary: '#ffffff',
//             secondary: '#EF4444',
//           },
//         });
//         return;
//       }

//       // Check if another teacher is already incharge of this class and section
//       const existingIncharge = teachers.find(t => 
//         t.isClassIncharge && 
//         t.inchargeClass === newTeacher.inchargeClass && 
//         t.inchargeSection === newTeacher.inchargeSection
//       );

//       if (existingIncharge) {
//         toast.error(`${existingIncharge.name} is already incharge of Class ${newTeacher.inchargeClass} Section ${newTeacher.inchargeSection}`, {
//           duration: 3000,
//           style: {
//             background: '#EF4444',
//             color: '#ffffff',
//             padding: '16px',
//             borderRadius: '8px',
//           },
//           iconTheme: {
//             primary: '#ffffff',
//             secondary: '#EF4444',
//           },
//         });
//         return;
//       }
//     }

//     const teacherToAdd: Teacher = {
//       id: teachers.length + 1,
//       name: newTeacher.name || '',
//       email: newTeacher.email || '',
//       phone: newTeacher.phone || '',
//       designation: newTeacher.designation || '',
//       subjects: newTeacher.subjects || [],
//       classes: newTeacher.classes || '',
//       sections: newTeacher.sections || [],
//       joinDate: newTeacher.joinDate || new Date().toISOString().split('T')[0],
//       address: newTeacher.address || '',
//       education: newTeacher.education || '',
//       experience: newTeacher.experience || '',
//       profileImage: newTeacher.profileImage || 'https://randomuser.me/api/portraits/men/0.jpg',
//       isClassIncharge: newTeacher.isClassIncharge ?? false,
//       inchargeClass: newTeacher.isClassIncharge ? newTeacher.inchargeClass : undefined,
//       inchargeSection: newTeacher.isClassIncharge ? newTeacher.inchargeSection : undefined,
//     };
    
//     setTeachers(prev => [...prev, teacherToAdd]);
//     setIsAddModalOpen(false);
//     setNewTeacher({ subjects: [], classes: '', sections: [] });
//     toast.success('Teacher added successfully!', {
//       duration: 3000,
//       style: {
//         background: '#4338CA',
//         color: '#ffffff',
//         padding: '16px',
//         borderRadius: '8px',
//       },
//       iconTheme: {
//         primary: '#ffffff',
//         secondary: '#4338CA',
//       },
//     });
//   };

//   const handleEditSubmit = () => {
//     // Validate incharge class and section if isClassIncharge is true
//     if (editTeacher.isClassIncharge) {
//       if (!editTeacher.inchargeClass || !editTeacher.inchargeSection) {
//         toast.error('Please select both incharge class and section', {
//           duration: 3000,
//           style: {
//             background: '#EF4444',
//             color: '#ffffff',
//             padding: '16px',
//             borderRadius: '8px',
//           },
//           iconTheme: {
//             primary: '#ffffff',
//             secondary: '#EF4444',
//           },
//         });
//         return;
//       }

//       // Check if another teacher is already incharge of this class and section
//       const existingIncharge = teachers.find(t => 
//         t.id !== editTeacher.id && 
//         t.isClassIncharge && 
//         t.inchargeClass === editTeacher.inchargeClass && 
//         t.inchargeSection === editTeacher.inchargeSection
//       );

//       if (existingIncharge) {
//         toast.error(`${existingIncharge.name} is already incharge of Class ${editTeacher.inchargeClass} Section ${editTeacher.inchargeSection}`, {
//           duration: 3000,
//           style: {
//             background: '#EF4444',
//             color: '#ffffff',
//             padding: '16px',
//             borderRadius: '8px',
//           },
//           iconTheme: {
//             primary: '#ffffff',
//             secondary: '#EF4444',
//           },
//         });
//         return;
//       }
//     }

//     const updatedTeachers = teachers.map(teacher => 
//       teacher.id === editTeacher.id ? { ...teacher, ...editTeacher } : teacher
//     );
//     setTeachers(updatedTeachers);
//     setIsEditModalOpen(false);
//     toast.success('Teacher updated successfully!', {
//       duration: 3000,
//       style: {
//         background: '#4338CA',
//         color: '#ffffff',
//         padding: '16px',
//         borderRadius: '8px',
//       },
//       iconTheme: {
//         primary: '#ffffff',
//         secondary: '#4338CA',
//       },
//     });
//   };

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
//         setIsProfileOpen(false);
//         setIsAddModalOpen(false);
//         setIsEditModalOpen(false);
//       }
//     };

//     if (isProfileOpen || isAddModalOpen || isEditModalOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }
    
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [isProfileOpen, isAddModalOpen, isEditModalOpen]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm, subjectFilter, classFilter]);

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <Toaster position="top-right" />

//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800 flex items-center">
//           <User2 className="h-6 w-6 mr-2 text-indigo-600" />
//           Teacher Directory
//         </h1>
//         <button 
//           className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300"
//           onClick={handleAddTeacher}
//         >
//           <UserPlus className="h-4 w-4 mr-2" />
//           Add New Teacher
//         </button>
//       </div>

//       <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
//         <div className="relative w-full lg:w-64">
//           <input
//             type="text"
//             placeholder="Search teachers..."
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//         </div>
        
//         <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
//           <div className="flex items-center space-x-2">
//             <Briefcase className="h-4 w-4 text-gray-500" />
//             <select
//               className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//               value={subjectFilter}
//               onChange={(e) => setSubjectFilter(e.target.value)}
//             >
//               <option value="all">All Subjects</option>
//               {subjects.map(subject => (
//                 <option key={subject} value={subject}>
//                   {subject}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex items-center space-x-2">
//             <User2 className="h-4 w-4 text-gray-500" />
//             <select
//               className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//               value={classFilter}
//               onChange={(e) => setClassFilter(e.target.value)}
//             >
//               <option value="all">All Classes</option>
//               {AVAILABLE_CLASSES.map(classNum => (
//                 <option key={classNum} value={classNum}>
//                   Class {classNum}
//                 </option>
//               ))}
//             </select>
//           </div>
          
//           <button className="flex items-center text-gray-600 hover:text-indigo-600 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-300">
//             <Download className="h-4 w-4 mr-2" />
//             Export
//           </button>
//         </div>
//       </div>

//       <div className="overflow-x-auto -mx-4 sm:mx-0">
//         <div className="inline-block min-w-full align-middle">
//           <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
//                     Teacher
//                   </th>
//                   <th scope="col" className="hidden sm:table-cell px-3 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
//                     Contact Info
//                   </th>
//                   <th scope="col" className="hidden md:table-cell px-3 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
//                     Subjects
//                   </th>
//                   <th scope="col" className="hidden lg:table-cell px-3 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
//                     Class Incharge
//                   </th>
//                   <th scope="col" className="hidden lg:table-cell px-3 py-2 sm:px-6 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
//                     Incharge Details
//                   </th>
//                   <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 <AnimatePresence>
//                   {currentTeachers.length > 0 ? (
//                     currentTeachers.map((teacher) => (
//                       <motion.tr 
//                         key={teacher.id} 
//                         className="hover:bg-gray-50"
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -20 }}
//                         transition={{ duration: 0.3 }}
//                       >
//                         <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
//                           <div className="flex items-center">
//                             <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
//                               <img 
//                                 className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover" 
//                                 src={teacher.profileImage} 
//                                 alt={teacher.name} 
//                               />
//                             </div>
//                             <div className="ml-2 sm:ml-4">
//                               <div className="text-xs sm:text-sm font-medium text-gray-900">{teacher.name}</div>
//                               <div className="text-xs text-gray-500">{teacher.designation}</div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="hidden sm:table-cell px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
//                           <div className="flex flex-col">
//                             <div className="text-xs sm:text-sm text-gray-900 flex items-center">
//                               <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-gray-500" />
//                               {teacher.email}
//                             </div>
//                             <div className="text-xs sm:text-sm text-gray-500 flex items-center">
//                               <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-gray-500" />
//                               {teacher.phone}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="hidden md:table-cell px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
//                           <div className="text-xs sm:text-sm text-gray-900">{teacher.subjects.join(', ')}</div>
//                         </td>
//                         <td className="hidden lg:table-cell px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
//                           <div className="text-xs sm:text-sm text-gray-900">
//                             {teacher.isClassIncharge ? 'Yes' : 'No'}
//                           </div>
//                         </td>
//                         <td className="hidden lg:table-cell px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
//                           {teacher.isClassIncharge ? (
//                             <div className="text-xs sm:text-sm text-gray-900">
//                               <span className="font-medium">Class {teacher.inchargeClass}</span>
//                               {teacher.sections.find(s => s.class === teacher.inchargeClass)?.sections.length > 0 && (
//                                 <span className="ml-2 text-gray-500">
//                                   (Section {teacher.sections.find(s => s.class === teacher.inchargeClass)?.sections.join(', ')})
//                                 </span>
//                               )}
//                             </div>
//                           ) : (
//                             <span className="text-xs sm:text-sm text-gray-500">-</span>
//                           )}
//                         </td>
//                         <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
//                           <div className="flex justify-end space-x-1 sm:space-x-2">
//                             <button 
//                               onClick={() => handleViewProfile(teacher)}
//                               className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded-full"
//                               title="View Profile"
//                             >
//                               <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
//                             </button>
//                             <button 
//                               onClick={() => handleEditTeacher(teacher)}
//                               className="p-1 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100 rounded-full"
//                               title="Edit"
//                             >
//                               <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
//                             </button>
//                             <button 
//                               onClick={() => handleDeleteTeacher(teacher.id)}
//                               className="p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full"
//                               title="Delete"
//                             >
//                               <Trash className="h-4 w-4 sm:h-5 sm:w-5" />
//                             </button>
//                           </div>
//                         </td>
//                       </motion.tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan={6} className="px-3 py-4 sm:px-6 text-center text-sm text-gray-500">
//                         No teachers found. Try adjusting your search or filters.
//                       </td>
//                     </tr>
//                   )}
//                 </AnimatePresence>
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {filteredTeachers.length > 0 && (
//         <div className="flex justify-between items-center mt-6">
//           <div className="text-sm text-gray-700">
//             Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
//             <span className="font-medium">
//               {Math.min(indexOfLastItem, filteredTeachers.length)}
//             </span>{' '}
//             of <span className="font-medium">{filteredTeachers.length}</span> teachers
//           </div>
//           <div className="flex space-x-2">
//             <button
//               onClick={() => setCurrentPage(currentPage - 1)}
//               disabled={currentPage === 1}
//               className={`px-3 py-1 rounded-md ${
//                 currentPage === 1
//                   ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                   : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
//               }`}
//             >
//               <ChevronLeft className="h-5 w-5" />
//             </button>
//             <button
//               onClick={() => setCurrentPage(currentPage + 1)}
//               disabled={currentPage === totalPages}
//               className={`px-3 py-1 rounded-md ${
//                 currentPage === totalPages
//                   ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                   : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
//               }`}
//             >
//               <ChevronRight className="h-5 w-5" />
//             </button>
//           </div>
//         </div>
//       )}

//       <AnimatePresence>
//         {isProfileOpen && selectedTeacher && (
//           <motion.div 
//             className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div 
//               ref={modalRef}
//               className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
//               initial={{ scale: 0.9, y: 20 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.9, y: 20 }}
//               transition={{ type: "spring", stiffness: 300, damping: 30 }}
//             >
//               <div className="flex justify-between items-start mb-6">
//                 <h2 className="text-xl font-bold text-gray-800">
//                   Teacher Profile
//                 </h2>
//                 <button
//                   onClick={() => setIsProfileOpen(false)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <XCircle className="h-6 w-6" />
//                 </button>
//               </div>
              
//               <div className="flex flex-col md:flex-row gap-6">
//                 <div className="md:w-1/3 flex flex-col items-center">
//                   <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-indigo-100">
//                     <img 
//                       src={selectedTeacher.profileImage} 
//                       alt={selectedTeacher.name} 
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-900 text-center">{selectedTeacher.name}</h3>
//                   <p className="text-indigo-600 font-medium text-center">{selectedTeacher.designation}</p>
//                 </div>
                
//                 <div className="md:w-2/3">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="bg-gray-50 p-3 rounded-md">
//                       <p className="text-xs text-gray-500 uppercase">Subjects</p>
//                       <p className="text-sm font-medium text-gray-900">
//                         {selectedTeacher.subjects.join(', ')}
//                       </p>
//                     </div>
                    
//                     <div className="bg-gray-50 p-3 rounded-md">
//                       <p className="text-xs text-gray-500 uppercase">Email</p>
//                       <p className="text-sm font-medium text-gray-900 flex items-center">
//                         <Mail className="h-4 w-4 mr-2 text-indigo-500" />
//                         {selectedTeacher.email}
//                       </p>
//                     </div>
                    
//                     <div className="bg-gray-50 p-3 rounded-md">
//                       <p className="text-xs text-gray-500 uppercase">Phone</p>
//                       <p className="text-sm font-medium text-gray-900 flex items-center">
//                         <Phone className="h-4 w-4 mr-2 text-indigo-500" />
//                         {selectedTeacher.phone}
//                       </p>
//                     </div>
                    
//                     <div className="bg-gray-50 p-3 rounded-md">
//                       <p className="text-xs text-gray-500 uppercase">Join Date</p>
//                       <p className="text-sm font-medium text-gray-900 flex items-center">
//                         <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
//                         {new Date(selectedTeacher.joinDate).toLocaleDateString('en-US', {
//                           year: 'numeric',
//                           month: 'long',
//                           day: 'numeric'
//                         })}
//                       </p>
//                     </div>
                    
//                     {selectedTeacher.isClassIncharge && (
//                       <div className="bg-gray-50 p-3 rounded-md col-span-2">
//                         <p className="text-xs text-gray-500 uppercase mb-2">Class Incharge Details</p>
//                         <div className="bg-white p-3 rounded border border-gray-200">
//                           <div className="font-medium text-indigo-600">Class {selectedTeacher.inchargeClass}</div>
//                           {selectedTeacher.sections.find(s => s.class === selectedTeacher.inchargeClass)?.sections.length > 0 && (
//                             <div className="text-sm text-gray-600 mt-1">
//                               Sections: {selectedTeacher.sections
//                                 .find(s => s.class === selectedTeacher.inchargeClass)
//                                 ?.sections.map(section => (
//                                   <span key={section} className="inline-block bg-gray-100 px-2 py-1 rounded-full text-xs mr-1 mb-1">
//                                     {section}
//                                   </span>
//                                 ))}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     <div className="bg-gray-50 p-3 rounded-md col-span-2">
//                       <p className="text-xs text-gray-500 uppercase mb-2">Teaching Classes & Sections</p>
//                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                         {selectedTeacher.sections.map((item, index) => (
//                           <div key={index} className="bg-white p-3 rounded border border-gray-200">
//                             <div className="font-medium text-indigo-600">Class {item.class}</div>
//                             <div className="text-sm text-gray-600 mt-1">
//                               Sections: {item.sections.map(section => (
//                                 <span key={section} className="inline-block bg-gray-100 px-2 py-1 rounded-full text-xs mr-1 mb-1">
//                                   {section}
//                                 </span>
//                               ))}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     <div className="bg-gray-50 p-3 rounded-md">
//                       <p className="text-xs text-gray-500 uppercase">Experience</p>
//                       <p className="text-sm font-medium text-gray-900">
//                         {selectedTeacher.experience}
//                       </p>
//                     </div>

//                     <div className="bg-gray-50 p-3 rounded-md">
//                       <p className="text-xs text-gray-500 uppercase">Education</p>
//                       <p className="text-sm font-medium text-gray-900">
//                         {selectedTeacher.education}
//                       </p>
//                     </div>
                    
//                     <div className="bg-gray-50 p-3 rounded-md">
//                       <p className="text-xs text-gray-500 uppercase">Address</p>
//                       <p className="text-sm font-medium text-gray-900 flex items-start">
//                         <MapPin className="h-4 w-4 mr-2 text-indigo-500 mt-0.5" />
//                         {selectedTeacher.address}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="mt-6 flex justify-end space-x-3">
//                 <button
//                   onClick={() => setIsProfileOpen(false)}
//                   className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                 >
//                   Close
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Add Teacher Modal */}
//       <AnimatePresence>
//         {isAddModalOpen && (
//           <motion.div 
//             className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
//               initial={{ scale: 0.9, y: 20 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.9, y: 20 }}
//               transition={{ type: "spring", stiffness: 300, damping: 30 }}
//             >
//               <div className="flex justify-between items-start mb-6">
//                 <h2 className="text-xl font-bold text-gray-800">Add New Teacher</h2>
//                 <button
//                   onClick={() => setIsAddModalOpen(false)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <XCircle className="h-6 w-6" />
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Full Name*
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={newTeacher.name || ''}
//                       onChange={(e) => handleInputChange('name', e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Email*
//                     </label>
//                     <input
//                       type="email"
//                       required
//                       className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={newTeacher.email || ''}
//                       onChange={(e) => handleInputChange('email', e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Phone*
//                     </label>
//                     <input
//                       type="tel"
//                       required
//                       className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={newTeacher.phone || ''}
//                       onChange={(e) => handleInputChange('phone', e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Designation*
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={newTeacher.designation || ''}
//                       onChange={(e) => handleInputChange('designation', e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Class Incharge
//                     </label>
//                     <div className="flex items-center space-y-2">
//                       <input
//                         type="checkbox"
//                         className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                         checked={newTeacher.isClassIncharge || false}
//                         onChange={(e) => handleInputChange('isClassIncharge', e.target.checked)}
//                       />
//                       <span className="ml-2 text-sm text-gray-600">Is class incharge</span>
//                     </div>
//                   </div>

//                   {newTeacher.isClassIncharge && (
//                     <div className="mt-2 space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Incharge Class* <span className="text-red-500">*</span>
//                         </label>
//                         <select
//                           required
//                           className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 ${
//                             newTeacher.isClassIncharge && !newTeacher.inchargeClass ? 'border-red-500' : 'border-gray-300'
//                           }`}
//                           value={newTeacher.inchargeClass || ''}
//                           onChange={(e) => {
//                             handleInputChange('inchargeClass', e.target.value);
//                             handleInputChange('inchargeSection', ''); // Reset section when class changes
//                           }}
//                         >
//                           <option value="">Select Class</option>
//                           {AVAILABLE_CLASSES.map((classNum) => (
//                             <option key={classNum} value={classNum}>
//                               Class {classNum}
//                             </option>
//                           ))}
//                         </select>
//                       </div>

//                       {newTeacher.inchargeClass && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Incharge Section* <span className="text-red-500">*</span>
//                           </label>
//                           <select
//                             required
//                             className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 ${
//                               newTeacher.isClassIncharge && !newTeacher.inchargeSection ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                             value={newTeacher.inchargeSection || ''}
//                             onChange={(e) => handleInputChange('inchargeSection', e.target.value)}
//                           >
//                             <option value="">Select Section</option>
//                             {newTeacher.sections
//                               ?.find(s => s.class === newTeacher.inchargeClass)
//                               ?.sections.map((section) => (
//                                 <option key={section} value={section}>
//                                   Section {section}
//                                 </option>
//                               ))}
//                           </select>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Subjects* (comma separated)
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={newTeacher.subjects?.join(', ') || ''}
//                       onChange={(e) => handleInputChange('subjects', e.target.value.split(', '))}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Classes and Sections
//                     </label>
//                     {AVAILABLE_CLASSES.map((classNum) => {
//                       const classData = newTeacher.sections?.find(s => s.class === classNum) || { class: classNum, sections: [] };
//                       return (
//                         <div key={classNum} className="mb-4">
//                           <div className="flex items-center mb-2">
//                             <input
//                               type="checkbox"
//                               checked={newTeacher.sections?.some(s => s.class === classNum)}
//                               onChange={(e) => {
//                                 const updatedSections = e.target.checked
//                                   ? [...(newTeacher.sections || []), { class: classNum, sections: [] }]
//                                   : (newTeacher.sections || []).filter(s => s.class !== classNum);
//                                 handleInputChange('sections', updatedSections);
//                               }}
//                               className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                             />
//                             <span className="ml-2">Class {classNum}</span>
//                           </div>
//                           {newTeacher.sections?.some(s => s.class === classNum) && (
//                             <div className="flex items-center space-x-2 mb-2">
//                               <input
//                                 type="text"
//                                 value={classData.sections.join(', ')}
//                                 placeholder={`Sections for Class ${classNum} (comma separated)`}
//                                 onChange={(e) => {
//                                   const updatedSections = e.target.value.split(', ').filter(s => s);
//                                   handleInputChange('sections', (newTeacher.sections || []).map(s =>
//                                     s.class === classNum ? { ...s, sections: updatedSections } : s
//                                   ));
//                                 }}
//                                 className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
//                               />
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Address*
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={newTeacher.address || ''}
//                       onChange={(e) => handleInputChange('address', e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Education*
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={newTeacher.education || ''}
//                       onChange={(e) => handleInputChange('education', e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-6 flex justify-end space-x-3">
//                 <button
//                   onClick={() => setIsAddModalOpen(false)}
//                   className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmit}
//                   className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
//                 >
//                   Add Teacher
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Edit Teacher Modal */}
//       <AnimatePresence>
//         {isEditModalOpen && editTeacher && (
//           <motion.div 
//             className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
//               initial={{ scale: 0.9, y: 20 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.9, y: 20 }}
//               transition={{ type: "spring", stiffness: 300, damping: 30 }}
//             >
//               <div className="flex justify-between items-start mb-6">
//                 <h2 className="text-xl font-bold text-gray-800">Edit Teacher</h2>
//                 <button
//                   onClick={() => setIsEditModalOpen(false)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <XCircle className="h-6 w-6" />
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Full Name*
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={editTeacher.name || ''}
//                       onChange={(e) => handleEditInputChange('name', e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Email*
//                     </label>
//                     <input
//                       type="email"
//                       required
//                       className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={editTeacher.email || ''}
//                       onChange={(e) => handleEditInputChange('email', e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Phone*
//                     </label>
//                     <input
//                       type="tel"
//                       required
//                       className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={editTeacher.phone || ''}
//                       onChange={(e) => handleEditInputChange('phone', e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Designation*
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={editTeacher.designation || ''}
//                       onChange={(e) => handleEditInputChange('designation', e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Class Incharge
//                     </label>
//                     <div className="flex items-center space-y-2">
//                       <input
//                         type="checkbox"
//                         className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                         checked={editTeacher.isClassIncharge || false}
//                         onChange={(e) => handleEditInputChange('isClassIncharge', e.target.checked)}
//                       />
//                       <span className="ml-2 text-sm text-gray-600">Is class incharge</span>
//                     </div>
//                   </div>

//                   {editTeacher.isClassIncharge && (
//                     <div className="mt-2 space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Incharge Class* <span className="text-red-500">*</span>
//                         </label>
//                         <select
//                           required
//                           className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 ${
//                             editTeacher.isClassIncharge && !editTeacher.inchargeClass ? 'border-red-500' : 'border-gray-300'
//                           }`}
//                           value={editTeacher.inchargeClass || ''}
//                           onChange={(e) => {
//                             handleEditInputChange('inchargeClass', e.target.value);
//                             handleEditInputChange('inchargeSection', ''); // Reset section when class changes
//                           }}
//                         >
//                           <option value="">Select Class</option>
//                           {AVAILABLE_CLASSES.map((classNum) => (
//                             <option key={classNum} value={classNum}>
//                               Class {classNum}
//                             </option>
//                           ))}
//                         </select>
//                       </div>

//                       {editTeacher.inchargeClass && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Incharge Section* <span className="text-red-500">*</span>
//                           </label>
//                           <select
//                             required
//                             className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 ${
//                               editTeacher.isClassIncharge && !editTeacher.inchargeSection ? 'border-red-500' : 'border-gray-300'
//                             }`}
//                             value={editTeacher.inchargeSection || ''}
//                             onChange={(e) => handleEditInputChange('inchargeSection', e.target.value)}
//                           >
//                             <option value="">Select Section</option>
//                             {editTeacher.sections
//                               ?.find(s => s.class === editTeacher.inchargeClass)
//                               ?.sections.map((section) => (
//                                 <option key={section} value={section}>
//                                   Section {section}
//                                 </option>
//                               ))}
//                           </select>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Subjects* (comma separated)
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={editTeacher.subjects?.join(', ') || ''}
//                       onChange={(e) => handleEditInputChange('subjects', e.target.value.split(', '))}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Classes and Sections
//                     </label>
//                     {AVAILABLE_CLASSES.map((classNum) => {
//                       const classData = editTeacher.sections?.find(s => s.class === classNum) || { class: classNum, sections: [] };
//                       return (
//                         <div key={classNum} className="mb-4">
//                           <div className="flex items-center mb-2">
//                             <input
//                               type="checkbox"
//                               checked={editTeacher.sections?.some(s => s.class === classNum)}
//                               onChange={(e) => {
//                                 const updatedSections = e.target.checked
//                                   ? [...(editTeacher.sections || []), { class: classNum, sections: [] }]
//                                   : (editTeacher.sections || []).filter(s => s.class !== classNum);
//                                 handleEditInputChange('sections', updatedSections);
//                                 // Update classes string when sections change
//                                 const classesString = updatedSections.map(s => s.class).join(', ');
//                                 handleEditInputChange('classes', classesString);
//                               }}
//                               className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                             />
//                             <span className="ml-2">Class {classNum}</span>
//                           </div>
//                           {editTeacher.sections?.some(s => s.class === classNum) && (
//                             <div className="flex items-center space-x-2 mb-2">
//                               <input
//                                 type="text"
//                                 value={classData.sections.join(', ')}
//                                 placeholder={`Sections for Class ${classNum} (comma separated)`}
//                                 onChange={(e) => {
//                                   const updatedSections = e.target.value.split(', ').filter(s => s);
//                                   handleEditInputChange('sections', (editTeacher.sections || []).map(s =>
//                                     s.class === classNum ? { ...s, sections: updatedSections } : s
//                                   ));
//                                 }}
//                                 className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
//                               />
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Address*
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={editTeacher.address || ''}
//                       onChange={(e) => handleEditInputChange('address', e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Education*
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
//                       value={editTeacher.education || ''}
//                       onChange={(e) => handleEditInputChange('education', e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-6 flex justify-end space-x-3">
//                 <button
//                   onClick={() => setIsEditModalOpen(false)}
//                   className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleEditSubmit}
//                   className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
//                 >
//                   Save Changes
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default TeacherDirectory;