import express from 'express';
import {
  // School routes
  getSchoolInfo,
  
  // Driver routes
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  
  // Bus routes
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  
  // Route routes
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  
  // Trip routes
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  updateTripStatus,
  
  // Maintenance routes
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  
  // Student transport routes
  getAllStudentTransport,
  getStudentsByRoute,
  assignStudentToRoute,
  updateStudentTransport,
  removeStudentFromRoute
} from '../controllers/transportController.js';
import { protect, authorize, enforceSchoolIsolation, requireSchoolContext } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ==================== PROTECTED ROUTES WITH SCHOOL ISOLATION ====================

// School routes
router.get('/school-info', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  requireSchoolContext,
  getSchoolInfo
);

// Driver routes
router.get('/drivers', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  getAllDrivers
);
router.get('/drivers/:id', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  getDriverById
);
router.post('/drivers', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  createDriver
);
router.put('/drivers/:id', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  updateDriver
);
router.delete('/drivers/:id', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  deleteDriver
);

// Bus routes
router.get('/buses', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  getAllBuses
);
router.get('/buses/:id', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  getBusById
);
router.post('/buses', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  createBus
);
router.put('/buses/:id', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  updateBus
);
router.delete('/buses/:id', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  deleteBus
);

// Route routes
router.get('/routes', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  getAllRoutes
);
router.get('/routes/:id', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  getRouteById
);
router.post('/routes', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  createRoute
);
router.put('/routes/:id', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  updateRoute
);
router.delete('/routes/:id', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  deleteRoute
);

// Trip routes
router.get('/trips', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  getAllTrips
);
router.get('/trips/:id', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  getTripById
);
router.post('/trips', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  createTrip
);
router.put('/trips/:id', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  updateTrip
);
router.delete('/trips/:id', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  deleteTrip
);
router.patch('/trips/:id/status', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  updateTripStatus
);

// Maintenance routes
router.get('/maintenance', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  getAllMaintenance
);
router.get('/maintenance/:id', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  getMaintenanceById
);
router.post('/maintenance', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  createMaintenance
);
router.put('/maintenance/:id', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  updateMaintenance
);
router.delete('/maintenance/:id', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  deleteMaintenance
);

// Student transport routes
router.get('/student-transport', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  getAllStudentTransport
);
router.get('/student-transport/route/:routeId', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  getStudentsByRoute
);
router.post('/student-transport', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  assignStudentToRoute
);
router.put('/student-transport/:id', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  updateStudentTransport
);
router.delete('/student-transport/:id', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  removeStudentFromRoute
);

export default router; 