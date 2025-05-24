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
};

// GET a single teacher by ID
exports.getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const teacher = await prisma.teacher.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Format the data
    const formattedTeacher = {
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
    };

    res.status(200).json({ success: true, data: formattedTeacher });
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teacher', error: error.message });
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
      classes, 
      sections, 
      joinDate, 
      address, 
      education, 
      experience, 
      profileImage, 
      isClassIncharge, 
      inchargeClass, 
      inchargeSection, 
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
        classes,
        sections: JSON.stringify(sections),
        joining_year: joinDate ? new Date(joinDate) : new Date(),
        address,
        education,
        experience,
        profileImage,
        isClassIncharge: isClassIncharge || false,
        inchargeClass: isClassIncharge ? inchargeClass : null,
        inchargeSection: isClassIncharge ? inchargeSection : null,
        schoolId: parseInt(schoolId),
        status: 'active',
      },
    });

    const formattedTeacher = {
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
      classes, 
      sections, 
      joinDate, 
      address, 
      education, 
      experience, 
      profileImage, 
      isClassIncharge, 
      inchargeClass, 
      inchargeSection, 
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
        classes,
        sections: JSON.stringify(sections),
        joining_year: joinDate ? new Date(joinDate) : existingTeacher.joining_year,
        address,
        education,
        experience,
        profileImage,
        isClassIncharge: isClassIncharge || false,
        inchargeClass: isClassIncharge ? inchargeClass : null,
        inchargeSection: isClassIncharge ? inchargeSection : null,
        status,
      },
    });

    const formattedTeacher = {
      id: updatedTeacher.id,
      fullName: updatedTeacher.fullName,
      email: updatedTeacher.email,
      phone: updatedTeacher.phone,
      designation: updatedTeacher.designation || 'Teacher',
      subjects: JSON.parse(updatedTeacher.subjects || '[]'),
      classes: updatedTeacher.classes,
      sections: JSON.parse(updatedTeacher.sections || '[]'),
      joinDate: updatedTeacher.joining_year.toISOString().split('T')[0],
      address: updatedTeacher.address || '',
      education: updatedTeacher.education || '',
      experience: updatedTeacher.experience,
      profileImage: updatedTeacher.profileImage || 'https://randomuser.me/api/portraits/men/0.jpg',
      isClassIncharge: updatedTeacher.isClassIncharge,
      inchargeClass: updatedTeacher.inchargeClass,
      inchargeSection: updatedTeacher.inchargeSection,
      status: updatedTeacher.status,
      schoolId: updatedTeacher.schoolId,
      username: updatedTeacher.username
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