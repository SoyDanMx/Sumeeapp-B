// src/app/membresia/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faComments, 
  faCheckCircle, 
  faCrown, 
  faSpinner, 
  faExclamationTriangle,
  faCheck,
  faStar,
  faInfinity,
  faClock,
  faMobile,
  faWifi,
  faUserCheck
} from '@fortawesome/free-solid-svg-icons';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabaseClient';

// Tu clave publicable de Stripe. ¡Debe ser 'pk_live_' o 'pk_test_'!
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// --- Detectar modo de Stripe y usar el price ID correcto ---
const isStripeLiveMode = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_');

// IDs de precio - cambia estos por los tuyos según el modo
const STRIPE_PRICE_IDS = {
  test: 'price_1RnBgaE2shKTNR9MlLPyxmzS', // ID de test mode
  live: 'price_XXXXXX' // ID de live mode - reemplaza con tu ID real
};

const STRIPE_PRICE_ID = isStripeLiveMode ? STRIPE_PRICE_IDS.live : STRIPE_PRICE_IDS.test;

export default function MembresiaPage() {
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Error fetching user:', error);
        setIsAuthenticated(false);
      }
    };
    
    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Función para manejar el clic en el botón de compra
  const handleCheckout = async () => {
    if (!user) {
      setError('Debes iniciar sesión para comprar una membresía.');
      return;
    }
    
    setIsLoadingCheckout(true);
    setError(null);

    try {
      console.log('🚀 Starting checkout process...', { 
        priceId: STRIPE_PRICE_ID, 
        userId: user.id,
        stripeMode: isStripeLiveMode ? 'LIVE' : 'TEST',
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...'
      });
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          priceId: STRIPE_PRICE_ID,
          userId: user.id
        }),
      });

      console.log('📡 Response status:', response.status, response.statusText);

      // Verificar si la respuesta es JSON válido
      let responseData;
      const contentType = response.headers.get('content-type');
      
      console.log('📄 Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Non-JSON response received:', textResponse.substring(0, 500));
        
        // Verificar si es un error 404
        if (response.status === 404) {
          throw new Error('La API de pago no está disponible. Por favor, contacta al soporte.');
        }
        
        throw new Error(`Error del servidor (${response.status}). Inténtalo de nuevo.`);
      }

      try {
        responseData = await response.json();
        console.log('✅ JSON response parsed:', responseData);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        const textResponse = await response.text();
        console.error('Raw response:', textResponse.substring(0, 500));
        throw new Error('Error al procesar la respuesta del servidor.');
      }

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Error al crear la sesión de checkout.');
      }

      const { sessionId } = responseData;

      if (!sessionId) {
        throw new Error('No se recibió el ID de sesión.');
      }

      // Redirigir a Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Error al cargar Stripe.');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (error) {
        console.error('Error al redirigir a Stripe Checkout:', error);
        throw new Error(`Error al redirigir al pago: ${error.message}`);
      }

    } catch (error: any) {
      console.error('Error en el proceso de checkout:', error);
      setError(error.message || 'Error al iniciar el pago. Inténtalo de nuevo.');
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
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-2xl">
                <FontAwesomeIcon icon={faCrown} className="text-4xl text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Accede a Nuestra Red Exclusiva de Profesionales Verificados
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Tu membresía Sumee te da acceso directo a los mejores técnicos de tu zona. 
              Olvídate de la incertidumbre y contrata con total confianza.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-200">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUserCheck} className="mr-2" />
                <span>Profesionales verificados</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faShieldAlt} className="mr-2" />
                <span>100% confiable</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faMobile} className="mr-2" />
                <span>Contacto directo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                ¿Por qué elegir Sumee Premium?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Desbloquea el acceso completo a nuestra red de técnicos certificados
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-2xl text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Verificación de Confianza</h3>
                <p className="text-gray-600 leading-relaxed">
                  Cada profesional pasa por un riguroso proceso de validación de identidad, 
                  referencias y certificaciones antes de unirse a nuestra red.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <FontAwesomeIcon icon={faComments} className="text-2xl text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contacto Directo</h3>
                <p className="text-gray-600 leading-relaxed">
                  Comunícate directamente con los profesionales para explicar tus necesidades, 
                  acordar precios justos y coordinar los horarios que más te convengan.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Garantía de Satisfacción</h3>
                <p className="text-gray-600 leading-relaxed">
                  Contamos con un sistema de reseñas, soporte al cliente y garantías 
                  para asegurar la calidad de cada trabajo realizado.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <FontAwesomeIcon icon={faClock} className="text-2xl text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Respuesta Rápida</h3>
                <p className="text-gray-600 leading-relaxed">
                  Los profesionales verificados responden en menos de 2 horas y están 
                  disponibles para emergencias las 24 horas.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                  <FontAwesomeIcon icon={faStar} className="text-2xl text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Calidad Premium</h3>
                <p className="text-gray-600 leading-relaxed">
                  Acceso exclusivo a los técnicos mejor calificados de tu área, 
                  con promedio de 4.8+ estrellas en todas las categorías.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                  <FontAwesomeIcon icon={faInfinity} className="text-2xl text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Acceso Ilimitado</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sin límites en el número de solicitudes. Contacta a todos los profesionales 
                  que necesites durante el período de tu membresía.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-12 text-white shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para Empezar?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Obtén tu membresía premium ahora y encuentra la solución perfecta para tu hogar.
              </p>
              
              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded-xl">
                  <div className="flex items-center justify-center space-x-2 text-red-200">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Auth Status */}
              {!isAuthenticated && (
                <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-400/50 rounded-xl">
                  <div className="flex items-center justify-center space-x-2 text-yellow-200">
                    <FontAwesomeIcon icon={faMobile} />
                    <span className="font-medium">Necesitas iniciar sesión para comprar</span>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={handleCheckout}
                  disabled={isLoadingCheckout || !isAuthenticated}
                  className={`px-12 py-4 rounded-xl text-lg font-bold transition-all duration-200 shadow-lg transform hover:scale-105 flex items-center space-x-3 ${
                    !isAuthenticated 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : isLoadingCheckout
                        ? 'bg-blue-400 text-white cursor-wait'
                        : 'bg-white text-indigo-600 hover:bg-blue-50 hover:shadow-xl'
                  }`}
                >
                  {isLoadingCheckout ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="text-xl" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCrown} className="text-xl" />
                      <span>Comprar Membresía Premium</span>
                    </>
                  )}
                </button>
                
                {!isAuthenticated && (
                  <a 
                    href="/login"
                    className="px-8 py-3 text-blue-200 hover:text-white border border-blue-300 hover:border-white rounded-xl transition-colors duration-200"
                  >
                    Iniciar Sesión
                  </a>
                )}
              </div>

              {/* Security & Trust Indicators */}
              <div className="mt-8 pt-8 border-t border-blue-400/30">
                <div className="flex flex-wrap justify-center items-center gap-6 text-blue-200 text-sm">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faShieldAlt} />
                    <span>Pago 100% seguro</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <span>Garantía de satisfacción</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faWifi} />
                    <span>Acceso inmediato</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}