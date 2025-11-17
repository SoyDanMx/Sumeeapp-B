/**
 * Script para confirmar el email del usuario de prueba
 * Ejecutar: node scripts/confirm-test-user-email.js
 * 
 * Requisitos:
 * - Tener .env.local con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 * - O establecer las variables de entorno directamente
 */

const { createClient } = require('@supabase/supabase-js');

// Intentar cargar dotenv si está disponible
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv no está disponible, usar variables de entorno directamente
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function confirmTestUserEmail() {
  const testEmail = 'cliente@sumeeapp.com';
  const userId = '90ce751d-8e90-47a3-abc1-36c1e033d48d';

  console.log('🔍 Buscando usuario:', testEmail);

  try {
    // Buscar usuario por ID (más rápido)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError) {
      console.error('❌ Error al buscar usuario:', userError.message);
      process.exit(1);
    }

    const user = userData.user;

    console.log('✅ Usuario encontrado:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Email confirmado:', user.email_confirmed_at ? '✅ Sí' : '❌ No');

    if (user.email_confirmed_at) {
      console.log('✅ El email ya está confirmado. No se requiere acción.');
      return;
    }

    // Confirmar email
    console.log('\n📧 Confirmando email...');
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });

    if (updateError) {
      console.error('❌ Error al confirmar email:', updateError.message);
      process.exit(1);
    }

    console.log('✅ Email confirmado exitosamente!');
    console.log('   Email confirmado en:', updatedUser.user.email_confirmed_at);
    console.log('\n🎉 El usuario ahora puede iniciar sesión.');

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    process.exit(1);
  }
}

confirmTestUserEmail();

