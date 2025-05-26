import multer from "multer";
import path from "path";
import fs from "fs";

// Allowed file types and extensions
const allowedFileTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "image/jpg",
];
const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];

// Ensure the upload directory exists
const uploadDir = path.join(process.cwd(), "registerFiles/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const formNo = req.query.formNo || req.body.formNo; // Ensure formNo is captured

    if (!formNo) {
      return cb(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          "Student Form Number is required"
        )
      );
    }

    const fieldName = file.fieldname;
    let fileExtension = path.extname(file.originalname).toLowerCase();
    if (!fileExtension) fileExtension = ".dat"; // Default extension if missing

    const uniqueFileName = `${formNo}_${fieldName}${fileExtension}`;
    cb(null, uniqueFileName);
  },
});

const fileFilter = (req, file, cb) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (
    allowedFileTypes.includes(file.mimetype) &&
    allowedExtensions.includes(fileExtension)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only JPG, PNG, and PDF files are allowed!`
      ),
      false
    );
  }
};

const registerStudentFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export default registerStudentFiles;
