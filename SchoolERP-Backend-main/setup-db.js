import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Connecting to database...");
    await prisma.$connect();
    console.log("Connected successfully!");

    // Create default school if it doesn't exist
    const defaultSchool = await prisma.school.upsert({
      where: { code: 'DEFAULT' },
      update: {},
      create: {
        fullName: "Default School",
        email: "default@school.com",
        password: "defaultpassword",
        code: "DEFAULT",
        principal: "Default Principal",
        address: "Default Address",
        contact: 1234567890,
        established: 2000
      }
    });
    
    console.log(`Default school ensured with ID: ${defaultSchool.id}`);
    
    // Create a test student if none exists
    const studentCount = await prisma.student.count();
    
    if (studentCount === 0) {
      const testStudent = await prisma.student.create({
        data: {
          fullName: "Test Student",
          dateOfBirth: new Date(),
          gender: "MALE",
          mobileNumber: "1234567890",
          admissionNo: `ADM-TEST-${Date.now()}`,
          className: "Test Class",
          city: "Test City",
          state: "Test State",
          fatherName: "Test Father",
          motherName: "Test Mother",
          school: { connect: { id: defaultSchool.id } },
        }
      });
      
      console.log(`Created test student with ID: ${testStudent.id}`);
    } else {
      console.log(`Database already has ${studentCount} students`);
    }

    console.log("Database setup complete!");
  } catch (error) {
    console.error("Database setup failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();