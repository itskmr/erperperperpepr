// import React, { useState, useEffect, useCallback, useMemo } from 'react';

// // Types
// type ExamStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

// interface Exam {
//   id: string;
//   title: string;
//   subject: string;
//   examDate: string;
//   startTime: string;
//   duration: number;
//   totalMarks: number;
//   passingMarks: number;
//   classId: string;
//   status: ExamStatus;
//   description?: string;
//   venue?: string;
//   createdAt: string;
//   updatedAt: string;
//   proctors?: string[];
// }

// interface Class {
//   id: string;
//   name: string;
//   section: string;
//   students?: number;
// }

// interface Subject {
//   id: string;
//   name: string;
//   code: string;
//   teacher?: string;
// }

// interface FormErrors {
//   [key: string]: string;
// }

// // Main Component
// const ExamManagement: React.FC = () => {
//   // State Management
//   const [exams, setExams] = useState<Exam[]>([]);
//   const [classes, setClasses] = useState<Class[]>([]);
//   const [subjects, setSubjects] = useState<Subject[]>([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
//   const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterStatus, setFilterStatus] = useState<string>('all');
//   const [filterClass, setFilterClass] = useState<string>('all');
//   const [filterSubject, setFilterSubject] = useState<string>('all');
//   const [sortBy, setSortBy] = useState<string>('date');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
//   const [bulkSelection, setBulkSelection] = useState<string[]>([]);
//   const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null);
//   const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
//   const [formData, setFormData] = useState<Partial<Exam>>({
//     title: '',
//     subject: '',
//     examDate: '',
//     startTime: '',
//     duration: 60,
//     totalMarks: 100,
//     passingMarks: 35,
//     classId: '',
//     status: 'scheduled',
//     description: '',
//     venue: '',
//     proctors: [],
//   });
//   const [formErrors, setFormErrors] = useState<FormErrors>({});
//   const [dateRange, setDateRange] = useState<{start: string, end: string}>({
//     start: '',
//     end: '',
//   });

//   // Mock Data Loading
//   useEffect(() => {
//     const loadMockData = async () => {
//       try {
//         // Mock exams data with enhanced fields
//         setExams([
//           {
//             id: '1',
//             title: 'Mid-Term Mathematics Exam',
//             subject: 'Mathematics',
//             examDate: '2023-10-15',
//             startTime: '09:00',
//             duration: 120,
//             totalMarks: 100,
//             passingMarks: 40,
//             classId: '1',
//             status: 'completed',
//             description: 'Covers chapters 1-5 from the textbook',
//             venue: 'Main Hall',
//             createdAt: '2023-09-01T12:00:00Z',
//             updatedAt: '2023-09-10T14:30:00Z',
//             proctors: ['John Doe', 'Jane Smith'],
//           },
//           {
//             id: '2',
//             title: 'Final Science Exam',
//             subject: 'Science',
//             examDate: '2023-11-20',
//             startTime: '10:00',
//             duration: 180,
//             totalMarks: 100,
//             passingMarks: 35,
//             classId: '2',
//             status: 'scheduled',
//             description: 'Comprehensive exam covering all topics',
//             venue: 'Science Lab',
//             createdAt: '2023-10-05T09:15:00Z',
//             updatedAt: '2023-10-05T09:15:00Z',
//             proctors: ['Robert Johnson'],
//           },
//           {
//             id: '3',
//             title: 'English Literature Quiz',
//             subject: 'English',
//             examDate: '2023-10-25',
//             startTime: '11:30',
//             duration: 60,
//             totalMarks: 50,
//             passingMarks: 20,
//             classId: '3',
//             status: 'scheduled',
//             description: 'Poetry and prose analysis',
//             venue: 'Room 102',
//             createdAt: '2023-10-01T08:00:00Z',
//             updatedAt: '2023-10-02T10:20:00Z',
//             proctors: ['Alice Williams'],
//           },
//           {
//             id: '4',
//             title: 'Physics Practical Exam',
//             subject: 'Physics',
//             examDate: '2023-10-18',
//             startTime: '13:00',
//             duration: 150,
//             totalMarks: 75,
//             passingMarks: 30,
//             classId: '1',
//             status: 'scheduled',
//             description: 'Lab experiments and theoretical questions',
//             venue: 'Physics Lab',
//             createdAt: '2023-09-20T11:30:00Z',
//             updatedAt: '2023-09-25T16:45:00Z',
//             proctors: ['Michael Brown', 'Sarah Davis'],
//           },
//           {
//             id: '5',
//             title: 'Computer Science Project Defense',
//             subject: 'Computer Science',
//             examDate: '2023-11-05',
//             startTime: '14:30',
//             duration: 240,
//             totalMarks: 100,
//             passingMarks: 50,
//             classId: '2',
//             status: 'scheduled',
//             description: 'Final project presentation and defense',
//             venue: 'Computer Lab',
//             createdAt: '2023-10-10T13:20:00Z',
//             updatedAt: '2023-10-12T09:10:00Z',
//             proctors: ['David Miller'],
//           },
//         ]);
        
//         // Mock classes with student count
//         setClasses([
//           { id: '1', name: 'Class 10', section: 'A', students: 35 },
//           { id: '2', name: 'Class 10', section: 'B', students: 32 },
//           { id: '3', name: 'Class 11', section: 'A', students: 30 },
//           { id: '4', name: 'Class 11', section: 'B', students: 28 },
//           { id: '5', name: 'Class 12', section: 'A', students: 25 },
//         ]);
        
//         // Mock subjects with teacher name
//         setSubjects([
//           { id: '1', name: 'Mathematics', code: 'MATH101', teacher: 'Dr. Smith' },
//           { id: '2', name: 'Science', code: 'SCI101', teacher: 'Prof. Johnson' },
//           { id: '3', name: 'English', code: 'ENG101', teacher: 'Ms. Williams' },
//           { id: '4', name: 'Physics', code: 'PHY201', teacher: 'Dr. Brown' },
//           { id: '5', name: 'Computer Science', code: 'CS101', teacher: 'Mr. Miller' },
//         ]);
        
//         setIsLoading(false);
//       } catch (error) {
//         console.error('Error loading mock data:', error);
//         setNotification({
//           message: 'Failed to load exam data',
//           type: 'error'
//         });
//         setIsLoading(false);
//       }
//     };

//     loadMockData();
//   }, []);

//   // Form Validation
//   const validateForm = (): boolean => {
//     const errors: FormErrors = {};
    
//     if (!formData.title?.trim()) errors.title = 'Exam title is required';
//     if (!formData.subject?.trim()) errors.subject = 'Subject is required';
//     if (!formData.examDate?.trim()) errors.examDate = 'Exam date is required';
//     if (!formData.startTime?.trim()) errors.startTime = 'Start time is required';
    
//     if (!formData.duration) {
//       errors.duration = 'Duration is required';
//     } else if (formData.duration <= 0) {
//       errors.duration = 'Duration must be positive';
//     }
    
//     if (!formData.totalMarks) {
//       errors.totalMarks = 'Total marks is required';
//     } else if (formData.totalMarks <= 0) {
//       errors.totalMarks = 'Total marks must be positive';
//     }
    
//     if (!formData.passingMarks) {
//       errors.passingMarks = 'Passing marks is required';
//     } else if (formData.passingMarks <= 0) {
//       errors.passingMarks = 'Passing marks must be positive';
//     } else if (formData.passingMarks > formData.totalMarks!) {
//       errors.passingMarks = 'Passing marks must be less than total marks';
//     }
    
//     if (!formData.classId?.trim()) errors.classId = 'Class is required';
//     if (!formData.status?.trim()) errors.status = 'Status is required';
    
//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   // Form Handlers
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
    
//     setFormData(prev => ({
//       ...prev,
//       [name]: ['duration', 'totalMarks', 'passingMarks'].includes(name) ? Number(value) : value
//     }));
    
//     // Clear the error for this field if it exists
//     if (formErrors[name]) {
//       setFormErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors[name];
//         return newErrors;
//       });
//     }
//   };

//   const handleProctorAdd = (proctor: string) => {
//     if (proctor && !formData.proctors?.includes(proctor)) {
//       setFormData(prev => ({
//         ...prev,
//         proctors: [...(prev.proctors || []), proctor]
//       }));
//     }
//   };

//   const handleProctorRemove = (proctor: string) => {
//     setFormData(prev => ({
//       ...prev,
//       proctors: prev.proctors?.filter(p => p !== proctor)
//     }));
//   };

//   // Modal Handlers
//   const handleOpenModal = (exam?: Exam) => {
//     if (exam) {
//       setFormData({ ...exam });
//       setSelectedExam(exam);
//     } else {
//       setFormData({
//         title: '',
//         subject: '',
//         examDate: '',
//         startTime: '',
//         duration: 60,
//         totalMarks: 100,
//         passingMarks: 35,
//         classId: '',
//         status: 'scheduled',
//         description: '',
//         venue: '',
//         proctors: [],
//       });
//       setSelectedExam(null);
//     }
//     setFormErrors({});
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedExam(null);
//     setFormData({});
//     setFormErrors({});
//   };

//   const handleViewDetails = (exam: Exam) => {
//     setSelectedExam(exam);
//     setIsDetailsModalOpen(true);
//   };

//   const handleCloseDetailsModal = () => {
//     setIsDetailsModalOpen(false);
//     setSelectedExam(null);
//   };

//   // Data Operations
//   const handleSubmitForm = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm()) return;
    
//     const now = new Date().toISOString();
    
//     if (selectedExam) {
//       // Update existing exam
//       const updatedExam: Exam = {
//         ...selectedExam,
//         ...formData,
//         updatedAt: now,
//       } as Exam;
      
//       setExams(prevExams => 
//         prevExams.map(exam => 
//           exam.id === selectedExam.id ? updatedExam : exam
//         )
//       );
      
//       setNotification({
//         message: 'Exam updated successfully',
//         type: 'success'
//       });
//     } else {
//       // Create new exam
//       const newExam: Exam = {
//         ...formData,
//         id: Date.now().toString(),
//         createdAt: now,
//         updatedAt: now,
//       } as Exam;
      
//       setExams(prevExams => [...prevExams, newExam]);
      
//       setNotification({
//         message: 'Exam created successfully',
//         type: 'success'
//       });
//     }
    
//     handleCloseModal();
//   };

//   const handleDeleteExam = (examId: string) => {
//     if (confirm('Are you sure you want to delete this exam?')) {
//       setExams(prevExams => prevExams.filter(exam => exam.id !== examId));
//       setBulkSelection(prev => prev.filter(id => id !== examId));
      
//       setNotification({
//         message: 'Exam deleted successfully',
//         type: 'info'
//       });
//     }
//   };

//   const handleBulkDelete = () => {
//     if (bulkSelection.length === 0) {
//       setNotification({
//         message: 'No exams selected',
//         type: 'warning'
//       });
//       return;
//     }
    
//     if (confirm(`Are you sure you want to delete ${bulkSelection.length} selected exams?`)) {
//       setExams(prevExams => 
//         prevExams.filter(exam => !bulkSelection.includes(exam.id))
//       );
      
//       setBulkSelection([]);
      
//       setNotification({
//         message: `${bulkSelection.length} exams deleted successfully`,
//         type: 'info'
//       });
//     }
//   };

//   const handleBulkStatusChange = (status: ExamStatus) => {
//     if (bulkSelection.length === 0) {
//       setNotification({
//         message: 'No exams selected',
//         type: 'warning'
//       });
//       return;
//     }
    
//     setExams(prevExams => 
//       prevExams.map(exam => 
//         bulkSelection.includes(exam.id) 
//           ? { ...exam, status, updatedAt: new Date().toISOString() } 
//           : exam
//       )
//     );
    
//     setNotification({
//       message: `Status updated for ${bulkSelection.length} exams`,
//       type: 'success'
//     });
    
//     setBulkSelection([]);
//   };

//   const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.checked) {
//       setBulkSelection(filteredExams.map(exam => exam.id));
//     } else {
//       setBulkSelection([]);
//     }
//   };

//   const handleToggleSelection = (examId: string) => {
//     setBulkSelection(prev => 
//       prev.includes(examId)
//         ? prev.filter(id => id !== examId)
//         : [...prev, examId]
//     );
//   };

//   const handleDuplicateExam = (exam: Exam) => {
//     const now = new Date().toISOString();
//     const newExam: Exam = {
//       ...exam,
//       id: Date.now().toString(),
//       title: `Copy of ${exam.title}`,
//       createdAt: now,
//       updatedAt: now,
//     };
    
//     setExams(prevExams => [...prevExams, newExam]);
    
//     setNotification({
//       message: 'Exam duplicated successfully',
//       type: 'success'
//     });
//   };

//   const handleQuickStatusChange = (examId: string, status: ExamStatus) => {
//     setExams(prevExams => 
//       prevExams.map(exam => 
//         exam.id === examId 
//           ? { ...exam, status, updatedAt: new Date().toISOString() } 
//           : exam
//       )
//     );
    
//     setNotification({
//       message: 'Exam status updated',
//       type: 'success'
//     });
//   };

//   const handleSortChange = (field: string) => {
//     if (sortBy === field) {
//       setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortBy(field);
//       setSortOrder('asc');
//     }
//   };

//   const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
//     setDateRange(prev => ({
//       ...prev,
//       [type]: value
//     }));
//   };

//   const handleClearFilters = () => {
//     setSearchQuery('');
//     setFilterStatus('all');
//     setFilterClass('all');
//     setFilterSubject('all');
//     setDateRange({ start: '', end: '' });
//   };

//   const handleExportData = (format: 'csv' | 'pdf' | 'excel') => {
//     // In a real app, this would handle exporting the data
//     // For this demo, we'll just show a notification
//     setNotification({
//       message: `Exams exported in ${format.toUpperCase()} format`,
//       type: 'success'
//     });
//   };

//   // Memoized Derived Data
//   const filteredExams = useMemo(() => {
//     return exams
//       .filter(exam => {
//         // Text search
//         const matchesSearch = 
//           exam.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
//           exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           exam.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           exam.venue?.toLowerCase().includes(searchQuery.toLowerCase());
        
//         // Status filter
//         const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
        
//         // Class filter
//         const matchesClass = filterClass === 'all' || exam.classId === filterClass;
        
//         // Subject filter
//         const matchesSubject = filterSubject === 'all' || exam.subject === filterSubject;
        
//         // Date range filter
//         let matchesDateRange = true;
//         if (dateRange.start) {
//           matchesDateRange = matchesDateRange && exam.examDate >= dateRange.start;
//         }
//         if (dateRange.end) {
//           matchesDateRange = matchesDateRange && exam.examDate <= dateRange.end;
//         }
        
//         return matchesSearch && matchesStatus && matchesClass && matchesSubject && matchesDateRange;
//       })
//       .sort((a, b) => {
//         // Dynamic sorting
//         let valueA, valueB;
        
//         switch (sortBy) {
//           case 'title':
//             valueA = a.title.toLowerCase();
//             valueB = b.title.toLowerCase();
//             break;
//           case 'subject':
//             valueA = a.subject.toLowerCase();
//             valueB = b.subject.toLowerCase();
//             break;
//           case 'date':
//             valueA = new Date(a.examDate + 'T' + a.startTime).getTime();
//             valueB = new Date(b.examDate + 'T' + b.startTime).getTime();
//             break;
//           case 'duration':
//             valueA = a.duration;
//             valueB = b.duration;
//             break;
//           case 'marks':
//             valueA = a.totalMarks;
//             valueB = b.totalMarks;
//             break;
//           default:
//             valueA = new Date(a.examDate).getTime();
//             valueB = new Date(b.examDate).getTime();
//         }
        
//         if (sortOrder === 'asc') {
//           return valueA > valueB ? 1 : -1;
//         } else {
//           return valueA < valueB ? 1 : -1;
//         }
//       });
//   }, [
//     exams, 
//     searchQuery, 
//     filterStatus, 
//     filterClass, 
//     filterSubject, 
//     dateRange, 
//     sortBy, 
//     sortOrder
//   ]);
  
//   // Statistics calculations
//   const statistics = useMemo(() => {
//     return {
//       total: exams.length,
//       scheduled: exams.filter(e => e.status === 'scheduled').length,
//       ongoing: exams.filter(e => e.status === 'ongoing').length,
//       completed: exams.filter(e => e.status === 'completed').length,
//       cancelled: exams.filter(e => e.status === 'cancelled').length,
//       thisMonth: exams.filter(e => {
//         const examDate = new Date(e.examDate);
//         const now = new Date();
//         return examDate.getMonth() === now.getMonth() && 
//                examDate.getFullYear() === now.getFullYear();
//       }).length,
//     };
//   }, [exams]);

//   // Utility Functions
//   const getClassName = useCallback((classId: string) => {
//     const classObj = classes.find(c => c.id === classId);
//     return classObj ? `${classObj.name} ${classObj.section}` : 'Unknown Class';
//   }, [classes]);

//   const getStatusBadgeClass = (status: string) => {
//     switch (status) {
//       case 'scheduled':
//         return 'bg-blue-100 text-blue-800';
//       case 'ongoing':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'completed':
//         return 'bg-green-100 text-green-800';
//       case 'cancelled':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const formatTime = (timeString: string) => {
//     const [hours, minutes] = timeString.split(':');
//     const time = new Date();
//     time.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    
//     return time.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const formatDateTime = (date: string, time: string) => {
//     return `${formatDate(date)} at ${formatTime(time)}`;
//   };

//   // Effect for clearing notifications
//   useEffect(() => {
//     if (notification) {
//       const timer = setTimeout(() => {
//         setNotification(null);
//       }, 5000);
      
//       return () => clearTimeout(timer);
//     }
//   }, [notification]);

//   // Loading State
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-full min-h-screen">
//         <div className="text-center">
//           <div className="inline-block animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
//           <p className="mt-2 text-gray-600">Loading exam management system...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       {/* Notification Toast */}
//       {notification && (
//         <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md transition transform duration-300 ease-in-out ${
//           notification.type === 'success' ? 'bg-green-50 border-l-4 border-green-500 text-green-700' :
//           notification.type === 'error' ? 'bg-red-50 border-l-4 border-red-500 text-red-700' :
//           notification.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700' :
//           'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
//         }`}>
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               {notification.type === 'success' && (
//                 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
//                 </svg>
//               )}
//               {notification.type === 'error' && (
//                 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
//                 </svg>
//               )}
//               {notification.type === 'warning' && (
//                 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
//                 </svg>
//               )}
//               {notification.type === 'info' && (
//                 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
//                 </svg>
//               )}
//             </div>
//             <div className="ml-3">
//               <p className="text-sm font-medium">{notification.message}</p>
//             </div>
//             <div className="ml-auto pl-3">
//               <button
//                 className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
//                 onClick={() => setNotification(null)}
//               >
//                 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-gray-900">Exam Management System</h1>
//           <p className="mt-2 text-sm text-gray-600">
//             Create, manage and track all exams for your institution
//           </p>
//         </div>

//         {/* Stats Overview */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
//           <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
//             <p className="text-sm font-medium text-gray-500">Total Exams</p>
//             <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
//             <p className="text-sm font-medium text-gray-500">Scheduled</p>
//             <p className="text-2xl font-bold text-gray-900">{statistics.scheduled}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
//             <p className="text-sm font-medium text-gray-500">Ongoing</p>
//             <p className="text-2xl font-bold text-gray-900">{statistics.ongoing}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
//             <p className="text-sm font-medium text-gray-500">Completed</p>
//             <p className="text-2xl font-bold text-gray-900">{statistics.completed}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
//             <p className="text-sm font-medium text-gray-500">Cancelled</p>
//             <p className="text-2xl font-bold text-gray-900">{statistics.cancelled}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
//             <p className="text-sm font-medium text-gray-500">This Month</p>
//             <p className="text-2xl font-bold text-gray-900">{statistics.thisMonth}</p>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-wrap gap-2 mb-6">
//           <button
//             onClick={() => setShowCreateModal(true)}
//             className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//           >
//             <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
//             </svg>
//             Create New Exam
//           </button>
          
//           <button
//             onClick={handleBulkDelete}
//             disabled={bulkSelection.length === 0}
//             className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
//               bulkSelection.length > 0 
//                 ? 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500' 
//                 : 'text-gray-500 bg-gray-200 cursor-not-allowed'
//             }`}
//           >
//             <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//             </svg>
//             Delete Selected
//           </button>
          
//           <div className="relative">
//             <button
//               onClick={() => setShowBulkStatusMenu(!showBulkStatusMenu)}
//               disabled={bulkSelection.length === 0}
//               className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
//                 bulkSelection.length > 0 
//                   ? 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
//                   : 'text-gray-500 bg-gray-200 cursor-not-allowed'
//               }`}
//             >
//               Change Status
//               <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                 <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//               </svg>
//             </button>
            
//             {showBulkStatusMenu && (
//               <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
//                 <div className="py-1" role="menu" aria-orientation="vertical">
//                   <button
//                     onClick={() => {
//                       handleBulkStatusChange('scheduled');
//                       setShowBulkStatusMenu(false);
//                     }}
//                     className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     role="menuitem"
//                   >
//                     Set as Scheduled
//                   </button>
//                   <button
//                     onClick={() => {
//                       handleBulkStatusChange('ongoing');
//                       setShowBulkStatusMenu(false);
//                     }}
//                     className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     role="menuitem"
//                   >
//                     Set as Ongoing
//                   </button>
//                   <button
//                     onClick={() => {
//                       handleBulkStatusChange('completed');
//                       setShowBulkStatusMenu(false);
//                     }}
//                     className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     role="menuitem"
//                   >
//                     Set as Completed
//                   </button>
//                   <button
//                     onClick={() => {
//                       handleBulkStatusChange('cancelled');
//                       setShowBulkStatusMenu(false);
//                     }}
//                     className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     role="menuitem"
//                   >
//                     Set as Cancelled
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
          
//           <div className="relative">
//             <button
//               onClick={() => setShowExportMenu(!showExportMenu)}
//               className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//             >
//               Export
//               <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                 <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//               </svg>
//             </button>
            
//             {showExportMenu && (
//               <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
//                 <div className="py-1" role="menu" aria-orientation="vertical">
//                   <button
//                     onClick={() => {
//                       handleExportData('csv');
//                       setShowExportMenu(false);
//                     }}
//                     className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     role="menuitem"
//                   >
//                     Export as CSV
//                   </button>
//                   <button
//                     onClick={() => {
//                       handleExportData('excel');
//                       setShowExportMenu(false);
//                     }}
//                     className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     role="menuitem"
//                   >
//                     Export as Excel
//                   </button>
//                   <button
//                     onClick={() => {
//                       handleExportData('pdf');
//                       setShowExportMenu(false);
//                     }}
//                     className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     role="menuitem"
//                   >
//                     Export as PDF
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Filter Controls */}
//         <div className="bg-white shadow rounded-lg p-4 mb-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//             <div>
//               <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
//               <div className="relative rounded-md shadow-sm">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <input
//                   type="text"
//                   id="search"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
//                   placeholder="Search exams..."
//                 />
//               </div>
//             </div>
            
//             <div>
//               <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//               <select
//                 id="status-filter"
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value as ExamStatus | 'all')}
//                 className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
//               >
//                 <option value="all">All Statuses</option>
//                 <option value="scheduled">Scheduled</option>
//                 <option value="ongoing">Ongoing</option>
//                 <option value="completed">Completed</option>
//                 <option value="cancelled">Cancelled</option>
//               </select>
//             </div>
            
//             <div>
//               <label htmlFor="class-filter" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
//               <select
//                 id="class-filter"
//                 value={filterClass}
//                 onChange={(e) => setFilterClass(e.target.value)}
//                 className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
//               >
//                 <option value="all">All Classes</option>
//                 {classes.map(classItem => (
//                   <option key={classItem.id} value={classItem.id}>
//                     {`${classItem.name} ${classItem.section}`}
//                   </option>
//                 ))}
//               </select>
//             </div>
            
//             <div>
//               <label htmlFor="subject-filter" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
//               <select
//                 id="subject-filter"
//                 value={filterSubject}
//                 onChange={(e) => setFilterSubject(e.target.value)}
//                 className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
//               >
//                 <option value="all">All Subjects</option>
//                 {Array.from(new Set(exams.map(exam => exam.subject))).map(subject => (
//                   <option key={subject} value={subject}>
//                     {subject}
//                   </option>
//                 ))}
//               </select>
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
//               <div className="flex space-x-2">
//                 <input
//                   type="date"
//                   value={dateRange.start}
//                   onChange={(e) => handleDateRangeChange('start', e.target.value)}
//                   className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
//                 />
//                 <input
//                   type="date"
//                   value={dateRange.end}
//                   onChange={(e) => handleDateRangeChange('end', e.target.value)}
//                   className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
//                 />
//               </div>
//             </div>
//           </div>
          
//           <div className="mt-4 flex justify-end">
//             <button
//               onClick={handleClearFilters}
//               className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//             >
//               Clear Filters
//             </button>
//           </div>
//         </div>

//         {/* Exams Table */}
//         <div className="bg-white shadow rounded-lg overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     <div className="flex items-center">
//                       <input
//                         type="checkbox"
//                         checked={bulkSelection.length === filteredExams.length && filteredExams.length > 0}
//                         onChange={handleSelectAll}
//                         className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                       />
//                     </div>
//                   </th>
//                   <th 
//                     scope="col" 
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                     onClick={() => handleSortChange('title')}
//                   >
//                     <div className="flex items-center">
//                       Title
//                       {sortBy === 'title' && (
//                         <span className="ml-1">
//                           {sortOrder === 'asc' ? '↑' : '↓'}
//                         </span>
//                       )}
//                     </div>
//                   </th>
//                   <th 
//                     scope="col" 
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                     onClick={() => handleSortChange('subject')}
//                   >
//                     <div className="flex items-center">
//                       Subject
//                       {sortBy === 'subject' && (
//                         <span className="ml-1">
//                           {sortOrder === 'asc' ? '↑' : '↓'}
//                         </span>
//                       )}
//                     </div>
//                   </th>
//                   <th 
//                     scope="col" 
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                     onClick={() => handleSortChange('date')}
//                   >
//                     <div className="flex items-center">
//                       Date & Time
//                       {sortBy === 'date' && (
//                         <span className="ml-1">
//                           {sortOrder === 'asc' ? '↑' : '↓'}
//                         </span>
//                       )}
//                     </div>
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Class
//                   </th>
//                   <th 
//                     scope="col" 
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                     onClick={() => handleSortChange('duration')}
//                   >
//                     <div className="flex items-center">
//                       Duration
//                       {sortBy === 'duration' && (
//                         <span className="ml-1">
//                           {sortOrder === 'asc' ? '↑' : '↓'}
//                         </span>
//                       )}
//                     </div>
//                   </th>
//                   <th 
//                     scope="col" 
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                     onClick={() => handleSortChange('marks')}
//                   >
//                     <div className="flex items-center">
//                       Marks
//                       {sortBy === 'marks' && (
//                         <span className="ml-1">
//                           {sortOrder === 'asc' ? '↑' : '↓'}
//                         </span>
//                       )}
//                     </div>
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredExams.length === 0 ? (
//                   <tr>
//                     <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
//                       No exams found matching the criteria
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredExams.map(exam => (
//                     <tr key={exam.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <input
//                           type="checkbox"
//                           checked={bulkSelection.includes(exam.id)}
//                           onChange={() => handleToggleSelection(exam.id)}
//                           className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                         />
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-900">{exam.title}</div>
//                         {exam.description && (
//                           <div className="text-xs text-gray-500 truncate max-w-xs">{exam.description}</div>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">{exam.subject}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">{formatDateTime(exam.examDate, exam.startTime)}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">{getClassName(exam.classId)}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">{exam.duration} mins</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">{exam.totalMarks}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(exam.status)}`}>
//                           {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                         <div className="flex justify-end space-x-2">
//                           <button
//                             onClick={() => {
//                               setSelectedExam(exam);
//                               setShowViewModal(true);
//                             }}
//                             className="text-blue-600 hover:text-blue-900"
//                             title="View"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                               <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
//                               <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
//                             </svg>
//                           </button>
                          
//                           <button
//                             onClick={() => {
//                               setSelectedExam(exam);
//                               setShowEditModal(true);
//                             }}
//                             className="text-indigo-600 hover:text-indigo-900"
//                             title="Edit"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                               <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//                             </svg>
//                           </button>
                          
//                           <button
//                             onClick={() => handleDuplicateExam(exam)}
//                             className="text-green-600 hover:text-green-900"
//                             title="Duplicate"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                               <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
//                               <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
//                             </svg>
//                           </button>
                          
//                           <button
//                             onClick={() => handleDeleteExam(exam.id)}
//                             className="text-red-600 hover:text-red-900"
//                             title="Delete"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                               <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//                             </svg>
//                           </button>
                          
//                           <div className="relative">
//                             <button
//                               onClick={() => setActionMenus(prev => ({
//                                 ...prev,
//                                 [exam.id]: !prev[exam.id]
//                               }))}
//                               className="text-gray-600 hover:text-gray-900"
//                               title="More actions"
//                             >
//                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                                 <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
//                               </svg>
//                             </button>
                            
//                             {actionMenus[exam.id] && (
//                               <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
//                                 <div className="py-1" role="menu" aria-orientation="vertical">
//                                   <button
//                                     onClick={() => {
//                                       handleQuickStatusChange(exam.id, 'scheduled');
//                                       setActionMenus(prev => ({ ...prev, [exam.id]: false }));
//                                     }}
//                                     className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                                     role="menuitem"
//                                   >
//                                     Set as Scheduled
//                                   </button>
//                                   <button
//                                     onClick={() => {
//                                       handleQuickStatusChange(exam.id, 'ongoing');
//                                       setActionMenus(prev => ({ ...prev, [exam.id]: false }));
//                                     }}
//                                     className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                                     role="menuitem"
//                                   >
//                                     Set as Ongoing
//                                   </button>
//                                   <button
//                                     onClick={() => {
//                                       handleQuickStatusChange(exam.id, 'completed');
//                                       setActionMenus(prev => ({ ...prev, [exam.id]: false }));
//                                     }}
//                                     className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                                     role="menuitem"
//                                   >
//                                     Set as Completed
//                                   </button>
//                                   <button
//                                     onClick={() => {
//                                       handleQuickStatusChange(exam.id, 'cancelled');
//                                       setActionMenus(prev => ({ ...prev, [exam.id]: false }));
//                                     }}
//                                     className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                                     role="menuitem"
//                                   >
//                                     Set as Cancelled
//                                   </button>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
          
//          {/* Pagination */}
// <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
//   <div className="flex-1 flex justify-between sm:hidden">
//     <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
//       Previous
//     </button>
//     <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
//       Next
//     </button>
//   </div>
//   <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
//     <div>
//       <p className="text-sm text-gray-700">
//         Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredExams.length}</span> of{' '}
//         <span className="font-medium">{filteredExams.length}</span> results
//       </p>
//     </div>
//     <div>
//       <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
//         <button
//           className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
//         >
//           <span className="sr-only">Previous</span>
//           <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
//             <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
//           </svg>
//         </button>
//         <button
//           className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
//         >
//           1
//         </button>
//         <button
//           className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
//         >
//           <span className="sr-only">Next</span>
//           <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
//             <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
//           </svg>
//         </button>
//       </nav>
//     </div>
//   </div>
// </div>

// {/* Bulk Actions */}
// {bulkSelection.length > 0 && (
//   <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5">
//     <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
//       <div className="p-2 rounded-lg bg-blue-600 shadow-lg sm:p-3">
//         <div className="flex items-center justify-between flex-wrap">
//           <div className="w-0 flex-1 flex items-center">
//             <span className="flex p-2 rounded-lg bg-blue-800">
//               <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//               </svg>
//             </span>
//             <p className="ml-3 font-medium text-white truncate">
//               <span>{bulkSelection.length} exams selected</span>
//             </p>
//           </div>
//           <div className="flex-shrink-0 sm:mt-0 sm:ml-4">
//             <div className="flex space-x-2">
//               <button
//                 onClick={handleBulkDelete}
//                 className="flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
//               >
//                 Delete Selected
//               </button>
//               <div className="relative inline-block text-left">
//                 <button
//                   onClick={() => setShowBulkMenu(!showBulkMenu)}
//                   type="button"
//                   className="flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                   id="bulk-menu-button"
//                   aria-expanded="true"
//                   aria-haspopup="true"
//                 >
//                   More Actions
//                   <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
//                     <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//                   </svg>
//                 </button>

//                 {showBulkMenu && (
//                   <div
//                     className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-10"
//                     role="menu"
//                     aria-orientation="vertical"
//                     aria-labelledby="bulk-menu-button"
//                     tabIndex={-1}
//                   >
//                     <div className="py-1" role="none">
//                       <button
//                         onClick={() => handleBulkStatusChange('scheduled')}
//                         className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                         role="menuitem"
//                         tabIndex={-1}
//                       >
//                         Set as Scheduled
//                       </button>
//                       <button
//                         onClick={() => handleBulkStatusChange('ongoing')}
//                         className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                         role="menuitem"
//                         tabIndex={-1}
//                       >
//                         Set as Ongoing
//                       </button>
//                       <button
//                         onClick={() => handleBulkStatusChange('completed')}
//                         className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                         role="menuitem"
//                         tabIndex={-1}
//                       >
//                         Set as Completed
//                       </button>
//                       <button
//                         onClick={() => handleBulkStatusChange('cancelled')}
//                         className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                         role="menuitem"
//                         tabIndex={-1}
//                       >
//                         Set as Cancelled
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//               <button
//                 onClick={() => setBulkSelection([])}
//                 className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//               >
//                 Clear Selection
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// )}

// {/* View Exam Modal */}
// {showViewModal && selectedExam && (
//   <div className="fixed inset-0 overflow-y-auto z-50">
//     <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//       <div className="fixed inset-0 transition-opacity" aria-hidden="true">
//         <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
//       </div>
//       <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
//       <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
//         <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//           <div className="sm:flex sm:items-start">
//             <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
//               <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
//                 {selectedExam.title}
//               </h3>
//               <div className="mt-4 space-y-3">
//                 <div>
//                   <p className="text-sm text-gray-500">Subject</p>
//                   <p className="text-sm font-medium">{selectedExam.subject}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Class</p>
//                   <p className="text-sm font-medium">{getClassName(selectedExam.classId)}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Date & Time</p>
//                   <p className="text-sm font-medium">{formatDateTime(selectedExam.examDate, selectedExam.startTime)}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Duration</p>
//                   <p className="text-sm font-medium">{selectedExam.duration} minutes</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Total Marks</p>
//                   <p className="text-sm font-medium">{selectedExam.totalMarks}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Status</p>
//                   <p className="text-sm font-medium">
//                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedExam.status)}`}>
//                       {selectedExam.status.charAt(0).toUpperCase() + selectedExam.status.slice(1)}
//                     </span>
//                   </p>
//                 </div>
//                 {selectedExam.description && (
//                   <div>
//                     <p className="text-sm text-gray-500">Description</p>
//                     <p className="text-sm">{selectedExam.description}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
//           <button
//             type="button"
//             onClick={() => setShowViewModal(false)}
//             className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
// )}

// {/* Edit Exam Modal */}
// {showEditModal && selectedExam && (
//   <div className="fixed inset-0 overflow-y-auto z-50">
//     <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//       <div className="fixed inset-0 transition-opacity" aria-hidden="true">
//         <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
//       </div>
//       <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
//       <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
//         <form onSubmit={handleEditExam}>
//           <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//             <div className="sm:flex sm:items-start">
//               <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
//                 <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
//                   Edit Exam
//                 </h3>
//                 <div className="mt-4 space-y-4">
//                   {/* Form fields would go here */}
//                   <div>
//                     <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">Title</label>
//                     <input
//                       type="text"
//                       id="edit-title"
//                       name="title"
//                       value={examForm.title}
//                       onChange={handleFormChange}
//                       className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
//                       required
//                     />
//                   </div>
                  
//                   <div>
//                     <label htmlFor="edit-subject" className="block text-sm font-medium text-gray-700">Subject</label>
//                     <input
//                       type="text"
//                       id="edit-subject"
//                       name="subject"
//                       value={examForm.subject}
//                       onChange={handleFormChange}
//                       className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
//                       required
//                     />
//                   </div>
                  
//                   <div>
//                     <label htmlFor="edit-class" className="block text-sm font-medium text-gray-700">Class</label>
//                     <select
//                       id="edit-class"
//                       name="classId"
//                       value={examForm.classId}
//                       onChange={handleFormChange}
//                       className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
//                       required
//                     >
//                       <option value="">Select a class</option>
//                       {classes.map(classItem => (
//                         <option key={classItem.id} value={classItem.id}>
//                           {`${classItem.name} ${classItem.section}`}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700">Date</label>
//                       <input
//                         type="date"
//                         id="edit-date"
//                         name="examDate"
//                         value={examForm.examDate}
//                         onChange={handleFormChange}
//                         className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label htmlFor="edit-time" className="block text-sm font-medium text-gray-700">Time</label>
//                       <input
//                         type="time"
//                         id="edit-time"
//                         name="startTime"
//                         value={examForm.startTime}
//                         onChange={handleFormChange}
//                         className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
//                         required
//                       />
//                     </div>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label htmlFor="edit-duration" className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
//                       <input
//                         type="number"
//                         id="edit-duration"
//                         name="duration"
//                         value={examForm.duration}
//                         onChange={handleFormChange}
//                         min="1"
//                         className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label htmlFor="edit-marks" className="block text-sm font-medium text-gray-700">Total Marks</label>
//                       <input
//                         type="number"
//                         id="edit-marks"
//                         name="totalMarks"
//                         value={examForm.totalMarks}
//                         onChange={handleFormChange}
//                         min="1"
//                         className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
//                         required
//                       />
//                     </div>
//                   </div>
                  
//                   <div>
//                     <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">Status</label>
//                     <select
//                       id="edit-status"
//                       name="status"
//                       value={examForm.status}
//                       onChange={handleFormChange}
//                       className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
//                       required
//                     >
//                       <option value="scheduled">Scheduled</option>
//                       <option value="ongoing">Ongoing</option>
//                       <option value="completed">Completed</option>
//                       <option value="cancelled">Cancelled</option>
//                     </select>
//                   </div>
                  
//                   <div>
//                     <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">Description (optional)</label>
//                     <textarea
//                       id="edit-description"
//                       name="description"
//                       value={examForm.description || ''}
//                       onChange={handleFormChange}
//                       rows="3"
//                       className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
//                     ></textarea>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
//             <button
//               type="submit"
//               className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
//             >
//               Save Changes
//             </button>
//             <button
//               type="button"
//               onClick={() => setShowEditModal(false)}
//               className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   </div>
// )}

// {/* Add New Exam Modal */}
// {showAddModal && (
//   <div className="fixed inset-0 overflow-y-auto z-50">
//     <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//       <div className="fixed inset-0 transition-opacity" aria-hidden="true">
//         <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
//       </div>
//       <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
//       <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
//         <form onSubmit={handleAddExam}>
//           <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//             <div className="sm:flex sm:items-start">
//               <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
//                 <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
//                   Add New Exam
//                 </h3>
//                 <div className="mt-4 space-y-4">
//                   {/* Form fields for adding new exam - same as edit form */}
//                   <div>
//                     <label htmlFor="add-title" className="block text-sm font-medium text-gray-700">Title</label>
//                     <input
//                       type="text"
//                       id="add-title"
//                       name="title"
//                       value={examForm.title}
//                       onChange={handleFormChange}
//                       className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
//                       required
//                     />
//                   </div>
                  
//                   {/* Additional fields similar to edit modal */}
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
//             <button
//               type="submit"
//               className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
//             >
//               Add Exam
//             </button>
//             <button
//               type="button"
//               onClick={() => setShowAddModal(false)}
//               className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   </div>
// )}

// {/* Confirmation Modal */}
// {showConfirmModal && (
//   <div className="fixed inset-0 overflow-y-auto z-50">
//     <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//       <div className="fixed inset-0 transition-opacity" aria-hidden="true">
//         <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
//       </div>
//       <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
//       <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
//         <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//           <div className="sm:flex sm:items-start">
//             <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
//               <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//               </svg>
//             </div>
//             <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
//               <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
//                 {confirmModalConfig.title}
//               </h3>
//               <div className="mt-2">
//                 <p className="text-sm text-gray-500">
//                   {confirmModalConfig.message}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
//           <button
//             type="button"
//             onClick={() => {
//               confirmModalConfig.onConfirm();
//               setShowConfirmModal(false);
//             }}
//             className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
//           >
//             {confirmModalConfig.confirmText || 'Confirm'}
//           </button>
//           <button
//             type="button"
//             onClick={() => setShowConfirmModal(false)}
//             className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
// )}

