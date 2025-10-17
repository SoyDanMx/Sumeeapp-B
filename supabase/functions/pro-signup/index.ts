// supabase/functions/pro-signup/index.ts

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Función pro-signup iniciada.')

serve(async (req) => {
  // Manejar la petición pre-vuelo de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // CORRECCIÓN: Ahora recibimos el 'email' desde el frontend
    const { fullName, profession, phone, email, password } = await req.json()
    console.log('Recibida nueva solicitud de registro para:', { fullName, profession, phone, email })

    // Validación más robusta, incluyendo el email
    if (!fullName || !profession || !phone || !email || !password) {
      throw new Error('Faltan campos obligatorios: Nombre, Oficio, Teléfono, Email y Contraseña.')
    }
    if (password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres.')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // CORRECCIÓN: Usamos el email real y mantenemos la auto-confirmación para un registro sin fricciones
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      phone: phone,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        profession: profession,
      }
    })

    if (authError) {
      // Si el error es porque el usuario ya existe, enviamos una respuesta clara al frontend
      if (authError.message.includes('already registered')) {
        console.warn('Intento de registro con datos ya existentes:', { email, phone })
        return new Response(JSON.stringify({ error: 'Este correo electrónico o número de teléfono ya está registrado. Por favor, inicia sesión.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409, // 409 Conflict: indica que el recurso ya existe
        })
      }
      throw new Error(`Error de autenticación: ${authError.message}`)
    }
    if (!user) throw new Error('No se pudo crear el usuario en el sistema de autenticación.')
    console.log('Usuario creado en Auth con éxito. ID:', user.id)

    // Insertamos el perfil completo en nuestra tabla 'profiles'
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: user.id,
        full_name: fullName,
        email: email, // Guardamos el email real
        phone: phone,
        profession: profession,
        work_area: 'CDMX',
        membership_status: 'free'
      })

    if (profileError) {
      // ¡CRÍTICO! Si la inserción del perfil falla, revertimos la creación del usuario.
      console.error('Error al insertar el perfil. Revirtiendo creación de usuario...', profileError)
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      console.log('Usuario revertido con éxito. ID:', user.id)
      throw new Error(`Error al guardar tu perfil: ${profileError.message}`)
    }
    console.log('Perfil insertado en la base de datos con éxito para el usuario ID:', user.id)

    // Si todo fue exitoso
    return new Response(JSON.stringify({ message: '¡Profesional registrado con éxito! Favor de iniciar sesión.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error general en la función pro-signup:', error)
    return new Response(JSON.stringify({ error: error.message || 'Ocurrió un error inesperado.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})