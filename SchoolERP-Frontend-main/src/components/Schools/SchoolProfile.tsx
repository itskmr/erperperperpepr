import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2,
  Mail, 
  Phone, 
  Calendar, 
  MapPin,
  Globe,
  Users,
  GraduationCap,
  School,
  Edit2,
  Save,
  X,
  User,
  Shield,
  Camera,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Loader,
  Bus,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  schoolProfileService, 
  SchoolProfileData, 
  UpdateSchoolProfileData,
  formatNumber,
  getRelativeTime
} from '../../services/schoolProfileService';

const SchoolProfile: React.FC = () => {
  const [schoolData, setSchoolData] = useState<SchoolProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateSchoolProfileData>({
    schoolName: '',
    email: '',
    address: '',
    contact: '',
    phone: '',
    principal: '',
    image_url: '',
    established: new Date().getFullYear(),
    affiliate: '',
    affiliateNo: '',
    website: ''
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load school profile data on component mount
  useEffect(() => {
    loadSchoolProfile();
  }, []);

  const loadSchoolProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await schoolProfileService.getSchoolProfile();
      setSchoolData(data);
      
      // Initialize form data
      setFormData({
        schoolName: data.schoolName,
        email: data.email,
        address: data.address || '',
        contact: data.contact || '',
        phone: data.phone || '',
        principal: data.principal || '',
        image_url: data.image_url || '',
        established: data.established,
        affiliate: data.affiliate || '',
        affiliateNo: data.affiliateNo || '',
        website: data.website || ''
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load school profile';
      setError(errorMessage);
      toast.error('Failed to load school profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (schoolData) {
      setFormData({
        schoolName: schoolData.schoolName,
        email: schoolData.email,
        address: schoolData.address || '',
        contact: schoolData.contact || '',
        phone: schoolData.phone || '',
        principal: schoolData.principal || '',
        image_url: schoolData.image_url || '',
        established: schoolData.established,
        affiliate: schoolData.affiliate || '',
        affiliateNo: schoolData.affiliateNo || '',
        website: schoolData.website || ''
      });
      setValidationErrors([]);
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValidationErrors([]);
  };

  const handleSave = async () => {
    try {
      // Validate form data
      const validation = schoolProfileService.validateProfileData(formData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        toast.error('Please fix validation errors before saving');
        return;
      }

      setSaving(true);
      setValidationErrors([]);

      const updatedData = await schoolProfileService.updateSchoolProfile(formData);
      setSchoolData(updatedData);
      setIsEditing(false);
      toast.success('School profile updated successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update school profile';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UpdateSchoolProfileData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Validate file before upload
      const validation = schoolProfileService.validateImageFile(file);
      if (!validation.isValid) {
        toast.error(validation.errors.join(', '));
        return;
      }

      setIsUploadingImage(true);
      const result = await schoolProfileService.uploadSchoolImage(file);
      
      // Update local state with new image
      setSchoolData(prev => prev ? { ...prev, image_url: result.image_url } : null);
      setFormData(prev => ({ ...prev, image_url: result.image_url }));
      
      toast.success('School image updated successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      toast.error(errorMessage);
    } finally {
      setIsUploadingImage(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading school profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !schoolData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Profile</h2>
          <p className="text-gray-600 mb-4">{error || 'Unable to load school profile data'}</p>
          <button 
            onClick={loadSchoolProfile}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center">
            <School className="h-10 w-10 text-blue-600 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">School Profile</h1>
              <p className="text-gray-600">Manage your school information and settings</p>
            </div>
          </div>
          
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </motion.div>

        {/* Validation Errors */}
        <AnimatePresence>
          {validationErrors.length > 0 && (
            <motion.div 
              className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - School Logo & Basic Info */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-white rounded-xl shadow-md p-6">
              {/* School Logo */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                    {schoolData.image_url ? (
                      <img 
                        src={`http://localhost:5000/${schoolData.image_url}`}
                        alt="School Logo" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <School className="h-16 w-16 text-blue-600" />
                    )}
                  </div>
                  <button 
                    className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                    onClick={triggerImageUpload}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.schoolName}
                    onChange={(e) => handleInputChange('schoolName', e.target.value)}
                    className="text-xl font-bold text-gray-900 text-center border-b-2 border-blue-300 focus:border-blue-600 outline-none bg-transparent w-full"
                    placeholder="School Name"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-gray-900">{schoolData.schoolName}</h2>
                )}
                
                <p className="text-gray-600 mt-1">School ID: {schoolData.code}</p>
                <div className="flex items-center justify-center mt-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    schoolData.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {schoolData.status.charAt(0).toUpperCase() + schoolData.status.slice(1)}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">Students</span>
                  </div>
                  <span className="font-semibold text-blue-600">{formatNumber(schoolData.statistics.totalStudents)}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-700">Teachers</span>
                  </div>
                  <span className="font-semibold text-green-600">{formatNumber(schoolData.statistics.totalTeachers)}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <Bus className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-sm text-gray-700">Buses</span>
                  </div>
                  <span className="font-semibold text-orange-600">{formatNumber(schoolData.statistics.totalBuses)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Detailed Information */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-4">
                  <Phone className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="school@example.com"
                      />
                    ) : (
                      <p className="text-gray-900">{schoolData.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Primary Contact
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.contact}
                        onChange={(e) => handleInputChange('contact', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Primary contact number"
                      />
                    ) : (
                      <p className="text-gray-900">{schoolData.contact}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Secondary phone number"
                      />
                    ) : (
                      <p className="text-gray-900">{schoolData.phone || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="h-4 w-4 inline mr-1" />
                      Website
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://www.schoolwebsite.com"
                      />
                    ) : (
                      schoolData.website ? (
                        <a 
                          href={schoolProfileService.formatWebsiteUrl(schoolData.website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          {schoolData.website}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      ) : (
                        <p className="text-gray-500">Not provided</p>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* School Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-4">
                  <Building2 className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">School Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      Principal Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.principal}
                        onChange={(e) => handleInputChange('principal', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Principal's name"
                      />
                    ) : (
                      <p className="text-gray-900">{schoolData.principal || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Established Year
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.established}
                        onChange={(e) => handleInputChange('established', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {schoolProfileService.getEstablishmentYearOptions().map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">{schoolData.established}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Shield className="h-4 w-4 inline mr-1" />
                      Board Affiliation
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.affiliate}
                        onChange={(e) => handleInputChange('affiliate', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select affiliation</option>
                        {schoolProfileService.getAffiliationOptions().map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">{schoolData.affiliate || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="h-4 w-4 inline mr-1" />
                      Affiliation Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.affiliateNo}
                        onChange={(e) => handleInputChange('affiliateNo', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Board affiliation number"
                      />
                    ) : (
                      <p className="text-gray-900">{schoolData.affiliateNo || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complete Address
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter complete school address"
                    />
                  ) : (
                    <p className="text-gray-900">{schoolData.address || 'Not provided'}</p>
                  )}
                </div>
              </div>

              {/* System Information */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Account Created:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(schoolData.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <p className="font-medium text-gray-900">
                      {getRelativeTime(schoolData.updatedAt)}
                    </p>
                  </div>
                  
                  {schoolData.lastLogin && (
                    <div>
                      <span className="text-gray-600">Last Login:</span>
                      <p className="font-medium text-gray-900">
                        {getRelativeTime(schoolData.lastLogin)}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-gray-600">Transport Routes:</span>
                    <p className="font-medium text-gray-900">{formatNumber(schoolData.statistics.totalRoutes)}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SchoolProfile;
