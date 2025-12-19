import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * API Route para enviar confirmación de WhatsApp al cliente cuando se crea un nuevo lead
 * 
 * Envía un mensaje de confirmación al cliente desde el número de la empresa (+52 1 56 3674 1156)
 * confirmando que se recibió su solicitud y que pronto se le asignará un técnico
 */
export async function POST(request: Request) {
  try {
    const { leadId, servicio, servicioSolicitado, ubicacion, clienteWhatsapp } = await request.json();

    if (!leadId || typeof leadId !== "string") {
      return NextResponse.json(
        { error: "El ID del lead es obligatorio." },
        { status: 400 }
      );
    }

    // Obtener información completa del lead desde la base de datos
    const adminClient = createSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { error: "Error de configuración del servidor." },
        { status: 500 }
      );
    }

    const { data: lead, error: leadError } = await adminClient
      .from("leads")
      .select(`
        id,
        servicio,
        servicio_solicitado,
        descripcion_proyecto,
        ubicacion_direccion,
        whatsapp,
        fecha_creacion,
        estado,
        cliente_id,
        profiles:cliente_id (
          full_name,
          email
        )
      `)
      .eq("id", leadId)
      .single();

    if (leadError || !lead) {
      console.error("Error al obtener lead:", leadError);
      return NextResponse.json(
        { error: "No se pudo obtener la información del lead." },
        { status: 404 }
      );
    }

    // Número de WhatsApp de la empresa (desde donde se envía): +52 1 56 3674 1156
    // Formato normalizado: 5215636741156 (sin espacios ni caracteres especiales)
    const empresaWhatsapp = "5215636741156"; // +52 1 56 3674 1156
    const cleanEmpresaWhatsapp = empresaWhatsapp.replace(/\D/g, "");

    // Obtener WhatsApp del cliente (destinatario)
    const clienteWhatsappTexto = lead.whatsapp || clienteWhatsapp;
    if (!clienteWhatsappTexto) {
      return NextResponse.json(
        { error: "El cliente no tiene WhatsApp registrado." },
        { status: 400 }
      );
    }

    // Normalizar número del cliente
    const cleanClienteWhatsapp = clienteWhatsappTexto.replace(/\D/g, "");
    const clienteWhatsappNormalizado = cleanClienteWhatsapp.startsWith("52")
      ? cleanClienteWhatsapp
      : `52${cleanClienteWhatsapp}`;

    // Obtener nombre del servicio (usar servicio_solicitado si está disponible)
    const servicioNombre = lead.servicio_solicitado || servicioSolicitado || servicio || "tu proyecto";

    // Construir mensaje de confirmación al cliente
    const mensaje = `Hola, hemos recibido tu registro para tu proyecto de "${servicioNombre}". Pronto se te asignará un técnico certificado y confiable para atender tu proyecto. Quedamos pendientes.`;

    // Enviar mensaje al cliente usando WhatsApp Business API o Twilio
    // El mensaje se envía DESDE el número de la empresa HACIA el cliente
    let whatsappSent = false;
    let whatsappError = null;

    // Intentar enviar usando Twilio si está configurado
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM) {
      try {
        // Importación dinámica de Twilio para evitar errores de build si no está instalado
        // @ts-ignore - Twilio puede no estar instalado, se maneja con catch
        const twilioModule = await import("twilio").catch(() => null);
        if (!twilioModule) {
          throw new Error("Twilio no está disponible");
        }
        const twilio = twilioModule.default || twilioModule;
        const client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        // Enviar desde el número de Twilio configurado hacia el cliente
        const message = await client.messages.create({
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`, // Número de Twilio (debe ser el de la empresa)
          to: `whatsapp:+${clienteWhatsappNormalizado}`, // WhatsApp del cliente
          body: mensaje,
        });

        whatsappSent = true;
        console.log("✅ Mensaje WhatsApp enviado al cliente vía Twilio:", message.sid);
      } catch (twilioError: any) {
        whatsappError = twilioError.message;
        console.error("❌ Error al enviar WhatsApp vía Twilio:", twilioError);
      }
    }

    // Si Twilio no está configurado, generar link de WhatsApp Web como fallback
    // El link se genera desde el número de la empresa hacia el cliente
    const whatsappUrl = `https://wa.me/${clienteWhatsappNormalizado}?text=${encodeURIComponent(mensaje)}`;

    // Guardar registro del intento de envío en la base de datos (opcional)
    try {
      const { error: insertError } = await adminClient.from("lead_notifications").insert({
        lead_id: leadId,
        notification_type: "whatsapp_confirmation",
        recipient: clienteWhatsappNormalizado, // Cliente que recibe el mensaje
        sender: cleanEmpresaWhatsapp, // Empresa que envía el mensaje
        message: mensaje,
        status: whatsappSent ? "sent" : "pending",
        error: whatsappError,
        whatsapp_url: whatsappUrl,
      });
      
      if (insertError) {
        // Si la tabla no existe, no es crítico
        console.warn("⚠️ No se pudo guardar registro de notificación:", insertError.message);
      }
    } catch (dbError) {
      // No crítico si falla
      console.warn("⚠️ Error al guardar registro de notificación:", dbError);
    }

    return NextResponse.json({
      success: true,
      whatsappSent,
      whatsappUrl: whatsappSent ? null : whatsappUrl, // Solo retornar URL si no se envió automáticamente
      message: whatsappSent
        ? "Confirmación WhatsApp enviada al cliente exitosamente"
        : "Link de WhatsApp generado (enviar manualmente o configurar Twilio)",
      error: whatsappError,
      recipient: clienteWhatsappNormalizado,
    });
  } catch (error: any) {
    console.error("Error en /api/whatsapp/lead-alert:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado al enviar la alerta de WhatsApp.",
      },
      { status: 500 }
    );
  }
}

