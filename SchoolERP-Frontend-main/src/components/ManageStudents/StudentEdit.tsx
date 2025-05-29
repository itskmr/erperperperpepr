import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { STUDENT_API } from '../../config/api';

interface Student {
  id: string;
  // Basic Information
  branchName: string;
  admissionNo: string;
  penNo: string;
  apaarId: string;
  fullName: string;
  srNo: string;
  dateOfBirth: string | null;
  tcDate: string | null;
  admissionDate: string | null;
  age: number;
  height: number;
  weight: number;
  gender: string;
  bloodGroup: string;
  religion: string;
  category: string;
  caste: string;
  belongToBPL: string;
  typeOfDisability: string;
  nationality: string;
  aadhaarNumber: string;

  // Contact Information
  mobileNumber: string;
  email: string;
  studentEmailPassword: string;
  emailPassword: string;
  emergencyContact: string;
  fatherMobile: string;
  motherMobile: string;
  fatherEmail: string;
  fatherEmailPassword: string;
  motherEmail: string;
  motherEmailPassword: string;

  // Address Information
  presentAddress: {
    houseNo: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  permanentAddress: {
    houseNo: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  sameAsPresentAddress: boolean;

  // Transport Information
  transportMode: string;
  transportArea: string;
  transportStand: string;
  transportRoute: string;
  transportDriver: string;
  driverPhone: string;
  pickupLocation: string;
  dropLocation: string;

  // Parent Information
  fatherDetails: {
    name: string;
    qualification: string;
    occupation: string;
    organization: string;
    designation: string;
    mobileNumber: string;
    officeContact: string;
    email: string;
    aadhaarNumber: string;
    annualIncome: string;
  };
  motherDetails: {
    name: string;
    qualification: string;
    occupation: string;
    email: string;
    aadhaarNumber: string;
    annualIncome: string;
  };
  guardianDetails: {
    name: string;
    address: string;
    mobile: string;
    email: string;
    aadhaarNumber: string;
    occupation: string;
    annualIncome: string;
  };

  // Academic Information
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

  // Previous Education
  previousEducation: {
    school: string;
    schoolAddress: string;
    tcDate: string | null;
    previousClass: string;
    percentage: string;
    attendance: string;
    extraActivities: string;
  };

  // Academic Details
  registrationNo: string;

  // Other Information
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

  // Document Information
  documents: {
    studentImage: string;
    fatherImage: string;
    motherImage: string;
    guardianImage: string;
    studentSignature: string;
    parentSignature: string;
    birthCertificate: string;
    transferCertificate: string;
    markSheet: string;
    studentAadhaar: string;
    fatherAadhaar: string;
    motherAadhaar: string;
    familyId: string;
    fatherSignature: string;
    motherSignature: string;
    guardianSignature: string;
  };
}

interface StudentEditProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onStudentUpdated: () => void;
}

const AVAILABLE_CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11 (Science)', 'Class 11 (Commerce)', 'Class 11 (Arts)',
  'Class 12 (Science)', 'Class 12 (Commerce)', 'Class 12 (Arts)'
];

const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];
const STREAMS = ['Science', 'Commerce', 'Arts', 'General', 'Vocational'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CATEGORIES = ['General', 'EWS', 'OBC', 'BC', 'SC', 'ST'];
const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];
const SEMESTERS = ['1st sem', '2nd sem'];
const BPL_OPTIONS = ['Yes', 'No'];

const StudentEdit: React.FC<StudentEditProps> = ({ student, isOpen, onClose, onStudentUpdated }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Student>({
        ...student,
    dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
    tcDate: student.tcDate ? new Date(student.tcDate).toISOString().split('T')[0] : '',
    admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : '',
    presentAddress: {
      houseNo: student.presentAddress?.houseNo || '',
      street: student.presentAddress?.street || '',
      city: student.presentAddress?.city || '',
      state: student.presentAddress?.state || '',
      pinCode: student.presentAddress?.pinCode || ''
    },
    permanentAddress: {
      houseNo: student.permanentAddress?.houseNo || '',
      street: student.permanentAddress?.street || '',
      city: student.permanentAddress?.city || '',
      state: student.permanentAddress?.state || '',
      pinCode: student.permanentAddress?.pinCode || ''
    },
    fatherDetails: {
      name: student.fatherDetails?.name || '',
      qualification: student.fatherDetails?.qualification || '',
      occupation: student.fatherDetails?.occupation || '',
      organization: student.fatherDetails?.organization || '',
      designation: student.fatherDetails?.designation || '',
      mobileNumber: student.fatherDetails?.mobileNumber || '',
      officeContact: student.fatherDetails?.officeContact || '',
      email: student.fatherDetails?.email || '',
      aadhaarNumber: student.fatherDetails?.aadhaarNumber || '',
      annualIncome: student.fatherDetails?.annualIncome || ''
    },
    motherDetails: {
      name: student.motherDetails?.name || '',
      qualification: student.motherDetails?.qualification || '',
      occupation: student.motherDetails?.occupation || '',
      email: student.motherDetails?.email || '',
      aadhaarNumber: student.motherDetails?.aadhaarNumber || '',
      annualIncome: student.motherDetails?.annualIncome || ''
    },
    guardianDetails: {
      name: student.guardianDetails?.name || '',
      address: student.guardianDetails?.address || '',
      mobile: student.guardianDetails?.mobile || '',
      email: student.guardianDetails?.email || '',
      aadhaarNumber: student.guardianDetails?.aadhaarNumber || '',
      occupation: student.guardianDetails?.occupation || '',
      annualIncome: student.guardianDetails?.annualIncome || ''
    },
    admitSession: {
      group: student.admitSession?.group || '',
      stream: student.admitSession?.stream || '',
      class: student.admitSession?.class || '',
      section: student.admitSession?.section || '',
      rollNo: student.admitSession?.rollNo || '',
      semester: student.admitSession?.semester || '',
      feeGroup: student.admitSession?.feeGroup || '',
      house: student.admitSession?.house || ''
    },
    currentSession: {
      group: student.currentSession?.group || '',
      stream: student.currentSession?.stream || '',
      class: student.currentSession?.class || '',
      section: student.currentSession?.section || '',
      rollNo: student.currentSession?.rollNo || '',
      semester: student.currentSession?.semester || '',
      feeGroup: student.currentSession?.feeGroup || '',
      house: student.currentSession?.house || ''
    },
    previousEducation: {
      school: student.previousEducation?.school || '',
      schoolAddress: student.previousEducation?.schoolAddress || '',
      tcDate: student.previousEducation?.tcDate || null,
      previousClass: student.previousEducation?.previousClass || '',
      percentage: student.previousEducation?.percentage || '',
      attendance: student.previousEducation?.attendance || '',
      extraActivities: student.previousEducation?.extraActivities || ''
    },
    other: {
      belongToBPL: student.other?.belongToBPL || student.belongToBPL || 'no',
      minority: student.other?.minority || 'no',
      disability: student.other?.disability || student.typeOfDisability || '',
      accountNo: student.other?.accountNo || '',
      bank: student.other?.bank || '',
      ifscCode: student.other?.ifscCode || '',
      medium: student.other?.medium || '',
      lastYearResult: student.other?.lastYearResult || '',
      singleParent: student.other?.singleParent || 'no',
      onlyChild: student.other?.onlyChild || 'no',
      onlyGirlChild: student.other?.onlyGirlChild || 'no',
      adoptedChild: student.other?.adoptedChild || 'no',
      siblingAdmissionNo: student.other?.siblingAdmissionNo || '',
      transferCase: student.other?.transferCase || 'no',
      livingWith: student.other?.livingWith || '',
      motherTongue: student.other?.motherTongue || '',
      admissionType: student.other?.admissionType || 'new',
      udiseNo: student.other?.udiseNo || ''
    },
    documents: {
      studentImage: student.documents?.studentImage || '',
      fatherImage: student.documents?.fatherImage || '',
      motherImage: student.documents?.motherImage || '',
      guardianImage: student.documents?.guardianImage || '',
      studentSignature: student.documents?.studentSignature || '',
      parentSignature: student.documents?.parentSignature || '',
      birthCertificate: student.documents?.birthCertificate || '',
      transferCertificate: student.documents?.transferCertificate || '',
      markSheet: student.documents?.markSheet || '',
      studentAadhaar: student.documents?.studentAadhaar || '',
      fatherAadhaar: student.documents?.fatherAadhaar || '',
      motherAadhaar: student.documents?.motherAadhaar || '',
      familyId: student.documents?.familyId || '',
      fatherSignature: student.documents?.fatherSignature || '',
      motherSignature: student.documents?.motherSignature || '',
      guardianSignature: student.documents?.guardianSignature || ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-calculate age when date of birth changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        setFormData(prev => ({ ...prev, age: age - 1 }));
      } else {
        setFormData(prev => ({ ...prev, age }));
      }
    }
  }, [formData.dateOfBirth]);

  // Auto-fill permanent address if same as present address
  useEffect(() => {
    if (formData.sameAsPresentAddress) {
      setFormData(prev => ({
        ...prev,
        permanentAddress: {
          houseNo: prev.presentAddress.houseNo,
          street: prev.presentAddress.street,
          city: prev.presentAddress.city,
          state: prev.presentAddress.state,
          pinCode: prev.presentAddress.pinCode
        }
      }));
    }
  }, [formData.sameAsPresentAddress, formData.presentAddress]);

  const steps = [
    { id: 1, title: 'Basic Info', icon: '👤' },
    { id: 2, title: 'Academic', icon: '🎓' },
    { id: 3, title: 'Contact', icon: '📱' },
    { id: 4, title: 'Address', icon: '🏠' },
    { id: 5, title: 'Parents', icon: '👪' },
    { id: 6, title: 'Documents', icon: '📄' },
    { id: 7, title: 'Other', icon: 'ℹ️' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Student] as Record<string, unknown>),
          [child]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  // Helper function to render input fields
  const renderInput = (label: string, name: string, type = 'text', required = false, placeholder = '', readonly = false) => {
    const getValue = (name: string): string => {
      if (!name.includes('.')) {
        const val = formData[name as keyof Student];
        return val !== null && val !== undefined ? String(val) : '';
      } else {
        try {
          const parts = name.split('.');
          let value: unknown = formData;
          for (const part of parts) {
            if (value === null || value === undefined) return '';
            value = (value as Record<string, unknown>)[part];
          }
          return value !== null && value !== undefined ? String(value) : '';
        } catch {
          return '';
        }
      }
    };

  return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
                  <input
          type={type}
          name={name}
          value={getValue(name)}
                    onChange={handleChange}
          placeholder={placeholder}
          readOnly={readonly}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            readonly ? 'bg-gray-100' : ''
          }`}
          required={required}
                  />
              </div>
    );
  };

  // Helper function to render select fields
  const renderSelect = (label: string, name: string, options: string[], required = false, placeholder = 'Select...') => {
    const getValue = (name: string): string => {
      if (!name.includes('.')) {
        const val = formData[name as keyof Student];
        return val !== null && val !== undefined ? String(val) : '';
      } else {
        try {
          const parts = name.split('.');
          let value: unknown = formData;
          for (const part of parts) {
            if (value === null || value === undefined) return '';
            value = (value as Record<string, unknown>)[part];
          }
          return value !== null && value !== undefined ? String(value) : '';
        } catch {
          return '';
        }
      }
    };

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
                  <select
          name={name}
          value={getValue(name)}
                    onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
    );
  };

  // Helper function to render textarea fields
  const renderTextarea = (label: string, name: string, required = false, rows = 3) => {
    const getValue = (name: string): string => {
      if (!name.includes('.')) {
        const val = formData[name as keyof Student];
        return val !== null && val !== undefined ? String(val) : '';
      } else {
        try {
          const parts = name.split('.');
          let value: unknown = formData;
          for (const part of parts) {
            if (value === null || value === undefined) return '';
            value = (value as Record<string, unknown>)[part];
          }
          return value !== null && value !== undefined ? String(value) : '';
        } catch {
          return '';
        }
      }
    };

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          name={name}
          value={getValue(name)}
                    onChange={handleChange}
          rows={rows}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required={required}
                  />
                </div>
    );
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInput('Branch Name', 'branchName')}
              {renderInput('Admission No', 'admissionNo', 'text', true, '', true)}
              {renderInput('PEN No', 'penNo')}
              {renderInput('APAAR ID', 'apaarId')}
              {renderInput('Full Name', 'fullName', 'text', true)}
              {renderInput('SR No / Student ID', 'srNo')}
              {renderInput('Date of Birth', 'dateOfBirth', 'date', true)}
              {renderInput('Age', 'age', 'number', false, 'Auto-calculated', true)}
              {renderInput('Height (cm)', 'height', 'number')}
              {renderInput('Weight (kg)', 'weight', 'number')}
              {renderInput('Religion', 'religion')}
              {renderSelect('Gender', 'gender', ['Male', 'Female', 'Other'], true)}
              {renderSelect('Blood Group', 'bloodGroup', BLOOD_GROUPS)}
              {renderSelect('Category', 'category', CATEGORIES, true)}
              {renderInput('Caste', 'caste')}
              {renderSelect('Belong to BPL', 'belongToBPL', BPL_OPTIONS)}
              {renderInput('Type of Disability', 'typeOfDisability')}
              {renderInput('Nationality', 'nationality', 'text', true)}
              {renderInput('Aadhaar Number', 'aadhaarNumber', 'text', true, '12-digit number')}
                </div>
                </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Admit Session</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {renderInput('Group', 'admitSession.group')}
                {renderSelect('Stream', 'admitSession.stream', STREAMS)}
                {renderSelect('Class', 'admitSession.class', AVAILABLE_CLASSES, true)}
                {renderSelect('Section', 'admitSession.section', SECTIONS)}
                {renderInput('Roll No.', 'admitSession.rollNo')}
                {renderSelect('Semester', 'admitSession.semester', SEMESTERS)}
                {renderInput('Fee Group', 'admitSession.feeGroup')}
                {renderInput('House', 'admitSession.house')}
                </div>
              </div>
            
            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Current Session</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {renderInput('Group', 'currentSession.group')}
                {renderSelect('Stream', 'currentSession.stream', STREAMS)}
                {renderSelect('Class', 'currentSession.class', AVAILABLE_CLASSES, true)}
                {renderSelect('Section', 'currentSession.section', SECTIONS)}
                {renderInput('Roll No.', 'currentSession.rollNo')}
                {renderSelect('Semester', 'currentSession.semester', SEMESTERS)}
                {renderInput('Fee Group', 'currentSession.feeGroup')}
                {renderInput('House', 'currentSession.house')}
            </div>
                </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Previous Education</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('Previous School', 'previousEducation.school')}
                {renderTextarea('School Address', 'previousEducation.schoolAddress')}
                {renderInput('TC Date', 'previousEducation.tcDate', 'date')}
                {renderInput('Previous Class', 'previousEducation.previousClass')}
                {renderInput('Percentage/CGPA', 'previousEducation.percentage')}
                {renderInput('Attendance', 'previousEducation.attendance')}
                {renderTextarea('Extra Activities', 'previousEducation.extraActivities')}
                </div>
                </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Academic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('Registration No', 'registrationNo')}
                </div>
                </div>
              </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInput('Mobile Number', 'mobileNumber', 'tel', true, '10-digit number')}
              {renderInput('Student Email', 'email', 'email', true)}
              {renderInput('Student Email Password', 'studentEmailPassword', 'password')}
              {renderInput('Emergency Contact', 'emergencyContact', 'tel', true)}
              {renderInput('Father Mobile', 'fatherMobile', 'tel')}
              {renderInput('Mother Mobile', 'motherMobile', 'tel')}
              {renderInput('Father Email', 'fatherEmail', 'email')}
              {renderInput('Father Email Password', 'fatherEmailPassword', 'password')}
              {renderInput('Mother Email', 'motherEmail', 'email')}
              {renderInput('Mother Email Password', 'motherEmailPassword', 'password')}
                    </div>
                    </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Present Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('House/Flat No.', 'presentAddress.houseNo')}
                {renderTextarea('Street/Area', 'presentAddress.street')}
                {renderInput('City', 'presentAddress.city', 'text', true)}
                {renderSelect('State', 'presentAddress.state', STATES, true)}
                {renderInput('PIN Code', 'presentAddress.pinCode')}
                </div>
              </div>
              
            <div className="flex items-center my-4">
                  <input
                    type="checkbox"
                id="sameAsPresentAddress"
                    name="sameAsPresentAddress"
                    checked={formData.sameAsPresentAddress}
                    onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
              <label htmlFor="sameAsPresentAddress" className="ml-2 block text-gray-700">
                    Same as Present Address
                  </label>
                </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Permanent Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('House/Flat No.', 'permanentAddress.houseNo')}
                {renderTextarea('Street/Area', 'permanentAddress.street')}
                {renderInput('City', 'permanentAddress.city')}
                {renderSelect('State', 'permanentAddress.state', STATES)}
                {renderInput('PIN Code', 'permanentAddress.pinCode')}
                </div>
                      </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Transport Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSelect('Transport Mode', 'transportMode', ['School Bus', 'Private Vehicle', 'Public Transport', 'Walking'])}
                {renderInput('Transport Area', 'transportArea')}
                {renderInput('Transport Stand', 'transportStand')}
                {renderInput('Transport Route', 'transportRoute')}
                {renderInput('Driver Name', 'transportDriver')}
                {renderInput('Driver Phone', 'driverPhone', 'tel')}
                {renderInput('Pickup Location', 'pickupLocation')}
                {renderInput('Drop Location', 'dropLocation')}
              </div>
                  </div>
                  </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-4">Father's Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('Name', 'fatherDetails.name', 'text', true)}
                {renderInput('Qualification', 'fatherDetails.qualification')}
                {renderInput('Occupation', 'fatherDetails.occupation')}
                {renderInput('Organization', 'fatherDetails.organization')}
                {renderInput('Designation', 'fatherDetails.designation')}
                {renderInput('Mobile Number', 'fatherDetails.mobileNumber', 'tel', true)}
                {renderInput('Office Contact', 'fatherDetails.officeContact', 'tel')}
                {renderInput('Email', 'fatherDetails.email', 'email')}
                {renderInput('Aadhaar Number', 'fatherDetails.aadhaarNumber')}
                {renderInput('Annual Income', 'fatherDetails.annualIncome', 'number')}
                </div>
              </div>
              
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-4">Mother's Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('Name', 'motherDetails.name', 'text', true)}
                {renderInput('Qualification', 'motherDetails.qualification')}
                {renderInput('Occupation', 'motherDetails.occupation')}
                {renderInput('Email', 'motherDetails.email', 'email')}
                {renderInput('Aadhaar Number', 'motherDetails.aadhaarNumber')}
                {renderInput('Annual Income', 'motherDetails.annualIncome', 'number')}
              </div>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-4">Guardian Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('Guardian Name', 'guardianDetails.name')}
                {renderTextarea('Guardian Address', 'guardianDetails.address')}
                {renderInput('Guardian Mobile', 'guardianDetails.mobile', 'tel')}
                {renderInput('Guardian Email', 'guardianDetails.email', 'email')}
                {renderInput('Guardian Aadhaar No', 'guardianDetails.aadhaarNumber')}
                {renderInput('Guardian Occupation', 'guardianDetails.occupation')}
                {renderInput('Guardian Annual Income', 'guardianDetails.annualIncome', 'number')}
                  </div>
                  </div>
                  </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Documents</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">Document uploads are handled separately. Current document paths:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Student Image:</strong> {formData.documents.studentImage || 'Not uploaded'}</div>
                <div><strong>Father Image:</strong> {formData.documents.fatherImage || 'Not uploaded'}</div>
                <div><strong>Mother Image:</strong> {formData.documents.motherImage || 'Not uploaded'}</div>
                <div><strong>Guardian Image:</strong> {formData.documents.guardianImage || 'Not uploaded'}</div>
                <div><strong>Birth Certificate:</strong> {formData.documents.birthCertificate || 'Not uploaded'}</div>
                <div><strong>Transfer Certificate:</strong> {formData.documents.transferCertificate || 'Not uploaded'}</div>
                <div><strong>Mark Sheet:</strong> {formData.documents.markSheet || 'Not uploaded'}</div>
                <div><strong>Aadhaar Card:</strong> {formData.documents.studentAadhaar || 'Not uploaded'}</div>
                  </div>
                  </div>
                  </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Other Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSelect('Belong to BPL', 'other.belongToBPL', ['Yes', 'No'])}
              {renderSelect('Minority', 'other.minority', ['Yes', 'No'])}
              {renderInput('Disability', 'other.disability')}
              {renderInput('Account Number', 'other.accountNo')}
              {renderInput('Bank Name', 'other.bank')}
              {renderInput('IFSC Code', 'other.ifscCode')}
              {renderInput('Medium of Instruction', 'other.medium')}
              {renderInput('Last Year Result', 'other.lastYearResult')}
              {renderSelect('Single Parent', 'other.singleParent', ['Yes', 'No'])}
              {renderSelect('Only Child', 'other.onlyChild', ['Yes', 'No'])}
              {renderSelect('Only Girl Child', 'other.onlyGirlChild', ['Yes', 'No'])}
              {renderSelect('Adopted Child', 'other.adoptedChild', ['Yes', 'No'])}
              {renderInput('Sibling Admission No', 'other.siblingAdmissionNo')}
              {renderSelect('Transfer Case', 'other.transferCase', ['Yes', 'No'])}
              {renderInput('Living With', 'other.livingWith')}
              {renderInput('Mother Tongue', 'other.motherTongue')}
              {renderSelect('Admission Type', 'other.admissionType', ['new', 'transfer'])}
              {renderInput('UDISE No', 'other.udiseNo')}
              </div>
            </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Format dates for submission
      const submissionData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        tcDate: formData.tcDate ? new Date(formData.tcDate).toISOString() : null,
        admissionDate: formData.admissionDate ? new Date(formData.admissionDate).toISOString() : null,
        // Flatten nested objects for backend compatibility
        'address.houseNo': formData.presentAddress.houseNo,
        'address.street': formData.presentAddress.street,
        'address.city': formData.presentAddress.city,
        'address.state': formData.presentAddress.state,
        'address.pinCode': formData.presentAddress.pinCode,
        'address.permanentHouseNo': formData.permanentAddress.houseNo,
        'address.permanentStreet': formData.permanentAddress.street,
        'address.permanentCity': formData.permanentAddress.city,
        'address.permanentState': formData.permanentAddress.state,
        'address.permanentPinCode': formData.permanentAddress.pinCode,
        'father.name': formData.fatherDetails.name,
        'father.qualification': formData.fatherDetails.qualification,
        'father.occupation': formData.fatherDetails.occupation,
        'father.contactNumber': formData.fatherDetails.mobileNumber,
        'father.email': formData.fatherDetails.email,
        'father.aadhaarNo': formData.fatherDetails.aadhaarNumber,
        'father.annualIncome': formData.fatherDetails.annualIncome,
        'mother.name': formData.motherDetails.name,
        'mother.qualification': formData.motherDetails.qualification,
        'mother.occupation': formData.motherDetails.occupation,
        'mother.email': formData.motherDetails.email,
        'mother.aadhaarNo': formData.motherDetails.aadhaarNumber,
        'mother.annualIncome': formData.motherDetails.annualIncome,
        'guardian.name': formData.guardianDetails.name,
        'guardian.address': formData.guardianDetails.address,
        'guardian.contactNumber': formData.guardianDetails.mobile,
        'guardian.email': formData.guardianDetails.email,
        'guardian.aadhaarNo': formData.guardianDetails.aadhaarNumber,
        'guardian.occupation': formData.guardianDetails.occupation,
        'guardian.annualIncome': formData.guardianDetails.annualIncome
      };

      const response = await fetch(`${STUDENT_API.UPDATE}/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update student');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to update student');
      }

      onStudentUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">Edit Student Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={24} />
          </button>
                        </div>

        {/* Step Navigation */}
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                  currentStep === step.id
                    ? 'bg-blue-100 text-blue-700'
                    : currentStep > step.id
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                <span className="text-lg">{step.icon}</span>
                <span className="text-sm font-medium">{step.title}</span>
                        </div>
            ))}
                  </div>
                </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
              {error}
                      </div>
                    )}

          {renderFormStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            
            {currentStep < steps.length ? (
            <button
              type="button"
                onClick={nextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
                Next
            </button>
            ) : (
            <button
              type="submit"
              disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
                {loading ? 'Updating...' : 'Update Student'}
            </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentEdit; 