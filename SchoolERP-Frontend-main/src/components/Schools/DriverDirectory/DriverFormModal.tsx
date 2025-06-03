import React, { useEffect, useState } from 'react';
import { X, User, Phone, Briefcase, Upload, Trash2 } from 'lucide-react';
import { DriverFormModalProps } from './types';

const DriverFormModal: React.FC<DriverFormModalProps> = ({
  isOpen,
  setIsOpen,
  mode,
  driverData,
  setDriverData,
  onSubmit,
  handleInputChange,
}) => {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  // Auto-calculate age when DOB changes
  useEffect(() => {
    const dob = (driverData as any)?.dateOfBirth;
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      // Update age in the driver data
      handleInputChange({
        target: { name: 'age', value: age, type: 'number' }
      } as any);
    }
  }, [(driverData as any)?.dateOfBirth]);

  // Set photo preview for existing driver
  useEffect(() => {
    if (mode === 'edit' && (driverData as any)?.photo) {
      setPhotoPreview((driverData as any).photo);
    }
  }, [mode, (driverData as any)?.photo]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields - only name, gender, and contact number
    if (!(driverData as any).name?.trim()) errors.name = 'Name is required';
    if (!(driverData as any).contactNumber?.trim()) errors.contactNumber = 'Contact number is required';
    if (!(driverData as any).gender) errors.gender = 'Gender is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(e);
    }
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    handleInputChange(e);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Processing file:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Check file size (limit to 2MB for better compression)
      if (file.size > 2 * 1024 * 1024) {
        console.error('File too large:', file.size);
        alert('File size should be less than 2MB for better compression');
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        console.error('Invalid file type:', file.type);
        alert('Please select a valid image file (JPEG, PNG, WebP)');
        return;
      }

      setPhotoFile(file);
      
      // Create a canvas to resize/compress the image
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          try {
            console.log('Original image dimensions:', img.width, 'x', img.height);
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              throw new Error('Could not get canvas context');
            }
            
            // Set canvas size (max width/height 300px to reduce file size significantly)
            const maxSize = 300;
            let { width, height } = img;
            
            if (width > height) {
              if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            console.log('Resized image dimensions:', width, 'x', height);
            
            // Draw and compress with higher compression
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5); // 50% quality for smaller size
            
            console.log('Compressed image size:', Math.round(compressedDataUrl.length / 1024), 'KB');
            
            // Validate the compressed image size (strict limit)
            if (compressedDataUrl.length > 400000) { // ~400KB after base64 encoding
              console.error('Compressed image still too large:', compressedDataUrl.length);
              alert('Image is still too large after compression. Please choose a smaller image.');
              return;
            }
            
            console.log('Photo processed successfully');
            setPhotoPreview(compressedDataUrl);
            
            // Store compressed image
            handleInputChange({
              target: { name: 'photo', value: compressedDataUrl, type: 'text' }
            } as any);
            
          } catch (error) {
            console.error('Error processing image:', error);
            alert('Error processing image. Please try a different image.');
          }
        };
        
        img.onerror = () => {
          console.error('Error loading image');
          alert('Error loading image. Please try a different file.');
        };
        
        img.src = event.target?.result as string;
      };
      
      reader.onerror = () => {
        console.error('Error reading file');
        alert('Error reading file. Please try again.');
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    setPhotoFile(null);
    handleInputChange({
      target: { name: 'photo', value: '', type: 'text' }
    } as any);
  };

  const handleStatusToggle = () => {
    const currentStatus = (driverData as any).isActive;
    handleInputChange({
      target: { name: 'isActive', value: !currentStatus, type: 'checkbox' }
    } as any);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {mode === 'add' ? 'Add New Driver' : 'Edit Driver'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-indigo-500" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Driver Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Driver Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={(driverData as any).name || ''}
                      onChange={handleFieldChange}
                      required
                      placeholder="Enter driver's full name"
                      className={`mt-1 block w-full border ${formErrors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      aria-invalid={!!formErrors.name}
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={(driverData as any).dateOfBirth || ''}
                      onChange={handleFieldChange}
                      className={`mt-1 block w-full border ${formErrors.dateOfBirth ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      aria-invalid={!!formErrors.dateOfBirth}
                    />
                    {formErrors.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.dateOfBirth}</p>
                    )}
                  </div>

                  {/* Age (Auto-calculated) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={(driverData as any).age || ''}
                      readOnly
                      placeholder="Auto-calculated"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 focus:outline-none sm:text-sm"
                    />
                    {formErrors.age && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.age}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={(driverData as any).gender || ''}
                      onChange={handleFieldChange}
                      required
                      className={`mt-1 block w-full border ${formErrors.gender ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
                      aria-invalid={!!formErrors.gender}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    {formErrors.gender && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.gender}</p>
                    )}
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Marital Status
                    </label>
                    <select
                      name="maritalStatus"
                      value={(driverData as any).maritalStatus || ''}
                      onChange={handleFieldChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Blood Group
                    </label>
                    <select
                      name="bloodGroup"
                      value={(driverData as any).bloodGroup || ''}
                      onChange={handleFieldChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
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

                  {/* Qualification */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Qualification
                    </label>
                    <input
                      type="text"
                      name="qualification"
                      value={(driverData as any).qualification || ''}
                      onChange={handleFieldChange}
                      placeholder="Enter qualification"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-indigo-500" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Driver Contact */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={(driverData as any).contactNumber || ''}
                      onChange={handleFieldChange}
                      required
                      placeholder="Enter contact number"
                      className={`mt-1 block w-full border ${formErrors.contactNumber ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      aria-invalid={!!formErrors.contactNumber}
                    />
                    {formErrors.contactNumber && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.contactNumber}</p>
                    )}
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Emergency Contact
                    </label>
                    <input
                      type="tel"
                      name="emergencyContact"
                      value={(driverData as any).emergencyContact || ''}
                      onChange={handleFieldChange}
                      placeholder="Enter emergency contact"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={(driverData as any).address || ''}
                      onChange={handleFieldChange}
                      rows={3}
                      placeholder="Enter driver's address"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-indigo-500" />
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* License Number (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      License Number
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={(driverData as any).licenseNumber || ''}
                      onChange={handleFieldChange}
                      placeholder="Enter license number (optional)"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  {/* Experience (Years) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={(driverData as any).experience || 0}
                      onChange={handleFieldChange}
                      min="0"
                      placeholder="Years of experience"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  {/* Joining Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={(driverData as any).joiningDate || ''}
                      onChange={handleFieldChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  {/* Salary */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Salary (Monthly)
                    </label>
                    <input
                      type="number"
                      name="salary"
                      value={(driverData as any).salary || ''}
                      onChange={handleFieldChange}
                      min="0"
                      step="100"
                      placeholder="Enter monthly salary"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div className="mt-1 flex items-center">
                      <button
                        type="button"
                        onClick={handleStatusToggle}
                        className={`${
                          (driverData as any).isActive ? 'bg-indigo-600' : 'bg-gray-200'
                        } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                      >
                        <span
                          className={`${
                            (driverData as any).isActive ? 'translate-x-5' : 'translate-x-0'
                          } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                        />
                      </button>
                      <span className="ml-3 text-sm">
                        <span className={`font-medium ${(driverData as any).isActive ? 'text-green-900' : 'text-gray-900'}`}>
                          {(driverData as any).isActive ? 'Active' : 'Inactive'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Driver Photo
                    </label>
                    <div className="mt-1 flex flex-col space-y-3">
                      {/* Photo Preview with Remove Button */}
                      {photoPreview && (
                        <div className="flex justify-center">
                          <div className="relative">
                            <img
                              src={photoPreview}
                              alt="Driver Preview"
                              className="h-32 w-32 object-cover rounded-full border-4 border-indigo-100"
                            />
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors duration-200"
                              title="Remove photo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* File Upload */}
                      {!photoPreview && (
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> driver photo
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, JPEG or WebP (MAX. 2MB)</p>
                            </div>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                      
                      {/* Change Photo Button (when photo exists) */}
                      {photoPreview && (
                        <div className="flex justify-center">
                          <label className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                            <Upload className="w-4 h-4 mr-2" />
                            Change Photo
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Object.keys(formErrors).length > 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mode === 'add' ? 'Add Driver' : 'Update Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverFormModal; 