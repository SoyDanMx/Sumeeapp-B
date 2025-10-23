import { createClient } from '@supabase/supabase-js';

// Cliente de administración para operaciones de base de datos
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface RoleFixResult {
  success: boolean;
  fixed: boolean;
  error?: string;
  previousRole?: string;
  newRole?: string;
}

/**
 * Corrige automáticamente el rol de un usuario si se detecta que debería ser profesional
 * pero está registrado como cliente.
 */
export async function autoFixUserRole(
  userId: string, 
  userMetadata: any
): Promise<RoleFixResult> {
  try {
    console.log('🔧 AUTO-FIX: Starting role correction for user:', userId);
    console.log('🔧 AUTO-FIX: User metadata:', userMetadata);

    // Verificar si el usuario debería ser profesional
    const shouldBeProfessional = 
      userMetadata?.registration_type === 'profesional' ||
      userMetadata?.full_name?.toLowerCase().includes('profesional') ||
      userMetadata?.full_name?.toLowerCase().includes('test') ||
      userMetadata?.email?.includes('profesional') ||
      userMetadata?.email?.includes('pro');

    if (!shouldBeProfessional) {
      console.log('🔧 AUTO-FIX: User should not be professional, skipping fix');
      return {
        success: true,
        fixed: false,
        error: 'User should not be professional based on metadata'
      };
    }

    // Obtener el perfil actual
    const { data: currentProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name, email')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('🔧 AUTO-FIX: Error getting current profile:', profileError);
      return {
        success: false,
        fixed: false,
        error: `Error getting current profile: ${profileError.message}`
      };
    }

    if (!currentProfile) {
      console.error('🔧 AUTO-FIX: No profile found for user');
      return {
        success: false,
        fixed: false,
        error: 'No profile found for user'
      };
    }

    console.log('🔧 AUTO-FIX: Current profile:', currentProfile);

    // Si ya es profesional, no hay nada que corregir
    if (currentProfile.role === 'profesional') {
      console.log('🔧 AUTO-FIX: User is already professional, no fix needed');
      return {
        success: true,
        fixed: false,
        previousRole: currentProfile.role,
        newRole: currentProfile.role
      };
    }

    // Corregir el rol a profesional
    console.log('🔧 AUTO-FIX: Correcting role from client to profesional');
    
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role: 'profesional',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select('role, full_name, email')
      .single();

    if (updateError) {
      console.error('🔧 AUTO-FIX: Error updating profile:', updateError);
      return {
        success: false,
        fixed: false,
        error: `Error updating profile: ${updateError.message}`
      };
    }

    console.log('🔧 AUTO-FIX: Profile updated successfully:', updatedProfile);

    return {
      success: true,
      fixed: true,
      previousRole: currentProfile.role,
      newRole: updatedProfile.role
    };

  } catch (error: any) {
    console.error('🔧 AUTO-FIX: Unexpected error:', error);
    return {
      success: false,
      fixed: false,
      error: `Unexpected error: ${error.message}`
    };
  }
}

/**
 * Verifica si un usuario debería ser profesional basado en múltiples indicadores
 */
export function shouldUserBeProfessional(userMetadata: any, email?: string): boolean {
  const indicators = [
    userMetadata?.registration_type === 'profesional',
    userMetadata?.full_name?.toLowerCase().includes('profesional'),
    userMetadata?.full_name?.toLowerCase().includes('test'),
    email?.includes('profesional'),
    email?.includes('pro'),
    email?.includes('test')
  ];

  return indicators.some(indicator => indicator === true);
}