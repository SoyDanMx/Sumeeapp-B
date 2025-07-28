// src/app/api/stripe/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import stripe from '@/lib/stripe'; // Asegúrate de que esta importación sea correcta
import { createClient } from '@supabase/supabase-js'; // Asegúrate de que esta importación sea correcta

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Inicializa el cliente de Supabase Admin si lo necesitas para algo aquí.
// Aunque para crear la sesión de Stripe no es estrictamente necesario,
// es bueno que esté configurado si lo vas a usar para otros fines en esta API Route.
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req: Request) {
  console.log('--- API Route create-checkout-session START ---'); // Log de inicio

  try {
    const { priceId, userId } = await req.json();

    // AÑADIR ESTE LOG PARA VER LOS PARÁMETROS RECIBIDOS
    console.log('DEBUG: Parámetros recibidos:', { priceId, userId });

    if (!priceId || !userId) {
      console.log('DEBUG: priceId o userId faltantes.');
      return NextResponse.json(
        { message: 'priceId y userId son requeridos.' },
        { status: 400 }
      );
    }

    // AÑADIR ESTE LOG ANTES DE LA LLAMADA A STRIPE
    console.log('DEBUG: Intentando crear sesión de checkout de Stripe con priceId:', priceId);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // O 'payment' si es pago único
      success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/cancel`,
      metadata: {
        supabaseUserId: userId,
      },
    });

    // AÑADIR ESTE LOG SI LA SESIÓN SE CREA CON ÉXITO
    console.log('DEBUG: Sesión de Stripe creada exitosamente. Session ID:', session.id);

    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    // ESTE ES EL CONSOLE.ERROR QUE TIENE EL DETALLE EXACTO DEL FALLO
    console.error('ERROR EN create-checkout-session API (Stripe o lógica interna):', error); 
    return NextResponse.json(
      { message: 'Error interno del servidor al crear la sesión de checkout.', error: error.message }, // Devolvemos el mensaje del error
      { status: 500 }
    );
  } finally {
    console.log('--- API Route create-checkout-session END ---'); // Log de finalización
  }
}