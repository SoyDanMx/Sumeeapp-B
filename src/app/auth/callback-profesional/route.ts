import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  console.log('🔗 PROFESSIONAL AUTH CALLBACK RECEIVED:');
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
    
    // Crear cliente de administración para operaciones de base de datos
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    try {
      console.log('🔄 EXCHANGING CODE FOR SESSION (PROFESSIONAL)...');
      
      // Verificar que el código no esté vacío
      if (!code || code.trim() === '') {
        console.error('❌ EMPTY CODE PROVIDED');
        return NextResponse.redirect(`${origin}/login?error=professional_callback_error&details=${encodeURIComponent('Código de autenticación vacío')}`);
      }
      
      // Intercambiar el código por una sesión
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('❌ ERROR EXCHANGING CODE FOR SESSION:', error);
        console.error('- Error message:', error.message);
        console.error('- Error code:', error.status);
        console.error('- Error details:', error);
        
        // Si es un error de PKCE, intentar con el callback estándar
        if (error.message.includes('code verifier') || error.message.includes('PKCE')) {
          console.log('🔄 PKCE ERROR DETECTED, REDIRECTING TO STANDARD CALLBACK...');
          return NextResponse.redirect(`${origin}/auth/callback?code=${code}`);
        }
        
        return NextResponse.redirect(`${origin}/login?error=professional_callback_error&details=${encodeURIComponent(error.message)}`);
      }

      console.log('✅ CODE EXCHANGED SUCCESSFULLY (PROFESSIONAL)');
      console.log('- User ID:', data.user?.id);
      console.log('- User email:', data.user?.email);
      console.log('- Session:', data.session ? 'Present' : 'Missing');
      console.log('- Session expires at:', data.session?.expires_at);

      if (data.user) {
        console.log('👤 PROFESSIONAL USER AUTHENTICATED:', data.user.id);
        
        // Verificar si el usuario ya tiene un perfil
        const { data: existingProfile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        console.log('🔍 PROFESSIONAL PROFILE CHECK:', { existingProfile, profileError });

        if (profileError && profileError.code === 'PGRST116') {
          // No existe perfil, crear uno nuevo como PROFESIONAL
          console.log('📝 CREATING NEW PROFESSIONAL PROFILE...');
          
          const profileData = {
            user_id: data.user.id,
            role: 'profesional', // SIEMPRE profesional para este callback
            full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Profesional',
            email: data.user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log('📝 PROFESSIONAL PROFILE DATA:', profileData);

          const { error: insertProfileError } = await supabaseAdmin
            .from('profiles')
            .insert([profileData]);

          if (insertProfileError) {
            console.error('❌ Error creating professional profile:', insertProfileError);
            return NextResponse.redirect(`${origin}/login?error=professional_profile_creation_error&details=${encodeURIComponent(insertProfileError.message)}`);
          }

          console.log('✅ PROFESSIONAL PROFILE CREATED SUCCESSFULLY');
          
          // Crear datos específicos de profesional
          const professionalData = {
            user_id: data.user.id,
            profession: data.user.user_metadata?.profession || 'General',
            whatsapp: data.user.user_metadata?.whatsapp || '',
            descripcion_perfil: data.user.user_metadata?.descripcion_perfil || '',
            specialties: data.user.user_metadata?.specialties || ['General'],
            experience_years: parseInt(data.user.user_metadata?.experience_years) || 0,
            disponibilidad: 'disponible',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log('📝 PROFESSIONAL SPECIFIC DATA:', professionalData);

          const { error: insertProfessionalError } = await supabaseAdmin
            .from('profesionales')
            .insert([professionalData]);

          if (insertProfessionalError) {
            console.error('❌ Error creating professional specific data:', insertProfessionalError);
            // No es crítico, el perfil ya se creó
            console.log('⚠️ Professional profile created but specific data failed');
          } else {
            console.log('✅ PROFESSIONAL SPECIFIC DATA CREATED SUCCESSFULLY');
          }

        } else if (profileError) {
          console.error('❌ Error checking existing professional profile:', profileError);
          return NextResponse.redirect(`${origin}/login?error=professional_profile_check_error&details=${encodeURIComponent(profileError.message)}`);
        } else if (existingProfile) {
          console.log('✅ EXISTING PROFESSIONAL PROFILE FOUND:', existingProfile.role);
          
          // Verificar que el perfil existente sea de profesional
          if (existingProfile.role !== 'profesional') {
            console.log('🔧 UPDATING EXISTING PROFILE TO PROFESSIONAL...');
            
            const { error: updateError } = await supabaseAdmin
              .from('profiles')
              .update({ 
                role: 'profesional',
                updated_at: new Date().toISOString()
              })
              .eq('user_id', data.user.id);

            if (updateError) {
              console.error('❌ Error updating profile to professional:', updateError);
            } else {
              console.log('✅ PROFILE UPDATED TO PROFESSIONAL');
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ UNEXPECTED ERROR IN PROFESSIONAL AUTH CALLBACK:', error);
      console.error('- Error type:', typeof error);
      console.error('- Error message:', error instanceof Error ? error.message : 'Unknown error');
      return NextResponse.redirect(`${origin}/login?error=professional_unexpected_error&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`);
    }
  } else {
    console.log('❌ NO CODE PROVIDED IN PROFESSIONAL CALLBACK');
    return NextResponse.redirect(`${origin}/login?error=professional_no_code_provided`);
  }

  console.log('🎯 REDIRECTING PROFESSIONAL TO DASHBOARD...');
  
  // Redirigir directamente al dashboard profesional
  const response = NextResponse.redirect(`${origin}/professional-dashboard`);
  
  // Agregar headers para asegurar que la sesión se mantenga
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}
