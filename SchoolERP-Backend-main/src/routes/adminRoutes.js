import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const router = express.Router();
const prisma = new PrismaClient();

// GET all users (combined from Admin, School, Teacher)
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get users from all three tables
    const [admins, schools, teachers] = await Promise.all([
      prisma.admin.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          username: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          lastLogin: true,
          createdAt: true
        }
      }),
      prisma.school.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          username: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          lastLogin: true,
          createdAt: true
        }
      }),
      prisma.teacher.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          username: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          lastLogin: true,
          createdAt: true
        }
      })
    ]);
    
    // Transform and combine results
    const formattedAdmins = admins.map(admin => ({
      id: admin.id,
      name: admin.fullName,
      username: admin.username,
      email: admin.email,
      phone: admin.phone,
      role: admin.role.toLowerCase(),
      status: admin.status,
      lastLogin: admin.lastLogin ? admin.lastLogin.toISOString() : null,
      createdAt: admin.createdAt.toISOString().split('T')[0],
      userType: 'admin'
    }));
    
    const formattedSchools = schools.map(school => ({
      id: school.id,
      name: school.fullName,
      username: school.username,
      email: school.email,
      phone: school.phone,
      role: school.role.toLowerCase(),
      status: school.status,
      lastLogin: school.lastLogin ? school.lastLogin.toISOString() : null,
      createdAt: school.createdAt.toISOString().split('T')[0],
      userType: 'school'
    }));
    
    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      name: teacher.fullName,
      username: teacher.username,
      email: teacher.email,
      phone: teacher.phone,
      role: teacher.role.toLowerCase(),
      status: teacher.status,
      lastLogin: teacher.lastLogin ? teacher.lastLogin.toISOString() : null,
      createdAt: teacher.createdAt.toISOString().split('T')[0],
      userType: 'teacher'
    }));
    
    // Combine all users
    const allUsers = [...formattedAdmins, ...formattedSchools, ...formattedTeachers];
    
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Add a new user
router.post('/users/add', async (req, res) => {
  try {
    const { name, username, email, phone, role, password } = req.body;
    
    // Check if email already exists in any table
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    const existingSchool = await prisma.school.findUnique({ where: { email } });
    const existingTeacher = await prisma.teacher.findUnique({ where: { email } });
    
    if (existingAdmin || existingSchool || existingTeacher) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    let newUser;
    
    // Create user based on role
    switch (role.toUpperCase()) {
      case 'ADMIN':
        newUser = await prisma.admin.create({
          data: {
            fullName: name,
            username,
            email,
            phone,
            password: hashedPassword,
            role: 'ADMIN',
            status: 'active'
          }
        });
        break;
        
      case 'SCHOOL':
        newUser = await prisma.school.create({
          data: {
            fullName: name,
            username,
            email,
            phone,
            password: hashedPassword,
            role: 'SCHOOL',
            status: 'active'
          }
        });
        break;
        
      case 'TEACHER':
        // For teachers, we need a schoolId
        // For simplicity, assign to the first school or create a default school
        let school = await prisma.school.findFirst();
        
        if (!school) {
          school = await prisma.school.create({
            data: {
              fullName: 'Default School',
              email: 'default@school.com',
              password: hashedPassword,
              username: 'defaultschool'
            }
          });
        }
        
        newUser = await prisma.teacher.create({
          data: {
            fullName: name,
            username,
            email,
            phone,
            password: hashedPassword,
            role: 'TEACHER',
            status: 'active',
            class: '',
            subjects: '',
            schoolId: school.id
          }
        });
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid user role' });
    }
    
    res.status(201).json({
      id: newUser.id,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update existing user
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, email, phone, role, userType } = req.body;
    
    // Determine which table to update based on userType
    let updatedUser;
    switch (userType.toLowerCase()) {
      case 'admin':
        updatedUser = await prisma.admin.update({
          where: { id: parseInt(id) },
          data: {
            fullName: name,
            username,
            email,
            phone
          }
        });
        break;
        
      case 'school':
        updatedUser = await prisma.school.update({
          where: { id: parseInt(id) },
          data: {
            fullName: name,
            username,
            email,
            phone
          }
        });
        break;
        
      case 'teacher':
        updatedUser = await prisma.teacher.update({
          where: { id: parseInt(id) },
          data: {
            fullName: name,
            username,
            email,
            phone
          }
        });
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid user type' });
    }
    
    res.json({ 
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userType } = req.body;
    
    // Determine which table to delete from based on userType
    switch (userType.toLowerCase()) {
      case 'admin':
        await prisma.admin.delete({
          where: { id: parseInt(id) }
        });
        break;
        
      case 'school':
        await prisma.school.delete({
          where: { id: parseInt(id) }
        });
        break;
        
      case 'teacher':
        await prisma.teacher.delete({
          where: { id: parseInt(id) }
        });
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid user type' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update user status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, userType } = req.body;
    
    // Determine which table to update based on userType
    switch (userType.toLowerCase()) {
      case 'admin':
        await prisma.admin.update({
          where: { id: parseInt(id) },
          data: { status }
        });
        break;
        
      case 'school':
        await prisma.school.update({
          where: { id: parseInt(id) },
          data: { status }
        });
        break;
        
      case 'teacher':
        await prisma.teacher.update({
          where: { id: parseInt(id) },
          data: { status }
        });
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid user type' });
    }
    
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

export default router;