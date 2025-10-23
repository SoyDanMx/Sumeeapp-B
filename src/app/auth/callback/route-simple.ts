import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  console.log('🔗 AUTH CALLBACK RECEIVED:');
  console.log('- URL:', request.url);
  console.log('- Code:', code ? 'Present' : 'Missing');
  console.log('- Origin:', origin);

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    try {
      console.log('🔄 EXCHANGING CODE FOR SESSION...');
      
      // Intercambiar el código por una sesión
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('❌ ERROR EXCHANGING CODE FOR SESSION:', error);
        return NextResponse.redirect(`${origin}/login?error=auth_callback_error&details=${encodeURIComponent(error.message)}`);
      }

      console.log('✅ CODE EXCHANGED SUCCESSFULLY');
      console.log('- User ID:', data.user?.id);
      console.log('- User email:', data.user?.email);
      console.log('- Session:', data.session ? 'Present' : 'Missing');

      // El trigger ya se encargó de crear el perfil automáticamente
      console.log('🔧 El trigger ya creó el perfil automáticamente');
      
      // Redirigir al dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
      
    } catch (error) {
      console.error('❌ UNEXPECTED ERROR IN AUTH CALLBACK:', error);
      return NextResponse.redirect(`${origin}/login?error=unexpected_error&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`);
    }
  } else {
    console.log('❌ NO CODE PROVIDED IN CALLBACK');
    return NextResponse.redirect(`${origin}/login?error=no_code_provided`);
  }
}
