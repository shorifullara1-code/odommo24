import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
     // @ts-ignore
    return import.meta.env[key];
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://abwdkxhifnllamycvkpy.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFid2RreGhpZm5sbGFteWN2a3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MTIyMjgsImV4cCI6MjA5MjA4ODIyOH0.vQM9Q9mVg3xr5mTKCAANcU9piNb2E9hvaQIHYgEnhww';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
