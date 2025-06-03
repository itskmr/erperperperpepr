// middlewares/tcMiddleware.js
import { convertFrontendToBackend } from '../utils/tcformValidator.js';
import { z } from 'zod';

// Define local validation schemas to avoid import conflicts
const LocalTCCreateSchema = z.object({
  admissionNumber: z.string().min(1, "Admission number is required"),
  fullName: z.string().min(1, "Student name is required"),
  fatherName: z.string().min(1, "Father's name is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  category: z.string().min(1, "Category is required"),
  dateOfAdmission: z.string().min(1, "Date of admission is required"),
  currentClass: z.string().min(1, "Current class is required"),
  whetherFailed: z.enum(['Yes', 'No', 'NA', 'CBSEBoard']).default('No'),
  section: z.string().optional().default("A"),
  rollNumber: z.string().optional(),
  examAppearedIn: z.enum(['School', 'Board', 'NA', 'CBSEBoard', 'SchoolFailed', 'SchoolPassed', 'SchoolCompartment', 'BoardPassed', 'BoardFailed', 'BoardCompartment']).default('School'),
  qualifiedForPromotion: z.enum(['Yes', 'No', 'NA', 'Pass', 'Fail', 'Compartment', 'AsperCBSEBoardResult', 'AppearedinclassXExam', 'AppearedinclassXIIExam']).default('Yes'),
  reasonForLeaving: z.enum(['FamilyRelocation', 'AdmissionInOtherSchool', 'Duetolongabsencewithoutinformation', 'FatherJobTransfer', 'GetAdmissioninHigherClass', 'GoingtoNativePlace', 'ParentWill', 'Passedoutfromtheschool', 'Shiftingtootherplace', 'TransferCase', 'Other']),
  dateOfLeaving: z.string().min(1, "Date of leaving is required"),
  lastAttendanceDate: z.string().min(1, "Last attendance date is required"),
  toClass: z.string().optional(),
  classInWords: z.string().optional(),
  maxAttendance: z.union([z.string(), z.number()]).transform(val => Number(val)),
  obtainedAttendance: z.union([z.string(), z.number()]).transform(val => Number(val)),
  subjectsStudied: z.string().min(1, "Subjects studied is required"),
  generalConduct: z.enum(['Excellent', 'Good', 'Satisfactory', 'NeedsImprovement', 'Poor']),
  behaviorRemarks: z.string().optional(),
  feesPaidUpTo: z.string().min(1, "Fees paid up to date is required"),
  tcCharge: z.union([z.string(), z.number()]).transform(val => Number(val)).default(0),
  feeConcession: z.enum(['None', 'Partial', 'Full']).default('None'),
  gamesPlayed: z.array(z.string()).optional(),
  extraActivities: z.array(z.string()).optional(),
  issuedDate: z.string().optional(),
  tcNumber: z.string().optional()
});

const LocalTCUpdateSchema = LocalTCCreateSchema.partial();

export const validateTCCreate = (req, res, next) => {
  try {
    // If data is coming from frontend, convert it to the backend model
    if (req.body.studentName && !req.body.fullName) {
      req.body = convertFrontendToBackend(req.body);
    }
    
    // Note: schoolId and studentId are now handled by authentication middleware
    // We don't need to add them here as they come from authenticated context
    
    const validatedData = LocalTCCreateSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    console.error('TC Validation Error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed', 
        details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      });
    }
    res.status(400).json({ 
      success: false,
      error: 'Invalid data', 
      details: error.message 
    });
  }
};

export const validateTCUpdate = (req, res, next) => {
  try {
    // If data is coming from frontend, convert it to the backend model
    if (req.body.studentName && !req.body.fullName) {
      req.body = convertFrontendToBackend(req.body);
    }
    
    const validatedData = LocalTCUpdateSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    console.error('TC Update Validation Error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed', 
        details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      });
    }
    res.status(400).json({ 
      success: false,
      error: 'Invalid data', 
      details: error.message 
    });
  }
}; 