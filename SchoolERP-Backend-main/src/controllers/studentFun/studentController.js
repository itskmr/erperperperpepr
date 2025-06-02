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
    console.log("Form fields received:", Object.keys(req.body));
    console.log("Files received:", req.files ? Object.keys(req.files) : 'No files');
    
    // Extract basic fields from request body
    const {
      branchName,
      fullName,
      dateOfBirth,
      age,
      penNo,
      apaarId,
      srNo,
      registrationNo,
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
      rollNumber,
      className,
      section,
      stream,
      semester,
      admissionDate,
      previousSchool,
      schoolId , // Default school ID
    } = req.body;
    
    // Extract address fields - support both nested and flattened formats
    const address = {
      houseNo: req.body['address.houseNo'] || req.body.houseNo || '',
      street: req.body['address.street'] || req.body.street || '',
      city: req.body['address.city'] || req.body.city || '',
      state: req.body['address.state'] || req.body.state || '',
      pinCode: req.body['address.pinCode'] || req.body.pinCode || '',
      permanentHouseNo: req.body['address.permanentHouseNo'] || req.body.permanentHouseNo || '',
      permanentStreet: req.body['address.permanentStreet'] || req.body.permanentStreet || '',
      permanentCity: req.body['address.permanentCity'] || req.body.permanentCity || '',
      permanentState: req.body['address.permanentState'] || req.body.permanentState || '',
      permanentPinCode: req.body['address.permanentPinCode'] || req.body.permanentPinCode || '',
      sameAsPresentAddress: req.body['address.sameAsPresentAddress'] || req.body.sameAsPresentAddress || false,
    };
    
    // Extract parent information
    const father = {
      name: req.body['father.name'] || req.body.fatherName || '',
      qualification: req.body['father.qualification'] || req.body.fatherQualification || '',
      occupation: req.body['father.occupation'] || req.body.fatherOccupation || '',
      contactNumber: req.body['father.contactNumber'] || req.body.fatherMobile || req.body.fatherContact || '',
      email: req.body['father.email'] || req.body.fatherEmail || '',
      aadhaarNo: req.body['father.aadhaarNo'] || req.body.fatherAadhaar || '',
      annualIncome: req.body['father.annualIncome'] || req.body.fatherIncome || '',
      isCampusEmployee: req.body['father.isCampusEmployee'] || req.body.fatherCampusEmployee || 'no',
    };
    
    const mother = {
      name: req.body['mother.name'] || req.body.motherName || '',
      qualification: req.body['mother.qualification'] || req.body.motherQualification || '',
      occupation: req.body['mother.occupation'] || req.body.motherOccupation || '',
      contactNumber: req.body['mother.contactNumber'] || req.body.motherMobile || req.body.motherContact || '',
      email: req.body['mother.email'] || req.body.motherEmail || '',
      aadhaarNo: req.body['mother.aadhaarNo'] || req.body.motherAadhaar || '',
      annualIncome: req.body['mother.annualIncome'] || req.body.motherIncome || '',
      isCampusEmployee: req.body['mother.isCampusEmployee'] || req.body.motherCampusEmployee || 'no',
    };
    
    const guardian = {
      name: req.body['guardian.name'] || req.body.guardianName || '',
      address: req.body['guardian.address'] || req.body.guardianAddress || '',
      contactNumber: req.body['guardian.contactNumber'] || req.body.guardianMobile || req.body.guardianContact || '',
      email: req.body['guardian.email'] || req.body.guardianEmail || '',
      aadhaarNo: req.body['guardian.aadhaarNo'] || req.body.guardianAadhaar || '',
      occupation: req.body['guardian.occupation'] || req.body.guardianOccupation || '',
      annualIncome: req.body['guardian.annualIncome'] || req.body.guardianIncome || '',
    };
    
    // Extract session information - support both admit and current sessions
    const sessionInfo = {
      admitGroup: req.body['admitSession.group'] || req.body.admitGroup || '',
      admitClass: req.body['admitSession.class'] || req.body.className || req.body.admitClass || '',
      admitSection: req.body['admitSession.section'] || req.body.section || req.body.admitSection || '',
      admitRollNo: req.body['admitSession.rollNo'] || req.body.rollNumber || req.body.admitRollNo || '',
      admitStream: req.body['admitSession.stream'] || req.body.stream || req.body.admitStream || '',
      admitSemester: req.body['admitSession.semester'] || req.body.semester || req.body.admitSemester || '',
      admitFeeGroup: req.body['admitSession.feeGroup'] || req.body.feeGroup || req.body.admitFeeGroup || '',
      admitHouse: req.body['admitSession.house'] || req.body.house || req.body.admitHouse || '',
      currentGroup: req.body['currentSession.group'] || req.body.currentGroup || null,
      currentClass: req.body['currentSession.class'] || req.body.currentClass || null,
      currentSection: req.body['currentSession.section'] || req.body.currentSection || null,
      currentRollNo: req.body['currentSession.rollNo'] || req.body.currentRollNo || null,
      currentStream: req.body['currentSession.stream'] || req.body.currentStream || null,
      currentSemester: req.body['currentSession.semester'] || req.body.currentSemester || null,
      currentFeeGroup: req.body['currentSession.feeGroup'] || req.body.currentFeeGroup || null,
      currentHouse: req.body['currentSession.house'] || req.body.currentHouse || null,
    };
    
    // Extract transport information
    const transport = {
      mode: req.body['transport.mode'] || req.body.transportMode || '',
      area: req.body['transport.area'] || req.body.transportArea || '',
      stand: req.body['transport.stand'] || req.body.transportStand || '',
      route: req.body['transport.route'] || req.body.transportRoute || '',
      driver: req.body['transport.driver'] || req.body.transportDriver || '',
      pickupLocation: req.body['transport.pickupLocation'] || req.body.pickupLocation || '',
      dropLocation: req.body['transport.dropLocation'] || req.body.dropLocation || '',
    };
    
    // Extract academic registration
    const academic = {
      registrationNo: req.body['academic.registrationNo'] || req.body.registrationNo || '',
    };
    
    // Extract last education details
    const lastEducation = {
      school: req.body['lastEducation.school'] || req.body.previousSchool || '',
      address: req.body['lastEducation.address'] || req.body.lastSchoolAddress || '',
      tcDate: req.body['lastEducation.tcDate'] || req.body.tcDate || null,
      prevClass: req.body['lastEducation.prevClass'] || req.body.previousClass || '',
      percentage: req.body['lastEducation.percentage'] || req.body.previousPercentage || '',
      attendance: req.body['lastEducation.attendance'] || req.body.previousAttendance || '',
      extraActivity: req.body['lastEducation.extraActivity'] || req.body.extraActivities || '',
    };
    
    // Extract other information with comprehensive mapping
    const other = {
      belongToBPL: req.body['other.belongToBPL'] || req.body.belongToBPL || 'no',
      minority: req.body['other.minority'] || req.body.minority || 'no',
      disability: req.body['other.disability'] || req.body.disability || req.body.typeOfDisability || '',
      accountNo: req.body['other.accountNo'] || req.body.accountNo || '',
      bank: req.body['other.bank'] || req.body.bank || '',
      ifscCode: req.body['other.ifscCode'] || req.body.ifscCode || '',
      medium: req.body['other.medium'] || req.body.medium || '',
      lastYearResult: req.body['other.lastYearResult'] || req.body.lastYearResult || '',
      singleParent: req.body['other.singleParent'] || req.body.singleParent || 'no',
      onlyChild: req.body['other.onlyChild'] || req.body.onlyChild || 'no',
      onlyGirlChild: req.body['other.onlyGirlChild'] || req.body.onlyGirlChild || 'no',
      adoptedChild: req.body['other.adoptedChild'] || req.body.adoptedChild || 'no',
      siblingAdmissionNo: req.body['other.siblingAdmissionNo'] || req.body.siblingAdmissionNo || '',
      transferCase: req.body['other.transferCase'] || req.body.transferCase || 'no',
      livingWith: req.body['other.livingWith'] || req.body.livingWith || '',
      motherTongue: req.body['other.motherTongue'] || req.body.motherTongue || '',
      admissionType: req.body['other.admissionType'] || req.body.admissionType || 'new',
      udiseNo: req.body['other.udiseNo'] || req.body.udiseNo || '',
    };
    
    // Handle file uploads and get paths with improved mapping
    const files = req.files || {};
    
    // Get file path function that handles both document.fieldName and direct fieldName
    const getFilePath = (fieldName) => {
      // Check for documents.fieldName format first
      const documentField = `documents.${fieldName}`;
      if (files[documentField] && files[documentField][0]) {
        return files[documentField][0].path;
      }
      
      // Check for direct fieldName format
      if (files[fieldName] && files[fieldName][0]) {
        return files[fieldName][0].path;
      }
      
      return null;
    };
    
    // Use a transaction to ensure all related records are created or none at all
    const student = await prisma.$transaction(async (prisma) => {
      // Create the student record first with comprehensive field mapping including document paths
      const newStudent = await prisma.student.create({
        data: {
          branchName: branchName || '',
          fullName: fullName || '',
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
          age: age ? parseInt(age) : null,
          penNo: penNo || '',
          apaarId: apaarId || '',
          srNo: srNo || '',
          gender: gender || "OTHER",
          bloodGroup: bloodGroup || '',
          nationality: nationality || "Indian",
          religion: religion || '',
          category: category || '',
          caste: caste || '',
          aadhaarNumber: aadhaarNumber || '',
          mobileNumber: mobileNumber || "0000000000",
          email: email || "",
          emergencyContact: emergencyContact || '',
          admissionNo: admissionNo || `ADM-${Date.now()}`,
          studentId: studentId || '',
          rollNumber: rollNumber || '',
          className: className || sessionInfo.admitClass || '',
          section: section || sessionInfo.admitSection || '',
          stream: stream || sessionInfo.admitStream || '',
          semester: semester || sessionInfo.admitSemester || '',
          admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
          previousSchool: previousSchool || lastEducation.school || '',
          
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
          sameAsPresentAddress: address.sameAsPresentAddress,
          
          // Parent information in main table
          fatherName: father.name,
          fatherMobile: father.contactNumber,
          fatherEmail: father.email,
          motherName: mother.name,
          motherMobile: mother.contactNumber,
          motherEmail: mother.email,
          
          // Transport information in main table  
          transportMode: transport.mode,
          transportArea: transport.area,
          transportStand: transport.stand,
          transportRoute: transport.route,
          transportDriver: transport.driver,
          pickupLocation: transport.pickupLocation,
          dropLocation: transport.dropLocation,
          
          // Other fields in main table
          belongToBPL: other.belongToBPL,
          typeOfDisability: other.disability,
          registrationNo: academic.registrationNo,
          
          // Document paths (now stored directly in Student model)
          studentImagePath: getFilePath('studentImage'),
          fatherImagePath: getFilePath('fatherImage'),
          motherImagePath: getFilePath('motherImage'),
          guardianImagePath: getFilePath('guardianImage'),
          signaturePath: getFilePath('signature'),
          parentSignaturePath: getFilePath('parentSignature'),
          fatherAadharPath: getFilePath('fatherAadhar'),
          motherAadharPath: getFilePath('motherAadhar'),
          birthCertificatePath: getFilePath('birthCertificate'),
          transferCertificatePath: getFilePath('transferCertificate'),
          markSheetPath: getFilePath('markSheet'),
          aadhaarCardPath: getFilePath('aadhaarCard'),
          familyIdPath: getFilePath('familyId'),
          fatherSignaturePath: getFilePath('fatherSignature'),
          motherSignaturePath: getFilePath('motherSignature'),
          guardianSignaturePath: getFilePath('guardianSignature'),
          academicRegistrationNo: academic.registrationNo,  
          
          // Connect to school
          school: {
            connect: {
              id: parseInt(schoolId, 10)
            }
          },
          
          // SessionInfo
          sessionInfo: {
            create: {
              admitDate: new Date(),
              ...sessionInfo
            }
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
          pickupLocation: transport.pickupLocation,
          dropLocation: transport.dropLocation,
          
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
          ...other,
          
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
        admissionNo: student.admissionNo,
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
        educationInfo: true,
        otherInfo: true,
        school: true, 
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
        educationInfo: true,
        otherInfo: true,
        previousSchool: true,
        siblings: true,
        officeDetails: true,
        school: true,
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
    
    // Handle the update in a transaction to ensure consistency
    const updatedStudent = await prisma.$transaction(async (prisma) => {
      // Prepare main student record update data
      const studentUpdateData = {};
      
      // Basic Information
      if (studentData.fullName !== undefined) studentUpdateData.fullName = studentData.fullName;
      if (studentData.admissionNo !== undefined) studentUpdateData.admissionNo = studentData.admissionNo;
      if (studentData.penNo !== undefined) studentUpdateData.penNo = studentData.penNo;
      if (studentData.apaarId !== undefined) studentUpdateData.apaarId = studentData.apaarId;
      if (studentData.dateOfBirth !== undefined) {
        studentUpdateData.dateOfBirth = studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : null;
      }
      if (studentData.age !== undefined) studentUpdateData.age = studentData.age ? parseInt(studentData.age) : null;
      if (studentData.gender !== undefined) studentUpdateData.gender = studentData.gender;
      if (studentData.bloodGroup !== undefined) studentUpdateData.bloodGroup = studentData.bloodGroup;
      if (studentData.nationality !== undefined) studentUpdateData.nationality = studentData.nationality;
      if (studentData.religion !== undefined) studentUpdateData.religion = studentData.religion;
      if (studentData.category !== undefined) studentUpdateData.category = studentData.category;
      if (studentData.caste !== undefined) studentUpdateData.caste = studentData.caste;
      if (studentData.aadhaarNumber !== undefined) studentUpdateData.aadhaarNumber = studentData.aadhaarNumber;
      if (studentData.mobileNumber !== undefined) studentUpdateData.mobileNumber = studentData.mobileNumber;
      
      // Handle email carefully to avoid unique constraint issues
      if (studentData.email !== undefined) {
        // Only set email if it's not empty or null
        if (studentData.email && studentData.email.trim() !== '') {
          studentUpdateData.email = studentData.email.trim();
        } else {
          studentUpdateData.email = null;
        }
      }
      
      if (studentData.emailPassword !== undefined) studentUpdateData.emailPassword = studentData.emailPassword;
      if (studentData.emergencyContact !== undefined) studentUpdateData.emergencyContact = studentData.emergencyContact;
      
      // Address Information
      if (studentData.address) {
        if (studentData.address.houseNo !== undefined) studentUpdateData.houseNo = studentData.address.houseNo;
        if (studentData.address.street !== undefined) studentUpdateData.street = studentData.address.street;
        if (studentData.address.city !== undefined) studentUpdateData.city = studentData.address.city;
        if (studentData.address.state !== undefined) studentUpdateData.state = studentData.address.state;
        if (studentData.address.pinCode !== undefined) studentUpdateData.pinCode = studentData.address.pinCode;
        if (studentData.address.permanentHouseNo !== undefined) studentUpdateData.permanentHouseNo = studentData.address.permanentHouseNo;
        if (studentData.address.permanentStreet !== undefined) studentUpdateData.permanentStreet = studentData.address.permanentStreet;
        if (studentData.address.permanentCity !== undefined) studentUpdateData.permanentCity = studentData.address.permanentCity;
        if (studentData.address.permanentState !== undefined) studentUpdateData.permanentState = studentData.address.permanentState;
        if (studentData.address.permanentPinCode !== undefined) studentUpdateData.permanentPinCode = studentData.address.permanentPinCode;
        if (studentData.address.sameAsPresentAddress !== undefined) studentUpdateData.sameAsPresentAddress = studentData.address.sameAsPresentAddress;
      }
      
      // Parent Information
      if (studentData.father && studentData.father.name !== undefined) {
        studentUpdateData.fatherName = studentData.father.name;
      }
      if (studentData.father && studentData.father.email !== undefined) {
        // Handle father email carefully
        if (studentData.father.email && studentData.father.email.trim() !== '') {
          studentUpdateData.fatherEmail = studentData.father.email.trim();
        } else {
          studentUpdateData.fatherEmail = null;
        }
      }
      if (studentData.father && studentData.father.emailPassword !== undefined) {
        studentUpdateData.fatherEmailPassword = studentData.father.emailPassword;
      }
      if (studentData.mother && studentData.mother.name !== undefined) {
        studentUpdateData.motherName = studentData.mother.name;
      }
      if (studentData.mother && studentData.mother.email !== undefined) {
        // Handle mother email carefully
        if (studentData.mother.email && studentData.mother.email.trim() !== '') {
          studentUpdateData.motherEmail = studentData.mother.email.trim();
        } else {
          studentUpdateData.motherEmail = null;
        }
      }
      if (studentData.mother && studentData.mother.emailPassword !== undefined) {
        studentUpdateData.motherEmailPassword = studentData.mother.emailPassword;
      }

      // Handle document fields directly in Student model
      const documentFields = [
        'studentImagePath', 'fatherImagePath', 'motherImagePath', 'guardianImagePath',
        'signaturePath', 'parentSignaturePath', 'fatherAadharPath', 'motherAadharPath',
        'birthCertificatePath', 'transferCertificatePath', 'markSheetPath', 'aadhaarCardPath',
        'familyIdPath', 'fatherSignaturePath', 'motherSignaturePath', 'guardianSignaturePath',
        'migrationCertificatePath', 'affidavitCertificatePath', 'incomeCertificatePath',
        'addressProof1Path', 'addressProof2Path', 'academicRegistrationNo'
      ];
      
      
      // Update document path fields
      documentFields.forEach(field => {
        if (studentData[field] !== undefined) {
          studentUpdateData[field] = studentData[field];
        }
      });

      console.log('Student update data:', Object.keys(studentUpdateData));

      // Update main student record
      const student = await prisma.student.update({
        where: { id: id },
        data: studentUpdateData,
      });

      // Update session information
      if (studentData.admitSession || studentData.currentSession) {
        const sessionUpdateData = {};
        
        if (studentData.admitSession) {
          if (studentData.admitSession.class !== undefined) sessionUpdateData.admitClass = studentData.admitSession.class;
          if (studentData.admitSession.section !== undefined) sessionUpdateData.admitSection = studentData.admitSession.section;
          if (studentData.admitSession.rollNo !== undefined) sessionUpdateData.admitRollNo = studentData.admitSession.rollNo;
          if (studentData.admitSession.group !== undefined) sessionUpdateData.admitGroup = studentData.admitSession.group;
          if (studentData.admitSession.stream !== undefined) sessionUpdateData.admitStream = studentData.admitSession.stream;
          if (studentData.admitSession.semester !== undefined) sessionUpdateData.admitSemester = studentData.admitSession.semester;
          if (studentData.admitSession.feeGroup !== undefined) sessionUpdateData.admitFeeGroup = studentData.admitSession.feeGroup;
          if (studentData.admitSession.house !== undefined) sessionUpdateData.admitHouse = studentData.admitSession.house;
        }
        
        if (studentData.currentSession) {
          if (studentData.currentSession.class !== undefined) sessionUpdateData.currentClass = studentData.currentSession.class;
          if (studentData.currentSession.section !== undefined) sessionUpdateData.currentSection = studentData.currentSession.section;
          if (studentData.currentSession.rollNo !== undefined) sessionUpdateData.currentRollNo = studentData.currentSession.rollNo;
          if (studentData.currentSession.group !== undefined) sessionUpdateData.currentGroup = studentData.currentSession.group;
          if (studentData.currentSession.stream !== undefined) sessionUpdateData.currentStream = studentData.currentSession.stream;
          if (studentData.currentSession.semester !== undefined) sessionUpdateData.currentSemester = studentData.currentSession.semester;
          if (studentData.currentSession.feeGroup !== undefined) sessionUpdateData.currentFeeGroup = studentData.currentSession.feeGroup;
          if (studentData.currentSession.house !== undefined) sessionUpdateData.currentHouse = studentData.currentSession.house;
        }

        if (Object.keys(sessionUpdateData).length > 0) {
          await prisma.sessionInfo.upsert({
            where: { studentId: id },
            update: sessionUpdateData,
            create: {
              studentId: id,
              ...sessionUpdateData
            }
          });
        }
      }

      // Update parent information
      if (studentData.father || studentData.mother || studentData.guardian) {
        const parentUpdateData = {};
        
        if (studentData.father) {
          if (studentData.father.qualification !== undefined) parentUpdateData.fatherQualification = studentData.father.qualification;
          if (studentData.father.occupation !== undefined) parentUpdateData.fatherOccupation = studentData.father.occupation;
          if (studentData.father.contactNumber !== undefined) parentUpdateData.fatherContact = studentData.father.contactNumber;
          if (studentData.father.aadhaarNo !== undefined) parentUpdateData.fatherAadhaarNo = studentData.father.aadhaarNo;
          if (studentData.father.annualIncome !== undefined) parentUpdateData.fatherAnnualIncome = studentData.father.annualIncome;
          if (studentData.father.isCampusEmployee !== undefined) parentUpdateData.fatherIsCampusEmployee = studentData.father.isCampusEmployee ? 'yes' : 'no';
        }
        
        if (studentData.mother) {
          if (studentData.mother.qualification !== undefined) parentUpdateData.motherQualification = studentData.mother.qualification;
          if (studentData.mother.occupation !== undefined) parentUpdateData.motherOccupation = studentData.mother.occupation;
          if (studentData.mother.contactNumber !== undefined) parentUpdateData.motherContact = studentData.mother.contactNumber;
          if (studentData.mother.aadhaarNo !== undefined) parentUpdateData.motherAadhaarNo = studentData.mother.aadhaarNo;
          if (studentData.mother.annualIncome !== undefined) parentUpdateData.motherAnnualIncome = studentData.mother.annualIncome;
          if (studentData.mother.isCampusEmployee !== undefined) parentUpdateData.motherIsCampusEmployee = studentData.mother.isCampusEmployee ? 'yes' : 'no';
        }
        
        if (studentData.guardian) {
          if (studentData.guardian.name !== undefined) parentUpdateData.guardianName = studentData.guardian.name;
          if (studentData.guardian.address !== undefined) parentUpdateData.guardianAddress = studentData.guardian.address;
          if (studentData.guardian.contactNumber !== undefined) parentUpdateData.guardianContact = studentData.guardian.contactNumber;
          if (studentData.guardian.email !== undefined) parentUpdateData.guardianEmail = studentData.guardian.email;
          if (studentData.guardian.aadhaarNo !== undefined) parentUpdateData.guardianAadhaarNo = studentData.guardian.aadhaarNo;
          if (studentData.guardian.occupation !== undefined) parentUpdateData.guardianOccupation = studentData.guardian.occupation;
          if (studentData.guardian.annualIncome !== undefined) parentUpdateData.guardianAnnualIncome = studentData.guardian.annualIncome;
        }

        if (Object.keys(parentUpdateData).length > 0) {
          await prisma.parentInfo.upsert({
            where: { studentId: id },
            update: parentUpdateData,
            create: {
              studentId: id,
              ...parentUpdateData
            }
          });
        }
      }

      // Update transport information
      if (studentData.transport) {
        const transportUpdateData = {};
        
        if (studentData.transport.mode !== undefined) transportUpdateData.transportMode = studentData.transport.mode;
        if (studentData.transport.area !== undefined) transportUpdateData.transportArea = studentData.transport.area;
        if (studentData.transport.stand !== undefined) transportUpdateData.transportStand = studentData.transport.stand;
        if (studentData.transport.route !== undefined) transportUpdateData.transportRoute = studentData.transport.route;
        if (studentData.transport.driver !== undefined) transportUpdateData.transportDriver = studentData.transport.driver;
        if (studentData.transport.pickupLocation !== undefined) transportUpdateData.pickupLocation = studentData.transport.pickupLocation;
        if (studentData.transport.dropLocation !== undefined) transportUpdateData.dropLocation = studentData.transport.dropLocation;

        if (Object.keys(transportUpdateData).length > 0) {
          await prisma.transportInfo.upsert({
            where: { studentId: id },
            update: transportUpdateData,
            create: {
              studentId: id,
              ...transportUpdateData
            }
          });
        }
      }

      // Update education information
      if (studentData.lastEducation) {
        const educationUpdateData = {};
        
        if (studentData.lastEducation.school !== undefined) educationUpdateData.lastSchool = studentData.lastEducation.school;
        if (studentData.lastEducation.address !== undefined) educationUpdateData.lastSchoolAddress = studentData.lastEducation.address;
        if (studentData.lastEducation.tcDate !== undefined) {
          educationUpdateData.lastTcDate = studentData.lastEducation.tcDate ? new Date(studentData.lastEducation.tcDate) : null;
        }
        if (studentData.lastEducation.prevClass !== undefined) educationUpdateData.lastClass = studentData.lastEducation.prevClass;
        if (studentData.lastEducation.percentage !== undefined) educationUpdateData.lastPercentage = studentData.lastEducation.percentage;
        if (studentData.lastEducation.attendance !== undefined) educationUpdateData.lastAttendance = studentData.lastEducation.attendance;
        if (studentData.lastEducation.extraActivity !== undefined) educationUpdateData.lastExtraActivity = studentData.lastEducation.extraActivity;

        if (Object.keys(educationUpdateData).length > 0) {
          await prisma.educationInfo.upsert({
            where: { studentId: id },
            update: educationUpdateData,
            create: {
              studentId: id,
              ...educationUpdateData
            }
          });
        }
      }

      // Update other information
      if (studentData.other) {
        const otherUpdateData = {};
        
        if (studentData.other.belongToBPL !== undefined) otherUpdateData.belongToBPL = studentData.other.belongToBPL;
        if (studentData.other.minority !== undefined) otherUpdateData.minority = studentData.other.minority;
        if (studentData.other.disability !== undefined) otherUpdateData.disability = studentData.other.disability;
        if (studentData.other.accountNo !== undefined) otherUpdateData.accountNo = studentData.other.accountNo;
        if (studentData.other.bank !== undefined) otherUpdateData.bank = studentData.other.bank;
        if (studentData.other.ifscCode !== undefined) otherUpdateData.ifscCode = studentData.other.ifscCode;
        if (studentData.other.medium !== undefined) otherUpdateData.medium = studentData.other.medium;
        if (studentData.other.lastYearResult !== undefined) otherUpdateData.lastYearResult = studentData.other.lastYearResult;
        if (studentData.other.singleParent !== undefined) otherUpdateData.singleParent = studentData.other.singleParent;
        if (studentData.other.onlyChild !== undefined) otherUpdateData.onlyChild = studentData.other.onlyChild;
        if (studentData.other.onlyGirlChild !== undefined) otherUpdateData.onlyGirlChild = studentData.other.onlyGirlChild;
        if (studentData.other.adoptedChild !== undefined) otherUpdateData.adoptedChild = studentData.other.adoptedChild;
        if (studentData.other.siblingAdmissionNo !== undefined) otherUpdateData.siblingAdmissionNo = studentData.other.siblingAdmissionNo;
        if (studentData.other.transferCase !== undefined) otherUpdateData.transferCase = studentData.other.transferCase;
        if (studentData.other.livingWith !== undefined) otherUpdateData.livingWith = studentData.other.livingWith;
        if (studentData.other.motherTongue !== undefined) otherUpdateData.motherTongue = studentData.other.motherTongue;
        if (studentData.other.admissionType !== undefined) otherUpdateData.admissionType = studentData.other.admissionType;
        if (studentData.other.udiseNo !== undefined) otherUpdateData.udiseNo = studentData.other.udiseNo;

        if (Object.keys(otherUpdateData).length > 0) {
          await prisma.otherInfo.upsert({
            where: { studentId: id },
            update: otherUpdateData,
            create: {
              studentId: id,
              ...otherUpdateData
            }
          });
        }
      }

      return student;
    });

    // Fetch the complete updated student data with all relations
    const completeStudent = await prisma.student.findUnique({
      where: { id: id },
      include: {
        parentInfo: true,
        sessionInfo: true,
        transportInfo: true,
        educationInfo: true,
        otherInfo: true
      }
    });

    console.log('Student updated successfully');

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: completeStudent
    });

  } catch (error) {
    console.error('Error updating student:', error);
    
    // Handle unique constraint errors specifically
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return res.status(400).json({
        success: false,
        message: `A student with this ${field} already exists`,
        error: `Duplicate ${field}`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating student',
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