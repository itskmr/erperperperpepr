import { z } from 'zod';

// Enum schemas matching the Prisma enums
const WhetherFailedEnum = z.enum(['Yes', 'No', 'NA', 'CBSEBoard']);
const ExamAppearedInEnum = z.enum([
  'School', 'Board', 'NA', 'CBSEBoard', 
  'SchoolFailed', 'SchoolPassed', 'SchoolCompartment', 
  'BoardPassed', 'BoardFailed', 'BoardCompartment'
]);
const QualifiedStatusEnum = z.enum([
  'Yes', 'No', 'NA', 'Pass', 'Fail', 'Compartment',
  'AsperCBSEBoardResult', 'AppearedinclassXExam', 'AppearedinclassXIIExam'
]);
const ReasonForLeavingEnum = z.enum([
  'FamilyRelocation', 'AdmissionInOtherSchool', 'Duetolongabsencewithoutinformation',
  'FatherJobTransfer', 'GetAdmissioninHigherClass', 'GoingtoNativePlace',
  'ParentWill', 'Passedoutfromtheschool', 'Shiftingtootherplace',
  'TransferCase', 'Other'
]);
const ConductStatusEnum = z.enum([
  'Excellent', 'Good', 'Satisfactory', 'NeedsImprovement', 'Poor'
]);
const FeeConcessionStatusEnum = z.enum(['None', 'Partial', 'Full']);

// Base schema for TC data
const TCBaseSchema = {
  // Required fields
  fullName: z.string().min(3, "Student name must be at least 3 characters").max(100, "Student name cannot exceed 100 characters"),
  fatherName: z.string().min(3, "Father's name must be at least 3 characters").max(100, "Father's name cannot exceed 100 characters"),
  motherName: z.string().min(3, "Mother's name must be at least 3 characters").max(100, "Mother's name cannot exceed 100 characters"),
  dateOfBirth: z.string().datetime("Invalid date of birth format. Please use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)"),
  nationality: z.string().min(2, "Nationality must be at least 2 characters").max(50, "Nationality cannot exceed 50 characters"),
  category: z.string().min(2, "Category must be at least 2 characters").max(50, "Category cannot exceed 50 characters"),
  dateOfAdmission: z.string().datetime("Invalid date of admission format. Please use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)"),
  currentClass: z.string().min(1, "Class must be at least 1 character").max(20, "Class cannot exceed 20 characters"),
  whetherFailed: WhetherFailedEnum,
  section: z.string().optional().default("A"),
  examAppearedIn: ExamAppearedInEnum,
  qualifiedForPromotion: QualifiedStatusEnum,
  reasonForLeaving: ReasonForLeavingEnum,
  dateOfLeaving: z.string().datetime("Invalid date of leaving format. Please use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)"),
  lastAttendanceDate: z.string().datetime("Invalid last attendance date format. Please use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)"),
  maxAttendance: z.number().int().min(0, "Max attendance must be a positive number"),
  obtainedAttendance: z.number().int().min(0, "Obtained attendance must be a positive number"),
  subjectsStudied: z.string(),
  generalConduct: ConductStatusEnum,
  feesPaidUpTo: z.string().datetime("Invalid fees paid up to date format. Please use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)"),
  
  // Optional fields
  rollNumber: z.string().max(50, "Roll number cannot exceed 50 characters").optional(),
  toClass: z.string().max(20, "To class cannot exceed 20 characters").optional(),
  classInWords: z.string().max(50, "Class in words cannot exceed 50 characters").optional(),
  behaviorRemarks: z.string().max(500, "Behavior remarks cannot exceed 500 characters").optional(),
  tcCharge: z.number().min(0, "TC charge must be a positive number").optional(),
  feeConcession: FeeConcessionStatusEnum.optional(),
  admissionNumber: z.string().min(1, "Admission number is required").max(50, "Admission number cannot exceed 50 characters"),
  tcNumber: z.string().max(50, "TC number cannot exceed 50 characters").optional(),
  issuedDate: z.string().datetime("Invalid issue date format. Please use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)").optional(),
};

// Schema for creating a new TC
export const TCCreateSchema = z.object({
  ...TCBaseSchema,
  studentId: z.number().int().positive("Student ID must be a positive integer"),
  schoolId: z.number().int().positive("School ID must be a positive integer"),
});

// Schema for updating an existing TC (all fields optional)
export const TCUpdateSchema = TCCreateSchema.partial().omit({
  studentId: true,
  schoolId: true,
}).extend({
  // Fields that must be provided even in updates
  fullName: z.string().min(3, "Student name must be at least 3 characters").max(100, "Student name cannot exceed 100 characters"),
  currentClass: z.string().min(1, "Class must be at least 1 character").max(20, "Class cannot exceed 20 characters"),
  dateOfLeaving: z.string().datetime("Invalid date of leaving format. Please use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)"),
  admissionNumber: z.string().min(1, "Admission number is required").max(50, "Admission number cannot exceed 50 characters"),
});

// Helper function to convert frontend model to backend model
export const convertFrontendToBackend = (frontendData) => {
  // Sanitize inputs - ensure numbers are properly parsed and strings are trimmed
  const parseIntSafe = (value) => {
    const parsed = parseInt(value || '0');
    return isNaN(parsed) ? 0 : parsed;
  };
  
  const parseFloatSafe = (value) => {
    const parsed = parseFloat(value || '0');
    return isNaN(parsed) ? 0 : parsed;
  };
  
  const trimString = (value) => {
    return typeof value === 'string' ? value.trim() : value || '';
  };
  
  return {
    fullName: trimString(frontendData.studentName),
    currentClass: trimString(frontendData.studentClass),
    whetherFailed: frontendData.whetherFailed,
    examAppearedIn: frontendData.examIn,
    qualifiedForPromotion: frontendData.qualified,
    subjectsStudied: trimString(frontendData.subject),
    generalConduct: frontendData.generalConduct,
    feeConcession: frontendData.feesConcessionAvailed,
    rollNumber: trimString(frontendData.rollNo),
    section: trimString(frontendData.section) || "A",
    maxAttendance: parseIntSafe(frontendData.maxAttendance),
    obtainedAttendance: parseIntSafe(frontendData.obtainedAttendance),
    tcCharge: parseFloatSafe(frontendData.tcCharge),
    tcNumber: trimString(frontendData.tcNo),
    issuedDate: frontendData.dateOfIssue || new Date().toISOString(),
    // Pass other fields directly
    fatherName: trimString(frontendData.fatherName),
    motherName: trimString(frontendData.motherName),
    dateOfBirth: frontendData.dateOfBirth,
    nationality: trimString(frontendData.nationality),
    category: trimString(frontendData.category),
    dateOfAdmission: frontendData.dateOfAdmission,
    reasonForLeaving: frontendData.reason,
    dateOfLeaving: frontendData.dateOfLeaving,
    lastAttendanceDate: frontendData.lastAttendanceDate,
    toClass: trimString(frontendData.toClass),
    classInWords: trimString(frontendData.classInWords),
    behaviorRemarks: trimString(frontendData.behaviorRemarks),
    feesPaidUpTo: frontendData.feesPaidUpTo,
    admissionNumber: trimString(frontendData.admissionNumber)
  };
};
