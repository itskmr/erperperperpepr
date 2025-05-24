import React, { useState, useRef, useEffect } from 'react';
import { FileText, Upload, Trash, Eye, XCircle, Calendar, Clock, Edit, BookOpen, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exam } from './types'
import toast, { Toaster } from 'react-hot-toast';

// First, let's define the Teacher interface
interface Teacher {
  id: string;
  name: string;
  assignedClasses: string[];
  assignedSubjects: string[];
}


const fetchTeacherData = async (teacherId: string): Promise<Teacher> => {
  const response = await fetch(`/api/teachers/${teacherId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch teacher data');
  }
  return response.json();
};

const ExamManager: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newExam, setNewExam] = useState<Partial<Exam>>({});
  const [editExam, setEditExam] = useState<Partial<Exam>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [teacherData, setTeacherData] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create separate refs for each modal
  const viewModalRef = useRef<HTMLDivElement>(null);
  const createModalRef = useRef<HTMLDivElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);

  const validateForm = (exam: Partial<Exam>) => {
    const errors: Record<string, string> = {};
    if (!exam.examName) errors.examName = 'Exam name is required';
    if (!exam.className) errors.className = 'Class is required';
    if (!exam.subject) errors.subject = 'Subject is required';
    if (!exam.date) errors.date = 'Exam date is required';
    return errors;
  };

  // Add useEffect to load exams from localStorage when component mounts
  useEffect(() => {
    const savedExams = localStorage.getItem('exams');
    if (savedExams) {
      try {
        setExams(JSON.parse(savedExams));
      } catch (error) {
        console.error('Error loading exams:', error);
      }
    }
  }, []);

  // Add useEffect to fetch teacher data when component mounts
  useEffect(() => {
    const loadTeacherData = async () => {
      setIsLoading(true);
      try {
        // Get teacherId from your auth context/service
        const teacherId = getCurrentTeacherId(); 
        const data = await fetchTeacherData(teacherId);
        setTeacherData(data);
      } catch (error) {
        console.error('Error loading teacher data:', error);
        toast.error('Failed to load teacher data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeacherData();
  }, []);

  const handleCreateExam = () => {
    const errors = validateForm(newExam);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    const exam: Exam = {
      id: String(Date.now()),
      examName: newExam.examName!,
      subject: newExam.subject!,
      date: newExam.date!,
      className: newExam.className!,
      startTime: newExam.startTime || '09:00',
      endTime: newExam.endTime || '11:00',
      room: newExam.room || 'TBD'
    };

    const updatedExams = [...exams, exam];
    setExams(updatedExams);
    
    // Save to localStorage
    try {
      localStorage.setItem('exams', JSON.stringify(updatedExams));
      toast.success('Exam saved successfully!', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      });
    } catch (error) {
      toast.error('Error saving exam. Please try again.', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      });
    }
    
    setIsCreateModalOpen(false);
    setNewExam({});
    setErrors({});
  };

  const handleUpdateExam = () => {
    const errors = validateForm(editExam);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    const updatedExams = exams.map((exam) =>
      exam.id === editExam.id
        ? { ...exam, ...editExam }
        : exam
    );
    
    setExams(updatedExams);
    
    // Save to localStorage
    try {
      localStorage.setItem('exams', JSON.stringify(updatedExams));
      toast.success('Exam updated successfully!', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      });
    } catch (error) {
      toast.error('Error updating exam. Please try again.', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      });
    }
    
    setIsEditModalOpen(false);
    setEditExam({});
    setErrors({});
  };

  const handleDeleteExam = (id: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      const updatedExams = exams.filter((exam) => exam.id !== id);
      setExams(updatedExams);
      
      // Save to localStorage
      try {
        localStorage.setItem('exams', JSON.stringify(updatedExams));
        toast.success('Exam deleted successfully!', {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#10B981',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
        });
      } catch (error) {
        toast.error('Error deleting exam. Please try again.', {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
        });
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isModalOpen && viewModalRef.current && !viewModalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
      if (isCreateModalOpen && createModalRef.current && !createModalRef.current.contains(event.target as Node)) {
        setIsCreateModalOpen(false);
      }
      if (isEditModalOpen && editModalRef.current && !editModalRef.current.contains(event.target as Node)) {
        setIsEditModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen, isCreateModalOpen, isEditModalOpen]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <Toaster />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
          <FileText className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-emerald-600" />
          Exams
        </h1>
        <button
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center justify-center"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Upload className="h-4 w-4 mr-2" /> Create Exam
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 line-clamp-2">{exam.examName}</h2>
              <div className="flex space-x-1 sm:space-x-2 ml-2">
                <button 
                  className="p-1.5 sm:p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                  onClick={() => { setSelectedExam(exam); setIsModalOpen(true); }}
                  title="View Details"
                >
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button 
                  className="p-1.5 sm:p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                  onClick={() => { setEditExam(exam); setIsEditModalOpen(true); }}
                  title="Edit Exam"
                >
                  <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button 
                  className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  onClick={() => handleDeleteExam(exam.id)}
                  title="Delete Exam"
                >
                  <Trash className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center text-gray-600 text-sm sm:text-base">
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{exam.date}</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm sm:text-base">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{exam.startTime} - {exam.endTime}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-600 gap-2">
                <span><strong>Class:</strong> {exam.className}</span>
                <span><strong>Subject:</strong> {exam.subject}</span>
              </div>
              {exam.room && (
                <div className="text-sm text-gray-600">
                  <strong>Room:</strong> {exam.room}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View Exam Modal */}
      <AnimatePresence>
        {isModalOpen && selectedExam && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={viewModalRef}
              className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg mx-auto"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg sm:text-xl font-bold">{selectedExam.examName}</h2>
                <button onClick={() => setIsModalOpen(false)}>
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-sm sm:text-base text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  Date: {selectedExam.date}
                </div>
                <div className="flex items-center text-sm sm:text-base text-gray-600">
                  <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                  Time: {selectedExam.startTime} - {selectedExam.endTime}
                </div>
                <div className="flex items-center text-sm sm:text-base text-gray-600">
                  <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                  Subject: {selectedExam.subject}
                </div>
                <div className="flex items-center text-sm sm:text-base text-gray-600">
                  <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                  Class: {selectedExam.className}
                </div>
                {selectedExam.room && (
                  <div className="flex items-center text-sm sm:text-base text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    Room: {selectedExam.room}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Exam Modal */}
      <AnimatePresence>
        {(isCreateModalOpen || isEditModalOpen) && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={isCreateModalOpen ? createModalRef : editModalRef}
              className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg sm:text-xl font-bold">
                  {isCreateModalOpen ? 'Create New Exam' : 'Edit Exam'}
                </h2>
                <button onClick={() => isCreateModalOpen ? setIsCreateModalOpen(false) : setIsEditModalOpen(false)}>
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Exam Name*</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={isCreateModalOpen ? newExam.examName || '' : editExam.examName || ''}
                    onChange={(e) => isCreateModalOpen 
                      ? setNewExam({ ...newExam, examName: e.target.value })
                      : setEditExam({ ...editExam, examName: e.target.value })
                    }
                  />
                  {errors.examName && <p className="text-sm text-red-500 mt-1">{errors.examName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Class*</label>
                  <select
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={isCreateModalOpen ? newExam.className || '' : editExam.className || ''}
                    onChange={(e) => isCreateModalOpen
                      ? setNewExam({ ...newExam, className: e.target.value })
                      : setEditExam({ ...editExam, className: e.target.value })
                    }
                  >
                    <option value="">Select Class</option>
                    {teacherData?.assignedClasses.map((className) => (
                      <option key={className} value={className}>Class {className}</option>
                    ))}
                  </select>
                  {errors.className && <p className="text-sm text-red-500 mt-1">{errors.className}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Subject*</label>
                  <select
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={isCreateModalOpen ? newExam.subject || '' : editExam.subject || ''}
                    onChange={(e) => isCreateModalOpen
                      ? setNewExam({ ...newExam, subject: e.target.value })
                      : setEditExam({ ...editExam, subject: e.target.value })
                    }
                  >
                    <option value="">Select Subject</option>
                    {teacherData?.assignedSubjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date*</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={isCreateModalOpen ? newExam.date || '' : editExam.date || ''}
                    onChange={(e) => isCreateModalOpen
                      ? setNewExam({ ...newExam, date: e.target.value })
                      : setEditExam({ ...editExam, date: e.target.value })
                    }
                  />
                  {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Start Time*</label>
                  <input
                    type="time"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={isCreateModalOpen ? newExam.startTime || '' : editExam.startTime || ''}
                    onChange={(e) => isCreateModalOpen
                      ? setNewExam({ ...newExam, startTime: e.target.value })
                      : setEditExam({ ...editExam, startTime: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">End Time*</label>
                  <input
                    type="time"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={isCreateModalOpen ? newExam.endTime || '' : editExam.endTime || ''}
                    onChange={(e) => isCreateModalOpen
                      ? setNewExam({ ...newExam, endTime: e.target.value })
                      : setEditExam({ ...editExam, endTime: e.target.value })
                    }
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Room</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={isCreateModalOpen ? newExam.room || '' : editExam.room || ''}
                    onChange={(e) => isCreateModalOpen
                      ? setNewExam({ ...newExam, room: e.target.value })
                      : setEditExam({ ...editExam, room: e.target.value })
                    }
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    onClick={isCreateModalOpen ? handleCreateExam : handleUpdateExam}
                    className="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition-colors"
                  >
                    {isCreateModalOpen ? 'Create Exam' : 'Update Exam'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamManager;