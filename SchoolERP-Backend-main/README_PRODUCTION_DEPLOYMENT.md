# School ERP System - Production Deployment Guide

## Overview
This document outlines the production-level changes made to the School ERP system to fix the 404 errors and implement proper authentication with school context.

## Key Issues Fixed

### 1. Student Registration 404 Error
**Problem**: POST request to `http://localhost:5000/register/student` was returning 404 (Not Found)

**Root Cause**: 
- Authentication middleware was bypassed in development mode
- School context was not properly extracted from authenticated users
- Routes were not protected with proper authentication

**Solution**:
- Implemented production-ready authentication middleware
- Added school context extraction from JWT tokens
- Protected all routes with proper authentication and authorization

### 2. Authentication & School Context
**Changes Made**:

#### Authentication Middleware (`src/middlewares/authMiddleware.js`)
- Enabled JWT token verification for all user roles (admin, school, teacher, student, parent)
- Added school context extraction based on user role
- Implemented proper error handling for expired/invalid tokens
- Added school validation to ensure school exists and is active

#### School Context Helper Function
```javascript
export const getSchoolIdFromContext = async (req) => {
  // Extracts school ID based on authenticated user's role and context
}
```

### 3. Controller Updates

#### Student Registration Controller (`src/controllers/studentFun/studentRegister.js`)
- **Authentication**: Now requires authenticated user with school context
- **School Validation**: Verifies school exists and is active
- **Form Number Uniqueness**: Checks within school scope only
- **Audit Trail**: Added user tracking and activity logging
- **Pagination**: Added pagination support for large datasets
- **Search & Filter**: Enhanced with role-based access control
- **Error Handling**: Production-level error responses

#### Transport Controller (`src/controllers/transportController.js`)
- **School Context**: All operations now respect authenticated user's school
- **Role-based Access**: Different permissions for admin vs school users
- **Search & Pagination**: Enhanced with proper filtering
- **Database Connection**: Improved error handling and connection testing

#### TC Form Controller (`src/controllers/tcfromController.js`)
- **Authentication Required**: All TC operations require authentication
- **School Scope**: TC creation/viewing limited to user's school
- **Validation**: Enhanced with Zod schema validation
- **Duplicate Prevention**: Prevents multiple TCs for same student
- **Activity Logging**: Comprehensive audit trail

### 4. Route Protection

#### Student Registration Routes (`src/routes/studentRegisterRoutes.js`)
```javascript
// Before (No Authentication)
router.post("/register", uploadFields, registerStudent);

// After (Full Authentication)
router.post("/register", 
  protect, 
  authorize('admin', 'school', 'teacher'), 
  requireSchoolContext,
  uploadFields, 
  handleMulterError, 
  registerStudent
);
```

**Protected Routes**:
- `POST /register/student/register` - Create student registration
- `GET /register/student/allStudent` - Get all students (with pagination)
- `PUT /register/student/update/:formNo` - Update student
- `GET /register/student/stats` - Get registration statistics

### 5. Frontend Updates

#### Student Registration Form (`src/pages/StudentRegister.tsx`)
- **Authentication Headers**: Added Bearer token to all API requests
- **Error Handling**: Enhanced error messages for auth failures
- **Auto-redirect**: Redirects to login on authentication failure
- **Proper API Endpoints**: Updated to use correct route paths

### 6. Security Enhancements

#### Authorization Levels
- **Admin**: Can access all schools' data
- **School**: Can only access their own school's data
- **Teacher**: Can access their school's data (limited operations)
- **Student/Parent**: Read-only access to their own data

#### Data Isolation
- All database queries now filter by school context
- Cross-school data access prevented
- Form numbers unique within school scope only

#### File Upload Security
- File type validation
- Size limits (5MB)
- Secure file naming
- Error handling for upload failures

## API Endpoints Reference

### Student Registration
```
POST /register/student/register
Headers: Authorization: Bearer <token>
Body: FormData with student information and files
Response: { success: true, message: "...", data: {...} }
```

### Get Students
```
GET /register/student/allStudent?page=1&limit=50&search=term
Headers: Authorization: Bearer <token>
Response: { success: true, data: [...], pagination: {...} }
```

### Update Student
```
PUT /register/student/update/:formNo
Headers: Authorization: Bearer <token>
Body: JSON with updated fields
Response: { success: true, message: "...", data: {...} }
```

### Registration Statistics
```
GET /register/student/stats
Headers: Authorization: Bearer <token>
Response: { success: true, data: { totals: {...}, classCounts: [...] } }
```

## Environment Configuration

### Required Environment Variables
```env
# Database
DATABASE_URL="mysql://user:pass@host:port/db"
NODE_ENV=production

# JWT
JWT_SECRET=your_secure_secret_key
JWT_EXPIRY=7d

# CORS
ALLOWED_ORIGINS=https://yourdomain.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

## Deployment Checklist

### Before Deployment
- [ ] Set `NODE_ENV=production`
- [ ] Configure secure JWT_SECRET
- [ ] Set up proper CORS origins
- [ ] Configure database connection
- [ ] Set up file upload directory permissions
- [ ] Configure HTTPS/SSL

### Database Migrations
- [ ] Run Prisma migrations: `npx prisma migrate deploy`
- [ ] Verify all tables exist
- [ ] Check foreign key relationships

### Security Verification
- [ ] Test authentication endpoints
- [ ] Verify JWT token expiration
- [ ] Test role-based access control
- [ ] Verify file upload restrictions
- [ ] Test CORS configuration

### Performance Optimization
- [ ] Enable compression
- [ ] Set up caching headers
- [ ] Configure rate limiting
- [ ] Monitor database queries
- [ ] Set up health checks

## Error Handling

### Common Error Responses
```json
// Authentication Required
{
  "success": false,
  "error": "Access denied. No token provided."
}

// Invalid Token
{
  "success": false,
  "error": "Token expired"
}

// Insufficient Permissions
{
  "success": false,
  "error": "Access denied. Required roles: admin, school. Your role: teacher"
}

// School Context Missing
{
  "success": false,
  "error": "School context required for this operation"
}

// Validation Error
{
  "success": false,
  "message": "Missing required fields: fullName, formNo"
}
```

## Monitoring & Logging

### Activity Logging
The system now logs all major operations:
- Student registrations
- TC generations
- Student updates
- Authentication events

### Health Checks
- `GET /register/student/health` - Service health
- `GET /api/health` - Overall system health

## Migration from Development

### Frontend Changes Required
1. Update API endpoints to include authentication headers
2. Handle authentication errors properly
3. Implement login/logout functionality
4. Store and manage JWT tokens securely

### Backend Changes Required
1. Enable authentication middleware (already done)
2. Configure production environment variables
3. Set up proper CORS configuration
4. Configure secure file upload handling

## Testing

### Authentication Testing
```bash
# Test registration without auth (should fail)
curl -X POST http://localhost:5000/register/student/register

# Test with valid token
curl -X POST http://localhost:5000/register/student/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### School Context Testing
1. Login as different school users
2. Verify data isolation
3. Test cross-school access prevention
4. Verify admin override capabilities

## Support & Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check JWT token validity and format
2. **403 Forbidden**: Verify user role and permissions
3. **400 Bad Request**: Check required fields and validation
4. **404 Not Found**: Verify route paths and middleware order

### Debug Mode
Set `NODE_ENV=development` to enable detailed error messages and stack traces.

---

## Summary

The School ERP system has been upgraded to production standards with:
- ✅ Proper JWT authentication
- ✅ Role-based access control  
- ✅ School context isolation
- ✅ Enhanced error handling
- ✅ Activity logging
- ✅ File upload security
- ✅ API route protection
- ✅ Frontend authentication integration

The 404 error has been resolved and the system is now ready for production deployment with enterprise-level security and data isolation. 