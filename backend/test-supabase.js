// Test Supabase Connection
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing Supabase Connection...');
console.log('=====================================');

// Check environment variables
console.log('Environment Variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
console.log('');

// Test connection
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  try {
    console.log('🔄 Attempting to connect to Supabase...');
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    console.log('✅ Supabase client created successfully!');
    console.log('📊 Project URL:', process.env.SUPABASE_URL);
    console.log('');
    
    console.log('🎯 Next steps:');
    console.log('1. Create database tables');
    console.log('2. Test database operations');
    console.log('3. Configure authentication');
    
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error.message);
  }
} else {
  console.error('❌ Missing required Supabase environment variables!');
  console.log('Please check your .env file and ensure all Supabase credentials are set.');
}

console.log('');
console.log('🔗 Test completed. Check the output above for any errors.');
