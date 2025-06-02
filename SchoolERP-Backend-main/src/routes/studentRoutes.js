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
  getStudentByAdmissionNo 
} from '../controllers/studentFun/studentController.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get directory name (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Array of document fields to handle uploads
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
  { name: 'guardianSignature', maxCount: 1 }
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
    // Allow images and PDFs
    if (/^image\/(jpeg|png|jpg|gif)$/.test(file.mimetype) || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'), false);
    }
  }
}).fields(documentFields);

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: `Unexpected field: ${err.field}. Please check the file upload fields.`
      });
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  } else if (err) {
    console.error('Non-multer error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'An error occurred during file upload'
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
router.post('/', upload, handleMulterError, async (req, res) => {
  try {
    const data = req.body;
    const files = req.files || {};
    
    console.log('Student registration data received:', Object.keys(data));
    
    // Validate required fields - updated to match frontend requirements
    const requiredFields = [
      'fullName', 
      'admissionNo', 
      'father.name',
      'admitSession.class'
    ];
    
    const missingFields = requiredFields.filter(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return !data[`${parent}.${child}`];
      }
      return !data[field];
    });
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      // Map nested field names to their readable format for error messages
      const fieldDisplayNames = {
        'father.name': 'Father\'s Name',
        'admitSession.class': 'Class'
      };
      
      const readableMissingFields = missingFields.map(field => 
        fieldDisplayNames[field] || field.charAt(0).toUpperCase() + field.slice(1)
      );
      
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${readableMissingFields.join(', ')}`,
      });
    }

    // Validate email format if provided
    const validateEmail = (email, fieldName) => {
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return `Invalid ${fieldName} email format`;
      }
      return null;
    };

    // Validate phone number format if provided
    const validatePhone = (phone, fieldName) => {
      if (phone && !/^[0-9]{10}$/.test(phone)) {
        return `Invalid ${fieldName} phone number format (must be 10 digits)`;
      }
      return null;
    };

    // Validate Aadhaar number format if provided
    const validateAadhaar = (aadhaar, fieldName) => {
      if (aadhaar && !/^[0-9]{12}$/.test(aadhaar)) {
        return `Invalid ${fieldName} Aadhaar number format (must be 12 digits)`;
      }
      return null;
    };

    // Run validations
    const validationErrors = [];
    
    // Email validations
    const emailError = validateEmail(data.email, 'student');
    if (emailError) validationErrors.push(emailError);
    
    const fatherEmailError = validateEmail(data['father.email'], 'father');
    if (fatherEmailError) validationErrors.push(fatherEmailError);
    
    const motherEmailError = validateEmail(data['mother.email'], 'mother');
    if (motherEmailError) validationErrors.push(motherEmailError);

    // Phone validations
    const phoneError = validatePhone(data.mobileNumber, 'student mobile');
    if (phoneError) validationErrors.push(phoneError);
    
    const fatherPhoneError = validatePhone(data['father.contactNumber'], 'father');
    if (fatherPhoneError) validationErrors.push(fatherPhoneError);
    
    const motherPhoneError = validatePhone(data['mother.contactNumber'], 'mother');
    if (motherPhoneError) validationErrors.push(motherPhoneError);

    // Aadhaar validations
    const aadhaarError = validateAadhaar(data.aadhaarNumber, 'student');
    if (aadhaarError) validationErrors.push(aadhaarError);
    
    const fatherAadhaarError = validateAadhaar(data['father.aadhaarNo'], 'father');
    if (fatherAadhaarError) validationErrors.push(fatherAadhaarError);
    
    const motherAadhaarError = validateAadhaar(data['mother.aadhaarNo'], 'mother');
    if (motherAadhaarError) validationErrors.push(motherAadhaarError);

    // APAAR ID validation
    if (data.apaarId && !/^[0-9]{12}$/.test(data.apaarId)) {
      validationErrors.push('Invalid APAAR ID format (must be 12 digits)');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Validation errors: ${validationErrors.join(', ')}`,
      });
    }

    // Remove any current session fields if they were sent
    delete data.currentSession;
    
    // Format date fields - with extra error handling
    let dateOfBirth = null;
    let lastTcDate = null;
    
    try {
      if (data.dateOfBirth) {
        // Ensure the date is in YYYY-MM-DD format
        const [year, month, day] = data.dateOfBirth.split('-').map(Number);
        dateOfBirth = new Date(year, month - 1, day);
        if (isNaN(dateOfBirth.getTime())) {
          throw new Error(`Invalid date format for dateOfBirth: ${data.dateOfBirth}`);
        }
      }
      
      if (data['lastEducation.tcDate']) {
        const [year, month, day] = data['lastEducation.tcDate'].split('-').map(Number);
        lastTcDate = new Date(year, month - 1, day);
        if (isNaN(lastTcDate.getTime())) {
          throw new Error(`Invalid date format for lastEducation.tcDate: ${data['lastEducation.tcDate']}`);
        }
      }
    } catch (dateError) {
      console.error('Date conversion error:', dateError);
      return res.status(400).json({
        success: false,
        message: dateError.message
      });
    }
    
    // Create document paths object
    const documentPaths = {};
    if (Object.keys(files).length > 0) {
      Object.keys(files).forEach(fieldName => {
        const file = files[fieldName][0];
        const normalizedFieldName = fieldName.replace('documents.', '') + 'Path';
        // Store relative path
        documentPaths[normalizedFieldName] = `/uploads/students/${file.filename}`;
      });
    }
    
    // Initialize schoolId with a default value
    let schoolId = 1;
    try {
      if (data.schoolId) {
        schoolId = parseInt(data.schoolId);
        if (isNaN(schoolId)) {
          schoolId = 1;
        }
      }
    } catch (error) {
      console.error('Error parsing schoolId:', error);
      schoolId = 1;
    }

    // First check if the school exists
    const existingSchool = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!existingSchool) {
      // Create a default school if it doesn't exist
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Create the student record with session info
    const student = await prisma.student.create({
      data: {
        // Basic information - only required fields guaranteed to exist
        fullName: data.fullName, // Required
        admissionNo: data.admissionNo, // Required
        fatherName: data['father.name'], // Required
        
        // Optional fields with proper null handling
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        age: data.age ? parseInt(data.age) : null,
        gender: data.gender || null,
        bloodGroup: data.bloodGroup || null,
        nationality: data.nationality || null,
        religion: data.religion || null,
        category: data.category || null,
        caste: data.caste || null,
        aadhaarNumber: data.aadhaarNumber || null,
        apaarId: data.apaarId || null, // Added APAAR ID field
        penNo: data.penNo || null,
        mobileNumber: data.mobileNumber || null,
        email: data.email || null,
        emailPassword: data.emailPassword || null,
        emergencyContact: data.emergencyContact || null,
        branchName: data.branchName || null,
        
        // Address information - all optional
        houseNo: data['address.houseNo'] || null,
        street: data['address.street'] || null,
        city: data['address.city'] || null,
        state: data['address.state'] || null,
        pinCode: data['address.pinCode'] || null,
        permanentHouseNo: data['address.permanentHouseNo'] || null,
        permanentStreet: data['address.permanentStreet'] || null,
        permanentCity: data['address.permanentCity'] || null,
        permanentState: data['address.permanentState'] || null,
        permanentPinCode: data['address.permanentPinCode'] || null,
        sameAsPresentAddress: data['address.sameAsPresentAddress'] === 'true',
        
        // Parent information - father name is required, others optional
        fatherEmail: data['father.email'] || null,
        fatherEmailPassword: data['father.emailPassword'] || null,
        motherName: data['mother.name'] || null,
        motherEmail: data['mother.email'] || null,
        motherEmailPassword: data['mother.emailPassword'] || null,
        
        // Connect to school
        schoolId: schoolId,
        
        // Session information
        sessionInfo: {
          create: {
            // Admit Session fields
            admitGroup: data['admitSession.group'] || null,
            admitStream: data['admitSession.stream'] || null,
            admitClass: data['admitSession.class'] || null,
            admitSection: data['admitSession.section'] || null,
            admitRollNo: data['admitSession.rollNo'] || null,
            admitSemester: data['admitSession.semester'] || null,
            admitFeeGroup: data['admitSession.feeGroup'] || null,
            admitHouse: data['admitSession.house'] || null,
            admitDate: new Date(),
            
            // Current session fields
            currentGroup: data['currentSession.group'] || null,
            currentStream: data['currentSession.stream'] || null,
            currentClass: data['currentSession.class'] || null,
            currentSection: data['currentSession.section'] || null,
            currentRollNo: data['currentSession.rollNo'] || null,
            currentSemester: data['currentSession.semester'] || null,
            currentFeeGroup: data['currentSession.feeGroup'] || null,
            currentHouse: data['currentSession.house'] || null,
            
            // Previous school information
            previousSchool: data.previousSchool || null
          }
        },
        
        // Parent information
        parentInfo: {
          create: {
            // Father details
            fatherQualification: data['father.qualification'] || null,
            fatherOccupation: data['father.occupation'] || null,
            fatherContact: data['father.contactNumber'] || null,
            fatherAadhaarNo: data['father.aadhaarNo'] || null,
            fatherAnnualIncome: data['father.annualIncome'] || null,
            fatherIsCampusEmployee: data['father.isCampusEmployee'] === 'true' ? 'yes' : 'no',
            
            // Mother details
            motherQualification: data['mother.qualification'] || null,
            motherOccupation: data['mother.occupation'] || null,
            motherContact: data['mother.contactNumber'] || null,
            motherAadhaarNo: data['mother.aadhaarNo'] || null,
            motherAnnualIncome: data['mother.annualIncome'] || null,
            motherIsCampusEmployee: data['mother.isCampusEmployee'] === 'true' ? 'yes' : 'no',
            
            // Guardian details
            guardianName: data['guardian.name'] || null,
            guardianAddress: data['guardian.address'] || null,
            guardianContact: data['guardian.contactNumber'] || null,
            guardianEmail: data['guardian.email'] || null,
            guardianAadhaarNo: data['guardian.aadhaarNo'] || null,
            guardianOccupation: data['guardian.occupation'] || null,
            guardianAnnualIncome: data['guardian.annualIncome'] || null
          }
        },
        
        // Transport information
        transportInfo: {
          create: {
            transportMode: data['transport.mode'] || null,
            transportArea: data['transport.area'] || null,
            transportStand: data['transport.stand'] || null,
            transportRoute: data['transport.route'] || null,
            transportDriver: data['transport.driver'] || null,
            pickupLocation: data['transport.pickupLocation'] || null,
            dropLocation: data['transport.dropLocation'] || null
          }
        },
        
        // Education information
        educationInfo: {
          create: {
            lastSchool: data['lastEducation.school'] || null,
            lastSchoolAddress: data['lastEducation.address'] || null,
            lastTcDate: data['lastEducation.tcDate'] ? new Date(data['lastEducation.tcDate']) : null,
            lastClass: data['lastEducation.prevClass'] || null,
            lastPercentage: data['lastEducation.percentage'] || null,
            lastAttendance: data['lastEducation.attendance'] || null,
            lastExtraActivity: data['lastEducation.extraActivity'] || null
          }
        },
        
        // Other information
        otherInfo: {
          create: {
            belongToBPL: data['other.belongToBPL'] === 'true' ? 'yes' : 'no',
            minority: data['other.minority'] === 'true' ? 'yes' : 'no',
            disability: data['other.disability'] || null,
            accountNo: data['other.accountNo'] || null,
            bank: data['other.bank'] || null,
            ifscCode: data['other.ifscCode'] || null,
            medium: data['other.medium'] || null,
            lastYearResult: data['other.lastYearResult'] || null,
            singleParent: data['other.singleParent'] === 'true' ? 'yes' : 'no',
            onlyChild: data['other.onlyChild'] === 'true' ? 'yes' : 'no',
            onlyGirlChild: data['other.onlyGirlChild'] === 'true' ? 'yes' : 'no',
            adoptedChild: data['other.adoptedChild'] === 'true' ? 'yes' : 'no',
            siblingAdmissionNo: data['other.siblingAdmissionNo'] || null,
            transferCase: data['other.transferCase'] === 'true' ? 'yes' : 'no',
            livingWith: data['other.livingWith'] || null,
            motherTongue: data['other.motherTongue'] || null,
            admissionType: data['other.admissionType'] || 'new',
            udiseNo: data['other.udiseNo'] || null
          }
        }
      },
      include: {
        parentInfo: true,
        sessionInfo: true,
        transportInfo: true,
        // documents: true,
        educationInfo: true,
        otherInfo: true
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: student
    });
    
  } catch (error) {
    console.error('Error creating student:', error);
    
    // Provide more detailed error message based on error type
    let errorMessage = 'Failed to register student';
    
    if (error.code) {
      // Handle Prisma database errors
      switch (error.code) {
        case 'P2002': // Unique constraint violation
          errorMessage = `A student with this ${error.meta?.target?.[0] || 'field'} already exists`;
          break;
        case 'P2003': // Foreign key constraint failed
          errorMessage = 'Invalid relation reference';
          break;
        case 'P2025': // Record not found
          errorMessage = 'Referenced record not found';
          break;
        default:
          errorMessage = `Database error: ${error.code}`;
      }
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
});

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

export default router;