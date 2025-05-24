import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  MessageSquare, 
  Building2, 
  ClipboardList, 
  Send, 
  CheckCircle2,
  AlertCircle,
  MapPin,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

interface BaseFeedback {
  type: 'teacher' | 'facility' | 'policy';
  rating: number;
  title: string;
  comment: string;
}

interface TeacherFeedback extends BaseFeedback {
  type: 'teacher';
  teacherName: string;
  subject: string;
}

interface FacilityFeedback extends BaseFeedback {
  type: 'facility';
  facilityType: 'classroom' | 'library' | 'playground' | 'cafeteria' | 'bathroom' | 'other';
  location: string;
  issueType: 'maintenance' | 'safety' | 'cleanliness' | 'accessibility' | 'other';
}

interface PolicyFeedback extends BaseFeedback {
  type: 'policy';
  category: 'academic' | 'disciplinary' | 'safety' | 'communication' | 'other';
  impact: 'positive' | 'negative' | 'neutral';
  suggestions: string;
}

type FeedbackForm = TeacherFeedback | FacilityFeedback | PolicyFeedback;

const FeedbackAndSurveys: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'teacher' | 'facility' | 'policy'>('teacher');
  const [feedback, setFeedback] = useState<FeedbackForm>({
    type: 'teacher',
    rating: 0,
    title: '',
    comment: '',
    teacherName: '',
    subject: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleRatingClick = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Implement API call to submit feedback
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setSubmitStatus('success');
      resetForm();
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    switch (activeTab) {
      case 'teacher':
        setFeedback({
          type: 'teacher',
          rating: 0,
          title: '',
          comment: '',
          teacherName: '',
          subject: ''
        });
        break;
      case 'facility':
        setFeedback({
          type: 'facility',
          rating: 0,
          title: '',
          comment: '',
          facilityType: 'classroom',
          location: '',
          issueType: 'maintenance'
        });
        break;
      case 'policy':
        setFeedback({
          type: 'policy',
          rating: 0,
          title: '',
          comment: '',
          category: 'academic',
          impact: 'neutral',
          suggestions: ''
        });
        break;
    }
  };

  const tabs = [
    { id: 'teacher', label: 'Teacher Feedback', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'facility', label: 'Facility Feedback', icon: <Building2 className="w-5 h-5" /> },
    { id: 'policy', label: 'Policy Feedback', icon: <ClipboardList className="w-5 h-5" /> }
  ];

  const renderTeacherFields = () => (
    <>
      <div className="mb-6">
        <label htmlFor="teacherName" className="block text-sm font-medium text-gray-700 mb-2">
          Teacher Name
        </label>
        <input
          type="text"
          id="teacherName"
          value={(feedback as TeacherFeedback).teacherName}
          onChange={(e) => setFeedback(prev => ({ ...prev, teacherName: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Enter teacher's name"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          value={(feedback as TeacherFeedback).subject}
          onChange={(e) => setFeedback(prev => ({ ...prev, subject: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Enter subject"
          required
        />
      </div>
    </>
  );

  const renderFacilityFields = () => (
    <>
      <div className="mb-6">
        <label htmlFor="facilityType" className="block text-sm font-medium text-gray-700 mb-2">
          Facility Type
        </label>
        <select
          id="facilityType"
          value={(feedback as FacilityFeedback).facilityType}
          onChange={(e) => setFeedback(prev => ({ ...prev, facilityType: e.target.value as any }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="classroom">Classroom</option>
          <option value="library">Library</option>
          <option value="playground">Playground</option>
          <option value="cafeteria">Cafeteria</option>
          <option value="bathroom">Bathroom</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="mb-6">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            id="location"
            value={(feedback as FacilityFeedback).location}
            onChange={(e) => setFeedback(prev => ({ ...prev, location: e.target.value }))}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Specify location (e.g., Room 101, Building A)"
            required
          />
        </div>
      </div>
      <div className="mb-6">
        <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-2">
          Issue Type
        </label>
        <select
          id="issueType"
          value={(feedback as FacilityFeedback).issueType}
          onChange={(e) => setFeedback(prev => ({ ...prev, issueType: e.target.value as any }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="maintenance">Maintenance</option>
          <option value="safety">Safety</option>
          <option value="cleanliness">Cleanliness</option>
          <option value="accessibility">Accessibility</option>
          <option value="other">Other</option>
        </select>
      </div>
    </>
  );

  const renderPolicyFields = () => (
    <>
      <div className="mb-6">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Policy Category
        </label>
        <select
          id="category"
          value={(feedback as PolicyFeedback).category}
          onChange={(e) => setFeedback(prev => ({ ...prev, category: e.target.value as any }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="academic">Academic</option>
          <option value="disciplinary">Disciplinary</option>
          <option value="safety">Safety</option>
          <option value="communication">Communication</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="mb-6">
        <label htmlFor="impact" className="block text-sm font-medium text-gray-700 mb-2">
          Impact
        </label>
        <select
          id="impact"
          value={(feedback as PolicyFeedback).impact}
          onChange={(e) => setFeedback(prev => ({ ...prev, impact: e.target.value as any }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
      </div>
      <div className="mb-6">
        <label htmlFor="suggestions" className="block text-sm font-medium text-gray-700 mb-2">
          Suggestions for Improvement
        </label>
        <div className="relative">
          <Lightbulb className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          <textarea
            id="suggestions"
            value={(feedback as PolicyFeedback).suggestions}
            onChange={(e) => setFeedback(prev => ({ ...prev, suggestions: e.target.value }))}
            rows={3}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Share your suggestions for policy improvement..."
            required
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Feedback & Surveys</h1>
        <p className="text-gray-600">Share your thoughts and help us improve the school experience.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as 'teacher' | 'facility' | 'policy');
              resetForm();
            }}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors
              ${activeTab === tab.id
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Feedback Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={feedback.title}
            onChange={(e) => setFeedback(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Enter a title for your feedback"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= feedback.rating
                      ? 'fill-pink-500 text-pink-500'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Fields based on activeTab */}
        {activeTab === 'teacher' && renderTeacherFields()}
        {activeTab === 'facility' && renderFacilityFields()}
        {activeTab === 'policy' && renderPolicyFields()}

        <div className="mb-6">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Feedback
          </label>
          <textarea
            id="comment"
            value={feedback.comment}
            onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Share your thoughts..."
            required
          />
        </div>

        {submitStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center"
          >
            <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700">Thank you for your feedback!</span>
          </motion.div>
        )}

        {submitStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center"
          >
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">There was an error submitting your feedback. Please try again.</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            <span className="flex items-center">
              <Send className="w-4 h-4 mr-2" />
              Submit Feedback
            </span>
          )}
        </button>
      </motion.form>
    </div>
  );
};

export default FeedbackAndSurveys; 