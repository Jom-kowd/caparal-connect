import { createClient } from '@supabase/supabase-js';

// ⚠️ I-PASTE DITO ANG IYONG SUPABASE URL AT ANON KEY ⚠️
const supabaseUrl = 'https://mofswexoediinaftamxt.supabase.co';
const supabaseKey = 'sb_publishable_73xfvpLrXAdcsbRvZ-pf3A_rl-Rh-4L';

export const supabase = createClient(supabaseUrl, supabaseKey);