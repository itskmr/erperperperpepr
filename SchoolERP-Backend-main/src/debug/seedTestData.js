import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    // Fetch school ID or create a default school
    let schoolId = 1;
    const schoolExists = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!schoolExists) {
      console.log("Creating a default school...");
      const school = await prisma.school.create({
        data: {
          fullName: "Test School",
          email: "test@school.com",
          password: "password123",
          code: "TS001",
        },
      });
      schoolId = school.id;
      console.log(`Created school with ID ${schoolId}`);
    }

    // Insert test students
    const testClasses = ["Class 1", "Class 2", "Class 3"];
    const testSections = ["A", "B"];
    
    for (let i = 1; i <= 10; i++) {
      const className = testClasses[Math.floor(Math.random() * testClasses.length)];
      const section = testSections[Math.floor(Math.random() * testSections.length)];
      
      await prisma.student.create({
        data: {
          firstName: `Student${i}`,
          lastName: `Test`,
          admissionNo: `ADM00${i}`,
          dateOfBirth: new Date(2005, 0, i),
          gender: i % 2 === 0 ? "Male" : "Female",
          mobileNumber: `123456789${i}`,
          className: className,
          section: section,
          rollNumber: `00${i}`,
          presentCity: "Test City",
          presentState: "Test State",
          fatherName: `Father of Student${i}`,
          motherName: `Mother of Student${i}`,
          schoolId: schoolId,
        },
      });
    }

    console.log("Successfully added 10 test students");
  } catch (error) {
    console.error("Error seeding test data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData(); 