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
    
    if (studentData.tcDate) {
      studentData.tcDate = new Date(studentData.tcDate);
    }
    
    // Handle the update in a transaction to ensure consistency
    await prisma.$transaction(async (prisma) => {
      // Update main student record with all fields
      const updatedStudent = await prisma.student.update({
        where: { id: parseInt(id) },
        data: {
          // Basic Information
          branchName: studentData.branchName,
          fullName: studentData.fullName,
          dateOfBirth: studentData.dateOfBirth,
          age: studentData.age ? parseInt(studentData.age) : undefined,
          height: studentData.height ? parseFloat(studentData.height) : undefined,
          weight: studentData.weight ? parseFloat(studentData.weight) : undefined,
          gender: studentData.gender,
          bloodGroup: studentData.bloodGroup,
          nationality: studentData.nationality,
          religion: studentData.religion,
          category: studentData.category,
          caste: studentData.caste,
          aadhaarNumber: studentData.aadhaarNumber,
          penNo: studentData.penNo,
          apaarId: studentData.apaarId,
          
          // Contact Information
          mobileNumber: studentData.mobileNumber,
          email: studentData.email,
          emailPassword: studentData.emailPassword,
          studentPassword: studentData.studentEmailPassword,
          emergencyContact: studentData.emergencyContact,
          
          // Academic Information
          admissionNo: studentData.admissionNo,
          studentId: studentData.srNo,
          admissionDate: studentData.admissionDate,
          registrationNo: studentData.registrationNo,
          
          // Address fields - handle both nested and flat structure
          houseNo: studentData.houseNo || studentData['address.houseNo'] || studentData.presentAddress?.houseNo,
          street: studentData.street || studentData['address.street'] || studentData.presentAddress?.street,
          city: studentData.city || studentData['address.city'] || studentData.presentAddress?.city,
          state: studentData.state || studentData['address.state'] || studentData.presentAddress?.state,
          pinCode: studentData.pinCode || studentData['address.pinCode'] || studentData.presentAddress?.pinCode,
          permanentHouseNo: studentData.permanentHouseNo || studentData['address.permanentHouseNo'] || studentData.permanentAddress?.houseNo,
          permanentStreet: studentData.permanentStreet || studentData['address.permanentStreet'] || studentData.permanentAddress?.street,
          permanentCity: studentData.permanentCity || studentData['address.permanentCity'] || studentData.permanentAddress?.city,
          permanentState: studentData.permanentState || studentData['address.permanentState'] || studentData.permanentAddress?.state,
          permanentPinCode: studentData.permanentPinCode || studentData['address.permanentPinCode'] || studentData.permanentAddress?.pinCode,
          sameAsPresentAddress: studentData.sameAsPresentAddress || false,
          
          // Parent Information - basic fields
          fatherName: studentData.fatherName || studentData['father.name'] || studentData.fatherDetails?.name,
          motherName: studentData.motherName || studentData['mother.name'] || studentData.motherDetails?.name,
          fatherEmail: studentData.fatherEmail || studentData['father.email'] || studentData.fatherDetails?.email,
          motherEmail: studentData.motherEmail || studentData['mother.email'] || studentData.motherDetails?.email,
          fatherEmailPassword: studentData.fatherEmailPassword,
          motherEmailPassword: studentData.motherEmailPassword,
          
          // Transport Information
          transportMode: studentData.transportMode,
          transportArea: studentData.transportArea,
          transportStand: studentData.transportStand,
          transportRoute: studentData.transportRoute,
          transportDriver: studentData.transportDriver,
          
          // Other Information
          belongToBPL: studentData.belongToBPL || studentData.other?.belongToBPL || 'no',
          typeOfDisability: studentData.typeOfDisability || studentData.other?.disability || '',
          
          lastLogin: new Date(),
          updatedAt: new Date()
        }
      });

      // Update session information
      if (studentData.admitSession || studentData.currentSession) {
        await prisma.sessionInfo.upsert({
          where: {
            studentId: parseInt(id)
          },
          update: {
            // Admit Session
            admitGroup: studentData.admitSession?.group,
            admitStream: studentData.admitSession?.stream,
            admitClass: studentData.admitSession?.class,
            admitSection: studentData.admitSession?.section,
            admitRollNo: studentData.admitSession?.rollNo,
            admitSemester: studentData.admitSession?.semester,
            admitFeeGroup: studentData.admitSession?.feeGroup,
            admitHouse: studentData.admitSession?.house,
            admitDate: studentData.admissionDate,
            
            // Current Session
            currentGroup: studentData.currentSession?.group,
            currentStream: studentData.currentSession?.stream,
            currentClass: studentData.currentSession?.class,
            currentSection: studentData.currentSession?.section,
            currentRollNo: studentData.currentSession?.rollNo,
            currentSemester: studentData.currentSession?.semester,
            currentFeeGroup: studentData.currentSession?.feeGroup,
            currentHouse: studentData.currentSession?.house,
            
            previousSchool: studentData.previousEducation?.school || studentData.previousSchool
          },
          create: {
            // Admit Session
            admitGroup: studentData.admitSession?.group || '',
            admitStream: studentData.admitSession?.stream || '',
            admitClass: studentData.admitSession?.class || '',
            admitSection: studentData.admitSession?.section || '',
            admitRollNo: studentData.admitSession?.rollNo || '',
            admitSemester: studentData.admitSession?.semester || '',
            admitFeeGroup: studentData.admitSession?.feeGroup || '',
            admitHouse: studentData.admitSession?.house || '',
            admitDate: studentData.admissionDate,
            
            // Current Session
            currentGroup: studentData.currentSession?.group || '',
            currentStream: studentData.currentSession?.stream || '',
            currentClass: studentData.currentSession?.class || '',
            currentSection: studentData.currentSession?.section || '',
            currentRollNo: studentData.currentSession?.rollNo || '',
            currentSemester: studentData.currentSession?.semester || '',
            currentFeeGroup: studentData.currentSession?.feeGroup || '',
            currentHouse: studentData.currentSession?.house || '',
            
            previousSchool: studentData.previousEducation?.school || studentData.previousSchool || '',
            
            student: {
              connect: {
                id: parseInt(id)
              }
            }
          }
        });
      }
      
      // Update parent information
      if (studentData.parentInfo || 
          studentData.father || 
          studentData.mother || 
          studentData.guardian ||
          studentData.fatherDetails ||
          studentData.motherDetails ||
          studentData.guardianDetails) {
        
        await prisma.parentInfo.upsert({
          where: {
            studentId: parseInt(id)
          },
          update: {
            // Father Information
            fatherQualification: studentData['father.qualification'] || studentData.fatherDetails?.qualification,
            fatherOccupation: studentData['father.occupation'] || studentData.fatherDetails?.occupation,
            fatherContact: studentData['father.contactNumber'] || studentData.fatherDetails?.mobileNumber,
            fatherEmail: studentData['father.email'] || studentData.fatherDetails?.email,
            fatherAadhaarNo: studentData['father.aadhaarNo'] || studentData.fatherDetails?.aadhaarNumber,
            fatherAnnualIncome: studentData['father.annualIncome'] || studentData.fatherDetails?.annualIncome,
            fatherIsCampusEmployee: studentData['father.isCampusEmployee'] || 'no',
            
            // Mother Information
            motherQualification: studentData['mother.qualification'] || studentData.motherDetails?.qualification,
            motherOccupation: studentData['mother.occupation'] || studentData.motherDetails?.occupation,
            motherContact: studentData['mother.contactNumber'] || studentData.motherDetails?.contactNumber,
            motherEmail: studentData['mother.email'] || studentData.motherDetails?.email,
            motherAadhaarNo: studentData['mother.aadhaarNo'] || studentData.motherDetails?.aadhaarNumber,
            motherAnnualIncome: studentData['mother.annualIncome'] || studentData.motherDetails?.annualIncome,
            motherIsCampusEmployee: studentData['mother.isCampusEmployee'] || 'no',
            
            // Guardian Information
            guardianName: studentData['guardian.name'] || studentData.guardianDetails?.name,
            guardianAddress: studentData['guardian.address'] || studentData.guardianDetails?.address,
            guardianContact: studentData['guardian.contactNumber'] || studentData.guardianDetails?.mobile,
            guardianEmail: studentData['guardian.email'] || studentData.guardianDetails?.email,
            guardianAadhaarNo: studentData['guardian.aadhaarNo'] || studentData.guardianDetails?.aadhaarNumber,
            guardianOccupation: studentData['guardian.occupation'] || studentData.guardianDetails?.occupation,
            guardianAnnualIncome: studentData['guardian.annualIncome'] || studentData.guardianDetails?.annualIncome,
          },
          create: {
            // Father Information
            fatherQualification: studentData['father.qualification'] || studentData.fatherDetails?.qualification || '',
            fatherOccupation: studentData['father.occupation'] || studentData.fatherDetails?.occupation || '',
            fatherContact: studentData['father.contactNumber'] || studentData.fatherDetails?.mobileNumber || '',
            fatherEmail: studentData['father.email'] || studentData.fatherDetails?.email || '',
            fatherAadhaarNo: studentData['father.aadhaarNo'] || studentData.fatherDetails?.aadhaarNumber || '',
            fatherAnnualIncome: studentData['father.annualIncome'] || studentData.fatherDetails?.annualIncome || '',
            fatherIsCampusEmployee: studentData['father.isCampusEmployee'] || 'no',
            
            // Mother Information
            motherQualification: studentData['mother.qualification'] || studentData.motherDetails?.qualification || '',
            motherOccupation: studentData['mother.occupation'] || studentData.motherDetails?.occupation || '',
            motherContact: studentData['mother.contactNumber'] || studentData.motherDetails?.contactNumber || '',
            motherEmail: studentData['mother.email'] || studentData.motherDetails?.email || '',
            motherAadhaarNo: studentData['mother.aadhaarNo'] || studentData.motherDetails?.aadhaarNumber || '',
            motherAnnualIncome: studentData['mother.annualIncome'] || studentData.motherDetails?.annualIncome || '',
            motherIsCampusEmployee: studentData['mother.isCampusEmployee'] || 'no',
            
            // Guardian Information
            guardianName: studentData['guardian.name'] || studentData.guardianDetails?.name || '',
            guardianAddress: studentData['guardian.address'] || studentData.guardianDetails?.address || '',
            guardianContact: studentData['guardian.contactNumber'] || studentData.guardianDetails?.mobile || '',
            guardianEmail: studentData['guardian.email'] || studentData.guardianDetails?.email || '',
            guardianAadhaarNo: studentData['guardian.aadhaarNo'] || studentData.guardianDetails?.aadhaarNumber || '',
            guardianOccupation: studentData['guardian.occupation'] || studentData.guardianDetails?.occupation || '',
            guardianAnnualIncome: studentData['guardian.annualIncome'] || studentData.guardianDetails?.annualIncome || '',
            
            student: {
              connect: {
                id: parseInt(id)
              }
            }
          }
        });
      }
      
      // Update transport information
      if (studentData.transportMode || studentData.transportArea || studentData.transportStand) {
        await prisma.transportInfo.upsert({
          where: {
            studentId: parseInt(id)
          },
          update: {
            transportMode: studentData.transportMode || 'Own Transport',
            transportArea: studentData.transportArea || '',
            transportStand: studentData.transportStand || '',
            transportRoute: studentData.transportRoute || '',
            transportDriver: studentData.transportDriver || '',
            pickupLocation: studentData.pickupLocation || '',
            dropLocation: studentData.dropLocation || ''
          },
          create: {
            transportMode: studentData.transportMode || 'Own Transport',
            transportArea: studentData.transportArea || '',
            transportStand: studentData.transportStand || '',
            transportRoute: studentData.transportRoute || '',
            transportDriver: studentData.transportDriver || '',
            pickupLocation: studentData.pickupLocation || '',
            dropLocation: studentData.dropLocation || '',
            
            student: {
              connect: {
                id: parseInt(id)
              }
            }
          }
        });
      }

      // Update education information
      if (studentData.previousEducation) {
        await prisma.educationInfo.upsert({
          where: {
            studentId: parseInt(id)
          },
          update: {
            lastSchool: studentData.previousEducation.school || '',
            lastSchoolAddress: studentData.previousEducation.schoolAddress || '',
            lastTcDate: studentData.previousEducation.tcDate ? new Date(studentData.previousEducation.tcDate) : null,
            lastClass: studentData.previousEducation.previousClass || '',
            lastPercentage: studentData.previousEducation.percentage || '',
            lastAttendance: studentData.previousEducation.attendance || '',
            lastExtraActivity: studentData.previousEducation.extraActivities || ''
          },
          create: {
            lastSchool: studentData.previousEducation.school || '',
            lastSchoolAddress: studentData.previousEducation.schoolAddress || '',
            lastTcDate: studentData.previousEducation.tcDate ? new Date(studentData.previousEducation.tcDate) : null,
            lastClass: studentData.previousEducation.previousClass || '',
            lastPercentage: studentData.previousEducation.percentage || '',
            lastAttendance: studentData.previousEducation.attendance || '',
            lastExtraActivity: studentData.previousEducation.extraActivities || '',
            
            student: {
              connect: {
                id: parseInt(id)
              }
            }
          }
        });
      }

      // Update other information
      if (studentData.other) {
        await prisma.otherInfo.upsert({
          where: {
            studentId: parseInt(id)
          },
          update: {
            belongToBPL: studentData.other.belongToBPL || 'no',
            minority: studentData.other.minority || 'no',
            disability: studentData.other.disability || '',
            accountNo: studentData.other.accountNo || '',
            bank: studentData.other.bank || '',
            ifscCode: studentData.other.ifscCode || '',
            medium: studentData.other.medium || '',
            lastYearResult: studentData.other.lastYearResult || '',
            singleParent: studentData.other.singleParent || 'no',
            onlyChild: studentData.other.onlyChild || 'no',
            onlyGirlChild: studentData.other.onlyGirlChild || 'no',
            adoptedChild: studentData.other.adoptedChild || 'no',
            siblingAdmissionNo: studentData.other.siblingAdmissionNo || '',
            transferCase: studentData.other.transferCase || 'no',
            livingWith: studentData.other.livingWith || '',
            motherTongue: studentData.other.motherTongue || '',
            admissionType: studentData.other.admissionType || 'new',
            udiseNo: studentData.other.udiseNo || ''
          },
          create: {
            belongToBPL: studentData.other.belongToBPL || 'no',
            minority: studentData.other.minority || 'no',
            disability: studentData.other.disability || '',
            accountNo: studentData.other.accountNo || '',
            bank: studentData.other.bank || '',
            ifscCode: studentData.other.ifscCode || '',
            medium: studentData.other.medium || '',
            lastYearResult: studentData.other.lastYearResult || '',
            singleParent: studentData.other.singleParent || 'no',
            onlyChild: studentData.other.onlyChild || 'no',
            onlyGirlChild: studentData.other.onlyGirlChild || 'no',
            adoptedChild: studentData.other.adoptedChild || 'no',
            siblingAdmissionNo: studentData.other.siblingAdmissionNo || '',
            transferCase: studentData.other.transferCase || 'no',
            livingWith: studentData.other.livingWith || '',
            motherTongue: studentData.other.motherTongue || '',
            admissionType: studentData.other.admissionType || 'new',
            udiseNo: studentData.other.udiseNo || '',
            
            student: {
              connect: {
                id: parseInt(id)
              }
            }
          }
        });
      }

      // Update document information if provided
      if (studentData.documents) {
        await prisma.documents.upsert({
          where: {
            studentId: parseInt(id)
          },
          update: {
            studentImagePath: studentData.documents.studentImage,
            fatherImagePath: studentData.documents.fatherImage,
            motherImagePath: studentData.documents.motherImage,
            guardianImagePath: studentData.documents.guardianImage,
            signaturePath: studentData.documents.studentSignature,
            parentSignaturePath: studentData.documents.parentSignature,
            birthCertificatePath: studentData.documents.birthCertificate,
            migrationCertificatePath: studentData.documents.transferCertificate,
            aadhaarCardPath: studentData.documents.studentAadhaar,
            fatherAadharPath: studentData.documents.fatherAadhaar,
            motherAadharPath: studentData.documents.motherAadhaar,
            // Add other document fields as needed
          },
          create: {
            studentImagePath: studentData.documents.studentImage || '',
            fatherImagePath: studentData.documents.fatherImage || '',
            motherImagePath: studentData.documents.motherImage || '',
            guardianImagePath: studentData.documents.guardianImage || '',
            signaturePath: studentData.documents.studentSignature || '',
            parentSignaturePath: studentData.documents.parentSignature || '',
            birthCertificatePath: studentData.documents.birthCertificate || '',
            migrationCertificatePath: studentData.documents.transferCertificate || '',
            aadhaarCardPath: studentData.documents.studentAadhaar || '',
            fatherAadharPath: studentData.documents.fatherAadhaar || '',
            motherAadharPath: studentData.documents.motherAadhaar || '',
            academicRegistrationNo: studentData.registrationNo || '',
            
            student: {
              connect: {
                id: parseInt(id)
              }
            }
          }
        });
      }
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