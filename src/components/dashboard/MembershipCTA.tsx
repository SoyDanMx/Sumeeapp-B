// src/components/dashboard/MembershipCTA.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons';

export const MembershipCTA = () => {
  const stripeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Esta lógica para cargar el botón de Stripe es compleja y puede causar re-renders.
    // Al aislarla en su propio componente, la página principal queda más limpia.
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;

    script.onload = () => {
      if (stripeContainerRef.current && stripeContainerRef.current.children.length === 0) {
        const stripeBuyButton = document.createElement('stripe-buy-button');
        stripeBuyButton.setAttribute('buy-button-id', 'buy_btn_1RmpzwE2shKTNR9M91kuSgKh');
        stripeBuyButton.setAttribute('publishable-key', 'pk_live_51P8c4AE2shKTNR9MVARQB4La2uYMMc2shlTCcpcg8EI6MqqPV1uN5uj6UbB5mpfReRKd4HL2OP1LoF17WXcYYeB000Ot1l847E');
        stripeContainerRef.current.appendChild(stripeBuyButton);
      }
    };

    document.body.appendChild(script);

    return () => {
      // Limpieza al desmontar el componente
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="text-center bg-gray-50 p-8 rounded-lg border-2 border-dashed">
      <FontAwesomeIcon icon={faCrown} className="text-5xl text-yellow-500 mb-4" />
      <h3 className="text-2xl font-bold text-gray-800">Desbloquea tu Acceso a los Mejores Profesionales</h3>
      <p className="mt-2 mb-6 text-gray-600 max-w-lg mx-auto">
        Conviértete en miembro Básico para poder buscar y contactar a nuestra red de técnicos certificados en tu zona.
      </p>
      <div ref={stripeContainerRef}></div>
    </div>
  );
};