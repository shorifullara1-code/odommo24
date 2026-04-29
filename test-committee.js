import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('committee_members')
    .select('*')
    .eq('is_active', 1)
    .order('sort_order', { ascending: true });
    
  console.log('Error:', JSON.stringify(error, null, 2));
}
test();
