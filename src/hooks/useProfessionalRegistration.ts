'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface ProfessionalRegistrationData {
  fullName: string;
  email: string;
  password: string;
  whatsapp: string;
  profession?: string;
  descripcionPerfil?: string;
}

interface RegistrationResult {
  success: boolean;
  message: string;
  userId?: string;
  profileId?: string;
  professionalId?: string;
  error?: string;
  needsEmailConfirmation?: boolean;
}

export function useProfessionalRegistration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerProfessional = async (data: ProfessionalRegistrationData): Promise<RegistrationResult> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 INICIANDO REGISTRO PROFESIONAL CON RPC...');
      console.log('Datos del formulario:', data);

      // Paso 1: Crear usuario en auth.users usando Supabase Auth
      console.log('📧 CREANDO USUARIO EN AUTH.USERS...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: data.fullName,
            whatsapp: data.whatsapp,
            registration_type: 'profesional',
            profession: data.profession || 'General',
            descripcion_perfil: data.descripcionPerfil || 'Profesional verificado en Sumee App'
          }
        }
      });

      if (authError) {
        console.error('❌ Error en auth.signUp:', authError);
        throw new Error(`Error al crear usuario: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      console.log('✅ Usuario creado en auth.users:', authData.user.id);

      // Paso 2: Verificar si el email necesita confirmación
      if (!authData.user.email_confirmed_at) {
        console.log('📧 Email no confirmado, esperando confirmación...');
        return {
          success: true,
          message: '¡Usuario creado! Revisa tu correo electrónico para confirmar tu cuenta. Una vez confirmado, tu perfil profesional se creará automáticamente.',
          userId: authData.user.id,
          needsEmailConfirmation: true
        };
      }

      // Paso 3: Si el email ya está confirmado, crear perfil usando RPC
      console.log('🔧 CREANDO PERFIL PROFESIONAL CON RPC...');
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_professional_complete', {
        p_full_name: data.fullName,
        p_email: data.email,
        p_profession: data.profession || 'General',
        p_whatsapp: data.whatsapp,
        p_descripcion_perfil: data.descripcionPerfil || 'Profesional verificado en Sumee App'
      });

      if (rpcError) {
        console.error('❌ Error en RPC create_professional_complete:', rpcError);
        throw new Error(`Error al crear perfil profesional: ${rpcError.message}`);
      }

      if (!rpcData.success) {
        console.error('❌ RPC retornó error:', rpcData);
        throw new Error(rpcData.error || 'Error desconocido al crear perfil profesional');
      }

      console.log('✅ Perfil profesional creado exitosamente:', rpcData);
      
      return {
        success: true,
        message: '¡Excelente! Tu cuenta profesional ha sido creada exitosamente. Ya puedes acceder a tu dashboard profesional.',
        userId: rpcData.user_id,
        profileId: rpcData.profile_id,
        professionalId: rpcData.professional_id
      };

    } catch (err: any) {
      console.error('❌ Error en registro profesional:', err);
      const errorMessage = err.message || 'Hubo un problema al procesar tu registro. Por favor, inténtalo de nuevo.';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const createProfileAfterConfirmation = async (): Promise<RegistrationResult> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔧 CREANDO PERFIL DESPUÉS DE CONFIRMACIÓN...');
      
      // Obtener el usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Usuario no autenticado');
      }

      // Obtener metadatos del usuario
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
      const email = user.email || '';
      const whatsapp = user.user_metadata?.whatsapp || '';
      const profession = user.user_metadata?.profession || 'General';
      const descripcionPerfil = user.user_metadata?.descripcion_perfil || 'Profesional verificado en Sumee App';

      // Crear perfil usando RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_professional_complete', {
        p_full_name: fullName,
        p_email: email,
        p_profession: profession,
        p_whatsapp: whatsapp,
        p_descripcion_perfil: descripcionPerfil
      });

      if (rpcError) {
        console.error('❌ Error en RPC create_professional_complete:', rpcError);
        throw new Error(`Error al crear perfil profesional: ${rpcError.message}`);
      }

      if (!rpcData.success) {
        console.error('❌ RPC retornó error:', rpcData);
        throw new Error(rpcData.error || 'Error desconocido al crear perfil profesional');
      }

      console.log('✅ Perfil profesional creado exitosamente:', rpcData);
      
      return {
        success: true,
        message: '¡Perfil profesional creado exitosamente!',
        userId: rpcData.user_id,
        profileId: rpcData.profile_id,
        professionalId: rpcData.professional_id
      };

    } catch (err: any) {
      console.error('❌ Error en createProfileAfterConfirmation:', err);
      const errorMessage = err.message || 'Error al crear perfil profesional';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    registerProfessional,
    createProfileAfterConfirmation
  };
}
