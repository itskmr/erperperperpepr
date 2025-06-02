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

// Get all students with filters
router.get('/', async (req, res) => {
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

// Add route to get student by admission number
router.get('/admission/:admissionNo', async (req, res) => {
  try {
    const { admissionNo } = req.params;
    console.log(`Route: Searching for student with admission number: ${admissionNo}`);
    
    // Search for student by admission number
    const student = await prisma.student.findFirst({
      where: { 
        admissionNo: admissionNo.toString() 
      },
      include: {
        parentInfo: true,
        sessionInfo: true,
        transportInfo: true,
        educationInfo: true,
        otherInfo: true,
      }
    });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.json({ 
      success: true, 
      data: student
    });
  } catch (error) {
    console.error('Error finding student by admission number:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving student',
      error: error.message
    });
  }
});

// Create a new student with all related information
router.post('/', upload.fields(documentFields), handleMulterError, createStudent);

// Get a student by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({
      where: { id: id.toString() }, // Keep ID as string
      include: {
        parentInfo: true,
        sessionInfo: true,
        transportInfo: true,
        educationInfo: true,
        otherInfo: true
      }
    });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching student',
      error: error.message
    });
  }
});

// Delete a student by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete the student (cascading delete will handle related records)
    const student = await prisma.student.delete({
      where: { id: id.toString() } // Use string ID for UUID
    });
    
    return res.status(200).json({
      success: true,
      message: `Student with ID ${id} has been deleted successfully`,
      student
    });
    
  } catch (error) {
    console.error('Error deleting student:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message
    });
  }
});

// Update a student by ID
router.put('/:id', updateStudent);

// Add a new route to update student session information
router.put('/:id/session', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      currentClass,
      currentSection,
      currentRollNo,
      stream,
      semester,
      feeGroup,
      house
    } = req.body;

    // Validate required fields
    if (!currentClass || !currentSection) {
      return res.status(400).json({
        success: false,
        message: 'Current class and section are required'
      });
    }

    // Update the session information
    const updatedSession = await prisma.sessionInfo.update({
      where: {
        studentId: parseInt(id)
      },
      data: {
        currentClass,
        currentSection,
        currentRollNo,
        stream,
        semester,
        feeGroup,
        house
      }
    });

    res.json({
      success: true,
      message: 'Student session information updated successfully',
      data: updatedSession
    });
  } catch (error) {
    console.error('Error updating student session:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student session',
      error: error.message
    });
  }
});

// Student lookup endpoints for TC generation
router.get('/lookup/:admissionNumber', getStudentByAdmissionNumber);
router.get('/details/:admissionNumber', fetchStudentDetails);

// Add new route for getting students by current class and section
router.get('/class/:className/section/:section', getStudentsByCurrentClass);

// Serve uploaded files/images
router.get('/uploads/*', (req, res) => {
  try {
    const filePath = req.params[0]; // Get the full path after /uploads/
    const fullPath = path.join(process.cwd(), 'uploads', filePath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Set appropriate headers based on file extension
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (['.jpg', '.jpeg'].includes(ext)) {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.pdf') {
      contentType = 'application/pdf';
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    
    // Send the file
    res.sendFile(fullPath);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving file'
    });
  }
});

// **NEW DOCUMENT ROUTES**

// Get all documents for a student
router.get('/:id/documents', getStudentDocuments);

// Add or update a specific document for a student
router.post('/:id/documents', singleDocumentUpload, handleMulterError, addStudentDocument);

// Update/replace a specific document for a student
router.put('/:id/documents/:documentType', singleDocumentUpload, handleMulterError, updateStudentDocument);

// Delete a specific document from a student
router.delete('/:id/documents/:documentType', deleteStudentDocument);

// Serve document files
router.get('/documents/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'uploads', 'students', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Set appropriate headers based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (['.jpg', '.jpeg'].includes(ext)) {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.doc') {
      contentType = 'application/msword';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    
    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving document'
    });
  }
});

export default router;