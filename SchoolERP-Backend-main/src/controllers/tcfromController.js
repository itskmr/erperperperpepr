// controllers/tcController.js
import { PrismaClient } from '@prisma/client';
import { TCCreateSchema, TCUpdateSchema, convertFrontendToBackend } from '../utils/tcformValidator.js';
import { z } from "zod";
import { getSchoolIdFromContext } from "../middlewares/authMiddleware.js";

const prisma = new PrismaClient();

// Helper function to generate TC Number
const generateTCNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TC${timestamp}${random}`;
};

// Create TC
export const createTC = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false,
        error: 'School context is required. Please ensure you are logged in properly.',
        details: 'Missing school context'
      });
    }

    // Validate the school exists and is active
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, schoolName: true, status: true }
    });

    if (!school) {
      return res.status(404).json({ 
        success: false,
        error: 'School not found',
        details: `School with ID ${schoolId} not found`
      });
    }

    if (school.status === 'inactive') {
      return res.status(403).json({ 
        success: false,
        error: 'School is inactive',
        details: 'Cannot create TC for inactive school'
      });
    }

    // Create local schema for validation that doesn't require studentId and schoolId
    const LocalTCCreateSchema = z.object({
      admissionNumber: z.string().min(1, "Admission number is required"),
      fullName: z.string().min(1, "Student name is required"),
      fatherName: z.string().min(1, "Father's name is required"),
      motherName: z.string().min(1, "Mother's name is required"),
      dateOfBirth: z.string().min(1, "Date of birth is required"),
      nationality: z.string().min(1, "Nationality is required"),
      category: z.string().min(1, "Category is required"),
      dateOfAdmission: z.string().min(1, "Date of admission is required"),
      currentClass: z.string().min(1, "Current class is required"),
      whetherFailed: z.enum(['Yes', 'No', 'NA', 'CBSEBoard']).default('No'),
      section: z.string().optional().default("A"),
      rollNumber: z.string().optional(),
      examAppearedIn: z.enum(['School', 'Board', 'NA', 'CBSEBoard', 'SchoolFailed', 'SchoolPassed', 'SchoolCompartment', 'BoardPassed', 'BoardFailed', 'BoardCompartment']).default('School'),
      qualifiedForPromotion: z.enum(['Yes', 'No', 'NA', 'Pass', 'Fail', 'Compartment', 'AsperCBSEBoardResult', 'AppearedinclassXExam', 'AppearedinclassXIIExam']).default('Yes'),
      reasonForLeaving: z.enum(['FamilyRelocation', 'AdmissionInOtherSchool', 'Duetolongabsencewithoutinformation', 'FatherJobTransfer', 'GetAdmissioninHigherClass', 'GoingtoNativePlace', 'ParentWill', 'Passedoutfromtheschool', 'Shiftingtootherplace', 'TransferCase', 'Other']),
      dateOfLeaving: z.string().min(1, "Date of leaving is required"),
      lastAttendanceDate: z.string().min(1, "Last attendance date is required"),
      toClass: z.string().optional(),
      classInWords: z.string().optional(),
      maxAttendance: z.union([z.string(), z.number()]).transform(val => Number(val)),
      obtainedAttendance: z.union([z.string(), z.number()]).transform(val => Number(val)),
      subjectsStudied: z.string().min(1, "Subjects studied is required"),
      generalConduct: z.enum(['Excellent', 'Good', 'Satisfactory', 'NeedsImprovement', 'Poor']),
      behaviorRemarks: z.string().optional(),
      feesPaidUpTo: z.string().min(1, "Fees paid up to date is required"),
      tcCharge: z.union([z.string(), z.number()]).transform(val => Number(val)).default(0),
      feeConcession: z.enum(['None', 'Partial', 'Full']).default('None'),
      gamesPlayed: z.array(z.string()).optional(),
      extraActivities: z.array(z.string()).optional(),
      issuedDate: z.string().optional(),
      tcNumber: z.string().optional()
    });

    // Validate request data
    let validatedData;
    try {
      validatedData = LocalTCCreateSchema.parse(req.body);
    } catch (validationError) {
      console.error('TC Validation Error:', validationError);
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed', 
        details: validationError.errors || validationError.message
      });
    }

    // Check if student exists in the school
    const student = await prisma.student.findFirst({
      where: { 
        admissionNo: validatedData.admissionNumber,
        schoolId: schoolId
      }
    });

    if (!student) {
      return res.status(404).json({ 
        success: false,
        error: 'Student not found', 
        details: `No student found with admission number ${validatedData.admissionNumber} in your school`
      });
    }

    // Check if TC already exists for this student
    const existingTC = await prisma.transferCertificate.findFirst({
      where: { 
        admissionNumber: validatedData.admissionNumber,
        schoolId: schoolId
      }
    });

    if (existingTC) {
      return res.status(400).json({ 
        success: false,
        error: 'Transfer certificate already exists', 
        details: `TC already issued for admission number ${validatedData.admissionNumber}`
      });
    }

    // Convert string values to appropriate types
    const formattedData = {
      ...validatedData,
      maxAttendance: Number(validatedData.maxAttendance),
      obtainedAttendance: Number(validatedData.obtainedAttendance),
      tcCharge: Number(validatedData.tcCharge || 0),
      tcstatus: 1, // 1 for issued/active
      rollNumber: validatedData.rollNumber || student.rollNumber || "",
      tcNumber: validatedData.tcNumber || generateTCNumber(),
      gamesPlayed: req.body.gamesPlayed ? JSON.stringify(req.body.gamesPlayed) : null,
      extraActivities: req.body.extraActivity ? JSON.stringify(req.body.extraActivity) : null,
      schoolId: schoolId,
      studentId: student.id
    };
    
    // Create the certificate in the database
    let tc;
    try {
      tc = await prisma.transferCertificate.create({
        data: {
          ...formattedData,
          issuedDate: new Date(validatedData.issuedDate) || new Date(),
          dateOfBirth: new Date(validatedData.dateOfBirth),
          dateOfAdmission: new Date(validatedData.dateOfAdmission),
          dateOfLeaving: new Date(validatedData.dateOfLeaving),
          lastAttendanceDate: new Date(validatedData.lastAttendanceDate),
          feesPaidUpTo: new Date(validatedData.feesPaidUpTo)
        },
        include: {
          student: {
            select: { id: true, fullName: true, admissionNo: true }
          },
          school: {
            select: { id: true, schoolName: true }
          }
        }
      });
    } catch (createError) {
      console.error('Error creating transfer certificate:', createError);
      if (createError.code === 'P2002') {
        return res.status(400).json({ 
          success: false,
          error: 'Duplicate entry', 
          details: 'A transfer certificate with this information already exists'
        });
      }
      return res.status(500).json({ 
        success: false,
        error: 'Database error', 
        details: 'Failed to create transfer certificate',
        message: process.env.NODE_ENV === 'development' ? createError.message : undefined
      });
    }

    // Log the activity
    if (process.env.NODE_ENV === 'production') {
      await prisma.activityLog.create({
        data: {
          action: 'TC_CREATED',
          entityType: 'TRANSFER_CERTIFICATE',
          entityId: tc.id,
          userId: req.user?.id,
          userRole: req.user?.role,
          schoolId: schoolId,
          details: `Transfer Certificate ${tc.tcNumber} created for ${tc.fullName} (${tc.admissionNumber})`,
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent']
        }
      }).catch(err => console.error('Failed to log activity:', err));
    }

    // Transform to expected frontend format
    const responseData = {
      id: tc.id,
      tcNo: tc.tcNumber,
      studentName: tc.fullName,
      fatherName: tc.fatherName,
      motherName: tc.motherName,
      admissionNumber: tc.admissionNumber,
      studentClass: tc.currentClass,
      rollNo: tc.rollNumber || '',
      dateOfBirth: tc.dateOfBirth.toISOString(),
      nationality: tc.nationality,
      category: tc.category,
      dateOfAdmission: tc.dateOfAdmission.toISOString(),
      issueDate: tc.issuedDate.toISOString(),
      leavingDate: tc.dateOfLeaving.toISOString(),
      reason: tc.reasonForLeaving,
      examIn: tc.examAppearedIn,
      qualified: tc.qualifiedForPromotion,
      generalConduct: tc.generalConduct,
      whetherFailed: tc.whetherFailed,
      subject: tc.subjectsStudied,
      maxAttendance: tc.maxAttendance.toString(),
      obtainedAttendance: tc.obtainedAttendance.toString(),
      toClass: tc.toClass || '',
      classInWords: tc.classInWords || '',
      feesPaidUpTo: tc.feesPaidUpTo.toISOString(),
      tcCharge: tc.tcCharge.toString(),
      feesConcessionAvailed: tc.feeConcession,
      behaviorRemarks: tc.behaviorRemarks || '',
      dateOfLeaving: tc.dateOfLeaving.toISOString(),
      lastAttendanceDate: tc.lastAttendanceDate.toISOString(),
      dateOfIssue: tc.issuedDate.toISOString(),
      gamesPlayed: tc.gamesPlayed ? JSON.parse(tc.gamesPlayed) : [], 
      extraActivity: tc.extraActivities ? JSON.parse(tc.extraActivities) : [],
      school: tc.school,
      student: tc.student
    };

    res.status(201).json({ 
      success: true,
      message: 'Transfer certificate created successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Create TC Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all TCs
export const getAllTCs = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false,
        error: 'School context is required. Please ensure you are logged in properly.',
        details: 'Missing school context'
      });
    }

    const { admissionNumber, search, class: studentClass, rollNumber } = req.query;
    
    // Build where clause based on user role and school context
    let whereClause = { schoolId: schoolId };
    
    // Allow admins to see TCs from specific schools or all schools
    if (req.user?.role === 'admin') {
      if (req.query.schoolId) {
        whereClause.schoolId = parseInt(req.query.schoolId);
      } else if (req.query.all === 'true') {
        whereClause = {}; // Admin can see all TCs across schools
      }
    }
    
    // Filter by admission number
    if (admissionNumber) {
      whereClause.admissionNumber = admissionNumber;
    }
    
    // Filter by roll number
    if (rollNumber) {
      whereClause.rollNumber = rollNumber;
    }
    
    // Filter by class
    if (studentClass) {
      whereClause.currentClass = studentClass;
    }
    
    // Search across multiple fields
    if (search) {
      whereClause.OR = [
        { tcNumber: { contains: search } },
        { fullName: { contains: search } },
        { admissionNumber: { contains: search } },
        { rollNumber: { contains: search } },
        { fatherName: { contains: search } },
        { motherName: { contains: search } }
      ];
    }

    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;

    const [tcs, totalCount] = await Promise.all([
      prisma.transferCertificate.findMany({
        where: whereClause,
        include: {
          student: true,
          school: true
        },
        orderBy: {
          issuedDate: 'desc'
        },
        skip: skip,
        take: limit
      }),
      prisma.transferCertificate.count({ where: whereClause })
    ]);

    // Transform to expected frontend format
    const responseData = tcs.map(tc => ({
      id: tc.id,
      tcNo: tc.tcNumber,
      studentName: tc.fullName,
      fatherName: tc.fatherName,
      motherName: tc.motherName,
      admissionNumber: tc.admissionNumber,
      studentClass: tc.currentClass,
      rollNo: tc.rollNumber || '',
      dateOfBirth: tc.dateOfBirth.toISOString(),
      nationality: tc.nationality,
      category: tc.category,
      dateOfAdmission: tc.dateOfAdmission.toISOString(),
      issueDate: tc.issuedDate.toISOString(),
      leavingDate: tc.dateOfLeaving.toISOString(),
      reason: tc.reasonForLeaving,
      examIn: tc.examAppearedIn,
      qualified: tc.qualifiedForPromotion,
      generalConduct: tc.generalConduct,
      whetherFailed: tc.whetherFailed,
      subject: tc.subjectsStudied,
      maxAttendance: tc.maxAttendance.toString(),
      obtainedAttendance: tc.obtainedAttendance.toString(),
      toClass: tc.toClass || '',
      classInWords: tc.classInWords || '',
      feesPaidUpTo: tc.feesPaidUpTo.toISOString(),
      tcCharge: tc.tcCharge.toString(),
      feesConcessionAvailed: tc.feeConcession,
      behaviorRemarks: tc.behaviorRemarks || '',
      dateOfLeaving: tc.dateOfLeaving.toISOString(),
      lastAttendanceDate: tc.lastAttendanceDate.toISOString(),
      dateOfIssue: tc.issuedDate.toISOString(),
      remarks: '',
      // Parse stored JSON strings back to arrays
      gamesPlayed: tc.gamesPlayed ? JSON.parse(tc.gamesPlayed) : [], 
      extraActivity: tc.extraActivities ? JSON.parse(tc.extraActivities) : [],
      // School details
      schoolDetails: {
        schoolName: tc.school?.schoolName || '',
        address: tc.school?.address || '',
        recognitionId: tc.school?.code || '',
        affiliationNo: '',
        contact: tc.school?.contact ? tc.school.contact.toString() : '',
        email: tc.school?.email || '',
        imageUrl: tc.school?.image_url || ''
      }
    }));

    res.json({
      success: true,
      data: responseData,
      pagination: {
        page: page,
        limit: limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      meta: {
        schoolId: whereClause.schoolId || 'all',
        userRole: req.user?.role
      }
    });
  } catch (error) {
    console.error('Get All TCs Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single TC
export const getTC = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false,
        error: 'School context is required. Please ensure you are logged in properly.',
        details: 'Missing school context'
      });
    }

    // Build where clause based on user role
    let whereClause = { 
      id: Number(id),
      schoolId: schoolId
    };
    
    // Allow admins to access any TC
    if (req.user?.role === 'admin') {
      whereClause = { id: Number(id) };
    }
    
    const tc = await prisma.transferCertificate.findFirst({
      where: whereClause,
      include: {
        student: true,
        school: true
      }
    });

    if (!tc) {
      return res.status(404).json({ 
        success: false,
        error: 'TC not found or you do not have permission to access it' 
      });
    }

    // Transform to expected frontend format
    const responseData = {
      id: tc.id,
      tcNo: tc.tcNumber,
      studentName: tc.fullName,
      fatherName: tc.fatherName,
      motherName: tc.motherName,
      admissionNumber: tc.admissionNumber,
      studentClass: tc.currentClass,
      rollNo: tc.rollNumber || '',
      dateOfBirth: tc.dateOfBirth.toISOString(),
      nationality: tc.nationality,
      category: tc.category,
      dateOfAdmission: tc.dateOfAdmission.toISOString(),
      issueDate: tc.issuedDate.toISOString(),
      leavingDate: tc.dateOfLeaving.toISOString(),
      reason: tc.reasonForLeaving,
      examIn: tc.examAppearedIn,
      qualified: tc.qualifiedForPromotion,
      generalConduct: tc.generalConduct,
      whetherFailed: tc.whetherFailed,
      subject: tc.subjectsStudied,
      maxAttendance: tc.maxAttendance.toString(),
      obtainedAttendance: tc.obtainedAttendance.toString(),
      toClass: tc.toClass || '',
      classInWords: tc.classInWords || '',
      feesPaidUpTo: tc.feesPaidUpTo.toISOString(),
      tcCharge: tc.tcCharge.toString(),
      feesConcessionAvailed: tc.feeConcession,
      behaviorRemarks: tc.behaviorRemarks || '',
      dateOfLeaving: tc.dateOfLeaving.toISOString(),
      lastAttendanceDate: tc.lastAttendanceDate.toISOString(),
      dateOfIssue: tc.issuedDate.toISOString(),
      remarks: '',
      // Parse stored JSON strings back to arrays
      gamesPlayed: tc.gamesPlayed ? JSON.parse(tc.gamesPlayed) : [], 
      extraActivity: tc.extraActivities ? JSON.parse(tc.extraActivities) : [],
      // School details
      schoolDetails: {
        schoolName: tc.school?.schoolName || '',
        address: tc.school?.address || '',
        recognitionId: tc.school?.code || '',
        affiliationNo: '',
        contact: tc.school?.contact ? tc.school.contact.toString() : '',
        email: tc.school?.email || '',
        imageUrl: tc.school?.image_url || ''
      }
    };

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Get TC Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update TC
export const updateTC = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid ID', 
        details: 'Certificate ID must be a valid number'
      });
    }

    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false,
        error: 'School context is required. Please ensure you are logged in properly.',
        details: 'Missing school context'
      });
    }
    
    // Check if the TC exists and user has permission to update it
    let whereClause = { 
      id: Number(id),
      schoolId: schoolId
    };
    
    // Allow admins to update any TC
    if (req.user?.role === 'admin') {
      whereClause = { id: Number(id) };
    }

    const existingTC = await prisma.transferCertificate.findFirst({
      where: whereClause
    });

    if (!existingTC) {
      return res.status(404).json({ 
        success: false,
        error: 'Certificate not found or you do not have permission to update it', 
        details: `No transfer certificate found with ID ${id} in your accessible scope`
      });
    }

    // Create partial schema for updates
    const LocalTCUpdateSchema = TCUpdateSchema.omit({ studentId: true, schoolId: true });
    
    // Validate request data
    let validatedData;
    try {
      validatedData = LocalTCUpdateSchema.parse(req.body);
    } catch (validationError) {
      console.error('TC Update Validation Error:', validationError);
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed', 
        details: validationError.errors || validationError.message
      });
    }

    // Convert string values to appropriate types
    const formattedData = {
      ...validatedData,
      maxAttendance: validatedData.maxAttendance ? Number(validatedData.maxAttendance) : undefined,
      obtainedAttendance: validatedData.obtainedAttendance ? Number(validatedData.obtainedAttendance) : undefined,
      tcCharge: validatedData.tcCharge ? Number(validatedData.tcCharge) : undefined,
      // Ensure the roll number is stored correctly
      rollNumber: validatedData.rollNumber || "",
      // Serialize arrays as JSON strings if provided
      gamesPlayed: req.body.gamesPlayed ? JSON.stringify(req.body.gamesPlayed) : undefined,
      extraActivities: req.body.extraActivity ? JSON.stringify(req.body.extraActivity) : undefined,
      // Update issued date if provided
      issuedDate: validatedData.issuedDate ? new Date(validatedData.issuedDate) : undefined
    };

    // Remove undefined values
    Object.keys(formattedData).forEach(key => {
      if (formattedData[key] === undefined) {
        delete formattedData[key];
      }
    });

    // Update the certificate in the database
    let tc;
    try {
      tc = await prisma.transferCertificate.update({
        where: { id: Number(id) },
        data: formattedData,
        include: {
          student: true,
          school: true
        }
      });
    } catch (updateError) {
      console.error('Error updating transfer certificate:', updateError);
      return res.status(500).json({ 
        success: false,
        error: 'Database error', 
        details: 'Failed to update transfer certificate',
        message: process.env.NODE_ENV === 'development' ? updateError.message : undefined
      });
    }

    // Log the activity
    if (process.env.NODE_ENV === 'production') {
      await prisma.activityLog.create({
        data: {
          action: 'TC_UPDATED',
          entityType: 'TRANSFER_CERTIFICATE',
          entityId: tc.id,
          userId: req.user?.id,
          userRole: req.user?.role,
          schoolId: tc.schoolId,
          details: `Transfer Certificate ${tc.tcNumber} updated for ${tc.fullName} (${tc.admissionNumber})`,
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent']
        }
      }).catch(err => console.error('Failed to log activity:', err));
    }

    // Transform to expected frontend format
    const responseData = {
      id: tc.id,
      tcNo: tc.tcNumber,
      studentName: tc.fullName,
      fatherName: tc.fatherName,
      motherName: tc.motherName,
      admissionNumber: tc.admissionNumber,
      studentClass: tc.currentClass,
      rollNo: tc.rollNumber || '',
      dateOfBirth: tc.dateOfBirth.toISOString(),
      nationality: tc.nationality,
      category: tc.category,
      dateOfAdmission: tc.dateOfAdmission.toISOString(),
      issueDate: tc.issuedDate.toISOString(),
      leavingDate: tc.dateOfLeaving.toISOString(),
      reason: tc.reasonForLeaving,
      examIn: tc.examAppearedIn,
      qualified: tc.qualifiedForPromotion,
      generalConduct: tc.generalConduct,
      whetherFailed: tc.whetherFailed,
      subject: tc.subjectsStudied,
      maxAttendance: tc.maxAttendance.toString(),
      obtainedAttendance: tc.obtainedAttendance.toString(),
      toClass: tc.toClass || '',
      classInWords: tc.classInWords || '',
      feesPaidUpTo: tc.feesPaidUpTo.toISOString(),
      tcCharge: tc.tcCharge.toString(),
      feesConcessionAvailed: tc.feeConcession,
      behaviorRemarks: tc.behaviorRemarks || '',
      dateOfLeaving: tc.dateOfLeaving.toISOString(),
      lastAttendanceDate: tc.lastAttendanceDate.toISOString(),
      dateOfIssue: tc.issuedDate.toISOString(),
      remarks: '',
      // Parse stored JSON strings back to arrays
      gamesPlayed: tc.gamesPlayed ? JSON.parse(tc.gamesPlayed) : [], 
      extraActivity: tc.extraActivities ? JSON.parse(tc.extraActivities) : [],
      // School details
      schoolDetails: {
        schoolName: tc.school?.schoolName || '',
        address: tc.school?.address || '',
        recognitionId: tc.school?.code || '',
        affiliationNo: '',
        contact: tc.school?.contact ? tc.school.contact.toString() : '',
        email: tc.school?.email || '',
        imageUrl: tc.school?.image_url || ''
      }
    };

    res.json({
      success: true,
      message: 'Transfer certificate updated successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Update TC Error:', error);
    
    // Provide appropriate error response based on error type
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed', 
        details: error.errors
      });
    } else if (error.name === 'PrismaClientKnownRequestError') {
      // Handle Prisma specific errors
      if (error.code === 'P2002') {
        return res.status(400).json({ 
          success: false,
          error: 'Duplicate entry', 
          details: 'A certificate with this information already exists'
        });
      }
    }
    
    // Generic error response for any other errors
    res.status(500).json({ 
      success: false,
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete TC
export const deleteTC = async (req, res) => {
  try {
    const { id } = req.params;

    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false,
        error: 'School context is required. Please ensure you are logged in properly.',
        details: 'Missing school context'
      });
    }

    // Build where clause based on user role
    let whereClause = { 
      id: Number(id),
      schoolId: schoolId
    };
    
    // Allow admins to delete any TC
    if (req.user?.role === 'admin') {
      whereClause = { id: Number(id) };
    }

    // Check if TC exists
    const tc = await prisma.transferCertificate.findFirst({
      where: whereClause
    });

    if (!tc) {
      return res.status(404).json({ 
        success: false,
        error: 'TC not found or you do not have permission to delete it' 
      });
    }

    await prisma.transferCertificate.delete({
      where: { id: Number(id) }
    });

    // Log the activity
    if (process.env.NODE_ENV === 'production') {
      await prisma.activityLog.create({
        data: {
          action: 'TC_DELETED',
          entityType: 'TRANSFER_CERTIFICATE',
          entityId: tc.id,
          userId: req.user?.id,
          userRole: req.user?.role,
          schoolId: tc.schoolId,
          details: `Transfer Certificate ${tc.tcNumber} deleted for ${tc.fullName} (${tc.admissionNumber})`,
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent']
        }
      }).catch(err => console.error('Failed to log activity:', err));
    }

    res.json({
      success: true,
      message: 'Transfer certificate deleted successfully'
    });
  } catch (error) {
    console.error('Delete TC Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Look up student by admission number
export const getStudentByAdmissionNumber = async (req, res) => {
  try {
    const { admissionNumber } = req.params;
    console.log(`[DEBUG] Looking up student with admission number: "${admissionNumber}"`);
    
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false,
        error: 'School context is required. Please ensure you are logged in properly.',
        details: 'Missing school context'
      });
    }
    
    // Log the database query we're about to make
    console.log(`[DEBUG] Querying database for student with admissionNo: "${admissionNumber}" in school: ${schoolId}`);
    
    // Build where clause based on user role
    let whereClause = { 
      admissionNo: admissionNumber,
      schoolId: schoolId
    };
    
    // Allow admins to search across all schools
    if (req.user?.role === 'admin' && req.query.allSchools === 'true') {
      whereClause = { admissionNo: admissionNumber };
    }
    
    const student = await prisma.student.findFirst({
      where: whereClause
    });

    console.log(`[DEBUG] Query result:`, student ? `Student found with ID: ${student.id}` : 'No student found');
    
    if (!student) {
      console.log(`[DEBUG] Student not found with admission number: "${admissionNumber}" in accessible scope`);
      return res.status(404).json({ 
        success: false,
        error: 'Student not found',
        detail: `No student found with admission number: ${admissionNumber} in your accessible scope`
      });
    }

    // Parse class information from sessionInfo or other fields
    let classInfo = student.sessionInfo?.currentClass || '';
    console.log(`[DEBUG] Original class value: "${classInfo}"`);
    
    // Return the student ID along with relevant details
    res.json({
      success: true,
      data: {
        id: student.id,
        fullName: student.fullName,
        admissionNumber: student.admissionNo,
        class: classInfo,
        section: student.sessionInfo?.currentSection || '',
        schoolId: student.schoolId
      }
    });
  } catch (error) {
    console.error('[ERROR] Student Lookup Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Fetch student details for TC form
export const fetchStudentDetails = async (req, res) => {
  try {
    const { admissionNumber } = req.params;
    console.log(`[DEBUG] Fetching details for student with admission number: "${admissionNumber}"`);
    
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false,
        error: 'School context is required. Please ensure you are logged in properly.',
        details: 'Missing school context'
      });
    }
    
    // Log the database query we're about to make
    console.log(`[DEBUG] Querying database for student details with admissionNo: "${admissionNumber}" in school: ${schoolId}`);
    
    // Build where clause based on user role
    let whereClause = { 
      admissionNo: admissionNumber,
      schoolId: schoolId
    };
    
    // Allow admins to search across all schools
    if (req.user?.role === 'admin' && req.query.allSchools === 'true') {
      whereClause = { admissionNo: admissionNumber };
    }
    
    const student = await prisma.student.findFirst({
      where: whereClause,
      include: {
        school: {
          select: {
            id: true,
            schoolName: true,
            address: true,
            code: true,
            contact: true,
            email: true,
            image_url: true
          }
        },
        sessionInfo: true,
        educationInfo: true,
        parentInfo: true,
        otherInfo: true
      }
    });

    console.log(`[DEBUG] Query result:`, student ? `Student details found with ID: ${student.id}` : 'No student details found');

    if (!student) {
      return res.status(404).json({ 
        success: false,
        error: 'Student not found',
        details: `No student found with admission number ${admissionNumber} in your school context`
      });
    }

    // Parse class information
    const classInfo = student.sessionInfo?.currentClass || student.sessionInfo?.admitClass || '';
    console.log(`[DEBUG] Original class value: "${classInfo}"`);
    console.log(`[DEBUG] Formatted class value: "${classInfo}"`);

    // Format the data for the TC form
    const studentDetails = {
      id: student.id,
      schoolId: student.schoolId,
      fullName: student.fullName,
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      nationality: student.nationality || 'Indian',
      category: student.category || 'General',
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString() : new Date().toISOString(),
      dateOfAdmission: student.createdAt ? student.createdAt.toISOString() : new Date().toISOString(),
      section: student.sessionInfo?.currentSection || student.sessionInfo?.admitSection || '',
      admissionNo: student.admissionNo,
      currentClass: student.sessionInfo?.currentClass || classInfo,
      rollNo: student.sessionInfo?.currentRollNo || student.sessionInfo?.admitRollNo || '',
      admitClass: student.sessionInfo?.admitClass || classInfo,
      academicYear: new Date().getFullYear().toString(),
      // Default values for TC fields
      lastAttendanceDate: new Date().toISOString(),
      feesPaidUpTo: new Date().toISOString(),
      subject: 'English, Hindi, Mathematics, Science, Social Studies',
      maxAttendance: '220',
      obtainedAttendance: '200',
      examIn: 'School',
      whetherFailed: 'No',
      qualified: 'Yes',
      feeConcession: student.otherInfo?.belongToBPL === 'yes' ? 'Partial' : 'None',
      generalConduct: 'Good',
      // School details
      schoolDetails: {
        schoolName: student.school?.schoolName || '',
        address: student.school?.address || '',
        recognitionId: student.school?.code || '',
        affiliationNo: '', // Set to empty string since it's not in the schema
        contact: student.school?.contact ? student.school.contact.toString() : '',
        email: student.school?.email || '',
        imageUrl: student.school?.image_url || ''
      }
    };

    res.json({
      success: true,
      data: studentDetails
    });
  } catch (error) {
    console.error('[ERROR] Error fetching student details:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch student details'
    });
  }
};
