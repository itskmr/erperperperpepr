import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  BookOpen, 
  Edit, 
  Trash2, 
  X,
  Save,
  AlertCircle,
  Users
} from 'lucide-react';

interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  date: string;
  className: string;
  section: string;
  subject: string;
  entryType: 'GENERAL' | 'HOMEWORK' | 'ANNOUNCEMENT' | 'ASSESSMENT' | 'EVENT' | 'NOTICE' | 'REMINDER';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isPublic: boolean;
  teacher: {
    id: number;
    fullName: string;
    email: string;
    designation: string;
  };
}

interface FilterState {
  startDate: string;
  endDate: string;
  className: string;
  section: string;
  subject: string;
  entryType: string;
  priority: string;
}

type EntryType = 'GENERAL' | 'HOMEWORK' | 'ANNOUNCEMENT' | 'ASSESSMENT' | 'EVENT' | 'NOTICE' | 'REMINDER';
type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

const TeacherDiary: React.FC = () => {
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
    priority: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [currentPage] = useState(1);
  const [entriesPerPage] = useState(10);

  // Form data for creating/editing entries
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    className: '',
    section: '',
    subject: '',
    entryType: 'GENERAL' as EntryType,
    priority: 'NORMAL' as Priority,
    isPublic: true
  });

  // Class and Section options
  const classOptions = [
    'Nursery',
    'LKG',
    'UKG',
    'Class 1',
    'Class 2',
    'Class 3',
    'Class 4',
    'Class 5',
    'Class 6',
    'Class 7',
    'Class 8',
    'Class 9',
    'Class 10',
    'Class 11 (Science)',
    'Class 11 (Commerce)',
    'Class 11 (Arts)',
    'Class 12 (Science)',
    'Class 12 (Commerce)',
    'Class 12 (Arts)'
  ];

  const sectionOptions = ['A', 'B', 'C', 'D', 'E', 'F'];

  const entryTypes = [
    { value: 'GENERAL', label: 'General', color: 'bg-blue-100 text-blue-800' },
    { value: 'HOMEWORK', label: 'Homework', color: 'bg-green-100 text-green-800' },
    { value: 'ANNOUNCEMENT', label: 'Announcement', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'ASSESSMENT', label: 'Assessment', color: 'bg-purple-100 text-purple-800' },
    { value: 'EVENT', label: 'Event', color: 'bg-pink-100 text-pink-800' },
    { value: 'NOTICE', label: 'Notice', color: 'bg-teal-100 text-teal-800' },
    { value: 'REMINDER', label: 'Reminder', color: 'bg-purple-100 text-purple-800' }
  ];

  const priorityLevels = [
    { value: 'LOW', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'NORMAL', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
    { value: 'HIGH', label: 'High', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  // Fetch diary entries
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
        limit: entriesPerPage.toString(),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.className && { className: filters.className }),
        ...(filters.section && { section: filters.section }),
        ...(filters.subject && { subject: filters.subject }),
        ...(filters.entryType && { entryType: filters.entryType }),
        ...(filters.priority && { priority: filters.priority })
      });

      const response = await fetch(`/api/teacher-diary/teacher/entries?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        // Clear invalid tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        setError('Session expired. Please log in again.');
        // Redirect to login after a short delay
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
      setError('');
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load diary entries');
    } finally {
      setLoading(false);
    }
  };

  // Create new diary entry
  const createEntry = async (data: typeof formData) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch('/api/teacher-diary/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
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
        throw new Error(errorData.message || `Failed to create diary entry`);
      }

      await fetchEntries();
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Error creating entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to create diary entry');
    }
  };

  // Update diary entry
  const updateEntry = async (data: typeof formData) => {
    if (!editingEntry) return;

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch(`/api/teacher-diary/update/${editingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
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
        throw new Error(errorData.message || `Failed to update diary entry`);
      }

      await fetchEntries();
      setShowEditModal(false);
      setEditingEntry(null);
      resetForm();
    } catch (err) {
      console.error('Error updating entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to update diary entry');
    }
  };

  // Delete diary entry
  const deleteEntry = async (id: number) => {
    if (!confirm('Are you sure you want to delete this diary entry?')) return;

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch(`/api/teacher-diary/delete/${id}`, {
        method: 'DELETE',
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
        throw new Error(errorData.message || `Failed to delete diary entry`);
      }

      await fetchEntries();
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete diary entry');
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      className: '',
      section: '',
      subject: '',
      entryType: 'GENERAL',
      priority: 'NORMAL',
      isPublic: true
    });
  }, []);

  const openEditModal = useCallback((entry: DiaryEntry) => {
    setEditingEntry(entry);
    const editFormData = {
      title: entry.title,
      content: entry.content,
      date: entry.date.split('T')[0],
      className: entry.className,
      section: entry.section,
      subject: entry.subject,
      entryType: entry.entryType,
      priority: entry.priority,
      isPublic: entry.isPublic
    };
    setFormData(editFormData);
    setShowEditModal(true);
  }, []);

  const getEntryTypeConfig = (type: string) => {
    return entryTypes.find(t => t.value === type) || entryTypes[0];
  };

  const getPriorityConfig = (priority: string) => {
    return priorityLevels.find(p => p.value === priority) || priorityLevels[1];
  };

  // Filter entries based on search query
  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchEntries();
  }, [currentPage, filters]);

  // Standalone Entry Form Component with isolated state
  const EntryForm: React.FC<{ 
    initialData: typeof formData;
    onSubmit: (data: typeof formData) => void; 
    onCancel: () => void;
    isEditing: boolean;
  }> = ({ initialData, onSubmit, onCancel, isEditing }) => {
    // Local state that won't be affected by parent re-renders
    const [localData, setLocalData] = useState(initialData);
    
    // Sync with initial data only when it changes (for edit mode)
    useEffect(() => {
      setLocalData(initialData);
    }, [initialData.title, initialData.content, initialData.date]); // Only key fields to prevent unnecessary updates

    const handleSubmit = () => {
      onSubmit(localData);
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={localData.title}
            onChange={(e) => setLocalData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter diary entry title"
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={localData.date}
              onChange={(e) => setLocalData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entry Type *
            </label>
            <select
              value={localData.entryType}
              onChange={(e) => setLocalData(prev => ({ ...prev, entryType: e.target.value as EntryType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {entryTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class *
            </label>
            <select
              value={localData.className}
              onChange={(e) => setLocalData(prev => ({ ...prev, className: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a class</option>
              {classOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section *
            </label>
            <select
              value={localData.section}
              onChange={(e) => setLocalData(prev => ({ ...prev, section: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a section</option>
              {sectionOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={localData.subject}
              onChange={(e) => setLocalData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Mathematics"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={localData.priority}
            onChange={(e) => setLocalData(prev => ({ ...prev, priority: e.target.value as Priority }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {priorityLevels.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            value={localData.content}
            onChange={(e) => setLocalData(prev => ({ ...prev, content: e.target.value }))}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter detailed content for this diary entry..."
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={localData.isPublic}
            onChange={(e) => setLocalData(prev => ({ ...prev, isPublic: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
            Make this entry visible to students and parents
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Update Entry' : 'Create Entry'}
          </button>
        </div>
      </div>
    );
  };

  // Memoized components to prevent unnecessary re-renders
  const DiaryEntryCard = React.memo<{ entry: DiaryEntry }>(({ entry }) => {
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
                {entry.isPublic && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Public
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => openEditModal(entry)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                title="Edit entry"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteEntry(entry.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                title="Delete entry"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
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
          </div>

          <p className="text-gray-700 text-sm line-clamp-3">{entry.content}</p>
        </div>
      </div>
    );
  });

  const Modal = React.memo<{ 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    children: React.ReactNode 
  }>(({ isOpen, onClose, title, children }) => {
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
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Teacher Diary</h1>
              <p className="text-gray-600">Manage your daily teaching entries and classroom activities</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
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

            <div className="flex space-x-2">
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

              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                {priorityLevels.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
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
            <p className="text-gray-600 mb-4">
              {searchQuery || Object.values(filters).some(f => f) 
                ? "Try adjusting your search or filters" 
                : "Create your first diary entry to get started"}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create First Entry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEntries.map(entry => (
              <DiaryEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}

        {/* Modals */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          title="Create New Diary Entry"
        >
          <EntryForm
            initialData={formData}
            onSubmit={createEntry}
            onCancel={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            isEditing={false}
          />
        </Modal>

        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingEntry(null);
            resetForm();
          }}
          title="Edit Diary Entry"
        >
          <EntryForm
            initialData={formData}
            onSubmit={updateEntry}
            onCancel={() => {
              setShowEditModal(false);
              setEditingEntry(null);
              resetForm();
            }}
            isEditing={true}
          />
        </Modal>
      </div>
    </div>
  );
};

export default TeacherDiary;