import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Create a new student with all related information
 * @route POST /api/students
 * @access Public
 */
export const createStudent = async (req, res) => {
  try {
    console.log("Creating new student with form data");
    
    // Extract basic fields from request body
    const {
      branchName,
      fullName,
      dateOfBirth,
      gender,
      bloodGroup,
      nationality,
      religion,
      category,
      caste,
      aadhaarNumber,
      mobileNumber,
      email,
      emergencyContact,
      admissionNo,
      studentId,
      admissionDate,
      previousSchool,
      schoolId = 1, // Default school ID
    } = req.body;
    
    // Extract address fields
    const address = {
      houseNo: req.body['address.houseNo'] || '',
      street: req.body['address.street'] || '',
      city: req.body['address.city'] || '',
      state: req.body['address.state'] || '',
      pinCode: req.body['address.pinCode'] || '',
      permanentHouseNo: req.body['address.permanentHouseNo'] || '',
      permanentStreet: req.body['address.permanentStreet'] || '',
      permanentCity: req.body['address.permanentCity'] || '',
      permanentState: req.body['address.permanentState'] || '',
      permanentPinCode: req.body['address.permanentPinCode'] || '',
    };
    
    // Extract parent information
    const father = {
      name: req.body['father.name'] || req.body.fatherName || '',
      qualification: req.body['father.qualification'] || '',
      occupation: req.body['father.occupation'] || '',
      contactNumber: req.body['father.contactNumber'] || '',
      email: req.body['father.email'] || '',
      aadhaarNo: req.body['father.aadhaarNo'] || '',
      annualIncome: req.body['father.annualIncome'] || '',
      isCampusEmployee: req.body['father.isCampusEmployee'] || 'no',
    };
    
    const mother = {
      name: req.body['mother.name'] || req.body.motherName || '',
      qualification: req.body['mother.qualification'] || '',
      occupation: req.body['mother.occupation'] || '',
      contactNumber: req.body['mother.contactNumber'] || '',
      email: req.body['mother.email'] || '',
      aadhaarNo: req.body['mother.aadhaarNo'] || '',
      annualIncome: req.body['mother.annualIncome'] || '',
      isCampusEmployee: req.body['mother.isCampusEmployee'] || 'no',
    };
    
    const guardian = {
      name: req.body['guardian.name'] || '',
      address: req.body['guardian.address'] || '',
      contactNumber: req.body['guardian.contactNumber'] || '',
      email: req.body['guardian.email'] || '',
      aadhaarNo: req.body['guardian.aadhaarNo'] || '',
      occupation: req.body['guardian.occupation'] || '',
      annualIncome: req.body['guardian.annualIncome'] || '',
    };
    
    // Extract session information - only for admission session
    const sessionInfo = {
      admitGroup: req.body.admitSession.group,
      admitClass: req.body.admitSession.class,
      admitSection: req.body.admitSession.section,
      admitRollNo: req.body.admitSession.rollNo,
      currentGroup: null,
      currentClass: null,
      currentSection: null,
      currentRollNo: null,
      stream: null,
      semester: null,
      feeGroup: req.body.currentSession.feeGroup,
      house: req.body.currentSession.house
    };
    
    // Extract transport information
    const transport = {
      mode: req.body['transport.mode'] || '',
      area: req.body['transport.area'] || '',
      stand: req.body['transport.stand'] || '',
      route: req.body['transport.route'] || '',
      driver: req.body['transport.driver'] || '',
    };
    
    // Extract academic registration
    const academic = {
      registrationNo: req.body['academic.registrationNo'] || '',
    };
    
    // Extract last education details
    const lastEducation = {
      school: req.body['lastEducation.school'] || '',
      address: req.body['lastEducation.address'] || '',
      tcDate: req.body['lastEducation.tcDate'] || null,
      prevClass: req.body['lastEducation.prevClass'] || '',
      percentage: req.body['lastEducation.percentage'] || '',
      attendance: req.body['lastEducation.attendance'] || '',
      extraActivity: req.body['lastEducation.extraActivity'] || '',
    };
    
    // Extract other information
    const other = {
      belongToBPL: req.body['other.belongToBPL'] || 'no',
      minority: req.body['other.minority'] || 'no',
      disability: req.body['other.disability'] || '',
      accountNo: req.body['other.accountNo'] || '',
      bank: req.body['other.bank'] || '',
      ifscCode: req.body['other.ifscCode'] || '',
      medium: req.body['other.medium'] || '',
      lastYearResult: req.body['other.lastYearResult'] || '',
      singleParent: req.body['other.singleParent'] || 'no',
      onlyChild: req.body['other.onlyChild'] || 'no',
      onlyGirlChild: req.body['other.onlyGirlChild'] || 'no',
      adoptedChild: req.body['other.adoptedChild'] || 'no',
      siblingAdmissionNo: req.body['other.siblingAdmissionNo'] || '',
      transferCase: req.body['other.transferCase'] || 'no',
      livingWith: req.body['other.livingWith'] || '',
      motherTongue: req.body['other.motherTongue'] || '',
      admissionType: req.body['other.admissionType'] || 'new',
      udiseNo: req.body['other.udiseNo'] || '',
    };
    
    // Handle file uploads and get paths
    const files = req.files || {};
    
    // Get file paths if they exist
    const getFilePath = (fieldName) => {
      if (files[fieldName] && files[fieldName][0]) {
        return files[fieldName][0].path;
      }
      return null;
    };
    
    const documents = {
      studentImagePath: getFilePath('documents.studentImage'),
      fatherImagePath: getFilePath('documents.fatherImage'),
      motherImagePath: getFilePath('documents.motherImage'),
      guardianImagePath: getFilePath('documents.guardianImage'),
      signaturePath: getFilePath('documents.signature'),
      fatherAadharPath: getFilePath('documents.fatherAadhar'),
      motherAadharPath: getFilePath('documents.motherAadhar'),
      birthCertificatePath: getFilePath('documents.birthCertificate'),
      migrationCertificatePath: getFilePath('documents.migrationCertificate'),
      aadhaarCardPath: getFilePath('documents.aadhaarCard'),
    };
    
    // Use a transaction to ensure all related records are created or none at all
    const student = await prisma.$transaction(async (prisma) => {
      // Create the student record first
      const newStudent = await prisma.student.create({
        data: {
          branchName,
          fullName,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
          gender: gender || "OTHER",
          bloodGroup,
          nationality: nationality || "Indian",
          religion,
          category,
          caste,
          aadhaarNumber,
          mobileNumber: mobileNumber || "0000000000",
          email: email || "",
          emergencyContact,
          admissionNo: admissionNo || `ADM-${Date.now()}`,
          studentId,
          admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
          previousSchool,
          
          // Address fields - map from nested structure to flat structure
          houseNo: address.houseNo,
          street: address.street,
          city: address.city || "Unknown",
          state: address.state || "Unknown",
          pinCode: address.pinCode,
          permanentHouseNo: address.permanentHouseNo,
          permanentStreet: address.permanentStreet,
          permanentCity: address.permanentCity,
          permanentState: address.permanentState,
          permanentPinCode: address.permanentPinCode,
          sameAsPresentAddress: req.body['address.sameAsPresentAddress'] || false,
          
          // Parent information - ensure both direct and nested paths are checked
          fatherName: father.name || req.body.fatherName || '',
          motherName: mother.name || req.body.motherName || '',
          
          // Connect to school
          school: {
            connect: {
              id: parseInt(schoolId, 10)
            }
          },
          
          // SessionInfo
          sessionInfo: {
            create: sessionInfo
          }
        },
        include: {
          sessionInfo: true,
        }
      });
      
      // Create ParentInfo record
      await prisma.parentInfo.create({
        data: {
          fatherQualification: father.qualification,
          fatherOccupation: father.occupation,
          fatherContact: father.contactNumber,
          fatherEmail: father.email,
          fatherAadhaarNo: father.aadhaarNo,
          fatherAnnualIncome: father.annualIncome,
          fatherIsCampusEmployee: father.isCampusEmployee,
          
          motherQualification: mother.qualification,
          motherOccupation: mother.occupation,
          motherContact: mother.contactNumber,
          motherEmail: mother.email,
          motherAadhaarNo: mother.aadhaarNo,
          motherAnnualIncome: mother.annualIncome,
          motherIsCampusEmployee: mother.isCampusEmployee,
          
          guardianName: guardian.name,
          guardianAddress: guardian.address,
          guardianContact: guardian.contactNumber,
          guardianEmail: guardian.email,
          guardianAadhaarNo: guardian.aadhaarNo,
          guardianOccupation: guardian.occupation,
          guardianAnnualIncome: guardian.annualIncome,
          
          // Connect to student
          student: {
            connect: {
              id: newStudent.id
            }
          }
        }
      });
      
      // Create TransportInfo record
      await prisma.transportInfo.create({
        data: {
          transportMode: transport.mode,
          transportArea: transport.area,
          transportStand: transport.stand,
          transportRoute: transport.route,
          transportDriver: transport.driver,
          
          // Connect to student
          student: {
            connect: {
              id: newStudent.id
            }
          }
        }
      });
      
      // Create Documents record
      await prisma.documents.create({
        data: {
          studentImagePath: documents.studentImagePath,
          fatherImagePath: documents.fatherImagePath,
          motherImagePath: documents.motherImagePath,
          guardianImagePath: documents.guardianImagePath,
          signaturePath: documents.signaturePath,
          fatherAadharPath: documents.fatherAadharPath,
          motherAadharPath: documents.motherAadharPath,
          birthCertificatePath: documents.birthCertificatePath,
          migrationCertificatePath: documents.migrationCertificatePath,
          aadhaarCardPath: documents.aadhaarCardPath,
          academicRegistrationNo: academic.registrationNo,
          
          // Connect to student
          student: {
            connect: {
              id: newStudent.id
            }
          }
        }
      });
      
      // Create EducationInfo record
      await prisma.educationInfo.create({
        data: {
          lastSchool: lastEducation.school,
          lastSchoolAddress: lastEducation.address,
          lastTcDate: lastEducation.tcDate ? new Date(lastEducation.tcDate) : null,
          lastClass: lastEducation.prevClass,
          lastPercentage: lastEducation.percentage,
          lastAttendance: lastEducation.attendance,
          lastExtraActivity: lastEducation.extraActivity,
          
          // Connect to student
          student: {
            connect: {
              id: newStudent.id
            }
          }
        }
      });
      
      // Create OtherInfo record
      await prisma.otherInfo.create({
        data: {
          belongToBPL: other.belongToBPL,
          minority: other.minority,
          disability: other.disability,
          accountNo: other.accountNo,
          bank: other.bank,
          ifscCode: other.ifscCode,
          medium: other.medium,
          lastYearResult: other.lastYearResult,
          singleParent: other.singleParent,
          onlyChild: other.onlyChild,
          onlyGirlChild: other.onlyGirlChild,
          adoptedChild: other.adoptedChild,
          siblingAdmissionNo: other.siblingAdmissionNo,
          transferCase: other.transferCase,
          livingWith: other.livingWith,
          motherTongue: other.motherTongue,
          admissionType: other.admissionType,
          udiseNo: other.udiseNo,
          
          // Connect to student
          student: {
            connect: {
              id: newStudent.id
            }
          }
        }
      });
      
      // Return the student record
      return newStudent;
    });
    
    console.log(`Student created: ${student.fullName} (ID: ${student.id})`);

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student: {
        id: student.id,
        fullName: student.fullName,
        admissionNo: student.admissionNo
      }
    });
  
  } catch (error) {
    console.error('Error creating student:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to register student',
      error: error.message
    });
  }
};

/**
 * Get all students with pagination and filtering
 * @route GET /api/students
 * @access Public
 */
export const getAllStudents = async (req, res) => {
  try {
    console.log("Fetching students with query:", req.query);

    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Enhanced query to include related data
    const students = await prisma.student.findMany({
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        parentInfo: true,
        sessionInfo: true,
        transportInfo: true,
        documents: true,
        educationInfo: true,
        otherInfo: true,
      }
    });
    
    // Get total count for pagination
    const total = await prisma.student.count();
    
    console.log(`Found ${students.length} students (total: ${total})`);
    
    return res.status(200).json({
      success: true,
      students,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Error getting students:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve students',
      error: error.message
    });
  }
};

/**
 * Get a single student by ID with all related information
 * @route GET /api/students/:id
 * @access Public
 */
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching student with ID: ${id}`);
    
    // Validate ID format
    if (!id || id.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }
    
    const student = await prisma.student.findUnique({
      where: { id: id.toString() },
      include: {
        parentInfo: true,
        sessionInfo: true,
        transportInfo: true,
        documents: true,
        educationInfo: true,
        otherInfo: true,
        previousSchool: true,
        siblings: true,
        officeDetails: true
      }
    });
    
    if (!student) {
      console.log(`Student with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    console.log(`Student found: ${student.fullName} (ID: ${student.id})`);
    
    return res.status(200).json({
      success: true,
      data: student,
      message: 'Student data retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error getting student:', error);
    
    // Handle Prisma specific errors
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Update student information
 * @route PUT /api/students/:id
 * @access Public
 */
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const studentData = req.body;
    
    console.log(`Updating student ${id} with data:`, Object.keys(studentData));
    
    // Format dates if they exist in the request
    if (studentData.dateOfBirth) {
      studentData.dateOfBirth = new Date(studentData.dateOfBirth);
    }
    
    // Handle the update in a transaction to ensure consistency
    const updatedStudent = await prisma.$transaction(async (prisma) => {
      // Update main student record with all fields
      const student = await prisma.student.update({
        where: { id: id.toString() }, // Use string ID for UUID
        data: {
          // Basic Information - only update if provided
          ...(studentData.fullName && { fullName: studentData.fullName }),
          ...(studentData.admissionNo && { admissionNo: studentData.admissionNo }),
          ...(studentData.dateOfBirth && { dateOfBirth: studentData.dateOfBirth }),
          ...(studentData.age && { age: parseInt(studentData.age) }),
          ...(studentData.gender && { gender: studentData.gender }),
          ...(studentData.bloodGroup && { bloodGroup: studentData.bloodGroup }),
          ...(studentData.nationality && { nationality: studentData.nationality }),
          ...(studentData.religion && { religion: studentData.religion }),
          ...(studentData.category && { category: studentData.category }),
          ...(studentData.caste && { caste: studentData.caste }),
          ...(studentData.aadhaarNumber && { aadhaarNumber: studentData.aadhaarNumber }),
          ...(studentData.apaarId && { apaarId: studentData.apaarId }),
          ...(studentData.penNo && { penNo: studentData.penNo }),
          
          // Contact Information
          ...(studentData.mobileNumber && { mobileNumber: studentData.mobileNumber }),
          ...(studentData.email && { email: studentData.email }),
          ...(studentData.emailPassword && { emailPassword: studentData.emailPassword }),
          ...(studentData.emergencyContact && { emergencyContact: studentData.emergencyContact }),
          
          // Address fields
          ...(studentData['address.houseNo'] !== undefined && { houseNo: studentData['address.houseNo'] }),
          ...(studentData['address.street'] !== undefined && { street: studentData['address.street'] }),
          ...(studentData['address.city'] !== undefined && { city: studentData['address.city'] }),
          ...(studentData['address.state'] !== undefined && { state: studentData['address.state'] }),
          ...(studentData['address.pinCode'] !== undefined && { pinCode: studentData['address.pinCode'] }),
          ...(studentData['address.permanentHouseNo'] !== undefined && { permanentHouseNo: studentData['address.permanentHouseNo'] }),
          ...(studentData['address.permanentStreet'] !== undefined && { permanentStreet: studentData['address.permanentStreet'] }),
          ...(studentData['address.permanentCity'] !== undefined && { permanentCity: studentData['address.permanentCity'] }),
          ...(studentData['address.permanentState'] !== undefined && { permanentState: studentData['address.permanentState'] }),
          ...(studentData['address.permanentPinCode'] !== undefined && { permanentPinCode: studentData['address.permanentPinCode'] }),
          
          // Parent Information
          ...(studentData['father.name'] && { fatherName: studentData['father.name'] }),
          ...(studentData['father.email'] !== undefined && { fatherEmail: studentData['father.email'] }),
          ...(studentData['mother.name'] !== undefined && { motherName: studentData['mother.name'] }),
          ...(studentData['mother.email'] !== undefined && { motherEmail: studentData['mother.email'] }),
          
          updatedAt: new Date()
        }
      });

      // Update session information if provided
      if (studentData.admitSession || studentData.currentSession) {
        await prisma.sessionInfo.upsert({
          where: {
            studentId: id.toString()
          },
          update: {
            // Admit Session
            ...(studentData['admitSession.class'] && { admitClass: studentData['admitSession.class'] }),
            ...(studentData['admitSession.section'] && { admitSection: studentData['admitSession.section'] }),
            ...(studentData['admitSession.rollNo'] && { admitRollNo: studentData['admitSession.rollNo'] }),
            ...(studentData['admitSession.group'] && { admitGroup: studentData['admitSession.group'] }),
            ...(studentData['admitSession.stream'] && { admitStream: studentData['admitSession.stream'] }),
            ...(studentData['admitSession.semester'] && { admitSemester: studentData['admitSession.semester'] }),
            ...(studentData['admitSession.feeGroup'] && { admitFeeGroup: studentData['admitSession.feeGroup'] }),
            ...(studentData['admitSession.house'] && { admitHouse: studentData['admitSession.house'] }),
            
            // Current Session
            ...(studentData['currentSession.class'] && { currentClass: studentData['currentSession.class'] }),
            ...(studentData['currentSession.section'] && { currentSection: studentData['currentSession.section'] }),
            ...(studentData['currentSession.rollNo'] && { currentRollNo: studentData['currentSession.rollNo'] }),
            ...(studentData['currentSession.group'] && { currentGroup: studentData['currentSession.group'] }),
            ...(studentData['currentSession.stream'] && { currentStream: studentData['currentSession.stream'] }),
            ...(studentData['currentSession.semester'] && { currentSemester: studentData['currentSession.semester'] }),
            ...(studentData['currentSession.feeGroup'] && { currentFeeGroup: studentData['currentSession.feeGroup'] }),
            ...(studentData['currentSession.house'] && { currentHouse: studentData['currentSession.house'] })
          },
          create: {
            // Admit Session
            admitClass: studentData['admitSession.class'] || '',
            admitSection: studentData['admitSession.section'] || '',
            admitRollNo: studentData['admitSession.rollNo'] || '',
            admitGroup: studentData['admitSession.group'] || '',
            admitStream: studentData['admitSession.stream'] || '',
            admitSemester: studentData['admitSession.semester'] || '',
            admitFeeGroup: studentData['admitSession.feeGroup'] || '',
            admitHouse: studentData['admitSession.house'] || '',
            admitDate: new Date(),
            
            // Current Session
            currentClass: studentData['currentSession.class'] || '',
            currentSection: studentData['currentSession.section'] || '',
            currentRollNo: studentData['currentSession.rollNo'] || '',
            currentGroup: studentData['currentSession.group'] || '',
            currentStream: studentData['currentSession.stream'] || '',
            currentSemester: studentData['currentSession.semester'] || '',
            currentFeeGroup: studentData['currentSession.feeGroup'] || '',
            currentHouse: studentData['currentSession.house'] || '',
            
            student: {
              connect: {
                id: id.toString()
              }
            }
          }
        });
      }
      
      // Update parent information if provided
      if (studentData['father.qualification'] || studentData['mother.qualification'] || 
          studentData['father.contactNumber'] || studentData['mother.contactNumber']) {
        await prisma.parentInfo.upsert({
          where: {
            studentId: id.toString()
          },
          update: {
            ...(studentData['father.qualification'] && { fatherQualification: studentData['father.qualification'] }),
            ...(studentData['father.occupation'] && { fatherOccupation: studentData['father.occupation'] }),
            ...(studentData['father.contactNumber'] && { fatherContact: studentData['father.contactNumber'] }),
            ...(studentData['father.aadhaarNo'] && { fatherAadhaarNo: studentData['father.aadhaarNo'] }),
            ...(studentData['father.annualIncome'] && { fatherAnnualIncome: studentData['father.annualIncome'] }),
            
            ...(studentData['mother.qualification'] && { motherQualification: studentData['mother.qualification'] }),
            ...(studentData['mother.occupation'] && { motherOccupation: studentData['mother.occupation'] }),
            ...(studentData['mother.contactNumber'] && { motherContact: studentData['mother.contactNumber'] }),
            ...(studentData['mother.aadhaarNo'] && { motherAadhaarNo: studentData['mother.aadhaarNo'] }),
            ...(studentData['mother.annualIncome'] && { motherAnnualIncome: studentData['mother.annualIncome'] })
          },
          create: {
            fatherQualification: studentData['father.qualification'] || null,
            fatherOccupation: studentData['father.occupation'] || null,
            fatherContact: studentData['father.contactNumber'] || null,
            fatherAadhaarNo: studentData['father.aadhaarNo'] || null,
            fatherAnnualIncome: studentData['father.annualIncome'] || null,
            
            motherQualification: studentData['mother.qualification'] || null,
            motherOccupation: studentData['mother.occupation'] || null,
            motherContact: studentData['mother.contactNumber'] || null,
            motherAadhaarNo: studentData['mother.aadhaarNo'] || null,
            motherAnnualIncome: studentData['mother.annualIncome'] || null,
            
            student: {
              connect: {
                id: id.toString()
              }
            }
          }
        });
      }

      return student;
    });
    
    // Fetch the updated student with all relations to return
    const finalUpdatedStudent = await prisma.student.findUnique({
      where: { id: id.toString() },
      include: {
        parentInfo: true,
        sessionInfo: true,
        transportInfo: true,
        documents: true,
        educationInfo: true,
        otherInfo: true,
      }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Student information updated successfully',
      data: finalUpdatedStudent
    });
    
  } catch (error) {
    console.error('Error updating student:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to update student information',
      error: error.message
    });
  }
};

/**
 * Delete a student and all related records
 * @route DELETE /api/students/:id
 * @access Public
 */
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting student with ID: ${id}`);
    
    // Delete the student (cascading delete will handle related records)
    const student = await prisma.student.delete({
      where: { id: parseInt(id) }
    });
    
    return res.status(200).json({
      success: true,
      message: `Student with ID ${id} has been deleted successfully`,
      student
    });
    
  } catch (error) {
    console.error('Error deleting student:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message
    });
  }
};

/**
 * Get a student by admission number
 * @route GET /api/students/admission/:admissionNo
 * @access Public
 */
export const getStudentByAdmissionNo = async (req, res) => {
  try {
    const { admissionNo } = req.params;
    console.log(`Searching for student with admission number: ${admissionNo}`);
    
    // Check if admissionNo is provided
    if (!admissionNo) {
      return res.status(400).json({
        success: false,
        message: 'Admission number is required'
      });
    }
    
    // Search for student by admission number
    const student = await prisma.student.findFirst({
      where: { 
        admissionNo: admissionNo.toString() 
      },
      include: {
        parentInfo: true,
        sessionInfo: true,
        transportInfo: true,
        documents: true,
        educationInfo: true,
        otherInfo: true,
      }
    });
    
    if (!student) {
      console.log(`Student with admission number ${admissionNo} not found`);
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      student
    });
    
  } catch (error) {
    console.error('Error finding student by admission number:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student details',
      error: error.message
    });
  }
};

/**
 * Get students by current class and section from sessionInfo
 * @route GET /api/students/class/:className/section/:section
 * @access Public
 */
export const getStudentsByCurrentClass = async (req, res) => {
  try {
    const { className, section } = req.params;
    console.log(`Fetching students for class: ${className}, section: ${section}`);

    const students = await prisma.student.findMany({
      where: {
        sessionInfo: {
          currentClass: className,
          currentSection: section
        }
      },
      select: {
        id: true,
        fullName: true,
        admissionNo: true,
        fatherName: true,
        sessionInfo: {
          select: {
            currentClass: true,
            currentSection: true,
            currentRollNo: true
          }
        }
      },
      orderBy: {
        sessionInfo: {
          currentRollNo: 'asc'
        }
      }
    });

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No students found in ${className} - Section ${section}`
      });
    }

    // Format student data
    const formattedStudents = students.map(student => ({
      id: student.id,
      fullName: student.fullName,
      admissionNo: student.admissionNo,
      section: student.sessionInfo?.currentSection || '',
      fatherName: student.fatherName || ''
    }));

    return res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      data: formattedStudents
    });

  } catch (error) {
    console.error('Error fetching students by class:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve students',
      error: error.message
    });
  }
};