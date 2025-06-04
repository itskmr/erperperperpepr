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
  Users,
  Upload,
  File,
  Image,
  Eye,
  Download
} from 'lucide-react';

interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  date: string;
  className: string;
  section: string;
  subject: string;
  entryType: 'GENERAL' | 'HOMEWORK' | 'ANNOUNCEMENT' | 'ASSESSMENT' | 'EVENT' | 'NOTICE' | 'REMINDER' | 'ASSIGNMENT' | 'TEACHING_MATERIAL';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
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
}

type EntryType = 'GENERAL' | 'HOMEWORK' | 'ANNOUNCEMENT' | 'ASSESSMENT' | 'EVENT' | 'NOTICE' | 'REMINDER' | 'ASSIGNMENT' | 'TEACHING_MATERIAL';
type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

// Add new interface for view modal
interface ViewModalProps {
  entry: DiaryEntry;
  isOpen: boolean;
  onClose: () => void;
}

// Add new interface for delete confirmation
interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entryTitle: string;
}

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
    isPublic: true,
    attachments: [] as string[],
    imageUrls: [] as string[],
    homework: '',
    classSummary: '',
    notices: '',
    remarks: ''
  });

  // Additional states for file uploads - removed unused variables
  // const [uploadingFiles, setUploadingFiles] = useState(false);
  // const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // const [selectedImages, setSelectedImages] = useState<File[]>([]);

  // Add missing state variables for view and delete functionality
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<DiaryEntry | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);
  const [deletingEntryTitle, setDeletingEntryTitle] = useState<string>('');

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
    { value: 'REMINDER', label: 'Reminder', color: 'bg-purple-100 text-purple-800' },
    { value: 'ASSIGNMENT', label: 'Assignment', color: 'bg-orange-100 text-orange-800' },
    { value: 'TEACHING_MATERIAL', label: 'Teaching Material', color: 'bg-indigo-100 text-indigo-800' }
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
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          date: data.date,
          className: data.className,
          section: data.section,
          subject: data.subject,
          entryType: data.entryType,
          priority: data.priority,
          isPublic: data.isPublic,
          attachments: data.attachments,
          imageUrls: data.imageUrls,
          homework: data.homework || null,
          classSummary: data.classSummary || null,
          notices: data.notices || null,
          remarks: data.remarks || null
        })
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
        throw new Error(errorData.message || 'Failed to create diary entry');
      }

      const result = await response.json();
      if (result.success) {
        setShowCreateModal(false);
        setFormData({
          title: '',
          content: '',
          date: new Date().toISOString().split('T')[0],
          className: '',
          section: '',
          subject: '',
          entryType: 'GENERAL' as EntryType,
          priority: 'NORMAL' as Priority,
          isPublic: true,
          attachments: [],
          imageUrls: [],
          homework: '',
          classSummary: '',
          notices: '',
          remarks: ''
        });
        fetchEntries(); // Refresh the list
      }
    } catch (error) {
      console.error('Error creating diary entry:', error);
      setError('Failed to create diary entry. Please try again.');
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
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          date: data.date,
          className: data.className,
          section: data.section,
          subject: data.subject,
          entryType: data.entryType,
          priority: data.priority,
          isPublic: data.isPublic,
          attachments: data.attachments,
          imageUrls: data.imageUrls,
          homework: data.homework || null,
          classSummary: data.classSummary || null,
          notices: data.notices || null,
          remarks: data.remarks || null
        })
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
        throw new Error(errorData.message || 'Failed to update diary entry');
      }

      const result = await response.json();
      if (result.success) {
        setShowEditModal(false);
        setEditingEntry(null);
        setFormData({
          title: '',
          content: '',
          date: new Date().toISOString().split('T')[0],
          className: '',
          section: '',
          subject: '',
          entryType: 'GENERAL' as EntryType,
          priority: 'NORMAL' as Priority,
          isPublic: true,
          attachments: [],
          imageUrls: [],
          homework: '',
          classSummary: '',
          notices: '',
          remarks: ''
        });
        fetchEntries(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating diary entry:', error);
      setError('Failed to update diary entry. Please try again.');
    }
  };

  // Delete diary entry
  const deleteEntry = async (id: number) => {
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
      isPublic: true,
      attachments: [],
      imageUrls: [],
      homework: '',
      classSummary: '',
      notices: '',
      remarks: ''
    });
  }, []);

  // Function to open edit modal with proper data setup
  const openEditModal = (entry: DiaryEntry) => {
    // Ensure arrays are properly handled
    const processedAttachments = Array.isArray(entry.attachments) ? entry.attachments : [];
    const processedImageUrls = Array.isArray(entry.imageUrls) ? entry.imageUrls : [];
    
    const editData = {
      title: entry.title || '',
      content: entry.content || '',
      date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      className: entry.className || '',
      section: entry.section || '',
      subject: entry.subject || '',
      entryType: entry.entryType as EntryType,
      priority: entry.priority as Priority,
      isPublic: entry.isPublic ?? true,
      attachments: processedAttachments,
      imageUrls: processedImageUrls,
      homework: entry.homework || '',
      classSummary: entry.classSummary || '',
      notices: entry.notices || '',
      remarks: entry.remarks || ''
    };
    
    setFormData(editData);
    setEditingEntry(entry);
    setShowEditModal(true);
  };

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
    const [localUploadingFiles, setLocalUploadingFiles] = useState(false);
    
    // Sync with initial data only when it changes (for edit mode)
    useEffect(() => {
      setLocalData(initialData);
    }, [initialData.title, initialData.content, initialData.date]); // Only key fields to prevent unnecessary updates

    // Handle file upload
    const handleFileUpload = async (files: File[], type: 'images' | 'attachments') => {
      if (files.length === 0) return;

      setLocalUploadingFiles(true);
      try {
        const formData = new FormData();
        files.forEach(file => {
          formData.append(type, file);
        });

        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        const response = await fetch('/api/teacher-diary/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();
        
        if (result.success) {
          const uploadedFiles = result.data[type] || [];
          // Use the full path URLs returned by the backend
          const filePaths = uploadedFiles.map((file: { path: string }) => file.path);
          
          setLocalData(prev => ({
            ...prev,
            [type === 'images' ? 'imageUrls' : 'attachments']: [
              ...prev[type === 'images' ? 'imageUrls' : 'attachments'],
              ...filePaths
            ]
          }));
        }
      } catch (error) {
        console.error('File upload error:', error);
        alert('Failed to upload files. Please try again.');
      } finally {
        setLocalUploadingFiles(false);
      }
    };

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Additional Content Sections */}
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700">Additional Content Sections</h4>
          
          {/* Homework Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Homework Assignment
            </label>
            <textarea
              value={localData.homework || ''}
              onChange={(e) => setLocalData(prev => ({ ...prev, homework: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter homework details (optional)..."
            />
          </div>

          {/* Class Summary Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Summary
            </label>
            <textarea
              value={localData.classSummary || ''}
              onChange={(e) => setLocalData(prev => ({ ...prev, classSummary: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Summarize what was covered in class (optional)..."
            />
          </div>

          {/* Notices Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Important Notices
            </label>
            <textarea
              value={localData.notices || ''}
              onChange={(e) => setLocalData(prev => ({ ...prev, notices: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any important notices for students/parents (optional)..."
            />
          </div>

          {/* Remarks Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Remarks
            </label>
            <textarea
              value={localData.remarks || ''}
              onChange={(e) => setLocalData(prev => ({ ...prev, remarks: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional remarks or observations (optional)..."
            />
          </div>
        </div>

        {/* Enhanced File Upload Section */}
        <div className="space-y-4 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            File Attachments
          </h4>
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="h-4 w-4 inline mr-1" />
              Upload Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                handleFileUpload(files, 'images');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={localUploadingFiles}
            />
            {(Array.isArray(localData.imageUrls) ? localData.imageUrls.length : 0) > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Uploaded images:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(Array.isArray(localData.imageUrls) ? localData.imageUrls : []).map((image, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Image className="h-3 w-3 mr-1" />
                      {image.split('/').pop()}
                      <button
                        type="button"
                        onClick={() => setLocalData(prev => ({ 
                          ...prev, 
                          imageUrls: Array.isArray(prev.imageUrls) ? prev.imageUrls.filter((_, i) => i !== index) : []
                        }))}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <File className="h-4 w-4 inline mr-1" />
              Upload Documents
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                handleFileUpload(files, 'attachments');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={localUploadingFiles}
            />
            {(Array.isArray(localData.attachments) ? localData.attachments.length : 0) > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Uploaded documents:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(Array.isArray(localData.attachments) ? localData.attachments : []).map((file, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <File className="h-3 w-3 mr-1" />
                      {file.split('/').pop()}
                      <button
                        type="button"
                        onClick={() => setLocalData(prev => ({ 
                          ...prev, 
                          attachments: Array.isArray(prev.attachments) ? prev.attachments.filter((_, i) => i !== index) : []
                        }))}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {localUploadingFiles && (
            <div className="flex items-center text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Uploading files...
            </div>
          )}
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
            disabled={localUploadingFiles}
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
                onClick={() => openViewModal(entry)}
                className="p-2 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                title="View entry"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => openEditModal(entry)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                title="Edit entry"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => openDeleteConfirmation(entry.id, entry.title)}
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
  });

  // Component for viewing diary entry details
  const ViewModal: React.FC<ViewModalProps> = ({ entry, isOpen, onClose }) => {
    if (!isOpen || !entry) return null;

    const handleDownload = async (url: string, filename: string) => {
      try {
        // Get the token for authentication
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        
        // If the URL is already a full URL, use it directly
        let downloadUrl = url;
        
        // If it's a relative path or needs our API endpoint
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          // Extract filename from path
          const pathSegments = url.split('/');
          const file = pathSegments[pathSegments.length - 1];
          downloadUrl = `/api/teacher-diary/files/${file}?download=true`;
        } else {
          // For full URLs, try to extract filename and use our API endpoint for better security
          const urlObj = new URL(url);
          const pathSegments = urlObj.pathname.split('/');
          const file = pathSegments[pathSegments.length - 1];
          if (file && urlObj.pathname.includes('teacher-diary')) {
            downloadUrl = `/api/teacher-diary/files/${file}?download=true`;
          }
        }

        const response = await fetch(downloadUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Download failed: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const objectUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(objectUrl);
      } catch (error) {
        console.error('Error downloading file:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(`Failed to download file: ${errorMessage}`);
      }
    };

    const typeConfig = getEntryTypeConfig(entry.entryType);
    const priorityConfig = getPriorityConfig(entry.priority);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{entry.title}</h2>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeConfig.color}`}>
                  {typeConfig.label}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityConfig.color}`}>
                  {priorityConfig.label} Priority
                </span>
                {entry.isPublic && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Public
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Basic Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium">Date</span>
                </div>
                <p className="text-gray-900 font-semibold">{new Date(entry.date).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Users className="h-4 w-4 mr-2 text-green-500" />
                  <span className="font-medium">Class & Section</span>
                </div>
                <p className="text-gray-900 font-semibold">Class {entry.className} - Section {entry.section}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <BookOpen className="h-4 w-4 mr-2 text-purple-500" />
                  <span className="font-medium">Subject</span>
                </div>
                <p className="text-gray-900 font-semibold">{entry.subject}</p>
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-6">
              {/* Main Content */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-blue-500 rounded mr-3"></div>
                  Main Content
                </h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                </div>
              </div>

              {/* Homework Section */}
              {entry.homework && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-yellow-500 rounded mr-3"></div>
                    Homework Assignment
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-yellow-700 leading-relaxed whitespace-pre-wrap">{entry.homework}</p>
                  </div>
                </div>
              )}

              {/* Class Summary Section */}
              {entry.classSummary && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-blue-500 rounded mr-3"></div>
                    Class Summary
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-blue-700 leading-relaxed whitespace-pre-wrap">{entry.classSummary}</p>
                  </div>
                </div>
              )}

              {/* Notices Section */}
              {entry.notices && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-red-500 rounded mr-3"></div>
                    Important Notices
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-red-700 leading-relaxed whitespace-pre-wrap">{entry.notices}</p>
                  </div>
                </div>
              )}

              {/* Remarks Section */}
              {entry.remarks && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-green-500 rounded mr-3"></div>
                    Additional Remarks
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-green-700 leading-relaxed whitespace-pre-wrap">{entry.remarks}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Attachments Section */}
            {((entry.imageUrls && Array.isArray(entry.imageUrls) && entry.imageUrls.length > 0) || 
              (entry.attachments && Array.isArray(entry.attachments) && entry.attachments.length > 0)) && (
              <div className="space-y-6">
                {/* Images section */}
                {entry.imageUrls && Array.isArray(entry.imageUrls) && entry.imageUrls.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Image className="h-5 w-5 mr-2 text-indigo-500" />
                      Images ({entry.imageUrls.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {entry.imageUrls?.map((imageUrl, index) => {
                        // Handle both relative and absolute URLs
                        const displayUrl = imageUrl.startsWith('http://') || imageUrl.startsWith('https://') 
                          ? imageUrl 
                          : imageUrl.startsWith('/') 
                            ? imageUrl 
                            : `/${imageUrl}`;
                        
                        return (
                          <div key={index} className="relative group bg-white rounded-lg overflow-hidden shadow-sm">
                            <img
                              src={displayUrl}
                              alt={`Diary image ${index + 1}`}
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                // Fallback for broken images
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280" font-family="sans-serif" font-size="12">Image not found</text></svg>';
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                              <button
                                onClick={() => handleDownload(imageUrl, `image-${index + 1}.jpg`)}
                                className="opacity-0 group-hover:opacity-100 bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-200 transform scale-90 group-hover:scale-100"
                                title="Download image"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      }) || []}
                    </div>
                  </div>
                )}

                {/* Documents section */}
                {entry.attachments && Array.isArray(entry.attachments) && entry.attachments.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <File className="h-5 w-5 mr-2 text-orange-500" />
                      Documents ({entry.attachments.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {entry.attachments.map((attachment, index) => {
                        const fileName = attachment.split('/').pop() || `document-${index + 1}`;
                        const fileExtension = fileName.split('.').pop()?.toLowerCase();
                        const getFileIcon = () => {
                          switch (fileExtension) {
                            case 'pdf': return '📄';
                            case 'doc':
                            case 'docx': return '📝';
                            case 'xls':
                            case 'xlsx': return '📊';
                            case 'ppt':
                            case 'pptx': return '📽️';
                            case 'txt': return '📋';
                            default: return '📁';
                          }
                        };

                        // Handle view URL construction
                        const getViewUrl = () => {
                          if (attachment.startsWith('http://') || attachment.startsWith('https://')) {
                            const urlObj = new URL(attachment);
                            const pathSegments = urlObj.pathname.split('/');
                            const file = pathSegments[pathSegments.length - 1];
                            if (file && urlObj.pathname.includes('teacher-diary')) {
                              return `/api/teacher-diary/files/${file}`;
                            }
                            return attachment;
                          } else {
                            const pathSegments = attachment.split('/');
                            const file = pathSegments[pathSegments.length - 1];
                            return `/api/teacher-diary/files/${file}`;
                          }
                        };

                        const handleView = async () => {
                          try {
                            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
                            const viewUrl = getViewUrl();
                            
                            const response = await fetch(viewUrl, {
                              headers: {
                                'Authorization': `Bearer ${token}`,
                              },
                            });

                            if (!response.ok) {
                              throw new Error(`Failed to load file: ${response.status}`);
                            }

                            const blob = await response.blob();
                            const objectUrl = window.URL.createObjectURL(blob);
                            window.open(objectUrl, '_blank');
                            
                            // Clean up after a delay
                            setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
                          } catch (error) {
                            console.error('Error viewing file:', error);
                            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                            alert(`Failed to view file: ${errorMessage}`);
                          }
                        };
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                            <div className="flex items-center flex-1 min-w-0">
                              <span className="text-2xl mr-3">{getFileIcon()}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-700 truncate">{fileName}</p>
                                <p className="text-xs text-gray-500 uppercase">{fileExtension} File</p>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={handleView}
                                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
                                title="View document"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </button>
                              <button
                                onClick={() => handleDownload(attachment, fileName)}
                                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
                                title="Download document"
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
              </div>
            )}

            {/* Teacher information */}
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Entry Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p><span className="font-medium">Created by:</span> {entry.teacher.fullName}</p>
                    <p><span className="font-medium">Designation:</span> {entry.teacher.designation}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Created:</span> {new Date(entry.createdAt).toLocaleString()}</p>
                    {entry.updatedAt !== entry.createdAt && (
                      <p><span className="font-medium">Last updated:</span> {new Date(entry.updatedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Component for delete confirmation
  const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ isOpen, onClose, onConfirm, entryTitle }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Diary Entry</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the diary entry "{entryTitle}"? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // View and delete functionality
  const openViewModal = (entry: DiaryEntry) => {
    setViewingEntry(entry);
    setShowViewModal(true);
  };

  const openDeleteConfirmation = (entryId: number, title: string) => {
    setDeletingEntryId(entryId);
    setDeletingEntryTitle(title);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingEntryId) {
      await deleteEntry(deletingEntryId);
      setShowDeleteConfirmation(false);
      setDeletingEntryId(null);
      setDeletingEntryTitle('');
    }
  };

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

        {/* View Modal */}
        {viewingEntry && (
          <ViewModal
            entry={viewingEntry}
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setViewingEntry(null);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmation
          isOpen={showDeleteConfirmation}
          onClose={() => {
            setShowDeleteConfirmation(false);
            setDeletingEntryId(null);
            setDeletingEntryTitle('');
          }}
          onConfirm={handleDeleteConfirm}
          entryTitle={deletingEntryTitle}
        />

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