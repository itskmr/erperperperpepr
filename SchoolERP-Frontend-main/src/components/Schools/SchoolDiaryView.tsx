import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  BookOpen, 
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Download,
  File,
  Image
} from 'lucide-react';

interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  date: string;
  className: string;
  section: string;
  subject: string;
  entryType: 'LESSON' | 'HOMEWORK' | 'ANNOUNCEMENT' | 'REMINDER' | 'OBSERVATION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  isPublic: boolean;
  teacher: {
    id: number;
    fullName: string;
    email: string;
    designation: string;
  };
  attachments?: string[];
  imageUrls?: string[];
  homework?: string;
  classSummary?: string;
  notices?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  startDate: string;
  endDate: string;
  className: string;
  section: string;
  subject: string;
  entryType: string;
  priority: string;
  teacherId: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const SchoolDiaryView: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    className: '',
    section: '',
    subject: '',
    entryType: '',
    priority: '',
    teacherId: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalEntries: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false
  });

  // Available teachers for filtering
  const [teachers, setTeachers] = useState<Array<{id: number, fullName: string}>>([]);
  const [classes, setClasses] = useState<Array<{className: string, sections: string[]}>>([]);

  const entryTypes = [
    { value: 'LESSON', label: 'Lesson Plan', color: 'bg-blue-100 text-blue-800' },
    { value: 'HOMEWORK', label: 'Homework', color: 'bg-green-100 text-green-800' },
    { value: 'ANNOUNCEMENT', label: 'Announcement', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'REMINDER', label: 'Reminder', color: 'bg-purple-100 text-purple-800' },
    { value: 'OBSERVATION', label: 'Observation', color: 'bg-orange-100 text-orange-800' }
  ];

  const priorityLevels = [
    { value: 'LOW', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'HIGH', label: 'High', color: 'bg-red-100 text-red-800' }
  ];

  // Fetch diary entries for school view
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pagination.limit.toString(),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.className && { className: filters.className }),
        ...(filters.section && { section: filters.section }),
        ...(filters.subject && { subject: filters.subject }),
        ...(filters.entryType && { entryType: filters.entryType }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.teacherId && { teacherId: filters.teacherId })
      });

      const response = await fetch(`/api/teacher-diary/view?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        setError('Session expired. Please log in again.');
        setTimeout(() => {
          window.location.href = '/auth';
        }, 2000);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch diary entries`);
      }

      const data = await response.json();
      setEntries(data.data.entries || []);
      setPagination(data.data.pagination || pagination);
      setError('');
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load diary entries');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available classes and sections
  const fetchClassesAndSections = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch('/api/teacher-diary/classes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data.data.classes || []);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchEntries();
    fetchClassesAndSections();
  }, [currentPage, filters]);

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Filter entries based on search query
  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get configuration for entry type
  const getEntryTypeConfig = (type: string) => {
    return entryTypes.find(t => t.value === type) || entryTypes[0];
  };

  // Get configuration for priority
  const getPriorityConfig = (priority: string) => {
    return priorityLevels.find(p => p.value === priority) || priorityLevels[1];
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  // DiaryEntryCard component
  const DiaryEntryCard: React.FC<{ entry: DiaryEntry }> = ({ entry }) => {
    const entryTypeConfig = getEntryTypeConfig(entry.entryType);
    const priorityConfig = getPriorityConfig(entry.priority);

    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{entry.title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(entry.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{entry.className} - {entry.section}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{entry.subject}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${entryTypeConfig.color}`}>
                {entryTypeConfig.label}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                {priorityConfig.label} Priority
              </span>
              {entry.isPublic ? (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Public
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Private
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-gray-700 mb-4">
          <p className="line-clamp-3">{entry.content}</p>
        </div>

        {/* Show attachment/image indicators */}
        {((entry.attachments && Array.isArray(entry.attachments) && entry.attachments.length > 0) || (entry.imageUrls && Array.isArray(entry.imageUrls) && entry.imageUrls.length > 0)) && (
          <div className="flex items-center space-x-4 mb-4 pt-3 border-t border-gray-100">
            {entry.imageUrls && Array.isArray(entry.imageUrls) && entry.imageUrls.length > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <Image className="h-3 w-3 mr-1" />
                {entry.imageUrls.length} image{entry.imageUrls.length !== 1 ? 's' : ''}
              </div>
            )}
            {entry.attachments && Array.isArray(entry.attachments) && entry.attachments.length > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <File className="h-3 w-3 mr-1" />
                {entry.attachments.length} document{entry.attachments.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <span className="font-medium">{entry.teacher.fullName}</span>
            <span className="mx-2">•</span>
            <span>{entry.teacher.designation}</span>
          </div>
          <button
            onClick={() => {
              setSelectedEntry(entry);
              setShowDetailModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
        </div>
      </div>
    );
  };

  // Detail Modal component
  const DetailModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    entry: DiaryEntry | null 
  }> = ({ isOpen, onClose, entry }) => {
    if (!isOpen || !entry) return null;

    const entryTypeConfig = getEntryTypeConfig(entry.entryType);
    const priorityConfig = getPriorityConfig(entry.priority);

    const handleDownload = async (url: string, filename: string) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">{entry.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Date:</span>
                  <span>{formatDate(entry.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Class:</span>
                  <span>{entry.className} - {entry.section}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Subject:</span>
                  <span>{entry.subject}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Teacher:</span>
                  <span>{entry.teacher.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Designation:</span>
                  <span>{entry.teacher.designation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span>{entry.teacher.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${entryTypeConfig.color}`}>
                {entryTypeConfig.label}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityConfig.color}`}>
                {priorityConfig.label} Priority
              </span>
              {entry.isPublic ? (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Public
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  Private
                </span>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Content</h3>
              <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
                {entry.content}
              </div>
            </div>

            {entry.homework && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Homework</h3>
                <div className="bg-yellow-50 rounded-lg p-4 whitespace-pre-wrap">
                  {entry.homework}
                </div>
              </div>
            )}

            {entry.classSummary && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Class Summary</h3>
                <div className="bg-blue-50 rounded-lg p-4 whitespace-pre-wrap">
                  {entry.classSummary}
                </div>
              </div>
            )}

            {entry.notices && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Notices</h3>
                <div className="bg-red-50 rounded-lg p-4 whitespace-pre-wrap">
                  {entry.notices}
                </div>
              </div>
            )}

            {entry.remarks && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Remarks</h3>
                <div className="bg-green-50 rounded-lg p-4 whitespace-pre-wrap">
                  {entry.remarks}
                </div>
              </div>
            )}

            {/* Images section */}
            {entry.imageUrls && Array.isArray(entry.imageUrls) && entry.imageUrls.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {entry.imageUrls.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Diary image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <button
                          onClick={() => handleDownload(imageUrl, `image-${index + 1}.jpg`)}
                          className="opacity-0 group-hover:opacity-100 bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                          title="Download image"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents section */}
            {entry.attachments && Array.isArray(entry.attachments) && entry.attachments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Documents</h3>
                <div className="space-y-2">
                  {entry.attachments.map((attachment, index) => {
                    const fileName = attachment.split('/').pop() || `document-${index + 1}`;
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <File className="h-5 w-5 text-gray-500 mr-3" />
                          <span className="text-sm text-gray-700">{fileName}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(attachment, '_blank')}
                            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleDownload(attachment, fileName)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Teacher information */}
            <div className="border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-600">
                <p><strong>Created by:</strong> {entry.teacher.fullName}</p>
                <p><strong>Designation:</strong> {entry.teacher.designation}</p>
                {entry.createdAt && (
                  <p><strong>Created:</strong> {new Date(entry.createdAt).toLocaleString()}</p>
                )}
                {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
                  <p><strong>Last updated:</strong> {new Date(entry.updatedAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Diary Entries</h1>
          <p className="text-gray-600">View and monitor all teacher diary entries from your school</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search entries, teachers, subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={filters.className}
                    onChange={(e) => setFilters({...filters, className: e.target.value, section: ''})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Classes</option>
                    {classes.map(cls => (
                      <option key={cls.className} value={cls.className}>{cls.className}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <select
                    value={filters.section}
                    onChange={(e) => setFilters({...filters, section: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!filters.className}
                  >
                    <option value="">All Sections</option>
                    {filters.className && 
                      classes.find(cls => cls.className === filters.className)?.sections.map(section => (
                        <option key={section} value={section}>{section}</option>
                      ))
                    }
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entry Type</label>
                  <select
                    value={filters.entryType}
                    onChange={(e) => setFilters({...filters, entryType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {entryTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Priorities</option>
                    {priorityLevels.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Enter subject"
                    value={filters.subject}
                    onChange={(e) => setFilters({...filters, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({
                      startDate: '',
                      endDate: '',
                      className: '',
                      section: '',
                      subject: '',
                      entryType: '',
                      priority: '',
                      teacherId: ''
                    })}
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading diary entries...</span>
          </div>
        )}

        {/* Entries Grid */}
        {!loading && !error && (
          <>
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No diary entries found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {filteredEntries.map((entry) => (
                    <DiaryEntryCard key={entry.id} entry={entry} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4">
                    <div className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.totalEntries)} of {pagination.totalEntries} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.hasPrev}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-md">
                        {currentPage} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.hasNext}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Detail Modal */}
        <DetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEntry(null);
          }}
          entry={selectedEntry}
        />
      </div>
    </div>
  );
};

export default SchoolDiaryView; 