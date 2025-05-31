// routes/tcRoutes.js
import express from 'express';
import {
  createTC,
  getAllTCs,
  getTC,
  updateTC,
  deleteTC,
  getStudentByAdmissionNumber,
  fetchStudentDetails
} from '../controllers/tcfromController.js';
import {
    validateTCCreate,
    validateTCUpdate
} from '../middlewares/tcMiddleware.js';
import { protect, authorize, requireSchoolContext } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected routes with authentication and authorization
router.post('/tcs', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  requireSchoolContext,
  validateTCCreate,
  createTC
);

router.get('/tcs', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getAllTCs
);

router.get('/tcs/:id', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getTC
);

router.put('/tcs/:id', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  validateTCUpdate,
  updateTC
);

router.delete('/tcs/:id', 
  protect, 
  authorize('admin', 'school'),
  requireSchoolContext,
  deleteTC
);

// Student lookup endpoints for TC generation
router.get('/students/lookup/:admissionNumber', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getStudentByAdmissionNumber
);

router.get('/students/details/:admissionNumber', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  fetchStudentDetails
);

// Health check route (no auth required)
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Transfer Certificate service is running",
    timestamp: new Date().toISOString()
  });
});

export default router;