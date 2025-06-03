import { PrismaClient } from "@prisma/client";
import { getSchoolIdFromContext } from "../middlewares/authMiddleware.js";
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

/**
 * Get school profile information
 * Returns complete school profile scoped by authenticated school's ID
 */
export const getSchoolProfile = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    // Fetch school profile with all relevant information
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        schoolName: true,
        email: true,
        code: true,
        address: true,
        contact: true,
        phone: true,
        principal: true,
        image_url: true,
        established: true,
        affiliate: true,
        affiliateNo: true,
        website: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        // Get counts for statistics
        _count: {
          select: {
            students: true,
            teachers: true,
            buses: true,
            routes: true
          }
        }
      }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found"
      });
    }

    // Format the response to match frontend expectations
    const formattedSchool = {
      id: school.id,
      schoolName: school.schoolName,
      email: school.email,
      code: school.code,
      address: school.address,
      contact: school.contact ? school.contact.toString() : "0", // Convert BigInt to string
      phone: school.phone,
      principal: school.principal,
      image_url: school.image_url,
      established: school.established,
      affiliate: school.affiliate,
      affiliateNo: school.affiliateNo,
      website: school.website,
      status: school.status,
      lastLogin: school.lastLogin,
      createdAt: school.createdAt,
      updatedAt: school.updatedAt,
      statistics: {
        totalStudents: school._count.students,
        totalTeachers: school._count.teachers,
        totalBuses: school._count.buses,
        totalRoutes: school._count.routes
      }
    };

    return res.status(200).json({
      success: true,
      data: formattedSchool,
      message: "School profile retrieved successfully"
    });

  } catch (error) {
    console.error("Error fetching school profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch school profile",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Update school profile information
 * Updates school profile scoped by authenticated school's ID
 */
export const updateSchoolProfile = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    // Extract updateable fields from request body
    const {
      schoolName,
      email,
      address,
      contact,
      phone,
      principal,
      image_url,
      established,
      affiliate,
      affiliateNo,
      website
    } = req.body;

    // Validate required fields
    if (!schoolName || !email) {
      return res.status(400).json({
        success: false,
        message: "School name and email are required fields"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Validate phone number format if provided
    if (phone && !/^\d{10,15}$/.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid phone number"
      });
    }

    // Validate contact number format if provided
    if (contact && !/^\d{10,15}$/.test(contact.toString().replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid contact number"
      });
    }

    // Validate website URL format if provided
    if (website && website.trim() && !/(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(website)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid website URL"
      });
    }

    // Validate establishment year
    const currentYear = new Date().getFullYear();
    if (established && (established < 1800 || established > currentYear)) {
      return res.status(400).json({
        success: false,
        message: `Establishment year must be between 1800 and ${currentYear}`
      });
    }

    // Check if email is already used by another school
    const existingSchool = await prisma.school.findFirst({
      where: {
        email: email,
        id: { not: schoolId }
      }
    });

    if (existingSchool) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered with another school"
      });
    }

    // Prepare update data
    const updateData = {
      schoolName: schoolName.trim(),
      email: email.trim().toLowerCase(),
      address: address?.trim() || undefined,
      phone: phone?.trim() || undefined,
      principal: principal?.trim() || undefined,
      image_url: image_url?.trim() || undefined,
      established: established ? parseInt(established) : undefined,
      affiliate: affiliate?.trim() || undefined,
      affiliateNo: affiliateNo?.trim() || undefined,
      website: website?.trim() || undefined,
      updatedAt: new Date()
    };

    // Handle contact number conversion to BigInt
    if (contact) {
      updateData.contact = BigInt(contact.toString().replace(/\D/g, ''));
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Update school profile
    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: updateData,
      select: {
        id: true,
        schoolName: true,
        email: true,
        code: true,
        address: true,
        contact: true,
        phone: true,
        principal: true,
        image_url: true,
        established: true,
        affiliate: true,
        affiliateNo: true,
        website: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            students: true,
            teachers: true,
            departments: true,
            buses: true,
            routes: true
          }
        }
      }
    });

    // Format the response
    const formattedSchool = {
      id: updatedSchool.id,
      schoolName: updatedSchool.schoolName,
      email: updatedSchool.email,
      code: updatedSchool.code,
      address: updatedSchool.address,
      contact: updatedSchool.contact ? updatedSchool.contact.toString() : "0",
      phone: updatedSchool.phone,
      principal: updatedSchool.principal,
      image_url: updatedSchool.image_url,
      established: updatedSchool.established,
      affiliate: updatedSchool.affiliate,
      affiliateNo: updatedSchool.affiliateNo,
      website: updatedSchool.website,
      status: updatedSchool.status,
      lastLogin: updatedSchool.lastLogin,
      createdAt: updatedSchool.createdAt,
      updatedAt: updatedSchool.updatedAt,
      statistics: {
        totalStudents: updatedSchool._count.students,
        totalTeachers: updatedSchool._count.teachers,
        totalDepartments: updatedSchool._count.departments,
        totalBuses: updatedSchool._count.buses,
        totalRoutes: updatedSchool._count.routes
      }
    };

    return res.status(200).json({
      success: true,
      data: formattedSchool,
      message: "School profile updated successfully"
    });

  } catch (error) {
    console.error("Error updating school profile:", error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "Email or code already exists. Please use different values."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update school profile",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Upload school logo/image
 * Handles actual file upload for school profile
 */
export const uploadSchoolImage = async (req, res) => {
  try {
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required"
      });
    }

    // Check if file was uploaded
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded. Please select an image file."
      });
    }

    // Validate file type (should be handled by multer, but double-check)
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      // Remove the uploaded file if it's invalid
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting invalid file:', err);
      });
      
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only JPEG, PNG, and GIF images are allowed."
      });
    }

    // Get current school to check for existing image
    const currentSchool = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { image_url: true, schoolName: true }
    });

    // Delete old image file if it exists
    if (currentSchool?.image_url) {
      const oldImagePath = path.join(process.cwd(), currentSchool.image_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error('Error deleting old image file:', err);
        });
      }
    }

    // Create the relative path for database storage
    const relativeImagePath = path.relative(process.cwd(), file.path).replace(/\\/g, '/');

    // Update school image in database
    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: { 
        image_url: relativeImagePath,
        updatedAt: new Date()
      },
      select: {
        id: true,
        schoolName: true,
        image_url: true
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        id: updatedSchool.id,
        schoolName: updatedSchool.schoolName,
        image_url: updatedSchool.image_url,
        imageUrl: `${req.protocol}://${req.get('host')}/${relativeImagePath}` // Full URL for frontend
      },
      message: "School image updated successfully"
    });

  } catch (error) {
    console.error("Error uploading school image:", error);
    
    // Clean up uploaded file on error
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file on error:', err);
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Failed to upload school image",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 