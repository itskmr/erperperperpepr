import { PrismaClient } from '@prisma/client';
import { getSchoolIdFromContext } from '../middlewares/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'teacher-diary');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];

  if (file.fieldname === 'images' && allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (file.fieldname === 'attachments' && allowedDocumentTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Please upload valid images or documents.`), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files per request
  }
});

// Helper function to construct full file URLs
const constructFileUrl = (filePath, req) => {
  if (!filePath) return null;
  
  // If it's already a full URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // If it starts with uploads/ remove the leading /
  const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  
  // Construct full URL
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/${cleanPath}`;
};

// Helper function to process entries and convert file paths to URLs
const processEntryUrls = (entry, req) => {
  const processedEntry = { ...entry };
  
  // Process attachments
  if (processedEntry.attachments) {
    try {
      const attachments = typeof processedEntry.attachments === 'string' 
        ? JSON.parse(processedEntry.attachments) 
        : processedEntry.attachments;
      
      processedEntry.attachments = Array.isArray(attachments) 
        ? attachments.map(path => constructFileUrl(path, req))
        : [];
    } catch (e) {
      console.error('Error parsing attachments for entry', entry.id, ':', e);
      processedEntry.attachments = [];
    }
  } else {
    processedEntry.attachments = [];
  }

  // Process imageUrls
  if (processedEntry.imageUrls) {
    try {
      const imageUrls = typeof processedEntry.imageUrls === 'string' 
        ? JSON.parse(processedEntry.imageUrls) 
        : processedEntry.imageUrls;
      
      processedEntry.imageUrls = Array.isArray(imageUrls) 
        ? imageUrls.map(path => constructFileUrl(path, req))
        : [];
    } catch (e) {
      console.error('Error parsing imageUrls for entry', entry.id, ':', e);
      processedEntry.imageUrls = [];
    }
  } else {
    processedEntry.imageUrls = [];
  }

  return processedEntry;
};

/**
 * Get all diary entries for a teacher with filtering and pagination
 * Role: TEACHER (own entries only)
 */
export const getTeacherDiaryEntries = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    // Get pagination and filtering parameters
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate, 
      className, 
      section, 
      subject, 
      entryType,
      priority 
    } = req.query;
    
    const skip = (page - 1) * limit;

    // Build filter conditions
    const whereConditions = {
      schoolId: schoolId,
      teacherId: req.user.id, // Teachers can only access their own entries
    };

    // Add date range filter
    if (startDate || endDate) {
      whereConditions.date = {};
      if (startDate) whereConditions.date.gte = new Date(startDate);
      if (endDate) whereConditions.date.lte = new Date(endDate);
    }

    // Add other filters
    if (className) whereConditions.className = className;
    if (section) whereConditions.section = section;
    if (subject) whereConditions.subject = subject;
    if (entryType) whereConditions.entryType = entryType;
    if (priority) whereConditions.priority = priority;

    // Get total count for pagination
    const totalEntries = await prisma.teacherDiary.count({
      where: whereConditions
    });

    // Get diary entries with pagination
    const diaryEntries = await prisma.teacherDiary.findMany({
      where: whereConditions,
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
            designation: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    // Parse JSON fields for each entry
    const processedEntries = diaryEntries.map(entry => processEntryUrls(entry, req));

    const totalPages = Math.ceil(totalEntries / limit);

    return res.status(200).json({
      success: true,
      message: "Teacher diary entries retrieved successfully",
      data: {
        entries: processedEntries,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalEntries,
          limit: parseInt(limit),
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Error fetching teacher diary entries:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch teacher diary entries",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get diary entries for students/parents view (read-only)
 * Role: STUDENT, PARENT, SCHOOL
 */
export const getDiaryEntriesForView = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate, 
      className, 
      section, 
      subject,
      teacherId 
    } = req.query;
    
    const skip = (page - 1) * limit;

    // Get user role/type (handle both role and type fields, case-insensitive)
    const userRole = (req.user.role || req.user.type || '').toUpperCase();
    
    console.log('User authentication info:', {
      userId: req.user.id,
      userRole,
      originalRole: req.user.role,
      originalType: req.user.type,
      schoolId
    });

    // Build filter conditions based on user role
    const whereConditions = {
      schoolId: schoolId,
      isPublic: true // Only show public entries
    };

    // Role-based filtering
    if (userRole === 'STUDENT' || userRole === 'PARENT') {
      // Students and parents can only see entries for their class/section
      if (!className || !section) {
        console.log('Missing className or section for student/parent access:', { className, section });
        return res.status(400).json({
          success: false,
          message: "Class and section are required for student/parent access"
        });
      }
      whereConditions.className = className;
      whereConditions.section = section;
      console.log('Applied student/parent filters:', { className, section });
    } else if (userRole === 'SCHOOL' || userRole === 'TEACHER') {
      // School admin and teachers can see all entries for their school (with optional filters)
      if (className) whereConditions.className = className;
      if (section) whereConditions.section = section;
      if (teacherId) whereConditions.teacherId = parseInt(teacherId);
      console.log('Applied school/teacher filters:', { className, section, teacherId });
    } else {
      console.log('Unknown user role:', userRole);
      return res.status(403).json({
        success: false,
        message: "Access denied. Invalid user role."
      });
    }

    // Add date range filter
    if (startDate || endDate) {
      whereConditions.date = {};
      if (startDate) whereConditions.date.gte = new Date(startDate);
      if (endDate) whereConditions.date.lte = new Date(endDate);
    }

    // Add subject filter
    if (subject) whereConditions.subject = subject;

    console.log('Final where conditions:', whereConditions);

    // Get total count
    const totalEntries = await prisma.teacherDiary.count({
      where: whereConditions
    });

    // Get diary entries
    const diaryEntries = await prisma.teacherDiary.findMany({
      where: whereConditions,
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            designation: true,
            subjects: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    // Parse JSON fields for each entry
    const processedEntries = diaryEntries.map(entry => processEntryUrls(entry, req));

    const totalPages = Math.ceil(totalEntries / limit);

    console.log('Retrieved diary entries:', {
      totalEntries,
      currentPageEntries: processedEntries.length,
      currentPage: page,
      totalPages
    });

    return res.status(200).json({
      success: true,
      message: "Diary entries retrieved successfully",
      data: {
        entries: processedEntries,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalEntries,
          limit: parseInt(limit),
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Error fetching diary entries for view:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch diary entries",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Create a new diary entry
 * Role: TEACHER only
 */
export const createDiaryEntry = async (req, res) => {
  try {
    // Check if user is a teacher (handle both uppercase and lowercase)
    const userRole = req.user.role?.toUpperCase();
    if (userRole !== 'TEACHER') {
      console.log(`Access denied for role: ${req.user.role} (converted to: ${userRole})`);
      return res.status(403).json({
        success: false,
        message: "Only teachers can create diary entries"
      });
    }

    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const {
      title,
      content,
      date,
      className,
      section,
      subject,
      period,
      entryType = 'GENERAL',
      homework,
      classSummary,
      notices,
      remarks,
      isPublic = true,
      priority = 'NORMAL',
      attachments,
      imageUrls
    } = req.body;

    // Validation
    if (!title || !content || !date || !className || !section || !subject) {
      return res.status(400).json({
        success: false,
        message: "Title, content, date, class name, section, and subject are required"
      });
    }

    // Check for duplicate entry (same teacher, date, class, section, subject, period)
    const existingEntry = await prisma.teacherDiary.findFirst({
      where: {
        teacherId: req.user.id,
        date: new Date(date),
        className,
        section,
        subject,
        period: period || null,
        schoolId
      }
    });

    if (existingEntry) {
      return res.status(409).json({
        success: false,
        message: "A diary entry already exists for this date, class, section, subject, and period"
      });
    }

    // Create diary entry
    const diaryEntry = await prisma.teacherDiary.create({
      data: {
        title,
        content,
        date: new Date(date),
        className,
        section,
        subject,
        period,
        entryType,
        homework,
        classSummary,
        notices,
        remarks,
        isPublic,
        priority,
        attachments: attachments ? JSON.stringify(attachments) : null,
        imageUrls: imageUrls ? JSON.stringify(imageUrls) : null,
        schoolId,
        teacherId: req.user.id
      },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
            designation: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: "Diary entry created successfully",
      data: {
        entry: diaryEntry
      }
    });

  } catch (error) {
    console.error("Error creating diary entry:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create diary entry",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Update a diary entry
 * Role: TEACHER (own entries only)
 */
export const updateDiaryEntry = async (req, res) => {
  try {
    // Check if user is a teacher (handle both uppercase and lowercase)
    const userRole = req.user.role?.toUpperCase();
    if (userRole !== 'TEACHER') {
      console.log(`Access denied for role: ${req.user.role} (converted to: ${userRole})`);
      return res.status(403).json({
        success: false,
        message: "Only teachers can update diary entries"
      });
    }

    const { id } = req.params;
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    // Check if entry exists and belongs to the teacher
    const existingEntry = await prisma.teacherDiary.findFirst({
      where: {
        id: parseInt(id),
        teacherId: req.user.id,
        schoolId
      }
    });

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: "Diary entry not found or you don't have permission to update it"
      });
    }

    const {
      title,
      content,
      date,
      className,
      section,
      subject,
      period,
      entryType,
      homework,
      classSummary,
      notices,
      remarks,
      isPublic,
      priority,
      attachments,
      imageUrls
    } = req.body;

    // Build update data (only include provided fields)
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (date !== undefined) updateData.date = new Date(date);
    if (className !== undefined) updateData.className = className;
    if (section !== undefined) updateData.section = section;
    if (subject !== undefined) updateData.subject = subject;
    if (period !== undefined) updateData.period = period;
    if (entryType !== undefined) updateData.entryType = entryType;
    if (homework !== undefined) updateData.homework = homework;
    if (classSummary !== undefined) updateData.classSummary = classSummary;
    if (notices !== undefined) updateData.notices = notices;
    if (remarks !== undefined) updateData.remarks = remarks;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (priority !== undefined) updateData.priority = priority;
    if (attachments !== undefined) updateData.attachments = attachments ? JSON.stringify(attachments) : null;
    if (imageUrls !== undefined) updateData.imageUrls = imageUrls ? JSON.stringify(imageUrls) : null;

    // Update the entry
    const updatedEntry = await prisma.teacherDiary.update({
      where: {
        id: parseInt(id)
      },
      data: updateData,
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
            designation: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Diary entry updated successfully",
      data: {
        entry: updatedEntry
      }
    });

  } catch (error) {
    console.error("Error updating diary entry:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update diary entry",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Delete a diary entry
 * Role: TEACHER (own entries only)
 */
export const deleteDiaryEntry = async (req, res) => {
  try {
    // Check if user is a teacher (handle both uppercase and lowercase)
    const userRole = req.user.role?.toUpperCase();
    if (userRole !== 'TEACHER') {
      console.log(`Access denied for role: ${req.user.role} (converted to: ${userRole})`);
      return res.status(403).json({
        success: false,
        message: "Only teachers can delete diary entries"
      });
    }

    const { id } = req.params;
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    // Check if entry exists and belongs to the teacher
    const existingEntry = await prisma.teacherDiary.findFirst({
      where: {
        id: parseInt(id),
        teacherId: req.user.id,
        schoolId
      }
    });

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: "Diary entry not found or you don't have permission to delete it"
      });
    }

    // Delete the entry
    await prisma.teacherDiary.delete({
      where: {
        id: parseInt(id)
      }
    });

    return res.status(200).json({
      success: true,
      message: "Diary entry deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting diary entry:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete diary entry",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get a single diary entry by ID
 * Role: TEACHER (own entries), STUDENT/PARENT/SCHOOL (public entries only)
 */
export const getDiaryEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    // Build where conditions based on user role
    const whereConditions = {
      id: parseInt(id),
      schoolId
    };

    const userRole = req.user.role?.toUpperCase();
    if (userRole === 'TEACHER') {
      // Teachers can only see their own entries
      whereConditions.teacherId = req.user.id;
    } else {
      // Students, parents, and school admin can only see public entries
      whereConditions.isPublic = true;
    }

    const diaryEntry = await prisma.teacherDiary.findFirst({
      where: whereConditions,
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
            designation: true,
            subjects: true
          }
        }
      }
    });

    if (!diaryEntry) {
      return res.status(404).json({
        success: false,
        message: "Diary entry not found or you don't have permission to view it"
      });
    }

    // Parse JSON fields
    const processedEntry = processEntryUrls(diaryEntry, req);

    return res.status(200).json({
      success: true,
      message: "Diary entry retrieved successfully",
      data: {
        entry: processedEntry
      }
    });

  } catch (error) {
    console.error("Error fetching diary entry:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch diary entry",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get diary statistics and summary
 * Role: TEACHER, SCHOOL
 */
export const getDiaryStats = async (req, res) => {
  try {
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { startDate, endDate, teacherId } = req.query;

    // Build base conditions
    const whereConditions = { schoolId };

    // Role-based filtering
    const userRole2 = req.user.role?.toUpperCase();
    if (userRole2 === 'TEACHER') {
      whereConditions.teacherId = req.user.id;
    } else if (userRole2 === 'SCHOOL' && teacherId) {
      whereConditions.teacherId = parseInt(teacherId);
    }

    // Add date range if provided
    if (startDate || endDate) {
      whereConditions.date = {};
      if (startDate) whereConditions.date.gte = new Date(startDate);
      if (endDate) whereConditions.date.lte = new Date(endDate);
    }

    // Get various statistics
    const [
      totalEntries,
      entriesByType,
      entriesByPriority,
      recentEntries
    ] = await Promise.all([
      // Total entries count
      prisma.teacherDiary.count({ where: whereConditions }),
      
      // Entries by type
      prisma.teacherDiary.groupBy({
        by: ['entryType'],
        where: whereConditions,
        _count: { id: true }
      }),
      
      // Entries by priority
      prisma.teacherDiary.groupBy({
        by: ['priority'],
        where: whereConditions,
        _count: { id: true }
      }),
      
      // Recent entries (last 5)
      prisma.teacherDiary.findMany({
        where: whereConditions,
        include: {
          teacher: {
            select: {
              id: true,
              fullName: true,
              designation: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    return res.status(200).json({
      success: true,
      message: "Diary statistics retrieved successfully",
      data: {
        totalEntries,
        entriesByType: entriesByType.map(item => ({
          type: item.entryType,
          count: item._count.id
        })),
        entriesByPriority: entriesByPriority.map(item => ({
          priority: item.priority,
          count: item._count.id
        })),
        recentEntries
      }
    });

  } catch (error) {
    console.error("Error fetching diary statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch diary statistics",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get available classes and sections for dropdown
 * Role: ALL
 */
export const getClassesAndSections = async (req, res) => {
  try {
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    // Get unique classes and sections from diary entries
    const classesData = await prisma.teacherDiary.findMany({
      where: { schoolId },
      select: {
        className: true,
        section: true
      },
      distinct: ['className', 'section']
    });

    // Group by className
    const classesMap = {};
    classesData.forEach(item => {
      if (!classesMap[item.className]) {
        classesMap[item.className] = new Set();
      }
      classesMap[item.className].add(item.section);
    });

    // Convert to array format
    const classes = Object.keys(classesMap).map(className => ({
      className,
      sections: Array.from(classesMap[className]).sort()
    })).sort();

    return res.status(200).json({
      success: true,
      message: "Classes and sections retrieved successfully",
      data: {
        classes
      }
    });

  } catch (error) {
    console.error("Error fetching classes and sections:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch classes and sections",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Health check endpoint
 */
export const healthCheck = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Teacher Diary API is running",
      timestamp: new Date().toISOString(),
      endpoints: {
        "GET /teacher/entries": "Get teacher diary entries (teachers only)",
        "GET /view": "View diary entries (students, parents, school)",
        "POST /create": "Create diary entry (teachers only)",
        "PUT /update/:id": "Update diary entry (teachers only)",
        "DELETE /delete/:id": "Delete diary entry (teachers only)",
        "GET /entry/:id": "Get single diary entry",
        "GET /stats": "Get diary statistics",
        "GET /classes": "Get available classes and sections"
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error.message
    });
  }
};

/**
 * Upload files for teacher diary
 * Role: TEACHER only
 */
export const uploadFiles = async (req, res) => {
  try {
    // Check if user is a teacher
    const userRole = req.user.role?.toUpperCase();
    if (userRole !== 'TEACHER') {
      return res.status(403).json({
        success: false,
        message: "Only teachers can upload files"
      });
    }

    const uploadedFiles = {
      images: [],
      attachments: []
    };

    // Get base URL for constructing full URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Process uploaded files
    if (req.files) {
      if (req.files.images) {
        uploadedFiles.images = req.files.images.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          path: `${baseUrl}/uploads/teacher-diary/${file.filename}`,
          relativePath: `/uploads/teacher-diary/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype
        }));
      }

      if (req.files.attachments) {
        uploadedFiles.attachments = req.files.attachments.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          path: `${baseUrl}/uploads/teacher-diary/${file.filename}`,
          relativePath: `/uploads/teacher-diary/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype
        }));
      }
    }

    return res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      data: uploadedFiles
    });

  } catch (error) {
    console.error("Error uploading files:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload files",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
}; 