import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const router = express.Router();
const prisma = new PrismaClient();

// GET a school by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const school = await prisma.school.findUnique({
      where: { id: parseInt(id) },
    });

    if (!school) {
      return res.status(404).json({ 
        success: false, 
        message: 'School not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: {
        id: school.id,
        name: school.name,
        address: school.address,
        contactNumber: school.contactNumber,
        email: school.email,
        principalName: school.principalName,
        status: school.status
      }
    });
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch school', 
      error: error.message 
    });
  }
});

// POST create a new school
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      address, 
      contactNumber, 
      email, 
      principalName 
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and email are required fields' 
      });
    }

    // Check if email already exists
    const existingSchool = await prisma.school.findUnique({
      where: { email },
    });

    if (existingSchool) {
      return res.status(400).json({ 
        success: false, 
        message: 'School with this email already exists' 
      });
    }

    // Create the school
    const school = await prisma.school.create({
      data: {
        name,
        address: address || '',
        contactNumber: contactNumber || '',
        email,
        principalName: principalName || '',
        status: 'active'
      },
    });

    res.status(201).json({ 
      success: true, 
      data: {
        id: school.id,
        name: school.name,
        address: school.address,
        contactNumber: school.contactNumber,
        email: school.email,
        principalName: school.principalName,
        status: school.status
      }
    });
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create school', 
      error: error.message 
    });
  }
});

export default router; 