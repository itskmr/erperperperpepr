# Student Document Schema Updates - Complete Implementation

## Overview
Updated the Student management system to properly handle document fields that are now part of the Student model instead of a separate Documents model. All document paths are stored as individual fields in the Student table according to the Prisma schema.

## Database Schema Changes

### Student Model Document Fields (from schema)
```prisma
// Document Verification Status
documentsVerified Boolean @default(false)
birthCertificateSubmitted Boolean @default(false)
studentAadharSubmitted    Boolean @default(false)
fatherAadharSubmitted     Boolean @default(false)
motherAadharSubmitted     Boolean @default(false)
tcSubmitted              Boolean @default(false)
marksheetSubmitted       Boolean @default(false)

// Document Paths (moved from Documents model)
studentImagePath         String? @db.Text
fatherImagePath          String? @db.Text
motherImagePath          String? @db.Text
guardianImagePath        String? @db.Text
signaturePath            String? @db.Text
parentSignaturePath      String? @db.Text
fatherAadharPath         String? @db.Text
motherAadharPath         String? @db.Text
birthCertificatePath     String? @db.Text
migrationCertificatePath String? @db.Text
aadhaarCardPath          String? @db.Text
familyIdPath             String? @db.Text
affidavitCertificatePath String? @db.Text
incomeCertificatePath    String? @db.Text
addressProof1Path        String? @db.Text
addressProof2Path        String? @db.Text
transferCertificatePath  String? @db.Text
markSheetPath            String? @db.Text
fatherSignaturePath      String? @db.Text
motherSignaturePath      String? @db.Text
guardianSignaturePath    String? @db.Text
```

## Backend Updates

### 1. Student Controller (`SchoolERP-Backend-main/src/controllers/studentFun/studentController.js`)

#### Updated `createStudent` function:
- **Removed**: JSON-based `studentDocuments` field handling
- **Added**: Individual document path field mapping
- **Added**: Document verification status tracking
- **Added**: File field mapping for both nested and direct field names

```javascript
// Map uploaded files to document path fields
const fileFieldMapping = {
  'studentImage': 'studentImagePath',
  'documents.studentImage': 'studentImagePath',
  'fatherImage': 'fatherImagePath',
  'documents.fatherImage': 'fatherImagePath',
  // ... all document types
};

// Document verification status fields
const documentStatus = {
  documentsVerified: false,
  birthCertificateSubmitted: false,
  studentAadharSubmitted: false,
  fatherAadharSubmitted: false,
  motherAadharSubmitted: false,
  tcSubmitted: false,
  marksheetSubmitted: false,
};
```

#### Updated Document Management Functions:
1. **`addStudentDocument`**: 
   - Now updates individual schema fields instead of JSON array
   - Validates document types against schema fields
   - Updates verification status automatically

2. **`deleteStudentDocument`**: 
   - Sets individual document path fields to null
   - Updates verification status

3. **`getStudentDocuments`**: 
   - Returns structured document list from schema fields
   - Includes document verification status

4. **`updateStudentDocument`**: 
   - Replaces files in individual schema fields
   - Updates verification status

### 2. Student Routes (`SchoolERP-Backend-main/src/routes/studentRoutes.js`)

#### Updated Routes:
- **Added**: Document management routes
- **Updated**: File upload configuration
- **Added**: Document serving endpoint

```javascript
// NEW DOCUMENT ROUTES
router.get('/:id/documents', getStudentDocuments);
router.post('/:id/documents', singleDocumentUpload, handleMulterError, addStudentDocument);
router.put('/:id/documents/:documentType', singleDocumentUpload, handleMulterError, updateStudentDocument);
router.delete('/:id/documents/:documentType', deleteStudentDocument);
router.get('/documents/:filename', serveDocumentFile);
```

#### Updated Upload Configuration:
- **Added**: Support for additional document types
- **Added**: Word document support
- **Improved**: Error handling and file validation

## Frontend Updates

### 1. Student Form Types (`SchoolERP-Frontend-main/src/components/StudentForm/StudentFormTypes.ts`)

#### Updated Interfaces:
```typescript
// Documents interface matching schema fields
export interface Documents {
  studentImage: File | null;
  fatherImage: File | null;
  motherImage: File | null;
  guardianImage: File | null;
  signature: File | null;
  parentSignature: File | null;
  fatherAadhar: File | null;
  motherAadhar: File | null;
  birthCertificate: File | null;
  migrationCertificate: File | null;
  aadhaarCard: File | null;
  familyId: File | null;
  affidavitCertificate: File | null;
  incomeCertificate: File | null;
  addressProof1: File | null;
  addressProof2: File | null;
  transferCertificate: File | null;
  markSheet: File | null;
  fatherSignature: File | null;
  motherSignature: File | null;
  guardianSignature: File | null;
}

// Document verification status
export interface DocumentStatus {
  documentsVerified?: boolean;
  birthCertificateSubmitted?: boolean;
  studentAadharSubmitted?: boolean;
  fatherAadharSubmitted?: boolean;
  motherAadharSubmitted?: boolean;
  tcSubmitted?: boolean;
  marksheetSubmitted?: boolean;
}

// Document paths for existing students
export interface DocumentPaths {
  studentImagePath?: string | null;
  fatherImagePath?: string | null;
  // ... all path fields
}
```

### 2. Student View Component (`SchoolERP-Frontend-main/src/components/ManageStudents/StudentView.tsx`)

#### Major Updates:
- **Added**: Document fetching from new API
- **Added**: Document viewing and downloading functionality
- **Added**: Document verification status display
- **Improved**: Error handling and loading states

#### Key Features:
```typescript
const fetchStudentDocuments = async () => {
  const response = await fetch(`/api/students/${student.id}/documents`);
  const data = await response.json();
  setDocuments(data.documents || []);
  setDocumentStatus(data.documentStatus || {});
};

const handleDownload = async (doc: StudentDocument) => {
  // Download with proper filename formatting
};

const handleView = (doc: StudentDocument) => {
  // Open in new tab for viewing
};
```

## API Endpoints

### Document Management Endpoints:

1. **GET `/api/students/:id/documents`**
   - Returns all documents for a student
   - Includes verification status

2. **POST `/api/students/:id/documents`**
   - Upload/update a specific document
   - Requires `documentType` in body
   - Auto-updates verification status

3. **PUT `/api/students/:id/documents/:documentType`**
   - Replace existing document
   - Updates verification status

4. **DELETE `/api/students/:id/documents/:documentType`**
   - Remove document
   - Resets verification status

5. **GET `/api/students/documents/:filename`**
   - Serve document files
   - Proper content-type headers

## Valid Document Types

Based on schema fields:
- `studentImagePath`
- `fatherImagePath`
- `motherImagePath`
- `guardianImagePath`
- `signaturePath`
- `parentSignaturePath`
- `fatherAadharPath`
- `motherAadharPath`
- `birthCertificatePath`
- `migrationCertificatePath`
- `aadhaarCardPath`
- `familyIdPath`
- `affidavitCertificatePath`
- `incomeCertificatePath`
- `addressProof1Path`
- `addressProof2Path`
- `transferCertificatePath`
- `markSheetPath`
- `fatherSignaturePath`
- `motherSignaturePath`
- `guardianSignaturePath`

## File Upload Support

### Supported File Types:
- Images: JPEG, PNG, GIF
- Documents: PDF, DOC, DOCX

### Features:
- 5MB file size limit
- Automatic filename generation
- Proper MIME type validation
- Organized file storage in `/uploads/students/`

## Verification Status Tracking

### Automatic Status Updates:
- `birthCertificateSubmitted` → `birthCertificatePath`
- `studentAadharSubmitted` → `aadhaarCardPath`
- `fatherAadharSubmitted` → `fatherAadharPath`
- `motherAadharSubmitted` → `motherAadharPath`
- `tcSubmitted` → `transferCertificatePath`
- `marksheetSubmitted` → `markSheetPath`
- `documentsVerified` → Set to true when any document is uploaded

## Benefits

1. **Database Normalization**: Documents are properly integrated into the Student model
2. **Better Performance**: No need for separate document queries
3. **Type Safety**: Full TypeScript support for all document fields
4. **Verification Tracking**: Automatic status updates for document submissions
5. **API Consistency**: RESTful endpoints for all document operations
6. **File Management**: Proper file serving and download functionality

## Migration Notes

- **Removed**: Old `studentDocuments` JSON field handling
- **Added**: Individual document path fields
- **Updated**: All API responses to include verification status
- **Improved**: Error handling and validation
- **Enhanced**: Frontend user experience with proper loading states

## Testing Checklist

- [x] Student creation with document uploads
- [x] Document viewing in StudentView component
- [x] Document downloading functionality
- [x] Document deletion and status updates
- [x] API error handling
- [x] File type validation
- [x] Verification status tracking
- [x] Frontend-backend integration

The system now properly handles all document fields according to the schema structure, providing a production-ready document management solution for student records. 