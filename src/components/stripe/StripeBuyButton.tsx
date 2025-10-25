'use client';

import React, { useEffect, useRef } from 'react';

interface StripeBuyButtonProps {
  buyButtonId: string;
  publishableKey: string;
  className?: string;
}

export default function StripeBuyButton({ 
  buyButtonId, 
  publishableKey, 
  className = '' 
}: StripeBuyButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Verificar si el script ya está cargado
    if (document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]')) {
      return;
    }

    // Cargar el script de Stripe Buy Button
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    script.onload = () => {
      // El script se carga, pero el componente se renderiza automáticamente
      console.log('Stripe Buy Button script loaded');
    };
    script.onerror = () => {
      console.error('Error loading Stripe Buy Button script');
    };
    
    document.head.appendChild(script);

    // Cleanup
    return () => {
      const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className={`stripe-buy-button-container ${className}`}>
      {/* @ts-ignore - Stripe Buy Button es un elemento personalizado */}
      <stripe-buy-button
        buy-button-id={buyButtonId}
        publishable-key={publishableKey}
        ref={buttonRef}
      />
    </div>
  );
}
