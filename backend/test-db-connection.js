require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing Supabase Database Connection...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}\n`);

// Test Supabase connection
async function testConnection() {
  try {
    console.log('🔌 Attempting to connect to Supabase...');
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    console.log('✅ Supabase client created successfully');
    
    // Test a simple query to see if tables exist
    console.log('🗄️ Testing database query...');
    
    const { data, error } = await supabase
      .from('businesses')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Table "businesses" does not exist yet');
        console.log('💡 You need to run the database setup script first');
        console.log('📝 Go to your Supabase project and run: backend/setup-database.sql');
      } else {
        console.log('❌ Database query failed:', error.message);
      }
    } else {
      console.log('✅ Database connection successful!');
      console.log('✅ Table "businesses" exists and is accessible');
    }
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    
    if (error.message.includes('Invalid URL')) {
      console.log('💡 Check your SUPABASE_URL in .env file');
    } else if (error.message.includes('Invalid API key')) {
      console.log('💡 Check your SUPABASE_ANON_KEY in .env file');
    }
  }
}

// Run the test
testConnection();
