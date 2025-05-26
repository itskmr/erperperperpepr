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
    
    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
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
      console.log(`Student with ID ${id} not found`);
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
    console.error('Error getting student:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student details',
      error: error.message
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
    
    console.log(`Updating student ${id} with data:`, studentData);
    
    // Format dates if they exist in the request
    if (studentData.dateOfBirth) {
      studentData.dateOfBirth = new Date(studentData.dateOfBirth);
    }
    
    if (studentData.admissionDate) {
      studentData.admissionDate = new Date(studentData.admissionDate);
    }
    
    // Handle the update in a transaction to ensure consistency
    await prisma.$transaction(async (prisma) => {
      // Update main student record
      const updatedStudent = await prisma.student.update({
        where: { id: parseInt(id) },
        data: {
          branchName: studentData.branchName,
          fullName: studentData.fullName,
          dateOfBirth: studentData.dateOfBirth,
          gender: studentData.gender,
          bloodGroup: studentData.bloodGroup,
          nationality: studentData.nationality,
          religion: studentData.religion,
          category: studentData.category,
          caste: studentData.caste,
          aadhaarNumber: studentData.aadhaarNumber,
          mobileNumber: studentData.mobileNumber,
          email: studentData.email,
          emergencyContact: studentData.emergencyContact,
          admissionNo: studentData.admissionNo,
          admissionDate: studentData.admissionDate,
          previousSchool: studentData.previousSchool,
          
          // Address fields
          houseNo: studentData.houseNo || studentData['address.houseNo'],
          street: studentData.street || studentData['address.street'],
          city: studentData.city || studentData['address.city'],
          state: studentData.state || studentData['address.state'],
          pinCode: studentData.pinCode || studentData['address.pinCode'],
          permanentHouseNo: studentData.permanentHouseNo || studentData['address.permanentHouseNo'],
          permanentStreet: studentData.permanentStreet || studentData['address.permanentStreet'],
          permanentCity: studentData.permanentCity || studentData['address.permanentCity'],
          permanentState: studentData.permanentState || studentData['address.permanentState'],
          permanentPinCode: studentData.permanentPinCode || studentData['address.permanentPinCode'],
          
          // Basic parent names
          fatherName: studentData.fatherName || studentData['father.name'],
          motherName: studentData.motherName || studentData['mother.name'],
        }
      });
      
      // Update related tables if they exist
      if (studentData.parentInfo || 
          studentData.father || 
          studentData.mother || 
          studentData.guardian) {
        
        await prisma.parentInfo.upsert({
          where: {
            studentId: parseInt(id)
          },
          update: {
            fatherQualification: studentData['father.qualification'] || studentData.fatherQualification,
            fatherOccupation: studentData['father.occupation'] || studentData.fatherOccupation,
            fatherContact: studentData['father.contactNumber'] || studentData.fatherContact,
            fatherEmail: studentData['father.email'] || studentData.fatherEmail,
            fatherAadhaarNo: studentData['father.aadhaarNo'] || studentData.fatherAadhaarNo,
            fatherAnnualIncome: studentData['father.annualIncome'] || studentData.fatherAnnualIncome,
            fatherIsCampusEmployee: studentData['father.isCampusEmployee'] || studentData.fatherIsCampusEmployee,
            
            motherQualification: studentData['mother.qualification'] || studentData.motherQualification,
            motherOccupation: studentData['mother.occupation'] || studentData.motherOccupation,
            motherContact: studentData['mother.contactNumber'] || studentData.motherContact,
            motherEmail: studentData['mother.email'] || studentData.motherEmail,
            motherAadhaarNo: studentData['mother.aadhaarNo'] || studentData.motherAadhaarNo,
            motherAnnualIncome: studentData['mother.annualIncome'] || studentData.motherAnnualIncome,
            motherIsCampusEmployee: studentData['mother.isCampusEmployee'] || studentData.motherIsCampusEmployee,
            
            guardianName: studentData['guardian.name'] || studentData.guardianName,
            guardianAddress: studentData['guardian.address'] || studentData.guardianAddress,
            guardianContact: studentData['guardian.contactNumber'] || studentData.guardianContact,
            guardianEmail: studentData['guardian.email'] || studentData.guardianEmail,
            guardianAadhaarNo: studentData['guardian.aadhaarNo'] || studentData.guardianAadhaarNo,
            guardianOccupation: studentData['guardian.occupation'] || studentData.guardianOccupation,
            guardianAnnualIncome: studentData['guardian.annualIncome'] || studentData.guardianAnnualIncome,
          },
          create: {
            fatherQualification: studentData['father.qualification'] || '',
            fatherOccupation: studentData['father.occupation'] || '',
            fatherContact: studentData['father.contactNumber'] || '',
            fatherEmail: studentData['father.email'] || '',
            fatherAadhaarNo: studentData['father.aadhaarNo'] || '',
            fatherAnnualIncome: studentData['father.annualIncome'] || '',
            fatherIsCampusEmployee: studentData['father.isCampusEmployee'] || 'no',
            
            motherQualification: studentData['mother.qualification'] || '',
            motherOccupation: studentData['mother.occupation'] || '',
            motherContact: studentData['mother.contactNumber'] || '',
            motherEmail: studentData['mother.email'] || '',
            motherAadhaarNo: studentData['mother.aadhaarNo'] || '',
            motherAnnualIncome: studentData['mother.annualIncome'] || '',
            motherIsCampusEmployee: studentData['mother.isCampusEmployee'] || 'no',
            
            guardianName: studentData['guardian.name'] || '',
            guardianAddress: studentData['guardian.address'] || '',
            guardianContact: studentData['guardian.contactNumber'] || '',
            guardianEmail: studentData['guardian.email'] || '',
            guardianAadhaarNo: studentData['guardian.aadhaarNo'] || '',
            guardianOccupation: studentData['guardian.occupation'] || '',
            guardianAnnualIncome: studentData['guardian.annualIncome'] || '',
            
            student: {
              connect: {
                id: parseInt(id)
              }
            }
          }
        });
      }
      
      // Update other related tables similarly (sessionInfo, transportInfo, etc.)
      // This would follow the same pattern as parentInfo above
    });
    
    // Fetch the updated student with all relations to return
    const updatedStudent = await prisma.student.findUnique({
      where: { id: parseInt(id) },
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
      student: updatedStudent
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