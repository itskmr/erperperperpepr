import express from 'express';
import * as teacherAttendanceController from '../controllers/teacherAttendanceController.js';
import { protect, authorize, requireSchoolContext } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication and school context
// Only school admins and teachers can manage teacher attendance

/**
 * @route GET /api/teacher-attendance/teachers
 * @desc Get all teachers for attendance marking
 * @access Private (School, Admin)
 * @query department - Filter by department/subject
 * @query designation - Filter by designation
 */
router.get('/teachers', 
  protect, 
  authorize('admin', 'school'), // Only school admins can mark teacher attendance
  requireSchoolContext,
  teacherAttendanceController.getTeachersForAttendance
);

/**
 * @route GET /api/teacher-attendance/date
 * @desc Get teacher attendance for a specific date
 * @access Private (School, Admin)
 * @query date - Required: Date in YYYY-MM-DD format
 */
router.get('/date', 
  protect, 
  authorize('admin', 'school'),
  requireSchoolContext,
  teacherAttendanceController.getTeacherAttendanceByDate
);

/**
 * @route POST /api/teacher-attendance/mark
 * @desc Mark teacher attendance for a specific date
 * @access Private (School, Admin)
 * @body { date, attendanceData: [{ teacherId, status, notes?, checkInTime?, checkOutTime?, workingHours? }] }
 */
router.post('/mark', 
  protect, 
  authorize('admin', 'school'),
  requireSchoolContext,
  teacherAttendanceController.markTeacherAttendance
);

/**
 * @route GET /api/teacher-attendance/reports
 * @desc Generate teacher attendance reports
 * @access Private (School, Admin)
 * @query startDate - Required: Start date in YYYY-MM-DD format
 * @query endDate - Required: End date in YYYY-MM-DD format
 * @query teacherId - Optional: Filter by specific teacher
 * @query department - Optional: Filter by department/subject
 * @query reportType - Optional: 'summary' (default) or 'detailed'
 */
router.get('/reports', 
  protect, 
  authorize('admin', 'school'),
  requireSchoolContext,
  teacherAttendanceController.generateTeacherAttendanceReport
);

/**
 * @route GET /api/teacher-attendance/dashboard
 * @desc Get teacher attendance dashboard data (today's stats, monthly stats)
 * @access Private (School, Admin)
 */
router.get('/dashboard', 
  protect, 
  authorize('admin', 'school'),
  requireSchoolContext,
  teacherAttendanceController.getTeacherAttendanceDashboard
);

/**
 * @route GET /api/teacher-attendance/export
 * @desc Export teacher attendance data as CSV
 * @access Private (School, Admin)
 * @query startDate - Required: Start date in YYYY-MM-DD format
 * @query endDate - Required: End date in YYYY-MM-DD format
 * @query teacherId - Optional: Filter by specific teacher
 * @query department - Optional: Filter by department/subject
 */
router.get('/export', 
  protect, 
  authorize('admin', 'school'),
  requireSchoolContext,
  teacherAttendanceController.exportTeacherAttendanceData
);

/**
 * @route GET /api/teacher-attendance/health
 * @desc Health check for teacher attendance API
 * @access Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Teacher Attendance API is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      'GET /teachers': 'Get teachers for attendance',
      'GET /date': 'Get attendance by date',
      'POST /mark': 'Mark attendance', 
      'GET /reports': 'Generate reports',
      'GET /dashboard': 'Dashboard data',
      'GET /export': 'Export CSV data'
    }
  });
});

export default router; 