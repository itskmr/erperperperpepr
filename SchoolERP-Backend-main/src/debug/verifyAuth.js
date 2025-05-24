/**
 * Auth API Verification Script
 * This script checks if all auth endpoints are accessible and responding correctly
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function checkEndpoint(endpoint, method = 'GET', body = null) {
  console.log(`🔍 Testing ${method} ${endpoint}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const status = response.status;
    
    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { error: 'Invalid JSON response' };
    }
    
    console.log(`Status: ${status} ${status >= 200 && status < 300 ? '✅' : '❌'}`);
    console.log('Response:', data);
    console.log('----------------------------');
    
    return { status, data };
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    console.log('----------------------------');
    return { status: 0, error: error.message };
  }
}

async function verifyAllEndpoints() {
  console.log('🚀 VERIFYING AUTH API ENDPOINTS\n');
  
  // First check if server is running
  const health = await checkEndpoint('/api/health');
  if (!health.status || health.status >= 400) {
    console.error('❌ Server is not running! Start the server before running this script.');
    return;
  }
  
  // Check auth specific health endpoint
  await checkEndpoint('/api/auth/health');
  
  // Check student endpoints with minimal data
  await checkEndpoint('/api/auth/student/validate-invitation', 'POST', { 
    invitationKey: 'test-key' 
  });
  
  // Check parent endpoints with minimal data
  await checkEndpoint('/api/auth/parent/validate-invitation', 'POST', { 
    invitationKey: 'test-key' 
  });
  
  // Check student registration endpoint
  await checkEndpoint('/api/studentRegister', 'POST', {
    email: 'test@example.com',
    password: 'Password123',
    admissionNo: 'TEST001',
    invitationKey: 'test-key' 
  });
  
  // Check parent registration endpoint
  await checkEndpoint('/api/parentRegister', 'POST', {
    email: 'parent@example.com',
    password: 'Password123',
    admissionNo: 'TEST001',
    invitationKey: 'test-key'
  });
  
  console.log('\n✅ All endpoint checks completed!');
  console.log('Note: 400/401 errors are expected for invalid test data.');
  console.log('Check the routes with real data in your application.');
}

// Run the verification
verifyAllEndpoints().catch(error => {
  console.error('Script error:', error);
}); 