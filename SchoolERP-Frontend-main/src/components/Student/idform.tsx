import React, { useState, useEffect } from 'react';

interface FormData {
  name: string;
  age: string;
  gender: string;
  hobbies: string;
  aim_of_life: string;
  location: string;
  city: string;
  state: string;
  country: string;
  ethnicity: string;
}

interface FormErrors {
  [key: string]: string;
}

interface StepperProps {
  currentStep: number;
  steps: string[];
}

interface IdFormProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: FormData) => void;
  initialData?: Partial<FormData>;
}

const FormStepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full py-4">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              index < currentStep ? 'bg-blue-500 text-white' : 
              index === currentStep ? 'bg-[#aae2ff] text-gray-800 ring-4 ring-[#aae2ff]/30' : 
              'bg-gray-200 text-gray-600'
            }`}>
              {index < currentStep ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className="text-xs mt-1 text-gray-600 font-medium">{step}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-500" 
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const IdForm: React.FC<IdFormProps> = ({ isOpen, onClose, onComplete, initialData }) => {
  // Add state for tracking the current step
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ["Personal", "Additional", "Location"];
  
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    age: initialData?.age || '',
    gender: initialData?.gender || '',
    hobbies: initialData?.hobbies || '',
    aim_of_life: initialData?.aim_of_life || '',
    location: initialData?.location || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    country: initialData?.country || 'India',
    ethnicity: initialData?.ethnicity || 'Indian',
  });

  // Reset steps when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setErrors({});
      setSubmitSuccess(false);
    }
  }, [isOpen]);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prevData => ({
        ...prevData,
        ...initialData
      }));
    }
  }, [initialData]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
      newErrors.age = 'Age must be a valid positive number';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    if (!formData.hobbies.trim()) {
      newErrors.hobbies = 'At least one hobby is required';
    }
    
    if (!formData.aim_of_life.trim()) {
      newErrors.aim_of_life = 'Aim of life is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    if (!formData.ethnicity.trim()) {
      newErrors.ethnicity = 'Ethnicity is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to handle next step
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    const newErrors: FormErrors = {};
    
    // Validate only fields in the current step
    if (currentStep === 0) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
        valid = false;
      }
      if (!formData.age) {
        newErrors.age = 'Age is required';
        valid = false;
      } else if (isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
        newErrors.age = 'Age must be a valid positive number';
        valid = false;
      }
      if (!formData.gender) {
        newErrors.gender = 'Gender is required';
        valid = false;
      }
    } else if (currentStep === 1) {
      if (!formData.hobbies.trim()) {
        newErrors.hobbies = 'At least one hobby is required';
        valid = false;
      }
      if (!formData.aim_of_life.trim()) {
        newErrors.aim_of_life = 'Aim of life is required';
        valid = false;
      }
    } else if (currentStep === 2) {
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
        valid = false;
      }
      if (!formData.state.trim()) {
        newErrors.state = 'State is required';
        valid = false;
      }
      if (!formData.country.trim()) {
        newErrors.country = 'Country is required';
        valid = false;
      }
      if (!formData.ethnicity.trim()) {
        newErrors.ethnicity = 'Ethnicity is required';
        valid = false;
      }
    }
    
    setErrors(newErrors);
    
    if (valid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Function to go to previous step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSubmitSuccess(true);
        
        // Call onComplete with the form data
        onComplete(formData);
        
        // Reset form and close modal after 2 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
          onClose();
        }, 2000);
      } catch (error) {
        console.error('Error submitting form:', error);
        setErrors({
          submit: 'Failed to submit form. Please try again.',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle modal click outside
  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleModalClick}
    >
      <div className="max-w-4xl w-full mx-auto relative" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors"
          disabled={isSubmitting}
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-[#aae2ff]/60 max-h-[90vh] overflow-y-auto">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-[#aae2ff] to-[#88c9ff] px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Student Profile</h1>
              <p className="text-sm text-gray-700 mt-1">Complete your profile information</p>
            </div>
            <div className="text-[#0088cc] bg-white/80 p-3 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          
          {/* Progress stepper */}
          <div className="px-8 pt-6">
            <FormStepper currentStep={currentStep} steps={steps} />
          </div>
          
          {/* Success message */}
          {submitSuccess && (
            <div className="mx-6 mt-6 px-6 py-5 rounded-lg bg-green-50 border border-green-200 flex items-start">
              <div className="mr-3 flex-shrink-0 bg-green-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-green-800 font-medium text-lg">Success!</h3>
                <p className="text-green-700">Your information has been submitted successfully.</p>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="mx-6 mt-6 px-6 py-5 rounded-lg bg-red-50 border border-red-200 flex items-start">
              <div className="mr-3 flex-shrink-0 bg-red-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-red-800 font-medium text-lg">Error</h3>
                <p className="text-red-700">{errors.submit}</p>
              </div>
            </div>
          )}

          <form onSubmit={currentStep === steps.length - 1 ? handleSubmit : handleNextStep} className="px-8 py-6 space-y-6">
            {/* Show different sections based on current step */}
            {currentStep === 0 && (
              /* Personal Information Section */
              <div className="bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] rounded-lg p-6 border border-gray-200 shadow-sm transition-all duration-300 animate-fadeIn">
                <div className="flex items-center mb-5 text-[#0088cc] gap-2 font-bold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h2 className="text-lg">Personal Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name Field */}
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm
                        transition-all duration-200
                        ${errors.name ? 
                          'border-red-300 focus:border-red-500 focus:ring focus:ring-red-200' : 
                          'border-gray-300 focus:border-[#aae2ff] focus:ring focus:ring-[#aae2ff]/50 hover:border-blue-300'
                        }
                        placeholder-gray-400 placeholder-opacity-70
                      `}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                  
                  {/* Age Field */}
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm
                        transition-all duration-200
                        ${errors.age ? 
                          'border-red-300 focus:border-red-500 focus:ring focus:ring-red-200' : 
                          'border-gray-300 focus:border-[#aae2ff] focus:ring focus:ring-[#aae2ff]/50 hover:border-blue-300'
                        }
                        placeholder-gray-400 placeholder-opacity-70
                      `}
                      placeholder="Enter your age"
                    />
                    {errors.age && (
                      <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                    )}
                  </div>
                  
                  {/* Gender Field */}
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm
                        transition-all duration-200
                        ${errors.gender ? 
                          'border-red-300 focus:border-red-500 focus:ring focus:ring-red-200' : 
                          'border-gray-300 focus:border-[#aae2ff] focus:ring focus:ring-[#aae2ff]/50 hover:border-blue-300'
                        }
                        placeholder-gray-400 placeholder-opacity-70
                      `}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 1 && (
              /* Additional Information Section */
              <div className="bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] rounded-lg p-6 border border-gray-200 shadow-sm transition-all duration-300 animate-fadeIn">
                <div className="flex items-center mb-5 text-[#0088cc] gap-2 font-bold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <h2 className="text-lg">Additional Information</h2>
                </div>
                
                <div className="space-y-5">
                  {/* Hobbies Field */}
                  <div>
                    <label htmlFor="hobbies" className="block text-sm font-medium text-gray-700">
                      Hobbies & Interests <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="hobbies"
                      name="hobbies"
                      rows={2}
                      value={formData.hobbies}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm
                        transition-all duration-200
                        ${errors.hobbies ? 
                          'border-red-300 focus:border-red-500 focus:ring focus:ring-red-200' : 
                          'border-gray-300 focus:border-[#aae2ff] focus:ring focus:ring-[#aae2ff]/50 hover:border-blue-300'
                        }
                        placeholder-gray-400 placeholder-opacity-70
                      `}
                      placeholder="What do you enjoy doing? (Reading, Sports, Music, etc.)"
                    />
                    {errors.hobbies ? (
                      <p className="mt-1 text-sm text-red-600">{errors.hobbies}</p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">Separate multiple hobbies with commas</p>
                    )}
                  </div>
                  
                  {/* Aim of Life Field */}
                  <div>
                    <label htmlFor="aim_of_life" className="block text-sm font-medium text-gray-700">
                      Aim or Aspirations <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="aim_of_life"
                      name="aim_of_life"
                      rows={3}
                      value={formData.aim_of_life}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm
                        transition-all duration-200
                        ${errors.aim_of_life ? 
                          'border-red-300 focus:border-red-500 focus:ring focus:ring-red-200' : 
                          'border-gray-300 focus:border-[#aae2ff] focus:ring focus:ring-[#aae2ff]/50 hover:border-blue-300'
                        }
                        placeholder-gray-400 placeholder-opacity-70
                      `}
                      placeholder="What are your goals or aspirations for the future?"
                    />
                    {errors.aim_of_life && (
                      <p className="mt-1 text-sm text-red-600">{errors.aim_of_life}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              /* Location & Ethnicity Section - Improved */
              <div className="bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] rounded-lg p-6 border border-gray-200 shadow-sm transition-all duration-300 animate-fadeIn">
                <div className="flex items-center mb-5 text-[#0088cc] gap-2 font-bold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h2 className="text-lg">Location & Background</h2>
                </div>
                
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* City Field */}
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm
                          transition-all duration-200
                          ${errors.city ? 
                            'border-red-300 focus:border-red-500 focus:ring focus:ring-red-200' : 
                            'border-gray-300 focus:border-[#aae2ff] focus:ring focus:ring-[#aae2ff]/50 hover:border-blue-300'
                          }
                          placeholder-gray-400 placeholder-opacity-70
                        `}
                        placeholder="Your city"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                      )}
                    </div>

                    {/* State Field */}
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State/Province <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm
                          transition-all duration-200
                          ${errors.state ? 
                            'border-red-300 focus:border-red-500 focus:ring focus:ring-red-200' : 
                            'border-gray-300 focus:border-[#aae2ff] focus:ring focus:ring-[#aae2ff]/50 hover:border-blue-300'
                          }
                          placeholder-gray-400 placeholder-opacity-70
                        `}
                        placeholder="Your state or province"
                      />
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Country Field */}
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm
                          transition-all duration-200
                          ${errors.country ? 
                            'border-red-300 focus:border-red-500 focus:ring focus:ring-red-200' : 
                            'border-gray-300 focus:border-[#aae2ff] focus:ring focus:ring-[#aae2ff]/50 hover:border-blue-300'
                          }
                          placeholder-gray-400 placeholder-opacity-70
                        `}
                        placeholder="Your country"
                      />
                      {errors.country && (
                        <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                      )}
                    </div>
                    
                    {/* Ethnicity Field */}
                    <div>
                      <label htmlFor="ethnicity" className="block text-sm font-medium text-gray-700">
                        Ethnicity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="ethnicity"
                        name="ethnicity"
                        value={formData.ethnicity}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm
                          transition-all duration-200
                          ${errors.ethnicity ? 
                            'border-red-300 focus:border-red-500 focus:ring focus:ring-red-200' : 
                            'border-gray-300 focus:border-[#aae2ff] focus:ring focus:ring-[#aae2ff]/50 hover:border-blue-300'
                          }
                          placeholder-gray-400 placeholder-opacity-70
                        `}
                        placeholder="Your ethnicity or cultural background"
                      />
                      {errors.ethnicity && (
                        <p className="mt-1 text-sm text-red-600">{errors.ethnicity}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Address (Optional) Field */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Address (Optional)
                    </label>
                    <textarea
                      id="location"
                      name="location"
                      rows={2}
                      value={formData.location}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#aae2ff] focus:ring focus:ring-[#aae2ff]/50 hover:border-blue-300 transition-all duration-200"
                      placeholder="Additional address details (street, apartment, etc.)"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation buttons - updated styling */}
            <div className="flex justify-between items-center pt-5">
              <button
                type="button"
                onClick={handlePrevStep}
                className={`px-6 py-2.5 rounded-md font-medium transition-all ${
                  currentStep === 0 
                    ? 'opacity-0 pointer-events-none' 
                    : 'text-gray-600 bg-white border border-gray-300 shadow-sm hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </span>
              </button>
              
              <button
                type={currentStep === steps.length - 1 ? "submit" : "button"}
                onClick={currentStep === steps.length - 1 ? undefined : handleNextStep}
                disabled={isSubmitting}
                className={`px-6 py-2.5 rounded-md font-medium shadow-md
                  transition-all transform hover:translate-y-[-2px] active:translate-y-0
                  flex items-center ${
                  isSubmitting
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                    : currentStep === steps.length - 1
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                      : 'bg-gradient-to-r from-[#aae2ff] to-[#88c9ff] hover:from-[#88c9ff] hover:to-[#77b8ff] text-gray-800'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : currentStep === steps.length - 1 ? (
                  <>
                    Complete Profile
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    Continue
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IdForm;