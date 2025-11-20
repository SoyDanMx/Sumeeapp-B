// src/lib/supabase/credential-sender.ts

import { Profesional } from "@/types/supabase";
import { supabase } from "@/lib/supabase/client";

/**
 * Genera un link de WhatsApp para enviar la credencial al cliente
 */
export function generateWhatsAppCredentialLink(
  clienteWhatsapp: string,
  profesional: Profesional
): string {
  const professionalUrl = `${
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || ""
  }/profesional/${profesional.user_id}`;

  // Limpiar número de WhatsApp
  const cleanPhone = clienteWhatsapp.replace(/\D/g, "");
  const whatsappPhone = cleanPhone.startsWith("52")
    ? cleanPhone
    : `52${cleanPhone}`;

  // Mensaje personalizado
  const message = encodeURIComponent(
    `¡Hola! 👋\n\n` +
      `Soy ${profesional.full_name || "tu técnico asignado"} de Sumee.\n\n` +
      `He aceptado tu solicitud de servicio y quiero compartirte mi credencial de profesional verificado para tu seguridad y confianza:\n\n` +
      `${professionalUrl}\n\n` +
      `Aquí puedes verificar mi información, calificaciones y experiencia. Estoy listo para ayudarte con tu proyecto.\n\n` +
      `¿Cuándo te viene bien que coordinemos la visita? 🛠️`
  );

  return `https://wa.me/${whatsappPhone}?text=${message}`;
}

/**
 * Obtiene los datos del profesional desde la base de datos
 */
export async function getProfesionalData(
  userId: string
): Promise<Profesional | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .eq("role", "profesional")
      .maybeSingle();

    if (error) {
      console.error("Error al obtener datos del profesional:", error);
      return null;
    }

    return data as unknown as Profesional;
  } catch (error) {
    console.error("Error en getProfesionalData:", error);
    return null;
  }
}

/**
 * Envía automáticamente la credencial al cliente cuando se acepta un lead
 * @param leadId ID del lead aceptado
 * @param profesionalId ID del profesional que aceptó el lead
 */
export async function sendCredentialToClient(
  leadId: string,
  profesionalId: string
): Promise<{ success: boolean; whatsappLink?: string; error?: string }> {
  try {
    // 1. Obtener el lead con los datos del cliente
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError) {
      console.error("Error al obtener el lead:", leadError);
      return { 
        success: false, 
        error: leadError.message || "Error al obtener el lead desde la base de datos" 
      };
    }

    if (!lead) {
      console.error("Lead no encontrado con ID:", leadId);
      return { success: false, error: "Lead no encontrado. Verifica que el ID sea correcto." };
    }

    // 2. Verificar que el lead tenga WhatsApp del cliente
    // @ts-ignore - Supabase types inference issue
    if (!(lead as any).whatsapp) {
      console.warn("El lead no tiene WhatsApp del cliente");
      return { success: false, error: "Lead sin WhatsApp" };
    }

    // 3. Obtener datos del profesional
    const profesional = await getProfesionalData(profesionalId);
    if (!profesional) {
      console.error("No se pudo obtener datos del profesional");
      return { success: false, error: "Profesional no encontrado" };
    }

    // 4. Generar link de WhatsApp con la credencial
    const whatsappLink = generateWhatsAppCredentialLink(
      // @ts-ignore - Supabase types inference issue
      (lead as any).whatsapp,
      profesional
    );

    // 5. Retornar el link (el frontend puede abrirlo o copiarlo)
    return {
      success: true,
      whatsappLink,
    };
  } catch (error: any) {
    console.error("Error al enviar credencial al cliente:", error);
    return {
      success: false,
      error: error.message || "Error desconocido",
    };
  }
}

/**
 * Abre WhatsApp Web/App con el mensaje pre-cargado
 */
export function openWhatsAppLink(whatsappLink: string): void {
  if (typeof window !== "undefined") {
    window.open(whatsappLink, "_blank");
  }
}
