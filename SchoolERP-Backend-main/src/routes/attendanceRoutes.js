import express from 'express';
import attendanceController from '../controllers/attendanceController.js';

const router = express.Router();

// Route to get students by class for attendance marking
router.get('/students', attendanceController.getStudentsByClass);

// Route to mark attendance
router.post('/mark', attendanceController.markAttendance);

// Route to get attendance records by date and class
router.get('/records', attendanceController.getAttendanceByDateClass);

// Route to get attendance records for a specific student
router.get('/student/:studentId', attendanceController.getStudentAttendance);

// Route to get the list of classes with sections
router.get('/classes', attendanceController.getClassesList);

// Route to get attendance statistics
router.get('/stats', attendanceController.getAttendanceStats);

// Route for teacher attendance management interface
router.get('/teacher-management', attendanceController.getTeacherAttendanceManagement);

// Route to export attendance data as CSV
router.get('/export', attendanceController.exportAttendanceData);

// Check if attendance API is working
router.get('/check', attendanceController.checkAttendanceAPI);

export default router; 