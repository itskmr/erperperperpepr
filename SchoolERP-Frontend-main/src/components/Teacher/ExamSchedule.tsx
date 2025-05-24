import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, XCircle, BookOpen, Clock, MapPin, Users } from 'lucide-react';
import { Exam } from './types';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Class Filter component with green theme
const ClassFilter = ({ selectedClass, setSelectedClass }: {
  selectedClass: string;
  setSelectedClass: (value: string) => void;
}) => {
  const allClasses = Array.from({ length: 12 }, (_, i) => `${i + 1}`);
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
      <h3 className="font-medium mb-2 sm:mb-3 text-gray-700 flex items-center gap-2">
        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
        Filter by Class
      </h3>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        <button
          onClick={() => setSelectedClass('all')}
          className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all
            ${selectedClass === 'all' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
        >
          All Classes
        </button>
        {allClasses.map(className => (
          <button
            key={className}
            onClick={() => setSelectedClass(className)}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all
              ${selectedClass === className 
                ? 'bg-emerald-600 text-white' 
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
          >
            Class {className}
          </button>
        ))}
      </div>
    </div>
  );
};

// Exam Item component for popup
const ExamItem = ({ exam }: { exam: Exam }) => (
  <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-2">{exam.examName}</h3>
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-emerald-500" />
            <span>{exam.subject}</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-emerald-500" />
            <span>Class {exam.className}</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-emerald-500" />
            <span>{exam.startTime} - {exam.endTime}</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-emerald-500" />
            <span>{exam.room}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Calendar Day Cell component with green theme
const CalendarDayCell = ({ 
  date, 
  exams, 
  isPadding, 
  isToday,
  onViewExams 
}: { 
  date: Date;
  exams: Exam[];
  isPadding: boolean;
  isToday: boolean;
  onViewExams: (exams: Exam[]) => void;
}) => (
  <div className={`bg-white p-2 sm:p-4 min-h-[90px] sm:min-h-[120px] border-t border-l ${isPadding ? 'text-gray-400 bg-gray-50/50' : 'text-gray-900'}`}>
    <div className="flex items-start justify-between">
      <span className={`text-xs sm:text-sm ${
        isToday ? 'h-5 w-5 sm:h-6 sm:w-6 bg-emerald-600 text-white rounded-full flex items-center justify-center' : ''
      }`}>
        {date.getDate()}
      </span>
      
      {exams.length > 0 && !isPadding && (
        <button
          onClick={() => onViewExams(exams)}
          className="p-1 hover:bg-emerald-50 rounded-full transition-colors"
          title="View exams"
        >
          <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
        </button>
      )}
    </div>

    {exams.length > 0 && !isPadding && (
      <div className="mt-1 sm:mt-2 space-y-1">
        {exams.map((exam) => (
          <div 
            key={exam.id}
            className="bg-emerald-50 text-emerald-700 text-xs p-1 sm:p-1.5 rounded truncate border border-emerald-100"
          >
            {exam.examName}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default function SchoolCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExams, setSelectedExams] = useState<Exam[] | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('all');

  useEffect(() => {
    const savedExams = localStorage.getItem('exams');
    if (savedExams) {
      try {
        setExams(JSON.parse(savedExams));
      } catch (error) {
        console.error('Error loading exams:', error);
      }
    }
    
    // Listen for exam updates
    window.addEventListener('examsUpdated', () => {
      const updatedExams = localStorage.getItem('exams');
      if (updatedExams) {
        setExams(JSON.parse(updatedExams));
      }
    });

    return () => {
      window.removeEventListener('examsUpdated', () => {});
    };
  }, []);

  const getExamsForDate = (date: Date) => {
    return exams.filter(exam => {
      const examDate = new Date(exam.date);
      return examDate.toDateString() === date.toDateString() && 
        (selectedClass === 'all' || exam.className === selectedClass);
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const startPadding = firstDay.getDay();
    
    // Add padding days from previous month
    for (let i = 0; i < startPadding; i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift({ date: prevDate, isPadding: true });
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isPadding: false });
    }
    
    return days;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="text-xl sm:text-2xl font-bold">Exam Schedules</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          <ClassFilter 
            selectedClass={selectedClass} 
            setSelectedClass={setSelectedClass}
          />
        </div>

        <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-3 sm:p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="w-full sm:w-auto px-3 py-1 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 transition-colors"
              >
                Today
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-1 hover:bg-emerald-50 rounded-full text-emerald-600 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-1 hover:bg-emerald-50 rounded-full text-emerald-600 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="min-w-[640px] sm:min-w-full">
              <div className="grid grid-cols-7 border-r border-b border-gray-200">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="bg-emerald-50/50 p-2 sm:p-4 text-xs sm:text-sm font-medium text-emerald-800 border-t border-l border-gray-200">
                    {day}
                  </div>
                ))}

                {getDaysInMonth(currentDate).map(({ date, isPadding }, index) => (
                  <CalendarDayCell
                    key={index}
                    date={date}
                    exams={getExamsForDate(date)}
                    isPadding={isPadding}
                    isToday={date.toDateString() === new Date().toDateString()}
                    onViewExams={setSelectedExams}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Details Popup */}
      {selectedExams && selectedExams.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedExams(null)}>
          <div 
            className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[80vh] overflow-y-auto m-4" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  {new Date(selectedExams[0].date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {selectedExams.length} {selectedExams.length === 1 ? 'exam' : 'exams'} scheduled
                </p>
              </div>
              <button 
                onClick={() => setSelectedExams(null)}
                className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {selectedExams.map(exam => (
                <ExamItem key={exam.id} exam={exam} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}