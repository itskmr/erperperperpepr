// Define all types used in the Student Registration Form

// Define Documents type
export interface Documents {
  studentImage: File | null;
  fatherImage: File | null;
  motherImage: File | null;
  guardianImage: File | null;
  signature: File | null;
  parentSignature: File | null;
  fatherAadhar: File | null;
  motherAadhar: File | null;
  birthCertificate: File | null;
  transferCertificate: File | null;
  markSheet: File | null;
  aadhaarCard: File | null;
  familyId: File | null;
  fatherSignature: File | null;
  motherSignature: File | null;
  guardianSignature: File | null;
  
  // Document submission status
  birthCertificateSubmitted?: boolean;
  studentAadharSubmitted?: boolean;
  fatherAadharSubmitted?: boolean;
  motherAadharSubmitted?: boolean;
  tcSubmitted?: boolean;
  marksheetSubmitted?: boolean;
}

// Define Address type - split into present and permanent
export interface Address {
  houseNo: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  
  permanentHouseNo: string;
  permanentStreet: string;
  permanentCity: string;
  permanentState: string;
  permanentPinCode: string;
  sameAsPresentAddress: boolean;
}

// Define Parent type
export interface Parent {
  name: string;
  qualification: string;
  occupation: string;
  contactNumber: string;
  email: string;
  aadhaarNo: string;
  annualIncome: string;
  isCampusEmployee: 'yes' | 'no';
}

// Define Guardian type
export interface Guardian {
  name: string;
  address: string;
  contactNumber: string;
  email?: string;
  aadhaarNo?: string;
  occupation?: string;
  annualIncome?: string;
}

// Define Session type
export interface Session {
  group: string;
  stream: string;
  class: string;
  section: string;
  rollNo: string;
  semester: string;
  feeGroup: string;
  house: string;
}

// Define Academic type
export interface Academic {
  registrationNo: string;
}

// Define Transport type
export interface Transport {
  mode: string;
  area: string;
  stand: string;
  route: string;
  driver: string;
  pickupLocation?: string;
  dropLocation?: string;
}

// Define LastEducation type
export interface LastEducation {
  school: string;
  address: string;
  tcDate: string;
  prevClass: string;
  percentage: string;
  attendance: string;
  extraActivity: string;
}

// Define Other type
export interface Other {
  belongToBPL: 'yes' | 'no';
  minority: 'yes' | 'no';
  disability: string;
  accountNo: string;
  bank: string;
  ifscCode: string;
  medium: string;
  lastYearResult: string;
  singleParent: 'yes' | 'no';
  onlyChild: 'yes' | 'no';
  onlyGirlChild: 'yes' | 'no';
  adoptedChild: 'yes' | 'no';
  siblingAdmissionNo: string;
  transferCase: 'yes' | 'no';
  livingWith: string;
  motherTongue: string;
  admissionType: 'new' | 'old';
  udiseNo: string;
}

// Define StudentFormData type - the complete student data structure
export interface StudentFormData {
  // Basic Details
  fullName: string;
  admissionNo: string;
  email: string;
  emailPassword?: string;
  penNo?: string;
  apaarId: string;  // Apaar ID field
  studentId?: string;
  dateOfBirth: string;
  age?: number;
  gender: string;
  bloodGroup?: string;
  nationality?: string;
  religion?: string;
  category?: string;
  caste?: string;
  aadhaarNumber: string;
  mobileNumber: string;
  emergencyContact?: string;
  sameAsPresentAddress: boolean;  // Added this field

  // Address Details
  address: {
    houseNo: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
    permanentHouseNo: string;
    permanentStreet: string;
    permanentCity: string;
    permanentState: string;
    permanentPinCode: string;
    sameAsPresentAddress: boolean;
  };

  // Transport Details
  transportMode: 'Bus' | 'Self' | 'Parent' | '';
  transportArea?: string;
  transportStand?: string;
  transportRoute?: string;
  transportDriver?: string;
  driverPhone?: string;
  pickupLocation?: string;
  dropLocation?: string;

  // Document Uploads
  documents: {
    studentImage?: File;
    fatherImage?: File;
    motherImage?: File;
    guardianImage?: File;
    signature?: File;
    parentSignature?: File;
    fatherAadhar?: File;
    motherAadhar?: File;
    birthCertificate?: File;
    transferCertificate?: File;
    markSheet?: File;
    aadhaarCard?: File;
    familyId?: File;  // Family ID document
    fatherSignature?: File;
    motherSignature?: File;
    guardianSignature?: File;
  };

  // Session Information
  admitSession: Session;
  currentSession: Session;

  // Parent Information
  father: Parent;
  mother: Parent;
  guardian: Guardian;

  // Additional Information
  academic: Academic;
  transport: Transport;
  lastEducation: LastEducation;
  other: Other;
}

// Define Step interface for the progress indicator
export interface Step {
  id: number;
  title: string;
  icon: string;
}

// Define validation patterns
export const VALIDATION_PATTERNS = {
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

// Class options for dropdown
export const CLASS_OPTIONS = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
];

// Section options for dropdown
export const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];

// Stream options for dropdown
export const STREAM_OPTIONS = [
  'Science', 'Commerce', 'Arts', 'Vocational', 'General'
];

// Semester options for dropdown
export const SEMESTER_OPTIONS = ['1st Semester', '2nd Semester'];

// Indian states for dropdown
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Define the return type for the hook
export interface UseStudentRegistrationReturn {
  currentStep: number;
  formData: StudentFormData;
  isSubmitting: boolean;
  error: string;
  success: boolean;
  steps: Array<Step>;
  validationErrors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, documentType: keyof Documents) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  nextStep: () => void;
  prevStep: () => void;
  calculateAge: () => void;
} 