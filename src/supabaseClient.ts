import { createClient } from '@supabase/supabase-js';

// No Next.js, as variáveis públicas devem começar com NEXT_PUBLIC_
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sua-url-aqui.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sua-anon-key-aqui';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
