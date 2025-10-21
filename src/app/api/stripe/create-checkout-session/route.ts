import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
});

// Configurar Supabase Admin para validar el usuario
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    const { priceId, userId } = await request.json();
    console.log('📝 Request data:', { priceId, userId });

    if (!priceId || !userId) {
      console.error('❌ Missing parameters:', { priceId, userId });
      return NextResponse.json(
        { error: 'Missing required parameters: priceId or userId' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe en Supabase (opcional para desarrollo)
    let userEmail = '';
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

    // Crear la sesión de checkout de Stripe
    console.log('🔄 Creating Stripe session...');
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3010' : 'https://sumeeapp.com');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/membresia/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/membresia/cancel`,
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
    console.error('Error creating Stripe checkout session:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error.message || 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
