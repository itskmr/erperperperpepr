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
        if (!['PRESENT', 'ABSENT', 'LATE'].includes(status)) {
          status = 'PRESENT'; // Default to present if invalid
        }

        // Create attendance record
        const attendanceRecord = await prisma.attendance.create({
          data: {
            studentId: student.id,
            teacherId: teacherIdNum,
            schoolId: schoolId,
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
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { date, className, section } = req.query;

    if (!date || !className) {
      return res.status(400).json({
        success: false,
        message: "Date and class name are required",
      });
    }

    const attendanceDate = new Date(date);

    // Get attendance records with school context
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
          lt: new Date(attendanceDate.setHours(23, 59, 59, 999)),
        },
        className,
        schoolId: schoolId, // Added school context
        ...(section && { section }),
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            admissionNo: true,
          },
        },
      },
      orderBy: {
        student: {
          admissionNo: 'asc',
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
        name: record.student.fullName,
        admissionNo: record.student.admissionNo,
      },
    }));

    return res.status(200).json({
      success: true,
      message: "Attendance records retrieved successfully",
      data: formattedRecords,
      meta: {
        schoolId: schoolId,
        totalCount: formattedRecords.length,
        date: date,
        className: className,
        section: section || 'All Sections'
      }
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get attendance records for a specific student
 */
export const getStudentAttendance = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Verify student belongs to the school
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId: schoolId
      },
      select: { id: true, fullName: true, admissionNo: true }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your school",
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

    // Get attendance records for the student with school context
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: studentId,
        schoolId: schoolId, // Added school context
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
    
    // Calculate attendance percentage
    const attendancePercentage = totalDays > 0 
      ? ((presentDays + lateDays) / totalDays * 100).toFixed(2) 
      : 0;

    return res.status(200).json({
      success: true,
      message: "Student attendance records retrieved successfully",
      data: {
        student: {
          id: student.id,
          name: student.fullName,
          admissionNo: student.admissionNo
        },
        records: attendanceRecords,
        statistics: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          attendancePercentage,
        },
        meta: {
          schoolId: schoolId,
          dateRange: {
            startDate: startDate || 'All time',
            endDate: endDate || 'All time'
          }
        }
      },
    });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student attendance",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get classes with sections list
 */
export const getClassesList = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    // Get all classes from the database with school context
    const allClasses = await prisma.student.findMany({
      where: {
        schoolId: schoolId // Added school context
      },
      select: {
        sessionInfo: {
          select: {
            currentClass: true,
            currentSection: true
          }
        }
      },
      // Remove invalid distinct clause - sessionInfo is not a scalar field
    });

    // Group by class name
    const classes = {};
    allClasses.forEach(student => {
      const className = student.sessionInfo?.currentClass;
      const section = student.sessionInfo?.currentSection;
      
      if (className) {
        if (!classes[className]) {
          classes[className] = [];
        }
        
        if (section && !classes[className].includes(section)) {
          classes[className].push(section);
        }
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
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { startDate, endDate, className, section } = req.query;

    if (!startDate || !endDate || !className) {
      return res.status(400).json({
        success: false,
        message: "Start date, end date, and class name are required",
      });
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Get attendance records with school context
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startDateObj,
          lte: endDateObj,
        },
        className,
        schoolId: schoolId, // Added school context
        ...(section && { section }),
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            admissionNo: true,
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
      }
    });

    // Calculate overall statistics
    const totalRecords = attendanceRecords.length;
    const totalPresent = attendanceRecords.filter(record => record.status === 'PRESENT').length;
    const totalAbsent = attendanceRecords.filter(record => record.status === 'ABSENT').length;
    const totalLate = attendanceRecords.filter(record => record.status === 'LATE').length;
    
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
          overallAttendanceRate,
        },
        dailyStats: Object.values(dailyStats),
        meta: {
          schoolId: schoolId,
          dateRange: {
            startDate: startDate,
            endDate: endDate
          },
          className: className,
          section: section || 'All Sections'
        }
      },
    });
  } catch (error) {
    console.error("Error fetching attendance statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance statistics",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get data for the teacher attendance management component
 */
export const getTeacherAttendanceManagement = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { className, section, date } = req.query;
    // Make teacherId optional with a default value of 1
    const teacherId = req.query.teacherId || 1; // Default to 1 if not provided

    // If className and date are provided, get the attendance records for that class and date
    if (className && date) {
      const attendanceDate = new Date(date);
      
      // Get students for this class with school context
      const students = await prisma.student.findMany({
        where: {
          schoolId: schoolId, // Added school context
          sessionInfo: {
            currentClass: className,
            ...(section && { currentSection: section }),
          }
        },
        select: {
          id: true,
          fullName: true,
          admissionNo: true,
          sessionInfo: {
            select: {
              currentRollNo: true,
              currentClass: true,
              currentSection: true
            }
          }
        },
        orderBy: {
          admissionNo: 'asc',
        },
      });

      // Get existing attendance records for this date and class with school context
      const existingRecords = await prisma.attendance.findMany({
        where: {
          date: {
            gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
            lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
          },
          className,
          schoolId: schoolId, // Added school context
          ...(section && { section }),
        },
      });

      // Format student data with their attendance status
      const formattedStudents = students.map(student => {
        const record = existingRecords.find(rec => rec.studentId === student.id);
        
        return {
          id: student.id,
          name: student.fullName,
          rollNumber: student.sessionInfo?.currentRollNo || '',
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
          },
          date: date,
          className,
          section,
          schoolId: schoolId
        },
      });
    }

    // Get all classes from the database with school context
    const allClasses = await prisma.student.findMany({
      where: {
        schoolId: schoolId // Added school context
      },
      select: {
        sessionInfo: {
          select: {
            currentClass: true,
            currentSection: true
          }
        }
      },
      // Remove invalid distinct clause - sessionInfo is not a scalar field
    });

    // Group by class name
    const classesTaught = {};
    allClasses.forEach(student => {
      const className = student.sessionInfo?.currentClass;
      const section = student.sessionInfo?.currentSection;
      
      if (className) {
        if (!classesTaught[className]) {
          classesTaught[className] = [];
        }
        
        if (section && !classesTaught[className].includes(section)) {
          classesTaught[className].push(section);
        }
      }
    });

    // Convert to array format
    const formattedClasses = Object.entries(classesTaught).map(([className, sections]) => ({
      className,
      sections: sections.sort(),
    }));

    // Get teacher information if teacherId is provided
    let teacher = { id: teacherId, fullName: "Default Teacher" };
    if (teacherId && teacherId !== 1) {
      const teacherData = await prisma.teacher.findFirst({
        where: { 
          id: parseInt(teacherId),
          schoolId: schoolId 
        },
        select: { id: true, fullName: true }
      });
      if (teacherData) {
        teacher = teacherData;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Teacher attendance data retrieved successfully",
      data: {
        teacher,
        classesTaught: formattedClasses,
        schoolId: schoolId
      },
    });
  } catch (error) {
    console.error("Error in teacher attendance management:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get attendance management data",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Export attendance data as CSV
 */
export const exportAttendanceData = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { date, className, section } = req.query;

    if (!date || !className) {
      return res.status(400).json({
        success: false,
        message: "Date and class name are required",
      });
    }

    const attendanceDate = new Date(date);

    // Get attendance records with school context
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
        },
        className,
        schoolId: schoolId, // Added school context
        ...(section && { section }),
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            admissionNo: true,
            sessionInfo: {
              select: {
                currentRollNo: true
              }
            }
          },
        },
      },
      orderBy: {
        student: {
          admissionNo: 'asc',
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
      const studentName = record.student.fullName;
      const rollNumber = record.student.sessionInfo?.currentRollNo || '';
      const admissionNo = record.student.admissionNo || '';
      const status = record.status;
      const notes = record.notes ? `"${record.notes.replace(/"/g, '""')}"` : '';

      return `${rollNumber},${admissionNo},"${studentName}",${status},${notes}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_${className}_${section || 'all'}_${formattedDate}.csv"`);

    // Send the CSV data
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Error exporting attendance data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export attendance data",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
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

/**
 * Get monthly attendance report for a class
 */
export const getMonthlyAttendanceReport = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { year, month, className, section } = req.query;

    if (!year || !month || !className) {
      return res.status(400).json({
        success: false,
        message: "Year, month, and class name are required",
      });
    }

    // Calculate start and end dates for the month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    // Get attendance records for the month
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        className,
        schoolId: schoolId,
        ...(section && { section }),
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            admissionNo: true,
            sessionInfo: {
              select: {
                currentRollNo: true
              }
            }
          },
        },
      },
      orderBy: [
        { date: 'asc' },
        { student: { admissionNo: 'asc' } }
      ],
    });

    // Get all students in the class for complete report
    const allStudents = await prisma.student.findMany({
      where: {
        schoolId: schoolId,
        sessionInfo: {
          currentClass: className,
          ...(section && { currentSection: section }),
        }
      },
      select: {
        id: true,
        fullName: true,
        admissionNo: true,
        sessionInfo: {
          select: {
            currentRollNo: true
          }
        }
      },
      orderBy: {
        admissionNo: 'asc'
      }
    });

    // Create a comprehensive report
    const studentReports = allStudents.map(student => {
      const studentRecords = attendanceRecords.filter(record => record.studentId === student.id);
      
      const totalDays = studentRecords.length;
      const presentDays = studentRecords.filter(record => record.status === 'PRESENT').length;
      const absentDays = studentRecords.filter(record => record.status === 'ABSENT').length;
      const lateDays = studentRecords.filter(record => record.status === 'LATE').length;
      
      const attendancePercentage = totalDays > 0 
        ? ((presentDays + lateDays) / totalDays * 100).toFixed(2) 
        : 0;

      return {
        student: {
          id: student.id,
          name: student.fullName,
          admissionNo: student.admissionNo,
          rollNumber: student.sessionInfo?.currentRollNo || ''
        },
        attendance: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          attendancePercentage
        },
        dailyRecords: studentRecords.map(record => ({
          date: record.date.toISOString().split('T')[0],
          status: record.status,
          notes: record.notes
        }))
      };
    });

    // Calculate class statistics
    const totalWorkingDays = Math.max(...studentReports.map(sr => sr.attendance.totalDays), 0);
    const classStats = {
      totalStudents: allStudents.length,
      totalWorkingDays,
      averageAttendance: studentReports.length > 0 
        ? (studentReports.reduce((sum, sr) => sum + parseFloat(sr.attendance.attendancePercentage), 0) / studentReports.length).toFixed(2)
        : 0
    };

    return res.status(200).json({
      success: true,
      message: "Monthly attendance report retrieved successfully",
      data: {
        reportInfo: {
          year: parseInt(year),
          month: parseInt(month),
          monthName: new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' }),
          className,
          section: section || 'All Sections',
          schoolId
        },
        classStats,
        studentReports,
        meta: {
          generatedAt: new Date().toISOString(),
          totalRecords: attendanceRecords.length
        }
      }
    });
  } catch (error) {
    console.error("Error generating monthly attendance report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate monthly attendance report",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get attendance summary for all classes in a school
 */
export const getSchoolAttendanceSummary = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    // Get all attendance records for the school in the date range
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        schoolId: schoolId,
      },
      include: {
        student: {
          select: {
            sessionInfo: {
              select: {
                currentClass: true,
                currentSection: true
              }
            }
          }
        }
      }
    });

    // Group by class and section
    const classStats = {};
    attendanceRecords.forEach(record => {
      const className = record.className;
      const section = record.section || 'No Section';
      const key = `${className}-${section}`;
      
      if (!classStats[key]) {
        classStats[key] = {
          className,
          section: record.section,
          totalRecords: 0,
          present: 0,
          absent: 0,
          late: 0
        };
      }
      
      classStats[key].totalRecords++;
      
      switch (record.status) {
        case 'PRESENT':
          classStats[key].present++;
          break;
        case 'ABSENT':
          classStats[key].absent++;
          break;
        case 'LATE':
          classStats[key].late++;
          break;
      }
    });

    // Calculate percentages and format response
    const formattedStats = Object.values(classStats).map(stat => ({
      ...stat,
      attendanceRate: stat.totalRecords > 0 
        ? (((stat.present + stat.late) / stat.totalRecords) * 100).toFixed(2)
        : 0
    })).sort((a, b) => a.className.localeCompare(b.className));

    // Overall school statistics
    const totalRecords = attendanceRecords.length;
    const totalPresent = attendanceRecords.filter(record => record.status === 'PRESENT').length;
    const totalAbsent = attendanceRecords.filter(record => record.status === 'ABSENT').length;
    const totalLate = attendanceRecords.filter(record => record.status === 'LATE').length;
    
    const overallAttendanceRate = totalRecords > 0 
      ? (((totalPresent + totalLate) / totalRecords) * 100).toFixed(2)
      : 0;

    return res.status(200).json({
      success: true,
      message: "School attendance summary retrieved successfully",
      data: {
        schoolStats: {
          totalRecords,
          totalPresent,
          totalAbsent,
          totalLate,
          overallAttendanceRate
        },
        classWiseStats: formattedStats,
        meta: {
          schoolId,
          dateRange: {
            startDate,
            endDate
          },
          generatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error("Error generating school attendance summary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate school attendance summary",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get detailed student attendance report with analytics
 */
export const getDetailedStudentReport = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { studentId, startDate, endDate } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Verify student belongs to the school
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId: schoolId
      },
      select: {
        id: true,
        fullName: true,
        admissionNo: true,
        sessionInfo: {
          select: {
            currentClass: true,
            currentSection: true,
            currentRollNo: true
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in your school",
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
        studentId: studentId,
        schoolId: schoolId,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      include: {
        teacher: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Calculate detailed statistics
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => record.status === 'PRESENT').length;
    const absentDays = attendanceRecords.filter(record => record.status === 'ABSENT').length;
    const lateDays = attendanceRecords.filter(record => record.status === 'LATE').length;
    
    const attendancePercentage = totalDays > 0 
      ? ((presentDays + lateDays) / totalDays * 100).toFixed(2) 
      : 0;

    // Monthly breakdown
    const monthlyStats = {};
    attendanceRecords.forEach(record => {
      const monthKey = record.date.toISOString().substring(0, 7); // YYYY-MM
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          month: monthKey,
          total: 0,
          present: 0,
          absent: 0,
          late: 0
        };
      }
      
      monthlyStats[monthKey].total++;
      
      switch (record.status) {
        case 'PRESENT':
          monthlyStats[monthKey].present++;
          break;
        case 'ABSENT':
          monthlyStats[monthKey].absent++;
          break;
        case 'LATE':
          monthlyStats[monthKey].late++;
          break;
      }
    });

    // Add percentage to monthly stats
    const formattedMonthlyStats = Object.values(monthlyStats).map(stat => ({
      ...stat,
      attendanceRate: stat.total > 0 
        ? (((stat.present + stat.late) / stat.total) * 100).toFixed(2)
        : 0
    })).sort((a, b) => a.month.localeCompare(b.month));

    return res.status(200).json({
      success: true,
      message: "Detailed student attendance report retrieved successfully",
      data: {
        student: {
          id: student.id,
          name: student.fullName,
          admissionNo: student.admissionNo,
          class: student.sessionInfo?.currentClass,
          section: student.sessionInfo?.currentSection,
          rollNumber: student.sessionInfo?.currentRollNo
        },
        overallStats: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          attendancePercentage
        },
        monthlyBreakdown: formattedMonthlyStats,
        recentRecords: attendanceRecords.slice(0, 10).map(record => ({
          date: record.date.toISOString().split('T')[0],
          status: record.status,
          notes: record.notes,
          markedBy: record.teacher?.fullName || 'Unknown'
        })),
        meta: {
          schoolId,
          dateRange: {
            startDate: startDate || 'All time',
            endDate: endDate || 'All time'
          },
          generatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error("Error generating detailed student report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate detailed student report",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
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
  getMonthlyAttendanceReport,
  getSchoolAttendanceSummary,
  getDetailedStudentReport,
}; 