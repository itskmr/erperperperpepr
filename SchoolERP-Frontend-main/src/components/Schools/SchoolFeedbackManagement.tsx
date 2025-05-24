import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Building2, 
  ClipboardList,
  Filter,
  Search,
  Send,
  Clock,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  type: 'teacher' | 'facility' | 'policy';
  parentName: string;
  studentName: string;
  title: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'replied' | 'resolved';
  reply?: string;
  teacherName?: string;
}

const SchoolFeedbackManagement: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
    {
      id: '1',
      type: 'teacher',
      parentName: 'John Doe',
      studentName: 'Jane Doe',
      teacherName: 'Mrs. Smith',
      title: 'Class Performance',
      message: 'How is my child performing in mathematics?',
      timestamp: '2024-03-25T10:30:00',
      status: 'pending'
    },
    {
      id: '2',
      type: 'facility',
      parentName: 'Alice Johnson',
      studentName: 'Bob Johnson',
      title: 'Library Hours',
      message: 'Can the library be open during weekends?',
      timestamp: '2024-03-24T15:45:00',
      status: 'replied',
      reply: 'We are considering extending library hours. Will update soon.'
    },
    // Add more sample data as needed
  ]);

  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'teacher' | 'facility' | 'policy'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesFilter = filter === 'all' || feedback.type === filter;
    const matchesSearch = searchQuery === '' || 
      feedback.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleReply = async (feedbackId: string) => {
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement API call to submit reply
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      setFeedbacks(prev => prev.map(feedback => 
        feedback.id === feedbackId 
          ? { ...feedback, status: 'replied', reply: replyText }
          : feedback
      ));
      
      setReplyText('');
      setSelectedFeedback(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'replied':
        return 'bg-emerald-100 text-emerald-700';
      case 'resolved':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'teacher':
        return <User className="w-4 h-4" />;
      case 'facility':
        return <Building2 className="w-4 h-4" />;
      case 'policy':
        return <ClipboardList className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Feedback Management</h1>
        <p className="text-gray-600">View and manage all feedback from parents.</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="teacher">Teacher Feedback</option>
            <option value="facility">Facility Feedback</option>
            <option value="policy">Policy Feedback</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Feedback</h2>
          <div className="space-y-4">
            {filteredFeedbacks.map(feedback => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  selectedFeedback?.id === feedback.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                } cursor-pointer transition-all duration-200`}
                onClick={() => setSelectedFeedback(feedback)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(feedback.type)}
                    <h3 className="font-medium text-gray-900">{feedback.title}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                    {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  From: {feedback.parentName} (Parent of {feedback.studentName})
                  {feedback.teacherName && ` • Teacher: ${feedback.teacherName}`}
                </p>
                <p className="text-gray-600 mt-2 line-clamp-2">{feedback.message}</p>
                <div className="flex items-center text-sm text-gray-500 mt-3">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(feedback.timestamp).toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Reply Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {selectedFeedback ? (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Manage Feedback</h2>
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  {getTypeIcon(selectedFeedback.type)}
                  <h3 className="font-medium text-gray-900">{selectedFeedback.title}</h3>
                </div>
                <p className="text-sm text-gray-500">
                  From: {selectedFeedback.parentName} (Parent of {selectedFeedback.studentName})
                  {selectedFeedback.teacherName && ` • Teacher: ${selectedFeedback.teacherName}`}
                </p>
                <p className="text-gray-600 mt-2">{selectedFeedback.message}</p>
              </div>

              {selectedFeedback.reply && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-700 mb-2">Previous Reply</h4>
                  <p className="text-gray-700">{selectedFeedback.reply}</p>
                </div>
              )}

              <div>
                <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-2">
                  Add Response
                </label>
                <textarea
                  id="reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your response here..."
                />
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => handleReply(selectedFeedback.id)}
                    disabled={isSubmitting || !replyText.trim()}
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Send className="w-4 h-4 mr-2" />
                        Send Reply
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setFeedbacks(prev => prev.map(feedback => 
                        feedback.id === selectedFeedback.id 
                          ? { ...feedback, status: 'resolved' }
                          : feedback
                      ));
                      setSelectedFeedback(null);
                    }}
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageSquare className="w-12 h-12 mb-4" />
              <p className="text-center">Select feedback to view details and respond</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolFeedbackManagement; 