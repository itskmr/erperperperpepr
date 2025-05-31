import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { getSchoolIdFromContext } from '../middlewares/authMiddleware.js';

const prisma = new PrismaClient();

// Get all timetable entries with authentication and school context
export const getAllTimetable = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    // Build where clause based on user role
    let whereClause = {
      teacher: {
        schoolId: schoolId // Filter by school through teacher relationship
      }
    };
    
    // Allow admins to see timetables from specific schools or all schools
    if (req.user?.role === 'admin') {
      if (req.query.schoolId) {
        whereClause.teacher.schoolId = parseInt(req.query.schoolId);
      } else if (req.query.all === 'true') {
        whereClause = {}; // Admin can see all timetables across schools
      }
    }

    // Add additional filters from query parameters
    const { className, section, teacherId, day } = req.query;
    
    if (className) {
      whereClause.className = className;
    }
    
    if (section) {
      whereClause.section = section;
    }
    
    if (teacherId) {
      whereClause.teacherId = teacherId;
      // For non-admin users, ensure teacher belongs to their school
      if (req.user?.role !== 'admin') {
        whereClause.teacher = {
          id: teacherId,
          schoolId: schoolId
        };
      }
    }
    
    if (day) {
      whereClause.day = day;
    }

    const timetable = await prisma.timetable.findMany({
      where: whereClause,
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            designation: true,
            schoolId: true,
            school: {
              select: {
                id: true,
                schoolName: true,
                code: true
              }
            }
          }
        }
      },
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' }
      ]
    });

    res.status(200).json({
      success: true,
      message: "Timetable retrieved successfully",
      count: timetable.length,
      data: timetable,
      meta: {
        schoolId: whereClause.teacher?.schoolId || schoolId,
        userRole: req.user?.role,
        filters: {
          className: className || 'all',
          section: section || 'all',
          teacherId: teacherId || 'all',
          day: day || 'all'
        }
      }
    });
  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch timetable",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Get timetable by class and section with school context
export const getTimetableByClassSection = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { className, section } = req.params;

    // Build where clause with school context
    let whereClause = {
      className: className,
      section: section,
      teacher: {
        schoolId: schoolId
      }
    };
    
    // Allow admins to access any school's timetable
    if (req.user?.role === 'admin' && req.query.schoolId) {
      whereClause.teacher.schoolId = parseInt(req.query.schoolId);
    }

    const timetable = await prisma.timetable.findMany({
      where: whereClause,
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            designation: true,
            subjects: true,
            school: {
              select: {
                id: true,
                schoolName: true,
                code: true
              }
            }
          }
        }
      },
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' }
      ]
    });

    res.status(200).json({
      success: true,
      message: `Timetable retrieved successfully for ${className} - ${section}`,
      count: timetable.length,
      data: timetable,
      meta: {
        className: className,
        section: section,
        schoolId: schoolId,
        userRole: req.user?.role
      }
    });
  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch timetable",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Create new timetable entry with school context validation
export const createTimetableEntry = async (req, res) => {
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
      className,
      section,
      subjectName,
      teacherId,
      day,
      startTime,
      endTime,
      roomNumber
    } = req.body;

    // Validate required fields
    if (!className || !teacherId || !day || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Please provide className, teacherId, day, startTime, and endTime"
      });
    }

    // Verify teacher exists and belongs to the same school
    const teacher = await prisma.teacher.findFirst({
      where: {
        id: teacherId,
        schoolId: schoolId
      },
      select: {
        id: true,
        fullName: true,
        schoolId: true,
        school: {
          select: {
            id: true,
            schoolName: true,
            status: true
          }
        }
      }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found in your school"
      });
    }

    if (teacher.school.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: "School is inactive. Contact administrator."
      });
    }

    // Check for time slot conflicts within the same school
    const conflictingEntry = await prisma.timetable.findFirst({
      where: {
        className,
        section: section || '',
        day,
        teacher: {
          schoolId: schoolId
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          }
        ]
      }
    });

    if (conflictingEntry) {
      return res.status(400).json({
        success: false,
        message: "Time slot conflicts with existing entry for this class"
      });
    }

    // Check for teacher conflicts (same teacher, same time, same day)
    const teacherConflict = await prisma.timetable.findFirst({
      where: {
        teacherId,
        day,
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          }
        ]
      }
    });

    if (teacherConflict) {
      return res.status(400).json({
        success: false,
        message: "Teacher is already assigned to another class at this time"
      });
    }

    const timetableEntry = await prisma.timetable.create({
      data: {
        id: uuidv4(),
        className,
        section: section || '',
        subjectName: subjectName || '',
        teacherId,
        day,
        startTime,
        endTime,
        roomNumber
      },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            designation: true,
            school: {
              select: {
                id: true,
                schoolName: true,
                code: true
              }
            }
          }
        }
      }
    });

    // Log the activity for production
    try {
      if (process.env.NODE_ENV === 'production') {
        await prisma.activityLog.create({
          data: {
            action: 'TIMETABLE_ENTRY_CREATED',
            entityType: 'TIMETABLE',
            entityId: timetableEntry.id,
            userId: req.user?.id,
            userRole: req.user?.role,
            schoolId: schoolId,
            details: `Timetable entry created for ${className} - ${subjectName} on ${day} (${startTime}-${endTime})`,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent']
          }
        });
      }
    } catch (logError) {
      console.error('Failed to log timetable creation activity:', logError);
    }

    res.status(201).json({
      success: true,
      message: "Timetable entry created successfully",
      data: timetableEntry
    });
  } catch (error) {
    console.error("Error creating timetable entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create timetable entry",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Update timetable entry
export const updateTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      classId,
      sectionId,
      subjectId,
      teacherId,
      day,
      startTime,
      endTime,
      roomNumber
    } = req.body;

    // Check if entry exists
    const existingEntry = await prisma.timetable.findUnique({
      where: { id }
    });

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found"
      });
    }

    // Check for time slot conflicts (excluding current entry)
    const conflictingEntry = await prisma.timetable.findFirst({
      where: {
        id: { not: id },
        classId,
        sectionId,
        day,
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          }
        ]
      }
    });

    if (conflictingEntry) {
      return res.status(400).json({
        success: false,
        message: "Time slot conflicts with existing entry"
      });
    }

    const updatedEntry = await prisma.timetable.update({
      where: { id },
      data: {
        classId,
        sectionId,
        subjectId,
        teacherId,
        day,
        startTime,
        endTime,
        roomNumber
      }
    });

    res.status(200).json({
      success: true,
      data: updatedEntry
    });
  } catch (error) {
    console.error("Error updating timetable entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update timetable entry",
      error: error.message
    });
  }
};

// Delete timetable entry
export const deleteTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if entry exists
    const existingEntry = await prisma.timetable.findUnique({
      where: { id }
    });

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found"
      });
    }

    await prisma.timetable.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: "Timetable entry deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting timetable entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete timetable entry",
      error: error.message
    });
  }
};

// Get classes
export const getClasses = async (req, res) => {
  try {
    const classes = await prisma.sessionInfo.findMany({
      select: {
        currentClass: true
      },
      distinct: ['currentClass'],
      where: {
        currentClass: {
          not: null
        }
      }
    });

    const formattedClasses = classes.map(cls => ({
      id: cls.currentClass,
      name: cls.currentClass
    }));

    res.status(200).json({
      success: true,
      data: formattedClasses
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch classes",
      error: error.message
    });
  }
};

// Get sections by class
export const getSectionsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const sections = await prisma.sessionInfo.findMany({
      select: {
        currentSection: true
      },
      distinct: ['currentSection'],
      where: {
        currentClass: classId,
        currentSection: {
          not: null
        }
      }
    });

    const formattedSections = sections.map(section => ({
      id: section.currentSection,
      name: section.currentSection
    }));

    res.status(200).json({
      success: true,
      data: formattedSections
    });
  } catch (error) {
    console.error("Error fetching sections:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sections",
      error: error.message
    });
  }
}; 