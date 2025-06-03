// Define all types used in the Student Registration Form

// Define Documents type based on schema document path fields
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
}

// Document verification status based on schema
export interface DocumentStatus {
  documentsVerified?: boolean;
  birthCertificateSubmitted?: boolean;
  studentAadharSubmitted?: boolean;
  fatherAadharSubmitted?: boolean;
  motherAadharSubmitted?: boolean;
  tcSubmitted?: boolean;
  marksheetSubmitted?: boolean;
}

// Document paths for existing students (when editing)
export interface DocumentPaths {
  studentImagePath?: string | null;
  fatherImagePath?: string | null;
  motherImagePath?: string | null;
  guardianImagePath?: string | null;
  signaturePath?: string | null;
  parentSignaturePath?: string | null;
  fatherAadharPath?: string | null;
  motherAadharPath?: string | null;
  birthCertificatePath?: string | null;
  migrationCertificatePath?: string | null;
  aadhaarCardPath?: string | null;
  familyIdPath?: string | null;
  affidavitCertificatePath?: string | null;
  incomeCertificatePath?: string | null;
  addressProof1Path?: string | null;
  addressProof2Path?: string | null;
  transferCertificatePath?: string | null;
  markSheetPath?: string | null;
  fatherSignaturePath?: string | null;
  motherSignaturePath?: string | null;
  guardianSignaturePath?: string | null;
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

// Define Father type
export interface Father {
  name: string;
  qualification: string;
  occupation: string;
  contactNumber: string;
  email: string;
  aadhaarNo: string;
  annualIncome: string;
  isCampusEmployee: string;
}

// Define Mother type
export interface Mother {
  name: string;
  qualification: string;
  occupation: string;
  contactNumber: string;
  email: string;
  aadhaarNo: string;
  annualIncome: string;
  isCampusEmployee: string;
}

// Define Guardian type
export interface Guardian {
  name: string;
  address: string;
  contactNumber: string;
  email: string;
  aadhaarNo: string;
  occupation: string;
  annualIncome: string;
}

// Define Session Information type
export interface AdmitSession {
  group: string;
  stream: string;
  class: string;
  section: string;
  rollNo: string;
  semester: string;
  feeGroup: string;
  house: string;
}

export interface CurrentSession {
  group: string;
  stream: string;
  class: string;
  section: string;
  rollNo: string;
  semester: string;
  feeGroup: string;
  house: string;
}

// Define Transport type
export interface Transport {
  mode: string;
  area: string;
  stand: string;
  route: string;
  driver: string;
  pickupLocation: string;
  dropLocation: string;
}

// Define Academic type
export interface Academic {
  registrationNo: string;
}

// Define Last Education type
export interface LastEducation {
  school: string;
  address: string;
  tcDate: string;
  prevClass: string;
  percentage: string;
  attendance: string;
  extraActivity: string;
}

// Define Other Information type
export interface Other {
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

// Main Student Form Data type
export interface StudentFormData {
  // Basic Details
  branchName: string;
  fullName: string;
  admissionNo: string;
  email: string;
  emailPassword: string;
  penNo: string;
  apaarId: string;
  studentId: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  bloodGroup: string;
  nationality: string;
  religion: string;
  category: string;
  caste: string;
  height: string;
  weight: string;
  aadhaarNumber: string;
  mobileNumber: string;
  emergencyContact: string;
  loginEnabled: boolean;
  
  // Address Information
  address: Address;
  
  // Parent Information
  father: Father;
  mother: Mother;
  guardian: Guardian;
  
  // Session Information
  admitSession: AdmitSession;
  currentSession: CurrentSession;
  
  // Transport Information
  transport: Transport;
  
  // Academic Information
  academic: Academic;
  
  // Last Education Information
  lastEducation: LastEducation;
  
  // Other Information
  other: Other;
  
  // Documents
  documents: Documents;
  
  // Document Status (for editing existing students)
  documentStatus?: DocumentStatus;
  
  // Document Paths (for editing existing students)
  documentPaths?: DocumentPaths;
  
  // School ID
  schoolId: number;
}

// API Response types
export interface StudentDocument {
  type: string;
  name: string;
  filePath: string | null;
  hasFile: boolean;
  url: string | null;
}

export interface StudentDocumentsResponse {
  success: boolean;
  student: {
    id: string;
    admissionNo: string;
    fullName: string;
  };
  documents: StudentDocument[];
  totalDocuments: number;
  documentStatus: DocumentStatus;
}

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  student: any;
  uploadedDocument: {
    type: string;
    name: string;
    filePath: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  };
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
  transportRoutes: Array<{ id: string; name: string; fromLocation: string; toLocation: string; }>;
  drivers: Array<{ id: string; name: string; contactNumber: string; }>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, documentType: keyof Documents) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  nextStep: () => void;
  prevStep: () => void;
  calculateAge: () => void;
} 