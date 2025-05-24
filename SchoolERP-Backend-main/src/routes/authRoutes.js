import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validateStudentInvitation, registerStudent, loginStudent, validateParentInvitation, registerParent, loginParent, checkAdmissionNumber, studentSignupFromForm } from '../controllers/authController.js';

const router = express.Router();
const prisma = new PrismaClient();

// Simplified login handler for development
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
    
    // Find user by email
    let user = await model.findUnique({
      where: { email }
    });
    
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
          user = await model.create({
            data: {
              fullName: `Dev ${role.toLowerCase()}`,
              email,
              password: hashedPassword,
              username: email.split('@')[0],
              phone: '0123456789',
              role,
              status: 'active',
              // Add required fields for teacher or school
              ...(role === 'TEACHER' && {
                class: '',
                subjects: '[]',
                schoolId: 1
              })
            }
          });
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
    
    // Development: Skip password verification, always successful
    // In production, uncomment the password check
    /*
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: "Invalid email or password" 
      });
    }
    */
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role.toLowerCase() 
      }, 
      process.env.JWT_SECRET || 'fallback_secret_key', 
      { expiresIn: '7d' } // Extended for development
    );
    
    // Update last login timestamp
    await model.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Send response with detailed user info for development
    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role.toLowerCase(),
          status: user.status,
        }
      }
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