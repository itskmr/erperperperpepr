import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getStudentByAdmissionNumber, fetchStudentDetails } from '../controllers/tcfromController.js';
import { 
  getStudentsByCurrentClass, 
  createStudent, 
  getAllStudents, 
  getStudentById, 
  updateStudent, 
  deleteStudent, 
  getStudentByAdmissionNo,
  addStudentDocument,
  deleteStudentDocument,
  getStudentDocuments,
  updateStudentDocument
} from '../controllers/studentFun/studentController.js';
import { protect, authorize, enforceSchoolIsolation, validateSchoolOwnership } from '../middlewares/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get directory name (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Array of document fields to handle uploads based on schema
const documentFields = [
  { name: 'documents.studentImage', maxCount: 1 },
  { name: 'documents.fatherImage', maxCount: 1 },
  { name: 'documents.motherImage', maxCount: 1 },
  { name: 'documents.guardianImage', maxCount: 1 },
  { name: 'documents.signature', maxCount: 1 },
  { name: 'documents.parentSignature', maxCount: 1 },
  { name: 'documents.birthCertificate', maxCount: 1 },
  { name: 'documents.transferCertificate', maxCount: 1 },
  { name: 'documents.markSheet', maxCount: 1 },
  { name: 'documents.aadhaarCard', maxCount: 1 },
  { name: 'documents.fatherAadhar', maxCount: 1 },
  { name: 'documents.motherAadhar', maxCount: 1 },
  { name: 'documents.familyId', maxCount: 1 },
  { name: 'documents.fatherSignature', maxCount: 1 },
  { name: 'documents.motherSignature', maxCount: 1 },
  { name: 'documents.guardianSignature', maxCount: 1 },
  { name: 'documents.migrationCertificate', maxCount: 1 },
  { name: 'documents.affidavitCertificate', maxCount: 1 },
  { name: 'documents.incomeCertificate', maxCount: 1 },
  { name: 'documents.addressProof1', maxCount: 1 },
  { name: 'documents.addressProof2', maxCount: 1 },
  // Also support direct field names for backward compatibility
  { name: 'studentImage', maxCount: 1 },
  { name: 'fatherImage', maxCount: 1 },
  { name: 'motherImage', maxCount: 1 },
  { name: 'guardianImage', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  { name: 'parentSignature', maxCount: 1 },
  { name: 'birthCertificate', maxCount: 1 },
  { name: 'transferCertificate', maxCount: 1 },
  { name: 'markSheet', maxCount: 1 },
  { name: 'aadhaarCard', maxCount: 1 },
  { name: 'fatherAadhar', maxCount: 1 },
  { name: 'motherAadhar', maxCount: 1 },
  { name: 'familyId', maxCount: 1 },
  { name: 'fatherSignature', maxCount: 1 },
  { name: 'motherSignature', maxCount: 1 },
  { name: 'guardianSignature', maxCount: 1 },
  { name: 'migrationCertificate', maxCount: 1 },
  { name: 'affidavitCertificate', maxCount: 1 },
  { name: 'incomeCertificate', maxCount: 1 },
  { name: 'addressProof1', maxCount: 1 },
  { name: 'addressProof2', maxCount: 1 }
];

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use a visible uploads directory in the project root
    const uploadDir = path.join(process.cwd(), 'uploads', 'students');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use admission number + field name + timestamp + original extension
    const admissionNo = req.body.admissionNo || req.body['admissionNo'] || 'unknown';
    const fieldName = file.fieldname.replace('documents.', ''); // Remove documents prefix if present
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    
    cb(null, `${admissionNo}-${fieldName}-${timestamp}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDF, and Word documents are allowed.'));
    }
  }
});

// Configure multer for single document upload
const singleDocumentUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDF, and Word documents are allowed.'));
    }
  }
}).single('document');

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size allowed is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

// ==================== PROTECTED ROUTES WITH SCHOOL ISOLATION ====================

// Get all students with filters - PROTECTED WITH SCHOOL ISOLATION
router.get('/', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  getAllStudents
);

// Get student by ID - PROTECTED WITH SCHOOL ISOLATION
router.get('/:id', 
  protect, 
  authorize('admin', 'school', 'teacher', 'student', 'parent'), 
  validateSchoolOwnership('student', 'id'),
  getStudentById
);

// Create new student - PROTECTED WITH SCHOOL ISOLATION
router.post('/', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  upload.fields(documentFields), 
  handleMulterError, 
  createStudent
);

// Update student - PROTECTED WITH SCHOOL ISOLATION
router.put('/:id', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  validateSchoolOwnership('student', 'id'),
  updateStudent
);

// Delete student - PROTECTED WITH SCHOOL ISOLATION
router.delete('/:id', 
  protect, 
  authorize('admin', 'school'), 
  validateSchoolOwnership('student', 'id'),
  deleteStudent
);

// Get student by admission number - PROTECTED WITH SCHOOL ISOLATION
router.get('/admission/:admissionNo', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  getStudentByAdmissionNo
);

// Get students by class and section - PROTECTED WITH SCHOOL ISOLATION
router.get('/class/:className/section/:section', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  getStudentsByCurrentClass
);

// ==================== DOCUMENT MANAGEMENT ROUTES - PROTECTED ====================

// Get all documents for a student - PROTECTED
router.get('/:id/documents', 
  protect, 
  authorize('admin', 'school', 'teacher', 'student', 'parent'), 
  validateSchoolOwnership('student', 'id'),
  getStudentDocuments
);

// Add document to student - PROTECTED
router.post('/:id/documents', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  validateSchoolOwnership('student', 'id'),
  singleDocumentUpload, 
  handleMulterError, 
  addStudentDocument
);

// Update document for student - PROTECTED
router.put('/:id/documents/:documentType', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  validateSchoolOwnership('student', 'id'),
  singleDocumentUpload, 
  handleMulterError, 
  updateStudentDocument
);

// Delete document from student - PROTECTED
router.delete('/:id/documents/:documentType', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  validateSchoolOwnership('student', 'id'),
  deleteStudentDocument
);

// ==================== TC FORM RELATED ROUTES - PROTECTED ====================

// Get student by admission number for TC form - PROTECTED
router.get('/lookup/:admissionNumber', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  getStudentByAdmissionNumber
);

// Fetch student details for TC form - PROTECTED
router.get('/details/:admissionNumber', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  fetchStudentDetails
);

// ==================== LEGACY ROUTES (DEPRECATED - TO BE REMOVED) ====================
// These routes are kept for backward compatibility but should be migrated to use protected routes

// DEPRECATED: Get all students with filters (without authentication)
router.get('/legacy/all', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      schoolId,
      class: className,
      section,
      category
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause based on filters
    const where = {
      schoolId: parseInt(schoolId)
    };

    // Add category filter if provided
    if (category) {
      where.category = category;
    }

    // Add class and section filters if provided
    if (className || section) {
      where.sessionInfo = {
        is: {
          ...(className && { currentClass: className }),
          ...(section && { currentSection: section })
        }
      };
    }
    
    const students = await prisma.student.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        sessionInfo: {
          select: {
            currentClass: true,
            currentSection: true
          }
        }
      }
    });
    
    // Get total count for pagination
    const total = await prisma.student.count({ where });
    
    res.json({ 
      success: true, 
      data: students,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching students',
      error: error.message
    });
  }
});

export default router;