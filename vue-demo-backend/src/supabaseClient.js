import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is missing');
}

export const supabase = createClient(
  supabaseUrl,
  process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
