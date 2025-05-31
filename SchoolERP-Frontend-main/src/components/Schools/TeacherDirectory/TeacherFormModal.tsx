import React, { useState, useEffect } from 'react';
import { Teacher } from './types';
import { AlertCircle, XCircle } from 'lucide-react';
import { AVAILABLE_CLASSES, SECTIONS } from './data';
import { motion } from 'framer-motion';

interface TeacherFormModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  mode: 'add' | 'edit';
  teacherData: Partial<Teacher>;
  setTeacherData: (data: Partial<Teacher>) => void;
  onSubmit: (data: Partial<Teacher>) => void;
  handleInputChange: (field: keyof Teacher, value: unknown) => void;
  validateInchargeClass: (value: string) => string;
  handleClassInchargeSelect: (isIncharge: boolean) => void;
}

const TeacherFormModal: React.FC<TeacherFormModalProps> = ({
  isOpen,
  setIsOpen,
  mode,
  teacherData,
  setTeacherData,
  onSubmit,
  handleInputChange,
  validateInchargeClass,
  handleClassInchargeSelect
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [age, setAge] = useState<number | null>(null);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setIsSubmitting(false);
      
      // Set initial values when modal opens
      if (mode === 'edit' && teacherData) {
        // Calculate age if dateOfBirth is provided
        if (teacherData.dateOfBirth) {
          const calculatedAge = calculateAge(teacherData.dateOfBirth);
          setAge(calculatedAge);
        }

        // Only set initial data if it's different from current data
        const currentData = {
          ...teacherData,
          subjects: Array.isArray(teacherData.subjects) ? teacherData.subjects : [],
          sections: Array.isArray(teacherData.sections) ? teacherData.sections : [],
          isClassIncharge: teacherData.isClassIncharge || false,
          inchargeClass: teacherData.inchargeClass || '',
          inchargeSection: teacherData.inchargeSection || '',
          status: teacherData.status || 'active',
          designation: teacherData.designation || 'Subject Teacher',
          joining_year: teacherData.joining_year || new Date().toISOString().split('T')[0],
          address: teacherData.address || '',
          qualification: teacherData.qualification || '',
          experience: teacherData.experience || '',
          profileImage: teacherData.profileImage || '',
          dateOfBirth: teacherData.dateOfBirth || '',
          age: teacherData.age || 0,
          religion: teacherData.religion || '',
          bloodGroup: teacherData.bloodGroup || '',
          maritalStatus: teacherData.maritalStatus || '',
          facebook: teacherData.facebook || '',
          twitter: teacherData.twitter || '',
          linkedIn: teacherData.linkedIn || '',
          joiningSalary: teacherData.joiningSalary || 0,
          accountHolderName: teacherData.accountHolderName || '',
          accountNumber: teacherData.accountNumber || '',
          bankName: teacherData.bankName || '',
          bankBranch: teacherData.bankBranch || ''
        };

        // Compare current data with new data to prevent unnecessary updates
        const hasChanged = Object.keys(currentData).some(key => {
          const currentValue = currentData[key as keyof typeof currentData];
          const existingValue = teacherData[key as keyof typeof teacherData];
          return JSON.stringify(currentValue) !== JSON.stringify(existingValue);
        });

        if (hasChanged) {
          setTeacherData(currentData);
        }
      } else if (mode === 'add' && !teacherData.joining_year) {
        handleInputChange('joining_year', new Date().toISOString().split('T')[0]);
      }
    }
  }, [isOpen, mode]); // Remove teacherData and setTeacherData from dependencies

  if (!isOpen) return null;

  // Calculate age when date of birth changes
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Handle date of birth change
  const handleDateOfBirthChange = (dateOfBirth: string) => {
    handleInputChange('dateOfBirth', dateOfBirth);
    const calculatedAge = calculateAge(dateOfBirth);
    setAge(calculatedAge);
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profileImage: 'Please upload an image file' }));
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profileImage: 'Image must be less than 2MB' }));
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('profileImage', reader.result as string);
        setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors.profileImage;
          return newErrors;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle section selection
  const handleSectionSelection = (classNum: string, section: string) => {
    const currentSections = Array.isArray(teacherData.sections) ? teacherData.sections : [];
    
    const updatedSections = currentSections.map((s: { class: string; sections: string[] }) =>
      s.class === classNum
        ? {
            ...s,
            sections: s.sections.includes(section)
              ? s.sections.filter((sec: string) => sec !== section)
              : [...s.sections, section],
          }
        : s
    );

    if (!currentSections.some((s: { class: string }) => s.class === classNum)) {
      updatedSections.push({
        class: classNum,
        sections: [section]
      });
    }

    handleInputChange('sections', updatedSections);
  };

  // Handle class selection
  const handleClassSelection = (classNum: string, checked: boolean) => {
    const currentSections = Array.isArray(teacherData.sections) ? [...teacherData.sections] : [];
    
    let updatedSections;
    if (checked) {
      if (!currentSections.some((s: { class: string }) => s.class === classNum)) {
        updatedSections = [...currentSections, { class: classNum, sections: [] }];
      } else {
        updatedSections = currentSections;
      }
    } else {
      updatedSections = currentSections.filter((s: { class: string }) => s.class !== classNum);
    }
    
    handleInputChange('sections', updatedSections);
  };

  // Validate field
  const validateField = (field: keyof Teacher, value: unknown) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    
    switch(field) {
      case 'fullName':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          setErrors(prev => ({ ...prev, fullName: 'Name is required' }));
        } else if (typeof value === 'string' && value.length < 3) {
          setErrors(prev => ({ ...prev, fullName: 'Name must be at least 3 characters' }));
        } else {
          setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.fullName;
            return newErrors;
          });
        }
        break;
      case 'email':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          setErrors(prev => ({ ...prev, email: 'Email is required' }));
        } else if (typeof value === 'string' && !emailRegex.test(value)) {
          setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
        } else {
          setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.email;
            return newErrors;
          });
        }
        break;
      case 'password':
        if (mode === 'add' && (!value || (typeof value === 'string' && value.trim() === ''))) {
          setErrors(prev => ({ ...prev, password: 'Password is required' }));
        } else if (value && typeof value === 'string' && value.length < 6) {
          setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
        } else {
          setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.password;
            return newErrors;
          });
        }
        break;
      case 'phone':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          setErrors(prev => ({ ...prev, phone: 'Phone is required' }));
        } else if (typeof value === 'string' && !phoneRegex.test(value.replace(/[^0-9]/g, ''))) {
          setErrors(prev => ({ ...prev, phone: 'Phone must be 10 digits' }));
        } else {
          setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.phone;
            return newErrors;
          });
        }
        break;
      case 'gender':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          setErrors(prev => ({ ...prev, gender: 'Gender is required' }));
        } else {
          setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.gender;
            return newErrors;
          });
        }
        break;
      case 'inchargeClass':
        if (teacherData.isClassIncharge && (!value || (typeof value === 'string' && value.trim() === ''))) {
          setErrors(prev => ({ ...prev, inchargeClass: 'Class is required for class incharge' }));
        } else if (typeof value === 'string') {
          const validationResult = validateInchargeClass(value);
          if (validationResult) {
            setErrors(prev => ({ ...prev, inchargeClass: validationResult }));
          } else {
            setErrors(prev => {
              const newErrors = {...prev};
              delete newErrors.inchargeClass;
              return newErrors;
            });
          }
        }
        break;
      case 'inchargeSection':
        if (teacherData.isClassIncharge && (!value || (typeof value === 'string' && value.trim() === ''))) {
          setErrors(prev => ({ ...prev, inchargeSection: 'Section is required for class incharge' }));
        } else {
          setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.inchargeSection;
            return newErrors;
          });
        }
        break;
    }
  };

  // Handle validated change
  const handleValidatedChange = (field: keyof Teacher, value: unknown) => {
      handleInputChange(field, value);
      validateField(field, value);
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = ['fullName', 'gender']; // Only fullName and gender are required
    
    // Check required fields
    requiredFields.forEach(field => {
      const value = teacherData[field as keyof Teacher];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    // All other fields are optional - remove previous validations for subjects, sections, etc.
    
    // Check class incharge fields only if isClassIncharge is true
    if (teacherData.isClassIncharge) {
      if (!teacherData.inchargeClass) {
        newErrors.inchargeClass = 'Class is required for class incharge';
      } else {
        const validationResult = validateInchargeClass(teacherData.inchargeClass);
        if (validationResult) {
          newErrors.inchargeClass = validationResult;
        }
      }
      
      if (!teacherData.inchargeSection) {
        newErrors.inchargeSection = 'Section is required for class incharge';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    if (validateForm()) {
      onSubmit(teacherData);
      } else {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <div className="px-6 py-4">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['basic', 'professional', 'personal', 'banking'].map((tab) => (
          <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Information
          </button>
          ))}
        </nav>
        </div>

      {/* Basic Information Tab */}
      {activeTab === 'basic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Image */}
          <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image
              </label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={teacherData.profileImage || ''}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = '';
                  }}
                />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  Click on the image to upload a new one. Max size: 2MB
                </p>
              {errors.profileImage && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {errors.profileImage}
                </p>
              )}
                </div>
            </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter full name"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                value={teacherData.fullName || ''}
                onChange={(e) => handleValidatedChange('fullName', e.target.value)}
                onBlur={() => validateField('fullName', teacherData.fullName)}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                value={teacherData.email || ''}
                onChange={(e) => handleValidatedChange('email', e.target.value)}
                onBlur={() => validateField('email', teacherData.email)}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Password{mode === 'add' ? '*' : ''}
              </label>
              <input
                type="password"
              required={mode === 'add'}
              placeholder={mode === 'add' ? 'Enter password' : 'Leave blank to keep current password'}
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                value={teacherData.password || ''}
                onChange={(e) => handleValidatedChange('password', e.target.value)}
                onBlur={() => validateField('password', teacherData.password)}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {errors.password}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
              </label>
              <input
                type="tel"
              placeholder="Enter phone number"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                value={teacherData.phone || ''}
                onChange={(e) => handleValidatedChange('phone', e.target.value)}
                onBlur={() => validateField('phone', teacherData.phone)}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {errors.phone}
                </p>
              )}
            </div>

          {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender <span className="text-red-500">*</span>
              </label>
            <select
                required
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                errors.gender ? 'border-red-500' : 'border-gray-300'
              }`}
              value={teacherData.gender || ''}
              onChange={(e) => handleValidatedChange('gender', e.target.value)}
              onBlur={() => validateField('gender', teacherData.gender)}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" /> {errors.gender}
                </p>
              )}
            </div>

          {/* Designation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation
            </label>
            <input
              type="text"
              placeholder="Enter designation"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={teacherData.designation || ''}
              onChange={(e) => handleInputChange('designation', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Professional Information Tab */}
      {activeTab === 'professional' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Qualification */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qualification
            </label>
            <input
              type="text"
              value={teacherData.qualification || ''}
              onChange={(e) => setTeacherData({ ...teacherData, qualification: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter qualification"
            />
          </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Experience (years)
              </label>
              <input
                type="text"
              placeholder="Enter years of experience"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={teacherData.experience || ''}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              />
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Joining Date
              </label>
              <input
                type="date"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={teacherData.joining_year || ''}
              onChange={(e) => handleInputChange('joining_year', e.target.value)}
            />
          </div>

          {/* Subjects */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subjects
            </label>
            <input
              type="text"
              placeholder="Enter subjects (comma separated)"
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                errors.subjects ? 'border-red-500' : 'border-gray-300'
              }`}
              value={Array.isArray(teacherData.subjects) ? teacherData.subjects.join(', ') : ''}
              onChange={(e) => handleInputChange('subjects', e.target.value.split(',').map(s => s.trim()))}
            />
            {errors.subjects && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" /> {errors.subjects}
                </p>
              )}
          </div>

          {/* Class and Section Selection */}
          <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Classes and Sections <span className="text-red-500">*</span>
              </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {AVAILABLE_CLASSES.map((classNum) => (
                <div key={classNum} className="border rounded-md p-4">
                  <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={teacherData.sections?.some((s: { class: string }) => s.class === classNum)}
                      onChange={(e) => handleClassSelection(classNum, e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium">{classNum}</span>
                  </label>
                  {teacherData.sections?.some((s: { class: string }) => s.class === classNum) && (
                    <div className="grid grid-cols-2 gap-2">
                      {SECTIONS.map((section) => (
                        <label key={section} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={teacherData.sections?.find((s: { class: string; sections: string[] }) => s.class === classNum)?.sections.includes(section)}
                            onChange={() => handleSectionSelection(classNum, section)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm">Section {section}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {errors.sections && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" /> {errors.sections}
              </p>
            )}
          </div>

          {/* Class Incharge Details */}
          <div className="col-span-2 border-t pt-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Is Class Incharge?
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleClassInchargeSelect(true)}
                  className={`px-4 py-2 rounded-md ${
                    teacherData.isClassIncharge
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleClassInchargeSelect(false)}
                  className={`px-4 py-2 rounded-md ${
                    !teacherData.isClassIncharge
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {teacherData.isClassIncharge && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Incharge Class*
                  </label>
                  <select
                    required
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.inchargeClass ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={teacherData.inchargeClass || ''}
                    onChange={(e) => handleValidatedChange('inchargeClass', e.target.value)}
                    onBlur={() => validateField('inchargeClass', teacherData.inchargeClass)}
                  >
                    <option value="">Select Class</option>
                    {AVAILABLE_CLASSES.map((classNum) => (
                      <option key={classNum} value={classNum}>{classNum}</option>
                    ))}
                  </select>
                  {errors.inchargeClass && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" /> {errors.inchargeClass}
                    </p>
                  )}
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Incharge Section*
                    </label>
                    <select
                      required
                      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        errors.inchargeSection ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={teacherData.inchargeSection || ''}
                      onChange={(e) => handleValidatedChange('inchargeSection', e.target.value)}
                      onBlur={() => validateField('inchargeSection', teacherData.inchargeSection)}
                    >
                      <option value="">Select Section</option>
                      {SECTIONS.map((section) => (
                      <option key={section} value={section}>Section {section}</option>
                      ))}
                    </select>
                    {errors.inchargeSection && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" /> {errors.inchargeSection}
                      </p>
                    )}
                </div>
                  </div>
                )}
          </div>
              </div>
            )}

      {/* Personal Information Tab */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={teacherData.dateOfBirth || ''}
              onChange={(e) => handleDateOfBirthChange(e.target.value)}
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
            />
          </div>

          {/* Age (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
              </label>
              <input
                type="text"
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              value={age !== null ? `${age} years` : ''}
              readOnly
            />
            </div>

          {/* Religion */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Religion
              </label>
                      <input
              type="text"
              placeholder="Enter religion"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={teacherData.religion || ''}
              onChange={(e) => handleInputChange('religion', e.target.value)}
            />
                    </div>

          {/* Blood Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Group
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={teacherData.bloodGroup || ''}
              onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
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
          </div>

          {/* Marital Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marital Status
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={teacherData.maritalStatus || ''}
              onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
            >
              <option value="">Select Marital Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              placeholder="Enter address"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={teacherData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
            />
          </div>

          {/* Social Media Links */}
          <div className="col-span-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Facebook</label>
                            <input
                  type="url"
                  placeholder="Facebook profile URL"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={teacherData.facebook || ''}
                  onChange={(e) => handleInputChange('facebook', e.target.value)}
                />
                          </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Twitter</label>
                <input
                  type="url"
                  placeholder="Twitter profile URL"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={teacherData.twitter || ''}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">LinkedIn</label>
                <input
                  type="url"
                  placeholder="LinkedIn profile URL"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={teacherData.linkedIn || ''}
                  onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documents
            </label>
            <input
              type="file"
              multiple
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                const urls = files.map(file => URL.createObjectURL(file));
                handleInputChange('documents', urls);
              }}
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload relevant documents (certificates, ID proofs, etc.)
            </p>
          </div>
                      </div>
                    )}

      {/* Banking Information Tab */}
      {activeTab === 'banking' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Joining Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Joining Salary
            </label>
            <input
              type="text"
              placeholder="Enter joining salary"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={teacherData.joiningSalary || ''}
              onChange={(e) => handleInputChange('joiningSalary', e.target.value)}
            />
          </div>

          {/* Account Holder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Holder Name
            </label>
            <input
              type="text"
              placeholder="Enter account holder name"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={teacherData.accountHolderName || ''}
              onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
            />
            </div>

          {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
              </label>
              <input
                type="text"
              placeholder="Enter account number"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={teacherData.accountNumber || ''}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
            />
            </div>

          {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name
              </label>
              <input
                type="text"
              placeholder="Enter bank name"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={teacherData.bankName || ''}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
            />
            </div>

          {/* Bank Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Branch
            </label>
            <input
              type="text"
              placeholder="Enter bank branch"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={teacherData.bankBranch || ''}
              onChange={(e) => handleInputChange('bankBranch', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Teacher' : 'Update Teacher'}
        </button>
      </div>
    </div>
  );

  if (mode === 'edit') {
    return (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              Edit Teacher
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const tabs = ['basic', 'professional', 'personal', 'banking'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1]);
                    }
                  }}
                  disabled={activeTab === 'basic'}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'basic'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    const tabs = ['basic', 'professional', 'personal', 'banking'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1]);
                    }
                  }}
                  disabled={activeTab === 'banking'}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'banking'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  Next
          </button>
        </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
          </div>
          {formContent}
      </motion.div>
    </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-lg">
      {formContent}
    </div>
  );
};

export default TeacherFormModal;