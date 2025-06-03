import express from 'express';
import { protect, enforceSchoolIsolation } from '../middlewares/authMiddleware.js';
import { 
  getDashboardStats, 
  getFeeAnalytics,
  getQuickAccessData 
} from '../controllers/dashboardController.js';

const router = express.Router();

// Apply authentication middleware to all dashboard routes
router.use(protect);
router.use(enforceSchoolIsolation);

// Dashboard statistics endpoint
router.get('/stats', getDashboardStats);

// Fee analytics for charts
router.get('/fee-analytics', getFeeAnalytics);

// Quick access data
router.get('/quick-access', getQuickAccessData);

export default router; 