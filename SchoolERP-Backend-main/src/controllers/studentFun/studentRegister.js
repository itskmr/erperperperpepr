import { PrismaClient } from "@prisma/client";
import { getSchoolIdFromContext } from "../../middlewares/authMiddleware.js";

const prisma = new PrismaClient();

const registerStudent = async (req, res) => {
  try {
    const { body: formFields, files: uploadedFiles } = req;
    
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly.",
        data: null
      });
    }
    
    // Validate required fields - Updated per user request: only admission number, full name, and father name are required
    const requiredFields = {
      formNo: formFields.formNo?.trim(),        // Admission number (required)
      fullName: formFields.fullName?.trim(),    // Full name (required)
      fatherName: formFields.fatherName?.trim() // Father name (required)
    };

    // Check for missing required fields
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
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
    const fileLocations = {};
    if (uploadedFiles) {
      Object.keys(uploadedFiles).forEach(fieldName => {
        if (uploadedFiles[fieldName] && uploadedFiles[fieldName][0]) {
          fileLocations[fieldName] = uploadedFiles[fieldName][0].path;
        }
      });
    }

    // Prepare student registration data
    const registerStudentData = {
      // Required fields
      fullName: formFields.fullName.trim(),
      formNo: formFields.formNo.trim(),
      regnDate: formFields.regnDate?.trim(),
      registerForClass: formFields.registerForClass?.trim(),
      
      // School ID (from authenticated context) - Important: schoolId is optional in schema
      schoolId: schoolId,
      
      // Optional fields with conditional inclusion
      ...(formFields.testDate && { testDate: formFields.testDate.trim() }),
      ...(formFields.branchName && { branchName: formFields.branchName.trim() }),
      ...(formFields.gender && { gender: formFields.gender.trim() }),
      ...(formFields.dob && { dob: formFields.dob.trim() }),
      ...(formFields.category && { category: formFields.category.trim() }),
      ...(formFields.religion && { religion: formFields.religion.trim() }),
      ...(formFields.admissionCategory && { admissionCategory: formFields.admissionCategory.trim() }),
      ...(formFields.bloodGroup && { bloodGroup: formFields.bloodGroup.trim() }),
      ...(formFields.transactionNo && { transactionNo: formFields.transactionNo.trim() }),
      ...(formFields.contactNo && { contactNo: formFields.contactNo.trim() }),
      ...(formFields.studentEmail && { studentEmail: formFields.studentEmail.trim() }),
      ...(formFields.address && { address: formFields.address.trim() }),
      ...(formFields.city && { city: formFields.city.trim() }),
      ...(formFields.state && { state: formFields.state.trim() }),
      ...(formFields.pincode && { pincode: formFields.pincode.trim() }),
      ...(formFields.studentAadharCardNo && { studentAadharCardNo: formFields.studentAadharCardNo.trim() }),
      ...(formFields.regnCharge && { regnCharge: formFields.regnCharge.trim() }),
      ...(formFields.examSubject && { examSubject: formFields.examSubject.trim() }),
      ...(formFields.paymentStatus && { paymentStatus: formFields.paymentStatus.trim() }),
      
      // Father details (optional)
      ...(formFields.fatherName && { fatherName: formFields.fatherName.trim() }),
      ...(formFields.fatherMobileNo && { fatherMobileNo: formFields.fatherMobileNo.trim() }),
      ...(formFields.fatherEmail && { fatherEmail: formFields.fatherEmail.trim() }),
      ...(formFields.fatherAadharCardNo && { fatherAadharCardNo: formFields.fatherAadharCardNo.trim() }),
      
      // Mother details (optional)
      ...(formFields.motherName && { motherName: formFields.motherName.trim() }),
      ...(formFields.motherMobileNo && { motherMobileNo: formFields.motherMobileNo.trim() }),
      ...(formFields.motherAadharCardNo && { motherAadharCardNo: formFields.motherAadharCardNo.trim() }),
      
      // Boolean fields
      ...booleanFields,
      
      // File paths
      ...fileLocations
    };

    // Create student entry in database with better error handling
    let registeredStudent;
    try {
      registeredStudent = await prisma.registration.create({
      data: registerStudentData,
        include: {
          School: {
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
        school: registeredStudent.School ? {
          id: registeredStudent.School.id,
          name: registeredStudent.School.schoolName,
          code: registeredStudent.School.code
        } : {
          id: schoolId,
          name: school.schoolName,
          code: 'N/A'
        }
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
          // Document fields
          casteCertificate: true,
          studentAadharCard: true,
          fatherAadharCard: true,
          motherAadharCard: true,
          previousClassMarksheet: true,
          transferCertificate: true,
          studentDateOfBirthCertificate: true,
          schoolId: true,
          School: {
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
    
    // Non-admins can only update students from their school
    if (req.user?.role !== 'admin') {
      whereClause.schoolId = schoolId;
    }

    const existingStudent = await prisma.registration.findFirst({
      where: whereClause,
      include: {
        School: {
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

    // Prepare update data - only update provided fields
    const updateFields = {};
    
    // String fields that should be trimmed
    const stringFields = [
      'fullName', 'branchName', 'gender', 'paymentStatus', 'contactNo', 
      'studentEmail', 'address', 'city', 'state', 'pincode',
      'fatherName', 'fatherMobileNo', 'fatherEmail', 'motherName', 'motherMobileNo'
    ];
    
    stringFields.forEach(field => {
      if (updatedData[field] !== undefined) {
        updateFields[field] = updatedData[field]?.trim() || null;
      }
    });
    
    // Date fields
    if (updatedData.regnDate) updateFields.regnDate = updatedData.regnDate;
    if (updatedData.testDate) updateFields.testDate = updatedData.testDate;
    if (updatedData.dob) updateFields.dob = updatedData.dob;
    
    // Special fields
    if (updatedData.registerForClass) updateFields.registerForClass = updatedData.registerForClass;
    
    // Add audit fields
    updateFields.updatedBy = req.user?.id;
    updateFields.updatedAt = new Date();

    // Update student data
    const updatedStudent = await prisma.registration.update({
      where: { formNo },
      data: updateFields,
      include: {
        School: {
          select: { id: true, schoolName: true }
        }
      }
    });

    // Log the update activity
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
      }).catch(err => console.error('Failed to log activity:', err));
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
          paymentStatus: updatedStudent.paymentStatus
        },
        school: updatedStudent.School
      }
    });
  } catch (error) {
    console.error("Error updating student:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating student",
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

export { registerStudent, getAllRegisteredStudents, updateStudent, getRegistrationStats };
