import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

// Class options as specified by user
const CLASS_OPTIONS = [
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

interface FormData {
   // Required fields (only 3 now)
  fullName: string;
  formNo: string; // Required now
  regnDate: string;
  registerForClass: string;
  
  // Optional fields
  testDate?: string; // Optional now
  branchName?: string;
  gender?: string;
  dob?: string;
  category?: string;
  religion?: string;
  admissionCategory?: string;
  bloodGroup?: string;
  transactionNo?: string;
  singleParent?: boolean;
  contactNo?: string;
  studentEmail?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  studentAadharCardNo?: string;
  regnCharge?: string;
  examSubject?: string;
  paymentStatus?: string;
  fatherName?: string;
  fatherMobileNo?: string;
  smsAlert?: boolean;
  fatherEmail?: string;
  fatherAadharCardNo?: string;
  isFatherCampusEmployee?: boolean;
  motherName?: string;
  motherMobileNo?: string;
  motherAadharCardNo?: string;
  casteCertificate?: File | null;
  studentAadharCard?: File | null;
  fatherAadharCard?: File | null;
  motherAadharCard?: File | null;
  previousClassMarksheet?: File | null;
  transferCertificate?: File | null;
  studentDateOfBirthCertificate?: File | null;
}

const StudentRegistration = () => {
  const [formData, setFormData] = useState<FormData>({
    // Required fields
    fullName: "",
    formNo: "",
    regnDate: new Date().toISOString().split('T')[0], // Default to today
    registerForClass: "",
    
    // Optional fields
    branchName: "",
    gender: "",
    dob: "",
    category: "",
    religion: "",
    admissionCategory: "",
    bloodGroup: "",
    transactionNo: "",
    singleParent: false,
    contactNo: "",
    studentEmail: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    studentAadharCardNo: "",
    regnCharge: "",
    examSubject: "",
    paymentStatus: "Pending",
    fatherName: "",
    fatherMobileNo: "",
    smsAlert: false,
    fatherEmail: "",
    fatherAadharCardNo: "",
    isFatherCampusEmployee: false,
    motherName: "",
    motherMobileNo: "",
    motherAadharCardNo: "",
    casteCertificate: null,
    studentAadharCard: null,
    fatherAadharCard: null,
    motherAadharCard: null,
    previousClassMarksheet: null,
    transferCertificate: null,
    studentDateOfBirthCertificate: null,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, title: 'Basic Information', icon: '👤' },
    { id: 2, title: 'Contact & Address', icon: '📍' },
    { id: 3, title: 'Parent Details', icon: '👪' },
    { id: 4, title: 'Documents', icon: '📄' }
  ];

  const validateCurrentStep = () => {
    const errors: string[] = [];
    
    if (currentStep === 1) {
      if (!formData.fullName.trim()) errors.push('Full Name is required');
      if (!formData.formNo) errors.push('Form Number is required');  
      if (!formData.regnDate) errors.push('Registration Date is required');
      if (!formData.registerForClass) errors.push('Register For Class is required');
    }
    
    return errors;
  };

  const nextStep = () => {
    const errors = validateCurrentStep();
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }
    setError(null);
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setFormData(prev => ({ ...prev, [name]: file }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const renderInput = (
    label: string, 
    name: string, 
    type: string = 'text', 
    required: boolean = false,
    placeholder?: string,
    options?: string[]
  ) => {
    if (type === 'select' && options) {
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            name={name}
            value={formData[name as keyof FormData] as string || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={required}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type={type}
          name={name}
          value={formData[name as keyof FormData] as string || ''}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required={required}
        />
      </div>
    );
  };

  const renderFileInput = (label: string, name: string) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          type="file"
          name={name}
          onChange={handleChange}
          accept=".pdf,.jpg,.jpeg,.png"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput('Full Name', 'fullName', 'text', true, 'Enter student full name')}
              {renderInput('Test Date', 'testDate', 'date', false)}
              {renderInput('Registration Date', 'regnDate', 'date', true)}
              {renderInput('Register For Class', 'registerForClass', 'select', true, 'Select class', CLASS_OPTIONS)}
              {renderInput('Branch Name', 'branchName', 'text', false, 'Branch/Campus name')}
              {renderInput('Form Number', 'formNo', 'text', true, 'Registration form number')}
              {renderInput('Gender', 'gender', 'select', false, 'Select gender', ['Male', 'Female', 'Other'])}
              {renderInput('Date of Birth', 'dob', 'date', false)}
              {renderInput('Category', 'category', 'text', false, 'e.g., General, OBC, SC, ST')}
              {renderInput('Religion', 'religion', 'select', false, 'Select religion', ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'])}
              {renderInput('Blood Group', 'bloodGroup', 'select', false, 'Select blood group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])}
              {renderInput('Admission Category', 'admissionCategory', 'text', false, 'e.g., Regular, Management')}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact & Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput('Contact Number', 'contactNo', 'tel', false, '10-digit mobile number')}
              {renderInput('Student Email', 'studentEmail', 'email', false, 'student@example.com')}
              {renderInput('Address', 'address', 'text', false, 'Complete address')}
              {renderInput('City', 'city', 'text', false)}
              {renderInput('State', 'state', 'text', false)}
              {renderInput('Pincode', 'pincode', 'text', false, '6-digit pincode')}
              {renderInput('Student Aadhaar Number', 'studentAadharCardNo', 'text', false, '12-digit Aadhaar number')}
              {renderInput('Transaction Number', 'transactionNo', 'text', false, 'Payment transaction number')}
              {renderInput('Registration Charge', 'regnCharge', 'number', false, 'Amount in rupees')}
              {renderInput('Exam Subject', 'examSubject', 'text', false, 'Entrance exam subjects')}
              {renderInput('Payment Status', 'paymentStatus', 'select', false, 'Payment status', ['Pending', 'Paid', 'Partial', 'Failed'])}
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="singleParent"
                  checked={formData.singleParent || false}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Single Parent</span>
              </label>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Parent Details</h3>
            
            {/* Father Details */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Father's Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('Father Name', 'fatherName', 'text', false)}
                {renderInput('Father Mobile Number', 'fatherMobileNo', 'tel', false, '10-digit mobile number')}
                {renderInput('Father Email', 'fatherEmail', 'email', false, 'father@example.com')}
                {renderInput('Father Aadhaar Number', 'fatherAadharCardNo', 'text', false, '12-digit Aadhaar number')}
              </div>
              <div className="mt-4 space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFatherCampusEmployee"
                    checked={formData.isFatherCampusEmployee || false}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Father is Campus Employee</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="smsAlert"
                    checked={formData.smsAlert || false}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Enable SMS Alerts</span>
                </label>
              </div>
            </div>
            
            {/* Mother Details */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Mother's Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('Mother Name', 'motherName', 'text', false)}
                {renderInput('Mother Mobile Number', 'motherMobileNo', 'tel', false, '10-digit mobile number')}
                {renderInput('Mother Aadhaar Number', 'motherAadharCardNo', 'text', false, '12-digit Aadhaar number')}
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Document Upload</h3>
            <p className="text-sm text-gray-600 mb-4">Upload the following documents (PDF, JPG, PNG formats accepted)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFileInput('Caste Certificate', 'casteCertificate')}
              {renderFileInput('Student Aadhaar Card', 'studentAadharCard')}
              {renderFileInput('Father Aadhaar Card', 'fatherAadharCard')}
              {renderFileInput('Mother Aadhaar Card', 'motherAadharCard')}
              {renderFileInput('Previous Class Marksheet', 'previousClassMarksheet')}
              {renderFileInput('Transfer Certificate', 'transferCertificate')}
              {renderFileInput('Birth Certificate', 'studentDateOfBirthCertificate')}
            </div>
            
            {/* Print Form Button */}
            <div className="mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={generatePrintForm}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Form
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only allow submission on the final step
    if (currentStep !== steps.length) {
      return;
    }
    
    const validationErrors = validateCurrentStep();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          formDataToSend.append(key, value);
        } else if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString());
        }
      });

      // Get authentication token
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch('http://localhost:5000/register/student/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Registration failed');
      }

      if (result.success) {
        toast.success(result.message || 'Student registered successfully!');
        
        // Reset form
        setFormData({
          fullName: "",
          formNo: "",
          regnDate: new Date().toISOString().split('T')[0],
          registerForClass: "",
          branchName: "",
          gender: "",
          dob: "",
          category: "",
          religion: "",
          admissionCategory: "",
          bloodGroup: "",
          transactionNo: "",
          singleParent: false,
          contactNo: "",
          studentEmail: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          studentAadharCardNo: "",
          regnCharge: "",
          examSubject: "",
          paymentStatus: "Pending",
          fatherName: "",
          fatherMobileNo: "",
          smsAlert: false,
          fatherEmail: "",
          fatherAadharCardNo: "",
          isFatherCampusEmployee: false,
          motherName: "",
          motherMobileNo: "",
          motherAadharCardNo: "",
          casteCertificate: null,
          studentAadharCard: null,
          fatherAadharCard: null,
          motherAadharCard: null,
          previousClassMarksheet: null,
          transferCertificate: null,
          studentDateOfBirthCertificate: null,
        });
        setCurrentStep(1);
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (err: unknown) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Handle specific error cases
        if (err.message.includes('401')) {
          errorMessage = 'Authentication failed. Please log in again.';
          // Redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          return;
        } else if (err.message.includes('403')) {
          errorMessage = 'You do not have permission to register students.';
        } else if (err.message.includes('400')) {
          errorMessage = err.message.includes('required') 
            ? 'Please fill in all required fields.' 
            : err.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent default form submission behavior
    // Only handle submission through the submit button
  };

  const generatePrintForm = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Registration Form - ${formData.fullName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .form-group { margin-bottom: 15px; }
            .form-group label { font-weight: bold; }
            .form-group span { margin-left: 10px; }
            .section { margin-bottom: 30px; }
            .section h3 { border-bottom: 2px solid #333; padding-bottom: 5px; }
            @media print { 
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Student Registration Form</h1>
            <p>Form No: ${formData.formNo}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h3>Basic Information</h3>
            <div class="form-group"><label>Full Name:</label><span>${formData.fullName || 'N/A'}</span></div>
            <div class="form-group"><label>Form Number:</label><span>${formData.formNo || 'N/A'}</span></div>
            <div class="form-group"><label>Registration Date:</label><span>${formData.regnDate || 'N/A'}</span></div>
            <div class="form-group"><label>Register For Class:</label><span>${formData.registerForClass || 'N/A'}</span></div>
            <div class="form-group"><label>Test Date:</label><span>${formData.testDate || 'N/A'}</span></div>
            <div class="form-group"><label>Branch Name:</label><span>${formData.branchName || 'N/A'}</span></div>
            <div class="form-group"><label>Gender:</label><span>${formData.gender || 'N/A'}</span></div>
            <div class="form-group"><label>Date of Birth:</label><span>${formData.dob || 'N/A'}</span></div>
      </div>
     
          <div class="section">
            <h3>Contact Information</h3>
            <div class="form-group"><label>Contact Number:</label><span>${formData.contactNo || 'N/A'}</span></div>
            <div class="form-group"><label>Student Email:</label><span>${formData.studentEmail || 'N/A'}</span></div>
            <div class="form-group"><label>Address:</label><span>${formData.address || 'N/A'}</span></div>
            <div class="form-group"><label>City:</label><span>${formData.city || 'N/A'}</span></div>
            <div class="form-group"><label>State:</label><span>${formData.state || 'N/A'}</span></div>
            <div class="form-group"><label>Pincode:</label><span>${formData.pincode || 'N/A'}</span></div>
          </div>

          <div class="section">
            <h3>Parent Information</h3>
            <h4>Father's Details</h4>
            <div class="form-group"><label>Father Name:</label><span>${formData.fatherName || 'N/A'}</span></div>
            <div class="form-group"><label>Father Mobile:</label><span>${formData.fatherMobileNo || 'N/A'}</span></div>
            <div class="form-group"><label>Father Email:</label><span>${formData.fatherEmail || 'N/A'}</span></div>
            
            <h4>Mother's Details</h4>
            <div class="form-group"><label>Mother Name:</label><span>${formData.motherName || 'N/A'}</span></div>
            <div class="form-group"><label>Mother Mobile:</label><span>${formData.motherMobileNo || 'N/A'}</span></div>
          </div>

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()">Print Form</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-full mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-6 p-6 max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-blue-700 mb-4">
            Student Registration
          </h1>
          
          {/* Progress Bar */}
          <div className="flex justify-between items-center mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                  step.id <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.id <= currentStep ? '✓' : step.id}
          </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{step.title}</span>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-1 mx-4 ${
                    step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
            )}
          </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
      </div>
          )}

          <form onSubmit={handleFormSubmit}>
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
        <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
        </button>
              
              <div className="space-x-4">
                {currentStep < steps.length ? (
        <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
                    {loading ? 'Registering...' : 'Register Student'}
          </button>
        )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration;
