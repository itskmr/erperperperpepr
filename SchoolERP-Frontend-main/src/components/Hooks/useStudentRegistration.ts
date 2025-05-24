import { useState } from 'react';

interface Address {
  houseNo: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
}

interface Parent {
  name: string;
  qualification: string;
  occupation: string;
  contactNumber: string;
  email: string;
  aadhaarNo: string;
  annualIncome: string;
  isCampusEmployee: string;
}

interface Guardian {
  name: string;
  address: string;
  contactNumber: string;
}

interface Documents {
  studentImage: File | null;
  fatherImage: File | null;
  motherImage: File | null;
  guardianImage: File | null;
  signature: File | null;
  fatherAadhar: File | null;
  motherAadhar: File | null;
  birthCertificate: File | null;
  migrationCertificate: File | null;
  aadhaarCard: File | null;
}

interface Academic {
  registrationNo: string;
}

interface Session {
  group: string;
  stream: string;
  class: string;
  section: string;
  rollNo: string;
  semester: string;
  feeGroup: string;
  house: string;
}

interface Transport {
  mode: string;
  area: string;
  stand: string;
  route: string;
  driver: string;
}

interface LastEducation {
  school: string;
  address: string;
  tcDate: string;
  prevClass: string;
  percentage: string;
  attendance: string;
  extraActivity: string;
}

interface Other {
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
}

interface StudentFormData {
  branchName: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  nationality: string;
  religion: string;
  category: string;
  caste: string;
  aadhaarNumber: string;
  mobileNumber: string;
  email: string;
  emergencyContact: string;
  admissionNo: string;
  studentId: string;
  rollNumber: string;
  className: string;
  section: string;
  admissionDate: string;
  previousSchool: string;
  address: Address;
  father: Parent;
  mother: Parent;
  guardian: Guardian;
  academic: Academic;
  admitSession: Session;
  currentSession: Session;
  transport: Transport;
  documents: Documents;
  lastEducation: LastEducation;
  other: Other;
}

interface Step {
  id: number;
  title: string;
  icon: string;
}

export const useStudentRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>({
    branchName: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    nationality: '',
    religion: '',
    category: '',
    caste: '',
    aadhaarNumber: '',
    mobileNumber: '',
    email: '',
    emergencyContact: '',
    admissionNo: '',
    studentId: '',
    rollNumber: '',
    className: '',
    section: '',
    admissionDate: new Date().toISOString().split('T')[0],
    previousSchool: '',
    address: {
      houseNo: '',
      street: '',
      city: '',
      state: '',
      pinCode: ''
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
      contactNumber: ''
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
      driver: ''
    },
    documents: {
      studentImage: null,
      fatherImage: null,
      motherImage: null,
      guardianImage: null,
      signature: null,
      fatherAadhar: null,
      motherAadhar: null,
      birthCertificate: null,
      migrationCertificate: null,
      aadhaarCard: null
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
  });

  const steps: Step[] = [
    { id: 1, title: 'Basic Details', icon: '👤' },
    { id: 2, title: 'Academic', icon: '📚' },
    { id: 3, title: 'Contact', icon: '📱' },
    { id: 4, title: 'Address', icon: '🏠' },
    { id: 5, title: 'Parents', icon: '👨‍👩‍👦' },
    { id: 6, title: 'Documents', icon: '📄' },
    { id: 7, title: 'Other', icon: '✅' }
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof StudentFormData] as Record<string, any>),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    if (error) setError('');
    if (success) setSuccess(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Documents) => {
    const file = e.target.files?.[0] || null;
    
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file
      }
    }));
    
    if (error) setError('');
    if (success) setSuccess(false);
  };

  const validateCurrentStep = () => {
    switch(currentStep) {
      case 1:
        if (!formData.fullName.trim()) return "Full name is required";
        if (!formData.dateOfBirth) return "Date of birth is required";
        if (!formData.gender) return "Gender is required";
        if (!formData.admissionNo.trim()) return "Admission number is required";
        break;
      case 2:
        if (!formData.admitSession.class.trim() && !formData.className.trim()) 
          return "Class is required";
        break;
      case 3:
        if (!formData.mobileNumber.trim()) return "Mobile number is required";
        break;
      case 4:
        if (!formData.address.city.trim()) return "City is required";
        if (!formData.address.state.trim()) return "State is required";
        break;
      case 5:
        if (!formData.father.name.trim()) return "Father's name is required";
        if (!formData.mother.name.trim()) return "Mother's name is required";
        break;
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'documents') {
          if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              formDataToSend.append(`${key}.${nestedKey}`, String(nestedValue));
            });
          } else {
            formDataToSend.append(key, String(value));
          }
        }
      });
      
      // Add document files
      Object.entries(formData.documents).forEach(([key, file]) => {
        if (file) {
          formDataToSend.append(`documents.${key}`, file);
        }
      });
      
      // Add school ID
      formDataToSend.append('schoolId', '1');  // Use the appropriate school ID

      console.log("Sending student data to API");
      
      // Make the API call
      const response = await fetch('http://localhost:5000/api/students', {
        method: 'POST',
        body: formDataToSend,
        // Don't set Content-Type header when sending FormData
      });

      // Parse response even if it's an error
      const result = await response.json().catch(err => {
        console.error("Error parsing response:", err);
        return { message: "Invalid server response" };
      });

      console.log("Server response:", response.status, result);

      if (!response.ok) {
        // Extract detailed error message if available
        const errorMessage = 
          result.message || 
          result.error || 
          (result.errors && Array.isArray(result.errors) ? 
            result.errors.map((e: any) => e.msg).join(", ") :
            `Server error (${response.status}): Failed to register student`);
        
        throw new Error(errorMessage);
      }

      console.log("Student registered successfully:", result);
      setSuccess(true);
      
      // Reset form after successful submission or redirect as needed
      
    } catch (error) {
      console.error("Form submission error:", error);
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };
  
  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return {
    currentStep,
    formData,
    isSubmitting,
    error,
    success,
    steps,
    handleChange,
    handleFileChange,
    handleSubmit,
    nextStep,
    prevStep
  };
};