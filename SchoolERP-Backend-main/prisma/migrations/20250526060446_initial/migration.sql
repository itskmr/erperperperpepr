-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SCHOOL', 'TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "QualifiedStatus" AS ENUM ('Yes', 'No', 'NA', 'Pass', 'Fail', 'Compartment', 'AsperCBSEBoardResult', 'AppearedinclassXExam', 'AppearedinclassXIIExam');

-- CreateEnum
CREATE TYPE "ReasonForLeaving" AS ENUM ('FamilyRelocation', 'AdmissionInOtherSchool', 'Duetolongabsencewithoutinformation', 'FatherJobTransfer', 'GetAdmissioninHigherClass', 'GoingtoNativePlace', 'ParentWill', 'Passedoutfromtheschool', 'Shiftingtootherplace', 'TransferCase', 'Other');

-- CreateEnum
CREATE TYPE "ConductStatus" AS ENUM ('Excellent', 'Good', 'Satisfactory', 'NeedsImprovement', 'Poor');

-- CreateEnum
CREATE TYPE "FeeConcessionStatus" AS ENUM ('None', 'Partial', 'Full');

-- CreateEnum
CREATE TYPE "GamesPlayed" AS ENUM ('Football', 'Cricket', 'Swimming', 'Basketball', 'Kabaddi', 'Volleyball', 'Athlete', 'Chess', 'Badminton');

-- CreateEnum
CREATE TYPE "ExtraCurricularActivities" AS ENUM ('ParticipateInStageShow', 'ParticipateInSports', 'ParticipateInDebate', 'ParticipateInQuiz', 'ParticipateInPainting', 'ParticipateInSinging', 'ParticipateInDancing', 'ParticipateInOther');

-- CreateEnum
CREATE TYPE "ExamAppearedIn" AS ENUM ('School', 'Board', 'NA', 'CBSEBoard', 'SchoolFailed', 'SchoolPassed', 'SchoolCompartment', 'BoardPassed', 'BoardFailed', 'BoardCompartment');

-- CreateEnum
CREATE TYPE "WhetherFailed" AS ENUM ('Yes', 'No', 'NA', 'CBSEBoard');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELED');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE');

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL DEFAULT 'unknown',
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "phone" VARCHAR(15) NOT NULL DEFAULT '0123456789',
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" SERIAL NOT NULL,
    "schoolName" TEXT NOT NULL DEFAULT 'Unknown',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT 'SC000',
    "address" TEXT NOT NULL DEFAULT 'Not Provided',
    "contact" BIGINT NOT NULL DEFAULT 0,
    "phone" VARCHAR(15) NOT NULL DEFAULT '0123456789',
    "principal" TEXT NOT NULL DEFAULT 'Unknown',
    "image_url" TEXT,
    "established" INTEGER NOT NULL DEFAULT 2000,
    "role" "Role" NOT NULL DEFAULT 'SCHOOL',
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "phone" VARCHAR(15) NOT NULL DEFAULT '0123456789',
    "designation" TEXT NOT NULL DEFAULT 'Teacher',
    "education" TEXT,
    "address" TEXT,
    "subjects" TEXT NOT NULL,
    "sections" TEXT NOT NULL,
    "isClassIncharge" BOOLEAN NOT NULL DEFAULT false,
    "inchargeClass" TEXT,
    "inchargeSection" TEXT,
    "profileImage" TEXT,
    "joining_year" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "experience" TEXT NOT NULL DEFAULT '0',
    "role" "Role" NOT NULL DEFAULT 'TEACHER',
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastLogin" TIMESTAMP(3),
    "schoolId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "branchName" TEXT,
    "fullName" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailPassword" TEXT,
    "penNo" TEXT,
    "studentId" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "age" INTEGER,
    "gender" TEXT NOT NULL,
    "bloodGroup" TEXT,
    "nationality" TEXT,
    "religion" TEXT,
    "category" TEXT,
    "caste" TEXT,
    "aadhaarNumber" TEXT,
    "mobileNumber" TEXT NOT NULL,
    "emergencyContact" TEXT,
    "loginEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "houseNo" TEXT,
    "street" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pinCode" TEXT,
    "permanentHouseNo" TEXT,
    "permanentStreet" TEXT,
    "permanentCity" TEXT,
    "permanentState" TEXT,
    "permanentPinCode" TEXT,
    "sameAsPresentAddress" BOOLEAN NOT NULL DEFAULT false,
    "fatherName" TEXT NOT NULL,
    "fatherEmail" TEXT NOT NULL,
    "fatherEmailPassword" TEXT,
    "motherName" TEXT NOT NULL,
    "motherEmail" TEXT,
    "motherEmailPassword" TEXT,
    "schoolId" INTEGER NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentInfo" (
    "id" SERIAL NOT NULL,
    "fatherQualification" TEXT,
    "fatherOccupation" TEXT,
    "fatherContact" TEXT,
    "fatherEmail" TEXT,
    "fatherAadhaarNo" TEXT,
    "fatherAnnualIncome" TEXT,
    "fatherIsCampusEmployee" TEXT DEFAULT 'no',
    "motherQualification" TEXT,
    "motherOccupation" TEXT,
    "motherContact" TEXT,
    "motherEmail" TEXT,
    "motherAadhaarNo" TEXT,
    "motherAnnualIncome" TEXT,
    "motherIsCampusEmployee" TEXT DEFAULT 'no',
    "guardianName" TEXT,
    "guardianAddress" TEXT,
    "guardianContact" TEXT,
    "guardianEmail" TEXT,
    "guardianAadhaarNo" TEXT,
    "guardianOccupation" TEXT,
    "guardianAnnualIncome" TEXT,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "ParentInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionInfo" (
    "id" SERIAL NOT NULL,
    "admitGroup" TEXT,
    "admitStream" TEXT,
    "admitClass" TEXT,
    "admitSection" TEXT,
    "admitRollNo" TEXT,
    "admitSemester" TEXT,
    "admitFeeGroup" TEXT,
    "admitHouse" TEXT,
    "admitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentGroup" TEXT,
    "currentStream" TEXT,
    "currentClass" TEXT,
    "currentSection" TEXT,
    "currentRollNo" TEXT,
    "currentSemester" TEXT,
    "currentFeeGroup" TEXT,
    "currentHouse" TEXT,
    "previousSchool" TEXT,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "SessionInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportInfo" (
    "id" SERIAL NOT NULL,
    "transportMode" TEXT,
    "transportArea" TEXT,
    "transportStand" TEXT,
    "transportRoute" TEXT,
    "transportDriver" TEXT,
    "pickupLocation" TEXT,
    "dropLocation" TEXT,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "TransportInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documents" (
    "id" SERIAL NOT NULL,
    "studentImagePath" TEXT,
    "fatherImagePath" TEXT,
    "motherImagePath" TEXT,
    "guardianImagePath" TEXT,
    "signaturePath" TEXT,
    "parentSignaturePath" TEXT,
    "fatherAadharPath" TEXT,
    "motherAadharPath" TEXT,
    "birthCertificatePath" TEXT,
    "migrationCertificatePath" TEXT,
    "aadhaarCardPath" TEXT,
    "affidavitCertificatePath" TEXT,
    "incomeCertificatePath" TEXT,
    "addressProof1Path" TEXT,
    "addressProof2Path" TEXT,
    "academicRegistrationNo" TEXT,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationInfo" (
    "id" SERIAL NOT NULL,
    "lastSchool" TEXT,
    "lastSchoolAddress" TEXT,
    "lastTcDate" TIMESTAMP(3),
    "lastClass" TEXT,
    "lastPercentage" TEXT,
    "lastAttendance" TEXT,
    "lastExtraActivity" TEXT,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "EducationInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtherInfo" (
    "id" SERIAL NOT NULL,
    "belongToBPL" TEXT DEFAULT 'no',
    "minority" TEXT DEFAULT 'no',
    "disability" TEXT,
    "accountNo" TEXT,
    "bank" TEXT,
    "ifscCode" TEXT,
    "medium" TEXT,
    "lastYearResult" TEXT,
    "singleParent" TEXT DEFAULT 'no',
    "onlyChild" TEXT DEFAULT 'no',
    "onlyGirlChild" TEXT DEFAULT 'no',
    "adoptedChild" TEXT DEFAULT 'no',
    "siblingAdmissionNo" TEXT,
    "transferCase" TEXT DEFAULT 'no',
    "livingWith" TEXT,
    "motherTongue" TEXT,
    "admissionType" TEXT DEFAULT 'new',
    "udiseNo" TEXT,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "OtherInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "departmentName" TEXT NOT NULL,
    "hOD" TEXT NOT NULL,
    "faculty_count" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fee" (
    "id" TEXT NOT NULL,
    "admissionNumber" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "totalFees" DOUBLE PRECISION NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "feeAmount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "feeCategory" TEXT,
    "feeCategories" TEXT,
    "schoolId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeStructure" (
    "id" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "description" TEXT,
    "schoolId" INTEGER NOT NULL,
    "totalAnnualFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "frequency" TEXT NOT NULL,
    "description" TEXT,
    "structureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferCertificate" (
    "id" SERIAL NOT NULL,
    "admissionNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "motherName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "nationality" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dateOfAdmission" TIMESTAMP(3) NOT NULL,
    "currentClass" TEXT NOT NULL,
    "whetherFailed" "WhetherFailed" NOT NULL DEFAULT 'No',
    "section" TEXT NOT NULL,
    "rollNumber" TEXT,
    "examAppearedIn" "ExamAppearedIn" NOT NULL DEFAULT 'School',
    "qualifiedForPromotion" "QualifiedStatus" NOT NULL DEFAULT 'Yes',
    "reasonForLeaving" "ReasonForLeaving" NOT NULL,
    "dateOfLeaving" TIMESTAMP(3) NOT NULL,
    "lastAttendanceDate" TIMESTAMP(3) NOT NULL,
    "toClass" TEXT,
    "classInWords" TEXT,
    "maxAttendance" INTEGER NOT NULL,
    "obtainedAttendance" INTEGER NOT NULL,
    "subjectsStudied" TEXT NOT NULL,
    "generalConduct" "ConductStatus" NOT NULL,
    "behaviorRemarks" TEXT,
    "feesPaidUpTo" TIMESTAMP(3) NOT NULL,
    "tcCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feeConcession" "FeeConcessionStatus" DEFAULT 'None',
    "gamesPlayed" TEXT,
    "extraActivities" TEXT,
    "schoolId" INTEGER NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tcNumber" TEXT NOT NULL,
    "tcstatus" INTEGER NOT NULL DEFAULT 1,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "notes" TEXT,
    "studentId" TEXT NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "className" TEXT NOT NULL,
    "section" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "registrationId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "formNo" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "religion" TEXT NOT NULL,
    "registerForClass" TEXT NOT NULL,
    "admissionCategory" TEXT NOT NULL,
    "bloodGroup" TEXT NOT NULL,
    "regnDate" TEXT NOT NULL,
    "testDate" TEXT NOT NULL,
    "transactionNo" TEXT NOT NULL,
    "singleParent" BOOLEAN NOT NULL,
    "contactNo" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "studentAadharCardNo" TEXT NOT NULL,
    "regnCharge" TEXT NOT NULL,
    "examSubject" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "fatherMobileNo" TEXT NOT NULL,
    "smsAlert" BOOLEAN NOT NULL,
    "fatherEmail" TEXT NOT NULL,
    "fatherAadharCardNo" TEXT NOT NULL,
    "isFatherCampusEmployee" BOOLEAN NOT NULL,
    "motherName" TEXT NOT NULL,
    "motherMobileNo" TEXT NOT NULL,
    "motherAadharCardNo" TEXT NOT NULL,
    "casteCertificate" TEXT,
    "studentAadharCard" TEXT,
    "fatherAadharCard" TEXT,
    "motherAadharCard" TEXT,
    "previousClassMarksheet" TEXT,
    "transferCertificate" TEXT,
    "studentDateOfBirthCertificate" TEXT,
    "schoolId" INTEGER,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("registrationId")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "startOdometer" DOUBLE PRECISION NOT NULL,
    "endOdometer" DOUBLE PRECISION,
    "notes" TEXT,
    "delayMinutes" INTEGER NOT NULL DEFAULT 0,
    "busId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" TEXT NOT NULL,
    "busId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "odometer" DOUBLE PRECISION,
    "nextDueDate" TIMESTAMP(3),
    "completedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bus" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "fuelType" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "insuranceExpiryDate" TIMESTAMP(3),
    "lastMaintenanceDate" TIMESTAMP(3),
    "lastInspectionDate" TIMESTAMP(3),
    "currentOdometer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "driverId" TEXT,
    "routeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startLocation" TEXT NOT NULL,
    "endLocation" TEXT NOT NULL,
    "distance" DOUBLE PRECISION,
    "estimatedTime" INTEGER,
    "stops" TEXT,
    "schedule" TEXT,
    "busId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "address" TEXT,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "photo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentTransport" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "dropLocation" TEXT NOT NULL,
    "pickupTime" TEXT,
    "dropTime" TEXT,
    "fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "routeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentTransport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timetable" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "roomNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timetable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "School_email_key" ON "School"("email");

-- CreateIndex
CREATE UNIQUE INDEX "School_code_key" ON "School"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_username_key" ON "Teacher"("username");

-- CreateIndex
CREATE INDEX "Teacher_schoolId_idx" ON "Teacher"("schoolId");

-- CreateIndex
CREATE INDEX "Teacher_isClassIncharge_inchargeClass_inchargeSection_idx" ON "Teacher"("isClassIncharge", "inchargeClass", "inchargeSection");

-- CreateIndex
CREATE UNIQUE INDEX "Student_admissionNo_key" ON "Student"("admissionNo");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_fatherEmail_key" ON "Student"("fatherEmail");

-- CreateIndex
CREATE INDEX "Student_admissionNo_idx" ON "Student"("admissionNo");

-- CreateIndex
CREATE INDEX "Student_email_idx" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Student_mobileNumber_idx" ON "Student"("mobileNumber");

-- CreateIndex
CREATE INDEX "Student_aadhaarNumber_idx" ON "Student"("aadhaarNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ParentInfo_studentId_key" ON "ParentInfo"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionInfo_studentId_key" ON "SessionInfo"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "TransportInfo_studentId_key" ON "TransportInfo"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Documents_studentId_key" ON "Documents"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "EducationInfo_studentId_key" ON "EducationInfo"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "OtherInfo_studentId_key" ON "OtherInfo"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "TransferCertificate_tcNumber_key" ON "TransferCertificate"("tcNumber");

-- CreateIndex
CREATE INDEX "TransferCertificate_admissionNumber_idx" ON "TransferCertificate"("admissionNumber");

-- CreateIndex
CREATE INDEX "TransferCertificate_tcNumber_idx" ON "TransferCertificate"("tcNumber");

-- CreateIndex
CREATE INDEX "TransferCertificate_issuedDate_idx" ON "TransferCertificate"("issuedDate");

-- CreateIndex
CREATE INDEX "Attendance_date_studentId_idx" ON "Attendance"("date", "studentId");

-- CreateIndex
CREATE INDEX "Attendance_date_className_idx" ON "Attendance"("date", "className");

-- CreateIndex
CREATE INDEX "Attendance_studentId_date_idx" ON "Attendance"("studentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_formNo_key" ON "Registration"("formNo");

-- CreateIndex
CREATE INDEX "Trip_date_routeId_idx" ON "Trip"("date", "routeId");

-- CreateIndex
CREATE INDEX "Trip_date_busId_idx" ON "Trip"("date", "busId");

-- CreateIndex
CREATE INDEX "Trip_date_driverId_idx" ON "Trip"("date", "driverId");

-- CreateIndex
CREATE INDEX "Maintenance_busId_date_idx" ON "Maintenance"("busId", "date");

-- CreateIndex
CREATE INDEX "Maintenance_status_idx" ON "Maintenance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_registrationNumber_key" ON "Bus"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_routeId_key" ON "Bus"("routeId");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_licenseNumber_key" ON "Driver"("licenseNumber");

-- CreateIndex
CREATE INDEX "StudentTransport_studentId_idx" ON "StudentTransport"("studentId");

-- CreateIndex
CREATE INDEX "StudentTransport_routeId_idx" ON "StudentTransport"("routeId");

-- CreateIndex
CREATE INDEX "Timetable_classId_sectionId_idx" ON "Timetable"("classId", "sectionId");

-- CreateIndex
CREATE INDEX "Timetable_teacherId_idx" ON "Timetable"("teacherId");

-- CreateIndex
CREATE INDEX "Timetable_day_idx" ON "Timetable"("day");

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentInfo" ADD CONSTRAINT "ParentInfo_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionInfo" ADD CONSTRAINT "SessionInfo_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportInfo" ADD CONSTRAINT "TransportInfo_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationInfo" ADD CONSTRAINT "EducationInfo_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherInfo" ADD CONSTRAINT "OtherInfo_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeCategory" ADD CONSTRAINT "FeeCategory_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "FeeStructure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferCertificate" ADD CONSTRAINT "TransferCertificate_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferCertificate" ADD CONSTRAINT "TransferCertificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bus" ADD CONSTRAINT "Bus_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bus" ADD CONSTRAINT "Bus_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTransport" ADD CONSTRAINT "StudentTransport_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTransport" ADD CONSTRAINT "StudentTransport_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
