const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase Client initialized successfully.');
  } catch (err) {
    console.error('❌ Failed to initialize Supabase client:', err.message);
  }
} else {
  console.warn('ℹ️ Supabase credentials not found in server/.env file. Local storage fallback active.');
}

module.exports = supabase;
