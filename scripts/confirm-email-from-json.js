/**
 * Script para confirmar email usando la información del usuario
 * Ejecutar: node scripts/confirm-email-from-json.js
 * 
 * Este script usa el User ID directamente para confirmar el email
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
  console.error('\n💡 Solución: Asegúrate de tener .env.local con estas variables');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Información del usuario desde el JSON proporcionado
const userInfo = {
  id: "90ce751d-8e90-47a3-abc1-36c1e033d48d",
  email: "cliente@sumeeapp.com",
  confirmed_at: null, // Este es el campo que necesitamos cambiar
};

async function confirmEmail() {
  console.log('🔍 Confirmando email para el usuario:');
  console.log('   ID:', userInfo.id);
  console.log('   Email:', userInfo.email);
  console.log('   Estado actual: confirmed_at =', userInfo.confirmed_at || 'null (no confirmado)');
  console.log('\n📧 Confirmando email...\n');

  try {
    // Confirmar email usando Admin API
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userInfo.id,
      {
        email_confirm: true, // Esto establecerá confirmed_at a la fecha actual
      }
    );

    if (updateError) {
      console.error('❌ Error al confirmar email:', updateError.message);
      console.error('   Código:', updateError.status);
      process.exit(1);
    }

    console.log('✅ Email confirmado exitosamente!');
    console.log('\n📋 Información actualizada:');
    console.log('   ID:', updatedUser.user.id);
    console.log('   Email:', updatedUser.user.email);
    console.log('   confirmed_at:', updatedUser.user.email_confirmed_at || 'N/A');
    console.log('   updated_at:', updatedUser.user.updated_at || 'N/A');
    
    console.log('\n🎉 El usuario ahora puede iniciar sesión con:');
    console.log('   Email: cliente@sumeeapp.com');
    console.log('   Password: TestCliente123!');

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    process.exit(1);
  }
}

confirmEmail();

