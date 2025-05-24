// middlewares/tcMiddleware.js
import { TCCreateSchema, TCUpdateSchema, convertFrontendToBackend } from '../utils/tcformValidator.js';

export const validateTCCreate = (req, res, next) => {
  try {
    // If data is coming from frontend, convert it to the backend model
    if (req.body.studentName && !req.body.fullName) {
      req.body = convertFrontendToBackend(req.body);
    }
    
    // Add studentId and schoolId if provided in query params but not in body
    if (!req.body.studentId && req.query.studentId) {
      req.body.studentId = Number(req.query.studentId);
    }
    
    if (!req.body.schoolId && req.query.schoolId) {
      req.body.schoolId = Number(req.query.schoolId);
    }
    
    const validatedData = TCCreateSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    console.error('TC Validation Error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      });
    }
    res.status(400).json({ error: 'Invalid data', details: error.message });
  }
};

export const validateTCUpdate = (req, res, next) => {
  try {
    // If data is coming from frontend, convert it to the backend model
    if (req.body.studentName && !req.body.fullName) {
      req.body = convertFrontendToBackend(req.body);
    }
    
    const validatedData = TCUpdateSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    console.error('TC Update Validation Error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      });
    }
    res.status(400).json({ error: 'Invalid data', details: error.message });
  }
}; 