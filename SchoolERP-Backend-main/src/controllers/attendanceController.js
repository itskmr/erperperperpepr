import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get students by class for marking attendance
 */
export const getStudentsByClass = async (req, res) => {
  try {
    const { className, section } = req.query;
    
    // Make className optional
    let whereCondition = {};
    
    if (className) {
      whereCondition.className = className;
      if (section) {
        whereCondition.section = section;
      }
    }

    // Get students from the database
    const students = await prisma.student.findMany({
      where: whereCondition,
      select: {
        id: true,
        fullName: true,
        rollNumber: true,
        admissionNo: true,
        className: true,
        section: true,
      },
      orderBy: {
        // If no className provided, order by className first, then rollNumber
        ...(className ? { rollNumber: 'asc' } : [
          { className: 'asc' },
          { rollNumber: 'asc' }
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
          : "No students found in the database",
      });
    }

    // Format student names to include full name
    const formattedStudents = students.map(student => ({
      ...student,
      name: student.fullName,
    }));

    return res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      data: formattedStudents,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: error.message
    });
  }
};

/**
 * Mark attendance for students - simplified approach with detailed logging
 */
export const markAttendance = async (req, res) => {
  try {
    console.log("Received attendance request body:", JSON.stringify(req.body, null, 2));
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

    // Convert and validate teacherId
    let teacherIdNum;
    try {
      teacherIdNum = Number(teacherId);
      if (isNaN(teacherIdNum) || teacherIdNum <= 0) {
        // If teacherId is invalid, we'll try to find a valid teacher
        const firstTeacher = await prisma.teacher.findFirst();
        if (firstTeacher) {
          teacherIdNum = firstTeacher.id;
          console.log(`Using default teacher ID: ${teacherIdNum}`);
        } else {
          return res.status(400).json({
            success: false,
            message: "No valid teacher found in the system. Please add a teacher first."
          });
        }
      } else {
        // Verify teacher exists
        const teacherExists = await prisma.teacher.findUnique({
          where: { id: teacherIdNum },
          select: { id: true }
        });
        
        if (!teacherExists) {
          // Try to find any valid teacher as fallback
          const fallbackTeacher = await prisma.teacher.findFirst();
          if (fallbackTeacher) {
            teacherIdNum = fallbackTeacher.id;
            console.log(`Teacher ID ${teacherId} not found, using fallback teacher: ${teacherIdNum}`);
          } else {
            return res.status(400).json({
              success: false,
              message: "Teacher ID does not exist and no fallback teacher found."
            });
          }
        }
      }
    } catch (error) {
      console.error("Error validating teacher:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID format",
        error: error.message
      });
    }
    
    // Delete any existing attendance records for this date and class
    try {
      console.log(`Deleting existing attendance records for ${date}, ${className}`);
      const deleteResult = await prisma.attendance.deleteMany({
        where: {
          date: {
            gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
            lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
          },
          className,
          ...(section && { section }),
        },
      });
      console.log("Deleted records:", deleteResult);
    } catch (deleteError) {
      console.error("Error deleting existing records:", deleteError);
      // Continue processing even if delete fails
    }

    // Create attendance records one by one without a transaction
    const createdRecords = [];
    const errors = [];

    console.log(`Processing ${attendanceData.length} attendance records with teacher ID: ${teacherIdNum}`);
    
    for (const item of attendanceData) {
      try {
        // Skip invalid records
        if (!item.studentId || !item.status) {
          console.log("Skipping invalid record:", item);
          continue;
        }
        
        // Validate studentId
        let studentId;
        try {
          studentId = Number(item.studentId);
          if (isNaN(studentId) || studentId <= 0) {
            throw new Error("Invalid student ID");
          }
        } catch (err) {
          console.error(`Invalid student ID: ${item.studentId}`);
          errors.push({
            studentId: item.studentId,
            error: "Invalid student ID format",
            details: { message: err.message }
          });
          continue;
        }
        
        // Validate status enum value
        let status = item.status;
        try {
          if (!['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].includes(status)) {
            console.log(`Invalid status "${status}" for student ${studentId}, defaulting to PRESENT`);
            status = 'PRESENT';
          }
        } catch (statusError) {
          console.error(`Status validation error for student ${studentId}:`, statusError);
          status = 'PRESENT'; // Safe default
        }

        console.log(`Creating attendance for student ${studentId}, status ${status}`);
        
        // Verify student exists
        const studentExists = await prisma.student.findUnique({
          where: { id: studentId },
          select: { id: true }
        });

        if (!studentExists) {
          throw new Error(`Student with ID ${studentId} does not exist`);
        }
        
        // Create the record with minimal fields and explicit type conversions
        try {
          const record = await prisma.attendance.create({
            data: {
              date: new Date(date),
              status: status,
              notes: item.notes || null,
              studentId: studentId,
              teacherId: teacherIdNum,
              className: className,
              section: section || null,
            },
          });
          
          console.log(`Successfully created record ID ${record.id}`);
          createdRecords.push(record);
        } catch (createError) {
          console.error(`Database error creating attendance for student ${studentId}:`, createError);
          
          // Detailed error handling
          if (createError.code === 'P2003') {
            const constraintField = createError.meta?.field_name || '';
            if (constraintField.includes('teacherId')) {
              throw new Error(`Teacher with ID ${teacherIdNum} does not exist. Please use a valid teacher ID.`);
            } else if (constraintField.includes('studentId')) {
              throw new Error(`Student with ID ${studentId} does not exist. Please check student ID.`);
            } else {
              throw new Error(`Foreign key constraint failed: ${constraintField}`);
            }
          } else if (createError.code === 'P2002') {
            throw new Error(`Unique constraint violation - record may already exist`);
          } else if (createError.message.includes('Enumeration')) {
            throw new Error(`Invalid status value: ${status}. Must be one of: PRESENT, ABSENT, LATE, EXCUSED`);
          } else {
            throw createError; // Re-throw if it's not a specific error we want to handle
          }
        }
      } catch (itemError) {
        console.error(`Error creating attendance for student ${item.studentId}:`, itemError);
        errors.push({
          studentId: item.studentId,
          error: itemError.message,
          details: itemError.meta || {}
        });
      }
    }

    if (createdRecords.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to create any attendance records",
        errors: errors
      });
    }

    return res.status(201).json({
      success: true,
      message: `Attendance marked successfully. Created ${createdRecords.length} records.`,
      data: createdRecords,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark attendance due to server error",
      error: error.message,
      details: error.meta || {}
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