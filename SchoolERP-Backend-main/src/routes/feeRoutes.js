import express from 'express';
import { PrismaClient } from '@prisma/client';
import { validateFeeData } from '../utils/validators.js';

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @route   GET /api/fees
 * @desc    Get all fee records
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const fees = await prisma.fee.findMany({
      orderBy: { paymentDate: 'desc' }
    });
    
    // Process the feeCategories field for all records
    const processedFees = fees.map(fee => {
      // Convert feeCategory string to array for the response
      const feeCategories = fee.feeCategory ? fee.feeCategory.split(', ').filter(item => item.trim() !== '') : [];
      
      return {
        ...fee,
        feeCategories
      };
    });
    
    res.status(200).json({ success: true, data: processedFees });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch fee records',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/fees/:id
 * @desc    Get fee record by id
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const fee = await prisma.fee.findUnique({
      where: { id: req.params.id }
    });
    
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }
    
    // Process the feeCategories field
    const feeCategories = fee.feeCategory ? fee.feeCategory.split(', ').filter(item => item.trim() !== '') : [];
    
    const processedFee = {
      ...fee,
      feeCategories
    };
    
    res.status(200).json({ success: true, data: processedFee });
  } catch (error) {
    console.error('Error fetching fee record:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch fee record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/fees
 * @desc    Create new fee record
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    // Validate fee data
    const { error } = validateFeeData(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid fee data', 
        errors: error.details.map(d => d.message)
      });
    }

    // Store categories in the feeCategory field as JSON string
    let feeCategory = req.body.feeCategory || null;
    if (req.body.feeCategories && Array.isArray(req.body.feeCategories)) {
      // If we have feeCategories array and no feeCategory string, convert array to string
      if (!feeCategory) {
        feeCategory = req.body.feeCategories.join(', ');
      }
    }

    // Parse date string to Date object
    const feeData = {
      admissionNumber: req.body.admissionNumber,
      studentName: req.body.studentName,
      fatherName: req.body.fatherName,
      class: req.body.class,
      section: req.body.section,
      totalFees: parseFloat(req.body.totalFees),
      amountPaid: parseFloat(req.body.amountPaid),
      feeAmount: parseFloat(req.body.feeAmount),
      paymentDate: new Date(req.body.paymentDate),
      paymentMode: req.body.paymentMode,
      receiptNumber: req.body.receiptNumber,
      status: req.body.status,
      feeCategory: feeCategory, // Use the prepared feeCategory value
      schoolId: req.body.schoolId || 1
    };
    
    // Create new fee record
    const newFee = await prisma.fee.create({
      data: feeData
    });
    
    // For the response, add feeCategories if it was in the request
    const responseData = {
      ...newFee,
      feeCategories: req.body.feeCategories || feeCategory?.split(', ') || []
    };
    
    res.status(201).json({ success: true, data: responseData });
  } catch (error) {
    console.error('Error creating fee record:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create fee record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/fees/:id
 * @desc    Update fee record
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    // Check if fee exists
    const existingFee = await prisma.fee.findUnique({
      where: { id: req.params.id }
    });
    
    if (!existingFee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }
    
    // Validate fee data
    const { error } = validateFeeData(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid fee data', 
        errors: error.details.map(d => d.message)
      });
    }
    
    // Store categories in the feeCategory field as a string
    let feeCategory = req.body.feeCategory || existingFee.feeCategory;
    if (req.body.feeCategories && Array.isArray(req.body.feeCategories)) {
      // If feeCategories array exists, use it to create the feeCategory string
      feeCategory = req.body.feeCategories.join(', ');
    }
    
    // Parse date string to Date object
    const feeData = {
      admissionNumber: req.body.admissionNumber,
      studentName: req.body.studentName,
      fatherName: req.body.fatherName,
      class: req.body.class,
      section: req.body.section,
      totalFees: parseFloat(req.body.totalFees),
      amountPaid: parseFloat(req.body.amountPaid),
      feeAmount: parseFloat(req.body.feeAmount),
      paymentDate: new Date(req.body.paymentDate),
      paymentMode: req.body.paymentMode,
      receiptNumber: req.body.receiptNumber,
      status: req.body.status,
      feeCategory: feeCategory,
      schoolId: req.body.schoolId || existingFee.schoolId || 1
    };
    
    // Update fee record
    const updatedFee = await prisma.fee.update({
      where: { id: req.params.id },
      data: feeData
    });
    
    // For the response, add feeCategories if it was in the request
    const responseData = {
      ...updatedFee,
      feeCategories: req.body.feeCategories || feeCategory?.split(', ') || []
    };
    
    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error('Error updating fee record:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update fee record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/fees/:id
 * @desc    Delete fee record
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    // Check if fee exists
    const existingFee = await prisma.fee.findUnique({
      where: { id: req.params.id }
    });
    
    if (!existingFee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }
    
    // Delete fee record
    await prisma.fee.delete({
      where: { id: req.params.id }
    });
    
    res.status(200).json({ 
      success: true, 
      message: 'Fee record deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    console.error('Error deleting fee record:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete fee record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;