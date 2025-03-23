import bcrypt from "bcryptjs";
import { supabase } from "~/utils/supabase.server";

export type User = {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at?: string;
};

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
  
  return data as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error || !data) {
    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
      console.error('Error fetching user by email:', error);
    }
    return null;
  }
  
  return data as User;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error || !data) {
    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
      console.error('Error fetching user by username:', error);
    }
    return null;
  }
  
  return data as User;
}

export async function createUser(email: string, username: string, password: string): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Log the attempt to create a user
  console.log('Attempting to create user:', { email, username });
  
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        email,
        username,
        password: hashedPassword
      }
    ])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating user:', error);
    
    // Check if the error is related to the table not existing
    if (error.code === '42P01') { // PostgreSQL error code for undefined_table
      throw new Error('Users table does not exist. Please ensure the database is properly initialized.');
    }
    
    throw new Error(error.message || 'Failed to create user');
  }
  
  if (!data) {
    console.error('No data returned after creating user');
    throw new Error('Failed to create user: No data returned');
  }
  
  console.log('User created successfully:', data.id);
  return data as User;
}

export async function verifyLogin(usernameOrEmail: string, password: string): Promise<User | null> {
  // Add debug logging
  console.log('Attempting to verify login for:', usernameOrEmail);
  
  // Check if the input is an email or username
  const isEmail = usernameOrEmail.includes('@');
  
  let query;
  if (isEmail) {
    query = supabase.from('users').select('*').eq('email', usernameOrEmail);
  } else {
    query = supabase.from('users').select('*').eq('username', usernameOrEmail);
  }
  
  const { data, error } = await query.single();
  
  if (error || !data) {
    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
      console.error('Error verifying login:', error);
    } else {
      console.log('No user found with the provided credentials');
    }
    return null;
  }
  
  const user = data as User;
  console.log('User found, comparing passwords');
  
  try {
    // Use a more explicit comparison with proper error handling
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isValid);
    
    if (!isValid) {
      console.log('Password does not match');
      return null;
    }
    
    console.log('Login successful for user:', user.id);
    return user;
  } catch (err) {
    console.error('Error comparing passwords:', err);
    return null;
  }
}
