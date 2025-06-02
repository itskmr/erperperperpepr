import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validateStudentInvitation, registerStudent, loginStudent, validateParentInvitation, registerParent, loginParent, checkAdmissionNumber, studentSignupFromForm } from '../controllers/authController.js';

const router = express.Router();
const prisma = new PrismaClient();

// Enhanced login handler with proper school context for multi-school isolation
async function handleLogin(model, req, res) {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: "Email is required" 
      });
    }
    
    // Find user by email with school context where applicable
    let user;
    if (model === prisma.teacher) {
      // For teachers, include school information
      user = await model.findUnique({
        where: { email },
        include: { school: { select: { id: true, schoolName: true, status: true } } }
      });
    } else if (model === prisma.student) {
      // For students, include school information
      user = await model.findUnique({
        where: { email },
        include: { school: { select: { id: true, schoolName: true, status: true } } }
      });
    } else {
      // For admin and school models
      user = await model.findUnique({
        where: { email }
      });
    }
    
    // For development: create a dummy user if it doesn't exist
    if (!user) {
      // Only create dummy users in development environment
      if (process.env.NODE_ENV === 'development') {
        try {
          // Determine the role based on the model
          let role = 'ADMIN';
          if (model === prisma.school) role = 'SCHOOL';
          if (model === prisma.teacher) role = 'TEACHER';

          // Create dummy user with basic info for development
          const hashedPassword = await bcrypt.hash('password123', 10);
          const userData = {
            fullName: `Dev ${role.toLowerCase()}`,
            email,
            password: hashedPassword,
            username: email.split('@')[0],
            phone: '0123456789',
            role,
            status: 'active',
          };

          // Add school-specific fields for teachers
          if (role === 'TEACHER') {
            userData.schoolId; // Default to school 1 for development
            userData.subjects = '[]';
            userData.gender = 'Male'; // Required field
          }

          user = await model.create({ data: userData });
          
          // Re-fetch with school info for teachers
          if (model === prisma.teacher) {
            user = await model.findUnique({
              where: { id: user.id },
              include: { school: { select: { id: true, schoolName: true, status: true } } }
            });
          }
          
          console.log(`Created dummy ${role.toLowerCase()} user for development`);
        } catch (err) {
          console.error('Error creating dummy user:', err);
        }
      }
      
      // If still no user, return error
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: "Invalid email or password" 
        });
      }
    }

    // Check if account is active
    if (user.status && user.status === 'inactive') {
      return res.status(403).json({ 
        success: false, 
        error: "Account is inactive. Please contact administrator." 
      });
    }

    // Check if associated school is active (for teachers and students)
    if (user.school && user.school.status === 'inactive') {
      return res.status(403).json({ 
        success: false, 
        error: "Associated school is inactive." 
      });
    }
    
    // Development: Skip password verification in dev mode, always successful
    // In production, enable password check
    if (process.env.NODE_ENV !== 'development') {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          error: "Invalid email or password" 
        });
      }
    }
    
    // Determine schoolId based on user type
    let schoolId = null;
    if (model === prisma.school) {
      schoolId = user.id; // School's own ID
    } else if (model === prisma.teacher) {
      schoolId = user.schoolId; // Teacher's school
    } else if (model === prisma.student) {
      schoolId = user.schoolId; // Student's school
    }
    // Admin has no specific school (can access all)
    
    // Create JWT token with school context
    const tokenPayload = { 
      id: user.id, 
      email: user.email, 
      role: user.role.toLowerCase()
    };
    
    // Add schoolId to token for non-admin users
    if (schoolId) {
      tokenPayload.schoolId = schoolId;
    }
    
    const token = jwt.sign(
      tokenPayload, 
      process.env.JWT_SECRET || 'school_management_secret_key', 
      { expiresIn: '7d' } // Extended for development
    );
    
    // Update last login timestamp
    await model.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Send response with detailed user info including school context
    const responseData = {
      token,
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role.toLowerCase(),
        status: user.status,
      }
    };

    // Add school context to response for non-admin users
    if (schoolId) {
      responseData.user.schoolId = schoolId;
      if (user.school) {
        responseData.user.schoolName = user.school.schoolName;
      } else if (model === prisma.school) {
        responseData.user.schoolName = user.schoolName;
      }
    }

    return res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Admin login
router.post('/adminLogin', async (req, res) => {
  return handleLogin(prisma.admin, req, res);
});

// School login
router.post('/schoolLogin', async (req, res) => {
  return handleLogin(prisma.school, req, res);
});

// Teacher login
router.post('/teacherLogin', async (req, res) => {
  return handleLogin(prisma.teacher, req, res);
});

// Student Authentication Routes
router.post('/student/validate-invitation', validateStudentInvitation);
router.post('/student/register', registerStudent);
router.post('/student/login', loginStudent);
router.post('/student/check-admission', checkAdmissionNumber);
router.post('/student/signup', studentSignupFromForm);

// Parent Authentication Routes
router.post('/parent/validate-invitation', validateParentInvitation);
router.post('/parent/register', registerParent);
router.post('/parent/login', loginParent);

// Export handler for direct route registration
router.handle = (role, req, res) => {
  switch (role) {
    case 'admin': return handleLogin(prisma.admin, req, res);
    case 'school': return handleLogin(prisma.school, req, res);
    case 'teacher': return handleLogin(prisma.teacher, req, res);
    default: return res.status(400).json({ success: false, error: "Invalid role" });
  }
};

// Re-export controller functions for direct access
router.validateStudentInvitation = validateStudentInvitation;
router.registerStudent = registerStudent;
router.loginStudent = loginStudent;
router.checkAdmissionNumber = checkAdmissionNumber;
router.studentSignupFromForm = studentSignupFromForm;
router.validateParentInvitation = validateParentInvitation;
router.registerParent = registerParent;
router.loginParent = loginParent;

export default router;