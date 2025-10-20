import { createClient } from 'jsr:@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Función pro-signup iniciada.');

const REDIRECT_TO_URL = 'https://sumeeapp.com/auth/callback';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let user = null;

  try {
    const { fullName, profession, phone, email, password } = await req.json();
    console.log('Solicitud de registro:', { fullName, profession, phone, email });

    // Validación
    if (!fullName || !profession || !phone || !email || !password) {
      throw new Error('Faltan campos obligatorios.');
    }
    if (password.length < 8) {
      throw new Error('Contraseña debe tener al menos 8 caracteres.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+52|52)?[ -]?[0-9]{10}$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido.');
    }
    if (!phoneRegex.test(phone)) {
      throw new Error('Teléfono inválido (México).');
    }

    // Check secrets
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Secrets no cargados:', { supabaseUrl: !!supabaseUrl, serviceRoleKey: !!serviceRoleKey });
      throw new Error('Configuración de secrets falló.');
    }
    console.log('Secrets OK.');

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 1. Crear usuario con confirmación requerida
    const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      phone,
      email_confirm: false, // Dispara tu email de confirmación
      user_metadata: {
        full_name: fullName,
        profession: profession,
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.warn('Usuario ya existe:', { email, phone });
        
        // FIX: Usa generateLink para reenviar confirmación (tu plantilla)
        const { data: linkData, error: resendError } = await supabaseAdmin.auth.admin.generateLink(email, { 
          type: 'signup', // 'signup' para tu HTML de confirmación
          redirectTo: REDIRECT_TO_URL 
        });
        
        if (resendError) {
          console.error('Error resend:', resendError.message);
        } else {
          console.log('Confirmación reenviada:', linkData.properties.actionLink);
        }

        return new Response(JSON.stringify({ 
          error: 'Correo ya registrado. Revisa tu inbox.', 
          message: 'Reenviado enlace de confirmación.' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409
        });
      }
      throw new Error(`Auth error: ${authError.message}`);
    }

    user = userData.user;
    if (!user) throw new Error('No se pudo crear usuario.');
    console.log('Usuario creado. ID:', user.id);

    // 2. Insertar perfil
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: user.id,
        full_name: fullName,
        email: email, 
        phone: phone,
        profession: profession,
        work_area: 'CDMX',
        membership_status: 'free'
      });

    if (profileError) {
      console.error('Error perfil. Revirtiendo...', profileError);
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (deleteError) console.error('Error revert:', deleteError.message);
      else console.log('Revertido. ID:', user.id);
      throw new Error(`Error perfil: ${profileError.message}`);
    }
    console.log('Perfil insertado. ID:', user.id);

    // 3. Confirmación: Supabase envía tu plantilla automáticamente
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink(user.email, { 
      type: 'signup', // FIX: 'signup' para tu HTML
      redirectTo: REDIRECT_TO_URL
    });

    if (linkError) {
      console.error('Error link:', linkError.message);
    } else {
      console.log('Link generado:', linkData.properties.actionLink);
    }

    return new Response(JSON.stringify({ 
      message: '¡Registrado! Confirma tu correo para activar tu perfil.' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error pro-signup:', error.message);
    return new Response(JSON.stringify({ error: error.message || 'Error inesperado.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});