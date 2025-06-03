import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create a school first
    const school = await prisma.school.upsert({
      where: { id: 1 },
      update: {
        affiliate: 'Springfield Education Board',
        affiliateNo: 'SEB-2020-001',
        website: 'https://www.springfield-elementary.edu',
        updatedAt: new Date()
      },
      create: {
        id: 1,
        schoolName: 'Springfield Elementary School',
        email: 'school@school.com',
        password: await bcrypt.hash('123456', 10),
        code: 'SES001',
        address: '123 Education Street, Springfield',
        contact: 5550222123n,
        phone: '5552220123',
        principal: 'Seymour Skinner',
        established: 2020,
        affiliate: 'Springfield Education Board',
        affiliateNo: 'SEB-2020-001',
        website: 'https://www.springfield-elementary.edu',
        role: 'SCHOOL',
        status: 'active',
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    const school1 = await prisma.school.upsert({
      where: { id: 2 },
      update: {
        affiliate: 'JP INTERNATIONAL SCHOOL',
        affiliateNo: 'JPI-2020-001',
        website: 'https://www.jpinternational.edu',
        updatedAt: new Date()
      },
      create: {
        id: 2,
        schoolName: 'JP INTERNATIONAL SCHOOL',
        email: 'school1@school.com',
        password: await bcrypt.hash('123456', 10),
        code: 'JPI001',
        address: '123 Education Street, JP',
        contact: 5550222123n,
        phone: '5552220124',
        principal: 'Parv Ruhil',
        established: 2020,
        affiliate: 'JP INTERNATIONAL SCHOOL',
        affiliateNo: 'JPI-2020-001',
        website: 'https://www.jpinternational.edu',
        role: 'SCHOOL',
        status: 'active',
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log('Created school:', school);
    console.log('Created school:', school1);

    // Create teachers
    // const teacher1 = await prisma.teacher.create({
    //   data: {
    //     fullName: 'Edna Krabappel',
    //     email: 'teacher1@school.com',
    //     password: await bcrypt.hash('123456', 10),
    //     username: 'edna_k',
    //     phone: '5500000124',
    //     gender: 'Female',
    //     dateOfBirth: new Date('1970-05-15'),
    //     age: 53,
    //     designation: 'Senior Teacher',
    //     qualification: 'M.Sc. Mathematics, B.Ed',
    //     address: '456 Teacher Lane, Springfield',
    //     subjects: JSON.stringify(['Mathematics', 'Science']),
    //     sections: JSON.stringify([
    //       { class: 'Class 11 (Science)', sections: ['A', 'B'] },
    //       { class: 'Class 12 (Science)', sections: ['A'] }
    //     ]),
    //     joining_year: new Date('2010-01-01'),
    //     experience: '15',
    //     profileImage: '/uploads/teachers/edna.jpg',
    //     isClassIncharge: true,
    //     inchargeClass: 'Class 11 (Science)',
    //     inchargeSection: 'B',
    //     religion: 'Christian',
    //     bloodGroup: 'O+',
    //     maritalStatus: 'Married',
    //     facebook: 'https://facebook.com/edna.krabappel',
    //     twitter: 'https://twitter.com/edna_k',
    //     linkedIn: 'https://linkedin.com/in/edna-krabappel',
    //     documents: JSON.stringify([
    //       '/uploads/documents/edna_qualification.pdf',
    //       '/uploads/documents/edna_experience.pdf'
    //     ]),
    //     joiningSalary: 45000,
    //     accountHolderName: 'Edna Krabappel',
    //     accountNumber: '1234567890',
    //     bankName: 'Springfield Bank',
    //     bankBranch: 'Downtown Branch',
    //     status: 'active',
    //     schoolId: school.id,
    //     lastLogin: new Date(),
    //     createdAt: new Date(),
    //     updatedAt: new Date()
    //   },
    // });

    // const teacher2 = await prisma.teacher.create({
    //   data: {
    //     fullName: 'Elizabeth Hoover',
    //     email: 'teacher2@school.com',
    //     password: await bcrypt.hash('123456', 10),
    //     username: 'elizabeth_h',
    //     phone: '5550000125',
    //     gender: 'Female',
    //     dateOfBirth: new Date('1975-08-20'),
    //     age: 48,
    //     designation: 'Teacher',
    //     qualification: 'M.A. English Literature, B.Ed',
    //     address: '789 Educator Street, Springfield',
    //     subjects: JSON.stringify(['English', 'Literature']),
    //     sections: JSON.stringify([
    //       { class: 'Class 11 (Art)', sections: ['A', 'B'] },
    //       { class: 'Class 11 (Commerce)', sections: ['A'] }
    //     ]),
    //     joining_year: new Date('2015-01-01'),
    //     experience: '8',
    //     profileImage: '/uploads/teachers/elizabeth.jpg',
    //     isClassIncharge: false,
    //     inchargeClass: null,
    //     inchargeSection: null,
    //     religion: 'Protestant',
    //     bloodGroup: 'A+',
    //     maritalStatus: 'Single',
    //     facebook: 'https://facebook.com/elizabeth.hoover',
    //     twitter: 'https://twitter.com/elizabeth_h',
    //     linkedIn: 'https://linkedin.com/in/elizabeth-hoover',
    //     documents: JSON.stringify([
    //       '/uploads/documents/elizabeth_qualification.pdf',
    //       '/uploads/documents/elizabeth_experience.pdf'
    //     ]),
    //     joiningSalary: 40000,
    //     accountHolderName: 'Elizabeth Hoover',
    //     accountNumber: '0987654321',
    //     bankName: 'Springfield Bank',
    //     bankBranch: 'Uptown Branch',
    //     status: 'active',
    //     schoolId: school.id,
    //     lastLogin: new Date(),
    //     createdAt: new Date(),
    //     updatedAt: new Date()
    //   },
    // });

    // console.log('Created teachers:', [teacher1, teacher2]);

    // Create students with their related information
    // const students = await Promise.all([
    //   prisma.student.create({
    //     data: {
    //       // Student Information
    //       fullName: 'Bart Simpson',
    //       admissionNo: '1',
    //       email: 'student1@school.com',
    //       emailPassword: await bcrypt.hash('123456', 10),
    //       penNo: 'PEN001',
    //       studentId: '1',
    //       dateOfBirth: new Date('2010-05-01'),
    //       gender: 'Male',
    //       bloodGroup: 'O+',
    //       nationality: 'Indian',
    //       religion: 'Hindu',
    //       category: 'General',
    //       caste: 'Other',
    //       aadhaarNumber: '123456789012',
    //       mobileNumber: '9876543210',
    //       emergencyContact: '9876543211',
    //       loginEnabled: true,
    //       lastLogin: new Date(),
    //       isVerified: true,

    //       // Address Information
    //       houseNo: '742',
    //       street: 'Evergreen Terrace',
    //       city: 'Springfield',
    //       state: 'IL',
    //       pinCode: '62701',
    //       permanentHouseNo: '742',
    //       permanentStreet: 'Evergreen Terrace',
    //       permanentCity: 'Springfield',
    //       permanentState: 'IL',
    //       permanentPinCode: '62701',
    //       sameAsPresentAddress: true,

    //       // Parent Information
    //       fatherName: 'Homer Simpson',
    //       fatherEmail: 'father1@school.com',
    //       fatherEmailPassword: await bcrypt.hash('123456', 10),
    //       motherName: 'Marge Simpson',
    //       motherEmail: 'mother1@school.com',
    //       motherEmailPassword: await bcrypt.hash('123456', 10),

    //       // School and Role
    //       schoolId: school.id,
    //       role: 'STUDENT',

    //       // Related Information
    //       sessionInfo: {
    //         create: {
    //           admitGroup: 'Science',
    //           admitStream: 'General',
    //           admitClass: 'Class 4',
    //           admitSection: 'A',
    //           admitRollNo: '1',
    //           admitSemester: '1',
    //           admitFeeGroup: 'Regular',
    //           admitHouse: 'Blue',
    //           admitDate: new Date('2023-06-01'),
    //           currentGroup: 'Science',
    //           currentStream: 'General',
    //           currentClass: 'Class 11 (Science)',
    //           currentSection: 'B',
    //           currentRollNo: '2',
    //           currentSemester: '1',
    //           currentFeeGroup: 'Regular',
    //           currentHouse: 'Blue',
    //           previousSchool: 'Springfield Elementary'
    //         }
    //       },
    //       parentInfo: {
    //         create: {
    //           fatherQualification: 'High School',
    //           fatherOccupation: 'Nuclear Safety Inspector',
    //           fatherContact: '9876543214',
    //           fatherAadhaarNo: '123456789012',
    //           fatherAnnualIncome: '50000',
    //           fatherIsCampusEmployee: 'no',
    //           motherQualification: 'High School',
    //           motherOccupation: 'Homemaker',
    //           motherContact: '9876543215',
    //           motherAadhaarNo: '123456789013',
    //           motherAnnualIncome: '0',
    //           motherIsCampusEmployee: 'no',
    //           guardianName: 'Abe Simpson',
    //           guardianAddress: '742 Evergreen Terrace, Springfield',
    //           guardianContact: '9876543216',
    //           guardianEmail: 'abe.simpson@guardian.com',
    //           guardianAadhaarNo: '123456789014',
    //           guardianOccupation: 'Retired',
    //           guardianAnnualIncome: '20000'
    //         }
    //       },
    //       transportInfo: {
    //         create: {
    //           transportMode: 'School Bus',
    //           transportArea: 'Springfield',
    //           transportStand: 'Evergreen Terrace',
    //           transportRoute: 'Route 1',
    //           transportDriver: 'Otto Mann',
    //           pickupLocation: '742 Evergreen Terrace',
    //           dropLocation: 'Springfield Elementary School'
    //         }
    //       },
          
    //       educationInfo: {
    //         create: {
    //           lastSchool: 'Springfield Elementary',
    //           lastSchoolAddress: '123 Education Street, Springfield',
    //           lastTcDate: new Date('2023-05-31'),
    //           lastClass: 'Class 3',
    //           lastPercentage: '85',
    //           lastAttendance: '95',
    //           lastExtraActivity: 'Sports, Music'
    //         }
    //       },
    //       otherInfo: {
    //         create: {
    //           belongToBPL: 'no',
    //           minority: 'no',
    //           disability: 'none',
    //           accountNo: '1234567890',
    //           bank: 'Springfield Bank',
    //           ifscCode: 'SPFB0001234',
    //           medium: 'English',
    //           lastYearResult: 'Pass',
    //           singleParent: 'no',
    //           onlyChild: 'no',
    //           onlyGirlChild: 'no',
    //           adoptedChild: 'no',
    //           siblingAdmissionNo: 'SES002',
    //           transferCase: 'no',
    //           livingWith: 'Parents',
    //           motherTongue: 'English',
    //           admissionType: 'new',
    //           udiseNo: 'UDISE123456'
    //         }
    //       }
    //     }
    //   }),
    //   prisma.student.create({
    //     data: {
    //       // Student Information
    //       fullName: 'Lisa Simpson',
    //       admissionNo: '2',
    //       email: 'student2@school.com',
    //       emailPassword: await bcrypt.hash('123456', 10),
    //       penNo: 'PEN002',
    //       studentId: '2',
    //       dateOfBirth: new Date('2012-07-15'),
    //       gender: 'Female',
    //       bloodGroup: 'A+',
    //       nationality: 'Indian',
    //       religion: 'Hindu',
    //       category: 'General',
    //       caste: 'Other',
    //       aadhaarNumber: '123456789015',
    //       mobileNumber: '9876543212',
    //       emergencyContact: '9876543213',
    //       loginEnabled: true,
    //       lastLogin: new Date(),
    //       isVerified: true,

    //       // Address Information
    //       houseNo: '742',
    //       street: 'Evergreen Terrace',
    //       city: 'Springfield',
    //       state: 'IL',
    //       pinCode: '62701',
    //       permanentHouseNo: '742',
    //       permanentStreet: 'Evergreen Terrace',
    //       permanentCity: 'Springfield',
    //       permanentState: 'IL',
    //       permanentPinCode: '62701',
    //       sameAsPresentAddress: true,

    //       // Parent Information
    //       fatherName: 'Homer Simpson',
    //       fatherEmail: 'father2@school.com',
    //       fatherEmailPassword: await bcrypt.hash('123456', 10),
    //       motherName: 'Marge Simpson',
    //       motherEmail: 'mother2@school.com',
    //       motherEmailPassword: await bcrypt.hash('123456', 10),

    //       // School and Role
    //       schoolId: school.id,
    //       role: 'STUDENT',

    //       // Related Information
    //       sessionInfo: {
    //         create: {
    //           admitGroup: 'Science',
    //           admitStream: 'General',
    //           admitClass: 'Class 2',
    //           admitSection: 'A',
    //           admitRollNo: '1',
    //           admitSemester: '1',
    //           admitFeeGroup: 'Regular',
    //           admitHouse: 'Red',
    //           admitDate: new Date('2023-06-01'),
    //           currentGroup: 'Science',
    //           currentStream: 'General',
    //           currentClass: 'Class 11 (Science)',
    //           currentSection: 'B',
    //           currentRollNo: '4',
    //           currentSemester: '1',
    //           currentFeeGroup: 'Regular',
    //           currentHouse: 'Red',
    //           previousSchool: 'Springfield Elementary'
    //         }
    //       },
    //       parentInfo: {
    //         create: {
    //           fatherQualification: 'High School',
    //           fatherOccupation: 'Nuclear Safety Inspector',
    //           fatherContact: '9876543214',
    //           fatherAadhaarNo: '123456789012',
    //           fatherAnnualIncome: '50000',
    //           fatherIsCampusEmployee: 'no',
    //           motherQualification: 'High School',
    //           motherOccupation: 'Homemaker',
    //           motherContact: '9876543215',
    //           motherAadhaarNo: '123456789013',
    //           motherAnnualIncome: '0',
    //           motherIsCampusEmployee: 'no',
    //           guardianName: 'Abe Simpson',
    //           guardianAddress: '742 Evergreen Terrace, Springfield',
    //           guardianContact: '9876543216',
    //           guardianEmail: 'abe.simpson@guardian.com',
    //           guardianAadhaarNo: '123456789014',
    //           guardianOccupation: 'Retired',
    //           guardianAnnualIncome: '20000'
    //         }
    //       },
    //       transportInfo: {
    //         create: {
    //           transportMode: 'School Bus',
    //           transportArea: 'Springfield',
    //           transportStand: 'Evergreen Terrace',
    //           transportRoute: 'Route 1',
    //           transportDriver: 'Otto Mann',
    //           pickupLocation: '742 Evergreen Terrace',
    //           dropLocation: 'Springfield Elementary School'
    //         }
    //       },
    //       educationInfo: {
    //         create: {
    //           lastSchool: 'Springfield Elementary',
    //           lastSchoolAddress: '123 Education Street, Springfield',
    //           lastTcDate: new Date('2023-05-31'),
    //           lastClass: 'Class 1',
    //           lastPercentage: '95',
    //           lastAttendance: '98',
    //           lastExtraActivity: 'Music, Debate'
    //         }
    //       },
    //       otherInfo: {
    //         create: {
    //           belongToBPL: 'no',
    //           minority: 'no',
    //           disability: 'none',
    //           accountNo: '1234567891',
    //           bank: 'Springfield Bank',
    //           ifscCode: 'SPFB0001234',
    //           medium: 'English',
    //           lastYearResult: 'Pass',
    //           singleParent: 'no',
    //           onlyChild: 'no',
    //           onlyGirlChild: 'yes',
    //           adoptedChild: 'no',
    //           siblingAdmissionNo: 'SES001',
    //           transferCase: 'no',
    //           livingWith: 'Parents',
    //           motherTongue: 'English',
    //           admissionType: 'new',
    //           udiseNo: 'UDISE123457'
    //         }
    //       }
    //     }
    //   })
    // ]);

    // console.log('Created students:', students);

    // Create transfer certificates
    // const transferCertificates = await Promise.all([
    //   prisma.transferCertificate.create({
    //     data: {
    //       // Student Information
    //       admissionNumber: '1',
    //       fullName: 'Bart Simpson',
    //       fatherName: 'Homer Simpson',
    //       motherName: 'Marge Simpson',
    //       dateOfBirth: new Date('2010-05-01'),
    //       nationality: 'Indian',
    //       category: 'General',
    //       dateOfAdmission: new Date('2023-06-01'),
          
    //       // Academic Information
    //       currentClass: 'Class 11 (Science)',
    //       whetherFailed: 'No',
    //       section: 'B',
    //       rollNumber: '2',
    //       examAppearedIn: 'School',
    //       qualifiedForPromotion: 'Yes',
          
    //       // Transfer Details
    //       reasonForLeaving: 'FamilyRelocation',
    //       dateOfLeaving: new Date('2024-03-15'),
    //       lastAttendanceDate: new Date('2024-03-15'),
    //       toClass: 'Class 5',
    //       classInWords: 'Fifth',
          
    //       // Academic Performance
    //       maxAttendance: 220,
    //       obtainedAttendance: 200,
    //       subjectsStudied: 'English, Mathematics, Science, Social Studies, Hindi',
          
    //       // Conduct Information
    //       generalConduct: 'Good',
    //       behaviorRemarks: 'Well behaved and disciplined student',
          
    //       // Financial Information
    //       feesPaidUpTo: new Date('2024-03-15'),
    //       tcCharge: 0,
    //       feeConcession: 'None',
          
    //       // Activities and Games
    //       gamesPlayed: JSON.stringify(['Cricket', 'Football']),
    //       extraActivities: JSON.stringify(['Dance', 'Singing']),
          
    //       // School Details
    //       schoolId: school.id,
    //       tcNumber: 'TC001',
    //       tcstatus: 1,
    //       studentId: students[0].id
    //     }
    //   }),
    //   prisma.transferCertificate.create({
    //     data: {
    //       // Student Information
    //       admissionNumber: '2',
    //       fullName: 'Lisa Simpson',
    //       fatherName: 'Homer Simpson',
    //       motherName: 'Marge Simpson',
    //       dateOfBirth: new Date('2012-05-09'),
    //       nationality: 'Indian',
    //       category: 'General',
    //       dateOfAdmission: new Date('2023-06-01'),
          
    //       // Academic Information
    //       currentClass: 'Class 11 (Science)',
    //       whetherFailed: 'No',
    //       section: 'B',
    //       rollNumber: '4',
    //       examAppearedIn: 'School',
    //       qualifiedForPromotion: 'Yes',
          
    //       // Transfer Details
    //       reasonForLeaving: 'AdmissionInOtherSchool',
    //       dateOfLeaving: new Date('2024-03-15'),
    //       lastAttendanceDate: new Date('2024-03-15'),
    //       toClass: 'Class 3',
    //       classInWords: 'Third',
          
    //       // Academic Performance
    //       maxAttendance: 220,
    //       obtainedAttendance: 215,
    //       subjectsStudied: 'English, Mathematics, Science, Social Studies, Hindi',
          
    //       // Conduct Information
    //       generalConduct: 'Excellent',
    //       behaviorRemarks: 'Outstanding academic performance and excellent behavior',
          
    //       // Financial Information
    //       feesPaidUpTo: new Date('2024-03-15'),
    //       tcCharge: 0,
    //       feeConcession: 'None',
          
    //       // Activities and Games
    //       gamesPlayed: JSON.stringify(['Chess', 'Swimming']),
    //       extraActivities: JSON.stringify(['Debate', 'Quiz']),
          
    //       // School Details
    //       schoolId: school.id,
    //       tcNumber: 'TC002',
    //       tcstatus: 1,
    //       studentId: students[1].id
    //     }
    //   })
    // ]);

    // console.log('Created transfer certificates:', transferCertificates);

    // // Create registrations for students
    // const bartRegistration = await prisma.registration.create({
    //   data: {
    //     fullName: 'Sim Sim',
    //     gender: 'male',
    //     formNo: 'REG001',
    //     dob: '2010-04-01',
    //     category: 'General',
    //     religion: 'Christianity',
    //     registerForClass: 'Class 11 (Art)',
    //     admissionCategory: 'Regular',
    //     bloodGroup: 'O+',
    //     regnDate: '2024-03-15',
    //     testDate: '2024-03-20',
    //     transactionNo: 'TRX001',
    //     singleParent: false,
    //     contactNo: '9876543210',
    //     studentEmail: 'student1@school.com',
    //     address: '742 Evergreen Terrace',
    //     city: 'Springfield',
    //     state: 'Illinois',
    //     pincode: '62701',
    //     studentAadharCardNo: '123456789012',
    //     regnCharge: '500',
    //     examSubject: 'All',
    //     paymentStatus: 'Paid',
    //     fatherName: 'Homer Simpson',
    //     fatherMobileNo: '9876543214',
    //     smsAlert: true,
    //     fatherEmail: 'father1@school.com',
    //     fatherAadharCardNo: '123456789013',
    //     isFatherCampusEmployee: false,
    //     motherName: 'Marge Simpson',
    //     motherMobileNo: '9876543215',
    //     motherAadharCardNo: '123456789014',
    //     schoolId: school.id
    //   }
    // });

    // const lisaRegistration = await prisma.registration.create({
    //   data: {
    //     fullName: 'Sim Sim',
    //     gender: 'female',
    //     formNo: 'REG002',
    //     dob: '2012-05-09',
    //     category: 'General',
    //     religion: 'Christianity',
    //     registerForClass: 'Class 10',
    //     admissionCategory: 'Regular',
    //     bloodGroup: 'A+',
    //     regnDate: '2024-03-15',
    //     testDate: '2024-03-20',
    //     transactionNo: 'TRX002',
    //     singleParent: false,
    //     contactNo: '9876543212',
    //     studentEmail: 'student2@school.com',
    //     address: '742 Evergreen Terrace',
    //     city: 'Springfield',
    //     state: 'Illinois',
    //     pincode: '62701',
    //     studentAadharCardNo: '123456789015',
    //     regnCharge: '500',
    //     examSubject: 'All',
    //     paymentStatus: 'Paid',
    //     fatherName: 'Homer Simpson',
    //     fatherMobileNo: '9876543214',
    //     smsAlert: true,
    //     fatherEmail: 'father1@school.com',
    //     fatherAadharCardNo: '123456789013',
    //     isFatherCampusEmployee: false,
    //     motherName: 'Marge Simpson',
    //     motherMobileNo: '9876543215',
    //     motherAadharCardNo: '123456789014',
    //     schoolId: school.id
    //   }
    // });

    // console.log('Created registrations:', [bartRegistration, lisaRegistration]);

    // // ==================== TRANSPORT DATA ====================
    
    // Create drivers
    // const drivers = await Promise.all([
    //   prisma.driver.create({
    //     data: {
    //       id: 'driver-001',
    //       name: 'John Smith',
    //       contactNumber: '9876543220',
    //       licenseNumber: 'DL123456789',
    //       address: '123 Driver Street, Springfield',
    //       experience: 10,
    //       isActive: true,
    //       joiningDate: new Date('2020-01-15'),
    //       dateOfBirth: new Date('1980-03-10'),
    //       age: 44,
    //       gender: 'Male',
    //       maritalStatus: 'Married',
    //       emergencyContact: '9876543221',
    //       bloodGroup: 'B+',
    //       qualification: 'High School',
    //       salary: 25000,
    //       photo: '/uploads/drivers/john-smith.jpg',
    //       schoolId: school.id,
    //       createdAt: new Date(),
    //       updatedAt: new Date()
    //     }
    //   }),
    //   prisma.driver.create({
    //     data: {
    //       id: 'driver-002',
    //       name: 'Michael Johnson',
    //       contactNumber: '9876543222',
    //       licenseNumber: 'DL987654321',
    //       address: '456 Transport Avenue, Springfield',
    //       experience: 8,
    //       isActive: true,
    //       joiningDate: new Date('2021-03-20'),
    //       dateOfBirth: new Date('1985-07-15'),
    //       age: 39,
    //       gender: 'Male',
    //       maritalStatus: 'Single',
    //       emergencyContact: '9876543223',
    //       bloodGroup: 'O+',
    //       qualification: 'Graduate',
    //       salary: 28000,
    //       photo: '/uploads/drivers/michael-johnson.jpg',
    //       schoolId: school.id,
    //       createdAt: new Date(),
    //       updatedAt: new Date()
    //     }
    //   }),
    //   prisma.driver.create({
    //     data: {
    //       id: 'driver-003',
    //       name: 'Robert Davis',
    //       contactNumber: '9876543224',
    //       licenseNumber: 'DL456789123',
    //       address: '789 Route Road, Springfield',
    //       experience: 15,
    //       isActive: true,
    //       joiningDate: new Date('2018-09-10'),
    //       dateOfBirth: new Date('1975-11-20'),
    //       age: 48,
    //       gender: 'Male',
    //       maritalStatus: 'Married',
    //       emergencyContact: '9876543225',
    //       bloodGroup: 'A+',
    //       qualification: 'High School',
    //       salary: 30000,
    //       photo: '/uploads/drivers/robert-davis.jpg',
    //       schoolId: school.id,
    //       createdAt: new Date(),
    //       updatedAt: new Date()
    //     }
    //   }),
    //   prisma.driver.create({
    //     data: {
    //       id: 'driver-004',
    //       name: 'Sarah Wilson',
    //       contactNumber: '9876543226',
    //       licenseNumber: null, // Optional license number
    //       address: '321 Bus Lane, Springfield',
    //       experience: 5,
    //       isActive: true,
    //       joiningDate: new Date('2022-06-01'),
    //       dateOfBirth: new Date('1990-04-05'),
    //       age: 34,
    //       gender: 'Female',
    //       maritalStatus: 'Single',
    //       emergencyContact: '9876543227',
    //       bloodGroup: 'AB+',
    //       qualification: 'Graduate',
    //       salary: 26000,
    //       photo: '/uploads/drivers/sarah-wilson.jpg',
    //       schoolId: school.id,
    //       createdAt: new Date(),
    //       updatedAt: new Date()
    //     }
    //   })
    // ]);

    // console.log('Created drivers:', drivers.map(d => ({ id: d.id, name: d.name })));

    // // Create buses
    // const buses = await Promise.all([
    //   prisma.bus.create({
    //     data: {
    //       id: 'bus-001',
    //       make: 'Springfield Express 1',
    //       model: 'School Bus Deluxe',
    //       year: 2020,
    //       registrationNumber: 'SB001',
    //       capacity: 45,
    //       color: 'Yellow',
    //       fuelType: 'Diesel',
    //       currentOdometer: 25000,
    //       status: 'ACTIVE',
    //       purchaseDate: new Date('2020-01-01'),
    //       insuranceExpiryDate: new Date('2025-01-01'),
    //       lastMaintenanceDate: new Date('2024-02-15'),
    //       lastInspectionDate: new Date('2024-01-10'),
    //       notes: 'Primary route bus in excellent condition',
    //       driverId: drivers[0].id,
    //       schoolId: school.id,
    //       createdAt: new Date(),
    //       updatedAt: new Date()
    //     }
    //   }),
    //   prisma.bus.create({
    //     data: {
    //       id: 'bus-002',
    //       make: 'Springfield Express 2',
    //       model: 'School Bus Standard',
    //       year: 2019,
    //       registrationNumber: 'SB002',
    //       capacity: 40,
    //       color: 'Yellow',
    //       fuelType: 'Diesel',
    //       currentOdometer: 35000,
    //       status: 'ACTIVE',
    //       purchaseDate: new Date('2019-03-15'),
    //       insuranceExpiryDate: new Date('2024-12-15'),
    //       lastMaintenanceDate: new Date('2024-01-20'),
    //       lastInspectionDate: new Date('2024-01-05'),
    //       notes: 'Secondary route bus, well maintained',
    //       driverId: drivers[1].id,
    //       schoolId: school.id,
    //       createdAt: new Date(),
    //       updatedAt: new Date()
    //     }
    //   }),
    //   prisma.bus.create({
    //     data: {
    //       id: 'bus-003',
    //       make: 'Springfield Express 3',
    //       model: 'Mini Bus',
    //       year: 2021,
    //       registrationNumber: 'SB003',
    //       capacity: 25,
    //       color: 'Blue',
    //       fuelType: 'CNG',
    //       currentOdometer: 15000,
    //       status: 'ACTIVE',
    //       purchaseDate: new Date('2021-08-01'),
    //       insuranceExpiryDate: new Date('2025-08-01'),
    //       lastMaintenanceDate: new Date('2024-03-01'),
    //       lastInspectionDate: new Date('2024-02-01'),
    //       notes: 'Eco-friendly CNG bus for short routes',
    //       driverId: drivers[2].id,
    //       schoolId: school.id,
    //       createdAt: new Date(),
    //       updatedAt: new Date()
    //     }
    //   }),
    //   prisma.bus.create({
    //     data: {
    //       id: 'bus-004',
    //       make: 'Springfield Express 4',
    //       model: 'School Bus Economy',
    //       year: 2018,
    //       registrationNumber: 'SB004',
    //       capacity: 35,
    //       color: 'Yellow',
    //       fuelType: 'Diesel',
    //       currentOdometer: 45000,
    //       status: 'MAINTENANCE',
    //       purchaseDate: new Date('2018-06-01'),
    //       insuranceExpiryDate: new Date('2024-11-01'),
    //       lastMaintenanceDate: new Date('2024-03-10'),
    //       lastInspectionDate: new Date('2023-12-15'),
    //       notes: 'Currently undergoing maintenance, expected back in service soon',
    //       driverId: drivers[3].id,
    //       schoolId: school.id,
    //       createdAt: new Date(),
    //       updatedAt: new Date()
    //     }
    //   })
    // ]);

    // console.log('Created buses:', buses.map(b => ({ id: b.id, make: b.make, registrationNumber: b.registrationNumber })));

    // // Create routes
    // const routes = await Promise.all([
    //   prisma.route.create({
    //     data: {
    //       id: 'route-001',
    //       name: 'Downtown Route',
    //       description: 'Main downtown area covering residential districts',
    //       startLocation: 'Springfield Downtown Terminal',
    //       endLocation: 'Springfield Elementary School',
    //       distance: 12.5,
    //       estimatedTime: 45,
    //       busId: buses[0].id,
    //       schoolId: school.id,
    //       createdAt: new Date(),
    //       updatedAt: new Date()
    //     }
    //   }),
    //   prisma.route.create({
    //     data: {
    //       id: 'route-002',
    //       name: 'Suburbs Route',
    //       description: 'Suburban neighborhoods and housing complexes',
    //       startLocation: 'Springfield Suburbs Center',
    //       endLocation: 'Springfield Elementary School',
    //       distance: 8.3,
    //       estimatedTime: 30,
    //       busId: buses[1].id,
    //       schoolId: school.id,
    //       createdAt: new Date(),
    //       updatedAt: new Date()
    //     }
    //   }),
    //   prisma.route.create({
    //     data: {
    //       id: 'route-003',
    //       name: 'Hillside Route',
    //       description: 'Hill station areas and rural districts',
    //       startLocation: 'Springfield Hills Junction',
    //       endLocation: 'Springfield Elementary School',
    //       distance: 15.7,
    //       estimatedTime: 55,
    //       busId: buses[2].id,
    //       schoolId: school.id,
    //       createdAt: new Date(),
    //       updatedAt: new Date()
    //     }
    //   }),
    //   prisma.route.create({
    //     data: {
    //       id: 'route-004',
    //       name: 'Industrial Route',
    //       description: 'Industrial area and worker residential zones',
    //       startLocation: 'Springfield Industrial Complex',
    //       endLocation: 'Springfield Elementary School',
    //       distance: 10.2,
    //       estimatedTime: 40,
    //       busId: null, // No bus assigned (bus in maintenance)
    //       schoolId: school.id,
    //       createdAt: new Date(),
    //       updatedAt: new Date()
    //     }
    //   }),
    //   prisma.route.create({
    //     data: {
    //       id: 'route-005',
    //       name: 'University Route',
    //       description: 'University district and surrounding areas',
    //       startLocation: 'Springfield University',
    //       endLocation: 'Springfield Elementary School',
    //       distance: 6.8,
    //       estimatedTime: 25,
    //       busId: null, // Available for assignment
    //       schoolId: school.id,
    //       createdAt: new Date(),
    //       updatedAt: new Date()
    //     }
    //   })
    // ]);

    // console.log('Created routes:', routes.map(r => ({ id: r.id, name: r.name, startLocation: r.startLocation, endLocation: r.endLocation })));

    // console.log('Database has been seeded with comprehensive transport data. 🌱🚌');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 