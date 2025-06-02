import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, X, Printer } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { generateAdmissionFormPrint } from '../../utils/printUtils';
import { ApiError } from '../../utils/authApi';

// Student interface
interface Student {
  id: string;
  fullName: string;
  admissionNo: string;
  penNo?: string;
  apaarId?: string; // Optional field
  dateOfBirth?: string;
  age?: number;
  gender: string;
  bloodGroup?: string;
  religion?: string;
  category?: string;
  caste?: string;
  nationality?: string;
  aadhaarNumber?: string;
  mobileNumber?: string;
  email?: string;
  emailPassword?: string; // Added email password
  emergencyContact?: string;
  
  // Added image fields
  studentImagePath?: string;
  fatherImagePath?: string;
  motherImagePath?: string;
  guardianImagePath?: string;
  signaturePath?: string;
  parentSignaturePath?: string;
  fatherAadharPath?: string;
  motherAadharPath?: string;
  birthCertificatePath?: string;
  migrationCertificatePath?: string;
  aadhaarCardPath?: string;
  familyIdPath?: string;
  affidavitCertificatePath?: string;
  incomeCertificatePath?: string;
  addressProof1Path?: string;
  addressProof2Path?: string;
  transferCertificatePath?: string;
  markSheetPath?: string;
  fatherSignaturePath?: string;
  motherSignaturePath?: string;
  guardianSignaturePath?: string;
  
  address?: {
    houseNo?: string;
    street?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    permanentHouseNo?: string;
    permanentStreet?: string;
    permanentCity?: string;
    permanentState?: string;
    permanentPinCode?: string;
    sameAsPresentAddress: boolean;
  };
  admitSession?: {
    group?: string;
    stream?: string;
    class?: string;
    section?: string;
    rollNo?: string;
    semester?: string;
    feeGroup?: string;
    house?: string;
  };
  currentSession?: {
    group?: string;
    stream?: string;
    class?: string;
    section?: string;
    rollNo?: string;
    semester?: string;
    feeGroup?: string;
    house?: string;
  };
  transport?: {
    mode?: string;
    area?: string;
    stand?: string;
    route?: string;
    driver?: string;
    pickupLocation?: string;
    dropLocation?: string;
  };
  father?: {
    name?: string;
    email?: string;
    emailPassword?: string;
    qualification?: string;
    occupation?: string;
    contactNumber?: string;
    aadhaarNo?: string;
    annualIncome?: string;
    isCampusEmployee: boolean;
  };
  mother?: {
    name?: string;
    email?: string;
    emailPassword?: string;
    qualification?: string;
    occupation?: string;
    contactNumber?: string;
    aadhaarNo?: string;
    annualIncome?: string;
    isCampusEmployee: boolean;
  };
  guardian?: {
    name?: string;
    address?: string;
    contactNumber?: string;
    email?: string;
    aadhaarNo?: string;
    occupation?: string;
    annualIncome?: string;
  };
  other?: {
    belongToBPL?: string;
    minority?: string;
    disability?: string;
    accountNo?: string;
    bank?: string;
    ifscCode?: string;
    medium?: string;
    lastYearResult?: string;
    singleParent?: string;
    onlyChild?: string;
    onlyGirlChild?: string;
    adoptedChild?: string;
    siblingAdmissionNo?: string;
    transferCase?: string;
    livingWith?: string;
    motherTongue?: string;
    admissionType?: string;
    udiseNo?: string;
  };
  lastEducation?: {
    school?: string;
    address?: string;
    tcDate?: string;
    prevClass?: string;
    percentage?: string;
    attendance?: string;
    extraActivity?: string;
  };
}

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

// Constants
const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11 (Science)', 'Class 11 (Commerce)', 'Class 11 (Arts)',
  'Class 12 (Science)', 'Class 12 (Commerce)', 'Class 12 (Arts)'
];

const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CATEGORIES = ['General', 'EWS', 'OBC', 'BC', 'SC', 'ST'];
const GENDERS = ['Male', 'Female', 'Other'];
const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const StudentEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State
  const [formData, setFormData] = useState<Student>({} as Student);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  
  // State to track password changes - only store new passwords
  const [passwordUpdates, setPasswordUpdates] = useState<{
    emailPassword?: string;
    [key: string]: string | undefined;
  }>({});

  const totalSteps = 7;

  // Steps configuration
  const steps = [
    { id: 1, title: 'Basic Info', icon: '👤' },
    { id: 2, title: 'Academic', icon: '🎓' },
    { id: 3, title: 'Contact', icon: '📱' },
    { id: 4, title: 'Address & Transport', icon: '🏠' },
    { id: 5, title: 'Parents & Guardian', icon: '👪' },
    { id: 6, title: 'Previous Education', icon: '📚' },
    { id: 7, title: 'Other Details', icon: 'ℹ️' },
  ];

  // Toast notification
  const showToast = (type: 'success' | 'error', message: string) => {
    toast[type](message, {
      duration: 3000,
      style: {
        background: type === 'success' ? '#2563EB' : '#EF4444',
        color: '#ffffff',
        padding: '16px',
        borderRadius: '8px',
      },
    });
  };

  // Fetch transport data
  const fetchTransportData = useCallback(async () => {
    try {
      const [routesResponse, driversResponse] = await Promise.all([
        axios.get(`${API_URL}/transport/routes`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/transport/drivers`, { headers: getAuthHeaders() })
      ]);

      if (routesResponse.data?.success) {
        setTransportRoutes(routesResponse.data.data || []);
      }

      if (driversResponse.data?.success) {
        setDrivers(driversResponse.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching transport data:', error);
    }
  }, []);

  // Fetch student data
  const fetchStudentData = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      console.log(`Fetching student data for ID: ${id}`);
      const response = await axios.get(`${API_URL}/students/${id}`, { headers: getAuthHeaders() });
      
      console.log('API Response:', response.data);
      
      if (response.data?.success && response.data?.data) {
        const studentData = response.data.data;
        
        // Map the student data to form structure with proper null checks
        const mappedData: Student = {
          id: studentData.id || '',
          fullName: studentData.fullName || '',
          admissionNo: studentData.admissionNo || '',
          email: studentData.email || '',
          emailPassword: studentData.emailPassword || '',
          dateOfBirth: studentData.dateOfBirth ? studentData.dateOfBirth.split('T')[0] : '',
          age: studentData.age || 0,
          gender: studentData.gender || '',
          bloodGroup: studentData.bloodGroup || '',
          nationality: studentData.nationality || '',
          religion: studentData.religion || '',
          category: studentData.category || '',
          caste: studentData.caste || '',
          aadhaarNumber: studentData.aadhaarNumber || '',
          apaarId: studentData.apaarId || '',
          penNo: studentData.penNo || '',
          mobileNumber: studentData.mobileNumber || '',
          emergencyContact: studentData.emergencyContact || '',
          
          // Address information - handle flat structure from database
          address: {
            houseNo: studentData.houseNo || '',
            street: studentData.street || '',
            city: studentData.city || '',
            state: studentData.state || '',
            pinCode: studentData.pinCode || '',
            permanentHouseNo: studentData.permanentHouseNo || '',
            permanentStreet: studentData.permanentStreet || '',
            permanentCity: studentData.permanentCity || '',
            permanentState: studentData.permanentState || '',
            permanentPinCode: studentData.permanentPinCode || '',
            sameAsPresentAddress: studentData.sameAsPresentAddress || false
          },
          
          // Parent information - handle flat structure and nested parentInfo
          father: {
            name: studentData.fatherName || '',
            email: studentData.fatherEmail || '',
            emailPassword: studentData.fatherEmailPassword || '',
            qualification: studentData.parentInfo?.fatherQualification || '',
            occupation: studentData.parentInfo?.fatherOccupation || '',
            contactNumber: studentData.parentInfo?.fatherContact || '',
            aadhaarNo: studentData.parentInfo?.fatherAadhaarNo || '',
            annualIncome: studentData.parentInfo?.fatherAnnualIncome || '',
            isCampusEmployee: studentData.parentInfo?.fatherIsCampusEmployee === 'yes'
          },
          
          mother: {
            name: studentData.motherName || '',
            email: studentData.motherEmail || '',
            emailPassword: studentData.motherEmailPassword || '',
            qualification: studentData.parentInfo?.motherQualification || '',
            occupation: studentData.parentInfo?.motherOccupation || '',
            contactNumber: studentData.parentInfo?.motherContact || '',
            aadhaarNo: studentData.parentInfo?.motherAadhaarNo || '',
            annualIncome: studentData.parentInfo?.motherAnnualIncome || '',
            isCampusEmployee: studentData.parentInfo?.motherIsCampusEmployee === 'yes'
          },
          
          guardian: {
            name: studentData.parentInfo?.guardianName || '',
            address: studentData.parentInfo?.guardianAddress || '',
            contactNumber: studentData.parentInfo?.guardianContact || '',
            email: studentData.parentInfo?.guardianEmail || '',
            aadhaarNo: studentData.parentInfo?.guardianAadhaarNo || '',
            occupation: studentData.parentInfo?.guardianOccupation || '',
            annualIncome: studentData.parentInfo?.guardianAnnualIncome || ''
          },
          
          // Session information
          admitSession: {
            class: studentData.sessionInfo?.admitClass || '',
            section: studentData.sessionInfo?.admitSection || '',
            rollNo: studentData.sessionInfo?.admitRollNo || '',
            group: studentData.sessionInfo?.admitGroup || '',
            stream: studentData.sessionInfo?.admitStream || '',
            semester: studentData.sessionInfo?.admitSemester || '',
            feeGroup: studentData.sessionInfo?.admitFeeGroup || '',
            house: studentData.sessionInfo?.admitHouse || ''
          },
          
          currentSession: {
            class: studentData.sessionInfo?.currentClass || '',
            section: studentData.sessionInfo?.currentSection || '',
            rollNo: studentData.sessionInfo?.currentRollNo || '',
            group: studentData.sessionInfo?.currentGroup || '',
            stream: studentData.sessionInfo?.currentStream || '',
            semester: studentData.sessionInfo?.currentSemester || '',
            feeGroup: studentData.sessionInfo?.currentFeeGroup || '',
            house: studentData.sessionInfo?.currentHouse || ''
          },
          
          // Transport information
          transport: {
            mode: studentData.transportInfo?.transportMode || 'Own Transport',
            area: studentData.transportInfo?.transportArea || '',
            stand: studentData.transportInfo?.transportStand || '',
            route: studentData.transportInfo?.transportRoute || '',
            driver: studentData.transportInfo?.transportDriver || '',
            pickupLocation: studentData.transportInfo?.pickupLocation || '',
            dropLocation: studentData.transportInfo?.dropLocation || ''
          },
          
          // Education information
          lastEducation: {
            school: studentData.educationInfo?.lastSchool || '',
            address: studentData.educationInfo?.lastSchoolAddress || '',
            tcDate: studentData.educationInfo?.lastTcDate ? studentData.educationInfo.lastTcDate.split('T')[0] : '',
            prevClass: studentData.educationInfo?.lastClass || '',
            percentage: studentData.educationInfo?.lastPercentage || '',
            attendance: studentData.educationInfo?.lastAttendance || '',
            extraActivity: studentData.educationInfo?.lastExtraActivity || ''
          },
          
          // Other information
          other: {
            belongToBPL: studentData.otherInfo?.belongToBPL || 'no',
            minority: studentData.otherInfo?.minority || 'no',
            disability: studentData.otherInfo?.disability || '',
            accountNo: studentData.otherInfo?.accountNo || '',
            bank: studentData.otherInfo?.bank || '',
            ifscCode: studentData.otherInfo?.ifscCode || '',
            medium: studentData.otherInfo?.medium || '',
            lastYearResult: studentData.otherInfo?.lastYearResult || '',
            singleParent: studentData.otherInfo?.singleParent || 'no',
            onlyChild: studentData.otherInfo?.onlyChild || 'no',
            onlyGirlChild: studentData.otherInfo?.onlyGirlChild || 'no',
            adoptedChild: studentData.otherInfo?.adoptedChild || 'no',
            siblingAdmissionNo: studentData.otherInfo?.siblingAdmissionNo || '',
            transferCase: studentData.otherInfo?.transferCase || 'no',
            livingWith: studentData.otherInfo?.livingWith || '',
            motherTongue: studentData.otherInfo?.motherTongue || '',
            admissionType: studentData.otherInfo?.admissionType || 'new',
            udiseNo: studentData.otherInfo?.udiseNo || ''
          },
          
          // Image URLs
          studentImagePath: studentData.studentImagePath || '',
          fatherImagePath: studentData.fatherImagePath || '',
          motherImagePath: studentData.motherImagePath || '',
          guardianImagePath: studentData.guardianImagePath || '',
          signaturePath: studentData.signaturePath || '',
          parentSignaturePath: studentData.parentSignaturePath || '',
          fatherAadharPath: studentData.fatherAadharPath || '',
          motherAadharPath: studentData.motherAadharPath || '',
          birthCertificatePath: studentData.birthCertificatePath || '',
          migrationCertificatePath: studentData.migrationCertificatePath || '',
          aadhaarCardPath: studentData.aadhaarCardPath || '',
          familyIdPath: studentData.familyIdPath || '',
          affidavitCertificatePath: studentData.affidavitCertificatePath || '',
          incomeCertificatePath: studentData.incomeCertificatePath || '',
          addressProof1Path: studentData.addressProof1Path || '',
          addressProof2Path: studentData.addressProof2Path || '',
          transferCertificatePath: studentData.transferCertificatePath || '',
          markSheetPath: studentData.markSheetPath || '',
          fatherSignaturePath: studentData.fatherSignaturePath || '',
          motherSignaturePath: studentData.motherSignaturePath || '',
          guardianSignaturePath: studentData.guardianSignaturePath || '',
        };
        
        console.log('Mapped student data:', mappedData);
        setFormData(mappedData);
        showToast('success', 'Student data loaded successfully!');
      } else {
        console.error('Invalid API response structure:', response);
        showToast('error', 'Failed to load student data - Invalid response');
      }
    } catch (error) {
      console.error('Error fetching student:', error);
      const apiErr = error as ApiError;
      if (apiErr.status === 404) {
        showToast('error', 'Student not found');
        navigate('/student-management');
      } else {
        showToast('error', 'Failed to load student data');
      }
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  // Auto-calculate age when date of birth changes
  useEffect(() => {
    if (formData?.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age >= 0) {
        setFormData(prev => ({ ...prev, age }));
      }
    }
  }, [formData?.dateOfBirth]);

  // Handle input changes
  const handleInputChange = (field: string, value: string | number | boolean) => {
    // Handle password fields separately
    if (field === 'emailPassword' || field.includes('emailPassword')) {
      setPasswordUpdates(prev => ({
        ...prev,
        [field]: value as string
      }));
      return;
    }

    // Handle nested fields
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
          ...prev,
          [parent]: {
          ...(prev[parent as keyof Student] as Record<string, unknown>),
            [child]: value
          }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!id) return;
    
    try {
      setSaving(true);
      
      // Prepare submission data, including only changed passwords
      const submissionData: Record<string, unknown> = { ...formData };
      
      // Handle email fields carefully to avoid unique constraint issues
      if (submissionData.email === '') {
        submissionData.email = null;
      }
      
      if (submissionData.father && typeof submissionData.father === 'object') {
        const father = submissionData.father as Record<string, unknown>;
        if (father.email === '') {
          father.email = null;
        }
      }
      
      if (submissionData.mother && typeof submissionData.mother === 'object') {
        const mother = submissionData.mother as Record<string, unknown>;
        if (mother.email === '') {
          mother.email = null;
        }
      }
      
      // Add password updates if they exist
      Object.keys(passwordUpdates).forEach(key => {
        const value = passwordUpdates[key];
        if (value && value.trim()) {
          if (key.includes('.')) {
            const [parent, child] = key.split('.');
            if (!submissionData[parent]) {
              submissionData[parent] = {};
            }
            (submissionData[parent] as Record<string, unknown>)[child] = value;
          } else {
            submissionData[key] = value;
          }
        }
      });
      
      console.log('Submitting student data:', submissionData);
      
      const response = await axios.put(`${API_URL}/students/${id}`, submissionData, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      
      if (response.data.success) {
        showToast('success', 'Student updated successfully');
        navigate('/school/students/manage-students');
      } else {
        showToast('error', response.data.message || 'Failed to update student');
      }
    } catch (error: unknown) {
      console.error('Error updating student:', error);
      
      // Handle specific error types
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
          showToast('error', error.response.data.message);
        } else if (error.response?.data?.message) {
          showToast('error', error.response.data.message);
        } else {
          showToast('error', 'Failed to update student. Please try again.');
        }
      } else {
        showToast('error', 'Failed to update student. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Print function
  const handlePrint = async () => {
    try {
      await generateAdmissionFormPrint(formData);
    } catch (error) {
      console.error('Error printing student profile:', error);
      showToast('error', 'Failed to print student profile');
    }
  };

  // Render form field helper
  const renderInput = (
    label: string, 
    field: string, 
    type: string = 'text', 
    required: boolean = false,
    placeholder?: string,
    readOnly: boolean = false
  ) => {
    const isPasswordField = type === 'password';
    
    // Get password value from passwordUpdates if it's a password field
    const passwordValue = isPasswordField ? (passwordUpdates[field] || '') : '';
    
    return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
          value={isPasswordField ? passwordValue : (getFieldValue(field) || '')}
        onChange={readOnly ? undefined : (e) => handleInputChange(field, e.target.value)}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          readOnly ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
          placeholder={isPasswordField ? 'Enter new password (leave blank to keep current)' : placeholder}
        required={required}
        readOnly={readOnly}
      />
        {isPasswordField && (
          <p className="text-xs text-gray-500">
            Leave blank to keep current password. Enter new password to change.
          </p>
        )}
    </div>
  );
  };

  // Render select field helper
  const renderSelect = (
    label: string, 
    field: string, 
    options: string[] | { value: string; label: string }[], 
    required: boolean = false
  ) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={getFieldValue(field) || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required={required}
      >
        <option value="">Select {label}</option>
        {Array.isArray(options) ? options.map((option) => {
          if (typeof option === 'string') {
            return <option key={option} value={option}>{option}</option>;
          } else {
            return <option key={option.value} value={option.value}>{option.label}</option>;
          }
        }) : null}
      </select>
    </div>
  );

  // Render file input helper
  const renderFileInput = (
    label: string,
    field: string,
    accept: string = 'image/*'
  ) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            // For now, just store the file name. In a real implementation,
            // you would upload the file and store the URL
            handleInputChange(field, file.name);
          }
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {getFieldValue(field) && (
        <p className="text-sm text-gray-600">Current: {getFieldValue(field)}</p>
      )}
    </div>
  );

  // Get field value helper
  const getFieldValue = (field: string): string => {
    const keys = field.split('.');
    if (keys.length === 1) {
      return formData[field as keyof Student] as string || '';
    } else {
      const [parent, child] = keys;
      const parentObj = formData[parent as keyof Student] as Record<string, unknown>;
      return (parentObj?.[child] as string) || '';
    }
  };

  // Render form steps
  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('Full Name', 'fullName', 'text', true)}
              {renderInput('Admission Number', 'admissionNo', 'text', true)}
              {renderInput('PEN Number', 'penNo')}
              {renderInput('APAAR ID', 'apaarId')} {/* Made optional */}
              {renderInput('Date of Birth', 'dateOfBirth', 'date')}
              {renderInput('Age', 'age', 'number', false, 'Auto-calculated from date of birth', true)}
              {renderSelect('Gender', 'gender', GENDERS, true)}
              {renderSelect('Blood Group', 'bloodGroup', BLOOD_GROUPS)}
              {renderSelect('Religion', 'religion', RELIGIONS)}
              {renderSelect('Category', 'category', CATEGORIES)}
              {renderInput('Caste', 'caste')}
              {renderInput('Nationality', 'nationality')}
              {renderInput('Aadhaar Number', 'aadhaarNumber')}
              
              {/* Password Fields */}
              {renderInput('Student Email Password', 'emailPassword', 'password')}
            </div>
            
            {/* Document Upload Section */}
            <h4 className="text-md font-medium text-gray-700 mt-6 border-b pb-2">Document Images</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderFileInput('Student Photo', 'studentImagePath')}
              {renderFileInput('Student Signature', 'signaturePath')}
              {renderFileInput('Birth Certificate', 'birthCertificatePath')}
              {renderFileInput('Aadhaar Card', 'aadhaarCardPath')}
              {renderFileInput('Transfer Certificate', 'transferCertificatePath')}
              {renderFileInput('Mark Sheet', 'markSheetPath')}
              {renderFileInput('Family ID', 'familyIdPath')}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Academic Information</h3>
            <div className="space-y-6">
              <h4 className="text-md font-medium text-gray-700">Admit Session</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInput('Group', 'admitSession.group')}
                {renderInput('Stream', 'admitSession.stream')}
                {renderSelect('Class', 'admitSession.class', CLASSES, true)}
                {renderSelect('Section', 'admitSession.section', SECTIONS)}
                {renderInput('Roll Number', 'admitSession.rollNo')}
                {renderInput('Semester', 'admitSession.semester')}
                {renderInput('Fee Group', 'admitSession.feeGroup')}
                {renderInput('House', 'admitSession.house')}
              </div>
              
              <h4 className="text-md font-medium text-gray-700 mt-6">Current Session</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInput('Group', 'currentSession.group')}
                {renderInput('Stream', 'currentSession.stream')}
                {renderSelect('Class', 'currentSession.class', CLASSES)}
                {renderSelect('Section', 'currentSession.section', SECTIONS)}
                {renderInput('Roll Number', 'currentSession.rollNo')}
                {renderInput('Semester', 'currentSession.semester')}
                {renderInput('Fee Group', 'currentSession.feeGroup')}
                {renderInput('House', 'currentSession.house')}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('Mobile Number', 'mobileNumber', 'tel')}
              {renderInput('Email', 'email', 'email')}
              {renderInput('Emergency Contact', 'emergencyContact', 'tel')}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Address & Transport</h3>
            
            <h4 className="text-md font-medium text-gray-700">Present Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('House Number', 'address.houseNo')}
              {renderInput('Street', 'address.street')}
              {renderInput('City', 'address.city')}
              {renderInput('State', 'address.state')}
              {renderInput('PIN Code', 'address.pinCode')}
            </div>

            <h4 className="text-md font-medium text-gray-700 mt-6">Permanent Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('House Number', 'address.permanentHouseNo')}
              {renderInput('Street', 'address.permanentStreet')}
              {renderInput('City', 'address.permanentCity')}
              {renderInput('State', 'address.permanentState')}
              {renderInput('PIN Code', 'address.permanentPinCode')}
            </div>

            <h4 className="text-md font-medium text-gray-700 mt-6">Transport Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderSelect('Transport Mode', 'transport.mode', ['Bus', 'Van', 'Auto', 'Private', 'Walking'])}
              {renderInput('Transport Area', 'transport.area')}
              {renderInput('Transport Stand', 'transport.stand')}
              {renderSelect('Transport Route', 'transport.route', transportRoutes.map(route => ({
                value: route.id,
                label: `${route.name} (${route.fromLocation} - ${route.toLocation})`
              })))}
              {renderSelect('Driver', 'transport.driver', drivers.map(driver => ({
                value: driver.id,
                label: `${driver.name} (${driver.contactNumber})`
              })))}
              {renderInput('Pickup Location', 'transport.pickupLocation')}
              {renderInput('Drop Location', 'transport.dropLocation')}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Parents & Guardian Information</h3>
            
            <h4 className="text-md font-medium text-gray-700">Father Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('Father Name', 'father.name', 'text', true)}
              {renderInput('Qualification', 'father.qualification')}
              {renderInput('Occupation', 'father.occupation')}
              {renderInput('Email', 'father.email', 'email')}
              {renderInput('Email Password', 'father.emailPassword', 'password')}
              {renderInput('Contact Number', 'father.contactNumber', 'tel')}
              {renderInput('Aadhaar Number', 'father.aadhaarNo')}
              {renderInput('Annual Income', 'father.annualIncome')}
              {renderFileInput('Father Photo', 'fatherImagePath')}
            </div>

            <h4 className="text-md font-medium text-gray-700 mt-6">Mother Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('Mother Name', 'mother.name')}
              {renderInput('Qualification', 'mother.qualification')}
              {renderInput('Occupation', 'mother.occupation')}
              {renderInput('Email', 'mother.email', 'email')}
              {renderInput('Email Password', 'mother.emailPassword', 'password')}
              {renderInput('Contact Number', 'mother.contactNumber', 'tel')}
              {renderInput('Aadhaar Number', 'mother.aadhaarNo')}
              {renderInput('Annual Income', 'mother.annualIncome')}
              {renderFileInput('Mother Photo', 'motherImagePath')}
            </div>

            <h4 className="text-md font-medium text-gray-700 mt-6">Guardian Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('Guardian Name', 'guardian.name')}
              {renderInput('Address', 'guardian.address')}
              {renderInput('Contact Number', 'guardian.contactNumber', 'tel')}
              {renderInput('Email', 'guardian.email', 'email')}
              {renderInput('Aadhaar Number', 'guardian.aadhaarNo')}
              {renderInput('Occupation', 'guardian.occupation')}
              {renderInput('Annual Income', 'guardian.annualIncome')}
              {renderFileInput('Guardian Photo', 'guardianImagePath')}
            </div>
            
            {/* Parent Signature Section */}
            <h4 className="text-md font-medium text-gray-700 mt-6 border-b pb-2">Parent Signatures</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderFileInput('Parent/Guardian Signature', 'parentSignaturePath')}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Previous Education</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('Previous School', 'lastEducation.school')}
              {renderInput('School Address', 'lastEducation.address')}
              {renderInput('TC Date', 'lastEducation.tcDate', 'date')}
              {renderInput('Previous Class', 'lastEducation.prevClass')}
              {renderInput('Percentage', 'lastEducation.percentage')}
              {renderInput('Attendance', 'lastEducation.attendance')}
              {renderInput('Extra Activities', 'lastEducation.extraActivity')}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Other Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderSelect('Belong to BPL', 'other.belongToBPL', ['Yes', 'No'])}
              {renderSelect('Minority', 'other.minority', ['Yes', 'No'])}
              {renderInput('Disability', 'other.disability')}
              {renderInput('Account Number', 'other.accountNo')}
              {renderInput('Bank', 'other.bank')}
              {renderInput('IFSC Code', 'other.ifscCode')}
              {renderInput('Medium', 'other.medium')}
              {renderInput('Last Year Result', 'other.lastYearResult')}
              {renderSelect('Single Parent', 'other.singleParent', ['Yes', 'No'])}
              {renderSelect('Only Child', 'other.onlyChild', ['Yes', 'No'])}
              {renderSelect('Only Girl Child', 'other.onlyGirlChild', ['Yes', 'No'])}
              {renderSelect('Adopted Child', 'other.adoptedChild', ['Yes', 'No'])}
              {renderInput('Sibling Admission No', 'other.siblingAdmissionNo')}
              {renderSelect('Transfer Case', 'other.transferCase', ['Yes', 'No'])}
              {renderInput('Living With', 'other.livingWith')}
              {renderInput('Mother Tongue', 'other.motherTongue')}
              {renderSelect('Admission Type', 'other.admissionType', ['New', 'Transfer', 'Readmission'])}
              {renderInput('UDISE Number', 'other.udiseNo')}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Hook to fetch data on component mount
  useEffect(() => {
    fetchStudentData();
    fetchTransportData();
  }, [fetchStudentData, fetchTransportData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/school/students/manage-students')}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
                  <p className="text-gray-600">{formData?.fullName} ({formData?.admissionNo})</p>
              </div>
            </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                title="Print Student Profile"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
            <button
              onClick={() => navigate('/school/students/manage-students')}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  <span className="text-sm font-medium">{step.id}</span>
                </div>
                <div className="ml-2 text-sm font-medium text-gray-700">
                  {step.title}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`ml-4 w-8 h-0.5 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {renderFormStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </button>
            
            <div className="flex space-x-3">
              {currentStep === totalSteps ? (
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentEdit; 