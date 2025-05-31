import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Production-ready authentication middleware
export const protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers.authorization) {
      token = req.headers.authorization;
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: "Access denied. No token provided." 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'school_management_secret_key');
    
    // Get user based on role
    let user;
    let schoolId = null;
    
    switch (decoded.role) {
      case 'admin':
        user = await prisma.admin.findUnique({ 
          where: { id: decoded.id },
          select: { id: true, email: true, fullName: true, role: true, status: true }
        });
        // Admins can access any school - schoolId will be determined per request
        break;
        
      case 'school':
        user = await prisma.school.findUnique({ 
          where: { id: decoded.id },
          select: { id: true, email: true, schoolName: true, role: true, status: true }
        });
        schoolId = user?.id; // School's own ID
        break;
        
      case 'teacher':
        user = await prisma.teacher.findUnique({ 
          where: { id: decoded.id },
          select: { id: true, email: true, fullName: true, role: true, status: true, schoolId: true }
        });
        schoolId = user?.schoolId; // Teacher's school ID
        break;
        
      case 'student':
        user = await prisma.student.findUnique({ 
          where: { id: decoded.id },
          select: { id: true, email: true, fullName: true, schoolId: true, loginEnabled: true }
        });
        schoolId = user?.schoolId; // Student's school ID
        break;
        
      case 'parent':
        // For parents, we need to get school through student
        const parentInfo = await prisma.parentInfo.findUnique({
          where: { id: decoded.id },
          include: { 
            student: { 
              select: { schoolId: true, fullName: true } 
            } 
          }
        });
        user = parentInfo;
        schoolId = parentInfo?.student?.schoolId;
        break;
        
      default:
        return res.status(400).json({ 
          success: false, 
          error: "Invalid user role in token" 
        });
    }
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: "Token is valid but user not found" 
      });
    }
    
    // Check if account is active (except for students/parents who don't have status field)
    if (user.status && user.status === 'inactive') {
      return res.status(403).json({ 
        success: false, 
        error: "Your account is inactive. Please contact administrator." 
      });
    }
    
    // For students, check if login is enabled
    if (decoded.role === 'student' && !user.loginEnabled) {
      return res.status(403).json({ 
        success: false, 
        error: "Student login is not enabled. Please contact administration." 
      });
    }
    
    // Add user info and school context to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: decoded.role,
      schoolId: schoolId,
      userData: user
    };
    
    // Verify school exists and is active (if schoolId is present)
    if (schoolId) {
      const school = await prisma.school.findUnique({
        where: { id: schoolId },
        select: { id: true, schoolName: true, status: true }
      });
      
      if (!school) {
        return res.status(404).json({ 
          success: false, 
          error: "Associated school not found" 
        });
      }
      
      if (school.status === 'inactive') {
        return res.status(403).json({ 
          success: false, 
          error: "Associated school is inactive" 
        });
      }
      
      req.school = school;
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: "Invalid token" 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: "Token expired" 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: "Authentication error" 
    });
  }
};

// Authorization middleware for role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: "Authentication required" 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}` 
      });
    }
    
    next();
  };
};

// Middleware to ensure school context exists
export const requireSchoolContext = (req, res, next) => {
  if (!req.user?.schoolId && req.user?.role !== 'admin') {
    return res.status(400).json({ 
      success: false, 
      error: "School context required for this operation" 
    });
  }
  next();
};

// Helper function to get school ID from various sources with authentication context
export const getSchoolIdFromContext = async (req) => {
  // If user is authenticated, prefer their school context
  if (req.user?.schoolId) {
    return req.user.schoolId;
  }
  
  // For admins, allow them to specify school ID in request
  if (req.user?.role === 'admin') {
    if (req.params.schoolId) {
      return parseInt(req.params.schoolId);
    }
    if (req.query.schoolId) {
      return parseInt(req.query.schoolId);
    }
    if (req.body.schoolId) {
      return parseInt(req.body.schoolId);
    }
  }
  
  // If no school context available, try to get first active school (fallback)
  try {
    const school = await prisma.school.findFirst({
      where: { status: 'active' },
      select: { id: true }
    });
    return school?.id || null;
  } catch (error) {
    console.error('Error getting fallback school ID:', error);
    return null;
  }
};

    

