import express from 'express';
import {
  getTeacherDiaryEntries,
  getDiaryEntriesForView,
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
  getDiaryEntryById,
  getDiaryStats,
  getClassesAndSections,
  healthCheck
} from '../controllers/teacherDiaryController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

/**
 * Health Check Endpoint
 * Public endpoint to check if the API is running
 */
router.get('/health', healthCheck);

/**
 * Teacher-specific routes (CRUD operations)
 * Only teachers can access these endpoints
 */

// Get all diary entries for a teacher (with filtering and pagination)
router.get('/teacher/entries', getTeacherDiaryEntries);

// Create a new diary entry (teachers only)
router.post('/create', createDiaryEntry);

// Update a diary entry (teachers only - own entries)
router.put('/update/:id', updateDiaryEntry);

// Delete a diary entry (teachers only - own entries)
router.delete('/delete/:id', deleteDiaryEntry);

/**
 * View-only routes (for students, parents, and school admin)
 * These endpoints provide read-only access based on user role
 */

// Get diary entries for viewing (students, parents, school admin)
router.get('/view', getDiaryEntriesForView);

// Get a single diary entry by ID (role-based access)
router.get('/entry/:id', getDiaryEntryById);

/**
 * Utility and statistics routes
 * Available to appropriate roles
 */

// Get diary statistics (teachers and school admin)
router.get('/stats', getDiaryStats);

// Get available classes and sections (all roles)
router.get('/classes', getClassesAndSections);

export default router; 