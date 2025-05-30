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

const router = express.Router();

// Get all expenses with filtering, pagination, and search
router.get('/', getAllExpenses);

// Get expense analytics/summary
router.get('/analytics', getExpenseAnalytics);

// Get expense categories
router.get('/categories', getExpenseCategories);

// Get specific expense by ID
router.get('/:id', getExpenseById);

// Create new expense
router.post('/', createExpense);

// Update expense
router.put('/:id', updateExpense);

// Delete expense
router.delete('/:id', deleteExpense);

export default router; 