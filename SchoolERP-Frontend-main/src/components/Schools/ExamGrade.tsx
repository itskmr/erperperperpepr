import React, { useState } from 'react';

// Types definitions
type Student = {
  id: string;
  name: string;
  grade: string;
  rollNumber: string;
};

type Exam = {
  id: string;
  name: string;
  subject: string;
  date: string;
  totalMarks: number;
};

type Grade = {
  id: string;
  studentId: string;
  examId: string;
  marksObtained: number;
  percentage: number;
  grade: string;
  remarks: string;
};

// Main App Component
const GradeManagementSchool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'students' | 'exams' | 'grades' | 'reports'>('students');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">School Management System</h1>
        <p className="text-sm">Exam and Grade Management Dashboard</p>
      </header>

      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-4 p-4">
            <li>
              <button
                className={`px-4 py-2 rounded-md ${activeTab === 'students' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setActiveTab('students')}
              >
                Students
              </button>
            </li>
            <li>
              <button
                className={`px-4 py-2 rounded-md ${activeTab === 'exams' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setActiveTab('exams')}
              >
                Exams
              </button>
            </li>
            <li>
              <button
                className={`px-4 py-2 rounded-md ${activeTab === 'grades' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setActiveTab('grades')}
              >
                Grades
              </button>
            </li>
            <li>
              <button
                className={`px-4 py-2 rounded-md ${activeTab === 'reports' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setActiveTab('reports')}
              >
                Reports
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <main className="container mx-auto p-4">
        {activeTab === 'students' && <StudentManagement />}
        {activeTab === 'exams' && <ExamManagement />}
        {activeTab === 'grades' && <GradeManagement />}
        {activeTab === 'reports' && <ReportManagement />}
      </main>

      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto">
          <p className="text-center">&copy; {new Date().getFullYear()} School Management System</p>
        </div>
      </footer>
    </div>
  );
};

// Student Management Component
const StudentManagement: React.FC = () => {
  // Sample student data
  const [students, setStudents] = useState<Student[]>([
    { id: '1', name: 'John Doe', grade: '10A', rollNumber: '1001' },
    { id: '2', name: 'Jane Smith', grade: '10A', rollNumber: '1002' },
    { id: '3', name: 'Mike Johnson', grade: '10B', rollNumber: '1003' },
    { id: '4', name: 'Sarah Williams', grade: '10B', rollNumber: '1004' },
  ]);

  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newStudent, setNewStudent] = useState<Omit<Student, 'id'>>({
    name: '',
    grade: '',
    rollNumber: '',
  });

  // Filter students based on search term
  const filteredStudents = students.filter(
    student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add new student
  const handleAddStudent = () => {
    const student: Student = {
      id: (students.length + 1).toString(),
      ...newStudent,
    };
    setStudents([...students, student]);
    setNewStudent({ name: '', grade: '', rollNumber: '' });
    setIsAddingStudent(false);
  };

  // Update student
  const handleUpdateStudent = () => {
    if (editingStudent) {
      setStudents(
        students.map(student =>
          student.id === editingStudent.id ? editingStudent : student
        )
      );
      setEditingStudent(null);
    }
  };

  // Delete student
  const handleDeleteStudent = (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      setStudents(students.filter(student => student.id !== id));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Student Management</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search students..."
            className="border rounded px-3 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => setIsAddingStudent(true)}
          >
            Add Student
          </button>
        </div>
      </div>

      {/* Add Student Form */}
      {isAddingStudent && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Add New Student</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Grade/Class</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                value={newStudent.grade}
                onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Roll Number</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                value={newStudent.rollNumber}
                onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => setIsAddingStudent(false)}
            >
              Cancel
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleAddStudent}
            >
              Save Student
            </button>
          </div>
        </div>
      )}

      {/* Edit Student Form */}
      {editingStudent && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Edit Student</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                value={editingStudent.name}
                onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Grade/Class</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                value={editingStudent.grade}
                onChange={(e) => setEditingStudent({ ...editingStudent, grade: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Roll Number</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                value={editingStudent.rollNumber}
                onChange={(e) => setEditingStudent({ ...editingStudent, rollNumber: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => setEditingStudent(null)}
            >
              Cancel
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleUpdateStudent}
            >
              Update Student
            </button>
          </div>
        </div>
      )}

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Roll No.</th>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Grade/Class</th>
              <th className="py-2 px-4 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
                <tr key={student.id}>
                  <td className="py-2 px-4 border-b">{student.rollNumber}</td>
                  <td className="py-2 px-4 border-b">{student.name}</td>
                  <td className="py-2 px-4 border-b">{student.grade}</td>
                  <td className="py-2 px-4 border-b text-right">
                    <button
                      className="text-blue-500 hover:text-blue-700 mr-2"
                      onClick={() => setEditingStudent(student)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteStudent(student.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Exam Management Component
const ExamManagement: React.FC = () => {
  // Sample exam data
  const [exams, setExams] = useState<Exam[]>([
    { id: '1', name: 'Mid-Term Math', subject: 'Mathematics', date: '2025-03-20', totalMarks: 100 },
    { id: '2', name: 'Mid-Term Science', subject: 'Science', date: '2025-03-22', totalMarks: 100 },
    { id: '3', name: 'Mid-Term English', subject: 'English', date: '2025-03-25', totalMarks: 100 },
    { id: '4', name: 'Mid-Term History', subject: 'History', date: '2025-03-27', totalMarks: 100 },
  ]);

  const [isAddingExam, setIsAddingExam] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newExam, setNewExam] = useState<Omit<Exam, 'id'>>({
    name: '',
    subject: '',
    date: '',
    totalMarks: 100,
  });

  // Filter exams based on search term
  const filteredExams = exams.filter(
    exam => 
      exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add new exam
  const handleAddExam = () => {
    const exam: Exam = {
      id: (exams.length + 1).toString(),
      ...newExam,
    };
    setExams([...exams, exam]);
    setNewExam({ name: '', subject: '', date: '', totalMarks: 100 });
    setIsAddingExam(false);
  };

  // Update exam
  const handleUpdateExam = () => {
    if (editingExam) {
      setExams(
        exams.map(exam =>
          exam.id === editingExam.id ? editingExam : exam
        )
      );
      setEditingExam(null);
    }
  };

  // Delete exam
  const handleDeleteExam = (id: string) => {
    if (confirm('Are you sure you want to delete this exam?')) {
      setExams(exams.filter(exam => exam.id !== id));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Exam Management</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search exams..."
            className="border rounded px-3 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => setIsAddingExam(true)}
          >
            Add Exam
          </button>
        </div>
      </div>

      {/* Add Exam Form */}
      {isAddingExam && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Add New Exam</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Exam Name</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                value={newExam.name}
                onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                value={newExam.subject}
                onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                className="border rounded px-3 py-2 w-full"
                value={newExam.date}
                onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Marks</label>
              <input
                type="number"
                className="border rounded px-3 py-2 w-full"
                value={newExam.totalMarks}
                onChange={(e) => setNewExam({ ...newExam, totalMarks: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => setIsAddingExam(false)}
            >
              Cancel
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleAddExam}
            >
              Save Exam
            </button>
          </div>
        </div>
      )}

      {/* Edit Exam Form */}
      {editingExam && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Edit Exam</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Exam Name</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                value={editingExam.name}
                onChange={(e) => setEditingExam({ ...editingExam, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                value={editingExam.subject}
                onChange={(e) => setEditingExam({ ...editingExam, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                className="border rounded px-3 py-2 w-full"
                value={editingExam.date}
                onChange={(e) => setEditingExam({ ...editingExam, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Marks</label>
              <input
                type="number"
                className="border rounded px-3 py-2 w-full"
                value={editingExam.totalMarks}
                onChange={(e) => setEditingExam({ ...editingExam, totalMarks: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => setEditingExam(null)}
            >
              Cancel
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleUpdateExam}
            >
              Update Exam
            </button>
          </div>
        </div>
      )}

      {/* Exams Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Exam Name</th>
              <th className="py-2 px-4 border-b text-left">Subject</th>
              <th className="py-2 px-4 border-b text-left">Date</th>
              <th className="py-2 px-4 border-b text-left">Total Marks</th>
              <th className="py-2 px-4 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExams.length > 0 ? (
              filteredExams.map(exam => (
                <tr key={exam.id}>
                  <td className="py-2 px-4 border-b">{exam.name}</td>
                  <td className="py-2 px-4 border-b">{exam.subject}</td>
                  <td className="py-2 px-4 border-b">{exam.date}</td>
                  <td className="py-2 px-4 border-b">{exam.totalMarks}</td>
                  <td className="py-2 px-4 border-b text-right">
                    <button
                      className="text-blue-500 hover:text-blue-700 mr-2"
                      onClick={() => setEditingExam(exam)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteExam(exam.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  No exams found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Grade Management Component
const GradeManagement: React.FC = () => {
  // Sample student data
  const [students] = useState<Student[]>([
    { id: '1', name: 'John Doe', grade: '10A', rollNumber: '1001' },
    { id: '2', name: 'Jane Smith', grade: '10A', rollNumber: '1002' },
    { id: '3', name: 'Mike Johnson', grade: '10B', rollNumber: '1003' },
    { id: '4', name: 'Sarah Williams', grade: '10B', rollNumber: '1004' },
  ]);

  // Sample exam data
  const [exams] = useState<Exam[]>([
    { id: '1', name: 'Mid-Term Math', subject: 'Mathematics', date: '2025-03-20', totalMarks: 100 },
    { id: '2', name: 'Mid-Term Science', subject: 'Science', date: '2025-03-22', totalMarks: 100 },
    { id: '3', name: 'Mid-Term English', subject: 'English', date: '2025-03-25', totalMarks: 100 },
    { id: '4', name: 'Mid-Term History', subject: 'History', date: '2025-03-27', totalMarks: 100 },
  ]);

  // Sample grades data
  const [grades, setGrades] = useState<Grade[]>([
    { id: '1', studentId: '1', examId: '1', marksObtained: 88, percentage: 88, grade: 'A', remarks: 'Excellent' },
    { id: '2', studentId: '1', examId: '2', marksObtained: 76, percentage: 76, grade: 'B', remarks: 'Good' },
    { id: '3', studentId: '2', examId: '1', marksObtained: 92, percentage: 92, grade: 'A+', remarks: 'Outstanding' },
    { id: '4', studentId: '3', examId: '3', marksObtained: 65, percentage: 65, grade: 'C', remarks: 'Average' },
  ]);

  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [newGrade, setNewGrade] = useState<Omit<Grade, 'id' | 'percentage' | 'grade'>>({
    studentId: '',
    examId: '',
    marksObtained: 0,
    remarks: '',
  });

  // Calculate grade based on percentage
  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  // Filter grades based on selected student and exam
  const filteredGrades = grades.filter(
    grade => 
      (selectedStudent ? grade.studentId === selectedStudent : true) &&
      (selectedExam ? grade.examId === selectedExam : true)
  );

  // Add new grade
  const handleAddGrade = () => {
    // Find the selected exam to get total marks
    const exam = exams.find(exam => exam.id === newGrade.examId);
    if (!exam) return;

    // Calculate percentage and grade
    const percentage = (newGrade.marksObtained / exam.totalMarks) * 100;
    const gradeValue = calculateGrade(percentage);

    const grade: Grade = {
      id: (grades.length + 1).toString(),
      ...newGrade,
      percentage,
      grade: gradeValue,
    };

    setGrades([...grades, grade]);
    setNewGrade({ studentId: '', examId: '', marksObtained: 0, remarks: '' });
    setIsAddingGrade(false);
  };

  // Update grade
  const handleUpdateGrade = () => {
    if (editingGrade) {
      // Recalculate percentage and grade
      const exam = exams.find(exam => exam.id === editingGrade.examId);
      if (!exam) return;

      const percentage = (editingGrade.marksObtained / exam.totalMarks) * 100;
      const gradeValue = calculateGrade(percentage);

      const updatedGrade = {
        ...editingGrade,
        percentage,
        grade: gradeValue,
      };

      setGrades(
        grades.map(grade =>
          grade.id === updatedGrade.id ? updatedGrade : grade
        )
      );
      setEditingGrade(null);
    }
  };

  // Delete grade
  const handleDeleteGrade = (id: string) => {
    if (confirm('Are you sure you want to delete this grade entry?')) {
      setGrades(grades.filter(grade => grade.id !== id));
    }
  };

  

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Grade Management</h2>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => setIsAddingGrade(true)}
        >
          Add Grade
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Filter by Student</label>
          <select
            className="border rounded px-3 py-2 w-64"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">All Students</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.rollNumber})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Filter by Exam</label>
          <select
            className="border rounded px-3 py-2 w-64"
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
          >
            <option value="">All Exams</option>
            {exams.map(exam => (
              <option key={exam.id} value={exam.id}>
                {exam.name} ({exam.subject})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Grade Form */}
      {isAddingGrade && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Add New Grade</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Student</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={newGrade.studentId}
                onChange={(e) => setNewGrade({ ...newGrade, studentId: e.target.value })}
              >
                <option value="">Select Student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.rollNumber})
                    </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Exam</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={newGrade.examId}
                onChange={(e) => setNewGrade({ ...newGrade, examId: e.target.value })}
              >
                <option value="">Select Exam</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name} ({exam.subject})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Marks Obtained</label>
              <input
                type="number"
                className="border rounded px-3 py-2 w-full"
                value={newGrade.marksObtained}
                onChange={(e) => setNewGrade({ ...newGrade, marksObtained: parseInt(e.target.value) || 0 })}
                min="0"
                max={newGrade.examId ? exams.find(e => e.id === newGrade.examId)?.totalMarks || 100 : 100}
              />
              {newGrade.examId && (
                <p className="text-sm text-gray-500 mt-1">
                  Max: {exams.find(e => e.id === newGrade.examId)?.totalMarks || 100} marks
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea
                className="border rounded px-3 py-2 w-full"
                value={newGrade.remarks}
                onChange={(e) => setNewGrade({ ...newGrade, remarks: e.target.value })}
                rows={3}
              ></textarea>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => setIsAddingGrade(false)}
            >
              Cancel
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleAddGrade}
              disabled={!newGrade.studentId || !newGrade.examId || newGrade.marksObtained <= 0}
            >
              Save Grade
            </button>
          </div>
        </div>
      )}

      {/* Edit Grade Form */}
      {editingGrade && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Edit Grade</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Student</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={editingGrade.studentId}
                onChange={(e) => setEditingGrade({ ...editingGrade, studentId: e.target.value })}
              >
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.rollNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Exam</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={editingGrade.examId}
                onChange={(e) => setEditingGrade({ ...editingGrade, examId: e.target.value })}
              >
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name} ({exam.subject})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Marks Obtained</label>
              <input
                type="number"
                className="border rounded px-3 py-2 w-full"
                value={editingGrade.marksObtained}
                onChange={(e) => setEditingGrade({ ...editingGrade, marksObtained: parseInt(e.target.value) || 0 })}
                min="0"
                max={editingGrade.examId ? exams.find(e => e.id === editingGrade.examId)?.totalMarks || 100 : 100}
              />
              {editingGrade.examId && (
                <p className="text-sm text-gray-500 mt-1">
                  Max: {exams.find(e => e.id === editingGrade.examId)?.totalMarks || 100} marks
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea
                className="border rounded px-3 py-2 w-full"
                value={editingGrade.remarks}
                onChange={(e) => setEditingGrade({ ...editingGrade, remarks: e.target.value })}
                rows={3}
              ></textarea>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => setEditingGrade(null)}
            >
              Cancel
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleUpdateGrade}
            >
              Update Grade
            </button>
          </div>
        </div>
      )}

      {/* Grades Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Student</th>
              <th className="py-2 px-4 border-b text-left">Exam</th>
              <th className="py-2 px-4 border-b text-left">Marks</th>
              <th className="py-2 px-4 border-b text-left">Percentage</th>
              <th className="py-2 px-4 border-b text-left">Grade</th>
              <th className="py-2 px-4 border-b text-left">Remarks</th>
              <th className="py-2 px-4 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrades.length > 0 ? (
              filteredGrades.map(grade => {
                const student = students.find(s => s.id === grade.studentId);
                const exam = exams.find(e => e.id === grade.examId);
                return (
                  <tr key={grade.id} className={grade.grade === 'F' ? 'bg-red-50' : ''}>
                    <td className="py-2 px-4 border-b">
                      {student ? `${student.name} (${student.rollNumber})` : 'Unknown Student'}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {exam ? `${exam.name}` : 'Unknown Exam'}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {grade.marksObtained} / {exam ? exam.totalMarks : '?'}
                    </td>
                    <td className="py-2 px-4 border-b">{grade.percentage.toFixed(2)}%</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`font-bold px-2 py-1 rounded ${
                        grade.grade === 'A+' || grade.grade === 'A' ? 'bg-green-100 text-green-800' :
                        grade.grade === 'B+' || grade.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                        grade.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        grade.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {grade.grade}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">{grade.remarks}</td>
                    <td className="py-2 px-4 border-b text-right">
                      <button
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        onClick={() => setEditingGrade(grade)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteGrade(grade.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-4 text-center text-gray-500">
                  No grades found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Grade Summary */}
      {selectedStudent && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Student Grade Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Stats */}
            <div>
              <h4 className="font-medium mb-2">Performance Stats</h4>
              {(() => {
                const studentGrades = grades.filter(g => g.studentId === selectedStudent);
                if (studentGrades.length === 0) return <p>No grades available for this student.</p>;

                const avgPercentage = studentGrades.reduce((sum, g) => sum + g.percentage, 0) / studentGrades.length;
                const highest = Math.max(...studentGrades.map(g => g.percentage));
                const lowest = Math.min(...studentGrades.map(g => g.percentage));
                const totalExams = studentGrades.length;

                return (
                  <div className="space-y-2">
                    <p><span className="font-medium">Average:</span> {avgPercentage.toFixed(2)}% ({calculateGrade(avgPercentage)})</p>
                    <p><span className="font-medium">Highest:</span> {highest.toFixed(2)}%</p>
                    <p><span className="font-medium">Lowest:</span> {lowest.toFixed(2)}%</p>
                    <p><span className="font-medium">Total Exams:</span> {totalExams}</p>
                  </div>
                );
              })()}
            </div>
            
            {/* Performance Chart Placeholder */}
            <div className="border p-4 flex items-center justify-center">
              <p className="text-gray-500">Performance chart would be displayed here</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Report Management Component
const ReportManagement: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">Report Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <h3 className="font-medium text-lg mb-2">Class Performance Report</h3>
          <p className="text-gray-600 mb-4">View and download performance reports by class</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Generate Report
          </button>
        </div>
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <h3 className="font-medium text-lg mb-2">Subject Analysis Report</h3>
          <p className="text-gray-600 mb-4">Analyze student performance by subject</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Generate Report
          </button>
        </div>
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <h3 className="font-medium text-lg mb-2">Student Progress Card</h3>
          <p className="text-gray-600 mb-4">Generate individual student progress cards</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Generate Report
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-medium text-lg mb-4">Recent Reports</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">Report Name</th>
                <th className="py-2 px-4 border-b text-left">Type</th>
                <th className="py-2 px-4 border-b text-left">Generated On</th>
                <th className="py-2 px-4 border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b">Class 10A Mid-Term Report</td>
                <td className="py-2 px-4 border-b">Class Performance</td>
                <td className="py-2 px-4 border-b">Mar 10, 2025</td>
                <td className="py-2 px-4 border-b text-right">
                  <button className="text-blue-500 hover:text-blue-700 mr-2">View</button>
                  <button className="text-green-500 hover:text-green-700">Download</button>
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">Mathematics Performance Analysis</td>
                <td className="py-2 px-4 border-b">Subject Analysis</td>
                <td className="py-2 px-4 border-b">Mar 5, 2025</td>
                <td className="py-2 px-4 border-b text-right">
                  <button className="text-blue-500 hover:text-blue-700 mr-2">View</button>
                  <button className="text-green-500 hover:text-green-700">Download</button>
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">John Doe Progress Card</td>
                <td className="py-2 px-4 border-b">Student Progress</td>
                <td className="py-2 px-4 border-b">Mar 1, 2025</td>
                <td className="py-2 px-4 border-b text-right">
                  <button className="text-blue-500 hover:text-blue-700 mr-2">View</button>
                  <button className="text-green-500 hover:text-green-700">Download</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GradeManagementSchool;