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
        // 4. SI TENEMOS UNA SESIÓN, usamos el ID del usuario para buscar su rol.
        const userId = session.user.id;
        
        console.log('🔍 FETCHING USER PROFILE FOR ROLE...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', userId)
          .single();
        
        if (profileError) {
          console.error('❌ ERROR FETCHING PROFILE ROLE:', profileError);
          console.error('- Error message:', profileError.message);
          // Si no podemos obtener el perfil, lo enviamos a una página genérica como fallback.
          return NextResponse.redirect(`${origin}/dashboard/client`);
        }
        
        console.log('✅ PROFILE FETCHED SUCCESSFULLY');
        const profileData = profile as any;
        console.log('- User role:', profileData.role);
        
        // 5. REDIRIGIMOS BASADO EN EL ROL.
        if (profileData.role === 'profesional') {
          console.log('🎯 REDIRECTING PROFESSIONAL USER TO PROFESSIONAL DASHBOARD...');
          return NextResponse.redirect(`${origin}/professional-dashboard`);
        } else {
          console.log('🎯 REDIRECTING CLIENT USER TO CLIENT DASHBOARD...');
          return NextResponse.redirect(`${origin}/dashboard/client`);
        }
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
