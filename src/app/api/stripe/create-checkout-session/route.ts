import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  console.log('🔧 Stripe API Route called');
  
  try {
    // Verificar variables de entorno
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not found');
      return NextResponse.json(
        { error: 'Stripe configuration error' },
        { status: 500 }
      );
    }

    // Inicializar Stripe dentro de la función para evitar problemas de build
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-06-30.basil',
      typescript: true,
    });

    // Verificar variables de entorno de Supabase antes de inicializar
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    let supabase = null;
    if (supabaseUrl && supabaseServiceKey) {
      // Configurar Supabase Admin dentro de la función para evitar problemas de build
      supabase = createClient(supabaseUrl, supabaseServiceKey);
    } else {
      console.warn('⚠️ Supabase environment variables not found, skipping user validation');
    }

    const { priceId, userId } = await request.json();
    console.log('📝 Request data:', { priceId, userId });

    if (!priceId || !userId) {
      console.error('❌ Missing parameters:', { priceId, userId });
      return NextResponse.json(
        { error: 'Missing required parameters: priceId or userId' },
        { status: 400 }
      );
    }

    // Mapear buy button ID a price ID si es necesario
    let actualPriceId = priceId;
    if (priceId.includes('buy_btn_')) {
      // Extraer el price ID del buy button ID (remover 'buy_btn_' y usar el resto como price ID)
      // Esto asume que el buy button ID sigue el formato: buy_btn_ + price_id
      actualPriceId = priceId.replace('buy_btn_', 'price_');
      console.log('🔄 Mapped buy button ID to price ID:', { priceId, actualPriceId });
    }

    // Verificar que el usuario existe en Supabase (opcional para desarrollo)
    let userEmail = '';
    if (supabase) {
      try {
        const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
        
        if (userError) {
          console.warn('⚠️ User validation skipped:', userError.message);
        } else {
          userEmail = user?.user?.email || '';
          console.log('✅ User validated:', userEmail);
        }
      } catch (userError) {
        console.warn('⚠️ Could not validate user, proceeding anyway');
      }
    } else {
      console.log('⚠️ Supabase not available, skipping user validation');
    }

    // Crear la sesión de checkout de Stripe
    console.log('🔄 Creating Stripe session...');
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3010' : 'https://sumeeapp.com');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: actualPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/pago/exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pago/cancelado`,
      customer_email: userEmail || undefined,
      metadata: {
        userId: userId,
        userEmail: userEmail,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_creation: 'always',
    });

    console.log('✅ Stripe session created:', session.id);
    
    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error: any) {
    console.error('❌ Error creating Stripe checkout session:', error);
    
    // Manejar errores específicos de Stripe
    if (error.type === 'StripeInvalidRequestError') {
      if (error.code === 'resource_missing') {
        return NextResponse.json(
          { 
            error: 'Configuración de pago incorrecta',
            message: 'El precio seleccionado no está disponible. Por favor, contacta al soporte.',
            details: 'Price ID not found or incompatible with current Stripe mode'
          },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error.message || 'Error desconocido',
        type: error.type || 'unknown'
      },
      { status: 500 }
    );
  }
}
