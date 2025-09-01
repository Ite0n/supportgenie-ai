#!/usr/bin/env node

/**
 * Test script to verify frontend-backend integration
 * Run this to test if your backend is accessible
 */

const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

async function testBackend() {
  console.log('🧪 Testing Backend Integration...\n');
  
  try {
    // Test health endpoint
    console.log('1️⃣ Testing Backend Health...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('✅ Backend is running and healthy!');
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Message: ${healthData.message}`);
      console.log(`   Version: ${healthData.version}`);
    } else {
      console.log('❌ Backend health check failed');
      console.log(`   Status: ${healthResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend');
    console.log(`   Error: ${error.message}`);
    console.log('   Make sure backend is running: cd backend && npm run dev');
  }
}

async function testAuthEndpoints() {
  console.log('\n2️⃣ Testing Authentication Endpoints...');
  
  try {
    // Test registration endpoint (should fail without data, but endpoint should exist)
    console.log('   Testing registration endpoint...');
    const registerResponse = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (registerResponse.status === 400) {
      console.log('✅ Registration endpoint is accessible (validation working)');
    } else {
      console.log(`⚠️  Registration endpoint returned: ${registerResponse.status}`);
    }
    
    // Test login endpoint
    console.log('   Testing login endpoint...');
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (loginResponse.status === 400) {
      console.log('✅ Login endpoint is accessible (validation working)');
    } else {
      console.log(`⚠️  Login endpoint returned: ${loginResponse.status}`);
    }
    
  } catch (error) {
    console.log('❌ Authentication endpoints test failed');
    console.log(`   Error: ${error.message}`);
  }
}

async function testAIEndpoints() {
  console.log('\n3️⃣ Testing AI Endpoints...');
  
  try {
    // Test AI conversation endpoint (should fail without auth, but endpoint should exist)
    console.log('   Testing AI conversation endpoint...');
    const aiResponse = await fetch(`${BACKEND_URL}/api/ai/conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (aiResponse.status === 401) {
      console.log('✅ AI endpoint is accessible (authentication required)');
    } else {
      console.log(`⚠️  AI endpoint returned: ${aiResponse.status}`);
    }
    
  } catch (error) {
    console.log('❌ AI endpoints test failed');
    console.log(`   Error: ${error.message}`);
  }
}

async function testTelegramEndpoints() {
  console.log('\n4️⃣ Testing Telegram Endpoints...');
  
  try {
    // Test bot status endpoint (should fail without auth, but endpoint should exist)
    console.log('   Testing Telegram bot status endpoint...');
    const botResponse = await fetch(`${BACKEND_URL}/api/telegram/status`);
    
    if (botResponse.status === 401) {
      console.log('✅ Telegram endpoints are accessible (authentication required)');
    } else {
      console.log(`⚠️  Telegram endpoint returned: ${botResponse.status}`);
    }
    
  } catch (error) {
    console.log('❌ Telegram endpoints test failed');
    console.log(`   Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 SupportGenie AI - Integration Test Suite\n');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Frontend URL: ${FRONTEND_URL}\n`);
  
  await testBackend();
  await testAuthEndpoints();
  await testAIEndpoints();
  await testTelegramEndpoints();
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Start your frontend: npm run dev');
  console.log('2. Open http://localhost:3000 in your browser');
  console.log('3. Test the authentication flow');
  console.log('4. Check the dashboard functionality');
  
  console.log('\n📚 Documentation:');
  console.log('- Frontend-Backend Integration: FRONTEND_BACKEND_INTEGRATION.md');
  console.log('- Backend Setup: backend/README.md');
  console.log('- Telegram Bot Setup: backend/TELEGRAM_SETUP.md');
}

// Run tests
runTests().catch(console.error);
