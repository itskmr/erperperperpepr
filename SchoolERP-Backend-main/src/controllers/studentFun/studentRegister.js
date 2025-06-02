import { PrismaClient } from "@prisma/client";
import { getSchoolIdFromContext } from "../../middlewares/authMiddleware.js";

const prisma = new PrismaClient();

const registerStudent = async (req, res) => {
  try {
    const { body: formFields, files: uploadedFiles } = req;
    
    console.log("=== STUDENT REGISTRATION DEBUG ===");
    console.log("Headers:", req.headers.authorization ? "Authorization header present" : "No authorization header");
    console.log("User from token:", req.user ? `${req.user.role} - ${req.user.id}` : "No user found");
    console.log("Form fields received:", Object.keys(formFields));
    console.log("Required fields check:");
    console.log("- fullName:", formFields.fullName);
    console.log("- formNo:", formFields.formNo);
    console.log("- registerForClass:", formFields.registerForClass);
    console.log("- fatherName:", formFields.fatherName);
    
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    console.log("School ID from context:", schoolId);
    
    if (!schoolId) {
      console.log("ERROR: No school context found");
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly.",
        data: null
      });
    }
    
    // Validate required fields - Updated per user request: only form number, full name, and class are required
    const requiredFields = {
      formNo: formFields.formNo?.trim(),        // Form number (required)
      fullName: formFields.fullName?.trim(),    // Full name (required)
      registerForClass: formFields.registerForClass?.trim() // Class is required
    };

    // Check for missing required fields
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => {
        const fieldNames = {
          formNo: 'Form Number',
          fullName: 'Full Name',
          registerForClass: 'Class'
        };
        return fieldNames[key] || key;
      });

    if (missingFields.length > 0) {
      console.log("ERROR: Missing required fields:", missingFields);
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        data: null
      });
    }

    // Check if the student already exists (formNo should be unique within school)
    const existingStudent = await prisma.registration.findFirst({
      where: { 
        formNo: formFields.formNo.trim(),
        schoolId: schoolId
      },
    });

    if (existingStudent) {
      return res.status(400).json({ 
        success: false, 
        message: "A student with this form number already exists in your school",
        data: null
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
        message: "School not found",
        data: null
      });
    }

    if (school.status === 'inactive') {
      return res.status(403).json({ 
        success: false, 
        message: "School is inactive. Contact administrator.",
        data: null
      });
    }

    // Convert boolean fields with proper defaults
    const booleanFields = {
      singleParent: formFields.singleParent === 'true' || formFields.singleParent === true,
      smsAlert: formFields.smsAlert === 'true' || formFields.smsAlert === true,
      isFatherCampusEmployee: formFields.isFatherCampusEmployee === 'true' || formFields.isFatherCampusEmployee === true
    };

    // Handle file uploads
    // const fileLocations = {};
    // if (uploadedFiles) {
    //   Object.keys(uploadedFiles).forEach(fieldName => {
    //     if (uploadedFiles[fieldName] && uploadedFiles[fieldName][0]) {
    //       fileLocations[fieldName] = uploadedFiles[fieldName][0].path;
    //     }
    //   });
    // }

    // Prepare student registration data
    const registerStudentData = {
      // Required fields
      fullName: formFields.fullName.trim(),
      formNo: formFields.formNo.trim(),
      registerForClass: formFields.registerForClass.trim(),
      
      // Optional fields with better null handling
      regnDate: formFields.regnDate?.trim() || new Date().toISOString().split('T')[0],
      
      // School ID (from authenticated context) - Important: schoolId is optional in schema
      schoolId: schoolId,
      
      // Optional fields with conditional inclusion - only add if they have actual values
      ...(formFields.testDate?.trim() && { testDate: formFields.testDate.trim() }),
      ...(formFields.branchName?.trim() && { branchName: formFields.branchName.trim() }),
      ...(formFields.gender?.trim() && { gender: formFields.gender.trim() }),
      ...(formFields.dob?.trim() && { dob: formFields.dob.trim() }),
      ...(formFields.category?.trim() && { category: formFields.category.trim() }),
      ...(formFields.religion?.trim() && { religion: formFields.religion.trim() }),
      ...(formFields.admissionCategory?.trim() && { admissionCategory: formFields.admissionCategory.trim() }),
      ...(formFields.bloodGroup?.trim() && { bloodGroup: formFields.bloodGroup.trim() }),
      ...(formFields.transactionNo?.trim() && { transactionNo: formFields.transactionNo.trim() }),
      ...(formFields.contactNo?.trim() && { contactNo: formFields.contactNo.trim() }),
      ...(formFields.studentEmail?.trim() && { studentEmail: formFields.studentEmail.trim() }),
      ...(formFields.address?.trim() && { address: formFields.address.trim() }),
      ...(formFields.city?.trim() && { city: formFields.city.trim() }),
      ...(formFields.state?.trim() && { state: formFields.state.trim() }),
      ...(formFields.pincode?.trim() && { pincode: formFields.pincode.trim() }),
      ...(formFields.studentAadharCardNo?.trim() && { studentAadharCardNo: formFields.studentAadharCardNo.trim() }),
      ...(formFields.regnCharge?.trim() && { regnCharge: formFields.regnCharge.trim() }),
      ...(formFields.examSubject?.trim() && { examSubject: formFields.examSubject.trim() }),
      ...(formFields.paymentStatus?.trim() && { paymentStatus: formFields.paymentStatus.trim() }),
      
      // Father details
      fatherName: formFields.fatherName?.trim() || null,
      ...(formFields.fatherMobileNo?.trim() && { fatherMobileNo: formFields.fatherMobileNo.trim() }),
      ...(formFields.fatherEmail?.trim() && { fatherEmail: formFields.fatherEmail.trim() }),
      ...(formFields.fatherAadharCardNo?.trim() && { fatherAadharCardNo: formFields.fatherAadharCardNo.trim() }),
      
      // Mother details (optional)
      ...(formFields.motherName?.trim() && { motherName: formFields.motherName.trim() }),
      ...(formFields.motherMobileNo?.trim() && { motherMobileNo: formFields.motherMobileNo.trim() }),
      ...(formFields.motherAadharCardNo?.trim() && { motherAadharCardNo: formFields.motherAadharCardNo.trim() }),
      
      // Boolean fields
      ...booleanFields
    };

    // Create student entry in database with better error handling
    let registeredStudent;
    try {
      registeredStudent = await prisma.registration.create({
        data: registerStudentData,
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
    } catch (dbError) {
      console.error("Database error during student registration:", dbError);
      
      // Handle specific Prisma errors
      if (dbError.code === 'P2002') {
        return res.status(400).json({ 
          success: false, 
          message: "A student with this form number already exists",
          data: null
        });
      } else if (dbError.code === 'P2003') {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid school reference. Please check your school context.",
          data: null
        });
      } else if (dbError.code === 'P2025') {
        return res.status(404).json({ 
          success: false, 
          message: "Referenced school not found",
          data: null
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: "Database error during registration",
        error: process.env.NODE_ENV === 'development' ? dbError.message : "Internal database error"
      });
    }

    // Log the registration activity (only in production)
    try {
      if (process.env.NODE_ENV === 'production') {
        await prisma.activityLog.create({
          data: {
            action: 'STUDENT_REGISTERED',
            entityType: 'REGISTRATION',
            entityId: registeredStudent.registrationId,
            userId: req.user?.id,
            userRole: req.user?.role,
            schoolId: schoolId,
            details: `Student ${registeredStudent.fullName} (${registeredStudent.formNo}) registered`,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent']
          }
        });
      }
    } catch (logError) {
      // Don't fail the registration if logging fails
      console.error('Failed to log registration activity:', logError);
    }

    return res.status(201).json({ 
      success: true, 
      message: "Student registered successfully",
      data: {
        registration: {
          registrationId: registeredStudent.registrationId,
          formNo: registeredStudent.formNo,
          fullName: registeredStudent.fullName,
          registerForClass: registeredStudent.registerForClass,
          regnDate: registeredStudent.regnDate,
          paymentStatus: registeredStudent.paymentStatus || 'Pending'
        },
        school: registeredStudent.school
      }
    });
  } catch (error) {
    console.error("Error registering student:", error);
    
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error during registration",
      error: process.env.NODE_ENV === 'development' ? error.message : "An unexpected error occurred"
    });
  }
};

const getAllRegisteredStudents = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required",
        data: null
      });
    }

    // Build where clause based on user role
    let whereClause = { schoolId: schoolId };
    
    // Allow admins to see students from specific schools or all schools
    if (req.user?.role === 'admin') {
      if (req.query.schoolId) {
        whereClause.schoolId = parseInt(req.query.schoolId);
      } else if (req.query.all === 'true') {
        whereClause = {}; // Admin can see all students across schools
      }
    }

    // Add filtering based on query parameters
    if (req.query.class) {
      whereClause.registerForClass = req.query.class;
    }
    
    if (req.query.paymentStatus) {
      whereClause.paymentStatus = req.query.paymentStatus;
    }
    
    if (req.query.search) {
      whereClause.OR = [
        { fullName: { contains: req.query.search, mode: 'insensitive' } },
        { formNo: { contains: req.query.search, mode: 'insensitive' } },
        { contactNo: { contains: req.query.search } }
      ];
    }

    // Fetch students with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Cap at 100
    const skip = (page - 1) * limit;

    const [students, totalCount] = await Promise.all([
      prisma.registration.findMany({
        where: whereClause,
        select: {
          registrationId: true,
          formNo: true,
          fullName: true,
          testDate: true,
          regnDate: true,
          registerForClass: true,
          branchName: true,
          gender: true,
          dob: true,
          category: true,
          religion: true,
          admissionCategory: true,
          bloodGroup: true,
          transactionNo: true,
          singleParent: true,
          contactNo: true,
          studentEmail: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          studentAadharCardNo: true,
          regnCharge: true,
          examSubject: true,
          paymentStatus: true,
          fatherName: true,
          fatherMobileNo: true,
          smsAlert: true,
          fatherEmail: true,
          fatherAadharCardNo: true,
          isFatherCampusEmployee: true,
          motherName: true,
          motherMobileNo: true,
          motherAadharCardNo: true,
          schoolId: true,
          school: {
            select: {
              id: true,
              schoolName: true,
              code: true
            }
          }
        },
        orderBy: [
          { formNo: 'asc' }
        ],
        skip: skip,
        take: limit
      }),
      prisma.registration.count({ where: whereClause })
    ]);

    return res.status(200).json({ 
      success: true, 
      data: students,
      pagination: {
        page: page,
        limit: limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      meta: {
        schoolId: whereClause.schoolId,
        filters: {
          class: req.query.class,
          paymentStatus: req.query.paymentStatus,
          search: req.query.search
        }
      }
    });
  } catch (error) {
    console.error("Error fetching registered students:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { formNo } = req.params;
    const updatedData = req.body;
    
    console.log("=== STUDENT UPDATE DEBUG ===");
    console.log("Form No:", formNo);
    console.log("Update data received:", Object.keys(updatedData));
    console.log("User:", req.user ? `${req.user.role} - ${req.user.id}` : "No user found");
    
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    console.log("School ID from context:", schoolId);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required",
        data: null
      });
    }

    // Validate required fields that cannot be empty
    if (updatedData.fullName !== undefined && !updatedData.fullName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full Name cannot be empty"
      });
    }
    
    if (updatedData.registerForClass !== undefined && !updatedData.registerForClass?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Class cannot be empty"
      });
    }

    // Check if student exists within the user's school context
    const whereClause = { formNo: formNo };
    
    // Non-admins can only update students from their school
    if (req.user?.role !== 'admin') {
      whereClause.schoolId = schoolId;
    }

    const existingStudent = await prisma.registration.findFirst({
      where: whereClause,
      include: {
        school: {
          select: { id: true, schoolName: true }
        }
      }
    });

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found or you don't have permission to update this student",
      });
    }

    console.log("Existing student found:", existingStudent.fullName);

    // Prepare update data - only update provided fields
    const updateFields = {};
    
    // String fields that should be trimmed
    const stringFields = [
      'fullName', 'branchName', 'gender', 'paymentStatus', 'contactNo', 
      'studentEmail', 'address', 'city', 'state', 'pincode',
      'fatherName', 'fatherMobileNo', 'fatherEmail', 'motherName', 'motherMobileNo',
      'category', 'religion', 'admissionCategory', 'bloodGroup', 'transactionNo',
      'studentAadharCardNo', 'regnCharge', 'examSubject', 'fatherAadharCardNo',
      'motherAadharCardNo'
    ];
    
    stringFields.forEach(field => {
      if (updatedData[field] !== undefined) {
        const trimmedValue = updatedData[field]?.trim();
        updateFields[field] = trimmedValue || null;
      }
    });
    
    // Date fields
    if (updatedData.regnDate !== undefined) updateFields.regnDate = updatedData.regnDate;
    if (updatedData.testDate !== undefined) updateFields.testDate = updatedData.testDate;
    if (updatedData.dob !== undefined) updateFields.dob = updatedData.dob;
    
    // Special fields
    if (updatedData.registerForClass !== undefined) updateFields.registerForClass = updatedData.registerForClass;
    
    // Boolean fields with proper conversion
    if (updatedData.singleParent !== undefined) {
      updateFields.singleParent = updatedData.singleParent === 'true' || updatedData.singleParent === true;
    }
    if (updatedData.smsAlert !== undefined) {
      updateFields.smsAlert = updatedData.smsAlert === 'true' || updatedData.smsAlert === true;
    }
    if (updatedData.isFatherCampusEmployee !== undefined) {
      updateFields.isFatherCampusEmployee = updatedData.isFatherCampusEmployee === 'true' || updatedData.isFatherCampusEmployee === true;
    }

    console.log('Updating registration with fields:', Object.keys(updateFields));
    console.log('Update fields data:', updateFields);

    // Update student data
    const updatedStudent = await prisma.registration.update({
      where: { formNo },
      data: updateFields,
      include: {
        school: {
          select: { id: true, schoolName: true }
        }
      }
    });

    console.log('Update successful for student:', updatedStudent.fullName);

    // Log the update activity (only if activityLog model exists)
    try {
      if (process.env.NODE_ENV === 'production') {
        await prisma.activityLog.create({
          data: {
            action: 'STUDENT_UPDATED',
            entityType: 'REGISTRATION',
            entityId: updatedStudent.registrationId,
            userId: req.user?.id,
            userRole: req.user?.role,
            schoolId: existingStudent.schoolId,
            details: `Student ${updatedStudent.fullName} (${updatedStudent.formNo}) updated`,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent']
          }
        });
      }
    } catch (logError) {
      // Don't fail the update if logging fails
      console.error('Failed to log activity:', logError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: {
        registration: {
          registrationId: updatedStudent.registrationId,
          formNo: updatedStudent.formNo,
          fullName: updatedStudent.fullName,
          registerForClass: updatedStudent.registerForClass,
          regnDate: updatedStudent.regnDate,
          paymentStatus: updatedStudent.paymentStatus || 'Pending'
        },
        school: updatedStudent.school,
        updatedFields: Object.keys(updateFields)
      }
    });
  } catch (error) {
    console.error("Error updating student:", error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: "A student with this form number already exists",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } else if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "Student not found",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating student",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete student registration
const deleteStudent = async (req, res) => {
  try {
    const { formNo } = req.params;
    
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required",
        data: null
      });
    }

    // Check if student exists within the user's school context
    const whereClause = { formNo: formNo };
    
    // Non-admins can only delete students from their school
    if (req.user?.role !== 'admin') {
      whereClause.schoolId = schoolId;
    }

    const existingStudent = await prisma.registration.findFirst({
      where: whereClause,
      include: {
        school: {
          select: { id: true, schoolName: true }
        }
      }
    });

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found or you don't have permission to delete this student",
      });
    }

    // Delete the student registration
    await prisma.registration.delete({
      where: { formNo: formNo }
    });

    // Log the delete activity (only if activityLog model exists)
    try {
      if (process.env.NODE_ENV === 'production') {
        await prisma.activityLog.create({
          data: {
            action: 'STUDENT_DELETED',
            entityType: 'REGISTRATION',
            entityId: existingStudent.registrationId,
            userId: req.user?.id,
            userRole: req.user?.role,
            schoolId: existingStudent.schoolId,
            details: `Student registration ${existingStudent.fullName} (${existingStudent.formNo}) deleted`,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent']
          }
        });
      }
    } catch (logError) {
      // Don't fail the delete if logging fails
      console.error('Failed to log delete activity:', logError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: {
        deletedStudent: {
          registrationId: existingStudent.registrationId,
          formNo: existingStudent.formNo,
          fullName: existingStudent.fullName
        }
      }
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting student",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// New function to get registration statistics for dashboard
const getRegistrationStats = async (req, res) => {
  try {
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required"
      });
    }

    const whereClause = req.user?.role === 'admin' && req.query.all === 'true' 
      ? {} 
      : { schoolId: schoolId };

    const [
      totalStudents,
      paidStudents,
      pendingStudents,
      classCounts,
      recentRegistrations
    ] = await Promise.all([
      prisma.registration.count({ where: whereClause }),
      prisma.registration.count({ 
        where: { ...whereClause, paymentStatus: 'Paid' } 
      }),
      prisma.registration.count({ 
        where: { ...whereClause, paymentStatus: 'Pending' } 
      }),
      prisma.registration.groupBy({
        by: ['registerForClass'],
        where: whereClause,
        _count: { registerForClass: true },
        orderBy: { _count: { registerForClass: 'desc' } },
        take: 10
      }),
      prisma.registration.findMany({
        where: whereClause,
        select: {
          registrationId: true,
          formNo: true,
          fullName: true,
          registerForClass: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totals: {
          students: totalStudents,
          paid: paidStudents,
          pending: pendingStudents,
          unpaid: totalStudents - paidStudents - pendingStudents
        },
        classCounts: classCounts.map(item => ({
          class: item.registerForClass,
          count: item._count.registerForClass
        })),
        recentRegistrations: recentRegistrations
      }
    });
  } catch (error) {
    console.error("Error fetching registration stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export { registerStudent, getAllRegisteredStudents, updateStudent, deleteStudent, getRegistrationStats };
