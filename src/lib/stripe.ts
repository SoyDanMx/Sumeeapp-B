// src/lib/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Usa la versión API más reciente o la que estés usando en tu proyecto Stripe
  // Puedes verla en el Dashboard de Stripe -> Developers -> API versions
  apiVersion: '2025-06-30.basil',
  typescript: true, // Si usas TypeScript, para obtener tipos correctos
});

export default stripe;