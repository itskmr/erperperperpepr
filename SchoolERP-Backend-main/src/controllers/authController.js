import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

/**
 * Validates a student invitation key by checking if it matches a student ID
 */
export const validateStudentInvitation = async (req, res) => {
  try {
    // Accept both token and invitationKey in the request for compatibility
    const invitationKey = req.body.invitationKey || req.body.token;
    const { admissionNo } = req.body;

    if (!invitationKey) {
      return res.status(400).json({
        success: false,
        message: 'Invitation key is required'
      });
    }

    // Find student by ID (the invitation key should be the student ID)
    const student = await prisma.student.findUnique({
      where: { id: invitationKey }
    });

    // If student not found by ID, check by admission number
    if (!student && admissionNo) {
      const studentByAdmission = await prisma.student.findUnique({
        where: { admissionNo }
      });

      if (studentByAdmission) {
        // Check if the invitation key matches this student's ID
        if (studentByAdmission.id === invitationKey) {
          return res.status(200).json({
            success: true,
            message: 'Invitation key is valid',
            studentId: studentByAdmission.id,
            isRegistered: studentByAdmission.loginEnabled,
            email: studentByAdmission.email || ''
          });
        }
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid invitation key'
      });
    }

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid invitation key'
      });
    }

    // Invitation is valid
    return res.status(200).json({
      success: true,
      message: 'Invitation key is valid',
      studentId: student.id,
      isRegistered: student.loginEnabled,
      email: student.email || ''
    });
  } catch (error) {
    console.error('Error validating invitation:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

/**
 * Registers a student account using admissionNo and invitation key (student ID)
 */
export const registerStudent = async (req, res) => {
  try {
    // Accept both token and invitationKey for compatibility
    const invitationKey = req.body.invitationKey || req.body.token;
    const { email, password, admissionNo, confirmPassword } = req.body;

    // Basic validation
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Confirm password check if provided
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Direct signup using admission number without invitation key
    if (admissionNo && !invitationKey) {
      // Find student by admission number
      const student = await prisma.student.findUnique({
        where: { admissionNo }
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found with the provided admission number'
        });
      }

      // Check if login is already enabled
      if (student.loginEnabled) {
        return res.status(400).json({
          success: false,
          message: 'Student account is already registered'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Use existing email if not provided
      const studentEmail = email || student.email;
      
      if (!studentEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Add additional fields from request if provided
      const additionalData = {};
      const allowedFields = ['rollNumber', 'mobileNumber']; 
      
      for (const field of allowedFields) {
        if (req.body[field]) {
          additionalData[field] = req.body[field];
        }
      }

      // Update student with email, password and loginEnabled
      const updatedStudent = await prisma.student.update({
        where: { id: student.id },
        data: {
          email: studentEmail,
          password: hashedPassword,
          loginEnabled: true,
          ...additionalData
        }
      });

      // Create JWT token
      const token = jwt.sign(
        {
          id: updatedStudent.id,
          email: updatedStudent.email,
          role: 'student'
        },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Student registered successfully',
        data: {
          token,
          user: {
            id: updatedStudent.id,
            name: updatedStudent.fullName,
            email: updatedStudent.email,
            role: 'student',
            admissionNo: updatedStudent.admissionNo
          }
        }
      });
    }

    // If we have both admission number and invitationKey, use them
    if (admissionNo && invitationKey) {
      // Find student by admission number
      const student = await prisma.student.findUnique({
        where: { admissionNo }
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Verify invitation key (should match student ID)
      if (student.id !== invitationKey) {
        return res.status(401).json({
          success: false,
          message: 'Invalid invitation key'
        });
      }

      // Check if login is already enabled
      if (student.loginEnabled) {
        return res.status(400).json({
          success: false,
          message: 'Student account is already registered'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Use existing email if not provided
      const studentEmail = email || student.email;
      
      if (!studentEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Update student with email, password and loginEnabled
      const updatedStudent = await prisma.student.update({
        where: { id: student.id },
        data: {
          email: studentEmail,
          password: hashedPassword,
          loginEnabled: true
        }
      });

      // Create JWT token
      const token = jwt.sign(
        {
          id: updatedStudent.id,
          email: updatedStudent.email,
          role: 'student'
        },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Student registered successfully',
        data: {
          token,
          user: {
            id: updatedStudent.id,
            name: updatedStudent.fullName,
            email: updatedStudent.email,
            role: 'student',
            admissionNo: updatedStudent.admissionNo
          }
        }
      });
    } else {
      // If we only have invitationKey (token), try to find student by ID
      if (invitationKey) {
        const student = await prisma.student.findUnique({
          where: { id: invitationKey }
        });

        if (!student) {
          return res.status(404).json({
            success: false,
            message: 'Student not found'
          });
        }

        // Check if login is already enabled
        if (student.loginEnabled) {
          return res.status(400).json({
            success: false,
            message: 'Student account is already registered'
          });
        }

        // We need an email if it's not already set
        if (!email && !student.email) {
          return res.status(400).json({
            success: false,
            message: 'Email is required'
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update student with email, password and loginEnabled
        const updatedStudent = await prisma.student.update({
          where: { id: student.id },
          data: {
            email: email || student.email,
            password: hashedPassword,
            loginEnabled: true
          }
        });

        // Create JWT token
        const token = jwt.sign(
          {
            id: updatedStudent.id,
            email: updatedStudent.email,
            role: 'student'
          },
          process.env.JWT_SECRET || 'fallback_secret_key',
          { expiresIn: '7d' }
        );

        return res.status(200).json({
          success: true,
          message: 'Student registered successfully',
          data: {
            token,
            user: {
              id: updatedStudent.id,
              name: updatedStudent.fullName,
              email: updatedStudent.email,
              role: 'student',
              admissionNo: updatedStudent.admissionNo
            }
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Either admission number or invitation key is required'
        });
      }
    }
  } catch (error) {
    console.error('Error registering student:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

/**
 * Logs in a student using email and password
 */
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find student by email with school context
    const student = await prisma.student.findFirst({
      where: { email },
      include: {
        school: {
          select: { id: true, schoolName: true, status: true }
        }
      }
    });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if login is enabled
    if (!student.loginEnabled) {
      return res.status(401).json({
        success: false,
        message: 'Student account is not activated'
      });
    }

    // Check if password exists
    if (!student.password) {
      return res.status(401).json({
        success: false,
        message: 'Password not set for this account'
      });
    }

    // Check if associated school is active
    if (student.school?.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Associated school is inactive'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Create JWT token with school context for multi-school isolation
    const token = jwt.sign(
      {
        id: student.id,
        email: student.email,
        role: 'student',
        schoolId: student.schoolId // Include school ID for data isolation
      },
      process.env.JWT_SECRET || 'school_management_secret_key',
      { expiresIn: '7d' }
    );

    // Update last login time
    await prisma.student.update({
      where: { id: student.id },
      data: { lastLogin: new Date() }
    }).catch(err => console.error('Failed to update last login time:', err));

    return res.status(200).json({
      success: true,
      message: 'Student logged in successfully',
      data: {
        token,
        user: {
          id: student.id,
          name: student.fullName,
          email: student.email,
          role: 'student',
          admissionNo: student.admissionNo,
          schoolId: student.schoolId,
          schoolName: student.school?.schoolName,
          class: student.className,
          section: student.section || ''
        }
      }
    });
  } catch (error) {
    console.error('Error logging in student:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

/**
 * Validates a parent invitation key by checking if it matches a student ID
 */
export const validateParentInvitation = async (req, res) => {
  try {
    // Accept both token and invitationKey for compatibility
    const invitationKey = req.body.invitationKey || req.body.token;
    const { admissionNo } = req.body;

    if (!invitationKey) {
      return res.status(400).json({
        success: false,
        message: 'Invitation key is required'
      });
    }

    // Find student by ID (the invitation key should be the student ID)
    const student = await prisma.student.findUnique({
      where: { id: invitationKey },
      include: { parentInfo: true }
    });

    // If not found by ID, check by admission number
    if (!student && admissionNo) {
      const studentByAdmission = await prisma.student.findUnique({
        where: { admissionNo },
        include: { parentInfo: true }
      });

      if (studentByAdmission) {
        // Check if invitation key matches this student's ID
        if (studentByAdmission.id === invitationKey) {
          const isRegistered = studentByAdmission.parentInfo && Boolean(studentByAdmission.parentInfo.password);
          
          // Get parent email (can be null if ParentInfo doesn't exist)
          const parentEmail = studentByAdmission.parentInfo 
            ? (studentByAdmission.parentInfo.fatherEmail || studentByAdmission.parentInfo.motherEmail || '')
            : '';
            
          return res.status(200).json({
            success: true,
            message: isRegistered ? 'Parent already registered' : 'Invitation key is valid',
            studentId: studentByAdmission.id,
            parentInfoId: studentByAdmission.parentInfo ? studentByAdmission.parentInfo.id : null,
            isRegistered,
            email: parentEmail
          });
        }
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid invitation key'
      });
    }

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid invitation key'
      });
    }

    // Check if parent is already registered - parent can register even if parentInfo doesn't exist
    const isRegistered = student.parentInfo && Boolean(student.parentInfo.password);
    
    // Get parent email (can be null if ParentInfo doesn't exist)
    const parentEmail = student.parentInfo 
      ? (student.parentInfo.fatherEmail || student.parentInfo.motherEmail || '')
      : '';

    return res.status(200).json({
      success: true,
      message: isRegistered ? 'Parent already registered' : 'Invitation key is valid',
      studentId: student.id,
      parentInfoId: student.parentInfo ? student.parentInfo.id : null,
      isRegistered,
      email: parentEmail
    });
  } catch (error) {
    console.error('Error validating parent invitation:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

/**
 * Registers a parent account using studentId, parentInfoId and invitation key
 */
export const registerParent = async (req, res) => {
  try {
    // Accept both token and invitationKey for compatibility
    const invitationKey = req.body.invitationKey || req.body.token;
    const { email, password, admissionNo, confirmPassword } = req.body;

    // Basic validation
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Confirm password check if provided
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // If we don't have email, we can't proceed
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // If we don't have invitationKey, we can't proceed
    if (!invitationKey) {
      return res.status(400).json({
        success: false,
        message: 'Invitation key is required'
      });
    }

    let student;
    
    // Find student based on the information we have
    if (admissionNo) {
      student = await prisma.student.findUnique({
        where: { admissionNo },
        include: { parentInfo: true }
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Verify invitation key matches student ID
      if (student.id !== invitationKey) {
        return res.status(401).json({
          success: false,
          message: 'Invalid invitation key'
        });
      }
    } else {
      // Try to find directly by student ID (invitationKey)
      student = await prisma.student.findUnique({
        where: { id: invitationKey },
        include: { parentInfo: true }
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
    }

    // Check if parent info exists
    if (!student.parentInfo) {
      // Create parent info if it doesn't exist
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const parentInfo = await prisma.parentInfo.create({
        data: {
          fatherEmail: email,
          password: hashedPassword,
          studentId: student.id
        }
      });
      
      // Create JWT token
      const token = jwt.sign(
        {
          id: parentInfo.id,
          studentId: student.id,
          email,
          role: 'parent'
        },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '7d' }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Parent registered successfully',
        data: {
          token,
          user: {
            id: parentInfo.id,
            studentId: student.id,
            name: student.fatherName,
            email,
            role: 'parent',
            studentName: `${student.firstName} ${student.lastName}`,
            admissionNo: student.admissionNo
          }
        }
      });
    }

    // Check if parent already registered
    if (student.parentInfo.password) {
      return res.status(400).json({
        success: false,
        message: 'Parent account is already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine which email field to update
    const isMotherEmail = email === student.parentInfo.motherEmail;
    const isFatherEmail = email === student.parentInfo.fatherEmail;
    
    let updateData = { password: hashedPassword };
    
    // If email doesn't match existing emails, update the father's email by default
    if (!isMotherEmail && !isFatherEmail) {
      updateData.fatherEmail = email;
    }

    // Update parent info with password
    const updatedParentInfo = await prisma.parentInfo.update({
      where: { id: student.parentInfo.id },
      data: updateData
    });

    // Create JWT token
    const token = jwt.sign(
      {
        id: updatedParentInfo.id,
        studentId: student.id,
        email,
        role: 'parent'
      },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    // Determine parent name
    const parentName = email === student.parentInfo.motherEmail 
      ? student.motherName 
      : student.fatherName;

    return res.status(200).json({
      success: true,
      message: 'Parent registered successfully',
      data: {
        token,
        user: {
          id: updatedParentInfo.id,
          studentId: student.id,
          name: parentName,
          email,
          role: 'parent',
          studentName: `${student.firstName} ${student.lastName}`,
          admissionNo: student.admissionNo
        }
      }
    });
  } catch (error) {
    console.error('Error registering parent:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

/**
 * Logs in a parent using email and password
 */
export const loginParent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find parent by email (checking both father and mother email fields) with school context
    const parentInfo = await prisma.parentInfo.findFirst({
      where: {
        OR: [
          { fatherEmail: email },
          { motherEmail: email }
        ]
      },
      include: { 
        student: {
          include: {
            school: {
              select: { id: true, schoolName: true, status: true }
            }
          }
        }
      }
    });

    if (!parentInfo || !parentInfo.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, parentInfo.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Make sure student data is available
    if (!parentInfo.student) {
      return res.status(404).json({
        success: false,
        message: 'Student information not found for this parent account'
      });
    }

    // Check if associated school is active
    if (parentInfo.student.school?.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Associated school is inactive'
      });
    }

    // Create JWT token with school context for multi-school isolation
    const token = jwt.sign(
      {
        id: parentInfo.id,
        studentId: parentInfo.student.id,
        email,
        role: 'parent',
        schoolId: parentInfo.student.schoolId // Include school ID for data isolation
      },
      process.env.JWT_SECRET || 'school_management_secret_key',
      { expiresIn: '7d' }
    );

    // Determine parent name based on which email matched
    const parentName = email === parentInfo.motherEmail 
      ? parentInfo.student.motherName 
      : parentInfo.student.fatherName;

    // Update last login time
    await prisma.parentInfo.update({
      where: { id: parentInfo.id },
      data: { lastLogin: new Date() }
    }).catch(err => console.error('Failed to update last login time:', err));

    return res.status(200).json({
      success: true,
      message: 'Parent logged in successfully',
      data: {
        token,
        user: {
          id: parentInfo.id,
          studentId: parentInfo.student.id,
          name: parentName,
          email,
          role: 'parent',
          schoolId: parentInfo.student.schoolId,
          schoolName: parentInfo.student.school?.schoolName,
          studentName: parentInfo.student.fullName,
          admissionNo: parentInfo.student.admissionNo
        }
      }
    });
  } catch (error) {
    console.error('Error logging in parent:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

/**
 * Checks if an admission number exists in the database
 * This is used for student registration to verify admission number before proceeding
 * Returns additional student details if found to pre-fill the form
 */
export const checkAdmissionNumber = async (req, res) => {
  try {
    const { admissionNumber } = req.body;

    if (!admissionNumber) {
      return res.status(400).json({
        success: false,
        message: 'Admission number is required'
      });
    }

    // Find student by admission number with school details
    const student = await prisma.student.findUnique({
      where: { admissionNo: admissionNumber },
      include: {
        school: {
          select: {
            id: true,
            fullName: true,
            code: true
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Invalid admission number. Please check with your school administrator.',
        exists: false
      });
    }

    // Check if student already has login enabled
    if (student.loginEnabled) {
      return res.status(400).json({
        success: false,
        message: 'This admission number is already registered. Please login instead.',
        exists: true,
        isRegistered: true
      });
    }

    // Return success with detailed student information to pre-fill the form
    return res.status(200).json({
      success: true,
      message: 'Admission number verified successfully',
      exists: true,
      isRegistered: false,
      data: {
        studentId: student.id,
        className: student.className,
        section: student.section || '',
        schoolId: student.schoolId,
        schoolName: student.school.fullName,
        schoolCode: student.school.code,
        firstName: student.firstName,
        lastName: student.lastName,
        fullName: `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`,
        grade: student.className // For backward compatibility
      }
    });
  } catch (error) {
    console.error('Error checking admission number:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during verification',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

/**
 * Handles student signup from the frontend form
 * Validates admission number and completes registration in one step
 * Updates existing student record with login credentials
 */
export const studentSignupFromForm = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      confirmPassword, 
      admissionNumber, 
      name, 
      className, 
      section, 
      school,
      rollNumber,
      mobileNumber,
      presentCity,
      presentState,
      presentPinCode
    } = req.body;

    // Enhanced validation
    if (!email || !password || !admissionNumber) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and admission number are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check for password strength (optional)
    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordStrengthRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      });
    }

    // Confirm password check if provided
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Find student by admission number
    const student = await prisma.student.findUnique({
      where: { admissionNo: admissionNumber }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found with the provided admission number'
      });
    }

    // Check if login is already enabled
    if (student.loginEnabled) {
      return res.status(400).json({
        success: false,
        message: 'This student account is already registered. Please login instead.'
      });
    }

    // Check if email is already in use by another student
    const existingEmailUser = await prisma.student.findFirst({
      where: {
        email: email,
        id: { not: student.id }
      }
    });

    if (existingEmailUser) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered with another account'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create update data object with all provided information
    const updateData = {
      email: email,
      password: hashedPassword,
      loginEnabled: true,
      lastLogin: new Date(),
      // Add additional fields if provided
      ...(rollNumber && { rollNumber }),
      ...(mobileNumber && { mobileNumber }),
      ...(presentCity && { presentCity }),
      ...(presentState && { presentState }),
      ...(presentPinCode && { presentPinCode })
    };

    // Update student record
    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: updateData,
      include: {
        school: {
          select: {
            fullName: true,
            code: true
          }
        }
      }
    });

    // Create JWT token with comprehensive claims
    const token = jwt.sign(
      {
        id: updatedStudent.id,
        email: updatedStudent.email,
        role: 'student',
        admissionNo: updatedStudent.admissionNo,
        schoolId: updatedStudent.schoolId
      },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    // Return comprehensive user data
    return res.status(200).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        token,
        user: {
          id: updatedStudent.id,
          name: updatedStudent.fullName,
          email: updatedStudent.email,
          role: 'student',
          admissionNo: updatedStudent.admissionNo,
          class: updatedStudent.className,
          section: updatedStudent.section || '',
          schoolId: updatedStudent.schoolId,
          schoolName: updatedStudent.school.fullName,
          schoolCode: updatedStudent.school.code,
          mobileNumber: updatedStudent.mobileNumber
        }
      }
    });
  } catch (error) {
    console.error('Error during student signup:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

/**
 * Registers a new student directly in the system
 * This is used when the student doesn't already exist in the database
 * Requires approval from school admin before enabling login
 */
export const registerNewStudent = async (req, res) => {
  try {
    const { 
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      gender,
      className,
      section,
      schoolId,
      fatherName,
      motherName,
      mobileNumber,
      presentCity,
      presentState,
      presentPinCode,
      admissionNo // Optional - can be generated if not provided
    } = req.body;

    // Basic validation
    if (!email || !password || !firstName || !lastName || !dateOfBirth || 
        !gender || !className || !schoolId || !fatherName || !motherName || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled'
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Confirm password check
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if email is already in use
    const existingEmail = await prisma.student.findFirst({
      where: { email }
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Check if school exists
    const school = await prisma.school.findUnique({
      where: { id: parseInt(schoolId) }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Generate an admission number if not provided
    let studentAdmissionNo = admissionNo;
    if (!studentAdmissionNo) {
      // Format: School code + year + sequential number
      const year = new Date().getFullYear().toString().substr(-2);
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      studentAdmissionNo = `${school.code}${year}${randomNum}`;
      
      // Check if this admission number already exists
      const existingAdmissionNo = await prisma.student.findUnique({
        where: { admissionNo: studentAdmissionNo }
      });
      
      // If exists, generate a new one
      if (existingAdmissionNo) {
        const newRandomNum = Math.floor(10000 + Math.random() * 90000);
        studentAdmissionNo = `${school.code}${year}${newRandomNum}`;
      }
    } else {
      // Check if provided admission number is already in use
      const existingAdmissionNo = await prisma.student.findUnique({
        where: { admissionNo: studentAdmissionNo }
      });
      
      if (existingAdmissionNo) {
        return res.status(400).json({
          success: false,
          message: 'This admission number is already in use'
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Format date of birth
    let birthDate = new Date(dateOfBirth);
    
    // Calculate age
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Create new student
    const newStudent = await prisma.student.create({
      data: {
        fullName: `${firstName} ${lastName}`,
        admissionNo: studentAdmissionNo,
        dateOfBirth: birthDate,
        age,
        gender,
        className,
        section,
        schoolId: parseInt(schoolId),
        fatherName,
        motherName,
        mobileNumber,
        presentCity,
        presentState,
        presentPinCode,
        email,
        password: hashedPassword,
        // Set login to disabled by default - requires school admin approval
        loginEnabled: false,
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Student registration submitted successfully. Please wait for approval from your school administrator.',
      data: {
        id: newStudent.id,
        name: newStudent.fullName,
        admissionNo: newStudent.admissionNo,
        email: newStudent.email
      }
    });
  } catch (error) {
    console.error('Error registering new student:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}; 