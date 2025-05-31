import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { getSchoolIdFromContext } from "../middlewares/authMiddleware.js";

const prisma = new PrismaClient();

/**
 * Get all expenses for a school with authentication
 */
export const getAllExpenses = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { 
      page = 1, 
      limit = 50, 
      category, 
      status, 
      startDate, 
      endDate,
      search 
    } = req.query;

    // Build where clause with school context
    let where = {
      schoolId: schoolId
    };

    // Allow admins to see expenses from specific schools or all schools
    if (req.user?.role === 'admin') {
      if (req.query.schoolId) {
        where.schoolId = parseInt(req.query.schoolId);
      } else if (req.query.all === 'true') {
        where = {}; // Admin can see all expenses across schools
      }
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.expenseDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { vendor: { contains: search, mode: 'insensitive' } },
        { invoiceNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get expenses with pagination
    const [expenses, totalCount] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { expenseDate: 'desc' },
        skip: offset,
        take: parseInt(limit),
        include: {
          school: {
            select: {
              id: true,
              schoolName: true,
              code: true
            }
          }
        }
      }),
      prisma.expense.count({ where })
    ]);

    res.status(200).json({
      success: true,
      message: "Expenses retrieved successfully",
      data: expenses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      },
      meta: {
        schoolId: where.schoolId || 'all',
        userRole: req.user?.role,
        filters: {
          category: category || 'all',
          status: status || 'all',
          dateRange: startDate && endDate ? `${startDate} to ${endDate}` : 'all'
        }
      }
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get expense by ID with school context validation
 */
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    // Build where clause based on user role
    let whereClause = {
      id: id,
      schoolId: schoolId
    };
    
    // Allow admins to access any expense
    if (req.user?.role === 'admin') {
      whereClause = { id: id };
    }

    const expense = await prisma.expense.findFirst({
      where: whereClause,
      include: {
        school: {
          select: {
            id: true,
            schoolName: true,
            code: true
          }
        }
      }
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found or you do not have permission to access it"
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense retrieved successfully",
      data: expense
    });
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expense",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Create new expense with school context
 */
export const createExpense = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const {
      title,
      description,
      category,
      subCategory,
      amount,
      expenseDate,
      paymentMethod,
      vendor,
      vendorContact,
      invoiceNumber,
      receiptNumber,
      taxAmount,
      discountAmount,
      status,
      notes,
      attachments,
      budgetCategory,
      isRecurring,
      recurringType
    } = req.body;

    // Validate required fields
    if (!title || !category || !amount || !expenseDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, category, amount, and expense date"
      });
    }

    // Verify the school exists and is active
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, schoolName: true, status: true }
    });

    if (!school) {
      return res.status(404).json({ 
        success: false, 
        message: "School not found"
      });
    }

    if (school.status === 'inactive') {
      return res.status(403).json({ 
        success: false, 
        message: "School is inactive. Contact administrator."
      });
    }

    // Calculate total amount
    const totalAmount = parseFloat(amount) + (parseFloat(taxAmount) || 0) - (parseFloat(discountAmount) || 0);

    const expense = await prisma.expense.create({
      data: {
        id: uuidv4(),
        title,
        description,
        category,
        subCategory,
        amount: parseFloat(amount),
        expenseDate: new Date(expenseDate),
        paymentMethod: paymentMethod || 'Cash',
        vendor,
        vendorContact,
        invoiceNumber,
        receiptNumber,
        taxAmount: parseFloat(taxAmount) || 0,
        discountAmount: parseFloat(discountAmount) || 0,
        totalAmount: totalAmount,
        status: status || 'Pending',
        notes,
        attachments: attachments ? JSON.stringify(attachments) : null,
        budgetCategory,
        isRecurring: isRecurring || false,
        recurringType,
        schoolId: schoolId,
        createdBy: req.user?.id,
        createdAt: new Date()
      },
      include: {
        school: {
          select: {
            id: true,
            schoolName: true,
            code: true
          }
        }
      }
    });

    // Log the activity for production
    try {
      if (process.env.NODE_ENV === 'production') {
        await prisma.activityLog.create({
          data: {
            action: 'EXPENSE_CREATED',
            entityType: 'EXPENSE',
            entityId: expense.id,
            userId: req.user?.id,
            userRole: req.user?.role,
            schoolId: schoolId,
            details: `Expense created: ${title} - ${category} - $${amount}`,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent']
          }
        });
      }
    } catch (logError) {
      console.error('Failed to log expense creation activity:', logError);
    }

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: expense
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    
    // Handle specific database errors
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: "An expense with this invoice number already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to create expense",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Update expense
 */
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = getSchoolId(req);
    const {
      title,
      description,
      category,
      subCategory,
      amount,
      expenseDate,
      paymentMethod,
      vendor,
      vendorContact,
      invoiceNumber,
      receiptNumber,
      taxAmount,
      discountAmount,
      status,
      approvedBy,
      notes,
      attachments,
      budgetCategory,
      isRecurring,
      recurringType
    } = req.body;

    // Check if expense exists and belongs to school
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        schoolId
      }
    });

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    // Prepare update data
    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (subCategory !== undefined) updateData.subCategory = subCategory;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (expenseDate !== undefined) updateData.expenseDate = new Date(expenseDate);
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (vendor !== undefined) updateData.vendor = vendor;
    if (vendorContact !== undefined) updateData.vendorContact = vendorContact;
    if (invoiceNumber !== undefined) updateData.invoiceNumber = invoiceNumber;
    if (receiptNumber !== undefined) updateData.receiptNumber = receiptNumber;
    if (taxAmount !== undefined) updateData.taxAmount = parseFloat(taxAmount) || 0;
    if (discountAmount !== undefined) updateData.discountAmount = parseFloat(discountAmount) || 0;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'APPROVED' && approvedBy) {
        updateData.approvedBy = approvedBy;
        updateData.approvedAt = new Date();
      }
    }
    if (notes !== undefined) updateData.notes = notes;
    if (attachments !== undefined) updateData.attachments = attachments;
    if (budgetCategory !== undefined) updateData.budgetCategory = budgetCategory;
    if (isRecurring !== undefined) updateData.isRecurring = Boolean(isRecurring);
    if (recurringType !== undefined) updateData.recurringType = recurringType;

    // Recalculate total amount if necessary
    if (amount !== undefined || taxAmount !== undefined || discountAmount !== undefined) {
      const newAmount = updateData.amount || existingExpense.amount;
      const newTaxAmount = updateData.taxAmount !== undefined ? updateData.taxAmount : existingExpense.taxAmount;
      const newDiscountAmount = updateData.discountAmount !== undefined ? updateData.discountAmount : existingExpense.discountAmount;
      updateData.totalAmount = newAmount + newTaxAmount - newDiscountAmount;
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        school: {
          select: {
            id: true,
            schoolName: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: expense,
      message: "Expense updated successfully"
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update expense",
      error: error.message
    });
  }
};

/**
 * Delete expense
 */
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = getSchoolId(req);

    // Check if expense exists and belongs to school
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        schoolId
      }
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    await prisma.expense.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete expense",
      error: error.message
    });
  }
};

/**
 * Get expense analytics/summary
 */
export const getExpenseAnalytics = async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { startDate, endDate, category } = req.query;

    // Build where clause
    const where = { schoolId };

    if (startDate && endDate) {
      where.expenseDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (category) {
      where.category = category;
    }

    // Get total expenses by status
    const statusSummary = await prisma.expense.groupBy({
      by: ['status'],
      where,
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    });

    // Get total expenses by category
    const categorySummary = await prisma.expense.groupBy({
      by: ['category'],
      where,
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc'
        }
      }
    });

    // Get monthly expenses for the current year
    const currentYear = new Date().getFullYear();
    const monthlyExpensesRaw = await prisma.$queryRaw`
      SELECT 
        MONTH(expenseDate) as month,
        SUM(totalAmount) as total
      FROM Expense
      WHERE schoolId = ${schoolId}
        AND YEAR(expenseDate) = ${currentYear}
      GROUP BY MONTH(expenseDate)
      ORDER BY month
    `;

    // Convert BigInt values to Numbers for JSON serialization
    const monthlyExpenses = monthlyExpensesRaw.map(item => ({
      month: Number(item.month),
      total: Number(item.total)
    }));

    // Get total expense amount
    const totalExpenseResult = await prisma.expense.aggregate({
      where,
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    });

    res.status(200).json({
      success: true,
      data: {
        statusSummary,
        categorySummary,
        monthlyExpenses,
        totalExpenses: totalExpenseResult._sum.totalAmount || 0,
        totalCount: totalExpenseResult._count.id || 0
      }
    });
  } catch (error) {
    console.error("Error fetching expense analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expense analytics",
      error: error.message
    });
  }
};

/**
 * Get expense categories
 */
export const getExpenseCategories = async (req, res) => {
  try {
    const categories = [
      'Stationery',
      'Utilities',
      'Transport',
      'Maintenance',
      'Salary',
      'Infrastructure',
      'Food & Catering',
      'Events & Activities',
      'Technology',
      'Sports & Equipment',
      'Medical & Health',
      'Marketing & Promotion',
      'Insurance',
      'Legal & Professional',
      'Miscellaneous'
    ];

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error("Error fetching expense categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expense categories",
      error: error.message
    });
  }
}; 