import express from 'express';
import {
  getAllFeeStructures,
  getFeeStructureById,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getAllFeeCategories
} from '../controllers/feeStructureController.js';
import { protect, authorize, requireSchoolContext } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected routes with authentication and authorization

// Get all fee structures
router.get('/', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getAllFeeStructures
);

// Get fee structure by ID
router.get('/:id', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getFeeStructureById
);

// Create new fee structure
router.post('/', 
  protect, 
  authorize('admin', 'school'),
  requireSchoolContext,
  createFeeStructure
);

// Update fee structure
router.put('/:id', 
  protect, 
  authorize('admin', 'school'),
  requireSchoolContext,
  updateFeeStructure
);

// Delete fee structure
router.delete('/:id', 
  protect, 
  authorize('admin', 'school'),
  requireSchoolContext,
  deleteFeeStructure
);

// Get all fee categories
router.get('/categories/all', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getAllFeeCategories
);

// Health check route (no auth required)
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Fee structure service is running",
    timestamp: new Date().toISOString()
  });
});

export default router; 