import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

async function testAttendanceMarking() {
  try {
    // Get a list of students
    const students = await prisma.student.findMany({
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        className: true,
        section: true,
      },
    });

    if (students.length === 0) {
      console.log("No students found. Please add some students first.");
      return;
    }

    console.log("Found students:", students);

    // Get or create a teacher
    let teacher;
    const existingTeacher = await prisma.teacher.findFirst();
    if (existingTeacher) {
      teacher = existingTeacher;
    } else {
      teacher = await prisma.teacher.create({
        data: {
          fullName: "Test Teacher",
          email: "teacher@test.com",
          password: "password123",
          class: JSON.stringify(["Class 1", "Class 2"]),
          subjects: JSON.stringify(["Math", "Science"]),
          schoolId: 1,
        },
      });
      console.log("Created test teacher:", teacher);
    }

    // Use the first student's class and section
    const firstStudent = students[0];
    const className = firstStudent.className;
    const section = firstStudent.section;

    console.log(`Using class: ${className}, section: ${section || 'None'}`);

    // Create attendance data
    const attendanceData = students.map(student => ({
      studentId: student.id,
      status: ["PRESENT", "ABSENT", "LATE", "EXCUSED"][Math.floor(Math.random() * 4)],
      notes: `Test note for ${student.firstName}`,
    }));

    console.log("Prepared attendance data:", attendanceData);

    // Make the API request directly
    const today = new Date().toISOString().split('T')[0];
    const requestBody = {
      date: today,
      className,
      section,
      teacherId: teacher.id,
      attendanceData,
    };

    console.log("Sending request:", JSON.stringify(requestBody, null, 2));

    try {
      const response = await axios.post(
        "http://localhost:5000/api/attendance/mark", 
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log("API Response:", response.data);
      console.log("Attendance marked successfully!");
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
    }
  } catch (error) {
    console.error("Test script error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAttendanceMarking(); 