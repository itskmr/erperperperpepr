import React, { useState, useEffect } from 'react';
import {  
  User, Mail, Phone, MapPin, Calendar, GraduationCap, Book,
  Edit3, Save, X, Building, Badge,
  CheckCircle, AlertCircle, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface TeacherProfile {
  id: number;
  fullName: string;
    email: string;
    phone: string;
    designation: string;
  qualification: string;
    subjects: string[];
    address: string;
  joiningDate: string;
    profileImage?: string;
  employeeCode: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  gender: string;
  experience?: number;
  maritalStatus?: string;
  schoolId: number;
  schoolName: string;
  status: string;
    isClassIncharge: boolean;
    inchargeClass?: string;
    inchargeSection?: string;
}

interface EditableFields {
  phone: string;
  address: string;
  qualification: string;
  profileImage?: string;
  bloodGroup?: string;
  maritalStatus?: string;
}

const TeacherProfile: React.FC = () => {
  // State
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditableFields>({
    phone: '',
    address: '',
    qualification: '',
    profileImage: '',
    bloodGroup: '',
    maritalStatus: ''
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'school'>('personal');

  // Get teacher info from authentication
  const getTeacherAuth = () => {
    try {
      const userData = localStorage.getItem('userData');
      const token = localStorage.getItem('token');
      
      if (userData) {
        const user = JSON.parse(userData);
        return { teacherId: user.id, schoolId: user.schoolId || user.school_id };
      }
      
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { teacherId: payload.id, schoolId: payload.schoolId || payload.school_id };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing auth info:', error);
      return null;
    }
  };

  // API helper function
  const apiCall = async (endpoint: string, options?: RequestInit) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to access this resource.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    }

    return await response.json();
  };

  // Fetch teacher profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const auth = getTeacherAuth();
      if (!auth) {
        setError('Authentication information not found. Please log in again.');
        return;
      }

      // Fetch teacher profile - backend should automatically scope by authenticated user
      const response = await apiCall(`/api/teachers/${auth.teacherId}`);
      
      if (response.success !== false && response) {
        // Handle different response formats
        const teacherData = response.data || response;
        
        // Parse subjects if it's a JSON string
        let subjects = [];
        if (teacherData.subjects) {
          try {
            subjects = typeof teacherData.subjects === 'string' 
              ? JSON.parse(teacherData.subjects) 
              : teacherData.subjects;
          } catch {
            subjects = Array.isArray(teacherData.subjects) ? teacherData.subjects : [];
          }
        }

        const profileData: TeacherProfile = {
          id: teacherData.id,
          fullName: teacherData.fullName || teacherData.name || '',
          email: teacherData.email || '',
          phone: teacherData.phone || '',
          designation: teacherData.designation || 'Teacher',
          qualification: teacherData.qualification || '',
          subjects: subjects,
          address: teacherData.address || '',
          joiningDate: teacherData.joining_year || teacherData.joiningDate || '',
          profileImage: teacherData.profileImage || '',
          employeeCode: teacherData.employeeCode || teacherData.username || `T${teacherData.id}`,
          bloodGroup: teacherData.bloodGroup || '',
          dateOfBirth: teacherData.dateOfBirth || '',
          gender: teacherData.gender || '',
          experience: teacherData.experience || 0,
          maritalStatus: teacherData.maritalStatus || '',
          schoolId: teacherData.schoolId || auth.schoolId,
          schoolName: teacherData.schoolName || teacherData.school?.schoolName || 'School',
          status: teacherData.status || 'active',
          isClassIncharge: teacherData.isClassIncharge || false,
          inchargeClass: teacherData.inchargeClass || '',
          inchargeSection: teacherData.inchargeSection || ''
        };

        setProfile(profileData);
        
        // Initialize edit data
        setEditData({
          phone: profileData.phone,
          address: profileData.address,
          qualification: profileData.qualification,
          profileImage: profileData.profileImage,
          bloodGroup: profileData.bloodGroup || '',
          maritalStatus: profileData.maritalStatus || ''
        });
      } else {
        setError('Failed to load profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Save profile changes
  const saveProfile = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      setSaveMessage(null);

      const auth = getTeacherAuth();
      if (!auth) {
        throw new Error('Authentication information not found');
      }

      // Prepare update data
      const updateData = {
        phone: editData.phone.trim(),
        address: editData.address.trim(),
        qualification: editData.qualification.trim(),
        bloodGroup: editData.bloodGroup?.trim() || null,
        maritalStatus: editData.maritalStatus?.trim() || null,
        profileImage: editData.profileImage?.trim() || null
      };

      // Validate required fields
      if (!updateData.phone) {
        throw new Error('Phone number is required');
      }
      if (!updateData.address) {
        throw new Error('Address is required');
      }

      const response = await apiCall(`/api/teachers/${auth.teacherId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (response.success !== false) {
        // Update local profile state
        setProfile(prev => prev ? {
          ...prev,
          phone: updateData.phone,
          address: updateData.address,
          qualification: updateData.qualification,
          profileImage: updateData.profileImage || prev.profileImage,
          bloodGroup: updateData.bloodGroup || prev.bloodGroup,
          maritalStatus: updateData.maritalStatus || prev.maritalStatus
        } : null);

        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);

        // Clear success message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save changes' 
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle edit form changes
  const handleEditChange = (field: keyof EditableFields, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Cancel editing
  const cancelEdit = () => {
    if (profile) {
      setEditData({
        phone: profile.phone,
        address: profile.address,
        qualification: profile.qualification,
        profileImage: profile.profileImage,
        bloodGroup: profile.bloodGroup || '',
        maritalStatus: profile.maritalStatus || ''
      });
    }
    setIsEditing(false);
    setSaveMessage(null);
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Calculate experience
  const calculateExperience = (joiningDate: string) => {
    if (!joiningDate) return 'Not specified';
    try {
      const joining = new Date(joiningDate);
      const now = new Date();
      const years = now.getFullYear() - joining.getFullYear();
      return `${years} year${years !== 1 ? 's' : ''}`;
    } catch {
      return 'Not specified';
    }
  };

  // Initialize component
  useEffect(() => {
    fetchProfile();
  }, []);

  // Loading state
  if (loading) {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
          </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <motion.div 
            className="bg-white rounded-xl shadow-md p-6 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Profile</h2>
            <p className="text-gray-600 mb-4">{error}</p>
      <button
              onClick={fetchProfile}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
            >
              Try Again
      </button>
          </motion.div>
      </div>
    </div>
  );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="bg-white rounded-lg shadow-md mb-6 overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
              >
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Profile Image */}
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-white shadow-lg">
                  {profile.profileImage ? (
                      <img
                      src={profile.profileImage} 
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                      />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <User className="h-12 w-12 md:h-16 md:w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-2">
                  <GraduationCap className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Basic Info */}
              <div className="flex-1 text-white">
                <h1 className="text-2xl md:text-3xl font-bold">{profile.fullName}</h1>
                <p className="text-emerald-100 text-lg mt-1">{profile.designation}</p>
                <p className="text-emerald-200 mt-1">{profile.schoolName}</p>
                <div className="flex items-center mt-2">
                  <Badge className="h-4 w-4 mr-2" />
                  <span className="text-emerald-200">ID: {profile.employeeCode}</span>
                          </div>
                      </div>

              {/* Edit Button */}
              <div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-200 flex items-center space-x-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                          </div>
                )}
                      </div>
                    </div>
                  </div>

          {/* Status Message */}
          <AnimatePresence>
            {saveMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`px-6 py-3 ${
                  saveMessage.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
                }`}
              >
                <div className="flex items-center">
                  {saveMessage.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <span className={`text-sm font-medium ${
                    saveMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {saveMessage.text}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'personal', label: 'Personal Info', icon: User },
                { id: 'professional', label: 'Professional Info', icon: GraduationCap },
                { id: 'school', label: 'School Info', icon: Building }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
                </div>
              </div>

        {/* Tab Content */}
        <motion.div 
          className="bg-white rounded-lg shadow-md"
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6">
            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Phone className="h-5 w-5 text-emerald-600 mr-2" />
                    Contact Information
                </h3>
                <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{profile.email}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editData.phone}
                          onChange={(e) => handleEditChange('phone', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">{profile.phone || 'Not specified'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      {isEditing ? (
                        <textarea
                          value={editData.address}
                          onChange={(e) => handleEditChange('address', e.target.value)}
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Enter address"
                        />
                      ) : (
                        <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                          <span className="text-gray-900">{profile.address || 'Not specified'}</span>
                        </div>
                      )}
                      </div>
                    </div>
                  </div>

                {/* Personal Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 text-emerald-600 mr-2" />
                    Personal Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{formatDate(profile.dateOfBirth)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{profile.gender || 'Not specified'}</span>
                    </div>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                      {isEditing ? (
                        <select
                          value={editData.bloodGroup}
                          onChange={(e) => handleEditChange('bloodGroup', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">Select Blood Group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-900">{profile.bloodGroup || 'Not specified'}</span>
                    </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                      {isEditing ? (
                        <select
                          value={editData.maritalStatus}
                          onChange={(e) => handleEditChange('maritalStatus', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">Select Status</option>
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-900">{profile.maritalStatus || 'Not specified'}</span>
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'professional' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Qualifications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 text-emerald-600 mr-2" />
                    Qualifications & Experience
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.qualification}
                          onChange={(e) => handleEditChange('qualification', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Enter qualification"
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-900">{profile.qualification || 'Not specified'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{formatDate(profile.joiningDate)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Joining date cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Award className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{calculateExperience(profile.joiningDate)}</span>
                      </div>
                    </div>

                      <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className={`h-2 w-2 rounded-full mr-2 ${
                          profile.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className="text-gray-900 capitalize">{profile.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subjects & Responsibilities */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Book className="h-5 w-5 text-emerald-600 mr-2" />
                    Subjects & Responsibilities
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subjects Assigned</label>
                      <div className="flex flex-wrap gap-2">
                        {profile.subjects.length > 0 ? (
                          profile.subjects.map((subject, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800"
                            >
                              <Book className="h-3 w-3 mr-1" />
                              {subject}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No subjects assigned</span>
                        )}
                      </div>
                    </div>

                    {profile.isClassIncharge && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class Incharge</label>
                        <div className="flex items-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <GraduationCap className="h-4 w-4 text-emerald-600 mr-2" />
                          <span className="text-emerald-800 font-medium">
                            Class {profile.inchargeClass} {profile.inchargeSection}
                          </span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Badge className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{profile.designation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'school' && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building className="h-5 w-5 text-emerald-600 mr-2" />
                  School Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{profile.schoolName}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Badge className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{profile.employeeCode}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teacher ID</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">#{profile.id}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">School ID</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900">#{profile.schoolId}</span>
            </div>
          </div>
        </div>
      </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherProfile;
