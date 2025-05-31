import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherStats
} from '../controllers/teacherController.js';
import { protect, authorize, requireSchoolContext } from '../middlewares/authMiddleware.js';

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

// Protected routes with authentication and authorization

// Get all teachers
router.get('/', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getAllTeachers
);

// Get teacher by ID
router.get('/:id', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getTeacherById
);

// Create new teacher
router.post('/', 
  protect, 
  authorize('admin', 'school'),
  requireSchoolContext,
  createTeacher
);

// Update teacher
router.put('/:id', 
  protect, 
  authorize('admin', 'school'),
  requireSchoolContext,
  updateTeacher
);

// Delete teacher
router.delete('/:id', 
  protect, 
  authorize('admin', 'school'),
  requireSchoolContext,
  deleteTeacher
);

// Get teacher statistics
router.get('/stats/overview', 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getTeacherStats
);

// Health check route (no auth required)
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Teacher service is running",
    timestamp: new Date().toISOString()
  });
});

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

    // Validate required fields
    if (!fullName || !email || !password || !phone || !gender || !schoolId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if teacher with same email exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { email }
    });

    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: 'Teacher with this email already exists'
      });
    }

    // Calculate age if date of birth is provided
    const age = dateOfBirth ? calculateAge(dateOfBirth) : null;

    // Create new teacher
    const teacher = await prisma.teacher.create({
      data: {
        fullName,
        email,
        password: await bcrypt.hash(password, 10),
        phone,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        age,
        designation,
        qualification,
        address,
        subjects: JSON.stringify(subjects || []),
        sections: JSON.stringify(sections || []),
        religion,
        bloodGroup,
        maritalStatus,
        facebook,
        twitter,
        linkedIn,
        documents: JSON.stringify(documents || []),
        joiningSalary: joiningSalary ? parseFloat(joiningSalary) : null,
        accountHolderName,
        accountNumber,
        bankName,
        bankBranch,
        isClassIncharge: isClassIncharge || false,
        inchargeClass,
        inchargeSection,
        schoolId: parseInt(schoolId)
      }
    });

    // Format the response
    const formattedTeacher = {
      ...teacher,
      subjects: JSON.parse(teacher.subjects),
      sections: JSON.parse(teacher.sections),
      documents: teacher.documents ? JSON.parse(teacher.documents) : null
    };

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: formattedTeacher
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating teacher',
      error: error.message
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

    // Validate required fields
    if (!fullName || !email || !phone || !gender || !schoolId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
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

    // Check if email is already taken by another teacher
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

    // Calculate age if date of birth is provided
    const age = dateOfBirth ? calculateAge(dateOfBirth) : null;

    // Update teacher
    const updatedTeacher = await prisma.teacher.update({
      where: { id: parseInt(id) },
      data: {
        fullName,
        email,
        password: password ? await bcrypt.hash(password, 10) : undefined,
        phone,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        age,
        designation,
        qualification,
        address,
        subjects: subjects ? JSON.stringify(subjects) : undefined,
        sections: sections ? JSON.stringify(sections) : undefined,
        religion,
        bloodGroup,
        maritalStatus,
        facebook,
        twitter,
        linkedIn,
        documents: documents ? JSON.stringify(documents) : undefined,
        joiningSalary: joiningSalary ? parseFloat(joiningSalary) : undefined,
        accountHolderName,
        accountNumber,
        bankName,
        bankBranch,
        isClassIncharge: isClassIncharge !== undefined ? isClassIncharge : undefined,
        inchargeClass,
        inchargeSection,
        schoolId: parseInt(schoolId)
      }
    });

    // Format the response
    const formattedTeacher = {
      ...updatedTeacher,
      subjects: JSON.parse(updatedTeacher.subjects),
      sections: JSON.parse(updatedTeacher.sections),
      documents: updatedTeacher.documents ? JSON.parse(updatedTeacher.documents) : null
    };

    res.json({
      success: true,
      message: 'Teacher updated successfully',
      data: formattedTeacher
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating teacher',
      error: error.message
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