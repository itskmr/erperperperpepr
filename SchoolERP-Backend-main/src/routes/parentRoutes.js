import express from 'express';
import { PrismaClient } from '@prisma/client';
import { protect, authorize, enforceSchoolIsolation } from '../middlewares/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication middleware to all parent routes
router.use(protect);
router.use(authorize('parent'));
router.use(enforceSchoolIsolation);

// Parent Dashboard Overview
router.get('/dashboard', async (req, res) => {
  try {
    const { studentId, schoolId } = req.user;

    // Get student basic info
    const student = await prisma.student.findUnique({
      where: { 
        id: studentId,
        schoolId: schoolId 
      },
      include: {
        school: {
          select: { 
            id: true, 
            schoolName: true, 
            address: true, 
            phone: true,
            email: true,
            principal: true 
          }
        },
        sessionInfo: true,
        parentInfo: true
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get attendance summary (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: studentId,
        schoolId: schoolId,
        date: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        date: true,
        status: true
      }
    });

    // Calculate attendance statistics
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => record.status === 'PRESENT').length;
    const absentDays = attendanceRecords.filter(record => record.status === 'ABSENT').length;
    const lateDays = attendanceRecords.filter(record => record.status === 'LATE').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Get recent diary entries (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentDiaries = await prisma.teacherDiary.findMany({
      where: {
        schoolId: schoolId,
        OR: [
          { class: student.sessionInfo?.currentClass },
          { section: student.sessionInfo?.currentSection },
          { studentId: studentId }
        ],
        date: {
          gte: sevenDaysAgo
        }
      },
      include: {
        teacher: {
          select: {
            fullName: true,
            designation: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: 5
    });

    // Get current day timetable
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    
    const timetable = await prisma.timetable.findMany({
      where: {
        schoolId: schoolId,
        class: student.sessionInfo?.currentClass,
        section: student.sessionInfo?.currentSection,
        dayOfWeek: today
      },
      include: {
        teacher: {
          select: {
            fullName: true,
            designation: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          fullName: student.fullName,
          admissionNo: student.admissionNo,
          currentClass: student.sessionInfo?.currentClass,
          currentSection: student.sessionInfo?.currentSection,
          rollNo: student.sessionInfo?.currentRollNo,
          profileImage: student.studentImagePath
        },
        school: student.school,
        attendance: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          percentage: attendancePercentage,
          lastUpdated: new Date()
        },
        recentDiaries,
        todayTimetable: timetable,
        parent: {
          type: req.user.parentType,
          email: req.user.email
        }
      }
    });
  } catch (error) {
    console.error('Error fetching parent dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// Get Student Profile (Read-only)
router.get('/student/profile', async (req, res) => {
  try {
    const { studentId, schoolId } = req.user;

    const student = await prisma.student.findUnique({
      where: { 
        id: studentId,
        schoolId: schoolId 
      },
      include: {
        sessionInfo: true,
        parentInfo: true,
        transportInfo: true,
        educationInfo: true,
        otherInfo: true,
        previousSchool: true,
        sibling: true
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student,
      message: "This is a read-only profile. Contact school administration for any changes."
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student profile',
      error: error.message
    });
  }
});

// Get Attendance Details
router.get('/attendance', async (req, res) => {
  try {
    const { studentId, schoolId } = req.user;
    const { startDate, endDate, month, year } = req.query;

    // Build date filter
    let dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    } else if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0);
      dateFilter = {
        date: {
          gte: start,
          lte: end
        }
      };
    } else {
      // Default to current month
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateFilter = {
        date: {
          gte: start,
          lte: end
        }
      };
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: studentId,
        schoolId: schoolId,
        ...dateFilter
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Calculate statistics
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => record.status === 'PRESENT').length;
    const absentDays = attendanceRecords.filter(record => record.status === 'ABSENT').length;
    const lateDays = attendanceRecords.filter(record => record.status === 'LATE').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    res.json({
      success: true,
      data: {
        records: attendanceRecords,
        statistics: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          percentage: attendancePercentage
        }
      }
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance data',
      error: error.message
    });
  }
});

// Get Timetable
router.get('/timetable', async (req, res) => {
  try {
    const { studentId, schoolId } = req.user;
    const { day } = req.query;

    // Get student's current class and section
    const student = await prisma.student.findUnique({
      where: { 
        id: studentId,
        schoolId: schoolId 
      },
      include: {
        sessionInfo: true
      }
    });

    if (!student || !student.sessionInfo) {
      return res.status(404).json({
        success: false,
        message: 'Student or session information not found'
      });
    }

    // Build day filter
    let dayFilter = {};
    if (day) {
      dayFilter = { dayOfWeek: day.toUpperCase() };
    }

    const timetable = await prisma.timetable.findMany({
      where: {
        schoolId: schoolId,
        class: student.sessionInfo.currentClass,
        section: student.sessionInfo.currentSection,
        ...dayFilter
      },
      include: {
        teacher: {
          select: {
            fullName: true,
            designation: true,
            subjects: true
          }
        }
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    // Group by day
    const groupedTimetable = timetable.reduce((acc, entry) => {
      if (!acc[entry.dayOfWeek]) {
        acc[entry.dayOfWeek] = [];
      }
      acc[entry.dayOfWeek].push(entry);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        student: {
          class: student.sessionInfo.currentClass,
          section: student.sessionInfo.currentSection
        },
        timetable: groupedTimetable
      }
    });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timetable',
      error: error.message
    });
  }
});

// Get Teacher Diary Entries
router.get('/diary', async (req, res) => {
  try {
    const { studentId, schoolId } = req.user;
    const { subject, date, limit = 20 } = req.query;

    // Get student's current class and section
    const student = await prisma.student.findUnique({
      where: { 
        id: studentId,
        schoolId: schoolId 
      },
      include: {
        sessionInfo: true
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Build filters
    let filters = {
      schoolId: schoolId,
      OR: [
        { 
          class: student.sessionInfo?.currentClass,
          section: student.sessionInfo?.currentSection
        },
        { studentId: studentId } // Direct entries for the student
      ]
    };

    if (subject) {
      filters.subject = subject;
    }

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      filters.date = {
        gte: targetDate,
        lt: nextDay
      };
    }

    const diaryEntries = await prisma.teacherDiary.findMany({
      where: filters,
      include: {
        teacher: {
          select: {
            fullName: true,
            designation: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: diaryEntries
    });
  } catch (error) {
    console.error('Error fetching diary entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch diary entries',
      error: error.message
    });
  }
});

// Request Information Update (Non-editable form for admin notification)
router.post('/request-update', async (req, res) => {
  try {
    const { studentId, schoolId } = req.user;
    const { requestType, message, currentValue, requestedValue } = req.body;

    if (!requestType || !message) {
      return res.status(400).json({
        success: false,
        message: 'Request type and message are required'
      });
    }

    // Get student details for the request
    const student = await prisma.student.findUnique({
      where: { 
        id: studentId,
        schoolId: schoolId 
      },
      select: {
        fullName: true,
        admissionNo: true,
        sessionInfo: {
          select: {
            currentClass: true,
            currentSection: true
          }
        }
      }
    });

    // For now, we'll log the request (in production, you might want to create a separate table for these requests)
    console.log('Parent Update Request:', {
      studentId,
      schoolId,
      parentEmail: req.user.email,
      parentType: req.user.parentType,
      student: student,
      requestType,
      message,
      currentValue,
      requestedValue,
      timestamp: new Date()
    });

    // In a real implementation, you might:
    // 1. Create a notification for admin
    // 2. Send an email to school administration
    // 3. Store the request in a dedicated table

    res.json({
      success: true,
      message: 'Your update request has been submitted to the school administration. They will contact you soon.',
      data: {
        requestId: `REQ-${Date.now()}`, // Temporary ID for user reference
        status: 'submitted',
        submittedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error submitting update request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit update request',
      error: error.message
    });
  }
});

// Get linked children (for parents with multiple children)
router.get('/children', async (req, res) => {
  try {
    const { schoolId } = req.user;
    const parentEmail = req.user.email;

    // Find all students linked to this parent's email
    const students = await prisma.student.findMany({
      where: {
        schoolId: schoolId,
        OR: [
          { fatherEmail: parentEmail },
          { motherEmail: parentEmail }
        ]
      },
      include: {
        sessionInfo: {
          select: {
            currentClass: true,
            currentSection: true,
            currentRollNo: true
          }
        }
      },
      select: {
        id: true,
        fullName: true,
        admissionNo: true,
        studentImagePath: true,
        sessionInfo: true
      }
    });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching linked children:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch linked children',
      error: error.message
    });
  }
});

export default router; 