import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Modified to bypass authentication for development purposes
export const protect = async (req, res, next) => {
  // Development bypass - no authentication check
  // Always attach a default user to the request for development
  req.user = {
    id: 1,
    email: 'admin@school.com',
    role: 'admin'
  };
  
  next();
  
  /* Original authentication logic (commented out)
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: "Not authorized, no token" 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'school_management_secret_key');
    
    // Get user based on role
    let user;
    switch (decoded.role) {
      case 'admin':
        user = await prisma.admin.findUnique({ where: { id: decoded.id } });
        break;
      case 'school':
        user = await prisma.school.findUnique({ where: { id: decoded.id } });
        break;
      case 'teacher':
        user = await prisma.teacher.findUnique({ where: { id: decoded.id } });
        break;
      default:
        return res.status(400).json({ success: false, error: "Invalid user role" });
    }
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: "Not authorized, user not found" 
      });
    }
    
    // Check if account is active
    if (user.status === 'inactive') {
      return res.status(403).json({ 
        success: false, 
        error: "Your account is inactive" 
      });
    }
    
    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false, 
      error: "Not authorized, token failed" 
    });
  }
  */
};

// Modified authorization middleware to bypass role checks
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Development bypass - no role check
    next();
    
    /* Original authorization logic (commented out)
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `Role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
    */
  };
};

    

