// src/app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import stripe from '@/lib/stripe'; // Importa la instancia de Stripe que creamos

// --- Variables de Entorno ---
// ¡IMPORTANTE!: Asegúrate que estas variables estén configuradas en .env.local y en tu hosting.
// NEXT_PUBLIC_SUPABASE_URL es la pública, pero el cliente admin usa la URL de tu proyecto
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// SUPABASE_SERVICE_ROLE_KEY debe ser secreta y NO tener NEXT_PUBLIC_
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

// Cliente de Supabase con la clave de rol de servicio (admin)
// Este cliente tiene permisos elevados y NUNCA debe ser usado en el frontend.
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Desactivar el bodyParser de Next.js para poder leer el rawBody
// Esto es CRÍTICO para la verificación de la firma de Stripe
export const config = {
  api: {
    bodyParser: false, // ¡No parsear el body automáticamente!
  },
};

export async function POST(req: Request) {
  const rawBody = await req.text(); // Lee el cuerpo de la solicitud como texto plano
  const sig = req.headers.get('stripe-signature'); // Obtiene la firma de Stripe de los headers

  let event: Stripe.Event;

  try {
    // --- 1. VERIFICAR LA FIRMA DEL WEBHOOK ---
    // Construye el evento de Stripe para verificar la firma
    // Esto valida que la solicitud realmente proviene de Stripe y no ha sido manipulada.
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`❌ Error al verificar la firma del webhook: ${err.message}`);
    // Si la firma no es válida, devuelve un error 400
    return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Log para depuración (puedes eliminar o controlar en producción)
  console.log(`✅ Webhook recibido: ${event.type}`);

  // --- 2. PROCESAR EL EVENTO DEL WEBHOOK ---
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        // Se dispara cuando una sesión de checkout (pago único o inicio de suscripción) se completa con éxito.
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        // user_id de Supabase: Necesitas haberlo pasado en los metadatos de la sesión de checkout
        // al crearla en Stripe (ej: metadata: { supabaseUserId: user.id }).
        const supabaseUserId = checkoutSession.metadata?.supabaseUserId; 

        if (supabaseUserId) {
          const { error } = await supabaseAdmin
            .from('profiles')
            .update({ membership_s: 'premium' }) // Actualiza la columna membership_s a 'premium'
            .eq('user_id', supabaseUserId); // Identifica al usuario por su user_id de Supabase

          if (error) {
            console.error('Error al actualizar Supabase (checkout.session.completed):', error);
            return NextResponse.json({ message: 'Error updating Supabase' }, { status: 500 });
          }
          console.log(`Usuario ${supabaseUserId} actualizado a 'premium' después de checkout.session.completed.`);
        }
        break;

      case 'customer.subscription.updated':
        // Se dispara cuando una suscripción cambia de estado (activa, cancelada, pausada, etc.)
        const subscription = event.data.object as Stripe.Subscription;

        // Para encontrar al usuario de Supabase, necesitas un mapeo del customer.id de Stripe
        // al user_id de Supabase. Lo ideal es guardar el stripe_customer_id en tu tabla 'profiles'.
        const { data: userProfile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('user_id, membership_s')
          .eq('stripe_customer_id', subscription.customer as string) // Asume que tienes esta columna en 'profiles'
          .single();

        if (profileError || !userProfile) {
          console.error('Error finding user for subscription update or profile not found:', profileError);
          break; 
        }
        const currentSupabaseUserId = userProfile.user_id;

        let newMembershipStatus = 'free';
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          newMembershipStatus = 'premium'; // O el valor que uses para membresía activa
        } else if (subscription.status === 'canceled' || subscription.status === 'unpaid' || subscription.status === 'past_due') {
          newMembershipStatus = 'free'; // O el valor para inactiva/cancelada
        }

        // Solo actualiza si el estado realmente ha cambiado para evitar escrituras innecesarias
        if (userProfile.membership_s !== newMembershipStatus) {
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({ membership_s: newMembershipStatus })
                .eq('user_id', currentSupabaseUserId);

            if (updateError) {
                console.error('Error al actualizar Supabase (customer.subscription.updated):', updateError);
                return NextResponse.json({ message: 'Error updating Supabase' }, { status: 500 });
            }
            console.log(`Suscripción de usuario ${currentSupabaseUserId} actualizada a: ${newMembershipStatus}`);
        } else {
            console.log(`Suscripción de usuario ${currentSupabaseUserId} ya estaba en estado ${newMembershipStatus}, no se requiere actualización.`);
        }
        break;

      case 'customer.subscription.deleted':
        // Manejar cuando una suscripción se elimina completamente
        const deletedSubscription = event.data.object as Stripe.Subscription;
        // Aquí buscarías al user por deletedSubscription.customer y lo pondrías a 'free'
        // ... similar a 'customer.subscription.updated'
        break;

      // Puedes añadir más casos de eventos de Stripe si los necesitas (ej. invoice.payment_failed)

      default:
        // Para eventos no manejados, solo registra y devuelve 200 para que Stripe sepa que se recibió.
        console.warn(`Tipo de evento no manejado: ${event.type}`);
    }

    // --- 3. RESPUESTA EXITOSA ---
    // Stripe espera una respuesta 200 OK para saber que el webhook fue recibido y procesado correctamente.
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Error procesando el evento del webhook:', error);
    return NextResponse.json({ message: 'Error procesando el evento del webhook' }, { status: 500 });
  }
}