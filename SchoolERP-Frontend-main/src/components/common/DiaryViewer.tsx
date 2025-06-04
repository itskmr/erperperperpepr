import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  BookOpen, 
  Eye, 
  X,
  AlertCircle,
  Users,
  User,
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
  teacherId: string;
}

interface DiaryViewerProps {
  userRole: 'student' | 'parent' | 'school';
  className?: string;
  section?: string;
}

const DiaryViewer: React.FC<DiaryViewerProps> = ({ userRole, className, section }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const currentPage = 1; // Simple pagination - can be enhanced later
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    className: className || '',
    section: section || '',
    subject: '',
    entryType: '',
    teacherId: ''
  });
  const [entriesPerPage] = useState(10);

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

  // Get user class and section info for student/parent roles
  const getUserClassInfo = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        
        if (userRole === 'student') {
          return {
            className: parsedUserData.currentClass || '',
            section: parsedUserData.currentSection || ''
          };
        } else if (userRole === 'parent') {
          return {
            className: parsedUserData.currentClass || '',
            section: parsedUserData.currentSection || ''
          };
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    
    return { className: '', section: '' };
  };

  // Initialize filters with user's class info for student/parent roles
  useEffect(() => {
    if ((userRole === 'student' || userRole === 'parent') && (!className || !section)) {
      const userClassInfo = getUserClassInfo();
      setFilters(prev => ({
        ...prev,
        className: userClassInfo.className,
        section: userClassInfo.section
      }));
    }
  }, [userRole, className, section]);

  // Fetch diary entries
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Get the current filters to use
      const currentFilters = { ...filters };
      
      // For student/parent roles, ensure we have class and section
      if (userRole === 'student' || userRole === 'parent') {
        const userClassInfo = getUserClassInfo();
        if (!currentFilters.className && userClassInfo.className) {
          currentFilters.className = userClassInfo.className;
        }
        if (!currentFilters.section && userClassInfo.section) {
          currentFilters.section = userClassInfo.section;
        }
        
        // If we still don't have required class/section info, show error
        if (!currentFilters.className || !currentFilters.section) {
          setError('Unable to load diary entries. Class and section information is required.');
          setLoading(false);
          return;
        }
      }
      
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: entriesPerPage.toString(),
        ...(currentFilters.startDate && { startDate: currentFilters.startDate }),
        ...(currentFilters.endDate && { endDate: currentFilters.endDate }),
        ...(currentFilters.className && { className: currentFilters.className }),
        ...(currentFilters.section && { section: currentFilters.section }),
        ...(currentFilters.subject && { subject: currentFilters.subject }),
        ...(currentFilters.entryType && { entryType: currentFilters.entryType }),
        ...(currentFilters.teacherId && { teacherId: currentFilters.teacherId })
      });

      console.log('Fetching diary entries with params:', {
        userRole,
        className: currentFilters.className,
        section: currentFilters.section,
        queryString: queryParams.toString()
      });

      const response = await fetch(`/api/teacher-diary/view?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch diary entries');
      }

      const data = await response.json();
      setEntries(data.data.entries);
      setError('');
    } catch (err) {
      setError('Failed to load diary entries');
      console.error('Error fetching entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEntryTypeConfig = (type: string) => {
    return entryTypes.find(t => t.value === type) || entryTypes[0];
  };

  const getPriorityConfig = (priority: string) => {
    return priorityLevels.find(p => p.value === priority) || priorityLevels[1];
  };

  const openDetailModal = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  // Filter entries based on search query
  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchEntries();
  }, [currentPage, filters]);

  const DiaryEntryCard: React.FC<{ entry: DiaryEntry }> = ({ entry }) => {
    const typeConfig = getEntryTypeConfig(entry.entryType);
    const priorityConfig = getPriorityConfig(entry.priority);

    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{entry.title}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}>
                  {typeConfig.label}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                  {priorityConfig.label} Priority
                </span>
              </div>
            </div>
            <button
              onClick={() => openDetailModal(entry)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(entry.date).toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              Class {entry.className} - Section {entry.section}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <BookOpen className="h-4 w-4 mr-2" />
              {entry.subject}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              {entry.teacher.fullName}
            </div>
          </div>

          <p className="text-gray-700 text-sm line-clamp-3">{entry.content}</p>
          
          {/* Show attachment/image indicators */}
          {((entry.attachments && Array.isArray(entry.attachments) && entry.attachments.length > 0) || (entry.imageUrls && Array.isArray(entry.imageUrls) && entry.imageUrls.length > 0)) && (
            <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-100">
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
        </div>
      </div>
    );
  };

  const Modal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    children: React.ReactNode 
  }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  };

  const EntryDetailView: React.FC<{ entry: DiaryEntry }> = ({ entry }) => {
    const typeConfig = getEntryTypeConfig(entry.entryType);
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
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{entry.title}</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}>
              {typeConfig.label}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}>
              {priorityConfig.label} Priority
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Date:</span>
            <p className="text-gray-600">{new Date(entry.date).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Teacher:</span>
            <p className="text-gray-600">{entry.teacher.fullName}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Class:</span>
            <p className="text-gray-600">Class {entry.className} - Section {entry.section}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Subject:</span>
            <p className="text-gray-600">{entry.subject}</p>
          </div>
        </div>

        <div>
          <span className="font-medium text-gray-700">Content:</span>
          <div className="mt-2 p-4 bg-gray-50 rounded-md">
            <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
          </div>
        </div>

        {entry.homework && (
          <div>
            <span className="font-medium text-gray-700">Homework:</span>
            <div className="mt-2 p-4 bg-yellow-50 rounded-md">
              <p className="text-gray-700 whitespace-pre-wrap">{entry.homework}</p>
            </div>
          </div>
        )}

        {entry.classSummary && (
          <div>
            <span className="font-medium text-gray-700">Class Summary:</span>
            <div className="mt-2 p-4 bg-blue-50 rounded-md">
              <p className="text-gray-700 whitespace-pre-wrap">{entry.classSummary}</p>
            </div>
          </div>
        )}

        {entry.notices && (
          <div>
            <span className="font-medium text-gray-700">Notices:</span>
            <div className="mt-2 p-4 bg-red-50 rounded-md">
              <p className="text-gray-700 whitespace-pre-wrap">{entry.notices}</p>
            </div>
          </div>
        )}

        {entry.remarks && (
          <div>
            <span className="font-medium text-gray-700">Remarks:</span>
            <div className="mt-2 p-4 bg-green-50 rounded-md">
              <p className="text-gray-700 whitespace-pre-wrap">{entry.remarks}</p>
            </div>
          </div>
        )}

        {/* Images section */}
        {entry.imageUrls && Array.isArray(entry.imageUrls) && entry.imageUrls.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Images</h4>
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
            <h4 className="text-lg font-medium text-gray-900 mb-4">Documents</h4>
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
    );
  };

  const getPageTitle = () => {
    switch (userRole) {
      case 'student':
        return 'Class Diary';
      case 'parent':
        return 'Child\'s Class Diary';
      case 'school':
        return 'Teacher Diary Entries';
      default:
        return 'Diary Entries';
    }
  };

  const getPageDescription = () => {
    switch (userRole) {
      case 'student':
        return 'View your class diary entries and announcements from teachers';
      case 'parent':
        return 'Stay updated with your child\'s class activities and homework';
      case 'school':
        return 'Monitor teacher diary entries across all classes';
      default:
        return 'View diary entries';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{getPageTitle()}</h1>
              <p className="text-gray-600">{getPageDescription()}</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 space-y-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <select
                value={filters.entryType}
                onChange={(e) => setFilters({ ...filters, entryType: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {entryTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Subject"
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {userRole === 'school' && (
                <>
                  <input
                    type="text"
                    placeholder="Class"
                    value={filters.className}
                    onChange={(e) => setFilters({ ...filters, className: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Section"
                    value={filters.section}
                    onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading diary entries...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No diary entries found</h3>
            <p className="text-gray-600">
              {searchQuery || Object.values(filters).some(f => f) 
                ? "Try adjusting your search or filters" 
                : "No diary entries available at the moment"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEntries.map(entry => (
              <DiaryEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEntry(null);
          }}
          title="Diary Entry Details"
        >
          {selectedEntry && <EntryDetailView entry={selectedEntry} />}
        </Modal>
      </div>
    </div>
  );
};

export default DiaryViewer; 