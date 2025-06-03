// Authentication debug utility
export const debugAuth = () => {
  console.log('=== AUTHENTICATION DEBUG ===');
  
  // Check all possible token storage locations
  const token1 = localStorage.getItem('token');
  const token2 = localStorage.getItem('authToken');
  const role1 = localStorage.getItem('role');
  const role2 = localStorage.getItem('userRole');
  const userData = localStorage.getItem('userData');
  
  console.log('Tokens found:', {
    token: token1 ? `${token1.substring(0, 20)}...` : null,
    authToken: token2 ? `${token2.substring(0, 20)}...` : null,
    role: role1,
    userRole: role2,
    userData: userData ? 'Present' : 'Missing'
  });
  
  // Try to decode JWT token
  const activeToken = token1 || token2;
  if (activeToken) {
    try {
      const parts = activeToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token payload:', {
          userId: payload.id || payload.userId,
          schoolId: payload.schoolId,
          role: payload.role,
          email: payload.email,
          exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiry',
          isExpired: payload.exp ? payload.exp * 1000 < Date.now() : false
        });
        
        // Check if token has required fields for school operations
        if (!payload.schoolId && payload.role !== 'admin') {
          console.warn('⚠️ ISSUE: Token missing schoolId for non-admin user');
          console.warn('💡 SOLUTION: User needs to login through proper school login endpoint');
        } else {
          console.log('✅ Token appears valid for school operations');
        }
      } else {
        console.log('Invalid token format');
      }
    } catch (error) {
      console.log('Failed to decode token:', error);
    }
  } else {
    console.log('No token found - user needs to log in');
  }
  
  console.log('=== END DEBUG ===');
};

// Function to clear all auth data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('role');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userData');
  localStorage.removeItem('schoolId');
  console.log('All authentication data cleared');
};

// Function to simulate login for testing
export const simulateLogin = () => {
  // Create a mock JWT token with school context
  const mockPayload = {
    id: 1,
    schoolId: 1,
    role: 'school',
    email: 'test@school.com',
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
                   btoa(JSON.stringify(mockPayload)) + 
                   '.mock_signature';
  
  localStorage.setItem('token', mockToken);
  localStorage.setItem('authToken', mockToken);
  localStorage.setItem('role', 'school');
  localStorage.setItem('userRole', 'school');
  localStorage.setItem('userData', JSON.stringify({
    id: 1,
    name: 'Test School',
    email: 'test@school.com',
    schoolId: 1
  }));
  
  console.log('Mock login completed');
  return mockToken;
};

// Function to test authentication with the backend
export const testAuthentication = async () => {
  console.log('=== TESTING AUTHENTICATION ===');
  
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  
  if (!token) {
    console.log('❌ No token found - cannot test');
    return false;
  }
  
  try {
    // Test basic API call
    const response = await fetch('http://localhost:5000/api/students?page=1&limit=1', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Authentication test passed');
      console.log('Response:', data);
      return true;
    } else {
      console.log('❌ Authentication test failed');
      console.log('Error:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Authentication test failed with network error:', error);
    return false;
  }
};

// Function to attempt proper school login
export const attemptSchoolLogin = async (email = 'school@test.com', password = 'password123') => {
  console.log('=== ATTEMPTING SCHOOL LOGIN ===');
  
  try {
    const response = await fetch('http://localhost:5000/api/schoolLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ School login successful');
      
      // Store the proper authentication data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('role', data.data.user.role);
      localStorage.setItem('userRole', data.data.user.role);
      localStorage.setItem('userData', JSON.stringify(data.data.user));
      
      console.log('🔐 Authentication data stored');
      console.log('User data:', data.data.user);
      
      return data.data.token;
    } else {
      console.log('❌ School login failed');
      console.log('Error:', data);
      return null;
    }
  } catch (error) {
    console.log('❌ School login failed with network error:', error);
    return null;
  }
};

// Function to test teacher diary API specifically
export const testTeacherDiaryAPI = async () => {
  console.log('=== TESTING TEACHER DIARY API ===');
  
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  
  if (!token) {
    console.log('❌ No token found - cannot test');
    return false;
  }
  
  try {
    // First test the health endpoint
    const healthResponse = await fetch('/api/teacher-diary/health', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Health check response status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Teacher diary API health check passed');
      console.log('Health response:', healthData);
    } else {
      console.log('❌ Teacher diary API health check failed');
      const healthError = await healthResponse.json().catch(() => ({}));
      console.log('Health error:', healthError);
    }
    
    // Test the actual entries endpoint
    const entriesResponse = await fetch('/api/teacher-diary/teacher/entries?page=1&limit=5', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Entries response status:', entriesResponse.status);
    
    if (entriesResponse.ok) {
      const entriesData = await entriesResponse.json();
      console.log('✅ Teacher diary entries API test passed');
      console.log('Entries response:', entriesData);
      return true;
    } else {
      console.log('❌ Teacher diary entries API test failed');
      const entriesError = await entriesResponse.json().catch(() => ({}));
      console.log('Entries error:', entriesError);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Teacher diary API test failed with network error:', error);
    return false;
  }
};

// Function to check JWT consistency
export const checkJWTConsistency = async () => {
  console.log('=== CHECKING JWT CONSISTENCY ===');
  
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  
  if (!token) {
    console.log('❌ No token found - cannot check consistency');
    return false;
  }
  
  try {
    // Test multiple endpoints to see if JWT works consistently
    const endpoints = [
      '/api/teacher-diary/health',
      '/api/teacher-diary/classes',
      '/api/students?page=1&limit=1'
    ];
    
    const results = await Promise.allSettled(
      endpoints.map(endpoint => 
        fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(response => ({
          endpoint,
          status: response.status,
          ok: response.ok,
          data: response.json()
        }))
      )
    );
    
    console.log('JWT consistency test results:');
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { endpoint, status, ok } = result.value;
        console.log(`${ok ? '✅' : '❌'} ${endpoint}: ${status}`);
      } else {
        console.log(`❌ ${endpoints[index]}: Network error`);
      }
    });
    
    const allSuccessful = results.every(result => 
      result.status === 'fulfilled' && result.value.ok
    );
    
    if (allSuccessful) {
      console.log('✅ JWT is working consistently across endpoints');
    } else {
      console.log('❌ JWT inconsistency detected - check backend configuration');
    }
    
    return allSuccessful;
    
  } catch (error) {
    console.log('❌ JWT consistency check failed:', error);
    return false;
  }
};

// Comprehensive authentication diagnostic
export const runAuthDiagnostic = async () => {
  console.log('🔍 RUNNING COMPREHENSIVE AUTH DIAGNOSTIC');
  console.log('==========================================');
  
  // Step 1: Check current auth state
  debugAuth();
  
  // Step 2: Test basic authentication
  console.log('\n🔧 Testing basic authentication...');
  const basicAuthWorks = await testAuthentication();
  
  // Step 3: Test teacher diary specific API
  console.log('\n📚 Testing teacher diary API...');
  const diaryApiWorks = await testTeacherDiaryAPI();
  
  // Step 4: Test JWT consistency
  console.log('\n🔐 Testing JWT consistency...');
  const jwtConsistent = await checkJWTConsistency();
  
  // Step 5: Provide recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  if (!basicAuthWorks) {
    console.log('❌ Basic authentication failed - try logging in again');
    console.log('   Run: clearAuthData() then login through proper endpoint');
  }
  
  if (!diaryApiWorks) {
    console.log('❌ Teacher diary API not working - check backend teacher diary routes');
    console.log('   Ensure backend is running on port 5000');
  }
  
  if (!jwtConsistent) {
    console.log('❌ JWT inconsistency detected - backend may have mismatched secrets');
    console.log('   Check that all backend files use the same JWT_SECRET');
  }
  
  if (basicAuthWorks && diaryApiWorks && jwtConsistent) {
    console.log('✅ All authentication tests passed!');
    console.log('   Your authentication setup is working correctly');
  }
  
  console.log('\n🔧 QUICK FIXES:');
  console.log('- Clear auth data: clearAuthData()');
  console.log('- Simulate login: simulateLogin()');
  console.log('- Attempt school login: attemptSchoolLogin()');
  console.log('- Test specific API: testTeacherDiaryAPI()');
}; 