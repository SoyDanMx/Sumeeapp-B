import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl, getPostLoginRedirectUrl, getProfessionalDashboardUrl, getClientDashboardUrl, getSafeRedirectUrl } from '@/lib/utils';
import { autoFixUserRole } from '@/lib/supabase/role-fix';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = getBaseUrl(); // Usar función dinámica en lugar de requestUrl.origin

  console.log('🔗 AUTH CALLBACK RECEIVED (DYNAMIC):');
  console.log('- URL:', request.url);
  console.log('- Code:', code ? 'Present' : 'Missing');
  console.log('- Dynamic Origin:', origin);
  console.log('- Request Origin:', requestUrl.origin);

  if (!code) {
    console.log('❌ NO CODE PROVIDED IN CALLBACK');
    return NextResponse.redirect(`${origin}/login?error=no_code_provided`);
  }

  const cookieStore = await cookies();
  
  // Crear cliente de servidor con configuración PKCE optimizada
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
    console.log('🔄 EXCHANGING CODE FOR SESSION (DYNAMIC)...');
    
    // Intercambiar el código por una sesión con manejo robusto de PKCE
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('❌ ERROR EXCHANGING CODE FOR SESSION:', error);
      console.error('- Error message:', error.message);
      console.error('- Error code:', error.status);
      console.error('- Error details:', error);
      
      // Manejo específico de errores PKCE
      if (error.message.includes('code verifier') || error.message.includes('PKCE')) {
        console.log('🔄 PKCE ERROR DETECTED, TRYING ALTERNATIVE METHOD...');
        
        // Intentar con el método de verificación de email como fallback
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: code,
          type: 'email'
        });
        
        if (verifyError) {
          console.error('❌ ALTERNATIVE METHOD ALSO FAILED:', verifyError);
          return NextResponse.redirect(`${origin}/login?error=pkce_error&details=${encodeURIComponent(`PKCE Error: ${error.message}`)}`);
        }
        
        console.log('✅ ALTERNATIVE METHOD SUCCESSFUL');
        if (verifyData.user) {
          return await processUserRegistration(verifyData, supabaseAdmin, origin, request);
        }
      }
      
      return NextResponse.redirect(`${origin}/login?error=auth_callback_error&details=${encodeURIComponent(error.message)}`);
    }

    console.log('✅ CODE EXCHANGED SUCCESSFULLY');
    console.log('- User ID:', data.user?.id);
    console.log('- User email:', data.user?.email);
    console.log('- Session:', data.session ? 'Present' : 'Missing');
    console.log('- Session expires at:', data.session?.expires_at);

    // Procesar el usuario usando la función centralizada
    return await processUserRegistration(data, supabaseAdmin, origin, request);
    
  } catch (error) {
    console.error('❌ UNEXPECTED ERROR IN AUTH CALLBACK:', error);
    console.error('- Error type:', typeof error);
    console.error('- Error message:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.redirect(`${origin}/login?error=unexpected_error&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`);
  }
}

// Función para procesar el registro de usuario (optimizada con redirección dinámica)
async function processUserRegistration(userData: any, supabaseAdmin: any, origin: string, request: NextRequest) {
  const { user, session } = userData;
  
  if (!user) {
    console.log('❌ NO USER IN DATA');
    return NextResponse.redirect(`${origin}/login?error=no_user_found`);
  }

  console.log('👤 USER AUTHENTICATED:', user.id);
  
  // Verificar si el usuario ya tiene un perfil
  const { data: existingProfile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  console.log('🔍 PROFILE CHECK:', { existingProfile, profileError });

  if (profileError && profileError.code === 'PGRST116') {
    // No existe perfil, crear uno nuevo
    console.log('📝 CREATING NEW PROFILE...');
    
    // Determinar el rol basado en múltiples fuentes
    const referer = request.headers.get('referer') || '';
    const requestOrigin = request.headers.get('origin') || '';
    
    // LÓGICA CRÍTICA: Detectar registro profesional de manera más robusta
    const hasProfessionalMetadata = user.user_metadata?.registration_type === 'profesional';
    const cookies = request.headers.get('cookie') || '';
    const hasProfessionalCookie = cookies.includes('registration_type=profesional');
    const fromProfessionalFlow = referer.includes('/join-as-pro') || 
                               requestOrigin.includes('/join-as-pro') ||
                               referer.includes('join-as-pro');
    const emailIndicators = user.email?.includes('profesional') || 
                           user.email?.includes('pro') ||
                           user.user_metadata?.full_name?.toLowerCase().includes('profesional');
    const fromEmailConfirmation = referer.includes('sumeeapp.com') && 
                                (referer.includes('profesional') || 
                                 referer.includes('join-as-pro'));
    
    let isProfessionalRegistration = hasProfessionalMetadata || 
                                     hasProfessionalCookie || 
                                     fromProfessionalFlow || 
                                     emailIndicators || 
                                     fromEmailConfirmation;
    
    // NUEVA LÓGICA: Verificar si el usuario ya existe y es profesional
    if (!isProfessionalRegistration) {
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (existingUser?.role === 'profesional') {
        isProfessionalRegistration = true;
        console.log('🔍 EXISTING PROFESSIONAL DETECTED');
      }
    }
    
    console.log('🔍 DEBUGGING PROFESSIONAL REGISTRATION:');
    console.log('- User ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- User metadata:', JSON.stringify(user.user_metadata, null, 2));
    console.log('- Registration type from metadata:', user.user_metadata?.registration_type);
    console.log('- Full name:', user.user_metadata?.full_name);
    console.log('- Referer:', referer);
    console.log('- Origin:', requestOrigin);
    console.log('- Cookies:', cookies);
    console.log('--- DETECTION LOGIC ---');
    console.log('- hasProfessionalMetadata (PRIORITY 1):', hasProfessionalMetadata);
    console.log('- hasProfessionalCookie (PRIORITY 2):', hasProfessionalCookie);
    console.log('- fromProfessionalFlow (PRIORITY 3):', fromProfessionalFlow);
    console.log('- emailIndicators (PRIORITY 4):', emailIndicators);
    console.log('- fromEmailConfirmation (PRIORITY 5):', fromEmailConfirmation);
    console.log('- FINAL RESULT - isProfessionalRegistration:', isProfessionalRegistration);
    console.log('- DECISION: User will be created as', isProfessionalRegistration ? 'PROFESIONAL' : 'CLIENT');
    
    const profileData = {
      user_id: user.id,
      role: isProfessionalRegistration ? 'profesional' : 'client',
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
      email: user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📝 CREATING PROFILE WITH DATA:', profileData);

    const { error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert([profileData]);

    if (insertError) {
      console.error('❌ Error creating profile:', insertError);
      return NextResponse.redirect(`${origin}/login?error=profile_creation_error&details=${encodeURIComponent(insertError.message)}`);
    }

    console.log(`✅ Profile created successfully with role: ${isProfessionalRegistration ? 'profesional' : 'client'}`);
    
    // Si es profesional, crear datos específicos en la tabla profesionales
    if (isProfessionalRegistration) {
      console.log('📝 CREATING PROFESSIONAL SPECIFIC DATA...');
      
      const professionalData = {
        user_id: user.id,
        profession: user.user_metadata?.profession || 'General',
        whatsapp: user.user_metadata?.whatsapp || '',
        descripcion_perfil: user.user_metadata?.descripcion_perfil || 'Profesional verificado en Sumee App',
        specialties: user.user_metadata?.specialties || ['General'],
        experience_years: parseInt(user.user_metadata?.experience_years) || 2,
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
        console.log('⚠️ Professional profile created but specific data failed');
      } else {
        console.log('✅ PROFESSIONAL SPECIFIC DATA CREATED SUCCESSFULLY');
      }
    }
    
    // Log adicional para verificar la inserción
    const { data: insertedProfile, error: verifyError } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name, email')
      .eq('user_id', user.id)
      .single();
      
    if (verifyError) {
      console.error('❌ Error verifying profile creation:', verifyError);
    } else {
      console.log('✅ Profile verification successful:', insertedProfile);
    }

    // AUTO-FIX: Verificar y corregir el rol si es necesario
    if (!isProfessionalRegistration && user.user_metadata?.registration_type === 'profesional') {
      console.log('🔧 AUTO-FIX: User metadata indicates professional but was created as client, fixing...');
      const fixResult = await autoFixUserRole(user.id, user.user_metadata);
      if (fixResult.success && fixResult.fixed) {
        console.log('✅ AUTO-FIX: User role corrected to professional');
        isProfessionalRegistration = true;
      } else if (fixResult.error) {
        console.error('❌ AUTO-FIX: Failed to correct user role:', fixResult.error);
      }
    }
  } else if (profileError) {
    console.error('Error checking existing profile:', profileError);
    return NextResponse.redirect(`${origin}/login?error=profile_check_error&details=${encodeURIComponent(profileError.message)}`);
  } else if (existingProfile) {
    console.log('Existing profile found:', existingProfile.role);
    
    // AUTO-FIX: Verificar si el perfil existente necesita corrección
    if (existingProfile.role === 'client' && user.user_metadata?.registration_type === 'profesional') {
      console.log('🔧 AUTO-FIX: Existing profile is client but user metadata indicates professional, fixing...');
      const fixResult = await autoFixUserRole(user.id, user.user_metadata);
      if (fixResult.success && fixResult.fixed) {
        console.log('✅ AUTO-FIX: Existing profile role corrected to professional');
      } else if (fixResult.error) {
        console.error('❌ AUTO-FIX: Failed to correct existing profile role:', fixResult.error);
      }
    }
  }

  console.log('🎯 REDIRECTING TO DASHBOARD (DYNAMIC)...');
  
  // SOLUCIÓN CLAVE: Redirección dinámica basada en el rol del usuario
  let redirectUrl: string;
  
  if (existingProfile?.role === 'profesional' || user.user_metadata?.registration_type === 'profesional') {
    redirectUrl = getProfessionalDashboardUrl();
    console.log('👨‍💼 Redirecting to professional dashboard:', redirectUrl);
  } else {
    redirectUrl = getClientDashboardUrl();
    console.log('👤 Redirecting to client dashboard:', redirectUrl);
  }
  
  // Validar que la URL de redirección sea segura
  const safeRedirectUrl = getSafeRedirectUrl(redirectUrl);
  console.log('🔒 Safe redirect URL:', safeRedirectUrl);
  
  const response = NextResponse.redirect(safeRedirectUrl);
  
  // Agregar headers para asegurar que la sesión se mantenga
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}
