import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const router = express.Router();
const prisma = new PrismaClient();

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// GET all teachers for a school
router.get('/school/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    const teachers = await prisma.teacher.findMany({
      where: { schoolId: parseInt(schoolId) },
      orderBy: { createdAt: 'desc' },
    });

    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      designation: teacher.designation || 'Teacher',
      subjects: JSON.parse(teacher.subjects || '[]'),
      classes: teacher.classes,
      sections: JSON.parse(teacher.sections || '[]'),
      joinDate: teacher.joining_year.toISOString().split('T')[0],
      address: teacher.address || '',
      education: teacher.education || '',
      experience: teacher.experience,
      profileImage: teacher.profileImage || 'https://randomuser.me/api/portraits/men/0.jpg',
      isClassIncharge: teacher.isClassIncharge,
      inchargeClass: teacher.inchargeClass,
      inchargeSection: teacher.inchargeSection,
      status: teacher.status,
      schoolId: teacher.schoolId,
      username: teacher.username
    }));

    res.status(200).json({ success: true, data: formattedTeachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teachers', error: error.message });
  }
});

// GET search and filter teachers
router.get('/school/:schoolId/search', async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { searchTerm, classFilter, status } = req.query;
    
    let whereClause = { schoolId: parseInt(schoolId) };

    if (status) whereClause.status = status;

    if (searchTerm) {
      whereClause.OR = [
        { fullName: { contains: searchTerm } },
        { email: { contains: searchTerm } },
        { designation: { contains: searchTerm } }
      ];
    }

    const teachers = await prisma.teacher.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    let formattedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      designation: teacher.designation || 'Teacher',
      subjects: JSON.parse(teacher.subjects || '[]'),
      classes: teacher.classes,
      sections: JSON.parse(teacher.sections || '[]'),
      joinDate: teacher.joining_year.toISOString().split('T')[0],
      address: teacher.address || '',
      education: teacher.education || '',
      experience: teacher.experience,
      profileImage: teacher.profileImage || 'https://randomuser.me/api/portraits/men/0.jpg',
      isClassIncharge: teacher.isClassIncharge,
      inchargeClass: teacher.inchargeClass,
      inchargeSection: teacher.inchargeSection,
      status: teacher.status,
      schoolId: teacher.schoolId,
      username: teacher.username
    }));

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
});

// GET a single teacher by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(id) },
    });

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const formattedTeacher = {
      id: teacher.id,
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      gender: teacher.gender,
      dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.toISOString().split('T')[0] : null,
      age: teacher.age,
      designation: teacher.designation || 'Teacher',
      qualification: teacher.qualification || '',
      address: teacher.address || '',
      subjects: JSON.parse(teacher.subjects || '[]'),
      sections: JSON.parse(teacher.sections || '[]'),
      joining_year: teacher.joining_year ? teacher.joining_year.toISOString().split('T')[0] : null,
      experience: teacher.experience || '',
      profileImage: teacher.profileImage || 'https://randomuser.me/api/portraits/men/0.jpg',
      isClassIncharge: teacher.isClassIncharge || false,
      inchargeClass: teacher.inchargeClass || '',
      inchargeSection: teacher.inchargeSection || '',
      status: teacher.status || 'active',
      schoolId: teacher.schoolId,
      username: teacher.username || '',
      religion: teacher.religion || '',
      bloodGroup: teacher.bloodGroup || '',
      maritalStatus: teacher.maritalStatus || '',
      facebook: teacher.facebook || '',
      twitter: teacher.twitter || '',
      linkedIn: teacher.linkedIn || '',
      joiningSalary: teacher.joiningSalary || 0,
      accountHolderName: teacher.accountHolderName || '',
      accountNumber: teacher.accountNumber || '',
      bankName: teacher.bankName || '',
      bankBranch: teacher.bankBranch || '',
      documents: teacher.documents ? JSON.parse(teacher.documents) : []
    };

    res.status(200).json({ success: true, data: formattedTeacher });
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teacher', error: error.message });
  }
});

// CREATE a new teacher
router.post('/', async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      gender,
      dateOfBirth,
      designation,
      qualification,
      address,
      subjects,
      sections,
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
      isClassIncharge,
      inchargeClass,
      inchargeSection,
      schoolId
    } = req.body;

    // Validate required fields - only fullName and gender are required
    if (!fullName || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fullName and gender'
      });
    }

    // Set default schoolId if not provided (from auth context)
    const teacherSchoolId = schoolId || 1; // You can get this from auth context

    // Check if teacher with same email exists (only if email is provided)
    if (email) {
      const existingTeacher = await prisma.teacher.findUnique({
        where: { email }
      });

      if (existingTeacher) {
        return res.status(400).json({
          success: false,
          message: 'Teacher with this email already exists'
        });
      }
    }

    // Calculate age if date of birth is provided
    const age = dateOfBirth ? calculateAge(dateOfBirth) : null;

    // Generate username from email or use a default
    const username = email ? email.split('@')[0] : `teacher_${Date.now()}`;

    // Hash password if provided, otherwise use default
    const hashedPassword = password ? await bcrypt.hash(password, 10) : await bcrypt.hash('123456', 10);

    // Process subjects and sections arrays
    const processedSubjects = Array.isArray(subjects) ? JSON.stringify(subjects) : (subjects || '[]');
    const processedSections = Array.isArray(sections) ? JSON.stringify(sections) : (sections || '[]');
    const processedDocuments = Array.isArray(documents) ? JSON.stringify(documents) : (documents || '[]');

    const teacher = await prisma.teacher.create({
      data: {
        fullName: fullName.trim(),
        email: email ? email.trim() : null,
        password: hashedPassword,
        username: username,
        phone: phone ? phone.trim() : null,
        gender: gender.trim(),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        age: age,
        designation: designation ? designation.trim() : 'Teacher',
        qualification: qualification ? qualification.trim() : null,
        address: address ? address.trim() : null,
        subjects: processedSubjects,
        sections: processedSections,
        religion: religion ? religion.trim() : null,
        bloodGroup: bloodGroup ? bloodGroup.trim() : null,
        maritalStatus: maritalStatus ? maritalStatus.trim() : null,
        facebook: facebook ? facebook.trim() : null,
        twitter: twitter ? twitter.trim() : null,
        linkedIn: linkedIn ? linkedIn.trim() : null,
        documents: processedDocuments,
        joiningSalary: joiningSalary ? parseFloat(joiningSalary) : null,
        accountHolderName: accountHolderName ? accountHolderName.trim() : null,
        accountNumber: accountNumber ? accountNumber.trim() : null,
        bankName: bankName ? bankName.trim() : null,
        bankBranch: bankBranch ? bankBranch.trim() : null,
        isClassIncharge: isClassIncharge || false,
        inchargeClass: isClassIncharge ? (inchargeClass ? inchargeClass.trim() : null) : null,
        inchargeSection: isClassIncharge ? (inchargeSection ? inchargeSection.trim() : null) : null,
        schoolId: teacherSchoolId
      },
      include: {
        school: {
          select: {
            id: true,
            schoolName: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: teacher,
      message: 'Teacher created successfully'
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Email or username already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// UPDATE a teacher
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      password,
      phone,
      gender,
      dateOfBirth,
      designation,
      qualification,
      address,
      subjects,
      sections,
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
      isClassIncharge,
      inchargeClass,
      inchargeSection,
      schoolId
    } = req.body;

    // Validate required fields - only fullName and gender are required
    if (!fullName || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fullName and gender'
      });
    }

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTeacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Check if email is already taken by another teacher (only if email is provided)
    if (email) {
      const emailExists = await prisma.teacher.findFirst({
        where: {
          email,
          id: { not: parseInt(id) }
        }
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another teacher'
        });
      }
    }

    // Calculate age if date of birth is provided
    const age = dateOfBirth ? calculateAge(dateOfBirth) : null;

    // Process password if provided
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Process subjects and sections arrays
    const processedSubjects = Array.isArray(subjects) ? JSON.stringify(subjects) : (subjects || existingTeacher.subjects);
    const processedSections = Array.isArray(sections) ? JSON.stringify(sections) : (sections || existingTeacher.sections);
    const processedDocuments = Array.isArray(documents) ? JSON.stringify(documents) : (documents || existingTeacher.documents);

    // Prepare update data - only include fields that are provided
    const updateData = {
      fullName: fullName.trim(),
      gender: gender.trim(),
      ...(email !== undefined && { email: email ? email.trim() : null }),
      ...(hashedPassword && { password: hashedPassword }),
      ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
      ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
      ...(age !== null && { age }),
      ...(designation !== undefined && { designation: designation ? designation.trim() : 'Teacher' }),
      ...(qualification !== undefined && { qualification: qualification ? qualification.trim() : null }),
      ...(address !== undefined && { address: address ? address.trim() : null }),
      ...(subjects !== undefined && { subjects: processedSubjects }),
      ...(sections !== undefined && { sections: processedSections }),
      ...(religion !== undefined && { religion: religion ? religion.trim() : null }),
      ...(bloodGroup !== undefined && { bloodGroup: bloodGroup ? bloodGroup.trim() : null }),
      ...(maritalStatus !== undefined && { maritalStatus: maritalStatus ? maritalStatus.trim() : null }),
      ...(facebook !== undefined && { facebook: facebook ? facebook.trim() : null }),
      ...(twitter !== undefined && { twitter: twitter ? twitter.trim() : null }),
      ...(linkedIn !== undefined && { linkedIn: linkedIn ? linkedIn.trim() : null }),
      ...(documents !== undefined && { documents: processedDocuments }),
      ...(joiningSalary !== undefined && { joiningSalary: joiningSalary ? parseFloat(joiningSalary) : null }),
      ...(accountHolderName !== undefined && { accountHolderName: accountHolderName ? accountHolderName.trim() : null }),
      ...(accountNumber !== undefined && { accountNumber: accountNumber ? accountNumber.trim() : null }),
      ...(bankName !== undefined && { bankName: bankName ? bankName.trim() : null }),
      ...(bankBranch !== undefined && { bankBranch: bankBranch ? bankBranch.trim() : null }),
      ...(isClassIncharge !== undefined && { 
        isClassIncharge: isClassIncharge || false,
        inchargeClass: isClassIncharge ? (inchargeClass ? inchargeClass.trim() : null) : null,
        inchargeSection: isClassIncharge ? (inchargeSection ? inchargeSection.trim() : null) : null
      }),
      ...(schoolId !== undefined && { schoolId: schoolId || existingTeacher.schoolId })
    };

    const updatedTeacher = await prisma.teacher.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        school: {
          select: {
            id: true,
            schoolName: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: updatedTeacher,
      message: 'Teacher updated successfully'
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE a teacher
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTeacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    await prisma.teacher.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ success: false, message: 'Failed to delete teacher', error: error.message });
  }
});

export default router; 