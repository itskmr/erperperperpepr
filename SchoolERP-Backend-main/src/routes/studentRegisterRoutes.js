import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  registerStudent,
  getAllRegisteredStudents,
  updateStudent,
  deleteStudent,
  getRegistrationStats
} from "./../controllers/studentFun/studentRegister.js";
import { protect, authorize, requireSchoolContext } from "../middlewares/authMiddleware.js";

const router = express.Router();

// // Ensure upload directory exists
// const uploadDir = 'uploads/registration/';
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({ 
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//   },
//   fileFilter: function (req, file, cb) {
//     const allowedTypes = /jpeg|jpg|png|pdf/;
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);

//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb(new Error('Only .png, .jpg, .jpeg and .pdf format allowed!'));
//     }
//   }
// });

// // Define the fields that can have file uploads
// const uploadFields = upload.fields([
//   { name: 'casteCertificate', maxCount: 1 },
//   { name: 'studentAadharCard', maxCount: 1 },
//   { name: 'fatherAadharCard', maxCount: 1 },
//   { name: 'motherAadharCard', maxCount: 1 },
//   { name: 'previousClassMarksheet', maxCount: 1 },
//   { name: 'transferCertificate', maxCount: 1 },
//   { name: 'studentDateOfBirthCertificate', maxCount: 1 }
// ]);

// Error handling middleware for multer
// const handleMulterError = (err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     if (err.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).json({
//         success: false,
//         message: 'File too large. Maximum size allowed is 5MB.'
//       });
//     }
//     if (err.code === 'LIMIT_UNEXPECTED_FILE') {
//       return res.status(400).json({
//         success: false,
//         message: 'Too many files or unexpected field name.'
//       });
//     }
//   } else if (err) {
//     return res.status(400).json({
//       success: false,
//       message: err.message
//     });
//   }
//   next();
// };

// Routes with authentication and authorization
router.post("/register", 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  requireSchoolContext,
  // uploadFields, 
  // handleMulterError, 
  registerStudent
);

router.get("/allStudent", 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getAllRegisteredStudents
);

router.put("/update/:formNo", 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  // uploadFields, 
  // handleMulterError, 
  updateStudent
);

router.delete("/delete/:formNo", 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  deleteStudent
);

router.get("/stats", 
  protect, 
  authorize('admin', 'school', 'teacher'),
  requireSchoolContext,
  getRegistrationStats
);

// Health check route (no auth required)
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student registration service is running",
    timestamp: new Date().toISOString()
  });
});

export default router;
