import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getStudentByAdmissionNumber, fetchStudentDetails } from '../controllers/tcfromController.js';
import { getStudentsByCurrentClass } from '../controllers/studentFun/studentController.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get directory name (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'students');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use admission number + field name + timestamp + original extension
    const admissionNo = req.body.admissionNo || 'unknown';
    const fieldName = file.fieldname.replace(/documents\./, '');
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
});

// Array of document fields to handle uploads
const documentFields = [
  { name: 'documents.studentImage', maxCount: 1 },
  { name: 'documents.fatherImage', maxCount: 1 },
  { name: 'documents.motherImage', maxCount: 1 },
  { name: 'documents.guardianImage', maxCount: 1 },
  { name: 'documents.signature', maxCount: 1 },
  { name: 'documents.parentSignature', maxCount: 1 },
  { name: 'documents.fatherAadhar', maxCount: 1 },
  { name: 'documents.motherAadhar', maxCount: 1 },
  { name: 'documents.birthCertificate', maxCount: 1 },
  { name: 'documents.migrationCertificate', maxCount: 1 },
  { name: 'documents.aadhaarCard', maxCount: 1 },
  { name: 'documents.affidavitCertificate', maxCount: 1 },
  { name: 'documents.incomeCertificate', maxCount: 1 },
  { name: 'documents.addressProof1', maxCount: 1 },
  { name: 'documents.addressProof2', maxCount: 1 }
];

// Get all students
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, schoolId = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const students = await prisma.student.findMany({
      where: {
        schoolId: parseInt(schoolId)
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        parentInfo: true,
        sessionInfo: true,
        transportInfo: true,
        documents: true,
        educationInfo: true,
        otherInfo: true
      }
    });
    
    // Get total count for pagination
    const total = await prisma.student.count({
      where: { schoolId: parseInt(schoolId) }
    });
    
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
        documents: true,
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
router.post('/', upload.fields(documentFields), async (req, res) => {
  try {
    const data = req.body;
    const files = req.files || {};
    
    console.log('Student registration data received:', Object.keys(data));
    
    // Validate required fields
    const requiredFields = [
      'fullName', 
      'admissionNo', 
      'gender', 
      'mobileNumber', 
      'address.city', 
      'address.state', 
      'father.name', 
      'mother.name',
      'admitSession.class',
      'admitSession.section'
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
        'address.city': 'City',
        'address.state': 'State',
        'father.name': 'Father\'s Name',
        'mother.name': 'Mother\'s Name',
        'admitSession.class': 'Admission Class',
        'admitSession.section': 'Admission Section'
      };
      
      const readableMissingFields = missingFields.map(field => 
        fieldDisplayNames[field] || field.charAt(0).toUpperCase() + field.slice(1)
      );
      
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${readableMissingFields.join(', ')}`,
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
      const defaultSchool = await prisma.school.create({
        data: {
          fullName: "Default School",
          email: "default@school.com",
          password: "default123", // You should change this
          code: "SC001",
          address: "Default Address",
          contact: 1234567890,
          principal: "Default Principal",
          established: 2000,
          role: "SCHOOL",
          status: "active",
          username: "default_school"
        }
      });
      schoolId = defaultSchool.id;
    }

    // Create the student record with session info
    const student = await prisma.student.create({
      data: {
        // Basic information
        fullName: data.fullName,
        admissionNo: data.admissionNo,
        dateOfBirth,
        age: data.age ? parseInt(data.age) : null,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        nationality: data.nationality || 'Indian',
        religion: data.religion,
        category: data.category,
        caste: data.caste,
        aadhaarNumber: data.aadhaarNumber,
        mobileNumber: data.mobileNumber,
        email: data.email,
        emailPassword: data.emailPassword,
        emergencyContact: data.emergencyContact,
        branchName: data.branchName,
        
        // Address information
        houseNo: data['address.houseNo'],
        street: data['address.street'],
        city: data['address.city'],
        state: data['address.state'],
        pinCode: data['address.pinCode'],
        permanentHouseNo: data['address.permanentHouseNo'],
        permanentStreet: data['address.permanentStreet'],
        permanentCity: data['address.permanentCity'],
        permanentState: data['address.permanentState'],
        permanentPinCode: data['address.permanentPinCode'],
        sameAsPresentAddress: data['address.sameAsPresentAddress'] === 'true',
        
        // Parent information
        fatherName: data['father.name'],
        fatherEmail: data['father.email'],
        fatherEmailPassword: data['father.emailPassword'],
        motherName: data['mother.name'],
        motherEmail: data['mother.email'] || null,
        motherEmailPassword: data['mother.emailPassword'] || null,
        
        // Connect to school
        schoolId: schoolId,
        
        // Session information - both admission and current session
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
            admitDate: new Date(), // Set current date as admission date
            
            // Current session fields - store the values from currentSession
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
            fatherEmail: data['father.email'] || null,
            fatherAadhaarNo: data['father.aadhaarNo'] || null,
            fatherAnnualIncome: data['father.annualIncome'] || null,
            fatherIsCampusEmployee: data['father.isCampusEmployee'] === 'true' ? 'yes' : 'no',
            
            // Mother details
            motherQualification: data['mother.qualification'] || null,
            motherOccupation: data['mother.occupation'] || null,
            motherContact: data['mother.contactNumber'] || null,
            motherEmail: data['mother.email'] || null,
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
        
        // Documents
        documents: {
          create: {
            ...documentPaths,
            academicRegistrationNo: data['academic.registrationNo'] || null
          }
        },
        
        // Education information
        educationInfo: {
          create: {
            lastSchool: data['lastEducation.school'] || null,
            lastSchoolAddress: data['lastEducation.address'] || null,
            lastTcDate,
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
        documents: true,
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
      where: { id: parseInt(id) },
      include: {
        parentInfo: true,
        sessionInfo: true,
        transportInfo: true,
        documents: true,
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
      where: { id: parseInt(id) }
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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    console.log(`Updating student with ID: ${id}`);
    
    // First check if the student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Update main student record
    const updatedStudent = await prisma.$transaction(async (tx) => {
      // 1. Update main student record
      const student = await tx.student.update({
        where: { id: parseInt(id) },
        data: {
          firstName: data.firstName,
          middleName: data.middleName || null,
          lastName: data.lastName,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          bloodGroup: data.bloodGroup || null,
          mobileNumber: data.mobileNumber,
          email: data.email || null,
          className: data.className,
          section: data.section || null,
          rollNumber: data.rollNumber || null
        }
      });
      
      // 2. If parent info is provided, update it
      if (data.father || data.mother) {
        await tx.parentInfo.update({
          where: { studentId: parseInt(id) },
          data: {
            fatherName: data.father?.name || existingStudent.fatherName,
            fatherContact: data.father?.contactNumber || null,
            motherName: data.mother?.name || existingStudent.motherName,
            motherContact: data.mother?.contactNumber || null
          }
        });
      }
      
      // 3. If address info is provided, update it
      if (data.address) {
        await tx.student.update({
          where: { id: parseInt(id) },
          data: {
            presentCity: data.address.city || existingStudent.presentCity,
            presentState: data.address.state || existingStudent.presentState,
            presentPinCode: data.address.pinCode || existingStudent.presentPinCode
          }
        });
      }
      
      // Return complete updated student with all relations
      return tx.student.findUnique({
        where: { id: parseInt(id) },
        include: {
          parentInfo: true,
          sessionInfo: true,
          transportInfo: true,
          documents: true,
          educationInfo: true,
          otherInfo: true
        }
      });
    });
    
    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
    
  } catch (error) {
    console.error('Error updating student:', error);
    
    let errorMessage = 'Failed to update student';
    
    if (error.code) {
      // Handle Prisma database errors
      switch (error.code) {
        case 'P2002': // Unique constraint violation
          errorMessage = `A student with this ${error.meta?.target?.[0] || 'field'} already exists`;
          break;
        case 'P2025': // Record not found
          errorMessage = 'Student not found';
          break;
        default:
          errorMessage = `Database error: ${error.code}`;
      }
    }
    
    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
});

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

export default router;