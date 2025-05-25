export interface StudentDetails {
  studentId: string;
  schoolId: number;
  fullName: string;
  fatherName: string;
  motherName: string;
  nationality: string;
  category: string;
  dateOfBirth: string;
  dateOfAdmission: string;
  section: string;
  admissionNumber: string;
  currentClass: string;
  admitClass: string;
  academicYear: string;
  rollNo: string;
  lastAttendanceDate: string;
  feesUpToDate: string;
  maxAttendance: string;
  obtainedAttendance: string;
  subject: string;
  whetherFailed: string;
  examIn: string;
  qualified: string;
  generalConduct: string;
  dateOfLeaving: string;
  behavior: string;
  reason: string;
  lastExam: string;
  tcCharge: string;
  toClass: string;
  classInWords: string;
  conduct: string;
  remark: string;
  behaviorRemarks: string;
  subjectStudied: string;
  gamesPlayed: string[];
  extraActivity: string[];
  dateOfIssue: string;
  remarks: string;
  schoolDetails: {
    schoolName: string;
    address: string;
    recognitionId: string;
    affiliationNo: string;
    contact: string;
    email: string;
    imageUrl: string;
  };
}

export interface CertificateDetails {
  studentId?: number;
  schoolId?: number;
  section?: string;
  studentName: string;
  studentClass: string;
  issueDate: string;
  leavingDate: string;
  motherName: string;
  fatherName: string;
  nationality: string;
  category: string;
  dateOfBirth: string;
  toClass: string;
  classInWords: string;
  reason: string;
  examIn: string;
  qualified: string;
  gamesPlayed: string[];
  extraActivity: string[];
  subject: string;
  generalConduct: string;
  dateOfLeaving: string;
  remarks: string;
  maxAttendance: string;
  obtainedAttendance: string;
  lastAttendanceDate: string;
  feesPaidUpTo: string;
  whetherFailed: string;
  tcCharge: string;
  behaviorRemarks: string;
  rollNo?: string;
  dateOfIssue: string;
  admitClass: string;
  schoolDetails:{
    schoolName: string;
    address: string;
    recognitionId: string;
    affiliationNo: string;
    contact: string;
    email: string;  
    imageUrl?: string;
  }
}

export interface IssuedCertificate extends StudentDetails {
  // Additional fields specific to issued certificates
  certificateId?: string;
  issueDate: string;
  status: string;
  studentClass: string;
  feesPaidUpTo: string;
  feesConcessionAvailed: string;
  studentName: string;
  tcNo: string;
  leavingDate: string;
}