import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Get all timetable entries
export const getAllTimetable = async (req, res) => {
  try {
    const timetable = await prisma.timetable.findMany({
      include: {
        class: true,
        section: true,
        subject: true,
        teacher: true
      },
      orderBy: {
        day: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      count: timetable.length,
      data: timetable
    });
  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch timetable",
      error: error.message
    });
  }
};

// Get timetable by class and section
export const getTimetableByClassSection = async (req, res) => {
  try {
    const { classId, sectionId } = req.params;

    const timetable = await prisma.timetable.findMany({
      where: {
        classId,
        sectionId
      },
      include: {
        class: true,
        section: true,
        subject: true,
        teacher: true
      },
      orderBy: {
        day: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      count: timetable.length,
      data: timetable
    });
  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch timetable",
      error: error.message
    });
  }
};

// Create new timetable entry
export const createTimetableEntry = async (req, res) => {
  try {
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

    // Validate required fields
    if (!classId || !sectionId || !subjectId || !teacherId || !day || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // Check for time slot conflicts
    const conflictingEntry = await prisma.timetable.findFirst({
      where: {
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

    const timetableEntry = await prisma.timetable.create({
      data: {
        id: uuidv4(),
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

    res.status(201).json({
      success: true,
      data: timetableEntry
    });
  } catch (error) {
    console.error("Error creating timetable entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create timetable entry",
      error: error.message
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

// Get all teachers for timetable
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      where: {
        status: 'active'
      },
      select: {
        id: true,
        fullName: true,
        subjects: true,
        classes: true,
        sections: true
      },
      orderBy: {
        fullName: 'asc'
      }
    });

    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      name: teacher.fullName,
      subjects: JSON.parse(teacher.subjects || '[]'),
      classes: teacher.classes,
      sections: JSON.parse(teacher.sections || '[]')
    }));

    res.status(200).json({
      success: true,
      data: formattedTeachers
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teachers",
      error: error.message
    });
  }
}; 