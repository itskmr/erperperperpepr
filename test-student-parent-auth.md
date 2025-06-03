# Test Guide: Student & Parent Authentication Fix

## 🧪 **Quick Browser Console Test**

### **Test Student Diary Access**
1. Login as a student
2. Open browser console and run:
```javascript
// Test student diary access
const testStudentDiary = async () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  console.log('🔑 Token:', token ? 'Found' : 'Missing');
  
  const userData = localStorage.getItem('userData');
  const parsedUserData = userData ? JSON.parse(userData) : null;
  console.log('📋 User Data:', parsedUserData);
  
  if (parsedUserData) {
    const className = parsedUserData.currentClass || '';
    const section = parsedUserData.currentSection || '';
    
    console.log('🎯 Making API call with:', { className, section });
    
    const response = await fetch(`/api/teacher-diary/view?page=1&limit=10&className=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response Status:', response.status);
    const data = await response.json();
    console.log('📦 Response Data:', data);
    
    if (response.ok) {
      console.log('✅ SUCCESS: Student can access diary entries!');
      console.log(`📚 Found ${data.data?.entries?.length || 0} diary entries`);
    } else {
      console.error('❌ FAILED:', data.error || data.message);
    }
  } else {
    console.error('❌ No user data found in localStorage');
  }
};

testStudentDiary();
```

### **Test Parent Diary Access**
1. Login as a parent
2. Open browser console and run:
```javascript
// Test parent diary access
const testParentDiary = async () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  console.log('🔑 Token:', token ? 'Found' : 'Missing');
  
  const userData = localStorage.getItem('userData');
  const parsedUserData = userData ? JSON.parse(userData) : null;
  console.log('📋 User Data:', parsedUserData);
  
  if (parsedUserData) {
    const className = parsedUserData.currentClass || '';
    const section = parsedUserData.currentSection || '';
    
    console.log('🎯 Making API call with:', { className, section });
    
    const response = await fetch(`/api/teacher-diary/view?page=1&limit=10&className=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response Status:', response.status);
    const data = await response.json();
    console.log('📦 Response Data:', data);
    
    if (response.ok) {
      console.log('✅ SUCCESS: Parent can access diary entries!');
      console.log(`📚 Found ${data.data?.entries?.length || 0} diary entries`);
    } else {
      console.error('❌ FAILED:', data.error || data.message);
    }
  } else {
    console.error('❌ No user data found in localStorage');
  }
};

testParentDiary();
```

## 🔧 **What Was Fixed**

### **1. Authentication Middleware Fix**
**Problem**: JWT tokens use different field names:
- **Teachers/Schools**: `role` field 
- **Students/Parents**: `type` field

**Solution**: Updated `authMiddleware.js` to check both fields:
```javascript
// Get user role from either 'role' or 'type' field
const userRole = decoded.role || decoded.type;
```

### **2. Parent Token Structure Fix**
**Problem**: Parent tokens didn't have direct school context
**Solution**: Updated middleware to use `studentId` from parent JWT tokens:
```javascript
if (decoded.studentId) {
  const student = await prisma.student.findUnique({
    where: { id: decoded.studentId },
    select: { schoolId: true, fullName: true }
  });
  schoolId = student?.schoolId;
}
```

### **3. Enhanced Debugging**
Added console logging to track authentication flow:
- Token field detection
- User lookup success/failure
- School context resolution

## 🎯 **Expected Results**

### **Before Fix**
```
❌ GET /api/teacher-diary/view 400 (Bad Request)
❌ Error: School context is required
```

### **After Fix**
```
✅ GET /api/teacher-diary/view 200 (OK)
✅ Authentication successful: { userId: 123, role: 'student', schoolId: 1 }
✅ Retrieved diary entries: { totalEntries: 5, currentPageEntries: 5 }
```

## 📊 **Backend Logs to Monitor**

When testing, watch for these log messages in the backend console:

### **Successful Authentication**
```
Authentication debug: {
  decodedRole: undefined,
  decodedType: 'student',
  finalUserRole: 'student',
  userId: 123,
  studentId: undefined
}
Authentication successful: {
  userId: 123,
  role: 'student', 
  schoolId: 1
}
```

### **Successful Diary Fetch**
```
User authentication info: {
  userId: 123,
  userRole: 'STUDENT',
  originalType: 'student',
  schoolId: 1
}
Applied student/parent filters: { className: 'Class 11 (Science)', section: 'B' }
Retrieved diary entries: { totalEntries: 5, currentPageEntries: 5 }
```

## 🚀 **Next Steps**

1. **Test both student and parent access** using the console commands above
2. **Verify UI functionality** - navigate to diary pages in the application
3. **Check error handling** - test with invalid tokens or missing data
4. **Monitor performance** - ensure queries are efficient with proper filtering

If tests pass, the teacher diary system should now work seamlessly for all user roles! 🎉 