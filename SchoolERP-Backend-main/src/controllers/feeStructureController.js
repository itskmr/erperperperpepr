import { PrismaClient } from '@prisma/client';
import { getSchoolIdFromContext } from '../middlewares/authMiddleware.js';

const prisma = new PrismaClient();

// Default fee categories if none exist in database
export const DEFAULT_FEE_CATEGORIES = [
  'Registration Fee',
  'Admission Fee',
  'Tuition Fee',
  'Monthly Fee',
  'Annual Charges',
  'Development Fund',
  'Computer Lab Fee',
  'Transport Fee',
  'Library Fee',
  'Laboratory Fee',
  'Sports Fee',
  'Readmission Charge',
  'PTA Fee',
  'Smart Class Fee',
  'Security and Safety Fee',
  'Activities Fee',
  'Examination Fee',
  'Maintenance Fee'
];

// Function to seed fee categories in the database for a specific school
const seedFeeCategoriesForSchool = async (schoolId) => {
  try {
    // Get existing categories for this school
    const existingCategories = await prisma.feeCategory.findMany({
      where: {
        structure: {
          schoolId: schoolId
        }
      },
      select: { name: true },
      distinct: ['name']
    });
    
    if (existingCategories.length === 0) {
      console.log(`No fee categories found for school ${schoolId}, seeding default categories...`);
      
      // Create a default fee structure if none exists for this school
      const existingStructures = await prisma.feeStructure.findMany({
        where: { schoolId: schoolId },
        take: 1
      });
      
      let structureId;
      
      if (existingStructures.length === 0) {
        // Create a temporary structure to attach categories to
        const newStructure = await prisma.feeStructure.create({
          data: {
            className: 'Sample Class',
            schoolId: schoolId,
            totalAnnualFee: 0,
            description: 'Temporary structure for initial categories'
          }
        });
        structureId = newStructure.id;
      } else {
        structureId = existingStructures[0].id;
      }
      
      // Create default categories for this school
      for (const categoryName of DEFAULT_FEE_CATEGORIES) {
        await prisma.feeCategory.create({
          data: {
            name: categoryName,
            amount: 0,
            frequency: 'Monthly',
            structureId
          }
        });
      }
      
      console.log(`Successfully seeded default fee categories for school ${schoolId}`);
    } else {
      console.log(`Found ${existingCategories.length} existing fee categories for school ${schoolId}`);
    }
  } catch (error) {
    console.error(`Error seeding fee categories for school ${schoolId}:`, error);
  }
};

// Get all fee structures with authentication and school context
export const getAllFeeStructures = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    // Build where clause based on user role
    let whereClause = { schoolId: schoolId };
    
    // Allow admins to see fee structures from specific schools or all schools
    if (req.user?.role === 'admin') {
      if (req.query.schoolId) {
        whereClause.schoolId = parseInt(req.query.schoolId);
      } else if (req.query.all === 'true') {
        whereClause = {}; // Admin can see all fee structures across schools
      }
    }
    
    const feeStructures = await prisma.feeStructure.findMany({
      where: whereClause,
      include: {
        categories: true,
        school: {
          select: {
            id: true,
            schoolName: true,
            code: true
          }
        }
      },
      orderBy: {
        className: 'asc',
      },
    });

    // Seed categories for this school if none exist
    if (feeStructures.length === 0) {
      await seedFeeCategoriesForSchool(whereClause.schoolId || schoolId);
    }

    return res.status(200).json({
      success: true,
      message: "Fee structures retrieved successfully",
      data: feeStructures,
      meta: {
        schoolId: whereClause.schoolId || schoolId,
        totalCount: feeStructures.length,
        userRole: req.user?.role
      }
    });
  } catch (error) {
    console.error('Error fetching fee structures:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch fee structures', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get a single fee structure by id with school context validation
export const getFeeStructureById = async (req, res) => {
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
    
    // Allow admins to access any fee structure
    if (req.user?.role === 'admin') {
      whereClause = { id: id };
    }
    
    const feeStructure = await prisma.feeStructure.findFirst({
      where: whereClause,
      include: {
        categories: true,
        school: {
          select: {
            id: true,
            schoolName: true,
            code: true
          }
        }
      },
    });

    if (!feeStructure) {
      return res.status(404).json({ 
        success: false,
        message: 'Fee structure not found or you do not have permission to access it' 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fee structure retrieved successfully",
      data: feeStructure
    });
  } catch (error) {
    console.error('Error fetching fee structure:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch fee structure', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create a new fee structure with school context
export const createFeeStructure = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { className, description, categories = [], totalAnnualFee = 0 } = req.body;
    
    if (!className) {
      return res.status(400).json({ 
        success: false,
        message: 'Class name is required' 
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

    // Check if fee structure already exists for this class in this school
    const existingStructure = await prisma.feeStructure.findFirst({
      where: {
        className: className,
        schoolId: schoolId
      }
    });

    if (existingStructure) {
      return res.status(400).json({ 
        success: false, 
        message: `Fee structure for class '${className}' already exists in your school`
      });
    }

    // Begin a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (prisma) => {
      // Create the fee structure
      const feeStructure = await prisma.feeStructure.create({
        data: {
          className,
          description,
          schoolId: schoolId,
          totalAnnualFee: parseFloat(totalAnnualFee),
        },
      });

      // If categories are provided, create them
      if (categories.length > 0) {
        await Promise.all(
          categories.map((category) =>
            prisma.feeCategory.create({
              data: {
                name: category.name,
                amount: parseFloat(category.amount),
                frequency: category.frequency,
                description: category.description,
                structureId: feeStructure.id,
              },
            })
          )
        );
      }

      // Return the created fee structure with its categories
      return prisma.feeStructure.findUnique({
        where: { id: feeStructure.id },
        include: { 
          categories: true,
          school: {
            select: {
              id: true,
              schoolName: true,
              code: true
            }
          }
        },
      });
    });

    // Log the activity for production
    try {
      if (process.env.NODE_ENV === 'production') {
        await prisma.activityLog.create({
          data: {
            action: 'FEE_STRUCTURE_CREATED',
            entityType: 'FEE_STRUCTURE',
            entityId: result.id,
            userId: req.user?.id,
            userRole: req.user?.role,
            schoolId: schoolId,
            details: `Fee structure created for class ${className} with ${categories.length} categories`,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent']
          }
        });
      }
    } catch (logError) {
      console.error('Failed to log fee structure creation activity:', logError);
    }

    return res.status(201).json({
      success: true,
      message: "Fee structure created successfully",
      data: result
    });
  } catch (error) {
    console.error('Error creating fee structure:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to create fee structure', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update an existing fee structure with school context validation
export const updateFeeStructure = async (req, res) => {
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

    const { className, description, categories, totalAnnualFee } = req.body;
    
    // Build where clause based on user role
    let whereClause = { 
      id: id,
      schoolId: schoolId
    };
    
    // Allow admins to update any fee structure
    if (req.user?.role === 'admin') {
      whereClause = { id: id };
    }
    
    // First check if the fee structure exists and user has permission
    const existingStructure = await prisma.feeStructure.findFirst({
      where: whereClause,
      include: { 
        categories: true,
        school: {
          select: { id: true, schoolName: true }
        }
      },
    });

    if (!existingStructure) {
      return res.status(404).json({ 
        success: false,
        message: 'Fee structure not found or you do not have permission to update it' 
      });
    }

    // Begin a transaction for updating
    const result = await prisma.$transaction(async (prisma) => {
      // Update the fee structure
      const updatedStructure = await prisma.feeStructure.update({
        where: { id: id },
        data: {
          ...(className && { className }),
          ...(description !== undefined && { description }),
          ...(totalAnnualFee !== undefined && { totalAnnualFee: parseFloat(totalAnnualFee) }),
        },
      });

      // If categories are provided, replace existing ones
      if (categories && Array.isArray(categories)) {
        // Delete existing categories
        await prisma.feeCategory.deleteMany({
          where: { structureId: id },
        });

        // Create new categories
        if (categories.length > 0) {
          await Promise.all(
            categories.map((category) =>
              prisma.feeCategory.create({
                data: {
                  name: category.name,
                  amount: parseFloat(category.amount),
                  frequency: category.frequency,
                  description: category.description,
                  structureId: id,
                },
              })
            )
          );
        }
      }

      // Return the updated fee structure with its categories
      return prisma.feeStructure.findUnique({
        where: { id: id },
        include: { 
          categories: true,
          school: {
            select: {
              id: true,
              schoolName: true,
              code: true
            }
          }
        },
      });
    });

    // Log the activity for production
    try {
      if (process.env.NODE_ENV === 'production') {
        await prisma.activityLog.create({
          data: {
            action: 'FEE_STRUCTURE_UPDATED',
            entityType: 'FEE_STRUCTURE',
            entityId: result.id,
            userId: req.user?.id,
            userRole: req.user?.role,
            schoolId: existingStructure.schoolId,
            details: `Fee structure updated for class ${result.className}`,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent']
          }
        });
      }
    } catch (logError) {
      console.error('Failed to log fee structure update activity:', logError);
    }

    return res.status(200).json({
      success: true,
      message: "Fee structure updated successfully",
      data: result
    });
  } catch (error) {
    console.error('Error updating fee structure:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to update fee structure', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete a fee structure
export const deleteFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the fee structure exists
    const existingStructure = await prisma.feeStructure.findUnique({
      where: { id },
    });

    if (!existingStructure) {
      return res.status(404).json({ message: 'Fee structure not found' });
    }

    // Delete the fee structure (categories will be cascaded automatically due to relation setup)
    await prisma.feeStructure.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Fee structure deleted successfully' });
  } catch (error) {
    console.error('Error deleting fee structure:', error);
    return res.status(500).json({ message: 'Failed to delete fee structure', error: error.message });
  }
};

// Get all fee categories
export const getAllFeeCategories = async (req, res) => {
  try {
    // Get all fee categories from the database
    const feeCategories = await prisma.feeCategory.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    // Extract unique category names
    let uniqueCategories = [...new Set(feeCategories.map(cat => cat.name))];
    
    // If no categories exist in database, provide the default list
    if (uniqueCategories.length === 0) {
      uniqueCategories = DEFAULT_FEE_CATEGORIES;
    } else {
      // Make sure all our default categories are included, even if not in DB yet
      for (const category of DEFAULT_FEE_CATEGORIES) {
        if (!uniqueCategories.includes(category)) {
          uniqueCategories.push(category);
        }
      }
      // Sort alphabetically
      uniqueCategories.sort();
    }
    
    return res.status(200).json(uniqueCategories);
  } catch (error) {
    console.error('Error fetching fee categories:', error);
    return res.status(500).json({ message: 'Failed to fetch fee categories', error: error.message });
  }
}; 