import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Enable full logging
});

async function testAttendanceDatabase() {
  try {
    console.log("Testing database connection...");
    
    // 1. Check if we can connect to the database
    const studentCount = await prisma.student.count();
    console.log(`Database connection successful. Found ${studentCount} students.`);

    // 2. Check the AttendanceStatus enum values
    console.log("Checking valid enum values...");
    try {
      const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
      console.log(`Should be using one of these statuses: ${validStatuses.join(', ')}`);
    } catch (err) {
      console.error("Error checking enum values:", err);
    }

    // 3. Try to create a test attendance record
    if (studentCount > 0) {
      console.log("Creating a test attendance record...");
      
      // Get a sample student
      const student = await prisma.student.findFirst();
      
      // Get or create a test teacher
      let teacher;
      const existingTeacher = await prisma.teacher.findFirst();
      if (existingTeacher) {
        teacher = existingTeacher;
      } else {
        console.log("No teachers found. Creating a test teacher...");
        try {
          teacher = await prisma.teacher.create({
            data: {
              fullName: "Test Teacher",
              email: "testteacher@example.com",
              password: "password123",
              class: "Class 1",
              subjects: "All",
              schoolId: 1,
            }
          });
          console.log("Created test teacher:", teacher);
        } catch (teacherErr) {
          console.error("Error creating test teacher:", teacherErr);
          console.log("Will try to proceed without teacher...");
        }
      }

      if (student) {
        try {
          // First delete any existing test records
          await prisma.attendance.deleteMany({
            where: {
              studentId: student.id,
              date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999)),
              },
            },
          });
          
          // Create a new test record
          const attendance = await prisma.attendance.create({
            data: {
              date: new Date(),
              status: "PRESENT",
              notes: "Test attendance record",
              studentId: student.id,
              teacherId: teacher ? teacher.id : 1,
              className: student.className || "Test Class",
              section: student.section || null,
            },
          });
          
          console.log("Successfully created attendance record:", attendance);
        } catch (error) {
          console.error("Error creating attendance record:", error);
          console.log("Error details:", JSON.stringify(error, null, 2));

          // Check for nested errors
          if (error.meta) {
            console.log("Meta information:", error.meta);
          }
        }
      } else {
        console.log("No students found to test with");
      }
    }

  } catch (error) {
    console.error("Database test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAttendanceDatabase().catch(e => {
  console.error("Unhandled error in test script:", e);
  process.exit(1);
}); 