// routes/tcRoutes.js
import express from 'express';
import {
  createTC,
  getAllTCs,
  getTC,
  updateTC,
  deleteTC,
  getStudentByAdmissionNumber,
  fetchStudentDetails
} from '../controllers/tcfromController.js';
import {
    validateTCCreate,
    validateTCUpdate
} from '../middlewares/tcMiddleware.js';


const router = express.Router();
router.post('/tcs', validateTCCreate, createTC);
router.get('/tcs', getAllTCs);
router.get('/tcs/:id', getTC);
router.put('/tcs/:id', validateTCUpdate, updateTC);
router.delete('/tcs/:id', deleteTC);

// Student lookup endpoints for TC generation
router.get('/students/lookup/:admissionNumber', getStudentByAdmissionNumber);
router.get('/students/details/:admissionNumber', fetchStudentDetails);

export default router;