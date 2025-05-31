import { PrismaClient } from "@prisma/client";
import { getSchoolIdFromContext } from "../middlewares/authMiddleware.js";

const prisma = new PrismaClient();

/**
 * Get students by class for marking attendance
 */
export const getStudentsByClass = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { className, section } = req.query;
    
    // Build where condition with school context
    let whereCondition = {
      schoolId: schoolId // Always filter by school
    };
    
    if (className) {
      whereCondition.className = className;
      if (section) {
        whereCondition.section = section;
      }
    }

    // For non-admin users, restrict to their school only
    if (req.user?.role !== 'admin') {
      whereCondition.schoolId = schoolId;
    } else if (req.query.schoolId) {
      // Admin can override school context
      whereCondition.schoolId = parseInt(req.query.schoolId);
    }

    // Get students from the database
    const students = await prisma.student.findMany({
      where: whereCondition,
      select: {
        id: true,
        fullName: true,
        sessionInfo: {
          select: {
            currentRollNo: true,
            currentClass: true,
            currentSection: true
          }
        },
        admissionNo: true,
        school: {
          select: {
            id: true,
            schoolName: true
          }
        }
      },
      orderBy: {
        // If no className provided, order by className first, then rollNumber
        ...(className ? { admissionNo: 'asc' } : [
          { sessionInfo: { currentClass: 'asc' } },
          { admissionNo: 'asc' }
        ]),
      },
      // Limit results if no className specified to prevent large response
      ...(className ? {} : { take: 100 }),
    });

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: className 
          ? "No students found in the specified class" 
          : "No students found in your school",
      });
    }

    // Format student data to match expected format
    const formattedStudents = students.map(student => ({
      id: student.id,
      name: student.fullName,
      fullName: student.fullName,
      rollNumber: student.sessionInfo?.currentRollNo || '',
      admissionNo: student.admissionNo,
      className: student.sessionInfo?.currentClass || className || '',
      section: student.sessionInfo?.currentSection || section || '',
      schoolId: student.school.id,
      schoolName: student.school.schoolName
    }));

    return res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      data: formattedStudents,
      meta: {
        schoolId: whereCondition.schoolId,
        totalCount: formattedStudents.length,
        className: className || 'All Classes',
        section: section || 'All Sections'
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Mark attendance for students - with school context validation
 */
export const markAttendance = async (req, res) => {
  try {
    console.log("Received attendance request body:", JSON.stringify(req.body, null, 2));
    
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { date, className, section, attendanceData, teacherId } = req.body;

    // Basic validation
    if (!date || !className || !attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields or invalid data format",
        requiredFields: {
          date: "YYYY-MM-DD format required",
          className: "String required",
          attendanceData: "Array of student attendance required"
        }
      });
    }

    // Skip empty attendance data
    if (attendanceData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No attendance data provided",
      });
    }

    // Convert and validate teacherId with school context
    let teacherIdNum;
    try {
      if (teacherId && !isNaN(Number(teacherId)) && Number(teacherId) > 0) {
        teacherIdNum = Number(teacherId);
        
        // Verify teacher exists and belongs to the same school
        const teacherExists = await prisma.teacher.findFirst({
          where: { 
            id: teacherIdNum,
            schoolId: schoolId
          },
          select: { id: true, fullName: true }
        });
        
        if (!teacherExists) {
          // Try to find any valid teacher in the school as fallback
          const fallbackTeacher = await prisma.teacher.findFirst({
            where: { schoolId: schoolId },
            select: { id: true, fullName: true }
          });
          
          if (fallbackTeacher) {
            teacherIdNum = fallbackTeacher.id;
            console.log(`Teacher ID ${teacherId} not found in school, using fallback teacher: ${fallbackTeacher.fullName} (${teacherIdNum})`);
          } else {
            return res.status(400).json({
              success: false,
              message: "No teachers found in your school. Please add a teacher first."
            });
          }
        }
      } else {
        // Try to find any valid teacher in the school
        const defaultTeacher = await prisma.teacher.findFirst({
          where: { schoolId: schoolId },
          select: { id: true, fullName: true }
        });
        
        if (defaultTeacher) {
          teacherIdNum = defaultTeacher.id;
          console.log(`Using default teacher: ${defaultTeacher.fullName} (${teacherIdNum})`);
        } else {
          return res.status(400).json({
            success: false,
            message: "No teachers found in your school. Please add a teacher first."
          });
        }
      }
    } catch (error) {
      console.error("Error validating teacher:", error);
      return res.status(400).json({
        success: false,
        message: "Error validating teacher information",
        error: error.message
      });
    }
    
    // Delete any existing attendance records for this date and class (with school context)
    try {
      console.log(`Deleting existing attendance records for ${date}, ${className} in school ${schoolId}`);
      const deleteResult = await prisma.attendance.deleteMany({
        where: {
          date: {
            gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
            lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
          },
          className,
          ...(section && { section }),
          student: {
            schoolId: schoolId // Ensure we only delete attendance for students in this school
          }
        },
      });
      console.log("Deleted records:", deleteResult);
    } catch (deleteError) {
      console.error("Error deleting existing records:", deleteError);
      // Continue processing even if delete fails
    }

    // Create attendance records with school validation
    const createdRecords = [];
    const errors = [];

    console.log(`Processing ${attendanceData.length} attendance records with teacher ID: ${teacherIdNum} for school: ${schoolId}`);
    
    for (const item of attendanceData) {
      try {
        // Skip invalid records
        if (!item.studentId || !item.status) {
          console.log("Skipping invalid record:", item);
          continue;
        }
        
        // Validate student belongs to the school
        const student = await prisma.student.findFirst({
          where: {
            id: item.studentId,
            schoolId: schoolId
          },
          select: { id: true, fullName: true, schoolId: true }
        });
        
        if (!student) {
          console.error(`Student ${item.studentId} not found in school ${schoolId}`);
          errors.push({
            studentId: item.studentId,
            error: "Student not found in your school",
            details: { message: "Student does not belong to your school" }
          });
          continue;
        }
        
        // Validate status enum value
        let status = item.status;
        if (!['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].includes(status)) {
          status = 'PRESENT'; // Default to present if invalid
        }

        // Create attendance record
        const attendanceRecord = await prisma.attendance.create({
          data: {
            studentId: student.id,
            teacherId: teacherIdNum,
            date: new Date(date),
            status: status,
            className: className,
            section: section || '',
            notes: item.notes || ''
          },
          include: {
            student: {
              select: { fullName: true, admissionNo: true }
            },
            teacher: {
              select: { fullName: true }
            }
          }
        });

        createdRecords.push({
          id: attendanceRecord.id,
          studentId: attendanceRecord.studentId,
          studentName: attendanceRecord.student.fullName,
          admissionNo: attendanceRecord.student.admissionNo,
          status: attendanceRecord.status,
          teacherName: attendanceRecord.teacher.fullName
        });

      } catch (recordError) {
        console.error(`Error creating attendance record for student ${item.studentId}:`, recordError);
        errors.push({
          studentId: item.studentId,
          error: "Failed to create attendance record",
          details: { message: recordError.message }
        });
      }
    }

    // Log the activity for production
    try {
      if (process.env.NODE_ENV === 'production') {
        await prisma.activityLog.create({
          data: {
            action: 'ATTENDANCE_MARKED',
            entityType: 'ATTENDANCE',
            entityId: `${date}-${className}`,
            userId: req.user?.id,
            userRole: req.user?.role,
            schoolId: schoolId,
            details: `Attendance marked for ${className} on ${date} by teacher ${teacherIdNum}. ${createdRecords.length} records created.`,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent']
          }
        });
      }
    } catch (logError) {
      console.error('Failed to log attendance activity:', logError);
    }

    const response = {
      success: true,
      message: `Attendance marked successfully for ${createdRecords.length} students`,
      data: {
        created: createdRecords,
        errors: errors,
        summary: {
          totalProcessed: attendanceData.length,
          successfullyCreated: createdRecords.length,
          errors: errors.length,
          date: date,
          className: className,
          section: section || 'N/A',
          schoolId: schoolId,
          teacherId: teacherIdNum
        }
      }
    };

    if (errors.length > 0) {
      response.message += ` (${errors.length} errors occurred)`;
    }

    return res.status(201).json(response);
  } catch (error) {
    console.error("Error marking attendance:", error);
    return res.status(500).json({
      success: false,
      message: "Error marking attendance",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get attendance records by date and class
 */
export const getAttendanceByDateClass = async (req, res) => {
  try {
    const { date, className, section } = req.query;

    if (!date || !className) {
      return res.status(400).json({
        success: false,
        message: "Date and class name are required",
      });
    }

    const attendanceDate = new Date(date);

    // Get attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
          lt: new Date(attendanceDate.setHours(23, 59, 59, 999)),
        },
        className,
        ...(section && { section }),
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            rollNumber: true,
            admissionNo: true,
          },
        },
      },
      orderBy: {
        student: {
          rollNumber: 'asc',
        },
      },
    });

    // Format the response
    const formattedRecords = attendanceRecords.map(record => ({
      id: record.id,
      date: record.date,
      status: record.status,
      notes: record.notes,
      student: {
        id: record.student.id,
        name: `${record.student.firstName} ${record.student.middleName ? record.student.middleName + ' ' : ''}${record.student.lastName}`,
        rollNumber: record.student.rollNumber,
        admissionNo: record.student.admissionNo,
      },
    }));

    return res.status(200).json({
      success: true,
      message: "Attendance records retrieved successfully",
      data: formattedRecords,
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records",
      error: error.message,
    });
  }
};

/**
 * Get attendance records for a specific student
 */
export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      dateFilter = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      dateFilter = {
        lte: new Date(endDate),
      };
    }

    // Get attendance records for the student
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: Number(studentId),
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Calculate attendance statistics
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => record.status === 'PRESENT').length;
    const absentDays = attendanceRecords.filter(record => record.status === 'ABSENT').length;
    const lateDays = attendanceRecords.filter(record => record.status === 'LATE').length;
    const excusedDays = attendanceRecords.filter(record => record.status === 'EXCUSED').length;
    
    // Calculate attendance percentage
    const attendancePercentage = totalDays > 0 
      ? ((presentDays + lateDays) / totalDays * 100).toFixed(2) 
      : 0;

    return res.status(200).json({
      success: true,
      message: "Student attendance records retrieved successfully",
      data: {
        records: attendanceRecords,
        statistics: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          excusedDays,
          attendancePercentage,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student attendance",
      error: error.message,
    });
  }
};

/**
 * Get classes with sections list
 */
export const getClassesList = async (req, res) => {
  try {
    // Get unique class names and sections from the Student model
    const students = await prisma.student.findMany({
      select: {
        className: true,
        section: true,
      },
      distinct: ['className', 'section'],
      orderBy: [
        { className: 'asc' },
        { section: 'asc' },
      ],
    });

    // Group by class name
    const classes = {};
    students.forEach(student => {
      if (!classes[student.className]) {
        classes[student.className] = [];
      }
      
      if (student.section && !classes[student.className].includes(student.section)) {
        classes[student.className].push(student.section);
      }
    });

    // Convert to array format
    const classesArray = Object.entries(classes).map(([className, sections]) => ({
      className,
      sections,
    }));

    return res.status(200).json({
      success: true,
      message: "Classes list retrieved successfully",
      data: classesArray,
    });
  } catch (error) {
    console.error("Error fetching classes list:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch classes list",
      error: error.message,
    });
  }
};

/**
 * Get attendance statistics by date range and class
 */
export const getAttendanceStats = async (req, res) => {
  try {
    const { startDate, endDate, className, section } = req.query;

    if (!startDate || !endDate || !className) {
      return res.status(400).json({
        success: false,
        message: "Start date, end date, and class name are required",
      });
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Get attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startDateObj,
          lte: endDateObj,
        },
        className,
        ...(section && { section }),
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rollNumber: true,
          },
        },
      },
    });

    // Group by date and calculate daily statistics
    const dailyStats = {};
    attendanceRecords.forEach(record => {
      const dateStr = record.date.toISOString().split('T')[0];
      
      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = {
          date: dateStr,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        };
      }
      
      dailyStats[dateStr].total++;
      
      switch (record.status) {
        case 'PRESENT':
          dailyStats[dateStr].present++;
          break;
        case 'ABSENT':
          dailyStats[dateStr].absent++;
          break;
        case 'LATE':
          dailyStats[dateStr].late++;
          break;
        case 'EXCUSED':
          dailyStats[dateStr].excused++;
          break;
      }
    });

    // Calculate overall statistics
    const totalRecords = attendanceRecords.length;
    const totalPresent = attendanceRecords.filter(record => record.status === 'PRESENT').length;
    const totalAbsent = attendanceRecords.filter(record => record.status === 'ABSENT').length;
    const totalLate = attendanceRecords.filter(record => record.status === 'LATE').length;
    const totalExcused = attendanceRecords.filter(record => record.status === 'EXCUSED').length;
    
    const overallAttendanceRate = totalRecords > 0 
      ? ((totalPresent + totalLate) / totalRecords * 100).toFixed(2) 
      : 0;

    return res.status(200).json({
      success: true,
      message: "Attendance statistics retrieved successfully",
      data: {
        overallStats: {
          totalRecords,
          totalPresent,
          totalAbsent,
          totalLate,
          totalExcused,
          overallAttendanceRate,
        },
        dailyStats: Object.values(dailyStats),
      },
    });
  } catch (error) {
    console.error("Error fetching attendance statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance statistics",
      error: error.message,
    });
  }
};

/**
 * Get data for the teacher attendance management component
 */
export const getTeacherAttendanceManagement = async (req, res) => {
  try {
    const { className, section, date } = req.query;
    // Make teacherId optional with a default value of 1
    const teacherId = req.query.teacherId || 1; // Default to 1 if not provided

    // If className and date are provided, get the attendance records for that class and date
    if (className && date) {
      const attendanceDate = new Date(date);
      
      // Get students for this class
      const students = await prisma.student.findMany({
        where: {
          className,
          ...(section && { section }),
        },
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          rollNumber: true,
          admissionNo: true,
        },
        orderBy: {
          rollNumber: 'asc',
        },
      });

      // Get existing attendance records for this date and class
      const existingRecords = await prisma.attendance.findMany({
        where: {
          date: {
            gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
            lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
          },
          className,
          ...(section && { section }),
        },
      });

      // Format student data with their attendance status
      const formattedStudents = students.map(student => {
        const record = existingRecords.find(rec => rec.studentId === student.id);
        
        return {
          id: student.id,
          name: `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`,
          rollNumber: student.rollNumber || '',
          admissionNo: student.admissionNo,
          status: record ? record.status : null,
          notes: record ? record.notes : null,
        };
      });

      // Calculate statistics
      const total = students.length;
      const present = existingRecords.filter(record => record.status === 'PRESENT').length;
      const absent = existingRecords.filter(record => record.status === 'ABSENT').length;
      const late = existingRecords.filter(record => record.status === 'LATE').length;
      const excused = existingRecords.filter(record => record.status === 'EXCUSED').length;

      return res.status(200).json({
        success: true,
        message: "Attendance data retrieved successfully",
        data: {
          students: formattedStudents,
          stats: {
            total,
            present,
            absent,
            late,
            excused,
          },
          date: date,
          className,
          section,
        },
      });
    }

    // Get all classes from the database without filtering by teacher
    const allClasses = await prisma.student.findMany({
      select: {
        className: true,
        section: true,
      },
      distinct: ['className', 'section'],
      orderBy: [
        { className: 'asc' },
        { section: 'asc' },
      ],
    });

    // Group by class name
    const classesTaught = {};
    allClasses.forEach(student => {
      if (!classesTaught[student.className]) {
        classesTaught[student.className] = [];
      }
      
      if (student.section && !classesTaught[student.className].includes(student.section)) {
        classesTaught[student.className].push(student.section);
      }
    });

    // Convert to array format
    const formattedClasses = Object.entries(classesTaught).map(([className, sections]) => ({
      className,
      sections: sections.sort(),
    }));

    // Create a mock teacher object for now
    const teacher = {
      id: teacherId,
      fullName: "Default Teacher"
    };

    return res.status(200).json({
      success: true,
      message: "Teacher attendance data retrieved successfully",
      data: {
        teacher,
        classesTaught: formattedClasses,
      },
    });
  } catch (error) {
    console.error("Error in teacher attendance management:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get attendance management data",
      error: error.message,
    });
  }
};

/**
 * Export attendance data as CSV
 */
export const exportAttendanceData = async (req, res) => {
  try {
    const { date, className, section } = req.query;

    if (!date || !className) {
      return res.status(400).json({
        success: false,
        message: "Date and class name are required",
      });
    }

    const attendanceDate = new Date(date);

    // Get attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
        },
        className,
        ...(section && { section }),
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            rollNumber: true,
            admissionNo: true,
          },
        },
      },
      orderBy: {
        student: {
          rollNumber: 'asc',
        },
      },
    });

    if (attendanceRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No attendance records found for the specified date and class",
      });
    }

    // Generate CSV data
    const formattedDate = new Date(date).toISOString().split('T')[0];
    const csvHeader = 'Roll No,Admission No,Student Name,Status,Notes\n';
    
    const csvRows = attendanceRecords.map(record => {
      const studentName = `${record.student.firstName} ${record.student.middleName ? record.student.middleName + ' ' : ''}${record.student.lastName}`;
      const rollNumber = record.student.rollNumber || '';
      const admissionNo = record.student.admissionNo || '';
      const status = record.status;
      const notes = record.notes ? `"${record.notes.replace(/"/g, '""')}"` : '';

      return `${rollNumber},${admissionNo},"${studentName}",${status},${notes}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_${className}_${formattedDate}.csv"`);

    // Send the CSV data
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Error exporting attendance data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export attendance data",
      error: error.message,
    });
  }
};

/**
 * Simple endpoint to check if attendance API is working
 */
export const checkAttendanceAPI = async (req, res) => {
  try {
    // Count students
    const studentCount = await prisma.student.count();
    
    // Count attendance records
    const attendanceCount = await prisma.attendance.count();
    
    return res.status(200).json({
      success: true,
      message: "Attendance API is working correctly",
      data: {
        studentCount,
        attendanceCount,
        server: "OK",
        database: "Connected",
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error checking attendance API:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking attendance API",
      error: error.message
    });
  }
};

export default {
  getStudentsByClass,
  markAttendance,
  getAttendanceByDateClass,
  getStudentAttendance,
  getClassesList,
  getAttendanceStats,
  getTeacherAttendanceManagement,
  exportAttendanceData,
  checkAttendanceAPI,
}; 