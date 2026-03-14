import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Cliente para uso no Frontend / Client Components (Com Cookies)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * Cliente com privilégios de Admin (Service Role)
 * USE APENAS EM SERVER COMPONENTS / API ROUTES.
 * Nunca exponha a Service Role Key no frontend.
 */
export const getSupabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
