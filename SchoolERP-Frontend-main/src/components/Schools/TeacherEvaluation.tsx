import React, { useState, useEffect } from 'react';

interface TeacherEvaluationFormProps {
  teacherId: string;
  teacherName: string;
  subject: string;
  className: string;
}

interface EvaluationCriteria {
  id: number;
  title: string;
  description: string;
}

const TeacherEvaluationPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<TeacherEvaluationFormProps[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherEvaluationFormProps | null>(null);
  const [ratings, setRatings] = useState<{[key: number]: number}>({});
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const evaluationCriteria: EvaluationCriteria[] = [
    { id: 1, title: 'Teaching Quality', description: 'Ability to explain complex concepts clearly' },
    { id: 2, title: 'Class Management', description: 'Maintaining discipline and productive learning environment' },
    { id: 3, title: 'Student Engagement', description: 'Ability to keep students interested and participating' },
    { id: 4, title: 'Curriculum Knowledge', description: 'Mastery of subject matter' },
    { id: 5, title: 'Responsiveness', description: 'Availability to help students and address questions' },
  ];

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setTeachers([
        { teacherId: 'T001', teacherName: 'Dr. Sarah Johnson', subject: 'Mathematics', className: '10-A' },
        { teacherId: 'T002', teacherName: 'Prof. Michael Chen', subject: 'Physics', className: '11-B' },
        { teacherId: 'T003', teacherName: 'Ms. Emily Rodriguez', subject: 'English Literature', className: '9-C' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTeacherSelect = (teacher: TeacherEvaluationFormProps) => {
    setSelectedTeacher(teacher);
    setRatings({});
    setComment('');
    setIsSuccess(false);
  };

  const handleRatingChange = (criteriaId: number, value: number) => {
    setRatings(prev => ({
      ...prev,
      [criteriaId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API submission
    setTimeout(() => {
      console.log({
        teacherId: selectedTeacher?.teacherId,
        ratings,
        comment
      });
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setSelectedTeacher(null);
        setRatings({});
        setComment('');
      }, 2000);
    }, 1500);
  };

  const isFormComplete = selectedTeacher && 
    evaluationCriteria.every(criteria => ratings[criteria.id]) && 
    comment.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div 
        className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 ease-in-out"
        style={{opacity: loading ? 0 : 1, transform: loading ? 'translateY(20px)' : 'translateY(0)'}}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-8">
          <h1 className="text-3xl font-bold text-white">Teacher Evaluation Form</h1>
          <p className="text-blue-100 mt-2">Provide your feedback to help improve teaching quality</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="p-8">
            {!selectedTeacher ? (
              <div 
                className="animate-fade-in"
                style={{animation: 'fadeIn 0.5s ease-out forwards'}}
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Select a Teacher to Evaluate</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teachers.map((teacher) => (
                    <div 
                      key={teacher.teacherId}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md border border-blue-100 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                      onClick={() => handleTeacherSelect(teacher)}
                    >
                      <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <span className="text-xl text-white font-bold">
                          {teacher.teacherName.split(' ').map(name => name).join('')}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 text-center">{teacher.teacherName}</h3>
                      <p className="text-indigo-600 font-medium text-center">{teacher.subject}</p>
                      <p className="text-gray-600 text-center mt-1">Class: {teacher.className}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div 
                className="animate-slide-up"
                style={{animation: 'slideUp 0.5s ease-out forwards'}}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">{selectedTeacher.teacherName}</h2>
                    <p className="text-indigo-600">{selectedTeacher.subject} | Class {selectedTeacher.className}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedTeacher(null)}
                    className="text-sm text-gray-600 hover:text-indigo-600 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to teachers list
                  </button>
                </div>

                {isSuccess ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-green-800">Evaluation Submitted Successfully!</h3>
                    <p className="text-green-600 mt-2">Thank you for your valuable feedback.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Evaluation Criteria</h3>
                      {evaluationCriteria.map((criteria) => (
                        <div 
                          key={criteria.id} 
                          className="mb-6 border-b border-gray-100 pb-6"
                          style={{
                            animation: `fadeIn 0.5s ease-out forwards ${criteria.id * 0.1}s`,
                            opacity: 0
                          }}
                        >
                          <div className="flex flex-wrap justify-between items-start mb-2">
                            <div className="mb-2 md:mb-0">
                              <h4 className="text-lg font-medium text-gray-800">{criteria.title}</h4>
                              <p className="text-gray-600 text-sm">{criteria.description}</p>
                            </div>
                            <div className="flex space-x-1 md:space-x-2">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  type="button"
                                  onClick={() => handleRatingChange(criteria.id, rating)}
                                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                                    ratings[criteria.id] === rating
                                      ? 'bg-indigo-600 text-white transform scale-110'
                                      : 'bg-gray-100 text-gray-600 hover:bg-indigo-100'
                                  }`}
                                >
                                  {rating}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                            <div 
                              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                              style={{ width: ratings[criteria.id] ? `${(ratings[criteria.id] / 5) * 100}%` : '0%' }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Comments</h3>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        rows={4}
                        placeholder="Please share your thoughts about the teacher's performance..."
                        required
                      ></textarea>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!isFormComplete || isSubmitting}
                        className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 ${
                          isFormComplete && !isSubmitting
                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md hover:shadow-lg'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </div>
                        ) : (
                          'Submit Evaluation'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default TeacherEvaluationPage;