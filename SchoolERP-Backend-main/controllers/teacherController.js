const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// GET all teachers for a school
exports.getAllTeachers = async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    const teachers = await prisma.teacher.findMany({
      where: {
        schoolId: parseInt(schoolId),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the data to match frontend requirements
    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      username: teacher.username,
      gender: teacher.gender,
      dateOfBirth: teacher.dateOfBirth,
      age: teacher.age,
    designation: teacher.designation || 'Teacher',
      qualification: teacher.qualification,
      address: teacher.address || '',
      subjects: JSON.parse(teacher.subjects || '[]'),
      sections: JSON.parse(teacher.sections || '[]'),
      joining_year: teacher.joining_year,
      experience: teacher.experience,
      profileImage: teacher.profileImage || '',
      isClassIncharge: teacher.isClassIncharge,
      inchargeClass: teacher.inchargeClass,
      inchargeSection: teacher.inchargeSection,
      religion: teacher.religion,
      bloodGroup: teacher.bloodGroup,
      maritalStatus: teacher.maritalStatus,
      facebook: teacher.facebook,
      twitter: teacher.twitter,
      linkedIn: teacher.linkedIn,
      documents: JSON.parse(teacher.documents || '[]'),
      joiningSalary: teacher.joiningSalary,
      accountHolderName: teacher.accountHolderName,
      accountNumber: teacher.accountNumber,
      bankName: teacher.bankName,
      bankBranch: teacher.bankBranch,
      status: teacher.status,
      schoolId: teacher.schoolId,
      lastLogin: teacher.lastLogin,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt
    }));

    res.status(200).json({ success: true, data: formattedTeachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teachers', error: error.message });
  }
};

// GET a single teacher by ID
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        school: true,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    // Parse JSON fields and ensure all fields have proper values
    const parsedTeacher = {
      id: teacher.id,
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      username: teacher.username || teacher.email?.split('@')[0] || '',
      gender: teacher.gender || '',
      dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.toISOString() : null,
      age: teacher.age || null,
      designation: teacher.designation || 'Teacher',
      qualification: teacher.qualification || '',
      address: teacher.address || '',
      subjects: JSON.parse(teacher.subjects || '[]'),
      sections: JSON.parse(teacher.sections || '[]'),
      joining_year: teacher.joining_year ? teacher.joining_year.toISOString() : null,
      experience: teacher.experience || '',
      profileImage: teacher.profileImage || '',
      isClassIncharge: teacher.isClassIncharge || false,
      inchargeClass: teacher.inchargeClass || null,
      inchargeSection: teacher.inchargeSection || null,
      religion: teacher.religion || '',
      bloodGroup: teacher.bloodGroup || '',
      maritalStatus: teacher.maritalStatus || '',
      facebook: teacher.facebook || '',
      twitter: teacher.twitter || '',
      linkedIn: teacher.linkedIn || '',
      documents: JSON.parse(teacher.documents || '[]'),
      joiningSalary: teacher.joiningSalary || null,
      accountHolderName: teacher.accountHolderName || '',
      accountNumber: teacher.accountNumber || '',
      bankName: teacher.bankName || '',
      bankBranch: teacher.bankBranch || '',
      status: teacher.status || 'active',
      schoolId: teacher.schoolId,
      lastLogin: teacher.lastLogin ? teacher.lastLogin.toISOString() : null,
      createdAt: teacher.createdAt ? teacher.createdAt.toISOString() : null,
      updatedAt: teacher.updatedAt ? teacher.updatedAt.toISOString() : null
    };

    // Log the parsed teacher data for debugging
    console.log('Parsed Teacher Data:', parsedTeacher);

    res.json({
      success: true,
      data: parsedTeacher,
    });
  } catch (error) {
    console.error('Error in getTeacherById:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teacher details',
      error: error.message,
    });
  }
};

// CREATE a new teacher
exports.createTeacher = async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      password, 
      phone, 
      designation, 
      subjects, 
      sections, 
      joining_year, 
      address, 
      qualification, 
      experience, 
      profileImage,
      isClassIncharge, 
      inchargeClass, 
      inchargeSection,
      gender,
      dateOfBirth,
      age,
      religion,
      bloodGroup,
      maritalStatus,
      facebook,
      twitter,
      linkedIn,
      documents,
      joiningSalary,
      accountHolderName,
      accountNumber,
      bankName,
      bankBranch,
      schoolId 
    } = req.body;

    // Check if a teacher with the same email already exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { email },
    });

    if (existingTeacher) {
      return res.status(400).json({ success: false, message: 'Teacher with this email already exists' });
    }

    // Check if the requested class and section for incharge is already assigned
    if (isClassIncharge && inchargeClass && inchargeSection) {
      const existingIncharge = await prisma.teacher.findFirst({
        where: {
          schoolId: parseInt(schoolId),
          isClassIncharge: true,
          inchargeClass,
          inchargeSection,
        },
      });

      if (existingIncharge) {
        return res.status(400).json({ 
          success: false, 
          message: `${existingIncharge.fullName} is already incharge of Class ${inchargeClass} Section ${inchargeSection}` 
        });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a username if not provided
    const username = email.split('@')[0];

    // Create the teacher
    const teacher = await prisma.teacher.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        username,
        phone,
        designation: designation || 'Teacher',
        subjects: JSON.stringify(subjects),
        sections: JSON.stringify(sections),
        joining_year: joining_year ? new Date(joining_year) : new Date(),
        address,
        qualification,
        experience,
        profileImage,
        isClassIncharge: isClassIncharge || false,
        inchargeClass: isClassIncharge ? inchargeClass : null,
        inchargeSection: isClassIncharge ? inchargeSection : null,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        age,
        religion,
        bloodGroup,
        maritalStatus,
        facebook,
        twitter,
        linkedIn,
        documents: JSON.stringify(documents || []),
        joiningSalary,
        accountHolderName,
        accountNumber,
        bankName,
        bankBranch,
        schoolId: parseInt(schoolId),
        status: 'active',
      },
    });

    // Format the response
    const formattedTeacher = {
      id: teacher.id,
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      username: teacher.username,
      gender: teacher.gender,
      dateOfBirth: teacher.dateOfBirth,
      age: teacher.age,
      designation: teacher.designation || 'Teacher',
      qualification: teacher.qualification,
      address: teacher.address || '',
      subjects: JSON.parse(teacher.subjects || '[]'),
      sections: JSON.parse(teacher.sections || '[]'),
      joining_year: teacher.joining_year,
      experience: teacher.experience,
      profileImage: teacher.profileImage || '',
      isClassIncharge: teacher.isClassIncharge,
      inchargeClass: teacher.inchargeClass,
      inchargeSection: teacher.inchargeSection,
      religion: teacher.religion,
      bloodGroup: teacher.bloodGroup,
      maritalStatus: teacher.maritalStatus,
      facebook: teacher.facebook,
      twitter: teacher.twitter,
      linkedIn: teacher.linkedIn,
      documents: JSON.parse(teacher.documents || '[]'),
      joiningSalary: teacher.joiningSalary,
      accountHolderName: teacher.accountHolderName,
      accountNumber: teacher.accountNumber,
      bankName: teacher.bankName,
      bankBranch: teacher.bankBranch,
      status: teacher.status,
      schoolId: teacher.schoolId,
      lastLogin: teacher.lastLogin,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt
    };

    res.status(201).json({ success: true, data: formattedTeacher, message: 'Teacher created successfully' });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ success: false, message: 'Failed to create teacher', error: error.message });
  }
};

// UPDATE a teacher
exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      fullName, 
      email, 
      phone, 
      designation, 
      subjects, 
      sections, 
      joining_year, 
      address, 
      qualification, 
      experience, 
      profileImage,
      isClassIncharge, 
      inchargeClass, 
      inchargeSection,
      gender,
      dateOfBirth,
      age,
      religion,
      bloodGroup,
      maritalStatus,
      facebook,
      twitter,
      linkedIn,
      documents,
      joiningSalary,
      accountHolderName,
      accountNumber,
      bankName,
      bankBranch,
      status,
      schoolId 
    } = req.body;

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTeacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Check if email is being changed and if it already exists
    if (email !== existingTeacher.email) {
      const emailExists = await prisma.teacher.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email is already in use' });
      }
    }

    // Check if the requested class and section for incharge is already assigned to another teacher
    if (isClassIncharge && inchargeClass && inchargeSection) {
      const existingIncharge = await prisma.teacher.findFirst({
        where: {
          id: { not: parseInt(id) },
          schoolId: parseInt(schoolId),
          isClassIncharge: true,
          inchargeClass,
          inchargeSection,
        },
      });

      if (existingIncharge) {
        return res.status(400).json({ 
          success: false, 
          message: `${existingIncharge.fullName} is already incharge of Class ${inchargeClass} Section ${inchargeSection}` 
        });
      }
    }

    // Update the teacher
    const updatedTeacher = await prisma.teacher.update({
      where: { id: parseInt(id) },
      data: {
        fullName,
        email,
        phone,
        designation,
        subjects: JSON.stringify(subjects),
        sections: JSON.stringify(sections),
        joining_year: joining_year ? new Date(joining_year) : existingTeacher.joining_year,
        address,
        qualification,
        experience,
        profileImage,
        isClassIncharge: isClassIncharge || false,
        inchargeClass: isClassIncharge ? inchargeClass : null,
        inchargeSection: isClassIncharge ? inchargeSection : null,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : existingTeacher.dateOfBirth,
        age,
        religion,
        bloodGroup,
        maritalStatus,
        facebook,
        twitter,
        linkedIn,
        documents: JSON.stringify(documents || []),
        joiningSalary,
        accountHolderName,
        accountNumber,
        bankName,
        bankBranch,
        status,
      },
    });

    // Format the response
    const formattedTeacher = {
      id: updatedTeacher.id,
      fullName: updatedTeacher.fullName,
      email: updatedTeacher.email,
      phone: updatedTeacher.phone,
      username: updatedTeacher.username,
      gender: updatedTeacher.gender,
      dateOfBirth: updatedTeacher.dateOfBirth,
      age: updatedTeacher.age,
      designation: updatedTeacher.designation || 'Teacher',
      qualification: updatedTeacher.qualification,
      address: updatedTeacher.address || '',
      subjects: JSON.parse(updatedTeacher.subjects || '[]'),
      sections: JSON.parse(updatedTeacher.sections || '[]'),
      joining_year: updatedTeacher.joining_year,
      experience: updatedTeacher.experience,
      profileImage: updatedTeacher.profileImage || '',
      isClassIncharge: updatedTeacher.isClassIncharge,
      inchargeClass: updatedTeacher.inchargeClass,
      inchargeSection: updatedTeacher.inchargeSection,
      religion: updatedTeacher.religion,
      bloodGroup: updatedTeacher.bloodGroup,
      maritalStatus: updatedTeacher.maritalStatus,
      facebook: updatedTeacher.facebook,
      twitter: updatedTeacher.twitter,
      linkedIn: updatedTeacher.linkedIn,
      documents: JSON.parse(updatedTeacher.documents || '[]'),
      joiningSalary: updatedTeacher.joiningSalary,
      accountHolderName: updatedTeacher.accountHolderName,
      accountNumber: updatedTeacher.accountNumber,
      bankName: updatedTeacher.bankName,
      bankBranch: updatedTeacher.bankBranch,
      status: updatedTeacher.status,
      schoolId: updatedTeacher.schoolId,
      lastLogin: updatedTeacher.lastLogin,
      createdAt: updatedTeacher.createdAt,
      updatedAt: updatedTeacher.updatedAt
    };

    res.status(200).json({ 
      success: true, 
      data: formattedTeacher, 
      message: 'Teacher updated successfully' 
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ success: false, message: 'Failed to update teacher', error: error.message });
  }
};

// DELETE a teacher
exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTeacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Delete the teacher
    await prisma.teacher.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ success: false, message: 'Failed to delete teacher', error: error.message });
  }
};

// GET teacher search and filter
exports.searchTeachers = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { searchTerm, classFilter, status } = req.query;
    
    let whereClause = {
      schoolId: parseInt(schoolId),
    };

    // Add status filter if provided
    if (status) {
      whereClause.status = status;
    }

    // Add search term if provided
    if (searchTerm) {
      whereClause.OR = [
        { fullName: { contains: searchTerm } },
        { email: { contains: searchTerm } },
        { designation: { contains: searchTerm } }
      ];
    }

    // Fetch teachers based on filters
    const teachers = await prisma.teacher.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format and filter by class if needed
    let formattedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      username: teacher.username,
      gender: teacher.gender,
      dateOfBirth: teacher.dateOfBirth,
      age: teacher.age,
      designation: teacher.designation || 'Teacher',
      qualification: teacher.qualification,
      address: teacher.address || '',
      subjects: JSON.parse(teacher.subjects || '[]'),
      sections: JSON.parse(teacher.sections || '[]'),
      joining_year: teacher.joining_year,
      experience: teacher.experience,
      profileImage: teacher.profileImage || '',
      isClassIncharge: teacher.isClassIncharge,
      inchargeClass: teacher.inchargeClass,
      inchargeSection: teacher.inchargeSection,
      religion: teacher.religion,
      bloodGroup: teacher.bloodGroup,
      maritalStatus: teacher.maritalStatus,
      facebook: teacher.facebook,
      twitter: teacher.twitter,
      linkedIn: teacher.linkedIn,
      documents: JSON.parse(teacher.documents || '[]'),
      joiningSalary: teacher.joiningSalary,
      accountHolderName: teacher.accountHolderName,
      accountNumber: teacher.accountNumber,
      bankName: teacher.bankName,
      bankBranch: teacher.bankBranch,
      status: teacher.status,
      schoolId: teacher.schoolId,
      lastLogin: teacher.lastLogin,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt
    }));

    // Filter by class if classFilter is provided
    if (classFilter && classFilter !== 'all') {
      formattedTeachers = formattedTeachers.filter(teacher => 
        teacher.sections.some(section => section.class === classFilter)
      );
    }

    res.status(200).json({ success: true, data: formattedTeachers });
  } catch (error) {
    console.error('Error searching teachers:', error);
    res.status(500).json({ success: false, message: 'Failed to search teachers', error: error.message });
  }
}; 