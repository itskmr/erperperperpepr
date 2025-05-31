import express from 'express';
import * as attendanceController from '../controllers/attendanceController.js';
import { protect, authorize, requireSchoolContext } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected routes with authentication and authorization

// Route to get students by class for attendance marking
router.get('/students', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  attendanceController.getStudentsByClass
);

// Route to mark attendance
router.post('/mark', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  attendanceController.markAttendance
);

// Route to get attendance records by date and class
router.get('/records', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  attendanceController.getAttendanceByDateClass
);

// Route to get attendance records for a specific student
router.get('/student/:studentId', 
  protect, 
  authorize('admin', 'school', 'teacher', 'student', 'parent'),
  requireSchoolContext,
  attendanceController.getStudentAttendance
);

// Route to get the list of classes with sections
router.get('/classes', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  attendanceController.getClassesList
);

// Route to get attendance statistics
router.get('/stats', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  attendanceController.getAttendanceStats
);

// Route for teacher attendance management interface
router.get('/teacher-management', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  attendanceController.getTeacherAttendanceManagement
);

// Route to export attendance data as CSV
router.get('/export', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  attendanceController.exportAttendanceData
);

// Health check route (no auth required)
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Attendance service is running",
    timestamp: new Date().toISOString()
  });
});

// Check if attendance API is working (with auth)
router.get('/check', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  attendanceController.checkAttendanceAPI
);

export default router; 