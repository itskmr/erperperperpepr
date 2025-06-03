import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  getSchoolProfile, 
  updateSchoolProfile, 
  uploadSchoolImage 
} from '../controllers/schoolProfileController.js';
import { protect, enforceSchoolIsolation } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Create uploads directory for school images if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'schools');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for school image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: school-{timestamp}-{random}.{ext}
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `school-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF images are allowed.'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size allowed is 5MB.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Please use "image" field name.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

/**
 * @route   GET /api/school/profile
 * @desc    Get school profile information
 * @access  Private (School role only)
 */
router.get('/', protect, enforceSchoolIsolation, getSchoolProfile);

/**
 * @route   PUT /api/school/profile
 * @desc    Update school profile information
 * @access  Private (School role only)
 */
router.put('/', protect, enforceSchoolIsolation, updateSchoolProfile);

/**
 * @route   POST /api/school/profile/image
 * @desc    Upload school logo/image
 * @access  Private (School role only)
 */
router.post('/image', 
  protect, 
  enforceSchoolIsolation, 
  upload.single('image'), 
  handleMulterError, 
  uploadSchoolImage
);

export default router; 