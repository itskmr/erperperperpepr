import { PrismaClient } from "@prisma/client";
import { getSchoolIdFromContext, addSchoolFilter } from "../middlewares/authMiddleware.js";

const prisma = new PrismaClient();

/**
 * Get comprehensive dashboard statistics
 * Includes counts for all major entities with school_id filtering
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Get school ID from authenticated user context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required. Please ensure you're logged in properly."
      });
    }

    // Get school information
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { 
        id: true, 
        schoolName: true,
        address: true,
        contact: true,
        email: true
      }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found"
      });
    }

    // Prepare base filter for all queries
    const baseFilter = addSchoolFilter(req);

    // Execute all count queries with individual error handling for better resilience
    const counts = {
      totalStudents: 0,
      totalTeachers: 0,
      totalVehicles: 0,
      totalDrivers: 0,
      totalRoutes: 0,
      totalFeesCollected: 0,
      totalFeesPending: 0,
      totalFeesAmount: 0,
      totalExpenses: 0,
      activeStudents: 0,
      activeTeachers: 0
    };

    // Student counts
    try {
      counts.totalStudents = await prisma.student.count({ where: baseFilter });
      counts.activeStudents = await prisma.student.count({ 
        where: { ...baseFilter, loginEnabled: true } 
      });
    } catch (error) {
      console.warn("Student table queries failed:", error.message);
    }

    // Teacher counts  
    try {
      counts.totalTeachers = await prisma.teacher.count({ where: baseFilter });
      counts.activeTeachers = await prisma.teacher.count({ 
        where: { ...baseFilter, status: 'active' } 
      });
    } catch (error) {
      console.warn("Teacher table queries failed:", error.message);
    }

    // Vehicle (Bus) counts
    try {
      counts.totalVehicles = await prisma.bus.count({ where: baseFilter });
    } catch (error) {
      console.warn("Bus table query failed:", error.message);
    }

    // Driver counts
    try {
      counts.totalDrivers = await prisma.driver.count({ where: baseFilter });
    } catch (error) {
      console.warn("Driver table query failed:", error.message);
    }

    // Route counts
    try {
      counts.totalRoutes = await prisma.route.count({ where: baseFilter });
    } catch (error) {
      console.warn("Route table query failed:", error.message);
    }

    // Fee calculations
    try {
      const totalFeesCollected = await prisma.fee.aggregate({
        where: { ...baseFilter, status: 'Paid' },
        _sum: { totalFees: true }
      });
      counts.totalFeesCollected = totalFeesCollected._sum.totalFees || 0;

      const totalFeesPending = await prisma.fee.aggregate({
        where: { ...baseFilter, status: 'Pending' },
        _sum: { totalFees: true }
      });
      counts.totalFeesPending = totalFeesPending._sum.totalFees || 0;

      const totalFeesAmount = await prisma.fee.aggregate({
        where: baseFilter,
        _sum: { totalFees: true }
      });
      counts.totalFeesAmount = totalFeesAmount._sum.totalFees || 0;
    } catch (error) {
      console.warn("Fee table queries failed:", error.message);
    }

    // Expense calculations
    try {
      const totalExpenses = await prisma.expense.aggregate({
        where: baseFilter,
        _sum: { amount: true }
      });
      counts.totalExpenses = totalExpenses._sum.amount || 0;
    } catch (error) {
      console.warn("Expense table query failed:", error.message);
    }

    // Get recent activity (last 10 activities)
    const recentActivities = await getRecentActivities(schoolId);

    // Get monthly fee collection data for charts
    const monthlyFeeData = await getMonthlyFeeData(schoolId);

    const stats = {
      school: {
        id: school.id,
        name: school.schoolName,
        address: school.address,
        contact: school.contact ? school.contact.toString() : "0",
        email: school.email
      },
      overview: {
        totalStudents: counts.totalStudents,
        totalTeachers: counts.totalTeachers,
        totalVehicles: counts.totalVehicles,
        totalDrivers: counts.totalDrivers,
        totalRoutes: counts.totalRoutes,
        activeStudents: counts.activeStudents,
        activeTeachers: counts.activeTeachers
      },
      financial: {
        totalFeesCollected: counts.totalFeesCollected,
        totalFeesPending: counts.totalFeesPending,
        totalFeesAmount: counts.totalFeesAmount,
        totalExpenses: counts.totalExpenses,
        netIncome: counts.totalFeesCollected - counts.totalExpenses
      },
      recentActivities,
      monthlyFeeData
    };

    return res.status(200).json({
      success: true,
      data: stats,
      message: "Dashboard statistics retrieved successfully",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get fee analytics data for charts and visualizations
 */
export const getFeeAnalytics = async (req, res) => {
  try {
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required"
      });
    }

    const { timeframe = '12months' } = req.query;
    
    // Get monthly fee collection vs pending data
    const monthlyData = await getMonthlyFeeAnalytics(schoolId, timeframe);
    
    // Get class-wise fee distribution
    const classWiseData = await getClassWiseFeeData(schoolId);
    
    // Get fee structure breakdown
    const feeStructureData = await getFeeStructureBreakdown(schoolId);

    return res.status(200).json({
      success: true,
      data: {
        monthlyTrends: monthlyData,
        classWiseDistribution: classWiseData,
        feeStructureBreakdown: feeStructureData
      },
      message: "Fee analytics retrieved successfully"
    });

  } catch (error) {
    console.error("Error fetching fee analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch fee analytics",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get quick access data for shortcuts
 */
export const getQuickAccessData = async (req, res) => {
  try {
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: "School context is required"
      });
    }

    // Get counts for various quick access items
    const baseFilter = addSchoolFilter(req);
    
    // Execute queries with error handling for each
    let pendingAdmissions = 0;
    let pendingFees = 0;
    let todayAttendance = 0;
    let pendingTCs = 0;

    try {
      // Pending student registrations - Registration doesn't have status field, so count all
      pendingAdmissions = await prisma.registration.count({ 
        where: baseFilter
      });
    } catch (error) {
      console.warn("Registration table query failed:", error.message);
      pendingAdmissions = 0;
    }

    try {
      // Pending fee payments - using correct status value
      pendingFees = await prisma.fee.count({ 
        where: { ...baseFilter, status: 'Pending' } 
      });
    } catch (error) {
      console.warn("Fee table query failed:", error.message);
      pendingFees = 0;
    }

    try {
      // Today's attendance records
      todayAttendance = await prisma.attendance.count({
        where: {
          ...baseFilter,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      });
    } catch (error) {
      console.warn("Attendance table query failed:", error.message);
      todayAttendance = 0;
    }

    try {
      // Pending Transfer Certificates - using correct field name tcstatus
      pendingTCs = await prisma.transferCertificate.count({
        where: { ...baseFilter, tcstatus: 0 } // 0=Draft, 1=Issued, 2=Cancelled
      });
    } catch (error) {
      console.warn("TransferCertificate table query failed:", error.message);
      pendingTCs = 0;
    }

    return res.status(200).json({
      success: true,
      data: {
        pendingAdmissions,
        pendingFees,
        todayAttendance,
        pendingTCs,
        shortcuts: [
          { name: 'Add Student', route: '/students/StudentRegistrationForm', icon: 'UserPlus', count: null },
          { name: 'Register Student', route: '/school/students/register/addNew', icon: 'FileText', count: pendingAdmissions },
          { name: 'Manage Students', route: '/school/students/manage-students', icon: 'Users', count: null },
          { name: 'Add TC', route: '/school/students/tc-form', icon: 'FileX', count: pendingTCs },
          { name: 'Add Vehicle', route: '/school/transport-management/vehicle-management', icon: 'Truck', count: null },
          { name: 'Transport Routes', route: '/school/transport-management/transport-routes', icon: 'MapPin', count: null },
          { name: 'Teacher Directory', route: '/school/faculty-management/teacher-directory', icon: 'GraduationCap', count: null },
          { name: 'Driver Directory', route: '/school/transport-management/driver-directory', icon: 'User', count: null },
          { name: 'Fee Structure', route: '/school/financial-management/fee-structure', icon: 'DollarSign', count: null },
          { name: 'Collect Fees', route: '/School/FeeCollection', icon: 'CreditCard', count: pendingFees },
          { name: 'Add Expense', route: '/School/ExpenseTracker', icon: 'Minus', count: null },
          { name: 'Bus Attendance ', route: '/school/transport-management/bus-attendance', icon: 'UserCheck', count: null },
          { name: 'Student Attendance', route: '/school/student-attendance', icon: 'Calendar', count: todayAttendance },
          { name: 'School Profile', route: '/school/profile', icon: 'School', count: null },
          { name: 'Timetable', route: '/school/administration/timetable', icon: 'Clock', count: null }
        ]
      },
      message: "Quick access data retrieved successfully"
    });

  } catch (error) {
    console.error("Error fetching quick access data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quick access data",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Helper function to get recent activities
async function getRecentActivities(schoolId) {
  try {
    const activities = [];

    // Get recent student registrations
    const recentStudents = await prisma.student.findMany({
      where: { schoolId },
      select: { 
        id: true, 
        fullName: true, 
        createdAt: true, 
        sessionInfo: {
          select: { currentClass: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    recentStudents.forEach(student => {
      activities.push({
        id: `student-${student.id}`,
        type: 'student_registration',
        title: 'New Student Registration',
        description: `${student.fullName} registered for ${student.sessionInfo?.currentClass || 'N/A'}`,
        timestamp: student.createdAt,
        icon: 'UserPlus'
      });
    });

    // Get recent fee payments - using correct status and field name
    const recentFees = await prisma.fee.findMany({
      where: { schoolId, status: 'Paid' },
      select: { id: true, studentName: true, totalFees: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 3
    });

    recentFees.forEach(fee => {
      activities.push({
        id: `fee-${fee.id}`,
        type: 'fee_payment',
        title: 'Fee Payment Received',
        description: `${fee.studentName} paid ₹${fee.totalFees}`,
        timestamp: fee.updatedAt,
        icon: 'CreditCard'
      });
    });

    // Sort all activities by timestamp
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return [];
  }
}

// Helper function to get monthly fee data
async function getMonthlyFeeData(schoolId) {
  try {
    const currentDate = new Date();
    const twelveMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 12, 1);

    const monthlyData = await prisma.fee.groupBy({
      by: ['createdAt'],
      where: {
        schoolId,
        createdAt: {
          gte: twelveMonthsAgo
        }
      },
      _sum: {
        totalFees: true // using correct field name
      },
      _count: {
        id: true
      }
    });

    // Process data by month
    const monthlyMap = {};
    
    monthlyData.forEach(item => {
      const month = new Date(item.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      if (!monthlyMap[month]) {
        monthlyMap[month] = { collected: 0, count: 0 };
      }
      monthlyMap[month].collected += item._sum.totalFees || 0;
      monthlyMap[month].count += item._count.id;
    });

    return Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      collected: data.collected,
      count: data.count
    }));

  } catch (error) {
    console.error("Error fetching monthly fee data:", error);
    return [];
  }
}

// Helper function for monthly fee analytics
async function getMonthlyFeeAnalytics(schoolId, timeframe) {
  try {
    const months = timeframe === '6months' ? 6 : 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Use regular Prisma queries instead of raw SQL to avoid field name issues
    const feeData = await prisma.fee.findMany({
      where: {
        schoolId: schoolId,
        createdAt: {
          gte: startDate
        }
      },
      select: {
        createdAt: true,
        status: true,
        totalFees: true
      }
    });

    const monthlyMap = {};
    
    feeData.forEach(fee => {
      const monthKey = new Date(fee.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit' 
      });
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { collected: 0, pending: 0 };
      }
      
      if (fee.status === 'Paid') {
        monthlyMap[monthKey].collected += fee.totalFees;
      } else if (fee.status === 'Pending') {
        monthlyMap[monthKey].pending += fee.totalFees;
      }
    });

    return Object.entries(monthlyMap).map(([month, data]) => ({
      month: new Date(month + '/01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      collected: data.collected,
      pending: data.pending
    }));

  } catch (error) {
    console.error("Error fetching monthly fee analytics:", error);
    return [];
  }
}

// Helper function for class-wise fee data
async function getClassWiseFeeData(schoolId) {
  try {
    const classData = await prisma.fee.groupBy({
      by: ['class'],
      where: { schoolId },
      _sum: { totalFees: true }, // using correct field name
      _count: { id: true }
    });

    return classData.map(item => ({
      name: item.class || 'Unknown',
      value: item._sum.totalFees || 0,
      count: item._count.id
    }));

  } catch (error) {
    console.error("Error fetching class-wise fee data:", error);
    return [];
  }
}

// Helper function for fee structure breakdown
async function getFeeStructureBreakdown(schoolId) {
  try {
    const feeStructures = await prisma.feeStructure.findMany({
      where: { schoolId },
      select: {
        className: true,
        totalAnnualFee: true,
        _count: {
          select: {
            categories: true
          }
        }
      }
    });

    return feeStructures.map(structure => ({
      name: structure.className,
      value: structure.totalAnnualFee,
      usage: structure._count.categories
    }));

  } catch (error) {
    console.error("Error fetching fee structure breakdown:", error);
    return [];
  }
} 