import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('committee_members')
    .select('*')
    .eq('is_active', 1)
    .order('sort_order', { ascending: true });
    
  if (data) {
    console.log('Data length:', data.length);
    console.log('Payload size:', JSON.stringify(data).length / 1024 / 1024, 'MB');
  } else {
    console.log('Error:', error);
  }
}
test();
