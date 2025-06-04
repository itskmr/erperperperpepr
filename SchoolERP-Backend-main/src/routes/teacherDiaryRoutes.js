import express from 'express';
import path from 'path';
import fs from 'fs';
import {
  getTeacherDiaryEntries,
  getDiaryEntriesForView,
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
  getDiaryEntryById,
  getDiaryStats,
  getClassesAndSections,
  healthCheck,
  uploadFiles,
  upload
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
 * File serving route for diary attachments
 * Serves files with proper headers and authentication
 */
router.get('/files/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'teacher-diary', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileExtension = path.extname(filename).toLowerCase();
    
    // Set appropriate content type
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };

    const contentType = mimeTypes[fileExtension] || 'application/octet-stream';
    
    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // For downloads, set Content-Disposition header
    if (req.query.download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    }

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving file'
    });
  }
});

/**
 * File Upload Endpoint
 * Teachers can upload images and attachments for diary entries
 */
router.post('/upload', upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'attachments', maxCount: 5 }
]), uploadFiles);

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