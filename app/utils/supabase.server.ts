import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ihpuqqaiztpuvncjvtox.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlocHVxcWFpenRwdXZuY2p2dG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMTA5MDIsImV4cCI6MjA1NzU4NjkwMn0.j5CqjhvdIN7lqkM63vhD-knAHHLTq4ww7FACIrdf1dE';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Don't persist session in browser storage
    autoRefreshToken: false, // We'll handle token refresh ourselves
  }
});

// Initialize the database by creating tables if they don't exist
export async function initializeDatabase() {
  try {
    // Check if the users table exists by attempting to query it
    const { error: checkError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    // If there's an error, the table might not exist
    if (checkError && checkError.code === '42P01') { // PostgreSQL error code for undefined_table
      console.log('Users table does not exist, creating it...');
      
      // Enable the uuid-ossp extension if not already enabled
      await supabase.rpc('extensions', { 
        name: 'uuid-ossp' 
      }).then(({ error }) => {
        if (error) console.error('Error enabling uuid-ossp extension:', error);
      });
      
      // Create the users table
      const { error: createError } = await supabase.rpc('create_users_table');
      
      if (createError) {
        console.error('Error creating users table via RPC:', createError);
        
        // Fallback: Try direct SQL (this might not work with limited permissions)
        const { error: sqlError } = await supabase.query(`
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
        
        if (sqlError) {
          console.error('Error creating users table via SQL:', sqlError);
        } else {
          console.log('Users table created successfully via SQL');
        }
      } else {
        console.log('Users table created successfully via RPC');
      }
    } else {
      console.log('Users table already exists or could not be checked');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Call this function when the server starts
initializeDatabase().catch(console.error);

// Configure OAuth providers in Supabase - updated to use available methods
export async function configureAuthProviders() {
  try {
    console.log('Google OAuth provider configuration:');
    console.log('To enable Google OAuth:');
    console.log('1. Go to the Supabase dashboard');
    console.log('2. Navigate to Authentication > Providers');
    console.log('3. Enable Google and configure with your Google OAuth credentials');
    console.log('4. Set the callback URL to: [your-app-url]/auth/google');
    
    // Note: The admin.listAuthProviders method is not available in the current version
    // of the Supabase JS client. OAuth providers must be configured through the Supabase dashboard.
  } catch (error) {
    console.error('Error configuring auth providers:', error);
  }
}

// Call this function when the server starts
configureAuthProviders().catch(console.error);
