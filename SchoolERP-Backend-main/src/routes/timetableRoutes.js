import express from 'express';
import {
  getAllTimetable,
  getTimetableByClassSection,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getClasses,
  getSectionsByClass
} from '../controllers/timetableController.js';
import { protect, authorize, requireSchoolContext } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected routes with authentication and authorization

// Get all timetable entries
router.get('/', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getAllTimetable
);

// Get timetable by class and section
router.get('/class/:className/section/:section', 
  protect, 
  authorize('admin', 'school', 'teacher', 'student', 'parent'),
  requireSchoolContext,
  getTimetableByClassSection
);

// Create new timetable entry
router.post('/', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  createTimetableEntry
);

// Update timetable entry
router.put('/:id', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  updateTimetableEntry
);

// Delete timetable entry
router.delete('/:id', 
  protect, 
  authorize('admin', 'school'),
  requireSchoolContext,
  deleteTimetableEntry
);

// Get all classes
router.get('/classes', getClasses);

// Get sections by class
router.get('/sections/:classId', getSectionsByClass);

// Health check route (no auth required)
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Timetable service is running",
    timestamp: new Date().toISOString()
  });
});

export default router; 