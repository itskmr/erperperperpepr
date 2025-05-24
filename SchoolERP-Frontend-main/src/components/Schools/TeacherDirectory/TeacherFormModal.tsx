import React, { useState, useEffect } from 'react';
import { Teacher } from './types';
import { motion } from 'framer-motion';
import { XCircle, AlertCircle } from 'lucide-react';
import { AVAILABLE_CLASSES, SECTIONS } from './data';

// Get current date in YYYY-MM-DD format for default value
const getCurrentDate = () => {
  const storedDate = localStorage.getItem('currentDate');
  if (storedDate) {
    return storedDate;
  }
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];
  localStorage.setItem('currentDate', dateString);
  return dateString;
};

interface TeacherFormModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  mode: 'add' | 'edit';
  teacherData: Partial<Teacher>;
  setTeacherData: (data: Partial<Teacher>) => void;
  onSubmit: () => void;
  validateInchargeClass: (value: string) => string;
  handleInputChange: (field: keyof Teacher, value: any) => void;
}

const TeacherFormModal: React.FC<TeacherFormModalProps> = ({
  isOpen,
  setIsOpen,
  mode,
  teacherData,
  onSubmit,
  handleInputChange,
  validateInchargeClass
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setSelectedClass(teacherData.inchargeClass || '');
      setErrors({});
      setTouchedFields({});
      setIsSubmitting(false);
      
      // Set default date if not already set
      if (mode === 'add' && !teacherData.joinDate) {
        handleInputChange('joinDate', getCurrentDate());
      }
    }
  }, [isOpen, teacherData.inchargeClass, mode, handleInputChange]);

  if (!isOpen) return null;

  // Handle image upload with validation
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profileImage: 'Please upload an image file' }));
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB max
        setErrors(prev => ({ ...prev, profileImage: 'Image must be less than 2MB' }));
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        // Ensure we're getting a string result for the image
        const imageResult = reader.result as string;
        handleInputChange('profileImage', imageResult);
        setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors.profileImage;
          return newErrors;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle section selection for a class
  const handleSectionSelection = (classNum: string, section: string) => {
    // Ensure we have a valid sections array
    const currentSections = Array.isArray(teacherData.sections) ? teacherData.sections : [];
    
    const updatedSections = currentSections.map((s) =>
      s.class === classNum
        ? {
            ...s,
            sections: s.sections.includes(section)
              ? s.sections.filter((sec) => sec !== section) // Remove section if already selected
              : [...s.sections, section], // Add section if not selected
          }
        : s
    );

    handleInputChange('sections', updatedSections);
  };

  // When adding a class for the first time
  const handleClassSelection = (classNum: string, checked: boolean) => {
    const currentSections = Array.isArray(teacherData.sections) ? [...teacherData.sections] : [];
    
    let updatedSections;
    if (checked) {
      // Make sure class doesn't already exist in the sections array
      if (!currentSections.some(s => s.class === classNum)) {
        updatedSections = [...currentSections, { class: classNum, sections: [] }];
      } else {
        updatedSections = currentSections;
      }
    } else {
      // Remove the class from sections array
      updatedSections = currentSections.filter(s => s.class !== classNum);
    }
    
    handleInputChange('sections', updatedSections);
  };

  // Validate field on blur
  const validateField = (field: keyof Teacher, value: any) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    
    switch(field) {
      case 'fullName':
        if (!value || value.trim() === '') {
          setErrors(prev => ({ ...prev, fullName: 'Name is required' }));
        } else if (value.length < 3) {
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || value.trim() === '') {
          setErrors(prev => ({ ...prev, email: 'Email is required' }));
        } else if (!emailRegex.test(value)) {
          setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
        } else {
          setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.email;
            return newErrors;
          });
        }
        break;
      case 'phone':
        const phoneRegex = /^\d{10}$/;
        if (!value || value.trim() === '') {
          setErrors(prev => ({ ...prev, phone: 'Phone is required' }));
        } else if (!phoneRegex.test(value.replace(/[^0-9]/g, ''))) {
          setErrors(prev => ({ ...prev, phone: 'Phone must be 10 digits' }));
        } else {
          setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.phone;
            return newErrors;
          });
        }
        break;
      case 'inchargeClass':
        if (teacherData.isClassIncharge && (!value || value.trim() === '')) {
          setErrors(prev => ({ ...prev, inchargeClass: 'Class is required for class incharge' }));
        } else {
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
        if (teacherData.isClassIncharge && (!value || value.trim() === '')) {
          setErrors(prev => ({ ...prev, inchargeSection: 'Section is required for class incharge' }));
        } else {
          setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.inchargeSection;
            return newErrors;
          });
        }
        break;
      case 'subjects':
        // Ensure subjects is always an array
        if (!Array.isArray(value) || value.length === 0) {
          setErrors(prev => ({ ...prev, subjects: 'At least one subject is required' }));
        } else {
          setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.subjects;
            return newErrors;
          });
        }
        break;
    }
  };

  // Handle changed input with validation
  const handleValidatedChange = (field: keyof Teacher, value: any) => {
    // Special handling for subjects to ensure it's always an array
    if (field === 'subjects' && typeof value === 'string') {
      const subjectsArray = value.split(',').map(s => s.trim()).filter(s => s !== '');
      handleInputChange(field, subjectsArray);
    } else {
      handleInputChange(field, value);
    }
    
    if (touchedFields[field]) {
      validateField(field, field === 'subjects' && typeof value === 'string' 
        ? value.split(',').map(s => s.trim()).filter(s => s !== '') 
        : value);
    }
  };

  // Validate form before submit
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = ['fullName', 'email', 'phone', 'designation', 'experience', 'joinDate', 'address', 'education'];
    
    requiredFields.forEach(field => {
      const value = teacherData[field as keyof Teacher];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    // Validate email format
    if (teacherData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(teacherData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Validate phone number
    if (teacherData.phone) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(teacherData.phone.replace(/[^0-9]/g, ''))) {
        newErrors.phone = 'Phone number must be 10 digits';
      }
    }

    // Validate subjects field
    if (!teacherData.subjects || !Array.isArray(teacherData.subjects) || teacherData.subjects.length === 0) {
      newErrors.subjects = 'At least one subject is required';
    }

    // Validate sections
    if (!teacherData.sections || !Array.isArray(teacherData.sections)) {
      handleInputChange('sections', []);
    }

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

  // Handle submit with validation
  const handleSubmit = () => {
    // Prevent double submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const fields = ['fullName', 'email', 'phone', 'designation', 'experience', 'joinDate', 'address', 'education', 'subjects'];
    if (teacherData.isClassIncharge) {
      fields.push('inchargeClass', 'inchargeSection');
    }
    
    const touched: Record<string, boolean> = {};
    fields.forEach(field => {
      touched[field] = true;
    });
    setTouchedFields(touched);
    
    if (validateForm()) {
      // Convert any remaining string arrays to proper arrays
      if (typeof teacherData.subjects === 'string') {
        const subjectArray = (teacherData.subjects as string).split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
        handleInputChange('subjects', subjectArray);
        // Small delay to ensure state is updated before submitting
        setTimeout(() => {
          onSubmit();
        }, 100);
      } else {
        onSubmit();
      }
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'add' ? 'Add New Teacher' : 'Edit Teacher'}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Profile Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  errors.profileImage ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.profileImage && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {errors.profileImage}
                </p>
              )}
              {teacherData.profileImage && (
                <div className="mt-2">
                  <img
                    src={teacherData.profileImage}
                    alt="Profile Preview"
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://randomuser.me/api/portraits/men/0.jpg';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name*
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
                Email*
              </label>
              <input
                type="email"
                required
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

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone*
              </label>
              <input
                type="tel"
                required
                placeholder="Enter 10-digit phone number"
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

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation*
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Teacher, Math Teacher, HOD"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  errors.designation ? 'border-red-500' : 'border-gray-300'
                }`}
                value={teacherData.designation || ''}
                onChange={(e) => handleValidatedChange('designation', e.target.value)}
                onBlur={() => validateField('designation', teacherData.designation)}
              />
              {errors.designation && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {errors.designation}
                </p>
              )}
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience*
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 5 years"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  errors.experience ? 'border-red-500' : 'border-gray-300'
                }`}
                value={teacherData.experience || ''}
                onChange={(e) => handleValidatedChange('experience', e.target.value)}
                onBlur={() => validateField('experience', teacherData.experience)}
              />
              {errors.experience && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {errors.experience}
                </p>
              )}
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joining Date*
              </label>
              <input
                type="date"
                required
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  errors.joinDate ? 'border-red-500' : 'border-gray-300'
                }`}
                value={teacherData.joinDate || getCurrentDate()}
                onChange={(e) => handleValidatedChange('joinDate', e.target.value)}
                onBlur={() => validateField('joinDate', teacherData.joinDate)}
              />
              {errors.joinDate && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {errors.joinDate}
                </p>
              )}
            </div>

            {/* Class Incharge */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Incharge
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => handleValidatedChange('isClassIncharge', true)}
                  className={`px-4 py-2 rounded-md ${
                    teacherData.isClassIncharge
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleValidatedChange('isClassIncharge', false)}
                  className={`px-4 py-2 rounded-md ${
                    !teacherData.isClassIncharge
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Incharge Class and Section */}
            {teacherData.isClassIncharge && (
              <div className="mt-2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Incharge Class* <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.inchargeClass ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      handleValidatedChange('inchargeClass', e.target.value);
                      handleValidatedChange('inchargeSection', ''); // Reset section when class changes
                    }}
                    onBlur={() => validateField('inchargeClass', selectedClass)}
                  >
                    <option value="">Select Class</option>
                    {AVAILABLE_CLASSES.map((classNum) => (
                      <option key={classNum} value={classNum}>
                        Class {classNum}
                      </option>
                    ))}
                  </select>
                  {errors.inchargeClass && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" /> {errors.inchargeClass}
                    </p>
                  )}
                </div>

                {selectedClass && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Incharge Section* <span className="text-red-500">*</span>
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
                        <option key={section} value={section}>
                          Section {section}
                        </option>
                      ))}
                    </select>
                    {errors.inchargeSection && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" /> {errors.inchargeSection}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Subjects */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subjects* (comma separated)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Math, Science, English"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  errors.subjects ? 'border-red-500' : 'border-gray-300'
                }`}
                value={Array.isArray(teacherData.subjects) ? teacherData.subjects.join(', ') : ''}
                onChange={(e) => handleValidatedChange('subjects', e.target.value)}
                onBlur={() => validateField('subjects', teacherData.subjects)}
              />
              {errors.subjects && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {errors.subjects}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Enter subjects separated by commas (e.g. Math, Science, English)
              </p>
            </div>

            {/* Classes and Sections */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classes and Sections
              </label>
              {AVAILABLE_CLASSES.map((classNum) => {
                const classData = Array.isArray(teacherData.sections) && 
                  teacherData.sections.find((s) => s.class === classNum) || {
                  class: classNum,
                  sections: [],
                };
                return (
                  <div key={classNum} className="mb-4">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={Array.isArray(teacherData.sections) && 
                          teacherData.sections.some((s) => s.class === classNum)}
                        onChange={(e) => handleClassSelection(classNum, e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2">Class {classNum}</span>
                    </div>
                    {Array.isArray(teacherData.sections) && 
                      teacherData.sections.some((s) => s.class === classNum) && (
                      <div className="flex flex-wrap gap-2">
                        {SECTIONS.map((section) => (
                          <div key={section} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={classData.sections.includes(section)}
                              onChange={() => handleSectionSelection(classNum, section)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2">Section {section}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address*
              </label>
              <input
                type="text"
                required
                placeholder="Enter full address"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                value={teacherData.address || ''}
                onChange={(e) => handleValidatedChange('address', e.target.value)}
                onBlur={() => validateField('address', teacherData.address)}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {errors.address}
                </p>
              )}
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education*
              </label>
              <input
                type="text"
                required
                placeholder="e.g. B.Ed, M.Sc"
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  errors.education ? 'border-red-500' : 'border-gray-300'
                }`}
                value={teacherData.education || ''}
                onChange={(e) => handleValidatedChange('education', e.target.value)}
                onBlur={() => validateField('education', teacherData.education)}
              />
              {errors.education && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {errors.education}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Processing...' : mode === 'add' ? 'Add Teacher' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TeacherFormModal;