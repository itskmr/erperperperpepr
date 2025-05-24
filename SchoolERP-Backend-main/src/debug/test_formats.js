/**
 * Test script to verify API calls work with both formats
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test both formats of parameters
const TESTS = [
  // Test student validation with invitationKey
  {
    name: 'Student validation (invitationKey)',
    url: '/api/student/validate-invitation',
    method: 'POST',
    data: { invitationKey: 'test-uuid' }
  },
  // Test student validation with token
  {
    name: 'Student validation (token)',
    url: '/api/student/validate-invitation',
    method: 'POST',
    data: { token: 'test-uuid' }
  },
  // Test parent validation with invitationKey
  {
    name: 'Parent validation (invitationKey)',
    url: '/api/parent/validate-invitation',
    method: 'POST',
    data: { invitationKey: 'test-uuid' }
  },
  // Test parent validation with token
  {
    name: 'Parent validation (token)',
    url: '/api/parent/validate-invitation',
    method: 'POST',
    data: { token: 'test-uuid' }
  },
  // Test student registration with both formats
  {
    name: 'Student registration (invitationKey)',
    url: '/api/student/register',
    method: 'POST',
    data: { 
      invitationKey: 'test-uuid', 
      email: 'student@test.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    }
  },
  {
    name: 'Student registration (token)',
    url: '/api/student/register',
    method: 'POST',
    data: { 
      token: 'test-uuid', 
      email: 'student@test.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    }
  }
];

async function testEndpoint(test) {
  console.log(`\n🔍 Testing ${test.name}: ${test.method} ${test.url}`);
  console.log('Request data:', test.data);
  
  try {
    const response = await fetch(`${BASE_URL}${test.url}`, {
      method: test.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test.data)
    });
    
    const status = response.status;
    let data;
    
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { error: `Failed to parse response: ${e.message}` };
    }
    
    console.log(`Status: ${status} ${status !== 404 ? '✅' : '❌'}`);
    console.log('Response:', data);
    
    return { success: status !== 404, status, data };
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 STARTING FORMAT COMPATIBILITY TESTS\n');
  
  for (const test of TESTS) {
    await testEndpoint(test);
  }
  
  console.log('\n✅ All tests completed');
  console.log('This test is successful if none of the responses are 404 Not Found.');
  console.log('401 or 400 responses are expected since we\'re using fake UUIDs for testing.');
}

runTests().catch(error => {
  console.error('Script error:', error);
}); 