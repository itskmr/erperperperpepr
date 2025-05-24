// controllers/tcController.js
import { PrismaClient } from '@prisma/client';
import { TCCreateSchema, TCUpdateSchema, convertFrontendToBackend } from '../utils/tcformValidator.js';

const prisma = new PrismaClient();

// Helper function to generate TC Number
const generateTCNumber = () => {
  const prefix = 'TC';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// Create TC
export const createTC = async (req, res) => {
  try {
    // Validate request data
    let validatedData;
    try {
      validatedData = TCCreateSchema.parse(req.body);
    } catch (validationError) {
      console.error('TC Validation Error:', validationError);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationError.errors || validationError.message
      });
    }

    // Verify student exists
    let student;
    try {
      student = await prisma.student.findUnique({
        where: { id: validatedData.studentId },
        include: {
          school: true,
          parentInfo: true,
          sessionInfo: true
        }
      });
    } catch (dbError) {
      console.error('Database error when finding student:', dbError);
      return res.status(500).json({ 
        error: 'Database error', 
        details: 'Error retrieving student information'
      });
    }

    if (!student) {
      return res.status(404).json({ 
        error: 'Student not found',
        details: `No student found with ID ${validatedData.studentId}`
      });
    }

    // Convert string values to appropriate types
    const formattedData = {
      ...validatedData,
      maxAttendance: Number(validatedData.maxAttendance),
      obtainedAttendance: Number(validatedData.obtainedAttendance),
      tcCharge: Number(validatedData.tcCharge || 0),
      // Convert enum string values to enum types
      whetherFailed: validatedData.whetherFailed,
      examAppearedIn: validatedData.examAppearedIn,
      qualifiedForPromotion: validatedData.qualifiedForPromotion,
      reasonForLeaving: validatedData.reasonForLeaving,
      generalConduct: validatedData.generalConduct,
      feeConcession: validatedData.feeConcession || 'None',
      tcstatus: 1, // 1 for issued/active
      // Ensure the roll number is stored correctly
      rollNumber: validatedData.rollNumber || student.rollNumber || "",
      // Use provided TC number or generate a new one
      tcNumber: validatedData.tcNumber || generateTCNumber(),
      // Serialize arrays as JSON strings
      gamesPlayed: req.body.gamesPlayed ? JSON.stringify(req.body.gamesPlayed) : null,
      extraActivities: req.body.extraActivity ? JSON.stringify(req.body.extraActivity) : null
    };
    
    // Create the certificate in the database
    let tc;
    try {
      tc = await prisma.transferCertificate.create({
        data: {
          ...formattedData,
          issuedDate: new Date(validatedData.issuedDate) || new Date(),
          student: { connect: { id: validatedData.studentId } },
          school: { connect: { id: validatedData.schoolId } }
        },
        include: {
          student: true,
          school: true
        }
      });
    } catch (createError) {
      console.error('Error creating transfer certificate:', createError);
      return res.status(500).json({ 
        error: 'Database error', 
        details: 'Failed to create transfer certificate',
        message: createError.message
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
        schoolName: tc.school.fullName,
        address: tc.school.address,
        contact: tc.school.contact.toString(),
        email: tc.school.email,
        recognitionId: tc.school.code || '',
        affiliationNo: '',
        website: '',
        imageUrl: ''
      }
    };
    
    res.status(201).json(responseData);
  } catch (error) {
    console.error('TC Create Error:', error);
    
    // Provide appropriate error response based on error type
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors
      });
    } else if (error.name === 'PrismaClientKnownRequestError') {
      // Handle Prisma specific errors
      if (error.code === 'P2002') {
        return res.status(400).json({ 
          error: 'Duplicate entry', 
          details: 'A certificate with this information already exists'
        });
      } else if (error.code === 'P2003') {
        return res.status(400).json({ 
          error: 'Foreign key constraint failed', 
          details: 'Student or school ID is invalid'
        });
      }
    }
    
    // Generic error response for any other errors
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      code: error.code
    });
  }
};

// Get all TCs
export const getAllTCs = async (req, res) => {
  try {
    const { schoolId, admissionNumber, search, class: studentClass, rollNumber } = req.query;
    
    const whereClause = {};
    
    // Filter by school ID
    if (schoolId) {
      whereClause.schoolId = Number(schoolId);
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

    const tcs = await prisma.transferCertificate.findMany({
      where: whereClause,
      include: {
        student: true,
        school: true
      },
      orderBy: {
        issuedDate: 'desc'
      }
    });

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
        schoolName: tc.school.fullName,
        address: tc.school.address,
        recognitionId: tc.school.code || '',
        affiliationNo: '',
        contact: tc.school.contact.toString(),
        email: tc.school.email,
        website: '',
        imageUrl: ''
      }
    }));

    res.json(responseData);
  } catch (error) {
    console.error('Get All TCs Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get single TC
export const getTC = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tc = await prisma.transferCertificate.findUnique({
      where: { id: Number(id) },
      include: {
        student: true,
        school: true
      }
    });

    if (!tc) {
      return res.status(404).json({ error: 'TC not found' });
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
        schoolName: tc.school.fullName,
        address: tc.school.address,
        recognitionId: tc.school.code || '',
        affiliationNo: '',
        contact: tc.school.contact.toString(),
        email: tc.school.email,
        website: '',
        imageUrl: ''
      }
    };

    res.json(responseData);
  } catch (error) {
    console.error('Get TC Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Update TC
export const updateTC = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ 
        error: 'Invalid ID', 
        details: 'Certificate ID must be a valid number'
      });
    }
    
    // Validate request data
    let validatedData;
    try {
      validatedData = TCUpdateSchema.parse(req.body);
    } catch (validationError) {
      console.error('TC Update Validation Error:', validationError);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationError.errors || validationError.message
      });
    }

    // Check if the TC exists
    const existingTC = await prisma.transferCertificate.findUnique({
      where: { id: Number(id) }
    });

    if (!existingTC) {
      return res.status(404).json({ 
        error: 'Certificate not found', 
        details: `No transfer certificate found with ID ${id}`
      });
    }

    // Convert string values to appropriate types
    const formattedData = {
      ...validatedData,
      maxAttendance: Number(validatedData.maxAttendance),
      obtainedAttendance: Number(validatedData.obtainedAttendance),
      tcCharge: Number(validatedData.tcCharge || 0),
      // Ensure the roll number is stored correctly
      rollNumber: validatedData.rollNumber || "",
      // Serialize arrays as JSON strings if provided
      gamesPlayed: req.body.gamesPlayed ? JSON.stringify(req.body.gamesPlayed) : undefined,
      extraActivities: req.body.extraActivity ? JSON.stringify(req.body.extraActivity) : undefined,
      // Update issued date if provided
      issuedDate: validatedData.issuedDate ? new Date(validatedData.issuedDate) : undefined,
      // Remove fields that should not be updated
      studentId: undefined,
      schoolId: undefined
    };

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
        error: 'Database error', 
        details: 'Failed to update transfer certificate',
        message: updateError.message
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
        schoolName: tc.school.fullName,
        address: tc.school.address,
        recognitionId: tc.school.code || '',
        affiliationNo: '',
        contact: tc.school.contact.toString(),
        email: tc.school.email,
        website: '',
        imageUrl: ''
      }
    };

    res.json(responseData);
  } catch (error) {
    console.error('Update TC Error:', error);
    
    // Provide appropriate error response based on error type
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors
      });
    } else if (error.name === 'PrismaClientKnownRequestError') {
      // Handle Prisma specific errors
      if (error.code === 'P2002') {
        return res.status(400).json({ 
          error: 'Duplicate entry', 
          details: 'A certificate with this information already exists'
        });
      }
    }
    
    // Generic error response for any other errors
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message
    });
  }
};

// Delete TC
export const deleteTC = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if TC exists
    const tc = await prisma.transferCertificate.findUnique({
      where: { id: Number(id) }
    });

    if (!tc) {
      return res.status(404).json({ error: 'TC not found' });
    }

    await prisma.transferCertificate.delete({
      where: { id: Number(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete TC Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Look up student by admission number
export const getStudentByAdmissionNumber = async (req, res) => {
  try {
    const { admissionNumber } = req.params;
    console.log(`[DEBUG] Looking up student with admission number: "${admissionNumber}"`);
    
    // Log the database query we're about to make
    console.log(`[DEBUG] Querying database for student with admissionNo: "${admissionNumber}"`);
    
    const student = await prisma.student.findFirst({
      where: { 
        admissionNo: admissionNumber 
      }
    });

    console.log(`[DEBUG] Query result:`, student ? `Student found with ID: ${student.id}` : 'No student found');
    
    if (!student) {
      console.log(`[DEBUG] Student not found with admission number: "${admissionNumber}"`);
      return res.status(404).json({ 
        error: 'Student not found',
        detail: `No student found with admission number: ${admissionNumber}`
      });
    }

    // Parse class information for special formats (like "Nur" for nursery)
    let classInfo = student.className || '';
    console.log(`[DEBUG] Original class value: "${classInfo}"`);
    
    // Standardize class name format for consistent handling
    if (classInfo.toLowerCase().includes('nur')) {
      console.log(`[DEBUG] Nursery class detected: "${classInfo}"`);
      classInfo = 'Nursery';
    } else if (/^[0-9]+$/.test(classInfo)) {
      console.log(`[DEBUG] Numeric class detected: "${classInfo}"`);
      classInfo = `Class ${classInfo}`;
    }
    console.log(`[DEBUG] Formatted class value: "${classInfo}"`);

    // Return the student ID along with relevant details
    res.json({
      id: student.id,
      fullName: `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim(),
      admissionNumber: student.admissionNo,
      class: classInfo,
      section: student.section || '',
      schoolId: student.schoolId
    });
  } catch (error) {
    console.error('[ERROR] Student Lookup Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Fetch student details for TC form
export const fetchStudentDetails = async (req, res) => {
  try {
    const { admissionNumber } = req.params;
    console.log(`[DEBUG] Fetching details for student with admission number: "${admissionNumber}"`);
    
    // Log the database query we're about to make
    console.log(`[DEBUG] Querying database for student details with admissionNo: "${admissionNumber}"`);
    
    const student = await prisma.student.findFirst({
      where: { 
        admissionNo: admissionNumber 
      },
      include: {
        school: true,
        sessionInfo: true,
        educationInfo: true,
        parentInfo: true,
        otherInfo: true
      }
    });

    console.log(`[DEBUG] Query result:`, student ? `Student details found with ID: ${student.id}` : 'No student details found');

    if (!student) {
      console.log(`[DEBUG] Student details not found with admission number: "${admissionNumber}"`);
      return res.status(404).json({ 
        error: 'Student not found',
        detail: `No student found with admission number: ${admissionNumber}`
      });
    }
    
    // Handle class name standardization (Nursery, Class 1, etc.)
    let classInfo = student.className || '';
    console.log(`[DEBUG] Student class value: "${classInfo}"`);
    
    // Standardize class name format for consistent handling
    if (classInfo.toLowerCase().includes('nur')) {
      console.log(`[DEBUG] Nursery class detected: "${classInfo}"`);
      classInfo = 'Nursery';
    } else if (/^[0-9]+$/.test(classInfo)) {
      console.log(`[DEBUG] Numeric class detected: "${classInfo}"`);
      classInfo = `Class ${classInfo}`;
    }
    console.log(`[DEBUG] Formatted class value: "${classInfo}"`);

    // Format the data for the TC form
    const studentDetails = {
      studentId: student.id,
      schoolId: student.schoolId,
      fullName: student.fullName,
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      nationality: student.nationality || 'Indian',
      category: student.category || 'General',
      dateOfBirth: student.dateOfBirth.toISOString(),
      dateOfAdmission: student.admissionDate.toISOString(),
      section: student.section || '',
      admissionNumber: student.admissionNo,
      currentClass: classInfo,
      rollNo: student.rollNumber || '',
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
        schoolName: student.school.fullName,
        address: student.school.address,
        recognitionId: student.school.code || '',
        affiliationNo: '',
        contact: student.school.contact.toString(),
        email: student.school.email,
        website: '',
        imageUrl: ''
      }
    };

    res.json(studentDetails);
  } catch (error) {
    console.error('[ERROR] Fetch Student Details Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
