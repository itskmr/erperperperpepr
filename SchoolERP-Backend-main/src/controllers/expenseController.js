import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// Helper function to get school_id from request
const getSchoolId = (req) => {
  // Try to get schoolId from different sources
  if (req.params.schoolId) {
    return parseInt(req.params.schoolId);
  } else if (req.query.schoolId) {
    return parseInt(req.query.schoolId);
  } else if (req.body.schoolId) {
    return parseInt(req.body.schoolId);
  } else if (req.user && req.user.schoolId) {
    return parseInt(req.user.schoolId);
  }
  
  // Default to first school if no specific school ID
  return 1; // This should be improved with proper authentication
};

/**
 * Get all expenses for a school
 */
export const getAllExpenses = async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { 
      page = 1, 
      limit = 50, 
      category, 
      status, 
      startDate, 
      endDate,
      search 
    } = req.query;

    // Build where clause
    const where = {
      schoolId: schoolId
    };

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
              schoolName: true
            }
          }
        }
      }),
      prisma.expense.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit)
      },
      schoolId
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
      error: error.message
    });
  }
};

/**
 * Get expense by ID
 */
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = getSchoolId(req);

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        schoolId
      },
      include: {
        school: {
          select: {
            id: true,
            schoolName: true
          }
        }
      }
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expense",
      error: error.message
    });
  }
};

/**
 * Create new expense
 */
export const createExpense = async (req, res) => {
  try {
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
        totalAmount,
        status: status || 'PENDING',
        notes,
        attachments,
        budgetCategory,
        isRecurring: Boolean(isRecurring),
        recurringType,
        schoolId
      },
      include: {
        school: {
          select: {
            id: true,
            schoolName: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: expense,
      message: "Expense created successfully"
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create expense",
      error: error.message
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