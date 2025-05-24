import express from 'express';
import * as feeStructureController from '../controllers/feeStructureController.js';

const router = express.Router();

// Fee Structures Routes
router.get('/fee-structures', feeStructureController.getAllFeeStructures);
router.get('/fee-structures/:id', feeStructureController.getFeeStructureById);
router.post('/fee-structures', feeStructureController.createFeeStructure);
router.put('/fee-structures/:id', feeStructureController.updateFeeStructure);
router.delete('/fee-structures/:id', feeStructureController.deleteFeeStructure);

// Fee Categories Routes
router.get('/fee-categories', feeStructureController.getAllFeeCategories);

// Simple healthcheck for fee categories system
router.get('/fee-categories/check', (req, res) => {
  res.status(200).json({
    available_categories: feeStructureController.DEFAULT_FEE_CATEGORIES,
    message: 'These categories should be available in the UI'
  });
});

export default router; 