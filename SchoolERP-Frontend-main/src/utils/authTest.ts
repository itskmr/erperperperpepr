// Authentication test utility for debugging
// Usage: Open browser console and run: window.authTest.runDiagnostic()

interface AuthTestResult {
  success: boolean;
  message: string;
  data?: any;
}

class AuthTest {
  private baseUrl = 'http://localhost:5000';

  // Test if backend is running
  async testBackendConnection(): Promise<AuthTestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/health`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, message: 'Backend is running', data };
      } else {
        return { success: false, message: `Backend responded with status ${response.status}` };
      }
    } catch (error) {
      return { success: false, message: 'Cannot connect to backend. Is it running on port 5000?' };
    }
  }

  // Test authentication token
  async testAuthToken(): Promise<AuthTestResult> {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    try {
      // Decode token to check its structure
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { success: false, message: 'Invalid token format' };
      }

      const payload = JSON.parse(atob(parts[1]));
      const isExpired = payload.exp && payload.exp * 1000 < Date.now();

      if (isExpired) {
        return { success: false, message: 'Token is expired', data: { expiry: new Date(payload.exp * 1000) } };
      }

      return { 
        success: true, 
        message: 'Token is valid', 
        data: { 
          userId: payload.id,
          role: payload.role,
          schoolId: payload.schoolId,
          email: payload.email,
          expiry: new Date(payload.exp * 1000)
        } 
      };
    } catch (error) {
      return { success: false, message: 'Failed to decode token' };
    }
  }

  // Test teacher diary API
  async testTeacherDiaryAPI(): Promise<AuthTestResult> {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    try {
      const response = await fetch('/api/teacher-diary/health', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, message: 'Teacher diary API is working', data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          message: `Teacher diary API failed with status ${response.status}`,
          data: errorData
        };
      }
    } catch (error) {
      return { success: false, message: 'Network error testing teacher diary API' };
    }
  }

  // Test school login
  async testSchoolLogin(email: string = 'admin@school.com', password: string = 'password123'): Promise<AuthTestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/schoolLogin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store the token
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('role', data.data.user.role);
        localStorage.setItem('userRole', data.data.user.role);
        localStorage.setItem('userData', JSON.stringify(data.data.user));

        return { 
          success: true, 
          message: 'School login successful', 
          data: data.data.user 
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Login failed',
          data: data
        };
      }
    } catch (error) {
      return { success: false, message: 'Network error during login' };
    }
  }

  // Clear all authentication data
  clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    localStorage.removeItem('schoolId');
    console.log('✅ All authentication data cleared');
  }

  // Run comprehensive diagnostic
  async runDiagnostic(): Promise<void> {
    console.log('🔍 RUNNING AUTHENTICATION DIAGNOSTIC');
    console.log('=====================================');

    // Test 1: Backend connection
    console.log('\n1️⃣ Testing backend connection...');
    const backendTest = await this.testBackendConnection();
    console.log(backendTest.success ? '✅' : '❌', backendTest.message);
    if (backendTest.data) console.log('   Data:', backendTest.data);

    // Test 2: Authentication token
    console.log('\n2️⃣ Testing authentication token...');
    const tokenTest = await this.testAuthToken();
    console.log(tokenTest.success ? '✅' : '❌', tokenTest.message);
    if (tokenTest.data) console.log('   Data:', tokenTest.data);

    // Test 3: Teacher diary API
    console.log('\n3️⃣ Testing teacher diary API...');
    const diaryTest = await this.testTeacherDiaryAPI();
    console.log(diaryTest.success ? '✅' : '❌', diaryTest.message);
    if (diaryTest.data) console.log('   Data:', diaryTest.data);

    // Provide recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    
    if (!backendTest.success) {
      console.log('❌ Backend is not running or not accessible');
      console.log('   → Start the backend server: npm start (in backend directory)');
      console.log('   → Check if port 5000 is available');
    }

    if (!tokenTest.success) {
      console.log('❌ Authentication token issue');
      console.log('   → Try logging in again');
      console.log('   → Run: authTest.testSchoolLogin("your-email", "your-password")');
      console.log('   → Or clear data: authTest.clearAuthData()');
    }

    if (!diaryTest.success && tokenTest.success) {
      console.log('❌ Teacher diary API issue');
      console.log('   → Check if teacher diary routes are properly configured');
      console.log('   → Verify JWT secret consistency in backend');
    }

    if (backendTest.success && tokenTest.success && diaryTest.success) {
      console.log('✅ All tests passed! Authentication is working correctly.');
    }

    console.log('\n🔧 AVAILABLE COMMANDS:');
    console.log('- authTest.testSchoolLogin("email", "password") - Test login');
    console.log('- authTest.clearAuthData() - Clear all auth data');
    console.log('- authTest.testTeacherDiaryAPI() - Test diary API');
    console.log('- authTest.runDiagnostic() - Run this diagnostic again');
  }
}

// Create global instance
const authTest = new AuthTest();

// Make it available globally for console access
declare global {
  interface Window {
    authTest: AuthTest;
  }
}

if (typeof window !== 'undefined') {
  window.authTest = authTest;
}

export default authTest; 