import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = (supabaseUrl && (supabaseAnonKey || supabaseServiceKey))
    ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : null;

if (!supabase) {
    console.warn('⚠️  Supabase credentials not configured. Database features disabled.');
}
