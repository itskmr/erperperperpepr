import { useState, ChangeEvent, FormEvent } from 'react';

// Define Documents type based on schema document path fields
export type Documents = {
  studentImage: File | null;
  fatherImage: File | null;
  motherImage: File | null;
  guardianImage: File | null;
  signature: File | null;
  parentSignature: File | null;
  fatherAadhar: File | null;
  motherAadhar: File | null;
  birthCertificate: File | null;
  migrationCertificate: File | null;
  aadhaarCard: File | null;
  familyId: File | null;
  affidavitCertificate: File | null;
  incomeCertificate: File | null;
  addressProof1: File | null;
  addressProof2: File | null;
  transferCertificate: File | null;
  markSheet: File | null;
  fatherSignature: File | null;
  motherSignature: File | null;
  guardianSignature: File | null;
};

// Define validation patterns
const VALIDATION_PATTERNS = {
  TEXT_ONLY: /^[A-Za-z\s]+$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[0-9]{10}$/,
  NUMERIC: /^[0-9]+$/,
  ALPHANUMERIC: /^[A-Za-z0-9\s]+$/,
  AADHAAR: /^[0-9]{12}$/,
  PINCODE: /^[0-9]{6}$/,
  IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  ACCOUNT_NUMBER: /^[0-9]{9,18}$/,
};

// Define StudentFormData type
export interface StudentFormData {
  branchName: string;
  admissionNo: string;
  firstName: string;
  middleName: string;
  lastName: string;
  admissionDate: string;
  studentId: string;
  dateOfBirth: string;
  religion: string;
  gender: string;
  bloodGroup: string;
  caste: string;
  admitSession: {
    group: string;
    stream: string;
    class: string;
    section: string;
    rollNo: string;
    semester: string;
    feeGroup: string;
    house: string;
  };
  currentSession: {
    group: string;
    stream: string;
    class: string;
    section: string;
    rollNo: string;
    semester: string;
    feeGroup: string;
    house: string;
  };
  className: string;
  section: string;
  rollNumber: string;
  academic: {
    registrationNo: string;
  };
  previousSchool: string;
  mobileNumber: string;
  email: string;
  emergencyContact: string;
  transport: {
    mode: string;
    area: string;
    stand: string;
    route: string;
    driver: string;
  };
  address: {
    street: string;
    houseNo: string;
    city: string;
    state: string;
    pinCode: string;
  };
  father: {
    name: string;
    qualification: string;
    occupation: string;
    email: string;
    contactNumber: string;
    aadhaarNo: string;
    annualIncome: string;
    isCampusEmployee: string;
  };
  mother: {
    name: string;
    qualification: string;
    occupation: string;
    email: string;
    contactNumber: string;
    aadhaarNo: string;
    annualIncome: string;
    isCampusEmployee: string;
  };
  guardian: {
    name: string;
    address: string;
    contactNumber: string;
  };
  documents: Documents;
  aadhaarNumber: string;
  nationality: string;
  other: {
    belongToBPL: string;
    minority: string;
    disability: string;
    accountNo: string;
    bank: string;
    ifscCode: string;
    medium: string;
    lastYearResult: string;
    singleParent: string;
    onlyChild: string;
    onlyGirlChild: string;
    adoptedChild: string;
    siblingAdmissionNo: string;
    transferCase: string;
    livingWith: string;
    motherTongue: string;
    admissionType: string;
    udiseNo: string;
  };
  lastEducation: {
    school: string;
    address: string;
    tcDate: string;
    prevClass: string;
    percentage: string;
    attendance: string;
    extraActivity: string;
  };
}

// Define return type for the hook
export interface UseStudentRegistrationReturn {
  currentStep: number;
  formData: StudentFormData;
  isSubmitting: boolean;
  error: string;
  success: boolean;
  steps: Array<{ id: number; title: string; icon: string }>;
  validationErrors: Record<string, string>;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>, documentType: keyof Documents) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export const useStudentRegistration = (): UseStudentRegistrationReturn => {
  // Form steps
  const steps = [
    { id: 1, title: 'Basic Info', icon: '👤' },
    { id: 2, title: 'Academic', icon: '🎓' },
    { id: 3, title: 'Contact', icon: '📱' },
    { id: 4, title: 'Address', icon: '🏠' },
    { id: 5, title: 'Parents', icon: '👪' },
    { id: 6, title: 'Documents', icon: '📄' },
    { id: 7, title: 'Other', icon: 'ℹ️' },
  ];

  // Initial form state
  const initialFormData: StudentFormData = {
    // Basic information
    branchName: '',
    admissionNo: '',
    firstName: '',
    middleName: '',
    lastName: '',
    admissionDate: '',
    studentId: '',
    dateOfBirth: '',
    religion: '',
    gender: '',
    bloodGroup: '',
    caste: '',
    
    // Academic information
    admitSession: {
      group: '',
      stream: '',
      class: '',
      section: '',
      rollNo: '',
      semester: '',
      feeGroup: '',
      house: '',
    },
    currentSession: {
      group: '',
      stream: '',
      class: '',
      section: '',
      rollNo: '',
      semester: '',
      feeGroup: '',
      house: '',
    },
    className: '',
    section: '',
    rollNumber: '',
    academic: {
      registrationNo: '',
    },
    previousSchool: '',
    
    // Contact & Transport
    mobileNumber: '',
    email: '',
    emergencyContact: '',
    transport: {
      mode: '',
      area: '',
      stand: '',
      route: '',
      driver: '',
    },
    
    // Address
    address: {
      street: '',
      houseNo: '',
      city: '',
      state: '',
      pinCode: '',
    },
    
    // Parents & Guardian
    father: {
      name: '',
      qualification: '',
      occupation: '',
      email: '',
      contactNumber: '',
      aadhaarNo: '',
      annualIncome: '',
      isCampusEmployee: 'no',
    },
    mother: {
      name: '',
      qualification: '',
      occupation: '',
      email: '',
      contactNumber: '',
      aadhaarNo: '',
      annualIncome: '',
      isCampusEmployee: 'no',
    },
    guardian: {
      name: '',
      address: '',
      contactNumber: '',
    },
    
    // Documents
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
      guardianSignature: null,
    },
    
    // Other details
    aadhaarNumber: '',
    nationality: 'Indian',
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
      udiseNo: '',
    },
    lastEducation: {
      school: '',
      address: '',
      tcDate: '',
      prevClass: '',
      percentage: '',
      attendance: '',
      extraActivity: '',
    },
  };

  // Form state management
  const [formData, setFormData] = useState<StudentFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validate form fields based on field type
  const validateField = (name: string, value: string): string | null => {
    // Skip validation for empty optional fields
    if (value === '' && !isRequiredField(name)) {
      return null;
    }

    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      // Skip validation for document fields
      if (parent === 'documents' || child === 'documents') {
        return null;
      }
    }

    // Validation based on field name
    if (name === 'firstName' || name === 'middleName' || name === 'lastName' || 
        name === 'father.name' || name === 'mother.name' || name === 'guardian.name' ||
        name === 'religion' || name === 'caste') {
      if (value && !VALIDATION_PATTERNS.TEXT_ONLY.test(value)) {
        return 'Please enter text only (no numbers or special characters)';
      }
    } else if (name === 'email' || name === 'father.email' || name === 'mother.email') {
      if (value && !VALIDATION_PATTERNS.EMAIL.test(value)) {
        return 'Please enter a valid email address';
      }
    } else if (name === 'mobileNumber' || name === 'father.contactNumber' || 
              name === 'mother.contactNumber' || name === 'guardian.contactNumber' ||
              name === 'emergencyContact') {
      if (value && !VALIDATION_PATTERNS.PHONE.test(value)) {
        return 'Please enter a valid 10-digit phone number';
      }
    } else if (name === 'aadhaarNumber' || name === 'father.aadhaarNo' || name === 'mother.aadhaarNo') {
      if (value && !VALIDATION_PATTERNS.AADHAAR.test(value)) {
        return 'Please enter a valid 12-digit Aadhaar number';
      }
    } else if (name === 'address.pinCode') {
      if (value && !VALIDATION_PATTERNS.PINCODE.test(value)) {
        return 'Please enter a valid 6-digit PIN code';
      }
    } else if (name === 'other.ifscCode') {
      if (value && !VALIDATION_PATTERNS.IFSC.test(value)) {
        return 'Please enter a valid IFSC code (e.g., ABCD0123456)';
      }
    } else if (name === 'other.accountNo') {
      if (value && !VALIDATION_PATTERNS.ACCOUNT_NUMBER.test(value)) {
        return 'Please enter a valid account number (9-18 digits)';
      }
    } else if (name === 'admissionNo' || name === 'studentId' || 
              name === 'rollNumber' || name === 'admitSession.rollNo' || 
              name === 'currentSession.rollNo') {
      if (value && !VALIDATION_PATTERNS.ALPHANUMERIC.test(value)) {
        return 'Please enter only alphanumeric characters';
      }
    } else if (name === 'father.annualIncome' || name === 'mother.annualIncome' ||
              name === 'lastEducation.percentage' || name === 'lastEducation.attendance') {
      if (value && !VALIDATION_PATTERNS.NUMERIC.test(value)) {
        return 'Please enter numbers only';
      }
    } else if (name === 'address.city' || name === 'address.state') {
      if (value && !VALIDATION_PATTERNS.TEXT_ONLY.test(value)) {
        return 'Please enter text only';
      }
    }

    return null;
  };

  // Check if a field is required
  const isRequiredField = (name: string): boolean => {
    const requiredFields = [
      'admissionNo', 'firstName', 'lastName', 'admissionDate', 
      'dateOfBirth', 'gender', 'className', 'mobileNumber',
      'address.city', 'address.state', 'father.name', 'mother.name'
    ];
    return requiredFields.includes(name);
  };

  // Handle form field changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    
    // Validate the field
    const errorMessage = validateField(name, value);
    
    // Update validation errors - copy existing errors and update the specific field
    setValidationErrors(prev => ({
      ...prev,
      [name]: errorMessage || '' // Convert null to empty string
    }));
    
    // Update form data (handle nested properties)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        // Create a deep copy to ensure state updates properly
        const newState = { ...prev };
        if (!newState[parent]) {
          newState[parent] = {};
        }
        newState[parent] = {
          ...newState[parent],
          [child]: value
        };
        return newState;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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
  };

  // Validate current step
  const validateStep = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    // Fields to validate based on current step
    const fieldsToValidate: Record<number, string[]> = {
      1: ['branchName', 'admissionNo', 'firstName', 'middleName', 'lastName', 
          'admissionDate', 'studentId', 'dateOfBirth', 'religion', 'gender', 
          'bloodGroup', 'caste'],
      2: ['className', 'section', 'rollNumber', 'admitSession.class'],
      3: ['mobileNumber', 'email', 'emergencyContact'],
      4: ['address.street', 'address.city', 'address.state', 'address.pinCode'],
      5: ['father.name', 'father.email', 'father.contactNumber', 'mother.name', 
          'mother.email', 'mother.contactNumber', 'guardian.name', 'guardian.contactNumber'],
      6: [], // Document upload step - no text validation
      7: ['aadhaarNumber', 'nationality', 'other.accountNo', 'other.ifscCode']
    };

    // Check required fields first
    (fieldsToValidate[currentStep] || []).forEach(field => {
      let value: string;
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        value = formData[parent][child];
      } else {
        value = formData[field];
      }
      
      // Check if field is required and empty
      if (isRequiredField(field) && (value === '' || value === null)) {
        errors[field] = 'This field is required';
        isValid = false;
      } else {
        // Validate field format
        const error = validateField(field, value);
        if (error) {
          errors[field] = error;
          isValid = false;
        }
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  // Step navigation
  const nextStep = (): void => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = (): void => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Validate all fields before submission
    if (!validateStep()) {
      setError('Please fix the validation errors before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Here you would normally send the data to your backend API
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      // Reset form or redirect user as needed
    } catch {
      setError('Failed to submit the form. Please try again later.');
    } finally {
      setIsSubmitting(false);
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
    handleChange,
    handleFileChange,
    handleSubmit,
    nextStep,
    prevStep
  };
}; 