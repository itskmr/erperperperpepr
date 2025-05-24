import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  HelpCircle, 
  MessageSquare,
  Send,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const StudentFAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openQuestions, setOpenQuestions] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    question: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // FAQ data
  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: 'How do I check my attendance record?',
      answer: 'You can view your attendance record by navigating to the "Profile" section and clicking on the "Attendance" tab. This will show you a detailed breakdown of your attendance by subject and date.',
      category: 'Attendance'
    },
    {
      id: 2,
      question: 'How can I submit an assignment online?',
      answer: 'To submit an assignment, go to the "Assignments" section, find the relevant assignment, click on "Submit", and upload your file. Make sure to click "Confirm Submission" after uploading.',
      category: 'Assignments'
    },
    {
      id: 3,
      question: 'How do I access my exam results?',
      answer: 'Exam results can be accessed through the "Academics" section. Click on "Exam Results" to view all your past examination scores, grades, and performance analytics.',
      category: 'Exams'
    },
    {
      id: 4,
      question: 'How can I contact my subject teacher?',
      answer: 'To contact your teacher, you can use the "Chat" feature or go to the "Teachers" section, find your teacher, and click on the "Message" button to start a conversation.',
      category: 'Communication'
    },
    {
      id: 5,
      question: 'How do I update my personal information?',
      answer: 'To update your personal information, go to "Profile", click on "Edit Profile", make the necessary changes, and save your updates. Some information might require approval from the administration.',
      category: 'Profile'
    },
    {
      id: 6,
      question: 'What should I do if I forgot my password?',
      answer: 'If you\'ve forgotten your password, click on the "Forgot Password" link on the login page. Follow the instructions to reset your password using your registered email address.',
      category: 'Account'
    },
    {
      id: 7,
      question: 'How can I see my class schedule?',
      answer: 'Your class schedule is available in the "Dashboard" section. You can view it by day, week, or month. Click on any class for more details about the subject and teacher.',
      category: 'Schedule'
    },
    {
      id: 8,
      question: 'How do I join an extracurricular activity?',
      answer: 'To join an activity, go to the "Activities" section, browse available options, and click "Join". Some activities may require approval or have limited spots available.',
      category: 'Activities'
    },
    {
      id: 9,
      question: 'Can I see my upcoming exams and assignments?',
      answer: 'Yes, your upcoming exams and assignments are displayed on your Dashboard. You can also access the "Calendar" section for a more detailed view of all scheduled events.',
      category: 'Schedule'
    },
    {
      id: 10,
      question: 'How do I view my academic progress over time?',
      answer: 'You can track your academic progress in the "Academics" section under "Performance Analytics". This shows your grades, improvement areas, and trends over different terms.',
      category: 'Academics'
    }
  ];

  // Unique categories from FAQ items
  const categories = ['All', ...Array.from(new Set(faqItems.map(item => item.category)))];

  // Toggle question open/closed
  const toggleQuestion = (id: number) => {
    setOpenQuestions(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  // Filter FAQ items based on search and category
  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    console.log('Submitted question:', formData);
    setFormSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ question: '' });
      setFormSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <motion.div
          className="text-center mb-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white mb-5 shadow-lg shadow-blue-200">
            <BookOpen size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about using the student portal.
          </p>
        </motion.div>

        {/* Search and Filter Section - Simple single row layout */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-blue-500" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-2.5 border border-blue-100 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-300 transition-all duration-200"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex overflow-x-auto space-x-2 no-scrollbar sm:max-w-[60%] pb-1">
              {categories.slice(0, 5).map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    activeCategory === category
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* FAQ List Section - 2 columns on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <AnimatePresence>
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <motion.div
                  key={faq.id}
                  className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  layout
                >
                  <motion.button
                    onClick={() => toggleQuestion(faq.id)}
                    className="w-full px-4 py-3 flex justify-between items-start text-left focus:outline-none group"
                    whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.6)" }}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <span className={`flex items-center justify-center h-8 w-8 rounded-md ${
                          openQuestions.includes(faq.id) 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                        } transition-colors duration-200`}>
                          <HelpCircle className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                          {faq.question}
                        </p>
                        <p className="mt-1 text-xs font-medium text-blue-500 bg-blue-50 rounded-full px-2 py-0.5 inline-block">
                          {faq.category}
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <div className={`p-1.5 rounded-full ${
                        openQuestions.includes(faq.id) 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500'
                        } transition-colors duration-200`}>
                        {openQuestions.includes(faq.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {openQuestions.includes(faq.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 pb-4"
                      >
                        <div className="border-t border-gray-100 pt-3 pl-11">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-100 md:col-span-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gray-100">
                  <HelpCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">No questions found</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <motion.button
                  onClick={() => {setSearchQuery(''); setActiveCategory('All');}}
                  className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Reset filters
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Simplified Ask a Question Form - Single field */}
        <motion.div
          className="bg-white rounded-lg shadow-md border border-gray-100 p-6 overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full opacity-30 -z-10"></div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Can't find what you're looking for?
          </h2>
          <p className="text-gray-600 mb-5 max-w-2xl text-sm">
            Submit your question below and our support team will get back to you as soon as possible.
          </p>

          {formSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
            >
              <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-800 font-bold text-lg">Thank you for your question!</p>
              <p className="text-green-700 mt-1 text-sm">
                We'll review it and get back to you soon.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <textarea
                  id="question"
                  name="question"
                  rows={3}
                  required
                  value={formData.question}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all duration-200"
                  placeholder="Type your question here. We'll respond through your student account."
                />
              </div>
              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03, boxShadow: "0 8px 12px -4px rgba(59, 130, 246, 0.3)" }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Question
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>

        {/* Contact Support */}
        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p className="text-gray-600 text-sm">
            Need immediate assistance? <a href="/student/help/contact" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-200">Contact Support</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentFAQ;