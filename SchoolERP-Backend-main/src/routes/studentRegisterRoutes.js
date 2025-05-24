import express from "express";
import registerStudentFiles from "./../middlewares/registerStudentFiles.js";
// import { validateRegistration } from "./../middlewares/validateRegistration";
import {
  registerStudent,
  getAllRegisteredStudents,
} from "./../controllers/studentFun/studentRegister.js";

const router = express.Router();

// Routes
router.post(
  "/addNew",
  registerStudentFiles.fields([
    { name: "casteCertificate", maxCount: 1 },
    { name: "studentAadharCard", maxCount: 1 },
    { name: "fatherAadharCard", maxCount: 1 },
    { name: "motherAadharCard", maxCount: 1 },
    { name: "previousClassMarksheet", maxCount: 1 },
    { name: "transferCertificate", maxCount: 1 },
    { name: "studentDateOfBirthCertificate", maxCount: 1 },
  ]),
  registerStudent
);

router.get("/allStudent", getAllRegisteredStudents);

export default router;
