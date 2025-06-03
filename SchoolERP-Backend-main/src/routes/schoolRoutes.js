import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

// JWT Secret (should be in environment variable in production) - standardized across all files
const JWT_SECRET = process.env.JWT_SECRET || 'school_management_secret_key';

// GET a school by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const school = await prisma.school.findUnique({
      where: { id: parseInt(id) },
    });

    if (!school) {
      return res.status(404).json({ 
        success: false, 
        message: 'School not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: {
        id: school.id,
        name: school.name,
        address: school.address,
        contactNumber: school.contactNumber,
        email: school.email,
        principalName: school.principalName,

        status: school.status
      }
    });
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch school', 
      error: error.message 
    });
  }
});

// POST create a new school
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      address, 
      contactNumber, 
      email, 
      principalName 
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and email are required fields' 
      });
    }

    // Check if email already exists
    const existingSchool = await prisma.school.findUnique({
      where: { email },
    });

    if (existingSchool) {
      return res.status(400).json({ 
        success: false, 
        message: 'School with this email already exists' 
      });
    }

    // Create the school
    const school = await prisma.school.create({
      data: {
        name,
        address: address || '',
        contactNumber: contactNumber || '',
        email,
        principalName: principalName || '',
        status: 'active'
      },
    });

    res.status(201).json({ 
      success: true, 
      data: {
        id: school.id,
        name: school.name,
        address: school.address,
        contactNumber: school.contactNumber,
        email: school.email,
        principalName: school.principalName,
        status: school.status
      }
    });
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create school', 
      error: error.message 
    });
  }
});

// GET school info for printing and general use
router.get('/info', async (req, res) => {
  try {
    // Get the first school (assuming single school system)
    const school = await prisma.school.findFirst({
      select: {
        schoolName: true,
        address: true,
        phone: true,
        email: true,
        principal: true,
        established: true,
        image_url: true
      }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    res.status(200).json({ 
      success: true, 
      data: school
    });
  } catch (error) {
    console.error('Error fetching school info:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch school information', 
      error: error.message 
    });
  }
});

// Student Login (Email)
router.post('/student/email-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find student by email
    const student = await prisma.student.findUnique({
      where: { email: email },
      include: {
        sessionInfo: true,
        parentInfo: true
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found with this email'
      });
    }

    // Check if student login is enabled
    if (!student.loginEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Student login is not enabled. Please contact administration.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, student.emailPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Update last login
    await prisma.student.update({
      where: { id: student.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: student.id, 
        email: student.email,
        admissionNo: student.admissionNo, 
        type: 'student',
        schoolId: student.schoolId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        student: {
          id: student.id,
          fullName: student.fullName,
          admissionNo: student.admissionNo,
          email: student.email,
          currentClass: student.sessionInfo?.currentClass,
          currentSection: student.sessionInfo?.currentSection,
          lastLogin: student.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Student email login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Student Login
router.post('/student/login', async (req, res) => {
  try {
    const { admissionNo, password } = req.body;

    if (!admissionNo || !password) {
      return res.status(400).json({
        success: false,
        message: 'Admission number and password are required'
      });
    }

    // Find student by admission number
    const student = await prisma.student.findUnique({
      where: { admissionNo: admissionNo.toString() },
      include: {
        sessionInfo: true,
        parentInfo: true
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if student login is enabled
    if (!student.loginEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Student login is not enabled. Please contact administration.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, student.emailPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Update last login
    await prisma.student.update({
      where: { id: student.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: student.id, 
        admissionNo: student.admissionNo, 
        type: 'student',
        schoolId: student.schoolId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        student: {
          id: student.id,
          fullName: student.fullName,
          admissionNo: student.admissionNo,
          email: student.email,
          currentClass: student.sessionInfo?.currentClass,
          currentSection: student.sessionInfo?.currentSection,
          lastLogin: student.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Parent Login (Email)
router.post('/parent/email-login', async (req, res) => {
  try {
    const { email, password, parentType } = req.body;

    if (!email || !password || !parentType) {
      return res.status(400).json({
        success: false,
        message: 'Email, password and parent type are required'
      });
    }

    if (!['father', 'mother'].includes(parentType)) {
      return res.status(400).json({
        success: false,
        message: 'Parent type must be either father or mother'
      });
    }

    // Find student by parent email
    const whereClause = parentType === 'father' 
      ? { fatherEmail: email }
      : { motherEmail: email };

    const student = await prisma.student.findFirst({
      where: whereClause,
      include: {
        sessionInfo: true,
        parentInfo: true
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Parent not found with this email for ${parentType}`
      });
    }

    // Verify password
    const passwordField = parentType === 'father' ? student.fatherEmailPassword : student.motherEmailPassword;
    
    if (!passwordField) {
      return res.status(404).json({
        success: false,
        message: `No password set for ${parentType} account`
      });
    }

    const isValidPassword = await bcrypt.compare(password, passwordField);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        studentId: student.id,
        parentType: parentType,
        email: email,
        type: 'parent',
        schoolId: student.schoolId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare parent info
    const parentInfo = {
      type: parentType,
      email: email,
      studentName: student.fullName,
      studentAdmissionNo: student.admissionNo,
      currentClass: student.sessionInfo?.currentClass,
      currentSection: student.sessionInfo?.currentSection,
      studentId: student.id,
      parentDetails: parentType === 'father' 
        ? {
            name: student.fatherName,
            contact: student.parentInfo?.fatherContact,
            occupation: student.parentInfo?.fatherOccupation,
            qualification: student.parentInfo?.fatherQualification
          }
        : {
            name: student.motherName,
            contact: student.parentInfo?.motherContact,
            occupation: student.parentInfo?.motherOccupation,
            qualification: student.parentInfo?.motherQualification
          }
    };

    res.status(200).json({
      success: true,
      message: 'Parent login successful',
      data: {
        token,
        parent: parentInfo
      }
    });
  } catch (error) {
    console.error('Parent email login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Parent Login (Father)
router.post('/parent/father/login', async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Login ID and password are required'
      });
    }

    // Find student by father login ID
    const student = await prisma.student.findUnique({
      where: { fatherLoginId: loginId },
      include: {
        sessionInfo: true,
        parentInfo: true
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Parent login not found'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, student.fatherPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        studentId: student.id,
        parentType: 'father',
        loginId: loginId,
        type: 'parent',
        schoolId: student.schoolId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Parent login successful',
      data: {
        token,
        parent: {
          type: 'father',
          loginId: loginId,
          studentName: student.fullName,
          studentAdmissionNo: student.admissionNo,
          currentClass: student.sessionInfo?.currentClass,
          currentSection: student.sessionInfo?.currentSection
        }
      }
    });
  } catch (error) {
    console.error('Parent login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Parent Login (Mother)
router.post('/parent/mother/login', async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Login ID and password are required'
      });
    }

    // Find student by mother login ID
    const student = await prisma.student.findUnique({
      where: { motherLoginId: loginId },
      include: {
        sessionInfo: true,
        parentInfo: true
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Parent login not found'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, student.motherPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        studentId: student.id,
        parentType: 'mother',
        loginId: loginId,
        type: 'parent',
        schoolId: student.schoolId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Parent login successful',
      data: {
        token,
        parent: {
          type: 'mother',
          loginId: loginId,
          studentName: student.fullName,
          studentAdmissionNo: student.admissionNo,
          currentClass: student.sessionInfo?.currentClass,
          currentSection: student.sessionInfo?.currentSection
        }
      }
    });
  } catch (error) {
    console.error('Parent login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Verify Token Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Student Profile (Protected Route)
router.get('/student/profile', verifyToken, async (req, res) => {
  try {
    if (req.user.type !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const student = await prisma.student.findUnique({
      where: { id: req.user.id },
      include: {
        sessionInfo: true,
        parentInfo: true,
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

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Parent Dashboard (Protected Route)
router.get('/parent/dashboard', verifyToken, async (req, res) => {
  try {
    if (req.user.type !== 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const student = await prisma.student.findUnique({
      where: { id: req.user.studentId },
      include: {
        sessionInfo: true,
        parentInfo: true,
        transportInfo: true,
        attendance: {
          take: 30,
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        student: {
          fullName: student.fullName,
          admissionNo: student.admissionNo,
          currentClass: student.sessionInfo?.currentClass,
          currentSection: student.sessionInfo?.currentSection,
          attendance: student.attendance
        },
        parentType: req.user.parentType
      }
    });
  } catch (error) {
    console.error('Error fetching parent dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard',
      error: error.message
    });
  }
});

export default router; 