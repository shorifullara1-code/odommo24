
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);
async function removeOldAdmin() {
  const { error } = await supabase.from('users').delete().eq('userId', 'admin');
  if (error) console.error(error);
  else console.log('Old admin removed.');
}
removeOldAdmin();
