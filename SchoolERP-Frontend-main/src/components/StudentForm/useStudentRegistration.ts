import { useState, ChangeEvent, FormEvent, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  StudentFormData, 
  Documents, 
  UseStudentRegistrationReturn, 
  Step 
} from './StudentFormTypes';
import { validateStep, hasValidationErrors } from './StudentFormValidation';
import { STUDENT_API } from '../../config/api';
import { apiGet, apiPostFormData } from '../../utils/authApi';

interface TransportRoute {
  id: string;
  name: string;
  fromLocation: string;
  toLocation: string;
}

interface Driver {
  id: string;
  name: string;
  contactNumber: string;
}

interface Bus {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  capacity: number;
}

/**
 * Custom hook for managing student registration form state and validation
 */
export const useStudentRegistration = (): UseStudentRegistrationReturn => {
  const navigate = useNavigate();

  // Form steps
  const steps: Step[] = [
    { id: 1, title: 'Basic Info', icon: '👤' },
    { id: 2, title: 'Academic', icon: '📚' },
    { id: 3, title: 'Contact', icon: '📞' },
    { id: 4, title: 'Address', icon: '🏠' },
    { id: 5, title: 'Parents', icon: '👨‍👩‍👧‍👦' },
    { id: 6, title: 'Documents', icon: '📄' },
    { id: 7, title: 'Others', icon: '📝' }
  ];

  // Initial form state
  const initialFormData: StudentFormData = {
    branchName: '',
    fullName: '',
    admissionNo: '',
    email: '',
    emailPassword: '',
    penNo: '',
    apaarId: '',
    studentId: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    bloodGroup: '',
    nationality: 'Indian',
    religion: '',
    category: '',
    caste: '',
    height: '',
    weight: '',
    aadhaarNumber: '',
    mobileNumber: '',
    emergencyContact: '',
    loginEnabled: false,
    schoolId: 2, 
    address: {
      houseNo: '',
      street: '',
      city: '',
      state: '',
      pinCode: '',
      permanentHouseNo: '',
      permanentStreet: '',
      permanentCity: '',
      permanentState: '',
      permanentPinCode: '',
      sameAsPresentAddress: false
    },
    father: {
      name: '',
      qualification: '',
      occupation: '',
      contactNumber: '',
      email: '',
      aadhaarNo: '',
      annualIncome: '',
      isCampusEmployee: 'no'
    },
    mother: {
      name: '',
      qualification: '',
      occupation: '',
      contactNumber: '',
      email: '',
      aadhaarNo: '',
      annualIncome: '',
      isCampusEmployee: 'no'
    },
    guardian: {
      name: '',
      address: '',
      contactNumber: '',
      email: '',
      aadhaarNo: '',
      occupation: '',
      annualIncome: ''
    },
    academic: {
      registrationNo: ''
    },
    admitSession: {
      group: '',
      stream: '',
      class: '',
      section: '',
      rollNo: '',
      semester: '',
      feeGroup: '',
      house: ''
    },
    currentSession: {
      group: '',
      stream: '',
      class: '',
      section: '',
      rollNo: '',
      semester: '',
      feeGroup: '',
      house: ''
    },
    transport: {
      mode: '',
      area: '',
      stand: '',
      route: '',
      driver: '',
      pickupLocation: '',
      dropLocation: '',
      busId: '',
      pickupPoint: ''
    },
    documents: {
      studentImage: null,
      fatherImage: null,
      motherImage: null,
      guardianImage: null,
      signature: null,
      parentSignature: null,
      fatherAadhar: null,
      motherAadhar: null,
      birthCertificate: null,
      migrationCertificate: null,
      aadhaarCard: null,
      familyId: null,
      affidavitCertificate: null,
      incomeCertificate: null,
      addressProof1: null,
      addressProof2: null,
      transferCertificate: null,
      markSheet: null,
      fatherSignature: null,
      motherSignature: null,
      guardianSignature: null
    },
    lastEducation: {
      school: '',
      address: '',
      tcDate: '',
      prevClass: '',
      percentage: '',
      attendance: '',
      extraActivity: ''
    },
    other: {
      belongToBPL: 'no',
      minority: 'no',
      disability: '',
      accountNo: '',
      bank: '',
      ifscCode: '',
      medium: '',
      lastYearResult: '',
      singleParent: 'no',
      onlyChild: 'no',
      onlyGirlChild: 'no',
      adoptedChild: 'no',
      siblingAdmissionNo: '',
      transferCase: 'no',
      livingWith: '',
      motherTongue: '',
      admissionType: 'new',
      udiseNo: ''
    }
  };

  // Form state management
  const [formData, setFormData] = useState<StudentFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);

  // Fetch transport data
  const fetchTransportData = useCallback(async () => {
    try {
      const [routesData, driversData, busesData] = await Promise.all([
        apiGet<TransportRoute[]>(`/transport/routes`),
        apiGet<Driver[]>(`/transport/drivers`),
        apiGet<Bus[]>(`/transport/buses`)
      ]);

      // Handle the response - the apiGet function already extracts the data
      if (Array.isArray(routesData)) {
        setTransportRoutes(routesData);
      } else if (routesData && typeof routesData === 'object' && 'length' in routesData) {
        setTransportRoutes(routesData as TransportRoute[]);
      }

      if (Array.isArray(driversData)) {
        setDrivers(driversData);
      } else if (driversData && typeof driversData === 'object' && 'length' in driversData) {
        setDrivers(driversData as Driver[]);
      }

      if (Array.isArray(busesData)) {
        setBuses(busesData);
      } else if (busesData && typeof busesData === 'object' && 'length' in busesData) {
        setBuses(busesData as Bus[]);
      }
    } catch (error) {
      console.error('Error fetching transport data:', error);
    }
  }, []);

  // Fetch transport data on mount
  useEffect(() => {
    fetchTransportData();
  }, [fetchTransportData]);

  // Handle form field changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    
    // Special handling for checkbox inputs
    const isCheckbox = type === 'checkbox';
    const checkboxValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;
    
    let updatedFormData;
    
    // Update form data (handle nested properties)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      updatedFormData = {
        ...formData,
        [parent]: {
          ...(formData[parent as keyof StudentFormData] as Record<string, unknown>),
          [child]: isCheckbox ? checkboxValue : value
        }
      };
    } else {
      updatedFormData = {
        ...formData,
        [name]: isCheckbox ? checkboxValue : value
      };
    }
    
    setFormData(updatedFormData);
    
    // Clear error and success when form is changed
    if (error) setError('');
    if (success) setSuccess(false);
    
    // Clear validation error when field is changed
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Handle file changes
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, documentType: keyof Documents): void => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: file
      }
    }));
    
    // Clear error and success when form is changed
    if (error) setError('');
    if (success) setSuccess(false);
  };

  // Step navigation with validation
  const nextStep = (): void => {
    // Validate current step
    const errors = validateStep(currentStep, formData);
    
    if (Object.keys(errors).length === 0) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
      setValidationErrors({});
    } else {
      setValidationErrors(errors);
      setError('Please fix the validation errors before proceeding.');
    }
  };

  const prevStep = (): void => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setValidationErrors({});
    setError('');
  };

  // Form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Validate all steps before submitting
    const allErrors = { ...validationErrors };
    for (let step = 1; step <= steps.length; step++) {
      const stepErrors = validateStep(step, formData);
      Object.assign(allErrors, stepErrors);
    }
    
    setValidationErrors(allErrors);
    
    if (hasValidationErrors(allErrors)) {
      setError("Please fix all validation errors before submitting.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Get school ID from authenticated user context
      const getSchoolIdFromAuth = (): number | null => {
        // First try to get from JWT token
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.schoolId) return payload.schoolId;
          } catch {
            console.warn('Failed to decode token for school ID');
          }
        }
        
        // Then try from user data
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            return user.schoolId || user.id; // For school users, their ID is the school ID
          } catch {
            console.warn('Failed to parse user data for school ID');
          }
        }
        
        return null;
      };
      
      const schoolId = getSchoolIdFromAuth();
      if (!schoolId) {
        setError('School context not found. Please login again.');
        setIsSubmitting(false);
        return;
      }

      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add all text fields, ensuring proper nesting
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'documents' && key !== 'schoolId') { // Exclude schoolId from form data processing
          if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              if (!(key === 'address' && nestedKey === 'sameAsPresentAddress')) {
                const valueToSend = nestedValue === null || nestedValue === undefined 
                  ? '' 
                  : String(nestedValue);
                formDataToSend.append(`${key}.${nestedKey}`, valueToSend);
              }
            });
          } else {
            const valueToSend = value === null || value === undefined 
              ? '' 
              : String(value);
            formDataToSend.append(key, valueToSend);
          }
        }
      });
      
      // Add document files - with the correct field names expected by backend
      Object.entries(formData.documents).forEach(([key, file]) => {
        if (file instanceof File) {
          // Send the file with the documents. prefix that the backend expects
          formDataToSend.append(`documents.${key}`, file);
        }
      });
      
      // Add school ID from authenticated context
      formDataToSend.append('schoolId', String(schoolId));

      console.log("Sending student data to API");
      console.log("Form data keys:", Array.from(formDataToSend.keys()));
      console.log("Using school ID:", schoolId);
      
      const result = await apiPostFormData(STUDENT_API.CREATE, formDataToSend);
      
      console.log("Student registered successfully:", result);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Navigate to manage students page after successful submission
      setTimeout(() => {
        navigate('/school/students/manage-students');
      }, 2000); // 2 second delay to show success message
      
    } catch (error) {
      console.error("Form submission error:", error);
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate age whenever date of birth changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      calculateAge();
    }
  }, [formData.dateOfBirth]);
  
  // Copy present address to permanent address when sameAsPresentAddress is true
  useEffect(() => {
    if (formData.address.sameAsPresentAddress) {
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          permanentHouseNo: prev.address.houseNo,
          permanentStreet: prev.address.street,
          permanentCity: prev.address.city,
          permanentState: prev.address.state,
          permanentPinCode: prev.address.pinCode
        }
      }));
    }
  }, [formData.address.sameAsPresentAddress, formData.address.houseNo, 
      formData.address.street, formData.address.city, formData.address.state, 
      formData.address.pinCode]);

  // Calculate age based on date of birth
  const calculateAge = () => {
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      
      // Adjust age if birthday hasn't occurred yet this year
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      if (age >= 0) {
        setFormData(prev => ({
          ...prev,
          age: age.toString()
        }));
      }
    }
  };

  return {
    currentStep,
    formData,
    isSubmitting,
    error,
    success,
    steps,
    validationErrors,
    transportRoutes,
    drivers,
    buses,
    handleChange,
    handleFileChange,
    handleSubmit,
    nextStep,
    prevStep
  };
}; 