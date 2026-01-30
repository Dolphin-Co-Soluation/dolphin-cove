import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Database table names (PostgreSQL tables in Supabase)
export const tables = {
  users: 'users',
  posts: 'posts',
  messages: 'messages',
  freelanceJobs: 'freelance_jobs',
  tasks: 'tasks',
};

// Helper function to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('Database connection failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

export default supabase;
