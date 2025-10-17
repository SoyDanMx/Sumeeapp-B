// supabase/functions/_shared/cors.ts

// Estos son los encabezados estándar de CORS que permiten que tu aplicación web
// (ej. localhost o sumeeapp.com) se comunique de forma segura con tu Edge Function.
export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  