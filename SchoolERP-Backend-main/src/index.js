import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Import routes
import studentRoutes from "./routes/studentRoutes.js";
import feeRoutes from "./routes/feeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import feeStructureRoutes from "./routes/feeStructureRoutes.js";
import studentRegister from "./routes/studentRegisterRoutes.js";
import tcformRoutes from "./routes/tcformRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import transportRoutes from "./routes/transportRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import schoolRoutes from "./routes/schoolRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";

// Initialize environment variables
dotenv.config();

// Get directory name (ESM compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid JSON in request body',
        details: process.env.NODE_ENV === 'development' ? e.message : undefined
      });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration - More permissive for development
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://main.dcs1pmkunowgr.amplifyapp.com',
      'http://localhost:3000'
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Cache-Control",
      "Origin"
    ],
  })
);

// Add preflight OPTIONS handling for all routes
app.options("*", cors());

// Serve uploaded files statically
app.use("/uploads", express.static(uploadsDir));

// Root handler to help with navigation
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "School Management API is running",
    endpoints: {
      api: "/api",
      students: "/api/students",
      fees: "/api/fees",
      health: "/api/health",
      auth: "/api/auth",
      teachers: "/api/teachers"
    },
  });
});

// API root handler
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "School Management API",
    version: "1.0.0",
    endpoints: {
      students: "/api/students",
      fees: "/api/fees",
      health: "/api/health",
      auth: "/api/auth",
      test: "/api/test",
      teachers: "/api/teachers"
    },
  });
});

/**
 * Test database connection
 */
async function connectToDatabase() {
  try {
    await prisma.$executeRaw`SELECT 1+1 AS result`;
    console.log("✅ MySQL database connection established successfully");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
}

// Health check route
app.get("/api/health", async (_, res) => {
  try {
    const dbConnected = await prisma.$executeRaw`SELECT 1+1 AS result`
      .then(() => true)
      .catch(() => false);

    res.status(200).json({
      status: "ok",
      message: "Server is running",
      database: dbConnected ? "connected" : "disconnected",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server health check failed",
    });
  }
});

// Test route
app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Test route works!",
    timestamp: new Date().toISOString(),
  });
});

// Routes - support multiple paths for better compatibility
app.use("/api/students", studentRoutes);
app.use("/student", studentRoutes);
app.use("/students", studentRoutes);
app.use("/register/student", studentRegister);

// Fee routes
app.use("/api/fees", feeRoutes);
app.use("/fees", feeRoutes);

// Fee Structure routes
app.use("/api", feeStructureRoutes);

// Add TC form routes to the API
app.use("/api", tcformRoutes);

// Add attendance routes
app.use("/api/attendance", attendanceRoutes);
app.use("/attendance", attendanceRoutes);

// Add transport routes
app.use("/api/transport", transportRoutes);
app.use("/transport", transportRoutes);

// Add timetable routes
app.use("/api/timetable", timetableRoutes);

// Add teacher routes
app.use("/api/teachers", teacherRoutes);
app.use("/teachers", teacherRoutes);

// Add school routes
app.use("/api/schools", schoolRoutes);

// Add this before your admin routes registration:

// Apply CORS specifically to admin routes
app.use("/api/admin", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Admin routes
app.use("/api/admin", adminRoutes);
app.use("/admin", adminRoutes);

// Auth routes - Keep these lines for other auth routes
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

// Direct route registration for login endpoints
app.post("/api/adminLogin", (req, res) => {
  console.log("Admin login attempt received");
  return authRoutes.handle("admin", req, res);
});

app.post("/api/schoolLogin", (req, res) => {
  console.log("School login attempt received");
  return authRoutes.handle("school", req, res);
});

app.post("/api/teacherLogin", (req, res) => {
  console.log("Teacher login attempt received");
  return authRoutes.handle("teacher", req, res);
});

// Student and parent login/registration routes
app.post("/api/studentLogin", (req, res) => {
  console.log("Student login attempt received");
  return authRoutes.loginStudent(req, res);
});

app.post("/api/studentRegister", (req, res) => {
  console.log("Student registration attempt received");
  return authRoutes.registerStudent(req, res);
});

app.post("/api/parentLogin", (req, res) => {
  console.log("Parent login attempt received");
  return authRoutes.loginParent(req, res);
});

app.post("/api/parentRegister", (req, res) => {
  console.log("Parent registration attempt received");
  return authRoutes.registerParent(req, res);
});

// Add direct mappings for validation endpoints
app.post("/api/auth/student/validate-invitation", (req, res) => {
  console.log("Student invitation validation attempt received");
  return authRoutes.validateStudentInvitation(req, res);
});

app.post("/api/auth/parent/validate-invitation", (req, res) => {
  console.log("Parent invitation validation attempt received");
  return authRoutes.validateParentInvitation(req, res);
});

// Add mappings for the paths that the frontend is using
app.post("/api/student/validate-invitation", (req, res) => {
  console.log("Student invitation validation attempt received (alternative path)");
  return authRoutes.validateStudentInvitation(req, res);
});

app.post("/api/student/register", (req, res) => {
  console.log("Student registration attempt received (alternative path)");
  return authRoutes.registerStudent(req, res);
});

app.post("/api/student/login", (req, res) => {
  console.log("Student login attempt received (alternative path)");
  return authRoutes.loginStudent(req, res);
});

// Also add parent routes with consistent paths
app.post("/api/parent/validate-invitation", (req, res) => {
  console.log("Parent invitation validation attempt received (alternative path)");
  return authRoutes.validateParentInvitation(req, res);
});

app.post("/api/parent/register", (req, res) => {
  console.log("Parent registration attempt received (alternative path)");
  return authRoutes.registerParent(req, res);
});

app.post("/api/parent/login", (req, res) => {
  console.log("Parent login attempt received (alternative path)");
  return authRoutes.loginParent(req, res);
});

// Add auth test routes to verify API is working
app.get("/api/auth/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth API is working",
    endpoints: {
      studentValidation: "/api/auth/student/validate-invitation",
      parentValidation: "/api/auth/parent/validate-invitation",
      studentRegister: "/api/studentRegister",
      studentLogin: "/api/studentLogin",
      parentRegister: "/api/parentRegister",
      parentLogin: "/api/parentLogin"
    }
  });
});

// Catch-all handler for unmatched routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server with better error handling
async function startServer() {
  try {
    const dbConnected = await connectToDatabase();

    const server = app.listen(PORT, () => {
      console.log(`
🚀 Server running on port ${PORT}
📁 API is available at http://localhost:${PORT}/api
🔌 Database connection: ${dbConnected ? "✅ Connected" : "❌ Failed"}
      `);
    });

    // Handle server errors
    server.on("error", (e) => {
      console.error("Server error:", e.message);
      if (e.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Try a different port.`);
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// Handle unhandled rejections and exits
process.on("unhandledRejection", (error) => {
  console.error("🔴 Unhandled rejection:", error);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
