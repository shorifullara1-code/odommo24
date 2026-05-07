
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdmin() {
  const email = 'adomyo24@gmail.com';
  const password = 'adomyo1@';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('Setting up admin user...');

  // Try to find the user
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (existingUser) {
    console.log('User already exists, updating password and role...');
    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword, role: 'admin' })
      .eq('email', email);
    
    if (error) console.error('Error updating:', error);
    else console.log('Admin updated successfully.');
  } else {
    console.log('Creating new admin user...');
    const { error } = await supabase
      .from('users')
      .insert([{
        userId: 'admin_hadi',
        email: email,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'admin',
        phone: '01XXXXXXXXX',
        blood_group: 'O+',
        profession: 'Admin'
      }]);
    
    if (error) console.error('Error creating:', error);
    else console.log('Admin created successfully.');
  }
}

setupAdmin().catch(console.error);
