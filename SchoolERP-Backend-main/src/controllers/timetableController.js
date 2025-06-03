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

    // Build where clause based on user role - now using direct schoolId
    let whereClause = {
      schoolId: schoolId // Direct filtering by schoolId
    };
    
    // Allow admins to see timetables from specific schools or all schools
    if (req.user?.role === 'admin') {
      if (req.query.schoolId) {
        whereClause.schoolId = parseInt(req.query.schoolId);
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
      whereClause.teacherId = parseInt(teacherId);
    }
    
    if (day) {
      whereClause.day = day.toLowerCase();
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
        },
        school: {
          select: {
            id: true,
            schoolName: true,
            code: true
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
        schoolId: schoolId,
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

    // Build where clause with direct school context
    let whereClause = {
      className: className,
      section: section,
      schoolId: schoolId // Direct filtering by schoolId
    };
    
    // Allow admins to access any school's timetable
    if (req.user?.role === 'admin' && req.query.schoolId) {
      whereClause.schoolId = parseInt(req.query.schoolId);
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
        },
        school: {
          select: {
            id: true,
            schoolName: true,
            code: true
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

    const { className, section, subjectName, teacherId, day, startTime, endTime, roomNumber } = req.body;

    // Validate required fields
    if (!className || !section || !subjectName || !teacherId || !day || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided: className, section, subjectName, teacherId, day, startTime, endTime"
      });
    }

    // Verify that the teacher belongs to the same school (except for admins)
    if (req.user?.role !== 'admin') {
      const teacher = await prisma.teacher.findUnique({
        where: { id: parseInt(teacherId) },
        select: { id: true, schoolId: true, fullName: true }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
          message: "Teacher not found"
      });
    }

      if (teacher.schoolId !== schoolId) {
      return res.status(403).json({
        success: false,
          message: "You can only assign teachers from your own school"
      });
      }
    }

    // Check for conflicts (same teacher, same time, same day)
    const conflictCheck = await prisma.timetable.findFirst({
      where: {
        teacherId: parseInt(teacherId),
        day: day.toLowerCase(),
        schoolId: schoolId, // Added schoolId to conflict check
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
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          }
        ]
      },
      include: {
        teacher: {
          select: { fullName: true }
        }
      }
    });

    if (conflictCheck) {
      return res.status(409).json({
        success: false,
        message: `Time conflict detected! ${conflictCheck.teacher.fullName} is already scheduled for ${conflictCheck.className}-${conflictCheck.section} from ${conflictCheck.startTime} to ${conflictCheck.endTime} on ${conflictCheck.day}`,
        conflict: {
          existingEntry: conflictCheck,
          conflictType: "teacher_time_overlap"
        }
      });
    }

    // Check for classroom conflicts (same class, section, time, day)
    const classroomConflict = await prisma.timetable.findFirst({
      where: {
        className: className,
        section: section,
        day: day.toLowerCase(),
        schoolId: schoolId, // Added schoolId to classroom conflict check
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
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          }
        ]
      },
      include: {
        teacher: {
          select: { fullName: true }
        }
      }
    });

    if (classroomConflict) {
      return res.status(409).json({
        success: false,
        message: `Classroom conflict detected! ${className}-${section} already has ${classroomConflict.subjectName} scheduled with ${classroomConflict.teacher.fullName} from ${classroomConflict.startTime} to ${classroomConflict.endTime} on ${classroomConflict.day}`,
        conflict: {
          existingEntry: classroomConflict,
          conflictType: "classroom_time_overlap"
        }
      });
    }

    // Create the timetable entry with schoolId
    const newEntry = await prisma.timetable.create({
      data: {
        className,
        section,
        subjectName,
        teacherId: parseInt(teacherId),
        day: day.toLowerCase(),
        startTime,
        endTime,
        roomNumber: roomNumber || null,
        schoolId: schoolId // Include schoolId in creation
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
        },
        school: {
          select: {
            id: true,
            schoolName: true,
            code: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "Timetable entry created successfully",
      data: newEntry,
      meta: {
        schoolId: schoolId,
        conflicts: {
          teacherConflict: false,
          classroomConflict: false
        }
      }
    });
  } catch (error) {
    console.error("Error creating timetable entry:", error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "A timetable entry with these details already exists",
        error: process.env.NODE_ENV === 'development' ? error.message : "Duplicate entry error"
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID or school reference",
        error: process.env.NODE_ENV === 'development' ? error.message : "Foreign key constraint error"
      });
    }

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
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { id } = req.params;
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

    // Check if entry exists and belongs to the user's school
    const existingEntry = await prisma.timetable.findFirst({
      where: { 
        id,
        schoolId: schoolId // Direct filtering by schoolId
      },
      include: {
        teacher: true
      }
    });

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found or you don't have permission to modify it"
      });
    }

    // Convert teacherId to integer if provided
    let teacherIdInt = existingEntry.teacherId;
    if (teacherId) {
      teacherIdInt = parseInt(teacherId);
      if (isNaN(teacherIdInt)) {
        return res.status(400).json({
          success: false,
          message: "Invalid teacher ID provided"
        });
      }

      // Verify new teacher exists and belongs to the same school
      const teacher = await prisma.teacher.findFirst({
        where: {
          id: teacherIdInt,
          schoolId: schoolId
        }
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found in your school"
        });
      }
    }

    // Check for time slot conflicts (excluding current entry)
    if (className || section || day || startTime || endTime) {
    const conflictingEntry = await prisma.timetable.findFirst({
      where: {
        id: { not: id },
          className: className || existingEntry.className,
          section: section !== undefined ? section : existingEntry.section,
          day: day ? day.toLowerCase() : existingEntry.day,
          schoolId: schoolId, // Added schoolId to conflict check
        OR: [
          {
            AND: [
                { startTime: { lte: startTime || existingEntry.startTime } },
                { endTime: { gt: startTime || existingEntry.startTime } }
            ]
          },
          {
            AND: [
                { startTime: { lt: endTime || existingEntry.endTime } },
                { endTime: { gte: endTime || existingEntry.endTime } }
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
    }

    const updatedEntry = await prisma.timetable.update({
      where: { id },
      data: {
        ...(className && { className }),
        ...(section !== undefined && { section }),
        ...(subjectName && { subjectName }),
        ...(teacherId && { teacherId: teacherIdInt }),
        ...(day && { day: day.toLowerCase() }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(roomNumber !== undefined && { roomNumber })
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
        },
        school: {
          select: {
            id: true,
            schoolName: true,
            code: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Timetable entry updated successfully",
      data: updatedEntry
    });
  } catch (error) {
    console.error("Error updating timetable entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update timetable entry",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Delete timetable entry
export const deleteTimetableEntry = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { id } = req.params;

    // Check if entry exists and belongs to the user's school
    const existingEntry = await prisma.timetable.findFirst({
      where: { 
        id,
        schoolId: schoolId // Direct filtering by schoolId
      }
    });

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found or you don't have permission to delete it"
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
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Get classes for the school
export const getClasses = async (req, res) => {
  try {
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    // Get distinct classes from timetable for this school
    const classes = await prisma.timetable.findMany({
      where: {
        schoolId: schoolId // Direct filtering by schoolId
      },
      select: {
        className: true
      },
      distinct: ['className']
    });

    const formattedClasses = classes.map(cls => ({
      id: cls.className,
      name: cls.className
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
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Get sections by class for the school
export const getSectionsByClass = async (req, res) => {
  try {
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { className } = req.params;

    const sections = await prisma.timetable.findMany({
      where: {
        className: className,
        schoolId: schoolId // Direct filtering by schoolId
      },
      select: {
        section: true
      },
      distinct: ['section']
    });

    const formattedSections = sections.map(section => ({
      id: section.section,
      name: section.section
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
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Get teachers with their subjects for the school
export const getTeachersWithSubjects = async (req, res) => {
  try {
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const teachers = await prisma.teacher.findMany({
      where: {
        schoolId: schoolId,
        status: 'active'
      },
      select: {
        id: true,
        fullName: true,
        designation: true,
        subjects: true,
        email: true,
        phone: true
      },
      orderBy: {
        fullName: 'asc'
      }
    });

    // Parse subjects for each teacher
    const teachersWithParsedSubjects = teachers.map(teacher => {
      let parsedSubjects = [];
      try {
        if (teacher.subjects) {
          parsedSubjects = JSON.parse(teacher.subjects);
        }
      } catch (error) {
        console.error('Error parsing subjects for teacher:', teacher.fullName, error);
        parsedSubjects = [];
      }

      return {
        ...teacher,
        subjects: parsedSubjects
      };
    });

    res.status(200).json({
      success: true,
      message: "Teachers with subjects retrieved successfully",
      count: teachersWithParsedSubjects.length,
      data: teachersWithParsedSubjects
    });
  } catch (error) {
    console.error("Error fetching teachers with subjects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teachers with subjects",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Get subjects for a specific teacher
export const getSubjectsByTeacher = async (req, res) => {
  try {
    const schoolId = await getSchoolIdFromContext(req);
    const { teacherId } = req.params;
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const teacherIdInt = parseInt(teacherId);
    if (isNaN(teacherIdInt)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID provided"
      });
    }

    const teacher = await prisma.teacher.findFirst({
      where: {
        id: teacherIdInt,
        schoolId: schoolId,
        status: 'active'
      },
      select: {
        id: true,
        fullName: true,
        subjects: true
      }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found in your school"
      });
    }

    let subjects = [];
    try {
      if (teacher.subjects) {
        subjects = JSON.parse(teacher.subjects);
      }
    } catch (error) {
      console.error('Error parsing subjects for teacher:', teacher.fullName, error);
      subjects = [];
    }

    res.status(200).json({
      success: true,
      message: `Subjects retrieved successfully for ${teacher.fullName}`,
      data: {
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        subjects: subjects
      }
    });
  } catch (error) {
    console.error("Error fetching subjects by teacher:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subjects for teacher",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Get timetable statistics for dashboard
export const getTimetableStats = async (req, res) => {
  try {
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    // Get total entries count
    const totalEntries = await prisma.timetable.count({
      where: {
        schoolId: schoolId // Direct filtering by schoolId
      }
    });

    // Get unique classes count
    const uniqueClasses = await prisma.timetable.findMany({
      where: {
        schoolId: schoolId // Direct filtering by schoolId
      },
      select: {
        className: true
      },
      distinct: ['className']
    });

    // Get unique subjects count
    const uniqueSubjects = await prisma.timetable.findMany({
      where: {
        schoolId: schoolId // Direct filtering by schoolId
      },
      select: {
        subjectName: true
      },
      distinct: ['subjectName']
    });

    // Get active teachers count
    const activeTeachers = await prisma.teacher.count({
      where: {
        schoolId: schoolId,
        status: 'active'
      }
    });

    // Get entries per day
    const entriesPerDay = await prisma.timetable.groupBy({
      by: ['day'],
      where: {
        schoolId: schoolId // Direct filtering by schoolId
      },
      _count: {
        id: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Timetable statistics retrieved successfully",
      data: {
        totalEntries: totalEntries,
        uniqueClasses: uniqueClasses.length,
        uniqueSubjects: uniqueSubjects.length,
        activeTeachers: activeTeachers,
        entriesPerDay: entriesPerDay.map(item => ({
          day: item.day,
          count: item._count.id
        })),
        classBreakdown: uniqueClasses.map(cls => cls.className),
        subjectBreakdown: uniqueSubjects.map(sub => sub.subjectName)
      }
    });
  } catch (error) {
    console.error("Error fetching timetable statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch timetable statistics",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Validate timetable entry for conflicts
export const validateTimetableEntry = async (req, res) => {
  try {
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
      teacherId,
      day,
      startTime,
      endTime,
      excludeId
    } = req.body;

    const teacherIdInt = parseInt(teacherId);
    if (isNaN(teacherIdInt)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID provided"
      });
    }

    // Check for time slot conflicts
    const conflictWhere = {
      className,
      section: section || '',
      day: day.toLowerCase(),
      ...(excludeId && { id: { not: excludeId } }),
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
        },
        {
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } }
          ]
        }
      ]
    };

    const conflictingEntry = await prisma.timetable.findFirst({
      where: conflictWhere,
      include: {
        teacher: {
          select: {
            fullName: true
          }
        }
      }
    });

    // Check teacher availability
    const teacherConflictWhere = {
      teacherId: teacherIdInt,
      day: day.toLowerCase(),
      ...(excludeId && { id: { not: excludeId } }),
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
    };

    const teacherConflict = await prisma.timetable.findFirst({
      where: teacherConflictWhere
    });

    const conflicts = [];
    
    if (conflictingEntry) {
      conflicts.push({
        type: 'CLASS_CONFLICT',
        message: `Time slot conflicts with existing ${conflictingEntry.subjectName} class (${conflictingEntry.startTime}-${conflictingEntry.endTime})`,
        details: conflictingEntry
      });
    }

    if (teacherConflict) {
      conflicts.push({
        type: 'TEACHER_CONFLICT',
        message: `Teacher is already assigned to ${teacherConflict.className}-${teacherConflict.section} during this time slot`,
        details: teacherConflict
      });
    }

    res.status(200).json({
      success: true,
      message: conflicts.length === 0 ? "No conflicts found" : "Conflicts detected",
      data: {
        hasConflicts: conflicts.length > 0,
        conflicts: conflicts
      }
    });
  } catch (error) {
    console.error("Error validating timetable entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate timetable entry",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Get time slots dynamically from existing timetable data
export const getTimeSlots = async (req, res) => {
  try {
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    // Get all unique time combinations from timetable entries for this school
    const uniqueTimeSlots = await prisma.timetable.findMany({
      where: {
        schoolId: schoolId
      },
      select: {
        startTime: true,
        endTime: true
      },
      distinct: ['startTime', 'endTime']
    });

    // Convert time slots to the expected format
    const formatTime = (time) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    const formattedTimeSlots = uniqueTimeSlots.map((slot, index) => ({
      id: `${slot.startTime}-${slot.endTime}`,
      startTime: slot.startTime,
      endTime: slot.endTime,
      label: `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`
    }));

    // Sort time slots by start time
    formattedTimeSlots.sort((a, b) => {
      const aTime = new Date(`1970-01-01T${a.startTime}:00`);
      const bTime = new Date(`1970-01-01T${b.startTime}:00`);
      return aTime - bTime;
    });

    res.status(200).json({
      success: true,
      message: "Time slots retrieved successfully",
      count: formattedTimeSlots.length,
      data: formattedTimeSlots,
      meta: {
        schoolId: schoolId,
        generatedFromExistingData: true
      }
    });
  } catch (error) {
    console.error("Error fetching time slots:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch time slots",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
}; 