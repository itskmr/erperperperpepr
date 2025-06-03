import { PrismaClient } from "@prisma/client";
import { getSchoolIdFromContext } from "../middlewares/authMiddleware.js";

const prisma = new PrismaClient();

/**
 * Get all teachers for attendance marking (with school isolation)
 */
export const getTeachersForAttendance = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { department, designation } = req.query;

    // Build where condition with school isolation
    let whereCondition = {
      schoolId: schoolId,
      status: 'active' // Only get active teachers
    };

    // Add filters if provided
    if (department) {
      whereCondition.subjects = {
        contains: department
      };
    }

    if (designation) {
      whereCondition.designation = designation;
    }

    // Get teachers from the database
    const teachers = await prisma.teacher.findMany({
      where: whereCondition,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        designation: true,
        subjects: true,
        isClassIncharge: true,
        inchargeClass: true,
        inchargeSection: true,
        profileImage: true,
        status: true
      },
      orderBy: {
        fullName: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      message: "Teachers retrieved successfully",
      data: teachers,
      meta: {
        schoolId: schoolId,
        totalCount: teachers.length,
        filters: {
          department: department || 'All',
          designation: designation || 'All'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching teachers for attendance:', error);
    return res.status(500).json({
      success: false,
      message: "Error fetching teachers",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get teacher attendance for a specific date (with school isolation)
 */
export const getTeacherAttendanceByDate = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const attendanceDate = new Date(date);

    // Get all teachers with their attendance status for the date
    const teachers = await prisma.teacher.findMany({
      where: {
        schoolId: schoolId,
        status: 'active'
      },
      include: {
        teacherAttendance: {
          where: {
            date: attendanceDate,
            schoolId: schoolId
          }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });

    // Format the response to include attendance status
    const teachersWithAttendance = teachers.map(teacher => {
      const attendance = teacher.teacherAttendance[0]; // Should be only one record per date
      
      return {
        id: teacher.id,
        fullName: teacher.fullName,
        email: teacher.email,
        designation: teacher.designation,
        subjects: teacher.subjects,
        isClassIncharge: teacher.isClassIncharge,
        inchargeClass: teacher.inchargeClass,
        inchargeSection: teacher.inchargeSection,
        profileImage: teacher.profileImage,
        attendance: attendance ? {
          id: attendance.id,
          status: attendance.status,
          notes: attendance.notes,
          checkInTime: attendance.checkInTime,
          checkOutTime: attendance.checkOutTime,
          workingHours: attendance.workingHours,
          markedAt: attendance.markedAt
        } : null
      };
    });

    // Calculate statistics
    const totalTeachers = teachersWithAttendance.length;
    const presentCount = teachersWithAttendance.filter(t => t.attendance?.status === 'PRESENT').length;
    const absentCount = teachersWithAttendance.filter(t => t.attendance?.status === 'ABSENT').length;
    const lateCount = teachersWithAttendance.filter(t => t.attendance?.status === 'LATE').length;
    const notMarkedCount = totalTeachers - (presentCount + absentCount + lateCount);

    return res.status(200).json({
      success: true,
      message: "Teacher attendance retrieved successfully",
      data: {
        teachers: teachersWithAttendance,
        statistics: {
          total: totalTeachers,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          notMarked: notMarkedCount,
          attendanceRate: totalTeachers > 0 ? ((presentCount + lateCount) / totalTeachers * 100).toFixed(2) : 0
        },
        date: date,
        schoolId: schoolId
      }
    });
  } catch (error) {
    console.error("Error fetching teacher attendance by date:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch teacher attendance",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Mark teacher attendance (with school isolation and validation)
 */
export const markTeacherAttendance = async (req, res) => {
  try {
    console.log("Received teacher attendance request body:", JSON.stringify(req.body, null, 2));
    
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { date, attendanceData } = req.body;

    // Basic validation
    if (!date || !attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields or invalid data format",
        requiredFields: {
          date: "YYYY-MM-DD format required",
          attendanceData: "Array of teacher attendance records required"
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

    const attendanceDate = new Date(date);
    const markedByUserId = req.user?.id || null;

    // Process attendance records
    const createdRecords = [];
    const updatedRecords = [];
    const errors = [];

    console.log(`Processing ${attendanceData.length} teacher attendance records for school: ${schoolId}`);
    
    for (const item of attendanceData) {
      try {
        // Skip invalid records
        if (!item.teacherId || !item.status) {
          console.log("Skipping invalid record:", item);
          continue;
        }
        
        // Validate teacher belongs to the school
        const teacher = await prisma.teacher.findFirst({
          where: {
            id: item.teacherId,
            schoolId: schoolId
          },
          select: { id: true, fullName: true, schoolId: true }
        });
        
        if (!teacher) {
          console.error(`Teacher ${item.teacherId} not found in school ${schoolId}`);
          errors.push({
            teacherId: item.teacherId,
            error: "Teacher not found in your school",
            details: { message: "Teacher does not belong to your school" }
          });
          continue;
        }
        
        // Validate status enum value
        if (!['PRESENT', 'ABSENT', 'LATE'].includes(item.status)) {
          errors.push({
            teacherId: item.teacherId,
            error: "Invalid status value",
            details: { message: "Status must be PRESENT, ABSENT, or LATE" }
          });
          continue;
        }

        // Check for existing attendance record
        const existingRecord = await prisma.teacherAttendance.findUnique({
          where: {
            date_teacherId: {
              date: attendanceDate,
              teacherId: teacher.id
            }
          }
        });

        if (existingRecord) {
          // Update existing record
          const updatedRecord = await prisma.teacherAttendance.update({
            where: {
              id: existingRecord.id
            },
            data: {
              status: item.status,
              notes: item.notes || null,
              checkInTime: item.checkInTime ? new Date(item.checkInTime) : null,
              checkOutTime: item.checkOutTime ? new Date(item.checkOutTime) : null,
              workingHours: item.workingHours || null,
              markedByUserId: markedByUserId,
              markedAt: new Date(),
              updatedAt: new Date()
            },
            include: {
              teacher: {
                select: { fullName: true }
              }
            }
          });

          updatedRecords.push({
            id: updatedRecord.id,
            teacherId: updatedRecord.teacherId,
            teacherName: updatedRecord.teacher.fullName,
            status: updatedRecord.status,
            action: 'updated'
          });
        } else {
          // Create new attendance record
          const attendanceRecord = await prisma.teacherAttendance.create({
            data: {
              teacherId: teacher.id,
              schoolId: schoolId,
              date: attendanceDate,
              status: item.status,
              notes: item.notes || null,
              checkInTime: item.checkInTime ? new Date(item.checkInTime) : null,
              checkOutTime: item.checkOutTime ? new Date(item.checkOutTime) : null,
              workingHours: item.workingHours || null,
              markedByUserId: markedByUserId,
              markedAt: new Date()
            },
            include: {
              teacher: {
                select: { fullName: true }
              }
            }
          });

          createdRecords.push({
            id: attendanceRecord.id,
            teacherId: attendanceRecord.teacherId,
            teacherName: attendanceRecord.teacher.fullName,
            status: attendanceRecord.status,
            action: 'created'
          });
        }

      } catch (recordError) {
        console.error(`Error processing attendance record for teacher ${item.teacherId}:`, recordError);
        errors.push({
          teacherId: item.teacherId,
          error: "Failed to process attendance record",
          details: { message: recordError.message }
        });
      }
    }

    const totalProcessed = createdRecords.length + updatedRecords.length;
    const response = {
      success: true,
      message: `Teacher attendance processed successfully. ${createdRecords.length} created, ${updatedRecords.length} updated`,
      data: {
        created: createdRecords,
        updated: updatedRecords,
        errors: errors,
        summary: {
          totalProcessed: attendanceData.length,
          successfullyProcessed: totalProcessed,
          created: createdRecords.length,
          updated: updatedRecords.length,
          errors: errors.length,
          date: date,
          schoolId: schoolId
        }
      }
    };

    if (errors.length > 0) {
      response.message += ` (${errors.length} errors occurred)`;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error marking teacher attendance:", error);
    return res.status(500).json({
      success: false,
      message: "Error marking teacher attendance",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Generate teacher attendance report (with school isolation)
 */
export const generateTeacherAttendanceReport = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { startDate, endDate, teacherId, department, reportType = 'summary' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Build where condition for teachers
    let teacherWhereCondition = {
      schoolId: schoolId,
      status: 'active'
    };

    if (teacherId) {
      teacherWhereCondition.id = parseInt(teacherId);
    }

    if (department) {
      teacherWhereCondition.subjects = {
        contains: department
      };
    }

    // Get teachers with their attendance records
    const teachers = await prisma.teacher.findMany({
      where: teacherWhereCondition,
      include: {
        teacherAttendance: {
          where: {
            date: {
              gte: startDateObj,
              lte: endDateObj,
            },
            schoolId: schoolId
          },
          orderBy: {
            date: 'asc'
          }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });

    if (reportType === 'detailed') {
      // Detailed report with day-by-day breakdown
      const detailedReport = teachers.map(teacher => {
        const attendanceRecords = teacher.teacherAttendance;
        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(record => record.status === 'PRESENT').length;
        const absentDays = attendanceRecords.filter(record => record.status === 'ABSENT').length;
        const lateDays = attendanceRecords.filter(record => record.status === 'LATE').length;
        const attendanceRate = totalDays > 0 ? ((presentDays + lateDays) / totalDays * 100).toFixed(2) : 0;

        return {
          teacher: {
            id: teacher.id,
            fullName: teacher.fullName,
            email: teacher.email,
            designation: teacher.designation,
            subjects: teacher.subjects,
            isClassIncharge: teacher.isClassIncharge,
            inchargeClass: teacher.inchargeClass,
            inchargeSection: teacher.inchargeSection
          },
          summary: {
            totalDays,
            presentDays,
            absentDays,
            lateDays,
            attendanceRate
          },
          dailyRecords: attendanceRecords.map(record => ({
            date: record.date.toISOString().split('T')[0],
            status: record.status,
            notes: record.notes,
            checkInTime: record.checkInTime,
            checkOutTime: record.checkOutTime,
            workingHours: record.workingHours
          }))
        };
      });

      return res.status(200).json({
        success: true,
        message: "Detailed teacher attendance report generated successfully",
        data: {
          reportType: 'detailed',
          teachers: detailedReport,
          meta: {
            schoolId,
            dateRange: { startDate, endDate },
            filters: { teacherId, department },
            generatedAt: new Date().toISOString()
          }
        }
      });
    } else {
      // Summary report
      const summaryReport = teachers.map(teacher => {
        const attendanceRecords = teacher.teacherAttendance;
        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(record => record.status === 'PRESENT').length;
        const absentDays = attendanceRecords.filter(record => record.status === 'ABSENT').length;
        const lateDays = attendanceRecords.filter(record => record.status === 'LATE').length;
        const attendanceRate = totalDays > 0 ? ((presentDays + lateDays) / totalDays * 100).toFixed(2) : 0;

        return {
          teacher: {
            id: teacher.id,
            fullName: teacher.fullName,
            email: teacher.email,
            designation: teacher.designation,
            subjects: teacher.subjects,
            isClassIncharge: teacher.isClassIncharge,
            inchargeClass: teacher.inchargeClass,
            inchargeSection: teacher.inchargeSection
          },
          attendance: {
            totalDays,
            presentDays,
            absentDays,
            lateDays,
            attendanceRate
          }
        };
      });

      // Calculate overall statistics
      const totalTeachers = summaryReport.length;
      const avgAttendanceRate = summaryReport.length > 0 
        ? (summaryReport.reduce((sum, t) => sum + parseFloat(t.attendance.attendanceRate), 0) / summaryReport.length).toFixed(2)
        : 0;

      return res.status(200).json({
        success: true,
        message: "Teacher attendance summary report generated successfully",
        data: {
          reportType: 'summary',
          overallStats: {
            totalTeachers,
            averageAttendanceRate: avgAttendanceRate
          },
          teachers: summaryReport,
          meta: {
            schoolId,
            dateRange: { startDate, endDate },
            filters: { teacherId, department },
            generatedAt: new Date().toISOString()
          }
        }
      });
    }
  } catch (error) {
    console.error("Error generating teacher attendance report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate teacher attendance report",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get teacher attendance dashboard data (with school isolation)
 */
export const getTeacherAttendanceDashboard = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Get today's attendance statistics
    const todayAttendance = await prisma.teacherAttendance.findMany({
      where: {
        date: today,
        schoolId: schoolId
      }
    });

    // Get this month's attendance statistics
    const monthlyAttendance = await prisma.teacherAttendance.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        schoolId: schoolId
      }
    });

    // Get total teachers count
    const totalTeachers = await prisma.teacher.count({
      where: {
        schoolId: schoolId,
        status: 'active'
      }
    });

    // Calculate today's statistics
    const todayStats = {
      total: totalTeachers,
      present: todayAttendance.filter(a => a.status === 'PRESENT').length,
      absent: todayAttendance.filter(a => a.status === 'ABSENT').length,
      late: todayAttendance.filter(a => a.status === 'LATE').length,
      notMarked: totalTeachers - todayAttendance.length
    };

    // Calculate monthly statistics
    const monthlyStats = {
      totalRecords: monthlyAttendance.length,
      present: monthlyAttendance.filter(a => a.status === 'PRESENT').length,
      absent: monthlyAttendance.filter(a => a.status === 'ABSENT').length,
      late: monthlyAttendance.filter(a => a.status === 'LATE').length,
      avgAttendanceRate: monthlyAttendance.length > 0 
        ? ((monthlyAttendance.filter(a => ['PRESENT', 'LATE'].includes(a.status)).length / monthlyAttendance.length) * 100).toFixed(2)
        : 0
    };

    return res.status(200).json({
      success: true,
      message: "Teacher attendance dashboard data retrieved successfully",
      data: {
        todayStats,
        monthlyStats,
        schoolInfo: {
          schoolId,
          totalTeachers
        },
        meta: {
          today: today.toISOString().split('T')[0],
          currentMonth: {
            start: startOfMonth.toISOString().split('T')[0],
            end: endOfMonth.toISOString().split('T')[0]
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching teacher attendance dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch teacher attendance dashboard",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Export teacher attendance data as CSV (with school isolation)
 */
export const exportTeacherAttendanceData = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    const { startDate, endDate, teacherId, department } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    // Build where condition
    let whereCondition = {
      schoolId: schoolId,
      status: 'active'
    };

    if (teacherId) {
      whereCondition.id = parseInt(teacherId);
    }

    if (department) {
      whereCondition.subjects = {
        contains: department
      };
    }

    // Get teacher attendance data
    const teachers = await prisma.teacher.findMany({
      where: whereCondition,
      include: {
        teacherAttendance: {
          where: {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            },
            schoolId: schoolId
          },
          orderBy: {
            date: 'asc'
          }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });

    if (teachers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No teacher attendance data found for the specified criteria",
      });
    }

    // Generate CSV data
    const csvHeader = 'Teacher Name,Email,Designation,Date,Status,Check In,Check Out,Working Hours,Notes\n';
    
    const csvRows = teachers.flatMap(teacher => 
      teacher.teacherAttendance.map(attendance => {
        const teacherName = `"${teacher.fullName.replace(/"/g, '""')}"`;
        const email = teacher.email || '';
        const designation = teacher.designation || '';
        const date = attendance.date.toISOString().split('T')[0];
        const status = attendance.status;
        const checkIn = attendance.checkInTime ? attendance.checkInTime.toISOString() : '';
        const checkOut = attendance.checkOutTime ? attendance.checkOutTime.toISOString() : '';
        const workingHours = attendance.workingHours || '';
        const notes = attendance.notes ? `"${attendance.notes.replace(/"/g, '""')}"` : '';

        return `${teacherName},${email},${designation},${date},${status},${checkIn},${checkOut},${workingHours},${notes}`;
      })
    ).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for CSV download
    const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
    const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="teacher_attendance_${formattedStartDate}_to_${formattedEndDate}.csv"`);

    // Send the CSV data
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Error exporting teacher attendance data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export teacher attendance data",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

export default {
  getTeachersForAttendance,
  getTeacherAttendanceByDate,
  markTeacherAttendance,
  generateTeacherAttendanceReport,
  getTeacherAttendanceDashboard,
  exportTeacherAttendanceData
}; 