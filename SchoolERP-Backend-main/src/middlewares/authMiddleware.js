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
    
    // Get user role from either 'role' or 'type' field (students/parents use 'type')
    const userRole = decoded.role || decoded.type;
    
    console.log('Authentication debug:', {
      decodedRole: decoded.role,
      decodedType: decoded.type,
      finalUserRole: userRole,
      userId: decoded.id,
      studentId: decoded.studentId
    });
    
    // Get user based on role
    let user;
    let schoolId = null;
    
    switch (userRole) {
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
        // For school users, the schoolId is their own ID
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
        // For parents, get the student's school ID directly from the JWT token
        // Since parent login sets studentId and schoolId in the token
        if (decoded.studentId) {
          const student = await prisma.student.findUnique({
            where: { id: decoded.studentId },
            select: { schoolId: true, fullName: true }
          });
          schoolId = student?.schoolId;
          // Create a pseudo user object for parent
          user = {
            id: decoded.studentId, // Use student ID for parent context
            email: decoded.email,
            parentType: decoded.parentType,
            studentName: student?.fullName
          };
        } else {
          // Fallback to old parent structure (if any)
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
        }
        break;
        
      default:
        console.log('Invalid user role in token:', userRole);
        return res.status(400).json({ 
          success: false, 
          error: "Invalid user role in token" 
        });
    }
    
    if (!user) {
      console.log('User not found for role:', userRole, 'ID:', decoded.id);
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
    if (userRole === 'student' && !user.loginEnabled) {
      return res.status(403).json({ 
        success: false, 
        error: "Student login is not enabled. Please contact administration." 
      });
    }
    
    // Add user info and school context to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: userRole, // Use the determined role
      type: userRole, // Also set type for backward compatibility
      schoolId: schoolId,
      userData: user
    };
    
    console.log('Authentication successful:', {
      userId: req.user.id,
      role: req.user.role,
      schoolId: req.user.schoolId
    });
    
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

// Enhanced middleware for strict school-based data isolation
export const enforceSchoolIsolation = (req, res, next) => {
  // Skip enforcement for admins (they can access all schools)
  if (req.user?.role === 'admin') {
    return next();
  }
  
  // Ensure user has a school context
  if (!req.user?.schoolId) {
    return res.status(400).json({ 
      success: false, 
      error: "School context required for this operation" 
    });
  }
  
  // Prevent manual override of schoolId in request body/params for non-admin users
  if (req.body && req.body.schoolId && parseInt(req.body.schoolId) !== req.user.schoolId) {
    return res.status(403).json({ 
      success: false, 
      error: "You can only access data from your own school" 
    });
  }
  
  if (req.params && req.params.schoolId && parseInt(req.params.schoolId) !== req.user.schoolId) {
    return res.status(403).json({ 
      success: false, 
      error: "You can only access data from your own school" 
    });
  }
  
  if (req.query && req.query.schoolId && parseInt(req.query.schoolId) !== req.user.schoolId) {
    return res.status(403).json({ 
      success: false, 
      error: "You can only access data from your own school" 
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
  
  // If no school context available, return null (don't fallback to random school)
  return null;
};

// Helper function to build where clause with school context for database queries
export const addSchoolFilter = (req, baseWhere = {}) => {
  const schoolId = req.user?.schoolId;
  
  // Admins can optionally filter by school or see all data
  if (req.user?.role === 'admin') {
    // Check if admin wants to filter by specific school
    const requestedSchoolId = req.params.schoolId || req.query.schoolId || req.body.schoolId;
    if (requestedSchoolId) {
      return { ...baseWhere, schoolId: parseInt(requestedSchoolId) };
    }
    // If admin doesn't specify schoolId and query parameter 'all' is not true, don't add filter
    if (req.query.all !== 'true') {
      return baseWhere; // No school filter for admin unless specified
    }
    return baseWhere;
  }
  
  // For non-admin users, always filter by their school
  if (schoolId) {
    return { ...baseWhere, schoolId: schoolId };
  }
  
  // If no school context and not admin, return impossible condition
  return { ...baseWhere, schoolId: -1 }; // This will return no results
};

// Middleware to validate school ownership of resource
export const validateSchoolOwnership = (modelName, idField = 'id') => {
  return async (req, res, next) => {
    // Skip for admins
    if (req.user?.role === 'admin') {
      return next();
    }
    
    // Ensure user has school context
    if (!req.user?.schoolId) {
      return res.status(400).json({ 
        success: false, 
        error: "School context required" 
      });
    }
    
    try {
      const resourceId = req.params[idField];
      if (!resourceId) {
        return res.status(400).json({ 
          success: false, 
          error: `${idField} parameter is required` 
        });
      }
      
      // Check resource ownership based on model
      let resource;
      switch (modelName.toLowerCase()) {
        case 'student':
          resource = await prisma.student.findUnique({
            where: { id: resourceId },
            select: { schoolId: true }
          });
          break;
        case 'teacher':
          resource = await prisma.teacher.findUnique({
            where: { id: parseInt(resourceId) },
            select: { schoolId: true }
          });
          break;
        case 'timetable':
          resource = await prisma.timetable.findUnique({
            where: { id: parseInt(resourceId) },
            select: { schoolId: true }
          });
          break;
        case 'transfercertificate':
          resource = await prisma.transferCertificate.findUnique({
            where: { id: parseInt(resourceId) },
            select: { schoolId: true }
          });
          break;
        case 'registration':
          resource = await prisma.registration.findUnique({
            where: { registrationId: parseInt(resourceId) },
            select: { schoolId: true }
          });
          break;
        default:
          return res.status(400).json({ 
            success: false, 
            error: `Unsupported model: ${modelName}` 
          });
      }
      
      if (!resource) {
        return res.status(404).json({ 
          success: false, 
          error: `${modelName} not found` 
        });
      }
      
      if (resource.schoolId !== req.user.schoolId) {
        return res.status(403).json({ 
          success: false, 
          error: "You can only access resources from your own school" 
        });
      }
      
      next();
    } catch (error) {
      console.error('School ownership validation error:', error);
      return res.status(500).json({ 
        success: false, 
        error: "Error validating resource ownership" 
      });
    }
  };
};

    

