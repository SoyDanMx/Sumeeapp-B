// src/lib/stripe/client.ts
// Singleton pattern para inicializar Stripe una sola vez

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Variable para almacenar la instancia de Stripe
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Obtiene la instancia de Stripe (Singleton pattern)
 * Evita recargar el script en cada render
 * 
 * @returns Promise<Stripe | null> - Instancia de Stripe o null si no está configurado
 */
export const getStripe = (): Promise<Stripe | null> => {
  // Si ya existe una instancia, retornarla
  if (stripePromise) {
    return stripePromise;
  }

  // Obtener la clave pública de Stripe desde variables de entorno
  const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!stripePublicKey) {
    console.error("⚠️ [Stripe] Falta la clave pública de Stripe en .env.local (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)");
    stripePromise = Promise.resolve(null);
    return stripePromise;
  }

  // Inicializar Stripe solo una vez
  stripePromise = loadStripe(stripePublicKey);

  return stripePromise;
};

/**
 * Verifica si Stripe está configurado correctamente
 * 
 * @returns boolean - true si Stripe está configurado, false en caso contrario
 */
export const isStripeConfigured = (): boolean => {
  return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
};

