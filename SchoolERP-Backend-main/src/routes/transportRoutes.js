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

const router = express.Router();

// School routes
router.get('/school-info', getSchoolInfo);

// Driver routes
router.get('/drivers', getAllDrivers);
router.get('/drivers/:id', getDriverById);
router.post('/drivers', createDriver);
router.put('/drivers/:id', updateDriver);
router.delete('/drivers/:id', deleteDriver);

// Bus routes
router.get('/buses', getAllBuses);
router.get('/buses/:id', getBusById);
router.post('/buses', createBus);
router.put('/buses/:id', updateBus);
router.delete('/buses/:id', deleteBus);

// Route routes
router.get('/routes', getAllRoutes);
router.get('/routes/:id', getRouteById);
router.post('/routes', createRoute);
router.put('/routes/:id', updateRoute);
router.delete('/routes/:id', deleteRoute);

// Trip routes
router.get('/trips', getAllTrips);
router.get('/trips/:id', getTripById);
router.post('/trips', createTrip);
router.put('/trips/:id', updateTrip);
router.delete('/trips/:id', deleteTrip);
router.patch('/trips/:id/status', updateTripStatus);

// Maintenance routes
router.get('/maintenance', getAllMaintenance);
router.get('/maintenance/:id', getMaintenanceById);
router.post('/maintenance', createMaintenance);
router.put('/maintenance/:id', updateMaintenance);
router.delete('/maintenance/:id', deleteMaintenance);

// Student transport routes
router.get('/student-transport', getAllStudentTransport);
router.get('/student-transport/route/:routeId', getStudentsByRoute);
router.post('/student-transport', assignStudentToRoute);
router.put('/student-transport/:id', updateStudentTransport);
router.delete('/student-transport/:id', removeStudentFromRoute);

export default router; 