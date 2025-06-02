import express from 'express';
import {
  getAllTimetable,
  getTimetableByClassSection,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getClasses,
  getSectionsByClass,
  getTeachersWithSubjects,
  getSubjectsByTeacher,
  getTimetableStats,
  validateTimetableEntry,
  getTimeSlots
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

// Get time slots (dynamically generated from existing data)
router.get('/time-slots', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getTimeSlots
);

// Get timetable by class and section
router.get('/class/:className/section/:section', 
  protect, 
  authorize('admin', 'school', 'teacher', 'student', 'parent'),
  requireSchoolContext,
  getTimetableByClassSection
);

// Get teachers with their subjects for the school
router.get('/teachers-subjects', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getTeachersWithSubjects
);

// Get subjects for a specific teacher
router.get('/teacher/:teacherId/subjects', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getSubjectsByTeacher
);

// Get timetable statistics
router.get('/stats', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getTimetableStats
);

// Validate timetable entry for conflicts
router.post('/validate', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  validateTimetableEntry
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
router.get('/classes', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getClasses
);

// Get sections by class
router.get('/sections/:classId', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getSectionsByClass
);

// Health check route (no auth required)
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Timetable service is running",
    timestamp: new Date().toISOString(),
    version: "2.0.0"
  });
});

export default router; 