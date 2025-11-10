import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}

export function createSupabaseAdminClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Log detallado para debugging (solo en desarrollo y durante troubleshooting)
  console.log('🔍 createSupabaseAdminClient - Verificando variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Definida' : '❌ Falta');
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? `✅ Definida (${serviceRoleKey.substring(0, 10)}...)` : '❌ Falta');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "❌ SUPABASE_SERVICE_ROLE_KEY no está definido. Las operaciones administrativas fallarán."
    );
    console.error('Variables disponibles:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}
