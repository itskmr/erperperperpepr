import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  Send,
  Clock,
  User
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  parentName: string;
  studentName: string;
  title: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'replied';
  reply?: string;
}

const TeacherFeedback: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
    {
      id: '1',
      parentName: 'John Doe',
      studentName: 'Jane Doe',
      title: 'Class Performance',
      message: 'How is my child performing in mathematics?',
      timestamp: '2024-03-25T10:30:00',
      status: 'pending'
    },
    // Add more sample data as needed
  ]);

  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Parent Queries</h1>
        <p className="text-gray-600">View and respond to parent feedback and questions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Queries</h2>
          <div className="space-y-4">
            {feedbacks.map(feedback => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  selectedFeedback?.id === feedback.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300'
                } cursor-pointer transition-all duration-200`}
                onClick={() => setSelectedFeedback(feedback)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{feedback.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      From: {feedback.parentName} (Parent of {feedback.studentName})
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    feedback.status === 'replied'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {feedback.status === 'replied' ? 'Replied' : 'Pending'}
                  </span>
                </div>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Reply to Query</h2>
              <div className="mb-6">
                <h3 className="font-medium text-gray-900">{selectedFeedback.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  From: {selectedFeedback.parentName} (Parent of {selectedFeedback.studentName})
                </p>
                <p className="text-gray-600 mt-2">{selectedFeedback.message}</p>
              </div>

              {selectedFeedback.reply && (
                <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
                  <h4 className="font-medium text-emerald-700 mb-2">Your Reply</h4>
                  <p className="text-gray-700">{selectedFeedback.reply}</p>
                </div>
              )}

              {selectedFeedback.status === 'pending' && (
                <div>
                  <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response
                  </label>
                  <textarea
                    id="reply"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Type your response here..."
                  />
                  <button
                    onClick={() => handleReply(selectedFeedback.id)}
                    disabled={isSubmitting || !replyText.trim()}
                    className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageSquare className="w-12 h-12 mb-4" />
              <p className="text-center">Select a query to view details and respond</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherFeedback; 