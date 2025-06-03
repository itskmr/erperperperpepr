// Test utility to verify teacher diary authentication fix
export const testTeacherDiaryAuth = async () => {
  console.log('🧪 Testing Teacher Diary Authentication Fix');
  console.log('==========================================');

  // Check current token and role
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  const role = localStorage.getItem('role') || localStorage.getItem('userRole');
  
  if (!token) {
    console.log('❌ No token found. Please login first.');
    return false;
  }

  try {
    // Decode the token to see what's in it
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('🔍 Token payload:', {
      role: payload.role,
      id: payload.id,
      email: payload.email,
      schoolId: payload.schoolId
    });
    
    console.log('💾 Local storage role:', role);
    
    // Test the teacher diary health endpoint
    console.log('\n🏥 Testing teacher diary health endpoint...');
    const healthResponse = await fetch('/api/teacher-diary/health', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData);
    } else {
      const healthError = await healthResponse.json();
      console.log('❌ Health check failed:', healthError);
    }
    
    // Test creating a diary entry with minimal data
    console.log('\n📝 Testing diary entry creation...');
    const testEntry = {
      title: 'Test Entry - ' + new Date().toISOString(),
      content: 'This is a test entry to verify authentication.',
      date: new Date().toISOString().split('T')[0],
      className: '10',
      section: 'A',
      subject: 'Mathematics',
      entryType: 'GENERAL',
      priority: 'NORMAL',
      isPublic: true
    };
    
    const createResponse = await fetch('/api/teacher-diary/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testEntry)
    });
    
    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Diary entry creation successful:', createData);
      
      // Clean up - delete the test entry
      if (createData.data?.entry?.id) {
        const deleteResponse = await fetch(`/api/teacher-diary/delete/${createData.data.entry.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (deleteResponse.ok) {
          console.log('🧹 Test entry cleaned up successfully');
        }
      }
      
      return true;
    } else {
      const createError = await createResponse.json();
      console.log('❌ Diary entry creation failed:', createError);
      
      if (createResponse.status === 403) {
        console.log('🚨 Authentication issue detected!');
        console.log('💡 This indicates the backend is still not recognizing the teacher role properly.');
        console.log('🔧 Check backend logs for more details.');
      }
      
      return false;
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error);
    return false;
  }
};

// Make it available globally
declare global {
  interface Window {
    testTeacherDiaryAuth: () => Promise<boolean>;
  }
}

if (typeof window !== 'undefined') {
  window.testTeacherDiaryAuth = testTeacherDiaryAuth;
}

export default testTeacherDiaryAuth; 