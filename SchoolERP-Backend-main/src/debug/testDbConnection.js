import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testDbConnection() {
  try {
    // Attempt to count students
    const studentCount = await prisma.student.count();
    console.log(`Database connection successful. Found ${studentCount} students.`);
    
    // Sample a few students if they exist
    if (studentCount > 0) {
      const sampleStudents = await prisma.student.findMany({
        take: 3,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          className: true,
          section: true,
        },
      });
      console.log("Sample students:", JSON.stringify(sampleStudents, null, 2));
    } else {
      console.log("No students found in the database.");
    }
  } catch (error) {
    console.error("Database connection error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDbConnection(); 