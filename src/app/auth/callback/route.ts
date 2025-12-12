import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// 1. IMPORTAMOS el cliente de Supabase para el SERVIDOR.
import { createSupabaseServerClient } from '@/lib/supabase/server-new';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';

  console.log('🔗 AUTH CALLBACK RECEIVED:');
  console.log('- URL:', request.url);
  console.log('- Code:', code ? 'Present' : 'Missing');
  console.log('- Origin:', origin);
  console.log('- Next:', next);

  if (code) {
    // 2. CREAMOS una instancia del cliente de servidor.
    const supabase = await createSupabaseServerClient();
    
    try {
      console.log('🔄 EXCHANGING CODE FOR SESSION...');
      
      // 3. INTERCAMBIAMOS el código por una sesión. Esto establece la cookie.
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('❌ ERROR EXCHANGING CODE FOR SESSION:', error);
        console.error('- Error message:', error.message);
        // Si hay un error, redirigir a una página de error de autenticación
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
      }

      if (session) {
        console.log('✅ CODE EXCHANGED SUCCESSFULLY');
        console.log('- User ID:', session.user.id);
        console.log('- User email:', session.user.email);
        console.log('- Session:', session ? 'Present' : 'Missing');

        // --- LÓGICA DE REDIRECCIÓN INTELIGENTE ---
        // ✅ OPTIMIZACIÓN: Redirigir directamente a /dashboard que manejará el routing
        // Esto evita una consulta adicional a profiles aquí
        // El dashboard usará useUserRole que tiene caché y es más eficiente
        
        console.log('✅ SESSION ESTABLISHED, REDIRECTING TO DASHBOARD...');
        console.log('- User ID:', session.user.id);
        console.log('- User email:', session.user.email);
        
        // Redirigir a /dashboard que manejará el routing basado en el rol
        // usando los hooks optimizados con caché
        return NextResponse.redirect(`${origin}/dashboard`);
      } else {
        console.error('❌ NO SESSION AFTER CODE EXCHANGE');
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
      }
      
    } catch (error) {
      console.error('❌ UNEXPECTED ERROR IN AUTH CALLBACK:', error);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
  } else {
    console.error('❌ NO CODE PROVIDED IN CALLBACK');
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }
}
