export interface Documents {
  studentImage?: File;
  fatherImage?: File;
  motherImage?: File;
  guardianImage?: File;
  signature?: File;
  parentSignature?: File;
  birthCertificate?: File;
  transferCertificate?: File;
  markSheet?: File;
  aadhaarCard?: File;
  fatherAadhar?: File;
  motherAadhar?: File;
  familyId?: File;
  fatherSignature?: File;
  motherSignature?: File;
  guardianSignature?: File;
}

export interface StudentFormData {
  // Basic Details
  fullName: string;
  admissionNo: string;
  email: string;
  emailPassword?: string;
  studentPassword?: string;  // Added student password field
  penNo?: string;
  apaarId: string;  // Apaar ID field
  studentId?: string;
  dateOfBirth: string;
  age: string;  // Changed from number to string since we're handling it as string in the form
  gender: string;
  bloodGroup?: string;
  nationality?: string;
  religion?: string;
  category?: string;
  caste?: string;
  aadhaarNumber: string;
  mobileNumber: string;
  emergencyContact?: string;
  sameAsPresentAddress: boolean;

  // ... rest of the interface remains the same ...
  documents: Documents;
  // Add other fields as needed
} 