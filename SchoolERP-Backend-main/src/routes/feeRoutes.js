import express from 'express';
import { PrismaClient } from '@prisma/client';
import { validateFeeData } from '../utils/validators.js';
import { protect, authorize, enforceSchoolIsolation, addSchoolFilter } from '../middlewares/authMiddleware.js';

const prisma = new PrismaClient();
const router = express.Router();

// ==================== PROTECTED ROUTES WITH SCHOOL ISOLATION ====================

/**
 * @route   GET /api/fees
 * @desc    Get all fee records - PROTECTED WITH SCHOOL ISOLATION
 * @access  Protected
 */
router.get('/', 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  enforceSchoolIsolation,
  async (req, res) => {
    try {
      // Build where clause with school isolation
      const whereClause = addSchoolFilter(req);
      
      const fees = await prisma.fee.findMany({
        where: whereClause,
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
  }
);

/**
 * @route   GET /api/fees/:id
 * @desc    Get fee record by id - PROTECTED WITH SCHOOL ISOLATION
 * @access  Protected
 */
router.get('/:id', 
  protect, 
  authorize('admin', 'school', 'teacher', 'student', 'parent'), 
  enforceSchoolIsolation,
  async (req, res) => {
    try {
      // Build where clause with school isolation
      const whereClause = addSchoolFilter(req, { id: req.params.id });
      
      const fee = await prisma.fee.findFirst({
        where: whereClause
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
  }
);

/**
 * @route   POST /api/fees
 * @desc    Create new fee record - PROTECTED WITH SCHOOL ISOLATION
 * @access  Protected
 */
router.post('/', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  async (req, res) => {
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

      // Build where clause with school isolation for student lookup
      const studentWhereClause = addSchoolFilter(req, { admissionNo: req.body.admissionNumber });

      // Fetch student details with school isolation
      const student = await prisma.student.findFirst({
        where: studentWhereClause,
        include: {
          parentInfo: true,
          sessionInfo: true
        }
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found with the provided admission number in your school'
        });
      }

      // Store categories in the feeCategory field as JSON string
      let feeCategory = req.body.feeCategory || null;
      if (req.body.feeCategories && Array.isArray(req.body.feeCategories)) {
        if (!feeCategory) {
          feeCategory = req.body.feeCategories.join(', ');
        }
      }

      // Parse date string to Date object
      const feeData = {
        admissionNumber: student.admissionNo,
        studentName: student.fullName,
        fatherName: student.fatherName,
        class: student.sessionInfo?.currentClass || req.body.class,
        section: student.sessionInfo?.currentSection || req.body.section,
        totalFees: parseFloat(req.body.totalFees),
        amountPaid: parseFloat(req.body.amountPaid),
        feeAmount: parseFloat(req.body.feeAmount),
        paymentDate: new Date(req.body.paymentDate),
        paymentMode: req.body.paymentMode,
        receiptNumber: req.body.receiptNumber,
        status: req.body.status,
        feeCategory: feeCategory,
        discountType: req.body.discountType || null,
        discountAmount: req.body.discountAmount ? parseFloat(req.body.discountAmount) : null,
        discountValue: req.body.discountValue ? parseFloat(req.body.discountValue) : null,
        amountAfterDiscount: req.body.amountAfterDiscount ? parseFloat(req.body.amountAfterDiscount) : null,
        schoolId: req.user?.schoolId || req.body.schoolId || 1
      };
      
      // Create new fee record
      const newFee = await prisma.fee.create({
        data: feeData
      });
      
      // For the response, add feeCategories and student details
      const responseData = {
        ...newFee,
        feeCategories: req.body.feeCategories || feeCategory?.split(', ') || [],
        studentDetails: {
          fullName: student.fullName,
          fatherName: student.fatherName,
          motherName: student.motherName,
          email: student.email,
          mobileNumber: student.mobileNumber,
          className: student.sessionInfo?.className,
          section: student.sessionInfo?.section,
          rollNumber: student.sessionInfo?.rollNumber
        }
      };
      
      res.status(201).json({ success: true, data: responseData });
    } catch (error) {
      console.error('Error creating fee record:', error);
      
      // If it's a Prisma validation error, provide more specific details
      if (error.code === 'P2002') {
        return res.status(400).json({ 
          success: false, 
          message: 'Duplicate entry - receipt number or admission number already exists',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      
      // If it's a general Prisma error
      if (error.name === 'PrismaClientKnownRequestError') {
        return res.status(400).json({ 
          success: false, 
          message: 'Database validation error',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create fee record',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route   PUT /api/fees/:id
 * @desc    Update fee record - PROTECTED WITH SCHOOL ISOLATION
 * @access  Protected
 */
router.put('/:id', 
  protect, 
  authorize('admin', 'school'), 
  enforceSchoolIsolation,
  async (req, res) => {
    try {
      // Build where clause with school isolation
      const whereClause = addSchoolFilter(req, { id: req.params.id });
      
      // Check if fee exists with school isolation
      const existingFee = await prisma.fee.findFirst({
        where: whereClause
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
        discountType: req.body.discountType || existingFee.discountType || null,
        discountAmount: req.body.discountAmount !== undefined ? parseFloat(req.body.discountAmount) : (existingFee.discountAmount || null),
        discountValue: req.body.discountValue !== undefined ? parseFloat(req.body.discountValue) : (existingFee.discountValue || null),
        amountAfterDiscount: req.body.amountAfterDiscount !== undefined ? parseFloat(req.body.amountAfterDiscount) : (existingFee.amountAfterDiscount || null),
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
  }
);

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