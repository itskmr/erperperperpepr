import express from 'express';
import {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseAnalytics,
  getExpenseCategories
} from '../controllers/expenseController.js';
import { protect, authorize, requireSchoolContext } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected routes with authentication and authorization

// Get all expenses
router.get('/', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getAllExpenses
);

// Get expense by ID
router.get('/:id', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getExpenseById
);

// Create new expense
router.post('/', 
  protect, 
  authorize('admin', 'school'),
  requireSchoolContext,
  createExpense
);

// Update expense
router.put('/:id', 
  protect, 
  authorize('admin', 'school'),
  requireSchoolContext,
  updateExpense
);

// Delete expense
router.delete('/:id', 
  protect, 
  authorize('admin', 'school'),
  requireSchoolContext,
  deleteExpense
);

// Get expense analytics
router.get('/analytics/overview', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getExpenseAnalytics
);

// Get expense categories
router.get('/categories/all', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getExpenseCategories
);

// Health check route (no auth required)
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Expense service is running",
    timestamp: new Date().toISOString()
  });
});

export default router; 