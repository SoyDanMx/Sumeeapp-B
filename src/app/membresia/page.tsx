// src/app/membresia/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react'; // Añadido useState
import { PageLayout } from '@/components/PageLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faComments, faCheckCircle, faCrown, faSpinner } from '@fortawesome/free-solid-svg-icons'; // Añadido faSpinner
import { loadStripe } from '@stripe/stripe-js'; // Importar loadStripe
import { supabase } from '@/lib/supabaseClient'; // Importar Supabase client

// Tu clave publicable de Stripe. ¡Debe ser 'pk_live_' o 'pk_test_'!
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// --- IMPORTANTE: Reemplaza con el ID de tu Precio de Stripe ---
// Puedes obtener este ID de tu Dashboard de Stripe: Products -> Prices
const STRIPE_PRICE_ID = 'price_1RnBgaE2shKTNR9MlLPyxmzS'; // <<< ¡¡¡REEMPLAZA ESTO CON EL ID DE TU PRECIO REAL!!!

export default function MembresiaPage() {
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false); // Estado para el botón de carga
  const [user, setUser] = useState<any | null>(null); // Para obtener el user.id

  useEffect(() => {
    // Obtener el usuario actual para pasarlo a la sesión de Stripe
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  // Función para manejar el clic en el botón de compra
  const handleCheckout = async () => {
    if (!user) {
      alert('Debes iniciar sesión para comprar una membresía.');
      return;
    }
    
    setIsLoadingCheckout(true);

    try {
      // 1. Llamar a tu API Route para crear la sesión de checkout
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            priceId: STRIPE_PRICE_ID,
            userId: user.id // Pasar el ID del usuario de Supabase
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la sesión de checkout.');
      }

      const { sessionId } = await response.json();

      // 2. Redirigir al usuario a Stripe Checkout
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: sessionId,
        });

        if (error) {
          console.error('Error al redirigir a Stripe Checkout:', error);
          alert(`Error al redirigir al pago: ${error.message}`);
        }
      }
    } catch (error: any) {
      console.error('Error en el proceso de checkout:', error);
      alert(`Error al iniciar el pago: ${error.message}`);
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  // El código del `useEffect` para el botón de Stripe con `buy-button.js`
  // Lo he eliminado aquí porque ahora usaremos un botón propio y la lógica `handleCheckout`
  // Si deseas mantener el buy-button.js por alguna razón, necesitarías refactorizar
  // para que no entre en conflicto con el `handleCheckout` o usar el `buy-button`
  // para llamar a tu API. Por simplicidad, un botón normal es más controlable.
  // const stripeContainerRef = useRef<HTMLDivElement>(null);
  // useEffect para buy-button.js va aquí si lo mantienes.

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <FontAwesomeIcon icon={faCrown} className="text-5xl text-yellow-500 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Accede a Nuestra Red Exclusiva de Profesionales Verificados
          </h1>
          <p className="text-lg text-gray-600 mb-12">
            Tu membresía Sumee te da acceso directo a los mejores técnicos de tu zona. Olvídate de la incertidumbre y contrata con total confianza.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FontAwesomeIcon icon={faShieldAlt} className="text-3xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Verificación de Confianza</h3>
            <p className="text-gray-600">Cada profesional pasa por un riguroso proceso de validación de identidad y referencias.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FontAwesomeIcon icon={faComments} className="text-3xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Contacto Directo</h3>
            <p className="text-gray-600">Comunícate directamente con los profesionales para explicar tus necesidades y acordar precios justos.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Garantía de Satisfacción</h3>
            <p className="text-gray-600">Contamos con un sistema de reseñas y soporte para asegurar la calidad de cada trabajo.</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">¿Listo para Empezar?</h2>
          <p className="text-gray-600 mb-6">Obtén tu membresía básica ahora y encuentra la solución perfecta para tu hogar.</p>
          
          {/* BOTÓN DE COMPRA PERSONALIZADO */}
          <button 
            onClick={handleCheckout}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-200"
            disabled={isLoadingCheckout}
          >
            {isLoadingCheckout ? (
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
            ) : (
              'Comprar Membresía Premium'
            )}
          </button>
          {/* El div ref={stripeContainerRef} y el useEffect asociado ya no son necesarios
              si usas este botón personalizado. */}
        </div>
      </div>
    </PageLayout>
  );
}