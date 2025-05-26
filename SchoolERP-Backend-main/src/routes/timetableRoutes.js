import express from 'express';
import {
  getAllTimetable,
  getTimetableByClassSection,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getClasses,
  getSectionsByClass,
  getAllTeachers
} from '../controllers/timetableController.js';

const router = express.Router();

// Get all timetable entries
router.get('/', getAllTimetable);

// Get timetable by class and section
router.get('/class/:classId/section/:sectionId', getTimetableByClassSection);

// Create new timetable entry
router.post('/', createTimetableEntry);

// Update timetable entry
router.put('/:id', updateTimetableEntry);

// Delete timetable entry
router.delete('/:id', deleteTimetableEntry);

// Get all classes
router.get('/classes', getClasses);

// Get sections by class
router.get('/sections/:classId', getSectionsByClass);

// Get all teachers
router.get('/teachers', getAllTeachers);

export default router; 